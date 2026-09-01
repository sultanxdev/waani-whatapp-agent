import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  Zap
} from 'lucide-react';
import { api } from '../services/api.js';

const QUICK_TEST_PROMPTS = [
  { label: '👋 Greeting', text: 'Hi, good morning' },
  { label: '💰 Acne Treatment Fee', text: 'Acne treatment fee kitni hai?' },
  { label: '💆 PRP Hair Loss Cost', text: 'What is the cost of PRP hair therapy?' },
  { label: '📅 Book Appointment', text: 'I want to book an appointment with dermatologist today' },
  { label: '⏰ Select Slot (2:30 PM)', text: '2:30 PM' },
  { label: '🏥 Timings & Location', text: 'Clinic address kahan hai?' },
  { label: '🚨 Medical Question (Safe)', text: 'Mere acne ke liye kaunsi medicine lu?' },
  { label: '👨‍⚕️ Speak to Doctor', text: 'Mujhe doctor se baat karni hai' },
  { label: '⚠️ Emergency Signal', text: 'Emergency! severe allergic reaction and throat swelling' }
];

export function WhatsAppSimulator() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+919876543299');
  const [userName, setUserName] = useState('Rahul Test');
  const [loading, setLoading] = useState(false);
  const [lastEngineResult, setLastEngineResult] = useState(null);
  const chatBottomRef = useRef(null);

  const loadConversation = async () => {
    try {
      const data = await api.getSimulation(phoneNumber);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Initial welcome bot greeting
        setMessages([
          {
            sender: 'AI',
            text: 'Namaste! Welcome to DermaCare Skin, Hair & Laser Clinic WhatsApp Assistant.\n\nHow can I help you today? You can ask about consultation fees, treatments, or book an appointment.',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading simulation', err);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [phoneNumber]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    // Optimistic customer message
    const userMsg = {
      sender: 'CUSTOMER',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.simulateMessage({
        phone: phoneNumber,
        name: userName,
        text: text.trim()
      });

      setLastEngineResult(res.engine_result);

      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else if (res.engine_result?.response_text) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'AI',
            text: res.engine_result.response_text,
            buttons: res.engine_result.buttons,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation(phoneNumber);
      setLastEngineResult(null);
      setMessages([
        {
          sender: 'AI',
          text: 'Namaste! Welcome to DermaCare Skin, Hair & Laser Clinic WhatsApp Assistant.\n\nHow can I help you today?',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Interactive WhatsApp Sandbox & Simulator</h3>
            <p className="text-xs text-slate-500">
              Live testing playground for WhatsApp Cloud API webhooks, intent engine, and appointment booking
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Test Prompt Toolbar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>One-Click Test Scenarios</span>
            </h4>
            <p className="text-xs text-slate-500">
              Click any scenario to instantly send customer messages and test AI guardrails:
            </p>

            <div className="space-y-2">
              {QUICK_TEST_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-xs font-medium text-slate-700 hover:text-brand-900 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{prompt.label}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-brand-600 font-bold shrink-0">Send →</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Decision Inspector */}
          {lastEngineResult && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>AI Engine Decision Inspector</span>
              </h5>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl text-[11px] font-mono space-y-1 overflow-x-auto">
                <p><span className="text-emerald-400">Intent:</span> {lastEngineResult.intent}</p>
                <p><span className="text-blue-400">Stage:</span> {lastEngineResult.stage}</p>
                {lastEngineResult.handoff_id && (
                  <p><span className="text-rose-400">Handoff ID:</span> {lastEngineResult.handoff_id}</p>
                )}
                {lastEngineResult.appointment && (
                  <p><span className="text-teal-400">Booked ID:</span> {lastEngineResult.appointment.id}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Device Frame */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800">
            {/* Phone Screen */}
            <div className="bg-[#efeae2] rounded-[2rem] overflow-hidden flex flex-col h-[580px] shadow-inner">
              {/* WhatsApp Header */}
              <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <ArrowLeft className="w-4 h-4 cursor-pointer" />
                  <div className="w-8 h-8 rounded-full bg-brand-200 text-brand-900 flex items-center justify-center font-bold text-xs">
                    DC
                  </div>
                  <div>
                    <h5 className="font-bold text-xs tracking-wide">DermaCare Clinic</h5>
                    <p className="text-[10px] text-emerald-200">Official WhatsApp Business</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="w-3.5 h-3.5" />
                  <Video className="w-3.5 h-3.5" />
                  <MoreVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 chat-bg">
                {messages.map((m, idx) => {
                  const isCustomer = m.sender === 'CUSTOMER';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-xs ${
                          isCustomer
                            ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none'
                            : 'bg-white text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                        {/* Interactive Buttons */}
                        {m.buttons && m.buttons.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                            {m.buttons.map((btn, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleSendMessage(btn)}
                                className="w-full text-center py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] transition-colors"
                              >
                                {btn}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isCustomer && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 px-3 py-1.5 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    <span>DermaCare AI is typing...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Bar */}
              <div className="p-2 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type WhatsApp message..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-full bg-white border-0 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || loading}
                  className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#068f70] text-white disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppSimulator;
