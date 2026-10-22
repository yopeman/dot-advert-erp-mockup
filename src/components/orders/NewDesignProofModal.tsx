'use client';

import React, { useState } from 'react';
import { X, Palette, PlusCircle, Ruler, Image as ImageIcon } from 'lucide-react';
import { CustomerOrder, DesignProof } from '@/types/erp';

interface NewDesignProofModalProps {
  orders: CustomerOrder[];
  initialOrderId?: string;
  onClose: () => void;
  onCreateProof: (proofData: Omit<DesignProof, 'id' | 'designNumber' | 'createdDate' | 'revisions' | 'revisionCount'>) => void;
}

export default function NewDesignProofModal({
  orders,
  initialOrderId,
  onClose,
  onCreateProof,
}: NewDesignProofModalProps) {
  const [customerOrderId, setCustomerOrderId] = useState(initialOrderId || orders[0]?.id || '');
  const [title, setTitle] = useState('');
  const [designerName, setDesignerName] = useState('Natnael Haile (Senior Graphic Artist)');
  const [widthMeters, setWidthMeters] = useState(4.0);
  const [heightMeters, setHeightMeters] = useState(1.5);
  const [depthCm, setDepthCm] = useState(15);
  const [resolutionDpi, setResolutionDpi] = useState(300);
  const [colorProfile, setColorProfile] = useState<'CMYK' | 'Pantone' | 'RGB'>('CMYK');
  const [materialSpec, setMaterialSpec] = useState('3mm Cast Acrylic + 3M High-Tack Vinyl');
  const [mockupUrl, setMockupUrl] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80'
  );
  const [clientContactPerson, setClientContactPerson] = useState('');

  const selectedOrder = orders.find((o) => o.id === customerOrderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !title.trim()) return;

    onCreateProof({
      customerOrderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      customerName: selectedOrder.customerName,
      title: title.trim(),
      designerName,
      status: 'client_proofing',
      widthMeters,
      heightMeters,
      depthCm: depthCm > 0 ? depthCm : undefined,
      resolutionDpi,
      colorProfile,
      materialSpec,
      mockupUrl: mockupUrl.trim() || undefined,
      clientContactPerson: clientContactPerson.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} color="#4338ca" />
            <h3 style={{ color: 'var(--text-main)' }}>Create Graphic Design & Artwork Proof</h3>
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
            {/* Customer Order Select */}
            <div className="form-group">
              <label className="form-label">Linked Customer Order *</label>
              <select
                className="form-select"
                value={customerOrderId}
                onChange={(e) => {
                  setCustomerOrderId(e.target.value);
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord) setTitle(`${ord.title} Layout & Print Proof`);
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

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Artwork Proof Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Awash Bank 3D Rooftop Channel Letters Print Artwork..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Designer & Client Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Assigned Graphic Artist</label>
                <select
                  className="form-select"
                  value={designerName}
                  onChange={(e) => setDesignerName(e.target.value)}
                >
                  <option value="Natnael Haile (Senior Graphic Artist)">Natnael Haile (Senior Graphic Artist)</option>
                  <option value="Yared Tadesse (CAD Drafter)">Yared Tadesse (CAD Drafter)</option>
                  <option value="Selamawit Girma (Creative Art Director)">Selamawit Girma (Creative Art Director)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Client Contact Person</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Facility Manager or Marketing Lead"
                  value={clientContactPerson}
                  onChange={(e) => setClientContactPerson(e.target.value)}
                />
              </div>
            </div>

            {/* Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Width (Meters) *</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  className="form-input"
                  value={widthMeters}
                  onChange={(e) => setWidthMeters(parseFloat(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (Meters) *</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  className="form-input"
                  value={heightMeters}
                  onChange={(e) => setHeightMeters(parseFloat(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">3D Depth (cm)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={depthCm}
                  onChange={(e) => setDepthCm(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Color & DPI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Color Profile Standard</label>
                <select
                  className="form-select"
                  value={colorProfile}
                  onChange={(e) => setColorProfile(e.target.value as 'CMYK' | 'Pantone' | 'RGB')}
                >
                  <option value="CMYK">CMYK (Wide-Format Eco-Solvent / UV Print)</option>
                  <option value="Pantone">Pantone Spot Color Matching</option>
                  <option value="RGB">RGB (Digital / LED Screen Artwork)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution (DPI)</label>
                <select
                  className="form-select"
                  value={resolutionDpi}
                  onChange={(e) => setResolutionDpi(parseInt(e.target.value) || 300)}
                >
                  <option value={300}>300 DPI (High-Definition Vector / Close Inspection)</option>
                  <option value={150}>150 DPI (Standard Billboard / Backlit Skin)</option>
                  <option value={72}>72 DPI (Super-wide Megaboard & Building Wraps)</option>
                </select>
              </div>
            </div>

            {/* Material Specification */}
            <div className="form-group">
              <label className="form-label">Material & Finishing Specifications</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 3mm Cast Acrylic + 3M High-Tack Cast Vinyl + Matte UV Overlaminate"
                value={materialSpec}
                onChange={(e) => setMaterialSpec(e.target.value)}
                required
              />
            </div>

            {/* Mockup Preview Image URL */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Artwork / Mockup Preview Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={mockupUrl}
                onChange={(e) => setMockupUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <PlusCircle size={14} />
              <span>Submit for Client Sign-Off</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
