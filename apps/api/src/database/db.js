import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

class Database {
  constructor() {
    this.data = {
      clinics: [],
      users: [],
      doctors: [],
      doctor_availability: [],
      services: [],
      faqs: [],
      leads: [],
      conversations: [],
      messages: [],
      appointments: [],
      appointment_slots: [],
      handoffs: [],
      whatsapp_accounts: [],
      whatsapp_messages: [],
      message_templates: [],
      audit_logs: [],
      google_docs_sync: {
        last_synced_at: null,
        status: 'IDLE',
        doc_id: null,
        sheet_id: null,
        enabled: true,
        extracted_faqs_count: 0
      }
    };
    this.isLocked = false;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file:', err);
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // Atomic transaction helper with mutex
  async transaction(callback) {
    while (this.isLocked) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.isLocked = true;
    try {
      const result = await callback(this);
      this.save();
      return result;
    } finally {
      this.isLocked = false;
    }
  }

  // Generic helpers
  find(table, predicate = () => true) {
    return (this.data[table] || []).filter(predicate);
  }

  findOne(table, predicate) {
    return (this.data[table] || []).find(predicate) || null;
  }

  insert(table, record) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    const now = new Date().toISOString();
    const newRecord = {
      id: record.id || `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      created_at: record.created_at || now,
      updated_at: record.updated_at || now,
      ...record
    };
    this.data[table].push(newRecord);
    this.save();
    return newRecord;
  }

  update(table, id, updates) {
    if (!this.data[table]) return null;
    const index = this.data[table].findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updatedRecord = {
      ...this.data[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.data[table][index] = updatedRecord;
    this.save();
    return updatedRecord;
  }

  delete(table, id) {
    if (!this.data[table]) return false;
    const index = this.data[table].findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.data[table].splice(index, 1);
    this.save();
    return true;
  }

  logAudit({ user_id = 'system', clinic_id = 'clinic_derma_care_01', action, entity, entity_id, before = null, after = null, ip = '127.0.0.1' }) {
    return this.insert('audit_logs', {
      user_id,
      clinic_id,
      action,
      entity,
      entity_id,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
      ip
    });
  }
}

export const db = new Database();
export default db;
