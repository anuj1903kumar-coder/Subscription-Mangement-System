import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UserPlus,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'signup' | 'forgot' | 'staff';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode, onClose }) => {
  const { registerCustomer, requestPasswordReset, onboardStaff, currentUser } = useApp();

  const [activeMode, setActiveMode] = useState<'signup' | 'forgot' | 'staff'>(mode);

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // Password Reset fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetResult, setResetResult] = useState<any>(null);

  // Staff onboarding fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffDept, setStaffDept] = useState('Sales & Client Operations');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setActiveMode(mode);
    setErrorMsg('');
    setResetResult(null);
  }, [mode, isOpen]);

  if (!isOpen) return null;

  // Real-time password criteria validation
  const testPassword = (pwd: string) => ({
    length: pwd.length > 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  });

  const pwdChecks = testPassword(activeMode === 'staff' ? staffPassword : password);
  const isPwdValid = pwdChecks.length && pwdChecks.upper && pwdChecks.lower && pwdChecks.special;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isPwdValid) {
      setErrorMsg('Password does not fulfill Brightloop security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        name,
        email,
        password,
        company,
        phone,
        billingAddress
      });

      if (res.success) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to register account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(resetEmail);
      if (res.success) {
        setResetResult(res);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch reset link.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStaffOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isPwdValid) {
      setErrorMsg('Staff password must meet all 4 complexity requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await onboardStaff({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        department: staffDept
      });

      if (res.success) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to onboard staff.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switchers in modal */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              setActiveMode('signup');
              setErrorMsg('');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'signup'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Signup
          </button>
          <button
            onClick={() => {
              setActiveMode('forgot');
              setErrorMsg('');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'forgot'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reset Password
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setActiveMode('staff');
                setErrorMsg('');
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                activeMode === 'staff'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Add Staff (Admin)
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. CUSTOMER SIGNUP */}
        {activeMode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Create Customer Account</h3>
              <p className="text-xs text-slate-400">
                Join Brightloop Software to access self-service subscription and billing management.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michael Vance"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Email Address (Unique)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Zenith Retailers LLC"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Billing Address</label>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="123 Commerce St, Suite 100, Austin, TX"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>

            {/* Password with live validation pills */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
              />

              {/* Requirement Checklist */}
              <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    pwdChecks.length ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  <span className="font-bold">{pwdChecks.length ? '✓' : '•'}</span> &gt; 8 Characters
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    pwdChecks.upper ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  <span className="font-bold">{pwdChecks.upper ? '✓' : '•'}</span> Uppercase Letter (A-Z)
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    pwdChecks.lower ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  <span className="font-bold">{pwdChecks.lower ? '✓' : '•'}</span> Lowercase Letter (a-z)
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    pwdChecks.special ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  <span className="font-bold">{pwdChecks.special ? '✓' : '•'}</span> Special Character (!@#$)
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isPwdValid}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Register Customer Account'}
              </button>
            </div>
          </form>
        )}

        {/* 2. FORGOT PASSWORD */}
        {activeMode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Reset Password Simulation</h3>
              <p className="text-xs text-slate-400">
                "If they forget it later, a reset link should arrive at their registered email."
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="customer1@apexretail.com"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>

            {resetResult && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password Reset Dispatched</span>
                </div>
                <p className="text-slate-300">
                  Email sent to <span className="font-mono text-white">{resetResult.email}</span>
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 break-all font-mono text-[11px] text-indigo-300">
                  {resetResult.resetLink}
                </div>
                <p className="text-[11px] text-slate-500">
                  Simulation token: <span className="font-mono text-slate-400">{resetResult.resetToken}</span>
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            </div>
          </form>
        )}

        {/* 3. STAFF ONBOARDING (ADMIN) */}
        {activeMode === 'staff' && (
          <form onSubmit={handleStaffOnboard} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Admin Authority
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">Onboard Staff Member</h3>
              <p className="text-xs text-slate-400">
                "Only the admin can add a new member of staff."
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Staff Full Name</label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Jessica Sterling"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
              <input
                type="email"
                required
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="jessica@brightloop.com"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Assigned Password</label>
              <input
                type="password"
                required
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Password with upper, lower, number, special..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
              />

              <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
                <div className={`flex items-center gap-1 ${pwdChecks.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.length ? '✓' : '•'}</span> &gt; 8 Characters
                </div>
                <div className={`flex items-center gap-1 ${pwdChecks.upper ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.upper ? '✓' : '•'}</span> Uppercase
                </div>
                <div className={`flex items-center gap-1 ${pwdChecks.lower ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.lower ? '✓' : '•'}</span> Lowercase
                </div>
                <div className={`flex items-center gap-1 ${pwdChecks.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.special ? '✓' : '•'}</span> Special Char
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Operational Department</label>
              <select
                value={staffDept}
                onChange={(e) => setStaffDept(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Sales & Client Operations">Sales & Client Operations</option>
                <option value="Billing & Finance Support">Billing & Finance Support</option>
                <option value="Customer Success">Customer Success</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isPwdValid}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Onboard Staff Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
