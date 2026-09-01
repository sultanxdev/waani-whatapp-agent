import db from '../database/db.js';

export class AppointmentService {
  /**
   * Calculate deterministic available slots for a given date, doctor, and service.
   */
  static getAvailableSlots({ clinic_id = 'clinic_derma_care_01', date, doctor_id, service_id }) {
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    // Determine day of week
    const targetDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[targetDate.getDay()];

    // Get doctor(s)
    let doctors = db.find('doctors', (d) => d.clinic_id === clinic_id && d.status === 'ACTIVE');
    if (doctor_id) {
      doctors = doctors.filter((d) => d.id === doctor_id);
    }

    // Get service to check duration
    let serviceDuration = 30;
    if (service_id) {
      const service = db.findOne('services', (s) => s.id === service_id);
      if (service) serviceDuration = service.duration || 30;
    }

    const availableSlots = [];

    for (const doc of doctors) {
      if (!doc.available_days || !doc.available_days.includes(dayOfWeek)) {
        continue;
      }

      const startTimeStr = doc.working_start_time || '10:00';
      const endTimeStr = doc.working_end_time || '19:00';
      const breakStart = doc.break_start_time || '13:30';
      const breakEnd = doc.break_end_time || '14:30';

      const [startHour, startMin] = startTimeStr.split(':').map(Number);
      const [endHour, endMin] = endTimeStr.split(':').map(Number);
      const [bStartH, bStartM] = breakStart.split(':').map(Number);
      const [bEndH, bEndM] = breakEnd.split(':').map(Number);

      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      const breakStartMin = bStartH * 60 + bStartM;
      const breakEndMin = bEndH * 60 + bEndM;

      // Existing bookings for this doctor on this date
      const existingAppointments = db.find(
        'appointments',
        (apt) => apt.doctor_id === doc.id && apt.date === date && apt.status !== 'CANCELLED'
      );

      for (let currentMin = startTotalMin; currentMin + serviceDuration <= endTotalMin; currentMin += 30) {
        // Exclude break times
        if (currentMin >= breakStartMin && currentMin < breakEndMin) {
          continue;
        }

        const slotHour = Math.floor(currentMin / 60);
        const slotMin = currentMin % 60;
        const timeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;

        // Format 12-hour display
        const period = slotHour >= 12 ? 'PM' : 'AM';
        const displayHour = slotHour % 12 === 0 ? 12 : slotHour % 12;
        const displayTime = `${displayHour}:${String(slotMin).padStart(2, '0')} ${period}`;

        // Check conflicts
        const isConflict = existingAppointments.some((apt) => {
          const [aptH, aptM] = (apt.time || '').split(':').map(Number);
          const aptTotal = aptH * 60 + aptM;
          const aptDur = apt.duration || 30;
          return currentMin < aptTotal + aptDur && currentMin + serviceDuration > aptTotal;
        });

        if (!isConflict) {
          availableSlots.push({
            doctor_id: doc.id,
            doctor_name: doc.name,
            specialty: doc.specialty,
            date,
            time: timeStr,
            display_time: displayTime,
            duration: serviceDuration
          });
        }
      }
    }

    return availableSlots;
  }

  /**
   * Atomic booking creation to prevent double-booking.
   */
  static async bookAppointment({
    clinic_id = 'clinic_derma_care_01',
    lead_id = null,
    patient_name,
    patient_phone,
    doctor_id,
    service_id,
    date,
    time,
    notes = ''
  }) {
    return await db.transaction(async (database) => {
      // 1. Validate inputs
      if (!patient_name || !patient_phone || !date || !time) {
        throw new Error('Missing required booking fields: name, phone, date, or time.');
      }

      // 2. Doctor selection fallback
      let doctor = null;
      if (doctor_id) {
        doctor = database.findOne('doctors', (d) => d.id === doctor_id);
      } else {
        doctor = database.findOne('doctors', (d) => d.clinic_id === clinic_id && d.status === 'ACTIVE');
      }

      if (!doctor) {
        throw new Error('No available doctor found for the requested booking.');
      }

      // 3. Service selection fallback
      let service = null;
      if (service_id) {
        service = database.findOne('services', (s) => s.id === service_id);
      } else {
        service = database.findOne('services', (s) => s.clinic_id === clinic_id && s.is_active);
      }

      const duration = service?.duration || 30;

      // 4. Check double-booking conflict atomically
      const conflict = database.findOne(
        'appointments',
        (apt) =>
          apt.doctor_id === doctor.id &&
          apt.date === date &&
          apt.time === time &&
          apt.status !== 'CANCELLED'
      );

      if (conflict) {
        throw new Error(`The requested slot ${time} on ${date} is no longer available. Please select another slot.`);
      }

      // 5. Create Appointment
      const appointment = database.insert('appointments', {
        clinic_id,
        lead_id,
        patient_name,
        patient_phone,
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        service_id: service?.id || null,
        service_name: service?.name || 'Dermatology Consultation',
        date,
        time,
        duration,
        status: 'CONFIRMED',
        notes
      });

      // 6. Update or Create Lead
      let lead = lead_id ? database.findOne('leads', (l) => l.id === lead_id) : null;
      if (!lead) {
        lead = database.findOne('leads', (l) => l.phone === patient_phone);
      }

      if (lead) {
        database.update('leads', lead.id, {
          status: 'BOOKED',
          service: service?.name || lead.service,
          service_id: service?.id || lead.service_id,
          notes: `${lead.notes || ''}\nBooked appointment for ${date} at ${time}.`.trim()
        });
      } else {
        lead = database.insert('leads', {
          clinic_id,
          name: patient_name,
          phone: patient_phone,
          service: service?.name || 'General Consultation',
          service_id: service?.id || null,
          intent: 'APPOINTMENT_BOOKING',
          source: 'WhatsApp',
          status: 'BOOKED',
          notes: `Auto-created lead with confirmed appointment on ${date} at ${time}.`
        });
        database.update('appointments', appointment.id, { lead_id: lead.id });
      }

      database.logAudit({
        user_id: 'ai_system',
        clinic_id,
        action: 'APPOINTMENT_CREATED',
        entity: 'appointments',
        entity_id: appointment.id,
        after: appointment
      });

      return {
        appointment,
        lead,
        doctor,
        service
      };
    });
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment({ appointment_id, new_date, new_time, reason = '' }) {
    return await db.transaction(async (database) => {
      const apt = database.findOne('appointments', (a) => a.id === appointment_id);
      if (!apt) throw new Error('Appointment not found');

      // Check conflict
      const conflict = database.findOne(
        'appointments',
        (a) =>
          a.id !== appointment_id &&
          a.doctor_id === apt.doctor_id &&
          a.date === new_date &&
          a.time === new_time &&
          a.status !== 'CANCELLED'
      );

      if (conflict) {
        throw new Error(`Slot ${new_time} on ${new_date} is already booked.`);
      }

      const updated = database.update('appointments', appointment_id, {
        date: new_date,
        time: new_time,
        status: 'CONFIRMED',
        notes: `${apt.notes || ''}\nRescheduled to ${new_date} ${new_time}. Reason: ${reason}`.trim()
      });

      database.logAudit({
        user_id: 'system',
        clinic_id: apt.clinic_id,
        action: 'APPOINTMENT_RESCHEDULED',
        entity: 'appointments',
        entity_id: appointment_id,
        before: apt,
        after: updated
      });

      return updated;
    });
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment({ appointment_id, reason = '' }) {
    return await db.transaction(async (database) => {
      const apt = database.findOne('appointments', (a) => a.id === appointment_id);
      if (!apt) throw new Error('Appointment not found');

      const updated = database.update('appointments', appointment_id, {
        status: 'CANCELLED',
        notes: `${apt.notes || ''}\nCancelled. Reason: ${reason}`.trim()
      });

      if (apt.lead_id) {
        database.update('leads', apt.lead_id, { status: 'CANCELLED' });
      }

      database.logAudit({
        user_id: 'system',
        clinic_id: apt.clinic_id,
        action: 'APPOINTMENT_CANCELLED',
        entity: 'appointments',
        entity_id: appointment_id,
        before: apt,
        after: updated
      });

      return updated;
    });
  }
}
