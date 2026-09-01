import { GoogleDocsSyncService } from '../services/googleDocsSyncService.js';
import db from '../database/db.js';

export class GoogleDocsController {
  static getStatus(req, res) {
    const status = GoogleDocsSyncService.getStatus();
    res.json(status);
  }

  static toggleSync(req, res) {
    const { enabled } = req.body;
    const result = GoogleDocsSyncService.setEnabled(enabled);
    res.json({ success: true, result });
  }

  static async syncKnowledge(req, res) {
    const { docId } = req.body;
    const result = await GoogleDocsSyncService.syncKnowledgeFromDoc({
      docId,
      clinic_id: req.user?.clinic_id || 'clinic_derma_care_01'
    });
    res.json(result);
  }

  static exportLiveSheet(req, res) {
    const data = GoogleDocsSyncService.exportSheetData();
    res.json(data);
  }

  static getAuditLogs(req, res) {
    const logs = db.find('audit_logs');
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(logs.slice(0, 50));
  }
}
