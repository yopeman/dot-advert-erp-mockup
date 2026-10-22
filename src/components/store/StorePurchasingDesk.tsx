'use client';

import React, { useState, useMemo } from 'react';
import { Item, Store, Supplier, PurchaseOrder, POStatus } from '@/types/erp';
import {
  StoreAuditEvent,
  StoreModuleRole,
  StoreNotification,
} from '@/types/store';
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Boxes,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Lock,
  PackageCheck,
  PackageSearch,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
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
  violetBg: '#f5f3ff',
};

const PO_STATUS_META: Record<
  POStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  draft: { label: 'Draft', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  pending_admin: { label: 'Pending Admin Approval', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  approved: { label: 'Approved (In Transit)', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  partially_received: { label: 'Partially Received', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  received: { label: 'Received (In Store Stock)', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  closed: { label: 'Closed', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
  cancelled: { label: 'Cancelled / Rejected', bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

function formatETB(amount: number) {
  return `ETB ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}

function formatDate(date?: string) {
  if (!date) return '—';
  const [y, m, d] = date.split('T')[0].split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[Number(m) - 1] || m} ${y}`;
}

const nowStamp = () => new Date().toISOString().slice(0, 19);

interface StorePurchasingDeskProps {
  items: Item[];
  stores: Store[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  lowStockItems: { item: Item; expectedDays: number }[];
  currentRole: StoreModuleRole;
  currentUserName: string;
  isAdmin: boolean;
  isPurchasing: boolean;
  initialTab?: 'orders' | 'replenish' | 'suppliers' | 'grn';
  onCreatePo: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'date' | 'status'> & { status?: POStatus }) => void;
  onReceivePo: (poId: string, storeId: string) => void;
  onApprovePo?: (poId: string, approvedBy: string, approvalNotes?: string) => void;
  onAddSupplier?: (supplierData: Omit<Supplier, 'id' | 'code'> & { code?: string }) => Supplier;
  onAddItem?: (itemData: Omit<Item, 'id'>) => Item;
  onUpdatePoStatus?: (poId: string, status: POStatus) => void;
  onAudit: (event: Omit<StoreAuditEvent, 'id'>) => void;
  onNotification: (notification: Omit<StoreNotification, 'id' | 'timestamp' | 'read'>) => void;
  onNotify: (msg: string) => void;
  onSwitchTab: (tab: any) => void;
}

export default function StorePurchasingDesk({
  items,
  stores,
  suppliers,
  purchaseOrders,
  lowStockItems,
  currentRole,
  currentUserName,
  isAdmin,
  isPurchasing,
  initialTab,
  onCreatePo,
  onReceivePo,
  onApprovePo,
  onAddSupplier,
  onAddItem,
  onUpdatePoStatus,
  onAudit,
  onNotification,
  onNotify,
  onSwitchTab,
}: StorePurchasingDeskProps) {
  const [purchasingTab, setPurchasingTab] = useState<'orders' | 'replenish' | 'suppliers' | 'grn'>(initialTab || 'orders');

  // React to tab changes from external sidebar (e.g. Suppliers & Vendors in sidebar)
  React.useEffect(() => {
    if (initialTab) {
      setPurchasingTab(initialTab);
    }
  }, [initialTab]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | POStatus>('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  // PO Creation Modal State: Supplier (Existing vs New)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [supplierMode, setSupplierMode] = useState<'existing' | 'new'>('existing');
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [newSupName, setNewSupName] = useState('');
  const [newSupCategory, setNewSupCategory] = useState<Supplier['category']>('raw_material');
  const [newSupTin, setNewSupTin] = useState('0098451234');
  const [newSupIsVat, setNewSupIsVat] = useState(true);
  const [newSupPhone, setNewSupPhone] = useState('+251 911 345 678');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('Bole Sub-city, Addis Ababa');
  const [newSupBankName, setNewSupBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [newSupBankAccount, setNewSupBankAccount] = useState('1000289182741');
  const [newSupPaymentTerms, setNewSupPaymentTerms] = useState('30 Days');

  // PO Creation Modal State: Item (Existing vs New)
  const [itemMode, setItemMode] = useState<'existing' | 'new'>('existing');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Item['type']>('raw_material');
  const [newItemUnit, setNewItemUnit] = useState<Item['unit']>('piece');
  const [newItemSpecs, setNewItemSpecs] = useState('');
  const [newItemReorderLevel, setNewItemReorderLevel] = useState(15);
  const [newItemReorderQty, setNewItemReorderQty] = useState(30);

  // Common PO Form Fields
  const [poQty, setPoQty] = useState(25);
  const [poUnitPrice, setPoUnitPrice] = useState(items[0]?.purchasePrice || 250);
  const [poTargetStoreId, setPoTargetStoreId] = useState(stores[0]?.id || '');
  const [poDeliveryDate, setPoDeliveryDate] = useState('2026-10-28');
  const [poPaymentTerms, setPoPaymentTerms] = useState(suppliers[0]?.paymentTerms || '30 Days');
  const [poNotes, setPoNotes] = useState('');

  // PO View Modal State
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);

  // Admin Approval Modal State
  const [approvingPo, setApprovingPo] = useState<PurchaseOrder | null>(null);
  const [adminApprovalNotes, setAdminApprovalNotes] = useState('');
  const [adminDirectReceiveStoreId, setAdminDirectReceiveStoreId] = useState(stores[0]?.id || '');
  const [adminApprovalAction, setAdminApprovalAction] = useState<'approve_only' | 'approve_and_receive'>('approve_only');

  // Admin Rejection Modal State
  const [rejectingPo, setRejectingPo] = useState<PurchaseOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Standalone Add Supplier Modal (for Suppliers tab)
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [standaloneSupName, setStandaloneSupName] = useState('');
  const [standaloneSupCategory, setStandaloneSupCategory] = useState<Supplier['category']>('raw_material');
  const [standaloneSupTin, setStandaloneSupTin] = useState('');
  const [standaloneSupIsVat, setStandaloneSupIsVat] = useState(true);
  const [standaloneSupPhone, setStandaloneSupPhone] = useState('+251 911 000 000');
  const [standaloneSupEmail, setStandaloneSupEmail] = useState('');
  const [standaloneSupAddress, setStandaloneSupAddress] = useState('Bole Sub-city, Addis Ababa');
  const [standaloneSupBankName, setStandaloneSupBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [standaloneSupBankAccount, setStandaloneSupBankAccount] = useState('');
  const [standaloneSupPaymentTerms, setStandaloneSupPaymentTerms] = useState('30 Days');

  // GRN Receiving State
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [grnStoreId, setGrnStoreId] = useState(stores[0]?.id || '');
  const [grnDeliveryNote, setGrnDeliveryNote] = useState('DN-8921-ET');
  const [grnInspector, setGrnInspector] = useState('Dawit Bekele (Quality Inspector)');
  const [grnQuality, setGrnQuality] = useState<'passed' | 'partial' | 'failed'>('passed');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  const subtotal = (poQty || 0) * (poUnitPrice || 0);
  const effectiveIsVat = supplierMode === 'existing' ? (selectedSupplier?.isVatRegistered ?? true) : newSupIsVat;
  const vatRate = effectiveIsVat ? 0.15 : 0;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  // Filtered POs
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.items.some((i) => i.itemName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || po.status === statusFilter;
      const matchSupplier = supplierFilter === 'all' || po.supplierId === supplierFilter;
      return matchSearch && matchStatus && matchSupplier;
    });
  }, [purchaseOrders, searchQuery, statusFilter, supplierFilter]);

  // Aggregate Metrics
  const totalProcurementSpend = useMemo(
    () => purchaseOrders.reduce((sum, p) => sum + p.grandTotal, 0),
    [purchaseOrders]
  );
  const totalInputVatClaimable = useMemo(
    () => purchaseOrders.reduce((sum, p) => sum + p.vatTotal, 0),
    [purchaseOrders]
  );
  const openOrdersCount = useMemo(
    () => purchaseOrders.filter((p) => p.status === 'approved' || p.status === 'draft' || p.status === 'pending_admin').length,
    [purchaseOrders]
  );
  const pendingAdminCount = useMemo(
    () => purchaseOrders.filter((p) => p.status === 'pending_admin').length,
    [purchaseOrders]
  );
  const receivedOrdersCount = useMemo(
    () => purchaseOrders.filter((p) => p.status === 'received').length,
    [purchaseOrders]
  );

  // Open Create PO with Prefilled Item
  const handleOpenReorder = (item: Item) => {
    const prefSupplier = item.preferredSupplierId
      ? suppliers.find((s) => s.id === item.preferredSupplierId) || suppliers[0]
      : suppliers[0];
    setItemMode('existing');
    setSupplierMode('existing');
    setSelectedItemId(item.id);
    setSelectedSupplierId(prefSupplier?.id || suppliers[0]?.id || '');
    setPoUnitPrice(item.purchasePrice || 100);
    setPoQty(item.reorderQuantity || Math.max(1, item.reorderLevel * 2 - item.currentStock));
    setPoPaymentTerms(prefSupplier?.paymentTerms || '30 Days');
    setPoTargetStoreId(stores[0]?.id || '');
    setPoNotes(`Automated replenishment against critical reorder threshold for ${item.name}.`);
    setShowCreateModal(true);
  };

  // Submit PO
  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Resolve Supplier (Existing vs New)
    let finalSupplierId = selectedSupplierId;
    let finalSupplierName = selectedSupplier?.name || '';
    let finalSupplierTin = selectedSupplier?.tin || '';
    let finalPaymentTerms = poPaymentTerms;
    let supplierVat = selectedSupplier?.isVatRegistered ?? true;

    if (supplierMode === 'new') {
      if (!newSupName.trim()) {
        onNotify('Please specify the new supplier / vendor name.');
        return;
      }
      if (onAddSupplier) {
        const createdSupplier = onAddSupplier({
          name: newSupName.trim(),
          category: newSupCategory,
          tin: newSupTin.trim() || '0098451234',
          address: newSupAddress.trim() || 'Addis Ababa',
          phone: newSupPhone.trim() || '+251 911 000 000',
          email: newSupEmail.trim() || 'sales@vendor.et',
          bankName: newSupBankName,
          bankAccount: newSupBankAccount.trim() || '1000123456789',
          paymentTerms: newSupPaymentTerms,
          isVatRegistered: newSupIsVat,
        });
        finalSupplierId = createdSupplier.id;
        finalSupplierName = createdSupplier.name;
        finalSupplierTin = createdSupplier.tin;
        finalPaymentTerms = createdSupplier.paymentTerms;
        supplierVat = createdSupplier.isVatRegistered;
        setSelectedSupplierId(createdSupplier.id);
      } else {
        finalSupplierName = newSupName.trim();
        finalSupplierTin = newSupTin.trim() || '0098451234';
        supplierVat = newSupIsVat;
      }
    }

    // 2. Resolve Item (Existing vs New SKU)
    let finalItemId = selectedItemId;
    let finalItemName = selectedItem?.name || '';
    let finalItemCode = selectedItem?.code || '';
    let finalUnit = selectedItem?.unit || 'piece';
    let finalCategory = selectedItem?.type || 'raw_material';
    let finalSpecs = poNotes;

    if (itemMode === 'new') {
      if (!newItemName.trim()) {
        onNotify('Please enter the name of the new raw material / item.');
        return;
      }
      finalItemId = `item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      finalItemName = newItemName.trim();
      finalItemCode = newItemCode.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
      finalUnit = newItemUnit;
      finalCategory = newItemCategory;
      finalSpecs = newItemSpecs.trim() || poNotes || 'New raw material specification';

      if (onAddItem) {
        onAddItem({
          code: finalItemCode,
          name: finalItemName,
          type: newItemCategory,
          unit: newItemUnit,
          purchasePrice: poUnitPrice,
          sellingPrice: Math.round(poUnitPrice * 1.35),
          vatRate: supplierVat ? 0.15 : 0,
          vatType: supplierVat ? 'standard_15' : 'exempt',
          reorderLevel: newItemReorderLevel,
          reorderQuantity: newItemReorderQty,
          currentStock: 0,
          averageDailyUsage: 1,
          preferredSupplierId: finalSupplierId,
          preferredSupplierName: finalSupplierName,
          storeBalances: {},
        });
      }
    }

    if (poQty <= 0 || poUnitPrice <= 0) {
      onNotify('Select a valid positive quantity and unit price.');
      return;
    }

    const currentSubtotal = poQty * poUnitPrice;
    const currentVatRate = supplierVat ? 0.15 : 0;
    const currentVatAmount = currentSubtotal * currentVatRate;
    const currentGrandTotal = currentSubtotal + currentVatAmount;

    // 3. Admin Approval Workflow: If non-admin is creating, it requires Admin approval (pending_admin)
    const initialStatus: POStatus = isAdmin ? 'approved' : 'pending_admin';

    onCreatePo({
      supplierId: finalSupplierId,
      supplierName: finalSupplierName,
      supplierTin: finalSupplierTin,
      isNewSupplier: supplierMode === 'new',
      items: [
        {
          itemId: finalItemId,
          itemCode: finalItemCode,
          itemName: finalItemName,
          category: finalCategory,
          specifications: finalSpecs,
          isNewItem: itemMode === 'new',
          quantity: poQty,
          unit: finalUnit,
          unitPrice: poUnitPrice,
          vatRate: currentVatRate,
          vatAmount: currentVatAmount,
          totalAmount: currentGrandTotal,
          targetStoreId: poTargetStoreId,
        },
      ],
      subtotal: currentSubtotal,
      vatTotal: currentVatAmount,
      grandTotal: currentGrandTotal,
      expectedDeliveryDate: poDeliveryDate,
      requestedBy: currentUserName,
      requestedByRole: isPurchasing ? 'Purchasing Officer' : isAdmin ? 'Admin' : 'Storekeeper',
      approvedBy: initialStatus === 'approved' ? `${currentUserName} (General Manager)` : undefined,
      approvedAt: initialStatus === 'approved' ? nowStamp() : undefined,
      paymentTerms: finalPaymentTerms,
      targetStoreId: poTargetStoreId,
      targetStoreName: stores.find((s) => s.id === poTargetStoreId)?.name || 'Main Warehouse',
      notes: poNotes || `Purchase order for ${finalItemName}${itemMode === 'new' ? ' (NEW SKU ONBOARDING)' : ''}`,
      status: initialStatus,
    });

    onAudit({
      timestamp: nowStamp(),
      action: initialStatus === 'approved' ? 'PO_CREATED_APPROVED' : 'PO_PENDING_ADMIN_APPROVAL',
      entity: finalItemName,
      actor: currentUserName,
      detail: `PO issued to ${finalSupplierName} for ${poQty} ${finalUnit} of ${finalItemName}. Total: ${formatETB(currentGrandTotal)} (15% VAT: ${formatETB(currentVatAmount)}). Status: ${initialStatus === 'approved' ? 'Approved' : 'Pending Admin Sign-off'}. Delivery scheduled: ${poDeliveryDate}.`,
      severity: initialStatus === 'approved' ? 'success' : 'warning',
    });

    onNotification({
      type: 'approval_request',
      severity: initialStatus === 'approved' ? 'info' : 'warning',
      title: initialStatus === 'approved' ? `PO Issued — ${finalSupplierName}` : `Admin Sign-off Required — PO for ${finalSupplierName}`,
      message: `${poQty} ${finalUnit} of ${finalItemName}. Subtotal: ${formatETB(currentSubtotal)}, Grand Total: ${formatETB(currentGrandTotal)}. ${initialStatus === 'approved' ? 'Approved and ready for dispatch.' : 'Pending Admin Approval.'}`,
      audience: 'admin',
    });

    setShowCreateModal(false);
    onNotify(
      initialStatus === 'approved'
        ? `Purchase Order issued to ${finalSupplierName} (${formatETB(currentGrandTotal)})!`
        : `Purchase Order submitted! Waiting for Admin Approval before dispatch.`
    );
  };

  // Admin Approval Confirmation
  const handleAdminApprovalConfirm = () => {
    if (!approvingPo) return;
    const approver = currentUserName || 'Mulugeta Teshome (General Manager)';

    if (onApprovePo) {
      onApprovePo(approvingPo.id, approver, adminApprovalNotes);
    } else if (onUpdatePoStatus) {
      onUpdatePoStatus(approvingPo.id, 'approved');
    }

    onAudit({
      timestamp: nowStamp(),
      action: 'PO_ADMIN_APPROVED',
      entity: approvingPo.poNumber,
      actor: approver,
      detail: `Admin approval granted for ${approvingPo.poNumber} (${approvingPo.supplierName}, ${formatETB(approvingPo.grandTotal)}). Authorized by ${approver}. Notes: ${adminApprovalNotes || 'Approved for procurement dispatch.'}`,
      severity: 'success',
      requestNumber: approvingPo.poNumber,
    });

    onNotification({
      type: 'approved',
      severity: 'success',
      title: `PO Approved — ${approvingPo.poNumber}`,
      message: `Purchase order ${approvingPo.poNumber} authorized by ${approver}. Ready for vendor receipt.`,
      requestNumber: approvingPo.poNumber,
      audience: 'all',
    });

    // If Admin chose to directly receive into store stock immediately!
    if (adminApprovalAction === 'approve_and_receive') {
      const destStoreId = adminDirectReceiveStoreId || approvingPo.targetStoreId || stores[0]?.id || '';
      onReceivePo(approvingPo.id, destStoreId);
      const destStoreName = stores.find((s) => s.id === destStoreId)?.name || 'Store';
      onNotify(`PO ${approvingPo.poNumber} approved & directly received into ${destStoreName} stock!`);
    } else {
      onNotify(`PO ${approvingPo.poNumber} approved by Admin! Ready for vendor dispatch.`);
    }

    setApprovingPo(null);
    setAdminApprovalNotes('');
  };

  // Admin Rejection Confirmation
  const handleAdminRejectConfirm = () => {
    if (!rejectingPo) return;
    if (onUpdatePoStatus) {
      onUpdatePoStatus(rejectingPo.id, 'cancelled');
    }
    onAudit({
      timestamp: nowStamp(),
      action: 'PO_ADMIN_REJECTED',
      entity: rejectingPo.poNumber,
      actor: currentUserName,
      detail: `PO ${rejectingPo.poNumber} rejected by Admin. Reason: ${rejectReason || 'Price/specification review required.'}`,
      severity: 'critical',
      requestNumber: rejectingPo.poNumber,
    });
    onNotification({
      type: 'rejected',
      severity: 'critical',
      title: `PO Rejected — ${rejectingPo.poNumber}`,
      message: `Purchase order ${rejectingPo.poNumber} rejected: ${rejectReason || 'Review required.'}`,
      requestNumber: rejectingPo.poNumber,
      audience: 'purchasing',
    });
    setRejectingPo(null);
    setRejectReason('');
    onNotify(`PO ${rejectingPo.poNumber} has been rejected.`);
  };

  // Standalone Add Supplier (from Suppliers tab)
  const handleStandaloneAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standaloneSupName.trim()) {
      onNotify('Please enter a supplier name.');
      return;
    }
    if (onAddSupplier) {
      const created = onAddSupplier({
        name: standaloneSupName.trim(),
        category: standaloneSupCategory,
        tin: standaloneSupTin.trim() || '0098451234',
        address: standaloneSupAddress.trim() || 'Addis Ababa',
        phone: standaloneSupPhone.trim() || '+251 911 000 000',
        email: standaloneSupEmail.trim() || 'info@vendor.et',
        bankName: standaloneSupBankName,
        bankAccount: standaloneSupBankAccount.trim() || '1000123456789',
        paymentTerms: standaloneSupPaymentTerms,
        isVatRegistered: standaloneSupIsVat,
      });

      onAudit({
        timestamp: nowStamp(),
        action: 'SUPPLIER_REGISTERED',
        entity: created.name,
        actor: currentUserName,
        detail: `New qualified supplier ${created.name} (${created.code}) onboarded with TIN: ${created.tin}, VAT: ${created.isVatRegistered ? 'Registered' : 'Exempt'}.`,
        severity: 'success',
      });

      onNotification({
        type: 'approved',
        severity: 'success',
        title: `Supplier Registered — ${created.name}`,
        message: `${created.name} added to approved vendor list under ${created.category}.`,
        audience: 'all',
      });

      setShowAddSupplierModal(false);
      setStandaloneSupName('');
      setStandaloneSupTin('');
      setStandaloneSupBankAccount('');
      onNotify(`Supplier ${created.name} (${created.code}) successfully onboarded!`);
    }
  };

  // Submit Goods Receipt Note
  const handleConfirmGrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPo) return;
    const destStore = stores.find((s) => s.id === grnStoreId) || stores[0];

    onReceivePo(receivingPo.id, destStore.id);

    onAudit({
      timestamp: nowStamp(),
      action: 'PO_GOODS_RECEIVED',
      entity: receivingPo.poNumber,
      actor: currentUserName,
      detail: `Materials against ${receivingPo.poNumber} received from ${receivingPo.supplierName} into ${destStore.name}. Delivery note: ${grnDeliveryNote}. QC: ${grnQuality.toUpperCase()}. Stock balances incremented.`,
      severity: 'success',
      requestNumber: receivingPo.poNumber,
    });

    onNotification({
      type: 'approved',
      severity: 'success',
      title: `Goods Received & Posted — ${receivingPo.poNumber}`,
      message: `Inventory from ${receivingPo.supplierName} arrived and posted to ${destStore.name}.`,
      requestNumber: receivingPo.poNumber,
      audience: 'all',
    });

    setReceivingPo(null);
    onNotify(`Goods Receipt Note confirmed! Inventory balances posted to ${destStore.name}.`);
  };

  // Export CSV of PO Register
  const exportPoCsv = () => {
    const header = 'PO Number,Date,Supplier,Supplier TIN,Items,Subtotal (ETB),15% VAT (ETB),Grand Total (ETB),Delivery Date,Payment Terms,Status,Requested By\n';
    const rows = purchaseOrders
      .map((po) =>
        [
          po.poNumber,
          po.date,
          po.supplierName,
          po.supplierTin,
          po.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit})`).join('; '),
          po.subtotal,
          po.vatTotal,
          po.grandTotal,
          po.expectedDeliveryDate,
          po.paymentTerms,
          po.status,
          po.requestedBy,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dot_advert_po_register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onNotify('Purchase orders register exported with Ethiopian VAT breakdown.');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* PURCHASING COMMAND BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #17171c 100%)',
          borderRadius: 14,
          padding: '24px 28px',
          border: '1px solid #27272a',
          color: C.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 900,
                color: C.yellow,
                background: 'rgba(250,204,21,0.14)',
                border: '1px solid rgba(250,204,21,0.4)',
                padding: '3px 10px',
                borderRadius: 6,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <ShoppingCart size={13} /> Purchasing & Procurement Authority Desk
            </span>
            <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
              • Ethiopian 15% VAT Compliant • Auto Reorder Levels • Inbound GRN Handoff
            </span>
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            Procurement Operations & Purchase Orders
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.82rem', marginTop: 4, maxWidth: 840, lineHeight: 1.5 }}>
            Direct replenishment workflow for advertising raw materials, cast acrylic, LED modules, print vinyl and fabrication hardware. Issue official POs with Ethiopian TIN tax tracking, supplier payment terms, and direct warehouse Goods Receipt Note (GRN) posting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn-hr-black"
            style={{ background: '#18181b', border: '1px solid #3f3f46' }}
            onClick={exportPoCsv}
          >
            <Download size={14} color={C.yellow} />
            <span>Export Register</span>
          </button>
          <button
            className="btn-hr-black"
            style={{ background: '#18181b', border: '1px solid #3f3f46' }}
            onClick={() => setPurchasingTab('replenish')}
          >
            <AlertTriangle size={14} color={C.yellow} />
            <span>Low-Stock Desk ({lowStockItems.length})</span>
          </button>
          <button
            className="btn-hr-yellow"
            onClick={() => {
              setSelectedItemId(items[0]?.id || '');
              setSelectedSupplierId(suppliers[0]?.id || '');
              setPoUnitPrice(items[0]?.purchasePrice || 250);
              setPoQty(25);
              setShowCreateModal(true);
            }}
          >
            <PlusCircle size={15} />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div className="hr-stat-card" style={{ borderLeft: `3px solid ${C.yellow}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>
              Total Procurement Spend
            </span>
            <ShoppingCart size={17} color={C.yellow} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: C.text }}>
            {formatETB(totalProcurementSpend)}
          </div>
          <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 4 }}>
            {purchaseOrders.length} Purchase orders issued
          </div>
        </div>

        <div className="hr-stat-card" style={{ borderLeft: `3px solid ${C.green}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>
              Claimable 15% Input VAT
            </span>
            <FileCheck size={17} color={C.green} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#047857' }}>
            {formatETB(totalInputVatClaimable)}
          </div>
          <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 4 }}>
            MoR Tax compliant purchase invoices
          </div>
        </div>

        <div
          className="hr-stat-card"
          style={{ borderLeft: `3px solid ${openOrdersCount ? C.amber : C.text}`, cursor: 'pointer' }}
          onClick={() => {
            setStatusFilter('approved');
            setPurchasingTab('orders');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>
              Active Orders In Transit
            </span>
            <Truck size={17} color={C.amber} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: C.text }}>
            {openOrdersCount} Orders
          </div>
          <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 4 }}>
            {receivedOrdersCount} received into warehouses
          </div>
        </div>

        <div
          className="hr-stat-card"
          style={{ borderLeft: `3px solid ${lowStockItems.length ? C.red : C.green}`, cursor: 'pointer' }}
          onClick={() => setPurchasingTab('replenish')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>
              Stockout Risk / Reorders
            </span>
            <AlertTriangle size={17} color={lowStockItems.length ? C.red : C.green} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: lowStockItems.length ? C.red : C.text }}>
            {lowStockItems.length} SKUs Below Min
          </div>
          <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 4 }}>
            Safety stock runout calculation active
          </div>
        </div>

        <div className="hr-stat-card" style={{ borderLeft: `3px solid ${C.blue}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>
              Qualified Vendors
            </span>
            <Building2 size={17} color={C.blue} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: C.text }}>
            {suppliers.length} Partners
          </div>
          <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 4 }}>
            TIN verified Ethiopian suppliers
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 10, overflowX: 'auto' }}>
        <button
          onClick={() => setPurchasingTab('orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 14px',
            borderRadius: 8,
            border: purchasingTab === 'orders' ? `1px solid ${C.black}` : `1px solid ${C.border}`,
            background: purchasingTab === 'orders' ? C.black : C.white,
            color: purchasingTab === 'orders' ? C.yellow : C.muted,
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={15} />
          <span>Purchase Orders Ledger</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 8,
              fontSize: '0.64rem',
              fontWeight: 900,
              background: purchasingTab === 'orders' ? C.yellow : C.black,
              color: purchasingTab === 'orders' ? C.black : C.yellow,
            }}
          >
            {purchaseOrders.length}
          </span>
        </button>

        <button
          onClick={() => setPurchasingTab('replenish')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 14px',
            borderRadius: 8,
            border: purchasingTab === 'replenish' ? `1px solid ${C.black}` : `1px solid ${C.border}`,
            background: purchasingTab === 'replenish' ? C.black : C.white,
            color: purchasingTab === 'replenish' ? C.yellow : C.muted,
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <AlertTriangle size={15} color={lowStockItems.length ? C.red : undefined} />
          <span>Low-Stock Replenishment Desk</span>
          {lowStockItems.length > 0 && (
            <span
              style={{
                padding: '1px 6px',
                borderRadius: 8,
                fontSize: '0.64rem',
                fontWeight: 900,
                background: C.red,
                color: C.white,
              }}
            >
              {lowStockItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setPurchasingTab('suppliers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 14px',
            borderRadius: 8,
            border: purchasingTab === 'suppliers' ? `1px solid ${C.black}` : `1px solid ${C.border}`,
            background: purchasingTab === 'suppliers' ? C.black : C.white,
            color: purchasingTab === 'suppliers' ? C.yellow : C.muted,
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Building2 size={15} />
          <span>Qualified Suppliers ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setPurchasingTab('grn')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 14px',
            borderRadius: 8,
            border: purchasingTab === 'grn' ? `1px solid ${C.black}` : `1px solid ${C.border}`,
            background: purchasingTab === 'grn' ? C.black : C.white,
            color: purchasingTab === 'grn' ? C.yellow : C.muted,
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowDownToLine size={15} />
          <span>Inbound GRN Handoff ({receivedOrdersCount})</span>
        </button>
      </div>

      {/* TAB CONTENT: PURCHASE ORDERS LEDGER */}
      {purchasingTab === 'orders' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* DUAL-CONTROL ADMIN APPROVAL BANNER */}
          {pendingAdminCount > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={20} color="#b45309" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#92400e' }}>
                    Dual-Control Policy: {pendingAdminCount} Purchase {pendingAdminCount === 1 ? 'Order Requires' : 'Orders Require'} Admin Approval
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: 2 }}>
                    Purchasing requests cannot be dispatched to suppliers or received into store stock without authorized General Manager / Admin sign-off.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn-hr-outline"
                  style={{ fontSize: '0.74rem', padding: '6px 12px', background: C.white, borderColor: '#fde68a' }}
                  onClick={() => setStatusFilter(statusFilter === 'pending_admin' ? 'all' : 'pending_admin')}
                >
                  <Filter size={13} />
                  <span>{statusFilter === 'pending_admin' ? 'Show All POs' : 'Filter Pending Only'}</span>
                </button>
                {!isAdmin && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#92400e',
                      background: '#fef3c7',
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    Switch role to Admin / GM to approve
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '18px 22px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                  Official Purchase Orders Ledger
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: C.muted }}>
                  Procurement commitments with Ethiopian 15% VAT, detailed specifications, Admin approval, and direct store stock connection.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 230 }}>
                  <Search
                    size={14}
                    color={C.dim}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    className="hr-input"
                    placeholder="Search PO#, supplier, item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 30, fontSize: '0.76rem', height: 34 }}
                  />
                </div>

                <select
                  className="hr-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  style={{ fontSize: '0.76rem', height: 34, width: 185 }}
                >
                  <option value="all">All Statuses ({purchaseOrders.length})</option>
                  <option value="pending_admin">Pending Admin Approval ({pendingAdminCount})</option>
                  <option value="approved">Approved / In Transit</option>
                  <option value="received">Received / In Stock</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                </select>

              <select
                className="hr-select"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                style={{ fontSize: '0.76rem', height: 34, width: 170 }}
              >
                <option value="all">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th>PO Number & Date</th>
                  <th>Supplier & TIN</th>
                  <th>Item, Specs & Details</th>
                  <th>Subtotal</th>
                  <th>15% VAT</th>
                  <th>Grand Total</th>
                  <th>Delivery & Warehouse</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((po) => {
                  const statusMeta = PO_STATUS_META[po.status] || PO_STATUS_META.draft;
                  const isReceived = po.status === 'received';
                  const isPendingAdmin = po.status === 'pending_admin';
                  const isApproved = po.status === 'approved';

                  return (
                    <tr key={po.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '0.8rem', color: C.text }}>
                          {po.poNumber}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: C.dim }}>
                          Issued: {formatDate(po.date)}
                        </div>
                        {po.requestedBy && (
                          <div style={{ fontSize: '0.64rem', color: C.muted, marginTop: 2 }}>
                            By: {po.requestedBy}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{po.supplierName}</div>
                        <div style={{ fontSize: '0.67rem', color: C.dim }}>
                          TIN: {po.supplierTin || 'Not Provided'}
                        </div>
                        {po.isNewSupplier && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              background: '#ecfdf5',
                              color: '#047857',
                              padding: '1px 5px',
                              borderRadius: 4,
                              border: '1px solid #a7f3d0',
                              marginTop: 2,
                            }}
                          >
                            NEW VENDOR
                          </span>
                        )}
                      </td>

                      <td style={{ maxWidth: 280 }}>
                        {po.items.map((i, idx) => (
                          <div key={idx} style={{ fontSize: '0.74rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong>{i.quantity} {i.unit}</strong> • <span style={{ fontWeight: 700 }}>{i.itemName}</span>
                              {i.isNewItem && (
                                <span
                                  style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                  }}
                                >
                                  NEW SKU
                                </span>
                              )}
                            </div>
                            {i.specifications && (
                              <div style={{ fontSize: '0.67rem', color: C.muted, marginTop: 2, lineHeight: 1.3 }}>
                                <span style={{ fontWeight: 600, color: '#475569' }}>Specs:</span> {i.specifications}
                              </div>
                            )}
                          </div>
                        ))}
                      </td>

                      <td style={{ fontSize: '0.76rem', fontWeight: 600 }}>
                        {formatETB(po.subtotal)}
                      </td>

                      <td style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700 }}>
                        {formatETB(po.vatTotal)}
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.82rem', color: C.text }}>
                          {formatETB(po.grandTotal)}
                        </strong>
                      </td>

                      <td style={{ fontSize: '0.72rem' }}>
                        <div>Delivery: <strong>{formatDate(po.expectedDeliveryDate)}</strong></div>
                        <div style={{ color: C.dim }}>
                          Store: {po.targetStoreName || stores.find((s) => s.id === po.targetStoreId)?.name || 'Main Warehouse'}
                        </div>
                        <div style={{ color: C.dim }}>Terms: {po.paymentTerms || '30 Days'}</div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: statusMeta.bg,
                            color: statusMeta.color,
                            border: `1px solid ${statusMeta.border}`,
                            fontSize: '0.67rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {statusMeta.label}
                        </span>
                        {po.approvedBy && (
                          <div style={{ fontSize: '0.62rem', color: '#047857', marginTop: 3 }}>
                            ✓ Approved by {po.approvedBy.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* ADMIN APPROVAL BUTTONS */}
                          {isPendingAdmin && (
                            <>
                              {isAdmin ? (
                                <>
                                  <button
                                    className="btn-hr-yellow"
                                    style={{ padding: '5px 10px', fontSize: '0.68rem', gap: 4 }}
                                    onClick={() => {
                                      setApprovingPo(po);
                                      setAdminApprovalNotes('');
                                      setAdminDirectReceiveStoreId(po.targetStoreId || stores[0]?.id || '');
                                      setAdminApprovalAction('approve_only');
                                    }}
                                    title="Review and approve this purchase order"
                                  >
                                    <ShieldCheck size={12} />
                                    <span>Approve PO</span>
                                  </button>
                                  <button
                                    className="btn-hr-outline"
                                    style={{ padding: '5px 8px', fontSize: '0.68rem', color: C.red, borderColor: '#fecdd3' }}
                                    onClick={() => {
                                      setRejectingPo(po);
                                      setRejectReason('');
                                    }}
                                    title="Reject this purchase order"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    padding: '4px 7px',
                                    borderRadius: 5,
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  <Lock size={10} />
                                  <span>Awaiting GM</span>
                                </span>
                              )}
                            </>
                          )}

                          {/* GOODS RECEIPT / STORE STOCK CONNECTION */}
                          {isApproved && (
                            <button
                              className="btn-hr-black"
                              style={{ padding: '5px 9px', fontSize: '0.68rem' }}
                              onClick={() => {
                                setReceivingPo(po);
                                setGrnStoreId(po.targetStoreId || stores[0]?.id || '');
                              }}
                              title="Receive materials into store inventory stock directly"
                            >
                              <ArrowDownToLine size={12} color={C.yellow} />
                              <span>Receive GRN</span>
                            </button>
                          )}

                          {isReceived && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 8px',
                                borderRadius: 5,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                              }}
                            >
                              <CheckCircle2 size={11} color="#1d4ed8" />
                              <span>In Store Stock</span>
                            </span>
                          )}

                          <button
                            className="btn-hr-outline"
                            style={{ padding: '5px 9px', fontSize: '0.68rem' }}
                            onClick={() => setViewingPo(po)}
                            title="View official PO voucher"
                          >
                            <Eye size={12} />
                            <span>Voucher</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted }}>
                <ShoppingBag size={28} color={C.dim} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>No purchase orders found</div>
                <div style={{ fontSize: '0.75rem', marginTop: 3 }}>
                  Create your first PO using the New Purchase Order button.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* TAB CONTENT: LOW-STOCK REPLENISHMENT DESK */}
      {purchasingTab === 'replenish' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} color={C.red} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b' }}>
                  Safety Stock Replenishment Alert
                </div>
                <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
                  Items with current balance at or below minimum threshold. Expected runout days calculated as <code>Current Stock ÷ Average Daily Usage</code>.
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#991b1b',
                background: '#fee2e2',
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              {lowStockItems.length} SKUs Critical
            </span>
          </div>

          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>
                Low-Stock Replenishment Workbench
              </h3>
              <span style={{ fontSize: '0.74rem', color: C.muted }}>
                Click &quot;Issue PO&quot; to auto-generate a supplier purchase order
              </span>
            </div>

            <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Item SKU & Name</th>
                    <th>Stock vs Reorder Level</th>
                    <th>Daily Consumption</th>
                    <th>Runout Days</th>
                    <th>Preferred Supplier</th>
                    <th>Unit Cost</th>
                    <th>Recommended Qty</th>
                    <th>Estimated Replenishment</th>
                    <th style={{ textAlign: 'right' }}>Replenish</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(({ item, expectedDays }) => {
                    const pct = item.reorderLevel
                      ? Math.min(100, (item.currentStock / item.reorderLevel) * 100)
                      : 0;
                    const recQty = item.reorderQuantity || Math.max(1, item.reorderLevel * 2 - item.currentStock);
                    const estCost = recQty * item.purchasePrice;
                    const isUrgent = expectedDays < 3;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: C.text }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: C.dim }}>
                            {item.code} {item.amharicName ? `• ${item.amharicName}` : ''}
                          </div>
                        </td>

                        <td style={{ minWidth: 160 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                            <strong style={{ color: item.currentStock <= item.reorderLevel ? C.red : C.text }}>
                              {item.currentStock} {item.unit}
                            </strong>
                            <span style={{ color: C.muted }}>
                              Min: {item.reorderLevel} {item.unit}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: pct <= 50 ? C.red : C.amber,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                        </td>

                        <td style={{ fontSize: '0.75rem' }}>
                          <strong>{item.averageDailyUsage} {item.unit}</strong>/day
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: '0.67rem',
                              fontWeight: 900,
                              background: isUrgent ? C.redBg : C.amberBg,
                              color: isUrgent ? '#be123c' : '#b45309',
                              border: `1px solid ${isUrgent ? '#fecdd3' : '#fde68a'}`,
                            }}
                          >
                            <Clock size={11} />
                            {expectedDays} {expectedDays === 1 ? 'Day' : 'Days'} Left
                          </span>
                        </td>

                        <td style={{ fontSize: '0.75rem' }}>
                          <div>{item.preferredSupplierName || 'Direct Vendor'}</div>
                        </td>

                        <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {formatETB(item.purchasePrice)}
                        </td>

                        <td>
                          <strong style={{ fontSize: '0.78rem' }}>
                            {recQty} {item.unit}
                          </strong>
                        </td>

                        <td>
                          <strong style={{ fontSize: '0.8rem', color: C.text }}>
                            {formatETB(estCost)}
                          </strong>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-hr-yellow"
                            style={{ padding: '6px 11px', fontSize: '0.7rem' }}
                            onClick={() => handleOpenReorder(item)}
                          >
                            <ShoppingCart size={13} />
                            <span>Issue PO</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {lowStockItems.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: C.green }}>
                  <CheckCircle2 size={30} color={C.green} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>All Stock Levels Healthy</div>
                  <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 3 }}>
                    Every SKU is currently maintained safely above reorder threshold.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: QUALIFIED SUPPLIERS */}
      {purchasingTab === 'suppliers' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '18px 22px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                  Registered Qualified Suppliers
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: C.muted }}>
                  Approved manufacturing vendors with Ethiopian TIN, bank accounts, and negotiated payment terms.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn-hr-black"
                  style={{ fontSize: '0.75rem', padding: '7px 12px', gap: 6 }}
                  onClick={() => setShowAddSupplierModal(true)}
                >
                  <PlusCircle size={14} color={C.yellow} />
                  <span>Register New Supplier</span>
                </button>
                <button
                  className="btn-hr-yellow"
                  style={{ fontSize: '0.75rem', padding: '7px 12px' }}
                  onClick={() => {
                    setSelectedSupplierId(suppliers[0]?.id || '');
                    setSupplierMode('existing');
                    setShowCreateModal(true);
                  }}
                >
                  <ShoppingCart size={14} />
                  <span>Issue Purchase Order</span>
                </button>
              </div>
            </div>

            <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Supplier Code & Name</th>
                    <th>Category</th>
                    <th>TIN & VAT Status</th>
                    <th>Payment Terms</th>
                    <th>Banking Details</th>
                    <th>Contact & Location</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => {
                    const activePos = purchaseOrders.filter((p) => p.supplierId === s.id);
                    const spend = activePos.reduce((sum, p) => sum + p.grandTotal, 0);

                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: C.text }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: '0.67rem', color: C.dim }}>
                            {s.code} • {activePos.length} Orders ({formatETB(spend)})
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: 5,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: '#f1f5f9',
                              color: '#334155',
                              textTransform: 'uppercase',
                            }}
                          >
                            {s.category.replace('_', ' ')}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                            TIN: {s.tin}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: s.isVatRegistered ? '#047857' : C.muted }}>
                            {s.isVatRegistered ? '● 15% VAT Registered' : '○ Non-VAT / Exempt'}
                          </div>
                        </td>

                        <td style={{ fontSize: '0.76rem', fontWeight: 600 }}>
                          {s.paymentTerms}
                        </td>

                        <td style={{ fontSize: '0.73rem' }}>
                          <div>{s.bankName}</div>
                          <div style={{ color: C.dim, fontSize: '0.67rem' }}>A/C: {s.bankAccount}</div>
                        </td>

                        <td style={{ fontSize: '0.73rem' }}>
                          <div>{s.phone}</div>
                          <div style={{ color: C.dim, fontSize: '0.67rem' }}>{s.address}</div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-hr-black"
                            style={{ padding: '5px 10px', fontSize: '0.68rem' }}
                            onClick={() => {
                              setSelectedSupplierId(s.id);
                              setPoPaymentTerms(s.paymentTerms);
                              setShowCreateModal(true);
                            }}
                          >
                            <ShoppingCart size={12} color={C.yellow} />
                            <span>Issue PO</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INBOUND GRN HANDOFF */}
      {purchasingTab === 'grn' && (
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '18px 22px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                Inbound Goods Receipt Notes (GRN) Handoff
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: C.muted }}>
                Completed purchase receipts posted directly from approved POs into warehouse stock balances.
              </p>
            </div>
            <button
              className="btn-hr-outline"
              style={{ fontSize: '0.75rem', padding: '7px 12px' }}
              onClick={() => onSwitchTab('inbound')}
            >
              <Warehouse size={14} />
              <span>Open Inbound Tab</span>
            </button>
          </div>

          <div className="hr-table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th>PO Reference</th>
                  <th>Supplier</th>
                  <th>Items Received</th>
                  <th>Total Goods Value</th>
                  <th>Destination Warehouse</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders
                  .filter((p) => p.status === 'received')
                  .map((po) => (
                    <tr key={po.id}>
                      <td>
                        <strong style={{ fontSize: '0.8rem', color: C.text }}>
                          {po.poNumber}
                        </strong>
                        <div style={{ fontSize: '0.67rem', color: C.dim }}>
                          Date: {formatDate(po.date)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                          {po.supplierName}
                        </div>
                        <div style={{ fontSize: '0.67rem', color: C.dim }}>
                          TIN: {po.supplierTin}
                        </div>
                      </td>

                      <td>
                        {po.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.74rem' }}>
                            <strong>{item.quantity} {item.unit}</strong> • {item.itemName}
                          </div>
                        ))}
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.8rem' }}>
                          {formatETB(po.grandTotal)}
                        </strong>
                      </td>

                      <td style={{ fontSize: '0.74rem' }}>
                        <div>Main Store / Production Store</div>
                        <div style={{ fontSize: '0.67rem', color: '#047857' }}>
                          ● Stock balances updated
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                          }}
                        >
                          GRN CONFIRMED
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
            padding: 16,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 740,
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: 14,
              background: C.white,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: C.black,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: C.white,
                borderRadius: '14px 14px 0 0',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={17} color={C.yellow} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                    Issue Official Purchase Order
                  </h3>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 3 }}>
                  Existing or New Supplier • Catalog or New Raw Material SKU • Ethiopian 15% VAT
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} style={{ padding: 24, display: 'grid', gap: 16 }}>
              {/* SECTION 1: SUPPLIER SELECTION (EXISTING OR NEW) */}
              <div
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: 14,
                  background: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={15} color={C.text} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      1. Supplier / Vendor Source *
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 4, background: '#e4e4e7', padding: 2, borderRadius: 6 }}>
                    <button
                      type="button"
                      onClick={() => setSupplierMode('existing')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 5,
                        border: 'none',
                        background: supplierMode === 'existing' ? C.black : 'transparent',
                        color: supplierMode === 'existing' ? C.yellow : '#71717a',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Existing Qualified Supplier
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplierMode('new')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 5,
                        border: 'none',
                        background: supplierMode === 'new' ? C.black : 'transparent',
                        color: supplierMode === 'new' ? C.yellow : '#71717a',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      + Register New Supplier
                    </button>
                  </div>
                </div>

                {supplierMode === 'existing' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 5 }}>
                      Select Qualified Supplier *
                    </label>
                    <select
                      className="hr-select"
                      value={selectedSupplierId}
                      onChange={(e) => {
                        setSelectedSupplierId(e.target.value);
                        const s = suppliers.find((sup) => sup.id === e.target.value);
                        if (s) setPoPaymentTerms(s.paymentTerms);
                      }}
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category}) • TIN: {s.tin} • {s.isVatRegistered ? '15% VAT Registered' : 'Non-VAT'}
                        </option>
                      ))}
                    </select>
                    {selectedSupplier && (
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.68rem', color: C.muted, marginTop: 6 }}>
                        <span>TIN: <strong>{selectedSupplier.tin}</strong></span>
                        <span>VAT: <strong>{selectedSupplier.isVatRegistered ? '15% Registered' : 'Exempt'}</strong></span>
                        <span>Terms: <strong>{selectedSupplier.paymentTerms}</strong></span>
                        <span>Bank: <strong>{selectedSupplier.bankName}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          New Supplier / Vendor Legal Name *
                        </label>
                        <input
                          className="hr-input"
                          placeholder="e.g. Ethiopian Plastic & Sign Materials SC"
                          value={newSupName}
                          onChange={(e) => setNewSupName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Category *
                        </label>
                        <select
                          className="hr-select"
                          value={newSupCategory}
                          onChange={(e) => setNewSupCategory(e.target.value as any)}
                        >
                          <option value="raw_material">Raw Materials (Sheets, Vinyl, Inks)</option>
                          <option value="packaging">Packaging Materials</option>
                          <option value="equipment">Machinery & Hardware Parts</option>
                          <option value="service">Outsourced Services</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Ethiopian TIN Number (10 digits) *
                        </label>
                        <input
                          className="hr-input"
                          placeholder="e.g. 0098451234"
                          value={newSupTin}
                          onChange={(e) => setNewSupTin(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          15% VAT Status *
                        </label>
                        <select
                          className="hr-select"
                          value={newSupIsVat ? 'vat' : 'exempt'}
                          onChange={(e) => setNewSupIsVat(e.target.value === 'vat')}
                        >
                          <option value="vat">Registered (15% Input VAT)</option>
                          <option value="exempt">Non-VAT / Exempt</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Contact Phone *
                        </label>
                        <input
                          className="hr-input"
                          placeholder="+251 911 000 000"
                          value={newSupPhone}
                          onChange={(e) => setNewSupPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Bank & Account Number
                        </label>
                        <input
                          className="hr-input"
                          placeholder="e.g. CBE - 1000289182741"
                          value={newSupBankAccount}
                          onChange={(e) => setNewSupBankAccount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Supplier Location / Address
                        </label>
                        <input
                          className="hr-input"
                          placeholder="e.g. Kaliti Industrial Zone, Addis Ababa"
                          value={newSupAddress}
                          onChange={(e) => setNewSupAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: DESTINATION WAREHOUSE */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>
                  Target Destination Warehouse (Direct Store Stock Integration) *
                </label>
                <select
                  className="hr-select"
                  value={poTargetStoreId}
                  onChange={(e) => setPoTargetStoreId(e.target.value)}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location}) — Storekeeper: {s.storekeeper}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.67rem', color: C.muted, marginTop: 4 }}>
                  ● On Goods Receipt or Admin direct receipt, inventory quantities update directly in this warehouse balance.
                </div>
              </div>

              {/* SECTION 3: PURCHASING ITEM (EXISTING CATALOG VS NEW SKU) */}
              <div
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: 14,
                  background: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Boxes size={15} color={C.text} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      2. Purchasing Item Specification *
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 4, background: '#e4e4e7', padding: 2, borderRadius: 6 }}>
                    <button
                      type="button"
                      onClick={() => setItemMode('existing')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 5,
                        border: 'none',
                        background: itemMode === 'existing' ? C.black : 'transparent',
                        color: itemMode === 'existing' ? C.yellow : '#71717a',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Existing Item from Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemMode('new')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 5,
                        border: 'none',
                        background: itemMode === 'new' ? C.black : 'transparent',
                        color: itemMode === 'new' ? C.yellow : '#71717a',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      + Onboard New Raw Material / Item
                    </button>
                  </div>
                </div>

                {itemMode === 'existing' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 5 }}>
                      Select Stock Catalog Item *
                    </label>
                    <select
                      className="hr-select"
                      value={selectedItemId}
                      onChange={(e) => {
                        setSelectedItemId(e.target.value);
                        const it = items.find((i) => i.id === e.target.value);
                        if (it) {
                          setPoUnitPrice(it.purchasePrice);
                          setPoQty(it.reorderQuantity || 20);
                        }
                      }}
                    >
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.code}) — {item.currentStock} {item.unit} in stock • Cost: {formatETB(item.purchasePrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          New Item / Material Name *
                        </label>
                        <input
                          className="hr-input"
                          placeholder="e.g. 5mm Opal Cast Acrylic Sheet 1.22x2.44m"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Suggested SKU Code
                        </label>
                        <input
                          className="hr-input"
                          placeholder="e.g. MAT-ACR-5MM-OPL"
                          value={newItemCode}
                          onChange={(e) => setNewItemCode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Category *
                        </label>
                        <select
                          className="hr-select"
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value as any)}
                        >
                          <option value="raw_material">Raw Material (Sheets, Aluminium, Acrylic)</option>
                          <option value="packaging">Packaging</option>
                          <option value="semi_finished">Semi-Finished Component</option>
                          <option value="service">Service / Consumable</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Unit of Measure *
                        </label>
                        <select
                          className="hr-select"
                          value={newItemUnit}
                          onChange={(e) => setNewItemUnit(e.target.value as any)}
                        >
                          <option value="piece">Piece (Pcs)</option>
                          <option value="sheet">Sheet</option>
                          <option value="sqm">Square Meter (Sqm)</option>
                          <option value="meter">Meter (m)</option>
                          <option value="roll">Roll</option>
                          <option value="kg">Kilogram (kg)</option>
                          <option value="liter">Liter (L)</option>
                          <option value="carton">Carton</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                        Detailed Technical Specifications & Fabrication Notes *
                      </label>
                      <textarea
                        className="hr-input"
                        rows={2}
                        placeholder="e.g. 5.0mm ±0.1mm thickness, virgin PMMA cast acrylic, high light transmission (45%), UV stabilized, dual PE protective film, compatible with CNC routing and laser cutting."
                        value={newItemSpecs}
                        onChange={(e) => setNewItemSpecs(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Minimum Reorder Level
                        </label>
                        <input
                          type="number"
                          className="hr-input"
                          value={newItemReorderLevel}
                          onChange={(e) => setNewItemReorderLevel(Math.max(1, Number(e.target.value)))}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: 4 }}>
                          Standard Reorder Batch Qty
                        </label>
                        <input
                          type="number"
                          className="hr-input"
                          value={newItemReorderQty}
                          onChange={(e) => setNewItemReorderQty(Math.max(1, Number(e.target.value)))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: QUANTITY, PRICING & TERMS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>
                    Order Quantity ({itemMode === 'existing' ? selectedItem?.unit : newItemUnit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="hr-input"
                    value={poQty}
                    onChange={(e) => setPoQty(Math.max(1, Number(e.target.value)))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>
                    Unit Price (ETB) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="hr-input"
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(Math.max(1, Number(e.target.value)))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    className="hr-input"
                    value={poDeliveryDate}
                    onChange={(e) => setPoDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>
                    Payment Terms
                  </label>
                  <select
                    className="hr-select"
                    value={poPaymentTerms}
                    onChange={(e) => setPoPaymentTerms(e.target.value)}
                  >
                    <option value="Cash">Cash on Delivery</option>
                    <option value="15 Days">15 Days Credit</option>
                    <option value="30 Days">30 Days Credit</option>
                    <option value="50% Advance">50% Advance • 50% on Receipt</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>
                    Procurement Notes / PO Memo
                  </label>
                  <input
                    className="hr-input"
                    placeholder="e.g. Urgent production stock replenishment"
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* SECTION 5: TAX & GRAND TOTAL CALCULATION BOX */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                  <span style={{ color: C.muted }}>
                    Subtotal ({poQty} {itemMode === 'existing' ? selectedItem?.unit : newItemUnit} @ {formatETB(poUnitPrice)}):
                  </span>
                  <strong>{formatETB(subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                  <span style={{ color: C.muted }}>
                    Ethiopian 15% VAT ({effectiveIsVat ? 'Registered Vendor' : 'Exempt / Non-VAT'}):
                  </span>
                  <strong style={{ color: '#047857' }}>{formatETB(vatAmount)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1rem',
                    fontWeight: 900,
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: 8,
                    marginTop: 6,
                    color: C.text,
                  }}
                >
                  <span>Grand Total Payable:</span>
                  <span style={{ color: C.yellowDeep }}>{formatETB(grandTotal)}</span>
                </div>
              </div>

              {/* DUAL-CONTROL ADMIN APPROVAL NOTICE */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: isAdmin ? '#ecfdf5' : '#fef3c7',
                  border: `1px solid ${isAdmin ? '#a7f3d0' : '#fde68a'}`,
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: isAdmin ? '#047857' : '#92400e',
                }}
              >
                <ShieldCheck size={16} />
                <span>
                  {isAdmin
                    ? 'Admin Access Verified: As Administrator/GM, this PO will be approved upon issuance.'
                    : 'Admin Approval Required: This PO will be placed in Pending Admin Approval status until GM sign-off.'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <Check size={14} />
                  <span>
                    {isAdmin ? 'Issue & Approve PO' : 'Submit PO for Admin Approval'} ({formatETB(grandTotal)})
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GOODS RECEIPT (GRN) CONFIRMATION */}
      {receivingPo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
            padding: 16,
          }}
          onClick={() => setReceivingPo(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 600,
              borderRadius: 14,
              background: C.white,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: C.black,
                padding: '16px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: C.white,
                borderRadius: '14px 14px 0 0',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowDownToLine size={16} color={C.yellow} />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>
                    Confirm Goods Receipt — {receivingPo.poNumber}
                  </h3>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 3 }}>
                  Supplier: {receivingPo.supplierName} • Total value: {formatETB(receivingPo.grandTotal)}
                </div>
              </div>
              <button
                onClick={() => setReceivingPo(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmGrn} style={{ padding: 22, display: 'grid', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Ordered Items to Receive:
                </div>
                {receivingPo.items.map((i, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    • {i.quantity} {i.unit} of {i.itemName} @ {formatETB(i.unitPrice)}
                  </div>
                ))}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: 5,
                  }}
                >
                  Receive Into Warehouse *
                </label>
                <select
                  className="hr-select"
                  value={grnStoreId}
                  onChange={(e) => setGrnStoreId(e.target.value)}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 5,
                    }}
                  >
                    Supplier Delivery Note # *
                  </label>
                  <input
                    className="hr-input"
                    value={grnDeliveryNote}
                    onChange={(e) => setGrnDeliveryNote(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 5,
                    }}
                  >
                    Quality Inspection Result
                  </label>
                  <select
                    className="hr-select"
                    value={grnQuality}
                    onChange={(e) => setGrnQuality(e.target.value as any)}
                  >
                    <option value="passed">Passed (100% Accepted)</option>
                    <option value="partial">Partial Acceptance</option>
                    <option value="failed">Failed / Quarantine</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: 5,
                  }}
                >
                  Inspector / Receiver Name
                </label>
                <input
                  className="hr-input"
                  value={grnInspector}
                  onChange={(e) => setGrnInspector(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setReceivingPo(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <ArrowDownToLine size={14} />
                  <span>Post GRN to Stock Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW OFFICIAL PO VOUCHER */}
      {viewingPo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
            padding: 16,
          }}
          onClick={() => setViewingPo(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: 14,
              background: C.white,
              padding: 32,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* VOUCHER HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px solid #09090b',
                paddingBottom: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: C.black, letterSpacing: '-0.02em' }}>
                  DOT ADVERT MANUFACTURING PLC
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted, marginTop: 3 }}>
                  Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia • TIN: 0048291032
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>
                  VAT Reg. No: 982143098 • Tel: +251 11 662 4910
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 6,
                    background: C.black,
                    color: C.yellow,
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  OFFICIAL PURCHASE ORDER
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: 6 }}>
                  {viewingPo.poNumber}
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>
                  Date: {formatDate(viewingPo.date)}
                </div>
              </div>
            </div>

            {/* VENDOR & DELIVERY INFO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Supplier (Vendor):
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{viewingPo.supplierName}</div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>TIN: {viewingPo.supplierTin || 'N/A'}</div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>Payment Terms: {viewingPo.paymentTerms}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Delivery & Terms:
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Expected Delivery: <strong>{formatDate(viewingPo.expectedDeliveryDate)}</strong>
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>
                  Destination: Main Raw Material Store
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>
                  Status: <strong>{viewingPo.status.toUpperCase()}</strong>
                </div>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <table className="hr-table" style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description & Specs</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>15% VAT</th>
                  <th style={{ textAlign: 'right' }}>Total (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {viewingPo.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong>{item.itemName}</strong>
                        {item.isNewItem && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontWeight: 800,
                              border: '1px solid #fde68a',
                            }}
                          >
                            NEW SKU
                          </span>
                        )}
                      </div>
                      {item.specifications && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 3, fontStyle: 'italic' }}>
                          Specs: {item.specifications}
                        </div>
                      )}
                      {(item.category || item.itemCode) && (
                        <div style={{ fontSize: '0.68rem', color: C.dim, marginTop: 1 }}>
                          Category: {item.category || 'General'} {item.itemCode ? `• Code: ${item.itemCode}` : ''}
                        </div>
                      )}
                    </td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{formatETB(item.unitPrice)}</td>
                    <td>{formatETB(item.vatAmount)}</td>
                    <td style={{ textAlign: 'right' }}><strong>{formatETB(item.totalAmount)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ width: 300, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: C.muted }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>{formatETB(viewingPo.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4, color: '#047857' }}>
                  <span>15% Ethiopian VAT:</span>
                  <span style={{ fontWeight: 600 }}>{formatETB(viewingPo.vatTotal)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    borderTop: '2px solid #09090b',
                    paddingTop: 8,
                    marginTop: 6,
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: C.black }}>{formatETB(viewingPo.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* APPROVAL & SIGNATURE BLOCK */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 30,
                paddingTop: 16,
                borderTop: '1px solid #e2e8f0',
                background: viewingPo.status === 'pending_admin' ? '#fffbeb' : '#f8fafc',
                padding: 16,
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: C.muted, textTransform: 'uppercase', fontWeight: 800 }}>
                  Prepared & Requested By
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: 4 }}>
                  {viewingPo.requestedBy || 'Purchasing Officer'}
                </div>
                <div style={{ fontSize: '0.7rem', color: C.dim }}>
                  Role: {viewingPo.requestedByRole || 'purchasing'} • Dot Advert ERP
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: C.muted, textTransform: 'uppercase', fontWeight: 800 }}>
                  Admin Authorization Status
                </div>
                {viewingPo.status === 'pending_admin' ? (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #fde68a' }}>
                      <AlertTriangle size={12} />
                      <span>AWAITING ADMIN APPROVAL</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#b45309', marginTop: 3 }}>
                      Pending review by General Manager before vendor dispatch.
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, background: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #a7f3d0' }}>
                      <CheckCircle2 size={12} />
                      <span>AUTHORIZED & APPROVED</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', marginTop: 3 }}>
                      {viewingPo.approvedBy || 'General Manager'}
                    </div>
                    {viewingPo.approvedAt && (
                      <div style={{ fontSize: '0.68rem', color: C.dim }}>
                        Approved on: {formatDate(viewingPo.approvedAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <div>
                {viewingPo.status === 'pending_admin' && isAdmin && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn-hr-yellow"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                      onClick={() => {
                        const poToApprove = viewingPo;
                        setViewingPo(null);
                        setApprovingPo(poToApprove);
                      }}
                    >
                      <ShieldCheck size={14} />
                      <span>Review & Authorize Now</span>
                    </button>
                    <button
                      type="button"
                      className="btn-hr-outline"
                      style={{ fontSize: '0.78rem', padding: '6px 14px', color: '#be123c', borderColor: '#fecdd3' }}
                      onClick={() => {
                        const poToReject = viewingPo;
                        setViewingPo(null);
                        setRejectingPo(poToReject);
                      }}
                    >
                      <X size={14} />
                      <span>Reject PO</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                className="btn-hr-black"
                onClick={() => setViewingPo(null)}
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN APPROVAL GATE */}
      {approvingPo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 410,
            padding: 16,
          }}
          onClick={() => setApprovingPo(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              background: C.white,
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
              border: '2px solid #facc15',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#fef3c7',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: C.black }}>
                  Admin Authorization Gate
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>
                  Review and approve purchase requisition for {approvingPo.poNumber}
                </div>
              </div>
            </div>

            {/* PO SUMMARY CARD */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 800, textTransform: 'uppercase' }}>
                    Supplier (Vendor)
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                    {approvingPo.supplierName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: C.dim }}>
                    TIN: {approvingPo.supplierTin || 'N/A'} • {approvingPo.paymentTerms}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 800, textTransform: 'uppercase' }}>
                    Commitment Amount
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#09090b' }}>
                    {formatETB(approvingPo.grandTotal)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                    Includes 15% VAT: {formatETB(approvingPo.vatTotal)}
                  </div>
                </div>
              </div>

              {/* Items in this PO */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 8 }}>
                <div style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                  Items & Technical Specifications
                </div>
                {approvingPo.items.map((it, idx) => (
                  <div key={idx} style={{ fontSize: '0.78rem', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{it.itemName}</strong> ({it.quantity} {it.unit})
                      {it.isNewItem && (
                        <span style={{ fontSize: '0.62rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 3, marginLeft: 5, fontWeight: 800 }}>
                          NEW SKU
                        </span>
                      )}
                      {it.specifications && (
                        <div style={{ fontSize: '0.7rem', color: '#475569', fontStyle: 'italic' }}>
                          Specs: {it.specifications}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatETB(it.totalAmount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPROVAL ACTION OPTIONS */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Approval Mode & Stock Ledger Destination
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setAdminApprovalAction('approve_only')}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `2px solid ${adminApprovalAction === 'approve_only' ? '#09090b' : '#e2e8f0'}`,
                    background: adminApprovalAction === 'approve_only' ? '#f4f4f5' : C.white,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: C.black }}>
                    1. Approve for Dispatch
                  </div>
                  <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>
                    Requisition approved; PO sent to supplier. Physical goods will be received via GRN upon delivery.
                  </div>
                </div>

                <div
                  onClick={() => setAdminApprovalAction('approve_and_receive')}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `2px solid ${adminApprovalAction === 'approve_and_receive' ? '#facc15' : '#e2e8f0'}`,
                    background: adminApprovalAction === 'approve_and_receive' ? '#fffbeb' : C.white,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#92400e' }}>
                    2. Approve & Direct Receive
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#78350f', marginTop: 2 }}>
                    Already delivered / immediate intake. Automatically increments store inventory stock balances now!
                  </div>
                </div>
              </div>
            </div>

            {adminApprovalAction === 'approve_and_receive' && (
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Destination Warehouse for Direct Stock Intake
                </label>
                <select
                  className="hr-select"
                  value={adminDirectReceiveStoreId}
                  onChange={(e) => setAdminDirectReceiveStoreId(e.target.value)}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* APPROVAL NOTES */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Authorization Notes / Executive Remarks
              </label>
              <textarea
                className="hr-input"
                rows={2}
                placeholder="e.g. Approved per 2026 advertising inventory quota. Verified commercial invoice."
                value={adminApprovalNotes}
                onChange={(e) => setAdminApprovalNotes(e.target.value)}
              />
            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn-hr-outline"
                onClick={() => setApprovingPo(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-hr-yellow"
                onClick={handleAdminApprovalConfirm}
              >
                <ShieldCheck size={14} />
                <span>
                  {adminApprovalAction === 'approve_and_receive'
                    ? 'Authorize & Post into Store Stock'
                    : 'Authorize Purchase Order'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN REJECTION */}
      {rejectingPo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 410,
            padding: 16,
          }}
          onClick={() => setRejectingPo(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: C.white,
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
              border: '2px solid #e11d48',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#fff1f2',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.black }}>
                  Reject Purchase Requisition
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted }}>
                  PO {rejectingPo.poNumber} will be marked as cancelled
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Reason for Rejection
              </label>
              <textarea
                className="hr-input"
                rows={3}
                placeholder="e.g. Budget limit exceeded; need revised quotation or alternate vendor."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn-hr-outline"
                onClick={() => setRejectingPo(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-hr-black"
                style={{ background: '#e11d48', color: '#fff' }}
                onClick={handleAdminRejectConfirm}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STANDALONE REGISTER SUPPLIER */}
      {showAddSupplierModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
            padding: 16,
          }}
          onClick={() => setShowAddSupplierModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: C.white,
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#fef3c7',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: C.black }}>
                    Register Approved Supplier / Vendor
                  </div>
                  <div style={{ fontSize: '0.74rem', color: C.muted }}>
                    Onboard new qualified supplier with Ethiopian Tax Identification (TIN) & Banking
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStandaloneAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Vendor / Company Name *
                  </label>
                  <input
                    required
                    className="hr-input"
                    placeholder="e.g. Al-Noor Aluminum & Profiles Plc"
                    value={standaloneSupName}
                    onChange={(e) => setStandaloneSupName(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Category
                  </label>
                  <select
                    className="hr-select"
                    value={standaloneSupCategory}
                    onChange={(e) => setStandaloneSupCategory(e.target.value as any)}
                  >
                    <option value="raw_material">Raw Materials</option>
                    <option value="consumable">Consumables & Hardware</option>
                    <option value="tool">Tools & Equipment</option>
                    <option value="packaging">Packaging Supplies</option>
                    <option value="other">General Services</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Ethiopian TIN (Tax ID)
                  </label>
                  <input
                    className="hr-input"
                    placeholder="e.g. 0048291032 (10 digits)"
                    value={standaloneSupTin}
                    onChange={(e) => setStandaloneSupTin(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    VAT Registration Status
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={standaloneSupIsVat}
                        onChange={(e) => setStandaloneSupIsVat(e.target.checked)}
                      />
                      <span>Registered (15% VAT Applicable)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    className="hr-input"
                    placeholder="+251 911 234 567"
                    value={standaloneSupPhone}
                    onChange={(e) => setStandaloneSupPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    className="hr-input"
                    placeholder="sales@supplier.et"
                    value={standaloneSupEmail}
                    onChange={(e) => setStandaloneSupEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Physical / Factory Address
                </label>
                <input
                  className="hr-input"
                  placeholder="e.g. Akaki Kaliti Industrial Zone, Addis Ababa"
                  value={standaloneSupAddress}
                  onChange={(e) => setStandaloneSupAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Bank Name
                  </label>
                  <select
                    className="hr-select"
                    value={standaloneSupBankName}
                    onChange={(e) => setStandaloneSupBankName(e.target.value)}
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Dashen Bank">Dashen Bank</option>
                    <option value="Abyssinia Bank">Abyssinia Bank</option>
                    <option value="Telebirr Merchant">Telebirr Merchant</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Bank Account Number
                  </label>
                  <input
                    className="hr-input"
                    placeholder="1000123456789"
                    value={standaloneSupBankAccount}
                    onChange={(e) => setStandaloneSupBankAccount(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Payment Terms
                  </label>
                  <select
                    className="hr-select"
                    value={standaloneSupPaymentTerms}
                    onChange={(e) => setStandaloneSupPaymentTerms(e.target.value)}
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="15 Days">15 Days Credit</option>
                    <option value="30 Days">30 Days Credit</option>
                    <option value="60 Days">60 Days Credit</option>
                    <option value="50% Advance, 50% on Delivery">50% Advance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setShowAddSupplierModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <Check size={14} />
                  <span>Onboard & Save Supplier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
