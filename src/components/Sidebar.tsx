import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Repeat,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Package,
  BadgePercent,
  Landmark,
  Users2,
  Globe,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'subscriptions'
  | 'quotations'
  | 'invoices'
  | 'payments'
  | 'products'
  | 'discounts'
  | 'taxes'
  | 'staff'
  | 'portal';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, invoices, subscriptions } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const isCustomer = currentUser?.role === 'customer';

  // Counts for sidebar badges
  const overdueCount = invoices.filter(
    (inv) => inv.status === 'Confirmed' && inv.dueDate < new Date().toISOString().split('T')[0]
  ).length;

  const quoteCount = subscriptions.filter((s) => s.status === 'Quotation').length;

  return (
    <aside className="w-64 shrink-0 bg-slate-900/60 border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Navigation Sections */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Operations & Revenue
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Executive Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Repeat className="w-4 h-4 text-indigo-400" />
                <span>Subscriptions</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('quotations')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'quotations'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>Quotes & Templates</span>
              </div>
              {quoteCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {quoteCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'invoices'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Invoices & Billing</span>
              </div>
              {overdueCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'payments'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>Payments & Aging</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Master Catalog & Admin Config */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Master Catalogs & Rules
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Products & Plans</span>
              </div>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('discounts')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'discounts'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BadgePercent className="w-4 h-4 text-rose-400" />
                    <span>Discounts Engine</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded font-bold bg-slate-800 text-slate-400">
                    Admin
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('taxes')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'taxes'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-teal-400" />
                    <span>Tax Rules Config</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded font-bold bg-slate-800 text-slate-400">
                    Admin
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'staff'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users2 className="w-4 h-4 text-indigo-400" />
                    <span>Staff & Access</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded font-bold bg-slate-800 text-slate-400">
                    Admin
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Customer Self-Service Portal Tab */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Client Experience
          </div>
          <button
            onClick={() => setActiveTab('portal')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'portal'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Customer Self-Service</span>
            </div>
            {isCustomer && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* System Status Footnote */}
      <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Brightloop Core</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Sub-2s Live
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Engineered for high-volume recurring subscription pipelines.
        </p>
      </div>
    </aside>
  );
};
