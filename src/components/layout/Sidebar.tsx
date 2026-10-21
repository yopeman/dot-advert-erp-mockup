'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import {
  LayoutDashboard,
  LayoutGrid,
  Boxes,
  ShoppingCart,
  Cog,
  Receipt,
  Wallet,
  Users,
  PieChart,
  TrendingUp,
  BarChart3,
  Building2,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { lowStockItems, invoices, orders, suppliers } = useErp();

  const unpaidInvoices = invoices.filter((i) => i.paymentStatus !== 'paid');
  const activeOrders = orders.filter((o) => o.status === 'in_production' || o.status === 'pending');

  const isHr = pathname?.startsWith('/hr') || pathname?.startsWith('/inventory');

  const navItems = [
    {
      label: 'Executive Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'HR & Workforce Hub',
      href: '/hr',
      icon: Users,
      badge: 'Dedicated Hub',
      badgeType: 'yellow',
    },
    {
      label: 'Modules & Forms Hub',
      href: '/',
      icon: LayoutGrid,
      badge: '8 Modules',
      badgeType: 'emerald',
    },
    {
      label: 'Inventory & Stores',
      href: '/inventory',
      icon: Boxes,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : 'Dedicated Hub',
      badgeType: 'amber',
    },
    {
      label: 'Procurement & POs',
      href: '/dashboard/procurement',
      icon: ShoppingCart,
    },
    {
      label: 'Suppliers & Vendors',
      href: '/inventory?tab=suppliers',
      icon: Building2,
      badge: `${suppliers.length} Vendors`,
      badgeType: 'emerald',
    },
    {
      label: 'Production & Orders',
      href: '/orders',
      icon: Cog,
      badge: activeOrders.length > 0 ? `${activeOrders.length} Active` : 'Core',
      badgeType: 'primary',
    },
    {
      label: 'Sales & Invoicing',
      href: '/sales',
      icon: Receipt,
      badge: unpaidInvoices.length > 0 ? `${unpaidInvoices.length} Due` : undefined,
      badgeType: 'rose',
    },
    {
      label: 'Collections & Credit',
      href: '/dashboard/collections',
      icon: Wallet,
    },
    {
      label: 'Payroll & Labor',
      href: '/hr?tab=payroll',
      icon: Users,
      badge: 'MoR Tax',
      badgeType: 'yellow',
    },
    {
      label: 'Expenses & Overhead',
      href: '/dashboard/expenses',
      icon: PieChart,
    },
    {
      label: 'Finance & Profitability',
      href: '/finance',
      icon: TrendingUp,
    },
    {
      label: 'Reports & Analytics',
      href: '/report',
      icon: BarChart3,
      badge: 'BI Hub',
      badgeType: 'cyan',
    },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: isHr ? '#000000' : 'var(--bg-sidebar)',
        borderRight: isHr ? '1px solid #1f1f23' : '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand Header */}
      <div>
        <div
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <BrandLogo size={34} radius={8} />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              DOT ADVERT
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#818cf8', letterSpacing: '0.08em' }}>
              MANUFACTURING ERP
            </div>
          </div>
        </div>

        {/* Navigation Links */}
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
            Operational Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isTabMatch =
              item.href.includes('?') && typeof window !== 'undefined'
                ? pathname + window.location.search === item.href
                : false;
            const hasQuery = typeof window !== 'undefined' && Boolean(window.location.search);
            const isPathActive = !item.href.includes('?') && (
              item.href === '/'
                ? (pathname === '/' || pathname === '/modules' || pathname === '/forms')
                : (item.href === '/hr' && hasQuery)
                ? false
                : (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')))
            );
            const isActive = isTabMatch || isPathActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive
                    ? (isHr ? '#facc15' : '#ffffff')
                    : 'var(--text-muted)',
                  background: isActive
                    ? (isHr ? 'rgba(250, 204, 21, 0.12)' : 'rgba(99, 102, 241, 0.16)')
                    : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.84rem',
                  border: isActive
                    ? (isHr ? '1px solid rgba(250, 204, 21, 0.35)' : '1px solid rgba(99, 102, 241, 0.3)')
                    : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={17}
                    color={isActive ? (isHr ? '#facc15' : '#818cf8') : '#94a3b8'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`badge badge-${item.badgeType || 'gray'}`}
                    style={{ fontSize: '0.65rem', padding: '2px 7px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 500 }}>
            Mock Database
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            ● Synced (Local)
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Ethiopian Tax: 15% VAT • TIN: 0048291032
        </div>
      </div>
    </aside>
  );
}
