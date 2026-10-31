import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Subscription, SubscriptionStatus, ProductVariant } from '../types';
import {
  Plus,
  Repeat,
  CheckCircle,
  Play,
  Pause,
  XCircle,
  RotateCw,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  DollarSign,
  Tag,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionsViewProps {
  onOpenCreateWizard: () => void;
  onSelectSubscription: (sub: Subscription) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  onOpenCreateWizard,
  onSelectSubscription
}) => {
  const { subscriptions, updateSubscriptionStatus, plans } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const statuses: SubscriptionStatus[] = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch =
      sub.id.toLowerCase().includes(search.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
      sub.company.toLowerCase().includes(search.toLowerCase()) ||
      sub.planName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusTransition = async (
    sub: Subscription,
    newStatus: SubscriptionStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const success = await updateSubscriptionStatus(sub.id, newStatus);
    if (success && (newStatus === 'Active' || newStatus === 'Confirmed')) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Subscriptions & Quotations
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {subscriptions.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end subscription lifecycle: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Kanban / Table */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline Stepper
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={onOpenCreateWizard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription / Quote</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, Customer, Company, Plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter:</span>
          {['all', 'Draft', 'Quotation', 'Confirmed', 'Active', 'Closed', 'Paused'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode 1: Kanban Pipeline */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => {
            const subsInColumn = filteredSubs.filter((s) => s.status === status);
            return (
              <div
                key={status}
                className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-3 flex flex-col min-h-[460px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{status}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      {subsInColumn.length}
                    </span>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Subscriptions List in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {subsInColumn.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-500 italic">
                      No subscriptions
                    </div>
                  ) : (
                    subsInColumn.map((sub) => {
                      const totalSubValue = sub.lines.reduce(
                        (acc, l) => acc + l.quantity * l.unitPrice,
                        0
                      );
                      const plan = plans.find((p) => p.id === sub.planId);

                      return (
                        <div
                          key={sub.id}
                          onClick={() => onSelectSubscription(sub)}
                          className="group relative rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 p-3.5 shadow-md transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-indigo-300">
                              {sub.id}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">
                              {sub.billingFrequency}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                              {sub.company}
                            </h4>
                            <p className="text-[11px] text-slate-400">{sub.customerName}</p>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1 text-[11px]">
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400">Plan:</span>
                              <span className="font-medium truncate max-w-[120px]">{sub.planName}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400">Total Value:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                ${totalSubValue.toLocaleString()}
                              </span>
                            </div>
                            {sub.discountCode && (
                              <div className="flex justify-between text-amber-400">
                                <span>Discount:</span>
                                <span className="font-mono">{sub.discountCode}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Lifecycle Action Buttons */}
                          <div className="pt-1 flex items-center justify-end gap-1.5">
                            {status === 'Draft' && (
                              <button
                                onClick={(e) => handleStatusTransition(sub, 'Quotation', e)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1"
                              >
                                <span>To Quote</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {status === 'Quotation' && (
                              <button
                                onClick={(e) => handleStatusTransition(sub, 'Confirmed', e)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1"
                              >
                                <span>Confirm</span>
                                <CheckCircle className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {status === 'Confirmed' && (
                              <button
                                onClick={(e) => handleStatusTransition(sub, 'Active', e)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1"
                              >
                                <span>Activate</span>
                                <Play className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {status === 'Active' && (
                              <>
                                {plan?.canPause && (
                                  <button
                                    onClick={(e) => handleStatusTransition(sub, 'Paused', e)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all"
                                    title="Pause billing and service"
                                  >
                                    Pause
                                  </button>
                                )}
                                {plan?.canCloseEarly && (
                                  <button
                                    onClick={(e) => handleStatusTransition(sub, 'Closed', e)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-700/60 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-600/60 transition-all"
                                    title="Close early"
                                  >
                                    Close
                                  </button>
                                )}
                              </>
                            )}

                            {status === 'Closed' && plan?.canRenew && (
                              <button
                                onClick={(e) => handleStatusTransition(sub, 'Active', e)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1"
                              >
                                <RotateCw className="w-2.5 h-2.5" />
                                <span>Renew</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Detailed Table */
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 font-semibold">Subscription #</th>
                <th className="py-3 px-3 font-semibold">Customer / Account</th>
                <th className="py-3 px-3 font-semibold">Plan</th>
                <th className="py-3 px-3 font-semibold">Frequency</th>
                <th className="py-3 px-3 font-semibold">Start & Expiry</th>
                <th className="py-3 px-3 font-semibold">Terms</th>
                <th className="py-3 px-3 font-semibold text-right">Value</th>
                <th className="py-3 px-3 font-semibold text-center">Lifecycle Status</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubs.map((sub) => {
                const totalVal = sub.lines.reduce((a, b) => a + b.quantity * b.unitPrice, 0);
                return (
                  <tr
                    key={sub.id}
                    onClick={() => onSelectSubscription(sub)}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-indigo-300">{sub.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{sub.company}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{sub.planName}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-400">
                      {sub.billingFrequency}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {sub.startDate} &rarr; {sub.expiryDate}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{sub.paymentTerms}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      ${totalVal.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSubscription(sub);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
