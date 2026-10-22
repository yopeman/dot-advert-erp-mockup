'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  TrendingUp,
  Boxes,
  AlertTriangle,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  Cog,
  PlusCircle,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    orders,
    items,
    lowStockItems,
    allOrderProfitability,
    companyFinancials,
    invoices,
    collections,
    createPurchaseOrder,
  } = useErp();

  const [poCreatedNotice, setPoCreatedNotice] = useState(false);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const handleQuickReorder = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    createPurchaseOrder({
      supplierId: item.preferredSupplierId || 'sup-2',
      supplierName: item.preferredSupplierName || 'Sinotec Digital Technology Supply',
      supplierTin: '0055192837',
      items: [
        {
          itemId: item.id,
          itemName: item.name,
          quantity: item.reorderQuantity || 20,
          unit: item.unit,
          unitPrice: item.purchasePrice,
          vatRate: 0.15,
          vatAmount: (item.reorderQuantity || 20) * item.purchasePrice * 0.15,
          totalAmount: (item.reorderQuantity || 20) * item.purchasePrice * 1.15,
        },
      ],
      subtotal: (item.reorderQuantity || 20) * item.purchasePrice,
      vatTotal: (item.reorderQuantity || 20) * item.purchasePrice * 0.15,
      grandTotal: (item.reorderQuantity || 20) * item.purchasePrice * 1.15,
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      requestedBy: 'System Auto-Trigger (Low Stock)',
      paymentTerms: '15 Days',
      notes: `Automated reorder created from Dashboard for low stock item: ${item.name}`,
    });

    setPoCreatedNotice(true);
    setTimeout(() => setPoCreatedNotice(false), 3500);
  };

  return (
    <div>
      {/* Top Welcome Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="hero-pill">
                EXECUTIVE TELEMETRY
              </span>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>• Real-Time Ethiopian Advertising ERP Engine</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Factory Operations & Order Profitability
            </h1>
            <p style={{ fontSize: '0.825rem', color: '#a1a1aa', margin: '6px 0 0', maxWidth: '640px' }}>
              True job-level margin tracking with 15% Ethiopian VAT compliance, real-time BOM rollups, and shopfloor capacity monitoring.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/orders"
              className="btn btn-secondary btn-sm"
              style={{ background: '#18181b', color: '#ffffff', borderColor: '#27272a' }}
            >
              <Cog size={14} color="#facc15" />
              <span>Work Orders</span>
            </Link>
            <Link
              href="/sales"
              className="btn btn-secondary btn-sm"
              style={{ background: '#18181b', color: '#ffffff', borderColor: '#27272a' }}
            >
              <Receipt size={14} color="#facc15" />
              <span>Generate Invoice</span>
            </Link>
            <Link href="/dashboard/collections" className="btn btn-primary btn-sm">
              <Wallet size={14} />
              <span>Record Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* PO Auto-created Toast */}
      {poCreatedNotice && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 600 }}>
              Purchase Order generated successfully! Sent to Procurement module for approval.
            </span>
          </div>
          <Link href="/dashboard/procurement" style={{ fontSize: '0.8rem', color: '#34d399', textDecoration: 'underline' }}>
            View POs
          </Link>
        </div>
      )}

      {/* Primary Financial & Operational Stat Cards */}
      <div className="stat-grid">
        {/* Net Revenue */}
        <div className="stat-card">
          <div>
            <div className="stat-card-title">
              <span>Total Invoiced Net Revenue</span>
              <TrendingUp size={16} color="#818cf8" />
            </div>
            <div className="stat-card-value">{formatETB(companyFinancials.totalRevenueNet)}</div>
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#34d399', fontWeight: 600 }}>Net Basis</span>
            <span>(Strictly excludes {formatETB(companyFinancials.totalOutputVat)} VAT)</span>
          </div>
        </div>

        {/* Operating Profit */}
        <div className="stat-card">
          <div>
            <div className="stat-card-title">
              <span>Net Operating Profit</span>
              <ArrowUpRight size={16} color="#34d399" />
            </div>
            <div className="stat-card-value" style={{ color: '#34d399' }}>
              {formatETB(companyFinancials.operatingProfit)}
            </div>
          </div>
          <div className="stat-card-subtext">
            <span>
              Net Margin:{' '}
              <strong style={{ color: '#34d399' }}>
                {companyFinancials.totalRevenueNet > 0
                  ? ((companyFinancials.operatingProfit / companyFinancials.totalRevenueNet) * 100).toFixed(1)
                  : 0}
                %
              </strong>{' '}
              after material, labor, scrap & overhead
            </span>
          </div>
        </div>

        {/* Collections Received */}
        <div className="stat-card">
          <div>
            <div className="stat-card-title">
              <span>Cash Collections Received</span>
              <Wallet size={16} color="#06b6d4" />
            </div>
            <div className="stat-card-value">{formatETB(companyFinancials.totalCollected)}</div>
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#67e8f9' }}>Telebirr (212.7k)</span>
            <span>• CBE Bank Wire (432k)</span>
          </div>
        </div>

        {/* Outstanding Receivables (AR) */}
        <div className="stat-card">
          <div>
            <div className="stat-card-title">
              <span>Customer Receivables (AR)</span>
              <Receipt size={16} color="#f59e0b" />
            </div>
            <div className="stat-card-value">{formatETB(companyFinancials.totalReceivables)}</div>
          </div>
          <div className="stat-card-subtext">
            <span style={{ color: '#fbbf24' }}>Awash Bank (120k ETB due)</span>
            <span>• Within 30d credit terms</span>
          </div>
        </div>
      </div>

      {/* Critical Action Banner: Low Stock & Order Attention */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Low Stock Warning Card */}
        {lowStockItems.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(20, 30, 51, 0.9) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="var(--amber)" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' }}>
                    Low-Stock Reorder Alert
                  </span>
                </div>
                <span className="badge badge-amber">Formula: Stock / Daily Usage</span>
              </div>

              <div style={{ marginTop: '12px' }}>
                {lowStockItems.map(({ item, expectedDays }) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        Current Stock: <strong style={{ color: '#fb7185' }}>{item.currentStock} {item.unit}</strong> (Min:{' '}
                        {item.reorderLevel} {item.unit}) • Burn rate: {item.averageDailyUsage} {item.unit}/day
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fb7185' }}>
                        {expectedDays.toFixed(1)} Days
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Stock Remaining</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Preferred Supplier: Sinotec Digital Technology Supply
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleQuickReorder(lowStockItems[0]?.item.id)}
              >
                <PlusCircle size={13} />
                <span>Quick Reorder 30L</span>
              </button>
            </div>
          </div>
        )}

        {/* The Golden Demo Story Quick Pitch */}
        <div
          style={{
            background: '#09090b',
            border: '1px solid #27272a',
            borderTop: '3px solid #facc15',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#facc15" />
                <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  The Factory Evaluation Journey
                </span>
              </div>
              <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontWeight: 700 }}>
                7 Integrated Steps
              </span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                Awash Bank 3D Rooftop Signage (ORD-2026-081)
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#a1a1aa', marginTop: '4px', lineHeight: 1.5 }}>
                Witness real factory cost collection: 69.3k ETB raw materials + 8.6k ETB operator labor + 27k ETB machine runtime + 4.2k ETB cracked acrylic scrap = <strong style={{ color: '#facc15' }}>329,660 ETB True Net Profit</strong>.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.775rem', color: '#facc15', fontWeight: 700 }}>
              ★ 68.7% Net Margin Achieved
            </span>
            <Link
              href="/dashboard/orders"
              className="btn btn-secondary btn-sm"
              style={{ background: '#18181b', color: '#ffffff', borderColor: '#27272a', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>View Profitability Ledger</span>
              <ChevronRight size={13} color="#facc15" />
            </Link>
          </div>
        </div>
      </div>

      {/* Centerpiece Section: Order Profitability Leaderboard */}
      <div className="card" style={{ marginBottom: '28px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#09090b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#facc15',
                }}
              >
                <Cog size={16} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Order Profitability Engine
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              True job-level margin tracking: Net Invoiced Revenue − (Direct Materials + Direct Labor + Machine Rate + Overhead + Scrap)
            </p>
          </div>

          <Link href="/dashboard/orders" className="btn btn-outline btn-sm">
            <span>Manage All Work Orders</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order / Job</th>
                <th>Client</th>
                <th>Net Revenue (Excl. VAT)</th>
                <th>Materials</th>
                <th>Labor & Machine</th>
                <th>Wastage Cost</th>
                <th>Total Cost</th>
                <th>Net Profit</th>
                <th>Margin %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allOrderProfitability.map((job) => {
                const marginColor =
                  job.profitMarginPct >= 40
                    ? '#059669'
                    : job.profitMarginPct >= 20
                    ? '#d97706'
                    : '#e11d48';

                return (
                  <tr key={job.orderId}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.orderNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.orderTitle}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{job.customerName}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{formatETB(job.orderRevenue)}</strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatETB(job.directMaterialCost)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {formatETB(job.directLaborCost + job.machineCost)}
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
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{formatETB(job.totalOrderCost)}</span>
                    </td>
                    <td>
                      <strong style={{ color: marginColor }}>{formatETB(job.orderProfit)}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: marginColor, fontSize: '0.85rem' }}>
                          {job.profitMarginPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress-bar-bg" style={{ width: '80px', height: '5px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, job.profitMarginPct))}%`,
                            background: marginColor,
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          job.status === 'paid'
                            ? 'badge-emerald'
                            : job.status === 'invoiced'
                            ? 'badge-primary'
                            : job.status === 'in_production'
                            ? 'badge-amber'
                            : 'badge-gray'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Ethiopian Tax & Operations Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Ethiopian VAT Ledger Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={17} color="#a855f7" />
              <h3>Ethiopian VAT Ledger (15% Proclamation)</h3>
            </div>
            <span className="badge badge-purple">Monthly Tax Filing</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Reconciliation between Output VAT collected from customer invoices and Input VAT deductible on verified purchase receipts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Output VAT (15% on standard sales):
              </span>
              <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>{formatETB(companyFinancials.totalOutputVat)}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Input VAT (Deductible from Purchases & Utilities):
              </span>
              <strong style={{ color: '#34d399' }}>- {formatETB(companyFinancials.totalInputVat)}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#d8b4fe' }}>
                Net VAT Payable to Ministry of Revenues:
              </span>
              <strong style={{ fontSize: '1rem', color: '#f3e8ff' }}>
                {formatETB(companyFinancials.netVatPayable)}
              </strong>
            </div>
          </div>
        </div>

        {/* Multi-Store Stock Valuation Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Boxes size={17} color="#06b6d4" />
              <h3>Store Inventory Balances</h3>
            </div>
            <Link href="/inventory" style={{ fontSize: '0.75rem', color: '#67e8f9', textDecoration: 'underline' }}>
              Manage Stores
            </Link>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Multi-store tracking: Main Store (Raw Materials), Print Hall (In-Progress Floor), and Finished Goods bay.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.slice(0, 4).map((it) => (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{it.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{it.code}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: it.currentStock <= it.reorderLevel ? '#fb7185' : '#ffffff',
                    }}
                  >
                    {it.currentStock} {it.unit}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Valued @ {formatETB(it.currentStock * it.purchasePrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
