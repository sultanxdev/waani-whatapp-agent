import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  CalendarCheck,
  AlertCircle,
  Clock,
  TrendingUp,
  UserX,
  ArrowUpRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { api } from '../services/api.js';

export function Overview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const overview = data?.overview || {
    totalEnquiries: 24,
    qualifiedLeads: 16,
    totalBookedAppointments: 10,
    confirmedAppointments: 8,
    completedAppointments: 6,
    pendingHandoffs: 2,
    noShowAppointments: 1
  };

  const rates = data?.rates || {
    qualificationRate: '66.7%',
    bookingRate: '41.7%',
    completionRate: '60.0%',
    conversionRate: '41.7%'
  };

  const statCards = [
    {
      title: "Today's Enquiries",
      value: overview.totalEnquiries,
      subtext: 'WhatsApp Inbound',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      nav: 'conversations'
    },
    {
      title: 'Qualified Leads',
      value: overview.qualifiedLeads,
      subtext: `Qual. Rate: ${rates.qualificationRate}`,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      nav: 'leads'
    },
    {
      title: 'Booked Appointments',
      value: overview.totalBookedAppointments,
      subtext: `Booking Rate: ${rates.bookingRate}`,
      icon: CalendarCheck,
      color: 'from-brand-500 to-brand-700',
      bgColor: 'bg-brand-50',
      textColor: 'text-brand-700',
      nav: 'appointments'
    },
    {
      title: 'Human Handoffs Required',
      value: overview.pendingHandoffs,
      subtext: 'Medical & Staff requests',
      icon: AlertCircle,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      nav: 'conversations',
      alert: overview.pendingHandoffs > 0
    },
    {
      title: 'Completed Consultations',
      value: overview.completedAppointments,
      subtext: `Completion: ${rates.completionRate}`,
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-700',
      nav: 'appointments'
    },
    {
      title: 'No-Shows Recorded',
      value: overview.noShowAppointments,
      subtext: 'Requires automated reminder',
      icon: UserX,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      nav: 'appointments'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 inline-flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            AI Autonomous Mode Active
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            WhatsApp Lead & Appointment Automation
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Grounded AI handling patient triage, pricing, FAQs, and instant doctor booking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('simulator')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Test AI Simulator
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(card.nav)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-slate-500 flex items-center gap-1 group-hover:text-brand-600 transition-colors">
                  <span>{card.subtext}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Funnel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center justify-between">
            <span>Lead Conversion Funnel</span>
            <span className="text-xs font-medium text-slate-500">Live Statistics</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>1. Inbound WhatsApp Enquiries</span>
                <span>{overview.totalEnquiries} (100%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>2. Qualified Leads</span>
                <span>{overview.qualifiedLeads} ({rates.qualificationRate})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: rates.qualificationRate }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>3. Confirmed Appointments</span>
                <span>{overview.totalBookedAppointments} ({rates.bookingRate})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: rates.bookingRate }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>4. Completed Treatments</span>
                <span>{overview.completedAppointments} ({rates.completionRate})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: rates.completionRate }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 mb-3">Clinic Action Center</h3>
            <p className="text-xs text-slate-500 mb-4">
              Instant controls to monitor AI conversations and jump into human takeover.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('conversations')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Human Handoff Queue</p>
                  <p className="text-slate-500">{overview.pendingHandoffs} conversations waiting for staff</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('appointments')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Today's Doctor Schedule</p>
                  <p className="text-slate-500">Dr. Ananya & Dr. Vikram available</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Google Docs & Knowledge Sync</p>
                  <p className="text-emerald-600 font-medium">Sync status: Active</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Meta WhatsApp Business Cloud API v19.0 Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
