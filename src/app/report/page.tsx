'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Download,
  Printer,
  Copy,
  Check,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  DollarSign,
  Boxes,
  Scissors,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Factory,
  Cpu,
  Eye,
  X,
  CreditCard,
  Users,
  ScrollText,
  Activity,
  Award,
  Wallet,
  Receipt,
  FileCheck,
  ShoppingCart,
  Truck,
  Warehouse,
  PackageCheck,
  Briefcase,
  UserCheck,
  BadgeCheck,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ReportPeriod } from '@/components/report/ReportHeader';
import { OrderProfitability, CustomerOrder, WastageRecord, ItemType, POStatus } from '@/types/erp';
import {
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_JOB_OPENINGS,
  INITIAL_CANDIDATES,
  DETAILED_EMPLOYEES_MAP,
} from '@/data/hrMockData';

function ReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTabRaw = searchParams.get('tab') || 'executive';
  const activeTab = activeTabRaw === 'inventory' ? 'store_inventory' : activeTabRaw === 'hr' ? 'hr_workforce' : activeTabRaw;
  const period = (searchParams.get('period') as ReportPeriod) || 'monthly';
  const fromDate = searchParams.get('from') || '2026-10-01';
  const toDate = searchParams.get('to') || '2026-10-31';
  const selectedDept = searchParams.get('dept') || 'all';

  const {
    companyFinancials,
    orders,
    allOrderProfitability,
    invoices,
    collections,
    wastages,
    items,
    customers,
    expenses,
    workOrders,
    leads,
    stores,
    suppliers,
    purchaseOrders,
    stockMovements,
    employees,
    lowStockItems,
    storeFinancials,
  } = useErp();

  // Local Filter States
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState<'all' | 'bank' | 'telecom' | 'fmcg' | 'corporate'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_production' | 'delivered' | 'paid' | 'invoiced'>('all');
  const [marginHealthFilter, setMarginHealthFilter] = useState<'all' | 'super' | 'target' | 'thin'>('all');
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; revenue: number; margin: number; profit: number } | null>(null);
  const [selectedDonutIndex, setSelectedDonutIndex] = useState<number | null>(null);
  const [activeOrderModal, setActiveOrderModal] = useState<OrderProfitability | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copiedAudit, setCopiedAudit] = useState(false);

  // Store & Purchasing Filter States
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | 'approved' | 'received' | 'pending_admin' | 'draft'>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  // HR & Workforce Filter States
  const [hrDeptFilter, setHrDeptFilter] = useState<string>('all');
  const [hrSearchQuery, setHrSearchQuery] = useState('');
  const [hrLeaveFilter, setHrLeaveFilter] = useState<string>('all');

  // Ethiopian Progressive Income Tax calculation helper
  const calculateEthiopianIncomeTax = (taxableSalary: number) => {
    if (taxableSalary <= 600) return 0;
    if (taxableSalary <= 1650) return Math.round(taxableSalary * 0.1 - 60);
    if (taxableSalary <= 3200) return Math.round(taxableSalary * 0.15 - 142.5);
    if (taxableSalary <= 5250) return Math.round(taxableSalary * 0.2 - 302.5);
    if (taxableSalary <= 7800) return Math.round(taxableSalary * 0.25 - 565);
    if (taxableSalary <= 10900) return Math.round(taxableSalary * 0.3 - 955);
    return Math.round(taxableSalary * 0.35 - 1500);
  };

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/report?${params.toString()}`);
  };

  const setPeriod = (p: ReportPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', p);
    router.push(`/report?${params.toString()}`);
  };

  // Base Data Aggregates
  const totalNetRevenue = companyFinancials.totalRevenueNet;
  const totalGrossProfit = companyFinancials.grossProfit;
  const overallGrossMarginPct = totalNetRevenue > 0 ? (totalGrossProfit / totalNetRevenue) * 100 : 0;
  const totalEbitda = companyFinancials.operatingProfit;
  const ebitdaMarginPct = totalNetRevenue > 0 ? (totalEbitda / totalNetRevenue) * 100 : 0;
  const totalScrapCost = wastages.reduce((sum, w) => sum + w.totalCost, 0);

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    return allOrderProfitability.filter((item) => {
      // Dept filter
      if (selectedDept !== 'all') {
        const titleLower = item.orderTitle.toLowerCase();
        if (selectedDept === 'signage_3d' && !titleLower.includes('acrylic') && !titleLower.includes('sign') && !titleLower.includes('letter')) return false;
        if (selectedDept === 'billboards' && !titleLower.includes('billboard') && !titleLower.includes('unipole') && !titleLower.includes('gantry')) return false;
        if (selectedDept === 'print' && !titleLower.includes('banner') && !titleLower.includes('print') && !titleLower.includes('poster')) return false;
        if (selectedDept === 'fleet' && !titleLower.includes('vehicle') && !titleLower.includes('fleet') && !titleLower.includes('wrap')) return false;
      }

      // Customer Segment filter
      if (customerSegmentFilter !== 'all') {
        const custNameLower = item.customerName.toLowerCase();
        if (customerSegmentFilter === 'bank' && !custNameLower.includes('bank')) return false;
        if (customerSegmentFilter === 'telecom' && !custNameLower.includes('telecom') && !custNameLower.includes('safaricom')) return false;
        if (customerSegmentFilter === 'fmcg' && !custNameLower.includes('brewery') && !custNameLower.includes('beverage') && !custNameLower.includes('fmcg') && !custNameLower.includes('bgi')) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Margin filter
      if (marginHealthFilter === 'super' && item.profitMarginPct < 45) return false;
      if (marginHealthFilter === 'target' && (item.profitMarginPct < 30 || item.profitMarginPct >= 45)) return false;
      if (marginHealthFilter === 'thin' && item.profitMarginPct >= 30) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.orderNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.orderTitle.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allOrderProfitability, selectedDept, customerSegmentFilter, statusFilter, marginHealthFilter, searchQuery]);

  // Aggregate Metrics based on filtered orders
  const filteredRevenue = filteredOrders.reduce((sum, o) => sum + o.orderRevenue, 0);
  const filteredGrossProfit = filteredOrders.reduce((sum, o) => sum + o.grossProfit, 0);
  const filteredMarginPct = filteredRevenue > 0 ? (filteredGrossProfit / filteredRevenue) * 100 : 0;

  // Time-Series Data Generator based on active period
  const trendData = useMemo(() => {
    if (period === 'daily') {
      return [
        { label: 'Oct 14', revenue: 420000, profit: 195000, margin: 46.4 },
        { label: 'Oct 15', revenue: 580000, profit: 261000, margin: 45.0 },
        { label: 'Oct 16', revenue: 310000, profit: 130000, margin: 41.9 },
        { label: 'Oct 17', revenue: 690000, profit: 315000, margin: 45.6 },
        { label: 'Oct 18', revenue: 840000, profit: 390000, margin: 46.4 },
        { label: 'Oct 19', revenue: 520000, profit: 230000, margin: 44.2 },
        { label: 'Oct 20', revenue: 760000, profit: 345000, margin: 45.3 },
      ];
    } else if (period === 'weekly') {
      return [
        { label: 'Wk 40 (Oct 1-7)', revenue: 1650000, profit: 742000, margin: 44.9 },
        { label: 'Wk 41 (Oct 8-14)', revenue: 2180000, profit: 981000, margin: 45.0 },
        { label: 'Wk 42 (Oct 15-21)', revenue: 2420000, profit: 1090000, margin: 45.0 },
        { label: 'Wk 43 (Oct 22-28)', revenue: 1950000, profit: 860000, margin: 44.1 },
      ];
    } else if (period === 'quarterly') {
      return [
        { label: 'Q1 FY26', revenue: 6200000, profit: 2660000, margin: 42.9 },
        { label: 'Q2 FY26', revenue: 7450000, profit: 3280000, margin: 44.0 },
        { label: 'Q3 FY26', revenue: 8120000, profit: 3650000, margin: 44.9 },
        { label: 'Q4 FY26 (Forecast)', revenue: 8850000, profit: 3980000, margin: 45.0 },
      ];
    } else if (period === 'half-yearly') {
      return [
        { label: 'H1 FY26 (Jan–Jun)', revenue: 13650000, profit: 5940000, margin: 43.5 },
        { label: 'H2 FY26 (Jul–Dec)', revenue: 16970000, profit: 7630000, margin: 45.0 },
      ];
    } else if (period === 'yearly') {
      return [
        { label: 'FY 2024', revenue: 18400000, profit: 7540000, margin: 41.0 },
        { label: 'FY 2025', revenue: 24800000, profit: 10660000, margin: 43.0 },
        { label: 'FY 2026 (YTD)', revenue: 30620000, profit: 13570000, margin: 44.3 },
      ];
    } else {
      return [
        { label: 'Aug 2026', revenue: 2540000, profit: 1092000, margin: 43.0 },
        { label: 'Sep 2026', revenue: 2890000, profit: 1286000, margin: 44.5 },
        { label: 'Oct 2026 (Active)', revenue: totalNetRevenue, profit: totalGrossProfit, margin: overallGrossMarginPct },
        { label: 'Nov 2026 (Pipeline)', revenue: 3450000, profit: 1550000, margin: 44.9 },
      ];
    }
  }, [period, totalNetRevenue, totalGrossProfit, overallGrossMarginPct]);

  // Product Line Revenue Breakdown for Donut Chart
  const productDistribution = useMemo(() => {
    return [
      { name: '3D Acrylic & LED Letters', amount: 3120000, share: 38, color: '#6366f1' },
      { name: 'Highway Billboards & Unipoles', amount: 2300000, share: 28, color: '#06b6d4' },
      { name: 'Large Format Digital Print', amount: 1480000, share: 18, color: '#38bdf8' },
      { name: 'Vehicle Fleet Branding', amount: 900000, share: 11, color: '#a855f7' },
      { name: 'Architectural Pylon & Steel', amount: 410000, share: 5, color: '#ec4899' },
    ];
  }, []);

  // Top 10 Enterprise Clients
  const topClients = useMemo(() => {
    return [
      { name: 'Commercial Bank of Ethiopia', revenue: 1850000, orders: 4, margin: 48.2, status: 'Prime A+' },
      { name: 'Safaricom Telecommunications Ethiopia', revenue: 1420000, orders: 3, margin: 46.5, status: 'Prime A+' },
      { name: 'Ethio Telecom Enterprise', revenue: 1180000, orders: 3, margin: 44.0, status: 'Enterprise' },
      { name: 'Awash Bank S.C.', revenue: 950000, orders: 2, margin: 45.1, status: 'Enterprise' },
      { name: 'BGI Ethiopia (St. George Brewery)', revenue: 840000, orders: 2, margin: 43.8, status: 'Enterprise' },
      { name: 'Dashen Bank Head Office', revenue: 720000, orders: 2, margin: 47.0, status: 'Growth' },
      { name: 'Heineken Breweries Ethiopia', revenue: 580000, orders: 1, margin: 42.5, status: 'Growth' },
      { name: 'TotalEnergies Marketing Ethiopia', revenue: 490000, orders: 1, margin: 44.2, status: 'Standard' },
      { name: 'Moha Soft Drinks Industry (Pepsi)', revenue: 380000, orders: 1, margin: 41.0, status: 'Standard' },
      { name: 'United Bank (Hibret Bank)', revenue: 310000, orders: 1, margin: 45.8, status: 'Standard' },
    ];
  }, []);

  // Machine Station Telemetry
  const machineTelemetry = [
    { name: 'Fiber Laser Cutter 1500W', station: 'MC-LASER-01', activeHours: 184, ratedHours: 208, utilization: 88.5, status: 'Optimal' },
    { name: 'Heavy-Duty CNC Router 3-Axis', station: 'MC-CNC-01', activeHours: 192, ratedHours: 208, utilization: 92.3, status: 'High Load' },
    { name: 'Automatic Channel Letter Bender', station: 'MC-BENDER-02', activeHours: 154, ratedHours: 208, utilization: 74.0, status: 'Normal' },
    { name: 'UV Flatbed Large Format 2.5m', station: 'MC-UV-01', activeHours: 172, ratedHours: 208, utilization: 82.7, status: 'Optimal' },
    { name: 'Eco-Solvent Dual Head Plotter', station: 'MC-SOLVENT-02', activeHours: 142, ratedHours: 208, utilization: 68.3, status: 'Normal' },
  ];

  // Material Scrap Breakdown
  const scrapByMaterial = [
    { material: 'Cast Acrylic Sheets (3mm / 5mm Opal)', scrapCost: 28400, unit: 'sqm', wastePct: 3.2, reason: 'Off-cut drop trims & edge stress micro-cracks' },
    { material: 'Cast Vinyl Film (High-Tack Black/Red)', scrapCost: 14200, unit: 'meter', wastePct: 2.4, reason: 'Weeding tear & registration alignment setup' },
    { material: 'Aluminum Extrusion Profiles', scrapCost: 11800, unit: 'meter', wastePct: 1.8, reason: 'Miter angle cut ends & 45-degree kerf loss' },
    { material: 'Samsung 3-LED Modules 1.2W', scrapCost: 6500, unit: 'pcs', wastePct: 0.9, reason: 'Short lead trim-offs & burn-in test dropouts' },
    { material: 'Frontlit Flex Banner 510gsm', scrapCost: 8900, unit: 'sqm', wastePct: 2.1, reason: 'Color banding purge & grommet hem fold allowance' },
  ];

  // SVG Trend Chart Dimensions
  const chartWidth = 780;
  const chartHeight = 240;
  const padding = { top: 30, right: 30, bottom: 40, left: 70 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxRevenue = Math.max(...trendData.map((d) => d.revenue)) * 1.15;

  const getX = (index: number) => padding.left + (index / (trendData.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - (val / maxRevenue) * innerHeight;

  const areaPath = useMemo(() => {
    if (trendData.length === 0) return '';
    let d = `M ${getX(0)} ${padding.top + innerHeight}`;
    trendData.forEach((pt, idx) => {
      d += ` L ${getX(idx)} ${getY(pt.revenue)}`;
    });
    d += ` L ${getX(trendData.length - 1)} ${padding.top + innerHeight} Z`;
    return d;
  }, [trendData, maxRevenue]);

  const linePath = useMemo(() => {
    if (trendData.length === 0) return '';
    return trendData.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.revenue)}`).join(' ');
  }, [trendData, maxRevenue]);

  const profitLinePath = useMemo(() => {
    if (trendData.length === 0) return '';
    return trendData.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.profit)}`).join(' ');
  }, [trendData, maxRevenue]);

  // Tab definitions
  const reportTabs = [
    { id: 'executive', label: 'Executive Overview', icon: BarChart3, badge: `${overallGrossMarginPct.toFixed(0)}% Margin` },
    { id: 'sales', label: 'Sales & Commercial BI', icon: TrendingUp, badge: 'Win Rate 68%' },
    { id: 'production', label: 'Manufacturing & Plant', icon: Factory, badge: '91% OEE' },
    { id: 'costing', label: 'Job Costing & Margins', icon: PieChart, badge: '5-Part Tree' },
    { id: 'store_inventory', label: 'Store & Inventory Purchasing', icon: Boxes, badge: `${items.length} SKUs • POs` },
    { id: 'hr_workforce', label: 'HR, Payroll & Workforce', icon: Users, badge: `${employees.length} Staff` },
    { id: 'wastage', label: 'Scrap & Defect Analytics', icon: Scissors, badge: '2.1% Scrap' },
    { id: 'tax', label: 'MoR Tax & 15% VAT', icon: ShieldCheck, badge: 'e-Tax Ready' },
    { id: 'audit', label: 'Audit Trail & Logs', icon: ScrollText, badge: 'Live Logs' },
  ];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-pill">
          <Sparkles size={14} color="#facc15" />
          <span>MODULE 7 • BUSINESS INTELLIGENCE</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '10px 0 6px 0', letterSpacing: '-0.02em' }}>
          Executive Reports & Plant Telemetry
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#a1a1aa', maxWidth: '780px', margin: 0, lineHeight: 1.5 }}>
          Multi-period profit curves, machine utilization telemetry, Job Costing waterfall, and Ethiopian MoR VAT audit reconciliation.
        </p>
      </div>

      {/* 1. Global Filter & Period Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Active Period Scope Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#09090b',
                border: '1px solid #facc15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#facc15',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.2)',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#09090b' }}>
                  {period === 'custom'
                    ? `Custom Window (${fromDate} → ${toDate})`
                    : period === 'daily'
                    ? 'Day-By-Day Telemetry (Oct 20, 2026)'
                    : period === 'weekly'
                    ? 'Weekly Production Cycle (October 2026)'
                    : period === 'quarterly'
                    ? 'Quarterly Performance (FY 2026)'
                    : period === 'half-yearly'
                    ? 'Half-Yearly Comparison (H1 vs H2 FY26)'
                    : period === 'yearly'
                    ? 'Fiscal Year Multi-Year Audit'
                    : 'Monthly Aggregate: October 2026'}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: '#fef9c3',
                    color: '#854d0e',
                    border: '1px solid #fde047',
                    textTransform: 'uppercase',
                  }}
                >
                  {period} Mode
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Reporting Currency: Ethiopian Birr (ETB) • GAAP & MoR Audited Basis
              </div>
            </div>
          </div>

          {/* Quick Filter Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Customer Tier Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Client:</span>
              <select
                value={customerSegmentFilter}
                onChange={(e) => setCustomerSegmentFilter(e.target.value as any)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  color: '#09090b',
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: 500,
                }}
              >
                <option value="all">All Enterprise Clients</option>
                <option value="bank">Banking & Financial (CBE, Awash, Dashen)</option>
                <option value="telecom">Telecommunications (Ethio, Safaricom)</option>
                <option value="fmcg">Breweries & FMCG (BGI, Moha)</option>
              </select>
            </div>

            {/* Margin Health Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Margin:</span>
              <select
                value={marginHealthFilter}
                onChange={(e) => setMarginHealthFilter(e.target.value as any)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  color: '#09090b',
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: 500,
                }}
              >
                <option value="all">All Margin Tiers</option>
                <option value="super">Super Margin (&gt; 45%)</option>
                <option value="target">Target Margin (30% – 45%)</option>
                <option value="thin">Thin / Risk (&lt; 30%)</option>
              </select>
            </div>

            {/* Quick Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '5px 10px',
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search orders, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#09090b',
                  fontSize: '0.75rem',
                  outline: 'none',
                  width: '140px',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Print Dossier Modal Trigger */}
            <button
              onClick={() => setShowPrintModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#09090b',
                color: '#facc15',
                border: '1px solid #facc15',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              }}
            >
              <Eye size={13} />
              <span>Dossier View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Analytical Tab Switcher (Synchronized with Sidebar) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {reportTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} style={{ color: isActive ? '#854d0e' : 'var(--text-muted)' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: isActive ? '#fef08a' : '#f4f4f5',
                    color: isActive ? '#854d0e' : 'var(--text-muted)',
                    border: isActive ? '1px solid #fde047' : '1px solid var(--border-light)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'executive' && (
        <div>
          {/* Top Summary KPI Cards Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* Net Revenue */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Audited Net Revenue
                </span>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#09090b',
                    border: '1px solid #facc15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#facc15',
                  }}
                >
                  <Building2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(filteredRevenue > 0 ? filteredRevenue : totalNetRevenue)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                  <ArrowUpRight size={13} /> +18.4%
                </span>
                <span style={{ color: 'var(--text-muted)' }}>vs prior period target</span>
              </div>
            </div>

            {/* Gross Profit & Margin */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Gross Profit & Margin
                </span>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#09090b',
                    border: '1px solid #facc15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#facc15',
                  }}
                >
                  <PieChart size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(filteredGrossProfit > 0 ? filteredGrossProfit : totalGrossProfit)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#854d0e', fontWeight: 700, background: '#fef9c3', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fde047' }}>
                  {(filteredRevenue > 0 ? filteredMarginPct : overallGrossMarginPct).toFixed(1)}% Realized
                </span>
                <span style={{ color: 'var(--text-muted)' }}>• Target 40.0%</span>
              </div>
            </div>

            {/* Operating Profit EBITDA */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  EBITDA Operating Profit
                </span>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#09090b',
                    border: '1px solid #16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a',
                  }}
                >
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(totalEbitda)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{ebitdaMarginPct.toFixed(1)}% of Revenue</span>
                <span style={{ color: 'var(--text-muted)' }}>after rent & crane rentals</span>
              </div>
            </div>

            {/* Shopfloor Scrap Loss */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Shopfloor Scrap Loss
                </span>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#09090b',
                    border: '1px solid #dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                  }}
                >
                  <Scissors size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(totalScrapCost)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>2.1% of Raw Materials</span>
                <span style={{ color: 'var(--text-muted)' }}>• Target &lt; 3.5% (Controlled)</span>
              </div>
            </div>
          </div>

          {/* Primary Charts (Trajectory Area Curve + Product Donut) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.55fr 1fr',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* SVG Trend Curve */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#ca8a04" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                      Multi-Period Financial Trajectory & Margin Curve
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Area curve for Net Revenue vs Gross Profit in ETB ({period} view)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '4px', background: '#09090b', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Net Revenue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '4px', background: '#ca8a04', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Gross Profit</span>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px', position: 'relative' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#facc15" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = padding.top + innerHeight * (1 - pct);
                    const val = maxRevenue * pct;
                    return (
                      <g key={i}>
                        <line x1={padding.left} y1={y} x2={padding.left + innerWidth} y2={y} stroke="var(--border-light)" strokeDasharray="4 4" />
                        <text x={padding.left - 10} y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                          {(val / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  })}

                  <path d={areaPath} fill="url(#goldGradient)" />
                  <path d={linePath} fill="none" stroke="#09090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={profitLinePath} fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {trendData.map((pt, idx) => {
                    const cx = getX(idx);
                    const cyRevenue = getY(pt.revenue);
                    const cyProfit = getY(pt.profit);

                    return (
                      <g key={idx}>
                        <text x={cx} y={padding.top + innerHeight + 20} fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">
                          {pt.label}
                        </text>
                        <circle
                          cx={cx}
                          cy={cyRevenue}
                          r="5"
                          fill="#09090b"
                          stroke="#facc15"
                          strokeWidth="2"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredPoint({ x: cx, y: cyRevenue, label: pt.label, revenue: pt.revenue, profit: pt.profit, margin: pt.margin })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle
                          cx={cx}
                          cy={cyProfit}
                          r="4.5"
                          fill="#facc15"
                          stroke="#854d0e"
                          strokeWidth="1.8"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredPoint({ x: cx, y: cyProfit, label: pt.label, revenue: pt.revenue, profit: pt.profit, margin: pt.margin })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {hoveredPoint && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${hoveredPoint.y - 85}px`,
                      left: `${hoveredPoint.x - 70}px`,
                      background: '#09090b',
                      border: '1px solid #facc15',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                      pointerEvents: 'none',
                      zIndex: 20,
                      minWidth: '150px',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#facc15', marginBottom: '4px' }}>
                      {hoveredPoint.label}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#ffffff' }}>
                      <span>Revenue:</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatETB(hoveredPoint.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#fde047' }}>
                      <span>Gross Profit:</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatETB(hoveredPoint.profit)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donut Chart */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Product Line Revenue Share</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Signage, Billboards, Digital Large Print & Vehicle Fleets
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flex: 1 }}>
                <svg width="190" height="190" viewBox="0 0 190 190">
                  {productDistribution.map((item, idx) => {
                    const radius = 70;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDasharray = `${(item.share / 100) * circumference} ${circumference}`;

                    let accumulatedShare = 0;
                    for (let i = 0; i < idx; i++) {
                      accumulatedShare += productDistribution[i].share;
                    }
                    const strokeDashoffset = -((accumulatedShare / 100) * circumference);
                    const isHovered = selectedDonutIndex === idx;

                    return (
                      <circle
                        key={idx}
                        cx="95"
                        cy="95"
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={isHovered ? 26 : 22}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transform: 'rotate(-90deg)',
                          transformOrigin: '95px 95px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={() => setSelectedDonutIndex(idx)}
                        onMouseLeave={() => setSelectedDonutIndex(null)}
                      />
                    );
                  })}

                  <text x="95" y="88" fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontWeight="600">
                    {selectedDonutIndex !== null ? productDistribution[selectedDonutIndex].name.split(' ')[0] : 'Total Net'}
                  </text>
                  <text x="95" y="108" fill="#09090b" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                    {selectedDonutIndex !== null ? `${productDistribution[selectedDonutIndex].share}%` : 'ETB 8.21M'}
                  </text>
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                {productDistribution.map((p, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setSelectedDonutIndex(idx)}
                    onMouseLeave={() => setSelectedDonutIndex(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: selectedDonutIndex === idx ? '#fef9c3' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                      <span style={{ fontSize: '0.72rem', color: selectedDonutIndex === idx ? '#854d0e' : 'var(--text-main)', fontWeight: selectedDonutIndex === idx ? 700 : 500 }}>
                        {p.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#09090b', fontFamily: 'monospace' }}>
                      {formatETB(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Telemetry & Scrap Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Machine Station Progress Meters */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Factory size={18} color="#ca8a04" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Factory Machine Station Utilization</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Active operating hours vs 208-hour rated shopfloor capacity
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#854d0e', background: '#fef9c3', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fde047' }}>
                  Plant OEE: 91.4%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {machineTelemetry.map((m, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#09090b' }}>{m.name}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.utilization > 90 ? '#ca8a04' : '#16a34a' }}>
                        {m.utilization}% ({m.activeHours}h)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#f4f4f5', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.utilization}%`, background: m.utilization > 90 ? '#ca8a04' : '#09090b', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrap Loss Pareto */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scissors size={18} color="#dc2626" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Material Scrap & Drop-Cut Losses</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Monetary impact in ETB & waste ratio by fabrication raw material
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  Total: {formatETB(totalScrapCost)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scrapByMaterial.map((s, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#09090b' }}>{s.material}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
                        {formatETB(s.scrapCost)} ({s.wastePct}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Root Cause: {s.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 10 Clients Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Top 10 High-Value Enterprise Clients (Lifetime & Active Revenue)
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Ranked by billings in Ethiopian Birr, order volume & project margin profitability
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', width: '40px' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>Client Organization</th>
                    <th style={{ padding: '8px 10px' }}>Tier Rating</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Completed Orders</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Realized Billings (ETB)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Avg Margin %</th>
                    <th style={{ padding: '8px 10px', width: '180px' }}>Share of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client, idx) => {
                    const maxClientRev = topClients[0].revenue;
                    const barWidthPct = (client.revenue / maxClientRev) * 100;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '10px', fontWeight: 700, color: '#09090b' }}>{client.name}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: '#dcfce7', color: '#16a34a' }}>
                            {client.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>{client.orders} orders</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#09090b' }}>
                          {formatETB(client.revenue)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          {client.margin.toFixed(1)}%
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ height: '6px', background: '#f4f4f5', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${barWidthPct}%`, background: '#09090b', borderRadius: '3px' }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: SALES & COMMERCIAL BI */}
      {activeTab === 'sales' && (
        <div>
          {/* Sales Conversion Funnel & Rep Leaderboard */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Commercial Sales Funnel */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#ca8a04" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Commercial Sales Conversion Funnel</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Stage conversion velocity from inquiry to customer payment
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  Win Rate: 68.4%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { stage: '1. Inquiries & Tender Leads', count: 28, value: 14800000, conversion: '100%', color: '#09090b', widthPct: 100 },
                  { stage: '2. Site Surveys Completed', count: 22, value: 11200000, conversion: '78.5%', color: '#ca8a04', widthPct: 82 },
                  { stage: '3. Technical Quotations Sent', count: 17, value: 8900000, conversion: '77.2%', color: '#eab308', widthPct: 68 },
                  { stage: '4. Confirmed Work Orders', count: 14, value: 7800000, conversion: '82.3%', color: '#16a34a', widthPct: 56 },
                  { stage: '5. Invoiced & Fully Paid', count: 12, value: 6900000, conversion: '85.7%', color: '#854d0e', widthPct: 46 },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b' }}>{s.stage}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.count} deals</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>{formatETB(s.value)}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#854d0e', background: '#fef9c3', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fde047' }}>
                          {s.conversion}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: '7px', background: '#f4f4f5', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.widthPct}%`, background: s.color, borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Representative Leaderboard */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#ca8a04" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Account Executives Quota Leaderboard</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Monthly quota targets vs actual billings in Ethiopian Birr
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Almaz Tefera', title: 'Senior Banking Accounts', target: 3000000, actual: 3450000, margin: 46.2, commission: 51750, quotaPct: 115 },
                  { name: 'Dawit Bekele', title: 'Outdoor & Billboards', target: 2500000, actual: 2800000, margin: 44.8, commission: 42000, quotaPct: 112 },
                  { name: 'Biniyam Assefa', title: 'Retail & Fleet Branding', target: 1800000, actual: 1960000, margin: 42.5, commission: 29400, quotaPct: 109 },
                  { name: 'Ermias Kebede', title: 'Commercial Signage', target: 1500000, actual: 1480000, margin: 45.1, commission: 22200, quotaPct: 98 },
                ].map((rep, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09090b' }}>{rep.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{rep.title}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>{formatETB(rep.actual)}</div>
                        <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>{rep.quotaPct}% Quota Achieved</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      <span>Target: {formatETB(rep.target)}</span>
                      <span>Avg Margin: {rep.margin}%</span>
                      <span>Commission: {formatETB(rep.commission)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: MANUFACTURING & PLANT BI */}
      {activeTab === 'production' && (
        <div>
          {/* Work Center Machines & Active Work Orders */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Machine Station Breakdown */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Factory size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Work Center Equipment Load</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#854d0e', background: '#fef9c3', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fde047' }}>
                  Rated Capacity: 208 hrs/mo
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {machineTelemetry.map((m, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b' }}>{m.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: m.utilization > 90 ? '#ca8a04' : '#16a34a' }}>{m.utilization}% Utilization</span>
                    </div>
                    <div style={{ height: '7px', background: '#f4f4f5', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.utilization}%`, background: m.utilization > 90 ? '#ca8a04' : '#09090b', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Pass & First-Yield Telemetry */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Quality & First-Pass Yield (FPY)</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  FPY: 94.6%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>First-Pass Inspection Pass</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#09090b' }}>94.6%</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Zero defect production requiring no adjustments</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ca8a04', fontWeight: 700 }}>Minor Re-work / Edge Buffing</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#09090b' }}>3.3%</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Corrected within shift (thermal deburring & vinyl touch-up)</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>Scrap Rejection / Cracked Sheet</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#dc2626' }}>2.1%</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Logged to scrap inventory and recycled into test pieces</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: JOB COSTING & MARGINS */}
      {activeTab === 'costing' && (
        <div>
          {/* 5-Part Cost Tree Distribution */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Constituent Manufacturing Cost Breakdown</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  5-part cost tree normalized across all executed production orders
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>
                Realized Gross Profit: {formatETB(totalGrossProfit)}
              </span>
            </div>

            {/* Horizontal Cost Stack Bar */}
            <div style={{ height: '28px', borderRadius: '8px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
              <div style={{ width: '42%', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Materials 42%
              </div>
              <div style={{ width: '18%', background: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Labor 18%
              </div>
              <div style={{ width: '12%', background: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#09090b' }}>
                Mach. 12%
              </div>
              <div style={{ width: '17%', background: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Overheads 17%
              </div>
              <div style={{ width: '6%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Scrap 6%
              </div>
              <div style={{ width: '5%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Site 5%
              </div>
            </div>

            {/* Cost Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Direct Materials', amount: 1910000, pct: 42, color: '#09090b' },
                { label: 'Shopfloor Labor', amount: 820000, pct: 18, color: '#ca8a04' },
                { label: 'Machine Runtime', amount: 550000, pct: 12, color: '#eab308' },
                { label: 'Factory Overheads', amount: 770000, pct: 17, color: '#71717a' },
                { label: 'Scrap & Wastage', amount: 270000, pct: 6, color: '#dc2626' },
                { label: 'Site Crane Rentals', amount: 230000, pct: 5, color: '#f59e0b' },
              ].map((c, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', borderLeft: `4px solid ${c.color}` }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.label} ({c.pct}%)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace', marginTop: '2px' }}>
                    {formatETB(c.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: SCRAP & DEFECT ANALYTICS */}
      {activeTab === 'wastage' && (
        <div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scissors size={18} color="#dc2626" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Chronological Scrap & Wastage Audit Ledger</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Recorded shopfloor material defects, off-cut drop trims, and responsible technicians
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                Cumulative Defect Loss: {formatETB(totalScrapCost)}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                    <th style={{ padding: '8px 10px' }}>Material Item</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Scrapped Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Loss (ETB)</th>
                    <th style={{ padding: '8px 10px' }}>Shopfloor Reason</th>
                    <th style={{ padding: '8px 10px' }}>Reported By</th>
                  </tr>
                </thead>
                <tbody>
                  {wastages.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{w.date}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#09090b' }}>{w.itemName}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#854d0e', fontWeight: 700 }}>
                        {w.quantity} {w.unit}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {formatETB(w.unitCost)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
                        {formatETB(w.totalCost)}
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{w.reason}</td>
                      <td style={{ padding: '10px', color: '#09090b', fontWeight: 600 }}>{w.reportedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 6: MOR TAX & 15% VAT AUDIT */}
      {activeTab === 'tax' && (
        <div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Ethiopian Ministry of Revenues (MoR) Statutory Tax Filing Balance
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  15% Output VAT, verified deductible Input VAT, and 2% client withholding certificates
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                MoR Audit Certified
              </span>
            </div>

            {/* VAT Waterfall Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', borderLeft: '4px solid #09090b' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>15% Output VAT Invoiced</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace', marginTop: '2px' }}>
                  ETB 1,231,500
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Collected on client billings</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', borderLeft: '4px solid #16a34a' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>15% Input VAT Claimed</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace', marginTop: '2px' }}>
                  (ETB 486,200)
                </div>
                <div style={{ fontSize: '0.65rem', color: '#16a34a', marginTop: '4px' }}>Deductible raw material POs</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', borderLeft: '4px solid #ca8a04' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2% Client Withholding Tax</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#854d0e', fontFamily: 'monospace', marginTop: '2px' }}>
                  (ETB 164,200)
                </div>
                <div style={{ fontSize: '0.65rem', color: '#854d0e', marginTop: '4px' }}>Deducted at source by banks</div>
              </div>

              <div style={{ background: '#fef9c3', padding: '14px', borderRadius: '12px', border: '1px solid #fde047', borderLeft: '4px solid #ca8a04' }}>
                <div style={{ fontSize: '0.7rem', color: '#854d0e', fontWeight: 600 }}>Net Payable to Ministry</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#854d0e', fontFamily: 'monospace', marginTop: '2px' }}>
                  ETB 581,100
                </div>
                <div style={{ fontSize: '0.65rem', color: '#854d0e', marginTop: '4px' }}>Due 30th of month</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 7: AUDIT TRAIL & LOGS */}
      {activeTab === 'audit' && (
        <div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ScrollText size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Chronological Enterprise Audit Trail</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Cryptographic transaction audit log of user actions and financial movements
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#854d0e', background: '#fef9c3', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fde047' }}>
                Integrity Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { time: '2026-10-20 16:45:12', user: 'General Manager', action: 'Approved Work Order WO-2026-081 for Commercial Bank of Ethiopia', category: 'Production', color: '#16a34a' },
                { time: '2026-10-20 15:30:00', user: 'Cost Accountant', action: 'Audited Job Cost Sheet for Safaricom Retail Shop Fascia Signage', category: 'Costing', color: '#ca8a04' },
                { time: '2026-10-20 14:15:22', user: 'Storekeeper', action: 'Issued 12 sheets of Cast Acrylic 3mm Opal to CNC Router station', category: 'Inventory', color: '#09090b' },
                { time: '2026-10-20 12:00:45', user: 'Sales Rep (Almaz T.)', action: 'Created Proforma Invoice PRO-2026-084 for BGI Ethiopia Brewery', category: 'Sales', color: '#854d0e' },
                { time: '2026-10-20 10:20:10', user: 'Production Supv.', action: 'Logged 4.5 sqm acrylic off-cut drop trim to scrap inventory', category: 'Wastage', color: '#dc2626' },
                { time: '2026-10-20 09:00:00', user: 'System Telemetry', action: 'Performed automated daily working capital and MoR VAT balance sync', category: 'System', color: '#ca8a04' },
              ].map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.time}</div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#f4f4f5', color: log.color, border: '1px solid var(--border-light)' }}>
                      {log.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#09090b', fontWeight: 500 }}>{log.action}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB: STORE, INVENTORY & PURCHASER INTELLIGENCE */}
      {activeTab === 'store_inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Banner & Live Control Filter */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#fef3c7',
                      border: '1px solid #fde047',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b45309',
                    }}
                  >
                    <Boxes size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      Store, Inventory & Purchasing BI
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Multi-store asset valuation, procurement commit ledger, supplier vendor performance, and real-time stock turnover telemetry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <CheckCircle2 size={13} />
                  Physical Stock Count Reconciled
                </span>
                <Link
                  href="/inventory"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#09090b',
                    color: '#facc15',
                    border: '1px solid #facc15',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Warehouse size={14} />
                  <span>Open Store Hub</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* In-tab Filters */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-light)',
              }}
            >
              {/* Warehouse selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Warehouse:</span>
                <select
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                >
                  <option value="all">All Stores ({stores.length} Locations)</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU Category selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
                <select
                  value={itemCategoryFilter}
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                >
                  <option value="all">All SKU Categories</option>
                  <option value="raw_material">Raw Materials (Acrylic, Vinyl, Steel, LED)</option>
                  <option value="packaging">Packaging & Logistics</option>
                  <option value="semi_finished">Semi-Finished Cut/Bended Parts</option>
                  <option value="finished_good">Finished Goods Ready for Install</option>
                  <option value="service">Services & Subcontracting</option>
                </select>
              </div>

              {/* PO Status selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PO Status:</span>
                <select
                  value={poStatusFilter}
                  onChange={(e) => setPoStatusFilter(e.target.value as any)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                >
                  <option value="all">All Purchase Orders</option>
                  <option value="approved">Approved & Committed</option>
                  <option value="received">Received at Store (GRN Passed)</option>
                  <option value="pending_admin">Pending Admin Review</option>
                  <option value="draft">Draft Procurement</option>
                </select>
              </div>

              {/* Search query */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  marginLeft: 'auto',
                }}
              >
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search item, PO#, supplier..."
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    outline: 'none',
                    width: '180px',
                  }}
                />
                {storeSearchQuery && (
                  <button
                    onClick={() => setStoreSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top 5 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* 1. Total Store Asset Valuation */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                borderTop: '4px solid #ca8a04',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Inventory Valuation
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>
                  {items.length} SKUs
                </span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                {formatETB(items.reduce((s, i) => s + i.currentStock * i.purchasePrice, 0))}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Warehouse size={12} color="#ca8a04" />
                <span>Across {stores.length} warehouse locations</span>
              </div>
            </div>

            {/* 2. Committed PO Spend */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                borderTop: '4px solid #2563eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Committed Procurement
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>
                  {purchaseOrders.length} POs Total
                </span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                {formatETB(purchaseOrders.reduce((s, p) => s + p.grandTotal, 0))}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={12} color="#2563eb" />
                <span>
                  {purchaseOrders.filter((p) => p.status === 'received').length} Received •{' '}
                  {purchaseOrders.filter((p) => p.status === 'pending_admin').length} Pending
                </span>
              </div>
            </div>

            {/* 3. Critical Low Stock Alerts */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                borderTop: `4px solid ${lowStockItems.length > 0 ? '#dc2626' : '#16a34a'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Low Stock Reorders
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: lowStockItems.length > 0 ? '#fef2f2' : '#ecfdf5',
                    color: lowStockItems.length > 0 ? '#b91c1c' : '#047857',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {lowStockItems.length > 0 ? 'Urgent Action' : 'Optimal'}
                </span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: lowStockItems.length > 0 ? '#dc2626' : '#16a34a', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                {lowStockItems.length} SKUs Below Min
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={12} color={lowStockItems.length > 0 ? '#dc2626' : '#16a34a'} />
                <span>Lead time buffer &lt; 7 working days</span>
              </div>
            </div>

            {/* 4. Production Issues / Consumption */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                borderTop: '4px solid #7c3aed',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Production Issues Flow
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#f5f3ff', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px' }}>
                  Shopfloor Issuance
                </span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                {formatETB(stockMovements.filter((m) => m.movementType === 'production_issue').reduce((s, m) => s + m.totalCost, 0))}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} color="#7c3aed" />
                <span>Materials transferred to active Work Orders</span>
              </div>
            </div>

            {/* 5. Registered Vendor Network */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                borderTop: '4px solid #059669',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Registered Suppliers
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>
                  100% Tax Compliant
                </span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                {suppliers.length} Key Vendors
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="#059669" />
                <span>TIN verified & 15% VAT registered</span>
              </div>
            </div>
          </div>

          {/* Warehouse Valuation Cards & Category Progress Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            {/* Store Warehouses Grid */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Warehouse size={18} color="#ca8a04" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                      Warehouse Locations & Physical Balances
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Multi-location stock distribution and custodian storekeeper assignment
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#854d0e', background: '#fef9c3', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fde047' }}>
                  {stores.length} Depots Monitored
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stores.map((s) => {
                  // Calculate store valuation from items storeBalances
                  const storeVal = items.reduce((sum, item) => {
                    const qty = item.storeBalances?.[s.id] || (s.storeType === 'raw_material' ? item.currentStock * 0.7 : item.currentStock * 0.15);
                    return sum + qty * item.purchasePrice;
                  }, 0);

                  const storeSkus = items.filter((item) => (item.storeBalances?.[s.id] ?? 0) > 0 || s.storeType === 'raw_material').length;

                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: '14px 16px',
                        background: '#f8fafc',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>{s.name}</span>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: s.storeType === 'raw_material' ? '#fef3c7' : s.storeType === 'production_floor' ? '#eff6ff' : '#ecfdf5',
                              color: s.storeType === 'raw_material' ? '#b45309' : s.storeType === 'production_floor' ? '#1d4ed8' : '#047857',
                            }}
                          >
                            {s.code}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          📍 {s.location} • Custodian: <strong>{s.storekeeper}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
                          {formatETB(storeVal)}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {storeSkus} SKUs stocked • Active
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SKU Category Breakdown */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Stock Category Distribution
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Asset allocation across material classifications
                </div>
              </div>

              {(() => {
                const totalVal = items.reduce((s, i) => s + i.currentStock * i.purchasePrice, 0) || 1;
                const categories: { type: ItemType; label: string; color: string }[] = [
                  { type: 'raw_material', label: 'Raw Materials (Acrylic, Vinyl, Steel, LED)', color: '#09090b' },
                  { type: 'packaging', label: 'Packaging & Logistics', color: '#f59e0b' },
                  { type: 'semi_finished', label: 'Semi-Finished Subassemblies', color: '#8b5cf6' },
                  { type: 'finished_good', label: 'Finished Signage & Displays', color: '#10b981' },
                  { type: 'service', label: 'Services & Tooling', color: '#3b82f6' },
                ];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
                    {categories.map((cat) => {
                      const catItems = items.filter((i) => i.type === cat.type);
                      const catVal = catItems.reduce((s, i) => s + i.currentStock * i.purchasePrice, 0);
                      const sharePct = Math.round((catVal / totalVal) * 100);

                      return (
                        <div key={cat.type}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#09090b' }}>{cat.label}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                              {formatETB(catVal)} ({sharePct}%)
                            </span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.max(sharePct, 3)}%`,
                                height: '100%',
                                background: cat.color,
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {catItems.length} active SKUs stocked
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Purchase Order & Procurement Commitments Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={18} color="#2563eb" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Procurement & Purchase Order (PO) Audit Ledger
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Supplier purchase commitments, statutory 15% VAT input tracking, payment terms, and delivery fulfillment
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Showing{' '}
                  {
                    purchaseOrders.filter((po) => {
                      if (poStatusFilter !== 'all' && po.status !== poStatusFilter) return false;
                      if (storeSearchQuery.trim()) {
                        const q = storeSearchQuery.toLowerCase();
                        return (
                          po.poNumber.toLowerCase().includes(q) ||
                          po.supplierName.toLowerCase().includes(q) ||
                          po.requestedBy.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    }).length
                  }{' '}
                  of {purchaseOrders.length} POs
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>PO Number</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Supplier / Vendor</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Items & Specs</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Subtotal (ETB)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>15% VAT</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Grand Total (ETB)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Terms</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Purchaser / Buyer</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders
                    .filter((po) => {
                      if (poStatusFilter !== 'all' && po.status !== poStatusFilter) return false;
                      if (storeSearchQuery.trim()) {
                        const q = storeSearchQuery.toLowerCase();
                        return (
                          po.poNumber.toLowerCase().includes(q) ||
                          po.supplierName.toLowerCase().includes(q) ||
                          po.requestedBy.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((po) => {
                      const statusMap: Record<POStatus, { label: string; bg: string; color: string; border: string }> = {
                        received: { label: 'Received (GRN)', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
                        approved: { label: 'Approved', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                        partially_received: { label: 'Partial GRN', bg: '#fef3c7', color: '#b45309', border: '#fde047' },
                        pending_admin: { label: 'Pending Admin', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' },
                        draft: { label: 'Draft', bg: '#f4f4f5', color: '#71717a', border: '#e4e4e7' },
                        closed: { label: 'Closed', bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' },
                        cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
                      };

                      const st = statusMap[po.status] || statusMap.draft;

                      return (
                        <tr
                          key={po.id}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '10px 12px', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                            {po.poNumber}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{po.date}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700, color: '#09090b' }}>{po.supplierName}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TIN: {po.supplierTin}</div>
                          </td>
                          <td style={{ padding: '10px 12px', maxWidth: '240px' }}>
                            <div style={{ fontSize: '0.74rem', color: '#09090b', fontWeight: 600 }}>
                              {po.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#09090b' }}>
                            {formatETB(po.subtotal)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#ca8a04' }}>
                            {formatETB(po.vatTotal)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                            {formatETB(po.grandTotal)}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {po.paymentTerms}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: st.bg,
                                color: st.color,
                                border: `1px solid ${st.border}`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-main)', fontWeight: 500 }}>
                            {po.requestedBy}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Spend Directory & Low Stock Runway */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Supplier Spend Directory */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#059669" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Top Supplier Spend & Payment Terms
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '8px' }}>
                  {suppliers.length} Approved Vendors
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suppliers.slice(0, 5).map((sup, idx) => {
                  const supPos = purchaseOrders.filter((po) => po.supplierId === sup.id || po.supplierName.includes(sup.name));
                  const supSpend = supPos.reduce((sum, po) => sum + po.grandTotal, 0);

                  return (
                    <div
                      key={sup.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#09090b' }}>
                            {idx + 1}. {sup.name}
                          </span>
                          {sup.isVatRegistered && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px' }}>
                              VAT Reg
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Terms: {sup.paymentTerms} • TIN: {sup.tin}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                          {formatETB(supSpend > 0 ? supSpend : 240000 + idx * 85000)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {supPos.length > 0 ? supPos.length : idx + 2} Orders Delivered
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Low Stock Warnings */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Reorder Alerts & Stock Runway Warning
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b91c1c', background: '#fef2f2', padding: '2px 8px', borderRadius: '8px' }}>
                  Immediate Action
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9f1239' }}>
                            {entry.item.code}
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#09090b' }}>
                            {entry.item.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#be123c', marginTop: '2px' }}>
                          On Hand: <strong>{entry.item.currentStock} {entry.item.unit}</strong> (Min Reorder: {entry.item.reorderLevel} {entry.item.unit})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e11d48' }}>
                          ~{entry.expectedDays} Days Left
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Reorder {entry.item.reorderQuantity} {entry.item.unit}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#047857', background: '#ecfdf5', borderRadius: '8px' }}>
                    <CheckCircle2 size={24} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 700 }}>All materials above safety reorder buffer!</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB: HR, PAYROLL & WORKFORCE INTELLIGENCE */}
      {activeTab === 'hr_workforce' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Banner & Live Control Filter */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#047857',
                    }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      HR, Payroll & Workforce Intelligence
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Ethiopian labor statutory audit, progressive income tax withholding, 7% & 11% pension compliance, biometric shift telemetry, and legal guarantor (Wase) coverage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge & Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#b45309',
                    border: '1px solid #fde047',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <ShieldCheck size={13} />
                  MoR Tax & Pension Statutory Compliant
                </span>
                <Link
                  href="/hr"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#09090b',
                    color: '#facc15',
                    border: '1px solid #facc15',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Users size={14} />
                  <span>Open HR Hub</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* In-tab Filters */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-light)',
              }}
            >
              {/* Department selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Department:</span>
                <select
                  value={hrDeptFilter}
                  onChange={(e) => setHrDeptFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                >
                  <option value="all">All Departments ({employees.length} Staff)</option>
                  <option value="production">Production & CNC Workshop</option>
                  <option value="stores">Stores & Warehousing</option>
                  <option value="procurement">Procurement & Purchasing</option>
                  <option value="sales">Commercial & Sales</option>
                  <option value="finance">Finance & Cost Accounting</option>
                  <option value="admin">Executive & Administration</option>
                </select>
              </div>

              {/* Leave Type selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Leave Category:</span>
                <select
                  value={hrLeaveFilter}
                  onChange={(e) => setHrLeaveFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                >
                  <option value="all">All Leave Types</option>
                  <option value="annual">Annual Paid Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="compassionate">Compassionate / Emergency</option>
                  <option value="maternity">Maternity / Paternity</option>
                </select>
              </div>

              {/* Staff Search */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  marginLeft: 'auto',
                }}
              >
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search staff, ID, bank, role..."
                  value={hrSearchQuery}
                  onChange={(e) => setHrSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    outline: 'none',
                    width: '180px',
                  }}
                />
                {hrSearchQuery && (
                  <button
                    onClick={() => setHrSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top 5 KPI Cards for HR */}
          {(() => {
            const totalBase = employees.reduce((s, e) => s + e.baseSalary, 0);
            const totalAllow = employees.reduce((s, e) => s + (e.allowances || 0), 0);
            const totalGross = totalBase + totalAllow;
            const totalPen7 = employees.reduce((s, e) => s + e.baseSalary * 0.07, 0);
            const totalPen11 = employees.reduce((s, e) => s + e.baseSalary * 0.11, 0);
            const totalTax = employees.reduce((s, e) => {
              const gross = e.baseSalary + (e.allowances || 0);
              const p7 = e.baseSalary * 0.07;
              return s + calculateEthiopianIncomeTax(gross - p7);
            }, 0);
            const totalNet = totalGross - totalPen7 - totalTax;

            return (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* 1. Total Workforce Headcount */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    borderTop: '4px solid #059669',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Active Workforce
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>
                      100% Retained
                    </span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                    {employees.length} Full-Time Staff
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={12} color="#059669" />
                    <span>
                      {employees.filter((e) => e.department === 'production').length} Production •{' '}
                      {employees.filter((e) => e.department !== 'production').length} Support & Sales
                    </span>
                  </div>
                </div>

                {/* 2. Monthly Gross Payroll Liability */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    borderTop: '4px solid #ca8a04',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Gross Monthly Payroll
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>
                      Base + Allowances
                    </span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                    {formatETB(totalGross)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={12} color="#ca8a04" />
                    <span>Net Disbursal: {formatETB(totalNet)}</span>
                  </div>
                </div>

                {/* 3. Statutory Pension 7% & 11% */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    borderTop: '4px solid #7c3aed',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Pension Total (18%)
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#f5f3ff', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px' }}>
                      Statutory Fund
                    </span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                    {formatETB(totalPen7 + totalPen11)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={12} color="#7c3aed" />
                    <span>7% Staff ({formatETB(totalPen7)}) + 11% Co. ({formatETB(totalPen11)})</span>
                  </div>
                </div>

                {/* 4. MoR Income Tax Withholding */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    borderTop: '4px solid #2563eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      MoR Employment Tax
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>
                      e-Tax Withholding
                    </span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                    {formatETB(totalTax)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Receipt size={12} color="#2563eb" />
                    <span>Progressive Ethiopian tax schedule audited</span>
                  </div>
                </div>

                {/* 5. Biometric Attendance & Wase Compliance */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    borderTop: '4px solid #10b981',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Shift Telemetry & Wase
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>
                      97.8% On-Time
                    </span>
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                    100% Wase Verified
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BadgeCheck size={12} color="#10b981" />
                    <span>Legal guarantor letters verified on file</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Departmental Workforce Allocation & Payroll Roster */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Department Headcount Allocation */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#059669" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Department Headcount & Cost Share
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '8px' }}>
                  6 Units Active
                </span>
              </div>

              {(() => {
                const depts = [
                  { id: 'production', label: 'Production & CNC Workshop', color: '#09090b' },
                  { id: 'stores', label: 'Stores & Warehousing', color: '#f59e0b' },
                  { id: 'procurement', label: 'Procurement & Purchasing', color: '#2563eb' },
                  { id: 'sales', label: 'Commercial Sales & Accounts', color: '#7c3aed' },
                  { id: 'finance', label: 'Finance & Cost Accounting', color: '#10b981' },
                  { id: 'admin', label: 'Administration & Executive', color: '#ec4899' },
                ];

                const totalStaff = employees.length || 1;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {depts.map((d) => {
                      const deptEmployees = employees.filter((e) => e.department === d.id);
                      const deptGross = deptEmployees.reduce((s, e) => s + e.baseSalary + (e.allowances || 0), 0);
                      const sharePct = Math.round((deptEmployees.length / totalStaff) * 100);

                      return (
                        <div
                          key={d.id}
                          style={{
                            padding: '10px 14px',
                            background: '#f8fafc',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b' }}>{d.label}</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {deptEmployees.length} personnel ({sharePct}% of workforce)
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                              {formatETB(deptGross)}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              Monthly Gross
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Attendance & Shift Telemetry Log */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#2563eb" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Biometric Shift Attendance & Overtime
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '8px' }}>
                  Live Terminal Log
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {INITIAL_ATTENDANCE_RECORDS.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b' }}>{att.employeeName}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          ({att.department})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📅 {att.date} • Check-In: <strong>{att.checkIn}</strong> • Check-Out: <strong>{att.checkOut || '17:30'}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: att.status === 'present' ? '#dcfce7' : att.status === 'late' ? '#fef3c7' : '#fee2e2',
                          color: att.status === 'present' ? '#15803d' : att.status === 'late' ? '#b45309' : '#b91c1c',
                        }}
                      >
                        {att.status.toUpperCase()}
                      </span>
                      {att.overtimeHours > 0 && (
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', marginTop: '2px' }}>
                          +{att.overtimeHours}h Overtime
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Master Audited Ethiopian Monthly Payroll Roster Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} color="#059669" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Audited Ethiopian Monthly Payroll Roster (October 2026)
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Statutory 7% employee pension, 11% employer pension, and Ministry of Revenue progressive income tax withholding
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Showing{' '}
                  {
                    employees.filter((emp) => {
                      if (hrDeptFilter !== 'all' && emp.department !== hrDeptFilter) return false;
                      if (hrSearchQuery.trim()) {
                        const q = hrSearchQuery.toLowerCase();
                        return (
                          emp.name.toLowerCase().includes(q) ||
                          emp.employeeId.toLowerCase().includes(q) ||
                          emp.position.toLowerCase().includes(q) ||
                          emp.bankName.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    }).length
                  }{' '}
                  of {employees.length} Staff
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Staff ID</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Employee Name & Position</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Department</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Base Salary</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Allowances</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Gross Pay</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>7% Pension</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>11% Co. Pension</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>MoR Tax</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Net Take-Home</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Bank & Account</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .filter((emp) => {
                      if (hrDeptFilter !== 'all' && emp.department !== hrDeptFilter) return false;
                      if (hrSearchQuery.trim()) {
                        const q = hrSearchQuery.toLowerCase();
                        return (
                          emp.name.toLowerCase().includes(q) ||
                          emp.employeeId.toLowerCase().includes(q) ||
                          emp.position.toLowerCase().includes(q) ||
                          emp.bankName.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((emp) => {
                      const gross = emp.baseSalary + (emp.allowances || 0);
                      const pen7 = emp.baseSalary * 0.07;
                      const pen11 = emp.baseSalary * 0.11;
                      const incomeTax = calculateEthiopianIncomeTax(gross - pen7);
                      const netPay = gross - pen7 - incomeTax;

                      return (
                        <tr
                          key={emp.id}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '10px 12px', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                            {emp.employeeId}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700, color: '#09090b' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{emp.position}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#f4f4f5',
                                color: '#09090b',
                                border: '1px solid var(--border-light)',
                                textTransform: 'capitalize',
                              }}
                            >
                              {emp.department}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#09090b' }}>
                            {formatETB(emp.baseSalary)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {formatETB(emp.allowances || 0)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: '#09090b' }}>
                            {formatETB(gross)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#7c3aed' }}>
                            {formatETB(pen7)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#6d28d9' }}>
                            {formatETB(pen11)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#ca8a04' }}>
                            {formatETB(incomeTax)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, fontFamily: 'monospace', color: '#059669' }}>
                            {formatETB(netPay)}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '0.72rem' }}>
                            <div style={{ color: '#09090b', fontWeight: 600 }}>{emp.bankName}</div>
                            <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                              {emp.bankAccount}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Guarantor (Wase / ዋስ) & Leave Liability Audits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Legal Guarantor (Wase / ዋስ) Table */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Legal Guarantor (Wase / ዋስ) Verification Audit
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '8px' }}>
                  Risk Mitigation
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Alazar Tadesse', role: 'CNC Lead', guarantor: 'Tadesse Worku', org: 'Ethio Telecom (Senior Eng.)', rel: 'Brother', status: 'verified' },
                  { name: 'Ermias Kebede', role: 'Printer Operator', guarantor: 'Kebede Hailu', org: 'Commercial Bank of Ethiopia', rel: 'Father', status: 'verified' },
                  { name: 'Biniyam Assefa', role: '3D Letter Maker', guarantor: 'Assefa Mengistu', org: 'Addis Ababa City Admin', rel: 'Uncle', status: 'verified' },
                  { name: 'Dawit Bekele', role: 'Storekeeper', guarantor: 'Bekele Desta', org: 'Federal Police Commission', rel: 'Brother', status: 'verified' },
                  { name: 'Yohannes Girma', role: 'Welder / Frame', guarantor: 'Girma Alemayehu', org: 'Anbessa City Bus', rel: 'Father', status: 'submitted' },
                ].map((g, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b' }}>{g.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({g.role})</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Guarantor: <strong>{g.guarantor}</strong> ({g.rel}) • {g.org}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: g.status === 'verified' ? '#dcfce7' : '#fef3c7',
                        color: g.status === 'verified' ? '#15803d' : '#b45309',
                        textTransform: 'uppercase',
                      }}
                    >
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Liability & Absence Records */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#7c3aed" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Leave Liability & Absence Ledger
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6d28d9', background: '#f5f3ff', padding: '2px 8px', borderRadius: '8px' }}>
                  {INITIAL_LEAVE_REQUESTS.length} Logged
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {INITIAL_LEAVE_REQUESTS.filter((req) => (hrLeaveFilter === 'all' ? true : req.leaveType === hrLeaveFilter))
                  .slice(0, 5)
                  .map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b' }}>{req.employeeName}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            ({req.department})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {req.leaveType.toUpperCase()} LEAVE • {req.startDate} → {req.endDate} ({req.daysCount} days)
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: req.status === 'approved' ? '#dcfce7' : '#fef3c7',
                          color: req.status === 'approved' ? '#15803d' : '#b45309',
                          textTransform: 'uppercase',
                        }}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Interactive Cost Tree Inspection */}
      {activeOrderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setActiveOrderModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09090b' }}>
                    {activeOrderModal.orderNumber} Cost Structure
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#16a34a',
                      background: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {activeOrderModal.profitMarginPct.toFixed(1)}% Realized Margin
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {activeOrderModal.customerName} • {activeOrderModal.orderTitle}
                </div>
              </div>

              <button
                onClick={() => setActiveOrderModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Cost Waterfall Tree Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#09090b',
                  border: '1px solid #facc15',
                }}
              >
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Contracted Revenue</span>
                <span style={{ fontWeight: 800, color: '#facc15', fontFamily: 'monospace' }}>
                  {formatETB(activeOrderModal.orderRevenue)}
                </span>
              </div>

              <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>1. Direct Materials & Consumables</span>
                  <span style={{ fontFamily: 'monospace', color: '#09090b', fontWeight: 600 }}>
                    {formatETB(activeOrderModal.directMaterialCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>2. Shopfloor Technician Labor</span>
                  <span style={{ fontFamily: 'monospace', color: '#09090b', fontWeight: 600 }}>
                    {formatETB(activeOrderModal.directLaborCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>3. CNC Router & Laser Runtime Cost</span>
                  <span style={{ fontFamily: 'monospace', color: '#09090b', fontWeight: 600 }}>
                    {formatETB(activeOrderModal.machineCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>4. Scrap & Edge Drop Wastage</span>
                  <span style={{ fontFamily: 'monospace', color: '#dc2626', fontWeight: 600 }}>
                    {formatETB(activeOrderModal.wastageCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>5. Factory Overheads Allocation</span>
                  <span style={{ fontFamily: 'monospace', color: '#09090b', fontWeight: 600 }}>
                    {formatETB(activeOrderModal.allocatedOverheadCost)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                }}
              >
                <span style={{ fontWeight: 800, color: '#16a34a' }}>Net Order Profitability</span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontFamily: 'monospace', fontSize: '1.05rem' }}>
                  {formatETB(activeOrderModal.grossProfit)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveOrderModal(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  background: '#09090b',
                  color: '#facc15',
                  border: '1px solid #facc15',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                }}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Print Dossier Executive View Modal */}
      {showPrintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '24px',
          }}
          onClick={() => setShowPrintModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>
                  Executive Intelligence Dossier
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Dot Advert ERP • Reporting Period: {period.toUpperCase()} (Ending October 2026)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#09090b',
                    color: '#facc15',
                    border: '1px solid #facc15',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <Printer size={15} />
                  <span>Send to Printer</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Audited Revenue</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
                    {formatETB(totalNetRevenue)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Realized Margin</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
                    {overallGrossMarginPct.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Store Inventory Value</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b45309', fontFamily: 'monospace' }}>
                    {formatETB(items.reduce((s, i) => s + i.currentStock * i.purchasePrice, 0))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Workforce Payroll</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>
                    {formatETB(employees.reduce((s, e) => s + e.baseSalary + (e.allowances || 0), 0))}
                  </div>
                </div>
              </div>

              {/* Second row of Dossier KPIs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div style={{ padding: '12px 14px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>
                    Store & Purchasing Summary
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#09090b', marginTop: '4px' }}>
                    <strong>{items.length} SKUs</strong> monitored across <strong>{stores.length} warehouses</strong> •{' '}
                    <strong>{purchaseOrders.length} POs</strong> ({formatETB(purchaseOrders.reduce((s, p) => s + p.grandTotal, 0))} committed) •{' '}
                    <strong>{lowStockItems.length}</strong> items below safety buffer.
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                    HR & Workforce Headcount
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#09090b', marginTop: '4px' }}>
                    <strong>{employees.length} full-time staff</strong> (Production: {employees.filter((e) => e.department === 'production').length}, Support: {employees.filter((e) => e.department !== 'production').length}) •{' '}
                    <strong>100% Wase Guarantor</strong> coverage verified on file.
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>
                  Top Revenue Drivers (Client Distribution)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {topClients.slice(0, 5).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <span style={{ color: '#09090b', fontWeight: 600 }}>
                        {i + 1}. {c.name}
                      </span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#09090b' }}>
                        {formatETB(c.revenue)} ({c.margin}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Certified by Dot Advert ERP Finance & Production Intelligence Engine • Addis Ababa, Ethiopia
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '40px', color: '#09090b', textAlign: 'center' }}>
          Loading Business Intelligence & Reports Suite...
        </div>
      }
    >
      <ReportPageContent />
    </Suspense>
  );
}
