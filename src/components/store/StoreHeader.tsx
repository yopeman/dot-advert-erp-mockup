'use client';

import React from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  AlertTriangle,
  Boxes,
  LayoutDashboard,
  LayoutGrid,
  PackageCheck,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';

export default function StoreHeader() {
  const { items, stores, lowStockItems } = useErp();
  const totalValuation = items.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  return (
    <header
      style={{
        height: '68px',
        background: 'rgba(9, 9, 11, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#facc15',
              boxShadow: '0 0 10px #facc15',
            }}
          />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Dot Advert Store & Purchasing Inventory Control Tower
            </div>
            <div style={{ fontSize: '0.675rem', color: '#a1a1aa' }}>
              Stores & Purchasing • Stock Ledger • Procurement Governance
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            color: '#a1a1aa',
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          Addis Ababa • ETB
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: 8,
            background: 'rgba(250,204,21,0.12)',
            border: '1px solid rgba(250,204,21,0.28)',
            color: '#facc15',
          }}
          title="Total inventory valuation"
        >
          <Boxes size={13} />
          <span>{formatETB(totalValuation)}</span>
        </div>

        <div
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid #3f3f46',
            color: '#e4e4e7',
          }}
          title="Active warehouses"
        >
          <Warehouse size={13} />
          <span>{stores.length} Warehouses</span>
        </div>

        <div
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: 8,
            background: lowStockItems.length ? 'rgba(225,29,72,0.14)' : 'rgba(16,185,129,0.12)',
            border: lowStockItems.length ? '1px solid rgba(225,29,72,0.3)' : '1px solid rgba(16,185,129,0.28)',
            color: lowStockItems.length ? '#fb7185' : '#6ee7b7',
          }}
          title="Items below reorder threshold"
        >
          {lowStockItems.length ? <AlertTriangle size={13} /> : <PackageCheck size={13} />}
          <span>{lowStockItems.length ? `${lowStockItems.length} Low Stock` : 'Stock Healthy'}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #3f3f46',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: '0.78rem',
            color: '#facc15',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={14} />
          <span>Admin-Governed Ledger</span>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
          title="Return to Executive ERP Dashboard"
        >
          <LayoutDashboard size={14} />
          <span>Main ERP</span>
        </Link>

        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
          title="View all ERP modules"
        >
          <LayoutGrid size={14} />
          <span>Modules</span>
        </Link>
      </div>
    </header>
  );
}
