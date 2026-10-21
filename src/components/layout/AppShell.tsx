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
  const isHrPage = pathname?.startsWith('/hr') || pathname?.startsWith('/inventory');

  return (
    <ErpDataProvider>
      <div className="app-container" style={{ background: isHrPage ? '#f8fafc' : undefined }}>
        {!isNoSidebarPage && <Sidebar />}
        <div
          className="main-content"
          style={{
            width: isNoSidebarPage ? '100%' : undefined,
            background: isHrPage ? '#f8fafc' : undefined,
          }}
        >
          <Header onOpenGoldenStory={() => setIsGoldenStoryOpen(true)} />
          <main
            className="page-body"
            style={{
              background: isHrPage ? '#f8fafc' : undefined,
              color: isHrPage ? '#0f172a' : undefined,
              maxWidth: isHrPage ? '1680px' : undefined,
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
