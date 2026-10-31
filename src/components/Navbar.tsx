import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Zap,
  RotateCcw,
  UserCheck,
  Shield,
  UserPlus,
  KeyRound,
  LogOut,
  ChevronDown,
  Building2,
  CalendarCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NavbarProps {
  onOpenBillingModal: () => void;
  onOpenAuthModal: (mode: 'signup' | 'forgot' | 'staff') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBillingModal,
  onOpenAuthModal
}) => {
  const {
    currentUser,
    users,
    switchUser,
    resetDatabase,
    subscriptions
  } = useApp();

  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Subscriptions due for billing
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCount = subscriptions.filter(
    (s) => s.status === 'Active' && (!s.lastBilledDate || s.nextBillingDate <= todayStr)
  ).length;

  const handleReset = async () => {
    if (window.confirm("Reset Brightloop system database to initial demo state?")) {
      await resetDatabase();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.1 } });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">brightloop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Billing OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Unified Subscription & Recurring Platform</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-2.5">
          {/* Billing Day Quick Action */}
          <button
            onClick={onOpenBillingModal}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all active:scale-95"
            title="Batch Billing Run for Due Subscriptions"
          >
            <CalendarCheck2 className="w-4 h-4 text-indigo-200" />
            <span className="hidden sm:inline">Billing Day Run</span>
            {dueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
                {dueCount} due
              </span>
            )}
          </button>

          {/* Quick Impersonation Switcher */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-slate-400 hidden md:inline">Role:</span>
              <span className="font-semibold text-white capitalize">{currentUser?.name || 'Guest'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-700 text-indigo-300">
                {currentUser?.role || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {switcherOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs"
                onClick={() => setSwitcherOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>

                <div className="py-1 space-y-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              u.role === 'admin'
                                ? 'bg-rose-500/20 text-rose-300'
                                : u.role === 'staff'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{u.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {u.company || u.department || u.email}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            u.role === 'admin'
                              ? 'bg-rose-900/50 text-rose-300'
                              : u.role === 'staff'
                              ? 'bg-amber-900/50 text-amber-300'
                              : 'bg-emerald-900/50 text-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Auth Shortcuts */}
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => onOpenAuthModal('staff')}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Onboard New Staff (Admin)</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenAuthModal('signup')}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Register New Customer Account</span>
                  </button>
                  <button
                    onClick={() => onOpenAuthModal('forgot')}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Reset Password Simulation</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset to Initial Brightloop Demo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
