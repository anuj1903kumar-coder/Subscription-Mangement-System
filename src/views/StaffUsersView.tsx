import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import {
  Users2,
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Lock,
  Building,
  Mail,
  Briefcase
} from 'lucide-react';

export const StaffUsersView: React.FC = () => {
  const { users, onboardStaff, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Sales & Client Operations');
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = await onboardStaff({
      name,
      email,
      password,
      department
    });

    if (res.success) {
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setErrorMsg(res.error || 'Failed to onboard staff member.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Staff & Role-Based Access Control (RBAC)
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Only Admin Can Add Staff
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "The admin controls the whole system, internal staff handle day-to-day work with limited access, and customers see only their own subscriptions and invoices through a portal."
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setErrorMsg('');
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Staff Member</span>
          </button>
        )}
      </div>

      {/* Permission Matrix Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Brightloop Multi-Tier Access Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">System Capability</th>
                <th className="py-2.5 px-3 text-center">Administrator</th>
                <th className="py-2.5 px-3 text-center">Internal Staff</th>
                <th className="py-2.5 px-3 text-center">Customer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-medium">System Configuration, Tax & Discount Rules</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-400">Full Access</td>
                <td className="py-2 px-3 text-center text-slate-500">Read Only</td>
                <td className="py-2 px-3 text-center text-slate-600">No Access</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Onboard New Internal Staff Members</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-400">Exclusive (Admin Only)</td>
                <td className="py-2 px-3 text-center text-slate-600">Restricted</td>
                <td className="py-2 px-3 text-center text-slate-600">Restricted</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Quotations, Subscriptions & Invoicing</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-400">Full Access</td>
                <td className="py-2 px-3 text-center font-bold text-indigo-400">Day-to-day Operations</td>
                <td className="py-2 px-3 text-center text-amber-400">Own Records Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Run Billing Day Batch Engine</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-400">Full Control</td>
                <td className="py-2 px-3 text-center font-bold text-indigo-400">Allowed</td>
                <td className="py-2 px-3 text-center text-slate-600">No Access</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Executive Financial Metrics & ARR/MRR</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-400">Full Access</td>
                <td className="py-2 px-3 text-center font-bold text-indigo-400">Full Access</td>
                <td className="py-2 px-3 text-center text-slate-600">No Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users & Team Directory */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-lg overflow-x-auto">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Users2 className="w-4 h-4 text-amber-400" />
          Active System Directory ({users.length} Users)
        </h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 font-semibold">User</th>
              <th className="py-3 px-3 font-semibold">Email</th>
              <th className="py-3 px-3 font-semibold">Organization / Dept</th>
              <th className="py-3 px-3 font-semibold text-center">Assigned Role</th>
              <th className="py-3 px-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        u.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300'
                          : u.role === 'staff'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">{u.email}</td>
                <td className="py-3 px-3 text-slate-300">
                  {u.company || u.department || 'Brightloop Internal'}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : u.role === 'staff'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-slate-400">
                  {u.createdAt ? u.createdAt.split('T')[0] : '2026-01-01'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ONBOARD STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Onboard Internal Staff Member</h3>
            <p className="text-xs text-slate-400 mb-4">
              "Only the admin can add a new member of staff." Staff handle operational workflows with scoped access.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleOnboard} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Staff Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel@brightloop.com"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Must be >8 chars, 1 uppercase, 1 lowercase, 1 special"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Criteria: &gt; 8 characters, uppercase, lowercase, and a special character (!@#$).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Sales & Client Operations">Sales & Client Operations</option>
                  <option value="Billing & Finance Support">Billing & Finance Support</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Product Engineering">Product Engineering</option>
                </select>
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
