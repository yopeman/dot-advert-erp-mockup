'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function FinancePage() {
  const {
    companyFinancials,
    invoices,
    purchaseOrders,
    expenses,
    allOrderProfitability,
    customers,
    suppliers,
    wastages,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'income_statement' | 'vat_return' | 'aging' | 'profitability'>('income_statement');
  const [fiscalPeriod, setFiscalPeriod] = useState('October 2026');

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  // Financial aggregates
  const netRevenue = companyFinancials.totalRevenueNet;
  const cogs = companyFinancials.cogs;
  const grossProfit = companyFinancials.grossProfit;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const opex = companyFinancials.totalExpenses;
  const operatingIncome = companyFinancials.operatingProfit;
  const netMarginPct = netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0;

  // VAT calculations
  const outputVat = companyFinancials.totalOutputVat;
  const inputVat = companyFinancials.totalInputVat;
  const netVatPayable = companyFinancials.netVatPayable;

  // Breakdown of COGS
  const totalMaterialCost = allOrderProfitability.reduce((sum, p) => sum + p.directMaterialCost, 0);
  const totalLaborCost = allOrderProfitability.reduce((sum, p) => sum + p.directLaborCost, 0);
  const totalMachineCost = allOrderProfitability.reduce((sum, p) => sum + p.machineCost, 0);
  const totalWastageCost = allOrderProfitability.reduce((sum, p) => sum + p.wastageCost, 0);

  // Accounts Payable (AP) from approved purchase orders
  const accountsPayable = purchaseOrders
    .filter((p) => p.status === 'received' || p.status === 'approved')
    .reduce((sum, p) => sum + p.grandTotal, 0);

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
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Corporate Finance & Auditing
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Ethiopian Proclamation Compliance
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Financial Statements, VAT Return & P&L</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={14} />
            <span>Print Financial Report</span>
          </button>
          <Link
            href="/dashboard/orders"
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Sparkles size={14} />
            <span>Order Margin Center</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial KPI Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-title">
            <span>Net Invoiced Revenue</span>
            <TrendingUp size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{formatETB(netRevenue)}</div>
          <div className="stat-card-subtext">
            <span>Excludes {formatETB(outputVat)} output VAT</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Gross Profit (After COGS)</span>
            <ArrowUpRight size={16} color="#34d399" />
          </div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            {formatETB(grossProfit)}
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#34d399', fontWeight: 600 }}>{grossMarginPct.toFixed(1)}% Gross Margin</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Net Operating Income (EBIT)</span>
            <DollarSign size={16} color="#38bdf8" />
          </div>
          <div className="stat-card-value" style={{ color: '#38bdf8' }}>
            {formatETB(operatingIncome)}
          </div>
          <div className="stat-card-subtext">
            <span>{netMarginPct.toFixed(1)}% Net Margin after OpEx</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Net VAT Payable (MoR)</span>
            <ShieldCheck size={16} color="#c084fc" />
          </div>
          <div className="stat-card-value" style={{ color: '#c084fc' }}>
            {formatETB(netVatPayable)}
          </div>
          <div className="stat-card-subtext">
            <span>Output ({formatETB(outputVat)}) - Input ({formatETB(inputVat)})</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
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
          onClick={() => setActiveTab('income_statement')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'income_statement' ? '2px solid #10b981' : '2px solid transparent',
            color: activeTab === 'income_statement' ? '#34d399' : 'var(--text-muted)',
            fontWeight: activeTab === 'income_statement' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Income Statement (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab('vat_return')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'vat_return' ? '2px solid #c084fc' : '2px solid transparent',
            color: activeTab === 'vat_return' ? '#c084fc' : 'var(--text-muted)',
            fontWeight: activeTab === 'vat_return' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={16} />
          <span>Ethiopian 15% VAT Return</span>
        </button>

        <button
          onClick={() => setActiveTab('aging')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'aging' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'aging' ? '#fbbf24' : 'var(--text-muted)',
            fontWeight: activeTab === 'aging' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} />
          <span>AR & AP Aging Ledgers</span>
        </button>

        <button
          onClick={() => setActiveTab('profitability')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'profitability' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'profitability' ? '#38bdf8' : 'var(--text-muted)',
            fontWeight: activeTab === 'profitability' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PieChart size={16} />
          <span>Job Margin & Scrap Audit</span>
        </button>
      </div>

      {/* TAB 1: INCOME STATEMENT (P&L) */}
      {activeTab === 'income_statement' && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '14px',
            }}
          >
            <div>
              <h3>Statement of Profit or Loss (Income Statement)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                For the period ending October 31, 2026 • Reporting Currency: Ethiopian Birr (ETB)
              </p>
            </div>
            <span className="badge badge-emerald">Audited GAAP/IFRS Basis</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
            {/* 1. REVENUE SECTION */}
            <div style={{ fontWeight: 700, color: '#818cf8', padding: '10px 0 4px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              1. Operating Revenue
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)' }}>
              <span>Gross Customer Invoiced Billings (Including 15% VAT):</span>
              <span style={{ color: 'var(--text-muted)' }}>{formatETB(netRevenue + outputVat)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#c084fc' }}>
              <span>Less: 15% Value Added Tax (Passthrough to Ministry of Revenues):</span>
              <span>- {formatETB(outputVat)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(129, 140, 248, 0.12)',
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              <span>Net Operational Revenue:</span>
              <span>{formatETB(netRevenue)}</span>
            </div>

            {/* 2. COST OF GOODS SOLD SECTION */}
            <div style={{ fontWeight: 700, color: '#fb7185', padding: '16px 0 4px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              2. Cost of Goods Sold (Direct Factory Job Costs)
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>Direct Raw Materials Consumed (Vinyl, Banner, Acrylic, LEDs, Metal):</span>
              <span style={{ color: '#fb7185' }}>- {formatETB(totalMaterialCost)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>Direct Workshop Labor (Operator Machine Running Hours):</span>
              <span style={{ color: '#fb7185' }}>- {formatETB(totalLaborCost)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>Machine Station Runtime & Tooling Depreciation:</span>
              <span style={{ color: '#fb7185' }}>- {formatETB(totalMachineCost)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>Material Scrap & Production Wastage Loss:</span>
              <span style={{ color: '#fb7185' }}>- {formatETB(totalWastageCost)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(244, 63, 94, 0.1)',
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: 700,
                color: '#fb7185',
              }}
            >
              <span>Total Cost of Goods Sold (COGS):</span>
              <span>- {formatETB(cogs)}</span>
            </div>

            {/* GROSS PROFIT LINE */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                margin: '12px 0',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#34d399',
              }}
            >
              <span>GROSS PROFIT:</span>
              <span>
                {formatETB(grossProfit)} ({grossMarginPct.toFixed(1)}% Margin)
              </span>
            </div>

            {/* 3. OPERATING EXPENSES SECTION */}
            <div style={{ fontWeight: 700, color: '#fbbf24', padding: '12px 0 4px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              3. General Operating & Administrative Overhead (OpEx)
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>Workshop Premises Lease & Real Estate:</span>
              <span style={{ color: '#fbbf24' }}>- 65,000 ETB</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>EEU Industrial Power & Standby Diesel Generator Fuel:</span>
              <span style={{ color: '#fbbf24' }}>- 31,800 ETB</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--text-muted)' }}>
              <span>Preventive Machine Maintenance & Servicing:</span>
              <span style={{ color: '#fbbf24' }}>- 5,500 ETB</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: 700,
                color: '#fbbf24',
              }}
            >
              <span>Total Operating Expenses:</span>
              <span>- {formatETB(opex)}</span>
            </div>

            {/* NET OPERATING INCOME LINE */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(16, 185, 129, 0.2) 100%)',
                border: '2px solid #38bdf8',
                borderRadius: 'var(--radius-lg)',
                marginTop: '16px',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: '#ffffff',
              }}
            >
              <span>NET OPERATING PROFIT (EBIT):</span>
              <span style={{ color: '#38bdf8' }}>
                {formatETB(operatingIncome)} ({netMarginPct.toFixed(1)}% Net Margin)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ETHIOPIAN 15% VAT RETURN */}
      {activeTab === 'vat_return' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="#c084fc" />
              <h3>Ethiopian Value Added Tax (VAT) Monthly Tax Return</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              In compliance with Ministry of Revenues VAT Proclamation No. 285/2002. Reconciles Output VAT billed to clients against Input VAT paid to registered suppliers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Output Tax Side */}
            <div style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                Output VAT (Sales & Billing)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '6px 0' }}>
                {formatETB(outputVat)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Collected on taxable customer sales (Awash Bank, Ride). MInT government project exempt under Directive 24/2025.
              </div>
            </div>

            {/* Input Tax Side */}
            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                Input VAT (Purchases & Expenses)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '6px 0' }}>
                {formatETB(inputVat)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Paid to VAT-registered vendors (Al-Sam Polytex, Sinotec Digital, Ethio-Plastic) with verified invoices.
              </div>
            </div>
          </div>

          {/* Net Tax Result Box */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '2px solid #a855f7',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d8b4fe', textTransform: 'uppercase' }}>
                Net VAT Remittance Due to Ministry of Revenues
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {formatETB(netVatPayable)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Filing Deadline: 30th day following the close of the accounting period.
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{ background: '#7c3aed', color: '#ffffff' }}
              onClick={() => alert('VAT Return Document exported for Ministry of Revenues submission!')}
            >
              <span>Export MoR Tax Filing</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AR & AP AGING */}
      {activeTab === 'aging' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Accounts Receivable (AR) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={17} color="#fbbf24" />
              <h3>Accounts Receivable (AR) Aging</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Total uncollected customer balances: <strong>{formatETB(companyFinancials.totalReceivables)}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customers
                .filter((c) => c.outstandingBalance > 0)
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Terms: {c.paymentTerms} • TIN: {c.tin}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#fb7185' }}>{formatETB(c.outstandingBalance)}</strong>
                      <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>Current (0-30 days)</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Accounts Payable (AP) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Building2 size={17} color="#38bdf8" />
              <h3>Accounts Payable (AP) Aging</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Outstanding supplier bills from POs: <strong>{formatETB(accountsPayable)}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suppliers.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Terms: {s.paymentTerms} • {s.bankName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-gray">{s.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JOB MARGIN & SCRAP AUDIT */}
      {activeTab === 'profitability' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Job-Level Profitability & Scrap Absorption Audit</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Complete audit ranking every order's profitability and identifying scrap leakage.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job / Contract</th>
                  <th>Client</th>
                  <th>Net Revenue</th>
                  <th>Direct Costs</th>
                  <th>Scrap Loss</th>
                  <th>Total Cost</th>
                  <th>Net Order Profit</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {allOrderProfitability.map((job) => {
                  const marginColor =
                    job.profitMarginPct >= 40
                      ? '#34d399'
                      : job.profitMarginPct >= 20
                      ? '#fbbf24'
                      : '#fb7185';

                  return (
                    <tr key={job.orderId}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{job.orderNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {job.orderTitle}
                        </div>
                      </td>
                      <td>{job.customerName}</td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(job.orderRevenue)}</strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {formatETB(job.directMaterialCost + job.directLaborCost + job.machineCost)}
                      </td>
                      <td>
                        {job.wastageCost > 0 ? (
                          <span style={{ color: '#fb7185', fontWeight: 600 }}>
                            {formatETB(job.wastageCost)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>0 ETB</span>
                        )}
                      </td>
                      <td>{formatETB(job.totalOrderCost)}</td>
                      <td>
                        <strong style={{ color: marginColor }}>{formatETB(job.orderProfit)}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: marginColor }}>
                          {job.profitMarginPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
