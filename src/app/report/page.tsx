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
} from 'lucide-react';
import { ReportPeriod } from '@/components/report/ReportHeader';
import { OrderProfitability, CustomerOrder, WastageRecord } from '@/types/erp';

function ReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get('tab') || 'executive';
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
    { id: 'wastage', label: 'Scrap & Defect Analytics', icon: Scissors, badge: '2.1% Scrap' },
    { id: 'tax', label: 'MoR Tax & 15% VAT', icon: ShieldCheck, badge: 'e-Tax Ready' },
    { id: 'audit', label: 'Audit Trail & Logs', icon: ScrollText, badge: 'Live Logs' },
  ];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* 1. Global Filter & Period Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 30, 55, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Active Period Scope Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Calendar size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
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
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#22d3ee',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    textTransform: 'uppercase',
                  }}
                >
                  {period} Mode
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Reporting Currency: Ethiopian Birr (ETB) • GAAP & MoR Audited Basis
              </div>
            </div>
          </div>

          {/* Quick Filter Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Customer Tier Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Client:</span>
              <select
                value={customerSegmentFilter}
                onChange={(e) => setCustomerSegmentFilter(e.target.value as any)}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Margin:</span>
              <select
                value={marginHealthFilter}
                onChange={(e) => setMarginHealthFilter(e.target.value as any)}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
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
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '5px 10px',
              }}
            >
              <Search size={14} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search orders, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  outline: 'none',
                  width: '140px',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
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
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
              }}
            >
              <Icon size={15} style={{ color: isActive ? '#22d3ee' : 'var(--text-dim)' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#22d3ee' : 'var(--text-dim)',
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
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 30, 55, 0.85) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Audited Net Revenue
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <Building2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(filteredRevenue > 0 ? filteredRevenue : totalNetRevenue)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                  <ArrowUpRight size={13} /> +18.4%
                </span>
                <span style={{ color: 'var(--text-dim)' }}>vs prior period target</span>
              </div>
            </div>

            {/* Gross Profit & Margin */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 30, 55, 0.85) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Gross Profit & Margin
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee',
                  }}
                >
                  <PieChart size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(filteredGrossProfit > 0 ? filteredGrossProfit : totalGrossProfit)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  {(filteredRevenue > 0 ? filteredMarginPct : overallGrossMarginPct).toFixed(1)}% Realized
                </span>
                <span style={{ color: 'var(--text-dim)' }}>• Target 40.0%</span>
              </div>
            </div>

            {/* Operating Profit EBITDA */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 30, 55, 0.85) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  EBITDA Operating Profit
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(totalEbitda)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{ebitdaMarginPct.toFixed(1)}% of Revenue</span>
                <span style={{ color: 'var(--text-dim)' }}>after factory rent & crane rentals</span>
              </div>
            </div>

            {/* Shopfloor Scrap Loss */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 30, 55, 0.85) 100%)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Shopfloor Scrap Loss
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f43f5e',
                  }}
                >
                  <Scissors size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f43f5e', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {formatETB(totalScrapCost)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>2.1% of Raw Materials</span>
                <span style={{ color: 'var(--text-dim)' }}>• Target &lt; 3.5% (Controlled)</span>
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
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#818cf8" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                      Multi-Period Financial Trajectory & Margin Curve
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Area curve for Net Revenue vs Gross Profit in ETB ({period} view)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '4px', background: '#6366f1', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Net Revenue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '4px', background: '#06b6d4', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Gross Profit</span>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px', position: 'relative' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = padding.top + innerHeight * (1 - pct);
                    const val = maxRevenue * pct;
                    return (
                      <g key={i}>
                        <line x1={padding.left} y1={y} x2={padding.left + innerWidth} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                        <text x={padding.left - 10} y={y + 3} fill="var(--text-dim)" fontSize="9" textAnchor="end" fontFamily="monospace">
                          {(val / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  })}

                  <path d={areaPath} fill="url(#indigoGradient)" />
                  <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={profitLinePath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

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
                          fill="#6366f1"
                          stroke="#ffffff"
                          strokeWidth="2"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredPoint({ x: cx, y: cyRevenue, label: pt.label, revenue: pt.revenue, profit: pt.profit, margin: pt.margin })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle
                          cx={cx}
                          cy={cyProfit}
                          r="4.5"
                          fill="#06b6d4"
                          stroke="#ffffff"
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
                      background: '#0d1326',
                      border: '1px solid rgba(99, 102, 241, 0.45)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
                      pointerEvents: 'none',
                      zIndex: 20,
                      minWidth: '150px',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                      {hoveredPoint.label}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#818cf8' }}>
                      <span>Revenue:</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatETB(hoveredPoint.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#22d3ee' }}>
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
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#22d3ee" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Product Line Revenue Share</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
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

                  <text x="95" y="88" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontWeight="600">
                    {selectedDonutIndex !== null ? productDistribution[selectedDonutIndex].name.split(' ')[0] : 'Total Net'}
                  </text>
                  <text x="95" y="108" fill="#ffffff" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="monospace">
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
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedDonutIndex === idx ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                      <span style={{ fontSize: '0.72rem', color: selectedDonutIndex === idx ? '#ffffff' : 'var(--text-muted)' }}>
                        {p.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
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
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(129, 140, 248, 0.22)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Factory size={18} color="#818cf8" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Factory Machine Station Utilization</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Active operating hours vs 208-hour rated shopfloor capacity
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                  Plant OEE: 91.4%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {machineTelemetry.map((m, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>{m.name}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.utilization > 90 ? '#f59e0b' : '#10b981' }}>
                        {m.utilization}% ({m.activeHours}h)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.utilization}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrap Loss Pareto */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(244, 63, 94, 0.22)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scissors size={18} color="#f43f5e" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Material Scrap & Drop-Cut Losses</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Monetary impact in ETB & waste ratio by fabrication raw material
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                  Total: {formatETB(totalScrapCost)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scrapByMaterial.map((s, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>{s.material}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f43f5e', fontFamily: 'monospace' }}>
                        {formatETB(s.scrapCost)} ({s.wastePct}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Root Cause: {s.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 10 Clients Table */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.22)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#22d3ee" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    Top 10 High-Value Enterprise Clients (Lifetime & Active Revenue)
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Ranked by billings in Ethiopian Birr, order volume & project margin profitability
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', textAlign: 'left' }}>
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
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-dim)' }}>{idx + 1}</td>
                        <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>{client.name}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                            {client.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>{client.orders} orders</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#ffffff' }}>
                          {formatETB(client.revenue)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                          {client.margin.toFixed(1)}%
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${barWidthPct}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '3px' }} />
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
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#818cf8" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Commercial Sales Conversion Funnel</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Stage conversion velocity from inquiry to customer payment
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                  Win Rate: 68.4%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { stage: '1. Inquiries & Tender Leads', count: 28, value: 14800000, conversion: '100%', color: '#6366f1', widthPct: 100 },
                  { stage: '2. Site Surveys Completed', count: 22, value: 11200000, conversion: '78.5%', color: '#06b6d4', widthPct: 82 },
                  { stage: '3. Technical Quotations Sent', count: 17, value: 8900000, conversion: '77.2%', color: '#38bdf8', widthPct: 68 },
                  { stage: '4. Confirmed Work Orders', count: 14, value: 7800000, conversion: '82.3%', color: '#10b981', widthPct: 56 },
                  { stage: '5. Invoiced & Fully Paid', count: 12, value: 6900000, conversion: '85.7%', color: '#a855f7', widthPct: 46 },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{s.stage}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.count} deals</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{formatETB(s.value)}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff', background: `${s.color}25`, padding: '1px 6px', borderRadius: '4px' }}>
                          {s.conversion}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.widthPct}%`, background: s.color, borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Representative Leaderboard */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#22d3ee" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Account Executives Quota Leaderboard</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
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
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{rep.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{rep.title}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'monospace' }}>{formatETB(rep.actual)}</div>
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>{rep.quotaPct}% Quota Achieved</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                      <span>Target: {formatETB(rep.target)}</span>
                      <span>Avg Margin: {rep.margin}%</span>
                      <span>Earned Commission: {formatETB(rep.commission)}</span>
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
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Factory size={18} color="#818cf8" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Work Center Equipment Load</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                  Rated Capacity: 208 hrs/mo
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {machineTelemetry.map((m, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{m.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{m.utilization}% Utilization</span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.utilization}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Pass & First-Yield Telemetry */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Quality & First-Pass Yield (FPY)</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                  FPY: 94.6%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>First-Pass Inspection Pass</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>94.6%</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Zero defect production requiring no adjustments</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>Minor Re-work / Edge Buffing</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>3.3%</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Corrected within shift (thermal deburring & vinyl touch-up)</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 700 }}>Scrap Rejection / Cracked Sheet</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>2.1%</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Logged to scrap inventory and recycled into test pieces</div>
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
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#818cf8" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Constituent Manufacturing Cost Breakdown</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  5-part cost tree normalized across all executed production orders
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
                Realized Gross Profit: {formatETB(totalGrossProfit)}
              </span>
            </div>

            {/* Horizontal Cost Stack Bar */}
            <div style={{ height: '28px', borderRadius: '8px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
              <div style={{ width: '42%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Materials 42%
              </div>
              <div style={{ width: '18%', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Labor 18%
              </div>
              <div style={{ width: '12%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Mach. 12%
              </div>
              <div style={{ width: '17%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Overheads 17%
              </div>
              <div style={{ width: '6%', background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Scrap 6%
              </div>
              <div style={{ width: '5%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                Site 5%
              </div>
            </div>

            {/* Cost Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Direct Materials', amount: 1910000, pct: 42, color: '#6366f1' },
                { label: 'Shopfloor Labor', amount: 820000, pct: 18, color: '#06b6d4' },
                { label: 'Machine Runtime', amount: 550000, pct: 12, color: '#38bdf8' },
                { label: 'Factory Overheads', amount: 770000, pct: 17, color: '#a855f7' },
                { label: 'Scrap & Wastage', amount: 270000, pct: 6, color: '#f43f5e' },
                { label: 'Site Crane Rentals', amount: 230000, pct: 5, color: '#f59e0b' },
              ].map((c, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', borderLeft: `4px solid ${c.color}` }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{c.label} ({c.pct}%)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
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
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scissors size={18} color="#f43f5e" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Chronological Scrap & Wastage Audit Ledger</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Recorded shopfloor material defects, off-cut drop trims, and responsible technicians
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f43f5e' }}>
                Cumulative Defect Loss: {formatETB(totalScrapCost)}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', textAlign: 'left' }}>
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
                    <tr key={w.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{w.date}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>{w.itemName}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>
                        {w.quantity} {w.unit}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {formatETB(w.unitCost)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#f43f5e', fontFamily: 'monospace' }}>
                        {formatETB(w.totalCost)}
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{w.reason}</td>
                      <td style={{ padding: '10px', color: '#818cf8' }}>{w.reportedBy}</td>
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
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#c084fc" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    Ethiopian Ministry of Revenues (MoR) Statutory Tax Filing Balance
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  15% Output VAT, verified deductible Input VAT, and 2% client withholding certificates
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                MoR Audit Certified
              </span>
            </div>

            {/* VAT Waterfall Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>15% Output VAT Invoiced</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
                  ETB 1,231,500
                </div>
                <div style={{ fontSize: '0.65rem', color: '#818cf8', marginTop: '4px' }}>Collected on client billings</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>15% Input VAT Claimed</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                  (ETB 486,200)
                </div>
                <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '4px' }}>Deductible raw material POs</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>2% Client Withholding Tax</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace', marginTop: '2px' }}>
                  (ETB 164,200)
                </div>
                <div style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: '4px' }}>Deducted at source by banks</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #c084fc' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Net Payable to Ministry</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace', marginTop: '2px' }}>
                  ETB 581,100
                </div>
                <div style={{ fontSize: '0.65rem', color: '#c084fc', marginTop: '4px' }}>Due 30th of month</div>
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
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ScrollText size={18} color="#f59e0b" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Chronological Enterprise Audit Trail</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Cryptographic transaction audit log of user actions and financial movements
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                Integrity Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { time: '2026-10-20 16:45:12', user: 'General Manager', action: 'Approved Work Order WO-2026-081 for Commercial Bank of Ethiopia', category: 'Production', color: '#10b981' },
                { time: '2026-10-20 15:30:00', user: 'Cost Accountant', action: 'Audited Job Cost Sheet for Safaricom Retail Shop Fascia Signage', category: 'Costing', color: '#38bdf8' },
                { time: '2026-10-20 14:15:22', user: 'Storekeeper', action: 'Issued 12 sheets of Cast Acrylic 3mm Opal to CNC Router station', category: 'Inventory', color: '#818cf8' },
                { time: '2026-10-20 12:00:45', user: 'Sales Rep (Almaz T.)', action: 'Created Proforma Invoice PRO-2026-084 for BGI Ethiopia Brewery', category: 'Sales', color: '#a855f7' },
                { time: '2026-10-20 10:20:10', user: 'Production Supv.', action: 'Logged 4.5 sqm acrylic off-cut drop trim to scrap inventory', category: 'Wastage', color: '#f43f5e' },
                { time: '2026-10-20 09:00:00', user: 'System Telemetry', action: 'Performed automated daily working capital and MoR VAT balance sync', category: 'System', color: '#f59e0b' },
              ].map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{log.time}</div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `${log.color}15`, color: log.color }}>
                      {log.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#ffffff' }}>{log.action}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{log.user}</span>
                </div>
              ))}
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
            background: 'rgba(0, 0, 0, 0.85)',
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
              background: '#0d1326',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    {activeOrderModal.orderNumber} Cost Structure
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {activeOrderModal.profitMarginPct.toFixed(1)}% Realized Margin
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '3px' }}>
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
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Contracted Revenue</span>
                <span style={{ fontWeight: 800, color: '#818cf8', fontFamily: 'monospace' }}>
                  {formatETB(activeOrderModal.orderRevenue)}
                </span>
              </div>

              <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>1. Direct Materials & Consumables</span>
                  <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>
                    {formatETB(activeOrderModal.directMaterialCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>2. Shopfloor Technician Labor</span>
                  <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>
                    {formatETB(activeOrderModal.directLaborCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>3. CNC Router & Laser Runtime Cost</span>
                  <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>
                    {formatETB(activeOrderModal.machineCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>4. Scrap & Edge Drop Wastage</span>
                  <span style={{ fontFamily: 'monospace', color: '#f43f5e' }}>
                    {formatETB(activeOrderModal.wastageCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>5. Factory Overheads Allocation</span>
                  <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>
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
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span style={{ fontWeight: 800, color: '#ffffff' }}>Net Order Profitability</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontFamily: 'monospace', fontSize: '1.05rem' }}>
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
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
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
            background: 'rgba(0, 0, 0, 0.9)',
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
              background: '#0f172a',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  Executive Intelligence Dossier
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
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
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
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
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Audited Revenue</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                    {formatETB(totalNetRevenue)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Realized Margin</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                    {overallGrossMarginPct.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Shopfloor Scrap Ratio</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee' }}>
                    2.1% (Safe)
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  Top Revenue Drivers (Client Distribution)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {topClients.slice(0, 5).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                      }}
                    >
                      <span style={{ color: '#ffffff' }}>
                        {i + 1}. {c.name}
                      </span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#22d3ee' }}>
                        {formatETB(c.revenue)} ({c.margin}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
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
        <div style={{ padding: '40px', color: '#ffffff', textAlign: 'center' }}>
          Loading Business Intelligence & Reports Suite...
        </div>
      }
    >
      <ReportPageContent />
    </Suspense>
  );
}
