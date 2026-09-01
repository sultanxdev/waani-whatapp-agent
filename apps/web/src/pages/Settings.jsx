import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Shield,
  Building,
  Key,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../services/api.js';

export function Settings() {
  const [googleDocsStatus, setGoogleDocsStatus] = useState(null);
  const [docIdInput, setDocIdInput] = useState('');
  const [sheetExportData, setSheetExportData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [clinicInfo, setClinicInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    working_hours: ''
  });
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadData = async () => {
    try {
      const [gStatus, clinic, logs, sheetData] = await Promise.all([
        api.getGoogleDocsStatus(),
        api.getClinic(),
        api.getAuditLogs(),
        api.exportLiveSheet()
      ]);
      setGoogleDocsStatus(gStatus);
      setDocIdInput(gStatus.doc_id || '');
      setClinicInfo(clinic);
      setAuditLogs(logs);
      setSheetExportData(sheetData);
    } catch (err) {
      console.error('Failed to load settings data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleGoogleDocs = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const newEnabled = !googleDocsStatus?.enabled;
      await api.toggleGoogleDocsSync(newEnabled);
      await loadData();
    } catch (err) {
      alert('Toggle failed: ' + err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleSyncKnowledge = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await api.syncGoogleDocsNow(docIdInput);
      alert(res.message);
      await loadData();
    } catch (err) {
      alert('Knowledge sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    try {
      await api.updateClinic(clinicInfo);
      alert('Clinic details updated successfully.');
      await loadData();
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const isEnabled = googleDocsStatus?.enabled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Clinic Settings & Integrations</h3>
            <p className="text-xs text-slate-500">
              Google Docs dashboard sync, Meta WhatsApp credentials, and compliance logs
            </p>
          </div>
        </div>
      </div>

      {/* Google Docs Dashboard & Live Sync Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">Google Docs & Sheets Dashboard Integration</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isEnabled ? 'ENABLED (ENV FLAG ON)' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sync clinic knowledge directly from Google Docs & stream live leads into Google Sheets
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleGoogleDocs}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              isEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{isEnabled ? 'Integration Active' : 'Enable Integration'}</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Google Doc Knowledge Base ID / URL
              </label>
              <input
                type="text"
                value={docIdInput}
                onChange={(e) => setDocIdInput(e.target.value)}
                placeholder="e.g. 1_sample_google_doc_id_for_clinic_knowledge_base"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Configured via <code className="bg-slate-100 px-1 py-0.5 rounded">ENABLE_GOOGLE_DOCS_SYNC</code> in .env
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Connected Google Sheet Live Stream ID
              </label>
              <input
                type="text"
                readOnly
                value={googleDocsStatus?.sheet_id || 'sheet_derma_live_leads'}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Automatically exports leads & appointments in real-time
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              <span>Last Synced: </span>
              <strong className="text-slate-700">
                {googleDocsStatus?.last_synced_at
                  ? new Date(googleDocsStatus.last_synced_at).toLocaleString()
                  : 'Never'}
              </strong>
              <span className="ml-2">({googleDocsStatus?.extracted_faqs_count || 0} FAQs synchronized)</span>
            </div>

            <button
              onClick={handleSyncKnowledge}
              disabled={!isEnabled || syncing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing...' : 'Sync Knowledge Base Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinic Details Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Building className="w-4 h-4 text-brand-600" />
          <span>Clinic Contact & Physical Details</span>
        </h4>

        <form onSubmit={handleSaveClinic} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Clinic Name</label>
              <input
                type="text"
                required
                value={clinicInfo.name || ''}
                onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Official WhatsApp Number</label>
              <input
                type="text"
                required
                value={clinicInfo.phone || ''}
                onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Clinic Address & Landmarks</label>
            <input
              type="text"
              required
              value={clinicInfo.address || ''}
              onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Working Hours Information</label>
            <input
              type="text"
              value={clinicInfo.working_hours || ''}
              onChange={(e) => setClinicInfo({ ...clinicInfo, working_hours: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20"
            >
              Update Clinic Details
            </button>
          </div>
        </form>
      </div>

      {/* Audit Log / DPDP Compliance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Security Audit Trail (DPDP Act Compliance Ready)</span>
        </h4>
        <p className="text-xs text-slate-500">
          Immutable logs tracking staff takeovers, appointment bookings, and configuration changes
        </p>

        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto max-h-60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">User</th>
                <th className="p-2.5">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white">
                  <td className="p-2.5 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-2.5 font-semibold text-brand-700">{log.action}</td>
                  <td className="p-2.5 text-slate-600">{log.user_id}</td>
                  <td className="p-2.5 text-slate-500">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Settings;
