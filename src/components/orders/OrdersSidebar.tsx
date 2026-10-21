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
        background: '#09090b',
        borderRight: '1px solid #18181b',
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
            borderBottom: '1px solid #18181b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#09090b',
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
                fontWeight: 800,
                color: '#facc15',
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
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#71717a',
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
                  color: isActive ? '#facc15' : '#a1a1aa',
                  background: isActive ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  border: isActive ? '1px solid rgba(250, 204, 21, 0.35)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#a1a1aa';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#facc15' : '#71717a'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: isActive ? '#facc15' : '#27272a',
                      color: isActive ? '#09090b' : '#e4e4e7',
                    }}
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
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#71717a',
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
              color: '#a1a1aa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={13} color="#facc15" />
                <span>Roland Eco-Solvent</span>
              </div>
              <span style={{ color: '#facc15', fontSize: '0.7rem', fontWeight: 600 }}>Running</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hammer size={13} color="#ca8a04" />
                <span>Laser & Channel Bay</span>
              </div>
              <span style={{ color: '#ca8a04', fontSize: '0.7rem', fontWeight: 600 }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#71717a" />
                <span>QC & Wiring Bench</span>
              </div>
              <span style={{ color: '#a1a1aa', fontSize: '0.7rem' }}>Ready</span>
            </div>
          </div>

          {/* Commercial Handoff Section */}
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#71717a',
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
                  color: '#a1a1aa',
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={15} color="#71717a" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={13} color="#52525b" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div style={{ padding: '16px', borderTop: '1px solid #18181b' }}>
        {/* KPI Summary Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, #18181b 0%, #000000 100%)',
            border: '1px solid rgba(250, 204, 21, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #facc15, transparent)',
            }}
          />
          <div style={{ fontSize: '0.7rem', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Orders Pipeline
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {formatETB(totalPipelineRevenue)}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#a1a1aa', marginTop: '2px' }}>
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
              color: '#a1a1aa',
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
              color: '#71717a',
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
            background: '#09090b',
            borderRight: '1px solid #18181b',
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
