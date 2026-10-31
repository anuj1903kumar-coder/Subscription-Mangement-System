import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck2,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BillingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInvoice: (invoiceId: string) => void;
}

export const BillingDayModal: React.FC<BillingDayModalProps> = ({
  isOpen,
  onClose,
  onSelectInvoice
}) => {
  const { subscriptions, runBillingDay } = useApp();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [forceAll, setForceAll] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const dueSubs = activeSubs.filter(
    (s) => !s.lastBilledDate || s.nextBillingDate <= todayStr
  );

  const handleRunBilling = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await runBillingDay(forceAll);
      setResult(res);
      if (res && res.billedCount > 0) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Automated "Billing Day" Engine</h3>
            <p className="text-xs text-slate-400">
              Batch processing for hundreds of recurring accounts simultaneously.
            </p>
          </div>
        </div>

        {/* Scene description from challenge */}
        <div className="my-4 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200/90 leading-relaxed space-y-1">
          <p className="font-semibold text-indigo-300">
            Brightloop Problem Statement Requirement:
          </p>
          <p>
            "Nobody should be typing invoices by hand. Each one should be created from its subscription, with customer details, product lines, taxes and totals already filled in. Nothing should be billed twice or skipped."
          </p>
        </div>

        {/* Current due analysis */}
        <div className="grid grid-cols-2 gap-3 my-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-slate-400">Active Subscriptions:</span>
            <div className="text-lg font-bold text-white mt-0.5">{activeSubs.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-slate-400">Due for Billing Today:</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{dueSubs.length} due</div>
          </div>
        </div>

        {/* Idempotency Protection Note */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 my-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-300">Strict Anti-Double-Billing Guard Active</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Subscriptions already invoiced for their current billing interval are skipped automatically to eliminate duplicate billing errors.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer my-2">
          <input
            type="checkbox"
            checked={forceAll}
            onChange={(e) => setForceAll(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-indigo-600"
          />
          <span>Force billing run on all active accounts (Demo simulation mode)</span>
        </label>

        {/* Execution Output */}
        {result && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Billing Run Execution Summary:
              </span>
              <span className="font-mono text-slate-400">
                {result.billedCount} Invoiced &bull; {result.skippedCount} Skipped
              </span>
            </div>

            {result.invoices && result.invoices.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                {result.invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onClose();
                      onSelectInvoice(inv.id);
                    }}
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-300 mr-2">{inv.invoiceNumber}</span>
                      <span className="font-medium text-slate-200">{inv.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">
                        ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close
          </button>
          <button
            disabled={running}
            onClick={handleRunBilling}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {running ? (
              <span>Processing Billing...</span>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute Billing Day Run</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
