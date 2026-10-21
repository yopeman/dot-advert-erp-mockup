'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  Receipt,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  Printer,
  Building2,
  FileText,
  AlertTriangle,
  QrCode,
  X,
  CreditCard,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Landmark,
  BadgePercent,
  Download,
  Smartphone,
  Banknote,
  FileCheck2,
  Wallet,
} from 'lucide-react';
import { InvoiceType, Invoice, Customer, ProformaInvoice, ProformaStatus, PaymentMethod, Collection } from '@/types/erp';

function SalesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab =
    (searchParams.get('tab') as 'invoices' | 'proformas' | 'collections' | 'customers' | 'vat_reports') || 'invoices';

  const {
    invoices,
    proformas,
    customers,
    orders,
    collections,
    createInvoice,
    createProforma,
    updateProformaStatus,
    convertProformaToInvoice,
    recordCollection,
    companyFinancials,
  } = useErp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vat_15' | 'non_vat_exempt'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'partially_paid' | 'paid'>('all');
  const [proformaStatusFilter, setProformaStatusFilter] = useState<'all' | ProformaStatus>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | PaymentMethod>('all');

  // Modals
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showNewProformaModal, setShowNewProformaModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewProforma, setPreviewProforma] = useState<ProformaInvoice | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<Collection | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Invoice Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('vat_15');
  const [exemptReason, setExemptReason] = useState('Government Public Agency Exemption Directive 24/2025');
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-11-25');
  const [invoiceNotes, setInvoiceNotes] = useState('Payment due within agreed credit term window.');

  // New Proforma Form State
  const [proformaCustomerId, setProformaCustomerId] = useState<string>(customers[0]?.id || '');
  const [proformaValidDays, setProformaValidDays] = useState(15);
  const [proformaItemDesc, setProformaItemDesc] = useState('');
  const [proformaItemQty, setProformaItemQty] = useState(1);
  const [proformaItemUnit, setProformaItemUnit] = useState('pcs');
  const [proformaItemPrice, setProformaItemPrice] = useState(25000);
  const [proformaNotes, setProformaNotes] = useState('Prices valid for 15 days. 50% advance on PO confirmation.');

  // Collection Form State
  const [selectedInvoiceIdForCollect, setSelectedInvoiceIdForCollect] = useState<string>(
    invoices.find((i) => i.balanceDue > 0)?.id || invoices[0]?.id || ''
  );
  const [amountToCollect, setAmountToCollect] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [bankRef, setBankRef] = useState('TB-8921092837');
  const [collectorNotes, setCollectorNotes] = useState('Payment verified via digital confirmation.');

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const setTab = (tab: string) => {
    router.push(`/sales?tab=${tab}`);
  };

  // Stats
  const totalInvoicedGross = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalOutstandingBalance = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalCollectedAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalProformaValue = proformas.reduce((sum, p) => sum + p.grandTotal, 0);

  // Group Collections by Channel
  const telebirrTotal = collections
    .filter((c) => c.paymentMethod === 'telebirr')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const bankTotal = collections
    .filter((c) => c.paymentMethod === 'bank_transfer')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const cashTotal = collections
    .filter((c) => c.paymentMethod === 'cash')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  const chapaTotal = collections
    .filter((c) => c.paymentMethod === 'chapa')
    .reduce((sum, c) => sum + c.amountReceived, 0);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.orderNumber.toLowerCase().includes(q) ||
        inv.customerTin.toLowerCase().includes(q);

      const matchesType = typeFilter === 'all' || inv.invoiceType === typeFilter;
      const matchesPayment = paymentFilter === 'all' || inv.paymentStatus === paymentFilter;
      return matchesSearch && matchesType && matchesPayment;
    });
  }, [invoices, searchQuery, typeFilter, paymentFilter]);

  // Filtered Proformas
  const filteredProformas = useMemo(() => {
    return proformas.filter((prof) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        prof.proformaNumber.toLowerCase().includes(q) ||
        prof.customerName.toLowerCase().includes(q) ||
        prof.customerTin.toLowerCase().includes(q);

      const matchesStatus = proformaStatusFilter === 'all' || prof.status === proformaStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proformas, searchQuery, proformaStatusFilter]);

  // Filtered Collections
  const filteredCollections = useMemo(() => {
    return collections.filter((col) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        col.receiptNumber.toLowerCase().includes(q) ||
        col.customerName.toLowerCase().includes(q) ||
        col.invoiceNumber.toLowerCase().includes(q) ||
        col.bankReference.toLowerCase().includes(q);

      const matchesChannel = channelFilter === 'all' || col.paymentMethod === channelFilter;
      return matchesSearch && matchesChannel;
    });
  }, [collections, searchQuery, channelFilter]);

  // Open Collect Modal for a specific Invoice
  const handleOpenCollectForInvoice = (invoice: Invoice) => {
    setSelectedInvoiceIdForCollect(invoice.id);
    setAmountToCollect(invoice.balanceDue);
    setPaymentMethod('telebirr');
    setBankRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
    setCollectorNotes(`Payment for ${invoice.invoiceNumber}`);
    setShowCollectModal(true);
  };

  // Open Collect Modal for a specific Customer
  const handleOpenCollectForCustomer = (cust: Customer) => {
    const custInvoice = invoices.find((i) => i.customerId === cust.id && i.balanceDue > 0);
    if (custInvoice) {
      handleOpenCollectForInvoice(custInvoice);
    } else {
      const anyInvoice = invoices.find((i) => i.customerId === cust.id) || invoices[0];
      if (anyInvoice) {
        setSelectedInvoiceIdForCollect(anyInvoice.id);
        setAmountToCollect(cust.outstandingBalance);
        setPaymentMethod('telebirr');
        setBankRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
        setCollectorNotes(`Customer balance settlement for ${cust.name}`);
        setShowCollectModal(true);
      }
    }
  };

  // Handle Collection Submission
  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceIdForCollect);
    if (!inv || amountToCollect <= 0) return;

    recordCollection({
      invoiceId: inv.id,
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

  // Handle New Invoice Submit
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOrder = orders.find((o) => o.id === selectedOrderId);
    const parentCustomer = customers.find((c) => c.id === selectedOrder?.customerId);
    if (!selectedOrder || !parentCustomer) return;

    const subtotal = selectedOrder.totalAgreedPrice || 10000;
    const vat = invoiceType === 'vat_15' ? subtotal * 0.15 : 0;
    const grand = subtotal + vat;

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
      subtotalNet: subtotal,
      vatAmount: vat,
      grandTotal: grand,
      notes: invoiceNotes,
    });

    setShowNewInvoiceModal(false);
    setPreviewInvoice(newInv);
    setNotification(`Invoice ${newInv.invoiceNumber} generated! (${invoiceType === 'vat_15' ? '15% VAT' : 'Exempt Sale'})`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle New Proforma Submit
  const handleCreateProforma = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === proformaCustomerId);
    if (!cust) return;

    const subtotal = proformaItemQty * proformaItemPrice;
    const vat = subtotal * 0.15;
    const grand = subtotal + vat;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + proformaValidDays);

    const newProf = createProforma({
      validUntil: validUntilDate.toISOString().split('T')[0],
      customerId: cust.id,
      customerName: cust.name,
      customerTin: cust.tin,
      customerAddress: cust.address,
      invoiceType: 'vat_15',
      items: [
        {
          description: proformaItemDesc || 'Advertising Signage & Brand Production Quotation',
          quantity: proformaItemQty,
          unit: proformaItemUnit as any,
          unitPrice: proformaItemPrice,
          discount: 0,
          taxableAmount: subtotal,
          vatAmount: vat,
          totalAmount: grand,
        },
      ],
      subtotalNet: subtotal,
      vatAmount: vat,
      grandTotal: grand,
      notes: proformaNotes,
    });

    setShowNewProformaModal(false);
    setPreviewProforma(newProf);
    setNotification(`Proforma Quotation ${newProf.proformaNumber} generated for ${cust.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle 1-Click Proforma Conversion
  const handleConvertProforma = (proformaId: string) => {
    const inv = convertProformaToInvoice(proformaId);
    if (inv) {
      setPreviewInvoice(inv);
      setNotification(`Proforma successfully converted to Official Tax Invoice ${inv.invoiceNumber}!`);
      setTimeout(() => setNotification(null), 4500);
    }
  };

  const selectedInvoiceForForm = invoices.find((i) => i.id === selectedInvoiceIdForCollect);

  return (
    <div>
      {/* Top Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="hero-pill">
                MODULE 3 • COMMERCIAL DESK
              </span>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                • Dual 15% VAT, Telebirr & CBE Reconciled
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Customer Invoicing, Credit Limits & Digital Collections
            </h1>
            <p style={{ fontSize: '0.825rem', color: '#a1a1aa', margin: '6px 0 0', maxWidth: '640px' }}>
              Issue certified tax invoices, manage customer proformas, track overdue accounts receivable, and log real-time digital receipts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ background: '#18181b', color: '#ffffff', borderColor: '#27272a' }}
              onClick={() => {
                const firstDue = invoices.find((i) => i.balanceDue > 0) || invoices[0];
                if (firstDue) handleOpenCollectForInvoice(firstDue);
              }}
            >
              <CreditCard size={14} color="#facc15" />
              <span>+ Record Collection</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ background: '#18181b', color: '#ffffff', borderColor: '#27272a' }}
              onClick={() => setShowNewProformaModal(true)}
            >
              <FileSpreadsheet size={14} color="#facc15" />
              <span>+ New Proforma</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewInvoiceModal(true)}
            >
              <PlusCircle size={14} />
              <span>+ Issue Tax Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            background: '#ecfdf5',
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
          <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>
            {notification}
          </span>
        </div>
      )}

      {/* Primary KPI Stats */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-title">
            <span>Net Invoiced Revenue (Excl. VAT)</span>
            <Receipt size={16} color="#71717a" />
          </div>
          <div className="stat-card-value">{formatETB(companyFinancials.totalRevenueNet)}</div>
          <div className="stat-card-subtext">
            <span>Core operational revenue basis</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Output VAT (15% MoR Liability)</span>
            <ShieldCheck size={16} color="#ca8a04" />
          </div>
          <div className="stat-card-value" style={{ color: '#854d0e' }}>
            {formatETB(companyFinancials.totalOutputVat)}
          </div>
          <div className="stat-card-subtext">
            <span>Collected on behalf of Ministry of Revenues</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Reconciled Collections</span>
            <Wallet size={16} color="#10b981" />
          </div>
          <div className="stat-card-value" style={{ color: '#10b981' }}>
            {formatETB(companyFinancials.totalCollected)}
          </div>
          <div className="stat-card-subtext">
            <span>{collections.length} digital receipts via Telebirr & CBE</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Outstanding Due (AR Balance)</span>
            <AlertTriangle size={16} color="#b45309" />
          </div>
          <div className="stat-card-value" style={{ color: '#b45309' }}>
            {formatETB(totalOutstandingBalance)}
          </div>
          <div className="stat-card-subtext">
            <span>Pending receivables across {customers.length} client accounts</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setTab('invoices')}
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
        >
          <Receipt size={16} color={activeTab === 'invoices' ? '#854d0e' : '#71717a'} />
          <span>Invoices Ledger</span>
          <span className="badge badge-gray">{invoices.length}</span>
        </button>

        <button
          onClick={() => setTab('proformas')}
          className={`tab-btn ${activeTab === 'proformas' ? 'active' : ''}`}
        >
          <FileSpreadsheet size={16} color={activeTab === 'proformas' ? '#854d0e' : '#71717a'} />
          <span>Proformas & Quotations</span>
          <span className="badge badge-gray">{proformas.length}</span>
        </button>

        <button
          onClick={() => setTab('collections')}
          className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
        >
          <CreditCard size={16} color={activeTab === 'collections' ? '#854d0e' : '#71717a'} />
          <span>Collections & Receipts</span>
          <span className="badge badge-emerald">{collections.length}</span>
        </button>

        <button
          onClick={() => setTab('customers')}
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
        >
          <Users size={16} color={activeTab === 'customers' ? '#854d0e' : '#71717a'} />
          <span>Customer Accounts & Credit</span>
          <span className="badge badge-gray">{customers.length}</span>
        </button>

        <button
          onClick={() => setTab('vat_reports')}
          className={`tab-btn ${activeTab === 'vat_reports' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} color={activeTab === 'vat_reports' ? '#854d0e' : '#71717a'} />
          <span>MoR VAT Compliance</span>
          <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontWeight: 700 }}>MoR 15%</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INVOICES LEDGER                                   */}
      {/* ======================================================== */}
      {activeTab === 'invoices' && (
        <div className="card">
          {/* Controls Bar */}
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
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
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
                  placeholder="Search invoice #, client, order, or TIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.82rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-bright)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tax Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tax:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  style={{
                    padding: '7px 10px',
                    fontSize: '0.78rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-bright)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Tax Regimes</option>
                  <option value="vat_15">Standard 15% VAT</option>
                  <option value="non_vat_exempt">Non-VAT Exempt</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Status:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  style={{
                    padding: '7px 10px',
                    fontSize: '0.78rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-bright)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="unpaid">Unpaid Only</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid in Full</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Showing <strong>{filteredInvoices.length}</strong> of <strong>{invoices.length}</strong> Invoices
            </div>
          </div>

          {/* Invoices Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date & Due</th>
                  <th>Customer & TIN</th>
                  <th>Order Ref</th>
                  <th>Tax Regime</th>
                  <th style={{ textAlign: 'right' }}>Net Subtotal</th>
                  <th style={{ textAlign: 'right' }}>15% VAT</th>
                  <th style={{ textAlign: 'right' }}>Grand Total</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th style={{ textAlign: 'right' }}>Balance Due</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                      No invoices found matching current search and filters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#c084fc',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Receipt size={13} />
                          <span>{inv.invoiceNumber}</span>
                        </button>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{inv.date}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due: {inv.dueDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inv.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          TIN: {inv.customerTin}
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/orders`}
                          style={{
                            fontSize: '0.78rem',
                            fontFamily: 'monospace',
                            color: '#09090b',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          {inv.orderNumber}
                        </Link>
                      </td>
                      <td>
                        {inv.invoiceType === 'vat_15' ? (
                          <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontSize: '0.7rem', fontWeight: 700 }}>
                            15% Standard VAT
                          </span>
                        ) : (
                          <div>
                            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                              Exempt Sale
                            </span>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {inv.exemptReason || 'Legal Directive Exemption'}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatETB(inv.subtotalNet)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: inv.vatAmount > 0 ? '#ca8a04' : 'var(--text-muted)', fontWeight: 600 }}>
                        {inv.vatAmount > 0 ? formatETB(inv.vatAmount) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-main)' }}>
                        {formatETB(inv.grandTotal)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            inv.paymentStatus === 'paid'
                              ? 'badge-emerald'
                              : inv.paymentStatus === 'partially_paid'
                              ? 'badge-amber'
                              : 'badge-red'
                          }`}
                        >
                          {inv.paymentStatus === 'paid'
                            ? 'Paid in Full'
                            : inv.paymentStatus === 'partially_paid'
                            ? 'Partially Paid'
                            : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: inv.balanceDue > 0 ? 600 : 400, color: inv.balanceDue > 0 ? '#fbbf24' : '#10b981' }}>
                        {formatETB(inv.balanceDue)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="btn btn-secondary btn-sm"
                            title="Print / View MoR Official Invoice"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            <Printer size={12} />
                            <span>Print</span>
                          </button>
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenCollectForInvoice(inv)}
                              className="btn btn-primary btn-sm"
                              title="Record Collection for this Invoice"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#059669', borderColor: '#059669' }}
                            >
                              <CreditCard size={12} />
                              <span>Collect</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PROFORMAS & QUOTATIONS                           */}
      {/* ======================================================== */}
      {activeTab === 'proformas' && (
        <div>
          {/* Controls Bar */}
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
                  placeholder="Search proforma #, client, or TIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.82rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-bright)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Status:</span>
                <select
                  value={proformaStatusFilter}
                  onChange={(e) => setProformaStatusFilter(e.target.value as any)}
                  style={{
                    padding: '7px 10px',
                    fontSize: '0.78rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-bright)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Proformas</option>
                  <option value="sent">Sent (Awaiting PO)</option>
                  <option value="accepted">Accepted / Approved</option>
                  <option value="converted">Converted to Tax Invoice</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewProformaModal(true)}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              }}
            >
              <PlusCircle size={14} />
              <span>+ Issue New Proforma</span>
            </button>
          </div>

          {/* Ethiopian B2B Proforma Context Notice */}
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  flexShrink: 0,
                }}
              >
                <FileSpreadsheet size={18} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <strong style={{ color: '#ffffff' }}>Commercial Proforma Workflow:</strong> Ethiopian corporate clients & banks require proformas before issuing POs or transferring advance deposits. Once approved, click <strong>&quot;Convert to Tax Invoice&quot;</strong> to issue the official MoR fiscal invoice.
              </div>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '4px 10px',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              1-Click Conversion Active
            </span>
          </div>

          {/* Proformas Table */}
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Proforma #</th>
                    <th>Date Issued</th>
                    <th>Valid Until</th>
                    <th>Customer & TIN</th>
                    <th>Items Scope</th>
                    <th style={{ textAlign: 'right' }}>Subtotal Net</th>
                    <th style={{ textAlign: 'right' }}>15% VAT</th>
                    <th style={{ textAlign: 'right' }}>Grand Total</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Conversion Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProformas.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                        No proformas found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProformas.map((prof) => {
                      const isConverted = prof.status === 'converted';
                      return (
                        <tr key={prof.id}>
                          <td>
                            <button
                              onClick={() => setPreviewProforma(prof)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#38bdf8',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <FileSpreadsheet size={13} />
                              <span>{prof.proformaNumber}</span>
                            </button>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{prof.date}</td>
                          <td>
                            <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              <span>{prof.validUntil}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{prof.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              TIN: {prof.customerTin}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prof.items[0]?.description || 'Custom Signage Fabrication'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {prof.items.length} Line Item{prof.items.length > 1 ? 's' : ''}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatETB(prof.subtotalNet)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#854d0e', fontWeight: 600 }}>
                            {formatETB(prof.vatAmount)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-main)' }}>
                            {formatETB(prof.grandTotal)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${
                                prof.status === 'converted'
                                  ? 'badge-emerald'
                                  : prof.status === 'accepted'
                                  ? 'badge-blue'
                                  : prof.status === 'sent'
                                  ? 'badge-amber'
                                  : 'badge-gray'
                              }`}
                            >
                              {prof.status === 'converted'
                                ? '✓ Converted to Tax Invoice'
                                : prof.status === 'accepted'
                                ? 'Client Accepted'
                                : prof.status === 'sent'
                                ? 'Sent / Pending PO'
                                : 'Draft'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button
                                onClick={() => setPreviewProforma(prof)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                title="View Quotation"
                              >
                                <Printer size={12} />
                                <span>Preview</span>
                              </button>

                              {!isConverted ? (
                                <button
                                  onClick={() => handleConvertProforma(prof.id)}
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    borderColor: '#10b981',
                                  }}
                                  title="1-Click Convert to MoR Tax Invoice"
                                >
                                  <Sparkles size={12} />
                                  <span>Convert to Invoice</span>
                                </button>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    color: '#10b981',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Invoiced</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COLLECTIONS & DIGITAL RECEIPTS                    */}
      {/* ======================================================== */}
      {activeTab === 'collections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Payment Channel Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Telebirr Merchant
                </span>
                <Smartphone size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(telebirrTotal)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Instant API reconciled via Ethio Telecom
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                  Commercial Banks (CBE / Awash)
                </span>
                <Building2 size={16} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(bankTotal)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Wire transfers & RTGS corporate settlements
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                  Cashier Cash
                </span>
                <Banknote size={16} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(cashTotal)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Counter cash receipts with physical deposit
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #09090b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#09090b', textTransform: 'uppercase' }}>
                  Total Collected To Date
                </span>
                <Wallet size={16} color="#ca8a04" />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.totalCollected)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {collections.length} reconciled digital receipt vouchers
              </div>
            </div>
          </div>

          {/* Receipts Table Card */}
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
                    placeholder="Search receipt #, client, invoice, or bank ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      fontSize: '0.82rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Channel Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Channel:</span>
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value as any)}
                    style={{
                      padding: '7px 10px',
                      fontSize: '0.78rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">All Payment Channels</option>
                    <option value="telebirr">Telebirr Merchant</option>
                    <option value="bank_transfer">CBE / Bank Transfer</option>
                    <option value="cash">Counter Cash</option>
                    <option value="chapa">Chapa Gateway</option>
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const firstDue = invoices.find((i) => i.balanceDue > 0) || invoices[0];
                  if (firstDue) handleOpenCollectForInvoice(firstDue);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                <PlusCircle size={14} />
                <span>+ Record Collection Voucher</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Invoice Settled</th>
                    <th style={{ textAlign: 'right' }}>Amount Received</th>
                    <th style={{ textAlign: 'center' }}>Payment Channel</th>
                    <th>Transaction / Bank Ref</th>
                    <th style={{ textAlign: 'right' }}>Remaining Balance</th>
                    <th>Cashier / Collector</th>
                    <th style={{ textAlign: 'center' }}>Voucher</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollections.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                        No collection records found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCollections.map((col) => (
                      <tr key={col.id}>
                        <td>
                          <button
                            onClick={() => setPreviewReceipt(col)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#10b981',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <FileCheck2 size={13} />
                            <span>{col.receiptNumber}</span>
                          </button>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{col.date}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{col.customerName}</td>
                        <td>
                          <span style={{ fontFamily: 'monospace', color: '#c084fc', fontSize: '0.8rem' }}>
                            {col.invoiceNumber}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                          {formatETB(col.amountReceived)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`badge ${
                              col.paymentMethod === 'telebirr'
                                ? 'badge-emerald'
                                : col.paymentMethod === 'bank_transfer'
                                ? 'badge-blue'
                                : 'badge-amber'
                            }`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {col.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.72rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {col.bankReference}
                          </code>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: col.remainingCustomerBalance > 0 ? '#fbbf24' : '#10b981' }}>
                          {formatETB(col.remainingCustomerBalance)}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{col.receivedBy}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => setPreviewReceipt(col)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            title="Print Cash Receipt Voucher"
                          >
                            <Printer size={12} />
                            <span>Voucher</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CUSTOMER ACCOUNTS & CREDIT LIMITS                 */}
      {/* ======================================================== */}
      {activeTab === 'customers' && (
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
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Corporate Accounts & Credit Limit Management
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Credit utilization, tax identification numbers, and receivables aging across accounts
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setTab('collections')}
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}
              >
                <CreditCard size={14} />
                <span>View Collections Ledger</span>
              </button>
              <Link href="/crm" className="btn btn-secondary btn-sm">
                <Users size={14} />
                <span>Go to CRM Pipeline</span>
              </Link>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Organization</th>
                  <th>TIN & VAT Reg</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Credit Limit</th>
                  <th style={{ textAlign: 'right' }}>Outstanding AR</th>
                  <th style={{ width: '180px' }}>Credit Utilization</th>
                  <th>Payment Terms</th>
                  <th>Contact Person</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const creditLimit = c.creditLimit || 500000;
                  const ratio = Math.min(100, Math.round((c.outstandingBalance / creditLimit) * 100));
                  const isHighRisk = ratio >= 90;
                  const isMedRisk = ratio >= 60;

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.address}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#854d0e' }}>TIN: {c.tin}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {c.isVatRegistered ? '✓ VAT Registered' : 'Non-VAT Entity'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>
                          {c.customerType?.toUpperCase() || 'BUSINESS'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                        {formatETB(creditLimit)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: c.outstandingBalance > 0 ? '#b45309' : '#10b981' }}>
                        {formatETB(c.outstandingBalance)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{ratio}% Used</span>
                          <span style={{ fontSize: '0.68rem', color: isHighRisk ? '#ef4444' : isMedRisk ? '#b45309' : '#10b981', fontWeight: 600 }}>
                            {formatETB(Math.max(0, creditLimit - c.outstandingBalance))} left
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: '#e4e4e7',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${ratio}%`,
                              height: '100%',
                              background: isHighRisk
                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                : isMedRisk
                                ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                                : '#10b981',
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                          {c.paymentTerms || 'Net 30 Days'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>{c.contactPerson}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setProformaCustomerId(c.id);
                              setShowNewProformaModal(true);
                            }}
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            title="Issue Proforma"
                          >
                            <PlusCircle size={12} />
                            <span>Quote</span>
                          </button>
                          {c.outstandingBalance > 0 && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenCollectForCustomer(c)}
                              style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#059669', borderColor: '#059669' }}
                              title="Collect Outstanding Balance"
                            >
                              <CreditCard size={12} />
                              <span>Collect</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MoR VAT COMPLIANCE & TAX REGISTER                 */}
      {/* ======================================================== */}
      {activeTab === 'vat_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Official Ministry Header */}
          <div
            style={{
              padding: '18px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(14, 17, 29, 0.8) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                }}
              >
                <Landmark size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Federal Democratic Republic of Ethiopia • Ministry of Revenues (MoR)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Electronic Value Added Tax (VAT) Register & Periodic Filing Schedule • VAT Rate: 15.0%
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Taxpayer Identification No.</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>
                  TIN: 0048291048
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                <Download size={14} />
                <span>Export MoR Schedule</span>
              </button>
            </div>
          </div>

          {/* 3-Box Tax Formula Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ borderLeft: '4px solid #ca8a04' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>
                  Box A • Output VAT Collected
                </span>
                <BadgePercent size={16} color="#ca8a04" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.totalOutputVat)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                15% VAT charged to commercial clients on sales invoices
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #71717a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                  Box B • Input VAT Deductible
                </span>
                <ShieldCheck size={16} color="#71717a" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.totalInputVat || companyFinancials.totalOutputVat * 0.42)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                15% VAT paid on raw materials (acrylic, vinyl, aluminum profiles)
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Box C • Net VAT Payable to MoR
                </span>
                <Landmark size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.netVatPayable || companyFinancials.totalOutputVat * 0.58)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Remittance due to Ministry of Revenues by the 30th of each month
              </div>
            </div>
          </div>

          {/* Official MoR Filing Table Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Official Monthly VAT Declaration Schedule Breakdown
            </h3>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Line Code</th>
                  <th>Description of Goods / Services</th>
                  <th style={{ textAlign: 'right' }}>Taxable Sales (Net ETB)</th>
                  <th style={{ textAlign: 'center' }}>Applicable Rate</th>
                  <th style={{ textAlign: 'right' }}>VAT Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>01</td>
                  <td>Standard Rated Supplies (Large-Format Printing, Fabrication, Billboards)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(companyFinancials.totalRevenueNet * 0.82)}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontWeight: 700 }}>15.0%</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#ca8a04' }}>
                    {formatETB(companyFinancials.totalOutputVat)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>02</td>
                  <td>Zero-Rated Supplies (Direct Export Services)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>ETB 0</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-blue">0.0%</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>ETB 0</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>03</td>
                  <td>Exempt Supplies (Government Agency Directive 24/2025 & NGO Grants)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(companyFinancials.totalRevenueNet * 0.18)}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-amber">Exempt</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>ETB 0</td>
                </tr>
                <tr style={{ background: 'var(--bg-app)', fontWeight: 700 }}>
                  <td style={{ fontFamily: 'monospace' }}>04</td>
                  <td>TOTAL TAXABLE & EXEMPT TURNOVER</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 800 }}>
                    {formatETB(companyFinancials.totalRevenueNet)}
                  </td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#ca8a04', fontWeight: 800 }}>
                    {formatETB(companyFinancials.totalOutputVat)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>05</td>
                  <td>Less: Input VAT Paid on Local Purchases (Deductible under Art. 21)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>—</td>
                  <td style={{ textAlign: 'center' }}>15.0%</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#38bdf8' }}>
                    -{formatETB(companyFinancials.totalInputVat || companyFinancials.totalOutputVat * 0.42)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>06</td>
                  <td>Less: Withholding Tax (2% Withheld by Government Enterprises)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>—</td>
                  <td style={{ textAlign: 'center' }}>2.0% WHT</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24' }}>
                    -{formatETB(companyFinancials.totalRevenueNet * 0.02)}
                  </td>
                </tr>
                <tr style={{ background: 'rgba(16, 185, 129, 0.08)', fontWeight: 800 }}>
                  <td style={{ fontFamily: 'monospace', color: '#10b981' }}>07</td>
                  <td style={{ color: '#10b981' }}>NET VALUE ADDED TAX PAYABLE TO MINISTRY OF REVENUES</td>
                  <td style={{ textAlign: 'right' }}>—</td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem', color: '#10b981' }}>
                    {formatETB(companyFinancials.netVatPayable || companyFinancials.totalOutputVat * 0.58)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ISSUE NEW TAX INVOICE                           */}
      {/* ======================================================== */}
      {showNewInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#f3e8ff',
                    border: '1px solid #e9d5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7e22ce',
                    flexShrink: 0,
                  }}
                >
                  <Receipt size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Issue Official Tax Invoice
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ethiopian MoR Compliant Invoice with Dual VAT / Exemption
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Select Order */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Finished / Delivered Order *</label>
                  <select
                    className="form-select"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.customerName} ({formatETB(o.totalAgreedPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tax Regime Selector */}
                <div>
                  <label className="form-label">Tax Regime *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setInvoiceType('vat_15')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: invoiceType === 'vat_15' ? '2px solid #7e22ce' : '1px solid var(--border-subtle)',
                        background: invoiceType === 'vat_15' ? '#faf5ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>Standard 15% VAT</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        MoR commercial invoice with 15% output VAT collected
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInvoiceType('non_vat_exempt')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: invoiceType === 'non_vat_exempt' ? '2px solid #b45309' : '1px solid var(--border-subtle)',
                        background: invoiceType === 'non_vat_exempt' ? '#fffbeb' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>Non-VAT Exempt Sale</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Government directive or NGO aid exemption
                      </div>
                    </button>
                  </div>
                </div>

                {/* Exemption Reason if Exempt */}
                {invoiceType === 'non_vat_exempt' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#b45309' }}>
                      Exemption Legal Citation / Directive Reference
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={exemptReason}
                      onChange={(e) => setExemptReason(e.target.value)}
                      placeholder="e.g. Directive No. 24/2025 MoR Public Enterprise Exemption"
                      style={{ borderColor: '#b45309' }}
                    />
                  </div>
                )}

                {/* Due Date */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                  />
                </div>

                {/* Invoice Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Instructions / Bank Ref</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                  />
                </div>

                {/* Financial Summary Preview */}
                <div
                  style={{
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Order Amount Net:</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 600 }}>
                      {formatETB(orders.find((o) => o.id === selectedOrderId)?.totalAgreedPrice || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>15% VAT:</span>
                    <span style={{ fontFamily: 'monospace', color: invoiceType === 'vat_15' ? '#7e22ce' : 'var(--text-muted)', fontWeight: 600 }}>
                      {invoiceType === 'vat_15'
                        ? formatETB((orders.find((o) => o.id === selectedOrderId)?.totalAgreedPrice || 0) * 0.15)
                        : 'ETB 0 (Exempt)'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '6px',
                      marginTop: '4px',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>Total Invoiced Gross:</span>
                    <span style={{ fontFamily: 'monospace', color: '#047857' }}>
                      {formatETB(
                        (orders.find((o) => o.id === selectedOrderId)?.totalAgreedPrice || 0) *
                          (invoiceType === 'vat_15' ? 1.15 : 1)
                      )}
                    </span>
                  </div>
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
                  <CheckCircle2 size={15} />
                  <span>Generate & Save Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ISSUE NEW PROFORMA QUOTATION                     */}
      {/* ======================================================== */}
      {showNewProformaModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#ecfeff',
                    border: '1px solid #a5f3fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0e7490',
                    flexShrink: 0,
                  }}
                >
                  <FileSpreadsheet size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Issue Proforma Quotation
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Commercial quotation for client budgeting & PO issuance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewProformaModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProforma}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Select Customer */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Client Organization *</label>
                  <select
                    className="form-select"
                    value={proformaCustomerId}
                    onChange={(e) => setProformaCustomerId(e.target.value)}
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (TIN: {c.tin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validity Period */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Validity Period</label>
                  <select
                    className="form-select"
                    value={proformaValidDays}
                    onChange={(e) => setProformaValidDays(Number(e.target.value))}
                  >
                    <option value={7}>7 Calendar Days</option>
                    <option value={15}>15 Calendar Days (Standard)</option>
                    <option value={30}>30 Calendar Days</option>
                  </select>
                </div>

                {/* Item Description */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Scope / Line Item Description *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 3D LED Illuminated Acrylic Channel Letters Signage (6m x 1.2m)"
                    value={proformaItemDesc}
                    onChange={(e) => setProformaItemDesc(e.target.value)}
                  />
                </div>

                {/* Quantity & Unit Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={proformaItemQty}
                      onChange={(e) => setProformaItemQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit</label>
                    <select
                      className="form-select"
                      value={proformaItemUnit}
                      onChange={(e) => setProformaItemUnit(e.target.value)}
                    >
                      <option value="pcs">pcs</option>
                      <option value="m2">m²</option>
                      <option value="sets">sets</option>
                      <option value="rolls">rolls</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit Price (ETB)</label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      className="form-input"
                      style={{ fontFamily: 'monospace' }}
                      value={proformaItemPrice}
                      onChange={(e) => setProformaItemPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Terms / Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quotation Terms & Conditions</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={proformaNotes}
                    onChange={(e) => setProformaNotes(e.target.value)}
                  />
                </div>

                {/* Summary calculation */}
                <div
                  style={{
                    padding: '14px',
                    background: '#f0f9ff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal Net:</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 600 }}>
                      {formatETB(proformaItemQty * proformaItemPrice)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>15% VAT:</span>
                    <span style={{ fontFamily: 'monospace', color: '#7e22ce', fontWeight: 600 }}>
                      {formatETB(proformaItemQty * proformaItemPrice * 0.15)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderTop: '1px solid #bae6fd',
                      paddingTop: '6px',
                      marginTop: '4px',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>Quotation Grand Total:</span>
                    <span style={{ fontFamily: 'monospace', color: '#075985' }}>
                      {formatETB(proformaItemQty * proformaItemPrice * 1.15)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewProformaModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={15} />
                  <span>Issue Proforma Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RECORD PAYMENT COLLECTION                       */}
      {/* ======================================================== */}
      {showCollectModal && selectedInvoiceForForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#047857',
                    flexShrink: 0,
                  }}
                >
                  <CreditCard size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Record Collection Voucher
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Reconcile invoice payment & adjust customer credit balance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCollection}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Select Invoice */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Customer Invoice *</label>
                  <select
                    className="form-select"
                    value={selectedInvoiceIdForCollect}
                    onChange={(e) => {
                      setSelectedInvoiceIdForCollect(e.target.value);
                      const inv = invoices.find((i) => i.id === e.target.value);
                      if (inv) setAmountToCollect(inv.balanceDue);
                    }}
                    required
                  >
                    {invoices.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} - {i.customerName} (Due: {formatETB(i.balanceDue)} of {formatETB(i.grandTotal)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Invoice Status Snapshot */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '10px',
                    fontSize: '0.78rem',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Grand Total</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {formatETB(selectedInvoiceForForm.grandTotal)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Already Paid</div>
                    <div style={{ fontWeight: 700, color: '#047857', fontFamily: 'monospace' }}>
                      {formatETB(selectedInvoiceForForm.paidAmount)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Current Balance Due</div>
                    <div style={{ fontWeight: 700, color: '#b45309', fontFamily: 'monospace' }}>
                      {formatETB(selectedInvoiceForForm.balanceDue)}
                    </div>
                  </div>
                </div>

                {/* Amount to Collect */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Amount to Collect (ETB) *</label>
                    <button
                      type="button"
                      onClick={() => setAmountToCollect(selectedInvoiceForForm.balanceDue)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#047857',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Pay Full Balance ({formatETB(selectedInvoiceForForm.balanceDue)})
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedInvoiceForForm.balanceDue || selectedInvoiceForForm.grandTotal}
                    className="form-input"
                    style={{ borderColor: '#059669', fontFamily: 'monospace', fontWeight: 700 }}
                    value={amountToCollect}
                    onChange={(e) => setAmountToCollect(Number(e.target.value))}
                  />
                </div>

                {/* Payment Channel */}
                <div>
                  <label className="form-label">Payment Channel</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'telebirr', label: 'Telebirr', icon: Smartphone, color: '#059669' },
                      { id: 'bank_transfer', label: 'CBE / Wire', icon: Building2, color: '#2563eb' },
                      { id: 'cash', label: 'Counter Cash', icon: Banknote, color: '#b45309' },
                    ].map((ch) => {
                      const Icon = ch.icon;
                      const isSelected = paymentMethod === ch.id;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(ch.id as any);
                            if (ch.id === 'telebirr') {
                              setBankRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
                            } else if (ch.id === 'bank_transfer') {
                              setBankRef(`CBE-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
                            } else {
                              setBankRef(`CSH-REC-${Math.floor(1000 + Math.random() * 9000)}`);
                            }
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? `2px solid ${ch.color}` : '1px solid var(--border-subtle)',
                            background: isSelected ? '#f8fafc' : '#ffffff',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          <Icon size={14} color={ch.color} />
                          <span>{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank / Transaction Reference */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Transaction Reference / Telebirr Txn ID *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ fontFamily: 'monospace' }}
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Internal Reconciliation Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={collectorNotes}
                    onChange={(e) => setCollectorNotes(e.target.value)}
                    placeholder="e.g. Paid in full via Telebirr merchant code 948210"
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
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={15} />
                  <span>Confirm Payment & Print Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: PRINTABLE MOR TAX INVOICE PREVIEW               */}
      {/* ======================================================== */}
      {previewInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Action Bar (Top) */}
            <div
              style={{
                padding: '12px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <Printer size={16} />
                <span>Ministry of Revenues Official Tax Invoice Preview</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}
                >
                  <Printer size={14} />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Authentic Ethiopian Tax Invoice Document Body */}
            <div style={{ padding: '36px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {/* Company & Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '18px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#0f172a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                      }}
                    >
                      D
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      DOT ADVERT & COMMUNICATION PLC
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                    Large-Format Printing • CNC Fabrication • Neon & LED Signages<br />
                    Sub-City: Bole, Woreda: 03, House No: 412/A, Addis Ababa, Ethiopia<br />
                    Tel: +251 11 661 5522 / +251 91 123 4567 • Email: billing@dotadvert.et
                  </div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    <span>TIN: 0048291048</span>
                    <span>VAT REG: 9283741</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: previewInvoice.invoiceType === 'vat_15' ? '#0f172a' : '#475569',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                      marginBottom: '8px',
                    }}
                  >
                    {previewInvoice.invoiceType === 'vat_15' ? 'TAX INVOICE (VAT 15%)' : 'EXEMPT INVOICE'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {previewInvoice.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                    Date: <strong>{previewInvoice.date}</strong> • Due: <strong>{previewInvoice.dueDate}</strong>
                  </div>
                </div>
              </div>

              {/* Customer & Order Reference Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr',
                  gap: '20px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Invoiced Client (Purchaser):
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>
                    {previewInvoice.customerName}
                  </div>
                  <div style={{ color: '#475569', marginTop: '2px' }}>{previewInvoice.customerAddress}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
                    Customer TIN: {previewInvoice.customerTin}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Tax & Order Details:
                  </div>
                  <div style={{ marginTop: '2px', color: '#334155' }}>
                    Order Reference: <strong>{previewInvoice.orderNumber}</strong>
                  </div>
                  <div style={{ marginTop: '2px', color: '#334155' }}>
                    Tax Regime:{' '}
                    <strong>{previewInvoice.invoiceType === 'vat_15' ? 'Standard 15% VAT' : 'Non-VAT Exempt'}</strong>
                  </div>
                  {previewInvoice.exemptReason && (
                    <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '2px' }}>
                      Exemption: {previewInvoice.exemptReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', borderRadius: '4px 0 0 0' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Taxable Net</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>VAT (15%)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Total (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewInvoice.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', color: '#0f172a', fontWeight: 600 }}>{it.description}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>
                        {it.quantity} {it.unit}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatETB(it.unitPrice)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatETB(it.taxableAmount)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {previewInvoice.invoiceType === 'vat_15' ? formatETB(it.vatAmount) : 'Exempt'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                        {formatETB(it.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & QR Code Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* QR Code and Electronic Tax Certification */}
                <div
                  style={{
                    padding: '14px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      background: '#0f172a',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <QrCode size={48} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>
                    <strong style={{ color: '#0f172a' }}>FDRE Ministry of Revenues</strong>
                    <br />
                    Fiscal Machine E-Receipt Validated
                    <br />
                    Receipt Hash: <code>MOR-9482-AD-2026</code>
                    <br />
                    Device ID: DOT-MOR-BOLE-04
                  </div>
                </div>

                {/* Calculation Table */}
                <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Taxable Net Subtotal:</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                      {formatETB(previewInvoice.subtotalNet)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Value Added Tax (15%):</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                      {formatETB(previewInvoice.vatAmount)}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '2px solid #0f172a',
                      paddingTop: '6px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    <span>Grand Total:</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatETB(previewInvoice.grandTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '0.78rem' }}>
                    <span>Amount Paid:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{formatETB(previewInvoice.paidAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>Balance Due:</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatETB(previewInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569' }}>
                <div>
                  <div style={{ height: '36px' }} />
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontWeight: 600, color: '#0f172a' }}>
                    Prepared By: Billing Officer
                  </div>
                  <div>Dot Advert ERP Finance</div>
                </div>
                <div>
                  <div style={{ height: '36px' }} />
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontWeight: 600, color: '#0f172a' }}>
                    Authorized Signature
                  </div>
                  <div>General Manager / Finance</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      border: '2px dashed #94a3b8',
                      borderRadius: '50%',
                      margin: '0 auto 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                    }}
                  >
                    OFFICIAL STAMP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: PRINTABLE PROFORMA QUOTATION PREVIEW            */}
      {/* ======================================================== */}
      {previewProforma && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Action Bar (Top) */}
            <div
              style={{
                padding: '12px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}>
                <FileSpreadsheet size={16} />
                <span>Commercial Proforma Quotation Preview</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {previewProforma.status !== 'converted' && (
                  <button
                    onClick={() => {
                      handleConvertProforma(previewProforma.id);
                      setPreviewProforma(null);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                  >
                    <Sparkles size={14} />
                    <span>Convert to Invoice</span>
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPreviewProforma(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Proforma Document Body */}
            <div style={{ padding: '36px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '18px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                      }}
                    >
                      D
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      DOT ADVERT & COMMUNICATION PLC
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                    Large-Format Printing • CNC Fabrication • Neon & LED Signages<br />
                    Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia • TIN: 0048291048
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                      marginBottom: '8px',
                    }}
                  >
                    PROFORMA QUOTATION
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {previewProforma.proformaNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                    Date: <strong>{previewProforma.date}</strong> • Valid Until: <strong style={{ color: '#b45309' }}>{previewProforma.validUntil}</strong>
                  </div>
                </div>
              </div>

              {/* Customer Strip */}
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#0369a1', fontWeight: 700 }}>
                  Quotation Prepared For:
                </div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>
                  {previewProforma.customerName}
                </div>
                <div style={{ color: '#475569', marginTop: '2px' }}>{previewProforma.customerAddress}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
                  Customer TIN: {previewProforma.customerTin}
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#0284c7', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Subtotal Net</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>15% VAT</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewProforma.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', color: '#0f172a', fontWeight: 600 }}>{it.description}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>
                        {it.quantity} {it.unit}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatETB(it.unitPrice)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatETB(it.taxableAmount)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#0284c7' }}>
                        {formatETB(it.vatAmount)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                        {formatETB(it.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Banking Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Direct Bank Transfer Accounts:</div>
                  <div style={{ color: '#475569', lineHeight: 1.5 }}>
                    • Commercial Bank of Ethiopia (CBE): <strong>1000284719283</strong><br />
                    • Awash Bank S.C.: <strong>01320849204800</strong><br />
                    • Telebirr Merchant Code: <strong>948210 (Dot Advert)</strong>
                  </div>
                  {previewProforma.notes && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', color: '#64748b' }}>
                      <strong>Terms:</strong> {previewProforma.notes}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Subtotal Net:</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                      {formatETB(previewProforma.subtotalNet)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Value Added Tax (15%):</span>
                    <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>
                      {formatETB(previewProforma.vatAmount)}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '2px solid #0284c7',
                      paddingTop: '6px',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    <span>Quotation Total:</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatETB(previewProforma.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                <div>Sales Representative: Dot Advert Commercial Team</div>
                <div>Approved by: Commercial Director</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: PRINTABLE CASH RECEIPT VOUCHER PREVIEW          */}
      {/* ======================================================== */}
      {previewReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Action Bar */}
            <div
              style={{
                padding: '12px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>
                <FileCheck2 size={16} />
                <span>Official Cash Receipt Voucher (CRV)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#059669', borderColor: '#059669', color: '#ffffff' }}
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setPreviewReceipt(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Voucher Document */}
            <div style={{ padding: '32px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '14px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#059669',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                      }}
                    >
                      D
                    </div>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      DOT ADVERT & COMMUNICATION PLC
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    TIN: 0048291048 • Addis Ababa, Bole Sub-City
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      marginBottom: '4px',
                    }}
                  >
                    OFFICIAL CASH RECEIPT
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {previewReceipt.receiptNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {previewReceipt.date}</div>
                </div>
              </div>

              {/* Receipt Details Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Received With Thanks From:</span>
                  <strong style={{ color: '#0f172a' }}>{previewReceipt.customerName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Against Invoice Reference:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#7c3aed' }}>{previewReceipt.invoiceNumber}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode / Channel:</span>
                  <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#059669' }}>
                    {previewReceipt.paymentMethod.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Transaction / Bank Reference:</span>
                  <code style={{ fontFamily: 'monospace', color: '#1e40af', fontWeight: 700 }}>
                    {previewReceipt.bankReference}
                  </code>
                </div>

                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46' }}>Total Amount Received:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', fontFamily: 'monospace' }}>
                    {formatETB(previewReceipt.amountReceived)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  <span>Remaining Customer Account Balance:</span>
                  <strong style={{ fontFamily: 'monospace', color: previewReceipt.remainingCustomerBalance > 0 ? '#b45309' : '#059669' }}>
                    {formatETB(previewReceipt.remainingCustomerBalance)}
                  </strong>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                <div>
                  <div style={{ height: '32px' }} />
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontWeight: 600, color: '#0f172a' }}>
                    Received By: {previewReceipt.receivedBy}
                  </div>
                  <div>Cashier / Accounts Officer</div>
                </div>

                <div>
                  <div style={{ height: '32px' }} />
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontWeight: 600, color: '#0f172a' }}>
                    Finance Verification
                  </div>
                  <div>Accountant Signature</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      border: '2px dashed #94a3b8',
                      borderRadius: '50%',
                      margin: '0 auto 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                    }}
                  >
                    PAID STAMP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', color: 'var(--text-dim)' }}>Loading Sales Module...</div>}>
      <SalesPageContent />
    </Suspense>
  );
}
