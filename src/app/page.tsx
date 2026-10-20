'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Cog,
  Palette,
  Layers,
  TrendingUp,
  Receipt,
  FileCheck,
  Wallet,
  Clock,
  CalendarCheck,
  DollarSign,
  Boxes,
  ShoppingCart,
  Truck,
  ArrowRightLeft,
  Trash2,
  PieChart,
  Landmark,
  Scale,
  BarChart3,
  FileSpreadsheet,
  History,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type ModuleCategory =
  | 'all'
  | 'crm'
  | 'order'
  | 'sales'
  | 'hr'
  | 'inventory'
  | 'finance'
  | 'report'
  | 'dashboard';

interface CardItem {
  id: string;
  category: Exclude<ModuleCategory, 'all'>;
  categoryName: string;
  categoryColor: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  primaryHref: string;
  primaryLabel: string;
  badge?: {
    text: string;
    type: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  };
  tags: string[];
  quickActions: {
    label: string;
    href: string;
  }[];
}

export default function ModulesDirectoryPage() {
  const {
    customers,
    orders,
    workOrders,
    invoices,
    collections,
    employees,
    leads,
    items,
    lowStockItems,
    purchaseOrders,
    wastages,
    companyFinancials,
  } = useErp();

  const [activeCategory, setActiveCategory] = useState<ModuleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Counts for Badges
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'in_production' || o.status === 'pending'
  ).length;
  const unpaidInvoicesCount = invoices.filter((i) => i.paymentStatus !== 'paid').length;
  const openWOsCount = workOrders.filter((w) => w.status !== 'completed').length;
  const pendingPOsCount = purchaseOrders.filter((p) => p.status === 'approved' || p.status === 'draft').length;

  // Master List of The 8 Core Modules (No Duplication)
  const cards: CardItem[] = useMemo(
    () => [
      // 1. CRM
      {
        id: 'module-crm',
        category: 'crm',
        categoryName: 'Module 1 • CRM',
        categoryColor: '#6366f1',
        title: 'Customer Relationship Management',
        subtitle: 'Leads pipeline, site surveys, TIN profiles & credit control',
        description:
          'End-to-end customer pipeline: capture walk-in inquiries, record site survey dimensions, manage verified client TIN registries, enforce credit limits, and monitor receivables.',
        icon: Users,
        primaryHref: '/crm',
        primaryLabel: 'Open CRM Module',
        badge: { text: `${leads.length} Leads • ${customers.length} Accounts`, type: 'indigo' },
        tags: ['Leads Pipeline', 'Site Measurements', 'TIN Registry', 'Credit Limits', 'Client Ledger'],
        quickActions: [
          { label: 'Leads Pipeline', href: '/crm' },
          { label: 'Customer Directory', href: '/crm' },
          { label: 'Credit Balances', href: '/dashboard/collections' },
        ],
      },

      // 2. ORDER
      {
        id: 'module-order',
        category: 'order',
        categoryName: 'Module 2 • Order',
        categoryColor: '#06b6d4',
        title: 'Orders & Production Floor',
        subtitle: 'Job agreements, CMYK proofing, factory BOM & job costing',
        description:
          'Advertising fabrication engine: manage contracted orders, review and sign off CMYK design proofs, generate Bill of Materials (BOM) for the factory floor, and track real-time job margin waterfalls.',
        icon: Cog,
        primaryHref: '/orders',
        primaryLabel: 'Open Orders & Production',
        badge: { text: `${activeOrdersCount} Active • ${openWOsCount} In Floor`, type: 'cyan' },
        tags: ['Order Contracts', 'CMYK Proofing', 'BOM & Work Orders', 'Machine Scheduling', 'Margin Waterfall'],
        quickActions: [
          { label: 'Customer Orders', href: '/orders?tab=orders' },
          { label: 'Design Proofs', href: '/orders?tab=designs' },
          { label: 'Factory Work Orders', href: '/orders?tab=work_orders' },
          { label: 'Job Costing', href: '/orders?tab=orders' },
        ],
      },

      // 3. SALES
      {
        id: 'module-sales',
        category: 'sales',
        categoryName: 'Module 3 • Sales & Collections',
        categoryColor: '#10b981',
        title: 'Sales, Billing, Credit & Collections',
        subtitle: 'Proforma quotations, 15% VAT invoices, customer credit & Telebirr receipts',
        description:
          'Commercial tax, credit & receivables management: issue official Ethiopian proformas with validity terms, print statutory 15% VAT invoices, manage customer credit limits & aging AR, and reconcile digital receipts via Telebirr, CBE & cash.',
        icon: Receipt,
        primaryHref: '/sales',
        primaryLabel: 'Open Sales & Collections',
        badge: {
          text: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount} Due • ${invoices.length} Invoices` : `${invoices.length} Invoices`,
          type: unpaidInvoicesCount > 0 ? 'rose' : 'emerald',
        },
        tags: ['Official Proformas', '15% VAT Compliant', 'Non-VAT Exempt', 'Customer Credit Limits', 'Telebirr & CBE Collections', 'Receipts Ledger'],
        quickActions: [
          { label: 'Tax Invoices', href: '/sales?tab=invoices' },
          { label: 'Proformas', href: '/sales?tab=proformas' },
          { label: 'Collections & Receipts', href: '/sales?tab=collections' },
          { label: 'Customer Credit', href: '/sales?tab=customers' },
        ],
      },

      // 4. HR
      {
        id: 'module-hr',
        category: 'hr',
        categoryName: 'Module 4 • HR',
        categoryColor: '#a855f7',
        title: 'Human Resources & Payroll',
        subtitle: 'Staff roster, shift tracking, overtime costing & pension',
        description:
          'Workforce administration: manage production technicians and office staff, monitor daily clock-in/out attendance, allocate rush overtime (1.25x/1.5x) to client jobs, and process Ethiopian statutory payroll (11% + 7% pension).',
        icon: CalendarCheck,
        primaryHref: '/payroll',
        primaryLabel: 'Open HR & Payroll',
        badge: { text: `${employees.length} Staff Members`, type: 'purple' },
        tags: ['Staff Roster', 'Shift Attendance', 'Overtime Direct Cost', '11% Employer Pension', '7% Employee Pension'],
        quickActions: [
          { label: 'Employee Roster', href: '/dashboard/payroll' },
          { label: 'Shift Attendance', href: '/dashboard/payroll' },
          { label: 'Overtime Allocation', href: '/dashboard/payroll' },
          { label: 'Monthly Payroll', href: '/dashboard/payroll' },
        ],
      },

      // 5. INVENTORY
      {
        id: 'module-inventory',
        category: 'inventory',
        categoryName: 'Module 5 • Inventory',
        categoryColor: '#f59e0b',
        title: 'Inventory, Stores & Procurement',
        subtitle: 'Substrate catalog, supplier POs, GRN inspection & scrap',
        description:
          'Raw materials logistics: track vinyl, acrylic sheets & inks across warehouses, issue supplier purchase orders, perform inbound Goods Receipt (GRN) quality inspection, and log production off-cut wastage.',
        icon: Boxes,
        primaryHref: '/inventory',
        primaryLabel: 'Open Inventory & Stores',
        badge: {
          text: lowStockItems.length > 0 ? `${lowStockItems.length} Low Stock Alert` : `${items.length} Catalog Items`,
          type: lowStockItems.length > 0 ? 'amber' : 'emerald',
        },
        tags: ['Stores Catalog', 'Supplier POs', 'Inbound GRN QA', 'Store Transfers', 'Wastage & Scrap'],
        quickActions: [
          { label: 'Stock Matrix', href: '/dashboard/inventory' },
          { label: 'Purchase Orders', href: '/dashboard/procurement' },
          { label: 'Goods Receipts (GRN)', href: '/dashboard/procurement' },
          { label: 'Store Transfers', href: '/dashboard/inventory' },
          { label: 'Wastage Center', href: '/dashboard/inventory' },
        ],
      },

      // 6. FINANCE
      {
        id: 'module-finance',
        category: 'finance',
        categoryName: 'Module 6 • Finance',
        categoryColor: '#3b82f6',
        title: 'Finance, Expenses & P&L',
        subtitle: 'Cash flow, operating overhead, income statement & VAT ledger',
        description:
          'Financial controller suite: compare invoiced billings against realized collections, record factory overhead and job-specific expenses, monitor operating P&L margins, and reconcile net 15% ERCA VAT payable.',
        icon: TrendingUp,
        primaryHref: '/finance',
        primaryLabel: 'Open Finance & P&L',
        badge: { text: `ETB ${(companyFinancials.totalRevenueNet / 1000).toFixed(0)}k Net Rev`, type: 'emerald' },
        tags: ['Cash Realization', 'Operating Expenses', 'Income Statement (P&L)', '15% Output VAT', 'Input VAT Deductions'],
        quickActions: [
          { label: 'Executive P&L', href: '/finance?tab=income_statement' },
          { label: 'Job Costing Margins', href: '/finance?tab=profitability' },
          { label: 'Cash Flow & Treasury', href: '/finance?tab=cashflow' },
          { label: 'MoR Tax & VAT', href: '/finance?tab=tax' },
        ],
      },

      // 7. REPORT
      {
        id: 'module-report',
        category: 'report',
        categoryName: 'Module 7 • Report',
        categoryColor: '#ec4899',
        title: 'Reports, Analytics & Audit',
        subtitle: 'MoM comparisons, formatted exports & immutable audit log',
        description:
          'Operational business intelligence: compare sales targets against actuals, analyze production scrap trends, export structured CSV/Excel and print-ready PDF reports, and inspect the chronological user audit trail.',
        icon: BarChart3,
        primaryHref: '/report',
        primaryLabel: 'Open Reports & Audit',
        badge: { text: 'Export & Audit', type: 'purple' },
        tags: ['MoM Performance', 'Budget Variance', 'CSV / Excel Export', 'Printable PDF', 'User Audit Trail'],
        quickActions: [
          { label: 'Comparative Analytics', href: '/dashboard/finance' },
          { label: 'Export Center', href: '/dashboard/finance' },
          { label: 'Audit Trail ("Who & When")', href: '/dashboard/finance' },
        ],
      },

      // 8. DASHBOARD
      {
        id: 'module-dashboard',
        category: 'dashboard',
        categoryName: 'Module 8 • Dashboard',
        categoryColor: '#8b5cf6',
        title: 'Executive Dashboard & Cockpit',
        subtitle: 'Unified operational summary across all 8 modules',
        description:
          'Single-pane-of-glass executive overview: consolidate high-level financial KPIs, critical low-stock warnings, live workshop orders, pending receivables, and instant shortcuts to every department.',
        icon: LayoutDashboard,
        primaryHref: '/dashboard',
        primaryLabel: 'Launch Executive Cockpit',
        badge: { text: 'Master Cockpit', type: 'indigo' },
        tags: ['Executive Overview', 'Live Alerts', 'Multi-Module KPI', 'Real-time Metrics', 'Quick Launch'],
        quickActions: [
          { label: 'Executive Cockpit', href: '/dashboard' },
          { label: 'Financial Health', href: '/finance' },
          { label: 'Production Status', href: '/orders' },
        ],
      },
    ],
    [
      leads.length,
      customers.length,
      activeOrdersCount,
      openWOsCount,
      unpaidInvoicesCount,
      invoices.length,
      employees.length,
      lowStockItems.length,
      items.length,
      companyFinancials,
    ]
  );

  // Filter Cards based on search query and category
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCategory =
        activeCategory === 'all' || card.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.subtitle.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.categoryName.toLowerCase().includes(q) ||
        card.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [cards, activeCategory, searchQuery]);

  const categories: { key: ModuleCategory; label: string; count: number }[] = [
    { key: 'all', label: 'All 8 Modules', count: cards.length },
    { key: 'crm', label: '1. CRM', count: cards.filter((c) => c.category === 'crm').length },
    { key: 'order', label: '2. Order', count: cards.filter((c) => c.category === 'order').length },
    { key: 'sales', label: '3. Sales', count: cards.filter((c) => c.category === 'sales').length },
    { key: 'hr', label: '4. HR', count: cards.filter((c) => c.category === 'hr').length },
    { key: 'inventory', label: '5. Inventory', count: cards.filter((c) => c.category === 'inventory').length },
    { key: 'finance', label: '6. Finance', count: cards.filter((c) => c.category === 'finance').length },
    { key: 'report', label: '7. Report', count: cards.filter((c) => c.category === 'report').length },
    { key: 'dashboard', label: '8. Dashboard', count: cards.filter((c) => c.category === 'dashboard').length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          padding: '32px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '840px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(99, 102, 241, 0.15)',
                borderRadius: '20px',
                border: '1px solid var(--border-glow)',
                marginBottom: '16px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary-light)',
              }}
            >
              <Sparkles size={14} />
              <span>DOT ADVERT ERP OPERATIONS DIRECTORY</span>
            </div>

            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                marginBottom: '10px',
              }}
            >
              System Modules & Forms Directory
            </h1>
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--text-muted)',
              }}
            >
              Direct navigation hub for all 8 business modules, operational workflows, and transactional forms.
              Designed specifically for advertising production, large-format printing, and custom fabrication in Ethiopia.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            <LayoutDashboard size={16} />
            <span>Open Dashboard</span>
          </Link>
        </div>

        {/* Quick Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              background: 'rgba(20, 30, 51, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              System Architecture
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              8 Core Modules
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unified Operations Hub</div>
          </div>

          <div
            style={{
              background: 'rgba(20, 30, 51, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              Tax & Compliance
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>
              Dual Invoicing
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>15% VAT & Statutory Exempt</div>
          </div>

          <div
            style={{
              background: 'rgba(20, 30, 51, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              Manufacturing Engine
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px' }}>
              BOM & Job Costing
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live Margin Waterfalls</div>
          </div>

          <div
            style={{
              background: 'rgba(20, 30, 51, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              Local Payments
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amber)', marginTop: '4px' }}>
              Telebirr & CBE
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instant Credit Release</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              flex: '1',
              minWidth: '280px',
              maxWidth: '500px',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              placeholder="Search workflows, forms, tax, BOM, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Filter size={15} />
            <span>Showing {filteredCards.length} of {cards.length} modules</span>
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : 'var(--text-dim)',
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Grid */}
      {filteredCards.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)',
          }}
        >
          <Search size={36} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>
            No matching modules found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            Try adjusting your search query or reset the category filter to browse all 8 modules.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-glow)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top Section */}
                <div>
                  {/* Category & Badge Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: card.categoryColor,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: card.categoryColor,
                        }}
                      >
                        {card.categoryName}
                      </span>
                    </div>

                    {card.badge && (
                      <span
                        className={`badge badge-${card.badge.type}`}
                        style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px' }}
                      >
                        {card.badge.text}
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.categoryColor,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          lineHeight: 1.3,
                          marginBottom: '3px',
                        }}
                      >
                        {card.title}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 500 }}>
                        {card.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.55,
                      marginBottom: '16px',
                    }}
                  >
                    {card.description}
                  </p>

                  {/* Feature Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {card.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-dim)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '2px 8px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions Section */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Secondary Quick Links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Quick:</span>
                    {card.quickActions.map((qa, i) => (
                      <Link
                        key={i}
                        href={qa.href}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>{qa.label}</span>
                        <ChevronRight size={11} />
                      </Link>
                    ))}
                  </div>

                  {/* Primary Button */}
                  <Link
                    href={card.primaryHref}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      fontSize: '13px',
                    }}
                  >
                    <span>{card.primaryLabel}</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Information Callout */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <CheckCircle2 size={24} style={{ color: 'var(--emerald)' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              100% Client-Side Reactive Data Engine
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              All changes created through these modules persist to your browser&apos;s localStorage and calculate in real-time.
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="btn btn-secondary" style={{ gap: '6px' }}>
          <span>Return to Dashboard</span>
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
