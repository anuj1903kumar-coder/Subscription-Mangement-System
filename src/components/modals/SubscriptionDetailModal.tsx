import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../StatusBadge';
import { Subscription, SubscriptionStatus } from '../../types';
import {
  X,
  Repeat,
  CheckCircle,
  Play,
  Pause,
  XCircle,
  RotateCw,
  Building,
  Calendar,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionDetailModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onSelectInvoice: (invoiceId: string) => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  onClose,
  onSelectInvoice
}) => {
  const { updateSubscriptionStatus, plans, invoices } = useApp();

  if (!subscription) return null;

  const plan = plans.find((p) => p.id === subscription.planId);
  const relatedInvoices = invoices.filter((i) => i.subscriptionId === subscription.id);
  const totalSubValue = subscription.lines.reduce((a, b) => a + b.quantity * b.unitPrice, 0);

  const statuses: SubscriptionStatus[] = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
  const currentIndex = statuses.indexOf(subscription.status as any);

  const handleTransition = async (newStatus: SubscriptionStatus) => {
    const success = await updateSubscriptionStatus(subscription.id, newStatus);
    if (success && (newStatus === 'Active' || newStatus === 'Confirmed')) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-indigo-400">
                {subscription.id}
              </span>
              <StatusBadge status={subscription.status} />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                {subscription.billingFrequency}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-2">{subscription.company}</h2>
            <p className="text-xs text-slate-400">
              Account Lead: {subscription.customerName} ({subscription.customerEmail})
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase font-semibold text-slate-500">Contract Value</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ${totalSubValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* LIFECYCLE PROGRESS PIPELINE STEPPER */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Subscription Lifecycle Stage:
          </div>

          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
            {statuses.map((st, i) => {
              const isPast = currentIndex >= i;
              const isCurrent = subscription.status === st;

              return (
                <div key={st} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isPast && !isCurrent ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold ${
                      isCurrent
                        ? 'text-indigo-300 font-bold'
                        : isPast
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Transition Actions Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium">Available Lifecycle Actions:</span>
          <div className="flex items-center gap-2">
            {subscription.status === 'Draft' && (
              <button
                onClick={() => handleTransition('Quotation')}
                className="px-3 py-1.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1"
              >
                <span>Submit as Quotation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {subscription.status === 'Quotation' && (
              <button
                onClick={() => handleTransition('Confirmed')}
                className="px-3 py-1.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Customer Confirmed</span>
              </button>
            )}

            {subscription.status === 'Confirmed' && (
              <button
                onClick={() => handleTransition('Active')}
                className="px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Activate Subscription</span>
              </button>
            )}

            {subscription.status === 'Active' && (
              <>
                {plan?.canPause && (
                  <button
                    onClick={() => handleTransition('Paused')}
                    className="px-3 py-1.5 rounded-xl font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                )}
                {plan?.canCloseEarly && (
                  <button
                    onClick={() => handleTransition('Closed')}
                    className="px-3 py-1.5 rounded-xl font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Close Contract Early</span>
                  </button>
                )}
              </>
            )}

            {subscription.status === 'Closed' && plan?.canRenew && (
              <button
                onClick={() => handleTransition('Active')}
                className="px-3 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Renew Subscription</span>
              </button>
            )}
          </div>
        </div>

        {/* Schedule & Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500">Plan</span>
            <div className="font-semibold text-slate-200 mt-0.5 truncate">{subscription.planName}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500">Start Date</span>
            <div className="font-mono font-semibold text-slate-200 mt-0.5">{subscription.startDate}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500">Expiry Date</span>
            <div className="font-mono font-semibold text-slate-200 mt-0.5">{subscription.expiryDate}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500">Payment Terms</span>
            <div className="font-semibold text-slate-200 mt-0.5">{subscription.paymentTerms}</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contract Product Lines ({subscription.lines.length}):
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product & Variant</th>
                  <th className="py-2.5 px-3 text-center">Seats / Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscription.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 text-slate-200">
                      <div className="font-semibold">{l.productName}</div>
                      <div className="text-[11px] text-indigo-300">{l.variantName || 'Standard Edition'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{l.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">${l.unitPrice}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                      ${(l.quantity * l.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Related Invoices History */}
        {relatedInvoices.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              Generated Recurring Invoices ({relatedInvoices.length}):
            </div>
            <div className="space-y-1.5">
              {relatedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => {
                    onClose();
                    onSelectInvoice(inv.id);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-300">{inv.invoiceNumber}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({inv.periodStart} &rarr; {inv.periodEnd})</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">
                      ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
