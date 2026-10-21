'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  TrendingUp,
  Ruler,
  UserCheck,
  LayoutDashboard,
  LayoutGrid,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function CrmHeader() {
  const { leads, customers, resetDemoData } = useErp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const activeLeads = leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won');
  const totalSurveysCount =
    leads.reduce((sum, l) => sum + (l.siteSurveys?.length || (l.siteSurvey ? 1 : 0)), 0) +
    customers.reduce((sum, c) => sum + (c.siteSurveys?.length || 0), 0);
  const totalPipelineValue = activeLeads.reduce((sum, l) => sum + l.estimatedBudget, 0);

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
        background: 'rgba(12, 19, 34, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: CRM Division Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#06b6d4',
              boxShadow: '0 0 10px #06b6d4',
            }}
          />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Dot Advert CRM Desk
            </div>
            <div style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
              Commercial Pipeline • Site Surveys • Customer Accounts
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          Addis Ababa • ETB
        </span>
      </div>

      {/* Right Controls: Live Pipeline Metric, Back to ERP, Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live Pipeline Value Pill */}
        <div
          className="badge badge-indigo"
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
          }}
          title="Total open pipeline value"
        >
          <TrendingUp size={13} />
          <span>Pipeline: {formatETB(totalPipelineValue)}</span>
        </div>

        {/* Surveys Count Pill */}
        <div
          className="badge badge-cyan"
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
          }}
          title="Active facade site surveys"
        >
          <Ruler size={13} />
          <span>{totalSurveysCount} Sign Surveys</span>
        </div>

        {/* Commercial Sales Officer Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px',
            fontSize: '0.78rem',
            color: '#a5b4fc',
            fontWeight: 600,
          }}
        >
          <UserCheck size={14} color="#818cf8" />
          <span>Sales & Accounts Lead</span>
        </div>

        {/* Return to Main ERP Dashboard */}
        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
          }}
          title="Return to Executive ERP Dashboard"
        >
          <LayoutDashboard size={14} />
          <span>Main ERP</span>
        </Link>

        {/* Modules Directory Hub */}
        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
          }}
          title="View all 8 ERP modules"
        >
          <LayoutGrid size={14} />
          <span>Modules</span>
        </Link>

        {/* Reset Demo Data */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowResetConfirm(true)}
          title="Restore factory demo dataset"
          style={{ padding: '7px 10px' }}
        >
          <RotateCcw size={13} />
        </button>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '440px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RotateCcw size={20} color="var(--amber)" />
                  <h3>Reset Mock Database?</h3>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '16px 0' }}>
                This will reset all CRM leads, customer records, and ERP datasets back to initial factory demo values.
              </p>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleReset}
                  style={{ background: 'var(--amber)', color: '#000' }}
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Success Toast */}
        {resetSuccess && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '32px',
              background: '#065f46',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Database restored to factory state!</span>
          </div>
        )}
      </div>
    </header>
  );
}
