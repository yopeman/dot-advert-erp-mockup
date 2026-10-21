'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { WorkOrder, Item, WastageReason } from '@/types/erp';

interface LogScrapModalProps {
  workOrder: WorkOrder | null;
  items: Item[];
  onClose: () => void;
  onConfirmScrap: (woId: string, scrapData: { itemId: string; quantity: number; reason: WastageReason; notes?: string }) => void;
}

export default function LogScrapModal({
  workOrder,
  items,
  onClose,
  onConfirmScrap,
}: LogScrapModalProps) {
  const [selectedItemId, setSelectedItemId] = useState(
    workOrder?.bomItems[0]?.itemId || items[0]?.id || ''
  );
  const [scrapQty, setScrapQty] = useState(1);
  const [reason, setReason] = useState<WastageReason>('production_scrap');
  const [notes, setNotes] = useState('');

  if (!workOrder) return null;

  const targetItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItem || scrapQty <= 0) return;

    onConfirmScrap(workOrder.id, {
      itemId: targetItem.id,
      quantity: scrapQty,
      reason,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px', width: '95%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={20} color="#fb7185" />
            <h3 style={{ color: '#ffffff' }}>Log Factory Scrap / Wastage</h3>
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
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.8rem',
              }}
            >
              <div><strong>Work Order:</strong> {workOrder.workOrderNumber} ({workOrder.productDescription})</div>
              <div><strong>Client:</strong> {workOrder.customerName}</div>
              <div><strong>Station:</strong> {workOrder.workCenterMachine}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Material Incurring Scrap *</label>
              <select
                className="form-select"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
              >
                {workOrder.bomItems.map((bi) => (
                  <option key={bi.itemId} value={bi.itemId}>
                    {bi.itemName} (Issued in this WO)
                  </option>
                ))}
                {items
                  .filter((it) => !workOrder.bomItems.some((bi) => bi.itemId === it.id))
                  .map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.unit})
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Scrap Quantity ({targetItem?.unit || 'units'}) *</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  className="form-input"
                  value={scrapQty}
                  onChange={(e) => setScrapQty(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scrap / Defect Reason *</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WastageReason)}
                >
                  <option value="production_scrap">Production Scrap / Cut Loss</option>
                  <option value="damaged">Material Cracked / Damaged</option>
                  <option value="measurement_error">Measurement / Print Error</option>
                  <option value="spoiled">Color Banding / Ink Smear</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Shopfloor Notes & Incident Report</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="e.g. Sheet cracked during CNC router bevel cut, or printhead nozzle banding..."
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
              style={{ background: '#f43f5e', borderColor: '#f43f5e', color: '#ffffff' }}
            >
              <Trash2 size={14} />
              <span>Record Scrap & Update Cost</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
