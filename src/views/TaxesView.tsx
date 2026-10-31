import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaxRule } from '../types';
import { Landmark, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';

export const TaxesView: React.FC = () => {
  const { taxes, saveTax, deleteTax, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [rate, setRate] = useState(8.25);
  const [code, setCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTax({
      name,
      rate: Number(rate),
      code,
      isDefault,
      notes
    });
    setShowModal(false);
    setName('');
    setCode('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Tax Engine & Jurisdiction Rules
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Admin Restricted
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "Taxes are calculated automatically from rules the admin has set."
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax Rule</span>
          </button>
        )}
      </div>

      {/* Taxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {taxes.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 p-5 shadow-lg flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-teal-400">{t.code || t.id}</span>
                {t.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Default Rule
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-teal-200 transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.notes || 'Automated statutory software tax rate.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Effective Tax Percentage:</span>
                <span className="text-2xl font-mono font-black text-teal-300">{t.rate}%</span>
              </div>
            </div>

            {isAdmin && !t.isDefault && (
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => deleteTax(t.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE TAX MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Configure Tax Rule</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create tax rules that are automatically applied on Billing Day invoice generation.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Canadian GST/HST"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Jurisdiction Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CA-GST-5"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-teal-600"
                />
                <span className="text-xs text-slate-300">Set as system default tax rate</span>
              </label>

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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
