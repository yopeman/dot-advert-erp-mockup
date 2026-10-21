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

  // Master List of All Cards Across the 8 Core Modules
  const cards: CardItem[] = useMemo(
    () => [
      // 1. CRM
      {
        id: 'crm-leads',
        category: 'crm',
        categoryName: 'CRM',
        categoryColor: '#6366f1',
        title: 'Leads & Inquiry Pipeline',
        subtitle: 'Lead qualification, site surveys & dimensions',
        description:
          'Capture incoming signage/printing inquiries, schedule site measurements, record client dimensions, and qualify opportunities before issuing quotations.',
        icon: Users,
        primaryHref: '/crm',
        primaryLabel: 'Open CRM Leads',
        badge: { text: `${leads.length} Deals`, type: 'indigo' },
        tags: ['Walk-ins', 'Site Measurements', 'Lead Qualification', 'Tenders'],
        quickActions: [
          { label: 'Pipeline Funnel', href: '/crm' },
          { label: 'Site Surveys', href: '/crm' },
        ],
      },
      {
        id: 'crm-customers',
        category: 'crm',
        categoryName: 'CRM',
        categoryColor: '#6366f1',
        title: 'Customer Directory & Credit',
        subtitle: 'Profiles, TIN, VAT status & credit lines',
        description:
          'Maintain verified client profiles with Ethiopian TIN registrations, custom payment terms, credit limits, and automated balance protection.',
        icon: UserCheck,
        primaryHref: '/crm',
        primaryLabel: 'Manage Customers',
        badge: { text: `${customers.length} Accounts`, type: 'indigo' },
        tags: ['TIN Verified', 'Credit Limit Check', 'Payment Terms', 'Ledger'],
        quickActions: [
          { label: 'Customer Directory', href: '/crm' },
          { label: 'Credit Balances', href: '/collections' },
        ],
      },

      // 2. ORDER
      {
        id: 'order-jobs',
        category: 'order',
        categoryName: 'Order',
        categoryColor: '#06b6d4',
        title: 'Customer Orders',
        subtitle: 'Job agreements, deadlines & contracted value',
        description:
          'Central registry of contracted client orders, agreed ETB milestone values, required completion deadlines, and deposit validations.',
        icon: Cog,
        primaryHref: '/orders',
        primaryLabel: 'Open Orders Desk',
        badge: { text: `${activeOrdersCount} Active`, type: 'cyan' },
        tags: ['Order Contracts', 'Deposit Check', 'Milestone Dates', 'PM Assignment'],
        quickActions: [
          { label: 'All Orders', href: '/orders' },
          { label: 'Track Deadlines', href: '/orders' },
        ],
      },
      {
        id: 'order-design',
        category: 'order',
        categoryName: 'Order',
        categoryColor: '#06b6d4',
        title: 'Graphic Design & Proofing',
        subtitle: 'Artwork files, CMYK specs & client sign-offs',
        description:
          'Advertising-specific proofing stage. Review print dimensions, CMYK color profiles, mockup proofs, and secure client sign-off before fabrication.',
        icon: Palette,
        primaryHref: '/orders',
        primaryLabel: 'Design & Proofing',
        badge: { text: 'Artwork Proofs', type: 'cyan' },
        tags: ['Dimension Verification', 'Mockup Proofs', 'Client Approval', 'CMYK Specs'],
        quickActions: [
          { label: 'Review Proofs', href: '/orders' },
          { label: 'Print Specifications', href: '/orders' },
        ],
      },
      {
        id: 'order-production',
        category: 'order',
        categoryName: 'Order',
        categoryColor: '#06b6d4',
        title: 'Production & Work Orders',
        subtitle: 'BOM materials, cutting, machine hours & scrap',
        description:
          'Factory floor execution. Issue Bill of Materials (BOM), schedule CNC/laser and large format printers, record machine hours, and log production scrap.',
        icon: Layers,
        primaryHref: '/orders',
        primaryLabel: 'Work Order Center',
        badge: { text: `${openWOsCount} In Floor`, type: 'cyan' },
        tags: ['BOM Issue', 'CNC / Laser', 'Large Format Printing', 'Assembly QA'],
        quickActions: [
          { label: 'Factory Work Orders', href: '/orders' },
          { label: 'Scrap & Wastage', href: '/inventory' },
        ],
      },
      {
        id: 'order-profitability',
        category: 'order',
        categoryName: 'Order',
        categoryColor: '#06b6d4',
        title: 'Job Costing & Profitability',
        subtitle: 'Real-time job margin & cost waterfall',
        description:
          'Dynamic margin analysis rolling up Direct Materials, Operator Labor, Machine Hours, Wastage, and Overhead vs Net Invoiced Price.',
        icon: TrendingUp,
        primaryHref: '/orders',
        primaryLabel: 'Order Profitability',
        badge: { text: 'Live Margin %', type: 'emerald' },
        tags: ['Material Cost', 'Labor Rollup', 'Machine Rate', 'Net Margin %'],
        quickActions: [
          { label: 'View Cost Waterfall', href: '/orders' },
          { label: 'Profit Variance', href: '/finance' },
        ],
      },

      // 3. SALES
      {
        id: 'sales-proforma',
        category: 'sales',
        categoryName: 'Sales',
        categoryColor: '#10b981',
        title: 'Proforma Invoices',
        subtitle: 'Official quotations & commercial proposals',
        description:
          'Mandatory for Ethiopian corporate & government sales. Issue official proforma invoices with validity periods and 15% VAT or Non-VAT toggles.',
        icon: FileCheck,
        primaryHref: '/sales',
        primaryLabel: 'Proforma Manager',
        badge: { text: 'Quotations', type: 'emerald' },
        tags: ['Commercial Quotation', 'Validity Terms', '15% VAT / Exempt', 'Convert to PO'],
        quickActions: [
          { label: 'Active Proformas', href: '/sales' },
          { label: 'Create New Proforma', href: '/sales' },
        ],
      },
      {
        id: 'sales-invoices',
        category: 'sales',
        categoryName: 'Sales',
        categoryColor: '#10b981',
        title: 'Tax & Commercial Invoicing',
        subtitle: '15% VAT invoices, exempt bills & PDF preview',
        description:
          'Generate statutory Ethiopian tax invoices with TIN, itemized descriptions, 15% VAT math, QR verification, and statutory exemption declarations.',
        icon: Receipt,
        primaryHref: '/sales',
        primaryLabel: 'Invoices & Billing',
        badge: { text: `${unpaidInvoicesCount} Due`, type: unpaidInvoicesCount > 0 ? 'rose' : 'emerald' },
        tags: ['15% VAT Compliant', 'Non-VAT Exempt', 'TIN Matching', 'Printable PDF'],
        quickActions: [
          { label: 'Invoice Register', href: '/sales' },
          { label: 'Issue Tax Invoice', href: '/sales' },
        ],
      },
      {
        id: 'sales-collections',
        category: 'sales',
        categoryName: 'Sales',
        categoryColor: '#10b981',
        title: 'Collections & Digital Receipts',
        subtitle: 'Telebirr, CBE, Chapa, Awash & Cash receipts',
        description:
          'Record client settlements with transaction reference validation. Automatically updates invoice payment status and releases customer credit limits.',
        icon: Wallet,
        primaryHref: '/collections',
        primaryLabel: 'Collections Desk',
        badge: { text: `${collections.length} Payments`, type: 'emerald' },
        tags: ['Telebirr Payment', 'CBE Bank Transfer', 'Chapa Gateway', 'Cash Desk'],
        quickActions: [
          { label: 'Payment Ledger', href: '/collections' },
          { label: 'Record New Receipt', href: '/collections' },
        ],
      },

      // 4. HR
      {
        id: 'hr-dashboard',
        category: 'hr',
        categoryName: 'HR',
        categoryColor: '#eab308',
        title: 'Dedicated HR & People Operations Hub',
        subtitle: 'Executive graphical command center, headcount & attendance',
        description:
          'Comprehensive HR ERP suite with graphical analytics, department headcount distribution donut, live shift biometric tracker, and recruitment talent pipeline.',
        icon: Users,
        primaryHref: '/hr',
        primaryLabel: 'Open Dedicated HR Hub',
        badge: { text: 'Dedicated Hub', type: 'amber' },
        tags: ['Graphical UI', 'Headcount Donut', 'Shift Logs', 'Recruitment Pipeline'],
        quickActions: [
          { label: 'Executive Command', href: '/hr' },
          { label: 'Personnel Directory', href: '/hr' },
        ],
      },
      {
        id: 'hr-employees',
        category: 'hr',
        categoryName: 'HR',
        categoryColor: '#eab308',
        title: 'Employee Directory & Wages',
        subtitle: 'Staff profiles, positions & hourly rates',
        description:
          'Manage workforce records across Design, Production, Assembly, Installation, Sales, and Admin with hourly/monthly wage parameters.',
        icon: Users,
        primaryHref: '/hr',
        primaryLabel: 'Employee Roster',
        badge: { text: `${employees.length} Staff`, type: 'amber' },
        tags: ['Designers', 'Machine Operators', 'Welders & Installers', 'Wage Rates'],
        quickActions: [
          { label: 'Employee List', href: '/hr' },
          { label: 'Add Employee', href: '/hr' },
        ],
      },
      {
        id: 'hr-attendance',
        category: 'hr',
        categoryName: 'HR',
        categoryColor: '#eab308',
        title: 'Attendance, Shifts & Leaves',
        subtitle: 'Biometric daily punch logs & 16-day leave balances',
        description:
          'Track daily presence, shift punctuality, and hours logged by workshop technicians and machine operators with leave approval queues.',
        icon: CalendarCheck,
        primaryHref: '/hr',
        primaryLabel: 'Attendance & Leaves',
        badge: { text: 'Live Roster', type: 'amber' },
        tags: ['Shift Tracking', 'Clock-in / Out', 'Leave Balances', 'Work Shifts'],
        quickActions: [
          { label: 'Daily Timesheet', href: '/hr' },
          { label: 'Leave Requests', href: '/hr' },
        ],
      },
      {
        id: 'hr-overtime',
        category: 'hr',
        categoryName: 'HR',
        categoryColor: '#eab308',
        title: 'Direct Labor Work Order Allocation',
        subtitle: 'Operator hours mapped to client manufacturing orders',
        description:
          'Crucial for rush advertising deadlines. Log approved workshop operator hours and directly allocate direct labor expenses to specific customer jobs.',
        icon: Clock,
        primaryHref: '/hr',
        primaryLabel: 'Order Direct Costing',
        badge: { text: 'Job Costing', type: 'amber' },
        tags: ['Direct Labor Cost', 'Order Tagging', 'CNC Operators', 'Profitability'],
        quickActions: [
          { label: 'Labor Allocation', href: '/hr' },
          { label: 'Allocate to Order', href: '/hr' },
        ],
      },
      {
        id: 'hr-payroll',
        category: 'hr',
        categoryName: 'HR',
        categoryColor: '#eab308',
        title: 'Factory Payroll & Ethiopian Tax',
        subtitle: 'Pension (11% + 7%), MoR tax schedule & payslips',
        description:
          'Automated monthly payroll processing with statutory Ethiopian deductions: 11% employer pension, 7% employee pension, and progressive income tax tiers.',
        icon: DollarSign,
        primaryHref: '/hr',
        primaryLabel: 'Payroll Processing',
        badge: { text: 'Monthly Run', type: 'amber' },
        tags: ['11% Employer Pension', '7% Employee Pension', 'Income Tax Tiers', 'Net Pay'],
        quickActions: [
          { label: 'Run Monthly Payroll', href: '/hr?tab=payroll' },
          { label: 'Download Slips', href: '/hr?tab=payroll' },
        ],
      },

      // 5. INVENTORY
      {
        id: 'inventory-stores',
        category: 'inventory',
        categoryName: 'Inventory',
        categoryColor: '#f59e0b',
        title: 'Stores & Stock Catalog',
        subtitle: 'Raw vinyl, acrylic, sheet metals, LEDs & inks',
        description:
          'Monitor item balances, unit costs, reorder levels, and Amharic naming across Main Store, Raw Materials Warehouse, and Floor Stores.',
        icon: Boxes,
        primaryHref: '/inventory',
        primaryLabel: 'Stock Catalog',
        badge: {
          text: lowStockItems.length > 0 ? `${lowStockItems.length} Low Stock` : `${items.length} Items`,
          type: lowStockItems.length > 0 ? 'amber' : 'emerald',
        },
        tags: ['Stock Balances', 'Amharic Names', 'Reorder Triggers', 'Multi-Store'],
        quickActions: [
          { label: 'View Stock Matrix', href: '/inventory' },
          { label: 'Low Stock Alerts', href: '/inventory' },
        ],
      },
      {
        id: 'inventory-purchase',
        category: 'inventory',
        categoryName: 'Inventory',
        categoryColor: '#f59e0b',
        title: 'Purchasing & Supplier POs',
        subtitle: 'Purchase requisitions, supplier POs & approvals',
        description:
          'Manage vendor quotes, issue approved Purchase Orders, record supplier payment terms, and track delivery ETAs for raw substrates and inks.',
        icon: ShoppingCart,
        primaryHref: '/procurement',
        primaryLabel: 'Purchase Orders',
        badge: { text: `${pendingPOsCount} Active POs`, type: 'amber' },
        tags: ['Supplier POs', 'Payment Terms', 'Input VAT 15%', 'Approval Flow'],
        quickActions: [
          { label: 'PO Register', href: '/procurement' },
          { label: 'Create Purchase Order', href: '/procurement' },
        ],
      },
      {
        id: 'inventory-grn',
        category: 'inventory',
        categoryName: 'Inventory',
        categoryColor: '#f59e0b',
        title: 'Goods Receipt Note (GRN)',
        subtitle: 'Inbound inspection, batch lots & accepted qty',
        description:
          'Inspect incoming goods from suppliers. Record accepted vs rejected counts, lot/batch numbers, and automatically increment target warehouse balances.',
        icon: Truck,
        primaryHref: '/procurement',
        primaryLabel: 'Goods Receipts',
        badge: { text: 'Quality QA', type: 'amber' },
        tags: ['Inbound QA', 'Store Destination', 'Batch / Lot #', 'Receipt Verification'],
        quickActions: [
          { label: 'Receive Goods', href: '/procurement' },
          { label: 'Receipt History', href: '/procurement' },
        ],
      },
      {
        id: 'inventory-transfers',
        category: 'inventory',
        categoryName: 'Inventory',
        categoryColor: '#f59e0b',
        title: 'Store Transfers & Issues',
        subtitle: 'Inter-warehouse transfers & job stock issues',
        description:
          'Execute immutable stock movements: transfer acrylic rolls from Raw Store to Production Floor, or issue materials directly to a customer work order.',
        icon: ArrowRightLeft,
        primaryHref: '/inventory',
        primaryLabel: 'Stock Movements',
        badge: { text: 'Movement Log', type: 'amber' },
        tags: ['Inter-Store Transfer', 'Production Issue', 'Count Adjustment', 'Audit Log'],
        quickActions: [
          { label: 'Transfer Stock', href: '/inventory' },
          { label: 'Movement Ledger', href: '/inventory' },
        ],
      },
      {
        id: 'inventory-wastage',
        category: 'inventory',
        categoryName: 'Inventory',
        categoryColor: '#f59e0b',
        title: 'Wastage & Scrap Tracker',
        subtitle: 'Reason tagging (damaged, off-cut, scrap, expired)',
        description:
          'Minimize workshop losses. Record scrap quantities with reason codes, responsible staff, and automatically attribute cost to the linked work order.',
        icon: Trash2,
        primaryHref: '/inventory',
        primaryLabel: 'Wastage Center',
        badge: { text: `${wastages.length} Logs`, type: 'rose' },
        tags: ['Off-cut Loss', 'Print Scrap', 'Operator Error', 'Cost Impact'],
        quickActions: [
          { label: 'Log Wastage Form', href: '/inventory' },
          { label: 'Wastage Analytics', href: '/inventory' },
        ],
      },

      // 6. FINANCE
      {
        id: 'finance-revenue',
        category: 'finance',
        categoryName: 'Finance',
        categoryColor: '#10b981',
        title: 'Revenue & Cash Inflow',
        subtitle: 'Invoiced revenue, cash collected & AR aging',
        description:
          'Monitor top-line business velocity. Compare net invoiced billings against realized digital collections, and review 30/60/90-day aging balances.',
        icon: Landmark,
        primaryHref: '/finance',
        primaryLabel: 'Revenue Analysis',
        badge: { text: `ETB ${(companyFinancials.totalRevenueNet / 1000).toFixed(0)}k`, type: 'emerald' },
        tags: ['Net Revenue', 'Cash Realization', 'AR Aging', 'Credit Utilization'],
        quickActions: [
          { label: 'Revenue Trends', href: '/finance' },
          { label: 'Receivables Aging', href: '/finance' },
        ],
      },
      {
        id: 'finance-expenses',
        category: 'finance',
        categoryName: 'Finance',
        categoryColor: '#10b981',
        title: 'Operating & Job Expenses',
        subtitle: 'Fixed overhead vs job-linked variable expenses',
        description:
          'Track factory rent, electricity, delivery truck fuel, and order-specific contractor expenses. Seamlessly link expenses to customer jobs.',
        icon: PieChart,
        primaryHref: '/expenses',
        primaryLabel: 'Expense Ledger',
        badge: { text: `ETB ${(companyFinancials.totalExpenses / 1000).toFixed(0)}k`, type: 'emerald' },
        tags: ['Fixed Costs', 'Order-Linked Fuel', 'Equipment Maintenance', 'Overhead'],
        quickActions: [
          { label: 'Record Expense Form', href: '/expenses' },
          { label: 'Expense Breakdown', href: '/expenses' },
        ],
      },
      {
        id: 'finance-pnl',
        category: 'finance',
        categoryName: 'Finance',
        categoryColor: '#10b981',
        title: 'Income Statement (P&L)',
        subtitle: 'Gross profit, operating margins & net income',
        description:
          'Executive P&L ledger: Net Revenue − Direct COGS = Gross Profit − Operating Expenses = Net Operating Income and overall business margin %.',
        icon: Scale,
        primaryHref: '/finance',
        primaryLabel: 'P&L Statement',
        badge: {
          text: `${companyFinancials.totalRevenueNet > 0 ? ((companyFinancials.operatingProfit / companyFinancials.totalRevenueNet) * 100).toFixed(1) : 0}% Net`,
          type: 'emerald',
        },
        tags: ['COGS Rollup', 'Gross Profit', 'Operating Income', 'Net Margin'],
        quickActions: [
          { label: 'View Income Statement', href: '/finance' },
          { label: 'Export P&L', href: '/finance' },
        ],
      },
      {
        id: 'finance-vat',
        category: 'finance',
        categoryName: 'Finance',
        categoryColor: '#10b981',
        title: 'VAT Statement & ERCA Ledger',
        subtitle: 'Output VAT vs Input VAT = Net VAT payable',
        description:
          'Stay compliant with Ethiopian tax authorities. Automatically reconciles 15% Output VAT collected on sales against Input VAT paid on purchases.',
        icon: Receipt,
        primaryHref: '/finance',
        primaryLabel: 'VAT Statement',
        badge: { text: `ETB ${(companyFinancials.netVatPayable / 1000).toFixed(0)}k Tax`, type: 'emerald' },
        tags: ['15% Output VAT', 'Input VAT Deductions', 'Net Payable', 'ERCA Return'],
        quickActions: [
          { label: 'VAT Summary', href: '/finance' },
          { label: 'Tax Audit Schedule', href: '/finance' },
        ],
      },

      // 7. REPORT
      {
        id: 'report-comparisons',
        category: 'report',
        categoryName: 'Report',
        categoryColor: '#ec4899',
        title: 'Performance Comparisons',
        subtitle: 'Month-over-month growth & budget variance',
        description:
          'Analyze operational trends: compare monthly sales targets against actuals, estimated quote cost vs final factory cost, and machine uptime.',
        icon: BarChart3,
        primaryHref: '/finance',
        primaryLabel: 'Comparative Analytics',
        badge: { text: 'Monthly MoM', type: 'purple' },
        tags: ['Estimated vs Actual', 'Sales Targets', 'Scrap Trends', 'Department Benchmarks'],
        quickActions: [
          { label: 'Cost Variance Report', href: '/finance' },
          { label: 'Monthly Growth', href: '/finance' },
        ],
      },
      {
        id: 'report-exports',
        category: 'report',
        categoryName: 'Report',
        categoryColor: '#ec4899',
        title: 'Export Center & Downloads',
        subtitle: 'Exportable CSV, Excel & printable PDF reports',
        description:
          'One-click extraction of formatted datasets for management, tax accountants, and board review. Generate print-ready executive summaries.',
        icon: FileSpreadsheet,
        primaryHref: '/finance',
        primaryLabel: 'Export Center',
        badge: { text: 'CSV & PDF', type: 'purple' },
        tags: ['Excel Sheets', 'CSV Raw Export', 'Printable PDF', 'Accounting Schedule'],
        quickActions: [
          { label: 'Export Financials', href: '/finance' },
          { label: 'Export Inventory', href: '/inventory' },
        ],
      },
      {
        id: 'report-audit',
        category: 'report',
        categoryName: 'Report',
        categoryColor: '#ec4899',
        title: 'Audit Trail ("Who, What & When")',
        subtitle: 'Chronological immutable log of all user actions',
        description:
          'Enterprise accountability ledger. Detailed record of who created purchase orders, who approved proofs, who issued stock, and who accepted cash.',
        icon: History,
        primaryHref: '/finance',
        primaryLabel: 'Audit Trail Log',
        badge: { text: 'Activity Log', type: 'purple' },
        tags: ['User Accountability', 'Timestamped Log', 'Stock Approvals', 'Cash Verification'],
        quickActions: [
          { label: 'View Activity Stream', href: '/finance' },
          { label: 'Security Log', href: '/finance' },
        ],
      },

      // 8. DASHBOARD
      {
        id: 'dashboard-cockpit',
        category: 'dashboard',
        categoryName: 'Dashboard',
        categoryColor: '#4f46e5',
        title: 'Executive Cockpit',
        subtitle: 'Unified operational summary across all 8 modules',
        description:
          'Single-pane-of-glass executive view: High-level financial KPIs, critical low-stock warnings, live work orders, and instant action shortcuts.',
        icon: LayoutDashboard,
        primaryHref: '/',
        primaryLabel: 'Launch Dashboard',
        badge: { text: 'Master Cockpit', type: 'indigo' },
        tags: ['Executive Overview', 'Live Alerts', 'Multi-Module KPI', 'Quick Launch'],
        quickActions: [
          { label: 'Open Main Dashboard', href: '/' },
          { label: 'System Overview', href: '/' },
        ],
      },
    ],
    [
      customers.length,
      activeOrdersCount,
      openWOsCount,
      unpaidInvoicesCount,
      collections.length,
      employees.length,
      lowStockItems.length,
      items.length,
      pendingPOsCount,
      wastages.length,
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
    { key: 'all', label: 'All Modules & Forms', count: cards.length },
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
            href="/"
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
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>24 Workflows & Forms</div>
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
            <span>Showing {filteredCards.length} of {cards.length} cards</span>
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
            No matching modules or forms found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            Try adjusting your search query or reset the category filter to browse all 24 cards.
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

        <Link href="/" className="btn btn-secondary" style={{ gap: '6px' }}>
          <span>Return to Dashboard</span>
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
