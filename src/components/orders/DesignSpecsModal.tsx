'use client';

import React from 'react';
import {
  X,
  Palette,
  CheckCircle2,
  Clock,
  Ruler,
  Layers,
  FileText,
  User,
  History,
  AlertTriangle,
} from 'lucide-react';
import { DesignProof } from '@/types/erp';
import { getStatusBadge } from './DesignProofCard';

interface DesignSpecsModalProps {
  proof: DesignProof | null;
  onClose: () => void;
  onApprove: (proof: DesignProof) => void;
  onRequestRevision: (proof: DesignProof) => void;
}

export default function DesignSpecsModal({
  proof,
  onClose,
  onApprove,
  onRequestRevision,
}: DesignSpecsModalProps) {
  if (!proof) return null;

  const statusInfo = getStatusBadge(proof.status);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#818cf8',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {proof.designNumber}
              </span>
              <span className={statusInfo.className}>{statusInfo.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Linked Order: <strong>{proof.orderNumber}</strong>
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>{proof.title}</h3>
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

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual Artwork Showcase */}
          <div
            style={{
              width: '100%',
              height: '240px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-medium)',
              position: 'relative',
              overflow: 'hidden',
              background: proof.mockupUrl
                ? `linear-gradient(to top, rgba(9, 13, 22, 0.9) 0%, transparent 60%), url('${proof.mockupUrl}') center/cover no-repeat`
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <span
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(6px)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {proof.colorProfile} • {proof.resolutionDpi} DPI
              </span>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.85)',
                  backdropFilter: 'blur(6px)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Ruler size={14} color="#34d399" />
                <span>
                  Physical Dimensions: {proof.widthMeters}m Wide × {proof.heightMeters}m High
                  {proof.depthCm ? ` • ${proof.depthCm}cm 3D Depth` : ''}
                </span>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#a7f3d0',
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                Total Area: {(proof.widthMeters * proof.heightMeters).toFixed(2)} m²
              </span>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Technical Fabrication Parameters
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Material Specification</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {proof.materialSpec}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Color Mode & Standard</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}>
                  {proof.colorProfile} (Calibrated for Roland & Mutoh Printers)
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Graphic Artist / Drafter</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', marginTop: '2px' }}>
                  {proof.designerName}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Client Sign-Off Contact</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {proof.clientContactPerson || 'Primary Account Manager'}
                </div>
              </div>
            </div>
          </div>

          {/* Client Feedback & Revision History Trail */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <History size={15} color="#818cf8" />
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Artwork Revision History & Audit Trail ({proof.revisions.length} iterations)
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {proof.revisions.map((rev) => {
                const isRevApproved = rev.status === 'approved';
                const isRevRequested = rev.status === 'revision_requested';

                return (
                  <div
                    key={rev.id}
                    style={{
                      background: isRevApproved
                        ? 'rgba(16, 185, 129, 0.06)'
                        : isRevRequested
                        ? 'rgba(244, 63, 94, 0.06)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isRevApproved
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : isRevRequested
                        ? '1px solid rgba(244, 63, 94, 0.25)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isRevApproved ? '#34d399' : isRevRequested ? '#fda4af' : '#a5b4fc',
                          }}
                        >
                          Revision v{rev.versionNumber}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          • Logged by {rev.authorName} on {rev.date}
                        </span>
                      </div>
                      <span
                        className={`badge ${
                          isRevApproved
                            ? 'badge-emerald'
                            : isRevRequested
                            ? 'badge-rose'
                            : 'badge-amber'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {rev.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                      {rev.notes}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Inspector
          </button>

          {proof.status !== 'approved' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ color: '#fda4af', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                onClick={() => {
                  onClose();
                  onRequestRevision(proof);
                }}
              >
                <AlertTriangle size={13} />
                <span>Request Revision</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ background: '#10b981', borderColor: '#10b981', color: '#ffffff' }}
                onClick={() => {
                  onClose();
                  onApprove(proof);
                }}
              >
                <CheckCircle2 size={14} />
                <span>Sign Off Artwork & Unlock Production</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
