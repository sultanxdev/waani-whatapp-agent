const API_BASE = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProfile: () => apiFetch('/auth/me'),

  // Overview / Analytics
  getAnalytics: () => apiFetch('/analytics'),

  // Leads
  getLeads: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/leads?${query}`);
  },
  getLead: (id) => apiFetch(`/leads/${id}`),
  createLead: (data) => apiFetch('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => apiFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLead: (id) => apiFetch(`/leads/${id}`, { method: 'DELETE' }),

  // Appointments & Slots
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/appointments?${query}`);
  },
  getSlots: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/appointments/slots?${query}`);
  },
  createAppointment: (data) => apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  rescheduleAppointment: (id, data) => apiFetch(`/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify(data) }),
  cancelAppointment: (id, data) => apiFetch(`/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status) => apiFetch(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Conversations
  getConversations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/conversations?${query}`);
  },
  getConversation: (id) => apiFetch(`/conversations/${id}`),
  takeoverConversation: (id) => apiFetch(`/conversations/${id}/takeover`, { method: 'POST' }),
  releaseConversation: (id) => apiFetch(`/conversations/${id}/release`, { method: 'POST' }),
  sendStaffMessage: (id, text) => apiFetch(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Clinic Knowledge
  getClinic: () => apiFetch('/clinic'),
  updateClinic: (data) => apiFetch('/clinic', { method: 'PATCH', body: JSON.stringify(data) }),
  getDoctors: () => apiFetch('/doctors'),
  createDoctor: (data) => apiFetch('/doctors', { method: 'POST', body: JSON.stringify(data) }),
  updateDoctor: (id, data) => apiFetch(`/doctors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDoctor: (id) => apiFetch(`/doctors/${id}`, { method: 'DELETE' }),

  getServices: () => apiFetch('/services'),
  createService: (data) => apiFetch('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteService: (id) => apiFetch(`/services/${id}`, { method: 'DELETE' }),

  getFaqs: () => apiFetch('/faqs'),
  createFaq: (data) => apiFetch('/faqs', { method: 'POST', body: JSON.stringify(data) }),
  updateFaq: (id, data) => apiFetch(`/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFaq: (id) => apiFetch(`/faqs/${id}`, { method: 'DELETE' }),

  // Google Docs Sync Live Dashboard
  getGoogleDocsStatus: () => apiFetch('/google-docs/status'),
  toggleGoogleDocsSync: (enabled) => apiFetch('/google-docs/toggle', { method: 'POST', body: JSON.stringify({ enabled }) }),
  syncGoogleDocsNow: (docId) => apiFetch('/google-docs/sync', { method: 'POST', body: JSON.stringify({ docId }) }),
  exportLiveSheet: () => apiFetch('/google-docs/export'),
  getAuditLogs: () => apiFetch('/audit-logs'),

  // Simulator
  simulateMessage: (data) => apiFetch('/simulator/message', { method: 'POST', body: JSON.stringify(data) }),
  getSimulation: (phone) => apiFetch(`/simulator/conversation?phone=${encodeURIComponent(phone)}`),
  resetSimulation: (phone) => apiFetch('/simulator/reset', { method: 'POST', body: JSON.stringify({ phone }) })
};

export default api;
