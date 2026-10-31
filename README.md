# Brightloop Software | Enterprise Subscription Management & Recurring Billing Platform

A unified subscription management, automated billing, and revenue operations platform engineered to solve every real-world operational challenge outlined in the **Odoo Subscription Management System** problem statement.

Built with a modern, high-end SaaS aesthetic (dark slate / deep navy theme with luminous indigo accents, glassmorphic KPI cards, interactive Recharts, and instant sub-100ms response times).

---

## 🌟 Problem Statement Scene Fulfillment

| Scene from Brightloop Case | Implemented Capability in Brightloop OS |
|---|---|
| **A New Customer Signs Up** | Strict password validation (`> 8 chars`, uppercase, lowercase, special character), unique email enforcement, password reset dispatch simulation, and multi-tier RBAC (`Admin`, `Staff`, `Customer`). |
| **Only Admin Adds Staff** | Admin-exclusive staff onboarding portal with departmental assignment and credential provisioning. |
| **Launching a New Plan & Variants** | Product catalog with brand variants—specifically featuring the **Odoo Brand Edition adding +$560 to the base price**. Flexible frequencies (`Daily`, `Weekly`, `Monthly`, `Yearly`), minimum seat requirements, and plan policies (`auto_close_on_end`, `can_close_early`, `can_pause`, `can_renew`). |
| **Turning a Quote into a Subscription** | Pre-configured **Quotation Templates** ("SME Quick-Start", "Enterprise Odoo Suite", "Warehouse Special"), validity duration counters, and a visual 5-stage lifecycle state machine: `Draft` &rarr; `Quotation` &rarr; `Confirmed` &rarr; `Active` &rarr; `Closed`. |
| **Billing Day Batch Invoicing** | Automated batch billing engine. Scans due active subscriptions, generates itemized invoices with customer details, applied taxes, and discounts. **Strict anti-double-billing idempotency guard** guarantees nothing is billed twice or skipped. |
| **Taxes & Invoicing Lifecycle** | Admin-defined tax rates (`8.25% Sales Tax`, `20% VAT`, `18% GST`, `0% Exempt`). Invoices progress from `Draft` &rarr; `Confirmed` &rarr; `Paid` (or `Cancelled`), with email dispatch simulation and printable/PDF exports. |
| **A Customer Asks for a Better Price** | Admin-only discount rules engine: Fixed ($) or Percentage (%), scoped to whole subscription or specific products, minimum spend / seat thresholds, validity windows, and **maximum usage counters** that auto-decrement on invoice generation. |
| **The Money Comes In** | Reconciled payments ledger tracking multiple payment methods (`Bank Transfer / Wire`, `Credit Card`, `ACH`, `Cash`, `UPI`), payment dates, and transaction memo notes against specific invoices. Supports partial and full settlement with real-time balance tracking. |
| **The Finance Lead at Month-End** | Executive Financial Dashboard responding in milliseconds (&lt; 2 seconds requirement): **MRR, ARR, Active Subscriptions count, Receivables Aging Buckets (Current, 1-15, 16-30, 30+ days)**, and an overdue invoice chasing table. |
| **Customer Self-Service Portal** | Dedicated client portal allowing customers to view their active subscription, **switch add-on modules on and off dynamically**, view invoices, and pay online. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Iconography, Recharts, Canvas Confetti.
- **Backend API**: Node.js & Express 5 REST API (`/api/auth`, `/api/products`, `/api/plans`, `/api/subscriptions`, `/api/billing`, `/api/invoices`, `/api/payments`, `/api/discounts`, `/api/taxes`, `/api/analytics`).
- **Database**: Relational JSON storage with ACID-like atomic disk persistence and seed data reset capability.
- **Print & PDF Engine**: Professional CSS print stylesheets for printable commercial invoices.

---

## 🚀 Quick Start Guide

### 1. Start the Unified Server (Backend + Frontend)
```powershell
node server/index.js
```
The application will be live at: **`http://localhost:5001`**

### 2. (Optional) Run in Vite Development Mode
```powershell
# In terminal 1 (API Server):
npm run server

# In terminal 2 (Vite Hot-Reload):
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 👥 Instant Role Impersonation (1-Click Switcher)

A dedicated persona switcher is available in the top navigation bar to test all user roles instantly without manual logouts:

1. **Admin (`Elena Vance` - `admin@brightloop.com`)**: Full administrative control over tax rates, discount rules, staff onboarding, product catalogs, and financial reports.
2. **Internal Staff (`Marcus Brody` - `staff@brightloop.com`)**: Day-to-day sales and operations: prepares quotes, manages subscriptions, logs payments, dispatches invoices.
3. **Enterprise Customer (`David Sterling` - `Apex Retail Group`)**: High-value client with an annual contract, Odoo brand edition, and 24/7 SLA.
4. **Small Business Customer (`Sarah Jenkins` - `Artisan Coffee Roasters`)**: Monthly shop owner with an active plan, self-service add-ons, and overdue invoice tracking.

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Elena Vance | `admin@brightloop.com` | `Brightloop#2026` |
| **Staff** | Marcus Brody | `staff@brightloop.com` | `Brightloop#Staff1` |
| **Customer** | David Sterling | `customer1@apexretail.com` | `Customer#Apex1` |
| **Customer** | Sarah Jenkins | `customer2@artisanbrew.com` | `Customer#Brew1` |
| **Customer** | Liam Chen | `customer3@nimbuscloud.io` | `Customer#Nimbus1` |

*(All pre-configured passwords strictly comply with the rule: > 8 characters, with uppercase, lowercase, and special characters).*

---

## 📊 Key Highlights & Screenshots Breakdown

- **Executive Command Center**: Live interactive charts with MRR, ARR, Cash Inflows, and Receivables Aging.
- **Pipeline Stepper**: Visual drag-and-drop or stepper pipeline tracking subscription statuses from quotation to confirmed renewal.
- **Billing Day Modal**: Single-click batch processor that generates all due recurring invoices with zero duplication.
- **Printable Commercial Invoices**: Crisp, pixel-perfect printable invoice template complete with company details, QR/tax notes, line item breakdowns, and watermark stamps (`PAID IN FULL` / `OVERDUE NOTICE`).
- **One-Click System Reset**: Re-seed demo records at any time via the top bar reset button.
