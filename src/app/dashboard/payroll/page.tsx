'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function PayrollRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately forward to unified HR Payroll & Labor Hub
    router.replace('/hr?tab=payroll');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          textAlign: 'center',
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: '#facc15',
            color: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 20px rgba(250, 204, 21, 0.35)',
          }}
        >
          <Users size={30} />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(250, 204, 21, 0.12)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.725rem',
            color: '#facc15',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Sparkles size={12} />
          <span>Unified Enterprise HCM Architecture</span>
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 10px', color: '#ffffff' }}>
          Payroll & Labor is inside the HR Hub
        </h2>

        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.55, margin: '0 0 24px' }}>
          Factory Payroll, Ethiopian MoR Proclamation 979/2016 statutory tax schedules, POSE Pension pool (7% + 11%), and Direct Labor Order Job-Costing have been unified into the dedicated HR & Workforce ERP.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link
            href="/hr?tab=payroll"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#facc15',
              color: '#09090b',
              fontWeight: 800,
              padding: '11px 22px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              boxShadow: '0 2px 10px rgba(250, 204, 21, 0.3)',
            }}
          >
            <span>Open HR Payroll & Labor Hub</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #27272a',
            fontSize: '0.75rem',
            color: '#71717a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} color="#facc15" />
          <span>Automatic redirect in progress...</span>
        </div>
      </div>
    </div>
  );
}
