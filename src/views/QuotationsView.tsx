import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Subscription } from '../types';
import {
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Package,
  Layers,
  Calendar,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuotationsViewProps {
  onOpenCreateFromTemplate: (templateId?: string) => void;
  onSelectSubscription: (sub: Subscription) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  onOpenCreateFromTemplate,
  onSelectSubscription
}) => {
  const { subscriptions, templates, products, updateSubscriptionStatus } = useApp();

  // Quotation stage subscriptions
  const quotes = subscriptions.filter((s) => s.status === 'Quotation' || s.status === 'Draft');

  const handleConfirmQuote = async (sub: Subscription) => {
    const success = await updateSubscriptionStatus(sub.id, 'Confirmed');
    if (success) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Quotation Templates & Pending Offers
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {templates.length} Templates Available
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "Instead of building it from scratch, start from a quotation template that already has the right plan and product lines."
          </p>
        </div>

        <button
          onClick={() => onOpenCreateFromTemplate()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote from Template</span>
        </button>
      </div>

      {/* Quotation Templates Shelf */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Pre-Configured Quotation Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tmpl) => {
            const templateSubtotal = tmpl.lines.reduce(
              (acc, l) => acc + l.quantity * (l.unitPrice || 0),
              0
            );

            return (
              <div
                key={tmpl.id}
                className="rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 hover:border-purple-500/40 p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-purple-300">{tmpl.id}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      Valid {tmpl.validityDays} Days
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Included Product Lines ({tmpl.lines.length}):
                    </div>
                    {tmpl.lines.map((line, idx) => {
                      const prod = products.find((p) => p.id === line.productId);
                      const variant = prod?.variants.find((v) => v.id === line.variantId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/40 text-slate-300"
                        >
                          <span className="truncate max-w-[160px]">
                            {prod?.name || 'Software Product'}
                            {variant && variant.name !== 'Default' && (
                              <span className="text-[10px] text-purple-300 ml-1">
                                ({variant.name})
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-slate-400">
                            {line.quantity}x @ ${line.unitPrice}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Template Total</span>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      ${templateSubtotal.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenCreateFromTemplate(tmpl.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Pipeline: Open Quotes */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              Active Quotations Pending Customer Acceptance
            </h3>
            <p className="text-xs text-slate-400">
              Quotes awaiting customer confirmation before turning into active billing subscriptions.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {quotes.length} Quotes In Flight
          </span>
        </div>

        {quotes.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No pending quotes. Click "New Quote from Template" above to prepare an offer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-semibold">Quote ID</th>
                  <th className="py-3 px-3 font-semibold">Customer / Account</th>
                  <th className="py-3 px-3 font-semibold">Plan</th>
                  <th className="py-3 px-3 font-semibold">Terms</th>
                  <th className="py-3 px-3 font-semibold">Validity / Expiry</th>
                  <th className="py-3 px-3 font-semibold text-right">Offer Total</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {quotes.map((q) => {
                  const subTotal = q.lines.reduce((a, b) => a + b.quantity * b.unitPrice, 0);
                  return (
                    <tr
                      key={q.id}
                      onClick={() => onSelectSubscription(q)}
                      className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-purple-300">{q.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-100">{q.company}</div>
                        <div className="text-[11px] text-slate-400">{q.customerName}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-200">{q.planName}</td>
                      <td className="py-3 px-3 text-slate-400">{q.paymentTerms}</td>
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        Valid until {q.expiryDate}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        ${subTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {q.status === 'Quotation' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmQuote(q);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm Quote</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubscription(q);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          View Lines
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
    </div>
  );
};
