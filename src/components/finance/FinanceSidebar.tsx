'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import {
  TrendingUp,
  FileSpreadsheet,
  Boxes,
  Users,
  CreditCard,
  Layers,
  ShieldCheck,
  Building2,
  DollarSign,
  PieChart,
  ArrowLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Wallet,
  Receipt,
  ShoppingCart,
  BarChart3,
} from 'lucide-react';

function FinanceSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'income_statement';

  const { companyFinancials, allOrderProfitability, purchaseOrders, invoices, currentRole, setCurrentRole } = useErp();

  const netRevenue = companyFinancials.totalRevenueNet;
  const grossProfit = companyFinancials.grossProfit;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const operatingProfit = companyFinancials.operatingProfit;
  const netMarginPct = netRevenue > 0 ? (operatingProfit / netRevenue) * 100 : 0;

  const accountsPayable = purchaseOrders
    .filter((p) => p.status === 'received' || p.status === 'approved')
    .reduce((sum, p) => sum + p.grandTotal, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const financeNavItems = [
    {
      tabId: 'income_statement',
      label: 'Executive P&L Statement',
      href: '/finance?tab=income_statement',
      icon: TrendingUp,
      badge: `${grossMarginPct.toFixed(0)}% Margin`,
      badgeType: 'emerald',
    },
    {
      tabId: 'profitability',
      label: 'Job Costing & Margins',
      href: '/finance?tab=profitability',
      icon: PieChart,
      badge: `${allOrderProfitability.length} Orders`,
      badgeType: 'blue',
    },
    {
      tabId: 'cashflow',
      label: 'Cash Flow & Treasury',
      href: '/finance?tab=cashflow',
      icon: Wallet,
      badge: 'Live Cash',
      badgeType: 'cyan',
    },
    {
      tabId: 'aging',
      label: 'AR & AP Aging Ledger',
      href: '/finance?tab=aging',
      icon: Clock,
      badge: `${invoices.filter((i) => i.balanceDue > 0).length} Overdue`,
      badgeType: 'amber',
    },
    {
      tabId: 'tax',
      label: 'MoR Tax & VAT Filing',
      href: '/finance?tab=tax',
      icon: ShieldCheck,
      badge: '15% MoR',
      badgeType: 'purple',
    },
  ];

  const crossNavItems = [
    {
      label: 'Reports & Analytics',
      href: '/report',
      icon: BarChart3,
    },
    {
      label: 'Sales & Collections',
      href: '/sales',
      icon: Receipt,
    },
    {
      label: 'Production & Orders',
      href: '/orders',
      icon: Boxes,
    },
    {
      label: 'CRM & Lead Pipeline',
      href: '/crm',
      icon: Users,
    },
    {
      label: 'Procurement & POs',
      href: '/dashboard/procurement',
      icon: ShoppingCart,
    },
    {
      label: 'Inventory & Materials',
      href: '/inventory',
      icon: Layers,
    },
    {
      label: 'Payroll & HR Labor',
      href: '/dashboard/payroll',
      icon: DollarSign,
    },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: '#09131a',
        borderRight: '1px solid rgba(16, 185, 129, 0.2)',
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
          borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)',
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
            textDecoration: 'none',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.04)',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowLeft size={12} />
          <span>All Modules Directory</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrandLogo size={38} radius={10} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                Finance Desk
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.18)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                CFO / P&L
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '1px' }}>
              Order Profitability & Audit
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section: Finance Module Navigation */}
      <div style={{ padding: '16px 12px 10px' }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#10b981',
            padding: '0 8px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Financial Auditing & P&L</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{financeNavItems.length} Tabs</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {financeNavItems.map((item) => {
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
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.08) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                  borderTop: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={16}
                    color={isActive ? '#10b981' : 'var(--text-dim)'}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background:
                        item.badgeType === 'emerald'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : item.badgeType === 'blue'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : item.badgeType === 'cyan'
                          ? 'rgba(6, 182, 212, 0.2)'
                          : item.badgeType === 'amber'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(168, 85, 247, 0.2)',
                      color:
                        item.badgeType === 'emerald'
                          ? '#6ee7b7'
                          : item.badgeType === 'blue'
                          ? '#93c5fd'
                          : item.badgeType === 'cyan'
                          ? '#67e8f9'
                          : item.badgeType === 'amber'
                          ? '#fcd34d'
                          : '#d8b4fe',
                      border:
                        item.badgeType === 'emerald'
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : item.badgeType === 'amber'
                          ? '1px solid rgba(245, 158, 11, 0.3)'
                          : '1px solid transparent',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Live Financial Health Widget */}
      <div
        style={{
          margin: '8px 12px',
          padding: '14px',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operating Profit Margin
          </span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Net Operating Income (EBITDA)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
              {formatETB(operatingProfit)}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Gross Margin</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>
                {grossMarginPct.toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Net Margin</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>
                {netMarginPct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Module Quick Links */}
      <div style={{ padding: '12px 12px', flex: 1 }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
            padding: '0 8px',
            marginBottom: '6px',
          }}
        >
          Connected ERP Modules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color="var(--text-dim)" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={12} color="var(--text-dim)" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role Switcher & User Footer */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(16, 185, 129, 0.15)',
          background: 'rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Active ERP Persona</span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '1px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {currentRole === 'general_manager' ? 'Controller / GM' : currentRole === 'accountant_cashier' ? 'Accountant' : 'Auditor'}
          </span>
        </div>
        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value as any)}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="general_manager">General Manager / CFO</option>
          <option value="accountant_cashier">Accountant / Cashier</option>
          <option value="sales_rep">Sales Representative</option>
        </select>
      </div>
    </aside>
  );
}

export default function FinanceSidebar() {
  return (
    <Suspense
      fallback={
        <aside
          style={{
            width: '275px',
            background: '#09131a',
            borderRight: '1px solid rgba(16, 185, 129, 0.2)',
            height: '100vh',
          }}
        />
      }
    >
      <FinanceSidebarContent />
    </Suspense>
  );
}
