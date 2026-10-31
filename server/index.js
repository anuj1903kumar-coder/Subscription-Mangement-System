import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ==========================================
// 1. AUTHENTICATION & RBAC
// ==========================================

// Password validation rule per problem statement:
// "the password must be more than eight characters, with an uppercase letter, a lowercase letter and a special character"
function validatePassword(password) {
  if (!password || password.length <= 8) {
    return "Password must be more than 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}

// User signup (customer)
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, company, phone, billingAddress } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  // Password criteria check
  const pwdErr = validatePassword(password);
  if (pwdErr) {
    return res.status(400).json({ error: pwdErr });
  }

  // Unique email check: "Each email can belong to only one account"
  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const newUser = db.createUser({
    email,
    password,
    name,
    role: "customer", // standard registration registers as customer
    company: company || "Independent Business",
    phone: phone || "",
    billingAddress: billingAddress || ""
  });

  return res.status(201).json({
    message: "Account registered successfully.",
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      company: newUser.company
    }
  });
});

// Admin-only Staff Onboarding: "Only the admin can add a new member of staff."
app.post('/api/auth/staff', (req, res) => {
  const { adminEmail, email, password, name, department } = req.body;

  const adminUser = db.findUserByEmail(adminEmail);
  if (!adminUser || adminUser.role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Only system administrators can onboard staff members." });
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and staff member name are required." });
  }

  const pwdErr = validatePassword(password);
  if (pwdErr) {
    return res.status(400).json({ error: pwdErr });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const newStaff = db.createUser({
    email,
    password,
    name,
    role: "staff",
    department: department || "Operations & Support",
    company: "Brightloop Software Corp."
  });

  return res.status(201).json({
    message: "Staff member created successfully.",
    user: newStaff
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password credentials." });
  }

  return res.json({
    message: "Login successful.",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      department: user.department,
      billingAddress: user.billingAddress
    }
  });
});

// Forgot Password - "If they forget it later, a reset link should arrive at their registered email."
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.findUserByEmail(email);

  if (!user) {
    // For security, don't leak user existence directly, but for demo let's be informative
    return res.status(404).json({ error: "No account found matching this email address." });
  }

  const resetToken = `tok_${Math.random().toString(36).substring(2, 12)}`;
  const resetLink = `http://localhost:3000/#reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  return res.json({
    message: "Password reset link sent to your email.",
    email,
    resetToken,
    resetLink,
    debugInfo: "Simulation: An email has been dispatched with the reset link."
  });
});

// Reset Password with token
app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const pwdErr = validatePassword(newPassword);
  if (pwdErr) {
    return res.status(400).json({ error: pwdErr });
  }

  user.password = newPassword;
  db.save();

  return res.json({ message: "Password updated successfully. You can now log in." });
});

// List users (for admin dropdowns & impersonation)
app.get('/api/users', (req, res) => {
  const safeUsers = db.getUsers().map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    company: u.company,
    department: u.department,
    billingAddress: u.billingAddress,
    createdAt: u.createdAt
  }));
  return res.json(safeUsers);
});

// ==========================================
// 2. PRODUCTS & VARIANTS
// ==========================================
app.get('/api/products', (req, res) => {
  return res.json(db.getProducts());
});

app.post('/api/products', (req, res) => {
  const { name, type, salesPrice, costPrice, notes, variants } = req.body;
  if (!name || salesPrice === undefined) {
    return res.status(400).json({ error: "Product name and sales price are required." });
  }

  const saved = db.saveProduct({
    name,
    type: type || "Software",
    salesPrice: Number(salesPrice),
    costPrice: Number(costPrice || 0),
    notes: notes || "",
    variants: Array.isArray(variants) ? variants : [
      { id: "var_std", name: "Standard", priceDelta: 0, description: "Default edition" }
    ]
  });

  return res.status(201).json(saved);
});

app.put('/api/products/:id', (req, res) => {
  const saved = db.saveProduct({ id: req.params.id, ...req.body });
  return res.json(saved);
});

app.delete('/api/products/:id', (req, res) => {
  db.deleteProduct(req.params.id);
  return res.json({ success: true });
});

// ==========================================
// 3. PLANS & POLICIES
// ==========================================
app.get('/api/plans', (req, res) => {
  return res.json(db.getPlans());
});

app.post('/api/plans', (req, res) => {
  const { name, cost, billingFrequency, minQuantity, availableFrom, availableTo, autoCloseOnEnd, canCloseEarly, canPause, canRenew, description } = req.body;
  if (!name || cost === undefined || !billingFrequency) {
    return res.status(400).json({ error: "Name, cost, and billing frequency are required." });
  }

  const saved = db.savePlan({
    name,
    cost: Number(cost),
    billingFrequency, // daily, weekly, monthly, yearly
    minQuantity: Number(minQuantity || 1),
    availableFrom: availableFrom || new Date().toISOString().split('T')[0],
    availableTo: availableTo || "2030-12-31",
    autoCloseOnEnd: Boolean(autoCloseOnEnd),
    canCloseEarly: canCloseEarly !== undefined ? Boolean(canCloseEarly) : true,
    canPause: canPause !== undefined ? Boolean(canPause) : true,
    canRenew: canRenew !== undefined ? Boolean(canRenew) : true,
    description: description || ""
  });

  return res.status(201).json(saved);
});

app.put('/api/plans/:id', (req, res) => {
  const saved = db.savePlan({ id: req.params.id, ...req.body });
  return res.json(saved);
});

app.delete('/api/plans/:id', (req, res) => {
  db.deletePlan(req.params.id);
  return res.json({ success: true });
});

// ==========================================
// 4. QUOTATION TEMPLATES
// ==========================================
app.get('/api/templates', (req, res) => {
  return res.json(db.getTemplates());
});

app.post('/api/templates', (req, res) => {
  const { name, planId, validityDays, description, lines } = req.body;
  if (!name || !planId) {
    return res.status(400).json({ error: "Template name and planId are required." });
  }

  const saved = db.saveTemplate({
    name,
    planId,
    validityDays: Number(validityDays || 30),
    description: description || "",
    lines: Array.isArray(lines) ? lines : []
  });

  return res.status(201).json(saved);
});

app.delete('/api/templates/:id', (req, res) => {
  db.deleteTemplate(req.params.id);
  return res.json({ success: true });
});

// ==========================================
// 5. TAXES & DISCOUNTS
// ==========================================
app.get('/api/taxes', (req, res) => {
  return res.json(db.getTaxes());
});

app.post('/api/taxes', (req, res) => {
  const { name, rate, isDefault, code, notes } = req.body;
  if (!name || rate === undefined) {
    return res.status(400).json({ error: "Tax rule name and rate are required." });
  }

  if (isDefault) {
    // unset other defaults
    db.getTaxes().forEach(t => { t.isDefault = false; });
  }

  const saved = db.saveTax({
    name,
    rate: Number(rate),
    isDefault: Boolean(isDefault),
    code: code || `TAX-${rate}`,
    notes: notes || ""
  });

  return res.status(201).json(saved);
});

app.delete('/api/taxes/:id', (req, res) => {
  db.deleteTax(req.params.id);
  return res.json({ success: true });
});

// Discounts
app.get('/api/discounts', (req, res) => {
  return res.json(db.getDiscounts());
});

app.post('/api/discounts', (req, res) => {
  const { code, name, type, value, scope, targetProductId, minQuantity, minPurchaseAmount, startDate, endDate, maxUses, notes } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: "Discount code, type, and value are required." });
  }

  const saved = db.saveDiscount({
    code: code.trim().toUpperCase(),
    name: name || code.trim().toUpperCase(),
    type, // 'fixed' or 'percentage'
    value: Number(value),
    scope: scope || "whole_subscription", // 'whole_subscription' or 'specific_product'
    targetProductId: targetProductId || null,
    minQuantity: Number(minQuantity || 1),
    minPurchaseAmount: Number(minPurchaseAmount || 0),
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || "2030-12-31",
    maxUses: Number(maxUses || 100),
    notes: notes || ""
  });

  return res.status(201).json(saved);
});

app.put('/api/discounts/:id', (req, res) => {
  const saved = db.saveDiscount({ id: req.params.id, ...req.body });
  return res.json(saved);
});

app.delete('/api/discounts/:id', (req, res) => {
  db.deleteDiscount(req.params.id);
  return res.json({ success: true });
});

// ==========================================
// 6. SUBSCRIPTIONS & QUOTES LIFECYCLE
// State machine: Draft -> Quotation -> Confirmed -> Active -> Closed (+ Paused)
// ==========================================
app.get('/api/subscriptions', (req, res) => {
  const { customerId, status } = req.query;
  const list = db.getSubscriptions({ customerId, status });
  return res.json(list);
});

app.get('/api/subscriptions/:id', (req, res) => {
  const sub = db.findSubscriptionById(req.params.id);
  if (!sub) return res.status(404).json({ error: "Subscription not found." });
  return res.json(sub);
});

app.post('/api/subscriptions', (req, res) => {
  const { customerId, planId, lines, paymentTerms, startDate, expiryDate, discountCode, taxId, status } = req.body;

  if (!customerId || !planId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: "Customer, plan, and at least one product line are required." });
  }

  const customer = db.findUserById(customerId);
  const plan = db.findPlanById(planId);

  if (!customer) return res.status(400).json({ error: "Selected customer does not exist." });
  if (!plan) return res.status(400).json({ error: "Selected plan does not exist." });

  // Plan minimum quantity verification
  const totalQty = lines.reduce((acc, l) => acc + Number(l.quantity), 0);
  if (totalQty < plan.minQuantity) {
    return res.status(400).json({ error: `This plan requires a minimum order quantity of ${plan.minQuantity} units. Currently selected: ${totalQty}.` });
  }

  // Pre-calculate line subtotals
  const enrichedLines = lines.map((l, index) => {
    const prod = db.findProductById(l.productId);
    const variant = prod?.variants?.find(v => v.id === l.variantId);
    const unitPrice = Number(l.unitPrice !== undefined ? l.unitPrice : (Number(prod?.salesPrice || 0) + Number(variant?.priceDelta || 0)));
    const qty = Number(l.quantity || 1);
    return {
      id: `line_${Date.now()}_${index}`,
      productId: l.productId,
      productName: prod?.name || "Product",
      variantId: l.variantId || null,
      variantName: variant?.name || "Standard",
      quantity: qty,
      unitPrice,
      taxRate: 8.25,
      subtotal: Number((unitPrice * qty).toFixed(2))
    };
  });

  const now = new Date();
  const startStr = startDate || now.toISOString().split('T')[0];
  const expiryDateObj = new Date(startStr);
  if (plan.billingFrequency === 'yearly') expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
  else expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);

  const subStatus = status || "Draft";

  const newSub = db.saveSubscription({
    customerId,
    customerName: customer.name,
    customerEmail: customer.email,
    company: customer.company || "Client Company",
    planId,
    planName: plan.name,
    billingFrequency: plan.billingFrequency,
    status: subStatus,
    startDate: startStr,
    expiryDate: expiryDate || expiryDateObj.toISOString().split('T')[0],
    paymentTerms: paymentTerms || "Net 30",
    lastBilledDate: null,
    nextBillingDate: startStr,
    taxId: taxId || "TAX-001",
    discountCode: discountCode || null,
    lines: enrichedLines
  });

  return res.status(201).json(newSub);
});

// Update subscription status along state machine
app.patch('/api/subscriptions/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed', 'Paused'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
  }

  const sub = db.findSubscriptionById(req.params.id);
  if (!sub) return res.status(404).json({ error: "Subscription not found." });

  const plan = db.findPlanById(sub.planId);
  // Check plan policies if attempting to close early or pause
  if (status === 'Closed' && plan && !plan.canCloseEarly && sub.status === 'Active') {
    return res.status(400).json({ error: `The plan "${plan.name}" does not permit closing subscriptions before expiry.` });
  }
  if (status === 'Paused' && plan && !plan.canPause) {
    return res.status(400).json({ error: `The plan "${plan.name}" does not allow pausing.` });
  }

  const updated = db.updateSubscriptionStatus(req.params.id, status);
  return res.json(updated);
});

// Modify subscription lines or details
app.put('/api/subscriptions/:id', (req, res) => {
  const sub = db.findSubscriptionById(req.params.id);
  if (!sub) return res.status(404).json({ error: "Subscription not found." });

  const updated = db.saveSubscription({ id: req.params.id, ...req.body });
  return res.json(updated);
});

// ==========================================
// 7. INVOICING & BILLING DAY ENGINE
// ==========================================
app.get('/api/invoices', (req, res) => {
  const { customerId, subscriptionId, status } = req.query;
  const list = db.getInvoices({ customerId, subscriptionId, status });
  return res.json(list);
});

app.get('/api/invoices/:id', (req, res) => {
  const inv = db.findInvoiceById(req.params.id);
  if (!inv) return res.status(404).json({ error: "Invoice not found." });
  return res.json(inv);
});

// Update invoice status: Draft -> Confirmed -> Paid (or Cancelled)
app.patch('/api/invoices/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['Draft', 'Confirmed', 'Paid', 'Cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${valid.join(', ')}` });
  }

  const updated = db.updateInvoiceStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Invoice not found." });
  return res.json(updated);
});

// Send invoice simulation
app.post('/api/invoices/:id/send', (req, res) => {
  const inv = db.findInvoiceById(req.params.id);
  if (!inv) return res.status(404).json({ error: "Invoice not found." });

  // If in Draft, sending confirms it
  if (inv.status === 'Draft') {
    inv.status = 'Confirmed';
    db.save();
  }

  return res.json({
    success: true,
    message: `Invoice ${inv.invoiceNumber} has been dispatched to ${inv.customerEmail}.`,
    recipient: inv.customerEmail,
    sentAt: new Date().toISOString(),
    invoice: inv
  });
});

// Billing Day Automated Batch Engine
app.post('/api/billing/run', (req, res) => {
  const { forceAll } = req.body || {};
  const result = db.runBillingDay(Boolean(forceAll));
  return res.json(result);
});

// ==========================================
// 8. PAYMENTS
// ==========================================
app.get('/api/payments', (req, res) => {
  const { customerId, invoiceId } = req.query;
  const list = db.getPayments({ customerId, invoiceId });
  return res.json(list);
});

app.post('/api/payments', (req, res) => {
  const { invoiceId, amount, method, date, referenceNote } = req.body;
  if (!invoiceId || !amount || Number(amount) <= 0 || !method) {
    return res.status(400).json({ error: "Invoice, payment amount (>0), and payment method are required." });
  }

  const inv = db.findInvoiceById(invoiceId);
  if (!inv) return res.status(404).json({ error: "Invoice not found." });

  const result = db.recordPayment({
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerId: inv.customerId,
    customerName: inv.customerName,
    amount: Number(Number(amount).toFixed(2)),
    method, // 'Bank Transfer', 'Credit Card', 'ACH', 'Cash', 'UPI'
    date: date || new Date().toISOString().split('T')[0],
    referenceNote: referenceNote || ""
  });

  return res.status(201).json(result);
});

// ==========================================
// 9. FINANCE EXECUTIVE ANALYTICS
// ==========================================
app.get('/api/analytics', (req, res) => {
  const metrics = db.getFinanceMetrics();
  return res.json(metrics);
});

// ==========================================
// 10. SYSTEM RESET TO INITIAL BRIGHTLOOP DEMO
// ==========================================
app.post('/api/reset', (req, res) => {
  const fresh = db.reset();
  return res.json({ success: true, message: "System database successfully re-seeded with demo data.", data: fresh });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Serve frontend static build if present
const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("API Server is running. In development, open Vite on port 3000.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Brightloop API Server] running on http://localhost:${PORT}`);
});
