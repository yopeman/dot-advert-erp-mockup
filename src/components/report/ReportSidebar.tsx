'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import {
  BarChart3,
  TrendingUp,
  Boxes,
  Users,
  CreditCard,
  Layers,
  ShieldCheck,
  Building2,
  PieChart,
  ArrowLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Wallet,
  Receipt,
  ShoppingCart,
  Cog,
  FileSpreadsheet,
  AlertTriangle,
  Factory,
  Scissors,
  ScrollText,
} from 'lucide-react';

function ReportSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab') || 'executive';
  const currentDept = searchParams.get('dept') || 'all';

  const { companyFinancials, orders, allOrderProfitability, wastages, currentRole, setCurrentRole } = useErp();

  const netRevenue = companyFinancials.totalRevenueNet;
  const grossProfit = companyFinancials.grossProfit;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const totalScrapCost = wastages.reduce((sum, w) => sum + w.totalCost, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const setTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/report?${params.toString()}`);
  };

  const setDept = (deptId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('dept', deptId);
    router.push(`/report?${params.toString()}`);
  };

  const reportNavItems = [
    {
      tabId: 'executive',
      label: 'Executive Overview',
      icon: BarChart3,
      badge: `${grossMarginPct.toFixed(0)}% Margin`,
      badgeColor: '#10b981',
      description: 'Master revenue curve, margin tiers & product donut',
    },
    {
      tabId: 'sales',
      label: 'Sales & Commercial BI',
      icon: TrendingUp,
      badge: 'LTV Ranking',
      badgeColor: '#6366f1',
      description: 'Customer LTV, order conversions & rep quotas',
    },
    {
      tabId: 'production',
      label: 'Manufacturing & Plant',
      icon: Factory,
      badge: '91% OEE',
      badgeColor: '#06b6d4',
      description: 'Machine runtime hours, work center load & lead times',
    },
    {
      tabId: 'costing',
      label: 'Job Costing & Margins',
      icon: PieChart,
      badge: `${allOrderProfitability.length} Orders`,
      badgeColor: '#38bdf8',
      description: '5-part cost structure & margin distribution',
    },
    {
      tabId: 'wastage',
      label: 'Scrap & Defect Analytics',
      icon: Scissors,
      badge: `${formatETB(totalScrapCost)}`,
      badgeColor: '#f43f5e',
      description: 'Material waste Pareto, scrap root causes & drop cuts',
    },
    {
      tabId: 'tax',
      label: 'MoR Tax & 15% VAT',
      icon: ShieldCheck,
      badge: 'e-Tax Ready',
      badgeColor: '#a855f7',
      description: 'Statutory filing waterfall & 2% withholding audit',
    },
    {
      tabId: 'audit',
      label: 'Audit Trail & Logs',
      icon: ScrollText,
      badge: 'Live Feed',
      badgeColor: '#f59e0b',
      description: 'Chronological ERP activity logs & user transactions',
    },
  ];

  const quickCrossModules = [
    {
      label: 'Finance & P&L Statement',
      href: '/finance',
      icon: CreditCard,
      color: '#10b981',
    },
    {
      label: 'Sales & Invoicing',
      href: '/sales',
      icon: Receipt,
      color: '#a855f7',
    },
    {
      label: 'Production & Orders',
      href: '/orders',
      icon: Cog,
      color: '#f59e0b',
    },
    {
      label: 'CRM & Lead Funnel',
      href: '/crm',
      icon: Users,
      color: '#ec4899',
    },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: '#090d1a',
        borderRight: '1px solid rgba(99, 102, 241, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Brand & Module Header */}
      <div
        style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(99, 102, 241, 0.18)',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            marginBottom: '10px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          <ArrowLeft size={13} />
          <span>All Modules</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo size={40} radius={10} />
          <div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              DOT ADVERT BI
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#22d3ee',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Enterprise Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--text-dim)',
            padding: '4px 10px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Analytical Views
        </div>

        {reportNavItems.map((item) => {
          const isActive = currentTab === item.tabId;
          const Icon = item.icon;

          return (
            <button
              key={item.tabId}
              onClick={() => setTab(item.tabId)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '9px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(6, 182, 212, 0.12) 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon
                  size={17}
                  style={{
                    color: isActive ? '#22d3ee' : 'var(--text-dim)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#ffffff' : 'var(--text-main)',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.2, marginTop: '2px' }}>
                    {item.description}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: `${item.badgeColor}18`,
                    color: item.badgeColor,
                    border: `1px solid ${item.badgeColor}35`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: '3px',
                    borderRadius: '0 3px 3px 0',
                    background: '#22d3ee',
                    boxShadow: '0 0 8px #22d3ee',
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Business Unit Quick-Filter */}
        <div style={{ margin: '14px 4px 8px' }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              padding: '0 6px 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Department Scope</span>
            {currentDept !== 'all' && (
              <span
                onClick={() => setDept('all')}
                style={{ color: '#22d3ee', cursor: 'pointer', textTransform: 'none', fontSize: '0.62rem' }}
              >
                Clear
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[
              { id: 'all', label: 'All Business Units' },
              { id: 'signage_3d', label: '3D Signage & Lightboxes' },
              { id: 'billboards', label: 'Billboard & Large Media' },
              { id: 'print', label: 'Large Format Digital Print' },
              { id: 'fleet', label: 'Fleet Graphics & Decals' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDept(d.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: currentDept === d.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: currentDept === d.id ? '#22d3ee' : 'var(--text-dim)',
                  fontSize: '0.72rem',
                  fontWeight: currentDept === d.id ? 700 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: currentDept === d.id ? '#22d3ee' : 'rgba(255, 255, 255, 0.2)',
                  }}
                />
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Operational Health Card */}
        <div
          style={{
            margin: '10px 4px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 27, 42, 0.9) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff' }}>Operational Telemetry</span>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '1px 5px',
                borderRadius: '6px',
              }}
            >
              Optimal
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Gross Margin</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{grossMarginPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(grossMarginPct * 1.5, 100)}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Shopfloor Scrap</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>2.1% (Tgt &lt; 3.5%)</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', background: '#06b6d4' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Machine Load</span>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>88.4%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: '#818cf8' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Cross-Navigation Links */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              padding: '0 8px 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Connected Modules
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {quickCrossModules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '7px',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={14} style={{ color: m.color }} />
                    <span>{m.label}</span>
                  </div>
                  <ChevronRight size={12} color="var(--text-dim)" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function ReportSidebar() {
  return (
    <Suspense
      fallback={
        <aside style={{ width: '275px', background: '#090d1a', height: '100vh', flexShrink: 0 }} />
      }
    >
      <ReportSidebarContent />
    </Suspense>
  );
}
