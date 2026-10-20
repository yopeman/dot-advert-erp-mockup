'use client';

import React, { useState } from 'react';
import { useErp } from '@/context/ErpDataContext';
import {
  Users,
  Clock,
  Calculator,
  Building2,
  CheckCircle2,
  PlusCircle,
  Search,
  Printer,
  ShieldCheck,
  FileSpreadsheet,
  X,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { Employee, PayrollEntry } from '@/types/erp';

export default function PayrollPage() {
  const { employees, orders, workOrders, updateWorkOrder } = useErp();

  const [activeTab, setActiveTab] = useState<'payroll' | 'allocation' | 'employees'>('payroll');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPayslipEmployee, setPreviewPayslipEmployee] = useState<Employee | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Allocation Form State
  const [allocEmpId, setAllocEmpId] = useState(employees[0]?.id || '');
  const [allocWoId, setAllocWoId] = useState(workOrders[0]?.id || '');
  const [allocHours, setAllocHours] = useState(8);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  // Statutory Ethiopian Income Tax Calculation
  const calculateIncomeTax = (taxableIncome: number) => {
    if (taxableIncome <= 600) return 0;
    if (taxableIncome <= 1650) return taxableIncome * 0.1 - 60;
    if (taxableIncome <= 3200) return taxableIncome * 0.15 - 142.5;
    if (taxableIncome <= 5250) return taxableIncome * 0.2 - 302.5;
    if (taxableIncome <= 7800) return taxableIncome * 0.25 - 565;
    if (taxableIncome <= 10900) return taxableIncome * 0.3 - 955;
    return taxableIncome * 0.35 - 1500;
  };

  // Compute live payroll entry for each employee
  const payrollData = employees.map((emp) => {
    const overtimeHours = emp.department === 'production' ? 12 : 0;
    const overtimePay = overtimeHours * (emp.hourlyRate * 1.5);
    const grossPay = emp.baseSalary + emp.allowances + overtimePay;

    // 7% Employee Pension on base salary
    const pension7Pct = emp.baseSalary * 0.07;
    // 11% Employer Pension (company cost)
    const pension11Pct = emp.baseSalary * 0.11;

    // Taxable income is Gross Pay minus Employee Pension
    const taxableIncome = Math.max(0, grossPay - pension7Pct);
    const incomeTax = calculateIncomeTax(taxableIncome);

    const netPay = grossPay - pension7Pct - incomeTax;

    return {
      emp,
      overtimeHours,
      overtimePay,
      grossPay,
      pension7Pct,
      pension11Pct,
      incomeTax,
      netPay,
    };
  });

  const totalGrossSalaries = payrollData.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNetPay = payrollData.reduce((sum, p) => sum + p.netPay, 0);
  const totalTaxWithheld = payrollData.reduce((sum, p) => sum + p.incomeTax, 0);
  const totalPensionContributions = payrollData.reduce(
    (sum, p) => sum + p.pension7Pct + p.pension11Pct,
    0
  );

  // Handle Labor Allocation to Work Order
  const handleAllocateLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.id === allocWoId);
    const emp = employees.find((em) => em.id === allocEmpId);
    if (!wo || !emp) return;

    // Add operator to work order if not present and increment machine hours
    const updatedOperators = wo.operatorNames.includes(emp.name)
      ? wo.operatorNames
      : [...wo.operatorNames, emp.name];

    updateWorkOrder(wo.id, {
      operatorNames: updatedOperators,
      machineHours: wo.machineHours + allocHours,
    });

    setShowAllocateModal(false);
    setNotification(
      `Allocated ${allocHours} direct labor hours from ${emp.name} to ${wo.workOrderNumber}. Order costing updated!`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
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
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Human Resources & Payroll
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              • Statutory Tax, Pension & Direct Labor Costing
            </span>
          </div>
          <h1 style={{ marginTop: '2px' }}>Factory Payroll & Job-Cost Allocation</h1>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAllocateModal(true)}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
          }}
        >
          <Clock size={14} />
          <span>Allocate Direct Labor to Order</span>
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
            <span>Monthly Gross Salaries</span>
            <Calculator size={16} color="#818cf8" />
          </div>
          <div className="stat-card-value">{formatETB(totalGrossSalaries)}</div>
          <div className="stat-card-subtext">
            <span>Base salary + allowances + overtime</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Net Take-Home Pay</span>
            <Users size={16} color="#10b981" />
          </div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            {formatETB(totalNetPay)}
          </div>
          <div className="stat-card-subtext">
            <span>Credited directly to employee CBE / Awash accounts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Statutory Income Tax (PAYE)</span>
            <ShieldCheck size={16} color="#f59e0b" />
          </div>
          <div className="stat-card-value" style={{ color: '#fbbf24' }}>
            {formatETB(totalTaxWithheld)}
          </div>
          <div className="stat-card-subtext">
            <span>Withheld per Ethiopian Ministry of Revenues brackets</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">
            <span>Pension Fund (7% + 11%)</span>
            <Building2 size={16} color="#a855f7" />
          </div>
          <div className="stat-card-value" style={{ color: '#c084fc' }}>
            {formatETB(totalPensionContributions)}
          </div>
          <div className="stat-card-subtext">
            <span>7% Employee + 11% Employer Pension Agency contribution</span>
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
          onClick={() => setActiveTab('payroll')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'payroll' ? '2px solid #10b981' : '2px solid transparent',
            color: activeTab === 'payroll' ? '#34d399' : 'var(--text-muted)',
            fontWeight: activeTab === 'payroll' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Monthly Payroll Run ({selectedMonth})</span>
        </button>

        <button
          onClick={() => setActiveTab('allocation')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'allocation' ? '2px solid #818cf8' : '2px solid transparent',
            color: activeTab === 'allocation' ? '#a5b4fc' : 'var(--text-muted)',
            fontWeight: activeTab === 'allocation' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} />
          <span>Direct Labor Job Costing</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'employees' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'employees' ? '#67e8f9' : 'var(--text-muted)',
            fontWeight: activeTab === 'employees' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Briefcase size={16} />
          <span>Employee Directory</span>
          <span className="badge badge-gray">{employees.length}</span>
        </button>
      </div>

      {/* TAB 1: MONTHLY PAYROLL RUN */}
      {activeTab === 'payroll' && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3>October 2026 Factory Payroll Ledger</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Full statutory compliance: Ethiopian Income Tax Proclamation & 7% / 11% Pension Proclamation.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payroll Period:</span>
              <input
                type="month"
                className="form-input"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.825rem' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee & Role</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Allowances</th>
                  <th>Overtime</th>
                  <th>Gross Pay</th>
                  <th>Pension (7%)</th>
                  <th>Income Tax</th>
                  <th>Net Take-Home</th>
                  <th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map(
                  ({
                    emp,
                    overtimeHours,
                    overtimePay,
                    grossPay,
                    pension7Pct,
                    incomeTax,
                    netPay,
                  }) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {emp.employeeId} • {emp.position}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            emp.department === 'production'
                              ? 'badge-primary'
                              : emp.department === 'finance'
                              ? 'badge-purple'
                              : emp.department === 'stores'
                              ? 'badge-cyan'
                              : 'badge-gray'
                          }`}
                        >
                          {emp.department}
                        </span>
                      </td>
                      <td>{formatETB(emp.baseSalary)}</td>
                      <td>{formatETB(emp.allowances)}</td>
                      <td>
                        {overtimeHours > 0 ? (
                          <div>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                              {formatETB(overtimePay)}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                              {overtimeHours} hrs @ 1.5x
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{formatETB(grossPay)}</strong>
                      </td>
                      <td style={{ color: '#c084fc' }}>{formatETB(pension7Pct)}</td>
                      <td style={{ color: '#fbbf24' }}>{formatETB(incomeTax)}</td>
                      <td>
                        <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
                          {formatETB(netPay)}
                        </strong>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          onClick={() => setPreviewPayslipEmployee(emp)}
                        >
                          <Printer size={13} />
                          <span>Payslip</span>
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT LABOR JOB COST ALLOCATION */}
      {activeTab === 'allocation' && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3>Direct Labor Cost Allocation Engine</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Factory operators' hours are directly allocated into active customer work orders rather than dumped into period overhead.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAllocateModal(true)}>
              <Clock size={14} />
              <span>Log Direct Labor Hours</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Work Order & Job</th>
                  <th>Client</th>
                  <th>Assigned Operators</th>
                  <th>Total Hours Logged</th>
                  <th>Hourly Direct Rate</th>
                  <th>Allocated Labor Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo) => {
                  const numOps = Math.max(1, wo.operatorNames.length);
                  const directLaborCost = wo.machineHours * 120 * numOps;

                  return (
                    <tr key={wo.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{wo.workOrderNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {wo.productDescription}
                        </div>
                      </td>
                      <td>{wo.customerName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {wo.operatorNames.map((name, i) => (
                            <span key={i} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong>{wo.machineHours} hours</strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>120 ETB/hr/operator</td>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{formatETB(directLaborCost)}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            wo.status === 'completed'
                              ? 'badge-emerald'
                              : wo.status === 'in_progress'
                              ? 'badge-cyan'
                              : 'badge-gray'
                          }`}
                        >
                          {wo.status.replace('_', ' ')}
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

      {/* TAB 3: EMPLOYEE DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
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
                placeholder="Search employee name or role..."
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {filteredEmployees.length} registered personnel
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID & Name</th>
                  <th>Role & Title</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Hourly Rate</th>
                  <th>TIN & Pension #</th>
                  <th>Bank Account</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{emp.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {emp.employeeId}
                      </div>
                    </td>
                    <td>{emp.position}</td>
                    <td>
                      <span className="badge badge-gray">{emp.department}</span>
                    </td>
                    <td>{formatETB(emp.baseSalary)}</td>
                    <td style={{ color: '#38bdf8' }}>{formatETB(emp.hourlyRate)}/hr</td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>TIN: {emp.tin}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {emp.pensionNumber}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{emp.bankName}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                        A/C: {emp.bankAccount}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-emerald">{emp.employmentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ALLOCATE LABOR */}
      {showAllocateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#10b981" />
                <h3>Allocate Direct Labor to Work Order</h3>
              </div>
              <button
                onClick={() => setShowAllocateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocateLabor}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Workshop Operator *</label>
                  <select
                    className="form-select"
                    value={allocEmpId}
                    onChange={(e) => setAllocEmpId(e.target.value)}
                    required
                  >
                    {employees
                      .filter((e) => e.department === 'production')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.position} ({formatETB(e.hourlyRate)}/hr)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Work Order *</label>
                  <select
                    className="form-select"
                    value={allocWoId}
                    onChange={(e) => setAllocWoId(e.target.value)}
                    required
                  >
                    {workOrders.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.workOrderNumber} — {w.customerName} ({w.productDescription})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hours to Allocate *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={allocHours}
                    onChange={(e) => setAllocHours(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAllocateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#10b981', color: '#ffffff' }}
                >
                  Allocate & Update Job Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL PRINTABLE PAYSLIP */}
      {previewPayslipEmployee && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '640px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                background: '#0f172a',
                color: '#ffffff',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Employee Payslip Preview ({selectedMonth})
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: '#10b981', color: '#ffffff' }}
                  onClick={() => window.print()}
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPreviewPayslipEmployee(null)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '28px 32px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                  DOT ADVERT & PRINT SOLUTIONS PLC
                </h3>
                <div style={{ fontSize: '0.775rem', color: '#475569' }}>
                  Bole Sub-City, Addis Ababa, Ethiopia • TIN: 0048291032
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  CONFIDENTIAL SALARY PAYSLIP — {selectedMonth}
                </div>
              </div>

              {/* Employee Details Box */}
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Employee Name: </span>
                  <strong style={{ color: '#0f172a' }}>{previewPayslipEmployee.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Employee ID: </span>
                  <strong>{previewPayslipEmployee.employeeId}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Position: </span>
                  <strong>{previewPayslipEmployee.position}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Department: </span>
                  <strong>{previewPayslipEmployee.department}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Tax TIN: </span>
                  <strong>{previewPayslipEmployee.tin}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Pension No: </span>
                  <strong>{previewPayslipEmployee.pensionNumber}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b' }}>Bank Account: </span>
                  <strong>{previewPayslipEmployee.bankName} - {previewPayslipEmployee.bankAccount}</strong>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                {/* Earnings */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ background: '#f1f5f9', padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                    Earnings
                  </div>
                  <div style={{ padding: '10px 12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Salary:</span>
                      <strong>{formatETB(previewPayslipEmployee.baseSalary)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Allowances:</span>
                      <strong>{formatETB(previewPayslipEmployee.allowances)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Overtime Pay:</span>
                      <strong>
                        {formatETB(
                          previewPayslipEmployee.department === 'production'
                            ? 12 * (previewPayslipEmployee.hourlyRate * 1.5)
                            : 0
                        )}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontWeight: 700 }}>
                      <span>Gross Earnings:</span>
                      <span style={{ color: '#16a34a' }}>
                        {formatETB(
                          previewPayslipEmployee.baseSalary +
                            previewPayslipEmployee.allowances +
                            (previewPayslipEmployee.department === 'production'
                              ? 12 * (previewPayslipEmployee.hourlyRate * 1.5)
                              : 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ background: '#f1f5f9', padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                    Statutory Deductions
                  </div>
                  <div style={{ padding: '10px 12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Employee Pension (7%):</span>
                      <span style={{ color: '#dc2626' }}>
                        {formatETB(previewPayslipEmployee.baseSalary * 0.07)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Income Tax (PAYE):</span>
                      <span style={{ color: '#dc2626' }}>
                        {formatETB(
                          calculateIncomeTax(
                            Math.max(
                              0,
                              previewPayslipEmployee.baseSalary +
                                previewPayslipEmployee.allowances -
                                previewPayslipEmployee.baseSalary * 0.07
                            )
                          )
                        )}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontWeight: 700 }}>
                      <span>Total Deductions:</span>
                      <span style={{ color: '#dc2626' }}>
                        {formatETB(
                          previewPayslipEmployee.baseSalary * 0.07 +
                            calculateIncomeTax(
                              Math.max(
                                0,
                                previewPayslipEmployee.baseSalary +
                                  previewPayslipEmployee.allowances -
                                  previewPayslipEmployee.baseSalary * 0.07
                              )
                            )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '6px',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                    Net Salary Payable
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
                    {formatETB(
                      previewPayslipEmployee.baseSalary +
                        previewPayslipEmployee.allowances -
                        previewPayslipEmployee.baseSalary * 0.07 -
                        calculateIncomeTax(
                          Math.max(
                            0,
                            previewPayslipEmployee.baseSalary +
                              previewPayslipEmployee.allowances -
                              previewPayslipEmployee.baseSalary * 0.07
                          )
                        )
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                  Employer Pension (11%): {formatETB(previewPayslipEmployee.baseSalary * 0.11)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
