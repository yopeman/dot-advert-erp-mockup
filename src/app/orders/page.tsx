'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  Cog,
  TrendingUp,
  Boxes,
  Users,
  Clock,
  Trash2,
  Truck,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronRight,
  Sparkles,
  Calendar,
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
  Palette,
  FileCheck,
  AlertTriangle,
  Ruler,
  RefreshCw,
  Filter,
  Receipt,
  Check,
  ShieldCheck,
  MapPin,
  Zap,
  Compass,
} from 'lucide-react';
import {
  CustomerOrder,
  WorkOrder,
  OrderStatus,
  DesignProof,
  DesignStatus,
  WastageReason,
  WorkOrderBomItem,
  Expense,
  SiteSurvey,
} from '@/types/erp';
import DesignProofCard, { getStatusBadge } from '@/components/orders/DesignProofCard';
import DesignSpecsModal from '@/components/orders/DesignSpecsModal';
import ApproveProofModal from '@/components/orders/ApproveProofModal';
import RequestRevisionModal from '@/components/orders/RequestRevisionModal';
import NewDesignProofModal from '@/components/orders/NewDesignProofModal';
import LogScrapModal from '@/components/orders/LogScrapModal';
import WorkOrderCard from '@/components/orders/WorkOrderCard';
import LogOrderExpenseModal from '@/components/orders/LogOrderExpenseModal';
import LogOrderWastageModal from '@/components/orders/LogOrderWastageModal';

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'orders' | 'designs' | 'work_orders' | null;

  const {
    orders,
    workOrders,
    customers,
    items,
    employees,
    wastages,
    expenses,
    invoices,
    designProofs,
    createCustomerOrder,
    createWorkOrder,
    updateWorkOrder,
    advanceWorkOrderStatus,
    recordWorkOrderScrap,
    recordWastage,
    recordExpense,
    addBomItemToWorkOrder,
    updateOrderStatus,
    createDesignProof,
    updateDesignProof,
    approveDesignProof,
    requestDesignRevision,
    calculateOrderProfitability,
    allOrderProfitability,
    addStockMovement,
    leads,
    updateOrderSurveys,
  } = useErp();

  // Active Tab synchronized with query string
  const [activeTab, setActiveTab] = useState<'orders' | 'designs' | 'work_orders'>(
    tabParam || 'orders'
  );

  useEffect(() => {
    if (tabParam && (tabParam === 'orders' || tabParam === 'designs' || tabParam === 'work_orders')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'orders' | 'designs' | 'work_orders') => {
    setActiveTab(tab);
    router.push(`/orders?tab=${tab}`);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');

  // Filter States
  const [designStatusFilter, setDesignStatusFilter] = useState<'all' | DesignStatus>('all');
  const [woStationFilter, setWoStationFilter] = useState<string>('all');

  // Modals State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewWoModal, setShowNewWoModal] = useState(false);
  const [showAddHoursModal, setShowAddHoursModal] = useState(false);
  const [targetWoForHours, setTargetWoForHours] = useState<WorkOrder | null>(null);
  const [showIssueBomModal, setShowIssueBomModal] = useState(false);
  const [targetWoForBom, setTargetWoForBom] = useState<WorkOrder | null>(null);

  // Manage Order Site Surveys Modal State (1-to-many)
  const [showManageSurveysModal, setShowManageSurveysModal] = useState(false);
  const [editOrderSurveyIds, setEditOrderSurveyIds] = useState<string[]>([]);

  // Design Proof Modals State
  const [inspectingProof, setInspectingProof] = useState<DesignProof | null>(null);
  const [approvingProof, setApprovingProof] = useState<DesignProof | null>(null);
  const [revisingProof, setRevisingProof] = useState<DesignProof | null>(null);
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [newDesignTargetOrderId, setNewDesignTargetOrderId] = useState<string | undefined>(undefined);

  // Expense & Wastage Modal State
  const [showLogExpenseModal, setShowLogExpenseModal] = useState(false);
  const [showLogWastageModal, setShowLogWastageModal] = useState(false);

  // Scrap Modal State
  const [scrapTargetWo, setScrapTargetWo] = useState<WorkOrder | null>(null);

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // New Order Form State (supporting 1-to-many linked site surveys)
  const [newOrderForm, setNewOrderForm] = useState({
    customerId: customers[0]?.id || '',
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 50000,
    expectedDeliveryDate: '2026-10-30',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    notes: '',
    siteSurveyIds: [] as string[],
  });

  // Enhanced Multi-Item New Work Order Form State
  const [newWoForm, setNewWoForm] = useState({
    customerOrderId: orders[0]?.id || '',
    productDescription: '',
    plannedQty: 1,
    workCenterMachine: 'Roland Wide-Format Eco-Solvent Printer',
    operatorNames: ['Ermias Kebede'],
    machineHourlyRate: 650,
    machineHours: 12,
    selectedItems: [
      { itemId: items[0]?.id || '', plannedQty: 20 },
      { itemId: items[6]?.id || items[1]?.id || '', plannedQty: 30 },
    ],
  });

  // Add Hours Form State
  const [hoursToAdd, setHoursToAdd] = useState(4);

  // Issue BOM Form State
  const [issueBomItemId, setIssueBomItemId] = useState(items[0]?.id || '');
  const [issueBomQty, setIssueBomQty] = useState(5);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedProfitability = selectedOrderId
    ? calculateOrderProfitability(selectedOrderId)
    : null;
  const selectedWOs = workOrders.filter((w) => w.customerOrderId === selectedOrderId);
  const orderDesigns = designProofs.filter(
    (d) => d.customerOrderId === selectedOrderId || d.id === selectedOrder?.designProofId
  );
  const orderExpenses = expenses.filter((e) => e.orderId === selectedOrderId);
  const orderWastages = wastages.filter((w) => w.orderId === selectedOrderId);

  // 1-to-Many Site Survey Link calculations
  const allSystemSurveys = React.useMemo(() => {
    const map = new Map<string, SiteSurvey>();
    customers.forEach((c) => (c.siteSurveys || []).forEach((s) => map.set(s.id, s)));
    leads.forEach((l) => (l.siteSurveys || []).forEach((s) => map.set(s.id, s)));
    return map;
  }, [customers, leads]);

  const selectedOrderSurveys = React.useMemo(() => {
    if (!selectedOrder?.siteSurveyIds) return [];
    return selectedOrder.siteSurveyIds
      .map((id) => allSystemSurveys.get(id))
      .filter((s): s is SiteSurvey => Boolean(s));
  }, [selectedOrder, allSystemSurveys]);

  const totalSelectedSurveysArea = React.useMemo(() => {
    return selectedOrderSurveys.reduce(
      (sum, s) => sum + (s.widthMeters || 0) * (s.heightMeters || 0),
      0
    );
  }, [selectedOrderSurveys]);

  // Available surveys for the customer currently selected in New Order Modal
  const availableCustomerSurveys = React.useMemo(() => {
    const cust = customers.find((c) => c.id === newOrderForm.customerId);
    if (!cust) return [];
    const custSurveys = cust.siteSurveys || [];
    const leadSurveys =
      leads.find(
        (l) =>
          l.convertedCustomerId === cust.id ||
          l.companyName.toLowerCase() === cust.name.toLowerCase()
      )?.siteSurveys || [];
    const combined = [...custSurveys];
    leadSurveys.forEach((ls) => {
      if (!combined.some((s) => s.id === ls.id)) combined.push(ls);
    });
    return combined;
  }, [newOrderForm.customerId, customers, leads]);

  // Available surveys for managing an existing order's linked surveys
  const orderTargetCustomer = customers.find((c) => c.id === selectedOrder?.customerId);
  const availableForEditSurveys = React.useMemo(() => {
    if (!orderTargetCustomer) return [];
    const custSurveys = orderTargetCustomer.siteSurveys || [];
    const leadSurveys =
      leads.find(
        (l) =>
          l.convertedCustomerId === orderTargetCustomer.id ||
          l.companyName.toLowerCase() === orderTargetCustomer.name.toLowerCase()
      )?.siteSurveys || [];
    const combined = [...custSurveys];
    leadSurveys.forEach((ls) => {
      if (!combined.some((s) => s.id === ls.id)) combined.push(ls);
    });
    return combined;
  }, [orderTargetCustomer, leads]);

  const handleOpenManageSurveys = () => {
    if (!selectedOrder) return;
    setEditOrderSurveyIds(selectedOrder.siteSurveyIds || []);
    setShowManageSurveysModal(true);
  };

  const handleSaveOrderSurveys = () => {
    if (!selectedOrder) return;
    updateOrderSurveys(selectedOrder.id, editOrderSurveyIds);
    setShowManageSurveysModal(false);
    showToast(`Linked site surveys updated for ${selectedOrder.orderNumber}!`);
  };

  // Design approval breakdown for this specific order
  const orderApprovedDesignsCount = orderDesigns.filter((d) => d.status === 'approved').length;
  const orderPendingDesignsCount = orderDesigns.filter((d) => d.status === 'client_proofing').length;
  const orderRevisionDesignsCount = orderDesigns.filter((d) => d.status === 'revision_requested').length;
  const allOrderDesignsApproved =
    orderDesigns.length > 0 && orderDesigns.every((d) => d.status === 'approved');

  // Customer Credit Limit check for New Order
  const targetCustomer = customers.find((c) => c.id === newOrderForm.customerId);
  const availableCredit = targetCustomer
    ? targetCustomer.creditLimit - targetCustomer.outstandingBalance
    : 0;
  const isOverCredit = newOrderForm.quantity * newOrderForm.unitPrice > availableCredit;

  // Handle New Order Submit (with 1-to-many siteSurveyIds)
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer || !newOrderForm.title) return;

    const totalAgreed = newOrderForm.quantity * newOrderForm.unitPrice;

    const created = createCustomerOrder({
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerTin: targetCustomer.tin,
      title: newOrderForm.title,
      items: [
        {
          description: newOrderForm.description || newOrderForm.title,
          quantity: newOrderForm.quantity,
          unit: 'piece',
          unitPrice: newOrderForm.unitPrice,
          total: totalAgreed,
        },
      ],
      totalAgreedPrice: totalAgreed,
      expectedDeliveryDate: newOrderForm.expectedDeliveryDate,
      priority: newOrderForm.priority,
      notes: newOrderForm.notes,
      siteSurveyIds: newOrderForm.siteSurveyIds,
    });

    setShowNewOrderModal(false);
    setSelectedOrderId(created.id);
    showToast(`Order ${created.orderNumber} placed for ${targetCustomer.name} with ${newOrderForm.siteSurveyIds.length} site surveys!`);
  };

  // Handle Create Work Order (Multi-Item BOM)
  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parentOrder = orders.find((o) => o.id === newWoForm.customerOrderId);
    if (!parentOrder) return;

    const linkedProof = designProofs.find(
      (d) => d.customerOrderId === parentOrder.id || d.id === parentOrder.designProofId
    );

    // Build BOM Items
    const bomItems: WorkOrderBomItem[] = newWoForm.selectedItems
      .map((si) => {
        const it = items.find((i) => i.id === si.itemId);
        if (!it) return null;
        return {
          itemId: it.id,
          itemName: it.name,
          plannedQty: si.plannedQty,
          actualIssuedQty: si.plannedQty,
          unit: it.unit,
          unitCost: it.purchasePrice,
          totalCost: si.plannedQty * it.purchasePrice,
        };
      })
      .filter((b): b is WorkOrderBomItem => b !== null);

    createWorkOrder({
      customerOrderId: parentOrder.id,
      orderNumber: parentOrder.orderNumber,
      customerName: parentOrder.customerName,
      productDescription: newWoForm.productDescription || parentOrder.title,
      plannedQty: newWoForm.plannedQty,
      startDate: new Date().toISOString().split('T')[0],
      workCenterMachine: newWoForm.workCenterMachine,
      operatorNames: newWoForm.operatorNames,
      machineHours: newWoForm.machineHours,
      machineHourlyRate: newWoForm.machineHourlyRate,
      designProofId: linkedProof?.id,
      designNumber: linkedProof?.designNumber,
      qualityInspector: 'Dawit Bekele',
      targetWorkCenters: [newWoForm.workCenterMachine, 'Signage Assembly & LED Wiring Bench', 'Quality Testing Bay'],
      bomItems,
    });

    // Deduct stock for all issued BOM items
    bomItems.forEach((bi) => {
      addStockMovement({
        itemId: bi.itemId,
        fromStoreId: 'store-1',
        toStoreId: 'store-2',
        movementType: 'production_issue',
        quantity: bi.actualIssuedQty,
        referenceType: 'WORK_ORDER',
        notes: `Issued for production of ${parentOrder.orderNumber}`,
      });
    });

    setShowNewWoModal(false);
    showToast(
      `Work Order scheduled with ${bomItems.length} BOM raw materials issued to shopfloor!`
    );
  };

  // Handle Add Machine Hours
  const handleAddHours = (woId: string) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo) return;

    const newHours = wo.machineHours + hoursToAdd;
    updateWorkOrder(woId, { machineHours: newHours });
    setShowAddHoursModal(false);
    showToast(`Logged ${hoursToAdd} additional hours on ${wo.workOrderNumber}. Order costing recalculated!`);
  };

  // Handle Issue Extra Material to WO
  const handleIssueExtraMaterial = (woId: string) => {
    const wo = workOrders.find((w) => w.id === woId);
    const item = items.find((i) => i.id === issueBomItemId);
    if (!wo || !item || issueBomQty <= 0) return;

    addBomItemToWorkOrder(woId, {
      itemId: item.id,
      itemName: item.name,
      plannedQty: issueBomQty,
      actualIssuedQty: issueBomQty,
      unit: item.unit,
      unitCost: item.purchasePrice,
    });

    // Deduct stock
    addStockMovement({
      itemId: item.id,
      fromStoreId: 'store-1',
      toStoreId: 'store-2',
      movementType: 'production_issue',
      quantity: issueBomQty,
      referenceType: 'WORK_ORDER',
      referenceNumber: wo.workOrderNumber,
      notes: `Supplemental materials issued to WO: ${wo.workOrderNumber}`,
    });

    setShowIssueBomModal(false);
    showToast(`Issued ${issueBomQty} ${item.unit} of ${item.name} to ${wo.workOrderNumber}. BOM updated!`);
  };

  // Handle Design Proof Confirmations
  const handleConfirmApproveProof = (proofId: string, approverName: string, notes: string) => {
    approveDesignProof(proofId, approverName, notes);
    const targetProof = designProofs.find((d) => d.id === proofId);
    if (targetProof && targetProof.customerOrderId) {
      updateOrderStatus(targetProof.customerOrderId, 'in_production');
    }
    showToast(`Artwork ${targetProof?.designNumber} approved by ${approverName}! Production unlocked.`);
  };

  const handleConfirmRevisionProof = (proofId: string, feedbackNotes: string) => {
    requestDesignRevision(proofId, feedbackNotes);
    const targetProof = designProofs.find((d) => d.id === proofId);
    showToast(`Revision request logged for ${targetProof?.designNumber}. Designer notified.`);
  };

  // Handle Work Order Scrap Confirmation
  const handleConfirmScrap = (
    woId: string,
    scrapData: { itemId: string; quantity: number; reason: WastageReason; notes?: string }
  ) => {
    recordWorkOrderScrap(woId, scrapData);
    const wo = workOrders.find((w) => w.id === woId);
    showToast(`Recorded ${scrapData.quantity} scrap on ${wo?.workOrderNumber}. Factory cost updated!`);
  };

  // Handle Direct Order Expense Confirmation
  const handleConfirmOrderExpense = (
    expenseData: Omit<Expense, 'id' | 'expenseNumber' | 'date' | 'status'>
  ) => {
    recordExpense(expenseData);
    showToast(
      `Direct expense of ${formatETB(expenseData.amountNet)} logged for ${expenseData.orderNumber || 'order'}! Profitability recalculated.`
    );
  };

  // Handle Direct Order Wastage Confirmation
  const handleConfirmOrderWastage = (params: {
    itemId: string;
    quantity: number;
    storeId: string;
    reason: WastageReason;
    orderId: string;
    notes?: string;
    workOrderId?: string;
  }) => {
    recordWastage(params);
    if (params.workOrderId) {
      const wo = workOrders.find((w) => w.id === params.workOrderId);
      if (wo) {
        updateWorkOrder(params.workOrderId, { scrapQty: wo.scrapQty + params.quantity });
      }
    }
    showToast(`Order wastage recorded! Deducted directly from order profit margin.`);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Design Proofs
  const filteredProofs = designProofs.filter((p) => {
    const matchesFilter = designStatusFilter === 'all' || p.status === designStatusFilter;
    const matchesSearch =
      p.designNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Work Orders
  const filteredWorkOrders = workOrders.filter((w) => {
    const matchesStation = woStationFilter === 'all' || w.workCenterMachine === woStationFilter;
    const matchesSearch =
      w.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.productDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesSearch;
  });

  // Metrics
  const totalPipelineRevenue = orders.reduce((sum, o) => sum + o.totalAgreedPrice, 0);
  const activeWOCount = workOrders.filter((w) => w.status === 'in_progress').length;
  const approvedDesignsCount = designProofs.filter((d) => d.status === 'approved').length;
  const pendingProofCount = designProofs.filter((d) => d.status === 'client_proofing').length;
  const totalScrapCost = wastages.reduce((sum, w) => sum + w.totalCost, 0);

  return (
    <div>
      {/* Top Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Order & Production Desk
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Advertising Design Proofing & Factory BOM Engine
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Customer Jobs, CMYK Proofs & Workshop BOMs</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNewDesignModal(true)}
          >
            <Palette size={14} color="#c084fc" />
            <span>+ New Artwork Proof</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNewWoModal(true)}
          >
            <Cog size={14} color="#38bdf8" />
            <span>Schedule Work Order</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewOrderModal(true)}
          >
            <PlusCircle size={14} />
            <span>New Customer Order</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 600 }}>
            {notification}
          </span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="stat-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-card-title">
            <span>Orders Pipeline Revenue</span>
            <TrendingUp size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{formatETB(totalPipelineRevenue)}</div>
          <div className="stat-card-subtext">
            <span>{orders.length} contracted customer orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Artwork Proofs Status</span>
            <Palette size={16} color="#a855f7" />
          </div>
          <div className="stat-card-value" style={{ color: '#c084fc' }}>
            {approvedDesignsCount} / {designProofs.length} Approved
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: pendingProofCount > 0 ? '#fbbf24' : 'var(--text-dim)' }}>
              {pendingProofCount} currently awaiting client sign-off
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Active Production WOs</span>
            <Cog size={16} color="#38bdf8" />
          </div>
          <div className="stat-card-value" style={{ color: '#38bdf8' }}>
            {activeWOCount} In Production
          </div>
          <div className="stat-card-subtext">
            <span>{workOrders.length} scheduled factory work orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Factory Scrap / Wastage</span>
            <Trash2 size={16} color="#fb7185" />
          </div>
          <div className="stat-card-value" style={{ color: '#fb7185' }}>
            {formatETB(totalScrapCost)}
          </div>
          <div className="stat-card-subtext">
            <span>Tracked per job order & station</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleTabChange('orders')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'orders' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: activeTab === 'orders' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Boxes size={15} color={activeTab === 'orders' ? '#38bdf8' : 'var(--text-dim)'} />
            <span>Customer Orders & Profitability ({orders.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('designs')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'designs' ? '2px solid #a855f7' : '2px solid transparent',
              color: activeTab === 'designs' ? '#c084fc' : 'var(--text-muted)',
              fontWeight: activeTab === 'designs' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Palette size={15} color={activeTab === 'designs' ? '#c084fc' : 'var(--text-dim)'} />
            <span>Graphic Design Proofing Hub ({designProofs.length})</span>
            {pendingProofCount > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#000000',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {pendingProofCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('work_orders')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'work_orders' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'work_orders' ? '#38bdf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'work_orders' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Cog size={15} color={activeTab === 'work_orders' ? '#38bdf8' : 'var(--text-dim)'} />
            <span>Shopfloor Production & BOM ({workOrders.length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === 'orders'
                ? 'Search orders by # or client...'
                : activeTab === 'designs'
                ? 'Search designs by #, title, or client...'
                : 'Search work orders...'
            }
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.825rem', height: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CUSTOMER ORDERS & PROFITABILITY WATERFALL          */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.35fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN: CUSTOMER ORDERS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((ord) => {
              const isSelected = ord.id === selectedOrderId;
              const p = calculateOrderProfitability(ord.id);
              const marginColor =
                (p?.profitMarginPct || 0) >= 40
                  ? '#34d399'
                  : (p?.profitMarginPct || 0) >= 20
                  ? '#fbbf24'
                  : '#fb7185';

              const linkedProof = designProofs.find(
                (d) => d.customerOrderId === ord.id || d.id === ord.designProofId
              );

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                    border: isSelected
                      ? '1px solid #38bdf8'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`badge ${
                          ord.priority === 'urgent'
                            ? 'badge-rose'
                            : ord.priority === 'high'
                            ? 'badge-amber'
                            : 'badge-gray'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {ord.priority}
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        ord.status === 'paid'
                          ? 'badge-emerald'
                          : ord.status === 'invoiced'
                          ? 'badge-primary'
                          : ord.status === 'in_production'
                          ? 'badge-amber'
                          : 'badge-gray'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {ord.title}
                  </div>

                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Customer: <strong style={{ color: 'var(--text-main)' }}>{ord.customerName}</strong>
                  </div>

                  {/* Badges Bar: Design status & Margin */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '10px',
                    }}
                  >
                    <div>
                      {linkedProof ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: linkedProof.status === 'approved' ? '#34d399' : '#fbbf24',
                          }}
                        >
                          <Palette size={12} />
                          <span>Proof: {linkedProof.status === 'approved' ? 'Approved' : 'Awaiting Proof'}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          No Design Proof Linked
                        </span>
                      )}

                      {ord.siteSurveyIds && ord.siteSurveyIds.length > 0 && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#38bdf8',
                            marginTop: '3px',
                          }}
                        >
                          <Ruler size={11} />
                          <span>
                            {ord.siteSurveyIds.length} {ord.siteSurveyIds.length === 1 ? 'Survey' : 'Surveys'} Linked
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                        {formatETB(ord.totalAgreedPrice)}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: marginColor, marginLeft: '8px' }}>
                        {p?.profitMarginPct.toFixed(1)}% margin
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: COST WATERFALL & LIVE PROFITABILITY */}
          {selectedOrder && selectedProfitability ? (
            <div className="card" style={{ padding: '24px' }}>
              {/* Order Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                      {selectedOrder.orderNumber}
                    </span>
                    <span className="badge badge-primary">{selectedOrder.status.replace('_', ' ')}</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', marginTop: '6px', color: '#ffffff' }}>
                    {selectedOrder.title}
                  </h2>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Client: <strong>{selectedOrder.customerName}</strong> (TIN: {selectedOrder.customerTin})
                  </div>
                </div>

                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 12px' }}
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_production">In Production</option>
                  <option value="delivered">Delivered</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* ========================================================= */}
              {/* 4-STAGE ORDER LIFECYCLE PIPELINE TRACKER                 */}
              {/* Lead/Client -> Order -> Design -> Production             */}
              {/* ========================================================= */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={13} color="#38bdf8" />
                  <span>Order Lifecycle Progress Pipeline</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                  }}
                >
                  {/* Step 1: Lead / Client & Surveys */}
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle2 size={14} color="#10b981" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                        1. Client & Surveys
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedOrderSurveys.length > 0
                        ? `${selectedOrderSurveys.length} Signs (${totalSelectedSurveysArea.toFixed(1)}m²)`
                        : selectedOrder.customerName}
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      {selectedOrderSurveys.length > 0 ? selectedOrder.customerName : 'No surveys linked'}
                    </div>
                  </div>

                  {/* Step 2: Contracted Order */}
                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle2 size={14} color="#38bdf8" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                        2. Order Placed
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600 }}>
                      {selectedOrder.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      {formatETB(selectedOrder.totalAgreedPrice)} Contract
                    </div>
                  </div>

                  {/* Step 3: Design & Customer Approval Gate */}
                  <div
                    style={{
                      background: allOrderDesignsApproved
                        ? 'rgba(16, 185, 129, 0.1)'
                        : orderRevisionDesignsCount > 0
                        ? 'rgba(244, 63, 94, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                      border: allOrderDesignsApproved
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : orderRevisionDesignsCount > 0
                        ? '1px solid rgba(244, 63, 94, 0.35)'
                        : '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      {allOrderDesignsApproved ? (
                        <ShieldCheck size={14} color="#10b981" />
                      ) : orderRevisionDesignsCount > 0 ? (
                        <AlertTriangle size={14} color="#fb7185" />
                      ) : (
                        <Clock size={14} color="#fbbf24" />
                      )}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: allOrderDesignsApproved
                            ? '#34d399'
                            : orderRevisionDesignsCount > 0
                            ? '#fb7185'
                            : '#fbbf24',
                        }}
                      >
                        3. Design Proofs
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600 }}>
                      {orderApprovedDesignsCount} / {orderDesigns.length} Approved
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      Customer Approval Gate
                    </div>
                  </div>

                  {/* Step 4: Shopfloor Production */}
                  <div
                    style={{
                      background:
                        selectedWOs.length > 0 ? 'rgba(129, 140, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border:
                        selectedWOs.length > 0
                          ? '1px solid rgba(129, 140, 248, 0.35)'
                          : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Cog
                        size={14}
                        color={selectedWOs.length > 0 ? '#818cf8' : 'var(--text-dim)'}
                        className={selectedWOs.some((w) => w.status === 'in_progress') ? 'spin' : ''}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: selectedWOs.length > 0 ? '#a5b4fc' : 'var(--text-dim)',
                        }}
                      >
                        4. Production
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600 }}>
                      {selectedWOs.length} Work Orders
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      Roland & CNC Routing
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* LINKED SITE SURVEYS & ARCHITECTURAL DIMENSIONS SECTION   */}
              {/* (Order has 1-to-many site surveys with physical specs)    */}
              {/* ========================================================= */}
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.03)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8',
                      }}
                    >
                      <Ruler size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0, color: '#ffffff' }}>
                          Linked Site Surveys & Dimensions ({selectedOrderSurveys.length})
                        </h3>
                        {selectedOrderSurveys.length > 0 && (
                          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                            {totalSelectedSurveysArea.toFixed(1)} m² Total Area
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Physical architectural measurements, ground elevation, depth, and electrical source specifications.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                      href="/crm?tab=surveys"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Compass size={13} />
                      <span>Survey Center</span>
                    </Link>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleOpenManageSurveys}
                    >
                      <Ruler size={13} />
                      <span>Manage Linked Surveys</span>
                    </button>
                  </div>
                </div>

                {selectedOrderSurveys.length === 0 ? (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      textAlign: 'center',
                    }}
                  >
                    <Ruler size={32} color="var(--text-dim)" style={{ margin: '0 auto 8px' }} />
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 4px' }}>
                      No Site Surveys Linked Yet
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 12px' }}>
                      Link on-site measurements for {selectedOrder.customerName} so design artwork scaling and workshop fabrication cutlists have precise dimensions.
                    </p>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleOpenManageSurveys}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusCircle size={14} />
                      <span>+ Link Site Surveys for this Order</span>
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    {selectedOrderSurveys.map((survey, srvIdx) => {
                      const area = (survey.widthMeters * survey.heightMeters).toFixed(2);
                      return (
                        <div
                          key={survey.id}
                          style={{
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '0.675rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                                Signboard #{srvIdx + 1} • {survey.indoorOutdoor.toUpperCase()}
                              </div>
                              <h4 style={{ fontSize: '0.9rem', color: '#ffffff', margin: '2px 0 0', fontWeight: 700 }}>
                                {survey.title}
                              </h4>
                            </div>
                            <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                              {survey.status || 'Verified'}
                            </span>
                          </div>

                          {/* Dimensions Box */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '8px',
                              textAlign: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Width × Height</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                                {survey.widthMeters}m × {survey.heightMeters}m
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Surface Area</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                                {area} m²
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>3D Depth</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                                {survey.depthMeters ? `${survey.depthMeters}m` : 'Flat / 2D'}
                              </div>
                            </div>
                          </div>

                          {/* Technical & Installation Specs */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={12} color="#38bdf8" />
                              <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {survey.locationAddress}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Zap size={12} color={survey.powerSourceAvailable ? '#34d399' : '#f59e0b'} />
                                <span>{survey.powerSourceAvailable ? '220V Power Ready' : 'No Direct Power'}</span>
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                Ground Clearance: <strong>{survey.installationHeightMeters}m</strong>
                              </span>
                            </div>

                            {survey.notes && (
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--text-muted)',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  marginTop: '4px',
                                  fontStyle: 'italic',
                                }}
                              >
                                &ldquo;{survey.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ORDER GRAPHIC DESIGNS & CUSTOMER APPROVAL GATE SECTION   */}
              {/* (Order has MULTIPLE designs with customer sign-off)      */}
              {/* ========================================================= */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c084fc',
                      }}
                    >
                      <Palette size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', margin: 0, color: '#ffffff' }}>
                        Order Designs & Customer Approval Gate ({orderDesigns.length})
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Client approval is required before fabrication release. Multiple designs supported per order.
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                    onClick={() => {
                      setNewDesignTargetOrderId(selectedOrder.id);
                      setShowNewDesignModal(true);
                    }}
                  >
                    <PlusCircle size={13} />
                    <span>+ Add Another Design to Order</span>
                  </button>
                </div>

                {/* Overall Customer Approval Banner */}
                {orderDesigns.length === 0 ? (
                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: '#7dd3fc' }}>
                      No design proofs attached to this order yet.
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => {
                        setNewDesignTargetOrderId(selectedOrder.id);
                        setShowNewDesignModal(true);
                      }}
                    >
                      Upload Artwork Proof
                    </button>
                  </div>
                ) : allOrderDesignsApproved ? (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    <ShieldCheck size={18} color="#10b981" />
                    <span style={{ fontSize: '0.825rem', color: '#a7f3d0', fontWeight: 600 }}>
                      Customer Approval Certified: All {orderDesigns.length} artwork design proofs approved by {selectedOrder.customerName}. Workshop production released!
                    </span>
                  </div>
                ) : orderRevisionDesignsCount > 0 ? (
                  <div
                    style={{
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    <AlertTriangle size={18} color="#fb7185" />
                    <span style={{ fontSize: '0.825rem', color: '#fecdd3', fontWeight: 600 }}>
                      Customer Action Required: {orderRevisionDesignsCount} design(s) have client revision requests pending designer updates.
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    <Clock size={18} color="#fbbf24" />
                    <span style={{ fontSize: '0.825rem', color: '#fde68a', fontWeight: 600 }}>
                      Awaiting Customer Approval: {orderPendingDesignsCount} of {orderDesigns.length} artwork proofs pending client digital sign-off.
                    </span>
                  </div>
                )}

                {/* Grid of Attached Designs */}
                {orderDesigns.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orderDesigns.map((proof) => {
                      const badge = getStatusBadge(proof.status);
                      const isApproved = proof.status === 'approved';

                      return (
                        <div
                          key={proof.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: isApproved
                              ? '1px solid rgba(16, 185, 129, 0.25)'
                              : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 300px' }}>
                            {proof.mockupUrl ? (
                              <img
                                src={proof.mockupUrl}
                                alt={proof.title}
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '6px',
                                  background: 'rgba(168, 85, 247, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#c084fc',
                                }}
                              >
                                <Palette size={22} />
                              </div>
                            )}

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#c084fc', fontWeight: 700 }}>
                                  {proof.designNumber}
                                </span>
                                <span className={badge.className} style={{ fontSize: '0.675rem' }}>
                                  {badge.label}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                                {proof.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                📐 {proof.widthMeters}m × {proof.heightMeters}m • {proof.materialSpec}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                Artist: {proof.designerName} • Profile: {proof.colorProfile} ({proof.resolutionDpi} DPI)
                              </div>

                              {/* Customer Approval Note / Feedback */}
                              {isApproved && proof.approvedBy && (
                                <div
                                  style={{
                                    marginTop: '6px',
                                    padding: '6px 10px',
                                    background: 'rgba(16, 185, 129, 0.08)',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    color: '#a7f3d0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <Check size={12} color="#10b981" />
                                  <span>
                                    Signed off by <strong>{proof.approvedBy}</strong> ({proof.approvedDate || 'Approved'}). {proof.clientFeedback ? `"${proof.clientFeedback}"` : ''}
                                  </span>
                                </div>
                              )}

                              {proof.status === 'revision_requested' && proof.clientFeedback && (
                                <div
                                  style={{
                                    marginTop: '6px',
                                    padding: '6px 10px',
                                    background: 'rgba(244, 63, 94, 0.08)',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    color: '#fca5a5',
                                  }}
                                >
                                  <strong>Customer Revision:</strong> {proof.clientFeedback}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons for this design */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '5px 9px' }}
                              onClick={() => setInspectingProof(proof)}
                            >
                              <Eye size={12} />
                              <span>Specs & CAD</span>
                            </button>

                            {!isApproved && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '5px 10px',
                                  background: '#10b981',
                                  borderColor: '#059669',
                                }}
                                onClick={() => setApprovingProof(proof)}
                              >
                                <CheckCircle2 size={12} />
                                <span>Customer Sign-off</span>
                              </button>
                            )}

                            {proof.status !== 'revision_requested' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.72rem', padding: '5px 9px', color: '#fda4af' }}
                                onClick={() => setRevisingProof(proof)}
                              >
                                <span>Request Revision</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Profitability Result Banner */}
              <div
                style={{
                  background:
                    selectedProfitability.profitMarginPct >= 35
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 30, 51, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(20, 30, 51, 0.9) 100%)',
                  border:
                    selectedProfitability.profitMarginPct >= 35
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: selectedProfitability.profitMarginPct >= 35 ? '#34d399' : '#fbbf24',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      True Net Order Profit
                    </div>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: selectedProfitability.profitMarginPct >= 35 ? '#34d399' : '#fbbf24',
                        marginTop: '2px',
                      }}
                    >
                      {formatETB(selectedProfitability.orderProfit)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: selectedProfitability.profitMarginPct >= 35 ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {selectedProfitability.profitMarginPct.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Net Profit Margin
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-bg" style={{ height: '7px', marginTop: '12px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, selectedProfitability.profitMarginPct))}%`,
                      background: selectedProfitability.profitMarginPct >= 35 ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
              </div>

              {/* Financial Waterfall Ledger */}
              <div style={{ marginBottom: '22px' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px',
                  }}
                >
                  Cost Waterfall Breakdown
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Revenue */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Invoiced Revenue (Excl. 15% VAT):
                    </span>
                    <strong style={{ color: '#ffffff' }}>
                      + {formatETB(selectedProfitability.orderRevenue)}
                    </strong>
                  </div>

                  {/* Direct Materials BOM */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Direct Raw Materials Consumed (BOM):</span>
                    <span style={{ color: '#fb7185' }}>
                      - {formatETB(selectedProfitability.directMaterialCost)}
                    </span>
                  </div>

                  {/* Direct Labor */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Direct Workshop Labor (Operator Hours):</span>
                    <span style={{ color: '#fb7185' }}>
                      - {formatETB(selectedProfitability.directLaborCost)}
                    </span>
                  </div>

                  {/* Machine Runtime */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Machine Station Hourly Runtime Cost:</span>
                    <span style={{ color: '#fb7185' }}>
                      - {formatETB(selectedProfitability.machineCost)}
                    </span>
                  </div>

                  {/* Scrap / Wastage with Log Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      background: selectedProfitability.wastageCost > 0 ? 'rgba(239, 68, 68, 0.06)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Material Wastage & Scrap Incurred:</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.675rem', padding: '2px 8px', color: '#fb7185', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => setShowLogWastageModal(true)}
                      >
                        <Trash2 size={11} />
                        <span>+ Log Wastage</span>
                      </button>
                    </div>
                    <span
                      style={{
                        color: selectedProfitability.wastageCost > 0 ? '#fb7185' : 'var(--text-dim)',
                        fontWeight: selectedProfitability.wastageCost > 0 ? 700 : 400,
                      }}
                    >
                      - {formatETB(selectedProfitability.wastageCost)}
                    </span>
                  </div>

                  {/* Direct Order Expenses & Logistics with Log Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      background: selectedProfitability.orderTransportCost > 0 ? 'rgba(244, 63, 94, 0.06)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Direct Order Expenses & Logistics (Transport, Crane, Permits):</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.675rem', padding: '2px 8px', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        onClick={() => setShowLogExpenseModal(true)}
                      >
                        <Receipt size={11} />
                        <span>+ Log Expense</span>
                      </button>
                    </div>
                    <span
                      style={{
                        color: selectedProfitability.orderTransportCost > 0 ? '#fb7185' : 'var(--text-dim)',
                        fontWeight: selectedProfitability.orderTransportCost > 0 ? 700 : 400,
                      }}
                    >
                      - {formatETB(selectedProfitability.orderTransportCost)}
                    </span>
                  </div>

                  {/* Factory Overhead */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Allocated Factory Fixed Overhead (5%):</span>
                    <span style={{ color: '#fb7185' }}>
                      - {formatETB(selectedProfitability.allocatedOverheadCost)}
                    </span>
                  </div>

                  {/* Total Cost Line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontWeight: 700,
                    }}
                  >
                    <span>Total Order Cost (Fixed + Variable):</span>
                    <span style={{ color: '#fb7185' }}>
                      {formatETB(selectedProfitability.totalOrderCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* ITEMIZED ORDER EXPENSES & WASTAGE AUDIT LEDGERS           */}
              {/* ========================================================= */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '22px' }}>
                {/* 1. Logged Direct Order Expenses Table */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Receipt size={16} color="#fb7185" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                        Logged Direct Expenses for {selectedOrder.orderNumber} ({orderExpenses.length})
                      </span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.3)' }}
                      onClick={() => setShowLogExpenseModal(true)}
                    >
                      <PlusCircle size={12} />
                      <span>+ Log Order Expense</span>
                    </button>
                  </div>

                  {orderExpenses.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table" style={{ fontSize: '0.75rem', width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Payee / Contractor</th>
                            <th>Payment</th>
                            <th>Voucher / Ref</th>
                            <th style={{ textAlign: 'right' }}>Net ETB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderExpenses.map((exp) => (
                            <tr key={exp.id}>
                              <td>{exp.date}</td>
                              <td>
                                <span className="badge badge-secondary" style={{ fontSize: '0.675rem' }}>
                                  {exp.categoryLabel || exp.category.replace('_', ' ')}
                                </span>
                              </td>
                              <td style={{ color: '#ffffff', fontWeight: 600 }}>{exp.supplierOrPayee}</td>
                              <td>{exp.paymentMethod.replace('_', ' ')}</td>
                              <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                                {exp.receiptRef || exp.expenseNumber}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#fb7185' }}>
                                - {formatETB(exp.amountNet)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '12px' }}>
                      No direct expenses logged for this order yet (e.g. crane rental, delivery fuel, site installation per-diem).
                    </div>
                  )}
                </div>

                {/* 2. Logged Order Wastage / Scrap Table */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trash2 size={16} color="#ef4444" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                        Logged Scrap & Material Wastage for {selectedOrder.orderNumber} ({orderWastages.length})
                      </span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => setShowLogWastageModal(true)}
                    >
                      <PlusCircle size={12} />
                      <span>+ Log Order Wastage</span>
                    </button>
                  </div>

                  {orderWastages.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table" style={{ fontSize: '0.75rem', width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Scrapped Material</th>
                            <th>Quantity</th>
                            <th>Defect Reason</th>
                            <th>Unit Cost</th>
                            <th style={{ textAlign: 'right' }}>Scrap Loss ETB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderWastages.map((wst) => (
                            <tr key={wst.id}>
                              <td>{wst.date}</td>
                              <td style={{ color: '#ffffff', fontWeight: 600 }}>{wst.itemName}</td>
                              <td>
                                {wst.quantity} {wst.unit}
                              </td>
                              <td>
                                <span className="badge badge-warning" style={{ fontSize: '0.675rem' }}>
                                  {wst.reason.replace('_', ' ')}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)' }}>{formatETB(wst.unitCost)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                                - {formatETB(wst.totalCost)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '12px' }}>
                      Zero material wastage or defect scrap recorded for this order. Clean production run!
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                  onClick={() => setShowLogExpenseModal(true)}
                >
                  <Receipt size={13} />
                  <span>+ Log Expense</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#fda4af', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                  onClick={() => setShowLogWastageModal(true)}
                >
                  <Trash2 size={13} />
                  <span>+ Log Wastage</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}
                  onClick={() => {
                    setNewDesignTargetOrderId(selectedOrder.id);
                    setShowNewDesignModal(true);
                  }}
                >
                  <Palette size={13} />
                  <span>+ Attach Design</span>
                </button>

                {selectedWOs.length > 0 && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setTargetWoForHours(selectedWOs[0]);
                        setShowAddHoursModal(true);
                      }}
                    >
                      <Clock size={13} />
                      <span>Log Hours</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setTargetWoForBom(selectedWOs[0]);
                        setShowIssueBomModal(true);
                      }}
                    >
                      <Boxes size={13} />
                      <span>Issue Material to BOM</span>
                    </button>
                  </>
                )}

                <Link
                  href="/sales"
                  className="btn btn-primary btn-sm"
                  style={{ marginLeft: 'auto' }}
                >
                  <span>Proceed to Invoicing</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Cog size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3>Select an Order to Inspect Profitability</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Click any customer order from the left column to view its live financial cost rollup, BOM issues, and margin waterfall.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GRAPHIC DESIGN PROOFING & ARTWORK SIGN-OFF HUB     */}
      {/* ========================================================= */}
      {activeTab === 'designs' && (
        <div>
          {/* Status Filters Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Filter Status:</span>
              {(['all', 'client_proofing', 'revision_requested', 'approved', 'drafting'] as const).map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${designStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                  onClick={() => setDesignStatusFilter(st)}
                >
                  {st === 'all'
                    ? `All Proofs (${designProofs.length})`
                    : st === 'client_proofing'
                    ? `Awaiting Sign-off (${designProofs.filter((d) => d.status === 'client_proofing').length})`
                    : st === 'revision_requested'
                    ? `Revisions (${designProofs.filter((d) => d.status === 'revision_requested').length})`
                    : st === 'approved'
                    ? `Approved (${designProofs.filter((d) => d.status === 'approved').length})`
                    : `Drafting (${designProofs.filter((d) => d.status === 'drafting').length})`}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewDesignModal(true)}
            >
              <PlusCircle size={14} />
              <span>+ Upload New Artwork Proof</span>
            </button>
          </div>

          {/* Grid of Design Proof Cards */}
          {filteredProofs.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredProofs.map((proof) => (
                <DesignProofCard
                  key={proof.id}
                  proof={proof}
                  onViewSpecs={(p) => setInspectingProof(p)}
                  onApprove={(p) => setApprovingProof(p)}
                  onRequestRevision={(p) => setRevisingProof(p)}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Palette size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3>No Design Proofs Found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                No artwork proofs match your active search or filter. Create a new proof or clear filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SHOPFLOOR WORK ORDERS & MULTI-ITEM BOM            */}
      {/* ========================================================= */}
      {activeTab === 'work_orders' && (
        <div>
          {/* Station Filters Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Station Filter:</span>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 12px' }}
                value={woStationFilter}
                onChange={(e) => setWoStationFilter(e.target.value)}
              >
                <option value="all">All Workshop Machine Stations ({workOrders.length})</option>
                <option value="Roland Wide-Format Eco-Solvent Printer">
                  Roland Wide-Format Eco-Solvent Printer
                </option>
                <option value="Laser Cutter & Channel Bending Station #1">
                  Laser Cutter & Channel Bending Station #1
                </option>
                <option value="Roland Wide-Format Eco-Solvent Printer & MIG Welding Bay">
                  Roland Eco-Solvent & MIG Welding Bay
                </option>
                <option value="Graphtec Vinyl Cutting Plotter & Mutoh Eco-Solvent">
                  Graphtec Vinyl Cutting Plotter & Laminator
                </option>
              </select>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNewWoModal(true)}
            >
              <Cog size={14} color="#38bdf8" />
              <span>+ Schedule Production Work Order</span>
            </button>
          </div>

          {/* Grid of Work Order Cards */}
          {filteredWorkOrders.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredWorkOrders.map((wo) => {
                const linkedProof = designProofs.find(
                  (d) => d.id === wo.designProofId || d.customerOrderId === wo.customerOrderId
                );

                return (
                  <WorkOrderCard
                    key={wo.id}
                    workOrder={wo}
                    designProof={linkedProof}
                    formatETB={formatETB}
                    onAdvanceStatus={(woId, status) => {
                      advanceWorkOrderStatus(woId, status);
                      showToast(`Work Order ${wo.workOrderNumber} status advanced to ${status.replace('_', ' ')}!`);
                    }}
                    onAddHours={(target) => {
                      setTargetWoForHours(target);
                      setShowAddHoursModal(true);
                    }}
                    onIssueBom={(target) => {
                      setTargetWoForBom(target);
                      setShowIssueBomModal(true);
                    }}
                    onLogScrap={(target) => setScrapTargetWo(target)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Cog size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3>No Work Orders Found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                No active work orders match your search criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NEW CUSTOMER ORDER                               */}
      {/* ========================================================= */}
      {showNewOrderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#818cf8" />
                <h3>Create New Customer Job Order</h3>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer / Client *</label>
                  <select
                    className="form-select"
                    value={newOrderForm.customerId}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerId: e.target.value })}
                    required
                  >
                    {customers.map((c) => {
                      const avail = c.creditLimit - c.outstandingBalance;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} — Avail. Credit: {formatETB(avail)} (Limit: {formatETB(c.creditLimit)})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {isOverCredit && (
                  <div
                    style={{
                      background: 'rgba(244, 63, 94, 0.15)',
                      border: '1px solid #f43f5e',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: '#fca5a5',
                    }}
                  >
                    <ShieldAlert size={16} />
                    <span>
                      Order amount ({formatETB(newOrderForm.quantity * newOrderForm.unitPrice)}) exceeds available credit limit ({formatETB(availableCredit)})! Executive override required.
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Awash Bank ATM Signage Branding..."
                    className="form-input"
                    value={newOrderForm.title}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={newOrderForm.quantity}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, quantity: parseInt(e.target.value) || 1 })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Agreed Unit Selling Price (ETB) *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={newOrderForm.unitPrice}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, unitPrice: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Expected Delivery Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newOrderForm.expectedDeliveryDate}
                      onChange={(e) =>
                        setNewOrderForm({ ...newOrderForm, expectedDeliveryDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={newOrderForm.priority}
                      onChange={(e) =>
                        setNewOrderForm({
                          ...newOrderForm,
                          priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent',
                        })
                      }
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Rush</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Notes / Specifications</label>
                  <textarea
                    rows={2}
                    placeholder="Technical specifications, mounting hardware..."
                    className="form-textarea"
                    value={newOrderForm.notes}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                  />
                </div>

                {/* 1-to-Many: Link Site Surveys & Dimensions Section */}
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ruler size={16} color="#38bdf8" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                        Link Site Surveys & Dimensions ({newOrderForm.siteSurveyIds.length} Selected)
                      </span>
                    </div>

                    {availableCustomerSurveys.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (newOrderForm.siteSurveyIds.length === availableCustomerSurveys.length) {
                            setNewOrderForm({ ...newOrderForm, siteSurveyIds: [] });
                          } else {
                            setNewOrderForm({
                              ...newOrderForm,
                              siteSurveyIds: availableCustomerSurveys.map((s) => s.id),
                            });
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {newOrderForm.siteSurveyIds.length === availableCustomerSurveys.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Select one or more measured signboards/facades to link to this order. The physical dimensions, depths, and electrical access will be passed to Design and Production BOM.
                  </p>

                  {availableCustomerSurveys.length === 0 ? (
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        color: 'var(--text-dim)',
                        fontStyle: 'italic',
                      }}
                    >
                      No recorded site surveys for this client yet. You can still create this order and link site surveys later, or add them via CRM.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '190px', overflowY: 'auto' }}>
                      {availableCustomerSurveys.map((srv) => {
                        const isChecked = newOrderForm.siteSurveyIds.includes(srv.id);
                        const area = (srv.widthMeters * srv.heightMeters).toFixed(1);
                        return (
                          <label
                            key={srv.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '10px 12px',
                              background: isChecked ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-app)',
                              border: isChecked ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...newOrderForm.siteSurveyIds, srv.id]
                                  : newOrderForm.siteSurveyIds.filter((id) => id !== srv.id);
                                setNewOrderForm({ ...newOrderForm, siteSurveyIds: nextIds });
                              }}
                              style={{ marginTop: '3px' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                                  {srv.title}
                                </span>
                                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                                  {srv.widthMeters}m × {srv.heightMeters}m ({area} m²)
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span>📍 {srv.locationAddress}</span>
                                <span>• Type: {srv.signageType?.replace('_', ' ') || 'Signage'}</span>
                                {srv.depthMeters ? <span>• Depth: {srv.depthMeters}m</span> : null}
                                <span>• Elev: {srv.installationHeightMeters}m</span>
                                <span>• {srv.powerSourceAvailable ? '⚡ Power Source Ready' : '⚠️ No Direct Power'}</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewOrderModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Customer Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SCHEDULE WORK ORDER (MULTI-ITEM BOM)             */}
      {/* ========================================================= */}
      {showNewWoModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cog size={20} color="#38bdf8" />
                <h3>Schedule Work Order & Bill of Materials</h3>
              </div>
              <button
                onClick={() => setShowNewWoModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateWorkOrder}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Order *</label>
                  <select
                    className="form-select"
                    value={newWoForm.customerOrderId}
                    onChange={(e) => {
                      setNewWoForm({ ...newWoForm, customerOrderId: e.target.value });
                      const ord = orders.find((o) => o.id === e.target.value);
                      if (ord) setNewWoForm((prev) => ({ ...prev, productDescription: ord.title }));
                    }}
                    required
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.customerName} ({o.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Center / Machine Station *</label>
                  <select
                    className="form-select"
                    value={newWoForm.workCenterMachine}
                    onChange={(e) => setNewWoForm({ ...newWoForm, workCenterMachine: e.target.value })}
                  >
                    <option value="Roland Wide-Format Eco-Solvent Printer">
                      Roland Wide-Format Eco-Solvent Printer
                    </option>
                    <option value="Laser Cutter & Channel Bending Station #1">
                      Laser Cutter & Channel Bending Station #1
                    </option>
                    <option value="Graphtec Vinyl Cutting Plotter & Laminator">
                      Graphtec Vinyl Cutting Plotter & Laminator
                    </option>
                    <option value="MIG Welding & Structural Steel Assembly Bay">
                      MIG Welding & Structural Steel Assembly Bay
                    </option>
                    <option value="Signage Assembly & LED Wiring Bench">
                      Signage Assembly & LED Wiring Bench
                    </option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Planned Machine Hours</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={newWoForm.machineHours}
                      onChange={(e) =>
                        setNewWoForm({ ...newWoForm, machineHours: parseInt(e.target.value) || 1 })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Machine Hourly Rate (ETB/hr)</label>
                    <input
                      type="number"
                      min="100"
                      className="form-input"
                      value={newWoForm.machineHourlyRate}
                      onChange={(e) =>
                        setNewWoForm({ ...newWoForm, machineHourlyRate: parseFloat(e.target.value) || 500 })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Multi-Item Bill of Materials Builder */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>
                      Allocated Raw Materials (BOM)
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      onClick={() =>
                        setNewWoForm({
                          ...newWoForm,
                          selectedItems: [
                            ...newWoForm.selectedItems,
                            { itemId: items[2]?.id || items[0]?.id || '', plannedQty: 10 },
                          ],
                        })
                      }
                    >
                      + Add Material Line
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {newWoForm.selectedItems.map((si, idx) => {
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr auto',
                            gap: '10px',
                            alignItems: 'center',
                          }}
                        >
                          <select
                            className="form-select"
                            value={si.itemId}
                            onChange={(e) => {
                              const updated = [...newWoForm.selectedItems];
                              updated[idx].itemId = e.target.value;
                              setNewWoForm({ ...newWoForm, selectedItems: updated });
                            }}
                          >
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.name} ({it.unit}) — Stock: {it.currentStock}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min="0.5"
                            step="any"
                            placeholder="Qty"
                            className="form-input"
                            value={si.plannedQty}
                            onChange={(e) => {
                              const updated = [...newWoForm.selectedItems];
                              updated[idx].plannedQty = parseFloat(e.target.value) || 1;
                              setNewWoForm({ ...newWoForm, selectedItems: updated });
                            }}
                          />

                          {newWoForm.selectedItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = newWoForm.selectedItems.filter((_, i) => i !== idx);
                                setNewWoForm({ ...newWoForm, selectedItems: updated });
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fb7185',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewWoModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Schedule WO & Issue Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: LOG EXTRA MACHINE HOURS                          */}
      {/* ========================================================= */}
      {showAddHoursModal && targetWoForHours && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Log Machine Operating Hours</h3>
              <button
                onClick={() => setShowAddHoursModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Adding operating hours increases the machine runtime cost ({formatETB(targetWoForHours.machineHourlyRate)}/hr) and direct labor hours for {targetWoForHours.workOrderNumber}.
              </p>

              <div className="form-group">
                <label className="form-label">Additional Hours Logged</label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  className="form-input"
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddHoursModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAddHours(targetWoForHours.id)}
              >
                Log Hours & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ISSUE SUPPLEMENTAL BOM MATERIAL                  */}
      {/* ========================================================= */}
      {showIssueBomModal && targetWoForBom && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Issue Supplemental BOM Material</h3>
              <button
                onClick={() => setShowIssueBomModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Transfer raw materials from store inventory to {targetWoForBom.workOrderNumber} and update the job&apos;s direct material cost.
              </p>

              <div className="form-group">
                <label className="form-label">Material / Item *</label>
                <select
                  className="form-select"
                  value={issueBomItemId}
                  onChange={(e) => setIssueBomItemId(e.target.value)}
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} — Current: {it.currentStock} {it.unit} (@ {formatETB(it.purchasePrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Issue *</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  className="form-input"
                  value={issueBomQty}
                  onChange={(e) => setIssueBomQty(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowIssueBomModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleIssueExtraMaterial(targetWoForBom.id)}
              >
                Issue to Job & Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: INSPECT DESIGN SPECS                             */}
      {/* ========================================================= */}
      <DesignSpecsModal
        proof={inspectingProof}
        onClose={() => setInspectingProof(null)}
        onApprove={(p) => setApprovingProof(p)}
        onRequestRevision={(p) => setRevisingProof(p)}
      />

      {/* ========================================================= */}
      {/* MODAL 6: APPROVE PROOF & UNLOCK PRODUCTION                */}
      {/* ========================================================= */}
      <ApproveProofModal
        proof={approvingProof}
        onClose={() => setApprovingProof(null)}
        onConfirmApprove={handleConfirmApproveProof}
      />

      {/* ========================================================= */}
      {/* MODAL 7: REQUEST REVISION MODAL                           */}
      {/* ========================================================= */}
      <RequestRevisionModal
        proof={revisingProof}
        onClose={() => setRevisingProof(null)}
        onConfirmRevision={handleConfirmRevisionProof}
      />

      {/* ========================================================= */}
      {/* MODAL 8: NEW DESIGN PROOF MODAL                           */}
      {/* ========================================================= */}
      {showNewDesignModal && (
        <NewDesignProofModal
          orders={orders}
          initialOrderId={newDesignTargetOrderId || selectedOrderId}
          onClose={() => {
            setShowNewDesignModal(false);
            setNewDesignTargetOrderId(undefined);
          }}
          onCreateProof={(proofData) => {
            const created = createDesignProof(proofData);
            showToast(`Created artwork proof ${created.designNumber} for ${created.customerName}!`);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 9: LOG WORK ORDER SCRAP                             */}
      {/* ========================================================= */}
      <LogScrapModal
        workOrder={scrapTargetWo}
        items={items}
        onClose={() => setScrapTargetWo(null)}
        onConfirmScrap={handleConfirmScrap}
      />

      {/* ========================================================= */}
      {/* MODAL 10: LOG ORDER DIRECT EXPENSE                        */}
      {/* ========================================================= */}
      <LogOrderExpenseModal
        isOpen={showLogExpenseModal}
        order={selectedOrder || null}
        onClose={() => setShowLogExpenseModal(false)}
        onConfirmExpense={handleConfirmOrderExpense}
      />

      {/* ========================================================= */}
      {/* MODAL 11: LOG ORDER DIRECT WASTAGE / SCRAP                */}
      {/* ========================================================= */}
      <LogOrderWastageModal
        isOpen={showLogWastageModal}
        order={selectedOrder || null}
        workOrders={selectedWOs}
        items={items}
        onClose={() => setShowLogWastageModal(false)}
        onConfirmWastage={handleConfirmOrderWastage}
      />

      {/* ========================================================= */}
      {/* MODAL 12: MANAGE ORDER LINKED SITE SURVEYS (1-to-many)     */}
      {/* ========================================================= */}
      {showManageSurveysModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ruler size={20} color="#38bdf8" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>
                    Manage Site Surveys for {selectedOrder.orderNumber}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Client: {selectedOrder.customerName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowManageSurveysModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Select which architectural site surveys / signboards are included in this production order. Multiple signboards can be linked to one order.
              </p>

              {availableForEditSurveys.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <AlertCircle size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                    No Site Surveys Found for {selectedOrder.customerName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    You can record site surveys with physical dimensions in the CRM module.
                  </div>
                  <Link
                    href="/crm?tab=surveys"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Go to CRM Survey Center →</span>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                  {availableForEditSurveys.map((survey) => {
                    const isChecked = editOrderSurveyIds.includes(survey.id);
                    const area = (survey.widthMeters * survey.heightMeters).toFixed(2);
                    return (
                      <label
                        key={survey.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 14px',
                          background: isChecked ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-app)',
                          border: isChecked ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...editOrderSurveyIds, survey.id]
                              : editOrderSurveyIds.filter((id) => id !== survey.id);
                            setEditOrderSurveyIds(next);
                          }}
                          style={{ marginTop: '4px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                              {survey.title}
                            </span>
                            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                              {survey.widthMeters}m × {survey.heightMeters}m ({area} m²)
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            📍 {survey.locationAddress} • {survey.indoorOutdoor.toUpperCase()} • Elev: {survey.installationHeightMeters}m
                            {survey.depthMeters ? ` • Depth: ${survey.depthMeters}m` : ''}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: survey.powerSourceAvailable ? '#34d399' : '#f59e0b', marginTop: '2px' }}>
                            {survey.powerSourceAvailable ? '⚡ 220V Power Ready' : '⚠️ No Direct Power'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowManageSurveysModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveOrderSurveys}
              >
                Save Linked Surveys ({editOrderSurveyIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          Loading Order & Production Desk...
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
