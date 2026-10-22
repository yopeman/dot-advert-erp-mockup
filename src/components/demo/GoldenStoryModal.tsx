'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Boxes,
  ShoppingCart,
  Cog,
  Trash2,
  CheckCircle,
  Receipt,
  Wallet,
  TrendingUp,
  X,
} from 'lucide-react';

interface GoldenStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoldenStoryModal({ isOpen, onClose }: GoldenStoryModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: 1,
      title: 'Procure & Receive Raw Materials',
      icon: ShoppingCart,
      color: '#6366f1',
      moduleLink: '/inventory',
      moduleName: 'Procurement & POs',
      summary:
        'Purchase orders are raised for items like Glossy Vinyl and Acrylic Sheets from local suppliers with TIN tracking.',
      details: [
        'PO-2026-039 raised to Al-Sam Polytex Trading PLC for 500 sqm Vinyl @ 280 ETB.',
        'Goods inspected and received into Main Store with 15% input VAT recorded.',
        'Inventory ledger automatically registers incoming stock movements.',
      ],
      mockupHighlight: 'Check PO-2026-039 or the low-stock alert triggered on Black Pigment Ink.',
    },
    {
      stepNumber: 2,
      title: 'Customer Job & Work Order (BOM)',
      icon: Cog,
      color: '#3b82f6',
      moduleLink: '/orders',
      moduleName: 'Production & Work Orders',
      summary:
        'Awash Bank requests a 3D Illuminated Rooftop Signage (ORD-2026-081) for 480,000 ETB net.',
      details: [
        'A dedicated Work Order (WO-2026-081) is generated with standard Bill of Materials (BOM).',
        '6 Acrylic sheets, 380 LED modules, and 60m structural steel tubes allocated.',
        'Machine station & operators assigned (Laser cutter, Channel bender, 36 machine hours).',
      ],
      mockupHighlight: 'Open Order ORD-2026-081 to inspect the live production work order.',
    },
    {
      stepNumber: 3,
      title: 'Issue Materials & Log Production Wastage',
      icon: Trash2,
      color: '#f59e0b',
      moduleLink: '/inventory',
      moduleName: 'Inventory & Stores',
      summary:
        'Materials are transferred to the production floor; any cracked or scrap material is tracked.',
      details: [
        'Storekeeper issues 7 sheets of acrylic (1 sheet fractured during laser curve cutting).',
        'Wastage logged with reason "Production Scrap / Damaged" tagged directly to ORD-2026-081 (4,200 ETB cost).',
        'Wastage cost is factored directly into the job\'s cost ledger rather than buried in overhead.',
      ],
      mockupHighlight: 'Review the Wastage Ledger in the Inventory module.',
    },
    {
      stepNumber: 4,
      title: 'Complete Production & Dispatch',
      icon: CheckCircle,
      color: '#10b981',
      moduleLink: '/orders',
      moduleName: 'Production & Work Orders',
      summary:
        '3D Channel Letters are completed, QA-inspected, and transferred to Finished Goods for installation.',
      details: [
        'Production status updated to "Completed".',
        'Direct labor hours (36h × 120 ETB/hr = 8,640 ETB) and machine time (36h × 750 ETB/hr = 27,000 ETB) locked into order cost.',
        'Hydraulic crane & site scaffolding expense (16,000 ETB) linked to the job.',
      ],
      mockupHighlight: 'See how labor + machine + direct transport roll up automatically.',
    },
    {
      stepNumber: 5,
      title: 'Generate Official 15% VAT Invoice',
      icon: Receipt,
      color: '#a855f7',
      moduleLink: '/sales',
      moduleName: 'Sales & Invoicing',
      summary:
        'Commercial team generates an official Ethiopian VAT invoice with net revenue separation.',
      details: [
        'INV-2026-101 generated: Subtotal 480,000 ETB + 15% VAT (72,000 ETB) = 552,000 ETB Total.',
        'System strictly excludes the 72,000 ETB VAT from business revenue (treated as tax liability to Ministry of Revenues).',
        'Customer credit availability is updated in real time.',
      ],
      mockupHighlight: 'View the printable VAT invoice preview with tax computation & QR code.',
    },
    {
      stepNumber: 6,
      title: 'Collect Payment (Telebirr / Bank Transfer)',
      icon: Wallet,
      color: '#06b6d4',
      moduleLink: '/sales',
      moduleName: 'Collections & Credit',
      summary:
        'Cash is collected through modern payment channels: Telebirr, Chapa, or CBE Bank Transfer.',
      details: [
        'Awash Bank settles 432,000 ETB via CBE wire transfer (Receipt #RCPT-2026-052).',
        'Ride / Hybrid settles 212,750 ETB instantly via Telebirr (Receipt #RCPT-2026-051).',
        'Customer outstanding balance and credit limits automatically reconcile.',
      ],
      mockupHighlight: 'Open the Collections module to test receiving new Telebirr or Bank payments.',
    },
    {
      stepNumber: 7,
      title: 'Unveil Exact Order Profitability',
      icon: TrendingUp,
      color: '#10b981',
      moduleLink: '/orders',
      moduleName: 'Order Profitability',
      summary:
        'The ultimate destination: Factory management sees exactly what this job made down to the cent.',
      details: [
        'Net Revenue: 480,000 ETB',
        'Materials: 69,300 ETB | Labor: 8,640 ETB | Machine: 27,000 ETB | Waste: 4,200 ETB | Transport & Overhead: 41,200 ETB',
        'Total Order Cost: 150,340 ETB',
        'Net Profit: 329,660 ETB (68.7% Profit Margin!)',
      ],
      mockupHighlight: 'Inspect the Profitability Waterfall Card on any order!',
    },
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '820px', background: '#ffffff', border: '1px solid var(--border-light)' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#09090b',
                border: '1px solid #facc15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.25)',
              }}
            >
              <Sparkles size={18} color="#facc15" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#09090b', fontWeight: 800 }}>The Golden Demo Story</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                The complete end-to-end factory workflow from raw material to net order profit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '14px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            overflowX: 'auto',
            gap: '8px',
          }}
        >
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={s.stepNumber}
                onClick={() => setActiveStep(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: isActive ? '#fef9c3' : 'transparent',
                  border: isActive ? '1px solid #ca8a04' : '1px solid transparent',
                  color: isActive ? '#854d0e' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isActive ? '#09090b' : '#e4e4e7',
                    color: isActive ? '#facc15' : '#71717a',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.stepNumber}
                </span>
                <span>{s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#09090b',
                border: '1px solid #facc15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#facc15',
              }}
            >
              <StepIcon size={22} color="#facc15" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>
                Step {current.stepNumber} of 7
              </div>
              <h2 style={{ fontSize: '1.25rem', marginTop: '2px', color: '#09090b', fontWeight: 800 }}>{current.title}</h2>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#09090b', lineHeight: 1.6, marginBottom: '20px' }}>
            {current.summary}
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '10px',
                letterSpacing: '0.05em',
              }}
            >
              Operational Reality & Data Flow
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {current.details.map((detail, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.85rem',
                    color: '#09090b',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: '#ca8a04', fontWeight: 'bold' }}>•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              background: '#fef9c3',
              border: '1px dashed #ca8a04',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e' }}>
                Mockup Demo Highlight:
              </div>
              <div style={{ fontSize: '0.825rem', color: '#09090b', marginTop: '2px' }}>
                {current.mockupHighlight}
              </div>
            </div>

            <Link
              href={current.moduleLink}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#09090b',
                color: '#facc15',
                border: '1px solid #facc15',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Explore {current.moduleName}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border-light)' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            style={{ opacity: activeStep === 0 ? 0.4 : 1 }}
          >
            Previous Step
          </button>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Step {activeStep + 1} of {steps.length}
          </div>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep((prev) => prev + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                background: '#09090b',
                color: '#facc15',
                border: '1px solid #facc15',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>Next: Step {activeStep + 2}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '7px 16px',
                background: '#09090b',
                color: '#facc15',
                border: '1px solid #facc15',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Finish Walkthrough
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
