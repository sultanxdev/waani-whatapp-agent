import db from '../database/db.js';
import { AppointmentService } from '../services/appointmentService.js';

export class AppointmentsController {
  static getAppointments(req, res) {
    const { date, doctor_id, status } = req.query;
    let appointments = db.find('appointments');

    if (date) {
      appointments = appointments.filter((a) => a.date === date);
    }
    if (doctor_id && doctor_id !== 'ALL') {
      appointments = appointments.filter((a) => a.doctor_id === doctor_id);
    }
    if (status && status !== 'ALL') {
      appointments = appointments.filter((a) => a.status === status);
    }

    appointments.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    res.json(appointments);
  }

  static getSlots(req, res) {
    const { date, doctor_id, service_id } = req.query;
    const slots = AppointmentService.getAvailableSlots({
      clinic_id: req.user?.clinic_id || 'clinic_derma_care_01',
      date,
      doctor_id,
      service_id
    });
    res.json(slots);
  }

  static async createAppointment(req, res) {
    try {
      const result = await AppointmentService.bookAppointment({
        ...req.body,
        clinic_id: req.user?.clinic_id || 'clinic_derma_care_01'
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async rescheduleAppointment(req, res) {
    try {
      const { new_date, new_time, reason } = req.body;
      const updated = await AppointmentService.rescheduleAppointment({
        appointment_id: req.params.id,
        new_date,
        new_time,
        reason
      });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async cancelAppointment(req, res) {
    try {
      const { reason } = req.body;
      const updated = await AppointmentService.cancelAppointment({
        appointment_id: req.params.id,
        reason
      });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static updateStatus(req, res) {
    const { status } = req.body;
    const apt = db.findOne('appointments', (a) => a.id === req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });

    const updated = db.update('appointments', req.params.id, { status });

    if (apt.lead_id && (status === 'COMPLETED' || status === 'NO_SHOW')) {
      db.update('leads', apt.lead_id, { status });
    }

    db.logAudit({
      user_id: req.user?.id || 'system',
      action: `APPOINTMENT_STATUS_${status}`,
      entity: 'appointments',
      entity_id: req.params.id,
      before: apt,
      after: updated
    });

    res.json(updated);
  }
}
