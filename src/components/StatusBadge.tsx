import React from 'react';
import { SubscriptionStatus, InvoiceStatus } from '../types';

interface StatusBadgeProps {
  status: SubscriptionStatus | InvoiceStatus | string;
  isOverdue?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOverdue }) => {
  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        OVERDUE
      </span>
    );
  }

  const getStyle = () => {
    switch (status) {
      // Subscriptions
      case 'Draft':
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
      case 'Quotation':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Confirmed':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Active':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Closed':
        return 'bg-slate-800/80 text-slate-400 border-slate-700/60';
      case 'Paused':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';

      // Invoices
      case 'Paid':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-red-500/15 text-red-400 border-red-500/30';

      // General
      case 'active':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'depleted':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'expired':
        return 'bg-slate-800 text-slate-400 border-slate-700';

      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Active':
      case 'Paid':
      case 'active':
        return 'bg-emerald-400';
      case 'Quotation':
        return 'bg-purple-400';
      case 'Confirmed':
      case 'depleted':
        return 'bg-amber-400';
      case 'Paused':
        return 'bg-blue-400';
      case 'Cancelled':
      case 'expired':
        return 'bg-red-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`}></span>
      {status}
    </span>
  );
};
