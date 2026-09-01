import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Search, CheckCircle2, Edit2, Trash2, ShieldCheck, X } from 'lucide-react';
import { api } from '../services/api.js';

export function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Consultation & Pricing',
    question: '',
    answer: '',
    approved: true,
    is_active: true
  });

  const loadFaqs = async () => {
    try {
      const data = await api.getFaqs();
      setFaqs(data);
    } catch (err) {
      console.error('Failed to load FAQs', err);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        category: faq.category || 'Consultation & Pricing',
        question: faq.question,
        answer: faq.answer,
        approved: faq.approved !== false,
        is_active: faq.is_active !== false
      });
    } else {
      setEditingFaq(null);
      setFormData({
        category: 'Consultation & Pricing',
        question: '',
        answer: '',
        approved: true,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.updateFaq(editingFaq.id, formData);
      } else {
        await api.createFaq(formData);
      }
      setShowModal(false);
      await loadFaqs();
    } catch (err) {
      alert('Failed to save FAQ: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.deleteFaq(id);
      await loadFaqs();
    } catch (err) {
      alert('Failed to delete FAQ: ' + err.message);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Clinic-Approved Knowledge Base & FAQs</h3>
            <p className="text-xs text-slate-500">
              Only clinic-approved entries are shared by AI to guarantee zero hallucination
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Approved FAQ</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clinic FAQs by question, answer, category..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-2xl border border-slate-200 shadow-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {faq.category}
                </span>
                {faq.approved && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Clinic Approved
                  </span>
                )}
                {faq.source && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {faq.source}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-slate-900">{faq.question}</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {faq.answer}
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-start">
              <button
                onClick={() => handleOpenModal(faq)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-800">
                {editingFaq ? 'Edit FAQ' : 'Add Clinic Approved FAQ'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Consultation & Pricing"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="What is the consultation fee?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Clinic Approved Answer</label>
                <textarea
                  rows={4}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide precise clinic approved wording..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="approvedCheck"
                  checked={formData.approved}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="approvedCheck" className="text-xs font-medium text-slate-700">
                  Approved by Clinic Lead (Available to AI WhatsApp Bot)
                </label>
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
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Faqs;
