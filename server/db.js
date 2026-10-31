import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialSeedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.reset();
      }
    } catch (err) {
      console.warn("Could not read DB file, resetting to initial seed:", err);
      this.reset();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to persist database to file:", err);
    }
  }

  reset() {
    // Deep clone initial seed data
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.save();
    return this.data;
  }

  // --- USERS & AUTH ---
  getUsers() {
    return this.data.users;
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser = {
      id,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- PRODUCTS ---
  getProducts() {
    return this.data.products;
  }

  findProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  saveProduct(productData) {
    if (productData.id) {
      const idx = this.data.products.findIndex(p => p.id === productData.id);
      if (idx !== -1) {
        this.data.products[idx] = { ...this.data.products[idx], ...productData };
        this.save();
        return this.data.products[idx];
      }
    }
    const id = `PROD-${String(this.data.products.length + 1).padStart(3, '0')}`;
    const newProduct = {
      id,
      ...productData,
      createdAt: new Date().toISOString()
    };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  deleteProduct(id) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    return true;
  }

  // --- PLANS ---
  getPlans() {
    return this.data.plans;
  }

  findPlanById(id) {
    return this.data.plans.find(p => p.id === id);
  }

  savePlan(planData) {
    if (planData.id) {
      const idx = this.data.plans.findIndex(p => p.id === planData.id);
      if (idx !== -1) {
        this.data.plans[idx] = { ...this.data.plans[idx], ...planData };
        this.save();
        return this.data.plans[idx];
      }
    }
    const id = `PLAN-${String(this.data.plans.length + 1).padStart(3, '0')}`;
    const newPlan = {
      id,
      ...planData
    };
    this.data.plans.push(newPlan);
    this.save();
    return newPlan;
  }

  deletePlan(id) {
    this.data.plans = this.data.plans.filter(p => p.id !== id);
    this.save();
    return true;
  }

  // --- QUOTATION TEMPLATES ---
  getTemplates() {
    return this.data.quotationTemplates;
  }

  findTemplateById(id) {
    return this.data.quotationTemplates.find(t => t.id === id);
  }

  saveTemplate(tmplData) {
    if (tmplData.id) {
      const idx = this.data.quotationTemplates.findIndex(t => t.id === tmplData.id);
      if (idx !== -1) {
        this.data.quotationTemplates[idx] = { ...this.data.quotationTemplates[idx], ...tmplData };
        this.save();
        return this.data.quotationTemplates[idx];
      }
    }
    const id = `TMPL-${String(this.data.quotationTemplates.length + 1).padStart(3, '0')}`;
    const newTmpl = { id, ...tmplData };
    this.data.quotationTemplates.push(newTmpl);
    this.save();
    return newTmpl;
  }

  deleteTemplate(id) {
    this.data.quotationTemplates = this.data.quotationTemplates.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // --- TAXES ---
  getTaxes() {
    return this.data.taxes;
  }

  saveTax(taxData) {
    if (taxData.id) {
      const idx = this.data.taxes.findIndex(t => t.id === taxData.id);
      if (idx !== -1) {
        this.data.taxes[idx] = { ...this.data.taxes[idx], ...taxData };
        this.save();
        return this.data.taxes[idx];
      }
    }
    const id = `TAX-${String(this.data.taxes.length + 1).padStart(3, '0')}`;
    const newTax = { id, ...taxData };
    this.data.taxes.push(newTax);
    this.save();
    return newTax;
  }

  deleteTax(id) {
    this.data.taxes = this.data.taxes.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // --- DISCOUNTS ---
  getDiscounts() {
    return this.data.discounts;
  }

  findDiscountByCode(code) {
    if (!code) return null;
    return this.data.discounts.find(d => d.code.toUpperCase() === code.toUpperCase().trim());
  }

  saveDiscount(discData) {
    if (discData.id) {
      const idx = this.data.discounts.findIndex(d => d.id === discData.id);
      if (idx !== -1) {
        this.data.discounts[idx] = { ...this.data.discounts[idx], ...discData };
        this.save();
        return this.data.discounts[idx];
      }
    }
    const id = `DISC-${String(this.data.discounts.length + 1).padStart(3, '0')}`;
    const newDisc = {
      id,
      timesUsed: 0,
      status: "active",
      ...discData
    };
    this.data.discounts.push(newDisc);
    this.save();
    return newDisc;
  }

  deleteDiscount(id) {
    this.data.discounts = this.data.discounts.filter(d => d.id !== id);
    this.save();
    return true;
  }

  // --- SUBSCRIPTIONS ---
  getSubscriptions(filter = {}) {
    let list = this.data.subscriptions;
    if (filter.customerId) {
      list = list.filter(s => s.customerId === filter.customerId);
    }
    if (filter.status) {
      list = list.filter(s => s.status === filter.status);
    }
    return list;
  }

  findSubscriptionById(id) {
    return this.data.subscriptions.find(s => s.id === id);
  }

  saveSubscription(subData) {
    if (subData.id) {
      const idx = this.data.subscriptions.findIndex(s => s.id === subData.id);
      if (idx !== -1) {
        this.data.subscriptions[idx] = { ...this.data.subscriptions[idx], ...subData };
        this.save();
        return this.data.subscriptions[idx];
      }
    }
    const subNum = `SUB-2026-${String(this.data.subscriptions.length + 1).padStart(4, '0')}`;
    const newSub = {
      id: subNum,
      status: subData.status || "Draft",
      createdAt: new Date().toISOString(),
      ...subData
    };
    this.data.subscriptions.push(newSub);
    this.save();
    return newSub;
  }

  updateSubscriptionStatus(id, newStatus) {
    const sub = this.findSubscriptionById(id);
    if (!sub) return null;
    sub.status = newStatus;
    if (newStatus === 'Active' && !sub.startDate) {
      sub.startDate = new Date().toISOString().split('T')[0];
    }
    this.save();
    return sub;
  }

  // --- INVOICES ---
  getInvoices(filter = {}) {
    let list = this.data.invoices;
    if (filter.customerId) {
      list = list.filter(inv => inv.customerId === filter.customerId);
    }
    if (filter.subscriptionId) {
      list = list.filter(inv => inv.subscriptionId === filter.subscriptionId);
    }
    if (filter.status) {
      list = list.filter(inv => inv.status === filter.status);
    }
    return list;
  }

  findInvoiceById(id) {
    return this.data.invoices.find(inv => inv.id === id || inv.invoiceNumber === id);
  }

  saveInvoice(invData) {
    if (invData.id) {
      const idx = this.data.invoices.findIndex(inv => inv.id === invData.id);
      if (idx !== -1) {
        this.data.invoices[idx] = { ...this.data.invoices[idx], ...invData };
        this.save();
        return this.data.invoices[idx];
      }
    }
    const invNum = `INV-2026-${String(this.data.invoices.length + 1).padStart(4, '0')}`;
    const newInv = {
      id: invNum,
      invoiceNumber: invNum,
      createdAt: new Date().toISOString(),
      ...invData
    };
    this.data.invoices.push(newInv);
    this.save();
    return newInv;
  }

  updateInvoiceStatus(id, newStatus) {
    const inv = this.findInvoiceById(id);
    if (!inv) return null;
    inv.status = newStatus;
    if (newStatus === 'Paid') {
      inv.amountPaid = inv.totalAmount;
      inv.balanceDue = 0;
    }
    this.save();
    return inv;
  }

  // --- PAYMENTS ---
  getPayments(filter = {}) {
    let list = this.data.payments;
    if (filter.customerId) {
      list = list.filter(p => p.customerId === filter.customerId);
    }
    if (filter.invoiceId) {
      list = list.filter(p => p.invoiceId === filter.invoiceId);
    }
    return list;
  }

  recordPayment(paymentData) {
    const id = `PAY-2026-${String(this.data.payments.length + 1).padStart(4, '0')}`;
    const newPayment = {
      id,
      createdAt: new Date().toISOString(),
      ...paymentData
    };

    // Update corresponding invoice
    const inv = this.findInvoiceById(paymentData.invoiceId);
    if (inv) {
      inv.amountPaid = Number((Number(inv.amountPaid || 0) + Number(paymentData.amount)).toFixed(2));
      inv.balanceDue = Number(Math.max(0, Number(inv.totalAmount) - Number(inv.amountPaid)).toFixed(2));
      if (inv.balanceDue <= 0.01) {
        inv.status = 'Paid';
        inv.balanceDue = 0;
      }
    }

    this.data.payments.unshift(newPayment);
    this.save();
    return { payment: newPayment, invoice: inv };
  }

  // --- BILLING DAY BATCH ENGINE ---
  /**
   * Evaluates active subscriptions that require billing.
   * Ensures IDEMPOTENCY: prevents double billing within the current cycle.
   */
  runBillingDay(forceAll = false) {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeSubs = this.data.subscriptions.filter(s => s.status === 'Active');
    const createdInvoices = [];
    const skippedSubs = [];

    for (const sub of activeSubs) {
      // Check if already billed for the current billing interval
      // In a real system, nextBillingDate <= today.
      const isDue = forceAll || !sub.lastBilledDate || sub.nextBillingDate <= todayStr;
      
      // Strict anti-double-bill check:
      // Verify if an existing invoice already exists for this subscription in this period
      const alreadyBilledThisPeriod = this.data.invoices.some(inv => 
        inv.subscriptionId === sub.id && 
        inv.periodStart === (sub.lastBilledDate || sub.startDate) &&
        inv.status !== 'Cancelled'
      );

      if (!isDue || (alreadyBilledThisPeriod && !forceAll)) {
        skippedSubs.push({
          subscriptionId: sub.id,
          reason: alreadyBilledThisPeriod ? "Already billed for current cycle" : "Not yet due for billing"
        });
        continue;
      }

      // Calculate line items, taxes, discounts
      let subtotal = 0;
      let totalQty = 0;
      const invoiceLines = sub.lines.map(line => {
        const lineTotal = Number(line.quantity) * Number(line.unitPrice);
        subtotal += lineTotal;
        totalQty += Number(line.quantity);
        return {
          description: `${line.productName} (${line.variantName || 'Standard'})`,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: lineTotal
        };
      });

      // Calculate discount
      let discountAmount = 0;
      let appliedDiscountCode = sub.discountCode || null;
      if (appliedDiscountCode) {
        const disc = this.findDiscountByCode(appliedDiscountCode);
        if (disc && disc.status === 'active') {
          // Check validity
          const validDate = (!disc.startDate || todayStr >= disc.startDate) &&
                            (!disc.endDate || todayStr <= disc.endDate);
          const validUses = !disc.maxUses || disc.timesUsed < disc.maxUses;
          const validQty = !disc.minQuantity || totalQty >= disc.minQuantity;
          const validAmt = !disc.minPurchaseAmount || subtotal >= disc.minPurchaseAmount;

          if (validDate && validUses && validQty && validAmt) {
            if (disc.type === 'percentage') {
              if (disc.scope === 'whole_subscription') {
                discountAmount = (subtotal * disc.value) / 100;
              } else if (disc.scope === 'specific_product' && disc.targetProductId) {
                const targetLine = sub.lines.find(l => l.productId === disc.targetProductId);
                if (targetLine) {
                  const targetSubtotal = targetLine.quantity * targetLine.unitPrice;
                  discountAmount = (targetSubtotal * disc.value) / 100;
                }
              }
            } else if (disc.type === 'fixed') {
              discountAmount = Math.min(disc.value, subtotal);
            }
            disc.timesUsed = (disc.timesUsed || 0) + 1;
            if (disc.maxUses && disc.timesUsed >= disc.maxUses) {
              disc.status = 'depleted';
            }
          }
        }
      }

      discountAmount = Number(discountAmount.toFixed(2));
      const taxableAmount = Math.max(0, subtotal - discountAmount);

      // Tax lookup
      const tax = this.data.taxes.find(t => t.id === sub.taxId) || 
                  this.data.taxes.find(t => t.isDefault) || 
                  { rate: 0 };
      const taxRate = tax.rate;
      const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
      const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

      // Calculate period dates
      const periodStart = sub.nextBillingDate || todayStr;
      const periodEndDate = new Date(periodStart);
      if (sub.billingFrequency === 'daily') periodEndDate.setDate(periodEndDate.getDate() + 1);
      else if (sub.billingFrequency === 'weekly') periodEndDate.setDate(periodEndDate.getDate() + 7);
      else if (sub.billingFrequency === 'yearly') periodEndDate.setFullYear(periodEndDate.getFullYear() + 1);
      else periodEndDate.setMonth(periodEndDate.getMonth() + 1); // monthly default

      const periodEnd = periodEndDate.toISOString().split('T')[0];

      // Calculate invoice due date based on payment terms
      const dueDateObj = new Date(todayStr);
      if (sub.paymentTerms === 'Net 15') dueDateObj.setDate(dueDateObj.getDate() + 15);
      else if (sub.paymentTerms === 'Net 30') dueDateObj.setDate(dueDateObj.getDate() + 30);
      else if (sub.paymentTerms === 'Net 60') dueDateObj.setDate(dueDateObj.getDate() + 60);
      else dueDateObj.setDate(dueDateObj.getDate() + 1); // Due on receipt / immediate

      const dueDate = dueDateObj.toISOString().split('T')[0];

      const invNum = `INV-2026-${String(this.data.invoices.length + 1).padStart(4, '0')}`;
      const customer = this.findUserById(sub.customerId) || {};

      const newInvoice = {
        id: invNum,
        invoiceNumber: invNum,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        company: sub.company,
        billingAddress: customer.billingAddress || `${sub.company}, Global Billing Office`,
        status: "Draft", // New billing invoices start as Draft per spec, can be Confirmed/Sent
        issueDate: todayStr,
        dueDate,
        paymentTerms: sub.paymentTerms,
        periodStart,
        periodEnd,
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount,
        discountCode: appliedDiscountCode,
        taxRate,
        taxAmount,
        totalAmount,
        amountPaid: 0.00,
        balanceDue: totalAmount,
        lines: invoiceLines,
        createdAt: new Date().toISOString()
      };

      this.data.invoices.push(newInvoice);
      createdInvoices.push(newInvoice);

      // Advance subscription billing dates
      sub.lastBilledDate = todayStr;
      sub.nextBillingDate = periodEnd;
    }

    this.save();
    return {
      success: true,
      billedCount: createdInvoices.length,
      skippedCount: skippedSubs.length,
      invoices: createdInvoices,
      skipped: skippedSubs
    };
  }

  // --- ANALYTICS ENGINE (Sub-2s response for Finance Lead) ---
  getFinanceMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const subs = this.data.subscriptions;
    const invs = this.data.invoices;
    const payments = this.data.payments;

    let activeCount = 0;
    let quotationCount = 0;
    let draftCount = 0;
    let closedCount = 0;
    let mrr = 0;
    let arr = 0;

    subs.forEach(s => {
      if (s.status === 'Active') {
        activeCount++;
        // Calculate sub normalized monthly value
        let subSum = 0;
        s.lines.forEach(l => {
          subSum += Number(l.quantity) * Number(l.unitPrice);
        });
        if (s.billingFrequency === 'monthly') {
          mrr += subSum;
          arr += subSum * 12;
        } else if (s.billingFrequency === 'yearly') {
          mrr += subSum / 12;
          arr += subSum;
        } else if (s.billingFrequency === 'weekly') {
          mrr += subSum * 4.33;
          arr += subSum * 52;
        } else if (s.billingFrequency === 'daily') {
          mrr += subSum * 30;
          arr += subSum * 365;
        }
      } else if (s.status === 'Quotation') {
        quotationCount++;
      } else if (s.status === 'Draft') {
        draftCount++;
      } else if (s.status === 'Closed') {
        closedCount++;
      }
    });

    let totalCollectedRevenue = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let overdueCount = 0;

    const agingBuckets = {
      current: 0,
      days1_15: 0,
      days16_30: 0,
      days30Plus: 0
    };

    invs.forEach(inv => {
      if (inv.status !== 'Cancelled') {
        totalCollectedRevenue += Number(inv.amountPaid || 0);
        const bal = Number(inv.balanceDue || 0);
        if (bal > 0) {
          totalOutstanding += bal;
          if (inv.dueDate < today && inv.status !== 'Draft') {
            totalOverdue += bal;
            overdueCount++;

            // Calculate days overdue
            const diffDays = Math.ceil((new Date(today) - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
            if (diffDays <= 15) agingBuckets.days1_15 += bal;
            else if (diffDays <= 30) agingBuckets.days16_30 += bal;
            else agingBuckets.days30Plus += bal;
          } else {
            agingBuckets.current += bal;
          }
        }
      }
    });

    // Payment method breakdown
    const paymentMethods = {};
    payments.forEach(p => {
      paymentMethods[p.method] = (paymentMethods[p.method] || 0) + Number(p.amount);
    });

    // Monthly revenue trend (last 6 months simulated + actual)
    const monthlyTrend = [
      { month: "May", billed: 18200, collected: 18200, newSubs: 3 },
      { month: "Jun", billed: 22400, collected: 21900, newSubs: 4 },
      { month: "Jul", billed: 26800, collected: 25400, newSubs: 5 },
      { month: "Aug", billed: 31500, collected: 30200, newSubs: 6 },
      { month: "Sep", billed: 35100, collected: 33800, newSubs: 4 },
      { month: "Oct", billed: Number((totalCollectedRevenue + totalOutstanding).toFixed(0)), collected: Number(totalCollectedRevenue.toFixed(0)), newSubs: activeCount }
    ];

    return {
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      activeSubscriptions: activeCount,
      quotationSubscriptions: quotationCount,
      draftSubscriptions: draftCount,
      closedSubscriptions: closedCount,
      totalCustomers: this.data.users.filter(u => u.role === 'customer').length,
      arpu: activeCount > 0 ? Number((mrr / activeCount).toFixed(2)) : 0,
      totalCollectedRevenue: Number(totalCollectedRevenue.toFixed(2)),
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      totalOverdue: Number(totalOverdue.toFixed(2)),
      overdueCount,
      agingBuckets: {
        current: Number(agingBuckets.current.toFixed(2)),
        days1_15: Number(agingBuckets.days1_15.toFixed(2)),
        days16_30: Number(agingBuckets.days16_30.toFixed(2)),
        days30Plus: Number(agingBuckets.days30Plus.toFixed(2))
      },
      paymentMethods,
      monthlyTrend
    };
  }
}

export const db = new Database();
