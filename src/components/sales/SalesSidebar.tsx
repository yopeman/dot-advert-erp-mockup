'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  Receipt,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  CreditCard,
  Boxes,
  Layers,
  TrendingUp,
  LayoutGrid,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

function SalesSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'invoices';

  const { invoices, proformas, customers, companyFinancials, currentRole, setCurrentRole } = useErp();

  const unpaidInvoices = invoices.filter((i) => i.paymentStatus !== 'paid');
  const activeProformas = proformas.filter((p) => p.status !== 'converted');
  const totalReceivables = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const salesNavItems = [
    {
      tabId: 'invoices',
      label: 'Tax Invoices Ledger',
      href: '/sales?tab=invoices',
      icon: Receipt,
      badge: `${invoices.length} Invoices`,
      badgeType: 'purple',
    },
    {
      tabId: 'proformas',
      label: 'Proformas & Quotations',
      href: '/sales?tab=proformas',
      icon: FileSpreadsheet,
      badge: `${activeProformas.length} Active`,
      badgeType: activeProformas.length > 0 ? 'amber' : 'gray',
    },
    {
      tabId: 'customers',
      label: 'Customer Accounts & Credit',
      href: '/sales?tab=customers',
      icon: Users,
      badge: `${customers.length} Accounts`,
      badgeType: 'blue',
    },
    {
      tabId: 'vat_reports',
      label: 'MoR VAT Compliance',
      href: '/sales?tab=vat_reports',
      icon: ShieldCheck,
      badge: '15% VAT',
      badgeType: 'emerald',
    },
  ];

  const crossNavItems = [
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
      label: 'Payment Collections',
      href: '/dashboard/collections',
      icon: CreditCard,
    },
    {
      label: 'Finance & P&L',
      href: '/dashboard/finance',
      icon: TrendingUp,
    },
    {
      label: 'Inventory & Materials',
      href: '/dashboard/inventory',
      icon: Layers,
    },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: '#0e111d',
        borderRight: '1px solid rgba(168, 85, 247, 0.2)',
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
          borderBottom: '1px solid rgba(168, 85, 247, 0.15)',
          background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, transparent 100%)',
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
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
              color: '#ffffff',
            }}
          >
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                Sales Desk
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#c084fc',
                  background: 'rgba(192, 132, 252, 0.18)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                }}
              >
                ERP v2
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '1px' }}>
              Tax Invoicing & Billing
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section: Sales Module Navigation */}
      <div style={{ padding: '16px 12px 10px' }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#a855f7',
            padding: '0 8px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Sales & Invoicing Workflows</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{salesNavItems.length} Tabs</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {salesNavItems.map((item) => {
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
                  background: isActive ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.22) 0%, rgba(168, 85, 247, 0.08) 100%)' : 'transparent',
                  borderLeft: isActive ? '3px solid #c084fc' : '3px solid transparent',
                  borderTop: isActive ? '1px solid rgba(192, 132, 252, 0.25)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid rgba(192, 132, 252, 0.15)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={16}
                    color={isActive ? '#c084fc' : 'var(--text-dim)'}
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
                        item.badgeType === 'purple'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : item.badgeType === 'amber'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : item.badgeType === 'emerald'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : item.badgeType === 'blue'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(255, 255, 255, 0.08)',
                      color:
                        item.badgeType === 'purple'
                          ? '#d8b4fe'
                          : item.badgeType === 'amber'
                          ? '#fcd34d'
                          : item.badgeType === 'emerald'
                          ? '#6ee7b7'
                          : item.badgeType === 'blue'
                          ? '#93c5fd'
                          : 'var(--text-muted)',
                      border:
                        item.badgeType === 'purple'
                          ? '1px solid rgba(168, 85, 247, 0.3)'
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

      {/* Live Sales Desk Mini Dashboard */}
      <div
        style={{
          margin: '8px 12px',
          padding: '14px',
          background: 'rgba(168, 85, 247, 0.06)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
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
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Billing Pulse
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
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Outstanding AR Balance</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
              {formatETB(totalReceivables)}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Output VAT (15%)</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c084fc' }}>
                {formatETB(companyFinancials.totalOutputVat)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Unpaid Bills</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>
                {unpaidInvoices.length} Invoices
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
          borderTop: '1px solid rgba(168, 85, 247, 0.15)',
          background: 'rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Active ERP Persona</span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#c084fc',
              background: 'rgba(192, 132, 252, 0.15)',
              padding: '1px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {currentRole === 'accountant_cashier' ? 'Accountant' : currentRole === 'sales_rep' ? 'Sales Rep' : 'Admin'}
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
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="accountant_cashier">Accountant / Cashier</option>
          <option value="sales_rep">Sales Representative</option>
          <option value="general_manager">General Manager</option>
        </select>
      </div>
    </aside>
  );
}

export default function SalesSidebar() {
  return (
    <Suspense
      fallback={
        <aside
          style={{
            width: '275px',
            background: '#0e111d',
            borderRight: '1px solid rgba(168, 85, 247, 0.2)',
            height: '100vh',
          }}
        />
      }
    >
      <SalesSidebarContent />
    </Suspense>
  );
}
