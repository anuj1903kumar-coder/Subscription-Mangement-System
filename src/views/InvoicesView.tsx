import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Invoice, InvoiceStatus } from '../types';
import {
  Receipt,
  CalendarCheck2,
  Send,
  Printer,
  CreditCard,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InvoicesViewProps {
  onOpenBillingBatchModal: () => void;
  onSelectInvoice: (invoiceId: string) => void;
  onOpenRecordPayment: (invoiceId?: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenBillingBatchModal,
  onSelectInvoice,
  onOpenRecordPayment
}) => {
  const { invoices, updateInvoiceStatus, sendInvoice } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const filteredInvoices = invoices.filter((inv) => {
    const isOverdue = inv.status === 'Confirmed' && inv.dueDate < today;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'Overdue'
        ? isOverdue
        : inv.status === statusFilter;

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subscriptionId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleConfirm = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateInvoiceStatus(inv.id, 'Confirmed');
  };

  const handleCancel = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to cancel invoice ${inv.invoiceNumber}?`)) {
      await updateInvoiceStatus(inv.id, 'Cancelled');
    }
  };

  const handleSend = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    await sendInvoice(inv.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Invoicing & Billing Engine
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {invoices.length} Invoices
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated recurring generation with anti-double-billing protection, tax calculations, and payment tracking.
          </p>
        </div>

        <button
          onClick={onOpenBillingBatchModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Run Billing Day Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, customer, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium">Filter:</span>
          {['all', 'Draft', 'Confirmed', 'Overdue', 'Paid', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 font-semibold">Invoice #</th>
              <th className="py-3 px-3 font-semibold">Customer / Account</th>
              <th className="py-3 px-3 font-semibold">Subscription Ref</th>
              <th className="py-3 px-3 font-semibold">Billing Period</th>
              <th className="py-3 px-3 font-semibold">Due Date</th>
              <th className="py-3 px-3 font-semibold text-right">Tax (Rules)</th>
              <th className="py-3 px-3 font-semibold text-right">Total Amount</th>
              <th className="py-3 px-3 font-semibold text-right">Balance Due</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isOverdue = inv.status === 'Confirmed' && inv.dueDate < today;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv.id)}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-indigo-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{inv.company}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerName}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {inv.subscriptionId}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      {inv.periodStart} &rarr; {inv.periodEnd}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {inv.taxRate}% (${inv.taxAmount.toFixed(2)})
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                      ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {inv.balanceDue > 0 ? (
                        <span className={isOverdue ? 'text-rose-400' : 'text-amber-300'}>
                          ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-emerald-400">$0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={inv.status} isOverdue={isOverdue} />
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      {inv.status === 'Draft' && (
                        <button
                          onClick={(e) => handleConfirm(inv, e)}
                          className="px-2 py-1 rounded-lg text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                          title="Confirm Draft Invoice"
                        >
                          Confirm
                        </button>
                      )}

                      <button
                        onClick={(e) => handleSend(inv, e)}
                        className="px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center gap-1"
                        title="Send via Email"
                      >
                        <Send className="w-3 h-3 text-indigo-400" />
                        <span>Send</span>
                      </button>

                      {inv.balanceDue > 0 && inv.status !== 'Draft' && inv.status !== 'Cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRecordPayment(inv.id);
                          }}
                          className="px-2 py-1 rounded-lg text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors inline-flex items-center gap-1"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInvoice(inv.id);
                        }}
                        className="px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-3 h-3" />
                      </button>

                      {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                        <button
                          onClick={(e) => handleCancel(inv, e)}
                          className="px-2 py-1 rounded-lg text-xs bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40"
                          title="Cancel Invoice"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
