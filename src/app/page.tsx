'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  Boxes,
  Cog,
  Users,
  Receipt,
  CalendarCheck,
  TrendingUp,
  BarChart3,
  LayoutDashboard,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

interface OdooApp {
  id: string;
  name: string;
  category: 'operations' | 'sales' | 'finance' | 'management';
  icon: React.ElementType;
  href: string;
  gradient: string;
  shadowColor: string;
  badgeCount?: number;
  badgeColor?: string;
  badgeTitle?: string;
}

export default function OdooLightAppLauncherPage() {
  const {
    items,
    lowStockItems,
    orders,
    leads,
    invoices,
    employees,
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const activeOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'in_production' || o.status === 'pending').length,
    [orders]
  );

  const unpaidInvoicesCount = useMemo(
    () => invoices.filter((i) => i.paymentStatus !== 'paid').length,
    [invoices]
  );

  // Odoo-style Apps: Vibrant squircle icons over clean light surfaces
  const apps: OdooApp[] = useMemo(
    () => [
      {
        id: 'inventory',
        name: 'Store & Purchasing Inventory',
        category: 'operations',
        icon: Boxes,
        href: '/inventory',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        shadowColor: 'rgba(245, 158, 11, 0.42)',
        badgeCount: lowStockItems.length > 0 ? lowStockItems.length : undefined,
        badgeColor: '#ef4444',
        badgeTitle: `${lowStockItems.length} items low on stock`,
      },
      {
        id: 'orders',
        name: 'Production & Orders',
        category: 'operations',
        icon: Cog,
        href: '/orders',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        shadowColor: 'rgba(2, 132, 199, 0.42)',
        badgeCount: activeOrdersCount > 0 ? activeOrdersCount : undefined,
        badgeColor: '#0284c7',
        badgeTitle: `${activeOrdersCount} manufacturing orders active`,
      },
      {
        id: 'crm',
        name: 'CRM',
        category: 'sales',
        icon: Users,
        href: '/crm',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        shadowColor: 'rgba(139, 92, 246, 0.42)',
        badgeCount: leads.length > 0 ? leads.length : undefined,
        badgeColor: '#8b5cf6',
        badgeTitle: `${leads.length} leads in commercial pipeline`,
      },
      {
        id: 'sales',
        name: 'Sales & Invoicing',
        category: 'sales',
        icon: Receipt,
        href: '/sales',
        gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        shadowColor: 'rgba(16, 185, 129, 0.42)',
        badgeCount: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
        badgeColor: '#f59e0b',
        badgeTitle: `${unpaidInvoicesCount} invoices pending payment`,
      },
      {
        id: 'hr',
        name: 'HR & Payroll',
        category: 'management',
        icon: CalendarCheck,
        href: '/hr',
        gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
        shadowColor: 'rgba(249, 115, 22, 0.42)',
        badgeCount: employees.length > 0 ? employees.length : undefined,
        badgeColor: '#09090b',
        badgeTitle: `${employees.length} employees enrolled`,
      },
      {
        id: 'finance',
        name: 'Finance',
        category: 'finance',
        icon: TrendingUp,
        href: '/finance',
        gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
        shadowColor: 'rgba(234, 179, 8, 0.42)',
      },
      {
        id: 'report',
        name: 'Reports & BI',
        category: 'management',
        icon: BarChart3,
        href: '/report',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        shadowColor: 'rgba(99, 102, 241, 0.42)',
      },
    ],
    [
      lowStockItems.length,
      activeOrdersCount,
      leads.length,
      unpaidInvoicesCount,
      employees.length,
    ]
  );

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchCat = activeCategory === 'all' || app.category === activeCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      return app.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    });
  }, [apps, activeCategory, searchQuery]);

  return (
    <div className="launcher-page-container">
      {/* ─── Main White Odoo App Launcher Board ─── */}
      <div className="launcher-board">
        {/* Subtle Top Yellow Hairline */}
        <div className="launcher-top-hairline" />

        {/* ─── Search & Category Controls ─── */}
        <div className="launcher-controls-wrapper">
          {/* Subtle Brand Tag */}
          <div className="launcher-brand-tag">
            <Sparkles size={12} color="#ca8a04" />
            <span>Dot Advert ERP • App Launcher</span>
          </div>

          {/* Odoo Floating Search Bar */}
          <div className="launcher-search-box">
            <Search size={18} className="launcher-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps (e.g. inventory, sales)..."
              autoFocus
              className="launcher-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="launcher-search-clear"
                title="Clear search"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Clean Category Filter Pills (Horizontal Scroll on Mobile) */}
          <div className="launcher-category-scroll">
            <div className="launcher-category-pills">
              {[
                { id: 'all', label: 'All Apps' },
                { id: 'operations', label: 'Operations' },
                { id: 'sales', label: 'Sales & CRM' },
                { id: 'finance', label: 'Finance' },
                { id: 'management', label: 'Management' },
              ].map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    type="button"
                    className={`category-pill ${isSelected ? 'category-pill-active' : ''}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Iconic Odoo App Launcher Grid ─── */}
        {filteredApps.length === 0 ? (
          <div className="launcher-empty-state">
            <Search size={32} color="#a1a1aa" style={{ margin: '0 auto 10px' }} />
            <p className="launcher-empty-text">
              No apps found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="launcher-empty-reset"
              type="button"
            >
              Show All Apps
            </button>
          </div>
        ) : (
          <div className="launcher-app-grid">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const isHovered = hoveredApp === app.id;

              return (
                <Link
                  key={app.id}
                  href={app.href}
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  className="launcher-app-item"
                >
                  {/* ─── Squircle App Icon ─── */}
                  <div
                    className="launcher-app-squircle"
                    style={{
                      background: app.gradient,
                      boxShadow: isHovered
                        ? `0 16px 30px -4px ${app.shadowColor}, 0 0 0 3px rgba(250, 204, 21, 0.45)`
                        : `0 8px 18px -4px ${app.shadowColor}`,
                      transform: isHovered ? 'translateY(-6px) scale(1.06)' : 'translateY(0) scale(1)',
                    }}
                  >
                    <Icon className="launcher-squircle-icon" strokeWidth={2.1} />

                    {/* Notification Badge Bubble (Odoo Style) */}
                    {app.badgeCount !== undefined && app.badgeCount > 0 && (
                      <div
                        title={app.badgeTitle}
                        className="launcher-app-badge"
                        style={{
                          background: app.badgeColor || '#ef4444',
                        }}
                      >
                        {app.badgeCount}
                      </div>
                    )}
                  </div>

                  {/* ─── Crisp Clean App Title (No Small Text Paragraphs) ─── */}
                  <span
                    className="launcher-app-name"
                    style={{
                      color: isHovered ? '#ca8a04' : '#0f172a',
                    }}
                  >
                    {app.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Minimal Bottom Status Line ─── */}
      <div className="launcher-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="launcher-pulse-dot" />
          <span style={{ color: '#09090b', fontWeight: 700 }}>Dot Advert PLC</span>
        </div>
        <span>•</span>
        <span>Manufacturing ERP</span>
        <span>•</span>
        <span>Ethiopian 15% VAT Compliant</span>
      </div>

      {/* ─── Dedicated Mobile Responsive Styles ─── */}
      <style>{`
        .launcher-page-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 20px 40px;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        .launcher-board {
          width: 100%;
          max-width: 1040px;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #e4e4e7;
          box-shadow: 0 12px 36px -12px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.02);
          padding: 38px 40px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .launcher-top-hairline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #facc15 0%, #ca8a04 50%, #38bdf8 100%);
        }

        .launcher-controls-wrapper {
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 44px;
        }

        .launcher-brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(250, 204, 21, 0.16);
          border: 1px solid rgba(250, 204, 21, 0.38);
          color: #854d0e;
          fontSize: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .launcher-search-box {
          position: relative;
          width: 100%;
          max-width: 520px;
        }

        .launcher-search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #71717a;
          pointer-events: none;
        }

        .launcher-search-input {
          width: 100%;
          height: 52px;
          padding-left: 50px;
          padding-right: 44px;
          font-size: 14.5px;
          font-weight: 500;
          border-radius: 9999px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #09090b;
          outline: none;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .launcher-search-input:focus {
          border-color: #facc15;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.28), 0 6px 20px rgba(0, 0, 0, 0.06);
        }

        .launcher-search-clear {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #71717a;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .launcher-category-scroll {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .launcher-category-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-pill {
          padding: 6px 15px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid #e4e4e7;
          background: #f4f4f5;
          color: #52525b;
          transition: all 0.15s ease;
          white-space: nowrap;
          user-select: none;
        }

        .category-pill:hover {
          background: #e4e4e7;
          color: #09090b;
        }

        .category-pill-active {
          border-color: #09090b !important;
          background: #09090b !important;
          color: #facc15 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .launcher-app-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          column-gap: 36px;
          row-gap: 38px;
          justify-items: center;
        }

        .launcher-app-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          width: 170px;
          position: relative;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .launcher-app-squircle {
          width: 82px;
          height: 82px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          position: relative;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }

        .launcher-squircle-icon {
          width: 40px;
          height: 40px;
        }

        .launcher-app-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 9999px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          line-height: 1;
        }

        .launcher-app-name {
          margin-top: 13px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          text-align: center;
          line-height: 1.3;
          max-width: 160px;
          transition: color 0.15s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .launcher-empty-state {
          padding: 48px 24px;
          text-align: center;
          color: #71717a;
        }

        .launcher-empty-text {
          font-size: 15px;
          font-weight: 600;
          color: #09090b;
        }

        .launcher-empty-reset {
          margin-top: 12px;
          padding: 7px 18px;
          border-radius: 9999px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #09090b;
          font-size: 12.5px;
          cursor: pointer;
          font-weight: 700;
        }

        .launcher-footer {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #71717a;
          font-weight: 600;
          flex-wrap: wrap;
          justify-content: center;
          text-align: center;
        }

        .launcher-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 6px rgba(22, 163, 74, 0.6);
          display: inline-block;
        }

        /* ─── Tablet Responsiveness (769px - 1024px) ─── */
        @media (max-width: 1024px) {
          .launcher-board {
            padding: 32px 30px 42px;
          }
          .launcher-app-grid {
            column-gap: 28px;
            row-gap: 32px;
          }
          .launcher-app-item {
            width: 155px;
          }
        }

        /* ─── Medium Screen / Small Tablet (581px - 860px) ─── */
        @media (max-width: 860px) {
          .launcher-board {
            padding: 26px 20px 36px;
            border-radius: 22px;
          }
          .launcher-app-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            column-gap: 22px;
            row-gap: 28px;
          }
          .launcher-app-item {
            width: 140px;
          }
          .launcher-app-squircle {
            width: 76px;
            height: 76px;
            border-radius: 20px;
          }
          .launcher-squircle-icon {
            width: 36px;
            height: 36px;
          }
          .launcher-app-name {
            font-size: 13px;
            max-width: 135px;
          }
        }

        /* ─── Mobile Phones (<= 580px, iPhones, Galaxy, Pixel) ─── */
        @media (max-width: 580px) {
          .launcher-page-container {
            padding: 4px 6px 24px;
          }

          .launcher-board {
            padding: 20px 14px 28px;
            border-radius: 20px;
            box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.05);
          }

          .launcher-controls-wrapper {
            margin-bottom: 24px;
            gap: 12px;
          }

          .launcher-brand-tag {
            font-size: 10px;
            padding: 4px 12px;
          }

          .launcher-search-input {
            height: 44px;
            font-size: 13.5px;
            padding-left: 44px;
            padding-right: 38px;
          }

          .launcher-search-icon {
            left: 15px;
            width: 16px;
            height: 16px;
          }

          /* Horizontal Category Scroll on Mobile */
          .launcher-category-scroll {
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 4px 0;
            width: 100%;
          }

          .launcher-category-scroll::-webkit-scrollbar {
            display: none;
          }

          .launcher-category-pills {
            flex-wrap: nowrap;
            justify-content: flex-start;
            gap: 6px;
          }

          .category-pill {
            padding: 5px 12px;
            font-size: 11px;
            flex-shrink: 0;
          }

          /* 2 Column App Grid for Touch-Friendly Mobile Layout */
          .launcher-app-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 14px;
            row-gap: 22px;
            width: 100%;
          }

          .launcher-app-item {
            width: 100%;
            max-width: 140px;
          }

          .launcher-app-squircle {
            width: 70px;
            height: 70px;
            border-radius: 19px;
          }

          .launcher-squircle-icon {
            width: 33px;
            height: 33px;
          }

          .launcher-app-badge {
            top: -4px;
            right: -4px;
            min-width: 19px;
            height: 19px;
            font-size: 10px;
            padding: 0 5px;
          }

          .launcher-app-name {
            margin-top: 9px;
            font-size: 12.5px;
            line-height: 1.25;
            max-width: 130px;
          }

          .launcher-footer {
            margin-top: 20px;
            font-size: 11px;
            gap: 8px;
          }
        }

        /* ─── Ultra-Compact Mobile (< 360px, small phones) ─── */
        @media (max-width: 360px) {
          .launcher-board {
            padding: 16px 10px 22px;
          }
          .launcher-app-squircle {
            width: 62px;
            height: 62px;
            border-radius: 17px;
          }
          .launcher-squircle-icon {
            width: 28px;
            height: 28px;
          }
          .launcher-app-name {
            font-size: 11.5px;
            max-width: 115px;
          }
        }

        /* Touch Device Optimizations: Disable persistent transform locks */
        @media (hover: none) {
          .launcher-app-squircle {
            transform: none !important;
          }
          .launcher-app-squircle:active {
            transform: scale(0.96) !important;
          }
        }
      `}</style>
    </div>
  );
}