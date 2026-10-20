'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  Receipt,
  RotateCcw,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export default function SalesHeader() {
  const { invoices, companyFinancials, resetDemoData } = useErp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const totalOutstandingBalance = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

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
        background: 'rgba(14, 17, 29, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
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
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(168, 85, 247, 0.3)',
            }}
          >
            <Receipt size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Sales & Tax Invoicing Desk
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#c084fc',
                  background: 'rgba(192, 132, 252, 0.15)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  letterSpacing: '0.04em',
                }}
              >
                MODULE 3
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                15% VAT / Non-VAT MoR
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Dot Advert ERP • Proformas, Tax Invoices, AR Aging & Ministry of Revenues Register
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
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '6px 18px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={14} color="#818cf8" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1 }}>Net Revenue</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
              {formatETB(companyFinancials.totalRevenueNet)}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="#c084fc" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1 }}>Output VAT (15%)</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>
              {formatETB(companyFinancials.totalOutputVat)}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={14} color="#fbbf24" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1 }}>Outstanding AR</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
              {formatETB(totalOutstandingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          href="/dashboard/collections"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          <CreditCard size={14} />
          <span>Collections</span>
        </Link>

        {resetSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
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
            color: 'var(--text-dim)',
            border: '1px solid var(--border-subtle)',
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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#0e111d',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <RotateCcw size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Reset Sales Demo Data?
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              This will restore all sales invoices, proformas, customer balances, and tax registers to their original demo state.
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
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
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
