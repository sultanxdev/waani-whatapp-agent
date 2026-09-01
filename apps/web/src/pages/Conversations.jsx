import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  User,
  Phone,
  Calendar,
  Sparkles,
  UserCheck,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';

export function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeConvData, setActiveConvData] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      const list = await api.getConversations();
      setConversations(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedConversation = async (id) => {
    if (!id) return;
    try {
      const data = await api.getConversation(id);
      setActiveConvData(data);
    } catch (err) {
      console.error('Failed to load conversation details', err);
    }
  };

  useEffect(() => {
    loadConversations();
    const timer = setInterval(loadConversations, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadSelectedConversation(selectedId);
    }
  }, [selectedId]);

  const handleTakeover = async () => {
    if (!selectedId) return;
    await api.takeoverConversation(selectedId);
    await loadSelectedConversation(selectedId);
    await loadConversations();
  };

  const handleRelease = async () => {
    if (!selectedId) return;
    await api.releaseConversation(selectedId);
    await loadSelectedConversation(selectedId);
    await loadConversations();
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      await api.sendStaffMessage(selectedId, replyText.trim());
      setReplyText('');
      await loadSelectedConversation(selectedId);
      await loadConversations();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const conv = activeConvData?.conversation;
  const messages = activeConvData?.messages || [];
  const lead = activeConvData?.lead;
  const appointments = activeConvData?.appointments || [];
  const handoffs = activeConvData?.handoffs || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8.5rem)] min-h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-12 h-full">
        {/* Left Column: Conversation List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Patient Enquiries</span>
            </h3>
            <button
              onClick={loadConversations}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((item) => {
              const isSelected = item.id === selectedId;
              const isPaused = item.ai_status === 'PAUSED';
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {item.patient_name || item.patient_phone}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.updated_at || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mb-1.5">{item.last_message || 'No messages'}</p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isPaused
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isPaused ? '🔴 Human Active' : '🟢 AI Active'}
                    </span>
                    {item.last_intent && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.last_intent}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat & Patient Context */}
        <div className="md:col-span-8 flex flex-col lg:flex-row h-full">
          {/* Middle: Chat Messages */}
          <div className="flex-1 flex flex-col h-full border-r border-slate-200">
            {conv ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                      {conv.patient_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{conv.patient_name}</h4>
                      <p className="text-[11px] text-slate-400">{conv.patient_phone}</p>
                    </div>
                  </div>

                  {/* Takeover / Release Controls */}
                  <div className="flex items-center gap-2">
                    {conv.ai_status === 'ACTIVE' ? (
                      <button
                        onClick={handleTakeover}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Take Over (Pause AI)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleRelease}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Return to AI</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 chat-bg">
                  {messages.map((m, idx) => {
                    const isCustomer = m.sender === 'CUSTOMER';
                    const isAI = m.sender === 'AI';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs ${
                            isCustomer
                              ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                              : isAI
                              ? 'bg-emerald-50 text-slate-800 rounded-tr-none border border-emerald-200'
                              : 'bg-brand-600 text-white rounded-tr-none'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 opacity-75 text-[10px] font-semibold">
                            {isCustomer ? (
                              <span>{conv.patient_name}</span>
                            ) : isAI ? (
                              <span className="flex items-center gap-1 text-emerald-800">
                                <Sparkles className="w-3 h-3" /> AI Assistant
                              </span>
                            ) : (
                              <span>Receptionist ({m.sender_name || 'Staff'})</span>
                            )}
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                          <span className="block text-[9px] text-right mt-1 opacity-60">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Bar */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={conv.ai_status === 'ACTIVE' ? 'AI is replying automatically (or type to send manual staff message)...' : 'Type WhatsApp message to patient...'}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a conversation to inspect messages
              </div>
            )}
          </div>

          {/* Context Sidebar */}
          {conv && (
            <div className="w-full lg:w-72 bg-slate-50/70 p-4 border-t lg:border-t-0 border-slate-200 overflow-y-auto space-y-4">
              <div>
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Profile</h5>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="font-semibold text-slate-800">{conv.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-mono text-slate-800">{conv.patient_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI State</span>
                    <span className="font-semibold text-brand-600">{conv.stage}</span>
                  </div>
                </div>
              </div>

              {lead && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lead Details</h5>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service</span>
                      <span className="font-semibold text-slate-800">{lead.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold text-[10px]">
                        {lead.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {appointments.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Appointments</h5>
                  <div className="space-y-2">
                    {appointments.map((a) => (
                      <div key={a.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{a.service_name}</span>
                          <span className="text-[10px] text-emerald-600">{a.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {a.date} at {a.time} ({a.doctor_name})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {handoffs.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-2">Handoff Alerts</h5>
                  <div className="space-y-2">
                    {handoffs.map((h) => (
                      <div key={h.id} className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
                        <span className="font-bold text-rose-700 text-[10px] uppercase">Reason</span>
                        <p className="text-rose-800 text-xs leading-relaxed">{h.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Conversations;
