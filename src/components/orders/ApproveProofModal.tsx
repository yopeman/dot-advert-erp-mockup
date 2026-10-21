'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Ruler, Calendar } from 'lucide-react';
import { DesignProof } from '@/types/erp';

interface ApproveProofModalProps {
  proof: DesignProof | null;
  onClose: () => void;
  onConfirmApprove: (proofId: string, approverName: string, notes: string) => void;
}

export default function ApproveProofModal({
  proof,
  onClose,
  onConfirmApprove,
}: ApproveProofModalProps) {
  const [approverName, setApproverName] = useState(proof?.clientContactPerson || '');
  const [approvalNotes, setApprovalNotes] = useState(
    'Dimensions, colors, and layout verified and approved for printing and structural fabrication.'
  );

  if (!proof) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverName.trim()) return;
    onConfirmApprove(proof.id, approverName.trim(), approvalNotes.trim());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', width: '95%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ color: '#ffffff' }}>Client Sign-Off & Production Unlock</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Banner */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '0.825rem',
                color: '#a7f3d0',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Approving this artwork signs off on <strong>{proof.widthMeters}m × {proof.heightMeters}m</strong> dimensions and authorizes the workshop to issue raw materials and queue large-format printing & fabrication.
              </div>
            </div>

            {/* Target Deal Details */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div><strong>Design:</strong> {proof.designNumber} — {proof.title}</div>
              <div><strong>Client:</strong> {proof.customerName} ({proof.orderNumber})</div>
              <div><strong>Material:</strong> {proof.materialSpec}</div>
            </div>

            {/* Approver Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Authorized Client Approver *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Abebe Kebede (Facility Director)"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                required
              />
            </div>

            {/* Approval Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Approval Sign-Off Notes</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ background: '#10b981', borderColor: '#10b981', color: '#ffffff' }}
            >
              <CheckCircle2 size={14} />
              <span>Confirm Artwork Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
