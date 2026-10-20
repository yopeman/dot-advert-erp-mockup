'use client';

import React, { useState } from 'react';
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
import GoldenStoryModal from '@/components/demo/GoldenStoryModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isGoldenStoryOpen, setIsGoldenStoryOpen] = useState(false);
  const pathname = usePathname();

  const isCrmPage = pathname.startsWith('/crm');
  const isOrdersPage = pathname.startsWith('/orders');
  const isSalesPage = pathname.startsWith('/sales');
  const isNoSidebarPage = pathname === '/' || pathname === '/modules' || pathname === '/forms';

  return (
    <ErpDataProvider>
      <div className="app-container">
        {isCrmPage ? (
          <CrmSidebar />
        ) : isOrdersPage ? (
          <OrdersSidebar />
        ) : isSalesPage ? (
          <SalesSidebar />
        ) : (
          !isNoSidebarPage && <Sidebar />
        )}
        <div className="main-content" style={{ width: isNoSidebarPage ? '100%' : undefined }}>
          {isCrmPage ? (
            <CrmHeader />
          ) : isOrdersPage ? (
            <OrdersHeader />
          ) : isSalesPage ? (
            <SalesHeader />
          ) : (
            <Header onOpenGoldenStory={() => setIsGoldenStoryOpen(true)} />
          )}
          <main className="page-body">{children}</main>
        </div>
      </div>
      <GoldenStoryModal
        isOpen={isGoldenStoryOpen}
        onClose={() => setIsGoldenStoryOpen(false)}
      />
    </ErpDataProvider>
  );
}
