'use client';

import React, { useState } from 'react';
import { useErp } from '@/context/ErpDataContext';
import { ErpRole } from '@/types/erp';
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  UserCheck,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onOpenGoldenStory: () => void;
}

export default function Header({ onOpenGoldenStory }: HeaderProps) {
  const {
    currentRole,
    setCurrentRole,
    lowStockItems,
    invoices,
    resetDemoData,
  } = useErp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const unpaidInvoices = invoices.filter((i) => i.paymentStatus !== 'paid');

  const roleLabels: Record<ErpRole, { label: string; icon: string }> = {
    general_manager: { label: 'General Manager (Full Access)', icon: '👑' },
    storekeeper: { label: 'Inventory / Storekeeper', icon: '📦' },
    production_supervisor: { label: 'Production Supervisor', icon: '⚙️' },
    accountant_cashier: { label: 'Accountant & Billing Cashier', icon: '🧾' },
    sales_rep: { label: 'Commercial Sales Rep', icon: '💼' },
    procurement_officer: { label: 'Procurement Officer', icon: '🛒' },
    machine_operator: { label: 'Machine Operator', icon: '🔧' },
    hr_officer: { label: 'HR & Payroll Officer', icon: '👥' },
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
        background: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Organization & Currency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }}
          />
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Dot Advert & Print Solutions PLC
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            Addis Ababa • ETB (15% VAT)
          </span>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Guided Story, Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Low Stock Warning Pill */}
        {lowStockItems.length > 0 && (
          <div
            className="badge badge-amber"
            style={{ cursor: 'pointer', padding: '5px 12px' }}
            title={`${lowStockItems.length} items below reorder threshold`}
          >
            <AlertTriangle size={13} />
            <span>{lowStockItems.length} Low Stock Alert</span>
          </div>
        )}

        {/* Unpaid Invoices Pill */}
        {unpaidInvoices.length > 0 && (
          <div
            className="badge badge-rose"
            style={{ cursor: 'pointer', padding: '5px 12px' }}
            title={`${unpaidInvoices.length} invoices pending payment`}
          >
            <Layers size={13} />
            <span>{unpaidInvoices.length} Invoices Due</span>
          </div>
        )}

        {/* Persona / Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as ErpRole)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              color: '#a5b4fc',
              cursor: 'pointer',
            }}
          >
            {Object.entries(roleLabels).map(([roleKey, meta]) => (
              <option key={roleKey} value={roleKey}>
                {meta.icon} {meta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Golden Story Walkthrough CTA */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenGoldenStory}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.35)',
          }}
        >
          <Sparkles size={14} />
          <span>The Golden Demo Story</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowResetConfirm(true)}
          title="Restore original factory demo dataset"
        >
          <RotateCcw size={13} />
          <span>Reset Demo</span>
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
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  This will restore all pre-seeded Ethiopian demo records (Awash Bank, Ethiopian
                  Airlines, materials, 15% VAT invoices, and stock levels) to their default pristine
                  state.
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
                  className="btn btn-danger btn-sm"
                  onClick={handleReset}
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Toast */}
        {resetSuccess && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#064e3b',
              border: '1px solid #059669',
              color: '#a7f3d0',
              padding: '12px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
            }}
          >
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Demo dataset restored to original state!
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
