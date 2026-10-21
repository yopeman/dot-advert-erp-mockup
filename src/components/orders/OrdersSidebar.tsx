'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import {
  Cog,
  Boxes,
  Palette,
  Layers,
  TrendingUp,
  FileText,
  Users,
  Wallet,
  ArrowLeft,
  LayoutGrid,
  Sparkles,
  Printer,
  Hammer,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

function OrdersSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'orders';

  const { orders, workOrders, designProofs, wastages } = useErp();

  const activeOrders = orders.filter((o) => o.status === 'in_production' || o.status === 'pending');
  const pendingProofs = designProofs.filter((d) => d.status === 'client_proofing');
  const totalPipelineRevenue = orders.reduce((sum, o) => sum + o.totalAgreedPrice, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const orderNavItems = [
    {
      tabId: 'orders',
      label: 'Job Orders & Costing',
      href: '/orders?tab=orders',
      icon: Boxes,
      badge: `${orders.length} Jobs`,
      badgeType: 'indigo',
    },
    {
      tabId: 'designs',
      label: 'Design Proofing Hub',
      href: '/orders?tab=designs',
      icon: Palette,
      badge: pendingProofs.length > 0 ? `${pendingProofs.length} Review` : `${designProofs.length} Proofs`,
      badgeType: pendingProofs.length > 0 ? 'amber' : 'purple',
    },
    {
      tabId: 'work_orders',
      label: 'Shopfloor BOM & Stations',
      href: '/orders?tab=work_orders',
      icon: Cog,
      badge: `${workOrders.length} In Hall`,
      badgeType: 'cyan',
    },
  ];

  const crossNavItems = [
    {
      label: 'CRM & Client Pipeline',
      href: '/crm',
      icon: Users,
    },
    {
      label: 'Sales & Proforma Invoices',
      href: '/sales',
      icon: FileText,
    },
    {
      label: 'Inventory & Store Issuance',
      href: '/inventory',
      icon: Layers,
    },
    {
      label: 'Payment Collections',
      href: '/dashboard/collections',
      icon: Wallet,
    },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: '#0c1322',
        borderRight: '1px solid rgba(56, 189, 248, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        {/* Order Specialized Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <BrandLogo size={38} radius={10} />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              DOT ADVERT
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              ORDER & PRODUCTION
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              padding: '6px 12px 4px',
            }}
          >
            Order Workspaces
          </div>

          {orderNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tabId;

            return (
              <Link
                key={item.tabId}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.84rem',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#38bdf8' : 'var(--text-dim)'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`badge badge-${item.badgeType}`}
                    style={{ fontSize: '0.68rem', padding: '2px 7px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Shopfloor Stations Status */}
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              padding: '16px 12px 4px',
            }}
          >
            Machine Routing Stations
          </div>

          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={13} color="#38bdf8" />
                <span>Roland Eco-Solvent</span>
              </div>
              <span style={{ color: '#34d399', fontSize: '0.7rem' }}>Running</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hammer size={13} color="#a855f7" />
                <span>Laser & Channel Bay</span>
              </div>
              <span style={{ color: '#34d399', fontSize: '0.7rem' }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#f59e0b" />
                <span>QC & Wiring Bench</span>
              </div>
              <span style={{ color: '#a5b4fc', fontSize: '0.7rem' }}>Ready</span>
            </div>
          </div>

          {/* Commercial Handoff Section */}
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              padding: '14px 12px 4px',
            }}
          >
            Operational Handoff
          </div>

          {crossNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={15} color="var(--text-dim)" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={13} color="var(--text-dim)" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {/* KPI Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 600 }}>
            Total Orders Pipeline
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {formatETB(totalPipelineRevenue)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {activeOrders.length} active jobs in production
          </div>
        </div>

        {/* Navigation Escape Hatches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              transition: 'color 0.15s ease',
            }}
          >
            <LayoutGrid size={14} />
            <span>All System Modules</span>
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              transition: 'color 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
            <span>Executive Dashboard</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default function OrdersSidebar() {
  return (
    <Suspense
      fallback={
        <aside
          style={{
            width: '275px',
            background: '#0c1322',
            borderRight: '1px solid rgba(56, 189, 248, 0.2)',
            height: '100vh',
            position: 'sticky',
            top: 0,
          }}
        />
      }
    >
      <OrdersSidebarContent />
    </Suspense>
  );
}
