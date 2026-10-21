'use client';

import React, { useState } from 'react';
import {
  Item,
  ItemType,
  MovementType,
  PurchaseOrder,
  StockMovement,
  Store,
  WastageReason,
  WastageRecord,
} from '@/types/erp';
import {
  StockBatch,
  StoreApprovalRequest,
  StoreAuditEvent,
  StoreRequestType,
  SupplierScorecard,
} from '@/types/store';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Award,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart,
  ShieldCheck,
  Timer,
  TrendingDown,
  TrendingUp,
  Warehouse,
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
const DAY_MS = 86400000;

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  raw_material: 'Raw Materials',
  packaging: 'Packaging',
  semi_finished: 'Semi-Finished',
  finished_good: 'Finished Goods',
  service: 'Services',
};

const ITEM_TYPE_COLORS: Record<ItemType, string> = {
  raw_material: '#09090b',
  packaging: '#f59e0b',
  semi_finished: '#8b5cf6',
  finished_good: '#10b981',
  service: '#3b82f6',
};

const REQUEST_LABELS: Record<StoreRequestType, string> = {
  goods_receipt: 'Goods Receipt',
  material_issue: 'Material Issue',
  staff_requisition: 'Staff Requisition',
  staff_return: 'Staff Item Return',
  inter_store_transfer: 'Inter-Store Transfer',
  stock_adjustment: 'Stock Adjustment',
  cycle_count: 'Cycle Count',
  wastage: 'Wastage / Scrap',
  supplier_return: 'Supplier Return',
  reorder_request: 'Reorder Request',
  item_onboarding: 'SKU Onboarding',
};

const MOVEMENT_LABELS: Record<MovementType, string> = {
  purchase_receipt: 'Purchase Receipt',
  production_issue: 'Production Issue',
  production_receipt: 'Production Receipt',
  sales_issue: 'Sales Issue',
  transfer: 'Inter-Store Transfer',
  adjustment: 'Adjustment',
  wastage: 'Wastage',
  return: 'Return',
};

const MOVEMENT_COLORS: Record<MovementType, string> = {
  purchase_receipt: '#10b981',
  production_issue: '#3b82f6',
  production_receipt: '#8b5cf6',
  sales_issue: '#f59e0b',
  transfer: '#09090b',
  adjustment: '#0f766e',
  wastage: '#e11d48',
  return: '#64748b',
};

const WASTAGE_LABELS: Record<WastageReason, string> = {
  damaged: 'Damaged',
  expired: 'Expired',
  spoiled: 'Spoiled',
  production_scrap: 'Production Scrap',
  theft_loss: 'Theft / Loss',
  measurement_error: 'Measurement Error',
  customer_return: 'Customer Return',
};

const WASTAGE_COLORS: Record<WastageReason, string> = {
  damaged: '#f59e0b',
  expired: '#e11d48',
  spoiled: '#be185d',
  production_scrap: '#8b5cf6',
  theft_loss: '#09090b',
  measurement_error: '#3b82f6',
  customer_return: '#10b981',
};

const REQUEST_TYPES = Object.keys(REQUEST_LABELS) as StoreRequestType[];
const MOVEMENT_TYPES = Object.keys(MOVEMENT_LABELS) as MovementType[];

type ReportPeriod = 'month' | 'quarter' | 'ytd';
type ReportTab = 'executive' | 'valuation' | 'movements' | 'governance';

const PERIODS: Record<ReportPeriod, { label: string; short: string; days: number }> = {
  month: { label: 'This Month', short: 'Oct 2026', days: 30 },
  quarter: { label: 'Quarter to Date', short: 'Q4 2026', days: 111 },
  ytd: { label: 'Year to Date', short: 'FY 2026', days: 294 },
};

const REPORT_TABS: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: 'executive', label: 'Executive Summary', icon: BarChart3 },
  { id: 'valuation', label: 'Inventory Valuation', icon: Boxes },
  { id: 'movements', label: 'Movement & Consumption', icon: ArrowRightLeft },
  { id: 'governance', label: 'Governance & Suppliers', icon: ShieldCheck },
];

function formatETB(amount: number) {
  return `ETB ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateTime(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  return `${formatDate(value)} • ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function pct(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

function ReportCard({
  title,
  subtitle,
  icon,
  action,
  children,
  padding = 18,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  padding?: number;
}) {
  return (
    <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>{title}</h3>
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {action}
          {icon}
        </div>
      </div>
      <div style={{ padding }}>{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  accent = C.text,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="hr-card" style={{ minHeight: 124, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -26, right: -18, width: 76, height: 76, borderRadius: '50%', background: `${accent}0d` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 9 }}>
        <span style={{ fontSize: '0.67rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.055em' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      </div>
      <div style={{ marginTop: 11, fontSize: '1.42rem', fontWeight: 900, color: accent, letterSpacing: '-0.035em' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginTop: 4 }}>
        <span style={{ fontSize: '0.68rem', color: C.muted, lineHeight: 1.35 }}>{sub}</span>
        {trend && <span style={{ fontSize: '0.64rem', fontWeight: 900, color: trendUp ? C.green : C.red, whiteSpace: 'nowrap' }}>{trendUp ? '▲' : '▼'} {trend}</span>}
      </div>
    </div>
  );
}

function Progress({ value, color = C.black, height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ height, borderRadius: height, background: '#eef2f6', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', borderRadius: height, background: color }} />
    </div>
  );
}

function BarList({ rows, emptyMessage = 'No data in this period.' }: { rows: { label: string; value: number; color: string; caption: string }[]; emptyMessage?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) return <div style={{ fontSize: '0.73rem', color: C.muted }}>{emptyMessage}</div>;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((row) => (
        <div key={row.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: '0.73rem', fontWeight: 800 }}>{row.label}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: C.text }}>{row.caption}</span>
          </div>
          <Progress value={(row.value / max) * 100} color={row.color} height={9} />
        </div>
      ))}
    </div>
  );
}

function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string; caption: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const stops = segments.map((segment, index) => {
    const start = (segments.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) / total) * 100;
    const end = start + (segment.value / total) * 100;
    return `${segment.color} ${start}% ${end}%`;
  });
  const background = stops.length ? `conic-gradient(${stops.join(', ')})` : '#eef2f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <div style={{ width: 152, height: 152, borderRadius: '50%', background, position: 'relative', flexShrink: 0, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
        <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: C.white, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{centerValue}</span>
          <span style={{ fontSize: '0.58rem', color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{centerLabel}</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 170, display: 'grid', gap: 8 }}>
        {segments.map((segment) => (
          <div key={segment.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.71rem', color: C.muted }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: segment.color, flexShrink: 0 }} />
              {segment.label}
            </span>
            <strong style={{ fontSize: '0.7rem' }}>{segment.caption}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ display: 'inline-flex', padding: '2px 7px', borderRadius: 6, background: bg, color, border: `1px solid ${color}33`, fontSize: '0.61rem', fontWeight: 900, whiteSpace: 'nowrap' }}>{label}</span>;
}

interface StoreReportsProps {
  items: Item[];
  stores: Store[];
  stockMovements: StockMovement[];
  wastages: WastageRecord[];
  requests: StoreApprovalRequest[];
  batches: StockBatch[];
  lowStockItems: { item: Item; expectedDays: number }[];
  supplierScorecards: SupplierScorecard[];
  purchaseOrders: PurchaseOrder[];
  auditEvents: StoreAuditEvent[];
  totalValuation: number;
  inventoryAccuracy: number;
  onNotify: (message: string) => void;
}

export default function StoreReports({
  items,
  stores,
  stockMovements,
  wastages,
  requests,
  batches,
  lowStockItems,
  supplierScorecards,
  purchaseOrders,
  auditEvents,
  totalValuation,
  inventoryAccuracy,
  onNotify,
}: StoreReportsProps) {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [activeReport, setActiveReport] = useState<ReportTab>('executive');

  const periodMeta = PERIODS[period];
  const periodStartMs = period === 'ytd' ? new Date('2026-01-01T00:00:00').getTime() : NOW_MS - periodMeta.days * DAY_MS;
  const inPeriod = (value?: string) => {
    if (!value) return false;
    const time = new Date(value).getTime();
    return time >= periodStartMs && time <= NOW_MS + DAY_MS;
  };

  const periodMovements = stockMovements.filter((movement) => inPeriod(movement.date));
  const periodWastages = wastages.filter((wastage) => inPeriod(wastage.date));
  const periodRequests = requests.filter((request) => inPeriod(request.requestedAt));
  const periodAudit = auditEvents.filter((event) => inPeriod(event.timestamp));

  const movementValue = periodMovements.reduce((sum, movement) => sum + movement.totalCost, 0);
  const wastageValue = periodWastages.reduce((sum, wastage) => sum + wastage.totalCost, 0);
  const receiptValue = periodMovements
    .filter((movement) => movement.movementType === 'purchase_receipt' || movement.movementType === 'production_receipt')
    .reduce((sum, movement) => sum + movement.totalCost, 0);
  const issueValue = periodMovements
    .filter((movement) => movement.movementType === 'production_issue' || movement.movementType === 'sales_issue' || movement.movementType === 'wastage')
    .reduce((sum, movement) => sum + movement.totalCost, 0);
  const pendingRequests = periodRequests.filter((request) => request.status === 'pending_admin');
  const approvedRequests = periodRequests.filter((request) => request.status === 'approved');
  const rejectedRequests = periodRequests.filter((request) => request.status === 'rejected');
  const decidedRequests = approvedRequests.length + rejectedRequests.length;
  const approvalRate = decidedRequests ? (approvedRequests.length / decidedRequests) * 100 : 100;
  const pendingValue = pendingRequests.reduce((sum, request) => sum + request.totalValue, 0);
  const slaBreaches = pendingRequests.filter((request) => (NOW_MS - new Date(request.requestedAt).getTime()) / 3600000 > request.slaHours);
  const expiringBatches = batches.filter((batch) => batch.status === 'expiring' || batch.status === 'expired').sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const expiringValue = expiringBatches.reduce((sum, batch) => sum + batch.quantity * batch.unitCost, 0);
  const deadStockItems = items.filter((item) => item.averageDailyUsage === 0 && item.currentStock > 0);
  const deadStockValue = deadStockItems.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0);
  const openPurchaseOrders = purchaseOrders.filter((po) => po.status !== 'received' && po.status !== 'closed' && po.status !== 'cancelled');
  const openPurchaseValue = openPurchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);

  const warehouseValues = stores
    .map((store) => {
      const value = items.reduce((sum, item) => sum + (item.storeBalances[store.id] || 0) * item.purchasePrice, 0);
      const skuCount = items.filter((item) => (item.storeBalances[store.id] || 0) > 0).length;
      return { store, value, skuCount };
    })
    .sort((a, b) => b.value - a.value);

  const typeValues = (Object.keys(ITEM_TYPE_LABELS) as ItemType[])
    .map((type) => {
      const group = items.filter((item) => item.type === type);
      return {
        type,
        label: ITEM_TYPE_LABELS[type],
        count: group.length,
        value: group.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0),
        color: ITEM_TYPE_COLORS[type],
      };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.value - a.value);

  const sortedByValue = [...items].sort((a, b) => b.currentStock * b.purchasePrice - a.currentStock * a.purchasePrice);
  const totalSortedValue = sortedByValue.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0) || 1;
  const abcBuckets: Record<'A' | 'B' | 'C', { count: number; value: number }> = {
    A: { count: 0, value: 0 },
    B: { count: 0, value: 0 },
    C: { count: 0, value: 0 },
  };
  let cumulativeValue = 0;
  sortedByValue.forEach((item) => {
    const itemValue = item.currentStock * item.purchasePrice;
    cumulativeValue += itemValue;
    const share = cumulativeValue / totalSortedValue;
    const classification = share <= 0.8 ? 'A' : share <= 0.95 ? 'B' : 'C';
    abcBuckets[classification].count += 1;
    abcBuckets[classification].value += itemValue;
  });
  const abcGroups = (['A', 'B', 'C'] as const).map((classification) => ({
    classification,
    count: abcBuckets[classification].count,
    value: abcBuckets[classification].value,
  }));

  const movementMix = MOVEMENT_TYPES.map((type) => {
    const records = periodMovements.filter((movement) => movement.movementType === type);
    return {
      label: MOVEMENT_LABELS[type],
      value: records.length,
      color: MOVEMENT_COLORS[type],
      caption: `${records.length} • ${formatETB(records.reduce((sum, movement) => sum + movement.totalCost, 0))}`,
      amount: records.reduce((sum, movement) => sum + movement.totalCost, 0),
    };
  }).filter((segment) => segment.value > 0);

  const wastageReasonMap = periodWastages.reduce<Record<string, number>>((acc, wastage) => {
    acc[wastage.reason] = (acc[wastage.reason] || 0) + wastage.totalCost;
    return acc;
  }, {});
  const wastageMix = (Object.keys(wastageReasonMap) as WastageReason[]).map((reason) => ({
    label: WASTAGE_LABELS[reason],
    value: wastageReasonMap[reason],
    color: WASTAGE_COLORS[reason],
    caption: formatETB(wastageReasonMap[reason]),
  }));

  const requestPerformance = REQUEST_TYPES.map((type) => {
    const group = periodRequests.filter((request) => request.type === type);
    const pending = group.filter((request) => request.status === 'pending_admin');
    return {
      type,
      label: REQUEST_LABELS[type],
      total: group.length,
      pending: pending.length,
      approved: group.filter((request) => request.status === 'approved').length,
      rejected: group.filter((request) => request.status === 'rejected').length,
      value: group.reduce((sum, request) => sum + request.totalValue, 0),
      sla: pending.filter((request) => (NOW_MS - new Date(request.requestedAt).getTime()) / 3600000 > request.slaHours).length,
    };
  }).filter((row) => row.total > 0);

  const reportRef = `STN-RPT-${periodMeta.short.replace(/\s/g, '')}-${activeReport.toUpperCase().slice(0, 4)}`;

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toCsv = (headers: string[], rows: (string | number)[][]) => {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  };

  const exportValuation = () => {
    const rows = sortedByValue.map((item) => [
      item.code,
      item.name,
      ITEM_TYPE_LABELS[item.type],
      item.currentStock,
      item.unit,
      item.purchasePrice,
      item.currentStock * item.purchasePrice,
      item.reorderLevel,
      item.preferredSupplierName || '',
    ]);
    downloadFile(
      `dot_advert_inventory_valuation_${period}.csv`,
      toCsv(['Item Code', 'Item', 'Type', 'On Hand', 'Unit', 'Unit Cost ETB', 'Valuation ETB', 'Reorder Level', 'Preferred Supplier'], rows),
      'text/csv;charset=utf-8;'
    );
    onNotify('Inventory valuation report exported as CSV.');
  };

  const exportMovements = () => {
    const rows = periodMovements.map((movement) => [
      movement.date,
      movement.movementNumber,
      MOVEMENT_LABELS[movement.movementType],
      movement.itemName,
      movement.fromStoreName || 'Supplier / External',
      movement.toStoreName || 'Production / External',
      movement.quantity,
      movement.unit,
      movement.unitCost,
      movement.totalCost,
      movement.referenceNumber || '',
      movement.createdBy,
    ]);
    downloadFile(
      `dot_advert_stock_movement_register_${period}.csv`,
      toCsv(['Date', 'Movement #', 'Type', 'Item', 'From', 'To', 'Quantity', 'Unit', 'Unit Cost ETB', 'Total Cost ETB', 'Reference', 'Created By'], rows),
      'text/csv;charset=utf-8;'
    );
    onNotify('Stock movement register exported as CSV.');
  };

  const exportApprovals = () => {
    const rows = periodRequests.map((request) => [
      request.requestNumber,
      REQUEST_LABELS[request.type],
      request.title,
      request.itemName || '',
      request.quantity,
      request.unit,
      request.totalValue,
      request.requestedBy,
      request.requestedByRole,
      request.priority,
      request.status,
      request.requestedAt,
      request.approvedBy || '',
      request.approvedAt || '',
      request.decisionNotes || '',
    ]);
    downloadFile(
      `dot_advert_store_approval_register_${period}.csv`,
      toCsv(['Request #', 'Type', 'Title', 'Item', 'Quantity', 'Unit', 'Value ETB', 'Requested By', 'Role', 'Priority', 'Status', 'Requested At', 'Approved By', 'Approved At', 'Decision Notes'], rows),
      'text/csv;charset=utf-8;'
    );
    onNotify('Admin approval register exported as CSV.');
  };

  const exportFullPack = () => {
    const pack = {
      reportReference: reportRef,
      reportPeriod: periodMeta.label,
      generatedAt: '2026-10-21T14:00:00',
      preparedFor: 'Admin / Store Governance',
      metrics: {
        totalValuation,
        movementValue,
        wastageValue,
        pendingActions: pendingRequests.length,
        pendingValue,
        approvalRate,
        inventoryAccuracy,
        expiringValue,
        deadStockValue,
        openPurchaseValue,
      },
      inventoryByWarehouse: warehouseValues.map((row) => ({ warehouse: row.store.name, value: row.value, skus: row.skuCount })),
      valuationByType: typeValues,
      abcClassification: abcGroups,
      approvalPerformance: requestPerformance,
      movementSummary: movementMix,
      wastageByReason: wastageMix,
      topItems: sortedByValue.slice(0, 20).map((item) => ({ code: item.code, name: item.name, onHand: item.currentStock, unit: item.unit, unitCost: item.purchasePrice, value: item.currentStock * item.purchasePrice })),
      supplierScorecards,
      auditEvents: periodAudit,
    };
    downloadFile(`dot_advert_store_report_pack_${period}.json`, JSON.stringify(pack, null, 2), 'application/json');
    onNotify('Full store report pack exported as JSON.');
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=820');
    if (!printWindow) {
      onNotify('Print window was blocked. Allow pop-ups for this site and try again.');
      return;
    }
    const sectionLabel = REPORT_TABS.find((tab) => tab.id === activeReport)?.label || 'Store Report';
    const warehouseRows = warehouseValues
      .map((row) => `<tr><td>${row.store.name}</td><td>${row.skuCount}</td><td>${formatETB(row.value)}</td></tr>`)
      .join('');
    const topItemRows = sortedByValue
      .slice(0, 15)
      .map((item) => `<tr><td>${item.code}</td><td>${item.name}</td><td>${item.currentStock} ${item.unit}</td><td>${formatETB(item.purchasePrice)}</td><td>${formatETB(item.currentStock * item.purchasePrice)}</td></tr>`)
      .join('');
    const approvalRows = requestPerformance
      .map((row) => `<tr><td>${row.label}</td><td>${row.total}</td><td>${row.approved}</td><td>${row.rejected}</td><td>${row.pending}</td><td>${formatETB(row.value)}</td></tr>`)
      .join('');
    printWindow.document.write(`<!doctype html>
      <html><head><title>${reportRef} — ${periodMeta.label}</title>
      <style>
        @page { size: A4; margin: 16mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; font-size: 11px; }
        h1 { font-size: 20px; margin: 0; }
        h2 { font-size: 13px; margin: 22px 0 8px; border-bottom: 2px solid #09090b; padding-bottom: 4px; }
        .brand { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #facc15; padding-bottom: 12px; }
        .brand p { margin: 3px 0 0; color: #64748b; font-size: 10px; }
        .meta { text-align: right; color: #64748b; font-size: 10px; line-height: 1.6; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 16px; }
        .metric { border: 1px solid #e2e8f0; border-radius: 6px; padding: 9px; background: #f8fafc; }
        .metric span { display: block; color: #64748b; font-size: 8px; text-transform: uppercase; font-weight: 700; letter-spacing: .5px; }
        .metric strong { display: block; font-size: 14px; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th { background: #09090b; color: #facc15; text-align: left; padding: 6px 7px; font-size: 9px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 6px 7px; font-size: 9.5px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .footer { margin-top: 26px; border-top: 1px solid #cbd5e1; padding-top: 8px; color: #94a3b8; font-size: 8.5px; display: flex; justify-content: space-between; }
        .stamp { margin-top: 20px; padding: 10px; border: 1px dashed #cbd5e1; font-size: 9px; color: #64748b; }
      </style></head>
      <body>
        <div class="brand">
          <div><h1>Dot Advert ERP — Stores & Inventory</h1><p>${sectionLabel} • ${periodMeta.label} • ${reportRef}</p></div>
          <div class="meta">Generated: ${formatDateTime('2026-10-21T14:00:00')}<br/>Prepared for: Admin / Store Governance<br/>Classification: Internal</div>
        </div>
        <div class="metrics">
          <div class="metric"><span>Inventory Valuation</span><strong>${formatETB(totalValuation)}</strong></div>
          <div class="metric"><span>Posted Movement Value</span><strong>${formatETB(movementValue)}</strong></div>
          <div class="metric"><span>Pending Approvals</span><strong>${pendingRequests.length}</strong></div>
          <div class="metric"><span>Inventory Accuracy</span><strong>${inventoryAccuracy.toFixed(1)}%</strong></div>
          <div class="metric"><span>Wastage Value</span><strong>${formatETB(wastageValue)}</strong></div>
          <div class="metric"><span>Expiry Exposure</span><strong>${formatETB(expiringValue)}</strong></div>
          <div class="metric"><span>Dead Stock</span><strong>${formatETB(deadStockValue)}</strong></div>
          <div class="metric"><span>Open PO Value</span><strong>${formatETB(openPurchaseValue)}</strong></div>
        </div>
        <h2>Inventory by Warehouse</h2>
        <table><thead><tr><th>Warehouse</th><th>Active SKUs</th><th>Valuation</th></tr></thead><tbody>${warehouseRows}</tbody></table>
        <h2>Top Inventory Holdings</h2>
        <table><thead><tr><th>SKU</th><th>Item</th><th>On Hand</th><th>Unit Cost</th><th>Valuation</th></tr></thead><tbody>${topItemRows}</tbody></table>
        <h2>Admin Approval Performance</h2>
        <table><thead><tr><th>Request Type</th><th>Total</th><th>Approved</th><th>Rejected</th><th>Pending</th><th>Value</th></tr></thead><tbody>${approvalRows}</tbody></table>
        <div class="stamp">Control statement: This report is generated from the live store ledger and maker-checker approval records. Figures are denominated in Ethiopian Birr (ETB). System signature: ${reportRef} • Admin approval authority required for all stock postings.</div>
        <div class="footer"><span>Dot Advert ERP • Stores & Inventory Control</span><span>${reportRef} • Page 1</span></div>
        <script>window.onload = function () { window.print(); };</script>
      </body></html>`);
    printWindow.document.close();
    onNotify(`Print-ready PDF report opened for ${periodMeta.label}.`);
  };

  const renderExecutive = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 13 }}>
        <MetricCard label="Inventory Valuation" value={formatETB(totalValuation)} sub={`${items.length} SKUs across ${stores.length} warehouses`} icon={<Boxes size={17} color={C.yellow} />} trend="4.8% MoM" trendUp />
        <MetricCard label="Posted Movement Value" value={formatETB(movementValue)} sub={`${periodMovements.length} approved ledger movements`} icon={<ArrowRightLeft size={17} color={C.yellow} />} />
        <MetricCard label="Admin Pending Value" value={formatETB(pendingValue)} sub={`${pendingRequests.length} actions awaiting release`} icon={<ShieldCheck size={17} color={C.yellow} />} accent={pendingRequests.length ? C.amber : C.text} />
        <MetricCard label="Wastage & Scrap" value={formatETB(wastageValue)} sub={`${periodWastages.length} approved loss incidents`} icon={<TrendingDown size={17} color={C.yellow} />} accent={C.red} />
        <MetricCard label="Inventory Accuracy" value={`${inventoryAccuracy.toFixed(1)}%`} sub="Blind count reconciliation result" icon={<CheckCircle2 size={17} color={C.yellow} />} trend="1.2%" trendUp />
        <MetricCard label="Open Purchase Orders" value={String(openPurchaseOrders.length)} sub={`${formatETB(openPurchaseValue)} in procurement pipeline`} icon={<FileText size={17} color={C.yellow} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)', gap: 18 }}>
        <ReportCard title="Inventory Value by Warehouse" subtitle="Current approved stock valuation, ranked by location" icon={<Warehouse size={17} color={C.muted} />}>
          <BarList rows={warehouseValues.map((row) => ({ label: row.store.name, value: row.value, color: C.black, caption: `${formatETB(row.value)} • ${row.skuCount} SKUs` }))} />
        </ReportCard>
        <ReportCard title="Admin Approval Mix" subtitle="All submitted store actions in the selected period" icon={<ShieldCheck size={17} color={C.muted} />}>
          <Donut
            segments={[
              { label: 'Pending Admin', value: pendingRequests.length, color: C.amber, caption: String(pendingRequests.length) },
              { label: 'Approved', value: approvedRequests.length, color: C.green, caption: String(approvedRequests.length) },
              { label: 'Rejected', value: rejectedRequests.length, color: C.red, caption: String(rejectedRequests.length) },
            ]}
            centerValue={approvalRate.toFixed(0) + '%'}
            centerLabel="Approval rate"
          />
          <div style={{ marginTop: 14, padding: 10, borderRadius: 9, background: slaBreaches.length ? C.redBg : C.greenBg, border: `1px solid ${slaBreaches.length ? '#fecdd3' : '#a7f3d0'}`, fontSize: '0.7rem', color: slaBreaches.length ? '#9f1239' : '#047857', fontWeight: 700 }}>
            {slaBreaches.length ? `${slaBreaches.length} action${slaBreaches.length === 1 ? '' : 's'} beyond the Admin SLA window.` : 'All pending actions remain inside their Admin SLA window.'}
          </div>
        </ReportCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: 18 }}>
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Top Value Concentration</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>Highest-valued SKUs driving working capital exposure</p>
            </div>
            <BarChart3 size={17} color={C.muted} />
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead><tr><th>Item</th><th>On Hand</th><th>Unit Cost</th><th>Valuation</th><th>Coverage</th></tr></thead>
              <tbody>
                {sortedByValue.slice(0, 6).map((item) => {
                  const low = item.currentStock <= item.reorderLevel;
                  return (
                    <tr key={item.id}>
                      <td><div style={{ fontWeight: 800 }}>{item.name}</div><div style={{ fontSize: '0.66rem', color: C.dim }}>{item.code} • {ITEM_TYPE_LABELS[item.type]}</div></td>
                      <td><strong>{item.currentStock} {item.unit}</strong></td>
                      <td>{formatETB(item.purchasePrice)}</td>
                      <td><strong>{formatETB(item.currentStock * item.purchasePrice)}</strong></td>
                      <td>{low ? <StatusPill label="LOW STOCK" color={C.red} bg={C.redBg} /> : <StatusPill label="HEALTHY" color="#047857" bg={C.greenBg} />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <ReportCard title="Executive Exceptions" subtitle="Items requiring management attention" icon={<AlertTriangle size={17} color={C.muted} />}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ padding: 11, borderRadius: 9, background: C.redBg, border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#9f1239' }}>Stockout risk</span><strong style={{ fontSize: '0.72rem', color: C.red }}>{lowStockItems.length} SKUs</strong></div>
              <p style={{ margin: '3px 0 0', fontSize: '0.67rem', color: '#be123c' }}>{lowStockItems[0]?.item.name || 'All items above safety stock.'}</p>
            </div>
            <div style={{ padding: 11, borderRadius: 9, background: C.amberBg, border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#92400e' }}>Expiry exposure</span><strong style={{ fontSize: '0.72rem', color: '#b45309' }}>{formatETB(expiringValue)}</strong></div>
              <p style={{ margin: '3px 0 0', fontSize: '0.67rem', color: '#b45309' }}>{expiringBatches.length} batches are expiring or expired.</p>
            </div>
            <div style={{ padding: 11, borderRadius: 9, background: '#f1f5f9', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: '0.72rem', fontWeight: 900 }}>Dead stock exposure</span><strong style={{ fontSize: '0.72rem' }}>{formatETB(deadStockValue)}</strong></div>
              <p style={{ margin: '3px 0 0', fontSize: '0.67rem', color: C.muted }}>{deadStockItems.length} SKUs have zero daily usage.</p>
            </div>
            <div style={{ padding: 11, borderRadius: 9, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#047857' }}>Receipts in period</span><strong style={{ fontSize: '0.72rem', color: '#047857' }}>{formatETB(receiptValue)}</strong></div>
              <p style={{ margin: '3px 0 0', fontSize: '0.67rem', color: '#059669' }}>Issued and consumed value: {formatETB(issueValue)}.</p>
            </div>
          </div>
        </ReportCard>
      </div>

      <div style={{ padding: 18, borderRadius: 14, background: 'linear-gradient(120deg, #09090b 0%, #1b1b21 100%)', color: C.white, border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.yellow, fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}><Activity size={13} /> Executive report note</div>
          <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#a1a1aa', lineHeight: 1.55 }}>
            {formatETB(totalValuation)} is held across {stores.length} warehouses with {inventoryAccuracy.toFixed(1)}% count accuracy. {pendingRequests.length} Admin decisions are outstanding, representing {formatETB(pendingValue)} of frozen inventory value.
          </p>
        </div>
        <button className="btn-hr-yellow" onClick={exportFullPack}><Download size={14} /><span>Download Report Pack</span></button>
      </div>
    </div>
  );

  const renderValuation = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 13 }}>
        <MetricCard label="Total Inventory Value" value={formatETB(totalValuation)} sub={`${items.length} active SKUs`} icon={<Boxes size={17} color={C.yellow} />} />
        <MetricCard label="Average SKU Value" value={formatETB(items.length ? totalValuation / items.length : 0)} sub="Mean working capital per SKU" icon={<BarChart3 size={17} color={C.yellow} />} />
        <MetricCard label="Expiry At Risk" value={formatETB(expiringValue)} sub={`${expiringBatches.length} batches in warning window`} icon={<Timer size={17} color={C.yellow} />} accent={C.amber} />
        <MetricCard label="Dead Stock Value" value={formatETB(deadStockValue)} sub={`${deadStockItems.length} zero-usage SKUs`} icon={<TrendingDown size={17} color={C.yellow} />} accent={C.red} />
        <MetricCard label="Warehouses Online" value={String(stores.length)} sub={`${warehouseValues.filter((row) => row.value > 0).length} carrying stock`} icon={<Building2 size={17} color={C.yellow} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <ReportCard title="Valuation by Item Type" subtitle="Inventory value composition" icon={<PieChart size={17} color={C.muted} />}>
          <BarList rows={typeValues.map((row) => ({ label: row.label, value: row.value, color: row.color, caption: `${formatETB(row.value)} • ${row.count} SKUs` }))} />
        </ReportCard>
        <ReportCard title="ABC Classification" subtitle="Value concentration and control intensity" icon={<TrendingUp size={17} color={C.muted} />}>
          <div style={{ display: 'grid', gap: 14 }}>
            {abcGroups.map((group) => {
              const share = pct(group.value, totalValuation);
              return (
                <div key={group.classification}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}><span style={{ fontSize: '0.73rem', fontWeight: 900 }}>Class {group.classification} <span style={{ color: C.muted, fontWeight: 600 }}>• {group.count} SKUs</span></span><strong style={{ fontSize: '0.7rem' }}>{formatETB(group.value)} ({share.toFixed(1)}%)</strong></div>
                  <Progress value={share} color={group.classification === 'A' ? C.yellow : group.classification === 'B' ? C.black : C.dim} height={10} />
                </div>
              );
            })}
          </div>
        </ReportCard>
        <ReportCard title="Valuation by Warehouse" subtitle="Distribution across physical locations" icon={<Warehouse size={17} color={C.muted} />}>
          <BarList rows={warehouseValues.map((row) => ({ label: row.store.name, value: row.value, color: C.black, caption: formatETB(row.value) }))} />
        </ReportCard>
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div><h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Detailed Valuation Register</h3><p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>All SKUs ranked by current approved valuation</p></div>
          <button className="btn-hr-outline" style={{ fontSize: '0.72rem', padding: '6px 10px' }} onClick={exportValuation}><FileSpreadsheet size={13} /><span>Export Valuation</span></button>
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Code</th><th>Item</th><th>Type</th><th>On Hand</th><th>Unit Cost</th><th>Valuation</th><th>Reorder Level</th><th>Supplier</th></tr></thead>
            <tbody>
              {sortedByValue.slice(0, 12).map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td>
                  <td>{item.name}</td>
                  <td><StatusPill label={ITEM_TYPE_LABELS[item.type]} color={ITEM_TYPE_COLORS[item.type]} bg="#f8fafc" /></td>
                  <td>{item.currentStock} {item.unit}</td>
                  <td>{formatETB(item.purchasePrice)}</td>
                  <td><strong>{formatETB(item.currentStock * item.purchasePrice)}</strong></td>
                  <td>{item.reorderLevel} {item.unit}</td>
                  <td style={{ fontSize: '0.7rem', color: C.muted }}>{item.preferredSupplierName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)', gap: 18 }}>
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}><h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Expiry & Batch Risk</h3><p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>FEFO candidates and value at risk</p></div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead><tr><th>Batch</th><th>Item</th><th>Expiry</th><th>Qty</th><th>Value</th><th>Status</th></tr></thead>
              <tbody>
                {expiringBatches.slice(0, 6).map((batch) => (
                  <tr key={batch.id}>
                    <td><strong>{batch.batchNumber}</strong></td>
                    <td style={{ fontSize: '0.73rem' }}>{batch.itemName}</td>
                    <td>{formatDate(batch.expiryDate)}</td>
                    <td>{batch.quantity} {batch.unit}</td>
                    <td><strong style={{ color: C.red }}>{formatETB(batch.quantity * batch.unitCost)}</strong></td>
                    <td>{batch.status === 'expired' ? <StatusPill label="EXPIRED" color={C.red} bg={C.redBg} /> : <StatusPill label="EXPIRING" color="#b45309" bg={C.amberBg} />}</td>
                  </tr>
                ))}
                {expiringBatches.length === 0 && <tr><td colSpan={6}><div style={{ padding: 24, textAlign: 'center', fontSize: '0.73rem', color: C.muted }}>No batch expiry risk in the current dataset.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <ReportCard title="Valuation Control Summary" subtitle="Balance sheet and control signals" icon={<ShieldCheck size={17} color={C.muted} />}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.73rem' }}><span>Inventory valuation</span><strong>{formatETB(totalValuation)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.73rem' }}><span>Count accuracy</span><strong>{inventoryAccuracy.toFixed(1)}%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.73rem' }}><span>Wastage / valuation</span><strong style={{ color: C.red }}>{pct(wastageValue, totalValuation).toFixed(2)}%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.73rem' }}><span>Dead stock / valuation</span><strong style={{ color: C.amber }}>{pct(deadStockValue, totalValuation).toFixed(2)}%</strong></div>
          </div>
        </ReportCard>
      </div>
    </div>
  );

  const renderMovements = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 13 }}>
        <MetricCard label="Movements Posted" value={String(periodMovements.length)} sub="Approved stock ledger entries" icon={<ArrowRightLeft size={17} color={C.yellow} />} />
        <MetricCard label="Total Movement Value" value={formatETB(movementValue)} sub="Receipts, issues, transfers and adjustments" icon={<TrendingUp size={17} color={C.yellow} />} />
        <MetricCard label="Receipts & Returns" value={formatETB(receiptValue)} sub="Stock entering controlled stores" icon={<Boxes size={17} color={C.yellow} />} accent={C.green} />
        <MetricCard label="Issues & Consumption" value={formatETB(issueValue)} sub="Stock consumed by production and sales" icon={<TrendingDown size={17} color={C.yellow} />} accent={C.blue} />
        <MetricCard label="Wastage Value" value={formatETB(wastageValue)} sub={`${periodWastages.length} approved loss events`} icon={<AlertTriangle size={17} color={C.yellow} />} accent={C.red} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <ReportCard title="Movement Mix" subtitle="Approved ledger movement count by type" icon={<PieChart size={17} color={C.muted} />}>
          <Donut segments={movementMix} centerValue={String(periodMovements.length)} centerLabel="Movements" />
        </ReportCard>
        <ReportCard title="Value by Movement Type" subtitle="Financial value flowing through the ledger" icon={<BarChart3 size={17} color={C.muted} />}>
          <BarList rows={movementMix.map((segment) => ({ label: segment.label, value: segment.amount, color: segment.color, caption: formatETB(segment.amount) }))} />
        </ReportCard>
        <ReportCard title="Wastage by Root Cause" subtitle="Loss value grouped by approved reason" icon={<TrendingDown size={17} color={C.muted} />}>
          <Donut segments={wastageMix} centerValue={formatETB(wastageValue).replace('ETB ', '')} centerLabel="ETB loss" />
        </ReportCard>
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div><h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Stock Movement Register</h3><p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>Period-filtered ledger of approved stock actions</p></div>
          <button className="btn-hr-outline" style={{ fontSize: '0.72rem', padding: '6px 10px' }} onClick={exportMovements}><FileSpreadsheet size={13} /><span>Export Register</span></button>
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Date</th><th>Movement #</th><th>Type</th><th>Item</th><th>From</th><th>To</th><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
            <tbody>
              {[...periodMovements].sort((a, b) => b.date.localeCompare(a.date)).map((movement) => (
                <tr key={movement.id}>
                  <td>{formatDate(movement.date)}</td>
                  <td><strong>{movement.movementNumber}</strong></td>
                  <td><StatusPill label={MOVEMENT_LABELS[movement.movementType].toUpperCase()} color={MOVEMENT_COLORS[movement.movementType]} bg="#f8fafc" /></td>
                  <td style={{ fontSize: '0.73rem' }}>{movement.itemName}</td>
                  <td style={{ fontSize: '0.7rem', color: C.muted }}>{movement.fromStoreName || 'Supplier'}</td>
                  <td style={{ fontSize: '0.7rem', color: C.muted }}>{movement.toStoreName || 'Production / External'}</td>
                  <td><strong>{movement.quantity} {movement.unit}</strong></td>
                  <td><strong>{formatETB(movement.totalCost)}</strong></td>
                  <td style={{ fontSize: '0.7rem', color: C.muted }}>{movement.referenceNumber || '—'}</td>
                </tr>
              ))}
              {periodMovements.length === 0 && <tr><td colSpan={9}><div style={{ padding: 24, textAlign: 'center', fontSize: '0.73rem', color: C.muted }}>No approved movements in this period.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}><h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Wastage & Scrap Register</h3><p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>Approved losses allocated to jobs or overhead</p></div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Date</th><th>Item</th><th>Store</th><th>Quantity</th><th>Unit Cost</th><th>Total Loss</th><th>Reason</th><th>Order Allocation</th><th>Reported By</th></tr></thead>
            <tbody>
              {[...periodWastages].sort((a, b) => b.date.localeCompare(a.date)).map((wastage) => (
                <tr key={wastage.id}>
                  <td>{formatDate(wastage.date)}</td>
                  <td style={{ fontSize: '0.73rem' }}>{wastage.itemName}</td>
                  <td style={{ fontSize: '0.7rem' }}>{wastage.storeName}</td>
                  <td><strong>{wastage.quantity} {wastage.unit}</strong></td>
                  <td>{formatETB(wastage.unitCost)}</td>
                  <td><strong style={{ color: C.red }}>{formatETB(wastage.totalCost)}</strong></td>
                  <td><StatusPill label={WASTAGE_LABELS[wastage.reason].toUpperCase()} color={WASTAGE_COLORS[wastage.reason]} bg="#f8fafc" /></td>
                  <td style={{ fontSize: '0.7rem' }}>{wastage.orderNumber || 'General overhead'}</td>
                  <td style={{ fontSize: '0.7rem', color: C.muted }}>{wastage.reportedBy}</td>
                </tr>
              ))}
              {periodWastages.length === 0 && <tr><td colSpan={9}><div style={{ padding: 24, textAlign: 'center', fontSize: '0.73rem', color: C.muted }}>No wastage in this period.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGovernance = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 13 }}>
        <MetricCard label="Approval Rate" value={`${approvalRate.toFixed(0)}%`} sub={`${approvedRequests.length} approved of ${decidedRequests} decided`} icon={<CheckCircle2 size={17} color={C.yellow} />} />
        <MetricCard label="Pending Admin Actions" value={String(pendingRequests.length)} sub={`${formatETB(pendingValue)} awaiting release`} icon={<ShieldCheck size={17} color={C.yellow} />} accent={C.amber} />
        <MetricCard label="SLA Breaches" value={String(slaBreaches.length)} sub="Decisions outside target service window" icon={<Timer size={17} color={C.yellow} />} accent={slaBreaches.length ? C.red : C.green} />
        <MetricCard label="Audit Events" value={String(periodAudit.length)} sub="Maker-checker evidence in period" icon={<FileText size={17} color={C.yellow} />} />
        <MetricCard label="Supplier Score" value={supplierScorecards.length ? `${(supplierScorecards.reduce((sum, supplier) => sum + supplier.score, 0) / supplierScorecards.length).toFixed(0)} / 100` : '—'} sub={`${supplierScorecards.length} active supplier scorecards`} icon={<Award size={17} color={C.yellow} />} />
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div><h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Approval Performance by Action Type</h3><p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>Maker-checker throughput, value and SLA compliance</p></div>
          <button className="btn-hr-outline" style={{ fontSize: '0.72rem', padding: '6px 10px' }} onClick={exportApprovals}><FileSpreadsheet size={13} /><span>Export Approvals</span></button>
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Action Type</th><th>Total</th><th>Pending</th><th>Approved</th><th>Rejected</th><th>Value</th><th>SLA Breach</th><th>Control Status</th></tr></thead>
            <tbody>
              {requestPerformance.map((row) => (
                <tr key={row.type}>
                  <td><strong>{row.label}</strong></td>
                  <td>{row.total}</td>
                  <td><strong style={{ color: row.pending ? C.amber : C.text }}>{row.pending}</strong></td>
                  <td>{row.approved}</td>
                  <td>{row.rejected}</td>
                  <td>{formatETB(row.value)}</td>
                  <td>{row.sla ? <StatusPill label={`${row.sla} BREACHED`} color={C.red} bg={C.redBg} /> : <StatusPill label="IN SLA" color="#047857" bg={C.greenBg} />}</td>
                  <td><StatusPill label={row.pending ? 'AWAITING ADMIN' : 'CLEARED'} color={row.pending ? '#b45309' : '#047857'} bg={row.pending ? C.amberBg : C.greenBg} /></td>
                </tr>
              ))}
              {requestPerformance.length === 0 && <tr><td colSpan={8}><div style={{ padding: 24, textAlign: 'center', fontSize: '0.73rem', color: C.muted }}>No approval activity in this period.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 1fr)', gap: 18 }}>
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}><h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900 }}>Governance Audit Trail</h3><p style={{ margin: '2px 0 0', fontSize: '0.69rem', color: C.muted }}>Immutable event history and decision evidence</p></div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {[...periodAudit].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 12).map((event) => (
              <div key={event.id} style={{ display: 'flex', gap: 9, padding: '11px 18px', borderBottom: '1px solid #f1f5f9', background: event.severity === 'critical' ? '#fff1f2' : event.severity === 'success' ? '#f0fdf4' : C.white }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: event.severity === 'critical' ? C.red : event.severity === 'success' ? C.green : event.severity === 'warning' ? C.amber : C.blue }} />
                <div>
                  <div style={{ fontSize: '0.71rem', fontWeight: 900 }}>{event.action.replaceAll('_', ' ')} <span style={{ color: C.dim, fontWeight: 600 }}>• {event.entity}</span></div>
                  <div style={{ marginTop: 2, fontSize: '0.68rem', color: C.muted, lineHeight: 1.4 }}>{event.detail}</div>
                  <div style={{ marginTop: 2, fontSize: '0.61rem', color: C.dim }}>{event.actor} • {formatDateTime(event.timestamp)} {event.requestNumber ? `• ${event.requestNumber}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <ReportCard title="Supplier Scorecards" subtitle="Quality, delivery and price performance" icon={<Award size={17} color={C.muted} />}>
            <div style={{ display: 'grid', gap: 10 }}>
              {supplierScorecards.map((supplier) => (
                <div key={supplier.id} style={{ padding: 10, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: '0.73rem', fontWeight: 900 }}>{supplier.name}</span><strong style={{ fontSize: '0.72rem', color: supplier.score >= 90 ? C.green : supplier.score >= 80 ? C.amber : C.red }}>{supplier.score}/100</strong></div>
                  <div style={{ marginTop: 5, fontSize: '0.65rem', color: C.muted }}>On-time {supplier.onTimeDeliveryPct}% • Quality {supplier.qualityAcceptancePct}% • Lead {supplier.averageLeadDays}d • Spend {formatETB(supplier.spendYtd)}</div>
                </div>
              ))}
            </div>
          </ReportCard>

          <ReportCard title="Open Purchase Orders" subtitle="Procurement pipeline awaiting receipt" icon={<Building2 size={17} color={C.muted} />}>
            <div style={{ display: 'grid', gap: 9 }}>
              {openPurchaseOrders.slice(0, 5).map((po) => (
                <div key={po.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div><div style={{ fontSize: '0.72rem', fontWeight: 900 }}>{po.poNumber}</div><div style={{ fontSize: '0.63rem', color: C.muted }}>{po.supplierName}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.72rem', fontWeight: 900 }}>{formatETB(po.grandTotal)}</div><div style={{ fontSize: '0.62rem', color: C.muted }}>{po.status.replaceAll('_', ' ')}</div></div>
                </div>
              ))}
              {openPurchaseOrders.length === 0 && <div style={{ fontSize: '0.7rem', color: C.muted }}>No open purchase orders.</div>}
            </div>
          </ReportCard>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section style={{ position: 'relative', overflow: 'hidden', borderRadius: 17, padding: '25px 28px', background: 'linear-gradient(125deg, #09090b 0%, #141419 62%, #1c1c22 100%)', border: '1px solid #27272a', color: C.white, boxShadow: '0 14px 38px rgba(0,0,0,0.18)' }}>
        <div style={{ position: 'absolute', width: 330, height: 330, right: -90, top: -160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.17) 0%, transparent 68%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 850 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 6, background: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.4)', color: C.yellow, fontSize: '0.67rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}><FileText size={12} /> Report Studio</span>
              <span style={{ fontSize: '0.69rem', color: '#71717a' }}>• Board-ready store intelligence</span>
            </div>
            <h2 style={{ margin: 0, color: C.white, fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.035em' }}>Inventory & Stores Reporting Pack</h2>
            <p style={{ margin: '7px 0 0', color: '#a1a1aa', fontSize: '0.79rem', lineHeight: 1.55, maxWidth: 760 }}>
              Valuation, movement, consumption, expiry, supplier and Admin approval reports generated from the live store ledger. Select a period and drill into the report that matters.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 14, fontSize: '0.66rem', color: '#a1a1aa' }}>
              <span>Report ref: <strong style={{ color: C.white }}>{reportRef}</strong></span>
              <span>Period: <strong style={{ color: C.white }}>{periodMeta.label}</strong></span>
              <span>Generated: <strong style={{ color: C.white }}>21 Oct 2026 • 14:00</strong></span>
              <span>Prepared for: <strong style={{ color: C.yellow }}>Admin</strong></span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <button className="btn-hr-yellow" onClick={exportFullPack}><Download size={14} /><span>Download Report Pack</span></button>
            <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={printReport}><FileText size={14} color={C.yellow} /><span>Print / PDF</span></button>
            <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => onNotify(`Snapshot ${reportRef} generated for ${periodMeta.label}.`)}><FileSpreadsheet size={14} color={C.yellow} /><span>Generate Snapshot</span></button>
          </div>
        </div>
      </section>

      <div className="hr-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.67rem', color: C.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 3 }}><CalendarDays size={13} /> Period</span>
            {(Object.keys(PERIODS) as ReportPeriod[]).map((periodKey) => (
              <button key={periodKey} onClick={() => setPeriod(periodKey)} style={{ padding: '7px 11px', borderRadius: 8, border: `1px solid ${period === periodKey ? C.black : C.border}`, background: period === periodKey ? C.black : C.white, color: period === periodKey ? C.yellow : C.muted, fontSize: '0.71rem', fontWeight: 800, cursor: 'pointer' }}>
                {PERIODS[periodKey].label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.67rem', color: C.muted }}>Range: <strong style={{ color: C.text }}>{formatDate(new Date(periodStartMs).toISOString())} — {formatDate(new Date(NOW_MS).toISOString())}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeReport === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveReport(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: `1px solid ${active ? C.black : C.border}`, background: active ? C.black : C.white, color: active ? C.yellow : C.muted, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Icon size={13} /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeReport === 'executive' && renderExecutive()}
      {activeReport === 'valuation' && renderValuation()}
      {activeReport === 'movements' && renderMovements()}
      {activeReport === 'governance' && renderGovernance()}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '11px 13px', borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}`, fontSize: '0.68rem', color: C.muted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={13} color={C.black} /> All reports reflect approved ledger entries and Admin-controlled store actions.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} /> Snapshot generated 21 Oct 2026 • 14:00</span>
      </div>
    </div>
  );
}
