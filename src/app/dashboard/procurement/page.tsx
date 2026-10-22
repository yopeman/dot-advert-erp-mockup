'use client';

import React, { useState } from 'react';
import { useErp } from '@/context/ErpDataContext';
import {
  ShoppingCart,
  Building2,
  FileCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  Boxes,
  X,
  Search,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { POStatus, UnitOfMeasure } from '@/types/erp';

export default function ProcurementPage() {
  const {
    purchaseOrders,
    suppliers,
    items,
    stores,
    createPurchaseOrder,
    receivePurchaseOrder,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'pos' | 'suppliers' | 'grn'>('pos');
  const [showPoModal, setShowPoModal] = useState(false);
  const [receivingPoId, setReceivingPoId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [poItemId, setPoItemId] = useState(items[0]?.id || '');
  const [poQuantity, setPoQuantity] = useState(25);
  const [poUnitPrice, setPoUnitPrice] = useState(items[0]?.purchasePrice || 280);
  const [poDeliveryDate, setPoDeliveryDate] = useState('2026-10-25');
  const [poNotes, setPoNotes] = useState('');

  // GRN Receiving Form State
  const [grnStoreId, setGrnStoreId] = useState(stores[0]?.id || '');
  const [grnQuality, setGrnQuality] = useState<'passed' | 'partial' | 'failed'>('passed');
  const [grnBatchLot, setGrnBatchLot] = useState('LOT-2026-904');
  const [grnDeliveryNote, setGrnDeliveryNote] = useState('DN-8921-ET');
  const [grnInspector, setGrnInspector] = useState('Dawit Bekele (Quality Inspector)');

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const selectedItem = items.find((i) => i.id === poItemId);

  const poSubtotal = poQuantity * poUnitPrice;
  const poVat = selectedSupplier?.isVatRegistered ? poSubtotal * 0.15 : 0;
  const poGrandTotal = poSubtotal + poVat;

  const totalProcurementSpend = purchaseOrders.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalInputVatClaimable = purchaseOrders.reduce((sum, p) => sum + p.vatTotal, 0);

  // Handle PO Creation
  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedItem || poQuantity <= 0) return;

    createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      supplierTin: selectedSupplier.tin,
      items: [
        {
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          quantity: poQuantity,
          unit: selectedItem.unit,
          unitPrice: poUnitPrice,
          vatRate: selectedSupplier.isVatRegistered ? 0.15 : 0,
          vatAmount: poVat,
          totalAmount: poGrandTotal,
        },
      ],
      subtotal: poSubtotal,
      vatTotal: poVat,
      grandTotal: poGrandTotal,
      expectedDeliveryDate: poDeliveryDate,
      requestedBy: 'Procurement Department',
      approvedBy: 'General Manager',
      paymentTerms: selectedSupplier.paymentTerms,
      notes: poNotes,
    });

    setShowPoModal(false);
    setNotification(`Purchase Order issued to ${selectedSupplier.name} with 15% VAT calculation!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle GRN Receive
  const handleReceiveGoods = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPoId) return;

    const po = purchaseOrders.find((p) => p.id === receivingPoId);
    if (!po) return;

    receivePurchaseOrder(receivingPoId, grnStoreId);
    setReceivingPoId(null);
    setNotification(
      `Goods Receipt Note confirmed! Materials received into store and inventory balances increased.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                color: '#6366f1',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Procurement & Purchasing Suite
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Sourcing, POs & GRN
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Supplier Orders, QA Inspection & Goods Receipts</h1>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowPoModal(true)}>
          <PlusCircle size={14} />
          <span>New Purchase Order</span>
        </button>
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
            <span>Total Procurement POs</span>
            <ShoppingCart size={16} color="#6366f1" />
          </div>
          <div className="stat-card-value">{formatETB(totalProcurementSpend)}</div>
          <div className="stat-card-subtext">
            <span>{purchaseOrders.length} total orders placed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Claimable Input VAT</span>
            <Receipt size={16} color="#a855f7" />
          </div>
          <div className="stat-card-value" style={{ color: '#c084fc' }}>
            {formatETB(totalInputVatClaimable)}
          </div>
          <div className="stat-card-subtext">
            <span>15% input VAT to offset output tax liability</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Approved Vendors</span>
            <Building2 size={16} color="#06b6d4" />
          </div>
          <div className="stat-card-value">{suppliers.length} Suppliers</div>
          <div className="stat-card-subtext">
            <span>All verified with Ethiopian TIN & bank accounts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Goods Receipts (GRN)</span>
            <FileCheck size={16} color="#10b981" />
          </div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            {purchaseOrders.filter((p) => p.status === 'received').length} Completed
          </div>
          <div className="stat-card-subtext">
            <span>100% QA inspected and stocked in warehouse</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          onClick={() => setActiveTab('pos')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pos' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'pos' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'pos' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShoppingCart size={16} />
          <span>Purchase Orders</span>
          <span className="badge badge-gray">{purchaseOrders.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'suppliers' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'suppliers' ? '#67e8f9' : 'var(--text-muted)',
            fontWeight: activeTab === 'suppliers' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building2 size={16} />
          <span>Supplier Master Directory</span>
          <span className="badge badge-gray">{suppliers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('grn')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'grn' ? '2px solid #10b981' : '2px solid transparent',
            color: activeTab === 'grn' ? '#34d399' : 'var(--text-muted)',
            fontWeight: activeTab === 'grn' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileCheck size={16} />
          <span>Goods Receipts & QA History</span>
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'pos' && (
        <div className="card">
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
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <Search
                size={16}
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
                placeholder="Search PO number or supplier..."
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowPoModal(true)}>
              <PlusCircle size={14} />
              <span>Issue New PO</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number & Date</th>
                  <th>Supplier & TIN</th>
                  <th>Order Items</th>
                  <th>Net Subtotal</th>
                  <th>15% VAT</th>
                  <th>Grand Total</th>
                  <th>Expected Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po) => {
                  const isReceived = po.status === 'received';

                  return (
                    <tr key={po.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{po.poNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {po.date}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{po.supplierName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                          TIN: {po.supplierTin}
                        </div>
                      </td>
                      <td>
                        {po.items.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem' }}>
                            {it.itemName} ({it.quantity} {it.unit} @ {formatETB(it.unitPrice)})
                          </div>
                        ))}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatETB(po.subtotal)}</td>
                      <td style={{ color: '#c084fc' }}>{formatETB(po.vatTotal)}</td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(po.grandTotal)}</strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {po.expectedDeliveryDate}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isReceived
                              ? 'badge-emerald'
                              : po.status === 'approved'
                              ? 'badge-primary'
                              : 'badge-gray'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td>
                        {!isReceived ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              padding: '5px 10px',
                            }}
                            onClick={() => {
                              setReceivingPoId(po.id);
                            }}
                          >
                            <Truck size={13} />
                            <span>Receive (GRN)</span>
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#34d399',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Stocked</span>
                          </span>
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

      {/* TAB 2: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Registered Vendor & Supplier Master</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              All procurement requires verified Ethiopian Taxpayer Identification Numbers (TIN) and payment terms.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier Name & Code</th>
                  <th>TIN Number</th>
                  <th>Category</th>
                  <th>Payment Terms</th>
                  <th>Bank Account Details</th>
                  <th>Contact Info</th>
                  <th>Tax Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{sup.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {sup.code}
                      </div>
                    </td>
                    <td>
                      <strong style={{ letterSpacing: '0.05em' }}>{sup.tin}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gray">{sup.category.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {sup.paymentTerms}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{sup.bankName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        A/C: {sup.bankAccount}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{sup.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {sup.email}
                      </div>
                    </td>
                    <td>
                      {sup.isVatRegistered ? (
                        <span className="badge badge-emerald">15% VAT Registered</span>
                      ) : (
                        <span className="badge badge-amber">Non-VAT Vendor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GOODS RECEIPTS (GRN) */}
      {activeTab === 'grn' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Goods Receipt Notes (GRN) & Quality Inspection History</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Materials must be quality-inspected, batch-logged, and accepted into store before inventory increments occur.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>GRN Reference</th>
                  <th>Associated PO</th>
                  <th>Supplier</th>
                  <th>Delivered Items</th>
                  <th>Destination Store</th>
                  <th>Batch / Lot #</th>
                  <th>QA Result</th>
                  <th>Inspector</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders
                  .filter((p) => p.status === 'received')
                  .map((po) => (
                    <tr key={po.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>GRN-{po.poNumber.slice(3)}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {po.date}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>{po.poNumber}</span>
                      </td>
                      <td>{po.supplierName}</td>
                      <td>
                        {po.items.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem' }}>
                            {it.itemName} ({it.quantity} {it.unit})
                          </div>
                        ))}
                      </td>
                      <td>Main Raw Materials Store</td>
                      <td>
                        <span className="badge badge-gray">LOT-2026-904</span>
                      </td>
                      <td>
                        <span className="badge badge-emerald">
                          <ShieldCheck size={12} />
                          <span>100% Quality Passed</span>
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Dawit Bekele (Storekeeper)
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE PURCHASE ORDER */}
      {showPoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} color="#818cf8" />
                <h3>Create New Purchase Order</h3>
              </div>
              <button
                onClick={() => setShowPoModal(false)}
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
            <form onSubmit={handleCreatePo}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Verified Supplier *</label>
                  <select
                    className="form-select"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (TIN: {s.tin}) — {s.isVatRegistered ? '15% VAT' : 'Non-VAT'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Material / Item to Order *</label>
                  <select
                    className="form-select"
                    value={poItemId}
                    onChange={(e) => {
                      const it = items.find((i) => i.id === e.target.value);
                      setPoItemId(e.target.value);
                      if (it) setPoUnitPrice(it.purchasePrice);
                    }}
                    required
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.code}) — Current Stock: {it.currentStock} {it.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Order Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={poQuantity}
                      onChange={(e) => setPoQuantity(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Price (ETB) *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={poUnitPrice}
                      onChange={(e) => setPoUnitPrice(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={poDeliveryDate}
                    onChange={(e) => setPoDeliveryDate(e.target.value)}
                    required
                  />
                </div>

                {/* Auto Calculated Financial Summary */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    <span>Net Subtotal:</span>
                    <span>{formatETB(poSubtotal)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#c084fc',
                      marginBottom: '6px',
                    }}
                  >
                    <span>Input VAT (15%):</span>
                    <span>{formatETB(poVat)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '6px',
                    }}
                  >
                    <span>Total Payable:</span>
                    <span>{formatETB(poGrandTotal)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">PO Notes / Special Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Must include certificate of analysis with shipment..."
                    className="form-input"
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPoModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECEIVE GOODS (GRN) */}
      {receivingPoId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#10b981" />
                <h3>Goods Receipt Note (GRN) & Quality Check</h3>
              </div>
              <button
                onClick={() => setReceivingPoId(null)}
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
            <form onSubmit={handleReceiveGoods}>
              <div className="modal-body">
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                  }}
                >
                  Inspecting shipment for PO:{' '}
                  <strong>{purchaseOrders.find((p) => p.id === receivingPoId)?.poNumber}</strong>{' '}
                  from{' '}
                  <strong>{purchaseOrders.find((p) => p.id === receivingPoId)?.supplierName}</strong>
                  .
                </p>

                <div className="form-group">
                  <label className="form-label">Receiving Warehouse Destination *</label>
                  <select
                    className="form-select"
                    value={grnStoreId}
                    onChange={(e) => setGrnStoreId(e.target.value)}
                    required
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Quality Inspection Result *</label>
                    <select
                      className="form-select"
                      value={grnQuality}
                      onChange={(e) =>
                        setGrnQuality(e.target.value as 'passed' | 'partial' | 'failed')
                      }
                    >
                      <option value="passed">Passed - 100% Quality Accepted</option>
                      <option value="partial">Partial Acceptance (Minor Flaws)</option>
                      <option value="failed">Rejected - Non-Compliant</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Batch / Lot Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={grnBatchLot}
                      onChange={(e) => setGrnBatchLot(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Supplier Delivery Note Ref</label>
                    <input
                      type="text"
                      className="form-input"
                      value={grnDeliveryNote}
                      onChange={(e) => setGrnDeliveryNote(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inspector Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={grnInspector}
                      onChange={(e) => setGrnInspector(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setReceivingPoId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#10b981', color: '#ffffff' }}
                >
                  Approve GRN & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
