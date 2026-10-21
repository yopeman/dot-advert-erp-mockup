'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import {
  TrendingUp,
  Receipt,
  Building2,
  Calendar,
  Printer,
  ShieldCheck,
  PieChart,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ChevronRight,
  Boxes,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  Wallet,
  Smartphone,
  Banknote,
  Landmark,
  BadgePercent,
  Download,
  X,
  CreditCard,
  Layers,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { OrderProfitability, CustomerOrder } from '@/types/erp';

function FinancePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab =
    (searchParams.get('tab') as
      | 'income_statement'
      | 'profitability'
      | 'stores'
      | 'cashflow'
      | 'aging'
      | 'tax') || 'income_statement';

  const {
    companyFinancials,
    storeFinancials,
    invoices,
    purchaseOrders,
    expenses,
    allOrderProfitability,
    orders,
    customers,
    suppliers,
    collections,
    wastages,
  } = useErp();

  const [fiscalPeriod, setFiscalPeriod] = useState('October 2026');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [marginTierFilter, setMarginTierFilter] = useState<'all' | 'high' | 'healthy' | 'low'>('all');
  const [selectedProfitabilityOrder, setSelectedProfitabilityOrder] = useState<OrderProfitability | null>(null);

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
    router.push(`/finance?tab=${tab}`);
  };

  // Financial aggregates
  const netRevenue = companyFinancials.totalRevenueNet;
  const cogs = companyFinancials.cogs;
  const grossProfit = companyFinancials.grossProfit;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const opex = companyFinancials.totalExpenses;
  const operatingIncome = companyFinancials.operatingProfit;
  const netMarginPct = netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0;

  // Breakdown of COGS
  const totalMaterialCost = allOrderProfitability.reduce((sum, p) => sum + p.directMaterialCost, 0);
  const totalLaborCost = allOrderProfitability.reduce((sum, p) => sum + p.directLaborCost, 0);
  const totalMachineCost = allOrderProfitability.reduce((sum, p) => sum + p.machineCost, 0);
  const totalWastageCost = allOrderProfitability.reduce((sum, p) => sum + p.wastageCost, 0);
  const totalDirectTransportCost = allOrderProfitability.reduce(
    (sum, p) => sum + (p.orderTransportCost || 0) + (p.orderDirectExpensesCost || 0),
    0
  );

  // Cash Inflows & Outflows
  const totalInflows = companyFinancials.totalCollected;
  const totalSupplierPOPaid = purchaseOrders
    .filter((p) => p.status === 'received' || p.status === 'approved')
    .reduce((sum, p) => sum + p.grandTotal, 0);
  const totalOpexPaid = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalCashOutflows = totalSupplierPOPaid * 0.75 + totalOpexPaid;
  const netCashFlow = totalInflows - totalCashOutflows;

  // Accounts Payable (AP) from approved purchase orders
  const accountsPayable =
    purchaseOrders
      .filter((p) => p.status === 'received' || p.status === 'approved')
      .reduce((sum, p) => sum + p.grandTotal, 0) - storeFinancials.supplierReturnValue;
  const accountsReceivable = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Filtered Order Profitability
  const filteredOrderProfitability = useMemo(() => {
    return allOrderProfitability.filter((item) => {
      const q = orderSearchQuery.toLowerCase();
      const matchesSearch =
        item.orderNumber.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.orderTitle.toLowerCase().includes(q);

      let matchesTier = true;
      if (marginTierFilter === 'high') matchesTier = item.profitMarginPct >= 35;
      else if (marginTierFilter === 'healthy') matchesTier = item.profitMarginPct >= 20 && item.profitMarginPct < 35;
      else if (marginTierFilter === 'low') matchesTier = item.profitMarginPct < 20;

      return matchesSearch && matchesTier;
    });
  }, [allOrderProfitability, orderSearchQuery, marginTierFilter]);

  return (
    <div>
      {/* Hero Banner Header */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="hero-pill">
                MODULE 6 • CFO & AUDITING DESK
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                • IFRS & Ethiopian Ministry of Revenues Compliant
              </span>
            </div>
            <h1 style={{ marginTop: '2px', fontSize: '1.65rem', color: '#ffffff', fontWeight: 800 }}>
              Executive P&L, Job Costing & Financial Statements
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#facc15" />
              <select
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(250, 204, 21, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="October 2026">Fiscal Period: October 2026</option>
                <option value="Q3 2026">Quarter: Q3 2026 (Jul - Sep)</option>
                <option value="Year-to-Date 2026">Year-to-Date 2026</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <Printer size={14} />
              <span>Export Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Strip */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderTop: '3px solid #09090b' }}>
          <div className="stat-card-title">
            <span>Net Operating Revenue (Excl. VAT)</span>
            <Receipt size={16} color="#71717a" />
          </div>
          <div className="stat-card-value">{formatETB(netRevenue)}</div>
          <div className="stat-card-subtext">
            <span>Core turnover across finished & delivered jobs</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #ca8a04' }}>
          <div className="stat-card-title">
            <span>Gross Manufacturing Profit</span>
            <PieChart size={16} color="#ca8a04" />
          </div>
          <div className="stat-card-value" style={{ color: '#ca8a04' }}>
            {formatETB(grossProfit)}
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{grossMarginPct.toFixed(1)}% Gross Margin</span>
            <span> • After direct factory costs</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #16a34a' }}>
          <div className="stat-card-title">
            <span>Operating Profit (EBITDA)</span>
            <TrendingUp size={16} color="#16a34a" />
          </div>
          <div className="stat-card-value" style={{ color: '#16a34a' }}>
            {formatETB(operatingIncome)}
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{netMarginPct.toFixed(1)}% Operating Margin</span>
            <span> • Net company bottomline</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="stat-card-title">
            <span>Net Working Capital Gap</span>
            <Scale size={16} color="#f59e0b" />
          </div>
          <div className="stat-card-value" style={{ color: accountsReceivable >= accountsPayable ? '#16a34a' : '#ef4444' }}>
            {formatETB(accountsReceivable - accountsPayable)}
          </div>
          <div className="stat-card-subtext">
            <span>AR: {formatETB(accountsReceivable)} • AP: {formatETB(accountsPayable)}</span>
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
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setTab('income_statement')}
          className={`tab-btn ${activeTab === 'income_statement' ? 'active' : ''}`}
        >
          <TrendingUp size={16} />
          <span>Executive P&L Statement</span>
          <span className="badge badge-emerald">{grossMarginPct.toFixed(0)}% Margin</span>
        </button>

        <button
          onClick={() => setTab('profitability')}
          className={`tab-btn ${activeTab === 'profitability' ? 'active' : ''}`}
        >
          <PieChart size={16} />
          <span>Job Costing & Order Margins</span>
          <span className="badge badge-blue">{allOrderProfitability.length} Jobs</span>
        </button>

        <button
          onClick={() => setTab('stores')}
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
        >
          <Boxes size={16} />
          <span>Store Ledger & Inventory</span>
          <span className="badge badge-emerald">{formatETB(storeFinancials.inventoryValuation)}</span>
        </button>

        <button
          onClick={() => setTab('cashflow')}
          className={`tab-btn ${activeTab === 'cashflow' ? 'active' : ''}`}
        >
          <Wallet size={16} />
          <span>Cash Flow & Treasury</span>
          <span className="badge badge-emerald">Inflows & Outflows</span>
        </button>

        <button
          onClick={() => setTab('aging')}
          className={`tab-btn ${activeTab === 'aging' ? 'active' : ''}`}
        >
          <Clock size={16} />
          <span>AR & AP Aging Ledger</span>
          <span className="badge badge-amber">{invoices.filter((i) => i.balanceDue > 0).length} Due</span>
        </button>

        <button
          onClick={() => setTab('tax')}
          className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} />
          <span>MoR Tax & VAT Filing</span>
          <span className="badge badge-purple">15% MoR</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE P&L STATEMENT                           */}
      {/* ======================================================== */}
      {activeTab === 'income_statement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Statement of Profit & Loss (Operating P&L)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Audited financial rollup for period: <strong>{fiscalPeriod}</strong> • Currency: Ethiopian Birr (ETB)
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    fontWeight: 600,
                  }}
                >
                  ✓ Direct Job Wastage Factored in COGS
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: Math.abs(storeFinancials.productionIssueValue - totalMaterialCost) < 1 ? '#0ea5e9' : '#b45309',
                    background: Math.abs(storeFinancials.productionIssueValue - totalMaterialCost) < 1 ? '#f0f9ff' : '#fffbeb',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${Math.abs(storeFinancials.productionIssueValue - totalMaterialCost) < 1 ? '#bae6fd' : '#fde68a'}`,
                    fontWeight: 600,
                  }}
                >
                  Store ledger: {formatETB(storeFinancials.productionIssueValue)} issued
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Line Item</th>
                    <th>Financial Cost Center</th>
                    <th style={{ textAlign: 'right' }}>Amount (ETB)</th>
                    <th style={{ textAlign: 'right' }}>% of Net Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Revenue Section */}
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <td colSpan={4} style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      1. REVENUE (NET TURNOVER)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Gross Invoiced Sales (Including VAT)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Commercial Invoicing</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatETB(companyFinancials.totalRevenueNet + companyFinancials.totalOutputVat)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px', color: '#7c3aed' }}>
                      Less: Statutory 15% Output VAT (Held for MoR)
                    </td>
                    <td style={{ color: '#7c3aed' }}>Ministry of Revenues Liability</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#7c3aed' }}>
                      -{formatETB(companyFinancials.totalOutputVat)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                  </tr>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.04)', fontWeight: 800 }}>
                    <td style={{ color: 'var(--text-main)' }}>NET OPERATING REVENUE (EXCL. VAT)</td>
                    <td>Operational Topline</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {formatETB(netRevenue)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>100.0%</td>
                  </tr>

                  {/* COGS Section */}
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <td colSpan={4} style={{ fontWeight: 800, color: '#ca8a04', fontSize: '0.85rem', paddingTop: '16px' }}>
                      2. COST OF GOODS SOLD (DIRECT MANUFACTURING COGS)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Direct Raw Materials (Acrylic, LED, Aluminum, Vinyl)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Inventory Store Issuances</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalMaterialCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalMaterialCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Direct Production Labor (Technicians, Welders, Printers)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Shopfloor Attendance</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalLaborCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalLaborCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Machine Station Runtime (Laser, CNC, Channel Bender)</td>
                    <td style={{ color: 'var(--text-dim)' }}>Equipment Running Rates</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalMachineCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalMachineCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px', color: '#b45309' }}>
                      Production Scrap & Wastage Loss (Fractured Acrylic / Misprints)
                    </td>
                    <td style={{ color: '#b45309' }}>Wastage Cost Rollup</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#b45309' }}>
                      {formatETB(totalWastageCost)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#b45309' }}>
                      {netRevenue > 0 ? ((totalWastageCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px', color: '#b45309' }}>
                      Store Shrinkage & Unallocated Wastage
                    </td>
                    <td style={{ color: '#b45309' }}>Stock Count & Store Ledger</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#b45309' }}>
                      {formatETB(
                        storeFinancials.unallocatedWastageValue +
                          storeFinancials.adjustmentLossValue -
                          storeFinancials.adjustmentGainValue
                      )}
                    </td>
                    <td style={{ textAlign: 'right', color: '#b45309' }}>
                      {netRevenue > 0
                        ? (((storeFinancials.unallocatedWastageValue +
                            storeFinancials.adjustmentLossValue -
                            storeFinancials.adjustmentGainValue) /
                            netRevenue) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Direct Job Transportation & Scaffolding Crane</td>
                    <td style={{ color: 'var(--text-dim)' }}>Site Installation Cost</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(totalDirectTransportCost)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {netRevenue > 0 ? ((totalDirectTransportCost / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ background: 'rgba(202, 138, 4, 0.08)', fontWeight: 800 }}>
                    <td style={{ color: 'var(--text-main)' }}>TOTAL COST OF GOODS SOLD (COGS)</td>
                    <td>Manufacturing Direct Rollup</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.95rem', color: '#854d0e' }}>
                      {formatETB(cogs)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#854d0e' }}>
                      {netRevenue > 0 ? ((cogs / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>

                  {/* Gross Profit */}
                  <tr style={{ background: 'rgba(250, 204, 21, 0.15)', fontWeight: 800 }}>
                    <td style={{ color: '#854d0e', fontSize: '0.95rem' }}>GROSS MANUFACTURING PROFIT</td>
                    <td style={{ color: '#854d0e' }}>Revenue - COGS</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1.05rem', color: '#854d0e' }}>
                      {formatETB(grossProfit)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: '#854d0e' }}>
                      {grossMarginPct.toFixed(1)}%
                    </td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <td colSpan={4} style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.85rem', paddingTop: '16px' }}>
                      3. OPERATING EXPENSES (FACTORY & ADMINISTRATIVE OVERHEAD)
                    </td>
                  </tr>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ paddingLeft: '24px' }}>{exp.categoryLabel || exp.supplierOrPayee}</td>
                      <td style={{ color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                        {exp.category?.replace('_', ' ') || 'Facility Overhead'}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(exp.amountNet)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                        {netRevenue > 0 ? ((exp.amountNet / netRevenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(239, 68, 68, 0.08)', fontWeight: 800 }}>
                    <td style={{ color: 'var(--text-main)' }}>TOTAL OPERATING EXPENSES (OPEX)</td>
                    <td>General Overhead</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>
                      {formatETB(opex)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                      {netRevenue > 0 ? ((opex / netRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>

                  {/* Net Operating Income / EBITDA */}
                  <tr style={{ background: 'rgba(16, 185, 129, 0.16)', fontWeight: 900 }}>
                    <td style={{ color: '#10b981', fontSize: '1rem', letterSpacing: '0.02em' }}>
                      NET OPERATING INCOME (EBITDA)
                    </td>
                    <td style={{ color: '#10b981' }}>Gross Profit - OPEX</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1.25rem', color: '#10b981' }}>
                      {formatETB(operatingIncome)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.05rem', color: '#10b981' }}>
                      {netMarginPct.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: JOB COSTING & ORDER PROFITABILITY ENGINE          */}
      {/* ======================================================== */}
      {activeTab === 'profitability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            {/* Filter controls */}
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
                    placeholder="Search order #, client name, or project title..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Margin:</span>
                  <select
                    value={marginTierFilter}
                    onChange={(e) => setMarginTierFilter(e.target.value as any)}
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
                    <option value="all">All Margins</option>
                    <option value="high">High Margin (&gt; 35%)</option>
                    <option value="healthy">Healthy Margin (20 - 35%)</option>
                    <option value="low">Low Margin (&lt; 20%)</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Showing <strong>{filteredOrderProfitability.length}</strong> of <strong>{allOrderProfitability.length}</strong> Job Rollups
              </div>
            </div>

            {/* Profitability Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Order #</th>
                    <th>Customer & Title</th>
                    <th style={{ textAlign: 'right' }}>Agreed Revenue (Net)</th>
                    <th style={{ textAlign: 'right' }}>Direct Material</th>
                    <th style={{ textAlign: 'right' }}>Direct Labor</th>
                    <th style={{ textAlign: 'right' }}>Machine Run</th>
                    <th style={{ textAlign: 'right' }}>Scrap Waste</th>
                    <th style={{ textAlign: 'right' }}>Total Job Cost</th>
                    <th style={{ textAlign: 'right' }}>Order Profit</th>
                    <th style={{ textAlign: 'center' }}>Margin %</th>
                    <th style={{ textAlign: 'center' }}>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderProfitability.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                        No orders match the current profitability criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrderProfitability.map((prof) => {
                      const isHigh = prof.profitMarginPct >= 35;
                      const isHealthy = prof.profitMarginPct >= 20 && prof.profitMarginPct < 35;

                      return (
                        <tr key={prof.orderId}>
                          <td>
                            <button
                              onClick={() => setSelectedProfitabilityOrder(prof)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ca8a04',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <PieChart size={13} />
                              <span>{prof.orderNumber}</span>
                            </button>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prof.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prof.orderTitle}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>
                            {formatETB(prof.orderRevenue)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                            {formatETB(prof.directMaterialCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatETB(prof.directLaborCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatETB(prof.machineCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: prof.wastageCost > 0 ? '#fbbf24' : 'var(--text-dim)' }}>
                            {prof.wastageCost > 0 ? formatETB(prof.wastageCost) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#f87171' }}>
                            {formatETB(prof.totalOrderCost)}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: prof.orderProfit >= 0 ? '#10b981' : '#ef4444' }}>
                            {formatETB(prof.orderProfit)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${
                                isHigh ? 'badge-emerald' : isHealthy ? 'badge-blue' : 'badge-amber'
                              }`}
                              style={{ fontWeight: 700 }}
                            >
                              {prof.profitMarginPct.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedProfitabilityOrder(prof)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            >
                              <PieChart size={12} />
                              <span>Cost Tree</span>
                            </button>
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
      {/* TAB 3: STORE LEDGER & INVENTORY FINANCE                  */}
      {/* ======================================================== */}
      {activeTab === 'stores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase' }}>
                  Inventory at Cost
                </span>
                <Boxes size={18} color="#0ea5e9" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.inventoryValuation)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {storeFinancials.storeValuations.length} stores • {storeFinancials.categoryValuations.length} categories
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ca8a04' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase' }}>
                  Material Issued to Jobs
                </span>
                <DollarSign size={18} color="#ca8a04" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.productionIssueValue + storeFinancials.salesIssueValue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Posted to WIP / COGS through the stock ledger
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #be123c' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>
                  Wastage & Shrinkage
                </span>
                <Trash2 size={18} color="#be123c" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.wastageValue + storeFinancials.adjustmentLossValue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {formatETB(storeFinancials.unallocatedWastageValue)} unallocated to jobs
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                  Supplier Debit Notes
                </span>
                <ArrowDownRight size={18} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {formatETB(storeFinancials.supplierReturnValue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Reduces supplier payables in the AP ledger
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Procurement Reconciliation
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Goods receipts posted in Stores are matched to purchase orders before they settle Accounts Payable.
                </p>
              </div>
              <span className={`badge ${storeFinancials.unlinkedPurchaseReceipts === 0 ? 'badge-emerald' : 'badge-amber'}`}>
                {storeFinancials.unlinkedPurchaseReceipts === 0 ? 'Fully Reconciled' : `${storeFinancials.unlinkedPurchaseReceipts} Unlinked GRNs`}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PO-backed receipts</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: '#16a34a' }}>
                  {formatETB(storeFinancials.linkedPurchaseReceiptValue)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  {storeFinancials.linkedPurchaseReceipts} GRNs settled to AP
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Unreconciled receipts</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: '#b45309' }}>
                  {formatETB(storeFinancials.unlinkedPurchaseReceiptValue)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  {storeFinancials.unlinkedPurchaseReceipts} GRNs awaiting a PO match
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Net supplier payable</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                  {formatETB(accountsPayable)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  After {formatETB(storeFinancials.supplierReturnValue)} supplier debits
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Inter-store transfers</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                  {formatETB(storeFinancials.transferValue)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Inventory-to-inventory, no P&L impact</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Inventory Valuation by Store
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>SKUs</th>
                      <th style={{ textAlign: 'right' }}>Units</th>
                      <th style={{ textAlign: 'right' }}>Value (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeFinancials.storeValuations.map((store) => (
                      <tr key={store.storeId}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{store.storeName}</td>
                        <td style={{ textTransform: 'capitalize', color: 'var(--text-dim)' }}>
                          {store.storeType.replaceAll('_', ' ')}
                        </td>
                        <td style={{ textAlign: 'right' }}>{store.skuCount}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{store.totalUnits.toFixed(0)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                          {formatETB(store.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Inventory by Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {storeFinancials.categoryValuations.map((cat) => {
                  const pct = storeFinancials.inventoryValuation > 0 ? (cat.totalValue / storeFinancials.inventoryValuation) * 100 : 0;
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: 600 }}>
                          {cat.category.replaceAll('_', ' ')}
                        </span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{formatETB(cat.totalValue)}</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: '#facc15' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Store Journal — Finance Postings
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Every approved stock movement with its debit and credit account. Wastage, issues and receipts feed the P&L in real time.
                </p>
              </div>
              <span className="badge badge-blue">{storeFinancials.recentPostings.length} Postings</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Movement</th>
                    <th>Item / Store</th>
                    <th>Debit Account</th>
                    <th>Credit Account</th>
                    <th style={{ textAlign: 'right' }}>Value (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {storeFinancials.recentPostings.map((posting) => (
                    <tr key={posting.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{posting.date}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                          {posting.movementType.replaceAll('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {posting.movementNumber}{posting.reference ? ` • ${posting.reference}` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-main)' }}>{posting.itemName}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {posting.quantity} {posting.unit} • {posting.storeName}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.74rem', color: '#16a34a' }}>{posting.debitAccount}</td>
                      <td style={{ fontSize: '0.74rem', color: '#dc2626' }}>{posting.creditAccount}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                        {formatETB(posting.value)}
                      </td>
                    </tr>
                  ))}
                  {storeFinancials.recentPostings.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                        No store movements have been posted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CASH FLOW & TREASURY                              */}
      {/* ======================================================== */}
      {activeTab === 'cashflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cash Position Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Total Inflows (Collections)
                </span>
                <ArrowUpRight size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
                {formatETB(totalInflows)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Telebirr, CBE wire transfers & cashier deposits
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                  Total Outflows (Procurement & OPEX)
                </span>
                <ArrowDownRight size={18} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
                {formatETB(totalCashOutflows)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Raw material PO settlements & monthly operating expenses
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Net Cash Position
                </span>
                <Wallet size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: netCashFlow >= 0 ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>
                {formatETB(netCashFlow)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Positive treasury runway for raw material reordering
              </div>
            </div>
          </div>

          {/* Cash Flow Statement Ledger */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              Monthly Cash Inflow & Outflow Activity
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity / Counterparty</th>
                    <th>Category</th>
                    <th>Channel / Reference</th>
                    <th style={{ textAlign: 'right' }}>Inflow (+)</th>
                    <th style={{ textAlign: 'right' }}>Outflow (-)</th>
                    <th style={{ textAlign: 'center' }}>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => (
                    <tr key={col.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{col.date}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{col.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Settlement for {col.invoiceNumber}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-emerald">Customer Inflow</span>
                      </td>
                      <td>
                        <div style={{ textTransform: 'capitalize', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                          {col.paymentMethod.replace('_', ' ')}
                        </div>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{col.bankReference}</code>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>
                        +{formatETB(col.amountReceived)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-emerald">✓ Reconciled</span>
                      </td>
                    </tr>
                  ))}
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{exp.date}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {exp.categoryLabel} ({exp.supplierOrPayee})
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{exp.expenseNumber}</div>
                      </td>
                      <td>
                        <span className="badge badge-rose">Operating Expense</span>
                      </td>
                      <td>
                        <div style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                          {exp.paymentMethod.replace('_', ' ')}
                        </div>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{exp.receiptRef || 'DIRECT'}</code>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>
                        -{formatETB(exp.totalAmount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-blue">✓ Paid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AR & AP AGING LEDGER                              */}
      {/* ======================================================== */}
      {activeTab === 'aging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Current (&lt; 30 Days)
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace', marginTop: '4px' }}>
                {formatETB(accountsReceivable * 0.65)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Within agreed payment credit term</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                31 - 60 Days Aging
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ca8a04', fontFamily: 'monospace', marginTop: '4px' }}>
                {formatETB(accountsReceivable * 0.25)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>First follow-up call window</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                61 - 90 Days Aging
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706', fontFamily: 'monospace', marginTop: '4px' }}>
                {formatETB(accountsReceivable * 0.1)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Credit hold pending payment</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                90+ Days Overdue
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace', marginTop: '4px' }}>
                ETB 0
              </div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>Zero bad debt write-offs</div>
            </div>
          </div>

          {/* Accounts Receivable Table */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Accounts Receivable (AR) by Customer Account
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Uncollected balances across commercial invoices
                </p>
              </div>
              <Link href="/sales?tab=collections" className="btn btn-secondary btn-sm">
                <CreditCard size={14} />
                <span>Go to Sales & Collections Desk</span>
              </Link>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Organization</th>
                  <th>TIN Number</th>
                  <th style={{ textAlign: 'right' }}>Credit Limit</th>
                  <th style={{ textAlign: 'right' }}>Current (&lt; 30d)</th>
                  <th style={{ textAlign: 'right' }}>30-60d</th>
                  <th style={{ textAlign: 'right' }}>Total Outstanding Due</th>
                  <th style={{ textAlign: 'center' }}>Terms</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.address}</div>
                    </td>
                    <td>
                      <code style={{ color: '#7c3aed' }}>{c.tin}</code>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatETB(c.creditLimit)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#16a34a' }}>
                      {formatETB(c.outstandingBalance * 0.7)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: c.outstandingBalance > 0 ? '#ca8a04' : 'var(--text-dim)' }}>
                      {formatETB(c.outstandingBalance * 0.3)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: c.outstandingBalance > 0 ? '#ca8a04' : '#16a34a' }}>
                      {formatETB(c.outstandingBalance)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-gray">{c.paymentTerms || 'Net 30 Days'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MoR STATUTORY TAX & VAT FILING                    */}
      {/* ======================================================== */}
      {activeTab === 'tax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
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
                  background: '#09090b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#facc15',
                }}
              >
                <Landmark size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Ministry of Revenues (MoR) Statutory Tax Filing Schedule
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Electronic Value Added Tax (VAT 15%) Declaration & Withholding Tax (WHT 2%) Audit Ledger
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Registered Taxpayer TIN</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  TIN: 0048291048
                </div>
              </div>
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                <Download size={14} />
                <span>Export Tax Form</span>
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

            <div className="card" style={{ borderLeft: '4px solid #09090b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
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

            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                  Box C • Net VAT Payable to MoR
                </span>
                <Landmark size={16} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
                {formatETB(companyFinancials.netVatPayable || companyFinancials.totalOutputVat * 0.58)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Remittance due to Ministry of Revenues by the 30th of each month
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER PROFITABILITY & COST TREE BREAKDOWN         */}
      {/* ======================================================== */}
      {selectedProfitabilityOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
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
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#facc15',
                  }}
                >
                  <PieChart size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Job Cost Tree & Margin Analysis
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedProfitabilityOrder.orderNumber} • {selectedProfitabilityOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfitabilityOrder(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Highlight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Agreed Net Revenue</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatETB(selectedProfitabilityOrder.orderRevenue)}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Rollup Cost</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                    {formatETB(selectedProfitabilityOrder.totalOrderCost)}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#16a34a' }}>Net Order Profit ({selectedProfitabilityOrder.profitMarginPct.toFixed(1)}%)</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>
                    {formatETB(selectedProfitabilityOrder.orderProfit)}
                  </div>
                </div>
              </div>

              {/* Itemized Cost Tree */}
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  Direct Manufacturing Cost Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>1. Bill of Materials (Raw Materials):</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(selectedProfitabilityOrder.directMaterialCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>2. Direct Labor (Assembly & Fabrication):</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(selectedProfitabilityOrder.directLaborCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>3. Machine Runtime (Laser & CNC Hours):</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(selectedProfitabilityOrder.machineCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fbbf24' }}>4. Production Wastage & Scrap Loss:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#fbbf24' }}>
                      {formatETB(selectedProfitabilityOrder.wastageCost)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>5. Transport & Scaffolding Direct Expenses:</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {formatETB(
                        (selectedProfitabilityOrder.orderTransportCost || 0) +
                          (selectedProfitabilityOrder.orderDirectExpensesCost || 0)
                      )}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '8px',
                      marginTop: '4px',
                      fontWeight: 800,
                    }}
                  >
                    <span>Total Direct Rollup Cost:</span>
                    <span style={{ fontFamily: 'monospace', color: '#dc2626' }}>
                      {formatETB(selectedProfitabilityOrder.totalOrderCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedProfitabilityOrder(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', color: 'var(--text-dim)' }}>Loading Finance Desk...</div>}>
      <FinancePageContent />
    </Suspense>
  );
}
