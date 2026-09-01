import React from 'react';
import { Menu, Smartphone, Bell, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Header({ onMenuClick, onOpenSimulator, pendingHandoffCount = 0 }) {
  const { user, clinic } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {clinic?.name || 'DermaCare Skin & Laser Clinic'}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            Gurugram • AI WhatsApp Assistant Active
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick WhatsApp Simulator Launcher */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Launch WhatsApp Simulator</span>
        </button>

        {/* Handoff Alert Pill */}
        {pendingHandoffCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{pendingHandoffCount} Handoff Req</span>
          </div>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-slate-800 leading-tight">{user?.name || 'Staff User'}</p>
            <p className="text-slate-400 font-medium">{user?.role || 'RECEPTIONIST'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
