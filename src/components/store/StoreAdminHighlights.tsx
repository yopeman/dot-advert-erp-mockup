'use client';

import React from 'react';
import {
  StoreApprovalRequest,
  StoreAuditEvent,
  StoreNotification,
  StorePriority,
  StoreRequestType,
} from '@/types/store';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react';

const C = {
  black: '#09090b',
  blackSoft: '#18181b',
  yellow: '#facc15',
  yellowDeep: '#ca8a04',
  white: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  dim: '#94a3b8',
  green: '#10b981',
  greenBg: '#ecfdf5',
  red: '#e11d48',
  redBg: '#fff1f2',
  amber: '#f59e0b',
  amberBg: '#fffbeb',
  blue: '#3b82f6',
  blueBg: '#eff6ff',
  violet: '#8b5cf6',
};

const NOW_MS = new Date('2026-10-21T14:00:00').getTime();

const TYPE_META: Record<StoreRequestType, { label: string; short: string; color: string; bg: string }> = {
  goods_receipt: { label: 'Goods Receipt', short: 'GRN', color: '#047857', bg: '#ecfdf5' },
  material_issue: { label: 'Material Issue', short: 'ISSUE', color: '#1d4ed8', bg: '#eff6ff' },
  staff_requisition: { label: 'Staff Requisition', short: 'STAFF', color: '#0369a1', bg: '#f0f9ff' },
  staff_return: { label: 'Staff Item Return', short: 'RETURN', color: '#0e7490', bg: '#ecfeff' },
  inter_store_transfer: { label: 'Inter-Store Transfer', short: 'TRANSFER', color: '#6d28d9', bg: '#f5f3ff' },
  stock_adjustment: { label: 'Stock Adjustment', short: 'ADJUST', color: '#b45309', bg: '#fffbeb' },
  cycle_count: { label: 'Cycle Count', short: 'COUNT', color: '#0f766e', bg: '#f0fdfa' },
  wastage: { label: 'Wastage / Scrap', short: 'WASTE', color: '#be123c', bg: '#fff1f2' },
  supplier_return: { label: 'Supplier Return', short: 'RETURN', color: '#be185d', bg: '#fdf2f8' },
  reorder_request: { label: 'Reorder Request', short: 'REORDER', color: '#a16207', bg: '#fefce8' },
  item_onboarding: { label: 'SKU Onboarding', short: 'NEW SKU', color: '#334155', bg: '#f1f5f9' },
};

const PRIORITY_META: Record<StorePriority, { label: string; color: string; bg: string; rank: number }> = {
  critical: { label: 'Critical', color: C.red, bg: C.redBg, rank: 3 },
  high: { label: 'High', color: '#b45309', bg: C.amberBg, rank: 2 },
  normal: { label: 'Normal', color: '#475569', bg: '#f1f5f9', rank: 1 },
};

function formatETB(amount: number) {
  return `ETB ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}

function formatDateTime(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()} • ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function hoursPending(request: StoreApprovalRequest) {
  return Math.max(0, (NOW_MS - new Date(request.requestedAt).getTime()) / 3600000);
}

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: 6,
        background: bg,
        color,
        border: `1px solid ${color}33`,
        fontSize: '0.62rem',
        fontWeight: 900,
        letterSpacing: '0.035em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function Progress({ pct, color = C.black, height = 7 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ height, borderRadius: height, background: '#eef2f6', overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          height: '100%',
          borderRadius: height,
          background: color,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

interface StoreAdminHighlightsProps {
  requests: StoreApprovalRequest[];
  auditEvents: StoreAuditEvent[];
  notifications: StoreNotification[];
  isAdmin: boolean;
  onDecision: (request: StoreApprovalRequest, action: 'approved' | 'rejected') => void;
  onOpenApprovals: () => void;
  onOpenNotifications: () => void;
}

export default function StoreAdminHighlights({
  requests,
  auditEvents,
  notifications,
  isAdmin,
  onDecision,
  onOpenApprovals,
  onOpenNotifications,
}: StoreAdminHighlightsProps) {
  const pending = requests.filter((request) => request.status === 'pending_admin');
  const approved = requests.filter((request) => request.status === 'approved');
  const rejected = requests.filter((request) => request.status === 'rejected');
  const pendingValue = pending.reduce((sum, request) => sum + request.totalValue, 0);
  const decidedCount = approved.length + rejected.length;
  const approvalRate = decidedCount ? (approved.length / decidedCount) * 100 : 100;
  const slaBreaches = pending.filter((request) => hoursPending(request) > request.slaHours);
  const criticalActions = pending.filter((request) => request.priority === 'critical');
  const adminNotifications = notifications.filter((notification) => notification.audience === 'admin' || notification.audience === 'all');
  const unreadAdmin = adminNotifications.filter((notification) => !notification.read);

  const decisionHours = requests
    .filter((request) => request.approvedAt && (request.status === 'approved' || request.status === 'rejected'))
    .map((request) => Math.max(0, (new Date(request.approvedAt as string).getTime() - new Date(request.requestedAt).getTime()) / 3600000));
  const averageDecisionHours = decisionHours.length
    ? decisionHours.reduce((sum, hours) => sum + hours, 0) / decisionHours.length
    : 0;

  const donutTotal = pending.length + approved.length + rejected.length || 1;
  const pendingPct = (pending.length / donutTotal) * 100;
  const approvedPct = (approved.length / donutTotal) * 100;
  const rejectedPct = (rejected.length / donutTotal) * 100;
  const donutBackground = `conic-gradient(${C.amber} 0 ${pendingPct}%, ${C.green} ${pendingPct}% ${pendingPct + approvedPct}%, ${C.red} ${pendingPct + approvedPct}% ${pendingPct + approvedPct + rejectedPct}%)`;

  const actionStreams = (Object.keys(TYPE_META) as StoreRequestType[])
    .map((type) => {
      const stream = requests.filter((request) => request.type === type);
      return {
        type,
        meta: TYPE_META[type],
        total: stream.length,
        pending: stream.filter((request) => request.status === 'pending_admin').length,
        approved: stream.filter((request) => request.status === 'approved').length,
        rejected: stream.filter((request) => request.status === 'rejected').length,
        value: stream.reduce((sum, request) => sum + request.totalValue, 0),
      };
    })
    .sort((a, b) => b.pending - a.pending || b.value - a.value);

  const spotlight = [...pending]
    .sort((a, b) => {
      const aSla = hoursPending(a) / Math.max(1, a.slaHours);
      const bSla = hoursPending(b) / Math.max(1, b.slaHours);
      const aScore = PRIORITY_META[a.priority].rank * 100 + aSla * 40 + a.totalValue / 50000;
      const bScore = PRIORITY_META[b.priority].rank * 100 + bSla * 40 + b.totalValue / 50000;
      return bScore - aScore;
    })
    .slice(0, 5);

  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(NOW_MS - (6 - index) * 86400000);
    const key = date.toISOString().slice(0, 10);
    const events = auditEvents.filter((event) => event.timestamp.slice(0, 10) === key);
    const submitted = requests.filter((request) => request.requestedAt.slice(0, 10) === key);
    return {
      key,
      label: `${String(date.getDate()).padStart(2, '0')} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`,
      count: events.length + submitted.length,
      critical: events.filter((event) => event.severity === 'critical').length,
    };
  });
  const maxActivity = Math.max(1, ...activityDays.map((day) => day.count));

  const recentEvents = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 7);
  const attentionScore = Math.max(
    0,
    Math.min(100, 100 - slaBreaches.length * 12 - criticalActions.length * 7 - pending.filter((request) => request.priority === 'high').length * 3)
  );

  const statCards = [
    {
      label: 'Actions Awaiting Admin',
      value: String(pending.length),
      sub: `${formatETB(pendingValue)} frozen until release`,
      icon: <ShieldAlert size={17} color={C.yellow} />,
      accent: pending.length ? C.amber : C.green,
    },
    {
      label: 'SLA Breaches',
      value: String(slaBreaches.length),
      sub: slaBreaches.length ? 'Escalated actions need immediate decision' : 'All decisions inside service window',
      icon: <Timer size={17} color={C.yellow} />,
      accent: slaBreaches.length ? C.red : C.green,
    },
    {
      label: 'Critical Spotlight',
      value: String(criticalActions.length),
      sub: 'High-value or stockout-risk actions',
      icon: <AlertTriangle size={17} color={C.yellow} />,
      accent: criticalActions.length ? C.red : C.text,
    },
    {
      label: 'Approved Decisions',
      value: String(approved.length),
      sub: `${approvalRate.toFixed(0)}% approval rate this cycle`,
      icon: <CheckCircle2 size={17} color={C.yellow} />,
      accent: C.green,
    },
    {
      label: 'Average Decision Time',
      value: averageDecisionHours ? `${averageDecisionHours.toFixed(1)}h` : '—',
      sub: `${rejected.length} rejected or returned for revision`,
      icon: <Clock size={17} color={C.yellow} />,
      accent: averageDecisionHours && averageDecisionHours > 12 ? C.amber : C.text,
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 18,
          padding: '28px 30px',
          color: C.white,
          background: 'linear-gradient(120deg, #09090b 0%, #141419 60%, #1d1d23 100%)',
          border: '1px solid #27272a',
          boxShadow: '0 16px 42px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ position: 'absolute', width: 380, height: 380, right: -100, top: -150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 260, height: 260, left: 40, bottom: -190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 840 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 6, background: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.4)', color: C.yellow, fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Sparkles size={12} /> Admin-only visual intelligence
              </span>
              <span style={{ fontSize: '0.7rem', color: '#71717a' }}>• Live action telemetry</span>
            </div>
            <h2 style={{ margin: 0, color: C.white, fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.035em' }}>
              Every store action, in one illuminated control room.
            </h2>
            <p style={{ margin: '8px 0 0', color: '#a1a1aa', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: 790 }}>
              See exactly what is waiting, what is at risk and what has already been released. The spotlight ranks every pending action by urgency, value and SLA exposure so Admin can act without losing control.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              <button className="btn-hr-yellow" onClick={onOpenApprovals} style={{ fontSize: '0.8rem' }}>
                <ShieldCheck size={15} /><span>Open Full Approval Center</span>
              </button>
              <button className="btn-hr-black" onClick={onOpenNotifications} style={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: '0.8rem' }}>
                <Activity size={15} color={C.yellow} /><span>{unreadAdmin.length} Unread Admin Alerts</span>
              </button>
              {!isAdmin && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fca5a5', fontSize: '0.73rem', fontWeight: 800 }}>
                  <Lock size={13} /> Read-only — switch to Admin to take decisions
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 154, height: 154, borderRadius: '50%', background: donutBackground, boxShadow: '0 0 0 8px rgba(250,204,21,0.06), 0 18px 36px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', background: '#111115', border: '1px solid #2e2e34', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: C.white, letterSpacing: '-0.04em' }}>{approvalRate.toFixed(0)}%</span>
                <span style={{ fontSize: '0.63rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Approval health</span>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.72rem', color: '#d4d4d8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: C.amber }} /> {pending.length} pending</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.72rem', color: '#d4d4d8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} /> {approved.length} approved</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.72rem', color: '#d4d4d8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} /> {rejected.length} rejected</span>
              <div style={{ marginTop: 4, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.58rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800 }}>Admin attention index</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: attentionScore >= 80 ? '#6ee7b7' : attentionScore >= 55 ? C.yellow : '#fda4af' }}>{attentionScore.toFixed(0)} / 100</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 13 }}>
        {statCards.map((card) => (
          <div key={card.label} className="hr-card" style={{ minHeight: 128, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, borderRadius: '50%', background: `${card.accent}0d`, transform: 'translate(20px, -20px)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: '0.68rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.055em', fontWeight: 900 }}>{card.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{card.icon}</div>
            </div>
            <div style={{ marginTop: 12, fontSize: '1.55rem', fontWeight: 900, color: card.accent, letterSpacing: '-0.035em' }}>{card.value}</div>
            <div style={{ marginTop: 4, fontSize: '0.69rem', color: C.muted, lineHeight: 1.4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 1fr)', gap: 18 }}>
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 7 }}><ShieldAlert size={17} /> Priority Action Spotlight</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: C.muted }}>Ranked by priority, SLA age and financial exposure. Each card is an Admin decision point.</p>
            </div>
            <Chip label={`${pending.length} LIVE`} color={C.black} bg={C.yellow} />
          </div>
          <div style={{ display: 'grid', gap: 10, padding: 16 }}>
            {spotlight.map((request, index) => {
              const age = hoursPending(request);
              const slaPct = Math.min(100, (age / Math.max(1, request.slaHours)) * 100);
              const meta = TYPE_META[request.type];
              const priority = PRIORITY_META[request.priority];
              return (
                <div
                  key={request.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '34px minmax(0, 1fr) auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '13px 14px',
                    borderRadius: 12,
                    border: `1px solid ${priority.color}26`,
                    borderLeft: `5px solid ${priority.color}`,
                    background: index === 0 ? 'linear-gradient(90deg, #fffbeb 0%, #ffffff 70%)' : C.white,
                    boxShadow: index === 0 ? '0 6px 20px rgba(245,158,11,0.11)' : 'none',
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.64rem', fontWeight: 900 }}>{index + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
                      <Chip label={meta.short} color={meta.color} bg={meta.bg} />
                      <Chip label={priority.label.toUpperCase()} color={priority.color} bg={priority.bg} />
                      <span style={{ fontSize: '0.65rem', color: C.dim, fontWeight: 700 }}>{request.requestNumber}</span>
                    </div>
                    <div style={{ fontSize: '0.79rem', fontWeight: 800, color: C.text }}>{request.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 3, fontSize: '0.67rem', color: C.muted }}>
                      <span>{request.requestedBy}</span>
                      <span>•</span>
                      <span>{formatETB(request.totalValue)}</span>
                      <span>•</span>
                      <span style={{ color: slaPct >= 100 ? C.red : slaPct >= 75 ? C.amber : C.muted, fontWeight: 800 }}>{age.toFixed(1)}h / {request.slaHours}h SLA</span>
                    </div>
                    <div style={{ marginTop: 7 }}><Progress pct={slaPct} color={slaPct >= 100 ? C.red : slaPct >= 75 ? C.amber : C.green} height={5} /></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {isAdmin ? (
                      <>
                        <button title="Reject" onClick={() => onDecision(request, 'rejected')} style={{ width: 31, height: 31, borderRadius: 8, border: '1px solid #fecdd3', background: C.redBg, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                        <button title="Approve" onClick={() => onDecision(request, 'approved')} style={{ width: 31, height: 31, borderRadius: 8, border: '1px solid #a7f3d0', background: C.greenBg, color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Check size={14} /></button>
                      </>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.dim, fontSize: '0.66rem', fontWeight: 800 }}><Lock size={12} /> Admin</span>
                    )}
                  </div>
                </div>
              );
            })}
            {spotlight.length === 0 && (
              <div style={{ padding: '34px 18px', textAlign: 'center', borderRadius: 12, background: C.greenBg, border: '1px solid #a7f3d0' }}>
                <CheckCircle2 size={27} color={C.green} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#047857' }}>Approval queue fully cleared</div>
                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: 3 }}>No store action is waiting for Admin release.</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900 }}>Decision Health</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: C.muted }}>Approval outcomes and control pressure</p>
              </div>
              <TrendingUp size={17} color={C.muted} />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 11, borderRadius: 9, background: C.amberBg, border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: '#92400e' }}><span>SLA exposure</span><span>{slaBreaches.length} breached</span></div>
                <div style={{ marginTop: 6 }}><Progress pct={pending.length ? (slaBreaches.length / pending.length) * 100 : 0} color={C.amber} /></div>
              </div>
              <div style={{ padding: 11, borderRadius: 9, background: C.redBg, border: '1px solid #fecdd3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: '#9f1239' }}><span>Critical action load</span><span>{criticalActions.length} critical</span></div>
                <div style={{ marginTop: 6 }}><Progress pct={pending.length ? (criticalActions.length / pending.length) * 100 : 0} color={C.red} /></div>
              </div>
              <div style={{ padding: 11, borderRadius: 9, background: C.greenBg, border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: '#047857' }}><span>Approval quality</span><span>{approvalRate.toFixed(0)}%</span></div>
                <div style={{ marginTop: 6 }}><Progress pct={approvalRate} color={C.green} /></div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900 }}>Unread Admin Alerts</span>
                <button onClick={onOpenNotifications} style={{ background: 'transparent', border: 'none', color: C.yellowDeep, fontSize: '0.68rem', fontWeight: 900, cursor: 'pointer' }}>Open all →</button>
              </div>
              {unreadAdmin.slice(0, 3).map((notification) => (
                <div key={notification.id} style={{ display: 'flex', gap: 7, padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, background: notification.severity === 'critical' ? C.red : notification.severity === 'warning' ? C.amber : C.blue, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>{notification.title}</div>
                    <div style={{ fontSize: '0.65rem', color: C.muted, lineHeight: 1.4 }}>{notification.message}</div>
                  </div>
                </div>
              ))}
              {unreadAdmin.length === 0 && <div style={{ fontSize: '0.7rem', color: C.muted }}>No unread Admin alerts. Decision inbox is clear.</div>}
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 13, background: 'linear-gradient(135deg, #09090b 0%, #1b1b21 100%)', color: C.white, border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.yellow, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em' }}><Sparkles size={13} /> Admin next best action</div>
            <div style={{ marginTop: 8, fontSize: '0.82rem', fontWeight: 800 }}>
              {slaBreaches.length > 0
                ? `Clear ${slaBreaches.length} SLA-breached action${slaBreaches.length === 1 ? '' : 's'} first.`
                : criticalActions.length > 0
                  ? `Release ${criticalActions.length} critical action${criticalActions.length === 1 ? '' : 's'} after evidence review.`
                  : 'Sustain the current approval cadence.'}
            </div>
            <p style={{ margin: '5px 0 0', fontSize: '0.7rem', color: '#a1a1aa', lineHeight: 1.5 }}>
              {formatETB(pendingValue)} of inventory value is currently frozen by the maker-checker gate. Every release updates the stock ledger and audit trail.
            </p>
          </div>
        </div>
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>All Action Streams</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: C.muted }}>Every request type is visualised with live pending volume, total actions and controlled value.</p>
          </div>
          <button className="btn-hr-outline" style={{ fontSize: '0.75rem', padding: '6px 10px' }} onClick={onOpenApprovals}><Layers size={13} /><span>Review all {requests.length}</span></button>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))', gap: 11 }}>
          {actionStreams.map((stream) => {
            const total = stream.total || 1;
            return (
              <div key={stream.type} style={{ padding: 13, borderRadius: 11, border: `1px solid ${stream.pending ? `${stream.meta.color}33` : C.border}`, background: stream.pending ? `${stream.meta.bg}88` : '#fbfdff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Chip label={stream.meta.short} color={stream.meta.color} bg={stream.meta.bg} />
                  <span style={{ fontSize: '0.63rem', color: C.dim, fontWeight: 700 }}>{stream.total} total</span>
                </div>
                <div style={{ marginTop: 9, fontSize: '0.77rem', fontWeight: 900 }}>{stream.meta.label}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 5 }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: stream.pending ? stream.meta.color : C.text }}>{stream.pending}</div>
                    <div style={{ fontSize: '0.62rem', color: C.muted }}>pending Admin</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.65rem', color: C.muted }}>
                    <strong style={{ color: C.text }}>{formatETB(stream.value)}</strong>
                    <div>{stream.approved} approved • {stream.rejected} rejected</div>
                  </div>
                </div>
                <div style={{ display: 'flex', height: 7, borderRadius: 7, overflow: 'hidden', background: '#eef2f6', marginTop: 10 }}>
                  <div style={{ width: `${(stream.pending / total) * 100}%`, background: C.amber }} />
                  <div style={{ width: `${(stream.approved / total) * 100}%`, background: C.green }} />
                  <div style={{ width: `${(stream.rejected / total) * 100}%`, background: C.red }} />
                </div>
                <button onClick={onOpenApprovals} style={{ marginTop: 9, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', padding: 0, color: C.muted, fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer' }}>
                  <span>Open stream</span><ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(340px, 1.2fr)', gap: 18 }}>
        <div className="hr-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900 }}>7-Day Action Pulse</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: C.muted }}>Submitted actions and governance events</p>
            </div>
            <Activity size={17} color={C.muted} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 145, paddingTop: 10 }}>
            {activityDays.map((day) => (
              <div key={day.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: day.critical ? C.red : C.text }}>{day.count}</span>
                <div style={{ width: '100%', maxWidth: 34, height: `${Math.max(8, (day.count / maxActivity) * 90)}%`, borderRadius: '6px 6px 3px 3px', background: day.critical ? `linear-gradient(180deg, ${C.yellow} 0%, ${C.red} 100%)` : 'linear-gradient(180deg, #27272a 0%, #09090b 100%)', border: `1px solid ${day.critical ? '#fde68a' : '#3f3f46'}` }} />
                <span style={{ fontSize: '0.58rem', color: C.dim, fontWeight: 700, whiteSpace: 'nowrap' }}>{day.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 10, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}`, fontSize: '0.68rem', color: C.muted, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkles size={13} color={C.yellowDeep} /> Peak activity is highlighted with the amber-to-red gradient. Critical events are flagged automatically.
          </div>
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900 }}>Live Admin Action Ledger</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: C.muted }}>Newest governance events and decision evidence</p>
            </div>
            <Activity size={17} color={C.muted} />
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {recentEvents.map((event) => (
              <div key={event.id} style={{ display: 'flex', gap: 10, padding: '11px 20px', borderBottom: '1px solid #f1f5f9', background: event.severity === 'critical' ? '#fff1f2' : event.severity === 'success' ? '#f0fdf4' : C.white }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: event.severity === 'critical' ? C.red : event.severity === 'success' ? C.green : event.severity === 'warning' ? C.amber : C.blue, boxShadow: `0 0 0 3px ${event.severity === 'critical' ? '#e11d4818' : event.severity === 'success' ? '#10b98118' : event.severity === 'warning' ? '#f59e0b18' : '#3b82f618'}` }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.69rem', fontWeight: 900 }}>{event.action.replaceAll('_', ' ')}</span>
                    <span style={{ fontSize: '0.62rem', color: C.dim }}>• {event.entity}</span>
                    {event.severity === 'critical' && <Chip label="CRITICAL" color={C.red} bg={C.redBg} />}
                  </div>
                  <div style={{ marginTop: 2, fontSize: '0.67rem', color: C.muted, lineHeight: 1.4 }}>{event.detail}</div>
                  <div style={{ marginTop: 3, fontSize: '0.6rem', color: C.dim }}>{event.actor} • {formatDateTime(event.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 9, background: '#fefce8', border: '1px solid #fde68a', fontSize: '0.7rem', color: '#854d0e' }}>
        <Lock size={13} />
        <span>Admin control is enforced. Actions remain non-posting until approved, and every decision is stored with actor, timestamp, notes and signature code.</span>
      </div>
    </div>
  );
}
