'use client';

import React, { useState } from 'react';
import { useErp } from '@/context/ErpDataContext';
import {
  PieChart,
  DollarSign,
  TrendingUp,
  Tag,
  Building2,
  CheckCircle2,
  PlusCircle,
  Search,
  Filter,
  FileText,
  Truck,
  Zap,
  Flame,
  Wrench,
  Shield,
  Layers,
  X,
} from 'lucide-react';
import { ExpenseCategory, ExpenseCostType, PaymentMethod, Expense } from '@/types/erp';

export default function ExpensesPage() {
  const { expenses, orders, recordExpense } = useErp();

  const [activeTab, setActiveTab] = useState<'all' | 'order_linked' | 'breakdown'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [costTypeFilter, setCostTypeFilter] = useState<string>('all');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Expense Form State
  const [category, setCategory] = useState<ExpenseCategory>('delivery_transport');
  const [costType, setCostType] = useState<ExpenseCostType>('variable');
  const [payee, setPayee] = useState('Addis Crane & Transport Rental');
  const [amountNet, setAmountNet] = useState(12000);
  const [applyVat, setApplyVat] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('chapa');
  const [department, setDepartment] = useState('Production / Installation');
  const [linkedOrderId, setLinkedOrderId] = useState<string>(orders[0]?.id || '');
  const [notes, setNotes] = useState('Hydraulic boom lift and operator for rooftop installation.');

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const vatAmount = applyVat ? amountNet * 0.15 : 0;
  const totalAmount = amountNet + vatAmount;

  // Handle Create Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee || amountNet <= 0) return;

    const linkedOrder = orders.find((o) => o.id === linkedOrderId);

    const categoryLabels: Record<ExpenseCategory, string> = {
      workshop_rent: 'Workshop & Production Floor Lease',
      electricity: 'EEU 3-Phase Industrial Power Utility',
      generator_fuel: 'Standby Generator Diesel Fuel',
      machine_maintenance: 'Machine Maintenance & Spare Parts',
      delivery_transport: 'Delivery Crane & Site Transport',
      admin_salaries: 'Administrative & Security Salaries',
      security: 'Facility Security & Surveillance',
      office_supplies: 'Design Software & Office Supplies',
      order_direct_supplies: 'Order Direct Custom Hardware',
      crane_scaffolding_rental: 'Hydraulic Crane & Boom Lift Hire',
      installation_per_diem: 'Site Installation Team Daily Per-Diem',
      permits_licensing: 'Municipal Signage Permits & Structural Certification',
    };

    recordExpense({
      category,
      categoryLabel: categoryLabels[category] || category,
      costType,
      supplierOrPayee: payee,
      amountNet,
      vatAmount,
      totalAmount,
      paymentMethod,
      department,
      orderId: linkedOrderId || undefined,
      orderNumber: linkedOrder?.orderNumber,
      notes,
    });

    setShowExpenseModal(false);
    setNotification(
      `Expense of ${formatETB(totalAmount)} logged! ${
        linkedOrder ? `Tagged directly to ${linkedOrder.orderNumber}` : 'Allocated to overhead'
      }.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Cost Aggregations
  const totalExpensesNet = expenses.reduce((sum, e) => sum + e.amountNet, 0);
  const totalVatClaimable = expenses.reduce((sum, e) => sum + e.vatAmount, 0);

  const fixedTotal = expenses
    .filter((e) => e.costType === 'fixed')
    .reduce((sum, e) => sum + e.amountNet, 0);

  const variableTotal = expenses
    .filter((e) => e.costType === 'variable')
    .reduce((sum, e) => sum + e.amountNet, 0);

  const semiVariableTotal = expenses
    .filter((e) => e.costType === 'semi_variable')
    .reduce((sum, e) => sum + e.amountNet, 0);

  const orderLinkedExpenses = expenses.filter((e) => e.orderId);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.supplierOrPayee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.orderNumber && e.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCostType = costTypeFilter === 'all' || e.costType === costTypeFilter;
    return matchesSearch && matchesCostType;
  });

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
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Cost Accounting & Operational Overhead
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Fixed, Variable & Order-Linked Costing
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Factory Expenses, Utilities & Job Tagging</h1>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowExpenseModal(true)}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
          }}
        >
          <PlusCircle size={14} />
          <span>Record New Expense</span>
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
            <span>Total Operational Expenses</span>
            <DollarSign size={16} color="#f59e0b" />
          </div>
          <div className="stat-card-value">{formatETB(totalExpensesNet)}</div>
          <div className="stat-card-subtext">
            <span>Net of input VAT (Operating Cost base)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Fixed Overhead (Lease & Security)</span>
            <Building2 size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value" style={{ color: '#a5b4fc' }}>
            {formatETB(fixedTotal)}
          </div>
          <div className="stat-card-subtext">
            <span>Period expenses (Workshop lease)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Order-Linked Job Expenses</span>
            <Tag size={16} color="#fb7185" />
          </div>
          <div className="stat-card-value" style={{ color: '#fb7185' }}>
            {formatETB(orderLinkedExpenses.reduce((sum, e) => sum + e.amountNet, 0))}
          </div>
          <div className="stat-card-subtext">
            <span>{orderLinkedExpenses.length} expenses billed directly to jobs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Deductible Input VAT (15%)</span>
            <CheckCircle2 size={16} color="#34d399" />
          </div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            {formatETB(totalVatClaimable)}
          </div>
          <div className="stat-card-subtext">
            <span>Claimable against output sales VAT</span>
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
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'all' ? '#fbbf24' : 'var(--text-muted)',
            fontWeight: activeTab === 'all' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={16} />
          <span>All Factory Expenses</span>
          <span className="badge badge-gray">{expenses.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('order_linked')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'order_linked' ? '2px solid #fb7185' : '2px solid transparent',
            color: activeTab === 'order_linked' ? '#fb7185' : 'var(--text-muted)',
            fontWeight: activeTab === 'order_linked' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Tag size={16} />
          <span>Order-Linked Job Expenses</span>
          <span className="badge badge-rose">{orderLinkedExpenses.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'breakdown' ? '2px solid #818cf8' : '2px solid transparent',
            color: activeTab === 'breakdown' ? '#a5b4fc' : 'var(--text-muted)',
            fontWeight: activeTab === 'breakdown' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PieChart size={16} />
          <span>Cost Nature Analysis</span>
        </button>
      </div>

      {/* TAB 1: ALL EXPENSES */}
      {activeTab === 'all' && (
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
                  placeholder="Search expense #, payee, or category..."
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={costTypeFilter}
                onChange={(e) => setCostTypeFilter(e.target.value)}
              >
                <option value="all">All Cost Types</option>
                <option value="fixed">Fixed Overhead</option>
                <option value="variable">Variable Costs</option>
                <option value="semi_variable">Semi-Variable</option>
              </select>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseModal(true)}>
              <PlusCircle size={14} />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense # & Date</th>
                  <th>Category Description</th>
                  <th>Cost Nature</th>
                  <th>Supplier / Payee</th>
                  <th>Net Amount</th>
                  <th>15% VAT</th>
                  <th>Total Paid</th>
                  <th>Payment Channel</th>
                  <th>Allocation / Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => {
                  const costBadge =
                    exp.costType === 'fixed'
                      ? 'badge-purple'
                      : exp.costType === 'variable'
                      ? 'badge-cyan'
                      : 'badge-amber';

                  return (
                    <tr key={exp.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{exp.expenseNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {exp.date}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{exp.categoryLabel}</div>
                        {exp.notes && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${costBadge}`}>
                          {exp.costType.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{exp.supplierOrPayee}</td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(exp.amountNet)}</strong>
                      </td>
                      <td style={{ color: '#34d399' }}>
                        {exp.vatAmount > 0 ? formatETB(exp.vatAmount) : '—'}
                      </td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(exp.totalAmount)}</strong>
                      </td>
                      <td>
                        <span className="badge badge-gray">{exp.paymentMethod.replace('_', ' ')}</span>
                      </td>
                      <td>
                        {exp.orderNumber ? (
                          <span className="badge badge-rose">Job: {exp.orderNumber}</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Factory Overhead
                          </span>
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

      {/* TAB 2: ORDER-LINKED EXPENSES */}
      {activeTab === 'order_linked' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3>Direct Order-Linked Expenses</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              These expenses are not absorbed into general overhead; they are billed and subtracted directly from specific customer jobs to calculate true order profitability.
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Linked Order #</th>
                  <th>Expense Ref</th>
                  <th>Category</th>
                  <th>Payee / Contractor</th>
                  <th>Amount Net</th>
                  <th>Payment Method</th>
                  <th>Job Purpose</th>
                </tr>
              </thead>
              <tbody>
                {orderLinkedExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                        {exp.orderNumber}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{exp.expenseNumber}</strong>
                    </td>
                    <td>{exp.categoryLabel}</td>
                    <td>{exp.supplierOrPayee}</td>
                    <td>
                      <strong style={{ color: '#fb7185' }}>{formatETB(exp.amountNet)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gray">{exp.paymentMethod.replace('_', ' ')}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {exp.notes || 'Direct job installation support'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COST NATURE ANALYSIS */}
      {activeTab === 'breakdown' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Fixed Cost Card */}
          <div className="card" style={{ borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#a855f7" />
                <h3>Fixed Overhead</h3>
              </div>
              <span className="badge badge-purple">Period Expense</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d8b4fe', margin: '8px 0' }}>
              {formatETB(fixedTotal)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Premises lease, facility security, property insurance, and administrative management salaries. Does not change with factory volume.
            </p>
          </div>

          {/* Variable Cost Card */}
          <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#06b6d4" />
                <h3>Variable Costs</h3>
              </div>
              <span className="badge badge-cyan">Volume Dependent</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#67e8f9', margin: '8px 0' }}>
              {formatETB(variableTotal)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Standby generator diesel fuel during power outages, delivery trucks, packaging rolls, and crane hire for site installations.
            </p>
          </div>

          {/* Semi-Variable Cost Card */}
          <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#f59e0b" />
                <h3>Semi-Variable Costs</h3>
              </div>
              <span className="badge badge-amber">Utility & Maintenance</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', margin: '8px 0' }}>
              {formatETB(semiVariableTotal)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              EEU 3-Phase factory power tariff (base service charge + consumption kilowatt hours) and routine CNC printerhead maintenance.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: RECORD NEW EXPENSE */}
      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} color="#f59e0b" />
                <h3>Record Operational Expense</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateExpense}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Expense Category *</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => {
                        const c = e.target.value as ExpenseCategory;
                        setCategory(c);
                        if (c === 'workshop_rent' || c === 'security') setCostType('fixed');
                        else if (c === 'electricity' || c === 'machine_maintenance') setCostType('semi_variable');
                        else setCostType('variable');
                      }}
                      required
                    >
                      <option value="delivery_transport">Delivery Crane & Site Transport</option>
                      <option value="generator_fuel">Standby Generator Diesel Fuel</option>
                      <option value="electricity">EEU 3-Phase Industrial Electricity</option>
                      <option value="workshop_rent">Workshop Premises Lease</option>
                      <option value="machine_maintenance">Machine Maintenance & Spares</option>
                      <option value="security">Security & Surveillance</option>
                      <option value="office_supplies">Office & Design Software</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cost Nature Classification *</label>
                    <select
                      className="form-select"
                      value={costType}
                      onChange={(e) => setCostType(e.target.value as ExpenseCostType)}
                    >
                      <option value="variable">Variable Cost (Product / Order)</option>
                      <option value="fixed">Fixed Overhead (Period Expense)</option>
                      <option value="semi_variable">Semi-Variable (Usage Split)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor / Contractor / Payee *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Net Amount (ETB) *</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      className="form-input"
                      value={amountNet}
                      onChange={(e) => setAmountNet(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Input Tax</label>
                    <button
                      type="button"
                      onClick={() => setApplyVat(!applyVat)}
                      className={`btn btn-sm ${applyVat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '100%', height: '42px' }}
                    >
                      {applyVat ? '✓ +15% Input VAT' : 'No VAT'}
                    </button>
                  </div>
                </div>

                {/* Financial Summary */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Net Base Expense:</span>
                    <strong style={{ color: '#ffffff' }}>{formatETB(amountNet)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginTop: '4px' }}>
                    <span>15% Deductible Input VAT:</span>
                    <span>{formatETB(vatAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: 700, marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span>Total Cash Outflow:</span>
                    <span>{formatETB(totalAmount)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Channel</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="chapa">Chapa Digital Gateway</option>
                      <option value="telebirr">Telebirr Mobile Money</option>
                      <option value="bank_transfer">CBE / Bank Transfer</option>
                      <option value="cash">Cash on Hand</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attach to Customer Job (Optional)</label>
                    <select
                      className="form-select"
                      value={linkedOrderId}
                      onChange={(e) => setLinkedOrderId(e.target.value)}
                    >
                      <option value="">General Overhead (No Order)</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} — {o.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Description / Purpose</label>
                  <input
                    type="text"
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#f59e0b', color: '#ffffff' }}
                >
                  Confirm & Post Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
