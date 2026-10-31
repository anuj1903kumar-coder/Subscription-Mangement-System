import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import {
  CreditCard,
  X,
  DollarSign,
  Calendar,
  Building,
  CheckCircle2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecordPaymentModalProps {
  isOpen: boolean;
  initialInvoiceId?: string | null;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  initialInvoiceId,
  onClose
}) => {
  const { invoices, recordPayment } = useApp();

  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNote, setReferenceNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialInvoiceId) {
      setSelectedInvoiceId(initialInvoiceId);
      const inv = invoices.find((i) => i.id === initialInvoiceId);
      if (inv) {
        setAmount(inv.balanceDue);
      }
    } else if (unpaidInvoices.length > 0) {
      setSelectedInvoiceId(unpaidInvoices[0].id);
      setAmount(unpaidInvoices[0].balanceDue);
    }
  }, [initialInvoiceId, isOpen]);

  if (!isOpen) return null;

  const currentInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setAmount(inv.balanceDue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || amount <= 0) return;

    setSubmitting(true);
    try {
      const ok = await recordPayment({
        invoiceId: selectedInvoiceId,
        amount: Number(amount),
        method,
        date,
        referenceNote
      });

      if (ok) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Record Incoming Payment</h3>
            <p className="text-xs text-slate-400">Match transaction against invoice receivables.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Target Invoice</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            >
              {unpaidInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.company} (Balance: ${inv.balanceDue.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {currentInvoice && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Invoice Billed:</span>
                <span className="font-mono">${currentInvoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Previously Collected:</span>
                <span className="font-mono text-emerald-400">${currentInvoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-700">
                <span>Remaining Balance Due:</span>
                <span className="font-mono text-amber-400">${currentInvoice.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Payment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              max={currentInvoice?.balanceDue || 999999}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold"
            />
            <p className="text-[10px] text-slate-500 mt-1">Supports full or partial installment payment.</p>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Payment Method</label>
              <select
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Bank Transfer">Bank Transfer (Wire)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="ACH">ACH Direct Debit</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / Digital Wallet</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Payment Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
              </input>
            </div>
          </div>

          {/* Reference / Transaction Memo */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Transaction Reference / Note</label>
            <input
              type="text"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="e.g. Wire confirmation #CHASE-99218 or Card Auth"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Reconcile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
