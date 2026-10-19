'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ErpDataProvider } from '@/context/ErpDataContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GoldenStoryModal from '@/components/demo/GoldenStoryModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isGoldenStoryOpen, setIsGoldenStoryOpen] = useState(false);
  const pathname = usePathname();

  const isNoSidebarPage = pathname === '/modules' || pathname === '/forms';

  return (
    <ErpDataProvider>
      <div className="app-container">
        {!isNoSidebarPage && <Sidebar />}
        <div className="main-content" style={{ width: isNoSidebarPage ? '100%' : undefined }}>
          <Header onOpenGoldenStory={() => setIsGoldenStoryOpen(true)} />
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
