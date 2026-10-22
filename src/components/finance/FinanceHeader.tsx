'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  TrendingUp,
  RotateCcw,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Printer,
  DollarSign,
  PieChart,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { FinancePeriod } from '@/app/finance/page';

export default function FinanceHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { companyFinancials, resetDemoData } = useErp();

  const currentPeriod = (searchParams.get('period') as FinancePeriod) || 'monthly';
  const fromDate = searchParams.get('from') || '2026-10-01';
  const toDate = searchParams.get('to') || '2026-10-31';

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [customStart, setCustomStart] = useState(fromDate);
  const [customEnd, setCustomEnd] = useState(toDate);

  const setPeriod = (period: FinancePeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    if (period === 'custom') {
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

  const periodMultiplier = useMemo(() => {
    switch (currentPeriod) {
      case 'daily':
        return 1 / 26;
      case 'weekly':
        return 7 / 30;
      case 'quarterly':
        return 3.0;
      case 'half-yearly':
        return 6.0;
      case 'yearly':
        return 12.0;
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
  }, [currentPeriod, fromDate, toDate]);

  const netRevenue = Math.round(companyFinancials.totalRevenueNet * periodMultiplier);
  const grossProfit = Math.round(companyFinancials.grossProfit * periodMultiplier);
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const operatingIncome = Math.round(companyFinancials.operatingProfit * periodMultiplier);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <header
      style={{
        height: '68px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Breadcrumbs & Module Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.01em' }}>
                Corporate Finance & P&L Desk
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#854d0e',
                  background: '#fef9c3',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #fde047',
                  letterSpacing: '0.04em',
                }}
              >
                MODULE 6
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#09090b',
                  background: '#f4f4f5',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                }}
              >
                Audited Statements
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Dot Advert ERP • Executive P&L, Job Cost Rollup, Working Capital & MoR Filing
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Day / Period Selection Bar (matching ReportHeader) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#f8fafc',
          padding: '4px 6px',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
        }}
      >
        {(['daily', 'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'] as FinancePeriod[]).map((p) => {
          const isActive = currentPeriod === p;
          const label = p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: isActive ? '#09090b' : 'transparent',
                color: isActive ? '#facc15' : 'var(--text-muted)',
                border: 'none',
                padding: '5px 11px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          );
        })}

        <div style={{ width: '1px', height: '18px', background: 'var(--border-light)', margin: '0 4px' }} />

        {/* Custom Range Picker trigger */}
        <button
          onClick={() => setShowDatePickerModal(!showDatePickerModal)}
          style={{
            background: currentPeriod === 'custom' ? '#fef9c3' : '#ffffff',
            color: currentPeriod === 'custom' ? '#854d0e' : '#09090b',
            border: currentPeriod === 'custom' ? '1px solid #ca8a04' : '1px solid var(--border-light)',
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
          <Calendar size={13} color={currentPeriod === 'custom' ? '#854d0e' : '#ca8a04'} />
          <span>{currentPeriod === 'custom' ? `${fromDate} → ${toDate}` : 'Custom Range'}</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Right: Quick Action Controls & KPI Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Scaled KPI Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#f8fafc',
            padding: '6px 14px',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Revenue</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
              {formatETB(netRevenue)}
            </span>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'var(--border-light)' }} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Margin</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
              {grossMarginPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          <Printer size={14} />
          <span>Print</span>
        </button>

        {resetSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#16a34a',
              background: '#f0fdf4',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle2 size={13} />
            <span>Reset!</span>
          </div>
        )}

        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset Demo Data"
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 10px',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-light)',
          }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Custom Date Range Picker Modal / Popover */}
      {showDatePickerModal && (
        <div
          style={{
            position: 'absolute',
            top: '74px',
            right: '240px',
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
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09090b' }}>Custom Date Range</span>
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

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                }}
              >
                <RotateCcw size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>
                Reset Finance Demo Data?
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              This will restore all financial statements, order profitability records, expenses, and cash ledgers to their initial demo state.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleReset}
                style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
