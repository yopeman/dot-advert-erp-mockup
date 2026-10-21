'use client';

import React, { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { ErpDataProvider } from '@/context/ErpDataContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CrmSidebar from '@/components/crm/CrmSidebar';
import CrmHeader from '@/components/crm/CrmHeader';
import OrdersSidebar from '@/components/orders/OrdersSidebar';
import OrdersHeader from '@/components/orders/OrdersHeader';
import SalesSidebar from '@/components/sales/SalesSidebar';
import SalesHeader from '@/components/sales/SalesHeader';
import FinanceSidebar from '@/components/finance/FinanceSidebar';
import FinanceHeader from '@/components/finance/FinanceHeader';
import ReportSidebar from '@/components/report/ReportSidebar';
import ReportHeader from '@/components/report/ReportHeader';
import HrSidebar from '@/components/hr/HrSidebar';
import HrHeader from '@/components/hr/HrHeader';
import StoreSidebar from '@/components/store/StoreSidebar';
import StoreHeader from '@/components/store/StoreHeader';
import GoldenStoryModal from '@/components/demo/GoldenStoryModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isGoldenStoryOpen, setIsGoldenStoryOpen] = useState(false);
  const pathname = usePathname();

  const isCrmPage = pathname?.startsWith('/crm');
  const isOrdersPage = pathname?.startsWith('/orders');
  const isSalesPage = pathname?.startsWith('/sales');
  const isFinancePage = pathname?.startsWith('/finance');
  const isReportPage = pathname?.startsWith('/report');
  const isNoSidebarPage = pathname === '/' || pathname === '/modules' || pathname === '/forms';
  const isHrPage = pathname?.startsWith('/hr');
  const isStorePage = pathname?.startsWith('/inventory') || pathname?.startsWith('/dashboard/inventory');

  return (
    <ErpDataProvider>
      <div className="app-container" style={{ background: 'var(--bg-app)' }}>
        <Suspense fallback={null}>
          {isCrmPage ? (
            <CrmSidebar />
          ) : isHrPage ? (
            <HrSidebar />
          ) : isStorePage ? (
            <StoreSidebar />
          ) : isOrdersPage ? (
            <OrdersSidebar />
          ) : isSalesPage ? (
            <SalesSidebar />
          ) : isFinancePage ? (
            <FinanceSidebar />
          ) : isReportPage ? (
            <ReportSidebar />
          ) : (
            !isNoSidebarPage && <Sidebar />
          )}
        </Suspense>
        <div
          className="main-content"
          style={{
            width: isNoSidebarPage ? '100%' : undefined,
            background: 'var(--bg-app)',
          }}
        >
          <Suspense fallback={null}>
            {isCrmPage ? (
              <CrmHeader />
            ) : isHrPage ? (
              <HrHeader />
            ) : isStorePage ? (
              <StoreHeader />
            ) : isOrdersPage ? (
              <OrdersHeader />
            ) : isSalesPage ? (
              <SalesHeader />
            ) : isFinancePage ? (
              <FinanceHeader />
            ) : isReportPage ? (
              <ReportHeader />
            ) : (
              <Header onOpenGoldenStory={() => setIsGoldenStoryOpen(true)} />
            )}
          </Suspense>
          <main
            className="page-body"
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              maxWidth: isNoSidebarPage ? '1440px' : '1680px',
            }}
          >
            {children}
          </main>
        </div>
      </div>
      <GoldenStoryModal
        isOpen={isGoldenStoryOpen}
        onClose={() => setIsGoldenStoryOpen(false)}
      />
    </ErpDataProvider>
  );
}
