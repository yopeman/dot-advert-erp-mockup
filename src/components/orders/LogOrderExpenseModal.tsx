'use client';

import React, { useState } from 'react';
import { X, Receipt, DollarSign, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CustomerOrder, Expense, ExpenseCategory, PaymentMethod } from '@/types/erp';

interface LogOrderExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  onConfirmExpense: (expenseData: Omit<Expense, 'id' | 'expenseNumber' | 'date' | 'status'>) => void;
}

export default function LogOrderExpenseModal({
  isOpen,
  onClose,
  order,
  onConfirmExpense,
}: LogOrderExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>('delivery_transport');
  const [supplierOrPayee, setSupplierOrPayee] = useState('');
  const [amountNet, setAmountNet] = useState<number>(5000);
  const [includeVat, setIncludeVat] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [receiptRef, setReceiptRef] = useState('');
  const [department, setDepartment] = useState('Production / Site Installation');
  const [notes, setNotes] = useState('');

  if (!isOpen || !order) return null;

  const vatAmount = includeVat ? Math.round(amountNet * 0.15) : 0;
  const totalAmount = amountNet + vatAmount;

  const formatETB = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(val).replace('ETB', 'ETB ');
  };

  const getCategoryLabel = (cat: ExpenseCategory): string => {
    switch (cat) {
      case 'delivery_transport':
        return 'Site Delivery & Scaffolding Transport';
      case 'crane_scaffolding_rental':
        return 'Hydraulic Crane & Boom Lift Hire';
      case 'order_direct_supplies':
        return 'Direct Job Consumables & Fasteners';
      case 'installation_per_diem':
        return 'Site Installation Team Daily Per-Diem';
      case 'permits_licensing':
        return 'City Signage Bureau Municipal Permit';
      case 'machine_maintenance':
        return 'Tooling, Custom Bits & Blade Replacement';
      case 'generator_fuel':
        return 'On-Site Generator Diesel Fuel';
      default:
        return cat.replace('_', ' ');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierOrPayee || amountNet <= 0) return;

    onConfirmExpense({
      category,
      categoryLabel: getCategoryLabel(category),
      costType: 'variable',
      supplierOrPayee: supplierOrPayee.trim(),
      amountNet,
      vatAmount,
      totalAmount,
      paymentMethod,
      department,
      orderId: order.id,
      orderNumber: order.orderNumber,
      receiptRef: receiptRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px', width: '95%' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fb7185',
              }}
            >
              <Receipt size={18} />
            </div>
            <div>
              <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>Log Order Direct Expense</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Attributed directly to {order.orderNumber} • Real-time Cost Waterfall Rollup
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
            {/* Order Target Badge */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '0.825rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>
                  {order.orderNumber}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Delivery: {order.expectedDeliveryDate}
                </span>
              </div>
              <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>{order.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                Client: <strong>{order.customerName}</strong>
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                required
              >
                <option value="delivery_transport">Site Delivery, Freight & Scaffolding Transport</option>
                <option value="crane_scaffolding_rental">Hydraulic Crane & Boom Lift Rental</option>
                <option value="order_direct_supplies">Direct Job Consumables & Fasteners</option>
                <option value="installation_per_diem">Site Installation Team Daily Per-Diem</option>
                <option value="permits_licensing">Municipal Signage Permits & Structural Certification</option>
                <option value="machine_maintenance">Tooling, Custom CNC Bits & Blade Wear</option>
                <option value="generator_fuel">On-Site Standby Generator Diesel</option>
              </select>
            </div>

            {/* Supplier / Payee */}
            <div className="form-group">
              <label className="form-label">Supplier, Contractor or Payee *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Addis Crane Services PLC, TotalEnergies, City Admin Signage Bureau..."
                value={supplierOrPayee}
                onChange={(e) => setSupplierOrPayee(e.target.value)}
                required
              />
            </div>

            {/* Amount & VAT Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Net Amount (Excl. VAT) *</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="form-input"
                  value={amountNet || ''}
                  onChange={(e) => setAmountNet(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="telebirr">Telebirr SuperApp</option>
                  <option value="bank_transfer">CBE / Bank Transfer</option>
                  <option value="cash">Petty Cash Voucher</option>
                  <option value="chapa">Chapa Gateway</option>
                  <option value="cheque">Bank Cheque</option>
                </select>
              </div>
            </div>

            {/* VAT Checkbox & Financial Rollup Preview */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  color: 'var(--text-main)',
                }}
              >
                <input
                  type="checkbox"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                />
                <span>Include 15% Ethiopian VAT ({formatETB(vatAmount)})</span>
              </label>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '6px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Total Outlay (Net + VAT):</span>
                <strong style={{ color: '#fb7185', fontSize: '1rem' }}>{formatETB(totalAmount)}</strong>
              </div>
            </div>

            {/* Receipt Ref & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Receipt / Voucher Ref</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RCP-2026-904"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Expense Purpose & Description</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="e.g. 50-ton hydraulic crane rental for 6 hours to install rooftop letters at Awash Bank 4th floor facade..."
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
              style={{ background: '#f43f5e', borderColor: '#e11d48' }}
            >
              <Receipt size={14} />
              <span>Record Order Expense ({formatETB(amountNet)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
