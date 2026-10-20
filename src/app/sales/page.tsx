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
} from 'lucide-react';
import { InvoiceType, Invoice, Customer, ProformaInvoice, ProformaStatus } from '@/types/erp';

function SalesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get('tab') as 'invoices' | 'proformas' | 'customers' | 'vat_reports') || 'invoices';

  const {
    invoices,
    proformas,
    customers,
    orders,
    createInvoice,
    createProforma,
    updateProformaStatus,
    convertProformaToInvoice,
    companyFinancials,
  } = useErp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vat_15' | 'non_vat_exempt'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'partially_paid' | 'paid'>('all');
  const [proformaStatusFilter, setProformaStatusFilter] = useState<'all' | ProformaStatus>('all');

  // Modals
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showNewProformaModal, setShowNewProformaModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewProforma, setPreviewProforma] = useState<ProformaInvoice | null>(null);
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

  return (
    <div>
      {/* Top Header & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#c084fc',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Sales, Billing & Tax Invoicing
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              • Dual 15% VAT & Non-VAT Directives
            </span>
          </div>
          <h1 style={{ marginTop: '2px', fontSize: '1.65rem' }}>Customer Invoicing, Proformas & MoR Compliance</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNewProformaModal(true)}
            style={{
              borderColor: 'rgba(168, 85, 247, 0.4)',
              color: '#d8b4fe',
            }}
          >
            <FileSpreadsheet size={14} />
            <span>+ New Proforma</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewInvoiceModal(true)}
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              boxShadow: '0 2px 10px rgba(147, 51, 234, 0.35)',
            }}
          >
            <PlusCircle size={14} />
            <span>+ Issue Tax Invoice</span>
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
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderTop: '2px solid #818cf8' }}>
          <div className="stat-card-title">
            <span>Net Invoiced Revenue (Excl. VAT)</span>
            <Receipt size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{formatETB(companyFinancials.totalRevenueNet)}</div>
          <div className="stat-card-subtext">
            <span>Core operational revenue basis</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '2px solid #c084fc' }}>
          <div className="stat-card-title">
            <span>Output VAT (15% MoR Liability)</span>
            <ShieldCheck size={16} color="#c084fc" />
          </div>
          <div className="stat-card-value" style={{ color: '#c084fc' }}>
            {formatETB(companyFinancials.totalOutputVat)}
          </div>
          <div className="stat-card-subtext">
            <span>Collected on behalf of Ministry of Revenues</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '2px solid #38bdf8' }}>
          <div className="stat-card-title">
            <span>Active Proformas Pipeline</span>
            <FileSpreadsheet size={16} color="#38bdf8" />
          </div>
          <div className="stat-card-value" style={{ color: '#38bdf8' }}>
            {formatETB(totalProformaValue)}
          </div>
          <div className="stat-card-subtext">
            <span>{proformas.length} quotes awaiting PO / advance</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '2px solid #fbbf24' }}>
          <div className="stat-card-title">
            <span>Outstanding Due (AR Balance)</span>
            <AlertTriangle size={16} color="#fbbf24" />
          </div>
          <div className="stat-card-value" style={{ color: '#fbbf24' }}>
            {formatETB(totalOutstandingBalance)}
          </div>
          <div className="stat-card-subtext">
            <span>{formatETB(totalCollectedAmount)} collected to date</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
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
          onClick={() => setTab('invoices')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'invoices' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'invoices' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'invoices' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={16} color={activeTab === 'invoices' ? '#c084fc' : undefined} />
          <span>Invoices Ledger</span>
          <span className="badge badge-gray">{invoices.length}</span>
        </button>

        <button
          onClick={() => setTab('proformas')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'proformas' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'proformas' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'proformas' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileSpreadsheet size={16} color={activeTab === 'proformas' ? '#c084fc' : undefined} />
          <span>Proformas & Quotations</span>
          <span className="badge badge-gray">{proformas.length}</span>
        </button>

        <button
          onClick={() => setTab('customers')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'customers' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'customers' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} color={activeTab === 'customers' ? '#c084fc' : undefined} />
          <span>Customer Accounts & Credit</span>
          <span className="badge badge-gray">{customers.length}</span>
        </button>

        <button
          onClick={() => setTab('vat_reports')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'vat_reports' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'vat_reports' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'vat_reports' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} color={activeTab === 'vat_reports' ? '#c084fc' : undefined} />
          <span>MoR VAT Compliance & Tax Register</span>
          <span className="badge badge-emerald">MoR 15%</span>
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
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#ffffff' }}>{inv.date}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Due: {inv.dueDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{inv.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          TIN: {inv.customerTin}
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/orders`}
                          style={{
                            fontSize: '0.78rem',
                            fontFamily: 'monospace',
                            color: '#38bdf8',
                            textDecoration: 'none',
                          }}
                        >
                          {inv.orderNumber}
                        </Link>
                      </td>
                      <td>
                        {inv.invoiceType === 'vat_15' ? (
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            15% Standard VAT
                          </span>
                        ) : (
                          <div>
                            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                              Exempt Sale
                            </span>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {inv.exemptReason || 'Legal Directive Exemption'}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatETB(inv.subtotalNet)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: inv.vatAmount > 0 ? '#c084fc' : 'var(--text-dim)' }}>
                        {inv.vatAmount > 0 ? formatETB(inv.vatAmount) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
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
                            <Link
                              href="/dashboard/collections"
                              className="btn btn-primary btn-sm"
                              title="Record Collection for this Invoice"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#0284c7' }}
                            >
                              <CreditCard size={12} />
                              <span>Pay</span>
                            </Link>
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
                          <td style={{ fontSize: '0.8rem', color: '#ffffff' }}>{prof.date}</td>
                          <td>
                            <div style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              <span>{prof.validUntil}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{prof.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                              TIN: {prof.customerTin}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-bright)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prof.items[0]?.description || 'Custom Signage Fabrication'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                              {prof.items.length} Line Item{prof.items.length > 1 ? 's' : ''}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatETB(prof.subtotalNet)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#c084fc' }}>
                            {formatETB(prof.vatAmount)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
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
      {/* TAB 3: CUSTOMER ACCOUNTS & CREDIT LIMITS                 */}
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
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.address}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#c084fc' }}>TIN: {c.tin}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {c.isVatRegistered ? '✓ VAT Registered' : 'Non-VAT Entity'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                          {c.customerType?.toUpperCase() || 'BUSINESS'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                        {formatETB(creditLimit)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: c.outstandingBalance > 0 ? '#fbbf24' : '#10b981' }}>
                        {formatETB(c.outstandingBalance)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{ratio}% Used</span>
                          <span style={{ fontSize: '0.68rem', color: isHighRisk ? '#ef4444' : isMedRisk ? '#f59e0b' : '#10b981' }}>
                            {formatETB(Math.max(0, creditLimit - c.outstandingBalance))} left
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: 'rgba(255, 255, 255, 0.08)',
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
                        <div style={{ fontSize: '0.8rem', color: '#ffffff' }}>{c.contactPerson}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.phone}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setProformaCustomerId(c.id);
                            setShowNewProformaModal(true);
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        >
                          <PlusCircle size={12} />
                          <span>Quote</span>
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

      {/* ======================================================== */}
      {/* TAB 4: MoR VAT COMPLIANCE & TAX REGISTER                 */}
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
            <div className="card" style={{ borderLeft: '4px solid #c084fc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                  Box A • Output VAT Collected
                </span>
                <BadgePercent size={16} color="#c084fc" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.totalOutputVat)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                15% VAT charged to commercial clients on sales invoices
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Box B • Input VAT Deductible
                </span>
                <ShieldCheck size={16} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.totalInputVat || companyFinancials.totalOutputVat * 0.42)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
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
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.netVatPayable || companyFinancials.totalOutputVat * 0.58)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Remittance due to Ministry of Revenues by the 30th of each month
              </div>
            </div>
          </div>

          {/* Official MoR Filing Table Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
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
                  <td style={{ textAlign: 'center' }}><span className="badge badge-purple">15.0%</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#c084fc' }}>
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
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', fontWeight: 700 }}>
                  <td style={{ fontFamily: 'monospace' }}>04</td>
                  <td>TOTAL TAXABLE & EXEMPT TURNOVER</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#ffffff' }}>
                    {formatETB(companyFinancials.totalRevenueNet)}
                  </td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#c084fc' }}>
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#0e111d',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, #9333ea, #c084fc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Receipt size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    Issue Official Tax Invoice
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Ethiopian MoR Compliant Invoice with Dual VAT / Exemption
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Select Order */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Select Finished / Delivered Order:
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
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
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    Tax Regime:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setInvoiceType('vat_15')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: invoiceType === 'vat_15' ? '2px solid #a855f7' : '1px solid var(--border-subtle)',
                        background: invoiceType === 'vat_15' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>Standard 15% VAT</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        MoR commercial invoice with 15% output VAT collected
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInvoiceType('non_vat_exempt')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: invoiceType === 'non_vat_exempt' ? '2px solid #fbbf24' : '1px solid var(--border-subtle)',
                        background: invoiceType === 'non_vat_exempt' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>Non-VAT Exempt Sale</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Government directive or NGO aid exemption
                      </div>
                    </button>
                  </div>
                </div>

                {/* Exemption Reason if Exempt */}
                {invoiceType === 'non_vat_exempt' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbbf24', marginBottom: '6px' }}>
                      Exemption Legal Citation / Directive Reference:
                    </label>
                    <input
                      type="text"
                      value={exemptReason}
                      onChange={(e) => setExemptReason(e.target.value)}
                      placeholder="e.g. Directive No. 24/2025 MoR Public Enterprise Exemption"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid #fbbf24',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-bright)',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Due Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Payment Due Date:
                  </label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Invoice Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Payment Instructions / Bank Ref:
                  </label>
                  <textarea
                    rows={2}
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Financial Summary Preview */}
                <div
                  style={{
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Order Amount Net:</span>
                    <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>
                      {formatETB(orders.find((o) => o.id === selectedOrderId)?.totalAgreedPrice || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>15% VAT:</span>
                    <span style={{ fontFamily: 'monospace', color: invoiceType === 'vat_15' ? '#c084fc' : 'var(--text-dim)' }}>
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
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '6px',
                      marginTop: '4px',
                    }}
                  >
                    <span>Total Invoiced Gross:</span>
                    <span style={{ fontFamily: 'monospace', color: '#10b981' }}>
                      {formatETB(
                        (orders.find((o) => o.id === selectedOrderId)?.totalAgreedPrice || 0) *
                          (invoiceType === 'vat_15' ? 1.15 : 1)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewInvoiceModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                    padding: '8px 20px',
                  }}
                >
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#0e111d',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <FileSpreadsheet size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    Issue Proforma Quotation
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Commercial quotation for client budgeting & PO issuance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewProformaModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProforma} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Select Customer */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Client Organization:
                  </label>
                  <select
                    value={proformaCustomerId}
                    onChange={(e) => setProformaCustomerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (TIN: {c.tin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validity Period */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Validity Period:
                  </label>
                  <select
                    value={proformaValidDays}
                    onChange={(e) => setProformaValidDays(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value={7}>7 Calendar Days</option>
                    <option value={15}>15 Calendar Days (Standard)</option>
                    <option value={30}>30 Calendar Days</option>
                  </select>
                </div>

                {/* Item Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Scope / Line Item Description:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3D LED Illuminated Acrylic Channel Letters Signage (6m x 1.2m)"
                    value={proformaItemDesc}
                    onChange={(e) => setProformaItemDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Quantity & Unit Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Quantity:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={proformaItemQty}
                      onChange={(e) => setProformaItemQty(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-bright)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Unit:
                    </label>
                    <select
                      value={proformaItemUnit}
                      onChange={(e) => setProformaItemUnit(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-bright)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="pcs">pcs</option>
                      <option value="m2">m²</option>
                      <option value="sets">sets</option>
                      <option value="rolls">rolls</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Unit Price (ETB):
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={proformaItemPrice}
                      onChange={(e) => setProformaItemPrice(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-bright)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                {/* Terms / Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Quotation Terms & Conditions:
                  </label>
                  <textarea
                    rows={2}
                    value={proformaNotes}
                    onChange={(e) => setProformaNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-bright)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Summary calculation */}
                <div
                  style={{
                    padding: '14px',
                    background: 'rgba(56, 189, 248, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Subtotal Net:</span>
                    <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>
                      {formatETB(proformaItemQty * proformaItemPrice)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>15% VAT:</span>
                    <span style={{ fontFamily: 'monospace', color: '#c084fc' }}>
                      {formatETB(proformaItemQty * proformaItemPrice * 0.15)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '6px',
                      marginTop: '4px',
                    }}
                  >
                    <span>Quotation Grand Total:</span>
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                      {formatETB(proformaItemQty * proformaItemPrice * 1.15)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNewProformaModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    padding: '8px 20px',
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Issue Proforma Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PRINTABLE MOR TAX INVOICE PREVIEW               */}
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
      {/* MODAL 4: PRINTABLE PROFORMA QUOTATION PREVIEW            */}
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
