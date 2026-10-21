'use client';

import React, { Suspense } from 'react';
import StoreModule from '@/components/store/StoreModule';

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
          <div
            style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid #facc15',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: '16px', fontWeight: 600, color: '#09090b', fontSize: '1rem' }}>
            Loading DOT Advert Inventory Control...
          </p>
        </div>
      }
    >
      <StoreModule />
    </Suspense>
  );
}
