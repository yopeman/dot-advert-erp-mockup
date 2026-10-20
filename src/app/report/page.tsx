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
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; revenue: number; margin: number; profit: number } | null>(null);
  const [selectedDonutIndex, setSelectedDonutIndex] = useState<number | null>(null);
  const [activeOrderModal, setActiveOrderModal] = useState<OrderProfitability | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
  const filteredMaterialCost = filteredOrders.reduce((sum, o) => sum + o.directMaterialCost, 0);
  const filteredLaborCost = filteredOrders.reduce((sum, o) => sum + o.directLaborCost, 0);
  const filteredMachineCost = filteredOrders.reduce((sum, o) => sum + o.machineCost, 0);
  const filteredOverheadCost = filteredOrders.reduce((sum, o) => sum + o.allocatedOverheadCost, 0);
  const filteredWastageCost = filteredOrders.reduce((sum, o) => sum + o.wastageCost, 0);

  // Time-Series Data Generator based on active period
  const trendData = useMemo(() => {
    if (period === 'daily') {
      // 7 days of daily telemetry (ending Oct 20)
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
      // 4 weeks of October 2026
      return [
        { label: 'Wk 40 (Oct 1-7)', revenue: 1650000, profit: 742000, margin: 44.9 },
        { label: 'Wk 41 (Oct 8-14)', revenue: 2180000, profit: 981000, margin: 45.0 },
        { label: 'Wk 42 (Oct 15-21)', revenue: 2420000, profit: 1090000, margin: 45.0 },
        { label: 'Wk 43 (Oct 22-28)', revenue: 1950000, profit: 860000, margin: 44.1 },
      ];
    } else if (period === 'quarterly') {
      // Q1 to Q4 2026
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
      // Default: Monthly progression (Aug, Sep, Oct 2026)
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
  const minRevenue = 0;

  // Scale Functions
  const getX = (index: number) => padding.left + (index / (trendData.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - (val / maxRevenue) * innerHeight;

  // SVG Area Path generator
  const areaPath = useMemo(() => {
    if (trendData.length === 0) return '';
    let d = `M ${getX(0)} ${padding.top + innerHeight}`;
    trendData.forEach((pt, idx) => {
      d += ` L ${getX(idx)} ${getY(pt.revenue)}`;
    });
    d += ` L ${getX(trendData.length - 1)} ${padding.top + innerHeight} Z`;
    return d;
  }, [trendData, maxRevenue]);

  // SVG Line Path
  const linePath = useMemo(() => {
    if (trendData.length === 0) return '';
    return trendData.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.revenue)}`).join(' ');
  }, [trendData, maxRevenue]);

  // SVG Profit Line Path
  const profitLinePath = useMemo(() => {
    if (trendData.length === 0) return '';
    return trendData.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.profit)}`).join(' ');
  }, [trendData, maxRevenue]);

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* 1. Global Filter & Period Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 30, 55, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
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

      {/* 2. Top Summary KPI Cards Strip */}
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
            position: 'relative',
            overflow: 'hidden',
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
            position: 'relative',
            overflow: 'hidden',
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
            position: 'relative',
            overflow: 'hidden',
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

        {/* Manufacturing Scrap & Defect Loss */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 30, 55, 0.85) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
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

      {/* 3. Primary Charts Section (Interactive SVG Revenue & Margin Curve + Product Distribution Donut) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.55fr 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* CHART 1: Interactive SVG Revenue & Profit Trend Curve */}
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
                Continuous area curve for Net Revenue vs Gross Profit in ETB ({period} breakdown)
              </div>
            </div>

            {/* Legend */}
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

          {/* SVG Canvas */}
          <div style={{ width: '100%', height: '260px', position: 'relative' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding.top + innerHeight * (1 - pct);
                const val = maxRevenue * pct;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3}
                      fill="var(--text-dim)"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Area Gradient Fill */}
              <path d={areaPath} fill="url(#indigoGradient)" />

              {/* Net Revenue Stroke Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Gross Profit Stroke Line */}
              <path
                d={profitLinePath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points & Hover Triggers */}
              {trendData.map((pt, idx) => {
                const cx = getX(idx);
                const cyRevenue = getY(pt.revenue);
                const cyProfit = getY(pt.profit);

                return (
                  <g key={idx}>
                    {/* X-Axis Label */}
                    <text
                      x={cx}
                      y={padding.top + innerHeight + 20}
                      fill="var(--text-muted)"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>

                    {/* Net Revenue Dot */}
                    <circle
                      cx={cx}
                      cy={cyRevenue}
                      r="5"
                      fill="#6366f1"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: cx,
                          y: cyRevenue,
                          label: pt.label,
                          revenue: pt.revenue,
                          profit: pt.profit,
                          margin: pt.margin,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* Gross Profit Dot */}
                    <circle
                      cx={cx}
                      cy={cyProfit}
                      r="4.5"
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: cx,
                          y: cyProfit,
                          label: pt.label,
                          revenue: pt.revenue,
                          profit: pt.profit,
                          margin: pt.margin,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#10b981' }}>
                  <span>Margin %:</span>
                  <span style={{ fontWeight: 700 }}>{hoveredPoint.margin.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Interactive SVG Donut Chart (Revenue by Product Line) */}
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
            {/* SVG Donut */}
            <svg width="190" height="190" viewBox="0 0 190 190">
              {productDistribution.map((item, idx) => {
                // Compute strokeDasharray and strokeDashoffset for SVG circle donut segments
                const radius = 70;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = `${(item.share / 100) * circumference} ${circumference}`;

                // Calculate cumulative offset
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
                      filter: isHovered ? `drop-shadow(0 0 8px ${item.color})` : 'none',
                    }}
                    onMouseEnter={() => setSelectedDonutIndex(idx)}
                    onMouseLeave={() => setSelectedDonutIndex(null)}
                  />
                );
              })}

              {/* Center Donut Label */}
              <text x="95" y="88" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontWeight="600">
                {selectedDonutIndex !== null ? productDistribution[selectedDonutIndex].name.split(' ')[0] : 'Total Net'}
              </text>
              <text x="95" y="108" fill="#ffffff" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                {selectedDonutIndex !== null
                  ? `${productDistribution[selectedDonutIndex].share}%`
                  : 'ETB 8.21M'}
              </text>
            </svg>
          </div>

          {/* Donut Legend */}
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
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: '0.72rem', color: selectedDonutIndex === idx ? '#ffffff' : 'var(--text-muted)' }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                    {formatETB(p.amount)}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', width: '32px', textAlign: 'right' }}>
                    {p.share}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Secondary Analytical Suite: Machine Telemetry & Scrap Loss Graphs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* CHART 3: Machine & CNC/Laser Runtime Capacity Utilization */}
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
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  Factory Machine Station Utilization
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Active operating hours vs 208-hour monthly rated shopfloor capacity
              </div>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#818cf8',
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '2px 8px',
                borderRadius: '8px',
              }}
            >
              Plant OEE: 91.4%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {machineTelemetry.map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={13} color="var(--text-dim)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>{m.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      ({m.station})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {m.activeHours}h / {m.ratedHours}h
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: m.utilization > 90 ? '#f59e0b' : m.utilization > 80 ? '#10b981' : '#38bdf8',
                        width: '45px',
                        textAlign: 'right',
                      }}
                    >
                      {m.utilization}%
                    </span>
                  </div>
                </div>

                {/* Progress Meter Bar */}
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${m.utilization}%`,
                      background:
                        m.utilization > 90
                          ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                          : m.utilization > 80
                          ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                          : 'linear-gradient(90deg, #6366f1, #38bdf8)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 4: Shopfloor Scrap & Wastage Pareto Graph */}
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
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  Material Scrap & Drop-Cut Losses
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Monetary impact in ETB & waste ratio by fabrication raw material
              </div>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#f43f5e',
                background: 'rgba(244, 63, 94, 0.15)',
                padding: '2px 8px',
                borderRadius: '8px',
              }}
            >
              Scrap Total: {formatETB(totalScrapCost)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scrapByMaterial.map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>{s.material}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f43f5e', fontFamily: 'monospace' }}>
                      {formatETB(s.scrapCost)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      {s.wastePct}% waste
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  Root Cause: {s.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Top 10 High-Value Enterprise Clients Ranking */}
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
          <button
            onClick={() => setTab('sales')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#22d3ee',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <span>View Full Sales BI</span>
            <ChevronRight size={14} />
          </button>
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
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-dim)' }}>{idx + 1}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>{client.name}</td>
                    <td style={{ padding: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background:
                            client.status === 'Prime A+'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : client.status === 'Enterprise'
                              ? 'rgba(99, 102, 241, 0.15)'
                              : 'rgba(255, 255, 255, 0.08)',
                          color:
                            client.status === 'Prime A+'
                              ? '#10b981'
                              : client.status === 'Enterprise'
                              ? '#818cf8'
                              : 'var(--text-muted)',
                        }}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {client.orders} work orders
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#ffffff' }}>
                      {formatETB(client.revenue)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {client.margin.toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div
                        style={{
                          height: '6px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${barWidthPct}%`,
                            background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Order Profitability Detailed Audit Table */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 38, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.22)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} color="#818cf8" />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                Job-Level Manufacturing Cost & Margin Audit ({filteredOrders.length} Orders)
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Audited direct BOM materials, labor, machine tooling, scrap and net margins
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Filtered Margin: <strong style={{ color: '#10b981' }}>{filteredMarginPct.toFixed(1)}%</strong>
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Order Number</th>
                <th style={{ padding: '8px 10px' }}>Customer / Project</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Agreed Price</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Materials</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Labor</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Machine</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Scrap</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Gross Profit</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Margin %</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Drill-Down</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 10).map((order) => {
                const marginColor =
                  order.profitMarginPct >= 45 ? '#10b981' : order.profitMarginPct >= 30 ? '#38bdf8' : '#f43f5e';

                return (
                  <tr
                    key={order.orderId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{order.orderTitle}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                      {formatETB(order.orderRevenue)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {formatETB(order.directMaterialCost)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {formatETB(order.directLaborCost)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {formatETB(order.machineCost)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#f43f5e', fontFamily: 'monospace' }}>
                      {formatETB(order.wastageCost)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
                      {formatETB(order.grossProfit)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: marginColor,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${marginColor}18`,
                        }}
                      >
                        {order.profitMarginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => setActiveOrderModal(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#22d3ee',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Modal: Interactive Cost Tree Inspection */}
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

      {/* 8. Print Dossier Executive View Modal */}
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

            {/* Dossier Body Content */}
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
