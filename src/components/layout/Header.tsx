'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import { ErpRole } from '@/types/erp';
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  UserCheck,
  LayoutGrid,
  LayoutDashboard,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onOpenGoldenStory: () => void;
}

export default function Header({ onOpenGoldenStory }: HeaderProps) {
  const pathname = usePathname();
  const isNoSidebarPage = pathname === '/' || pathname === '/modules' || pathname === '/forms';
  const isHr = pathname?.startsWith('/hr') || pathname?.startsWith('/inventory');

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
    super_admin: { label: 'Super Admin (System Governance)', icon: '⚡' },
    admin: { label: 'Admin (Operations & Compliance)', icon: '🛡️' },
    hr_manager: { label: 'HR Manager (Workforce Hub)', icon: '👔' },
    employee: { label: 'Staff Employee (Self-Service)', icon: '👤' },
    general_manager: { label: 'General Manager (Full Access)', icon: '👑' },
    hr_officer: { label: 'HR & Payroll Officer', icon: '👥' },
    storekeeper: { label: 'Inventory / Storekeeper', icon: '📦' },
    production_supervisor: { label: 'Production Supervisor', icon: '⚙️' },
    accountant_cashier: { label: 'Accountant & Billing Cashier', icon: '🧾' },
    sales_rep: { label: 'Commercial Sales Rep', icon: '💼' },
    procurement_officer: { label: 'Procurement Officer', icon: '🛒' },
    machine_operator: { label: 'Machine Operator', icon: '🔧' },
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <header
      className="global-app-header"
      style={{
        height: '68px',
        background: '#ffffff',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e4e4e7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(10, 10, 10, 0.04)',
      }}
    >
      {/* Left: Organization & Currency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 0 }}>
        {isNoSidebarPage ? (
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            title="Dot Advert ERP Home"
          >
            <BrandLogo size={32} radius={8} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#09090b', lineHeight: 1.1 }}>
                DOT ADVERT
              </div>
              <div className="header-subtitle" style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ca8a04', letterSpacing: '0.08em' }}>
                SYSTEM DIRECTORY
              </div>
            </div>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#facc15',
                boxShadow: '0 0 8px rgba(250, 204, 21, 0.8)',
              }}
            />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#09090b' }}>
              Dot Advert & Print Solutions PLC
            </span>
          </div>
        )}

        <span
          className="header-currency-pill"
          style={{
            fontSize: '0.7rem',
            color: '#71717a',
            background: '#f4f4f5',
            border: '1px solid #e4e4e7',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Addis Ababa • ETB (15% VAT)
        </span>
      </div>

      {/* Right Controls: Role Switcher, Guided Story, Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Low Stock Warning Pill */}
        {lowStockItems.length > 0 && (
          <div
            className="badge badge-amber"
            style={{ cursor: 'pointer', padding: '5px 10px', whiteSpace: 'nowrap' }}
            title={`${lowStockItems.length} items below reorder threshold`}
          >
            <AlertTriangle size={13} />
            <span className="badge-text">{lowStockItems.length} Low Stock</span>
          </div>
        )}

        {/* Unpaid Invoices Pill */}
        {unpaidInvoices.length > 0 && (
          <div
            className="badge badge-rose"
            style={{ cursor: 'pointer', padding: '5px 10px', whiteSpace: 'nowrap' }}
            title={`${unpaidInvoices.length} invoices pending payment`}
          >
            <Layers size={13} />
            <span className="badge-text">{unpaidInvoices.length} Due</span>
          </div>
        )}

        {/* Persona / Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={15} color="#71717a" className="role-icon" />
          <select
            className="form-select header-role-select"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as ErpRole)}
            style={{
              padding: '5px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: '#ffffff',
              border: '1px solid #d4d4d8',
              borderRadius: 'var(--radius-md)',
              color: '#09090b',
              cursor: 'pointer',
              maxWidth: '160px',
            }}
          >
            {Object.entries(roleLabels).map(([roleKey, meta]) => (
              <option key={roleKey} value={roleKey}>
                {meta.icon} {meta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Return to Modules Directory link when on child module pages */}
        {!isNoSidebarPage && (
          <Link
            href="/"
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Browse all 8 modules and operational forms"
          >
            <LayoutGrid size={14} />
            <span className="btn-text">Modules Directory</span>
          </Link>
        )}

        {/* Golden Story Walkthrough CTA */}
        <button
          className="btn btn-primary btn-sm header-story-btn"
          onClick={onOpenGoldenStory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
          title="The Golden Demo Story"
        >
          <Sparkles size={14} />
          <span className="btn-text">Demo Story</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          className="btn btn-secondary btn-sm header-reset-btn"
          onClick={() => setShowResetConfirm(true)}
          title="Restore original factory demo dataset"
        >
          <RotateCcw size={13} />
          <span className="btn-text">Reset</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .global-app-header {
            padding: 0 12px !important;
            height: 60px !important;
          }
          .header-currency-pill {
            display: none !important;
          }
          .header-subtitle {
            display: none !important;
          }
          .badge-text {
            display: none !important;
          }
          .header-role-select {
            max-width: 110px !important;
            padding: 4px 6px !important;
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 520px) {
          .role-icon {
            display: none !important;
          }
          .btn-text {
            display: none !important;
          }
          .header-story-btn, .header-reset-btn {
            padding: 6px 8px !important;
          }
        }
      `}</style>

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
    </header>
  );
}
