'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useErp } from '@/context/ErpDataContext';
import BrandLogo from '@/components/layout/BrandLogo';
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Cog,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Users,
  Warehouse,
} from 'lucide-react';

import { StoreModuleRole } from '@/types/store';

function StoreSidebarContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { items, stores, suppliers, lowStockItems, purchaseOrders, currentRole, setCurrentRole } = useErp();
  const totalValuation = items.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0);

  const roleView: StoreModuleRole =
    currentRole === 'admin' || currentRole === 'general_manager'
      ? 'admin'
      : currentRole === 'super_admin'
        ? 'super_admin'
        : currentRole === 'procurement_officer'
          ? 'purchasing'
          : currentRole === 'employee' || currentRole === 'machine_operator'
            ? 'staff'
            : currentRole === 'production_supervisor'
              ? 'store_supervisor'
              : 'storekeeper';

  const handleRoleChange = (role: StoreModuleRole) => {
    if (role === 'staff') setCurrentRole('employee');
    else if (role === 'storekeeper') setCurrentRole('storekeeper');
    else if (role === 'purchasing') setCurrentRole('procurement_officer');
    else if (role === 'store_supervisor') setCurrentRole('production_supervisor');
    else if (role === 'admin') setCurrentRole('admin');
    else setCurrentRole('super_admin');
  };

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  const storeNavItems = [
    { tabId: 'overview', label: 'Command Overview', href: '/inventory?tab=overview', icon: Activity },
    {
      tabId: 'purchasing',
      label: 'Purchasing & POs',
      href: '/inventory?tab=purchasing',
      icon: ShoppingCart,
      badge: lowStockItems.length ? `${lowStockItems.length} Reorder` : `${purchaseOrders.length} POs`,
      badgeColor: '#facc15',
      badgeBg: 'rgba(250,204,21,0.14)',
    },
    {
      tabId: 'suppliers',
      label: 'Suppliers & Vendors',
      href: '/inventory?tab=suppliers',
      icon: Building2,
      badge: `${suppliers.length} Vendors`,
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56,189,248,0.14)',
    },
    {
      tabId: 'catalog',
      label: 'Stock Catalog',
      href: '/inventory?tab=catalog',
      icon: PackageSearch,
      badge: `${items.length} SKUs`,
      badgeColor: '#e4e4e7',
      badgeBg: 'rgba(255,255,255,0.08)',
    },
    { tabId: 'inbound', label: 'Inbound / GRN', href: '/inventory?tab=inbound', icon: ArrowDownToLine },
    { tabId: 'outbound', label: 'Outbound / Transfers', href: '/inventory?tab=outbound', icon: ArrowUpFromLine },
    { tabId: 'adjustments', label: 'Adjustments & Counts', href: '/inventory?tab=adjustments', icon: ClipboardCheck },
    { tabId: 'wastage', label: 'Wastage & Scrap', href: '/inventory?tab=wastage', icon: Trash2 },
    {
      tabId: 'approvals',
      label: 'Admin Approvals',
      href: '/inventory?tab=approvals',
      icon: ShieldCheck,
      badge: lowStockItems.length ? `${lowStockItems.length} Low` : undefined,
      badgeColor: '#facc15',
      badgeBg: 'rgba(250,204,21,0.14)',
    },
    { tabId: 'admin', label: 'Admin Highlights', href: '/inventory?tab=admin', icon: ShieldCheck },
    { tabId: 'reports', label: 'Reports & Exports', href: '/inventory?tab=reports', icon: FileSpreadsheet },
    { tabId: 'warehouses', label: 'Warehouses & Bins', href: '/inventory?tab=warehouses', icon: Warehouse },
    { tabId: 'analytics', label: 'Inventory Analytics', href: '/inventory?tab=analytics', icon: BarChart3 },
    { tabId: 'audit', label: 'Audit & Governance', href: '/inventory?tab=audit', icon: FileText },
    { tabId: 'staff', label: 'Staff Requests & Returns', href: '/inventory?tab=staff', icon: Users },
  ];

  const crossNavItems = [
    { label: 'HR & Workforce Hub', href: '/hr', icon: Users },
    { label: 'Procurement & POs', href: '/dashboard/procurement', icon: ShoppingCart },
    { label: 'Factory Work Orders', href: '/orders', icon: Cog },
  ];

  return (
    <aside
      style={{
        width: '275px',
        background: '#09090b',
        borderRight: '1px solid #27272a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <BrandLogo size={38} radius={10} />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              DOT ADVERT
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#facc15',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Stores & Inventory Desk
            </div>
          </div>
        </div>

        {/* Store Role Switcher */}
        <div style={{ padding: '12px 14px 6px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: roleView === 'purchasing' ? '1px solid rgba(250, 204, 21, 0.35)' : '1px solid #27272a',
              borderRadius: 10,
              padding: '10px 12px',
              transition: 'border 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: roleView === 'purchasing' ? '#facc15' : '#a1a1aa',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <ShieldCheck size={12} color={roleView === 'purchasing' ? '#facc15' : '#71717a'} /> Active Desk Role
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 6,
                  background: roleView === 'purchasing' ? 'rgba(250, 204, 21, 0.16)' : 'rgba(255,255,255,0.06)',
                  color: roleView === 'purchasing' ? '#facc15' : '#71717a',
                }}
              >
                {roleView === 'purchasing' ? 'Procurement' : roleView.replace('_', ' ')}
              </span>
            </div>

            <select
              value={roleView}
              onChange={(e) => handleRoleChange(e.target.value as StoreModuleRole)}
              style={{
                width: '100%',
                background: '#18181b',
                color: '#ffffff',
                border: '1px solid #3f3f46',
                borderRadius: 7,
                padding: '6px 9px',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="purchasing">🛒 Purchasing / Procurement Officer</option>
              <option value="storekeeper">📦 Storekeeper (Custodian)</option>
              <option value="store_supervisor">🧭 Store / Production Supervisor</option>
              <option value="staff">👤 Staff Requester</option>
              <option value="admin">🛡️ Admin Operations</option>
              <option value="super_admin">⚡ Super Admin Master</option>
            </select>
          </div>
        </div>

        <nav style={{ padding: '10px 12px 16px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#71717a',
              letterSpacing: '0.08em',
              padding: '6px 12px 4px',
            }}
          >
            Inventory Workspaces
          </div>

          {storeNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tabId;

            return (
              <Link
                key={item.tabId}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  background: isActive ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  border: isActive ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? '#facc15' : '#71717a'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 10,
                      color: item.badgeColor,
                      background: item.badgeBg,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#71717a',
              letterSpacing: '0.08em',
              padding: '16px 12px 4px',
            }}
          >
            Operations Handoff
          </div>

          {crossNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  color: '#71717a',
                  fontSize: '0.81rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#71717a';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={13} color="rgba(255,255,255,0.2)" />
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.12) 0%, rgba(202, 138, 4, 0.06) 100%)',
            border: '1px solid rgba(250, 204, 21, 0.22)',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 700 }}>Inventory Valuation</span>
            <Sparkles size={13} color="#facc15" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatETB(totalValuation)}
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            {items.length} SKUs across {stores.length} warehouses
          </div>
        </div>

        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #27272a',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Main ERP</span>
        </Link>

        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            color: '#71717a',
            fontSize: '11px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <LayoutGrid size={13} />
          <span>All Modules Directory</span>
        </Link>
      </div>
    </aside>
  );
}

export default function StoreSidebar() {
  return (
    <React.Suspense fallback={<aside style={{ width: '275px', background: '#09090b' }} />}>
      <StoreSidebarContent />
    </React.Suspense>
  );
}
