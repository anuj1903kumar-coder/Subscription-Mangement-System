import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiscountRule } from '../types';
import {
  BadgePercent,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Tag,
  Shield,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const DiscountsView: React.FC = () => {
  const { discounts, products, saveDiscount, deleteDiscount, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(15);
  const [scope, setScope] = useState<'whole_subscription' | 'specific_product'>('whole_subscription');
  const [targetProductId, setTargetProductId] = useState('');
  const [minQty, setMinQty] = useState(1);
  const [minAmount, setMinAmount] = useState(0);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [maxUses, setMaxUses] = useState(50);
  const [notes, setNotes] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDiscount({
      code,
      name,
      type,
      value: Number(value),
      scope,
      targetProductId: scope === 'specific_product' ? targetProductId : null,
      minQuantity: Number(minQty),
      minPurchaseAmount: Number(minAmount),
      startDate,
      endDate,
      maxUses: Number(maxUses),
      notes
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Discounts & Promotion Rules Engine
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Admin Restricted
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "Only the admin can create discount rules: a fixed amount or a percentage, with a minimum purchase or quantity, start and end dates, and a limit on how many times it can be used."
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discount Rule</span>
          </button>
        )}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((disc) => {
          const isExpired = disc.endDate < new Date().toISOString().split('T')[0];
          const isDepleted = disc.maxUses && disc.timesUsed >= disc.maxUses;
          const targetProd = disc.targetProductId
            ? products.find((p) => p.id === disc.targetProductId)
            : null;

          return (
            <div
              key={disc.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isDepleted || isExpired
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {disc.code}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isDepleted
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : isExpired
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isDepleted ? 'Max Uses Reached' : isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{disc.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{disc.notes}</p>

                {/* Discount Value Pill */}
                <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Discount Value:</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} FLAT OFF`}
                  </span>
                </div>

                {/* Eligibility Conditions */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Scope:</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {disc.scope === 'whole_subscription'
                        ? 'Whole Subscription'
                        : `Product: ${targetProd?.name || 'Specific'}`}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Min Thresholds:</span>
                    <span className="font-mono text-slate-200">
                      {disc.minQuantity > 1 ? `${disc.minQuantity} seats` : ''}
                      {disc.minQuantity > 1 && disc.minPurchaseAmount > 0 ? ' or ' : ''}
                      {disc.minPurchaseAmount > 0 ? `min $${disc.minPurchaseAmount}` : ''}
                      {disc.minQuantity <= 1 && disc.minPurchaseAmount <= 0 ? 'None (1+)' : ''}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Validity Window:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {disc.startDate} to {disc.endDate}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Usage Limit Counter:</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {disc.timesUsed} / {disc.maxUses} times used
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => deleteDiscount(disc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE DISCOUNT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Admin Discount Rule</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure promo rules that apply automatically to qualifying subscriptions and invoices.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER25"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Enterprise Promotion"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Applies To (Scope)</label>
                  <select
                    value={scope}
                    onChange={(e: any) => setScope(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="whole_subscription">Whole Subscription</option>
                    <option value="specific_product">Specific Product</option>
                  </select>
                </div>

                {scope === 'specific_product' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Target Product</label>
                    <select
                      value={targetProductId}
                      onChange={(e) => setTargetProductId(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="">Select target product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Min Quantity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={minQty}
                    onChange={(e) => setMinQty(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Min Purchase ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Max Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description & Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Activate Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
