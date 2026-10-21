'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import {
  Activity,
  ArrowLeft,
  Award,
  Boxes,
  CalendarDays,
  ChevronRight,
  Clock,
  Cog,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';

function HrSidebarContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { employees } = useErp();
  const monthlyGross = employees.reduce((sum, employee) => sum + employee.baseSalary + employee.allowances, 0);
  const departments = new Set(employees.map((employee) => employee.department)).size;

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const hrNavItems = [
    { tabId: 'overview', label: 'Workforce Overview', href: '/hr?tab=overview', icon: Activity },
    { tabId: 'payroll', label: 'Payroll & Statutory Tax', href: '/hr?tab=payroll', icon: Wallet },
    { tabId: 'allocation', label: 'Labor Allocation', href: '/hr?tab=allocation', icon: Clock },
    {
      tabId: 'employees',
      label: 'Employee Directory',
      href: '/hr?tab=employees',
      icon: Users,
      badge: `${employees.length} Staff`,
      badgeColor: '#facc15',
      badgeBg: 'rgba(250,204,21,0.14)',
    },
    { tabId: 'attendance', label: 'Attendance & Biometrics', href: '/hr?tab=attendance', icon: Clock },
    { tabId: 'leaves', label: 'Leave Management', href: '/hr?tab=leaves', icon: CalendarDays },
    { tabId: 'recruitment', label: 'Recruitment Pipeline', href: '/hr?tab=recruitment', icon: UserPlus },
    {
      tabId: 'performance',
      label: 'Performance & OKRs',
      href: '/hr?tab=performance',
      icon: Award,
      badge: 'HCM',
      badgeColor: '#a1a1aa',
      badgeBg: 'rgba(255,255,255,0.08)',
    },
  ];

  const crossNavItems = [
    { label: 'Inventory & Stores', href: '/inventory', icon: Boxes },
    { label: 'Factory Work Orders', href: '/orders', icon: Cog },
    { label: 'Finance & Profitability', href: '/finance', icon: TrendingUp },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: '#09090b',
        borderRight: '1px solid #27272a',
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
                color: '#facc15',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              HCM & Workforce Desk
            </div>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#71717a',
              letterSpacing: '0.08em',
              padding: '6px 12px 4px',
            }}
          >
            HR Workspaces
          </div>

          {hrNavItems.map((item) => {
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
                  padding: '8px 12px',
                  borderRadius: 8,
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  background: isActive ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  border: isActive ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? '#facc15' : '#71717a'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 10,
                      color: item.badgeColor,
                      background: item.badgeBg,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#71717a',
              letterSpacing: '0.08em',
              padding: '16px 12px 4px',
            }}
          >
            Connected ERP Modules
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
                  padding: '9px 12px',
                  borderRadius: 8,
                  color: '#71717a',
                  fontSize: '0.81rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#71717a';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={13} color="rgba(255,255,255,0.2)" />
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.12) 0%, rgba(202, 138, 4, 0.06) 100%)',
            border: '1px solid rgba(250, 204, 21, 0.22)',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 700 }}>Monthly Gross Payroll</span>
            <Sparkles size={13} color="#facc15" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatETB(monthlyGross)}
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            {employees.length} staff across {departments} departments
          </div>
        </div>

        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #27272a',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Main ERP</span>
        </Link>

        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            color: '#71717a',
            fontSize: '11px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <LayoutGrid size={13} />
          <span>All Modules Directory</span>
        </Link>
      </div>
    </aside>
  );
}

export default function HrSidebar() {
  return (
    <React.Suspense fallback={<aside style={{ width: '275px', background: '#09090b' }} />}>
      <HrSidebarContent />
    </React.Suspense>
  );
}
