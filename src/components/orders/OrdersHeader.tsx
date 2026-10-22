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
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: '#09090b',
              border: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            }}
          >
            <Cog size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Order & Production Desk
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
                MODULE 2
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          <Boxes size={14} color="#71717a" />
          <span style={{ color: 'var(--text-muted)' }}>Jobs:</span>
          <strong style={{ color: '#09090b', fontWeight: 700 }}>{orders.length}</strong>
        </div>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-light)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          <Palette size={14} color="#ca8a04" />
          <span style={{ color: 'var(--text-muted)' }}>Proofs:</span>
          <strong style={{ color: '#854d0e', fontWeight: 700 }}>{approvedDesigns}/{designProofs.length}</strong>
          {pendingProofs > 0 && (
            <span style={{ fontSize: '0.65rem', color: '#b45309', fontWeight: 700, background: '#fef3c7', padding: '1px 5px', borderRadius: '4px' }}>
              ({pendingProofs} awaiting)
            </span>
          )}
        </div>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-light)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          <Cog size={14} color="#09090b" />
          <span style={{ color: 'var(--text-muted)' }}>Active WOs:</span>
          <strong style={{ color: '#09090b', fontWeight: 700 }}>{inProgressWOs} in hall</strong>
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
