import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  DollarSign,
  Repeat,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  FileText,
  Mail,
  Send,
  Calendar,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  onSelectInvoice: (invoiceId: string) => void;
  onOpenRecordPayment: (invoiceId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectInvoice,
  onOpenRecordPayment
}) => {
  const { metrics, invoices, sendInvoice, addToast } = useApp();
  const [timeframe, setTimeframe] = useState<'30d' | 'quarter' | 'year'>('30d');
  const [searchTerm, setSearchTerm] = useState('');

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Clock className="w-6 h-6 animate-spin mr-2 text-indigo-400" />
        Calculating financial indices...
      </div>
    );
  }

  // Filter overdue invoices
  const today = new Date().toISOString().split('T')[0];
  const overdueInvoices = invoices.filter(
    (inv) =>
      inv.status === 'Confirmed' &&
      inv.dueDate < today &&
      (searchTerm === '' ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pieColors = ['#10b981', '#a855f7', '#64748b', '#3b82f6'];
  const statusPieData = [
    { name: 'Active', value: metrics.activeSubscriptions },
    { name: 'Quotation', value: metrics.quotationSubscriptions },
    { name: 'Draft', value: metrics.draftSubscriptions },
    { name: 'Closed', value: metrics.closedSubscriptions }
  ];

  const agingData = [
    { name: 'Current', amount: metrics.agingBuckets.current },
    { name: '1-15 Days', amount: metrics.agingBuckets.days1_15 },
    { name: '16-30 Days', amount: metrics.agingBuckets.days16_30 },
    { name: '30+ Days', amount: metrics.agingBuckets.days30Plus }
  ];

  const handleSendReminder = async (invoiceId: string) => {
    await sendInvoice(invoiceId);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Finance Command Center
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Response &lt; 0.2s
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of active subscriptions, monthly recurring revenue, and receivables aging.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {(['30d', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === period
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {period === '30d' ? 'Last 30 Days' : period === 'quarter' ? 'Current Quarter' : 'Year to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`ARR Run-rate: $${metrics.arr.toLocaleString()}`}
          icon={TrendingUp}
          trend="+18.4%"
          isPositive={true}
        />

        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions}
          subtitle={`Across ${metrics.totalCustomers} enterprise & retail accounts`}
          icon={Repeat}
          trend="100% Retained"
          isPositive={true}
        />

        <MetricCard
          title="Revenue Collected"
          value={`$${metrics.totalCollectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`Owed: $${metrics.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="82% collected"
          isPositive={true}
        />

        <MetricCard
          title="Overdue Receivables"
          value={`$${metrics.totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${metrics.overdueCount} invoices past due date`}
          icon={AlertTriangle}
          alert={metrics.totalOverdue > 0}
          trend={metrics.overdueCount > 0 ? "Requires Chasing" : "Clean"}
          isPositive={metrics.totalOverdue === 0}
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Billing Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recurring Billing & Cash Collections</h3>
              <p className="text-xs text-slate-400">Monthly invoice generation compared against reconciled collections</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Billed
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Collected
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="billed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables Aging Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Receivables Aging Analysis</h3>
            <p className="text-xs text-slate-400">Aging exposure of unpaid customer balances</p>
          </div>

          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Outstanding']}
                />
                <Bar dataKey="amount" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Unpaid Balance:</span>
            <span className="font-bold text-rose-400">${metrics.totalOutstanding.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Table: Invoices to Chase */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Overdue Invoices Requiring Immediate Action
            </h3>
            <p className="text-xs text-slate-400">
              Reach out to accounts before overdue invoices turn into lost revenue.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search overdue invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 max-w-xs"
          />
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-xs font-semibold text-slate-200">Zero Overdue Invoices</p>
            <p className="text-[11px] text-slate-500 mt-0.5">All customer billing is current and reconciled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                  <th className="py-2.5 px-3 font-semibold">Customer / Company</th>
                  <th className="py-2.5 px-3 font-semibold">Due Date</th>
                  <th className="py-2.5 px-3 font-semibold">Days Overdue</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Balance Due</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overdueInvoices.map((inv) => {
                  const daysOverdue = Math.max(
                    1,
                    Math.ceil((new Date(today).getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                  );
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-indigo-300">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{inv.company}</div>
                        <div className="text-[11px] text-slate-400">{inv.customerName} ({inv.customerEmail})</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">{inv.dueDate}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          +{daysOverdue} days
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                        ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={inv.status} isOverdue={true} />
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleSendReminder(inv.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all inline-flex items-center gap-1"
                          title="Email payment reminder"
                        >
                          <Send className="w-3 h-3" />
                          <span>Remind</span>
                        </button>
                        <button
                          onClick={() => onOpenRecordPayment(inv.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all inline-flex items-center gap-1"
                          title="Record payment received"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                        <button
                          onClick={() => onSelectInvoice(inv.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
