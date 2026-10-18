'use client';

import React, { useState } from 'react';
import { useErp } from '@/context/ErpDataContext';
import {
  Wallet,
  Receipt,
  CreditCard,
  Building2,
  CheckCircle2,
  PlusCircle,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Banknote,
  X,
  FileCheck,
} from 'lucide-react';
import { PaymentMethod, Collection, Invoice } from '@/types/erp';

export default function CollectionsPage() {
  const {
    collections,
    invoices,
    customers,
    recordCollection,
    companyFinancials,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'receipts' | 'receivables' | 'channels'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices.find((i) => i.balanceDue > 0)?.id || invoices[0]?.id || ''
  );
  const [amountToCollect, setAmountToCollect] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [bankRef, setBankRef] = useState('TB-8921092837');
  const [collectorNotes, setCollectorNotes] = useState('Payment verified via digital confirmation.');
  const [notification, setNotification] = useState<string | null>(null);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  // When opening modal for an invoice, set default amount to remaining balance
  const handleOpenCollectFor = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setAmountToCollect(invoice.balanceDue);
    if (paymentMethod === 'telebirr') {
      setBankRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
    } else if (paymentMethod === 'bank_transfer') {
      setBankRef(`CBE-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
    }
    setShowCollectModal(true);
  };

  // Handle Collection Submission
  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || amountToCollect <= 0) return;

    recordCollection({
      invoiceId: selectedInvoice.id,
      amountReceived: Number(amountToCollect),
      paymentMethod,
      bankReference: bankRef,
      notes: collectorNotes,
    });

    setShowCollectModal(false);
    setNotification(
      `Payment of ${formatETB(amountToCollect)} collected via ${paymentMethod.toUpperCase()}! Customer credit & invoice reconciled.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Group Collections by Channel
  const telebirrTotal = collections
    .filter((c) => c.paymentMethod === 'telebirr')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const bankTotal = collections
    .filter((c) => c.paymentMethod === 'bank_transfer')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const chapaTotal = collections
    .filter((c) => c.paymentMethod === 'chapa')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const cashTotal = collections
    .filter((c) => c.paymentMethod === 'cash' || c.paymentMethod === 'cheque')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const unpaidInvoices = invoices.filter((i) => i.balanceDue > 0);

  const filteredReceipts = collections.filter(
    (c) =>
      c.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bankReference.toLowerCase().includes(searchQuery.toLowerCase())
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
                color: '#06b6d4',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Treasury, Payments & Cash Flow
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Multi-Channel Ethiopian Gateway
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Collections, Telebirr, CBE & Credit Ledger</h1>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (unpaidInvoices[0]) {
              handleOpenCollectFor(unpaidInvoices[0]);
            } else {
              setShowCollectModal(true);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            boxShadow: '0 2px 10px rgba(6, 182, 212, 0.35)',
          }}
        >
          <PlusCircle size={14} />
          <span>Record New Collection</span>
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
            <span>Total Collected In Cash</span>
            <Wallet size={16} color="#06b6d4" />
          </div>
          <div className="stat-card-value" style={{ color: '#67e8f9' }}>
            {formatETB(companyFinancials.totalCollected)}
          </div>
          <div className="stat-card-subtext">
            <span>{collections.length} official payment receipts issued</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Telebirr Instant Gateway</span>
            <Smartphone size={16} color="#38bdf8" />
          </div>
          <div className="stat-card-value" style={{ color: '#38bdf8' }}>
            {formatETB(telebirrTotal)}
          </div>
          <div className="stat-card-subtext">
            <span>Automated QR & USSD merchant settlements</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Commercial Bank of Ethiopia (CBE)</span>
            <Building2 size={16} color="#a855f7" />
          </div>
          <div className="stat-card-value" style={{ color: '#d8b4fe' }}>
            {formatETB(bankTotal)}
          </div>
          <div className="stat-card-subtext">
            <span>Corporate wire transfers verified to main A/C</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Remaining Uncollected (AR)</span>
            <Receipt size={16} color="#fbbf24" />
          </div>
          <div className="stat-card-value" style={{ color: '#fbbf24' }}>
            {formatETB(companyFinancials.totalReceivables)}
          </div>
          <div className="stat-card-subtext">
            <span>{unpaidInvoices.length} invoices pending payment</span>
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
          onClick={() => setActiveTab('receipts')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'receipts' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'receipts' ? '#67e8f9' : 'var(--text-muted)',
            fontWeight: activeTab === 'receipts' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileCheck size={16} />
          <span>Payment Receipts Ledger</span>
          <span className="badge badge-gray">{collections.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('receivables')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'receivables' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'receivables' ? '#fbbf24' : 'var(--text-muted)',
            fontWeight: activeTab === 'receivables' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={16} />
          <span>Outstanding Invoices Due</span>
          <span className="badge badge-amber">{unpaidInvoices.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'channels' ? '2px solid #818cf8' : '2px solid transparent',
            color: activeTab === 'channels' ? '#a5b4fc' : 'var(--text-muted)',
            fontWeight: activeTab === 'channels' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Smartphone size={16} />
          <span>Ethiopian Payment Gateway Breakdown</span>
        </button>
      </div>

      {/* TAB 1: RECEIPTS LEDGER */}
      {activeTab === 'receipts' && (
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
                placeholder="Search receipt #, customer, reference..."
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Showing {filteredReceipts.length} collection receipts
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt # & Date</th>
                  <th>Customer Name</th>
                  <th>Invoice Applied</th>
                  <th>Payment Method</th>
                  <th>Amount Received</th>
                  <th>Bank / Txn Reference</th>
                  <th>Customer Balance Post-Pay</th>
                  <th>Cashier</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((col) => {
                  const channelBadge =
                    col.paymentMethod === 'telebirr'
                      ? 'badge-cyan'
                      : col.paymentMethod === 'chapa'
                      ? 'badge-primary'
                      : col.paymentMethod === 'bank_transfer'
                      ? 'badge-purple'
                      : 'badge-emerald';

                  return (
                    <tr key={col.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{col.receiptNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {col.date}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{col.customerName}</span>
                      </td>
                      <td>
                        <span style={{ color: '#818cf8', fontWeight: 500 }}>
                          {col.invoiceNumber}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${channelBadge}`}>
                          {col.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
                          {formatETB(col.amountReceived)}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', letterSpacing: '0.04em' }}>
                          {col.bankReference}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {formatETB(col.remainingCustomerBalance)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {col.receivedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OUTSTANDING RECEIVABLES DUE */}
      {activeTab === 'receivables' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Customer Receivables & Unpaid Invoices (AR)</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Click <strong>"Collect Payment"</strong> to simulate receiving funds via Telebirr or bank transfer.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Due Date</th>
                  <th>Customer & TIN</th>
                  <th>Order Reference</th>
                  <th>Grand Total</th>
                  <th>Paid So Far</th>
                  <th>Balance Due</th>
                  <th>Credit Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices.map((inv) => {
                  const customer = customers.find((c) => c.id === inv.customerId);
                  const availCredit = customer ? customer.creditLimit - customer.outstandingBalance : 0;

                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{inv.invoiceNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Due: {inv.dueDate}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                          TIN: {inv.customerTin}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#818cf8' }}>{inv.orderNumber}</span>
                      </td>
                      <td>{formatETB(inv.grandTotal)}</td>
                      <td style={{ color: '#34d399' }}>{formatETB(inv.paidAmount)}</td>
                      <td>
                        <strong style={{ color: '#fb7185', fontSize: '1rem' }}>
                          {formatETB(inv.balanceDue)}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Avail Credit: {formatETB(availCredit)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{
                            background: '#06b6d4',
                            color: '#ffffff',
                            padding: '6px 12px',
                          }}
                          onClick={() => handleOpenCollectFor(inv)}
                        >
                          <CreditCard size={13} />
                          <span>Collect Payment</span>
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

      {/* TAB 3: ETHIOPIAN GATEWAY BREAKDOWN */}
      {activeTab === 'channels' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Telebirr Card */}
          <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={20} color="#06b6d4" />
                <h3>Telebirr Merchant Gateway</h3>
              </div>
              <span className="badge badge-cyan">Instant</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#67e8f9', margin: '8px 0' }}>
              {formatETB(telebirrTotal)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Ethio Telecom mobile money payments. Used predominantly for rapid retail, commercial fleet wraps (Ride), and walk-in signage orders.
            </p>
          </div>

          {/* CBE Card */}
          <div className="card" style={{ borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#a855f7" />
                <h3>CBE / Bank Wire Transfer</h3>
              </div>
              <span className="badge badge-purple">Corporate</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d8b4fe', margin: '8px 0' }}>
              {formatETB(bankTotal)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Commercial Bank of Ethiopia & Awash Bank direct RTGS transfers. Used for large corporate tenders (Awash Bank, Ethiopian Airlines).
            </p>
          </div>

          {/* Chapa Card */}
          <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#6366f1" />
                <h3>Chapa Payment Gateway</h3>
              </div>
              <span className="badge badge-primary">Digital Web</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a5b4fc', margin: '8px 0' }}>
              {formatETB(chapaTotal)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Unified payment processing supporting Visa, Mastercard, and multi-bank mobile checkout integrations.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: RECORD COLLECTION */}
      {showCollectModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} color="#06b6d4" />
                <h3>Record Payment Collection</h3>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
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
            <form onSubmit={handleSubmitCollection}>
              <div className="modal-body">
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Customer:</span>
                    <strong style={{ color: '#ffffff' }}>{selectedInvoice.customerName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Invoice #:</span>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Invoice Total:</span>
                    <span>{formatETB(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, color: '#fb7185', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span>Remaining Balance Due:</span>
                    <span>{formatETB(selectedInvoice.balanceDue)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method Channel *</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => {
                      const m = e.target.value as PaymentMethod;
                      setPaymentMethod(m);
                      if (m === 'telebirr') setBankRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
                      else if (m === 'chapa') setBankRef(`CHP-${Math.floor(1000000 + Math.random() * 9000000)}`);
                      else if (m === 'bank_transfer') setBankRef(`CBE-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
                      else setBankRef(`CASH-REF-${Math.floor(1000 + Math.random() * 9000)}`);
                    }}
                  >
                    <option value="telebirr">Telebirr (Ethio Telecom Mobile Money)</option>
                    <option value="bank_transfer">CBE / Bank Wire Transfer (Commercial Bank of Ethiopia)</option>
                    <option value="chapa">Chapa Payment Gateway</option>
                    <option value="cash">Direct Cash at Front Desk</option>
                    <option value="cheque">Bank Certified Cheque / CPO</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Collected (ETB) *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedInvoice.balanceDue}
                    step="any"
                    className="form-input"
                    value={amountToCollect}
                    onChange={(e) => setAmountToCollect(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction / Bank Reference ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Collector Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={collectorNotes}
                    onChange={(e) => setCollectorNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCollectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#06b6d4', color: '#ffffff' }}
                >
                  Confirm & Post Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
