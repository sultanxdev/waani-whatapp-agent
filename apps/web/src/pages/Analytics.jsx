import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CalendarCheck, UserX, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overview = data?.overview || {};
  const rates = data?.rates || {};
  const sourceBreakdown = data?.sourceBreakdown || [];
  const serviceBreakdown = data?.serviceBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Clinic Analytics & Performance Metrics</h3>
            <p className="text-xs text-slate-500">
              PRD standard conversion rates and attribution tracking
            </p>
          </div>
        </div>
      </div>

      {/* KPI Rate Formula Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Qualification Rate</span>
          <div className="text-3xl font-extrabold text-teal-600">{rates.qualificationRate || '0.0%'}</div>
          <p className="text-[11px] text-slate-400">Qualified Leads / Total Inquiries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Booking Rate</span>
          <div className="text-3xl font-extrabold text-brand-600">{rates.bookingRate || '0.0%'}</div>
          <p className="text-[11px] text-slate-400">Booked Appointments / Total Leads</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Completion Rate</span>
          <div className="text-3xl font-extrabold text-emerald-600">{rates.completionRate || '0.0%'}</div>
          <p className="text-[11px] text-slate-400">Completed / Total Booked</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">No-Show Rate</span>
          <div className="text-3xl font-extrabold text-amber-600">{rates.noShowRate || '0.0%'}</div>
          <p className="text-[11px] text-slate-400">No-Shows / Total Booked</p>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Attribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-slate-800 mb-4">Lead Source Attribution</h4>
          <div className="space-y-3">
            {sourceBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{item.name}</span>
                  <span>{item.count} leads</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.count * 20)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Popularity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-slate-800 mb-4">Treatment Demand Distribution</h4>
          <div className="space-y-3">
            {serviceBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="shrink-0">{item.count} enquiries</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
