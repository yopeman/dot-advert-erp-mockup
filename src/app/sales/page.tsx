'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  Receipt,
  Users,
  PlusCircle,
  Search,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  QrCode,
  X,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { InvoiceType, Invoice, Customer } from '@/types/erp';

export default function SalesPage() {
  const {
    invoices,
    customers,
    orders,
    createInvoice,
    companyFinancials,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'customers'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vat_15' | 'non_vat_exempt'>('all');

  // Modals
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Invoice Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('vat_15');
  const [exemptReason, setExemptReason] = useState(
    'Government Public Agency Exemption Directive 24/2025'
  );
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-11-20');
  const [invoiceNotes, setInvoiceNotes] = useState('Payment due within agreed credit term window.');

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
  const parentCustomer = customers.find((c) => c.id === selectedOrder?.customerId);

  const subtotalNet = selectedOrder?.totalAgreedPrice || 0;
  const vatAmount = invoiceType === 'vat_15' ? subtotalNet * 0.15 : 0;
  const grandTotal = subtotalNet + vatAmount;

  // Handle Create Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !parentCustomer) return;

    const newInv = createInvoice({
      customerOrderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      customerId: parentCustomer.id,
      customerName: parentCustomer.name,
      customerTin: parentCustomer.tin,
      customerAddress: parentCustomer.address,
      dueDate: invoiceDueDate,
      invoiceType,
      exemptReason: invoiceType === 'non_vat_exempt' ? exemptReason : undefined,
      items: selectedOrder.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        discount: 0,
        taxableAmount: it.total,
        vatAmount: invoiceType === 'vat_15' ? it.total * 0.15 : 0,
        totalAmount: invoiceType === 'vat_15' ? it.total * 1.15 : it.total,
      })),
      subtotalNet,
      vatAmount,
      grandTotal,
      notes: invoiceNotes,
    });

    setShowNewInvoiceModal(false);
    setPreviewInvoice(newInv);
    setNotification(
      `Invoice ${newInv.invoiceNumber} generated! (${invoiceType === 'vat_15' ? '15% VAT' : 'Exempt Sale'})`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || inv.invoiceType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalInvoicedGross = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalOutstandingBalance = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

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
                color: '#a855f7',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Sales, Billing & Tax Invoicing
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Dual 15% VAT / Non-VAT System
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Customer Accounts, Invoicing & Receivables</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/collections" className="btn btn-secondary btn-sm">
            <CreditCard size={14} />
            <span>Go to Collections</span>
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewInvoiceModal(true)}
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              boxShadow: '0 2px 10px rgba(147, 51, 234, 0.35)',
            }}
          >
            <PlusCircle size={14} />
            <span>Generate New Invoice</span>
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
            <span>Net Invoiced Revenue (Excl. VAT)</span>
            <Receipt size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{formatETB(companyFinancials.totalRevenueNet)}</div>
          <div className="stat-card-subtext">
            <span>Core operational revenue basis</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Output VAT (15% Tax Liability)</span>
            <ShieldCheck size={16} color="#c084fc" />
          </div>
          <div className="stat-card-value" style={{ color: '#c084fc' }}>
            {formatETB(companyFinancials.totalOutputVat)}
          </div>
          <div className="stat-card-subtext">
            <span>Collected on behalf of Ministry of Revenues</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Gross Invoiced (With Tax)</span>
            <Building2 size={16} color="#38bdf8" />
          </div>
          <div className="stat-card-value">{formatETB(totalInvoicedGross)}</div>
          <div className="stat-card-subtext">
            <span>{invoices.length} total invoices issued</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Outstanding Due (AR)</span>
            <AlertTriangle size={16} color="#fbbf24" />
          </div>
          <div className="stat-card-value" style={{ color: '#fbbf24' }}>
            {formatETB(totalOutstandingBalance)}
          </div>
          <div className="stat-card-subtext">
            <span>Pending collection across customers</span>
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
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'invoices' ? '2px solid #9333ea' : '2px solid transparent',
            color: activeTab === 'invoices' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'invoices' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={16} />
          <span>Invoices Ledger</span>
          <span className="badge badge-gray">{invoices.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'customers' ? '#38bdf8' : 'var(--text-muted)',
            fontWeight: activeTab === 'customers' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} />
          <span>Customer Accounts & Credit Limits</span>
          <span className="badge badge-gray">{customers.length}</span>
        </button>
      </div>

      {/* TAB 1: INVOICES LEDGER */}
      {activeTab === 'invoices' && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
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
                  placeholder="Search invoice #, client, or order..."
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
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                <option value="all">All Invoices</option>
                <option value="vat_15">Standard 15% VAT Invoices</option>
                <option value="non_vat_exempt">Non-VAT / Exempt Invoices</option>
              </select>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowNewInvoiceModal(true)}>
              <PlusCircle size={14} />
              <span>Issue Invoice</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Customer & TIN</th>
                  <th>Order Reference</th>
                  <th>Invoice Type</th>
                  <th>Subtotal Net</th>
                  <th>15% VAT</th>
                  <th>Total Amount</th>
                  <th>Paid Status</th>
                  <th>Balance Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const isVat = inv.invoiceType === 'vat_15';
                  const isPaid = inv.paymentStatus === 'paid';

                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{inv.invoiceNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {inv.date} (Due: {inv.dueDate})
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                          TIN: {inv.customerTin}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#818cf8', fontWeight: 500 }}>{inv.orderNumber}</span>
                      </td>
                      <td>
                        {isVat ? (
                          <span className="badge badge-purple">15% VAT</span>
                        ) : (
                          <span className="badge badge-gray" title={inv.exemptReason}>
                            Tax Exempt
                          </span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(inv.subtotalNet)}</strong>
                      </td>
                      <td style={{ color: '#c084fc' }}>
                        {isVat ? formatETB(inv.vatAmount) : '—'}
                      </td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(inv.grandTotal)}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isPaid
                              ? 'badge-emerald'
                              : inv.paymentStatus === 'partially_paid'
                              ? 'badge-amber'
                              : 'badge-rose'
                          }`}
                        >
                          {inv.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {inv.balanceDue > 0 ? (
                          <strong style={{ color: '#fb7185' }}>{formatETB(inv.balanceDue)}</strong>
                        ) : (
                          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                            Fully Settled
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          onClick={() => setPreviewInvoice(inv)}
                        >
                          <Printer size={13} />
                          <span>View / Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMERS & CREDIT LIMITS */}
      {activeTab === 'customers' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Customer Master & Credit Limit Ledger</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Formula: <strong>Available Credit = Credit Limit − Outstanding Balance</strong>.
              Orders exceeding available credit trigger financial warning controls.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name & Code</th>
                  <th>TIN Number</th>
                  <th>Customer Type</th>
                  <th>Payment Terms</th>
                  <th>Credit Limit</th>
                  <th>Outstanding Balance</th>
                  <th>Available Credit</th>
                  <th>Tax Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const availCredit = c.creditLimit - c.outstandingBalance;
                  const percentUsed = (c.outstandingBalance / (c.creditLimit || 1)) * 100;

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {c.code} • {c.address}
                        </div>
                      </td>
                      <td>
                        <strong style={{ letterSpacing: '0.05em' }}>{c.tin}</strong>
                      </td>
                      <td>
                        <span className="badge badge-gray">{c.customerType}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{c.paymentTerms}</span>
                      </td>
                      <td>
                        <strong>{formatETB(c.creditLimit)}</strong>
                      </td>
                      <td>
                        <strong style={{ color: c.outstandingBalance > 0 ? '#fb7185' : 'var(--text-dim)' }}>
                          {formatETB(c.outstandingBalance)}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: availCredit > 50000 ? '#34d399' : '#fbbf24' }}>
                          {formatETB(availCredit)}
                        </strong>
                        <div className="progress-bar-bg" style={{ width: '90px', height: '4px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(100, percentUsed)}%`,
                              background: percentUsed > 80 ? '#fb7185' : '#34d399',
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {c.isVatRegistered ? (
                          <span className="badge badge-emerald">15% VAT Client</span>
                        ) : (
                          <span className="badge badge-gray">Tax Exempt Entity</span>
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

      {/* MODAL 1: GENERATE NEW INVOICE */}
      {showNewInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="#9333ea" />
                <h3>Generate Customer Tax Invoice</h3>
              </div>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Customer Order to Bill *</label>
                  <select
                    className="form-select"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.customerName} ({o.title}) • Net: {formatETB(o.totalAgreedPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Classification *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setInvoiceType('vat_15')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: invoiceType === 'vat_15' ? 'rgba(147, 51, 234, 0.2)' : 'var(--bg-input)',
                        border: invoiceType === 'vat_15' ? '1px solid #9333ea' : '1px solid var(--border-subtle)',
                        color: invoiceType === 'vat_15' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Standard 15% VAT</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Net Price + 15% VAT on taxable supplies
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInvoiceType('non_vat_exempt')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: invoiceType === 'non_vat_exempt' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-input)',
                        border: invoiceType === 'non_vat_exempt' ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                        color: invoiceType === 'non_vat_exempt' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tax Exempt Sale</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Without VAT (Official Directive Exemption)
                      </div>
                    </button>
                  </div>
                </div>

                {invoiceType === 'non_vat_exempt' && (
                  <div className="form-group">
                    <label className="form-label">Statutory Exemption Reason *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exemptReason}
                      onChange={(e) => setExemptReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Payment Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    required
                  />
                </div>

                {/* Tax Breakdown Summary Box */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Taxable Net Amount (Revenue Base):</span>
                    <strong style={{ color: '#ffffff' }}>{formatETB(subtotalNet)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#c084fc', marginBottom: '6px' }}>
                    <span>15% Output VAT:</span>
                    <span>{invoiceType === 'vat_15' ? formatETB(vatAmount) : '0 ETB (Exempt)'}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '8px',
                    }}
                  >
                    <span>Grand Total Invoiced:</span>
                    <span>{formatETB(grandTotal)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewInvoiceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Issue Official Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL ETHIOPIAN INVOICE PREVIEW */}
      {previewInvoice && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '780px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* Modal Actions Bar (Not Printed) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                background: '#0f172a',
                color: '#ffffff',
                borderTopLeftRadius: 'var(--radius-lg)',
                borderTopRightRadius: 'var(--radius-lg)',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Official Ethiopian Tax Invoice Document Preview
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: '#4f46e5', color: '#ffffff' }}
                  onClick={() => window.print()}
                >
                  <Printer size={14} />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div style={{ padding: '36px 40px', fontFamily: 'Arial, sans-serif' }}>
              {/* Header: Company & Official Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    DOT ADVERT & PRINT SOLUTIONS PLC
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                    Large Format Printing, 3D Signage & Structural Fabrication<br />
                    Bole Sub-City, Woreda 03, House #412, Addis Ababa, Ethiopia<br />
                    Tel: +251 116 678910 • Email: billing@dotadvert.et
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span>TIN: 0048291032</span>
                    <span>VAT REG: 8392019482</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      background: previewInvoice.invoiceType === 'vat_15' ? '#0f172a' : '#475569',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    {previewInvoice.invoiceType === 'vat_15' ? 'TAX INVOICE (VAT 15%)' : 'EXEMPT INVOICE'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {previewInvoice.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Date: {previewInvoice.date} • Due: {previewInvoice.dueDate}
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Bill To Customer
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {previewInvoice.customerName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                    {previewInvoice.customerAddress}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                    Customer TIN: {previewInvoice.customerTin}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Job & Payment Terms
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                    Order Reference: {previewInvoice.orderNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                    Payment Terms: 30 Days Net
                  </div>
                  {previewInvoice.exemptReason && (
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
                      Exemption: {previewInvoice.exemptReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155' }}>Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#334155' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>Unit Price</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>Taxable Amt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>VAT</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#0f172a', fontWeight: 500 }}>{item.description}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#475569' }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>
                        {formatETB(item.unitPrice)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a', fontWeight: 600 }}>
                        {formatETB(item.taxableAmount)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#7c3aed' }}>
                        {previewInvoice.invoiceType === 'vat_15' ? formatETB(item.vatAmount) : 'Exempt'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                        {formatETB(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Breakdown & QR Code */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '340px' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: '#0f172a',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <QrCode size={56} />
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', lineHeight: 1.4 }}>
                    <strong>Electronic Tax Stamp QR Code</strong><br />
                    Scanned & verified by Ministry of Revenues Tax Verification Gateway.
                  </div>
                </div>

                <div style={{ width: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#475569' }}>
                    <span>Net Subtotal:</span>
                    <strong style={{ color: '#0f172a' }}>{formatETB(previewInvoice.subtotalNet)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#7c3aed' }}>
                    <span>VAT (15%):</span>
                    <strong>{formatETB(previewInvoice.vatAmount)}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      borderTop: '2px solid #0f172a',
                      borderBottom: '2px solid #0f172a',
                      margin: '6px 0',
                    }}
                  >
                    <span>Grand Total:</span>
                    <span>{formatETB(previewInvoice.grandTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#16a34a' }}>
                    <span>Paid to Date:</span>
                    <strong>{formatETB(previewInvoice.paidAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', fontWeight: 700, color: '#dc2626' }}>
                    <span>Balance Due:</span>
                    <span>{formatETB(previewInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Official Stamp & Sign */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '160px', borderBottom: '1px solid #475569', marginBottom: '6px' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized Accountant Signature</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '160px', borderBottom: '1px solid #475569', marginBottom: '6px' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Official Corporate Seal / Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
