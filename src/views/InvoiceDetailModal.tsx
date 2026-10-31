import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Printer,
  Send,
  CreditCard,
  CheckCircle2,
  X,
  Layers,
  Calendar,
  Building,
  Mail,
  MapPin,
  ShieldCheck
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoiceId: string | null;
  onClose: () => void;
  onOpenRecordPayment: (invoiceId: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoiceId,
  onClose,
  onOpenRecordPayment
}) => {
  const { invoices, payments, updateInvoiceStatus, sendInvoice } = useApp();

  if (!invoiceId) return null;

  const invoice = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
  if (!invoice) return null;

  const invoicePayments = payments.filter((p) => p.invoiceId === invoice.id);
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = invoice.status === 'Confirmed' && invoice.dueDate < today;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirm = async () => {
    await updateInvoiceStatus(invoice.id, 'Confirmed');
  };

  const handleSend = async () => {
    await sendInvoice(invoice.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-indigo-400">
              {invoice.invoiceNumber}
            </span>
            <StatusBadge status={invoice.status} isOverdue={isOverdue} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {invoice.status === 'Draft' && (
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm</span>
              </button>
            )}

            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>

            {invoice.balanceDue > 0 && invoice.status !== 'Draft' && (
              <button
                onClick={() => onOpenRecordPayment(invoice.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-8 bg-slate-900 text-slate-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">brightloop</span>
              </div>
              <div className="text-xs text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-300">Brightloop Software Corp.</p>
                <p>100 Innovation Boulevard, Suite 500</p>
                <p>San Francisco, CA 94107, USA</p>
                <p>tax-id: US-EIN-94-2819024</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Commercial Invoice
              </div>
              <div className="text-2xl font-mono font-bold text-white tracking-tight">
                {invoice.invoiceNumber}
              </div>
              <p className="text-xs text-slate-400">
                Subscription: <span className="font-mono text-slate-300">{invoice.subscriptionId}</span>
              </p>
              <p className="text-xs text-slate-400">
                Billing Cycle: <span className="font-mono text-slate-300">{invoice.periodStart} to {invoice.periodEnd}</span>
              </p>
            </div>
          </div>

          {/* Bill To & Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Billed To (Customer):
              </span>
              <div className="font-bold text-sm text-white">{invoice.company}</div>
              <p className="text-slate-300">{invoice.customerName}</p>
              <p className="text-slate-400">{invoice.customerEmail}</p>
              <p className="text-slate-400 mt-1">{invoice.billingAddress}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Invoice Terms & Schedule:
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-slate-400">Issue Date:</span>
                  <div className="font-semibold font-mono text-slate-200">{invoice.issueDate}</div>
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span>
                  <div className={`font-semibold font-mono ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                    {invoice.dueDate}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Payment Terms:</span>
                  <div className="font-semibold text-slate-200">{invoice.paymentTerms}</div>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <div className="font-semibold capitalize text-indigo-300">{invoice.status}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Watermark Stamp Overlay */}
          {invoice.status === 'Paid' && (
            <div className="my-2 p-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div className="text-center">
                <span className="text-emerald-400 font-extrabold tracking-widest uppercase text-sm">
                  PAID IN FULL — RECONCILED
                </span>
                <p className="text-[11px] text-emerald-300/80">Thank you for your business.</p>
              </div>
            </div>
          )}

          {isOverdue && (
            <div className="my-2 p-3 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center gap-3">
              <div className="text-center">
                <span className="text-rose-400 font-extrabold tracking-widest uppercase text-sm">
                  OVERDUE PAYMENT NOTICE
                </span>
                <p className="text-[11px] text-rose-300/80">Please remit outstanding balance immediately.</p>
              </div>
            </div>
          )}

          {/* Itemized Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Quantity</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoice.lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 text-slate-200 font-medium">{line.description}</td>
                    <td className="py-3 px-3 text-center text-slate-300 font-mono">{line.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      ${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-100">
                      ${line.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Tax, Discount & Balance Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 max-w-sm space-y-1">
              <p className="font-semibold text-slate-300">Payment Instructions:</p>
              <p>Electronic Wire / ACH to Brightloop Software Corp.</p>
              <p>Bank: JPMorgan Chase NA (Routing: 021000021)</p>
              <p>Account: 4892-0091-8821 | Swift: CHASUS33</p>
              <p className="text-[11px] text-slate-500 pt-1">
                Quote invoice number <span className="font-mono text-slate-400">{invoice.invoiceNumber}</span> in transfer memo.
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">
                  ${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount ({invoice.discountCode || 'Applied'}):</span>
                  <span className="font-mono font-semibold">
                    -${invoice.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-mono font-semibold">
                  ${invoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-bold text-white">
                <span>Total Amount:</span>
                <span className="font-mono text-indigo-300">
                  ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-400">
                  ${invoice.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-black">
                <span className="text-slate-200">Balance Due:</span>
                <span className={`font-mono ${invoice.balanceDue > 0 ? (isOverdue ? 'text-rose-400' : 'text-amber-400') : 'text-emerald-400'}`}>
                  ${invoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Table (If any) */}
          {invoicePayments.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recorded Payments for this Invoice:
              </span>
              <div className="space-y-1.5">
                {invoicePayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 text-xs border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-slate-200">{p.method}</span>
                      <span className="text-slate-400 text-[11px] font-mono">({p.date})</span>
                      {p.referenceNote && (
                        <span className="text-slate-500 text-[11px] truncate max-w-xs">
                          — {p.referenceNote}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      +${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
