import { UnitOfMeasure } from './erp';

export type StoreModuleRole = 'storekeeper' | 'store_supervisor' | 'admin' | 'super_admin';

export type StoreRequestType =
  | 'goods_receipt'
  | 'material_issue'
  | 'inter_store_transfer'
  | 'stock_adjustment'
  | 'cycle_count'
  | 'wastage'
  | 'supplier_return'
  | 'reorder_request'
  | 'item_onboarding';

export type StoreRequestStatus = 'pending_admin' | 'approved' | 'rejected' | 'needs_revision';
export type StorePriority = 'normal' | 'high' | 'critical';
export type StoreRequestDirection = 'inbound' | 'outbound' | 'internal' | 'neutral';

export interface StoreApprovalRequest {
  id: string;
  requestNumber: string;
  type: StoreRequestType;
  title: string;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  totalValue: number;
  fromStoreId?: string;
  fromStoreName?: string;
  toStoreId?: string;
  toStoreName?: string;
  referenceNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  supplierName?: string;
  reason: string;
  notes?: string;
  requestedBy: string;
  requestedByRole: 'Storekeeper' | 'Store Supervisor';
  requestedAt: string;
  status: StoreRequestStatus;
  priority: StorePriority;
  slaHours: number;
  direction: StoreRequestDirection;
  qcResult?: 'passed' | 'partial' | 'failed' | 'not_applicable';
  systemQty?: number;
  countedQty?: number;
  varianceQty?: number;
  approvedBy?: string;
  approvedAt?: string;
  decisionNotes?: string;
  signatureCode: string;
}

export type StoreNotificationType =
  | 'approval_request'
  | 'approved'
  | 'rejected'
  | 'stock_alert'
  | 'expiry_alert'
  | 'audit'
  | 'system';

export type StoreNotificationSeverity = 'info' | 'success' | 'warning' | 'critical';
export type StoreNotificationAudience = 'admin' | 'storekeeper' | 'all';

export interface StoreNotification {
  id: string;
  type: StoreNotificationType;
  severity: StoreNotificationSeverity;
  title: string;
  message: string;
  requestId?: string;
  requestNumber?: string;
  timestamp: string;
  read: boolean;
  audience: StoreNotificationAudience;
}

export interface StoreBin {
  id: string;
  storeId: string;
  code: string;
  name: string;
  zone: string;
  capacitySqm: number;
  usedSqm: number;
  itemCount: number;
  status: 'optimal' | 'high_utilization' | 'full' | 'quarantine';
}

export interface StockBatch {
  id: string;
  itemId: string;
  itemName: string;
  batchNumber: string;
  storeId: string;
  binCode: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  supplierName: string;
  status: 'active' | 'expiring' | 'expired' | 'quarantine';
}

export interface CycleCountTask {
  id: string;
  countNumber: string;
  storeId: string;
  storeName: string;
  zone: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  systemQty: number;
  unit: UnitOfMeasure;
  countedQty?: number;
  varianceQty?: number;
  varianceValue?: number;
  counterName: string;
  scheduledDate: string;
  status: 'scheduled' | 'counting' | 'variance_pending' | 'completed';
  notes?: string;
}

export interface SupplierScorecard {
  id: string;
  name: string;
  onTimeDeliveryPct: number;
  qualityAcceptancePct: number;
  averageLeadDays: number;
  priceCompetitivenessPct: number;
  spendYtd: number;
  score: number;
  status: 'strategic' | 'approved' | 'watchlist';
}

export interface StoreAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  actor: string;
  detail: string;
  severity: StoreNotificationSeverity;
  requestNumber?: string;
}

export interface StoreModuleSettings {
  dualControlEnabled: boolean;
  adminApprovalRequired: boolean;
  highValueThreshold: number;
  criticalValueThreshold: number;
  autoReorderEnabled: boolean;
  expiryWarningDays: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  freezeAllMovements: boolean;
}
