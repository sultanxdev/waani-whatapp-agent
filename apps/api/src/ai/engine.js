import { detectIntent, INTENTS } from './intents.js';
import { classifySafety, SAFETY_CATEGORIES } from './safety.js';
import AI_TOOLS from './tools.js';
import db from '../database/db.js';

export class ConversationEngine {
  /**
   * Process an incoming patient WhatsApp message and produce an approved, grounded response.
   */
  static async processMessage({
    conversation_id,
    patient_phone,
    patient_name = 'Patient',
    message_text = '',
    wa_message_id = null
  }) {
    const text = (message_text || '').trim();

    // 1. Get or create conversation record
    let conversation = null;
    if (conversation_id) {
      conversation = db.findOne('conversations', (c) => c.id === conversation_id);
    }
    if (!conversation && patient_phone) {
      conversation = db.findOne('conversations', (c) => c.patient_phone === patient_phone);
    }

    if (!conversation) {
      conversation = db.insert('conversations', {
        clinic_id: 'clinic_derma_care_01',
        patient_phone,
        patient_name,
        ai_status: 'ACTIVE',
        stage: 'START',
        last_message: text,
        last_intent: 'GREETING',
        last_customer_message_at: new Date().toISOString(),
        unread_count: 0
      });
    }

    // 2. Check if AI is PAUSED (e.g. human staff takeover)
    if (conversation.ai_status === 'PAUSED') {
      // Store customer message without auto-responding
      db.insert('messages', {
        conversation_id: conversation.id,
        sender: 'CUSTOMER',
        wa_message_id,
        text,
        timestamp: new Date().toISOString()
      });

      db.update('conversations', conversation.id, {
        last_message: text,
        last_customer_message_at: new Date().toISOString(),
        unread_count: (conversation.unread_count || 0) + 1
      });

      return {
        response_text: null,
        intent: 'HUMAN_TAKEOVER_ACTIVE',
        stage: conversation.stage,
        ai_paused: true,
        message: 'AI is paused for this conversation. Awaiting staff reply.'
      };
    }

    // 3. Classify Safety & Intent
    const safety = classifySafety(text);
    const intent = detectIntent(text);

    // Record incoming message in DB
    db.insert('messages', {
      conversation_id: conversation.id,
      sender: 'CUSTOMER',
      wa_message_id,
      text,
      timestamp: new Date().toISOString()
    });

    // 4. Handle Emergency Signal
    if (safety.category === SAFETY_CATEGORIES.EMERGENCY_SIGNAL || intent === INTENTS.EMERGENCY_SIGNAL) {
      const clinic = AI_TOOLS.get_clinic_information();
      const handoff = AI_TOOLS.create_handoff({
        conversation_id: conversation.id,
        reason: 'EMERGENCY: Patient indicated urgent acute condition',
        patient_name: conversation.patient_name || patient_name,
        patient_phone
      });

      const responseText = `⚠️ IMPORTANT MEDICAL NOTICE:
For acute severe conditions or breathing difficulties, please proceed to the nearest emergency hospital immediately or call 112.

${clinic.emergency_instructions}

Our clinic team has been alerted immediately.`;

      this.recordBotResponse(conversation.id, responseText, INTENTS.EMERGENCY_SIGNAL, 'HANDOFF');
      return {
        response_text: responseText,
        intent: INTENTS.EMERGENCY_SIGNAL,
        stage: 'HANDOFF',
        handoff_id: handoff.id,
        buttons: ['Call Clinic', 'Talk to Team']
      };
    }

    // 5. Handle Medical Question (PRD Section 16 & 85: Non-diagnostic policy)
    if (safety.category === SAFETY_CATEGORIES.MEDICAL_QUESTION || intent === INTENTS.MEDICAL_QUESTION) {
      const handoff = AI_TOOLS.create_handoff({
        conversation_id: conversation.id,
        reason: `Medical query: "${text.substring(0, 100)}"`,
        patient_name: conversation.patient_name || patient_name,
        patient_phone
      });

      // Detect if user spoke Hindi/Hinglish
      const isHindi = text.includes('kaunsi') || text.includes('kya') || text.includes('hai') || text.includes('kare');

      const responseText = isHindi
        ? `Aapke condition ke liye sahi treatment aur medication doctor ke physical assessment par depend karta hai.

Main directly medication ya prescription advise nahi kar sakta. Lekin main aapko senior dermatologist ke saath consultation book karne mein help kar sakta hoon, ya clinic team se connect kar deta hoon.`
        : `An accurate medical diagnosis or prescription requires an in-person assessment by our dermatologist.

As an administrative AI, I cannot prescribe medicines. However, I can help you schedule a consultation with our dermatologist or connect you directly with our clinical care team.`;

      this.recordBotResponse(conversation.id, responseText, INTENTS.MEDICAL_QUESTION, 'HANDOFF');
      return {
        response_text: responseText,
        intent: INTENTS.MEDICAL_QUESTION,
        stage: 'HANDOFF',
        handoff_id: handoff.id,
        buttons: ['Book Consultation', 'Talk to Clinic Team']
      };
    }

    // 6. Handle Direct Human Request
    if (intent === INTENTS.HUMAN_REQUEST) {
      const handoff = AI_TOOLS.create_handoff({
        conversation_id: conversation.id,
        reason: 'Patient requested human staff assistance',
        patient_name: conversation.patient_name || patient_name,
        patient_phone
      });

      const isHindi = text.includes('baat') || text.includes('karni') || text.includes('hai');
      const responseText = isHindi
        ? `Bilkul! Maine aapki chat clinic receptionist / care team ko forward kar di hai. Hamare staff member aapse jaldi hi connect karenge.`
        : `Certainly! I have connected you with our clinic care team. A staff member will respond to you here shortly.`;

      this.recordBotResponse(conversation.id, responseText, INTENTS.HUMAN_REQUEST, 'HANDOFF');
      return {
        response_text: responseText,
        intent: INTENTS.HUMAN_REQUEST,
        stage: 'HANDOFF',
        handoff_id: handoff.id
      };
    }

    // 7. Handle Appointment Booking Flow
    if (intent === INTENTS.APPOINTMENT_BOOKING || conversation.stage === 'BOOKING') {
      const today = new Date().toISOString().split('T')[0];
      const slots = AI_TOOLS.get_available_slots({ date: today });
      const topSlots = slots.slice(0, 3).map((s) => s.display_time).join(', ');

      // Check if user is confirming a specific slot (e.g. 2:30 or 14:30)
      const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      const isConfirming = text.toLowerCase().includes('yes') || text.toLowerCase().includes('confirm') || text.toLowerCase().includes('ha');

      if (timeMatch && (conversation.stage === 'BOOKING' || isConfirming)) {
        // Auto-book slot
        const selectedSlot = slots[0] || { time: '14:30', doctor_id: 'doc_ananya_01', date: today };
        try {
          const bookingResult = await AI_TOOLS.create_appointment({
            patient_name: conversation.patient_name || patient_name || 'Patient',
            patient_phone,
            date: selectedSlot.date || today,
            time: selectedSlot.time || '14:30',
            doctor_id: selectedSlot.doctor_id || 'doc_ananya_01',
            notes: `Booked via WhatsApp AI on ${new Date().toLocaleDateString()}`
          });

          const responseText = `🎉 Your appointment has been CONFIRMED!

📅 Date: ${bookingResult.appointment.date}
⏰ Time: ${bookingResult.appointment.time}
👨‍⚕️ Doctor: ${bookingResult.doctor?.name || 'Dr. Ananya Sharma'}
🏥 Clinic: DermaCare Clinic, DLF Cyber City, Gurugram
💰 Consultation Fee: ₹800

We look forward to seeing you. Please arrive 10 minutes prior to your slot.`;

          this.recordBotResponse(conversation.id, responseText, INTENTS.APPOINTMENT_BOOKING, 'CONFIRMATION');
          return {
            response_text: responseText,
            intent: INTENTS.APPOINTMENT_BOOKING,
            stage: 'CONFIRMATION',
            appointment: bookingResult.appointment,
            buttons: ['Get Directions', 'Reschedule', 'Cancel']
          };
        } catch (err) {
          const responseText = `That slot was just reserved. Available slots today: ${topSlots}. Which time works best for you?`;
          this.recordBotResponse(conversation.id, responseText, INTENTS.APPOINTMENT_BOOKING, 'BOOKING');
          return { response_text: responseText, intent: INTENTS.APPOINTMENT_BOOKING, stage: 'BOOKING' };
        }
      }

      // Propose available slots
      const responseText = `We have consultation slots available with our dermatologists today:
${topSlots ? `Slots: ${topSlots}` : 'Please tell me your preferred day/time.'}

Would you like to reserve one of these times? Please reply with your preferred time.`;

      this.recordBotResponse(conversation.id, responseText, INTENTS.APPOINTMENT_BOOKING, 'BOOKING');
      return {
        response_text: responseText,
        intent: INTENTS.APPOINTMENT_BOOKING,
        stage: 'BOOKING',
        available_slots: slots.slice(0, 4)
      };
    }

    // 8. Handle Pricing Enquiries (Strictly grounded from database)
    if (intent === INTENTS.PRICE_INFORMATION) {
      const services = AI_TOOLS.get_service_information(text);
      const isHindi = text.includes('kitne') || text.includes('hai') || text.includes('fees');

      let responseText = '';
      if (text.toLowerCase().includes('prp')) {
        const prp = services.find((s) => s.name.toLowerCase().includes('prp')) || { price: 4500 };
        responseText = isHindi
          ? `PRP Hair Loss Therapy ki single session fee ₹${prp.price} hai. Package discounts consultation ke baad doctor discuss karte hain. Kya aap consultation slot book karna chahenge?`
          : `Our PRP Hair Loss Therapy is ₹${prp.price} per session. Would you like to schedule a consultation with our hair specialist Dr. Vikram Kapoor?`;
      } else if (text.toLowerCase().includes('laser') || text.toLowerCase().includes('carbon')) {
        responseText = `Laser Carbon Peel (Hollywood Facial) is ₹3,500 per session. It includes deep exfoliation and pore tightening.`;
      } else {
        responseText = isHindi
          ? `Hamare senior dermatologists ki initial in-person consultation fee ₹800 hai. Kya aap available appointment slots dekhna chahenge?`
          : `Our initial in-person dermatologist consultation fee is ₹800. Would you like to see available appointment slots?`;
      }

      AI_TOOLS.create_lead({
        name: conversation.patient_name || patient_name,
        phone: patient_phone,
        service: 'Pricing Enquiry',
        intent: INTENTS.PRICE_INFORMATION
      });

      this.recordBotResponse(conversation.id, responseText, INTENTS.PRICE_INFORMATION, 'QUALIFICATION');
      return {
        response_text: responseText,
        intent: INTENTS.PRICE_INFORMATION,
        stage: 'QUALIFICATION',
        buttons: ['Book Consultation', 'View All Services']
      };
    }

    // 9. Handle Service Information
    if (intent === INTENTS.SERVICE_INFORMATION) {
      const isHindi = text.includes('chahiye') || text.includes('hai') || text.includes('kya');
      let responseText = '';

      if (text.toLowerCase().includes('acne') || text.toLowerCase().includes('pimple')) {
        responseText = isHindi
          ? `Hum acne, active breakouts aur acne scars ke liye customized clinical treatments provide karte hain (Chemical Peels, Laser & Scar Subcision).

Consultation fee ₹800 hai. Kya aap appointment book karna chahenge?`
          : `We provide specialized clinical treatments for active acne, cystic breakouts, and acne scars (including chemical peels and microneedling).

Consultation fee is ₹800. Would you like to check doctor availability?`;
      } else if (text.toLowerCase().includes('hair')) {
        responseText = `We offer advanced Trichology consultations, PRP hair regrowth therapy, and scalp treatments with Dr. Vikram Kapoor.`;
      } else {
        responseText = `Welcome to DermaCare Clinic! We specialize in Acne Treatments, PRP Hair Restoration, Chemical Peels, Laser Carbon Facial, and Scar Revision.`;
      }

      AI_TOOLS.create_lead({
        name: conversation.patient_name || patient_name,
        phone: patient_phone,
        service: 'Service Enquiry',
        intent: INTENTS.SERVICE_INFORMATION
      });

      this.recordBotResponse(conversation.id, responseText, INTENTS.SERVICE_INFORMATION, 'QUALIFICATION');
      return {
        response_text: responseText,
        intent: INTENTS.SERVICE_INFORMATION,
        stage: 'QUALIFICATION',
        buttons: ['Book Consultation', 'Know Consultation Fee']
      };
    }

    // 10. Handle Location & Timings
    if (intent === INTENTS.LOCATION || intent === INTENTS.WORKING_HOURS) {
      const clinic = AI_TOOLS.get_clinic_information();
      const responseText = `🏥 ${clinic.name}
📍 Address: ${clinic.address}
⏰ Hours: ${clinic.working_hours}
🗺️ Google Maps: https://maps.google.com/?q=DLF+Cyber+City+Gurugram`;

      this.recordBotResponse(conversation.id, responseText, intent, 'INFORMATION');
      return {
        response_text: responseText,
        intent,
        stage: 'INFORMATION',
        buttons: ['Book Appointment', 'Get Directions']
      };
    }

    // 11. Handle Doctor Information
    if (intent === INTENTS.DOCTOR_INFORMATION) {
      const doctors = AI_TOOLS.get_doctor_information();
      const docList = doctors.map((d) => `• ${d.name} (${d.qualification}) - ${d.specialty}`).join('\n');
      const responseText = `Our Senior Specialists:
${docList}

Consultation fee is ₹800. Would you like to book an appointment with Dr. Ananya or Dr. Vikram?`;

      this.recordBotResponse(conversation.id, responseText, INTENTS.DOCTOR_INFORMATION, 'INFORMATION');
      return {
        response_text: responseText,
        intent: INTENTS.DOCTOR_INFORMATION,
        stage: 'INFORMATION',
        buttons: ['Book Dr. Ananya', 'Book Dr. Vikram']
      };
    }

    // 12. Handle Greeting & General FAQ
    if (intent === INTENTS.GREETING) {
      const isHindi = text.includes('namaste');
      const responseText = isHindi
        ? `Namaste! DermaCare Skin & Laser Clinic mein aapka swagat hai. Main aapki kya sahayata kar sakta hoon?`
        : `Hi! Welcome to DermaCare Skin & Laser Clinic. How can I assist you today?`;

      this.recordBotResponse(conversation.id, responseText, INTENTS.GREETING, 'START');
      return {
        response_text: responseText,
        intent: INTENTS.GREETING,
        stage: 'START',
        buttons: ['Book Consultation', 'Treatment Menu', 'Consultation Fee']
      };
    }

    // 13. Fallback / Unknown Query (PRD Section 50: Grounded Fallback without Hallucination)
    const faq = AI_TOOLS.get_faq(text);
    if (faq) {
      this.recordBotResponse(conversation.id, faq.answer, 'FAQ_ANSWER', 'INFORMATION');
      return {
        response_text: faq.answer,
        intent: 'FAQ_ANSWER',
        stage: 'INFORMATION'
      };
    }

    const fallbackText = `Thank you for contacting DermaCare Clinic. I can help you check consultation fees, doctor availability, clinic timings, and book appointments.

If you have a specific medical concern, I can also connect you with our clinic care team.`;

    this.recordBotResponse(conversation.id, fallbackText, INTENTS.UNKNOWN, 'INFORMATION');
    return {
      response_text: fallbackText,
      intent: INTENTS.UNKNOWN,
      stage: 'INFORMATION',
      buttons: ['Book Consultation', 'Talk to Team']
    };
  }

  static recordBotResponse(conversation_id, text, intent, stage) {
    db.insert('messages', {
      conversation_id,
      sender: 'AI',
      text,
      timestamp: new Date().toISOString()
    });

    db.update('conversations', conversation_id, {
      last_message: text,
      last_intent: intent,
      stage: stage || 'INFORMATION',
      updated_at: new Date().toISOString()
    });
  }
}

export default ConversationEngine;
