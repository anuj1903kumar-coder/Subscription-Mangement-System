import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Subscription, Invoice } from '../types';
import {
  Globe,
  Repeat,
  Receipt,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Package,
  Calendar,
  DollarSign,
  Download,
  Printer,
  Sparkles,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerPortalViewProps {
  onSelectInvoice: (invoiceId: string) => void;
  onOpenRecordPayment: (invoiceId: string) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  onSelectInvoice,
  onOpenRecordPayment
}) => {
  const {
    currentUser,
    subscriptions,
    invoices,
    products,
    updateSubscriptionStatus,
    refreshAll,
    addToast
  } = useApp();

  // Scope to current customer's account (or sample customer if viewing as admin/staff)
  const isCustomer = currentUser?.role === 'customer';
  const effectiveCustomerId = isCustomer ? currentUser.id : 'usr_cust_01';

  const mySubscriptions = subscriptions.filter((s) => s.customerId === effectiveCustomerId);
  const myInvoices = invoices.filter((i) => i.customerId === effectiveCustomerId);

  // Available add-ons from products catalog
  const availableAddons = products.filter((p) => p.type === 'Add-on');

  // Toggle add-on for the primary active subscription
  const [updatingAddon, setUpdatingAddon] = useState(false);

  const activeSub = mySubscriptions.find((s) => s.status === 'Active') || mySubscriptions[0];

  const handleToggleAddon = async (addonProduct: any, isCurrentlyActive: boolean) => {
    if (!activeSub) {
      addToast({
        type: 'warning',
        title: 'No Active Subscription',
        message: 'You need an active plan before managing add-on modules.'
      });
      return;
    }

    try {
      setUpdatingAddon(true);
      let updatedLines = [...activeSub.lines];

      if (isCurrentlyActive) {
        // Remove add-on
        updatedLines = updatedLines.filter((l) => l.productId !== addonProduct.id);
        addToast({
          type: 'info',
          title: 'Add-on Deactivated',
          message: `${addonProduct.name} has been switched off.`
        });
      } else {
        // Add add-on
        updatedLines.push({
          id: `line_addon_${Date.now()}`,
          productId: addonProduct.id,
          productName: addonProduct.name,
          variantId: addonProduct.variants?.[0]?.id || null,
          variantName: addonProduct.variants?.[0]?.name || 'Standard',
          quantity: 1,
          unitPrice: addonProduct.salesPrice,
          taxRate: 8.25,
          subtotal: addonProduct.salesPrice
        });
        addToast({
          type: 'success',
          title: 'Add-on Activated',
          message: `${addonProduct.name} is now enabled on your subscription.`
        });
        confetti({ particleCount: 30, spread: 50 });
      }

      const res = await fetch(`/api/subscriptions/${activeSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: updatedLines })
      });

      if (res.ok) {
        await refreshAll();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setUpdatingAddon(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Customer Self-Service Portal
            </span>
            {!isCustomer && (
              <span className="text-xs text-amber-400 italic">
                (Simulating view for {activeSub?.company || 'Apex Retail Group'})
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            My Subscriptions, Modules & Invoices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "Customers see only their own subscriptions and invoices through a portal. Add-ons customers switch on and off without having to email anyone."
          </p>
        </div>
      </div>

      {/* Primary Active Plan Card */}
      {activeSub ? (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/30 border border-indigo-500/30 p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400">{activeSub.id}</span>
                <StatusBadge status={activeSub.status} />
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Bills {activeSub.billingFrequency}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-2">{activeSub.planName}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Contract Period: <span className="font-mono text-slate-200">{activeSub.startDate}</span> to{' '}
                <span className="font-mono text-slate-200">{activeSub.expiryDate}</span> &bull; Payment terms: {activeSub.paymentTerms}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Current Billed Amount</span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                ${activeSub.lines.reduce((a, b) => a + b.quantity * b.unitPrice, 0).toLocaleString()}
              </div>
              {activeSub.discountCode && (
                <span className="text-[11px] font-mono font-semibold text-amber-400">
                  Promo: {activeSub.discountCode} applied
                </span>
              )}
            </div>
          </div>

          {/* Active Product Lines */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Contract Components ({activeSub.lines.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSub.lines.map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">{l.productName}</div>
                    <div className="text-[11px] text-indigo-300">{l.variantName || 'Standard'} &bull; {l.quantity} seats</div>
                  </div>
                  <span className="font-mono font-bold text-slate-100 ml-2">
                    ${(l.quantity * l.unitPrice).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
          No subscriptions currently associated with this customer account.
        </div>
      )}

      {/* ADD-ONS SELF-SERVICE CONTROLS */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Self-Service Modular Add-Ons
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch add-ons on and off on demand. Changes reflect automatically on your upcoming billing invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAddons.map((addon) => {
            const isInstalled = activeSub?.lines.some((l) => l.productId === addon.id);

            return (
              <div
                key={addon.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isInstalled
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-purple-950/30 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{addon.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        isInstalled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isInstalled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{addon.notes}</p>
                  <div className="mt-2 font-mono text-xs font-bold text-slate-300">
                    ${addon.salesPrice}/mo
                  </div>
                </div>

                <button
                  disabled={updatingAddon || !activeSub}
                  onClick={() => handleToggleAddon(addon, isInstalled || false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isInstalled
                      ? 'bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {isInstalled ? 'Switch Off' : 'Switch On'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MY INVOICES & PAYMENTS SECTION */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            My Invoices & Payment Receipts
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Review previous invoices, download receipts, and settle outstanding balances instantly online.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No billing history on record.
                  </td>
                </tr>
              ) : (
                myInvoices.map((inv) => {
                  const isOverdue = inv.status === 'Confirmed' && inv.dueDate < today;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-300">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {inv.periodStart} &rarr; {inv.periodEnd}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{inv.dueDate}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                        ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {inv.balanceDue > 0 ? (
                          <span className={isOverdue ? 'text-rose-400' : 'text-amber-400'}>
                            ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-400">$0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={inv.status} isOverdue={isOverdue} />
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {inv.balanceDue > 0 && inv.status !== 'Draft' && (
                          <button
                            onClick={() => onOpenRecordPayment(inv.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Online</span>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectInvoice(inv.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
