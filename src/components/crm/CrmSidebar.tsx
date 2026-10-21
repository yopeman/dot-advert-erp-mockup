'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  TrendingUp,
  Building2,
  Ruler,
  FileText,
  Cog,
  Wallet,
  ArrowLeft,
  LayoutGrid,
  Users,
  Sparkles,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

function CrmSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pipeline';

  const { leads, customers } = useErp();

  const activeLeads = leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won');
  const totalSurveysCount =
    leads.reduce((sum, l) => sum + (l.siteSurveys?.length || (l.siteSurvey ? 1 : 0)), 0) +
    customers.reduce((sum, c) => sum + (c.siteSurveys?.length || 0), 0);
  const totalPipelineValue = activeLeads.reduce((sum, l) => sum + l.estimatedBudget, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const crmNavItems = [
    {
      tabId: 'pipeline',
      label: 'Leads & Funnel',
      href: '/crm?tab=pipeline',
      icon: TrendingUp,
      badge: activeLeads.length > 0 ? `${activeLeads.length} Deals` : undefined,
      badgeType: 'indigo',
    },
    {
      tabId: 'customers',
      label: 'Customer Accounts',
      href: '/crm?tab=customers',
      icon: Building2,
      badge: `${customers.length} Clients`,
      badgeType: 'emerald',
    },
    {
      tabId: 'surveys',
      label: 'Site Surveys & Sizes',
      href: '/crm?tab=surveys',
      icon: Ruler,
      badge: totalSurveysCount > 0 ? `${totalSurveysCount} Signs` : undefined,
      badgeType: 'cyan',
    },
  ];

  const crossNavItems = [
    {
      label: 'Proformas & Quotes',
      href: '/sales',
      icon: FileText,
    },
    {
      label: 'Factory Work Orders',
      href: '/orders',
      icon: Cog,
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
        {/* CRM Specialized Brand Header */}
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
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: '#000000',
              border: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              color: '#facc15',
            }}
          >
            <Users size={20} />
          </div>
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
              CRM & SALES DESK
            </div>
          </div>
        </div>

        {/* CRM Navigation Section */}
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
            CRM Workspaces
          </div>

          {crmNavItems.map((item) => {
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

          {/* Connected ERP Modules */}
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
            Commercial Handoff
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
                  borderRadius: 'var(--radius-md)',
                  color: '#a1a1aa',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#a1a1aa';
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

      {/* Bottom Section: Pipeline Summary Card & Return to ERP */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Pipeline Mini Card */}
        <div
          style={{
            background: 'rgba(250, 204, 21, 0.06)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 700 }}>Active Pipeline</span>
            <Sparkles size={13} color="#facc15" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatETB(totalPipelineValue)}
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            {activeLeads.length} Open Inquiries in Flight
          </div>
        </div>

        {/* Return to Main ERP */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #27272a',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#facc15';
            e.currentTarget.style.color = '#09090b';
            e.currentTarget.style.borderColor = '#facc15';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#27272a';
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Main ERP</span>
        </Link>

        {/* Modules Directory Link */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            color: '#a1a1aa',
            fontSize: '11px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#facc15';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          <LayoutGrid size={13} />
          <span>All Modules Directory</span>
        </Link>
      </div>
    </aside>
  );
}

export default function CrmSidebar() {
  return (
    <React.Suspense fallback={<aside style={{ width: '275px', background: '#0c1322' }} />}>
      <CrmSidebarContent />
    </React.Suspense>
  );
}
