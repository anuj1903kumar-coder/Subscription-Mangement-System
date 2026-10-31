import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Plan, ProductVariant, BillingFrequency } from '../types';
import {
  Package,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const ProductsPlansView: React.FC = () => {
  const { products, plans, saveProduct, deleteProduct, savePlan, deletePlan, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'plans'>('products');

  const isAdmin = currentUser?.role === 'admin';

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<'Software' | 'Add-on' | 'Service' | 'Hardware'>('Software');
  const [prodSalesPrice, setProdSalesPrice] = useState(990);
  const [prodCostPrice, setProdCostPrice] = useState(250);
  const [prodNotes, setProdNotes] = useState('');
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([
    { id: 'var_std', name: 'Standard Edition', priceDelta: 0, description: 'Default edition' },
    { id: 'var_odoo', name: 'Odoo Brand Edition', priceDelta: 560, description: 'Official Odoo bridge (adds $560)' }
  ]);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);

  // Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planCost, setPlanCost] = useState(49);
  const [planFrequency, setPlanFrequency] = useState<BillingFrequency>('monthly');
  const [planMinQty, setPlanMinQty] = useState(1);
  const [planAvailableFrom, setPlanAvailableFrom] = useState('2026-01-01');
  const [planAvailableTo, setPlanAvailableTo] = useState('2028-12-31');
  const [planAutoClose, setPlanAutoClose] = useState(false);
  const [planCanCloseEarly, setPlanCanCloseEarly] = useState(true);
  const [planCanPause, setPlanCanPause] = useState(true);
  const [planCanRenew, setPlanCanRenew] = useState(true);
  const [planDesc, setPlanDesc] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Open Product Modal
  const openNewProduct = () => {
    setEditingProdId(null);
    setProdName('');
    setProdType('Software');
    setProdSalesPrice(1200);
    setProdCostPrice(350);
    setProdNotes('');
    setProdVariants([
      { id: 'var_std', name: 'Standard Edition', priceDelta: 0, description: 'Default edition' },
      { id: 'var_odoo', name: 'Odoo Brand Edition', priceDelta: 560, description: 'Choosing Odoo adds 560 to price' }
    ]);
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProdId(p.id);
    setProdName(p.name);
    setProdType(p.type);
    setProdSalesPrice(p.salesPrice);
    setProdCostPrice(p.costPrice);
    setProdNotes(p.notes || '');
    setProdVariants(p.variants || []);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProduct({
      id: editingProdId || undefined,
      name: prodName,
      type: prodType,
      salesPrice: Number(prodSalesPrice),
      costPrice: Number(prodCostPrice),
      notes: prodNotes,
      variants: prodVariants
    });
    setShowProductModal(false);
  };

  // Open Plan Modal
  const openNewPlan = () => {
    setEditingPlanId(null);
    setPlanName('');
    setPlanCost(99);
    setPlanFrequency('monthly');
    setPlanMinQty(1);
    setPlanAvailableFrom('2026-01-01');
    setPlanAvailableTo('2028-12-31');
    setPlanAutoClose(false);
    setPlanCanCloseEarly(true);
    setPlanCanPause(true);
    setPlanCanRenew(true);
    setPlanDesc('');
    setShowPlanModal(true);
  };

  const openEditPlan = (pl: Plan) => {
    setEditingPlanId(pl.id);
    setPlanName(pl.name);
    setPlanCost(pl.cost);
    setPlanFrequency(pl.billingFrequency);
    setPlanMinQty(pl.minQuantity);
    setPlanAvailableFrom(pl.availableFrom);
    setPlanAvailableTo(pl.availableTo);
    setPlanAutoClose(pl.autoCloseOnEnd);
    setPlanCanCloseEarly(pl.canCloseEarly);
    setPlanCanPause(pl.canPause);
    setPlanCanRenew(pl.canRenew);
    setPlanDesc(pl.description || '');
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePlan({
      id: editingPlanId || undefined,
      name: planName,
      cost: Number(planCost),
      billingFrequency: planFrequency,
      minQuantity: Number(planMinQty),
      availableFrom: planAvailableFrom,
      availableTo: planAvailableTo,
      autoCloseOnEnd: planAutoClose,
      canCloseEarly: planCanCloseEarly,
      canPause: planCanPause,
      canRenew: planCanRenew,
      description: planDesc
    });
    setShowPlanModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Products, Variants & Flexible Plans
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure software tiers, add-ons, Odoo brand variants (+560 delta), and plan lifecycle policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'products' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Products & Variants ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Billing Plans ({plans.length})
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={activeTab === 'products' ? openNewProduct : openNewPlan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'products' ? 'Launch Product' : 'Create Plan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 p-5 shadow-lg flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{p.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {p.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {p.notes || 'Enterprise cloud software.'}
                </p>

                {/* Base Pricing */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Base Price</span>
                    <div className="text-lg font-mono font-black text-emerald-400">
                      ${p.salesPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Cost</span>
                    <div className="text-xs font-mono text-slate-400">${p.costPrice.toLocaleString()}</div>
                  </div>
                </div>

                {/* Variants List */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Configured Variants ({p.variants.length}):
                  </div>
                  {p.variants.map((v) => (
                    <div
                      key={v.id}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                        v.priceDelta > 0
                          ? 'bg-purple-950/20 border-purple-800/40 text-purple-200'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-semibold">{v.name}</span>
                        {v.priceDelta > 0 && (
                          <span className="ml-1 text-[10px] font-mono font-bold text-purple-400">
                            (+${v.priceDelta})
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-100">
                        ${(p.salesPrice + v.priceDelta).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditProduct(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((pl) => (
            <div
              key={pl.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 p-5 shadow-lg flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{pl.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Bills {pl.billingFrequency}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {pl.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {pl.description || 'Standard recurring contract.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-mono font-black text-white">${pl.cost}</span>
                    <span className="text-xs text-slate-400 ml-1">/{pl.billingFrequency}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Min Seats: <span className="font-mono text-slate-200 font-bold">{pl.minQuantity}</span>
                  </div>
                </div>

                {/* Policies Checklist */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Plan Lifecycle Policy Rules:
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>Auto-close on end:</span>
                    {pl.autoCloseOnEnd ? (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Auto Terminate
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No auto-close</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>Can be closed early:</span>
                    {pl.canCloseEarly ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Locked Contract
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>Can be paused:</span>
                    {pl.canPause ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> No Pausing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>Can be renewed:</span>
                    {pl.canRenew ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Renewable
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">One-off term</span>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditPlan(pl)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePlan(pl.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT CREATION/EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingProdId ? 'Edit Product' : 'Launch New Product & Variants'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set product attributes, base sales price, and brand variant pricing deltas.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Brightloop Warehouse Suite"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Type</label>
                  <select
                    value={prodType}
                    onChange={(e: any) => setProdType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Software">Software</option>
                    <option value="Add-on">Add-on</option>
                    <option value="Service">Service</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Sales Price ($)</label>
                  <input
                    type="number"
                    required
                    value={prodSalesPrice}
                    onChange={(e) => setProdSalesPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cost Price ($)</label>
                  <input
                    type="number"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Notes / Scope</label>
                <textarea
                  value={prodNotes}
                  onChange={(e) => setProdNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Variants Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Variants (e.g. Odoo brand adds +560)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProdVariants([
                        ...prodVariants,
                        {
                          id: `var_${Date.now()}`,
                          name: 'Custom Brand Edition',
                          priceDelta: 560
                        }
                      ])
                    }
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {prodVariants.map((v, i) => (
                    <div key={v.id || i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...prodVariants];
                          updated[i].name = e.target.value;
                          setProdVariants(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        placeholder="Variant name"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-slate-400 font-mono">+$</span>
                        <input
                          type="number"
                          value={v.priceDelta}
                          onChange={(e) => {
                            const updated = [...prodVariants];
                            updated[i].priceDelta = Number(e.target.value);
                            setProdVariants(updated);
                          }}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                          placeholder="Delta"
                        />
                      </div>
                      {prodVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setProdVariants(prodVariants.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAN CREATION/EDIT MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingPlanId ? 'Edit Billing Plan' : 'Configure New Billing Plan'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set recurring billing frequency, minimum seats, and automated lifecycle policies.
            </p>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Quarterly Growth Tier"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={planCost}
                    onChange={(e) => setPlanCost(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Frequency</label>
                  <select
                    value={planFrequency}
                    onChange={(e: any) => setPlanFrequency(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white capitalize"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Min Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={planMinQty}
                    onChange={(e) => setPlanMinQty(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Lifecycle Policy Checkboxes */}
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-300">Admin Lifecycle Rules:</span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planAutoClose}
                    onChange={(e) => setPlanAutoClose(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-indigo-600"
                  />
                  <span className="text-slate-300">Auto-close on end (closes automatically when period terminates)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planCanCloseEarly}
                    onChange={(e) => setPlanCanCloseEarly(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-indigo-600"
                  />
                  <span className="text-slate-300">Can be closed early by customer or staff</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planCanPause}
                    onChange={(e) => setPlanCanPause(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-indigo-600"
                  />
                  <span className="text-slate-300">Can be paused</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planCanRenew}
                    onChange={(e) => setPlanCanRenew(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-indigo-600"
                  />
                  <span className="text-slate-300">Can be renewed</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
