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
      label: 'Store & Purchasing Inventory',
      href: '/inventory',
      icon: Boxes,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : 'Dedicated Hub',
      badgeType: 'amber',
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
      label: 'Payroll & Labor',
      href: '/hr?tab=payroll',
      icon: Users,
      badge: 'MoR Tax',
      badgeType: 'yellow',
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
      {/* Brand Header */}
      <div>
        <div
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 24px',
            borderBottom: '1px solid #18181b',
            background: '#09090b',
          }}
        >
          <BrandLogo size={34} radius={8} />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              DOT ADVERT
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15', letterSpacing: '0.08em' }}>
              MANUFACTURING ERP
            </div>
          </div>
        </div>

        {/* Navigation Links */}
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
                  <Icon
                    size={17}
                    color={isActive ? '#facc15' : '#71717a'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background:
                        item.badgeType === 'yellow'
                          ? '#facc15'
                          : item.badgeType === 'rose'
                          ? '#fee2e2'
                          : item.badgeType === 'amber'
                          ? '#fef3c7'
                          : '#27272a',
                      color:
                        item.badgeType === 'yellow'
                          ? '#09090b'
                          : item.badgeType === 'rose'
                          ? '#991b1b'
                          : item.badgeType === 'amber'
                          ? '#92400e'
                          : '#e4e4e7',
                      whiteSpace: 'nowrap',
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

      {/* System Status Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #18181b',
          background: '#000000',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.725rem', color: '#71717a', fontWeight: 600 }}>
            Mock Database
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#facc15',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 700,
            }}
          >
            ● Synced (Local)
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#71717a', lineHeight: 1.4 }}>
          Ethiopian Tax: 15% VAT • TIN: 0048291032
        </div>
      </div>
    </aside>
  );
}
