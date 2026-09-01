import { ConversationEngine } from '../ai/engine.js';
import db from '../database/db.js';

export class SimulatorController {
  static async simulateMessage(req, res) {
    const { phone = '+919999988888', name = 'Simulator User', text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text message is required' });

    const wa_message_id = `sim_${Date.now()}`;
    const result = await ConversationEngine.processMessage({
      patient_phone: phone,
      patient_name: name,
      message_text: text,
      wa_message_id
    });

    const conversation = db.findOne('conversations', (c) => c.patient_phone === phone);
    const messages = conversation ? db.find('messages', (m) => m.conversation_id === conversation.id) : [];

    res.json({
      engine_result: result,
      conversation,
      messages
    });
  }

  static getSimulatedConversation(req, res) {
    const phone = req.query.phone || '+919999988888';
    const conversation = db.findOne('conversations', (c) => c.patient_phone === phone);
    const messages = conversation ? db.find('messages', (m) => m.conversation_id === conversation.id) : [];
    res.json({ conversation, messages });
  }

  static resetSimulation(req, res) {
    const phone = req.body.phone || '+919999988888';
    const conv = db.findOne('conversations', (c) => c.patient_phone === phone);
    if (conv) {
      db.delete('conversations', conv.id);
      db.data.messages = db.data.messages.filter((m) => m.conversation_id !== conv.id);
      db.save();
    }
    res.json({ success: true, message: 'Simulation conversation reset' });
  }
}
