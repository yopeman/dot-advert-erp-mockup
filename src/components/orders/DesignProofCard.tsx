'use client';

import React from 'react';
import {
  Palette,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Eye,
  Ruler,
  Layers,
  Sparkles,
  User,
  ExternalLink,
} from 'lucide-react';
import { DesignProof, DesignStatus } from '@/types/erp';

interface DesignProofCardProps {
  proof: DesignProof;
  onViewSpecs: (proof: DesignProof) => void;
  onApprove: (proof: DesignProof) => void;
  onRequestRevision: (proof: DesignProof) => void;
}

export const getStatusBadge = (status: DesignStatus) => {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved for Production',
        className: 'badge badge-emerald',
        icon: <CheckCircle2 size={12} color="#10b981" />,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 30, 51, 0.95) 100%)',
      };
    case 'client_proofing':
      return {
        label: 'Awaiting Client Sign-Off',
        className: 'badge badge-amber',
        icon: <Clock size={12} color="#f59e0b" />,
        borderColor: 'rgba(245, 158, 11, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(20, 30, 51, 0.95) 100%)',
      };
    case 'revision_requested':
      return {
        label: 'Revision Requested',
        className: 'badge badge-rose',
        icon: <AlertTriangle size={12} color="#f43f5e" />,
        borderColor: 'rgba(244, 63, 94, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(20, 30, 51, 0.95) 100%)',
      };
    case 'drafting':
    default:
      return {
        label: 'Drafting / CAD In Progress',
        className: 'badge badge-primary',
        icon: <Palette size={12} color="#818cf8" />,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(20, 30, 51, 0.95) 100%)',
      };
  }
};

export default function DesignProofCard({
  proof,
  onViewSpecs,
  onApprove,
  onRequestRevision,
}: DesignProofCardProps) {
  const statusInfo = getStatusBadge(proof.status);

  return (
    <div
      style={{
        background: statusInfo.bgGradient,
        border: `1px solid ${statusInfo.borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • {proof.orderNumber}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={statusInfo.className} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              v{proof.revisionCount}
            </span>
          </div>
        </div>

        {/* Title & Customer */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.35,
            marginBottom: '4px',
          }}
        >
          {proof.title}
        </h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Client: <strong style={{ color: 'var(--text-main)' }}>{proof.customerName}</strong>
        </div>

        {/* Visual Mockup Card Preview */}
        <div
          onClick={() => onViewSpecs(proof)}
          style={{
            height: '135px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            marginBottom: '14px',
            border: '1px solid var(--border-subtle)',
            background: proof.mockupUrl
              ? `linear-gradient(to top, rgba(9, 13, 22, 0.85) 0%, transparent 60%), url('${proof.mockupUrl}') center/cover no-repeat`
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          }}
        >
          {/* Mockup Overlay Badges */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(4px)',
                color: '#38bdf8',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 7px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {proof.colorProfile} • {proof.resolutionDpi} DPI
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Ruler size={11} color="#34d399" />
              <span>
                {proof.widthMeters}m × {proof.heightMeters}m
                {proof.depthCm ? ` • ${proof.depthCm}cm deep` : ''}
              </span>
            </span>
          </div>
        </div>

        {/* Technical Specs & Material */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: '14px',
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <Layers size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Material Spec: </span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{proof.materialSpec}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={13} color="var(--text-dim)" />
            <span style={{ color: 'var(--text-dim)' }}>Designer: </span>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{proof.designerName}</span>
          </div>

          {proof.clientFeedback && (
            <div
              style={{
                marginTop: '4px',
                paddingTop: '6px',
                borderTop: '1px solid var(--border-subtle)',
                color: proof.status === 'revision_requested' ? '#fca5a5' : '#a7f3d0',
                fontSize: '0.75rem',
                lineHeight: 1.4,
              }}
            >
              <strong>{proof.status === 'revision_requested' ? 'Revision Note: ' : 'Client Feedback: '}</strong>
              &ldquo;{proof.clientFeedback}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
          onClick={() => onViewSpecs(proof)}
        >
          <Eye size={13} />
          <span>Inspect Specs</span>
        </button>

        {proof.status !== 'approved' && (
          <>
            <button
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '6px 10px',
                color: '#fda4af',
                borderColor: 'rgba(244, 63, 94, 0.3)',
              }}
              onClick={() => onRequestRevision(proof)}
            >
              <AlertTriangle size={13} />
              <span>Revise</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                background: '#10b981',
                borderColor: '#10b981',
                color: '#ffffff',
                fontWeight: 600,
              }}
              onClick={() => onApprove(proof)}
            >
              <CheckCircle2 size={13} />
              <span>Sign Off & Approve</span>
            </button>
          </>
        )}

        {proof.status === 'approved' && proof.approvedBy && (
          <div
            style={{
              fontSize: '0.72rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: 'auto',
            }}
          >
            <CheckCircle2 size={13} />
            <span>Approved by {proof.approvedBy} on {proof.approvedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
