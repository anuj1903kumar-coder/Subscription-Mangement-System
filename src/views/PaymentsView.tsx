import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Building,
  CheckCircle2,
  Receipt,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface PaymentsViewProps {
  onOpenRecordPayment: (invoiceId?: string) => void;
  onSelectInvoice: (invoiceId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenRecordPayment,
  onSelectInvoice
}) => {
  const { payments, invoices, metrics } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = selectedMethod === 'all' || p.method === selectedMethod;
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNote && p.referenceNote.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMethod && matchesSearch;
  });

  const paymentMethods: PaymentMethod[] = [
    'Bank Transfer',
    'Credit Card',
    'ACH',
    'Cash',
    'UPI'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Payments & Collections Ledger
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              ${metrics?.totalCollectedRevenue.toLocaleString()} Reconciled
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "Each payment recorded with its method, amount, date and note against the right invoice."
          </p>
        </div>

        <button
          onClick={() => onOpenRecordPayment()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Incoming Payment</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Payments Recorded</span>
            <div className="text-xl font-bold text-white mt-1">{payments.length} Transactions</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cash Inflows Reconciled</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              ${metrics?.totalCollectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Remaining Outstanding</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              ${metrics?.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payments by invoice, client, note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium">Method:</span>
          {['all', ...paymentMethods].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMethod(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedMethod === m
                  ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 font-semibold">Payment ID</th>
              <th className="py-3 px-3 font-semibold">Invoice Ref</th>
              <th className="py-3 px-3 font-semibold">Customer / Account</th>
              <th className="py-3 px-3 font-semibold">Method</th>
              <th className="py-3 px-3 font-semibold">Date Received</th>
              <th className="py-3 px-3 font-semibold">Reference Memo / Note</th>
              <th className="py-3 px-3 font-semibold text-right">Amount Paid</th>
              <th className="py-3 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No payment records found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-sky-300">{p.id}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-indigo-300">
                    <button
                      onClick={() => onSelectInvoice(p.invoiceId)}
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>{p.invoiceNumber}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-500" />
                    </button>
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-medium">{p.customerName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{p.date}</td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] italic">
                    {p.referenceNote || '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    +${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectInvoice(p.invoiceId)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
