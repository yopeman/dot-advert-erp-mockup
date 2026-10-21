'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  LayoutDashboard,
  Users,
  Cog,
  Receipt,
  CalendarCheck,
  Boxes,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

// ─── Brand Palette: Black / White / Yellow ───
const B = {
  yellow: '#FFD60A',
  yellowDark: '#F2C200',
  yellowPale: '#FFFBEB',
  black: '#0A0A0A',
  blackSoft: '#1A1A1A',
  white: '#FFFFFF',
  gray100: '#F4F4F5',
  gray200: '#E4E4E7',
  gray400: '#A1A1AA',
  gray500: '#71717A',
  gray600: '#52525B',
};

interface ModuleCard {
  id: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

export default function ModulesDirectoryPage() {
  const {
    customers,
    orders,
    invoices,
    employees,
    leads,
    items,
    lowStockItems,
    companyFinancials,
  } = useErp();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const modules: ModuleCard[] = useMemo(
    () => [
      {
        id: 'crm',
        shortName: 'CRM',
        description: 'Manage leads, customers, site surveys, and credit limits.',
        icon: Users,
        href: '/crm',
        badge: `${leads.length} leads`,
      },
      {
        id: 'order',
        shortName: 'Orders',
        description: 'Track production jobs, proofs, BOM, and factory work orders.',
        icon: Cog,
        href: '/orders',
        badge: `${orders.length} orders`,
      },
      {
        id: 'sales',
        shortName: 'Sales',
        description: 'Issue VAT invoices, proformas, and collect payments.',
        icon: Receipt,
        href: '/sales',
        badge: `${invoices.length} invoices`,
      },
      {
        id: 'hr',
        shortName: 'HR & Payroll',
        description: 'Manage staff roster, attendance, overtime, and pension payroll.',
        icon: CalendarCheck,
        href: '/hr',
        badge: `${employees.length} staff`,
      },
      {
        id: 'inventory',
        shortName: 'Inventory',
        description: 'Track stock, purchase orders, GRN receipts, and wastage.',
        icon: Boxes,
        href: '/inventory',
        badge:
          lowStockItems.length > 0
            ? `${lowStockItems.length} low stock`
            : `${items.length} items`,
      },
      {
        id: 'finance',
        shortName: 'Finance',
        description: 'Monitor cash flow, expenses, P&L, and VAT ledger.',
        icon: TrendingUp,
        href: '/finance',
        badge: `ETB ${(companyFinancials.totalRevenueNet / 1000).toFixed(0)}k`,
      },
      {
        id: 'report',
        shortName: 'Reports',
        description: 'Analyze performance, export data, and review audit trails.',
        icon: BarChart3,
        href: '/report',
      },
      {
        id: 'dashboard',
        shortName: 'Dashboard',
        description: 'View the executive cockpit summarizing all 8 modules.',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
    ],
    [
      leads.length,
      customers.length,
      orders.length,
      invoices.length,
      employees.length,
      items.length,
      lowStockItems.length,
      companyFinancials,
    ]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '12px' }}>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <div
        style={{
          background: `radial-gradient(ellipse at top right, rgba(255,214,10,0.18) 0%, transparent 55%), ${B.black}`,
          borderRadius: '20px',
          padding: '32px',
          color: B.white,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${B.blackSoft}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${B.yellow} 0%, ${B.yellowDark} 100%)`,
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: B.yellow,
            color: B.black,
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          <Sparkles size={13} />
          <span>Dot Advert ERP · Operations Directory</span>
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '10px',
            color: B.white,
          }}
        >
          System Modules
        </h1>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.65,
            color: B.gray400,
            maxWidth: '640px',
            margin: 0,
          }}
        >
          Jump directly to any of the 8 core business modules. Click a card to open its workspace.
        </p>
      </div>

      {/* ═══════════════════ 2 × 4 CENTERED GRID ═══════════════════ */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '1160px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '18px',
          }}
        >
          {modules.map((m) => {
            const Icon = m.icon;
            const isHovered = hoveredId === m.id;

            return (
              <Link
                key={m.id}
                href={m.href}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  background: isHovered ? B.black : B.white,
                  border: `1px solid ${isHovered ? B.yellow : B.gray200}`,
                  borderRadius: '16px',
                  textDecoration: 'none',
                  color: B.black,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  transition:
                    'background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 14px 34px rgba(10,10,10,0.15)' : 'none',
                }}
              >
                {/* Top row: icon + badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: isHovered ? B.yellow : B.black,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isHovered ? B.black : B.yellow,
                      flexShrink: 0,
                      transition: 'background 0.18s ease, color 0.18s ease',
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  {m.badge && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '999px',
                        background: isHovered ? B.yellow : B.gray100,
                        color: isHovered ? B.black : B.gray600,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>

                {/* Bottom: name + description + arrow */}
                <div>
                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      color: isHovered ? B.white : B.black,
                      margin: '0 0 5px',
                      lineHeight: 1.25,
                      transition: 'color 0.18s ease',
                    }}
                  >
                    {m.shortName}
                  </h3>
                  <p
                    style={{
                      fontSize: '12.5px',
                      lineHeight: 1.5,
                      color: isHovered ? B.gray400 : B.gray500,
                      margin: 0,
                      transition: 'color 0.18s ease',
                    }}
                  >
                    {m.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isHovered ? B.yellow : B.black,
                      transition: 'color 0.18s ease',
                    }}
                  >
                    <span>Open module</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Responsive fallback: collapse to 2 cols / 1 col on small screens */}
      <style>{`
        @media (max-width: 960px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 520px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}