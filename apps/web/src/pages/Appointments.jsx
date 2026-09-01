import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UserX,
  Stethoscope,
  X,
  CalendarCheck
} from 'lucide-react';
import { api } from '../services/api.js';

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Form states
  const [bookForm, setBookForm] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_id: '',
    service_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', reason: '' });

  const loadData = async () => {
    try {
      const [aptList, docList] = await Promise.all([
        api.getAppointments({ date: selectedDate, doctor_id: selectedDoctor, status: statusFilter }),
        api.getDoctors()
      ]);
      setAppointments(aptList);
      setDoctors(docList);
    } catch (err) {
      console.error('Failed to load appointments', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedDoctor, statusFilter]);

  // Load available slots when booking date/doctor changes
  useEffect(() => {
    async function loadSlots() {
      if (showBookModal) {
        try {
          const slots = await api.getSlots({
            date: bookForm.date,
            doctor_id: bookForm.doctor_id
          });
          setAvailableSlots(slots);
          if (slots.length > 0 && !bookForm.time) {
            setBookForm((prev) => ({ ...prev, time: slots[0].time }));
          }
        } catch (err) {
          console.error('Failed to load slots', err);
        }
      }
    }
    loadSlots();
  }, [bookForm.date, bookForm.doctor_id, showBookModal]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      await loadData();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Please enter reason for cancellation:');
    if (reason === null) return;
    try {
      await api.cancelAppointment(id, { reason });
      await loadData();
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAppointment(bookForm);
      setShowBookModal(false);
      await loadData();
    } catch (err) {
      alert('Booking failed: ' + err.message);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      await api.rescheduleAppointment(selectedAppointment.id, rescheduleData);
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      await loadData();
    } catch (err) {
      alert('Rescheduling failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Appointment Management & Schedule</h3>
            <p className="text-xs text-slate-500">Atomic slot reservation & conflict prevention</p>
          </div>
        </div>

        <button
          onClick={() => {
            setBookForm((prev) => ({ ...prev, doctor_id: doctors[0]?.id || '' }));
            setShowBookModal(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Date & Doctor Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800"
          />
        </div>

        {/* Doctor Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Doctor:</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800"
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO_SHOW</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.length > 0 ? (
          appointments.map((apt) => {
            const isConfirmed = apt.status === 'CONFIRMED';
            const isCompleted = apt.status === 'COMPLETED';
            const isCancelled = apt.status === 'CANCELLED';
            const isNoShow = apt.status === 'NO_SHOW';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900">{apt.patient_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-mono mb-2">{apt.patient_phone}</p>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
                      <span className="font-semibold">{apt.service_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.doctor_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.date} • {apt.time} ({apt.duration} mins)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setRescheduleData({ date: apt.date, time: apt.time, reason: '' });
                          setShowRescheduleModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reschedule
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'NO_SHOW')}
                        className="px-2 py-1 rounded-lg text-amber-600 hover:bg-amber-50 text-[11px] font-bold"
                      >
                        No-Show
                      </button>

                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {!isConfirmed && (
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      Recorded status: {apt.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No appointments scheduled for the selected date and doctor.
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-800">Book Patient Appointment</h4>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={bookForm.patient_name}
                  onChange={(e) => setBookForm({ ...bookForm, patient_name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  required
                  value={bookForm.patient_phone}
                  onChange={(e) => setBookForm({ ...bookForm, patient_phone: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor</label>
                  <select
                    value={bookForm.doctor_id}
                    onChange={(e) => setBookForm({ ...bookForm, doctor_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Available Time Slot</label>
                {availableSlots.length > 0 ? (
                  <select
                    value={bookForm.time}
                    onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-brand-700"
                  >
                    {availableSlots.map((s, idx) => (
                      <option key={idx} value={s.time}>{s.display_time} ({s.doctor_name})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-500 font-medium">No available slots on this date. Doctor might be on leave or fully booked.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableSlots.length === 0}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-800">Reschedule Appointment</h4>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5">
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{selectedAppointment.patient_name}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Time (e.g. 15:30)</label>
                <input
                  type="time"
                  required
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  placeholder="Patient requested next slot"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
