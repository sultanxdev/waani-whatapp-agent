import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Clock, Calendar, ShieldCheck, X } from 'lucide-react';
import { api } from '../services/api.js';

export function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    registration_no: '',
    specialty: '',
    consultation_duration: 30,
    fee: 800,
    working_start_time: '10:00',
    working_end_time: '19:00',
    break_start_time: '13:30',
    break_end_time: '14:30',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  });

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        name: doc.name,
        qualification: doc.qualification || '',
        registration_no: doc.registration_no || '',
        specialty: doc.specialty || '',
        consultation_duration: doc.consultation_duration || 30,
        fee: doc.fee || 800,
        working_start_time: doc.working_start_time || '10:00',
        working_end_time: doc.working_end_time || '19:00',
        break_start_time: doc.break_start_time || '13:30',
        break_end_time: doc.break_end_time || '14:30',
        available_days: doc.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      });
    } else {
      setEditingDoc(null);
      setFormData({
        name: '',
        qualification: 'MBBS, MD (Dermatology)',
        registration_no: '',
        specialty: 'Clinical Dermatology',
        consultation_duration: 30,
        fee: 800,
        working_start_time: '10:00',
        working_end_time: '19:00',
        break_start_time: '13:30',
        break_end_time: '14:30',
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await api.updateDoctor(editingDoc.id, formData);
      } else {
        await api.createDoctor(formData);
      }
      setShowModal(false);
      await loadDoctors();
    } catch (err) {
      alert('Failed to save doctor: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await api.deleteDoctor(id);
      await loadDoctors();
    } catch (err) {
      alert('Failed to delete doctor: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Doctors & Clinical Schedules</h3>
            <p className="text-xs text-slate-500">Working hours, consultation durations, and appointment availability</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{doc.name}</h4>
                  <p className="text-xs font-semibold text-brand-600">{doc.specialty}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Specialist
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p>🎓 <strong>Qualifications:</strong> {doc.qualification}</p>
                {doc.registration_no && (
                  <p>📜 <strong>Medical Council Reg:</strong> {doc.registration_no}</p>
                )}
                <p>💰 <strong>Consultation Fee:</strong> ₹{doc.fee || 800}</p>
              </div>

              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Timings: {doc.working_start_time} - {doc.working_end_time} (Break: {doc.break_start_time} - {doc.break_end_time})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Days: {doc.available_days?.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Slot Duration: {doc.consultation_duration} mins</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-800">
                {editingDoc ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Clinical Dermatology & Aesthetics"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="MBBS, MD (Dermatology)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={formData.working_start_time}
                    onChange={(e) => setFormData({ ...formData, working_start_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Shift End</label>
                  <input
                    type="time"
                    value={formData.working_end_time}
                    onChange={(e) => setFormData({ ...formData, working_end_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Break Start</label>
                  <input
                    type="time"
                    value={formData.break_start_time}
                    onChange={(e) => setFormData({ ...formData, break_start_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Break End</label>
                  <input
                    type="time"
                    value={formData.break_end_time}
                    onChange={(e) => setFormData({ ...formData, break_end_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
