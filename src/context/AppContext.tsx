import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Product,
  Plan,
  QuotationTemplate,
  TaxRule,
  DiscountRule,
  Subscription,
  Invoice,
  Payment,
  FinanceMetrics,
  SubscriptionStatus,
  InvoiceStatus
} from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  plans: Plan[];
  templates: QuotationTemplate[];
  taxes: TaxRule[];
  discounts: DiscountRule[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  metrics: FinanceMetrics | null;
  loading: boolean;
  toasts: ToastMessage[];

  // User & Auth
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (userData: any) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onboardStaff: (staffData: any) => Promise<{ success: boolean; error?: string }>;

  // Refresh
  refreshAll: () => Promise<void>;
  resetDatabase: () => Promise<void>;

  // Products & Plans
  saveProduct: (prod: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  savePlan: (plan: Partial<Plan>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;

  // Quotations & Subscriptions
  createSubscription: (data: any) => Promise<Subscription | null>;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => Promise<boolean>;

  // Invoices & Billing
  runBillingDay: (forceAll?: boolean) => Promise<{ billedCount: number; skippedCount: number; invoices: Invoice[] } | null>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<boolean>;
  sendInvoice: (id: string) => Promise<boolean>;

  // Payments
  recordPayment: (data: any) => Promise<boolean>;

  // Discounts & Taxes
  saveDiscount: (data: any) => Promise<boolean>;
  deleteDiscount: (id: string) => Promise<boolean>;
  saveTax: (data: any) => Promise<boolean>;
  deleteTax: (id: string) => Promise<boolean>;

  // Notifications
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all live data from backend
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, pRes, plRes, tRes, txRes, dRes, sRes, iRes, payRes, mRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/plans').then(r => r.json()),
        fetch('/api/templates').then(r => r.json()),
        fetch('/api/taxes').then(r => r.json()),
        fetch('/api/discounts').then(r => r.json()),
        fetch('/api/subscriptions').then(r => r.json()),
        fetch('/api/invoices').then(r => r.json()),
        fetch('/api/payments').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json())
      ]);

      setUsers(uRes || []);
      setProducts(pRes || []);
      setPlans(plRes || []);
      setTemplates(tRes || []);
      setTaxes(txRes || []);
      setDiscounts(dRes || []);
      setSubscriptions(sRes || []);
      setInvoices(iRes || []);
      setPayments(payRes || []);
      setMetrics(mRes || null);

      // Default user to admin if not already set
      if (!currentUser && uRes && uRes.length > 0) {
        const admin = uRes.find((u: User) => u.role === 'admin') || uRes[0];
        setCurrentUser(admin);
      }
    } catch (err) {
      console.error("Failed to fetch backend data:", err);
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to Brightloop API. Please ensure server is running.'
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, addToast]);

  useEffect(() => {
    refreshAll();
  }, []);

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      addToast({
        type: 'info',
        title: 'Role Switched',
        message: `Now viewing workspace as ${found.name} (${found.role.toUpperCase()})`
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCurrentUser(data.user);
      addToast({
        type: 'success',
        title: 'Welcome Back',
        message: `Logged in as ${data.user.name}`
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const registerCustomer = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      addToast({
        type: 'success',
        title: 'Account Created',
        message: 'Your customer portal account is ready. You may now sign in.'
      });
      await refreshAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const onboardStaff = async (staffData: any) => {
    if (currentUser?.role !== 'admin') {
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'Only administrators can add staff members.'
      });
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const res = await fetch('/api/auth/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: currentUser.email,
          ...staffData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      addToast({
        type: 'success',
        title: 'Staff Onboarded',
        message: `${data.user.name} has been added to internal staff.`
      });
      await refreshAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const resetDatabase = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Database Reset',
          message: 'Brightloop Software demo data re-seeded successfully.'
        });
        await refreshAll();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Reset Error', message: 'Failed to reset demo database.' });
    }
  };

  // Product & Plan handlers
  const saveProduct = async (prod: Partial<Product>) => {
    try {
      const method = prod.id ? 'PUT' : 'POST';
      const url = prod.id ? `/api/products/${prod.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod)
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: prod.id ? 'Product Updated' : 'Product Launched',
          message: `${prod.name} successfully saved with variants.`
        });
        await refreshAll();
        return true;
      }
      const data = await res.json();
      addToast({ type: 'error', title: 'Error', message: data.error || 'Failed to save product' });
      return false;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'info', title: 'Product Removed', message: 'Product deleted.' });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const savePlan = async (plan: Partial<Plan>) => {
    try {
      const method = plan.id ? 'PUT' : 'POST';
      const url = plan.id ? `/api/plans/${plan.id}` : '/api/plans';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Plan Configured',
          message: `${plan.name} lifecycle policies saved.`
        });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'info', title: 'Plan Removed', message: 'Plan has been removed.' });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Subscriptions & Quotes
  const createSubscription = async (data: any) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', title: 'Validation Failed', message: result.error });
        return null;
      }
      addToast({
        type: 'success',
        title: data.status === 'Quotation' ? 'Quote Generated' : 'Subscription Created',
        message: `${result.id} is now registered.`
      });
      await refreshAll();
      return result;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      return null;
    }
  };

  const updateSubscriptionStatus = async (id: string, status: SubscriptionStatus) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', title: 'Action Prohibited', message: result.error });
        return false;
      }
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `${id} transitioned to "${status}".`
      });
      await refreshAll();
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      return false;
    }
  };

  // Billing Day Engine
  const runBillingDay = async (forceAll: boolean = false) => {
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceAll })
      });
      const result = await res.json();
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Billing Day Execution Complete',
          message: `Generated ${result.billedCount} new invoices (${result.skippedCount} skipped / already billed).`
        });
        await refreshAll();
        return result;
      }
      return null;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Billing Error', message: err.message });
      return null;
    }
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Invoice Updated',
          message: `${id} status changed to ${status}.`
        });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const sendInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Invoice Dispatched',
          message: data.message
        });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Payments
  const recordPayment = async (data: any) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', title: 'Payment Failed', message: result.error });
        return false;
      }
      addToast({
        type: 'success',
        title: 'Payment Logged',
        message: `$${data.amount.toLocaleString()} recorded via ${data.method}. Invoice balance updated.`
      });
      await refreshAll();
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      return false;
    }
  };

  // Discounts & Taxes
  const saveDiscount = async (data: any) => {
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `/api/discounts/${data.id}` : '/api/discounts';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Discount Rule Active',
          message: `Code "${data.code}" saved and ready for auto-application.`
        });
        await refreshAll();
        return true;
      }
      const err = await res.json();
      addToast({ type: 'error', title: 'Error', message: err.error });
      return false;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
      return false;
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      const res = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'info', title: 'Discount Removed', message: 'Discount rule deleted.' });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const saveTax = async (data: any) => {
    try {
      const res = await fetch('/api/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Tax Rule Created',
          message: `${data.name} (${data.rate}%) saved.`
        });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deleteTax = async (id: string) => {
    try {
      const res = await fetch(`/api/taxes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'info', title: 'Tax Rule Removed', message: 'Tax rule deleted.' });
        await refreshAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        plans,
        templates,
        taxes,
        discounts,
        subscriptions,
        invoices,
        payments,
        metrics,
        loading,
        toasts,
        setCurrentUser,
        switchUser,
        login,
        registerCustomer,
        requestPasswordReset,
        onboardStaff,
        refreshAll,
        resetDatabase,
        saveProduct,
        deleteProduct,
        savePlan,
        deletePlan,
        createSubscription,
        updateSubscriptionStatus,
        runBillingDay,
        updateInvoiceStatus,
        sendInvoice,
        recordPayment,
        saveDiscount,
        deleteDiscount,
        saveTax,
        deleteTax,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
