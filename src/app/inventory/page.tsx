'use client';

import React, { useState } from 'react';
import { useErp } from '@/context/ErpDataContext';
import {
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Warehouse,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { MovementType, WastageReason, UnitOfMeasure } from '@/types/erp';

export default function InventoryPage() {
  const {
    items,
    stores,
    stockMovements,
    wastages,
    lowStockItems,
    orders,
    addStockMovement,
    recordWastage,
  } = useErp();

  // Active Tab: 'catalog' | 'low_stock' | 'movements' | 'wastage'
  const [activeTab, setActiveTab] = useState<'catalog' | 'low_stock' | 'movements' | 'wastage'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');

  // Modals
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showWastageModal, setShowWastageModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Movement Form State
  const [movementForm, setMovementForm] = useState<{
    itemId: string;
    movementType: MovementType;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    notes: string;
  }>({
    itemId: items[0]?.id || '',
    movementType: 'transfer',
    fromStoreId: stores[0]?.id || '',
    toStoreId: stores[1]?.id || '',
    quantity: 10,
    notes: '',
  });

  // Wastage Form State
  const [wastageForm, setWastageForm] = useState<{
    itemId: string;
    storeId: string;
    quantity: number;
    reason: WastageReason;
    orderId: string;
    notes: string;
  }>({
    itemId: items[0]?.id || '',
    storeId: stores[1]?.id || stores[0]?.id || '',
    quantity: 1,
    reason: 'production_scrap',
    orderId: orders[0]?.id || '',
    notes: '',
  });

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const totalInventoryValuation = items.reduce(
    (sum, item) => sum + item.currentStock * item.purchasePrice,
    0
  );

  const totalWastageLoss = wastages.reduce((sum, w) => sum + w.totalCost, 0);

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.amharicName && item.amharicName.includes(searchQuery));

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle Submit Movement
  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.itemId || movementForm.quantity <= 0) return;

    addStockMovement({
      itemId: movementForm.itemId,
      fromStoreId:
        movementForm.movementType === 'purchase_receipt' ? undefined : movementForm.fromStoreId,
      toStoreId:
        movementForm.movementType === 'sales_issue' || movementForm.movementType === 'wastage'
          ? undefined
          : movementForm.toStoreId,
      movementType: movementForm.movementType,
      quantity: Number(movementForm.quantity),
      referenceType: 'ADJUSTMENT',
      notes: movementForm.notes,
    });

    setShowMovementModal(false);
    setNotification('Stock movement recorded and inventory balances updated successfully!');
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Submit Wastage
  const handleRecordWastage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wastageForm.itemId || wastageForm.quantity <= 0) return;

    recordWastage({
      itemId: wastageForm.itemId,
      storeId: wastageForm.storeId,
      quantity: Number(wastageForm.quantity),
      reason: wastageForm.reason,
      orderId: wastageForm.orderId || undefined,
      notes: wastageForm.notes,
    });

    setShowWastageModal(false);
    setNotification('Material wastage logged and tagged into job cost calculation!');
    setTimeout(() => setNotification(null), 3500);
  };

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
                color: '#06b6d4',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Inventory & Stores Management
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Multi-Warehouse & Ledger
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Raw Materials, Stock Balances & Scrap</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowMovementModal(true)}
          >
            <ArrowRightLeft size={14} />
            <span>Record Movement</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowWastageModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.35)',
            }}
          >
            <Trash2 size={14} />
            <span>Log Wastage / Scrap</span>
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

      {/* KPI Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-title">
            <span>Total Stock Valuation</span>
            <Boxes size={16} color="#06b6d4" />
          </div>
          <div className="stat-card-value">{formatETB(totalInventoryValuation)}</div>
          <div className="stat-card-subtext">
            <span>Based on verified purchase cost across all stores</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Active SKUs Catalog</span>
            <Warehouse size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{items.length} Items</div>
          <div className="stat-card-subtext">
            <span>{stores.length} Multi-Store Locations (Main, Floor, FG)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Low-Stock Alerts</span>
            <AlertTriangle size={16} color="var(--amber)" />
          </div>
          <div
            className="stat-card-value"
            style={{ color: lowStockItems.length > 0 ? '#fbbf24' : 'var(--text-main)' }}
          >
            {lowStockItems.length} SKUs Alert
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#fbbf24' }}>
              {lowStockItems[0]?.item.name.split(' ')[0] || 'None'} below safety threshold
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Recorded Wastage & Scrap</span>
            <Trash2 size={16} color="#fb7185" />
          </div>
          <div className="stat-card-value" style={{ color: '#fb7185' }}>
            {formatETB(totalWastageLoss)}
          </div>
          <div className="stat-card-subtext">
            <span>{wastages.length} incidents logged (allocated to job costs)</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'catalog' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'catalog' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Boxes size={16} />
          <span>Stock Catalog & Balances</span>
          <span className="badge badge-gray">{items.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('low_stock')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'low_stock' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'low_stock' ? '#fbbf24' : 'var(--text-muted)',
            fontWeight: activeTab === 'low_stock' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} />
          <span>Low-Stock Alerts</span>
          {lowStockItems.length > 0 && (
            <span className="badge badge-amber">{lowStockItems.length}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'movements' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'movements' ? '#67e8f9' : 'var(--text-muted)',
            fontWeight: activeTab === 'movements' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowRightLeft size={16} />
          <span>Movement Ledger</span>
          <span className="badge badge-gray">{stockMovements.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('wastage')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'wastage' ? '2px solid #f43f5e' : '2px solid transparent',
            color: activeTab === 'wastage' ? '#fb7185' : 'var(--text-muted)',
            fontWeight: activeTab === 'wastage' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Trash2 size={16} />
          <span>Wastage & Scrap Ledger</span>
          <span className="badge badge-rose">{wastages.length}</span>
        </button>
      </div>

      {/* TAB 1: CATALOG & BALANCES */}
      {activeTab === 'catalog' && (
        <div className="card">
          {/* Filters Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
                <input
                  type="text"
                  placeholder="Search item code, English or Amharic name..."
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Item Types</option>
                <option value="raw_material">Raw Materials</option>
                <option value="packaging">Packaging</option>
                <option value="finished_good">Finished Goods</option>
                <option value="service">Service</option>
              </select>
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Showing {filteredItems.length} of {items.length} items
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Code & Description</th>
                  <th>Amharic Label</th>
                  <th>Type</th>
                  <th>Main Store</th>
                  <th>Prod Floor</th>
                  <th>Total Balance</th>
                  <th>Unit Cost</th>
                  <th>Valuation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  const mainStoreBal = item.storeBalances['store-1'] || 0;
                  const prodFloorBal = item.storeBalances['store-2'] || 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.code}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {item.amharicName || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-gray">{item.type.replace('_', ' ')}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {mainStoreBal} {item.unit}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {prodFloorBal} {item.unit}
                      </td>
                      <td>
                        <strong style={{ color: isLow ? '#fb7185' : '#ffffff' }}>
                          {item.currentStock} {item.unit}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatETB(item.purchasePrice)}</td>
                      <td>
                        <strong>{formatETB(item.currentStock * item.purchasePrice)}</strong>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-amber">Low Stock</span>
                        ) : (
                          <span className="badge badge-emerald">Healthy</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS */}
      {activeTab === 'low_stock' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Critical Reorder & Safety Stock Triggers</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Formula mandated by architecture: <strong>Expected Days Remaining = Current Stock / Average Daily Usage</strong>.
              Triggers when stock ≤ reorder level or expected days ≤ 5.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Code & Name</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Reorder Quantity</th>
                  <th>Daily Burn Rate</th>
                  <th>Days Remaining</th>
                  <th>Preferred Vendor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(({ item, expectedDays }) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.code}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#fb7185', fontSize: '1rem' }}>
                        {item.currentStock} {item.unit}
                      </strong>
                    </td>
                    <td>
                      {item.reorderLevel} {item.unit}
                    </td>
                    <td>
                      {item.reorderQuantity} {item.unit}
                    </td>
                    <td>
                      {item.averageDailyUsage} {item.unit}/day
                    </td>
                    <td>
                      <span className="badge badge-rose" style={{ fontSize: '0.8rem' }}>
                        {expectedDays.toFixed(1)} Days
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.preferredSupplierName || 'Direct Import'}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setMovementForm((prev) => ({
                            ...prev,
                            itemId: item.id,
                            movementType: 'purchase_receipt',
                            quantity: item.reorderQuantity,
                          }));
                          setShowMovementModal(true);
                        }}
                      >
                        <PlusCircle size={13} />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MOVEMENT LEDGER */}
      {activeTab === 'movements' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3>Stock Movement Audit Ledger</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Immutable movement ledger. Stock balances are strictly derived from these transactions.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMovementModal(true)}>
              <PlusCircle size={14} />
              <span>Record Manual Adjustment</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Movement #</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Source Store</th>
                  <th>Destination Store</th>
                  <th>Quantity</th>
                  <th>Total Cost</th>
                  <th>Reference</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map((mov) => {
                  const typeColors: Record<MovementType, string> = {
                    purchase_receipt: 'badge-emerald',
                    production_receipt: 'badge-emerald',
                    production_issue: 'badge-primary',
                    sales_issue: 'badge-primary',
                    transfer: 'badge-cyan',
                    adjustment: 'badge-amber',
                    wastage: 'badge-rose',
                    return: 'badge-gray',
                  };

                  return (
                    <tr key={mov.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{mov.movementNumber}</strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mov.date}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{mov.itemName}</div>
                      </td>
                      <td>
                        <span className={`badge ${typeColors[mov.movementType] || 'badge-gray'}`}>
                          {mov.movementType.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {mov.fromStoreName || 'Supplier / External'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {mov.toStoreName || 'Customer / Production'}
                      </td>
                      <td>
                        <strong>
                          {mov.quantity} {mov.unit}
                        </strong>
                      </td>
                      <td>{formatETB(mov.totalCost)}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>
                          {mov.referenceNumber || mov.referenceType || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{mov.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WASTAGE & SCRAP LEDGER */}
      {activeTab === 'wastage' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3>Material Wastage & Production Scrap Log</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Every scrap piece is categorized and directly allocated to customer job costing.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowWastageModal(true)}>
              <PlusCircle size={14} />
              <span>Log Wastage Incident</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Material / Item</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Loss</th>
                  <th>Store / Workshop</th>
                  <th>Reason Category</th>
                  <th>Allocated Order</th>
                  <th>Reported By</th>
                </tr>
              </thead>
              <tbody>
                {wastages.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{w.itemName}</div>
                      {w.notes && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          "{w.notes}"
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>
                        {w.quantity} {w.unit}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatETB(w.unitCost)}</td>
                    <td>
                      <strong style={{ color: '#fb7185' }}>{formatETB(w.totalCost)}</strong>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{w.storeName}</td>
                    <td>
                      <span className="badge badge-rose">{w.reason.replace('_', ' ')}</span>
                    </td>
                    <td>
                      {w.orderNumber ? (
                        <span className="badge badge-primary">{w.orderNumber}</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>General Store</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.reportedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD STOCK MOVEMENT */}
      {showMovementModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Stock Movement</h3>
              <button
                onClick={() => setShowMovementModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateMovement}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Material / Item *</label>
                  <select
                    className="form-select"
                    value={movementForm.itemId}
                    onChange={(e) => setMovementForm({ ...movementForm, itemId: e.target.value })}
                    required
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.code}) — Current Stock: {it.currentStock} {it.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Movement Type *</label>
                  <select
                    className="form-select"
                    value={movementForm.movementType}
                    onChange={(e) =>
                      setMovementForm({ ...movementForm, movementType: e.target.value as MovementType })
                    }
                  >
                    <option value="transfer">Inter-Store Transfer (e.g. Main Store → Production Floor)</option>
                    <option value="production_issue">Issue to Production (Raw Material Consumed)</option>
                    <option value="purchase_receipt">Direct Purchase Receipt</option>
                    <option value="adjustment">Count Correction / Inventory Adjustment</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Source Store (From)</label>
                    <select
                      className="form-select"
                      value={movementForm.fromStoreId}
                      onChange={(e) => setMovementForm({ ...movementForm, fromStoreId: e.target.value })}
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Store (To)</label>
                    <select
                      className="form-select"
                      value={movementForm.toStoreId}
                      onChange={(e) => setMovementForm({ ...movementForm, toStoreId: e.target.value })}
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity to Move *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    className="form-input"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Movement Notes / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Issued for Awash Bank Signboard fabrication..."
                    className="form-input"
                    value={movementForm.notes}
                    onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowMovementModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG WASTAGE */}
      {showWastageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={20} color="#fb7185" />
                <h3>Log Material Wastage / Scrap</h3>
              </div>
              <button
                onClick={() => setShowWastageModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecordWastage}>
              <div className="modal-body">
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Logging material scrap reduces physical inventory balance and directly rolls the loss cost into the designated customer order's financial ledger.
                </p>

                <div className="form-group">
                  <label className="form-label">Wasted Material / Item *</label>
                  <select
                    className="form-select"
                    value={wastageForm.itemId}
                    onChange={(e) => setWastageForm({ ...wastageForm, itemId: e.target.value })}
                    required
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} — Unit Cost: {formatETB(it.purchasePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity Lost / Scrapped *</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      className="form-input"
                      value={wastageForm.quantity}
                      onChange={(e) => setWastageForm({ ...wastageForm, quantity: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Workshop / Store Location *</label>
                    <select
                      className="form-select"
                      value={wastageForm.storeId}
                      onChange={(e) => setWastageForm({ ...wastageForm, storeId: e.target.value })}
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Reason Category *</label>
                    <select
                      className="form-select"
                      value={wastageForm.reason}
                      onChange={(e) =>
                        setWastageForm({ ...wastageForm, reason: e.target.value as WastageReason })
                      }
                    >
                      <option value="production_scrap">Production Scrap (Cutting / Trimming)</option>
                      <option value="damaged">Damaged in Workshop</option>
                      <option value="expired">Expired Past Shelf Life</option>
                      <option value="measurement_error">Measurement / Printhead Error</option>
                      <option value="theft_loss">Theft / Unaccounted Loss</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Allocate to Order (Job Costing)</label>
                    <select
                      className="form-select"
                      value={wastageForm.orderId}
                      onChange={(e) => setWastageForm({ ...wastageForm, orderId: e.target.value })}
                    >
                      <option value="">General Overhead (No Order)</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} — {o.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Root Cause & Incident Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the loss occurred (e.g. Laser tube overheat caused hairline fracture on acrylic sheet)..."
                    className="form-textarea"
                    value={wastageForm.notes}
                    onChange={(e) => setWastageForm({ ...wastageForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowWastageModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger btn-sm"
                  style={{ background: '#f43f5e', color: '#ffffff' }}
                >
                  Commit Wastage Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
