import config from '../config/index.js';
import db from '../database/db.js';

export class WhatsAppClient {
  /**
   * Send WhatsApp Text Message via Meta Cloud API or local simulator.
   */
  static async sendTextMessage({ to, text, preview_url = false }) {
    console.log(`[WhatsAppClient] Outgoing to ${to}: ${text.substring(0, 80)}...`);

    const messageRecord = {
      wa_message_id: `wamid.HBgL${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
      recipient_phone: to,
      message_type: 'text',
      status: 'SENT',
      content: text,
      timestamp: new Date().toISOString()
    };
    db.insert('whatsapp_messages', messageRecord);

    // If Meta API credentials are provided, call Meta Cloud API
    if (config.whatsapp.accessToken && config.whatsapp.accessToken.startsWith('EAA')) {
      try {
        const url = `https://graph.facebook.com/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}/messages`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.whatsapp.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/\D/g, ''),
            type: 'text',
            text: { preview_url, body: text }
          })
        });

        const data = await response.json();
        return { success: true, data, messageRecord };
      } catch (err) {
        console.error('[WhatsAppClient] Meta API error:', err);
        return { success: false, error: err.message, messageRecord };
      }
    }

    // Default simulation delivery
    return { success: true, mode: 'SIMULATION', messageRecord };
  }

  /**
   * Send WhatsApp Interactive Button Message
   */
  static async sendInteractiveButtons({ to, bodyText, buttons = [] }) {
    const formattedButtons = buttons.slice(0, 3).map((btn, index) => ({
      type: 'reply',
      reply: {
        id: `btn_${index}_${btn.toLowerCase().replace(/\s+/g, '_')}`,
        title: btn.substring(0, 20)
      }
    }));

    console.log(`[WhatsAppClient] Interactive buttons to ${to}: [${buttons.join(', ')}]`);

    const messageRecord = {
      wa_message_id: `wamid.btn.${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
      recipient_phone: to,
      message_type: 'interactive_button',
      status: 'SENT',
      content: `${bodyText}\n[Buttons: ${buttons.join(' | ')}]`,
      timestamp: new Date().toISOString()
    };
    db.insert('whatsapp_messages', messageRecord);

    return { success: true, messageRecord, buttons: formattedButtons };
  }

  /**
   * Send WhatsApp Template Message (e.g. appointment confirmation or reminder)
   */
  static async sendTemplateMessage({ to, templateName, languageCode = 'en', components = [] }) {
    const messageRecord = {
      wa_message_id: `wamid.tmpl.${Date.now()}`,
      recipient_phone: to,
      message_type: 'template',
      template_name: templateName,
      status: 'SENT',
      timestamp: new Date().toISOString()
    };
    db.insert('whatsapp_messages', messageRecord);

    return { success: true, messageRecord };
  }
}

export default WhatsAppClient;
