'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  Cog,
  Palette,
  Boxes,
  LayoutDashboard,
  LayoutGrid,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function OrdersHeader() {
  const { orders, workOrders, designProofs, resetDemoData } = useErp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const activeOrders = orders.filter((o) => o.status === 'in_production' || o.status === 'pending');
  const approvedDesigns = designProofs.filter((d) => d.status === 'approved').length;
  const pendingProofs = designProofs.filter((d) => d.status === 'client_proofing').length;
  const inProgressWOs = workOrders.filter((w) => w.status === 'in_progress').length;

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
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0284c7 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Cog size={17} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Order & Production Desk
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  letterSpacing: '0.04em',
                }}
              >
                MODULE 2
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Dot Advert ERP • Large-Format Printing, Fabrication & Cost Rollup
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Live Stats Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          <Boxes size={14} color="#818cf8" />
          <span style={{ color: 'var(--text-dim)' }}>Jobs:</span>
          <strong style={{ color: '#ffffff' }}>{orders.length}</strong>
        </div>

        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          <Palette size={14} color="#c084fc" />
          <span style={{ color: 'var(--text-dim)' }}>Proofs:</span>
          <strong style={{ color: '#c084fc' }}>{approvedDesigns}/{designProofs.length}</strong>
          {pendingProofs > 0 && (
            <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>
              ({pendingProofs} awaiting)
            </span>
          )}
        </div>

        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          <Cog size={14} color="#38bdf8" />
          <span style={{ color: 'var(--text-dim)' }}>Active WOs:</span>
          <strong style={{ color: '#38bdf8' }}>{inProgressWOs} in hall</strong>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.75rem',
            padding: '6px 12px',
            color: 'var(--text-muted)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
          title="Reset sample order and proof data to factory initial defaults"
        >
          <RotateCcw size={13} />
          <span>Reset Demo</span>
        </button>

        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
        >
          <LayoutGrid size={13} />
          <span>Modules</span>
        </Link>

        <Link
          href="/dashboard"
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
        >
          <LayoutDashboard size={13} />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color="#f43f5e" />
                <h3>Reset Demo Data?</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This will reset all orders, graphic design proofs, production work orders, and BOM movements back to Ethiopian advertising initial mock data.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ background: '#f43f5e', borderColor: '#f43f5e' }}
                onClick={handleReset}
              >
                Reset All Demo Data
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
            bottom: '24px',
            right: '24px',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            zIndex: 9999,
          }}
        >
          <CheckCircle2 size={16} />
          <span>Orders and production data reset to initial factory demo state!</span>
        </div>
      )}
    </header>
  );
}
