'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
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
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { lowStockItems, invoices, orders } = useErp();

  const unpaidInvoices = invoices.filter((i) => i.paymentStatus !== 'paid');
  const activeOrders = orders.filter((o) => o.status === 'in_production' || o.status === 'pending');

  const navItems = [
    {
      label: 'Executive Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
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
      href: '/dashboard/inventory',
      icon: Boxes,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : undefined,
      badgeType: 'amber',
    },
    {
      label: 'Procurement & POs',
      href: '/dashboard/procurement',
      icon: ShoppingCart,
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
      href: '/dashboard/payroll',
      icon: Users,
    },
    {
      label: 'Expenses & Overhead',
      href: '/dashboard/expenses',
      icon: PieChart,
    },
    {
      label: 'Finance & Profitability',
      href: '/dashboard/finance',
      icon: TrendingUp,
    },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
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
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
              }}
            />
          </div>
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
            const isActive =
              pathname === item.href ||
              (item.href === '/' && (pathname === '/' || pathname === '/modules' || pathname === '/forms')) ||
              (item.href !== '/' && pathname.startsWith(item.href));

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
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.84rem',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={17}
                    color={isActive ? '#818cf8' : '#94a3b8'}
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
