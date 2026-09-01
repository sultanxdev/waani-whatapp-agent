import config from '../config/index.js';
import db from '../database/db.js';
import { ConversationEngine } from '../ai/engine.js';
import { WhatsAppClient } from './client.js';

export class WhatsAppWebhookController {
  /**
   * Webhook Verification for Meta Cloud API Setup (GET)
   */
  static verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      console.log('✅ WhatsApp Webhook verified successfully by Meta challenge.');
      return res.status(200).send(challenge);
    }

    return res.status(403).json({ error: 'Verification token mismatch' });
  }

  /**
   * Inbound WhatsApp Event Handler (POST)
   */
  static async handleWebhook(req, res) {
    const body = req.body;

    // Fast 200 acknowledgment to Meta
    res.status(200).send('EVENT_RECEIVED');

    try {
      if (!body.entry || !body.entry[0]?.changes || !body.entry[0].changes[0]?.value) {
        return;
      }

      const value = body.entry[0].changes[0].value;
      const messages = value.messages;

      if (!messages || messages.length === 0) {
        // Status updates (delivered, read, sent)
        return;
      }

      const message = messages[0];
      const wa_message_id = message.id;
      const senderPhone = `+${message.from}`;
      const contactName = value.contacts?.[0]?.profile?.name || 'Patient';

      // 1. Idempotency Check (PRD Section 52)
      const existingMessage = db.findOne('messages', (m) => m.wa_message_id === wa_message_id);
      if (existingMessage) {
        console.log(`[Webhook] Duplicate message ID ${wa_message_id} ignored.`);
        return;
      }

      // Extract message text from text, interactive button reply, or list reply
      let incomingText = '';
      if (message.type === 'text') {
        incomingText = message.text?.body || '';
      } else if (message.type === 'interactive') {
        incomingText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
      } else if (message.type === 'button') {
        incomingText = message.button?.text || '';
      }

      if (!incomingText) return;

      // 2. Process message through AI Conversation Engine
      const engineResult = await ConversationEngine.processMessage({
        patient_phone: senderPhone,
        patient_name: contactName,
        message_text: incomingText,
        wa_message_id
      });

      // 3. Send WhatsApp response if generated
      if (engineResult && engineResult.response_text) {
        if (engineResult.buttons && engineResult.buttons.length > 0) {
          await WhatsAppClient.sendInteractiveButtons({
            to: senderPhone,
            bodyText: engineResult.response_text,
            buttons: engineResult.buttons
          });
        } else {
          await WhatsAppClient.sendTextMessage({
            to: senderPhone,
            text: engineResult.response_text
          });
        }
      }
    } catch (err) {
      console.error('[Webhook] Processing error:', err);
    }
  }
}

export default WhatsAppWebhookController;
