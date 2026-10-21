'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import { Item, Store, WastageReason, POStatus, PurchaseOrder, Supplier } from '@/types/erp';
import {
  CycleCountTask,
  StoreApprovalRequest,
  StoreAuditEvent,
  StoreModuleRole,
  StoreNotification,
  StoreNotificationSeverity,
  StorePriority,
  StoreRequestType,
} from '@/types/store';
import {
  INITIAL_CYCLE_COUNTS,
  INITIAL_STOCK_BATCHES,
  INITIAL_STORE_AUDIT_EVENTS,
  INITIAL_STORE_BINS,
  INITIAL_STORE_NOTIFICATIONS,
  INITIAL_STORE_REQUESTS,
  INITIAL_STORE_SETTINGS,
  INITIAL_SUPPLIER_SCORECARDS,
  STORE_APPROVAL_MATRIX,
} from '@/data/storeMockData';
import StoreAdminHighlights from '@/components/store/StoreAdminHighlights';
import StoreReports from '@/components/store/StoreReports';
import StorePurchasingDesk from '@/components/store/StorePurchasingDesk';
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Award,
  BarChart3,
  Barcode,
  Bell,
  BellRing,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Info,
  Layers,
  ListChecks,
  Lock,
  MapPin,
  PackageCheck,
  PackageOpen,
  PackageSearch,
  Percent,
  PieChart,
  PlusCircle,
  RefreshCw,
  ScanBarcode,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  ShoppingBag,
  Sparkles,
  Target,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Warehouse,
  X,
  XCircle,
  RotateCcw,
} from 'lucide-react';

const C = {
  black: '#09090b',
  blackSoft: '#18181b',
  yellow: '#facc15',
  yellowDeep: '#ca8a04',
  white: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
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

const REQUEST_TYPE_META: Record<
  StoreRequestType,
  { label: string; short: string; bg: string; color: string }
> = {
  goods_receipt: { label: 'Goods Receipt (GRN)', short: 'GRN', bg: '#ecfdf5', color: '#047857' },
  material_issue: { label: 'Material Issue', short: 'ISSUE', bg: '#eff6ff', color: '#1d4ed8' },
  staff_requisition: { label: 'Staff Item Requisition', short: 'STAFF REQ', bg: '#f0f9ff', color: '#0369a1' },
  staff_return: { label: 'Staff Item Return', short: 'RETURN', bg: '#ecfeff', color: '#0e7490' },
  inter_store_transfer: { label: 'Inter-Store Transfer', short: 'TRANSFER', bg: '#f5f3ff', color: '#6d28d9' },
  stock_adjustment: { label: 'Stock Adjustment', short: 'ADJUST', bg: '#fffbeb', color: '#b45309' },
  cycle_count: { label: 'Cycle Count Variance', short: 'COUNT', bg: '#f0fdfa', color: '#0f766e' },
  wastage: { label: 'Wastage / Scrap', short: 'WASTE', bg: '#fff1f2', color: '#be123c' },
  supplier_return: { label: 'Supplier Return', short: 'RETURN', bg: '#fdf2f8', color: '#be185d' },
  reorder_request: { label: 'Reorder Request', short: 'REORDER', bg: '#fefce8', color: '#a16207' },
  item_onboarding: { label: 'SKU Onboarding', short: 'NEW SKU', bg: '#f1f5f9', color: '#334155' },
};

const STATUS_META = {
  pending_admin: { label: 'Pending Admin', bg: '#fef3c7', color: '#92400e' },
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#047857' },
  rejected: { label: 'Rejected', bg: '#fff1f2', color: '#be123c' },
  needs_revision: { label: 'Needs Revision', bg: '#eff6ff', color: '#1d4ed8' },
} as const;

const PRIORITY_META = {
  normal: { label: 'Normal', bg: '#f1f5f9', color: '#475569' },
  high: { label: 'High', bg: '#fffbeb', color: '#b45309' },
  critical: { label: 'Critical', bg: '#fff1f2', color: '#be123c' },
} as const;

const SEVERITY_COLOR: Record<StoreNotificationSeverity, string> = {
  info: C.blue,
  success: C.green,
  warning: C.amber,
  critical: C.red,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 800,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.055em',
  marginBottom: 6,
};

const nowStamp = () => new Date().toISOString().slice(0, 19);
const NOW_MS = new Date('2026-10-21T14:00:00').getTime();

function formatETB(amount: number) {
  return `ETB ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}

function formatDate(date?: string) {
  if (!date) return '—';
  const [y, m, d] = date.split('T')[0].split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[Number(m) - 1] || m} ${y}`;
}

function formatDateTime(value: string) {
  if (!value) return '—';
  return `${formatDate(value)} • ${value.slice(11, 16)}`;
}

function daysUntil(date?: string) {
  if (!date) return 9999;
  return Math.ceil((new Date(date).getTime() - new Date('2026-10-21T00:00:00').getTime()) / 86400000);
}

function hoursPending(request: StoreApprovalRequest) {
  return Math.max(0, (NOW_MS - new Date(request.requestedAt).getTime()) / 3600000);
}

function Chip({
  children,
  bg,
  color,
  border,
  small,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
  border?: string;
  small?: boolean;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: small ? '2px 7px' : '3px 9px',
        borderRadius: 6,
        background: bg,
        color,
        border: `1px solid ${border || `${color}33`}`,
        fontSize: small ? '0.64rem' : '0.68rem',
        fontWeight: 800,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function StatusChip({ status }: { status: StoreApprovalRequest['status'] }) {
  const meta = STATUS_META[status];
  return <Chip bg={meta.bg} color={meta.color}>{meta.label}</Chip>;
}

function PriorityChip({ priority }: { priority: StorePriority }) {
  const meta = PRIORITY_META[priority];
  return <Chip bg={meta.bg} color={meta.color} small>{meta.label}</Chip>;
}

function TypeChip({ type }: { type: StoreRequestType }) {
  const meta = REQUEST_TYPE_META[type];
  return <Chip bg={meta.bg} color={meta.color} small>{meta.short}</Chip>;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent = C.black,
  trend,
  trendUp,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className="hr-stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', minHeight: 132 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.055em' }}>
          {label}
        </span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 900, color: accent, letterSpacing: '-0.03em', marginTop: 10 }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 5 }}>
        <span style={{ fontSize: '0.72rem', color: C.muted, lineHeight: 1.35 }}>{sub}</span>
        {trend && (
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: trendUp ? C.green : C.red, whiteSpace: 'nowrap' }}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ pct, color = C.black, height = 8 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ width: '100%', height, background: '#eef2f6', borderRadius: height, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color, borderRadius: height }} />
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: '36px 20px', textAlign: 'center', color: C.muted }}>
      <div style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: 14, background: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        {icon || <PackageSearch size={22} color={C.dim} />}
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{message}</div>
    </div>
  );
}

type NewMovementInput = {
  type: StoreRequestType;
  title: string;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  totalValue: number;
  unit: Item['unit'];
  unitCost: number;
  fromStoreId?: string;
  toStoreId?: string;
  referenceNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  supplierName?: string;
  reason: string;
  notes?: string;
  priority: StorePriority;
  direction: StoreApprovalRequest['direction'];
  qcResult?: StoreApprovalRequest['qcResult'];
  acceptedQty?: number;
  rejectedQty?: number;
  binCode?: string;
  evidence?: string[];
  systemQty?: number;
  countedQty?: number;
  varianceQty?: number;
};

export type StoreTab =
  | 'overview'
  | 'purchasing'
  | 'suppliers'
  | 'catalog'
  | 'inbound'
  | 'outbound'
  | 'adjustments'
  | 'wastage'
  | 'approvals'
  | 'admin'
  | 'reports'
  | 'warehouses'
  | 'analytics'
  | 'audit'
  | 'staff';

const STORE_TABS: StoreTab[] = [
  'overview',
  'purchasing',
  'suppliers',
  'catalog',
  'inbound',
  'outbound',
  'adjustments',
  'wastage',
  'approvals',
  'admin',
  'reports',
  'warehouses',
  'analytics',
  'audit',
  'staff',
];

export default function StoreModule() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    items,
    stores,
    orders,
    suppliers,
    purchaseOrders,
    stockMovements,
    wastages,
    lowStockItems,
    currentRole,
    setCurrentRole,
    addItem,
    addSupplier,
    updateSupplier,
    addStockMovement,
    recordWastage,
    createPurchaseOrder,
    receivePurchaseOrder,
    approvePurchaseOrder,
    updatePurchaseOrderStatus,
  } = useErp();

  const roleView: StoreModuleRole =
    currentRole === 'admin' || currentRole === 'general_manager'
      ? 'admin'
      : currentRole === 'super_admin'
        ? 'super_admin'
        : currentRole === 'procurement_officer'
          ? 'purchasing'
          : currentRole === 'employee' || currentRole === 'machine_operator'
            ? 'staff'
            : currentRole === 'production_supervisor'
              ? 'store_supervisor'
              : 'storekeeper';
  const tabParam = searchParams.get('tab');
  const activeTab: StoreTab =
    tabParam && STORE_TABS.includes(tabParam as StoreTab) ? (tabParam as StoreTab) : 'overview';
  const setActiveTab = (tab: StoreTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [requests, setRequests] = useState<StoreApprovalRequest[]>(INITIAL_STORE_REQUESTS);
  const [notifications, setNotifications] = useState<StoreNotification[]>(INITIAL_STORE_NOTIFICATIONS);
  const [auditEvents, setAuditEvents] = useState<StoreAuditEvent[]>(INITIAL_STORE_AUDIT_EVENTS);
  const [cycleCounts, setCycleCounts] = useState<CycleCountTask[]>(INITIAL_CYCLE_COUNTS);
  const [settings, setSettings] = useState(INITIAL_STORE_SETTINGS);
  const [bins] = useState(INITIAL_STORE_BINS);
  const [batches] = useState(INITIAL_STOCK_BATCHES);
  const [supplierScorecards] = useState(INITIAL_SUPPLIER_SCORECARDS);

  const [toast, setToast] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<{ request: StoreApprovalRequest; action: 'approved' | 'rejected' } | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [decisionEvidence, setDecisionEvidence] = useState<string[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [receivedTransferIds, setReceivedTransferIds] = useState<string[]>([]);
  const [manuallyIssuedStaffRequestIds, setManuallyIssuedStaffRequestIds] = useState<string[]>(['sreq-staff-03']);
  const [returnTarget, setReturnTarget] = useState<StoreApprovalRequest | null>(null);
  const [returnQty, setReturnQty] = useState('1');
  const [returnCondition, setReturnCondition] = useState<'reusable' | 'damaged'>('reusable');
  const [returnReason, setReturnReason] = useState('');

  // Catalog filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'low' | 'expiring' | 'dead' | 'quarantine'>('all');
  const [catalogType, setCatalogType] = useState('all');
  const [catalogSort, setCatalogSort] = useState<'value_desc' | 'name_asc' | 'stock_asc' | 'stock_desc'>('value_desc');
  const [catalogPage, setCatalogPage] = useState(1);
  const CATALOG_PAGE_SIZE = 6;

  // Approval filters
  const [approvalFilter, setApprovalFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [approvalSearch, setApprovalSearch] = useState('');

  // Audit filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSeverity, setAuditSeverity] = useState('all');

  // Request form
  const [formType, setFormType] = useState<StoreRequestType>('goods_receipt');
  const [formItemId, setFormItemId] = useState(items[0]?.id || '');
  const [formFromStore, setFormFromStore] = useState(stores[0]?.id || '');
  const [formToStore, setFormToStore] = useState(stores[1]?.id || stores[0]?.id || '');
  const [formQty, setFormQty] = useState(1);
  const [formUnitCost, setFormUnitCost] = useState(0);
  const [formUnit, setFormUnit] = useState<Item['unit']>('piece');
  const [formSupplier, setFormSupplier] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPriority, setFormPriority] = useState<StorePriority>('normal');
  const [formQc, setFormQc] = useState<NonNullable<StoreApprovalRequest['qcResult']>>('passed');
  const [formSystemQty, setFormSystemQty] = useState(0);
  const [formCountedQty, setFormCountedQty] = useState(0);
  const [formAcceptedQty, setFormAcceptedQty] = useState(1);
  const [formRejectedQty, setFormRejectedQty] = useState(0);
  const [formBin, setFormBin] = useState('A-01');
  const [formEvidence, setFormEvidence] = useState<string[]>([]);
  const [formNewItemName, setFormNewItemName] = useState('');
  const [formNewItemCode, setFormNewItemCode] = useState('');
  const [formDepartment, setFormDepartment] = useState('Production');
  const [requestSeq, setRequestSeq] = useState(1042);

  // Cycle count schedule form
  const [countStore, setCountStore] = useState(stores[0]?.id || '');
  const [countItemId, setCountItemId] = useState(items[0]?.id || '');
  const [countZone, setCountZone] = useState('Zone A — Rolled Media');
  const [countCounter, setCountCounter] = useState('Hanna Girma');
  const [countDate, setCountDate] = useState('2026-10-23');
  const [countSeq, setCountSeq] = useState(93);

  // Purchasing State
  const [showPoModal, setShowPoModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poItemId, setPoItemId] = useState(items[0]?.id || '');
  const [poQty, setPoQty] = useState(20);
  const [poUnitPrice, setPoUnitPrice] = useState(items[0]?.purchasePrice || 100);
  const [poDeliveryDate, setPoDeliveryDate] = useState('2026-10-28');
  const [poDeliveryStoreId, setPoDeliveryStoreId] = useState(stores[0]?.id || '');
  const [poPaymentTerms, setPoPaymentTerms] = useState(suppliers[0]?.paymentTerms || '30 Days');
  const [poNotes, setPoNotes] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | POStatus>('all');
  const [poSearch, setPoSearch] = useState('');
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);

  // GRN Receiving State (from PO)
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [receivingStoreId, setReceivingStoreId] = useState(stores[0]?.id || '');
  const [receivingDeliveryNote, setReceivingDeliveryNote] = useState('DN-8921-ET');
  const [receivingInspector, setReceivingInspector] = useState('Dawit Bekele (Quality Inspector)');
  const [receivingQuality, setReceivingQuality] = useState<'passed' | 'partial' | 'failed'>('passed');

  const isAdmin = roleView === 'admin' || roleView === 'super_admin';
  const isStaff = roleView === 'staff';
  const isPurchasing = roleView === 'purchasing';
  const roleLabel: Record<StoreModuleRole, string> = {
    staff: 'Staff Requester',
    storekeeper: 'Storekeeper',
    purchasing: 'Purchasing & Procurement',
    store_supervisor: 'Store Supervisor',
    admin: 'Admin Operations',
    super_admin: 'Super Admin Master',
  };
  const currentUserName =
    roleView === 'staff'
      ? 'Yonas Kebede'
      : roleView === 'storekeeper'
        ? 'Dawit Bekele'
        : roleView === 'purchasing'
          ? 'Almaz Tadesse (Purchasing)'
          : roleView === 'store_supervisor'
            ? 'Hanna Girma'
            : roleView === 'admin'
              ? 'Mulugeta Teshome'
              : 'Sofiya Alemu';

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  };

  const handleSwitchRole = (next: StoreModuleRole) => {
    if (next === 'staff') setCurrentRole('employee');
    else if (next === 'storekeeper') setCurrentRole('storekeeper');
    else if (next === 'purchasing') setCurrentRole('procurement_officer');
    else if (next === 'store_supervisor') setCurrentRole('production_supervisor');
    else if (next === 'admin') setCurrentRole('admin');
    else setCurrentRole('super_admin');
    setActiveTab(next === 'purchasing' ? 'purchasing' : 'overview');
  };

  const addAudit = (event: Omit<StoreAuditEvent, 'id'>) => {
    setAuditEvents((prev) => [{ ...event, id: `aud-${Date.now()}-${Math.random().toString(16).slice(2, 6)}` }, ...prev]);
  };

  const pushNotification = (notification: Omit<StoreNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `snot-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        timestamp: nowStamp(),
        read: false,
      },
      ...prev,
    ]);
  };

  const visibleNotifications = useMemo(() => {
    const audience = isAdmin ? 'admin' : isStaff ? 'staff' : 'storekeeper';
    return notifications
      .filter((n) => n.audience === 'all' || n.audience === audience)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [notifications, isAdmin, isStaff]);

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;
  const pendingRequests = requests.filter((r) => r.status === 'pending_admin');
  const catalogVal = (item: Item) => item.currentStock * item.purchasePrice;

  const totalValuation = items.reduce((sum, item) => sum + catalogVal(item), 0);
  const totalWastageValue = wastages.reduce((sum, w) => sum + w.totalCost, 0);
  const expiringBatches = batches.filter(
    (b) => b.status === 'expiring' || b.status === 'expired' || daysUntil(b.expiryDate) <= settings.expiryWarningDays
  );
  const deadStockItems = items.filter((item) => item.averageDailyUsage === 0 && item.currentStock > 0);
  const completedCounts = cycleCounts.filter((c) => c.countedQty !== undefined && c.systemQty > 0);
  const inventoryAccuracy = completedCounts.length
    ? 100 - (completedCounts.reduce((sum, c) => sum + Math.abs((c.varianceQty || 0) / c.systemQty) * 100, 0) / completedCounts.length)
    : 100;

  const storeStats = stores.map((store: Store) => {
    const storeItems = items.filter((item) => (item.storeBalances[store.id] || 0) > 0);
    const value = items.reduce((sum, item) => sum + (item.storeBalances[store.id] || 0) * item.purchasePrice, 0);
    const storeBins = bins.filter((b) => b.storeId === store.id);
    const cap = storeBins.reduce((sum, b) => sum + b.capacitySqm, 0);
    const used = storeBins.reduce((sum, b) => sum + b.usedSqm, 0);
    return {
      store,
      skuCount: storeItems.length,
      value,
      utilization: cap ? (used / cap) * 100 : 0,
      bins: storeBins.length,
    };
  });

  const abcMap = useMemo(() => {
    const sorted = [...items].sort((a, b) => catalogVal(b) - catalogVal(a));
    const total = sorted.reduce((sum, item) => sum + catalogVal(item), 0) || 1;
    let cumulative = 0;
    const result: Record<string, 'A' | 'B' | 'C'> = {};
    sorted.forEach((item) => {
      cumulative += catalogVal(item);
      const pct = cumulative / total;
      result[item.id] = pct <= 0.8 ? 'A' : pct <= 0.95 ? 'B' : 'C';
    });
    return result;
  }, [items]);

  const itemHasExpiringBatch = (itemId: string) =>
    batches.some(
      (b) => b.itemId === itemId && (b.status === 'expiring' || b.status === 'expired' || daysUntil(b.expiryDate) <= settings.expiryWarningDays)
    );

  const catalogFiltered = items.filter((item) => {
    const q = catalogSearch.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.amharicName || '').includes(catalogSearch);
    const matchesType = catalogType === 'all' || item.type === catalogType;
    let matchesFilter = true;
    if (catalogFilter === 'low') matchesFilter = item.currentStock <= item.reorderLevel;
    if (catalogFilter === 'expiring') matchesFilter = itemHasExpiringBatch(item.id);
    if (catalogFilter === 'dead') matchesFilter = item.averageDailyUsage === 0 && item.currentStock > 0;
    if (catalogFilter === 'quarantine') matchesFilter = batches.some((b) => b.itemId === item.id && b.status === 'quarantine');
    return matchesSearch && matchesType && matchesFilter;
  });

  const catalogSorted = [...catalogFiltered].sort((a, b) => {
    if (catalogSort === 'name_asc') return a.name.localeCompare(b.name);
    if (catalogSort === 'stock_asc') return a.currentStock - b.currentStock;
    if (catalogSort === 'stock_desc') return b.currentStock - a.currentStock;
    return catalogVal(b) - catalogVal(a);
  });
  const totalCatalogPages = Math.max(1, Math.ceil(catalogSorted.length / CATALOG_PAGE_SIZE));
  const currentCatalogPage = Math.min(catalogPage, totalCatalogPages);
  const catalogPageRows = catalogSorted.slice((currentCatalogPage - 1) * CATALOG_PAGE_SIZE, currentCatalogPage * CATALOG_PAGE_SIZE);

  const approvedSupplierReturns = requests
    .filter((request) => request.type === 'supplier_return' && request.status === 'approved')
    .sort((a, b) => (b.approvedAt || '').localeCompare(a.approvedAt || ''));
  const approvedTransfers = requests
    .filter((request) => request.type === 'inter_store_transfer' && request.status === 'approved')
    .sort((a, b) => (b.approvedAt || '').localeCompare(a.approvedAt || ''));
  const staffRequests = requests
    .filter((request) => request.type === 'staff_requisition')
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const myStaffRequests = staffRequests.filter((request) => request.requestedBy === currentUserName);
  const issuedStaffRequestIds = Array.from(
    new Set([
      ...manuallyIssuedStaffRequestIds,
      ...staffRequests
        .filter((request) =>
          stockMovements.some(
            (movement) =>
              movement.referenceNumber === request.requestNumber &&
              movement.movementType === 'production_issue'
          )
        )
        .map((request) => request.id),
    ])
  );
  const staffIssueQueue = staffRequests.filter(
    (request) => request.status === 'approved' && !issuedStaffRequestIds.includes(request.id)
  );
  const staffReturns = requests
    .filter((request) => request.type === 'staff_return')
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const myStaffReturns = staffReturns.filter((request) => request.requestedBy === currentUserName);
  const reservedReturnQty = (sourceRequestId: string) =>
    staffReturns
      .filter(
        (request) =>
          request.returnOfRequestId === sourceRequestId && request.status !== 'rejected'
      )
      .reduce((sum, request) => sum + request.quantity, 0);

  const approvalFiltered = requests
    .filter((request) => {
      if (approvalFilter === 'pending') return request.status === 'pending_admin';
      if (approvalFilter === 'approved') return request.status === 'approved';
      if (approvalFilter === 'rejected') return request.status === 'rejected';
      return true;
    })
    .filter((request) => {
      const q = approvalSearch.toLowerCase();
      return (
        request.requestNumber.toLowerCase().includes(q) ||
        request.title.toLowerCase().includes(q) ||
        (request.itemName || '').toLowerCase().includes(q) ||
        request.requestedBy.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.status === 'pending_admin' && b.status !== 'pending_admin') return -1;
      if (b.status === 'pending_admin' && a.status !== 'pending_admin') return 1;
      return b.requestedAt.localeCompare(a.requestedAt);
    });

  const auditFiltered = auditEvents
    .filter((event) => auditSeverity === 'all' || event.severity === auditSeverity)
    .filter((event) => {
      const q = auditSearch.toLowerCase();
      return (
        event.action.toLowerCase().includes(q) ||
        event.detail.toLowerCase().includes(q) ||
        event.actor.toLowerCase().includes(q) ||
        (event.requestNumber || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const formItem = items.find((item) => item.id === formItemId);
  const returnAvailableQty = returnTarget
    ? returnTarget.quantity - reservedReturnQty(returnTarget.id)
    : 0;

  const openMovement = (type: StoreRequestType, itemId?: string, storeId?: string) => {
    if (settings.freezeAllMovements) {
      notify('Store movements are frozen by Admin. Resume operations from Governance settings first.');
      return;
    }
    const item = items.find((i) => i.id === (itemId || formItemId)) || items[0];
    const from = storeId || stores[0]?.id || '';
    const initialQty = type === 'reorder_request' ? item?.reorderQuantity || 1 : 1;
    setFormType(type);
    setFormItemId(item?.id || '');
    setFormFromStore(from);
    setFormToStore(stores[1]?.id || stores[0]?.id || '');
    setFormQty(initialQty);
    setFormAcceptedQty(initialQty);
    setFormRejectedQty(0);
    setFormBin('A-01');
    setFormEvidence([]);
    setFormUnitCost(item?.purchasePrice || 0);
    setFormUnit(item?.unit || 'piece');
    setFormSupplier(item?.preferredSupplierName || suppliers[0]?.name || '');
    setFormReference('');
    setFormBatch('');
    setFormExpiry('');
    setFormReason('');
    setFormNotes('');
    setFormPriority('normal');
    setFormQc('passed');
    const system = item ? (storeId ? item.storeBalances[storeId] || 0 : item.currentStock) : 0;
    setFormSystemQty(system);
    setFormCountedQty(system);
    setFormNewItemName('');
    setFormNewItemCode('');
    setShowMovementModal(true);
  };

  const handleFormItemChange = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setFormItemId(itemId);
    if (item) {
      setFormUnitCost(item.purchasePrice);
      setFormUnit(item.unit);
      setFormSupplier(item.preferredSupplierName || '');
      const system = formFromStore ? item.storeBalances[formFromStore] || 0 : item.currentStock;
      setFormSystemQty(system);
      setFormCountedQty(system);
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.freezeAllMovements) {
      notify('Blocked: Admin has frozen all store movements.');
      return;
    }

    const isOnboarding = formType === 'item_onboarding';
    const item = items.find((i) => i.id === formItemId);
    if (!isOnboarding && !item) {
      notify('Select a valid stock item before submitting.');
      return;
    }
    if (!formReason.trim()) {
      notify('A business justification is mandatory for every store action.');
      return;
    }

    let quantity = Number(formQty) || 0;
    let systemQty: number | undefined;
    let countedQty: number | undefined;
    let varianceQty: number | undefined;

    if (formType === 'stock_adjustment') {
      systemQty = Number(formSystemQty);
      countedQty = Number(formCountedQty);
      varianceQty = countedQty - systemQty;
      quantity = Math.abs(varianceQty);
      if (quantity === 0) {
        notify('No variance detected. A zero-value adjustment cannot be submitted.');
        return;
      }
    }

    if (quantity <= 0 && formType !== 'item_onboarding') {
      notify('Quantity must be greater than zero.');
      return;
    }

    const itemName = isOnboarding ? formNewItemName.trim() : item?.name || '';
    if (!itemName) {
      notify('Item name is required.');
      return;
    }
    if (isOnboarding) {
      const code = formNewItemCode.trim();
      if (!code) {
        notify('A unique SKU code is required for onboarding.');
        return;
      }
      if (items.some((i) => i.code.toLowerCase() === code.toLowerCase())) {
        notify(`SKU code ${code} already exists in the catalog.`);
        return;
      }
      if (requests.some((request) => request.type === 'item_onboarding' && request.status === 'pending_admin' && request.itemCode?.toLowerCase() === code.toLowerCase())) {
        notify(`SKU code ${code} already has a pending onboarding request.`);
        return;
      }
    }

    let acceptedQty: number | undefined;
    let rejectedQty: number | undefined;
    if (formType === 'goods_receipt') {
      acceptedQty = Math.max(0, Number(formAcceptedQty) || 0);
      rejectedQty = Math.max(0, Number(formRejectedQty) || 0);
      if (acceptedQty + rejectedQty !== quantity) {
        notify('Accepted and rejected quantities must equal the delivered quantity.');
        return;
      }
      if (acceptedQty === 0 && formQc !== 'failed') {
        notify('A receipt with zero accepted quantity must be marked as failed QC.');
        return;
      }
    }

    const unitCost = isOnboarding ? Number(formUnitCost) || 0 : item?.purchasePrice || 0;
    const totalValue = quantity * unitCost;
    const priority: StorePriority =
      totalValue >= settings.criticalValueThreshold
        ? 'critical'
        : totalValue >= settings.highValueThreshold
          ? 'high'
          : formPriority;
    const slaHours = formType === 'item_onboarding' ? 48 : priority === 'critical' ? 4 : priority === 'high' ? 8 : 24;
    const destinationStore = stores.find((s) => s.id === formToStore);
    const sourceStore = stores.find((s) => s.id === formFromStore);

    const direction: StoreApprovalRequest['direction'] =
      formType === 'goods_receipt' || formType === 'reorder_request' || formType === 'item_onboarding'
        ? 'inbound'
        : formType === 'inter_store_transfer'
          ? 'internal'
          : formType === 'cycle_count' && (varianceQty || 0) > 0
            ? 'inbound'
            : formType === 'stock_adjustment' && (varianceQty || 0) > 0
              ? 'inbound'
              : 'outbound';

    const typeTitles: Record<StoreRequestType, string> = {
      goods_receipt: 'Goods Receipt Request',
      material_issue: 'Material Issue Request',
      staff_requisition: 'Staff Item Requisition',
      staff_return: 'Staff Item Return Request',
      inter_store_transfer: 'Inter-Store Transfer Request',
      stock_adjustment: 'Stock Adjustment Request',
      cycle_count: 'Cycle Count Variance Request',
      wastage: 'Wastage / Scrap Request',
      supplier_return: 'Supplier Return Request',
      reorder_request: 'Reorder Request',
      item_onboarding: 'New SKU Onboarding Request',
    };

    const input: NewMovementInput = {
      type: formType,
      title: `${typeTitles[formType]} — ${itemName}`,
      itemId: isOnboarding ? undefined : item?.id,
      itemCode: isOnboarding ? formNewItemCode.trim() || 'NEW-SKU' : item?.code,
      itemName,
      quantity,
      totalValue,
      unit: isOnboarding ? formUnit : item?.unit || 'piece',
      unitCost,
      fromStoreId: formType === 'goods_receipt' || formType === 'reorder_request' || formType === 'item_onboarding' ? undefined : formFromStore,
      toStoreId:
        formType === 'material_issue' || formType === 'wastage' || formType === 'supplier_return' || formType === 'staff_requisition'
          ? undefined
          : formType === 'stock_adjustment' || formType === 'cycle_count'
            ? direction === 'inbound'
              ? formFromStore
              : undefined
            : formToStore,
      referenceNumber: formReference.trim() || undefined,
      batchNumber: formBatch.trim() || undefined,
      expiryDate: formExpiry || undefined,
      supplierName: formSupplier || undefined,
      reason: formReason.trim(),
      notes: formNotes.trim() || undefined,
      priority,
      direction,
      qcResult: formType === 'goods_receipt' ? formQc : 'not_applicable',
      acceptedQty,
      rejectedQty,
      binCode: formType === 'goods_receipt' ? formBin.trim() || undefined : undefined,
      evidence: formEvidence.length ? formEvidence : undefined,
      systemQty,
      countedQty,
      varianceQty,
    };

    // Adjustment outbound uses source store
    if ((formType === 'stock_adjustment' || formType === 'cycle_count') && direction === 'outbound') {
      input.fromStoreId = formFromStore;
      input.toStoreId = undefined;
    }

    const requestNumber = `STR-REQ-2026-${requestSeq}`;
    const newRequest: StoreApprovalRequest = {
      ...input,
      id: `sreq-${Date.now()}`,
      requestNumber,
      fromStoreName: sourceStore?.name,
      toStoreName:
        formType === 'staff_requisition'
          ? `Staff Pickup — ${formDepartment}`
          : formType === 'material_issue'
            ? formReference.trim() || 'Production Floor'
            : destinationStore?.name,
      requestedBy: currentUserName,
      requestedByRole:
        isStaff ? 'Staff' : roleView === 'storekeeper' ? 'Storekeeper' : 'Store Supervisor',
      requestedAt: nowStamp(),
      status: 'pending_admin',
      slaHours,
      signatureCode: `SIG-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${requestSeq}`,
    };

    setRequests((prev) => [newRequest, ...prev]);
    setRequestSeq((prev) => prev + 1);
    pushNotification({
      type: 'approval_request',
      severity: priority === 'critical' ? 'critical' : priority === 'high' ? 'warning' : 'info',
      title: `${priority === 'critical' ? 'Critical approval required' : 'Approval required'} — ${REQUEST_TYPE_META[formType].label}`,
      message: `${currentUserName} submitted ${requestNumber} (${formatETB(totalValue)}). Admin decision required within ${slaHours} hours.`,
      requestId: newRequest.id,
      requestNumber,
      audience: 'admin',
    });
    addAudit({
      timestamp: nowStamp(),
      action: 'REQUEST_SUBMITTED',
      entity: REQUEST_TYPE_META[formType].label,
      actor: `${currentUserName} (${roleLabel[roleView]})`,
      detail: `${requestNumber} submitted for ${itemName} (${formatETB(totalValue)}). Routed to Admin for approval.`,
      severity: priority === 'critical' ? 'critical' : 'info',
      requestNumber,
    });
    if (formType === 'staff_requisition') {
      pushNotification({
        type: 'approval_request',
        severity: 'info',
        title: `Item request submitted — ${requestNumber}`,
        message: `Your request for ${quantity} ${item?.unit || formUnit} of ${itemName} is pending Admin approval. The storekeeper will be notified once approved.`,
        requestId: newRequest.id,
        requestNumber,
        audience: 'staff',
      });
    }
    setShowMovementModal(false);
    notify(
      formType === 'staff_requisition'
        ? `${requestNumber} submitted. Admin notified — the storekeeper will prepare the item after approval.`
        : `${requestNumber} submitted. Admin notified — stock ledger will post only after approval.`
    );
  };

  const applyApprovedRequest = (request: StoreApprovalRequest) => {
    if (request.type === 'item_onboarding') {
      const supplier = suppliers.find((s) => s.name === request.supplierName) || suppliers[0];
      const createdItem = addItem({
        code: request.itemCode?.trim() || `SKU-${request.requestNumber.slice(-4)}`,
        name: request.itemName || 'New SKU',
        type: 'raw_material',
        unit: request.unit,
        purchasePrice: request.unitCost,
        sellingPrice: request.unitCost,
        vatRate: supplier?.isVatRegistered ? 0.15 : 0,
        vatType: supplier?.isVatRegistered ? 'standard_15' : 'exempt',
        reorderLevel: Math.max(1, Math.ceil(request.quantity * 0.5)),
        reorderQuantity: Math.max(1, request.quantity),
        currentStock: 0,
        averageDailyUsage: 0,
        preferredSupplierId: supplier?.id,
        preferredSupplierName: supplier?.name || request.supplierName,
        storeBalances: {},
      });
      addAudit({
        timestamp: nowStamp(),
        action: 'SKU_ACTIVATED',
        entity: 'Stock Catalog',
        actor: `${currentUserName} (Admin)`,
        detail: `${createdItem.code} — ${createdItem.name} activated in the catalog from ${request.requestNumber}. No stock posted; receive quantity via GRN into ${request.toStoreName || 'Main Store'}.`,
        severity: 'success',
        requestNumber: request.requestNumber,
      });
      pushNotification({
        type: 'approved',
        severity: 'success',
        title: `New SKU activated — ${createdItem.code}`,
        message: `${createdItem.name} is now available in the stock catalog and can be received, issued or counted.`,
        requestNumber: request.requestNumber,
        audience: 'all',
      });
      return;
    }

    if (!request.itemId) return;
    const item = items.find((i) => i.id === request.itemId);
    if (!item) return;
    const unitCost = request.unitCost || item.purchasePrice;

    if (request.type === 'staff_requisition') {
      addAudit({
        timestamp: nowStamp(),
        action: 'STAFF_REQUISITION_APPROVED',
        entity: item.name,
        actor: `${currentUserName} (Admin)`,
        detail: `${request.requestNumber} approved for ${request.requestedBy} — ${request.quantity} ${item.unit}. Routed to Storekeeper for issue from ${request.fromStoreName || 'main store'}.`,
        severity: 'success',
        requestNumber: request.requestNumber,
      });
      pushNotification({
        type: 'approved',
        severity: 'success',
        title: `Issue approved item — ${request.requestNumber}`,
        message: `Admin approved ${request.quantity} ${item.unit} of ${item.name} for ${request.requestedBy}. Prepare the item for collection at ${request.fromStoreName || 'main store'}.`,
        requestId: request.id,
        requestNumber: request.requestNumber,
        audience: 'storekeeper',
      });
      pushNotification({
        type: 'approved',
        severity: 'success',
        title: `Request approved — ${request.requestNumber}`,
        message: `Admin approved your request for ${request.quantity} ${item.unit} of ${item.name}. The storekeeper is preparing it for collection at ${request.fromStoreName || 'the store'}.`,
        requestId: request.id,
        requestNumber: request.requestNumber,
        audience: 'staff',
      });
      return;
    }

    if (request.type === 'staff_return') {
      const storeId = request.fromStoreId || stores[0]?.id;
      if (!storeId) return;
      addStockMovement({
        itemId: request.itemId,
        toStoreId: storeId,
        movementType: 'return',
        quantity: request.quantity,
        unitCost,
        referenceType: 'ADJUSTMENT',
        referenceNumber: request.requestNumber,
        notes: `Admin-approved staff return ${request.requestNumber} from ${request.requestedBy}. Condition: ${request.returnCondition || 'reusable'}.`,
      });
      if (request.returnCondition === 'damaged') {
        recordWastage({
          itemId: request.itemId,
          quantity: request.quantity,
          storeId,
          reason: 'damaged',
          notes: `Damaged item returned by ${request.requestedBy} under ${request.requestNumber}. Wastage write-off covered by the same Admin approval.`,
        });
      }
      addAudit({
        timestamp: nowStamp(),
        action: request.returnCondition === 'damaged' ? 'STAFF_RETURN_DAMAGED_WRITTEN_OFF' : 'STAFF_RETURN_RESTOCKED',
        entity: item.name,
        actor: `${currentUserName} (Admin)`,
        detail: `${request.quantity} ${item.unit} of ${item.name} returned by ${request.requestedBy} against ${request.referenceNumber || 'original issue'}. ${request.returnCondition === 'damaged' ? 'Wastage write-off posted after Admin approval.' : 'Returned to stock after Admin approval.'}`,
        severity: request.returnCondition === 'damaged' ? 'warning' : 'success',
        requestNumber: request.requestNumber,
      });
      pushNotification({
        type: 'approved',
        severity: request.returnCondition === 'damaged' ? 'warning' : 'success',
        title: `Return approved — ${request.requestNumber}`,
        message: request.returnCondition === 'damaged'
          ? `${request.quantity} ${item.unit} of ${item.name} accepted back and written off as damaged with Admin approval.`
          : `${request.quantity} ${item.unit} of ${item.name} returned to ${request.fromStoreName || 'the store'}. Stock has been restored.`,
        requestId: request.id,
        requestNumber: request.requestNumber,
        audience: 'staff',
      });
      return;
    }

    if (request.type === 'reorder_request') {
      const supplier = suppliers.find((s) => s.name === request.supplierName) || suppliers[0];
      const vatRate = supplier?.isVatRegistered ? 0.15 : 0;
      const vatAmount = request.totalValue * vatRate;
      createPurchaseOrder({
        supplierId: supplier?.id || 'supplier-1',
        supplierName: supplier?.name || request.supplierName || 'Unassigned supplier',
        supplierTin: supplier?.tin || 'N/A',
        items: [
          {
            itemId: item.id,
            itemName: item.name,
            quantity: request.quantity,
            unit: item.unit,
            unitPrice: unitCost,
            vatRate,
            vatAmount,
            totalAmount: request.totalValue + vatAmount,
          },
        ],
        subtotal: request.totalValue,
        vatTotal: vatAmount,
        grandTotal: request.totalValue + vatAmount,
        expectedDeliveryDate: new Date(NOW_MS + 7 * 86400000).toISOString().slice(0, 10),
        requestedBy: request.requestedBy,
        approvedBy: `${currentUserName} (Admin)`,
        paymentTerms: supplier?.paymentTerms || '30 Days',
        notes: `Auto-created from approved reorder ${request.requestNumber}.`,
      });
      addAudit({
        timestamp: nowStamp(),
        action: 'PURCHASE_ORDER_CREATED',
        entity: 'Procurement',
        actor: `${currentUserName} (Admin)`,
        detail: `A purchase order was generated for ${request.quantity} ${item.unit} of ${item.name} from reorder ${request.requestNumber}. Supplier: ${supplier?.name || request.supplierName || 'Unassigned'}.`,
        severity: 'success',
        requestNumber: request.requestNumber,
      });
      pushNotification({
        type: 'approved',
        severity: 'success',
        title: `Purchase order created — ${item.name}`,
        message: `Reorder ${request.requestNumber} was converted into a purchase order for ${formatETB(request.totalValue + vatAmount)}. Track it under Inbound → Open POs.`,
        requestNumber: request.requestNumber,
        audience: 'all',
      });
      return;
    }

    if (request.type === 'goods_receipt') {
      const acceptedQty = Math.max(0, request.acceptedQty ?? request.quantity);
      const rejectedQty = Math.max(0, request.rejectedQty ?? 0);
      const destination = stores.find((s) => s.id === (request.toStoreId || stores[0]?.id));
      if (acceptedQty > 0) {
        addStockMovement({
          itemId: request.itemId,
          toStoreId: request.toStoreId || stores[0]?.id,
          movementType: 'purchase_receipt',
          quantity: acceptedQty,
          unitCost,
          referenceType: 'PO',
          referenceNumber: request.referenceNumber || request.requestNumber,
          notes: `Admin-approved receipt ${request.requestNumber}. Accepted ${acceptedQty} ${item.unit}; rejected ${rejectedQty} ${item.unit}. Put-away bin ${request.binCode || 'unassigned'}. ${request.notes || ''}`,
        });
      }
      addAudit({
        timestamp: nowStamp(),
        action: rejectedQty > 0 ? 'GRN_PARTIAL_ACCEPTANCE' : 'GRN_ACCEPTED',
        entity: item.name,
        actor: `${currentUserName} (Admin)`,
        detail: `${request.requestNumber}: accepted ${acceptedQty} ${item.unit}${rejectedQty ? `, rejected ${rejectedQty} ${item.unit}` : ''} at ${destination?.name || 'Main Store'} / bin ${request.binCode || 'unassigned'}. QC ${request.qcResult?.replaceAll('_', ' ') || 'not applicable'}.`,
        severity: rejectedQty > 0 ? 'warning' : 'success',
        requestNumber: request.requestNumber,
      });
      if (rejectedQty > 0) {
        pushNotification({
          type: 'stock_alert',
          severity: 'warning',
          title: `QC rejection recorded — ${item.name}`,
          message: `${rejectedQty} ${item.unit} rejected on ${request.requestNumber}. ${acceptedQty} ${item.unit} accepted and posted to ${destination?.name || 'store'}. Supplier debit note may be required.`,
          requestNumber: request.requestNumber,
          audience: 'all',
        });
      }
      return;
    }

    if (request.type === 'material_issue') {
      addStockMovement({
        itemId: request.itemId,
        fromStoreId: request.fromStoreId || stores[0]?.id,
        movementType: 'production_issue',
        quantity: request.quantity,
        unitCost,
        referenceType: 'WORK_ORDER',
        referenceNumber: request.referenceNumber || request.requestNumber,
        notes: `Admin-approved issue ${request.requestNumber}. ${request.notes || ''}`,
      });
      return;
    }

    if (request.type === 'inter_store_transfer') {
      addStockMovement({
        itemId: request.itemId,
        fromStoreId: request.fromStoreId,
        toStoreId: request.toStoreId,
        movementType: 'transfer',
        quantity: request.quantity,
        unitCost,
        referenceType: 'ADJUSTMENT',
        referenceNumber: request.referenceNumber || request.requestNumber,
        notes: `Admin-approved transfer ${request.requestNumber}. ${request.notes || ''}`,
      });
      addAudit({
        timestamp: nowStamp(),
        action: 'TRANSFER_DISPATCHED',
        entity: item.name,
        actor: `${currentUserName} (Admin)`,
        detail: `${request.requestNumber}: ${request.quantity} ${item.unit} dispatched from ${request.fromStoreName || 'source store'} to ${request.toStoreName || 'destination store'}. Awaiting physical receipt confirmation.`,
        severity: 'info',
        requestNumber: request.requestNumber,
      });
      return;
    }

    if (request.type === 'supplier_return') {
      addStockMovement({
        itemId: request.itemId,
        fromStoreId: request.fromStoreId || stores[0]?.id,
        movementType: 'return',
        quantity: request.quantity,
        unitCost,
        referenceType: 'ADJUSTMENT',
        referenceNumber: request.requestNumber,
        notes: `Admin-approved supplier return ${request.requestNumber}. ${request.notes || ''}`,
      });
      const debitNoteNumber = `DN-2026-${request.requestNumber.split('-').pop()}`;
      addAudit({
        timestamp: nowStamp(),
        action: 'SUPPLIER_DEBIT_NOTE_ISSUED',
        entity: request.supplierName || 'Supplier Return',
        actor: `${currentUserName} (Admin)`,
        detail: `${debitNoteNumber} issued for ${request.quantity} ${item.unit} of ${item.name} returned to ${request.supplierName || 'supplier'}. Value ${formatETB(request.totalValue)} recoverable.`,
        severity: 'warning',
        requestNumber: request.requestNumber,
      });
      pushNotification({
        type: 'approved',
        severity: 'success',
        title: `Debit note issued — ${debitNoteNumber}`,
        message: `${formatETB(request.totalValue)} supplier return posted for ${item.name}. Debit note ${debitNoteNumber} is available in Outbound control.`,
        requestNumber: request.requestNumber,
        audience: 'all',
      });
      return;
    }

    if (request.type === 'stock_adjustment' || request.type === 'cycle_count') {
      if (!request.varianceQty) return;
      const delta = Math.abs(request.varianceQty);
      addStockMovement({
        itemId: request.itemId,
        fromStoreId: request.varianceQty < 0 ? request.fromStoreId || stores[0]?.id : undefined,
        toStoreId: request.varianceQty > 0 ? request.toStoreId || request.fromStoreId || stores[0]?.id : undefined,
        movementType: 'adjustment',
        quantity: delta,
        unitCost,
        referenceType: 'ADJUSTMENT',
        referenceNumber: request.requestNumber,
        notes: `Admin-approved adjustment ${request.requestNumber}. Variance ${request.varianceQty}. ${request.notes || ''}`,
      });
      if (request.referenceNumber?.startsWith('CC-')) {
        setCycleCounts((prev) =>
          prev.map((task) =>
            task.countNumber === request.referenceNumber
              ? {
                  ...task,
                  status: 'completed',
                  countedQty: request.countedQty,
                  varianceQty: request.varianceQty,
                  varianceValue: Math.abs(request.varianceQty || 0) * unitCost,
                }
              : task
          )
        );
      }
      return;
    }

    if (request.type === 'wastage') {
      const lowered = request.reason.toLowerCase();
      const reason: WastageReason = lowered.includes('expired')
        ? 'expired'
        : lowered.includes('theft')
          ? 'theft_loss'
          : lowered.includes('damage')
            ? 'damaged'
            : 'production_scrap';
      recordWastage({
        itemId: request.itemId,
        quantity: request.quantity,
        storeId: request.fromStoreId || stores[0]?.id,
        reason,
        orderId: orders.find((o) => o.orderNumber === request.referenceNumber)?.id,
        notes: `Admin-approved wastage ${request.requestNumber}. ${request.notes || ''}`,
      });
    }
  };

  const finalizeDecision = () => {
    if (!decisionTarget) return;
    if (!isAdmin) {
      notify('Access denied. Only Admin can approve or reject store actions.');
      return;
    }
    const { request, action } = decisionTarget;
    if (request.status !== 'pending_admin') {
      setDecisionTarget(null);
      return;
    }

    if (action === 'approved') applyApprovedRequest(request);

    const evidenceSummary = decisionEvidence.length ? ` Evidence verified: ${decisionEvidence.join(', ')}.` : '';
    const finalDecisionNotes =
      (decisionNotes.trim() ||
        (action === 'approved'
          ? 'Approved after maker-checker verification. Stock ledger posting authorised.'
          : 'Rejected by Admin. Please review evidence and resubmit.')) + evidenceSummary;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: action,
              approvedBy: `${currentUserName} (Admin)`,
              approvedAt: nowStamp(),
              decisionNotes: finalDecisionNotes,
            }
          : r
      )
    );
    pushNotification({
      type: action,
      severity: action === 'approved' ? 'success' : 'critical',
      title: `${action === 'approved' ? 'Approved' : 'Rejected'} — ${request.requestNumber}`,
      message: `${currentUserName} (Admin) ${action === 'approved' ? 'approved' : 'rejected'} ${request.requestNumber} for ${formatETB(request.totalValue)}.`,
      requestId: request.id,
      requestNumber: request.requestNumber,
      audience: 'all',
    });
    addAudit({
      timestamp: nowStamp(),
      action: action === 'approved' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
      entity: REQUEST_TYPE_META[request.type].label,
      actor: `${currentUserName} (Admin)`,
      detail: `${action === 'approved' ? 'Approved' : 'Rejected'} ${request.requestNumber}. ${finalDecisionNotes}`,
      severity: action === 'approved' ? 'success' : 'critical',
      requestNumber: request.requestNumber,
    });
    if ((request.type === 'staff_requisition' || request.type === 'staff_return') && action === 'rejected') {
      pushNotification({
        type: 'rejected',
        severity: 'critical',
        title: `${request.type === 'staff_return' ? 'Return' : 'Request'} rejected — ${request.requestNumber}`,
        message: `${request.itemName} was not approved. Reason: ${finalDecisionNotes}`,
        requestId: request.id,
        requestNumber: request.requestNumber,
        audience: 'staff',
      });
    }
    notify(
      request.type === 'staff_requisition'
        ? action === 'approved'
          ? `${request.requestNumber} approved. Storekeeper notified to prepare the item.`
          : `${request.requestNumber} rejected. Requester notified with decision notes.`
        : request.type === 'staff_return'
          ? action === 'approved'
            ? `${request.requestNumber} return approved. Stock ledger updated after Admin check.`
            : `${request.requestNumber} return rejected. Staff notified with decision notes.`
          : action === 'approved'
            ? `${request.requestNumber} approved. Ledger posting applied and storekeeper notified.`
            : `${request.requestNumber} rejected. Storekeeper notified with decision notes.`
    );
    setDecisionTarget(null);
    setDecisionNotes('');
    setDecisionEvidence([]);
  };

  const bulkApprove = () => {
    if (!isAdmin) {
      notify('Access denied. Only Admin can bulk approve.');
      return;
    }
    if (pendingRequests.length === 0) {
      notify('No pending requests to approve.');
      setBulkConfirmOpen(false);
      return;
    }
    pendingRequests.forEach((request) => applyApprovedRequest(request));
    setRequests((prev) =>
      prev.map((r) =>
        r.status === 'pending_admin'
          ? {
              ...r,
              status: 'approved',
              approvedBy: `${currentUserName} (Admin)`,
              approvedAt: nowStamp(),
              decisionNotes: 'Bulk approved by Admin after control-tower review.',
            }
          : r
      )
    );
    pushNotification({
      type: 'approved',
      severity: 'success',
      title: `Bulk approval completed — ${pendingRequests.length} requests`,
      message: `${currentUserName} (Admin) approved ${pendingRequests.length} pending store requests. Ledger postings applied.`,
      audience: 'all',
    });
    addAudit({
      timestamp: nowStamp(),
      action: 'BULK_APPROVED',
      entity: 'Approval Queue',
      actor: `${currentUserName} (Admin)`,
      detail: `${pendingRequests.length} pending store requests approved in a single control-tower action.`,
      severity: 'success',
    });
    notify(`${pendingRequests.length} requests approved and posted to the stock ledger.`);
    setBulkConfirmOpen(false);
  };

  const confirmTransferReceipt = (request: StoreApprovalRequest) => {
    if (receivedTransferIds.includes(request.id)) return;
    setReceivedTransferIds((prev) => [...prev, request.id]);
    addAudit({
      timestamp: nowStamp(),
      action: 'TRANSFER_RECEIVED',
      entity: request.itemName || 'Inter-Store Transfer',
      actor: `${currentUserName} (${roleLabel[roleView]})`,
      detail: `${request.requestNumber}: ${request.quantity} ${request.unit} physically received at ${request.toStoreName || 'destination store'} from ${request.fromStoreName || 'source store'}.`,
      severity: 'success',
      requestNumber: request.requestNumber,
    });
    pushNotification({
      type: 'approved',
      severity: 'success',
      title: `Transfer received — ${request.requestNumber}`,
      message: `${request.quantity} ${request.unit} of ${request.itemName} confirmed at ${request.toStoreName || 'destination store'}.`,
      requestNumber: request.requestNumber,
      audience: 'all',
    });
    notify(`${request.requestNumber} marked as physically received at ${request.toStoreName || 'destination store'}.`);
  };

  const issueStaffRequest = (request: StoreApprovalRequest) => {
    if (isStaff) {
      notify('Only the storekeeper or supervisor can issue stock against an approved staff request.');
      return;
    }
    if (issuedStaffRequestIds.includes(request.id) || !request.itemId) return;
    const item = items.find((i) => i.id === request.itemId);
    if (!item) return;
    if ((item.storeBalances[request.fromStoreId || stores[0]?.id] || 0) < request.quantity) {
      notify(`Insufficient stock at ${request.fromStoreName || 'selected store'} to issue this request.`);
      return;
    }
    addStockMovement({
      itemId: request.itemId,
      fromStoreId: request.fromStoreId || stores[0]?.id,
      movementType: 'production_issue',
      quantity: request.quantity,
      unitCost: request.unitCost || item.purchasePrice,
      referenceType: 'ADJUSTMENT',
      referenceNumber: request.requestNumber,
      notes: `Staff requisition ${request.requestNumber} issued to ${request.requestedBy} (${request.toStoreName || 'staff pickup'}).`,
    });
    setManuallyIssuedStaffRequestIds((prev) => [...prev, request.id]);
    addAudit({
      timestamp: nowStamp(),
      action: 'STAFF_REQUISITION_ISSUED',
      entity: item.name,
      actor: `${currentUserName} (${roleLabel[roleView]})`,
      detail: `${request.quantity} ${item.unit} of ${item.name} issued to ${request.requestedBy} against ${request.requestNumber}. Stock ledger posted.`,
      severity: 'success',
      requestNumber: request.requestNumber,
    });
    pushNotification({
      type: 'approved',
      severity: 'success',
      title: `Item ready for collection — ${request.requestNumber}`,
      message: `${request.quantity} ${item.unit} of ${item.name} was issued by ${currentUserName}. Collect from ${request.fromStoreName || 'the store'}.`,
      requestId: request.id,
      requestNumber: request.requestNumber,
      audience: 'staff',
    });
    notify(`${request.requestNumber} issued to ${request.requestedBy}. Staff notified for collection.`);
  };

  const openStaffReturn = (request: StoreApprovalRequest) => {
    if (!issuedStaffRequestIds.includes(request.id)) {
      notify('Only issued items can be returned.');
      return;
    }
    const available = request.quantity - reservedReturnQty(request.id);
    if (available <= 0) {
      notify('All issued quantity already has a return request or has been returned.');
      return;
    }
    setReturnTarget(request);
    setReturnQty('1');
    setReturnCondition('reusable');
    setReturnReason('');
  };

  const submitStaffReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    if (!isStaff) {
      notify('Only staff can submit a return request for issued items.');
      return;
    }
    const item = items.find((i) => i.id === returnTarget.itemId);
    const storeId = returnTarget.fromStoreId || stores[0]?.id;
    const quantity = Number(returnQty);
    const available = returnTarget.quantity - reservedReturnQty(returnTarget.id);
    if (!item || !storeId) return;
    if (!Number.isFinite(quantity) || quantity <= 0) {
      notify('Enter a valid return quantity.');
      return;
    }
    if (quantity > available) {
      notify(`You can return up to ${available} ${item.unit}.`);
      return;
    }
    if (!returnReason.trim()) {
      notify('Add a reason for the return.');
      return;
    }
    const returnSeq = requests.filter((request) => request.type === 'staff_return').length + 1;
    const returnRequest: StoreApprovalRequest = {
      id: `sret-${String(returnSeq).padStart(4, '0')}`,
      requestNumber: `STR-RET-2026-${String(returnSeq).padStart(4, '0')}`,
      type: 'staff_return',
      title: `Staff Return — ${item.name}`,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      returnOfRequestId: returnTarget.id,
      returnCondition,
      quantity,
      unit: item.unit,
      unitCost: returnTarget.unitCost || item.purchasePrice,
      totalValue: quantity * (returnTarget.unitCost || item.purchasePrice),
      fromStoreId: storeId,
      fromStoreName: returnTarget.fromStoreName,
      toStoreName: 'Return to Store',
      referenceNumber: returnTarget.requestNumber,
      reason: returnReason.trim(),
      notes: `Condition: ${returnCondition === 'damaged' ? 'Damaged — write off after approval' : 'Reusable — return to stock after approval'}.`,
      requestedBy: currentUserName,
      requestedByRole: 'Staff',
      requestedAt: nowStamp(),
      status: 'pending_admin',
      priority: 'normal',
      slaHours: 24,
      direction: 'inbound',
      signatureCode: `SIG-RET-${String(returnSeq).padStart(4, '0')}`,
    };
    setRequests((prev) => [returnRequest, ...prev]);
    addAudit({
      timestamp: nowStamp(),
      action: 'STAFF_RETURN_REQUESTED',
      entity: item.name,
      actor: `${currentUserName} (Staff)`,
      detail: `${quantity} ${item.unit} of ${item.name} submitted for return against ${returnTarget.requestNumber}. Condition: ${returnCondition}. Awaiting Admin approval before stock is updated.`,
      severity: 'info',
      requestNumber: returnRequest.requestNumber,
    });
    pushNotification({
      type: 'approval_request',
      severity: 'warning',
      title: `Staff return awaiting approval — ${returnRequest.requestNumber}`,
      message: `${currentUserName} wants to return ${quantity} ${item.unit} of ${item.name} (${returnCondition}). Approve to ${returnCondition === 'damaged' ? 'post the wastage write-off' : 'restock the item'}.`,
      requestId: returnRequest.id,
      requestNumber: returnRequest.requestNumber,
      audience: 'admin',
    });
    notify(`${returnRequest.requestNumber} submitted. Stock will update only after Admin approval.`);
    setReturnTarget(null);
    setReturnReason('');
  };

  const openCountVariance = (task: CycleCountTask) => {
    openMovement('stock_adjustment', task.itemId, task.storeId);
    setFormSystemQty(task.systemQty);
    setFormCountedQty(task.countedQty ?? task.systemQty);
    setFormReason(`Cycle count ${task.countNumber} variance review — ${task.zone}.`);
    setFormNotes(task.notes || '');
    setFormReference(task.countNumber);
  };

  const handleScheduleCount = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find((i) => i.id === countItemId);
    const store = stores.find((s) => s.id === countStore);
    if (!item || !store) return;
    const countNumber = `CC-2026-${countSeq}`;
    const task: CycleCountTask = {
      id: `cc-${Date.now()}`,
      countNumber,
      storeId: store.id,
      storeName: store.name,
      zone: countZone,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      systemQty: item.storeBalances[store.id] || 0,
      unit: item.unit,
      counterName: countCounter,
      scheduledDate: countDate,
      status: 'scheduled',
      notes: 'Blind count scheduled by store supervisor. Admin notified.',
    };
    setCycleCounts((prev) => [task, ...prev]);
    setCountSeq((prev) => prev + 1);
    pushNotification({
      type: 'audit',
      severity: 'info',
      title: `Cycle count scheduled — ${countNumber}`,
      message: `${currentUserName} scheduled a blind count for ${item.name} at ${store.name} (${countZone}) on ${formatDate(countDate)}.`,
      audience: 'admin',
    });
    addAudit({
      timestamp: nowStamp(),
      action: 'CYCLE_COUNT_SCHEDULED',
      entity: item.name,
      actor: `${currentUserName} (${roleLabel[roleView]})`,
      detail: `${countNumber} scheduled at ${store.name} / ${countZone} for ${formatDate(countDate)}. Admin notified.`,
      severity: 'info',
    });
    setShowCountModal(false);
    notify(`${countNumber} scheduled. Admin has been notified.`);
  };

  const markAllRead = () => {
    const visibleIds = new Set(visibleNotifications.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => (visibleIds.has(n.id) ? { ...n, read: true } : n)));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportAuditCsv = () => {
    const header = 'Timestamp,Action,Entity,Actor,Detail,Severity,Request Number\n';
    const rows = auditEvents
      .map((e) =>
        [e.timestamp, e.action, e.entity, e.actor, e.detail, e.severity, e.requestNumber || '']
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    downloadFile('dot_advert_store_audit_ledger.csv', header + rows, 'text/csv;charset=utf-8;');
    notify('Store audit ledger exported as CSV.');
  };

  const exportAuditJson = () => {
    downloadFile('dot_advert_store_audit_ledger.json', JSON.stringify(auditEvents, null, 2), 'application/json');
    notify('Store audit ledger exported as JSON.');
  };

  const selectedItemBatches = selectedItem ? batches.filter((b) => b.itemId === selectedItem.id) : [];
  const selectedItemMovements = selectedItem ? stockMovements.filter((m) => m.itemId === selectedItem.id).slice(0, 8) : [];
  const pendingValue = pendingRequests.reduce((sum, r) => sum + r.totalValue, 0);

  const renderOverview = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <StatCard label="Inventory Valuation" value={formatETB(totalValuation)} sub={`${items.length} active SKUs across ${stores.length} stores`} icon={<Boxes size={17} color={C.yellow} />} trend="4.8% MoM" trendUp />
        <StatCard label="Pending Admin Approval" value={String(pendingRequests.length)} sub={`${formatETB(pendingValue)} awaiting maker-checker release`} icon={<ShieldAlert size={17} color={C.yellow} />} accent={pendingRequests.length ? C.amber : C.text} onClick={() => setActiveTab('admin')} />
        <StatCard label="Low Stock / Stockout Risk" value={`${lowStockItems.length} SKUs`} sub={lowStockItems[0]?.item.name ? `Critical: ${lowStockItems[0].item.name.split(' ').slice(0, 3).join(' ')}` : 'All items above safety stock'} icon={<AlertTriangle size={17} color={C.yellow} />} accent={lowStockItems.length ? C.red : C.text} onClick={() => { setCatalogFilter('low'); setCatalogPage(1); setActiveTab('catalog'); }} />
        <StatCard label="Wastage & Scrap" value={formatETB(totalWastageValue)} sub={`${wastages.length} approved incidents linked to job cost`} icon={<Trash2 size={17} color={C.yellow} />} accent={C.red} onClick={() => setActiveTab('wastage')} />
        <StatCard label="Inventory Accuracy" value={`${inventoryAccuracy.toFixed(1)}%`} sub={`${completedCounts.length} blind counts reconciled this period`} icon={<Target size={17} color={C.yellow} />} trend="1.2%" trendUp />
        <StatCard label="Procurement & POs" value={`${purchaseOrders.length} Orders`} sub={`${purchaseOrders.filter((p) => p.status === 'approved').length} in transit • ${lowStockItems.length} to replenish`} icon={<ShoppingCart size={17} color={C.yellow} />} onClick={() => setActiveTab('purchasing')} />
        <StatCard label="Batches Expiring ≤ 30 Days" value={String(expiringBatches.length)} sub={`${formatETB(expiringBatches.reduce((sum, b) => sum + b.quantity * b.unitCost, 0))} at risk`} icon={<Timer size={17} color={C.yellow} />} accent={expiringBatches.length ? C.amber : C.text} onClick={() => { setCatalogFilter('expiring'); setCatalogPage(1); setActiveTab('catalog'); }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)', gap: 18 }}>
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Admin Approval Queue</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Every store action is routed to Admin. No ledger posting occurs before approval.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-hr-outline" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => setActiveTab('admin')}>
                <Sparkles size={14} />
                <span>Action Highlights</span>
              </button>
              <button className="btn-hr-black" style={{ fontSize: '0.78rem', padding: '7px 13px' }} onClick={() => setActiveTab('approvals')}>
                <ShieldCheck size={14} color={C.yellow} />
                <span>Open Approval Center</span>
              </button>
            </div>
          </div>
          <div>
            {pendingRequests.slice(0, 6).map((request) => (
              <div key={request.id} style={{ padding: '14px 22px', borderBottom: `1px solid #f1f5f9`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 240, flex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {request.type === 'goods_receipt' ? <ArrowDownToLine size={16} color={C.yellow} /> : request.type === 'wastage' ? <Trash2 size={16} color={C.yellow} /> : request.type === 'material_issue' ? <ArrowUpFromLine size={16} color={C.yellow} /> : request.type === 'reorder_request' ? <RefreshCw size={16} color={C.yellow} /> : <Layers size={16} color={C.yellow} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <TypeChip type={request.type} />
                      <PriorityChip priority={request.priority} />
                      <span style={{ fontSize: '0.68rem', color: C.dim, fontWeight: 700 }}>{request.requestNumber}</span>
                    </div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: C.text, marginTop: 5 }}>{request.title}</div>
                    <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>
                      {request.requestedBy} • {formatDateTime(request.requestedAt)} • SLA {request.slaHours}h
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{formatETB(request.totalValue)}</div>
                    <div style={{ fontSize: '0.66rem', color: C.dim }}>Awaiting Admin</div>
                  </div>
                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        title="Approve"
                        onClick={() => { setDecisionTarget({ request, action: 'approved' }); setDecisionNotes(''); setDecisionEvidence([]); }}
                        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid #a7f3d0`, background: C.greenBg, color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        title="Reject"
                        onClick={() => { setDecisionTarget({ request, action: 'rejected' }); setDecisionNotes(''); setDecisionEvidence([]); }}
                        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid #fecdd3`, background: C.redBg, color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <Chip bg="#f1f5f9" color="#475569" small><Lock size={10} /> Admin only</Chip>
                  )}
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && <EmptyState message="No pending approvals. All store actions are reconciled." icon={<CheckCircle2 size={22} color={C.green} />} />}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Critical Stock Alerts</h3>
              <Chip bg={C.redBg} color={C.red} small>{lowStockItems.length} alerts</Chip>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {lowStockItems.slice(0, 4).map(({ item, expectedDays }) => (
                <div key={item.id} style={{ padding: 12, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9a3412' }}>{item.name}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: C.red }}>{expectedDays.toFixed(1)}d</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: '0.68rem', color: '#9a3412' }}>
                    <span>{item.currentStock} {item.unit} on hand</span>
                    <button onClick={() => openMovement('reorder_request', item.id)} style={{ background: 'transparent', border: 'none', color: '#b45309', fontWeight: 900, cursor: 'pointer', fontSize: '0.68rem', padding: 0 }}>
                      Request reorder →
                    </button>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && <EmptyState message="No critical stock alerts." icon={<CheckCircle2 size={22} color={C.green} />} />}
            </div>
          </div>

          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Warehouse Utilization</h3>
              <Warehouse size={17} color={C.muted} />
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {storeStats.map(({ store, utilization, skuCount, value }) => (
                <div key={store.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>{store.name}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: utilization > 85 ? C.red : C.text }}>{utilization.toFixed(0)}%</span>
                  </div>
                  <ProgressBar pct={utilization} color={utilization > 85 ? C.red : utilization > 70 ? C.amber : C.black} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.66rem', color: C.muted }}>
                    <span>{skuCount} SKUs • {store.storekeeper}</span>
                    <span>{formatETB(value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 1fr)', gap: 18 }}>
        <div className="hr-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Expiry & Batch Risk Radar</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: C.muted }}>FEFO rotation required for batches inside the warning window.</p>
            </div>
            <CalendarDays size={17} color={C.muted} />
          </div>
          <div style={{ display: 'grid', gap: 9 }}>
            {expiringBatches.slice(0, 5).map((batch) => (
              <div key={batch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 11px', borderRadius: 9, background: batch.status === 'expired' ? C.redBg : C.amberBg, border: `1px solid ${batch.status === 'expired' ? '#fecdd3' : '#fde68a'}` }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>{batch.itemName}</div>
                  <div style={{ fontSize: '0.66rem', color: C.muted }}>{batch.batchNumber} • {batch.binCode} • {batch.quantity} {batch.unit}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Chip bg={batch.status === 'expired' ? C.red : C.amber} color={C.white} small>{batch.status === 'expired' ? 'EXPIRED' : `${daysUntil(batch.expiryDate)}d`}</Chip>
                  <div style={{ fontSize: '0.62rem', color: C.muted, marginTop: 3 }}>{formatDate(batch.expiryDate)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hr-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Live Governance Feed</h3>
            <Activity size={17} color={C.muted} />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {auditEvents.slice(0, 6).map((event) => (
              <div key={event.id} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: SEVERITY_COLOR[event.severity], marginTop: 6, flexShrink: 0, boxShadow: `0 0 0 3px ${SEVERITY_COLOR[event.severity]}18` }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{event.action.replaceAll('_', ' ')} <span style={{ color: C.dim, fontWeight: 600 }}>• {event.entity}</span></div>
                  <div style={{ fontSize: '0.71rem', color: C.muted, lineHeight: 1.4 }}>{event.detail}</div>
                  <div style={{ fontSize: '0.64rem', color: C.dim, marginTop: 2 }}>{event.actor} • {formatDateTime(event.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Stock Catalog, Balances & Valuation</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>
              Live balances are derived from approved movement ledger entries only. ABC classes calculated by value concentration.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-hr-outline" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('item_onboarding')}>
              <PlusCircle size={14} /><span>New SKU</span>
            </button>
            <button className="btn-hr-black" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('goods_receipt')}>
              <ArrowDownToLine size={14} color={C.yellow} /><span>Receive Stock</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: `1px solid #f1f5f9` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 300, maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
            <input className="hr-input" style={{ paddingLeft: 34 }} placeholder="Search code, English or Amharic name…" value={catalogSearch} onChange={(e) => { setCatalogSearch(e.target.value); setCatalogPage(1); }} />
          </div>
          <select className="hr-select" style={{ width: 150 }} value={catalogType} onChange={(e) => { setCatalogType(e.target.value); setCatalogPage(1); }}>
            <option value="all">All item types</option>
            <option value="raw_material">Raw materials</option>
            <option value="packaging">Packaging</option>
            <option value="finished_good">Finished goods</option>
            <option value="service">Service</option>
          </select>
          <select className="hr-select" style={{ width: 165 }} value={catalogSort} onChange={(e) => { setCatalogSort(e.target.value as typeof catalogSort); setCatalogPage(1); }}>
            <option value="value_desc">Sort: Highest value</option>
            <option value="name_asc">Sort: Name A–Z</option>
            <option value="stock_desc">Sort: Stock high → low</option>
            <option value="stock_asc">Sort: Stock low → high</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {([
            { id: 'all', label: `All (${items.length})` },
            { id: 'low', label: `Low (${items.filter((i) => i.currentStock <= i.reorderLevel).length})` },
            { id: 'expiring', label: `Expiring (${items.filter((i) => itemHasExpiringBatch(i.id)).length})` },
            { id: 'dead', label: `Dead (${deadStockItems.length})` },
            { id: 'quarantine', label: 'Quarantine' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setCatalogFilter(tab.id); setCatalogPage(1); }}
              style={{
                padding: '6px 11px',
                borderRadius: 7,
                border: `1px solid ${catalogFilter === tab.id ? C.black : C.border}`,
                background: catalogFilter === tab.id ? C.black : C.white,
                color: catalogFilter === tab.id ? C.yellow : C.muted,
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Item / SKU</th>
              <th>ABC</th>
              <th>Type</th>
              <th>Main Store</th>
              <th>Production</th>
              <th>Dispatch</th>
              <th>On Hand</th>
              <th>Unit Cost</th>
              <th>Valuation</th>
              <th>Health</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogPageRows.map((item) => {
              const isLow = item.currentStock <= item.reorderLevel;
              const hasExpiry = itemHasExpiringBatch(item.id);
              const isDead = item.averageDailyUsage === 0 && item.currentStock > 0;
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PackageOpen size={15} color={C.black} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: C.text }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: C.muted }}>{item.code} {item.amharicName ? `• ${item.amharicName}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td><Chip bg={abcMap[item.id] === 'A' ? C.yellow : '#f1f5f9'} color={abcMap[item.id] === 'A' ? C.black : C.muted} small>{abcMap[item.id]}</Chip></td>
                  <td><span style={{ fontSize: '0.75rem', color: C.muted }}>{item.type.replaceAll('_', ' ')}</span></td>
                  <td style={{ fontSize: '0.78rem' }}>{item.storeBalances['store-1'] || 0} {item.unit}</td>
                  <td style={{ fontSize: '0.78rem' }}>{item.storeBalances['store-2'] || 0} {item.unit}</td>
                  <td style={{ fontSize: '0.78rem' }}>{item.storeBalances['store-3'] || 0} {item.unit}</td>
                  <td><strong style={{ color: isLow ? C.red : C.text }}>{item.currentStock} {item.unit}</strong></td>
                  <td style={{ color: C.muted, fontSize: '0.78rem' }}>{formatETB(item.purchasePrice)}</td>
                  <td><strong>{formatETB(catalogVal(item))}</strong></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {isLow ? <Chip bg={C.redBg} color={C.red} small>LOW STOCK</Chip> : <Chip bg={C.greenBg} color="#047857" small>HEALTHY</Chip>}
                      {hasExpiry && <Chip bg={C.amberBg} color="#b45309" small>EXPIRY RISK</Chip>}
                      {isDead && <Chip bg="#f1f5f9" color="#475569" small>DEAD STOCK</Chip>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                      <button title="Open item 360" onClick={() => setSelectedItem(item)} style={{ width: 29, height: 29, borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={14} color={C.black} />
                      </button>
                      <button title="Request reorder" onClick={() => openMovement('reorder_request', item.id)} style={{ width: 29, height: 29, borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={14} color={C.black} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {catalogFiltered.length === 0 && <EmptyState message="No SKUs match the selected inventory filters." />}
      </div>

      <div style={{ padding: '11px 22px', borderTop: `1px solid #f1f5f9`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.72rem', color: C.muted }}>
        <span>
          Showing {catalogSorted.length === 0 ? 0 : (currentCatalogPage - 1) * CATALOG_PAGE_SIZE + 1}–{Math.min(currentCatalogPage * CATALOG_PAGE_SIZE, catalogSorted.length)} of {catalogSorted.length} matching SKUs • {items.length} total • Weighted average cost
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Total catalog valuation: <strong style={{ color: C.text }}>{formatETB(totalValuation)}</strong></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button className="btn-hr-outline" style={{ padding: '4px 8px', fontSize: '0.68rem' }} disabled={currentCatalogPage <= 1} onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span style={{ fontWeight: 800, color: C.text, minWidth: 74, textAlign: 'center' }}>Page {currentCatalogPage} / {totalCatalogPages}</span>
            <button className="btn-hr-outline" style={{ padding: '4px 8px', fontSize: '0.68rem' }} disabled={currentCatalogPage >= totalCatalogPages} onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaffPortal = () => {
    const myPending = myStaffRequests.filter((request) => request.status === 'pending_admin');
    const myApproved = myStaffRequests.filter((request) => request.status === 'approved' && !issuedStaffRequestIds.includes(request.id));
    const myIssued = myStaffRequests.filter((request) => request.status === 'approved' && issuedStaffRequestIds.includes(request.id));
    const myRejected = myStaffRequests.filter((request) => request.status === 'rejected');
    const myPendingReturns = myStaffReturns.filter((request) => request.status === 'pending_admin');

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ background: 'linear-gradient(120deg, #09090b 0%, #1c1c22 100%)', borderRadius: 14, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', border: '1px solid #27272a' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.4)', color: C.yellow, fontSize: '0.66rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}><User size={12} /> Staff Requisition Portal</span>
            </div>
            <h2 style={{ margin: 0, color: C.white, fontSize: '1.35rem', fontWeight: 900 }}>Need an item from the store?</h2>
            <p style={{ margin: '6px 0 0', color: '#a1a1aa', fontSize: '0.8rem', lineHeight: 1.55 }}>
              Submit a request with the item and quantity. Admin approves it first. The storekeeper is then notified to prepare the item for collection — every step is tracked.
            </p>
          </div>
          <button className="btn-hr-yellow" onClick={() => openMovement('staff_requisition')}><PlusCircle size={15} /><span>Request an Item</span></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          <StatCard label="Pending Admin" value={String(myPending.length)} sub="Awaiting approval" icon={<Clock size={17} color={C.yellow} />} accent={C.amber} />
          <StatCard label="Approved — Preparing" value={String(myApproved.length)} sub="Storekeeper notified" icon={<PackageCheck size={17} color={C.yellow} />} />
          <StatCard label="Issued / Collected" value={String(myIssued.length)} sub="Stock deducted from store" icon={<CheckCircle2 size={17} color={C.yellow} />} />
          <StatCard label="Returns Pending" value={String(myPendingReturns.length)} sub="Awaiting Admin approval" icon={<RotateCcw size={17} color={C.yellow} />} accent={myPendingReturns.length ? C.amber : C.text} />
          <StatCard label="Rejected" value={String(myRejected.length)} sub="Review decision notes" icon={<XCircle size={17} color={C.yellow} />} accent={myRejected.length ? C.red : C.text} />
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>My Item Requests</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: C.muted }}>Only your requests are shown. The workflow is: Submitted → Admin approved → Storekeeper issued.</p>
            </div>
            <Chip bg="#f0f9ff" color="#0369a1" small>{myStaffRequests.length} TOTAL</Chip>
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr><th>Request</th><th>Item</th><th>Qty</th><th>Pickup / Department</th><th>Purpose</th><th>Admin Decision</th><th>Store Issue</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr>
              </thead>
              <tbody>
                {myStaffRequests.map((request) => {
                  const issued = issuedStaffRequestIds.includes(request.id);
                  const returnable = request.quantity - reservedReturnQty(request.id);
                  const hasApprovedReturn = myStaffReturns.some(
                    (returnRequest) =>
                      returnRequest.returnOfRequestId === request.id && returnRequest.status === 'approved'
                  );
                  return (
                    <tr key={request.id}>
                      <td>
                        <div style={{ marginBottom: 4 }}><TypeChip type={request.type} /></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>{request.requestNumber}</div>
                        <div style={{ fontSize: '0.65rem', color: C.dim }}>{formatDateTime(request.requestedAt)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{request.itemName}</div>
                        <div style={{ fontSize: '0.68rem', color: C.dim }}>{request.itemCode}</div>
                      </td>
                      <td><strong>{request.quantity} {request.unit}</strong></td>
                      <td style={{ fontSize: '0.74rem' }}>
                        <div>{request.fromStoreName || 'Store'}</div>
                        <div style={{ color: C.dim, fontSize: '0.68rem' }}>{request.toStoreName || 'Staff pickup'}</div>
                      </td>
                      <td style={{ fontSize: '0.72rem', maxWidth: 220 }}>
                        <div>{request.referenceNumber || 'General request'}</div>
                        <div style={{ color: C.dim, fontSize: '0.66rem' }}>{request.reason}</div>
                      </td>
                      <td style={{ fontSize: '0.71rem', maxWidth: 210 }}>
                        {request.status === 'pending_admin' ? (
                          <span style={{ color: C.amber, fontWeight: 700 }}>Waiting for Admin</span>
                        ) : request.status === 'approved' ? (
                          <><div style={{ color: '#047857', fontWeight: 800 }}>Approved by {request.approvedBy || 'Admin'}</div><div style={{ color: C.dim, fontSize: '0.66rem' }}>{request.decisionNotes}</div></>
                        ) : request.status === 'rejected' ? (
                          <><div style={{ color: C.red, fontWeight: 800 }}>Rejected</div><div style={{ color: C.dim, fontSize: '0.66rem' }}>{request.decisionNotes}</div></>
                        ) : (
                          <span style={{ color: C.muted }}>{request.status.replaceAll('_', ' ')}</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.71rem' }}>
                        {request.status === 'approved' ? (
                          issued ? <Chip bg={C.greenBg} color="#047857" small>ISSUED</Chip> : <Chip bg={C.amberBg} color="#b45309" small>PREPARING</Chip>
                        ) : <span style={{ color: C.dim }}>—</span>}
                      </td>
                      <td><StatusChip status={request.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        {issued && returnable > 0 ? (
                          <button className="btn-hr-outline" style={{ padding: '5px 8px', fontSize: '0.66rem' }} onClick={() => openStaffReturn(request)}><RotateCcw size={12} /><span>Return Item</span></button>
                        ) : (request.status === 'rejected' || request.status === 'needs_revision') && request.itemId ? (
                          <button className="btn-hr-outline" style={{ padding: '5px 8px', fontSize: '0.66rem' }} onClick={() => openMovement('staff_requisition', request.itemId)}><RefreshCw size={12} /><span>Request Again</span></button>
                        ) : (
                          <span style={{ fontSize: '0.66rem', color: C.dim }}>{issued ? (hasApprovedReturn ? 'Returned' : 'Return pending') : request.status === 'approved' ? 'Collect from store' : 'In progress'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {myStaffRequests.length === 0 && <EmptyState message="You have not requested any items yet. Use the Request an Item button to start." icon={<PackageOpen size={22} color={C.dim} />} />}
          </div>
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>My Returns</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: C.muted }}>Return issued items when no longer needed. Admin approval is required before stock or wastage is updated.</p>
            </div>
            <Chip bg="#ecfeff" color="#0e7490" small>{myStaffReturns.length} TOTAL</Chip>
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr><th>Return Request</th><th>Item</th><th>Qty</th><th>Original Issue</th><th>Condition</th><th>Reason</th><th>Admin Decision</th><th>Status</th></tr>
              </thead>
              <tbody>
                {myStaffReturns.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>{request.requestNumber}</div>
                      <div style={{ fontSize: '0.65rem', color: C.dim }}>{formatDateTime(request.requestedAt)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{request.itemName}</div>
                      <div style={{ fontSize: '0.68rem', color: C.dim }}>{request.itemCode}</div>
                    </td>
                    <td><strong>{request.quantity} {request.unit}</strong></td>
                    <td style={{ fontSize: '0.72rem' }}>{request.referenceNumber || '—'}</td>
                    <td><Chip bg={request.returnCondition === 'damaged' ? C.redBg : C.greenBg} color={request.returnCondition === 'damaged' ? '#be123c' : '#047857'} small>{request.returnCondition === 'damaged' ? 'DAMAGED' : 'REUSABLE'}</Chip></td>
                    <td style={{ fontSize: '0.72rem', maxWidth: 240 }}>{request.reason}</td>
                    <td style={{ fontSize: '0.71rem', maxWidth: 220 }}>
                      {request.status === 'pending_admin' ? (
                        <span style={{ color: C.amber, fontWeight: 700 }}>Waiting for Admin</span>
                      ) : request.status === 'approved' ? (
                        <><div style={{ color: '#047857', fontWeight: 800 }}>Approved by {request.approvedBy || 'Admin'}</div><div style={{ color: C.dim, fontSize: '0.66rem' }}>{request.decisionNotes}</div></>
                      ) : (
                        <><div style={{ color: C.red, fontWeight: 800 }}>Rejected</div><div style={{ color: C.dim, fontSize: '0.66rem' }}>{request.decisionNotes}</div></>
                      )}
                    </td>
                    <td><StatusChip status={request.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myStaffReturns.length === 0 && <EmptyState message="No return requests yet. Use Return Item on any issued request." icon={<RotateCcw size={22} color={C.dim} />} />}
          </div>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: C.muted }}>
          <Info size={14} color={C.amber} />
          <span>Staff cannot approve their own request, return or stock change. Admin approval and storekeeper issue are both recorded in the audit trail. Damaged returns are written off as wastage only after Admin approval.</span>
        </div>
      </div>
    );
  };

  const renderInbound = () => {
    const inbound = requests
      .filter((r) => r.type === 'goods_receipt' || r.type === 'reorder_request' || r.type === 'item_onboarding')
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    const openPOs = purchaseOrders.filter((p) => p.status === 'approved' || p.status === 'partially_received');
    const inboundPending = inbound.filter((r) => r.status === 'pending_admin');

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <StatCard label="Inbound Awaiting Admin" value={String(inboundPending.length)} sub={formatETB(inboundPending.reduce((s, r) => s + r.totalValue, 0)) + ' pending release'} icon={<ArrowDownToLine size={17} color={C.yellow} />} accent={C.amber} />
          <StatCard label="Open Purchase Orders" value={String(openPOs.length)} sub={formatETB(openPOs.reduce((s, p) => s + p.grandTotal, 0)) + ' in transit'} icon={<Truck size={17} color={C.yellow} />} />
          <StatCard label="Receipts This Month" value={String(inbound.filter((r) => r.type === 'goods_receipt').length)} sub="GRNs linked to PO and QC records" icon={<PackageCheck size={17} color={C.yellow} />} />
          <StatCard label="QC Pass Rate" value="96.4%" sub="Incoming inspection acceptance rate" icon={<ClipboardCheck size={17} color={C.yellow} />} trend="1.8%" trendUp />
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Inbound Control — Goods Receipt & Reorder Requests</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>GRNs, supplier deliveries, QC results and reorder requests are all held for Admin approval before balance posting.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-hr-outline" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('reorder_request')}>
                <RefreshCw size={14} /><span>Reorder</span>
              </button>
              <button className="btn-hr-black" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('goods_receipt')}>
                <ArrowDownToLine size={14} color={C.yellow} /><span>New GRN</span>
              </button>
            </div>
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Supplier / Reference</th>
                  <th>Destination</th>
                  <th>Batch / Expiry</th>
                  <th>Qty & Value</th>
                  <th>QC</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {inbound.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <TypeChip type={request.type} />
                        <span style={{ fontSize: '0.68rem', color: C.dim, fontWeight: 700 }}>{request.requestNumber}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{request.title}</div>
                    </td>
                    <td style={{ fontSize: '0.77rem' }}>
                      <div>{request.supplierName || 'Internal / N/A'}</div>
                      <div style={{ color: C.dim, fontSize: '0.69rem' }}>{request.referenceNumber || '—'}</div>
                    </td>
                    <td style={{ fontSize: '0.77rem' }}>{request.toStoreName || '—'}</td>
                    <td style={{ fontSize: '0.77rem' }}>
                      <div>{request.batchNumber || '—'}</div>
                      <div style={{ color: C.dim, fontSize: '0.69rem' }}>{request.expiryDate ? `Expires ${formatDate(request.expiryDate)}` : 'No shelf-life'}</div>
                    </td>
                    <td style={{ fontSize: '0.77rem' }}>
                      <strong>{request.quantity} {request.unit}</strong>
                      {typeof request.acceptedQty === 'number' && (
                        <div style={{ color: request.rejectedQty ? '#b45309' : '#047857', fontSize: '0.68rem', fontWeight: 700 }}>
                          Accepted {request.acceptedQty}{request.rejectedQty ? ` • Rejected ${request.rejectedQty}` : ''}
                        </div>
                      )}
                      <div style={{ color: C.muted, fontSize: '0.7rem' }}>{formatETB(request.totalValue)} • Bin {request.binCode || '—'}</div>
                    </td>
                    <td>
                      {request.qcResult === 'passed' ? <Chip bg={C.greenBg} color="#047857" small>PASSED</Chip> : request.qcResult === 'partial' ? <Chip bg={C.amberBg} color="#b45309" small>PARTIAL</Chip> : request.qcResult === 'failed' ? <Chip bg={C.redBg} color={C.red} small>FAILED</Chip> : <span style={{ color: C.dim, fontSize: '0.72rem' }}>N/A</span>}
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      <div>{request.requestedBy}</div>
                      <div style={{ color: C.dim, fontSize: '0.67rem' }}>{formatDateTime(request.requestedAt)}</div>
                    </td>
                    <td><StatusChip status={request.status} /></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                        {request.status === 'pending_admin' && isAdmin ? (
                          <>
                            <button onClick={() => { setDecisionTarget({ request, action: 'approved' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #a7f3d0', background: C.greenBg, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></button>
                            <button onClick={() => { setDecisionTarget({ request, action: 'rejected' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #fecdd3', background: C.redBg, color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.69rem', color: C.dim }}>{request.status === 'approved' ? request.approvedBy || 'Approved' : request.status === 'pending_admin' ? 'Admin only' : '—'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inbound.length === 0 && <EmptyState message="No inbound requests recorded yet." icon={<ArrowDownToLine size={22} color={C.dim} />} />}
          </div>
        </div>

        <div className="hr-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Open Purchase Orders — Awaiting Physical Receipt</h3>
            <Truck size={17} color={C.muted} />
          </div>
          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr><th>PO Number</th><th>Supplier</th><th>Items</th><th>Grand Total</th><th>Expected Delivery</th><th>Status</th><th>Approved By</th></tr>
              </thead>
              <tbody>
                {openPOs.map((po) => (
                  <tr key={po.id}>
                    <td><strong>{po.poNumber}</strong></td>
                    <td>{po.supplierName}</td>
                    <td style={{ fontSize: '0.77rem' }}>{po.items.length} line(s)</td>
                    <td><strong>{formatETB(po.grandTotal)}</strong></td>
                    <td style={{ fontSize: '0.78rem' }}>{formatDate(po.expectedDeliveryDate)}</td>
                    <td><Chip bg={C.amberBg} color="#b45309" small>{po.status.replaceAll('_', ' ').toUpperCase()}</Chip></td>
                    <td style={{ fontSize: '0.75rem', color: C.muted }}>{po.approvedBy || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {openPOs.length === 0 && <EmptyState message="No open POs. All deliveries have been received." icon={<PackageCheck size={22} color={C.green} />} />}
          </div>
        </div>
      </div>
    );
  };

  const renderOutbound = () => {
    const outbound = requests
      .filter((r) => r.type === 'material_issue' || r.type === 'inter_store_transfer' || r.type === 'supplier_return')
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    const outboundPending = outbound.filter((r) => r.status === 'pending_admin');

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <StatCard label="Outbound Awaiting Admin" value={String(outboundPending.length)} sub={formatETB(outboundPending.reduce((s, r) => s + r.totalValue, 0)) + ' pending release'} icon={<ArrowUpFromLine size={17} color={C.yellow} />} accent={C.amber} />
          <StatCard label="Material Issues" value={String(requests.filter((r) => r.type === 'material_issue').length)} sub="Issued against work orders / BOM" icon={<ClipboardList size={17} color={C.yellow} />} />
          <StatCard label="Inter-Store Transfers" value={String(requests.filter((r) => r.type === 'inter_store_transfer').length)} sub="Dual-signature internal movements" icon={<ArrowRightLeft size={17} color={C.yellow} />} />
          <StatCard label="Supplier Returns" value={String(requests.filter((r) => r.type === 'supplier_return').length)} sub="Credit returns and rejected batches" icon={<RotateCcw size={17} color={C.yellow} />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 1fr)', gap: 18 }}>
          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Outbound Control — Issues, Transfers & Returns</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Stock leaves the ledger only after Admin approval and signature verification.</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-hr-outline" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('inter_store_transfer')}><ArrowRightLeft size={14} /><span>Transfer</span></button>
                <button className="btn-hr-black" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('material_issue')}><ArrowUpFromLine size={14} color={C.yellow} /><span>Issue Material</span></button>
              </div>
            </div>
            <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="hr-table">
                <thead><tr><th>Request</th><th>From → To</th><th>Reference</th><th>Qty</th><th>Value</th><th>Requested By</th><th>Status</th><th style={{ textAlign: 'right' }}>Decision</th></tr></thead>
                <tbody>
                  {outbound.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><TypeChip type={request.type} /><PriorityChip priority={request.priority} /></div>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{request.title}</div>
                        <div style={{ fontSize: '0.68rem', color: C.dim }}>{request.requestNumber}</div>
                      </td>
                      <td style={{ fontSize: '0.76rem' }}>
                        <div>{request.fromStoreName || '—'}</div>
                        <div style={{ color: C.dim }}>→ {request.toStoreName || 'Production / External'}</div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: C.muted }}>{request.referenceNumber || '—'}</td>
                      <td><strong>{request.quantity} {request.unit}</strong></td>
                      <td><strong>{formatETB(request.totalValue)}</strong></td>
                      <td style={{ fontSize: '0.75rem' }}>
                        <div>{request.requestedBy}</div>
                        <div style={{ color: C.dim, fontSize: '0.67rem' }}>{formatDateTime(request.requestedAt)}</div>
                      </td>
                      <td><StatusChip status={request.status} /></td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                          {request.status === 'pending_admin' && isAdmin ? (
                            <>
                              <button onClick={() => { setDecisionTarget({ request, action: 'approved' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #a7f3d0', background: C.greenBg, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></button>
                              <button onClick={() => { setDecisionTarget({ request, action: 'rejected' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #fecdd3', background: C.redBg, color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.69rem', color: C.dim }}>{request.status === 'pending_admin' ? 'Admin only' : request.status === 'approved' ? request.approvedBy || 'Approved' : '—'}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {outbound.length === 0 && <EmptyState message="No outbound requests recorded." icon={<ArrowUpFromLine size={22} color={C.dim} />} />}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Available to Issue</h3>
                <Boxes size={17} color={C.muted} />
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {items.slice(0, 5).map((item) => {
                  const pct = item.reorderLevel ? Math.min(100, (item.currentStock / (item.reorderLevel * 2)) * 100) : 100;
                  return (
                    <div key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700 }}>{item.name.split('(')[0]}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: item.currentStock <= item.reorderLevel ? C.red : C.text }}>{item.currentStock} {item.unit}</span>
                      </div>
                      <ProgressBar pct={pct} color={item.currentStock <= item.reorderLevel ? C.red : C.black} height={6} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Staff Item Issue Queue</h3>
                  <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: 2 }}>Admin-approved staff requests waiting to be prepared</div>
                </div>
                <Chip bg={staffIssueQueue.length ? C.amberBg : C.greenBg} color={staffIssueQueue.length ? '#b45309' : '#047857'} small>{staffIssueQueue.length} TO ISSUE</Chip>
              </div>
              <div style={{ padding: 14, display: 'grid', gap: 9 }}>
                {staffIssueQueue.slice(0, 5).map((request) => {
                  const available = items.find((item) => item.id === request.itemId)?.storeBalances[request.fromStoreId || stores[0]?.id] || 0;
                  const enough = available >= request.quantity;
                  return (
                    <div key={request.id} style={{ padding: '9px 10px', borderRadius: 8, border: `1px solid ${enough ? C.border : '#fecdd3'}`, background: enough ? '#fafafa' : C.redBg }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>{request.itemName}</div>
                          <div style={{ fontSize: '0.66rem', color: C.muted }}>{request.quantity} {request.unit} • {request.requestedBy}</div>
                          <div style={{ fontSize: '0.64rem', color: C.dim }}>{request.toStoreName || 'Staff pickup'} • {request.referenceNumber || 'No reference'}</div>
                        </div>
                        <PriorityChip priority={request.priority} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 7 }}>
                        <span style={{ fontSize: '0.64rem', fontWeight: 700, color: enough ? '#047857' : C.red }}>{available} {request.unit} available at {request.fromStoreName || 'store'}</span>
                        <button className="btn-hr-black" disabled={!enough} style={{ padding: '4px 8px', fontSize: '0.66rem', opacity: enough ? 1 : 0.45 }} onClick={() => issueStaffRequest(request)}>
                          <PackageCheck size={12} color={C.yellow} /><span>Issue Item</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {staffIssueQueue.length === 0 && <div style={{ padding: 12, textAlign: 'center', fontSize: '0.72rem', color: C.muted }}>No approved staff requests waiting. Staff are notified automatically when items are issued.</div>}
              </div>
            </div>

            <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Transfer Receipt Queue</h3>
                  <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: 2 }}>Dispatch → in-transit → destination confirmation</div>
                </div>
                <Chip bg="#f5f3ff" color="#6d28d9" small>{approvedTransfers.length} APPROVED</Chip>
              </div>
              <div style={{ padding: 14, display: 'grid', gap: 9 }}>
                {approvedTransfers.slice(0, 5).map((request) => {
                  const received = receivedTransferIds.includes(request.id);
                  return (
                    <div key={request.id} style={{ padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: received ? C.greenBg : '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>{request.itemName}</div>
                          <div style={{ fontSize: '0.66rem', color: C.muted }}>{request.quantity} {request.unit} • {request.fromStoreName || 'Source'} → {request.toStoreName || 'Destination'}</div>
                        </div>
                        <Chip bg={received ? C.greenBg : C.amberBg} color={received ? '#047857' : '#b45309'} small>{received ? 'RECEIVED' : 'IN TRANSIT'}</Chip>
                      </div>
                      {received ? (
                        <div style={{ fontSize: '0.65rem', color: '#047857', marginTop: 5, fontWeight: 700 }}>Receipt confirmed • {request.requestNumber}</div>
                      ) : (
                        <button className="btn-hr-outline" style={{ padding: '4px 8px', fontSize: '0.66rem', marginTop: 7 }} onClick={() => confirmTransferReceipt(request)}>
                          <PackageCheck size={12} /><span>Confirm Receipt</span>
                        </button>
                      )}
                    </div>
                  );
                })}
                {approvedTransfers.length === 0 && <div style={{ padding: 12, textAlign: 'center', fontSize: '0.72rem', color: C.muted }}>No approved transfers awaiting receipt.</div>}
              </div>
            </div>

            <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Supplier Return Debit Notes</h3>
                  <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: 2 }}>Recoverable value from approved returns</div>
                </div>
                <RotateCcw size={16} color={C.muted} />
              </div>
              <div style={{ padding: 14, display: 'grid', gap: 9 }}>
                {approvedSupplierReturns.slice(0, 4).map((request) => (
                  <div key={request.id} style={{ padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>DN-2026-{request.requestNumber.split('-').pop()}</div>
                        <div style={{ fontSize: '0.66rem', color: C.muted }}>{request.supplierName || 'Supplier'} • {request.quantity} {request.unit}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.73rem', fontWeight: 900, color: '#be185d' }}>{formatETB(request.totalValue)}</div>
                        <Chip bg={C.greenBg} color="#047857" small>ISSUED</Chip>
                      </div>
                    </div>
                  </div>
                ))}
                {approvedSupplierReturns.length === 0 && <div style={{ padding: 12, textAlign: 'center', fontSize: '0.72rem', color: C.muted }}>No debit notes issued yet. Approve a supplier return to generate one.</div>}
              </div>
            </div>

            <div className="hr-card" style={{ background: '#09090b', color: C.white, border: '1px solid #27272a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={17} color={C.yellow} />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Maker–Checker Control</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#a1a1aa', lineHeight: 1.55 }}>
                Storekeepers create the movement. Supervisors verify quantities and evidence. Admin authorises the final ledger posting. No single user can both create and approve a stock action.
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <Chip bg="rgba(250,204,21,0.14)" color={C.yellow} small>MAKER</Chip>
                <Chip bg="rgba(255,255,255,0.08)" color="#e4e4e7" small>CHECKER</Chip>
                <Chip bg="rgba(16,185,129,0.16)" color="#6ee7b7" small>ADMIN APPROVER</Chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdjustments = () => {
    const adjustmentRequests = requests
      .filter((r) => r.type === 'stock_adjustment' || r.type === 'cycle_count')
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    const varianceTasks = cycleCounts.filter((c) => c.status === 'variance_pending');

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <StatCard label="Scheduled Cycle Counts" value={String(cycleCounts.filter((c) => c.status === 'scheduled').length)} sub={`${cycleCounts.length} counts in current programme`} icon={<ListChecks size={17} color={C.yellow} />} />
          <StatCard label="Variance Awaiting Approval" value={String(varianceTasks.length)} sub={formatETB(varianceTasks.reduce((s, c) => s + Math.abs(c.varianceValue || 0), 0)) + ' exposure'} icon={<ShieldAlert size={17} color={C.yellow} />} accent={C.amber} />
          <StatCard label="Adjustment Requests" value={String(adjustmentRequests.length)} sub={`${adjustmentRequests.filter((r) => r.status === 'pending_admin').length} pending Admin decision`} icon={<ClipboardCheck size={17} color={C.yellow} />} />
          <StatCard label="Inventory Accuracy" value={`${inventoryAccuracy.toFixed(1)}%`} sub="Blind-count weighted accuracy" icon={<Target size={17} color={C.yellow} />} trend="1.2%" trendUp />
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Cycle Count Programme & Blind Count Control</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Counts are assigned blind, verified by a second counter, and any variance becomes an Admin approval request.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-hr-outline" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => setShowCountModal(true)}><CalendarDays size={14} /><span>Schedule Count</span></button>
              <button className="btn-hr-black" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('stock_adjustment')}><ClipboardCheck size={14} color={C.yellow} /><span>New Adjustment</span></button>
            </div>
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead><tr><th>Count #</th><th>Store / Zone</th><th>Item</th><th>System Qty</th><th>Counted</th><th>Variance</th><th>Counter</th><th>Schedule</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>
                {cycleCounts.map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.countNumber}</strong></td>
                    <td style={{ fontSize: '0.76rem' }}><div>{task.storeName}</div><div style={{ color: C.dim, fontSize: '0.68rem' }}>{task.zone}</div></td>
                    <td style={{ fontSize: '0.77rem' }}>{task.itemName}<div style={{ color: C.dim, fontSize: '0.68rem' }}>{task.itemCode}</div></td>
                    <td>{task.systemQty} {task.unit}</td>
                    <td>{task.countedQty ?? '—'}</td>
                    <td>
                      {task.varianceQty === undefined ? <span style={{ color: C.dim }}>—</span> : <strong style={{ color: task.varianceQty === 0 ? C.green : task.varianceQty > 0 ? C.blue : C.red }}>{task.varianceQty > 0 ? '+' : ''}{task.varianceQty} {task.unit}</strong>}
                    </td>
                    <td style={{ fontSize: '0.76rem' }}>{task.counterName}</td>
                    <td style={{ fontSize: '0.76rem' }}>{formatDate(task.scheduledDate)}</td>
                    <td>
                      {task.status === 'completed' ? <Chip bg={C.greenBg} color="#047857" small>COMPLETED</Chip> : task.status === 'variance_pending' ? <Chip bg={C.amberBg} color="#b45309" small>VARIANCE PENDING</Chip> : task.status === 'counting' ? <Chip bg={C.blueBg} color="#1d4ed8" small>COUNTING</Chip> : <Chip bg="#f1f5f9" color="#475569" small>SCHEDULED</Chip>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-hr-outline" style={{ fontSize: '0.69rem', padding: '5px 9px' }} onClick={() => openCountVariance(task)}>
                          <ScanBarcode size={12} /><span>Submit Count</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Adjustment Approval Ledger</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Variance adjustments are posted only after Admin review of count evidence and root cause.</p>
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead><tr><th>Request</th><th>Item</th><th>System → Counted</th><th>Variance</th><th>Value</th><th>Reason</th><th>Requested By</th><th>Status</th><th style={{ textAlign: 'right' }}>Decision</th></tr></thead>
              <tbody>
                {adjustmentRequests.map((request) => (
                  <tr key={request.id}>
                    <td><div style={{ display: 'flex', gap: 5, marginBottom: 4 }}><TypeChip type={request.type} /></div><div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{request.requestNumber}</div></td>
                    <td style={{ fontSize: '0.77rem' }}>{request.itemName}</td>
                    <td style={{ fontSize: '0.77rem' }}>{request.systemQty ?? '—'} → {request.countedQty ?? '—'} {request.unit}</td>
                    <td><strong style={{ color: (request.varianceQty || 0) >= 0 ? C.blue : C.red }}>{(request.varianceQty || 0) > 0 ? '+' : ''}{request.varianceQty ?? 0} {request.unit}</strong></td>
                    <td><strong>{formatETB(request.totalValue)}</strong></td>
                    <td style={{ fontSize: '0.73rem', color: C.muted, maxWidth: 260 }}>{request.reason}</td>
                    <td style={{ fontSize: '0.74rem' }}>{request.requestedBy}</td>
                    <td><StatusChip status={request.status} /></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                        {request.status === 'pending_admin' && isAdmin ? (
                          <>
                            <button onClick={() => { setDecisionTarget({ request, action: 'approved' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #a7f3d0', background: C.greenBg, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></button>
                            <button onClick={() => { setDecisionTarget({ request, action: 'rejected' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #fecdd3', background: C.redBg, color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                          </>
                        ) : <span style={{ fontSize: '0.69rem', color: C.dim }}>{request.status === 'pending_admin' ? 'Admin only' : request.approvedBy || '—'}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderWastage = () => {
    const wastageRequests = requests.filter((r) => r.type === 'wastage').sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    const pendingWastage = wastageRequests.filter((r) => r.status === 'pending_admin');
    const reasons = wastages.reduce<Record<string, number>>((acc, w) => {
      acc[w.reason] = (acc[w.reason] || 0) + w.totalCost;
      return acc;
    }, {});

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <StatCard label="Approved Wastage Value" value={formatETB(totalWastageValue)} sub={`${wastages.length} incidents posted to job cost`} icon={<Trash2 size={17} color={C.yellow} />} accent={C.red} />
          <StatCard label="Pending Wastage Approvals" value={String(pendingWastage.length)} sub={formatETB(pendingWastage.reduce((s, r) => s + r.totalValue, 0)) + ' awaiting Admin'} icon={<ShieldAlert size={17} color={C.yellow} />} accent={C.amber} />
          <StatCard label="Scrap Rate" value={`${((totalWastageValue / (totalValuation || 1)) * 100).toFixed(2)}%`} sub="Wastage as % of inventory valuation" icon={<Percent size={17} color={C.yellow} />} />
          <StatCard label="Job-Cost Recovery" value="100%" sub="All approved wastage allocated to orders or overhead" icon={<Target size={17} color={C.yellow} />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 1fr)', gap: 18 }}>
          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Wastage & Scrap Approval Queue</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Production loss must be evidenced and approved before the stock write-down is posted.</p>
              </div>
              <button className="btn-hr-black" style={{ fontSize: '0.78rem', padding: '7px 12px' }} onClick={() => openMovement('wastage')}><Trash2 size={14} color={C.yellow} /><span>Log Wastage</span></button>
            </div>
            <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="hr-table">
                <thead><tr><th>Request</th><th>Item</th><th>Qty</th><th>Loss</th><th>Store</th><th>Order Allocation</th><th>Requested By</th><th>Status</th><th style={{ textAlign: 'right' }}>Decision</th></tr></thead>
                <tbody>
                  {wastageRequests.map((request) => (
                    <tr key={request.id}>
                      <td><div style={{ marginBottom: 4 }}><TypeChip type={request.type} /></div><div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{request.requestNumber}</div></td>
                      <td style={{ fontSize: '0.77rem' }}>{request.itemName}<div style={{ fontSize: '0.68rem', color: C.muted, maxWidth: 230 }}>{request.reason}</div></td>
                      <td><strong>{request.quantity} {request.unit}</strong></td>
                      <td><strong style={{ color: C.red }}>{formatETB(request.totalValue)}</strong></td>
                      <td style={{ fontSize: '0.74rem' }}>{request.fromStoreName}</td>
                      <td style={{ fontSize: '0.74rem' }}>{request.referenceNumber || 'General overhead'}</td>
                      <td style={{ fontSize: '0.74rem' }}>{request.requestedBy}</td>
                      <td><StatusChip status={request.status} /></td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                          {request.status === 'pending_admin' && isAdmin ? (
                            <>
                              <button onClick={() => { setDecisionTarget({ request, action: 'approved' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #a7f3d0', background: C.greenBg, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></button>
                              <button onClick={() => { setDecisionTarget({ request, action: 'rejected' }); setDecisionNotes(''); setDecisionEvidence([]); }} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid #fecdd3', background: C.redBg, color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                            </>
                          ) : <span style={{ fontSize: '0.69rem', color: C.dim }}>{request.status === 'pending_admin' ? 'Admin only' : request.approvedBy || '—'}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {wastageRequests.length === 0 && <EmptyState message="No wastage requests recorded." icon={<Trash2 size={22} color={C.dim} />} />}
            </div>
          </div>

          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Loss by Root Cause</h3>
              <PieChart size={17} color={C.muted} />
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {Object.entries(reasons).map(([reason, value]) => {
                const pct = totalWastageValue ? (value / totalWastageValue) * 100 : 0;
                return (
                  <div key={reason}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{reason.replaceAll('_', ' ')}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{formatETB(value)}</span>
                    </div>
                    <ProgressBar pct={pct} color={reason === 'production_scrap' ? C.red : reason === 'expired' ? C.amber : C.black} />
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: '#fff1f2', border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 900, color: '#9f1239' }}>
                <AlertTriangle size={14} /> Scrap control target
              </div>
              <p style={{ margin: '5px 0 0', fontSize: '0.72rem', color: '#be123c', lineHeight: 1.5 }}>
                Keep total wastage below 0.75% of inventory valuation. Any single loss above {formatETB(settings.highValueThreshold)} is escalated as high priority.
              </p>
            </div>
          </div>
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Approved Wastage & Scrap Ledger</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Posted losses from the ERP ledger, allocated to customer orders or factory overhead.</p>
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead><tr><th>Date</th><th>Material</th><th>Qty</th><th>Unit Cost</th><th>Total Loss</th><th>Store</th><th>Reason</th><th>Allocated Order</th><th>Reported / Approved</th></tr></thead>
              <tbody>
                {wastages.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontSize: '0.77rem' }}>{formatDate(w.date)}</td>
                    <td><div style={{ fontWeight: 700 }}>{w.itemName}</div>{w.notes && <div style={{ fontSize: '0.68rem', color: C.dim, maxWidth: 260 }}>{w.notes}</div>}</td>
                    <td><strong>{w.quantity} {w.unit}</strong></td>
                    <td style={{ fontSize: '0.77rem' }}>{formatETB(w.unitCost)}</td>
                    <td><strong style={{ color: C.red }}>{formatETB(w.totalCost)}</strong></td>
                    <td style={{ fontSize: '0.74rem' }}>{w.storeName}</td>
                    <td><Chip bg={C.redBg} color={C.red} small>{w.reason.replaceAll('_', ' ').toUpperCase()}</Chip></td>
                    <td style={{ fontSize: '0.74rem' }}>{w.orderNumber || 'General'}</td>
                    <td style={{ fontSize: '0.72rem' }}><div>{w.reportedBy}</div><div style={{ color: C.dim }}>{w.approvedBy || 'Pending'}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderApprovals = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div
        style={{
          background: isAdmin ? 'linear-gradient(120deg, #09090b 0%, #1c1c22 100%)' : '#fff7ed',
          border: isAdmin ? '1px solid #27272a' : '1px solid #fed7aa',
          borderRadius: 14,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: isAdmin ? 'rgba(250,204,21,0.16)' : 'rgba(245,158,11,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isAdmin ? <ShieldCheck size={21} color={C.yellow} /> : <Lock size={20} color="#b45309" />}
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: isAdmin ? C.white : '#9a3412' }}>
              {isAdmin ? `Admin Approval Authority — ${roleLabel[roleView]}` : 'Maker-Checker Gate — Admin approval required'}
            </div>
            <div style={{ fontSize: '0.75rem', color: isAdmin ? '#a1a1aa' : '#b45309', marginTop: 3 }}>
              {isAdmin
                ? `${pendingRequests.length} requests await your decision. Approving posts the movement to the live stock ledger.`
                : 'You can review the queue, but only an Admin can approve or reject stock actions. Switch role to Admin to exercise approval rights.'}
            </div>
          </div>
        </div>
        {isAdmin && (
          <button className="btn-hr-yellow" style={{ fontSize: '0.8rem' }} onClick={() => setBulkConfirmOpen(true)}>
            <CheckCircle2 size={15} /><span>Review Bulk Approval ({pendingRequests.length})</span>
          </button>
        )}
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {([
              { id: 'pending', label: `Pending (${pendingRequests.length})` },
              { id: 'all', label: `All (${requests.length})` },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ] as const).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setApprovalFilter(filter.id)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: `1px solid ${approvalFilter === filter.id ? C.black : C.border}`,
                  background: approvalFilter === filter.id ? C.black : C.white,
                  color: approvalFilter === filter.id ? C.yellow : C.muted,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
            <input className="hr-input" style={{ paddingLeft: 34 }} placeholder="Search request, item or requester…" value={approvalSearch} onChange={(e) => setApprovalSearch(e.target.value)} />
          </div>
        </div>

        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead>
              <tr><th>Request</th><th>Item / Scope</th><th>Movement</th><th>Value</th><th>Requested By</th><th>SLA Age</th><th>Status</th><th>Decision Trail</th><th style={{ textAlign: 'right' }}>Admin Decision</th></tr>
            </thead>
            <tbody>
              {approvalFiltered.map((request) => {
                const age = hoursPending(request);
                const overSla = request.status === 'pending_admin' && age > request.slaHours;
                return (
                  <tr key={request.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><TypeChip type={request.type} /><PriorityChip priority={request.priority} /></div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', maxWidth: 280 }}>{request.title}</div>
                      <div style={{ fontSize: '0.68rem', color: C.dim }}>{request.requestNumber}</div>
                    </td>
                    <td style={{ fontSize: '0.76rem' }}>
                      <div>{request.itemName || '—'}</div>
                      <div style={{ color: C.dim, fontSize: '0.68rem' }}>{request.itemCode || 'Governance'}</div>
                    </td>
                    <td style={{ fontSize: '0.74rem' }}>
                      <div>{request.fromStoreName || 'Supplier' } → {request.toStoreName || 'Production / External'}</div>
                      <div style={{ color: C.muted, fontSize: '0.7rem' }}>{request.quantity} {request.unit} {request.referenceNumber ? `• ${request.referenceNumber}` : ''}</div>
                    </td>
                    <td><strong>{formatETB(request.totalValue)}</strong></td>
                    <td style={{ fontSize: '0.74rem' }}>
                      <div>{request.requestedBy}</div>
                      <div style={{ color: C.dim, fontSize: '0.67rem' }}>{request.requestedByRole} • {formatDateTime(request.requestedAt)}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: overSla ? C.red : C.text }}>{age.toFixed(1)}h / {request.slaHours}h</div>
                      {overSla && <Chip bg={C.redBg} color={C.red} small>SLA BREACH</Chip>}
                    </td>
                    <td><StatusChip status={request.status} /></td>
                    <td style={{ fontSize: '0.71rem', color: C.muted, maxWidth: 220 }}>
                      {request.decisionNotes ? <><div>{request.decisionNotes}</div><div style={{ color: C.dim, marginTop: 2 }}>{request.approvedBy} • {request.approvedAt ? formatDateTime(request.approvedAt) : ''}</div></> : 'Awaiting Admin review'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                        {request.status === 'pending_admin' && isAdmin ? (
                          <>
                            <button className="btn-hr-outline" style={{ padding: '5px 8px', fontSize: '0.68rem' }} onClick={() => { setDecisionTarget({ request, action: 'rejected' }); setDecisionNotes(''); setDecisionEvidence([]); }}><XCircle size={12} /><span>Reject</span></button>
                            <button className="btn-hr-black" style={{ padding: '5px 9px', fontSize: '0.68rem' }} onClick={() => { setDecisionTarget({ request, action: 'approved' }); setDecisionNotes(''); setDecisionEvidence([]); }}><CheckCircle2 size={12} color={C.yellow} /><span>Approve</span></button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.69rem', color: C.dim }}>{request.status === 'pending_admin' ? 'Admin only' : 'Decision recorded'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {approvalFiltered.length === 0 && <EmptyState message="No requests in this approval view." icon={<CheckCircle2 size={22} color={C.green} />} />}
        </div>
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Enterprise Approval Matrix & Segregation of Duties</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Every stock action is maker-checker controlled and escalates to Admin irrespective of value.</p>
          </div>
          <ShieldCheck size={18} color={C.muted} />
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Request Type</th><th>Maker</th><th>Checker</th><th>Final Approver</th><th>Threshold</th><th>Target SLA</th></tr></thead>
            <tbody>
              {STORE_APPROVAL_MATRIX.map((row) => (
                <tr key={row.requestType}>
                  <td><strong>{row.requestType}</strong></td>
                  <td>{row.maker}</td>
                  <td>{row.checker}</td>
                  <td><Chip bg={C.yellow} color={C.black} small>{row.approver.toUpperCase()}</Chip></td>
                  <td>{row.threshold}</td>
                  <td>{row.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const exportLocationMaster = () => {
    downloadFile(
      'dot_advert_warehouse_location_master.json',
      JSON.stringify({ exportedAt: nowStamp(), stores, bins }, null, 2),
      'application/json'
    );
    notify('Warehouse & bin location master exported successfully.');
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    if (!isAdmin) {
      notify('Access denied. Only Admin can modify store governance policy.');
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
    addAudit({
      timestamp: nowStamp(),
      action: 'POLICY_UPDATED',
      entity: 'Store Governance',
      actor: `${currentUserName} (Admin)`,
      detail: `Governance setting "${String(key)}" changed to ${String(value)}. All store users notified.`,
      severity: 'info',
    });
    pushNotification({
      type: 'system',
      severity: 'info',
      title: 'Store governance policy updated',
      message: `${currentUserName} updated ${String(key)} to ${String(value)}. Approval controls remain enforced.`,
      audience: 'all',
    });
    notify('Governance policy updated and all store users notified.');
  };

  const renderWarehouses = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>Warehouse Network & Location Master</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: C.muted }}>Multi-store topology, bin-level occupancy, storekeeper custody and expiry-controlled zones.</p>
        </div>
        <button className="btn-hr-outline" onClick={exportLocationMaster}><Download size={14} /><span>Export Location Master</span></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {storeStats.map(({ store, skuCount, value, utilization, bins: binCount }) => (
          <div key={store.id} className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: C.black, padding: '16px 18px', color: C.white }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Warehouse size={16} color={C.yellow} />
                    <span style={{ fontSize: '0.94rem', fontWeight: 900 }}>{store.name}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#a1a1aa', marginTop: 4 }}>{store.code} • {store.storeType.replaceAll('_', ' ').toUpperCase()}</div>
                </div>
                <Chip bg="rgba(250,204,21,0.15)" color={C.yellow} small>{utilization.toFixed(0)}% UTILIZED</Chip>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.74rem', color: C.muted, marginBottom: 6 }}>
                <MapPin size={13} /> {store.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.74rem', color: C.muted, marginBottom: 14 }}>
                <User size={13} /> Custodian: <strong style={{ color: C.text }}>{store.storekeeper}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>SKUs</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{skuCount}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>Bins</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{binCount}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>Value</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 900 }}>{formatETB(value)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: C.muted, marginBottom: 5 }}>
                <span>Space utilization</span>
                <strong style={{ color: utilization > 85 ? C.red : C.text }}>{utilization.toFixed(1)}%</strong>
              </div>
              <ProgressBar pct={utilization} color={utilization > 85 ? C.red : utilization > 70 ? C.amber : C.black} />
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <Chip bg={C.greenBg} color="#047857" small>SECURE ACCESS</Chip>
                <Chip bg={C.blueBg} color="#1d4ed8" small>FEFO ACTIVE</Chip>
                <Chip bg="#f1f5f9" color="#475569" small>DUAL CONTROL</Chip>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Bin & Zone Occupancy</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Bin-level storage topology with capacity, utilization and quarantine segregation.</p>
          </div>
          <Barcode size={18} color={C.muted} />
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Bin Code</th><th>Bin Name</th><th>Zone</th><th>Store</th><th>Items</th><th>Capacity</th><th>Utilization</th><th>Status</th></tr></thead>
            <tbody>
              {bins.map((bin) => {
                const store = stores.find((s) => s.id === bin.storeId);
                const pct = (bin.usedSqm / bin.capacitySqm) * 100;
                return (
                  <tr key={bin.id}>
                    <td><strong>{bin.code}</strong></td>
                    <td>{bin.name}</td>
                    <td style={{ fontSize: '0.75rem', color: C.muted }}>{bin.zone}</td>
                    <td style={{ fontSize: '0.75rem' }}>{store?.name}</td>
                    <td>{bin.itemCount}</td>
                    <td style={{ fontSize: '0.76rem' }}>{bin.usedSqm} / {bin.capacitySqm} m²</td>
                    <td style={{ minWidth: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}><ProgressBar pct={pct} color={pct > 90 ? C.red : pct > 75 ? C.amber : C.black} height={6} /></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      {bin.status === 'quarantine' ? <Chip bg={C.redBg} color={C.red} small>QUARANTINE</Chip> : bin.status === 'high_utilization' ? <Chip bg={C.amberBg} color="#b45309" small>HIGH UTILIZATION</Chip> : <Chip bg={C.greenBg} color="#047857" small>OPTIMAL</Chip>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Batch & Expiry Tracker — FEFO Control</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: C.muted }}>Batch-level traceability with shelf-life control, quarantine state and supplier origin.</p>
          </div>
          <Timer size={18} color={C.muted} />
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Batch</th><th>Item</th><th>Store / Bin</th><th>Mfg Date</th><th>Expiry</th><th>Days Left</th><th>Qty</th><th>Value</th><th>Supplier</th><th>Status</th></tr></thead>
            <tbody>
              {batches.map((batch) => {
                const days = daysUntil(batch.expiryDate);
                return (
                  <tr key={batch.id}>
                    <td><strong>{batch.batchNumber}</strong></td>
                    <td style={{ fontSize: '0.77rem' }}>{batch.itemName}</td>
                    <td style={{ fontSize: '0.74rem' }}>{stores.find((s) => s.id === batch.storeId)?.name}<div style={{ color: C.dim }}>Bin {batch.binCode}</div></td>
                    <td style={{ fontSize: '0.74rem' }}>{formatDate(batch.mfgDate)}</td>
                    <td style={{ fontSize: '0.74rem' }}>{formatDate(batch.expiryDate)}</td>
                    <td><strong style={{ color: days <= 0 ? C.red : days <= settings.expiryWarningDays ? C.amber : C.text }}>{days <= 0 ? 'Expired' : `${days}d`}</strong></td>
                    <td>{batch.quantity} {batch.unit}</td>
                    <td>{formatETB(batch.quantity * batch.unitCost)}</td>
                    <td style={{ fontSize: '0.73rem', color: C.muted }}>{batch.supplierName}</td>
                    <td>
                      {batch.status === 'expired' ? <Chip bg={C.redBg} color={C.red} small>EXPIRED</Chip> : batch.status === 'expiring' ? <Chip bg={C.amberBg} color="#b45309" small>EXPIRING</Chip> : batch.status === 'quarantine' ? <Chip bg="#f1f5f9" color="#475569" small>QUARANTINE</Chip> : <Chip bg={C.greenBg} color="#047857" small>ACTIVE</Chip>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const cogs = stockMovements
      .filter((m) => ['production_issue', 'sales_issue', 'wastage', 'return'].includes(m.movementType))
      .reduce((sum, m) => sum + m.totalCost, 0);
    const turnover = totalValuation ? cogs / totalValuation : 0;
    const dio = turnover ? 365 / turnover : 0;
    const carryingCost = totalValuation * 0.18;
    const abcGroups = (['A', 'B', 'C'] as const).map((cls) => {
      const groupItems = items.filter((item) => abcMap[item.id] === cls);
      return { cls, count: groupItems.length, value: groupItems.reduce((sum, item) => sum + catalogVal(item), 0) };
    });
    const topValueItems = [...items].sort((a, b) => catalogVal(b) - catalogVal(a)).slice(0, 6);

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <StatCard label="Stock Turnover" value={`${turnover.toFixed(2)}x`} sub="Annualized from approved outbound movement cost" icon={<TrendingUp size={17} color={C.yellow} />} trend="0.3x" trendUp />
          <StatCard label="Days Inventory Outstanding" value={`${dio.toFixed(0)} days`} sub="Target: under 45 days for raw materials" icon={<Clock size={17} color={C.yellow} />} trend="6 days" trendUp={false} />
          <StatCard label="Carrying Cost (18%)" value={formatETB(carryingCost)} sub="Capital, storage, insurance and obsolescence" icon={<DollarSign size={17} color={C.yellow} />} />
          <StatCard label="Shrinkage Rate" value={`${((totalWastageValue / (totalValuation || 1)) * 100).toFixed(2)}%`} sub={`${formatETB(totalWastageValue)} approved loss value`} icon={<TrendingDown size={17} color={C.yellow} />} accent={C.red} />
          <StatCard label="Dead Stock Exposure" value={formatETB(deadStockItems.reduce((sum, i) => sum + catalogVal(i), 0))} sub={`${deadStockItems.length} SKUs with zero consumption`} icon={<Archive size={17} color={C.yellow} />} accent={C.amber} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)', gap: 18 }}>
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>ABC Inventory Classification</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.73rem', color: C.muted }}>A items drive 80% of valuation and require tight cycle-count frequency.</p>
              </div>
              <BarChart3 size={18} color={C.muted} />
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {abcGroups.map((group) => {
                const pct = totalValuation ? (group.value / totalValuation) * 100 : 0;
                return (
                  <div key={group.cls}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>Class {group.cls} <span style={{ color: C.muted, fontWeight: 600 }}>• {group.count} SKUs</span></span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{formatETB(group.value)} <span style={{ color: C.muted }}>({pct.toFixed(1)}%)</span></span>
                    </div>
                    <ProgressBar pct={pct} color={group.cls === 'A' ? C.yellow : group.cls === 'B' ? C.black : C.dim} height={11} />
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: '#f8fafc', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, marginBottom: 8 }}>Top Value Concentration</div>
              {topValueItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderBottom: '1px solid #eef2f6', fontSize: '0.75rem' }}>
                  <span>{item.name}</span>
                  <strong>{formatETB(catalogVal(item))}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>Valuation by Warehouse</h3>
              <Building2 size={18} color={C.muted} />
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {storeStats.map(({ store, value }) => {
                const pct = totalValuation ? (value / totalValuation) * 100 : 0;
                return (
                  <div key={store.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>{store.name}</span>
                      <span style={{ fontSize: '0.73rem', fontWeight: 900 }}>{formatETB(value)}</span>
                    </div>
                    <ProgressBar pct={pct} color={C.black} height={9} />
                    <div style={{ fontSize: '0.65rem', color: C.dim, marginTop: 3 }}>{pct.toFixed(1)}% of group inventory</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: C.black, color: C.white }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><Sparkles size={14} color={C.yellow} /><span style={{ fontSize: '0.75rem', fontWeight: 900 }}>CFO Insight</span></div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                Inventory carrying cost is {formatETB(carryingCost)} annually. Reducing DIO from {dio.toFixed(0)} to 40 days would release approximately {formatETB(Math.max(0, totalValuation * (1 - 40 / Math.max(dio, 1))))} of working capital.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 1fr)', gap: 18 }}>
          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>Reorder & Replenishment Suggestions</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.73rem', color: C.muted }}>Safety-stock engine uses burn rate, lead time and reorder policy.</p>
              </div>
              <RefreshCw size={18} color={C.muted} />
            </div>
            <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="hr-table">
                <thead><tr><th>Item</th><th>On Hand</th><th>Coverage</th><th>Reorder Qty</th><th>Preferred Supplier</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                <tbody>
                  {lowStockItems.map(({ item, expectedDays }) => (
                    <tr key={item.id}>
                      <td><div style={{ fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '0.68rem', color: C.dim }}>{item.code}</div></td>
                      <td><strong style={{ color: C.red }}>{item.currentStock} {item.unit}</strong></td>
                      <td><Chip bg={C.redBg} color={C.red} small>{expectedDays.toFixed(1)} DAYS</Chip></td>
                      <td>{item.reorderQuantity} {item.unit}</td>
                      <td style={{ fontSize: '0.74rem' }}>{item.preferredSupplierName}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-hr-outline" style={{ padding: '5px 9px', fontSize: '0.69rem' }} onClick={() => openMovement('reorder_request', item.id)}><Send size={12} /><span>Request</span></button>
                      </td>
                    </tr>
                  ))}
                  {lowStockItems.length === 0 && <tr><td colSpan={6}><EmptyState message="All items within safety stock." icon={<CheckCircle2 size={22} color={C.green} />} /></td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>Supplier Scorecards</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.73rem', color: C.muted }}>Quality, delivery and price performance.</p>
              </div>
              <Award size={18} color={C.muted} />
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              {supplierScorecards.map((supplier) => (
                <div key={supplier.id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{supplier.name}</span>
                    <Chip bg={supplier.status === 'strategic' ? C.yellow : supplier.status === 'watchlist' ? C.redBg : C.greenBg} color={supplier.status === 'strategic' ? C.black : supplier.status === 'watchlist' ? C.red : '#047857'} small>{supplier.score} / 100</Chip>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 7, fontSize: '0.68rem', color: C.muted }}>
                    <span>On-time: <strong style={{ color: C.text }}>{supplier.onTimeDeliveryPct}%</strong></span>
                    <span>Quality: <strong style={{ color: C.text }}>{supplier.qualityAcceptancePct}%</strong></span>
                    <span>Lead: <strong style={{ color: C.text }}>{supplier.averageLeadDays} days</strong></span>
                    <span>Spend: <strong style={{ color: C.text }}>{formatETB(supplier.spendYtd)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>Dead Stock, Slow Movers & Obsolescence</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.73rem', color: C.muted }}>Items with zero or negligible consumption in the current cycle.</p>
            </div>
            <Archive size={18} color={C.muted} />
          </div>
          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead><tr><th>Item</th><th>On Hand</th><th>Daily Usage</th><th>Valuation</th><th>Days Idle</th><th>Recommended Action</th></tr></thead>
              <tbody>
                {deadStockItems.map((item) => (
                  <tr key={item.id}>
                    <td><div style={{ fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '0.68rem', color: C.dim }}>{item.code}</div></td>
                    <td>{item.currentStock} {item.unit}</td>
                    <td>{item.averageDailyUsage} {item.unit}/day</td>
                    <td><strong>{formatETB(catalogVal(item))}</strong></td>
                    <td><Chip bg={C.amberBg} color="#b45309" small>90+ DAYS</Chip></td>
                    <td style={{ fontSize: '0.74rem', color: C.muted }}>Review for liquidation, repurposing or write-down approval.</td>
                  </tr>
                ))}
                {deadStockItems.length === 0 && <tr><td colSpan={6}><EmptyState message="No dead stock detected." icon={<CheckCircle2 size={22} color={C.green} />} /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAudit = () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>Audit Trail, Notifications & Governance</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: C.muted }}>Immutable decision history, maker-checker evidence and enterprise store policy controls.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-hr-outline" onClick={exportAuditCsv}><FileSpreadsheet size={14} /><span>Export CSV</span></button>
          <button className="btn-hr-black" onClick={exportAuditJson}><FileText size={14} color={C.yellow} /><span>Export JSON</span></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <StatCard label="Audit Events" value={String(auditEvents.length)} sub="Immutable maker-checker trail" icon={<FileCheck size={17} color={C.yellow} />} />
        <StatCard label="Unread Notifications" value={String(unreadCount)} sub="Approval and stock alerts" icon={<BellRing size={17} color={C.yellow} />} accent={unreadCount ? C.amber : C.text} onClick={() => setShowNotifications(true)} />
        <StatCard label="Decisions Recorded" value={String(requests.filter((r) => r.status === 'approved' || r.status === 'rejected').length)} sub={`${pendingRequests.length} still pending Admin`} icon={<ClipboardCheck size={17} color={C.yellow} />} />
        <StatCard label="Movement Freeze" value={settings.freezeAllMovements ? 'ACTIVE' : 'OFF'} sub={settings.freezeAllMovements ? 'All stock actions blocked' : 'Normal operations with Admin approval'} icon={<Lock size={17} color={C.yellow} />} accent={settings.freezeAllMovements ? C.red : C.green} />
      </div>

      <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} color={C.muted} />
            {(['all', 'info', 'success', 'warning', 'critical'] as const).map((severity) => (
              <button
                key={severity}
                onClick={() => setAuditSeverity(severity)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: `1px solid ${auditSeverity === severity ? C.black : C.border}`,
                  background: auditSeverity === severity ? C.black : C.white,
                  color: auditSeverity === severity ? C.yellow : C.muted,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {severity}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
            <input className="hr-input" style={{ paddingLeft: 34 }} placeholder="Search actor, action or request…" value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} />
          </div>
        </div>
        <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          <table className="hr-table">
            <thead><tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>Actor</th><th>Detail</th><th>Reference</th><th>Severity</th></tr></thead>
            <tbody>
              {auditFiltered.map((event) => (
                <tr key={event.id}>
                  <td style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>{formatDateTime(event.timestamp)}</td>
                  <td><strong style={{ fontSize: '0.72rem' }}>{event.action.replaceAll('_', ' ')}</strong></td>
                  <td style={{ fontSize: '0.75rem' }}>{event.entity}</td>
                  <td style={{ fontSize: '0.74rem' }}>{event.actor}</td>
                  <td style={{ fontSize: '0.73rem', color: C.muted, maxWidth: 420, lineHeight: 1.45 }}>{event.detail}</td>
                  <td style={{ fontSize: '0.7rem', color: C.blue }}>{event.requestNumber || '—'}</td>
                  <td><Chip bg={SEVERITY_COLOR[event.severity]} color={C.white} small>{event.severity.toUpperCase()}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditFiltered.length === 0 && <EmptyState message="No audit events match the selected filters." icon={<FileText size={22} color={C.dim} />} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 1fr)', gap: 18 }}>
        <div className="hr-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>Governance & Notification Policy</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.73rem', color: C.muted }}>Only Admin can change policy. Every change is notified to all store users and written to the audit trail.</p>
            </div>
            <Settings size={18} color={C.muted} />
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { key: 'adminApprovalRequired' as const, label: 'Require Admin approval for every stock action', desc: 'Mandatory maker-checker gate before ledger posting.' },
              { key: 'dualControlEnabled' as const, label: 'Dual control for physical movements', desc: 'Two signatures required at gate release.' },
              { key: 'autoReorderEnabled' as const, label: 'Auto-reorder recommendation engine', desc: 'Generate reorder requests when coverage falls below threshold.' },
              { key: 'emailNotifications' as const, label: 'Email notifications', desc: 'Send approval and escalation emails to Admin and storekeepers.' },
              { key: 'smsNotifications' as const, label: 'SMS notifications', desc: 'Critical stock alerts to duty storekeeper and Admin.' },
              { key: 'freezeAllMovements' as const, label: 'Emergency freeze on all movements', desc: 'Use only during audits or suspected shrinkage incidents.' },
            ].map((item) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 12, borderRadius: 10, border: `1px solid ${item.key === 'freezeAllMovements' && settings[item.key] ? '#fecdd3' : C.border}`, background: item.key === 'freezeAllMovements' && settings[item.key] ? C.redBg : '#f8fafc' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{item.label}</div>
                  <div style={{ fontSize: '0.69rem', color: C.muted, marginTop: 2 }}>{item.desc}</div>
                </div>
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => updateSetting(item.key, !settings[item.key])}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 999,
                    border: 'none',
                    background: settings[item.key] ? (item.key === 'freezeAllMovements' ? C.red : C.black) : '#cbd5e1',
                    cursor: isAdmin ? 'pointer' : 'not-allowed',
                    position: 'relative',
                    flexShrink: 0,
                    opacity: isAdmin ? 1 : 0.55,
                  }}
                  title={isAdmin ? 'Toggle policy' : 'Admin only'}
                >
                  <span style={{ position: 'absolute', top: 3, left: settings[item.key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: settings[item.key] ? (item.key === 'freezeAllMovements' ? C.white : C.yellow) : C.white, transition: 'left 0.15s ease' }} />
                </button>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>High Value (ETB)</label>
                <input type="number" className="hr-input" value={settings.highValueThreshold} disabled={!isAdmin} onChange={(e) => updateSetting('highValueThreshold', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Critical Value (ETB)</label>
                <input type="number" className="hr-input" value={settings.criticalValueThreshold} disabled={!isAdmin} onChange={(e) => updateSetting('criticalValueThreshold', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Expiry Warning (days)</label>
                <input type="number" className="hr-input" value={settings.expiryWarningDays} disabled={!isAdmin} onChange={(e) => updateSetting('expiryWarningDays', Number(e.target.value))} />
              </div>
            </div>
            {!isAdmin && <div style={{ fontSize: '0.7rem', color: C.amber, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={12} /> Read-only. Switch to Admin to modify policy.</div>}
          </div>
        </div>

        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>Notification Center</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: C.muted }}>{unreadCount} unread for your role</p>
            </div>
            <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: C.yellowDeep, fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {visibleNotifications.slice(0, 10).map((notification) => (
              <div key={notification.id} style={{ padding: '13px 18px', borderBottom: `1px solid #f1f5f9`, background: notification.read ? C.white : '#fefce8' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLOR[notification.severity], marginTop: 5, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>{notification.title}</div>
                    <div style={{ fontSize: '0.71rem', color: C.muted, lineHeight: 1.45, marginTop: 2 }}>{notification.message}</div>
                    <div style={{ fontSize: '0.64rem', color: C.dim, marginTop: 4 }}>{formatDateTime(notification.timestamp)} {notification.requestNumber ? `• ${notification.requestNumber}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview' as const, label: 'Command Overview', icon: Activity },
    {
      id: 'purchasing' as const,
      label: 'Purchasing & POs',
      icon: ShoppingCart,
      badge: lowStockItems.length ? `${lowStockItems.length} Low` : String(purchaseOrders.length || ''),
    },
    { id: 'staff' as const, label: 'My Item Requests', icon: PackageOpen, badge: String(myStaffRequests.filter((r) => r.status === 'pending_admin' || (r.status === 'approved' && !issuedStaffRequestIds.includes(r.id))).length + myStaffReturns.filter((r) => r.status === 'pending_admin').length || '') },
    { id: 'catalog' as const, label: 'Stock Catalog', icon: PackageSearch, badge: String(items.length) },
    { id: 'inbound' as const, label: 'Inbound / GRN', icon: ArrowDownToLine, badge: String(requests.filter((r) => r.type === 'goods_receipt' && r.status === 'pending_admin').length || '') },
    { id: 'outbound' as const, label: 'Outbound / Transfers', icon: ArrowUpFromLine },
    { id: 'adjustments' as const, label: 'Adjustments & Counts', icon: ClipboardCheck },
    { id: 'wastage' as const, label: 'Wastage & Scrap', icon: Trash2 },
    { id: 'approvals' as const, label: 'Admin Approvals', icon: ShieldCheck, badge: String(pendingRequests.length) },
    { id: 'admin' as const, label: 'Admin Action Highlights', icon: ShieldAlert, badge: String(pendingRequests.length) },
    { id: 'reports' as const, label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'warehouses' as const, label: 'Warehouses & Bins', icon: Warehouse },
    { id: 'analytics' as const, label: 'Inventory Analytics', icon: BarChart3 },
    { id: 'audit' as const, label: 'Audit & Governance', icon: FileText },
  ];

  const visibleTabs = isStaff ? tabs.filter((tab) => tab.id === 'staff') : tabs;

  return (
    <div className="hr-page-shell" style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* ROLE & NOTIFICATION BAR */}
      <div
        style={{
          background: C.black,
          border: '1px solid #27272a',
          borderRadius: 14,
          padding: '10px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: C.yellow, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} /> Active Store Role:
          </span>
          <div style={{ display: 'flex', gap: 5, background: C.blackSoft, padding: 4, borderRadius: 10, border: '1px solid #3f3f46', flexWrap: 'wrap' }}>
            {(['staff', 'storekeeper', 'purchasing', 'store_supervisor', 'admin', 'super_admin'] as StoreModuleRole[]).map((role) => (
              <button
                key={role}
                onClick={() => handleSwitchRole(role)}
                style={{
                  background: roleView === role ? C.yellow : 'transparent',
                  color: roleView === role ? C.black : '#a1a1aa',
                  border: 'none',
                  borderRadius: 7,
                  padding: '7px 12px',
                  fontSize: '0.76rem',
                  fontWeight: roleView === role ? 900 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{role === 'staff' ? '👤' : role === 'storekeeper' ? '📦' : role === 'purchasing' ? '🛒' : role === 'store_supervisor' ? '🧭' : role === 'admin' ? '🛡️' : '⚡'}</span>
                <span>{roleLabel[role]}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 9, padding: '6px 11px' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.yellow, color: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
              {currentUserName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: C.white }}>{currentUserName}</div>
              <div style={{ fontSize: '0.6rem', color: '#a1a1aa' }}>{roleLabel[roleView]} • {isAdmin ? 'Approval authority' : 'Maker only'}</div>
            </div>
          </div>
          <button
            onClick={() => setShowNotifications(true)}
            style={{ position: 'relative', width: 38, height: 38, borderRadius: 9, border: '1px solid #3f3f46', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Open notification center"
          >
            <Bell size={17} color={C.yellow} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: C.red, color: C.white, fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #09090b' }}>
                {unreadCount}
              </span>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            Admin approval enforced
          </div>
        </div>
      </div>

      {/* COMMAND BANNER */}
      <div
        style={{
          background: 'linear-gradient(180deg, #09090b 0%, #111115 100%)',
          color: C.white,
          borderRadius: 16,
          padding: '26px 30px',
          marginBottom: 22,
          border: '1px solid #27272a',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, position: 'relative' }}>
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: C.yellow, background: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.4)', padding: '3px 12px', borderRadius: 6, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={12} /> Enterprise Store & Purchasing Inventory Control Tower
              </span>
              <span style={{ fontSize: '0.73rem', color: '#a1a1aa' }}>• ISO 9001 • IFRS-compliant valuation • Ethiopian VAT ready</span>
            </div>
            <h1 style={{ color: C.white, fontSize: '2.05rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              Store & Purchasing Inventory Governance
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.84rem', marginTop: 6, maxWidth: 880, lineHeight: 1.5 }}>
              Multi-warehouse control for advertising and large-format signage manufacturing: goods receipt, QC, put-away, production issue, inter-store transfer, cycle counting, batch expiry, wastage, valuation and an immutable Admin-approved audit trail.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            {isStaff ? (
              <>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => setActiveTab('staff')}>
                  <PackageOpen size={15} color={C.yellow} /><span>My Requests ({myStaffRequests.length})</span>
                </button>
                <button className="btn-hr-yellow" onClick={() => openMovement('staff_requisition')}>
                  <PlusCircle size={15} /><span>Request an Item</span>
                </button>
              </>
            ) : isPurchasing ? (
              <>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => setActiveTab('inbound')}>
                  <ArrowDownToLine size={15} color={C.yellow} /><span>Inbound GRNs</span>
                </button>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => openMovement('reorder_request')}>
                  <RefreshCw size={15} color={C.yellow} /><span>Reorder Request</span>
                </button>
                <button className="btn-hr-yellow" onClick={() => setActiveTab('purchasing')}>
                  <ShoppingCart size={15} /><span>Purchasing & PO Desk</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => openMovement('goods_receipt')}>
                  <ArrowDownToLine size={15} color={C.yellow} /><span>Goods Receipt</span>
                </button>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => openMovement('material_issue')}>
                  <ArrowUpFromLine size={15} color={C.yellow} /><span>Issue Material</span>
                </button>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => openMovement('inter_store_transfer')}>
                  <ArrowRightLeft size={15} color={C.yellow} /><span>Transfer</span>
                </button>
                <button className="btn-hr-black" style={{ background: '#18181b', border: '1px solid #3f3f46' }} onClick={() => openMovement('wastage')}>
                  <Trash2 size={15} color={C.yellow} /><span>Log Wastage</span>
                </button>
                <button className="btn-hr-yellow" onClick={() => setActiveTab('approvals')}>
                  <ShieldCheck size={15} /><span>Approve Queue ({pendingRequests.length})</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, fontSize: '0.73rem', color: '#a1a1aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} /> {stores.length} Warehouses Online</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert size={13} color={C.yellow} /> {pendingRequests.length} Actions Awaiting Admin</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Boxes size={13} color={C.yellow} /> Valuation: <strong style={{ color: C.white }}>{formatETB(totalValuation)}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={13} color={C.yellow} /> Accuracy: <strong style={{ color: C.white }}>{inventoryAccuracy.toFixed(1)}%</strong></span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} color={C.yellow} /> Maker–Checker Gate: <strong style={{ color: C.yellow }}>ALL STORE ACTIONS REQUIRE ADMIN APPROVAL</strong>
          </span>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, background: C.black, border: `1px solid ${C.yellow}`, color: C.white, padding: '12px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.35)', maxWidth: 470 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(250,204,21,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={15} color={C.yellow} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.4 }}>{toast}</span>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, overflowX: 'auto', paddingBottom: 3 }}>
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 13px',
                borderRadius: 9,
                border: `1px solid ${active ? C.black : C.border}`,
                background: active ? C.black : C.white,
                color: active ? C.yellow : C.muted,
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && tab.badge !== '0' && tab.badge !== '' && (
                <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: active ? C.yellow : C.black, color: active ? C.black : C.yellow, fontSize: '0.62rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#fefce8', border: '1px solid #fde68a', marginBottom: 18, fontSize: '0.72rem', color: '#854d0e', fontWeight: 600 }}>
        <Info size={14} />
        <span>Control rule: every store action creates an Admin notification and remains non-posting until approved. Approvals are recorded with actor, timestamp, decision notes and signature code.</span>
      </div>

      {activeTab === 'overview' && (isStaff ? renderStaffPortal() : renderOverview())}
      {(activeTab === 'purchasing' || activeTab === 'suppliers') && (
        <StorePurchasingDesk
          items={items}
          stores={stores}
          suppliers={suppliers}
          purchaseOrders={purchaseOrders}
          lowStockItems={lowStockItems}
          currentRole={roleView}
          currentUserName={currentUserName}
          isAdmin={isAdmin}
          isPurchasing={isPurchasing}
          initialTab={activeTab === 'suppliers' ? 'suppliers' : 'orders'}
          onCreatePo={createPurchaseOrder}
          onReceivePo={receivePurchaseOrder}
          onApprovePo={approvePurchaseOrder}
          onAddSupplier={addSupplier}
          onAddItem={addItem}
          onUpdatePoStatus={updatePurchaseOrderStatus}
          onAudit={addAudit}
          onNotification={pushNotification}
          onNotify={notify}
          onSwitchTab={setActiveTab}
        />
      )}
      {activeTab === 'staff' && renderStaffPortal()}
      {activeTab === 'catalog' && renderCatalog()}
      {activeTab === 'inbound' && renderInbound()}
      {activeTab === 'outbound' && renderOutbound()}
      {activeTab === 'adjustments' && renderAdjustments()}
      {activeTab === 'wastage' && renderWastage()}
      {activeTab === 'approvals' && renderApprovals()}
      {activeTab === 'admin' && (
        <StoreAdminHighlights
          requests={requests}
          auditEvents={auditEvents}
          notifications={notifications}
          isAdmin={isAdmin}
          onDecision={(request, action) => {
            setDecisionTarget({ request, action });
            setDecisionNotes('');
            setDecisionEvidence([]);
          }}
          onOpenApprovals={() => {
            setApprovalFilter('pending');
            setActiveTab('approvals');
          }}
          onOpenNotifications={() => setShowNotifications(true)}
        />
      )}
      {activeTab === 'reports' && (
        <StoreReports
          items={items}
          stores={stores}
          stockMovements={stockMovements}
          wastages={wastages}
          requests={requests}
          batches={batches}
          lowStockItems={lowStockItems}
          supplierScorecards={supplierScorecards}
          purchaseOrders={purchaseOrders}
          auditEvents={auditEvents}
          totalValuation={totalValuation}
          inventoryAccuracy={inventoryAccuracy}
          onNotify={notify}
        />
      )}
      {activeTab === 'warehouses' && renderWarehouses()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'audit' && renderAudit()}

      {/* MOVEMENT REQUEST MODAL */}
      {showMovementModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 18 }} onClick={() => setShowMovementModal(false)}>
          <div style={{ width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto', borderRadius: 14, background: C.white, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: C.black, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: '14px 14px 0 0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={17} color={C.yellow} />
                  <h3 style={{ margin: 0, color: C.white, fontSize: '0.98rem', fontWeight: 900 }}>{formType === 'staff_requisition' ? 'Request an Item from the Store' : 'New Store Action — Admin Approval Required'}</h3>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 4 }}>{REQUEST_TYPE_META[formType].label} • The request will be routed to Admin immediately.</div>
              </div>
              <button onClick={() => setShowMovementModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div style={{ padding: 22, display: 'grid', gap: 14 }}>
                {formType === 'staff_requisition' ? (
                  <div style={{ padding: '10px 12px', borderRadius: 9, background: C.blueBg, border: '1px solid #bfdbfe', fontSize: '0.74rem', color: '#1d4ed8', lineHeight: 1.5 }}>
                    <strong>Staff item request.</strong> Submit the item, quantity and reason. Admin approves first, then the storekeeper is notified to prepare the item for collection.
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Action Type</label>
                    <select
                      className="hr-select"
                      value={formType}
                      onChange={(e) => openMovement(e.target.value as StoreRequestType, formItemId, formFromStore)}
                    >
                      {Object.entries(REQUEST_TYPE_META)
                        .filter(([key]) => key !== 'staff_return')
                        .map(([key, meta]) => (
                          <option key={key} value={key}>{meta.label}</option>
                        ))}
                    </select>
                  </div>
                )}

                {formType === 'item_onboarding' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>New Item Name *</label>
                      <input className="hr-input" placeholder="e.g. Matte Lamination Film 1.37m" value={formNewItemName} onChange={(e) => setFormNewItemName(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>SKU Code *</label>
                      <input className="hr-input" placeholder="e.g. RM-LAM-MAT" value={formNewItemCode} onChange={(e) => setFormNewItemCode(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Unit</label>
                      <select className="hr-select" value={formUnit} onChange={(e) => setFormUnit(e.target.value as Item['unit'])}>
                        {(['piece', 'meter', 'sqm', 'liter', 'kg', 'roll', 'carton'] as const).map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Item / Material *</label>
                    <select className="hr-select" value={formItemId} onChange={(e) => handleFormItemChange(e.target.value)}>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>{item.name} ({item.code}) — {item.currentStock} {item.unit} on hand</option>
                      ))}
                    </select>
                    {formItem && <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: 4 }}>{formType === 'staff_requisition' ? `Available at ${formItem.storeBalances[formFromStore] || 0} ${formItem.unit} in selected store` : `Valuation ${formatETB(catalogVal(formItem))} • Reorder level ${formItem.reorderLevel} ${formItem.unit} • Supplier ${formItem.preferredSupplierName || '—'}`}</div>}
                  </div>
                )}

                {formType === 'staff_requisition' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Collect From Store *</label>
                      <select className="hr-select" value={formFromStore} onChange={(e) => setFormFromStore(e.target.value)}>
                        {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Department / Section *</label>
                      <select className="hr-select" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)}>
                        {['Production', 'Design Studio', 'Installation', 'Sales', 'Administration', 'Maintenance'].map((department) => <option key={department} value={department}>{department}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {formType === 'stock_adjustment' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Store</label>
                        <select className="hr-select" value={formFromStore} onChange={(e) => {
                          setFormFromStore(e.target.value);
                          if (formItem) {
                            const system = formItem.storeBalances[e.target.value] || 0;
                            setFormSystemQty(system);
                            setFormCountedQty(system);
                          }
                        }}>
                          {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>System Quantity</label>
                        <input className="hr-input" type="number" value={formSystemQty} onChange={(e) => setFormSystemQty(Number(e.target.value))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Counted Quantity *</label>
                        <input className="hr-input" type="number" value={formCountedQty} onChange={(e) => setFormCountedQty(Number(e.target.value))} />
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: 9, background: formCountedQty - formSystemQty === 0 ? '#f8fafc' : formCountedQty - formSystemQty > 0 ? C.blueBg : C.redBg, border: `1px solid ${formCountedQty - formSystemQty === 0 ? C.border : formCountedQty - formSystemQty > 0 ? '#bfdbfe' : '#fecdd3'}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 800 }}>
                      <span>Detected variance ({formItem?.unit || formUnit}):</span>
                      <span style={{ color: formCountedQty - formSystemQty > 0 ? C.blue : formCountedQty - formSystemQty < 0 ? C.red : C.muted }}>
                        {formCountedQty - formSystemQty > 0 ? '+' : ''}{(formCountedQty - formSystemQty).toFixed(2)} • {formatETB(Math.abs(formCountedQty - formSystemQty) * (formItem?.purchasePrice || formUnitCost))}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: formType === 'staff_requisition' ? '1fr' : '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Quantity * ({formType === 'item_onboarding' ? formUnit : formItem?.unit || formUnit})</label>
                      <input className="hr-input" type="number" min="0.01" step="any" value={formQty} onChange={(e) => {
                        const nextQty = Number(e.target.value);
                        setFormQty(nextQty);
                        if (formType === 'goods_receipt') {
                          setFormAcceptedQty(nextQty);
                          setFormRejectedQty(0);
                        }
                      }} />
                    </div>
                    {formType !== 'staff_requisition' && (
                      <div>
                        <label style={labelStyle}>Unit Cost (ETB) *</label>
                        <input className="hr-input" type="number" min="0" step="any" value={formUnitCost} onChange={(e) => setFormUnitCost(Number(e.target.value))} />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: (formType === 'inter_store_transfer' || formType === 'stock_adjustment') ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {['material_issue', 'inter_store_transfer', 'wastage', 'supplier_return', 'stock_adjustment'].includes(formType) && (
                    <div>
                      <label style={labelStyle}>{formType === 'stock_adjustment' ? 'Adjustment Store' : 'Source Store (From)'}</label>
                      <select className="hr-select" value={formFromStore} onChange={(e) => setFormFromStore(e.target.value)} disabled={formType === 'stock_adjustment'}>
                        {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                      </select>
                    </div>
                  )}
                  {['goods_receipt', 'inter_store_transfer', 'reorder_request', 'item_onboarding'].includes(formType) && (
                    <div>
                      <label style={labelStyle}>Destination Store (To)</label>
                      <select className="hr-select" value={formToStore} onChange={(e) => setFormToStore(e.target.value)}>
                        {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {['goods_receipt', 'reorder_request', 'supplier_return', 'item_onboarding'].includes(formType) && (
                  <div>
                    <label style={labelStyle}>Supplier</label>
                    <select className="hr-select" value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)}>
                      <option value="">Select supplier…</option>
                      {suppliers.map((supplier) => <option key={supplier.id} value={supplier.name}>{supplier.name}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{formType === 'staff_requisition' ? 'Needed For / Job Reference' : formType === 'goods_receipt' ? 'Purchase Order / Delivery Note' : formType === 'material_issue' ? 'Work Order / Order Reference' : formType === 'wastage' ? 'Order Allocation (Job Cost)' : formType === 'stock_adjustment' ? 'Count / Evidence Reference' : 'Reference Number'}</label>
                    {formType === 'wastage' ? (
                      <select className="hr-select" value={formReference} onChange={(e) => setFormReference(e.target.value)}>
                        <option value="">General overhead (no order)</option>
                        {orders.map((order) => <option key={order.id} value={order.orderNumber}>{order.orderNumber} — {order.customerName}</option>)}
                      </select>
                    ) : formType === 'goods_receipt' ? (
                      <select className="hr-select" value={formReference} onChange={(e) => setFormReference(e.target.value)}>
                        <option value="">No linked PO</option>
                        {purchaseOrders.map((po) => <option key={po.id} value={po.poNumber}>{po.poNumber} — {po.supplierName}</option>)}
                      </select>
                    ) : (
                      <input className="hr-input" placeholder={formType === 'staff_requisition' ? 'e.g. Awash Bank install — needed by 3 PM' : 'Enter reference…'} value={formReference} onChange={(e) => setFormReference(e.target.value)} />
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Priority</label>
                    <select className="hr-select" value={formPriority} onChange={(e) => setFormPriority(e.target.value as StorePriority)}>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {['goods_receipt', 'supplier_return'].includes(formType) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Batch / Lot Number</label>
                      <input className="hr-input" placeholder="e.g. INK-2610-BLK" value={formBatch} onChange={(e) => setFormBatch(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Expiry Date</label>
                      <input className="hr-input" type="date" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)} />
                    </div>
                  </div>
                )}

                {formType === 'goods_receipt' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Incoming Quality Result</label>
                        <select className="hr-select" value={formQc} onChange={(e) => setFormQc(e.target.value as NonNullable<StoreApprovalRequest['qcResult']>)}>
                          <option value="passed">Passed — full acceptance</option>
                          <option value="partial">Partial — some units rejected</option>
                          <option value="failed">Failed — reject delivery</option>
                          <option value="not_applicable">Not applicable</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Accepted Qty</label>
                        <input className="hr-input" type="number" min="0" step="any" value={formAcceptedQty} onChange={(e) => {
                          const nextAccepted = Math.max(0, Number(e.target.value));
                          setFormAcceptedQty(nextAccepted);
                          setFormRejectedQty(Math.max(0, formQty - nextAccepted));
                        }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Rejected Qty</label>
                        <input className="hr-input" type="number" min="0" step="any" value={formRejectedQty} onChange={(e) => {
                          const nextRejected = Math.max(0, Number(e.target.value));
                          setFormRejectedQty(nextRejected);
                          setFormAcceptedQty(Math.max(0, formQty - nextRejected));
                        }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Put-away Bin</label>
                        <input className="hr-input" placeholder="e.g. A-01" value={formBin} onChange={(e) => setFormBin(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ padding: '9px 12px', borderRadius: 9, background: formAcceptedQty + formRejectedQty === formQty ? C.blueBg : C.redBg, border: `1px solid ${formAcceptedQty + formRejectedQty === formQty ? '#bfdbfe' : '#fecdd3'}`, display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: '0.72rem', fontWeight: 800 }}>
                      <span>Receipt posting preview: accepted {formAcceptedQty} {formUnit} → bin {formBin || 'unassigned'}</span>
                      <span style={{ color: formAcceptedQty + formRejectedQty === formQty ? C.blue : C.red }}>{formAcceptedQty + formRejectedQty === formQty ? 'Balanced' : 'Quantities do not balance'}</span>
                    </div>
                  </>
                )}

                <div>
                  <label style={labelStyle}>Business Justification / Reason *</label>
                  <textarea className="hr-input" rows={2} placeholder="Explain why this stock action is required. This is mandatory for audit." value={formReason} onChange={(e) => setFormReason(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Evidence & Supporting Notes</label>
                  <textarea className="hr-input" rows={2} placeholder="Reference delivery note, count sheet, photos, machine ticket, supplier RA…" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
                </div>

                <div>
                  <label style={labelStyle}>Evidence Attached</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      'Delivery note / GRN',
                      'Supplier invoice',
                      'Count sheet',
                      'Photo evidence',
                      'Dual signature',
                    ].map((evidence) => {
                      const checked = formEvidence.includes(evidence);
                      return (
                        <label key={evidence} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 7, border: `1px solid ${checked ? C.black : C.border}`, background: checked ? '#09090b' : C.white, color: checked ? C.yellow : C.muted, fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>
                          <input type="checkbox" checked={checked} onChange={() => setFormEvidence((prev) => checked ? prev.filter((item) => item !== evidence) : [...prev, evidence])} style={{ display: 'none' }} />
                          {checked ? <Check size={11} /> : null}
                          {evidence}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', color: C.muted }}>
                  <Info size={14} color={C.amber} />
                  <span>Maker: <strong style={{ color: C.text }}>{currentUserName} ({roleLabel[roleView]})</strong> • Approver: <strong style={{ color: C.text }}>Admin</strong> • This action is non-posting until approved.</span>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', color: C.dim }}>Signature: <strong style={{ color: C.text }}>AUTO-{roleView.slice(0, 3).toUpperCase()}-{requestSeq}</strong></span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-hr-outline" onClick={() => setShowMovementModal(false)}>Cancel</button>
                  <button type="submit" className="btn-hr-yellow"><Lock size={14} /><span>Submit for Admin Approval</span></button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM 360 MODAL */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 18 }} onClick={() => setSelectedItem(null)}>
          <div style={{ width: '100%', maxWidth: 900, maxHeight: '92vh', overflowY: 'auto', borderRadius: 14, background: C.white, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: C.black, padding: '18px 22px', borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageOpen size={18} color={C.yellow} />
                  <h3 style={{ margin: 0, color: C.white, fontSize: '1rem', fontWeight: 900 }}>{selectedItem.name}</h3>
                </div>
                <div style={{ fontSize: '0.71rem', color: '#a1a1aa', marginTop: 4 }}>{selectedItem.code} • {selectedItem.amharicName || 'No Amharic label'} • {selectedItem.type.replaceAll('_', ' ')}</div>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 22, display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { label: 'On Hand', value: `${selectedItem.currentStock} ${selectedItem.unit}` },
                  { label: 'Valuation', value: formatETB(catalogVal(selectedItem)) },
                  { label: 'Unit Cost', value: formatETB(selectedItem.purchasePrice) },
                  { label: 'Reorder Level', value: `${selectedItem.reorderLevel} ${selectedItem.unit}` },
                  { label: 'ABC Class', value: abcMap[selectedItem.id] },
                ].map((metric) => (
                  <div key={metric.label} style={{ padding: 12, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>{metric.label}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, marginTop: 2 }}>{metric.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 900 }}>Store Balances</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {stores.map((store) => (
                    <div key={store.id} style={{ padding: 12, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '0.7rem', color: C.muted }}>{store.name}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, marginTop: 2 }}>{selectedItem.storeBalances[store.id] || 0} {selectedItem.unit}</div>
                      <div style={{ fontSize: '0.65rem', color: C.dim }}>{formatETB((selectedItem.storeBalances[store.id] || 0) * selectedItem.purchasePrice)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Barcode size={14} color={C.muted} /><h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900 }}>Batch Traceability</h4></div>
                <div className="hr-table-container">
                  <table className="hr-table">
                    <thead><tr><th>Batch</th><th>Bin</th><th>Qty</th><th>Expiry</th><th>Supplier</th><th>Status</th></tr></thead>
                    <tbody>
                      {selectedItemBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td><strong>{batch.batchNumber}</strong></td>
                          <td>{batch.binCode}</td>
                          <td>{batch.quantity} {batch.unit}</td>
                          <td>{formatDate(batch.expiryDate)}</td>
                          <td style={{ fontSize: '0.73rem' }}>{batch.supplierName}</td>
                          <td>{batch.status === 'expired' ? <Chip bg={C.redBg} color={C.red} small>EXPIRED</Chip> : batch.status === 'expiring' ? <Chip bg={C.amberBg} color="#b45309" small>EXPIRING</Chip> : batch.status === 'quarantine' ? <Chip bg="#f1f5f9" color="#475569" small>QUARANTINE</Chip> : <Chip bg={C.greenBg} color="#047857" small>ACTIVE</Chip>}</td>
                        </tr>
                      ))}
                      {selectedItemBatches.length === 0 && <tr><td colSpan={6}><EmptyState message="No batch records for this item." icon={<Barcode size={20} color={C.dim} />} /></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><ClipboardList size={14} color={C.muted} /><h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900 }}>Recent Approved Movements</h4></div>
                <div className="hr-table-container">
                  <table className="hr-table">
                    <thead><tr><th>Movement</th><th>Date</th><th>Type</th><th>Qty</th><th>Value</th><th>Reference</th><th>Created By</th></tr></thead>
                    <tbody>
                      {selectedItemMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td><strong>{movement.movementNumber}</strong></td>
                          <td>{formatDate(movement.date)}</td>
                          <td><Chip bg="#f1f5f9" color="#475569" small>{movement.movementType.replaceAll('_', ' ').toUpperCase()}</Chip></td>
                          <td>{movement.quantity} {movement.unit}</td>
                          <td>{formatETB(movement.totalCost)}</td>
                          <td style={{ fontSize: '0.72rem' }}>{movement.referenceNumber || '—'}</td>
                          <td style={{ fontSize: '0.72rem' }}>{movement.createdBy}</td>
                        </tr>
                      ))}
                      {selectedItemMovements.length === 0 && <tr><td colSpan={7}><EmptyState message="No approved movements yet." icon={<ArrowRightLeft size={20} color={C.dim} />} /></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn-hr-outline" onClick={() => { setSelectedItem(null); openMovement('reorder_request', selectedItem.id); }}><RefreshCw size={14} /><span>Request Reorder</span></button>
                <button className="btn-hr-outline" onClick={() => { setSelectedItem(null); openMovement('material_issue', selectedItem.id); }}><ArrowUpFromLine size={14} /><span>Issue Material</span></button>
                <button className="btn-hr-outline" onClick={() => { setSelectedItem(null); openMovement('stock_adjustment', selectedItem.id); }}><ClipboardCheck size={14} /><span>Adjust Stock</span></button>
                <button className="btn-hr-black" onClick={() => { setSelectedItem(null); openMovement('wastage', selectedItem.id); }}><Trash2 size={14} color={C.yellow} /><span>Log Wastage</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAFF RETURN MODAL */}
      {returnTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 18 }} onClick={() => setReturnTarget(null)}>
          <div style={{ width: '100%', maxWidth: 560, borderRadius: 14, background: C.white, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: C.black, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: '14px 14px 0 0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={17} color={C.yellow} />
                  <h3 style={{ margin: 0, color: C.white, fontSize: '0.98rem', fontWeight: 900 }}>Return Item to Store</h3>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 4 }}>Admin approval is required before stock is restored or wastage is posted.</div>
              </div>
              <button onClick={() => setReturnTarget(null)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={submitStaffReturn}>
              <div style={{ padding: 22, display: 'grid', gap: 14 }}>
                <div style={{ padding: '10px 12px', borderRadius: 9, background: C.amberBg, border: '1px solid #fde68a', fontSize: '0.74rem', color: '#92400e', lineHeight: 1.5 }}>
                  <strong>{returnTarget.itemName}</strong><br />
                  Original issue {returnTarget.requestNumber} • Issued {returnTarget.quantity} {returnTarget.unit} • Available to return {returnAvailableQty} {returnTarget.unit}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Return Quantity *</label>
                    <input className="hr-input" type="number" min="1" max={returnAvailableQty} value={returnQty} onChange={(e) => setReturnQty(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Item Condition *</label>
                    <select className="hr-select" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value as 'reusable' | 'damaged')}>
                      <option value="reusable">Reusable — return to stock</option>
                      <option value="damaged">Damaged — write off as wastage</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Reason for Return *</label>
                  <textarea className="hr-input" rows={3} value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="e.g. Job completed, unused material. Or describe the damage." />
                </div>
                <div style={{ padding: '9px 11px', borderRadius: 8, background: '#f8fafc', border: `1px solid ${C.border}`, fontSize: '0.7rem', color: C.muted, lineHeight: 1.5 }}>
                  Reusable returns increase stock only after Admin approval. Damaged returns are returned and written off as wastage under the same Admin approval.
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn-hr-outline" onClick={() => setReturnTarget(null)}>Cancel</button>
                <button type="submit" className="btn-hr-black"><Send size={14} color={C.yellow} /><span>Submit Return</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECISION MODAL */}
      {decisionTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 320, padding: 18 }} onClick={() => setDecisionTarget(null)}>
          <div style={{ width: '100%', maxWidth: 540, borderRadius: 14, background: C.white, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: decisionTarget.action === 'approved' ? C.black : C.red, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {decisionTarget.action === 'approved' ? <ShieldCheck size={18} color={C.yellow} /> : <XCircle size={18} color={C.white} />}
                <h3 style={{ margin: 0, color: C.white, fontSize: '0.95rem', fontWeight: 900 }}>
                  {decisionTarget.action === 'approved' ? 'Approve Store Action' : 'Reject Store Action'}
                </h3>
              </div>
              <button onClick={() => setDecisionTarget(null)} style={{ background: 'transparent', border: 'none', color: C.white, cursor: 'pointer' }}><X size={19} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ padding: 12, borderRadius: 9, background: '#f8fafc', border: `1px solid ${C.border}`, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><TypeChip type={decisionTarget.request.type} /><PriorityChip priority={decisionTarget.request.priority} /></div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>{decisionTarget.request.title}</div>
                <div style={{ fontSize: '0.71rem', color: C.muted, marginTop: 3 }}>{decisionTarget.request.requestNumber} • {formatETB(decisionTarget.request.totalValue)} • Requested by {decisionTarget.request.requestedBy}</div>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.76rem', color: C.muted, lineHeight: 1.5 }}>
                {decisionTarget.action === 'approved'
                  ? 'Approving will apply the movement to the live stock ledger, update store balances and notify the requesting storekeeper. This action is captured in the audit trail.'
                  : 'Rejecting will not change stock balances. The requesting storekeeper will receive your decision notes and may resubmit with corrected evidence.'}
              </p>
              <label style={labelStyle}>Decision Notes {decisionTarget.action === 'rejected' ? '(recommended)' : ''}</label>
              <textarea className="hr-input" rows={3} value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} placeholder={decisionTarget.action === 'approved' ? 'e.g. Verified against PO, count sheet and CCTV. Approved for posting.' : 'e.g. Missing photographic evidence. Resubmit with countersignature.'} />

              <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>Evidence Verified</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {[
                    'Source document matched',
                    'Quantity independently checked',
                    'Supporting photo / scan reviewed',
                    'Dual signature present',
                  ].map((evidence) => {
                    const checked = decisionEvidence.includes(evidence);
                    return (
                      <label key={evidence} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px', borderRadius: 7, border: `1px solid ${checked ? C.black : C.border}`, background: checked ? '#09090b' : C.white, color: checked ? C.yellow : C.muted, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>
                        <input type="checkbox" checked={checked} onChange={() => setDecisionEvidence((prev) => checked ? prev.filter((item) => item !== evidence) : [...prev, evidence])} style={{ display: 'none' }} />
                        {checked ? <Check size={12} /> : <span style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${C.borderStrong}` }} />}
                        {evidence}
                      </label>
                    );
                  })}
                </div>
                <div style={{ marginTop: 9, fontSize: '0.68rem', color: C.muted }}>
                  Admin signature: <strong style={{ color: C.text }}>{currentUserName} • ADMIN-SIG-{decisionTarget.request.requestNumber.split('-').pop()}</strong>
                </div>
              </div>

              {!isAdmin && <div style={{ marginTop: 10, fontSize: '0.74rem', color: C.red, fontWeight: 800 }}>Access denied — Admin authority required.</div>}
            </div>
            <div style={{ padding: '13px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-hr-outline" onClick={() => setDecisionTarget(null)}>Cancel</button>
              {decisionTarget.action === 'approved' ? (
                <button className="btn-hr-yellow" onClick={finalizeDecision}><CheckCircle2 size={15} /><span>Confirm Approval & Post</span></button>
              ) : (
                <button className="btn-hr-black" style={{ background: C.red, borderColor: C.red }} onClick={finalizeDecision}><XCircle size={15} color={C.white} /><span>Confirm Rejection</span></button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BULK APPROVAL CONFIRMATION */}
      {bulkConfirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 330, padding: 18 }} onClick={() => setBulkConfirmOpen(false)}>
          <div style={{ width: '100%', maxWidth: 560, borderRadius: 14, background: C.white, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: C.black, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color={C.yellow} />
                <h3 style={{ margin: 0, color: C.white, fontSize: '0.95rem', fontWeight: 900 }}>Confirm Bulk Approval</h3>
              </div>
              <button onClick={() => setBulkConfirmOpen(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={19} /></button>
            </div>
            <div style={{ padding: 20, display: 'grid', gap: 14 }}>
              <div style={{ padding: 12, borderRadius: 9, background: C.amberBg, border: '1px solid #fde68a', fontSize: '0.74rem', color: '#92400e', lineHeight: 1.55 }}>
                You are about to approve <strong>{pendingRequests.length} pending store actions</strong> totalling <strong>{formatETB(pendingRequests.reduce((sum, request) => sum + request.totalValue, 0))}</strong>. This will post every movement to the live stock ledger and cannot be undone.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Requests', value: String(pendingRequests.length), color: C.text },
                  { label: 'Critical', value: String(pendingRequests.filter((request) => request.priority === 'critical').length), color: C.red },
                  { label: 'SLA breaches', value: String(pendingRequests.filter((request) => hoursPending(request) > request.slaHours).length), color: C.amber },
                ].map((metric) => (
                  <div key={metric.label} style={{ padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f8fafc' }}>
                    <div style={{ fontSize: '0.62rem', color: C.muted, textTransform: 'uppercase', fontWeight: 800 }}>{metric.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: metric.color }}>{metric.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ maxHeight: 190, overflowY: 'auto', display: 'grid', gap: 7 }}>
                {pendingRequests.map((request) => (
                  <div key={request.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.border}` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>{request.requestNumber} • {request.itemName || request.title}</div>
                      <div style={{ fontSize: '0.66rem', color: C.muted }}>{REQUEST_TYPE_META[request.type].label} • {request.requestedBy}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 900 }}>{formatETB(request.totalValue)}</div>
                      <PriorityChip priority={request.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '13px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-hr-outline" onClick={() => setBulkConfirmOpen(false)}>Cancel</button>
              <button className="btn-hr-yellow" onClick={bulkApprove}><CheckCircle2 size={15} /><span>Approve All & Post</span></button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE COUNT MODAL */}
      {showCountModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 320, padding: 18 }} onClick={() => setShowCountModal(false)}>
          <div style={{ width: '100%', maxWidth: 520, borderRadius: 14, background: C.white, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: C.black, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScanBarcode size={18} color={C.yellow} />
                <h3 style={{ margin: 0, color: C.white, fontSize: '0.95rem', fontWeight: 900 }}>Schedule Blind Cycle Count</h3>
              </div>
              <button onClick={() => setShowCountModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={19} /></button>
            </div>
            <form onSubmit={handleScheduleCount}>
              <div style={{ padding: 20, display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Store</label>
                    <select className="hr-select" value={countStore} onChange={(e) => setCountStore(e.target.value)}>
                      {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Item</label>
                    <select className="hr-select" value={countItemId} onChange={(e) => setCountItemId(e.target.value)}>
                      {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Zone / Bin Range</label>
                  <input className="hr-input" value={countZone} onChange={(e) => setCountZone(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Counter</label>
                    <input className="hr-input" value={countCounter} onChange={(e) => setCountCounter(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Scheduled Date</label>
                    <input className="hr-input" type="date" value={countDate} onChange={(e) => setCountDate(e.target.value)} />
                  </div>
                </div>
                <div style={{ padding: '9px 11px', borderRadius: 8, background: '#fefce8', border: '1px solid #fde68a', fontSize: '0.71rem', color: '#854d0e' }}>
                  The count will be assigned blind. Any variance automatically becomes an Admin approval request. Admin will be notified of this schedule.
                </div>
              </div>
              <div style={{ padding: '13px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn-hr-outline" onClick={() => setShowCountModal(false)}>Cancel</button>
                <button type="submit" className="btn-hr-yellow"><CalendarDays size={14} /><span>Schedule & Notify Admin</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION DRAWER */}
      {showNotifications && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 340, display: 'flex', justifyContent: 'flex-end', background: 'rgba(9,9,11,0.45)' }} onClick={() => setShowNotifications(false)}>
          <div style={{ width: 430, maxWidth: '100%', height: '100%', background: C.white, display: 'flex', flexDirection: 'column', boxShadow: '-24px 0 64px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: C.black, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BellRing size={17} color={C.yellow} />
                <div>
                  <div style={{ color: C.white, fontSize: '0.95rem', fontWeight: 900 }}>Notification Center</div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.67rem' }}>{unreadCount} unread • {roleLabel[roleView]}</div>
                </div>
              </div>
              <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: C.muted }}>Approval alerts, stock risks and decisions</span>
              <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: C.yellowDeep, fontSize: '0.68rem', fontWeight: 900, cursor: 'pointer' }}>Mark all read</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {visibleNotifications.map((notification) => (
                <div key={notification.id} style={{ padding: '13px 18px', borderBottom: `1px solid #f1f5f9`, background: notification.read ? C.white : '#fefce8' }}>
                  <div style={{ display: 'flex', gap: 9 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLOR[notification.severity], marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{notification.title}</div>
                      <div style={{ fontSize: '0.71rem', color: C.muted, lineHeight: 1.45, marginTop: 2 }}>{notification.message}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
                        <span style={{ fontSize: '0.63rem', color: C.dim }}>{formatDateTime(notification.timestamp)}</span>
                        {notification.requestId && (
                          <button
                            onClick={() => {
                              markNotificationRead(notification.id);
                              setActiveTab('approvals');
                              setApprovalFilter('pending');
                              setShowNotifications(false);
                            }}
                            style={{ background: 'transparent', border: 'none', color: C.yellowDeep, fontSize: '0.67rem', fontWeight: 900, cursor: 'pointer' }}
                          >
                            Review request →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 14, borderTop: `1px solid ${C.border}`, background: '#f8fafc', fontSize: '0.68rem', color: C.muted, display: 'flex', alignItems: 'center', gap: 7 }}>
              <ShieldCheck size={13} color={C.black} />
              All notifications are generated by the maker-checker store control engine.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
