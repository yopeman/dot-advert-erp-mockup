'use client';

import React from 'react';
import {
  Cog,
  Clock,
  Boxes,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  User,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { WorkOrder, DesignProof } from '@/types/erp';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  designProof?: DesignProof;
  formatETB: (amount: number) => string;
  onAdvanceStatus: (woId: string, status: WorkOrder['status']) => void;
  onAddHours: (wo: WorkOrder) => void;
  onIssueBom: (wo: WorkOrder) => void;
  onLogScrap: (wo: WorkOrder) => void;
}

export default function WorkOrderCard({
  workOrder,
  designProof,
  formatETB,
  onAdvanceStatus,
  onAddHours,
  onIssueBom,
  onLogScrap,
}: WorkOrderCardProps) {
  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed & QC Passed', className: 'badge badge-emerald' };
      case 'quality_inspection':
        return { label: 'In Quality Inspection', className: 'badge badge-purple' };
      case 'in_progress':
        return { label: 'In Production / Fabrication', className: 'badge badge-amber' };
      case 'scheduled':
      default:
        return { label: 'Scheduled in Queue', className: 'badge badge-primary' };
    }
  };

  const statusBadge = getStatusBadge(workOrder.status);
  const totalBomCost = workOrder.bomItems.reduce((sum, b) => sum + b.totalCost, 0);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {workOrder.workOrderNumber}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Order: {workOrder.orderNumber}
            </span>
          </div>

          <span className={statusBadge.className}>{statusBadge.label}</span>
        </div>

        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '4px' }}>
          {workOrder.productDescription}
        </h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Customer: <strong style={{ color: 'var(--text-main)' }}>{workOrder.customerName}</strong>
        </div>
      </div>

      {/* Linked Design Proof Chip & Routing Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {designProof && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              color: '#c7d2fe',
            }}
          >
            <Sparkles size={12} color="#818cf8" />
            <span>
              Design: <strong>{designProof.designNumber}</strong> ({designProof.widthMeters}m × {designProof.heightMeters}m)
            </span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <Cog size={12} color="#38bdf8" />
          <span>Station: <strong>{workOrder.workCenterMachine}</strong></span>
        </div>

        {workOrder.targetWorkCenters && workOrder.targetWorkCenters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {workOrder.targetWorkCenters.map((wc, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-dim)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                {idx > 0 ? '→ ' : ''}{wc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Machine & Operator Hours */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          fontSize: '0.8rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Machine Runtime Logged</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
            {workOrder.machineHours} Hours
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
              {' '}(@ {formatETB(workOrder.machineHourlyRate)}/hr = {formatETB(workOrder.machineHours * workOrder.machineHourlyRate)})
            </span>
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Workshop Operators</div>
          <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
            {workOrder.operatorNames.join(', ')}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Output & Scrap Count</div>
          <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>
            <span style={{ color: '#34d399', fontWeight: 700 }}>{workOrder.actualGoodQty} Good</span> / {workOrder.plannedQty} Planned
            {workOrder.scrapQty > 0 && (
              <span style={{ color: '#fb7185', fontWeight: 700, marginLeft: '8px' }}>
                • {workOrder.scrapQty} Scrapped
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Item Bill of Materials (BOM) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bill of Materials (BOM) Allocated ({workOrder.bomItems.length} items)
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
            Subtotal: {formatETB(totalBomCost)}
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', textAlign: 'left', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '8px 12px' }}>Raw Material</th>
                <th style={{ padding: '8px 12px' }}>Planned</th>
                <th style={{ padding: '8px 12px' }}>Issued</th>
                <th style={{ padding: '8px 12px' }}>Unit Cost</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {workOrder.bomItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: idx < workOrder.bomItems.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{item.itemName}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{item.plannedQty} {item.unit}</td>
                  <td style={{ padding: '8px 12px', color: '#38bdf8', fontWeight: 600 }}>{item.actualIssuedQty || item.plannedQty} {item.unit}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{formatETB(item.unitCost)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>{formatETB(item.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Inspection Note if present */}
      {workOrder.qualityInspectionNotes && (
        <div
          style={{
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ color: '#c084fc', fontWeight: 600 }}>QC Sign-Off & Inspection ({workOrder.qualityInspector || 'Inspector'}): </span>
            <span style={{ color: '#f1f5f9' }}>{workOrder.qualityInspectionNotes}</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            onClick={() => onAddHours(workOrder)}
          >
            <Clock size={13} />
            <span>Log Hours</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            onClick={() => onIssueBom(workOrder)}
          >
            <Boxes size={13} />
            <span>Issue Material</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#fda4af', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            onClick={() => onLogScrap(workOrder)}
          >
            <Trash2 size={13} />
            <span>Log Scrap</span>
          </button>
        </div>

        {/* Stage Progression Workflow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {workOrder.status === 'scheduled' && (
            <button
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => onAdvanceStatus(workOrder.id, 'in_progress')}
            >
              <span>Start Production</span>
              <ArrowRight size={13} />
            </button>
          )}

          {workOrder.status === 'in_progress' && (
            <button
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#a855f7', borderColor: '#a855f7' }}
              onClick={() => onAdvanceStatus(workOrder.id, 'quality_inspection')}
            >
              <span>Send to Quality Inspection</span>
              <ArrowRight size={13} />
            </button>
          )}

          {workOrder.status === 'quality_inspection' && (
            <button
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#10b981', borderColor: '#10b981' }}
              onClick={() => onAdvanceStatus(workOrder.id, 'completed')}
            >
              <CheckCircle2 size={13} />
              <span>Sign Off & Complete Order</span>
            </button>
          )}

          {workOrder.status === 'completed' && (
            <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} />
              <span>Job Completed</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
