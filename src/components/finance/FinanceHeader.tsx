'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function FinanceHeader() {
  const { companyFinancials, resetDemoData } = useErp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const netRevenue = companyFinancials.totalRevenueNet;
  const grossProfit = companyFinancials.grossProfit;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const operatingIncome = companyFinancials.operatingProfit;

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

      {/* Middle: Live Stats Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: '#f8fafc',
          padding: '6px 20px',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={14} color="#71717a" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>Net Revenue</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
              {formatETB(netRevenue)}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={14} color="#ca8a04" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>Gross Profit ({grossMarginPct.toFixed(0)}%)</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ca8a04', fontFamily: 'monospace' }}>
              {formatETB(grossProfit)}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={14} color="#16a34a" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>Operating Income</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
              {formatETB(operatingIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => window.print()}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          <Printer size={14} />
          <span>Print Statement</span>
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
