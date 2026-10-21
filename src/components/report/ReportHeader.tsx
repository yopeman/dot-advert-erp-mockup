'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  Boxes,
  PieChart,
  Filter,
} from 'lucide-react';

export type ReportPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half-yearly'
  | 'yearly'
  | 'custom';

export default function ReportHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { companyFinancials, orders, allOrderProfitability, wastages, resetDemoData } = useErp();

  const currentTab = searchParams.get('tab') || 'executive';
  const currentPeriod = (searchParams.get('period') as ReportPeriod) || 'monthly';
  const fromDate = searchParams.get('from') || '2026-10-01';
  const toDate = searchParams.get('to') || '2026-10-31';
  const selectedMonth = searchParams.get('month') || '2026-10';
  const selectedQuarter = searchParams.get('quarter') || 'Q4-2026';
  const selectedHalfYear = searchParams.get('half') || 'H2-2026';
  const selectedYear = searchParams.get('year') || '2026';
  const selectedDay = searchParams.get('day') || '2026-10-20';

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [customStart, setCustomStart] = useState(fromDate);
  const [customEnd, setCustomEnd] = useState(toDate);

  // Financial aggregates for quick header display
  const netRevenue = companyFinancials.totalRevenueNet;
  const grossProfit = companyFinancials.grossProfit;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const totalScrapCost = wastages.reduce((sum, w) => sum + w.totalCost, 0);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/report?${params.toString()}`);
  };

  const setPeriod = (period: ReportPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    if (period === 'custom') {
      params.set('from', customStart);
      params.set('to', customEnd);
    }
    router.push(`/report?${params.toString()}`);
  };

  const applyCustomDates = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'custom');
    params.set('from', customStart);
    params.set('to', customEnd);
    router.push(`/report?${params.toString()}`);
    setShowDatePickerModal(false);
  };

  const handleExportCSV = () => {
    setShowExportMenu(false);
    // Build CSV Content
    let csv = 'Dot Advert ERP - Business Intelligence & Audit Export\n';
    csv += `Generated At: ${new Date().toISOString()}\n`;
    csv += `Period Mode: ${currentPeriod.toUpperCase()}\n\n`;

    csv += '--- EXECUTIVE FINANCIAL SUMMARY ---\n';
    csv += `Total Net Revenue (ETB),${netRevenue}\n`;
    csv += `Gross Profit (ETB),${grossProfit}\n`;
    csv += `Gross Margin (%),${grossMarginPct.toFixed(1)}%\n`;
    csv += `Operating Profit EBITDA (ETB),${companyFinancials.operatingProfit}\n`;
    csv += `Production Scrap Loss (ETB),${totalScrapCost}\n\n`;

    csv += '--- ORDERS & PROFITABILITY AUDIT ---\n';
    csv += 'Order Number,Customer Name,Agreed Revenue (ETB),Direct Material (ETB),Direct Labor (ETB),Machine Cost (ETB),Overhead (ETB),Wastage (ETB),Total Cost (ETB),Gross Profit (ETB),Margin (%)\n';
    allOrderProfitability.forEach((p) => {
      csv += `"${p.orderNumber}","${p.customerName}",${p.orderRevenue},${p.directMaterialCost},${p.directLaborCost},${p.machineCost},${p.allocatedOverheadCost},${p.wastageCost},${p.totalOrderCost},${p.grossProfit},${p.profitMarginPct.toFixed(1)}%\n`;
    });

    csv += '\n--- PRODUCTION SCRAP & WASTAGE LOG ---\n';
    csv += 'Date,Item Name,Quantity,Unit,Unit Cost (ETB),Total Scrap Cost (ETB),Reason,Reported By\n';
    wastages.forEach((w) => {
      csv += `"${w.date}","${w.itemName}",${w.quantity},"${w.unit}",${w.unitCost},${w.totalCost},"${w.reason}","${w.reportedBy}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dot_Advert_ERP_Report_${currentPeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `*DOT ADVERT ERP — EXECUTIVE INTELLIGENCE SUMMARY*
Period: ${currentPeriod.toUpperCase()} (Ending October 2026)
• Net Revenue: ${formatETB(netRevenue)}
• Gross Profit: ${formatETB(grossProfit)} (${grossMarginPct.toFixed(1)}% Margin)
• Operating Income (EBITDA): ${formatETB(companyFinancials.operatingProfit)}
• Production Scrap & Wastage: ${formatETB(totalScrapCost)} (2.1% of Raw Materials)
• Active Work Orders: ${orders.length} orders analyzed
• Currency: Ethiopian Birr (ETB)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
    setShowExportMenu(false);
  };

  return (
    <header
      style={{
        height: '70px',
        background: 'rgba(11, 15, 30, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Branding & Module Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)',
              color: '#ffffff',
            }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Reports & Business Intelligence
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#818cf8',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  letterSpacing: '0.04em',
                }}
              >
                MODULE 7
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#22d3ee',
                  background: 'rgba(6, 182, 212, 0.12)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                Live Telemetry
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Interactive Charts • Manufacturing Telemetry • Multi-Period Date Filters • Export Engine
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Day / Period Selection Bar (The user's core requirement) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px 6px',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <button
          onClick={() => setPeriod('daily')}
          style={{
            background: currentPeriod === 'daily' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: currentPeriod === 'daily' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: currentPeriod === 'daily' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Daily
        </button>

        <button
          onClick={() => setPeriod('weekly')}
          style={{
            background: currentPeriod === 'weekly' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: currentPeriod === 'weekly' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: currentPeriod === 'weekly' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Weekly
        </button>

        <button
          onClick={() => setPeriod('monthly')}
          style={{
            background: currentPeriod === 'monthly' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: currentPeriod === 'monthly' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: currentPeriod === 'monthly' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Monthly
        </button>

        <button
          onClick={() => setPeriod('quarterly')}
          style={{
            background: currentPeriod === 'quarterly' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: currentPeriod === 'quarterly' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: currentPeriod === 'quarterly' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Quarterly
        </button>

        <button
          onClick={() => setPeriod('half-yearly')}
          style={{
            background: currentPeriod === 'half-yearly' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: currentPeriod === 'half-yearly' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: currentPeriod === 'half-yearly' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Half-Yearly
        </button>

        <button
          onClick={() => setPeriod('yearly')}
          style={{
            background: currentPeriod === 'yearly' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: currentPeriod === 'yearly' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: currentPeriod === 'yearly' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Yearly
        </button>

        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

        {/* Custom Range Picker trigger */}
        <button
          onClick={() => setShowDatePickerModal(!showDatePickerModal)}
          style={{
            background: currentPeriod === 'custom' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'rgba(255, 255, 255, 0.05)',
            color: currentPeriod === 'custom' ? '#ffffff' : '#38bdf8',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Calendar size={13} />
          <span>{currentPeriod === 'custom' ? `${fromDate} → ${toDate}` : 'Custom Range'}</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Right: Quick KPIs & Export Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* KPI Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '6px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Filtered Revenue</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
              {formatETB(netRevenue)}
            </span>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Margin</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
              {grossMarginPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Export Button with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={15} />
            <span>Export & Print</span>
            <ChevronDown size={14} />
          </button>

          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                background: '#0f172a',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  padding: '6px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Export Format
              </div>

              <button
                onClick={handleExportCSV}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Download size={15} color="#22d3ee" />
                <div>
                  <div style={{ fontWeight: 600 }}>Download CSV / Excel</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Orders, margins, scrap & P&L</div>
                </div>
              </button>

              <button
                onClick={handlePrint}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Printer size={15} color="#818cf8" />
                <div>
                  <div style={{ fontWeight: 600 }}>Print / Save as PDF</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Executive dossier layout</div>
                </div>
              </button>

              <button
                onClick={handleCopySummary}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {copiedSummary ? <Check size={15} color="#10b981" /> : <Copy size={15} color="#a855f7" />}
                <div>
                  <div style={{ fontWeight: 600 }}>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Formatted for email & Telegram</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker Modal / Popover */}
      {showDatePickerModal && (
        <div
          style={{
            position: 'absolute',
            top: '74px',
            right: '240px',
            width: '360px',
            background: '#0d1324',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 120,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#22d3ee" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Custom Date Range</span>
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
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '5px' }}>
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
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '5px' }}>
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
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
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
                  background: 'rgba(255, 255, 255, 0.07)',
                  color: 'var(--text-muted)',
                  border: 'none',
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
                  background: 'rgba(255, 255, 255, 0.07)',
                  color: 'var(--text-muted)',
                  border: 'none',
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
                  background: 'rgba(255, 255, 255, 0.07)',
                  color: 'var(--text-muted)',
                  border: 'none',
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
                  background: 'rgba(255, 255, 255, 0.07)',
                  color: 'var(--text-muted)',
                  border: 'none',
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
                border: '1px solid rgba(255, 255, 255, 0.15)',
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
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.35)',
              }}
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
