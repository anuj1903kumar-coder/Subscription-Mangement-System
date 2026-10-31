import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductVariant, SubscriptionStatus } from '../../types';
import {
  Plus,
  Trash2,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
  DollarSign,
  Calendar,
  Building,
  CheckCircle2,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  initialTemplateId?: string | null;
  onClose: () => void;
}

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  initialTemplateId,
  onClose
}) => {
  const {
    users,
    products,
    plans,
    templates,
    taxes,
    discounts,
    createSubscription,
    addToast
  } = useApp();

  const customers = users.filter((u) => u.role === 'customer');

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [selectedTaxId, setSelectedTaxId] = useState('TAX-001');
  const [discountCode, setDiscountCode] = useState('');
  const [initialStatus, setInitialStatus] = useState<SubscriptionStatus>('Quotation');

  // Editable lines
  const [lines, setLines] = useState<
    Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
    }>
  >([]);

  // Apply template helper
  const applyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (!tmpl) return;

    setSelectedPlanId(tmpl.planId);

    // Calculate expiry based on template validityDays
    const exp = new Date(startDate);
    exp.setDate(exp.getDate() + tmpl.validityDays);
    setExpiryDate(exp.toISOString().split('T')[0]);

    // Populate lines
    const popLines = tmpl.lines.map((tl) => {
      const prod = products.find((p) => p.id === tl.productId);
      const variant = prod?.variants.find((v) => v.id === tl.variantId);
      const unitPrice = tl.unitPrice || (prod?.salesPrice || 0) + (variant?.priceDelta || 0);
      return {
        productId: tl.productId,
        variantId: tl.variantId,
        quantity: tl.quantity,
        unitPrice
      };
    });
    setLines(popLines);
  };

  useEffect(() => {
    if (isOpen) {
      if (customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(customers[0].id);
      }
      if (plans.length > 0 && !selectedPlanId) {
        setSelectedPlanId(plans[0].id);
      }
      if (initialTemplateId) {
        applyTemplate(initialTemplateId);
      } else if (lines.length === 0 && products.length > 0) {
        // Default line
        const prod = products[0];
        setLines([
          {
            productId: prod.id,
            variantId: prod.variants[0]?.id,
            quantity: 2,
            unitPrice: prod.salesPrice + (prod.variants[0]?.priceDelta || 0)
          }
        ]);
      }
    }
  }, [isOpen, initialTemplateId]);

  if (!isOpen) return null;

  const currentPlan = plans.find((p) => p.id === selectedPlanId);

  // Line item manipulation
  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;
    const defaultVariant = prod.variants[0];
    const newUnitPrice = prod.salesPrice + (defaultVariant?.priceDelta || 0);

    const updated = [...lines];
    updated[index] = {
      productId: newProductId,
      variantId: defaultVariant?.id,
      quantity: updated[index].quantity || 1,
      unitPrice: newUnitPrice
    };
    setLines(updated);
  };

  const handleVariantChange = (index: number, newVariantId: string) => {
    const item = lines[index];
    const prod = products.find((p) => p.id === item.productId);
    const variant = prod?.variants.find((v) => v.id === newVariantId);
    const newUnitPrice = (prod?.salesPrice || 0) + (variant?.priceDelta || 0);

    const updated = [...lines];
    updated[index] = {
      ...item,
      variantId: newVariantId,
      unitPrice: newUnitPrice
    };
    setLines(updated);
  };

  const handleAddLine = () => {
    const prod = products[0];
    setLines([
      ...lines,
      {
        productId: prod.id,
        variantId: prod.variants[0]?.id,
        quantity: 1,
        unitPrice: prod.salesPrice + (prod.variants[0]?.priceDelta || 0)
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
  };

  // Calculations
  const rawSubtotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  const totalSeats = lines.reduce((acc, l) => acc + Number(l.quantity), 0);

  // Discount calculation preview
  let discountDeduction = 0;
  if (discountCode) {
    const disc = discounts.find(
      (d) => d.code.toUpperCase() === discountCode.trim().toUpperCase() && d.status === 'active'
    );
    if (disc) {
      if (disc.type === 'percentage') {
        if (disc.scope === 'whole_subscription') {
          discountDeduction = (rawSubtotal * disc.value) / 100;
        } else if (disc.targetProductId) {
          const matchingLine = lines.find((l) => l.productId === disc.targetProductId);
          if (matchingLine) {
            discountDeduction = (matchingLine.quantity * matchingLine.unitPrice * disc.value) / 100;
          }
        }
      } else if (disc.type === 'fixed') {
        discountDeduction = Math.min(disc.value, rawSubtotal);
      }
    }
  }

  const selectedTax = taxes.find((t) => t.id === selectedTaxId) || { rate: 8.25 };
  const taxableBase = Math.max(0, rawSubtotal - discountDeduction);
  const taxAmount = (taxableBase * selectedTax.rate) / 100;
  const grandTotal = taxableBase + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPlan && totalSeats < currentPlan.minQuantity) {
      addToast({
        type: 'error',
        title: 'Minimum Seats Required',
        message: `Plan "${currentPlan.name}" requires at least ${currentPlan.minQuantity} seats. Current total: ${totalSeats}.`
      });
      return;
    }

    const sub = await createSubscription({
      customerId: selectedCustomerId,
      planId: selectedPlanId,
      status: initialStatus,
      startDate,
      expiryDate: expiryDate || undefined,
      paymentTerms,
      taxId: selectedTaxId,
      discountCode: discountCode.trim().toUpperCase() || null,
      lines
    });

    if (sub) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Create Subscription or Quote</h3>
            <p className="text-xs text-slate-400">
              Prepare a formal customer quote or directly activate a recurring subscription.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Fast Picker */}
          <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-1">
            <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Start From Predefined Quotation Template (Optional)
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            >
              <option value="">Custom Build (From Scratch)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Valid {t.validityDays} days &bull; {t.lines.length} lines)
                </option>
              ))}
            </select>
          </div>

          {/* Customer & Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Customer Account</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Billing Plan</label>
              <select
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                {plans.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} (${pl.cost}/{pl.billingFrequency} &bull; Min {pl.minQuantity} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Expiry / Quote Valid</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Optional"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Due on Receipt">Due on Receipt (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Itemized Lines Configurator */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Products & Variants Configurator ({lines.length} lines)
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Line
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {lines.map((line, idx) => {
                const prod = products.find((p) => p.id === line.productId);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row items-center gap-2 text-xs"
                  >
                    {/* Product select */}
                    <div className="w-full sm:w-44">
                      <select
                        value={line.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Variant select (including Odoo +560) */}
                    <div className="w-full sm:flex-1">
                      <select
                        value={line.variantId || ''}
                        onChange={(e) => handleVariantChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        {prod?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} {v.priceDelta > 0 ? `(+$${v.priceDelta})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => {
                          const updated = [...lines];
                          updated[idx].quantity = Math.max(1, Number(e.target.value));
                          setLines(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono text-center"
                      />
                    </div>

                    {/* Line total */}
                    <div className="w-24 text-right font-mono font-bold text-slate-100">
                      ${(line.quantity * line.unitPrice).toLocaleString()}
                    </div>

                    {/* Delete line */}
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Taxes & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300">Applicable Tax Rule</label>
              <select
                value={selectedTaxId}
                onChange={(e) => setSelectedTaxId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                {taxes.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    {tx.name} ({tx.rate}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Discount Code (Promo)</label>
              <div className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VOLUME15, WELCOME200"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Initial Lifecycle Stage */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Initial Pipeline Stage</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['Draft', 'Quotation', 'Confirmed'] as SubscriptionStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setInitialStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    initialStatus === st
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Calculation Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Lines Subtotal:</span>
              <span className="font-mono text-slate-200">${rawSubtotal.toFixed(2)}</span>
            </div>
            {discountDeduction > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Discount Deduction ({discountCode}):</span>
                <span className="font-mono">-${discountDeduction.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Tax ({selectedTax.rate}%):</span>
              <span className="font-mono text-slate-200">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800 text-sm">
              <span>Total Contract Value:</span>
              <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              Create {initialStatus}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
