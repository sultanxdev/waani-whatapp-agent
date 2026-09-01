import db from '../database/db.js';
import { AppointmentService } from '../services/appointmentService.js';

export const AI_TOOLS = {
  get_clinic_information: () => {
    const clinic = db.findOne('clinics', () => true) || {
      name: 'DermaCare Skin, Hair & Laser Clinic',
      phone: '+91 98765 43210',
      email: 'care@dermacareclinic.com',
      address: 'Suite 402, DLF Cyber City, Sector 24, Gurugram, Haryana 122002',
      working_hours: 'Monday to Saturday: 10:00 AM - 7:30 PM, Sunday: 10:00 AM - 2:00 PM',
      emergency_instructions: 'For severe emergencies or acute allergic reactions, visit nearest hospital emergency room or call 112.'
    };
    return clinic;
  },

  get_service_information: (query = '') => {
    const clean = query.toLowerCase().trim();
    const services = db.find('services', (s) => s.is_active);

    if (!clean) return services;

    const matched = services.filter(
      (s) =>
        s.name.toLowerCase().includes(clean) ||
        s.category.toLowerCase().includes(clean) ||
        s.description.toLowerCase().includes(clean)
    );

    return matched.length > 0 ? matched : services;
  },

  get_doctor_information: (query = '') => {
    const clean = query.toLowerCase().trim();
    const doctors = db.find('doctors', (d) => d.status === 'ACTIVE');

    if (!clean) return doctors;

    const matched = doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(clean) ||
        d.specialty.toLowerCase().includes(clean) ||
        d.qualification.toLowerCase().includes(clean)
    );

    return matched.length > 0 ? matched : doctors;
  },

  get_available_slots: ({ date, doctor_id, service_id } = {}) => {
    return AppointmentService.getAvailableSlots({ date, doctor_id, service_id });
  },

  create_lead: ({ name, phone, service, intent = 'LEAD_CAPTURE', source = 'WhatsApp', notes = '' }) => {
    let lead = db.findOne('leads', (l) => l.phone === phone);
    if (lead) {
      lead = db.update('leads', lead.id, {
        name: name || lead.name,
        service: service || lead.service,
        notes: notes ? `${lead.notes}\n${notes}` : lead.notes,
        status: lead.status === 'LOST' || lead.status === 'NEW' ? 'QUALIFIED' : lead.status
      });
    } else {
      lead = db.insert('leads', {
        clinic_id: 'clinic_derma_care_01',
        name: name || 'WhatsApp Patient',
        phone,
        service: service || 'General Dermatology Enquiry',
        intent,
        source,
        status: 'NEW',
        notes
      });
    }
    return lead;
  },

  update_lead: ({ id, updates }) => {
    return db.update('leads', id, updates);
  },

  create_appointment: async (bookingData) => {
    return await AppointmentService.bookAppointment(bookingData);
  },

  cancel_appointment: async ({ appointment_id, reason }) => {
    return await AppointmentService.cancelAppointment({ appointment_id, reason });
  },

  reschedule_appointment: async ({ appointment_id, new_date, new_time, reason }) => {
    return await AppointmentService.rescheduleAppointment({ appointment_id, new_date, new_time, reason });
  },

  create_handoff: ({ conversation_id, reason, patient_name = 'Patient', patient_phone = '' }) => {
    // 1. Create or find handoff
    const handoff = db.insert('handoffs', {
      clinic_id: 'clinic_derma_care_01',
      conversation_id,
      patient_name,
      patient_phone,
      reason: reason || 'Patient requested human assistance or asked a clinical question.',
      status: 'PENDING',
      assigned_to: 'user_staff_01'
    });

    // 2. Pause AI in conversation
    if (conversation_id) {
      db.update('conversations', conversation_id, {
        ai_status: 'PAUSED',
        stage: 'HANDOFF'
      });
    }

    db.logAudit({
      user_id: 'ai_system',
      action: 'HUMAN_HANDOFF_TRIGGERED',
      entity: 'handoffs',
      entity_id: handoff.id,
      after: handoff
    });

    return handoff;
  },

  get_faq: (query = '') => {
    const clean = query.toLowerCase().trim();
    const faqs = db.find('faqs', (f) => f.approved && f.is_active);

    if (!clean) return faqs;

    const matched = faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(clean) ||
        f.answer.toLowerCase().includes(clean) ||
        f.category.toLowerCase().includes(clean)
    );

    return matched.length > 0 ? matched[0] : null;
  }
};

export default AI_TOOLS;
