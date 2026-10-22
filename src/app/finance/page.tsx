'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  TrendingUp,
  Receipt,
  Building2,
  Calendar,
  Printer,
  ShieldCheck,
  PieChart,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Boxes,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  Wallet,
  Smartphone,
  Banknote,
  Landmark,
  BadgePercent,
  Download,
  X,
  CreditCard,
  Layers,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { OrderProfitability, CustomerOrder } from '@/types/erp';

export type FinancePeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half-yearly'
  | 'yearly'
  | 'custom';

function FinancePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab =
    (searchParams.get('tab') as
      | 'income_statement'
      | 'profitability'
      | 'stores'
      | 'cashflow'
      | 'aging'
      | 'tax') || 'income_statement';
  const period = (searchParams.get('period') as FinancePeriod) || 'monthly';
  const fromDate = searchParams.get('from') || '2026-10-01';
  const toDate = searchParams.get('to') || '2026-10-31';

  const {
    companyFinancials,
    storeFinancials,
    invoices,
    purchaseOrders,
    expenses,
    allOrderProfitability,
    orders,
    customers,
    suppliers,
    collections,
    wastages,
  } = useErp();

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [marginTierFilter, setMarginTierFilter] = useState<'all' | 'high' | 'healthy' | 'low'>('all');
  const [selectedProfitabilityOrder, setSelectedProfitabilityOrder] = useState<OrderProfitability | null>(null);

  // Timeline & Custom Date Picker state
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [customStart, setCustomStart] = useState(fromDate);
  const [customEnd, setCustomEnd] = useState(toDate);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; revenue: number; margin: number; profit: number } | null>(null);

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
    router.push(`/finance?${params.toString()}`);
  };

  const setPeriod = (p: FinancePeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', p);
    if (p === 'custom') {
      params.set('from', customStart);
      params.set('to', customEnd);
    } else {
      params.delete('from');
      params.delete('to');
    }
    router.push(`/finance?${params.toString()}`);
  };

  const applyCustomDates = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'custom');
    params.set('from', customStart);
    params.set('to', customEnd);
    router.push(`/finance?${params.toString()}`);
    setShowDatePickerModal(false);
  };

  // Period scaling factor relative to 1 baseline month (October 2026)
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case 'daily':
        return 1 / 26; // 26 working days in a month
      case 'weekly':
        return 7 / 30; // ~1 week
      case 'quarterly':
        return 3.0; // 3 months
      case 'half-yearly':
        return 6.0; // 6 months
      case 'yearly':
        return 12.0; // 12 months
      case 'custom': {
        const d1 = new Date(fromDate);
        const d2 = new Date(toDate);
        const diffMs = Math.max(0, d2.getTime() - d1.getTime());
        const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
        return days / 30;
      }
      case 'monthly':
      default:
        return 1.0;
    }
  }, [period, fromDate, toDate]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'daily':
        return 'Day-By-Day Telemetry (Oct 20, 2026)';
      case 'weekly':
        return 'Weekly Production Cycle (October 2026)';
      case 'quarterly':
        return 'Quarterly Fiscal Statement (Q4 FY2026)';
      case 'half-yearly':
        return 'Semi-Annual Financial Audit (H2 FY26)';
      case 'yearly':
        return 'Annual Fiscal Multi-Year Statement (FY 2026)';
      case 'custom':
        return `Custom Financial Window (${fromDate} → ${toDate})`;
      case 'monthly':
      default:
        return 'Monthly Financial Statement: October 2026';
    }
  }, [period, fromDate, toDate]);

  // Scaled Financial aggregates
  const netRevenue = Math.round(companyFinancials.totalRevenueNet * periodMultiplier);
  const cogs = Math.round(companyFinancials.cogs * periodMultiplier);
  const grossProfit = Math.round(companyFinancials.grossProfit * periodMultiplier);
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const opex = Math.round(companyFinancials.totalExpenses * periodMultiplier);
  const operatingIncome = Math.round(companyFinancials.operatingProfit * periodMultiplier);
  const netMarginPct = netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0;

  // Breakdown of COGS
  const totalMaterialCost = Math.round(allOrderProfitability.reduce((sum, p) => sum + p.directMaterialCost, 0) * periodMultiplier);
  const totalLaborCost = Math.round(allOrderProfitability.reduce((sum, p) => sum + p.directLaborCost, 0) * periodMultiplier);
  const totalMachineCost = Math.round(allOrderProfitability.reduce((sum, p) => sum + p.machineCost, 0) * periodMultiplier);
  const totalWastageCost = Math.round(allOrderProfitability.reduce((sum, p) => sum + p.wastageCost, 0) * periodMultiplier);
  const totalDirectTransportCost = Math.round(
    allOrderProfitability.reduce(
      (sum, p) => sum + (p.orderTransportCost || 0) + (p.orderDirectExpensesCost || 0),
      0
    ) * periodMultiplier
  );

  // Cash Inflows & Outflows
  const totalInflows = Math.round(companyFinancials.totalCollected * periodMultiplier);
  const baseSupplierPOPaid = purchaseOrders
    .filter((p) => p.status === 'received' || p.status === 'approved')
    .reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSupplierPOPaid = Math.round(baseSupplierPOPaid * periodMultiplier);
  const totalOpexPaid = Math.round(expenses.reduce((sum, e) => sum + e.totalAmount, 0) * periodMultiplier);
  const totalCashOutflows = Math.round(totalSupplierPOPaid * 0.75 + totalOpexPaid);
  const netCashFlow = totalInflows - totalCashOutflows;

  // Accounts Payable (AP) from approved purchase orders
  const accountsPayable =
    purchaseOrders
      .filter((p) => p.status === 'received' || p.status === 'approved')
      .reduce((sum, p) => sum + p.grandTotal, 0) - storeFinancials.supplierReturnValue;
  const accountsReceivable = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // MoR Statutory Tax totals
  const totalOutputVat = Math.round(companyFinancials.totalOutputVat * periodMultiplier);
  const totalInputVat = Math.round((companyFinancials.totalInputVat || companyFinancials.totalOutputVat * 0.42) * periodMultiplier);
  const netVatPayable = Math.round((companyFinancials.netVatPayable || companyFinancials.totalOutputVat * 0.58) * periodMultiplier);

  // Time-Series Data Generator based on active period (matching report page)
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
    } else if (period === 'custom') {
      const baseRev = (companyFinancials.totalRevenueNet * periodMultiplier) / 4;
      const baseProf = (companyFinancials.grossProfit * periodMultiplier) / 4;
      return [
        { label: 'Window Part 1', revenue: Math.round(baseRev * 0.88), profit: Math.round(baseProf * 0.86), margin: 44.0 },
        { label: 'Window Part 2', revenue: Math.round(baseRev * 1.06), profit: Math.round(baseProf * 1.08), margin: 45.8 },
        { label: 'Window Part 3', revenue: Math.round(baseRev * 0.94), profit: Math.round(baseProf * 0.92), margin: 44.1 },
        { label: 'Window Part 4', revenue: Math.round(baseRev * 1.12), profit: Math.round(baseProf * 1.14), margin: 45.8 },
      ];
    } else {
      return [
        { label: 'Aug 2026', revenue: 2540000, profit: 1092000, margin: 43.0 },
        { label: 'Sep 2026', revenue: 2890000, profit: 1286000, margin: 44.5 },
        { label: 'Oct 2026 (Active)', revenue: companyFinancials.totalRevenueNet, profit: companyFinancials.grossProfit, margin: grossMarginPct },
        { label: 'Nov 2026 (Pipeline)', revenue: 3450000, profit: 1550000, margin: 44.9 },
      ];
    }
  }, [period, periodMultiplier, companyFinancials.totalRevenueNet, companyFinancials.grossProfit, grossMarginPct]);

  // Chart dimensions & math for SVG trend curves
  const chartWidth = 650;
  const chartHeight = 220;
  const chartPadding = { top: 20, right: 30, bottom: 36, left: 60 };
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue), 1000) * 1.15;
  const getY = (val: number) => chartPadding.top + innerHeight - (val / maxRevenue) * innerHeight;
  const getX = (index: number) => chartPadding.left + (index / Math.max(1, trendData.length - 1)) * innerWidth;

  const areaPath = useMemo(() => {
    if (trendData.length === 0) return '';
    let d = `M ${getX(0)} ${getY(trendData[0].revenue)}`;
    trendData.forEach((pt, idx) => {
      if (idx > 0) d += ` L ${getX(idx)} ${getY(pt.revenue)}`;
    });
    d += ` L ${getX(trendData.length - 1)} ${chartPadding.top + innerHeight} L ${getX(0)} ${chartPadding.top + innerHeight} Z`;
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

  // Filtered Order Profitability
  const filteredOrderProfitability = useMemo(() => {
    return allOrderProfitability.filter((item) => {
      const q = orderSearchQuery.toLowerCase();
      const matchesSearch =
        item.orderNumber.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.orderTitle.toLowerCase().includes(q);

      let matchesTier = true;
      if (marginTierFilter === 'high') matchesTier = item.profitMarginPct >= 35;
      else if (marginTierFilter === 'healthy') matchesTier = item.profitMarginPct >= 20 && item.profitMarginPct < 35;
      else if (marginTierFilter === 'low') matchesTier = item.profitMarginPct < 20;

      return matchesSearch && matchesTier;
    });
  }, [allOrderProfitability, orderSearchQuery, marginTierFilter]);

  return (
    <div>
      {/* Hero Banner Header */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="hero-pill">
                MODULE 6 • CFO & AUDITING DESK
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                • IFRS & Ethiopian Ministry of Revenues Compliant
              </span>
            </div>
            <h1 style={{ marginTop: '2px', fontSize: '1.65rem', color: '#ffffff', fontWeight: 800 }}>
              Executive P&L, Job Costing & Financial Statements
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Timeline Period Selection Buttons in Hero */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.45)',
                padding: '4px 6px',
                borderRadius: '12px',
                border: '1px solid rgba(250, 204, 21, 0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {(['daily', 'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'] as FinancePeriod[]).map((p) => {
                const isActive = period === p;
                const label = p.charAt(0).toUpperCase() + p.slice(1);
                return (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    style={{
                      background: isActive ? '#facc15' : 'transparent',
                      color: isActive ? '#09090b' : 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      padding: '5px 11px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 800 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}

              <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 4px' }} />

              {/* Custom Range Picker trigger */}
              <button
                onClick={() => setShowDatePickerModal(!showDatePickerModal)}
                style={{
                  background: period === 'custom' ? '#facc15' : 'rgba(255, 255, 255, 0.1)',
                  color: period === 'custom' ? '#09090b' : '#ffffff',
                  border: period === 'custom' ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: period === 'custom' ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Calendar size={13} color={period === 'custom' ? '#09090b' : '#facc15'} />
                <span>{period === 'custom' ? `${fromDate} → ${toDate}` : 'Custom Range'}</span>
                <ChevronDown size={12} />
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.78rem',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
              }}
            >
              <Printer size={14} />
              <span>Export Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Period Scope Breadcrumb Card (matching report/page.tsx) */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)',
          border: '1px solid #fef08a',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Active Period Scope Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#09090b',
                border: '1px solid #facc15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#facc15',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.25)',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>
                  {periodLabel}
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
                    letterSpacing: '0.04em',
                  }}
                >
                  {period} Mode
                </span>
                {periodMultiplier !== 1 && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    Scale: {periodMultiplier.toFixed(2)}x
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Reporting Currency: Ethiopian Birr (ETB) • IFRS & GAAP Compliant • Ministry of Revenues (MoR) Audit
              </div>
            </div>
          </div>

          {/* Quick Scope Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Timeline Scope:</span>
            {(['daily', 'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'] as FinancePeriod[]).map((p) => {
              const isActive = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #ca8a04' : '1px solid var(--border-light)',
                    background: isActive ? '#fef9c3' : '#ffffff',
                    color: isActive ? '#854d0e' : 'var(--text-main)',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
            <button
              onClick={() => setShowDatePickerModal(!showDatePickerModal)}
              style={{
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: '6px',
                border: period === 'custom' ? '1px solid #ca8a04' : '1px solid var(--border-light)',
                background: period === 'custom' ? '#fef9c3' : '#ffffff',
                color: period === 'custom' ? '#854d0e' : 'var(--text-main)',
                fontWeight: period === 'custom' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={11} color="#ca8a04" />
              <span>Custom Range</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker Modal / Popover */}
        {showDatePickerModal && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: '20px',
              width: '360px',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              zIndex: 120,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#ca8a04" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09090b' }}>Custom Financial Window</span>
              </div>
              <button
                onClick={() => setShowDatePickerModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  From Date (Start)
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  To Date (End)
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    color: '#09090b',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  onClick={() => {
                    setCustomStart('2026-10-14');
                    setCustomEnd('2026-10-20');
                  }}
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#f4f4f5',
                    color: '#09090b',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    setCustomStart('2026-10-01');
                    setCustomEnd('2026-10-31');
                  }}
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#f4f4f5',
                    color: '#09090b',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  This Month
                </button>
                <button
                  onClick={() => {
                    setCustomStart('2026-07-01');
                    setCustomEnd('2026-09-30');
                  }}
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#f4f4f5',
                    color: '#09090b',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  Q3 2026
                </button>
                <button
                  onClick={() => {
                    setCustomStart('2026-01-01');
                    setCustomEnd('2026-10-20');
                  }}
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#f4f4f5',
                    color: '#09090b',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  Year-To-Date
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDatePickerModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyCustomDates}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#09090b',
                  border: '1px solid #facc15',
                  color: '#facc15',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                }}
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Stats Strip */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderTop: '3px solid #09090b' }}>
          <div className="stat-card-title">
            <span>Net Operating Revenue (Excl. VAT)</span>
            <Receipt size={16} color="#71717a" />
          </div>
          <div className="stat-card-value">{formatETB(netRevenue)}</div>
          <div className="stat-card-subtext">
            <span>Core turnover across finished & delivered jobs</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #ca8a04' }}>
          <div className="stat-card-title">
            <span>Gross Manufacturing Profit</span>
            <PieChart size={16} color="#ca8a04" />
          </div>
          <div className="stat-card-value" style={{ color: '#ca8a04' }}>
            {formatETB(grossProfit)}
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{grossMarginPct.toFixed(1)}% Gross Margin</span>
            <span> • After direct factory costs</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #16a34a' }}>
          <div className="stat-card-title">
            <span>Operating Profit (EBITDA)</span>
            <TrendingUp size={16} color="#16a34a" />
          </div>
          <div className="stat-card-value" style={{ color: '#16a34a' }}>
            {formatETB(operatingIncome)}
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{netMarginPct.toFixed(1)}% Operating Margin</span>
            <span> • Net company bottomline</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="stat-card-title">
            <span>Net Working Capital Gap</span>
            <Scale size={16} color="#f59e0b" />
          </div>
          <div className="stat-card-value" style={{ color: accountsReceivable >= accountsPayable ? '#16a34a' : '#ef4444' }}>
            {formatETB(accountsReceivable - accountsPayable)}
          </div>
          <div className="stat-card-subtext">
            <span>AR: {formatETB(accountsReceivable)} • AP: {formatETB(accountsPayable)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setTab('income_statement')}
          className={`tab-btn ${activeTab === 'income_statement' ? 'active' : ''}`}
        >
          <TrendingUp size={16} />
          <span>Executive P&L Statement</span>
          <span className="badge badge-emerald">{grossMarginPct.toFixed(0)}% Margin</span>
        </button>

        <button
          onClick={() => setTab('profitability')}
          className={`tab-btn ${activeTab === 'profitability' ? 'active' : ''}`}
        >
          <PieChart size={16} />
          <span>Job Costing & Order Margins</span>
          <span className="badge badge-blue">{allOrderProfitability.length} Jobs</span>
        </button>

        <button
          onClick={() => setTab('stores')}
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
        >
          <Boxes size={16} />
          <span>Store Ledger & Inventory</span>
          <span className="badge badge-emerald">{formatETB(storeFinancials.inventoryValuation)}</span>
        </button>

        <button
          onClick={() => setTab('cashflow')}
          className={`tab-btn ${activeTab === 'cashflow' ? 'active' : ''}`}
        >
          <Wallet size={16} />
          <span>Cash Flow & Treasury</span>
          <span className="badge badge-emerald">Inflows & Outflows</span>
        </button>

        <button
          onClick={() => setTab('aging')}
          className={`tab-btn ${activeTab === 'aging' ? 'active' : ''}`}
        >
          <Clock size={16} />
          <span>AR & AP Aging Ledger</span>
          <span className="badge badge-amber">{invoices.filter((i) => i.balanceDue > 0).length} Due</span>
        </button>

        <button
          onClick={() => setTab('tax')}
          className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} />
          <span>MoR Tax & VAT Filing</span>
          <span className="badge badge-purple">15% MoR</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE P&L STATEMENT                           */}
      {/* ======================================================== */}
      {activeTab === 'income_statement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Multi-Period Trajectory & Margin Curve Card (matching report/page.tsx) */}
          <div
            className="card"
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#ca8a04" />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                    Multi-Period Financial Trajectory & Margin Curve
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Area curve for Net Revenue vs Gross Profit in ETB ({period} view • {periodLabel})
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

            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="financeGoldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = chartPadding.top + innerHeight * (1 - pct);
                  const val = maxRevenue * pct;
                  return (
                    <g key={i}>
                      <line x1={chartPadding.left} y1={y} x2={chartPadding.left + innerWidth} y2={y} stroke="var(--border-light)" strokeDasharray="4 4" />
                      <text x={chartPadding.left - 10} y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {(val / 1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}

                <path d={areaPath} fill="url(#financeGoldGrad)" />
                <path d={linePath} fill="none" stroke="#09090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={profitLinePath} fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {trendData.map((pt, idx) => {
                  const cx = getX(idx);
                  const cyRevenue = getY(pt.revenue);
                  const cyProfit = getY(pt.profit);

                  return (
                    <g key={idx}>
                      <text x={cx} y={chartPadding.top + innerHeight + 18} fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">
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
                    left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                    top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                    transform: 'translate(-50%, -120%)',
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#facc15' }}>{hoveredPoint.label}</div>
                  <div>Net Revenue: {formatETB(hoveredPoint.revenue)}</div>
                  <div>Gross Profit: {formatETB(hoveredPoint.profit)}</div>
                  <div style={{ color: '#4ade80', fontWeight: 700 }}>Margin: {hoveredPoint.margin.toFixed(1)}%</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Statement of Profit & Loss (Operating P&L)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Audited financial rollup for period: <strong>{periodLabel}</strong> • Currency: Ethiopian Birr (ETB)
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    fontWeight: 600,
                  }}
                >
                  ✓ Direct Job Wastage Factored in COGS
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: Math.abs(storeFinancials.productionIssueValue - totalMaterialCost) < 1 ? '#0ea5e9' : '#b45309',
                    background: Math.abs(storeFinancials.productionIssueValue - totalMaterialCost) < 1 ? '#f0f9ff' : '#fffbeb',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${Math.abs(storeFinancials.productionIssueValue - totalMaterialCost) < 1 ? '#bae6fd' : '#fde68a'}`,
                    fontWeight: 600,
                  }}
                >
                  Store ledger: {formatETB(storeFinancials.productionIssueValue)} issued
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Line Item</th>
                    <th>Financial Cost Center</th>
                    <th style={{ textAlign: 'right' }}>Amount (ETB)</th>
                    <th style={{ textAlign: 'right' }}>% of Net Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Revenue Section */}
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <td colSpan={4} style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      1. REVENUE (NET TURNOVER)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Gross Invoiced Sales (Including VAT)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Commercial Invoicing</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatETB(netRevenue + totalOutputVat)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px', color: '#7c3aed' }}>
                      Less: Statutory 15% Output VAT (Held for MoR)
                    </td>
                    <td style={{ color: '#7c3aed' }}>Ministry of Revenues Liability</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#7c3aed' }}>
                      -{formatETB(totalOutputVat)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                  </tr>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.04)', fontWeight: 800 }}>
                    <td style={{ color: 'var(--text-main)' }}>NET OPERATING REVENUE (EXCL. VAT)</td>
                    <td>Operational Topline</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {formatETB(netRevenue)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>100.0%</td>
                  </tr>

                  {/* COGS Section */}
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <td colSpan={4} style={{ fontWeight: 800, color: '#ca8a04', fontSize: '0.85rem', paddingTop: '16px' }}>
                      2. COST OF GOODS SOLD (DIRECT MANUFACTURING COGS)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Direct Raw Materials (Acrylic, LED, Aluminum, Vinyl)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Inventory Store Issuances</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalMaterialCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalMaterialCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Direct Production Labor (Technicians, Welders, Printers)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Shopfloor Attendance</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalLaborCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalLaborCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Machine Station Runtime (Laser, CNC, Channel Bender)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Equipment Running Rates</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalMachineCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalMachineCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px', color: '#b45309' }}>
                      Production Scrap & Wastage Loss (Fractured Acrylic / Misprints)
                    </td>
                    <td style={{ color: '#b45309' }}>Wastage Cost Rollup</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#b45309' }}>
                      {formatETB(totalWastageCost)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#b45309' }}>
                      {netRevenue > 0 ? ((totalWastageCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px', color: '#b45309' }}>
                      Store Shrinkage & Unallocated Wastage
                    </td>
                    <td style={{ color: '#b45309' }}>Stock Count & Store Ledger</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#b45309' }}>
                      {formatETB(
                        storeFinancials.unallocatedWastageValue +
                          storeFinancials.adjustmentLossValue -
                          storeFinancials.adjustmentGainValue
                      )}
                    </td>
                    <td style={{ textAlign: 'right', color: '#b45309' }}>
                      {netRevenue > 0
                        ? (((storeFinancials.unallocatedWastageValue +
                            storeFinancials.adjustmentLossValue -
                            storeFinancials.adjustmentGainValue) /
                            netRevenue) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Direct Job Transportation & Scaffolding Crane</td>
                    <td style={{ color: 'var(--text-dim)' }}>Site Installation Cost</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalDirectTransportCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalDirectTransportCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ background: 'rgba(202, 138, 4, 0.08)', fontWeight: 800 }}>
                    <td style={{ color: 'var(--text-main)' }}>TOTAL COST OF GOODS SOLD (COGS)</td>
                    <td>Manufacturing Direct Rollup</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.95rem', color: '#854d0e' }}>
                      {formatETB(cogs)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#854d0e' }}>
                      {netRevenue > 0 ? ((cogs / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>

                  {/* Gross Profit */}
                  <tr style={{ background: 'rgba(250, 204, 21, 0.15)', fontWeight: 800 }}>
                    <td style={{ color: '#854d0e', fontSize: '0.95rem' }}>GROSS MANUFACTURING PROFIT</td>
                    <td style={{ color: '#854d0e' }}>Revenue - COGS</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1.05rem', color: '#854d0e' }}>
                      {formatETB(grossProfit)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: '#854d0e' }}>
                      {grossMarginPct.toFixed(1)}%
                    </td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <td colSpan={4} style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.85rem', paddingTop: '16px' }}>
                      3. OPERATING EXPENSES (FACTORY & ADMINISTRATIVE OVERHEAD)
                    </td>
                  </tr>
                  {expenses.map((exp) => {
                    const scaledExpAmount = Math.round(exp.amountNet * periodMultiplier);
                    return (
                      <tr key={exp.id}>
                        <td style={{ paddingLeft: '24px' }}>{exp.categoryLabel || exp.supplierOrPayee}</td>
                        <td style={{ color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                          {exp.category?.replace('_', ' ') || 'Facility Overhead'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(scaledExpAmount)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                          {netRevenue > 0 ? ((scaledExpAmount / netRevenue) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: 'rgba(239, 68, 68, 0.08)', fontWeight: 800 }}>
                    <td style={{ color: 'var(--text-main)' }}>TOTAL OPERATING EXPENSES (OPEX)</td>
                    <td>General Overhead</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>
                      {formatETB(opex)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                      {netRevenue > 0 ? ((opex / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>

                  {/* Net Operating Income / EBITDA */}
                  <tr style={{ background: 'rgba(16, 185, 129, 0.16)', fontWeight: 900 }}>
                    <td style={{ color: '#10b981', fontSize: '1rem', letterSpacing: '0.02em' }}>
                      NET OPERATING INCOME (EBITDA)
                    </td>
                    <td style={{ color: '#10b981' }}>Gross Profit - OPEX</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1.25rem', color: '#10b981' }}>
                      {formatETB(operatingIncome)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.05rem', color: '#10b981' }}>
                      {netMarginPct.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: JOB COSTING & ORDER PROFITABILITY ENGINE          */}
      {/* ======================================================== */}
      {activeTab === 'profitability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            {/* Filter controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search order #, client name, or project title..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      fontSize: '0.82rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Margin:</span>
                  <select
                    value={marginTierFilter}
                    onChange={(e) => setMarginTierFilter(e.target.value as any)}
                    style={{
                      padding: '7px 10px',
                      fontSize: '0.78rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">All Margins</option>
                    <option value="high">High Margin (&gt; 35%)</option>
                    <option value="healthy">Healthy Margin (20 - 35%)</option>
                    <option value="low">Low Margin (&lt; 20%)</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Showing <strong>{filteredOrderProfitability.length}</strong> of <strong>{allOrderProfitability.length}</strong> Job Rollups
              </div>
            </div>

            {/* Profitability Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Order #</th>
                    <th>Customer & Title</th>
                    <th style={{ textAlign: 'right' }}>Agreed Revenue (Net)</th>
                    <th style={{ textAlign: 'right' }}>Direct Material</th>
                    <th style={{ textAlign: 'right' }}>Direct Labor</th>
                    <th style={{ textAlign: 'right' }}>Machine Run</th>
                    <th style={{ textAlign: 'right' }}>Scrap Waste</th>
                    <th style={{ textAlign: 'right' }}>Total Job Cost</th>
                    <th style={{ textAlign: 'right' }}>Order Profit</th>
                    <th style={{ textAlign: 'center' }}>Margin %</th>
                    <th style={{ textAlign: 'center' }}>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderProfitability.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                        No orders match the current profitability criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrderProfitability.map((prof) => {
                      const isHigh = prof.profitMarginPct >= 35;
                      const isHealthy = prof.profitMarginPct >= 20 && prof.profitMarginPct < 35;

                      return (
                        <tr key={prof.orderId}>
                          <td>
                            <button
                              onClick={() => setSelectedProfitabilityOrder(prof)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ca8a04',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <PieChart size={13} />
                              <span>{prof.orderNumber}</span>
                            </button>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prof.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prof.orderTitle}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>
                            {formatETB(prof.orderRevenue)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                            {formatETB(prof.directMaterialCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatETB(prof.directLaborCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatETB(prof.machineCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: prof.wastageCost > 0 ? '#fbbf24' : 'var(--text-dim)' }}>
                            {prof.wastageCost > 0 ? formatETB(prof.wastageCost) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#f87171' }}>
                            {formatETB(prof.totalOrderCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: prof.orderProfit >= 0 ? '#10b981' : '#ef4444' }}>
                            {formatETB(prof.orderProfit)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${
                                isHigh ? 'badge-emerald' : isHealthy ? 'badge-blue' : 'badge-amber'
                              }`}
                              style={{ fontWeight: 700 }}
                            >
                              {prof.profitMarginPct.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedProfitabilityOrder(prof)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            >
                              <PieChart size={12} />
                              <span>Cost Tree</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STORE LEDGER & INVENTORY FINANCE                  */}
      {/* ======================================================== */}
      {activeTab === 'stores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase' }}>
                  Inventory at Cost
                </span>
                <Boxes size={18} color="#0ea5e9" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.inventoryValuation)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {storeFinancials.storeValuations.length} stores • {storeFinancials.categoryValuations.length} categories
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ca8a04' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase' }}>
                  Material Issued to Jobs
                </span>
                <DollarSign size={18} color="#ca8a04" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.productionIssueValue + storeFinancials.salesIssueValue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Posted to WIP / COGS through the stock ledger
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #be123c' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>
                  Wastage & Shrinkage
                </span>
                <Trash2 size={18} color="#be123c" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.wastageValue + storeFinancials.adjustmentLossValue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {formatETB(storeFinancials.unallocatedWastageValue)} unallocated to jobs
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                  Supplier Debit Notes
                </span>
                <ArrowDownRight size={18} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.supplierReturnValue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Reduces supplier payables in the AP ledger
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Procurement Reconciliation
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Goods receipts posted in Stores are matched to purchase orders before they settle Accounts Payable.
                </p>
              </div>
              <span className={`badge ${storeFinancials.unlinkedPurchaseReceipts === 0 ? 'badge-emerald' : 'badge-amber'}`}>
                {storeFinancials.unlinkedPurchaseReceipts === 0 ? 'Fully Reconciled' : `${storeFinancials.unlinkedPurchaseReceipts} Unlinked GRNs`}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PO-backed receipts</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: '#16a34a' }}>
                  {formatETB(storeFinancials.linkedPurchaseReceiptValue)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  {storeFinancials.linkedPurchaseReceipts} GRNs settled to AP
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Unreconciled receipts</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: '#b45309' }}>
                  {formatETB(storeFinancials.unlinkedPurchaseReceiptValue)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  {storeFinancials.unlinkedPurchaseReceipts} GRNs awaiting a PO match
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Net supplier payable</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                  {formatETB(accountsPayable)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  After {formatETB(storeFinancials.supplierReturnValue)} supplier debits
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Inter-store transfers</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                  {formatETB(storeFinancials.transferValue)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Inventory-to-inventory, no P&L impact</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Inventory Valuation by Store
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>SKUs</th>
                      <th style={{ textAlign: 'right' }}>Units</th>
                      <th style={{ textAlign: 'right' }}>Value (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeFinancials.storeValuations.map((store) => (
                      <tr key={store.storeId}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{store.storeName}</td>
                        <td style={{ textTransform: 'capitalize', color: 'var(--text-dim)' }}>
                          {store.storeType.replaceAll('_', ' ')}
                        </td>
                        <td style={{ textAlign: 'right' }}>{store.skuCount}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{store.totalUnits.toFixed(0)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                          {formatETB(store.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Inventory by Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {storeFinancials.categoryValuations.map((cat) => {
                  const pct = storeFinancials.inventoryValuation > 0 ? (cat.totalValue / storeFinancials.inventoryValuation) * 100 : 0;
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: 600 }}>
                          {cat.category.replaceAll('_', ' ')}
                        </span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{formatETB(cat.totalValue)}</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: '#facc15' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Store Journal — Finance Postings
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Every approved stock movement with its debit and credit account. Wastage, issues and receipts feed the P&L in real time.
                </p>
              </div>
              <span className="badge badge-blue">{storeFinancials.recentPostings.length} Postings</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Movement</th>
                    <th>Item / Store</th>
                    <th>Debit Account</th>
                    <th>Credit Account</th>
                    <th style={{ textAlign: 'right' }}>Value (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {storeFinancials.recentPostings.map((posting) => (
                    <tr key={posting.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{posting.date}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                          {posting.movementType.replaceAll('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {posting.movementNumber}{posting.reference ? ` • ${posting.reference}` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-main)' }}>{posting.itemName}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {posting.quantity} {posting.unit} • {posting.storeName}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.74rem', color: '#16a34a' }}>{posting.debitAccount}</td>
                      <td style={{ fontSize: '0.74rem', color: '#dc2626' }}>{posting.creditAccount}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                        {formatETB(posting.value)}
                      </td>
                    </tr>
                  ))}
                  {storeFinancials.recentPostings.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                        No store movements have been posted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CASH FLOW & TREASURY                              */}
      {/* ======================================================== */}
      {activeTab === 'cashflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cash Position Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Total Inflows (Collections)
                </span>
                <ArrowUpRight size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
                {formatETB(totalInflows)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Telebirr, CBE wire transfers & cashier deposits
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                  Total Outflows (Procurement & OPEX)
                </span>
                <ArrowDownRight size={18} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
                {formatETB(totalCashOutflows)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Raw material PO settlements & monthly operating expenses
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Net Cash Position
                </span>
                <Wallet size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: netCashFlow >= 0 ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>
                {formatETB(netCashFlow)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Positive treasury runway for raw material reordering
              </div>
            </div>
          </div>

          {/* Cash Flow Statement Ledger */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              Cash Inflow & Outflow Activity ({periodLabel})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity / Counterparty</th>
                    <th>Category</th>
                    <th>Channel / Reference</th>
                    <th style={{ textAlign: 'right' }}>Inflow (+)</th>
                    <th style={{ textAlign: 'right' }}>Outflow (-)</th>
                    <th style={{ textAlign: 'center' }}>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => (
                    <tr key={col.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{col.date}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{col.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Settlement for {col.invoiceNumber}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-emerald">Customer Inflow</span>
                      </td>
                      <td>
                        <div style={{ textTransform: 'capitalize', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                          {col.paymentMethod.replace('_', ' ')}
                        </div>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{col.bankReference}</code>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>
                        +{formatETB(col.amountReceived)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-emerald">✓ Reconciled</span>
                      </td>
                    </tr>
                  ))}
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{exp.date}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {exp.categoryLabel} ({exp.supplierOrPayee})
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{exp.expenseNumber}</div>
                      </td>
                      <td>
                        <span className="badge badge-rose">Operating Expense</span>
                      </td>
                      <td>
                        <div style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                          {exp.paymentMethod.replace('_', ' ')}
                        </div>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{exp.receiptRef || 'DIRECT'}</code>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>
                        -{formatETB(exp.totalAmount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-blue">✓ Paid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AR & AP AGING LEDGER                              */}
      {/* ======================================================== */}
      {activeTab === 'aging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Current (&lt; 30 Days)
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace', marginTop: '4px' }}>
                {formatETB(accountsReceivable * 0.65)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Within agreed payment credit term</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                31 - 60 Days Aging
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ca8a04', fontFamily: 'monospace', marginTop: '4px' }}>
                {formatETB(accountsReceivable * 0.25)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>First follow-up call window</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                61 - 90 Days Aging
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706', fontFamily: 'monospace', marginTop: '4px' }}>
                {formatETB(accountsReceivable * 0.1)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Credit hold pending payment</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                90+ Days Overdue
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace', marginTop: '4px' }}>
                ETB 0
              </div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>Zero bad debt write-offs</div>
            </div>
          </div>

          {/* Accounts Receivable Table */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Accounts Receivable (AR) by Customer Account
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Uncollected balances across commercial invoices
                </p>
              </div>
              <Link href="/sales?tab=collections" className="btn btn-secondary btn-sm">
                <CreditCard size={14} />
                <span>Go to Sales & Collections Desk</span>
              </Link>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Organization</th>
                  <th>TIN Number</th>
                  <th style={{ textAlign: 'right' }}>Credit Limit</th>
                  <th style={{ textAlign: 'right' }}>Current (&lt; 30d)</th>
                  <th style={{ textAlign: 'right' }}>30-60d</th>
                  <th style={{ textAlign: 'right' }}>Total Outstanding Due</th>
                  <th style={{ textAlign: 'center' }}>Terms</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.address}</div>
                    </td>
                    <td>
                      <code style={{ color: '#7c3aed' }}>{c.tin}</code>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(c.creditLimit)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#16a34a' }}>
                      {formatETB(c.outstandingBalance * 0.7)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: c.outstandingBalance > 0 ? '#ca8a04' : 'var(--text-dim)' }}>
                      {formatETB(c.outstandingBalance * 0.3)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: c.outstandingBalance > 0 ? '#ca8a04' : '#16a34a' }}>
                      {formatETB(c.outstandingBalance)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-gray">{c.paymentTerms || 'Net 30 Days'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MoR STATUTORY TAX & VAT FILING                    */}
      {/* ======================================================== */}
      {activeTab === 'tax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: '#09090b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#facc15',
                }}
              >
                <Landmark size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Ministry of Revenues (MoR) Statutory Tax Filing Schedule
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Electronic Value Added Tax (VAT 15%) Declaration & Withholding Tax (WHT 2%) Audit Ledger
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Registered Taxpayer TIN</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  TIN: 0048291048
                </div>
              </div>
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                <Download size={14} />
                <span>Export Tax Form</span>
              </button>
            </div>
          </div>

          {/* 3-Box Tax Formula Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ borderLeft: '4px solid #ca8a04' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>
                  Box A • Output VAT Collected
                </span>
                <BadgePercent size={16} color="#ca8a04" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(totalOutputVat)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                15% VAT charged to commercial clients on sales invoices
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #09090b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  Box B • Input VAT Deductible
                </span>
                <ShieldCheck size={16} color="#71717a" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(totalInputVat)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                15% VAT paid on raw materials (acrylic, vinyl, aluminum profiles)
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                  Box C • Net VAT Payable to MoR
                </span>
                <Landmark size={16} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
                {formatETB(netVatPayable)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Remittance due to Ministry of Revenues by the 30th of each month
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER PROFITABILITY & COST TREE BREAKDOWN         */}
      {/* ======================================================== */}
      {selectedProfitabilityOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#facc15',
                  }}
                >
                  <PieChart size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Job Cost Tree & Margin Analysis
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedProfitabilityOrder.orderNumber} • {selectedProfitabilityOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfitabilityOrder(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Highlight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Agreed Net Revenue</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatETB(selectedProfitabilityOrder.orderRevenue)}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Rollup Cost</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                    {formatETB(selectedProfitabilityOrder.totalOrderCost)}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#16a34a' }}>Net Order Profit ({selectedProfitabilityOrder.profitMarginPct.toFixed(1)}%)</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
                    {formatETB(selectedProfitabilityOrder.orderProfit)}
                  </div>
                </div>
              </div>

              {/* Itemized Cost Tree */}
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  Direct Manufacturing Cost Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>1. Bill of Materials (Raw Materials):</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(selectedProfitabilityOrder.directMaterialCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>2. Direct Labor (Assembly & Fabrication):</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(selectedProfitabilityOrder.directLaborCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>3. Machine Runtime (Laser & CNC Hours):</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(selectedProfitabilityOrder.machineCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fbbf24' }}>4. Production Wastage & Scrap Loss:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#fbbf24' }}>
                      {formatETB(selectedProfitabilityOrder.wastageCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>5. Transport & Scaffolding Direct Expenses:</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(
                        (selectedProfitabilityOrder.orderTransportCost || 0) +
                          (selectedProfitabilityOrder.orderDirectExpensesCost || 0)
                      )}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '8px',
                      marginTop: '4px',
                      fontWeight: 800,
                    }}
                  >
                    <span>Total Direct Rollup Cost:</span>
                    <span style={{ fontFamily: 'monospace', color: '#dc2626' }}>
                      {formatETB(selectedProfitabilityOrder.totalOrderCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedProfitabilityOrder(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', color: 'var(--text-dim)' }}>Loading Finance Desk...</div>}>
      <FinancePageContent />
    </Suspense>
  );
}
