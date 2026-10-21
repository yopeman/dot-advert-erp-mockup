'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { DesignProof } from '@/types/erp';

interface RequestRevisionModalProps {
  proof: DesignProof | null;
  onClose: () => void;
  onConfirmRevision: (proofId: string, feedbackNotes: string) => void;
}

export default function RequestRevisionModal({
  proof,
  onClose,
  onConfirmRevision,
}: RequestRevisionModalProps) {
  const [feedbackNotes, setFeedbackNotes] = useState('');

  if (!proof) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes.trim()) return;
    onConfirmRevision(proof.id, feedbackNotes.trim());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', width: '95%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#f43f5e" />
            <h3 style={{ color: '#ffffff' }}>Request Artwork Revision</h3>
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
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.8rem',
              }}
            >
              <div><strong>Design:</strong> {proof.designNumber} — {proof.title}</div>
              <div><strong>Client:</strong> {proof.customerName}</div>
              <div><strong>Current Version:</strong> v{proof.revisionCount}</div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Feedback & Requested Changes *</label>
              <textarea
                rows={4}
                className="form-textarea"
                placeholder="Detail what needs to be changed (e.g. increase letter kerning by 15mm, adjust Pantone color to 151C, swap logo positioning, extend bleed margin for wrapping...)"
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                required
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
              style={{ background: '#f43f5e', borderColor: '#f43f5e', color: '#ffffff' }}
            >
              <AlertTriangle size={14} />
              <span>Submit Revision Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
