import db from '../database/db.js';

export class LeadsController {
  static getLeads(req, res) {
    const { status, source, service, search } = req.query;
    let leads = db.find('leads');

    if (status && status !== 'ALL') {
      leads = leads.filter((l) => l.status === status);
    }
    if (source && source !== 'ALL') {
      leads = leads.filter((l) => l.source === source);
    }
    if (service && service !== 'ALL') {
      leads = leads.filter((l) => l.service === service || l.service_id === service);
    }
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.phone && l.phone.includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(leads);
  }

  static getLeadById(req, res) {
    const lead = db.findOne('leads', (l) => l.id === req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const conversation = db.findOne('conversations', (c) => c.lead_id === lead.id || c.patient_phone === lead.phone);
    const appointments = db.find('appointments', (a) => a.lead_id === lead.id || a.patient_phone === lead.phone);

    res.json({ lead, conversation, appointments });
  }

  static createLead(req, res) {
    const { name, phone, service, source, status, notes, assigned_to } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const newLead = db.insert('leads', {
      clinic_id: req.user?.clinic_id || 'clinic_derma_care_01',
      name: name || 'Direct Lead',
      phone,
      service: service || 'General Consultation',
      intent: 'DIRECT_ENTRY',
      source: source || 'Manual',
      status: status || 'NEW',
      assigned_to: assigned_to || req.user?.id || 'user_staff_01',
      notes: notes || ''
    });

    db.logAudit({
      user_id: req.user?.id || 'system',
      action: 'LEAD_CREATED',
      entity: 'leads',
      entity_id: newLead.id,
      after: newLead
    });

    res.status(201).json(newLead);
  }

  static updateLead(req, res) {
    const lead = db.findOne('leads', (l) => l.id === req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const updated = db.update('leads', req.params.id, req.body);
    db.logAudit({
      user_id: req.user?.id || 'system',
      action: 'LEAD_UPDATED',
      entity: 'leads',
      entity_id: req.params.id,
      before: lead,
      after: updated
    });

    res.json(updated);
  }

  static deleteLead(req, res) {
    const lead = db.findOne('leads', (l) => l.id === req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    db.delete('leads', req.params.id);
    db.logAudit({
      user_id: req.user?.id || 'system',
      action: 'LEAD_DELETED',
      entity: 'leads',
      entity_id: req.params.id,
      before: lead
    });

    res.json({ success: true, message: 'Lead deleted successfully' });
  }
}
