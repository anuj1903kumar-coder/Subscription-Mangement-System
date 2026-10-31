import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { ToastContainer } from './components/Toast';

// Views
import { DashboardView } from './views/DashboardView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { QuotationsView } from './views/QuotationsView';
import { InvoicesView } from './views/InvoicesView';
import { PaymentsView } from './views/PaymentsView';
import { ProductsPlansView } from './views/ProductsPlansView';
import { DiscountsView } from './views/DiscountsView';
import { TaxesView } from './views/TaxesView';
import { StaffUsersView } from './views/StaffUsersView';
import { CustomerPortalView } from './views/CustomerPortalView';

// Modals
import { BillingDayModal } from './components/modals/BillingDayModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { CreateSubscriptionModal } from './components/modals/CreateSubscriptionModal';
import { SubscriptionDetailModal } from './components/modals/SubscriptionDetailModal';
import { InvoiceDetailModal } from './views/InvoiceDetailModal';
import { AuthModal } from './components/modals/AuthModal';

import { Subscription } from './types';

export const App: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal controls
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);

  const [showCreateSubModal, setShowCreateSubModal] = useState(false);
  const [createSubTemplateId, setCreateSubTemplateId] = useState<string | null>(null);

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [authModalMode, setAuthModalMode] = useState<'signup' | 'forgot' | 'staff' | null>(null);

  // Handlers
  const handleOpenRecordPayment = (invoiceId?: string) => {
    setPaymentInvoiceId(invoiceId || null);
    setShowPaymentModal(true);
  };

  const handleOpenCreateFromTemplate = (templateId?: string) => {
    setCreateSubTemplateId(templateId || null);
    setShowCreateSubModal(true);
  };

  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
  };

  // If user switches to customer, default or suggest customer portal view
  React.useEffect(() => {
    if (currentUser?.role === 'customer' && activeTab === 'staff') {
      setActiveTab('portal');
    }
  }, [currentUser, activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ToastContainer />

      {/* Top Header */}
      <Navbar
        onOpenBillingModal={() => setShowBillingModal(true)}
        onOpenAuthModal={(mode) => setAuthModalMode(mode)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onSelectInvoice={handleSelectInvoice}
                onOpenRecordPayment={handleOpenRecordPayment}
              />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionsView
                onOpenCreateWizard={() => {
                  setCreateSubTemplateId(null);
                  setShowCreateSubModal(true);
                }}
                onSelectSubscription={(sub) => setSelectedSub(sub)}
              />
            )}

            {activeTab === 'quotations' && (
              <QuotationsView
                onOpenCreateFromTemplate={handleOpenCreateFromTemplate}
                onSelectSubscription={(sub) => setSelectedSub(sub)}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesView
                onOpenBillingBatchModal={() => setShowBillingModal(true)}
                onSelectInvoice={handleSelectInvoice}
                onOpenRecordPayment={handleOpenRecordPayment}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsView
                onOpenRecordPayment={handleOpenRecordPayment}
                onSelectInvoice={handleSelectInvoice}
              />
            )}

            {activeTab === 'products' && <ProductsPlansView />}

            {activeTab === 'discounts' && <DiscountsView />}

            {activeTab === 'taxes' && <TaxesView />}

            {activeTab === 'staff' && <StaffUsersView />}

            {activeTab === 'portal' && (
              <CustomerPortalView
                onSelectInvoice={handleSelectInvoice}
                onOpenRecordPayment={handleOpenRecordPayment}
              />
            )}
          </div>
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <BillingDayModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        onSelectInvoice={handleSelectInvoice}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        initialInvoiceId={paymentInvoiceId}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentInvoiceId(null);
        }}
      />

      <CreateSubscriptionModal
        isOpen={showCreateSubModal}
        initialTemplateId={createSubTemplateId}
        onClose={() => {
          setShowCreateSubModal(false);
          setCreateSubTemplateId(null);
        }}
      />

      <SubscriptionDetailModal
        subscription={selectedSub}
        onClose={() => setSelectedSub(null)}
        onSelectInvoice={handleSelectInvoice}
      />

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        onOpenRecordPayment={handleOpenRecordPayment}
      />

      <AuthModal
        isOpen={authModalMode !== null}
        mode={authModalMode || 'signup'}
        onClose={() => setAuthModalMode(null)}
      />
    </div>
  );
};
