'use client';

import React from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  Award,
  Briefcase,
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function HrHeader() {
  const { employees } = useErp();
  const departments = new Set(employees.map((employee) => employee.department)).size;

  return (
    <header
      style={{
        height: '68px',
        background: 'rgba(9, 9, 11, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#facc15',
              boxShadow: '0 0 10px #facc15',
            }}
          />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Dot Advert Human Capital Desk
            </div>
            <div style={{ fontSize: '0.675rem', color: '#a1a1aa' }}>
              Workforce • Payroll • Attendance • Recruitment
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            color: '#a1a1aa',
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          Addis Ababa • ETB
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: 8,
            background: 'rgba(250,204,21,0.12)',
            border: '1px solid rgba(250,204,21,0.28)',
            color: '#facc15',
          }}
          title="Active employees"
        >
          <Users size={13} />
          <span>{employees.length} Active Staff</span>
        </div>

        <div
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid #3f3f46',
            color: '#e4e4e7',
          }}
          title="Departments with active staff"
        >
          <Briefcase size={13} />
          <span>{departments} Departments</span>
        </div>

        <div
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: 8,
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.28)',
            color: '#6ee7b7',
          }}
          title="Statutory payroll compliance"
        >
          <ShieldCheck size={13} />
          <span>MoR 979 Compliant</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #3f3f46',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: '0.78rem',
            color: '#facc15',
            fontWeight: 600,
          }}
        >
          <Award size={14} />
          <span>HR Governance</span>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
          title="Return to Executive ERP Dashboard"
        >
          <LayoutDashboard size={14} />
          <span>Main ERP</span>
        </Link>

        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
          title="View all ERP modules"
        >
          <LayoutGrid size={14} />
          <span>Modules</span>
        </Link>
      </div>
    </header>
  );
}
