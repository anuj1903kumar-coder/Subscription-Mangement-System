export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  company?: string;
  department?: string;
  phone?: string;
  billingAddress?: string;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceDelta: number;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'Software' | 'Add-on' | 'Service' | 'Hardware';
  salesPrice: number;
  costPrice: number;
  notes?: string;
  variants: ProductVariant[];
  createdAt?: string;
}

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  cost: number;
  billingFrequency: BillingFrequency;
  minQuantity: number;
  availableFrom: string;
  availableTo: string;
  autoCloseOnEnd: boolean;
  canCloseEarly: boolean;
  canPause: boolean;
  canRenew: boolean;
  description?: string;
}

export interface QuotationTemplateLine {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice?: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  description?: string;
  lines: QuotationTemplateLine[];
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  code: string;
  notes?: string;
}

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  scope: 'whole_subscription' | 'specific_product';
  targetProductId?: string | null;
  minQuantity: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  timesUsed: number;
  status: 'active' | 'depleted' | 'expired';
  notes?: string;
}

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
}

export type SubscriptionStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Closed' | 'Paused';

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  company: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  paymentTerms: string;
  lastBilledDate?: string | null;
  nextBillingDate?: string;
  taxId: string;
  discountCode?: string | null;
  lines: SubscriptionLine[];
  createdAt: string;
}

export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Cancelled';

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  company: string;
  billingAddress: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  discountAmount: number;
  discountCode?: string | null;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  lines: InvoiceLine[];
  createdAt: string;
}

export type PaymentMethod = 'Bank Transfer' | 'Credit Card' | 'ACH' | 'Cash' | 'UPI';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  referenceNote?: string;
  createdAt: string;
}

export interface FinanceMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  quotationSubscriptions: number;
  draftSubscriptions: number;
  closedSubscriptions: number;
  totalCustomers: number;
  arpu: number;
  totalCollectedRevenue: number;
  totalOutstanding: number;
  totalOverdue: number;
  overdueCount: number;
  agingBuckets: {
    current: number;
    days1_15: number;
    days16_30: number;
    days30Plus: number;
  };
  paymentMethods: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    billed: number;
    collected: number;
    newSubs: number;
  }>;
}
