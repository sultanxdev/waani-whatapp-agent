import db from '../database/db.js';
import { WhatsAppClient } from '../whatsapp/client.js';

export class ConversationsController {
  static getConversations(req, res) {
    const { status, ai_status } = req.query;
    let convs = db.find('conversations');

    if (ai_status && ai_status !== 'ALL') {
      convs = convs.filter((c) => c.ai_status === ai_status);
    }

    convs.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    res.json(convs);
  }

  static getConversationById(req, res) {
    const conv = db.findOne('conversations', (c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const messages = db.find('messages', (m) => m.conversation_id === conv.id);
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const lead = conv.lead_id
      ? db.findOne('leads', (l) => l.id === conv.lead_id)
      : db.findOne('leads', (l) => l.phone === conv.patient_phone);

    const appointments = db.find('appointments', (a) => a.patient_phone === conv.patient_phone);
    const handoffs = db.find('handoffs', (h) => h.conversation_id === conv.id);

    // Reset unread count when viewed
    if (conv.unread_count > 0) {
      db.update('conversations', conv.id, { unread_count: 0 });
    }

    res.json({
      conversation: conv,
      messages,
      lead,
      appointments,
      handoffs
    });
  }

  static async takeover(req, res) {
    const conv = db.findOne('conversations', (c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const updated = db.update('conversations', conv.id, {
      ai_status: 'PAUSED',
      stage: 'HANDOFF'
    });

    // Mark any pending handoffs as assigned
    const handoff = db.findOne('handoffs', (h) => h.conversation_id === conv.id && h.status === 'PENDING');
    if (handoff) {
      db.update('handoffs', handoff.id, {
        status: 'ASSIGNED',
        assigned_to: req.user?.name || 'Staff'
      });
    }

    db.logAudit({
      user_id: req.user?.id || 'staff',
      action: 'HUMAN_TAKEOVER_CONVERSATION',
      entity: 'conversations',
      entity_id: conv.id,
      before: conv,
      after: updated
    });

    res.json({ success: true, conversation: updated });
  }

  static async release(req, res) {
    const conv = db.findOne('conversations', (c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const updated = db.update('conversations', conv.id, {
      ai_status: 'ACTIVE',
      stage: 'INFORMATION'
    });

    // Resolve handoff
    const handoff = db.findOne('handoffs', (h) => h.conversation_id === conv.id && h.status !== 'RESOLVED');
    if (handoff) {
      db.update('handoffs', handoff.id, { status: 'RESOLVED' });
    }

    db.logAudit({
      user_id: req.user?.id || 'staff',
      action: 'RELEASE_CONVERSATION_TO_AI',
      entity: 'conversations',
      entity_id: conv.id,
      before: conv,
      after: updated
    });

    res.json({ success: true, conversation: updated });
  }

  static async sendMessage(req, res) {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required' });

    const conv = db.findOne('conversations', (c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Send via WhatsApp API
    const sendResult = await WhatsAppClient.sendTextMessage({
      to: conv.patient_phone,
      text
    });

    // Insert staff message record
    const message = db.insert('messages', {
      conversation_id: conv.id,
      sender: 'STAFF',
      sender_name: req.user?.name || 'Receptionist',
      text,
      timestamp: new Date().toISOString()
    });

    db.update('conversations', conv.id, {
      last_message: text,
      updated_at: new Date().toISOString()
    });

    res.json({ success: true, message, sendResult });
  }
}
