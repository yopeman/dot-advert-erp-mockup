'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { CustomerOrder, WorkOrder, Item, WastageReason } from '@/types/erp';

interface LogOrderWastageModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  workOrders: WorkOrder[];
  items: Item[];
  onConfirmWastage: (params: {
    itemId: string;
    quantity: number;
    storeId: string;
    reason: WastageReason;
    orderId: string;
    notes?: string;
    workOrderId?: string;
  }) => void;
}

export default function LogOrderWastageModal({
  isOpen,
  onClose,
  order,
  workOrders,
  items,
  onConfirmWastage,
}: LogOrderWastageModalProps) {
  const [selectedWoId, setSelectedWoId] = useState<string>(workOrders[0]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    workOrders[0]?.bomItems[0]?.itemId || items[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<WastageReason>('production_scrap');
  const [notes, setNotes] = useState('');

  if (!isOpen || !order) return null;

  const targetItem = items.find((i) => i.id === selectedItemId);
  const scrapCost = (targetItem?.purchasePrice || 0) * quantity;

  const formatETB = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(val).replace('ETB', 'ETB ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItem || quantity <= 0) return;

    onConfirmWastage({
      itemId: targetItem.id,
      quantity,
      storeId: 'store-2', // Production shopfloor
      reason,
      orderId: order.id,
      notes: notes.trim() || undefined,
      workOrderId: selectedWoId || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', width: '95%' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <Trash2 size={18} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem' }}>Log Order Wastage & Scrap</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Attributed to {order.orderNumber} • Deducts directly from order profit margin
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Target Order Info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '0.825rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0e7490', fontWeight: 700, fontFamily: 'monospace' }}>
                  {order.orderNumber}
                </span>
                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{order.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                Client: <strong>{order.customerName}</strong>
              </div>
            </div>

            {/* Optional Linked Work Order */}
            {workOrders.length > 0 && (
              <div className="form-group">
                <label className="form-label">Shopfloor Work Order (Optional)</label>
                <select
                  className="form-select"
                  value={selectedWoId}
                  onChange={(e) => {
                    setSelectedWoId(e.target.value);
                    const wo = workOrders.find((w) => w.id === e.target.value);
                    if (wo?.bomItems[0]?.itemId) {
                      setSelectedItemId(wo.bomItems[0].itemId);
                    }
                  }}
                >
                  <option value="">General Order Scrap (Not Work-Order Specific)</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNumber} — {wo.productDescription} ({wo.workCenterMachine})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Material Incurring Scrap */}
            <div className="form-group">
              <label className="form-label">Material Incurring Scrap *</label>
              <select
                className="form-select"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit}) — Purchase: {formatETB(item.purchasePrice)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Reason */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Scrap Qty ({targetItem?.unit || 'units'}) *</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  className="form-input"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scrap Reason *</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WastageReason)}
                >
                  <option value="production_scrap">Production Scrap / Cut Loss</option>
                  <option value="damaged">Material Cracked / Thermal Fracture</option>
                  <option value="measurement_error">Measurement / Print Cut Error</option>
                  <option value="spoiled">Color Banding / Ink Smear / Head Strike</option>
                  <option value="expired">Substrate Defect / Wrinkling</option>
                </select>
              </div>
            </div>

            {/* Financial Cost Impact Preview */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <span style={{ fontSize: '0.825rem', color: '#b91c1c' }}>
                  Wastage Cost Impact:
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
                  - {formatETB(scrapCost)}
                </span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {quantity} {targetItem?.unit} @ {formatETB(targetItem?.purchasePrice || 0)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Shopfloor Defect Notes & Report</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="e.g. Acrylic fractured during high-speed CNC routing on Amharic character; reprint required on 3m vinyl banner..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ background: '#dc2626', borderColor: '#b91c1c' }}
            >
              <Trash2 size={14} />
              <span>Record Wastage (- {formatETB(scrapCost)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
