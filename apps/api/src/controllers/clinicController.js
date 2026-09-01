import db from '../database/db.js';

export class ClinicController {
  // Clinic Profile
  static getClinic(req, res) {
    const clinic = db.findOne('clinics', () => true);
    res.json(clinic || {});
  }

  static updateClinic(req, res) {
    const clinic = db.findOne('clinics', () => true);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    const updated = db.update('clinics', clinic.id, req.body);
    res.json(updated);
  }

  // Doctors
  static getDoctors(req, res) {
    const doctors = db.find('doctors');
    res.json(doctors);
  }

  static createDoctor(req, res) {
    const newDoc = db.insert('doctors', {
      clinic_id: req.user?.clinic_id || 'clinic_derma_care_01',
      ...req.body,
      status: req.body.status || 'ACTIVE'
    });
    res.status(201).json(newDoc);
  }

  static updateDoctor(req, res) {
    const updated = db.update('doctors', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Doctor not found' });
    res.json(updated);
  }

  static deleteDoctor(req, res) {
    const deleted = db.delete('doctors', req.params.id);
    res.json({ success: deleted });
  }

  // Services
  static getServices(req, res) {
    const services = db.find('services');
    res.json(services);
  }

  static createService(req, res) {
    const newService = db.insert('services', {
      clinic_id: req.user?.clinic_id || 'clinic_derma_care_01',
      ...req.body,
      price: Number(req.body.price || 0),
      duration: Number(req.body.duration || 30),
      is_active: req.body.is_active !== false,
      booking_enabled: req.body.booking_enabled !== false
    });
    res.status(201).json(newService);
  }

  static updateService(req, res) {
    const updated = db.update('services', req.params.id, {
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      duration: req.body.duration !== undefined ? Number(req.body.duration) : undefined
    });
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json(updated);
  }

  static deleteService(req, res) {
    const deleted = db.delete('services', req.params.id);
    res.json({ success: deleted });
  }

  // FAQs
  static getFaqs(req, res) {
    const faqs = db.find('faqs');
    res.json(faqs);
  }

  static createFaq(req, res) {
    const newFaq = db.insert('faqs', {
      clinic_id: req.user?.clinic_id || 'clinic_derma_care_01',
      ...req.body,
      approved: req.body.approved !== false,
      is_active: req.body.is_active !== false
    });
    res.status(201).json(newFaq);
  }

  static updateFaq(req, res) {
    const updated = db.update('faqs', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'FAQ not found' });
    res.json(updated);
  }

  static deleteFaq(req, res) {
    const deleted = db.delete('faqs', req.params.id);
    res.json({ success: deleted });
  }
}
