'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { CustomerOrder, WorkOrder, OrderStatus } from '@/types/erp';

export default function OrdersPage() {
  const {
    orders,
    workOrders,
    customers,
    items,
    employees,
    wastages,
    expenses,
    invoices,
    createCustomerOrder,
    createWorkOrder,
    updateWorkOrder,
    updateOrderStatus,
    calculateOrderProfitability,
    allOrderProfitability,
    addStockMovement,
    recordWastage,
  } = useErp();

  // Active Tab: 'orders' | 'work_orders'
  const [activeTab, setActiveTab] = useState<'orders' | 'work_orders'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');

  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewWoModal, setShowNewWoModal] = useState(false);
  const [showAddHoursModal, setShowAddHoursModal] = useState(false);
  const [showIssueBomModal, setShowIssueBomModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    customerId: customers[0]?.id || '',
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 50000,
    expectedDeliveryDate: '2026-10-30',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    notes: '',
  });

  // New Work Order Form State
  const [newWoForm, setNewWoForm] = useState({
    customerOrderId: orders[0]?.id || '',
    productDescription: '',
    plannedQty: 1,
    workCenterMachine: 'Roland Wide-Format Eco-Solvent Printer',
    operatorNames: ['Ermias Kebede'],
    machineHourlyRate: 650,
    machineHours: 12,
    selectedItemId: items[0]?.id || '',
    bomPlannedQty: 20,
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
  const selectedWastage = wastages.filter((w) => w.orderId === selectedOrderId);
  const selectedExpenses = expenses.filter((e) => e.orderId === selectedOrderId);
  const selectedInvoice = invoices.find((i) => i.customerOrderId === selectedOrderId);

  // Customer Credit Limit check for New Order
  const targetCustomer = customers.find((c) => c.id === newOrderForm.customerId);
  const availableCredit = targetCustomer
    ? targetCustomer.creditLimit - targetCustomer.outstandingBalance
    : 0;
  const isOverCredit = newOrderForm.quantity * newOrderForm.unitPrice > availableCredit;

  // Handle New Order Submit
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
    });

    setShowNewOrderModal(false);
    setSelectedOrderId(created.id);
    setNotification(`Order ${created.orderNumber} placed for ${targetCustomer.name}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Create Work Order
  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parentOrder = orders.find((o) => o.id === newWoForm.customerOrderId);
    const bomItem = items.find((i) => i.id === newWoForm.selectedItemId);
    if (!parentOrder || !bomItem) return;

    createWorkOrder({
      customerOrderId: parentOrder.id,
      orderNumber: parentOrder.orderNumber,
      customerName: parentOrder.customerName,
      productDescription: newWoForm.productDescription || parentOrder.title,
      plannedQty: newWoForm.plannedQty,
      startDate: '2026-10-18',
      workCenterMachine: newWoForm.workCenterMachine,
      operatorNames: newWoForm.operatorNames,
      machineHours: newWoForm.machineHours,
      machineHourlyRate: newWoForm.machineHourlyRate,
      bomItems: [
        {
          itemId: bomItem.id,
          itemName: bomItem.name,
          plannedQty: newWoForm.bomPlannedQty,
          actualIssuedQty: newWoForm.bomPlannedQty,
          unit: bomItem.unit,
          unitCost: bomItem.purchasePrice,
          totalCost: newWoForm.bomPlannedQty * bomItem.purchasePrice,
        },
      ],
    });

    // Also deduct stock for the issued BOM items
    addStockMovement({
      itemId: bomItem.id,
      fromStoreId: 'store-1',
      toStoreId: 'store-2',
      movementType: 'production_issue',
      quantity: newWoForm.bomPlannedQty,
      referenceType: 'WORK_ORDER',
      notes: `Issued for production of ${parentOrder.orderNumber}`,
    });

    setShowNewWoModal(false);
    setNotification(
      `Work Order scheduled & ${newWoForm.bomPlannedQty} ${bomItem.unit} material issued to production hall!`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Add Machine Hours
  const handleAddHours = (woId: string) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo) return;

    const newHours = wo.machineHours + hoursToAdd;
    updateWorkOrder(woId, { machineHours: newHours });
    setShowAddHoursModal(false);
    setNotification(
      `Logged ${hoursToAdd} additional hours on ${wo.workOrderNumber}. Order costing recalculated!`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Issue Extra Material to WO
  const handleIssueExtraMaterial = (woId: string) => {
    const wo = workOrders.find((w) => w.id === woId);
    const item = items.find((i) => i.id === issueBomItemId);
    if (!wo || !item || issueBomQty <= 0) return;

    // Check if item already in BOM
    const existingIndex = wo.bomItems.findIndex((b) => b.itemId === item.id);
    let updatedBom = [...wo.bomItems];

    if (existingIndex >= 0) {
      const existing = updatedBom[existingIndex];
      const newActual = (existing.actualIssuedQty || existing.plannedQty) + issueBomQty;
      updatedBom[existingIndex] = {
        ...existing,
        actualIssuedQty: newActual,
        totalCost: newActual * existing.unitCost,
      };
    } else {
      updatedBom.push({
        itemId: item.id,
        itemName: item.name,
        plannedQty: issueBomQty,
        actualIssuedQty: issueBomQty,
        unit: item.unit,
        unitCost: item.purchasePrice,
        totalCost: issueBomQty * item.purchasePrice,
      });
    }

    // Update Work order
    updateWorkOrder(woId, { bomItems: updatedBom });

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
    setNotification(
      `Issued ${issueBomQty} ${item.unit} of ${item.name} to ${wo.workOrderNumber}. Material cost updated!`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPipelineRevenue = orders.reduce((sum, o) => sum + o.totalAgreedPrice, 0);
  const activeWOCount = workOrders.filter((w) => w.status === 'in_progress').length;

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
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
                color: '#818cf8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Order & Work Order Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Core Profitability Waterfall
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Customer Jobs, BOMs & Cost Breakdown</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNewWoModal(true)}
          >
            <Cog size={14} />
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

      {/* Primary KPI Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-title">
            <span>Total Orders Pipeline</span>
            <TrendingUp size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{formatETB(totalPipelineRevenue)}</div>
          <div className="stat-card-subtext">
            <span>{orders.length} customer contracts (excl. VAT)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Active Work Orders</span>
            <Cog size={16} color="#38bdf8" />
          </div>
          <div className="stat-card-value" style={{ color: '#38bdf8' }}>
            {activeWOCount} In Production
          </div>
          <div className="stat-card-subtext">
            <span>{workOrders.length} total scheduled work orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Top Performing Job</span>
            <Sparkles size={16} color="#34d399" />
          </div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            68.7% Margin
          </div>
          <div className="stat-card-subtext">
            <span>Awash Bank 3D Signage (329.6k ETB profit)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Factory Scrap / Wastage</span>
            <Trash2 size={16} color="#fb7185" />
          </div>
          <div className="stat-card-value" style={{ color: '#fb7185' }}>
            {formatETB(wastages.reduce((sum, w) => sum + w.totalCost, 0))}
          </div>
          <div className="stat-card-subtext">
            <span>Directly attributed to individual work orders</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Split Screen (Left: Order List, Right: Profitability Deep-Dive) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: ORDERS LIST & WORK ORDERS */}
        <div>
          {/* Sub Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'orders' ? '2px solid #6366f1' : '2px solid transparent',
                color: activeTab === 'orders' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'orders' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('work_orders')}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'work_orders' ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === 'work_orders' ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: activeTab === 'work_orders' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Shopfloor Work Orders ({workOrders.length})
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
            <Search
              size={15}
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
              placeholder="Search by order #, client, or job title..."
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* TAB 1: CUSTOMER ORDERS LIST */}
          {activeTab === 'orders' && (
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

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                      border: isSelected
                        ? '1px solid #6366f1'
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

                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Client: <strong>{ord.customerName}</strong>
                    </div>

                    {/* Bottom Mini Metrics */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '10px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-dim)' }}>Revenue: </span>
                        <strong style={{ color: '#ffffff' }}>{formatETB(ord.totalAgreedPrice)}</strong>
                      </div>

                      {p && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Profit: </span>
                          <strong style={{ color: marginColor }}>
                            {formatETB(p.orderProfit)} ({p.profitMarginPct.toFixed(1)}%)
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: WORK ORDERS LIST */}
          {activeTab === 'work_orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workOrders.map((wo) => {
                const parent = orders.find((o) => o.id === wo.customerOrderId);

                return (
                  <div
                    key={wo.id}
                    onClick={() => parent && setSelectedOrderId(parent.id)}
                    style={{
                      background: parent?.id === selectedOrderId ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                      border: parent?.id === selectedOrderId ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 18px',
                      cursor: 'pointer',
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
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>{wo.workOrderNumber}</span>
                      <span
                        className={`badge ${
                          wo.status === 'completed'
                            ? 'badge-emerald'
                            : wo.status === 'in_progress'
                            ? 'badge-cyan'
                            : 'badge-gray'
                        }`}
                      >
                        {wo.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                      {wo.productDescription}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Machine: {wo.workCenterMachine} • Operators: {wo.operatorNames.join(', ')}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '8px',
                        fontSize: '0.775rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>
                        Logged: <strong>{wo.machineHours} machine hours</strong>
                      </span>
                      <span style={{ color: '#a5b4fc' }}>Linked: {wo.orderNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ORDER PROFITABILITY WATERFALL (THE CENTERPIECE) */}
        {selectedOrder && selectedProfitability ? (
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            {/* Order Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '16px',
                marginBottom: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>
                    {selectedOrder.orderNumber}
                  </span>
                  <span
                    className={`badge ${
                      selectedOrder.status === 'paid'
                        ? 'badge-emerald'
                        : selectedOrder.status === 'invoiced'
                        ? 'badge-primary'
                        : selectedOrder.status === 'in_production'
                        ? 'badge-amber'
                        : 'badge-gray'
                    }`}
                  >
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.2rem', marginTop: '4px' }}>{selectedOrder.title}</h2>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Customer: <strong>{selectedOrder.customerName}</strong> (TIN: {selectedOrder.customerTin})
                </div>
              </div>

              {/* Status Workflow Action */}
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
                {/* 1. Revenue */}
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

                {/* 2. Direct Materials */}
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

                {/* 3. Direct Labor */}
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

                {/* 4. Machine Runtime Cost */}
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

                {/* 5. Scrap / Wastage */}
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
                  <span>Material Wastage / Scrap Incurred:</span>
                  <span
                    style={{
                      color: selectedProfitability.wastageCost > 0 ? '#fb7185' : 'var(--text-dim)',
                      fontWeight: selectedProfitability.wastageCost > 0 ? 600 : 400,
                    }}
                  >
                    - {formatETB(selectedProfitability.wastageCost)}
                  </span>
                </div>

                {/* 6. Order Specific Transport / Installation */}
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
                  <span>Order-Specific Transport & Scaffolding:</span>
                  <span style={{ color: '#fb7185' }}>
                    - {formatETB(selectedProfitability.orderTransportCost)}
                  </span>
                </div>

                {/* 7. Factory Overhead Allocation */}
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

            {/* Interactive Job Action Controls */}
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
              {selectedWOs.length > 0 && (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddHoursModal(true)}
                  >
                    <Clock size={13} />
                    <span>Log Machine Hours</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowIssueBomModal(true)}
                  >
                    <Boxes size={13} />
                    <span>Issue Material to BOM</span>
                  </button>
                </>
              )}

              {/* Link to generate invoice in Sales */}
              <Link
                href="/dashboard/sales"
                className="btn btn-primary btn-sm"
                style={{ marginLeft: 'auto' }}
              >
                <span>Proceed to Invoicing</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Sub-Section: Materials Issued in BOM */}
            {selectedWOs.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Bill of Materials (BOM) Issued
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedWOs.flatMap((w) => w.bomItems).map((bi, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '4px',
                        fontSize: '0.785rem',
                      }}
                    >
                      <span>{bi.itemName}</span>
                      <span>
                        <strong>{bi.actualIssuedQty || bi.plannedQty} {bi.unit}</strong> @ {formatETB(bi.unitCost)} = {formatETB(bi.totalCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* MODAL 1: NEW CUSTOMER ORDER */}
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

                {/* Credit Limit Alert if Exceeded */}
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

      {/* MODAL 2: SCHEDULE WORK ORDER */}
      {showNewWoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Order *</label>
                  <select
                    className="form-select"
                    value={newWoForm.customerOrderId}
                    onChange={(e) => setNewWoForm({ ...newWoForm, customerOrderId: e.target.value })}
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
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

                {/* Primary BOM Item Allocation */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', marginBottom: '8px' }}>
                    Primary Bill of Materials (BOM) Item Issue
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Raw Material from Store</label>
                    <select
                      className="form-select"
                      value={newWoForm.selectedItemId}
                      onChange={(e) => setNewWoForm({ ...newWoForm, selectedItemId: e.target.value })}
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} — Current Stock: {it.currentStock} {it.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Issue Quantity to Work Order</label>
                    <input
                      type="number"
                      min="0.5"
                      step="any"
                      className="form-input"
                      value={newWoForm.bomPlannedQty}
                      onChange={(e) =>
                        setNewWoForm({ ...newWoForm, bomPlannedQty: parseFloat(e.target.value) || 1 })
                      }
                      required
                    />
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

      {/* MODAL 3: LOG EXTRA MACHINE HOURS */}
      {showAddHoursModal && selectedWOs[0] && (
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
                Adding operating hours increases the machine runtime cost ({formatETB(selectedWOs[0].machineHourlyRate)}/hr) and direct labor hours for {selectedWOs[0].workOrderNumber}.
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
                onClick={() => handleAddHours(selectedWOs[0].id)}
              >
                Log Hours & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISSUE SUPPLEMENTAL BOM MATERIAL */}
      {showIssueBomModal && selectedWOs[0] && (
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
                Transfer raw materials from store inventory to {selectedWOs[0].workOrderNumber} and update the job's direct material cost.
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
                onClick={() => handleIssueExtraMaterial(selectedWOs[0].id)}
              >
                Issue to Job & Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
