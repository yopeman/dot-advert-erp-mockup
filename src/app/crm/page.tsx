'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useErp } from '@/context/ErpDataContext';
import {
  Lead,
  Customer,
  LeadStage,
  LeadSource,
  SignageType,
  SiteSurvey,
} from '@/types/erp';
import {
  Users,
  UserCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Ruler,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Filter,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  X,
  Eye,
  Edit3,
  Calendar,
  Layers,
  ShoppingBag,
  Clock,
  Briefcase,
} from 'lucide-react';

export default function CrmPage() {
  const {
    leads,
    customers,
    orders,
    createLead,
    updateLead,
    createCustomer,
    updateCustomer,
    convertLeadToCustomer,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'customers' | 'surveys'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | LeadStage>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | SignageType>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modals
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [surveyModalLead, setSurveyModalLead] = useState<Lead | null>(null);
  const [convertModalLead, setConvertModalLead] = useState<Lead | null>(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<Customer | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form States: New Lead
  const [leadForm, setLeadForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    tin: '',
    city: 'Addis Ababa',
    stage: 'new' as LeadStage,
    source: 'walk_in' as LeadSource,
    projectType: 'acrylic_3d' as SignageType,
    estimatedBudget: 150000,
    probabilityPercent: 50,
    expectedCloseDate: '2026-11-15',
    assignedTo: 'Dawit Bekele',
    notes: '',
    hasSurvey: true,
    surveyAddress: '',
    widthMeters: 4.0,
    heightMeters: 1.2,
    installationHeightMeters: 3.5,
    powerSourceAvailable: true,
    indoorOutdoor: 'outdoor' as 'indoor' | 'outdoor',
    surveyNotes: '',
  });

  // Form States: New Customer
  const [customerForm, setCustomerForm] = useState({
    name: '',
    tin: '',
    address: 'Bole Sub-City, Addis Ababa',
    phone: '',
    email: '',
    customerType: 'business' as 'business' | 'individual' | 'government' | 'export',
    creditLimit: 300000,
    paymentTerms: '30 Days Net',
    isVatRegistered: true,
  });

  // Form States: Site Survey Edit
  const [surveyForm, setSurveyForm] = useState<SiteSurvey>({
    locationAddress: '',
    widthMeters: 0,
    heightMeters: 0,
    installationHeightMeters: 0,
    powerSourceAvailable: true,
    indoorOutdoor: 'outdoor',
    notes: '',
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
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

  const projectTypeLabels: Record<SignageType, string> = {
    acrylic_3d: '3D Acrylic Letters',
    billboard_skin: 'Billboard Flex Skin',
    pylon_sign: 'Illuminated Pylon Sign',
    neon_led: 'Neon & LED Signage',
    vehicle_branding: 'Fleet Vehicle Wrap',
    expo_booth: 'Exhibition & Trade Booth',
    indoor_pos: 'Indoor Retail POS Branding',
    other: 'Custom Fabrication',
  };

  const stageColumns: { stage: LeadStage; label: string; color: string }[] = [
    { stage: 'new', label: '1. New Inquiries', color: '#6366f1' },
    { stage: 'site_visit', label: '2. Site Survey / Measurement', color: '#06b6d4' },
    { stage: 'quoted', label: '3. Proposal / Quoted', color: '#f59e0b' },
    { stage: 'negotiation', label: '4. Negotiation', color: '#a855f7' },
    { stage: 'won', label: '5. Won & Converted', color: '#10b981' },
    { stage: 'lost', label: '6. Closed / Lost', color: '#f43f5e' },
  ];

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesType = projectTypeFilter === 'all' || lead.projectType === projectTypeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.companyName.toLowerCase().includes(q) ||
        lead.contactPerson.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.leadNumber.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q);
      return matchesStage && matchesType && matchesSearch;
    });
  }, [leads, stageFilter, projectTypeFilter, searchQuery]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.code.toLowerCase().includes(q) ||
        cust.tin.includes(q) ||
        cust.phone.includes(q)
      );
    });
  }, [customers, searchQuery]);

  // Leads that have surveys
  const surveyLeads = useMemo(() => {
    return leads.filter((l) => l.siteSurvey);
  }, [leads]);

  // KPI calculations
  const totalPipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.stage !== 'lost' && l.stage !== 'won')
      .reduce((sum, l) => sum + l.estimatedBudget, 0);
  }, [leads]);

  const activeLeadsCount = leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won').length;
  const wonLeadsCount = leads.filter((l) => l.stage === 'won').length;

  // Handlers
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.companyName || !leadForm.phone) {
      alert('Please provide company name and phone number.');
      return;
    }

    const newLead = createLead({
      companyName: leadForm.companyName,
      contactPerson: leadForm.contactPerson || 'General Manager',
      phone: leadForm.phone,
      email: leadForm.email || undefined,
      tin: leadForm.tin || undefined,
      city: leadForm.city,
      stage: leadForm.stage,
      source: leadForm.source,
      projectType: leadForm.projectType,
      estimatedBudget: Number(leadForm.estimatedBudget),
      probabilityPercent: Number(leadForm.probabilityPercent),
      expectedCloseDate: leadForm.expectedCloseDate,
      assignedTo: leadForm.assignedTo,
      notes: leadForm.notes,
      siteSurvey: leadForm.hasSurvey
        ? {
            locationAddress: leadForm.surveyAddress || `${leadForm.city}, Site Facade`,
            widthMeters: Number(leadForm.widthMeters),
            heightMeters: Number(leadForm.heightMeters),
            installationHeightMeters: Number(leadForm.installationHeightMeters),
            powerSourceAvailable: leadForm.powerSourceAvailable,
            indoorOutdoor: leadForm.indoorOutdoor,
            notes: leadForm.surveyNotes,
          }
        : undefined,
    });

    setShowNewLeadModal(false);
    showToast(`Lead ${newLead.leadNumber} (${newLead.companyName}) created successfully!`);
    // Reset Form
    setLeadForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      tin: '',
      city: 'Addis Ababa',
      stage: 'new',
      source: 'walk_in',
      projectType: 'acrylic_3d',
      estimatedBudget: 150000,
      probabilityPercent: 50,
      expectedCloseDate: '2026-11-15',
      assignedTo: 'Dawit Bekele',
      notes: '',
      hasSurvey: true,
      surveyAddress: '',
      widthMeters: 4.0,
      heightMeters: 1.2,
      installationHeightMeters: 3.5,
      powerSourceAvailable: true,
      indoorOutdoor: 'outdoor',
      surveyNotes: '',
    });
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.tin) {
      alert('Please fill out customer name and valid TIN.');
      return;
    }

    const newCust = createCustomer({
      name: customerForm.name,
      tin: customerForm.tin,
      address: customerForm.address,
      phone: customerForm.phone,
      email: customerForm.email,
      customerType: customerForm.customerType,
      creditLimit: Number(customerForm.creditLimit),
      paymentTerms: customerForm.paymentTerms,
      isVatRegistered: customerForm.isVatRegistered,
    });

    setShowNewCustomerModal(false);
    showToast(`Customer account ${newCust.code} (${newCust.name}) added to directory!`);
    setCustomerForm({
      name: '',
      tin: '',
      address: 'Bole Sub-City, Addis Ababa',
      phone: '',
      email: '',
      customerType: 'business',
      creditLimit: 300000,
      paymentTerms: '30 Days Net',
      isVatRegistered: true,
    });
  };

  const handleStageChange = (leadId: string, newStage: LeadStage) => {
    updateLead(leadId, { stage: newStage });
    showToast(`Lead stage updated to "${newStage.toUpperCase()}"`);
  };

  const handleOpenSurveyModal = (lead: Lead) => {
    setSurveyModalLead(lead);
    if (lead.siteSurvey) {
      setSurveyForm({ ...lead.siteSurvey });
    } else {
      setSurveyForm({
        locationAddress: `${lead.city}, Facade Location`,
        widthMeters: 4.0,
        heightMeters: 1.5,
        installationHeightMeters: 3.0,
        powerSourceAvailable: true,
        indoorOutdoor: 'outdoor',
        notes: '',
      });
    }
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyModalLead) return;

    updateLead(surveyModalLead.id, {
      siteSurvey: {
        ...surveyForm,
        widthMeters: Number(surveyForm.widthMeters),
        heightMeters: Number(surveyForm.heightMeters),
        installationHeightMeters: Number(surveyForm.installationHeightMeters),
      },
      stage: surveyModalLead.stage === 'new' ? 'site_visit' : surveyModalLead.stage,
    });

    setSurveyModalLead(null);
    showToast(`Site survey measurements recorded for ${surveyModalLead.companyName}!`);
  };

  const handleConvertLeadConfirm = () => {
    if (!convertModalLead) return;
    const newCust = convertLeadToCustomer(convertModalLead.id);
    setConvertModalLead(null);
    showToast(`Lead won! Created Customer profile ${newCust.code} (${newCust.name})!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--emerald)',
            color: 'var(--text-main)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{notification}</span>
        </div>
      )}

      {/* Hero & Top Controls */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              border: '1px solid var(--border-glow)',
              marginBottom: '10px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--primary-light)',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} />
            <span>COMMERCIAL CRM & CLIENT ACCOUNTS</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            CRM: Leads & Customer Accounts
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '680px' }}>
            Capture advertising inquiries, book site measurement surveys across Addis Ababa, guide opportunities through the sales funnel, and manage verified customer credit lines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowNewLeadModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <PlusCircle size={16} />
            <span>New Lead / Inquiry</span>
          </button>

          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <UserCheck size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Active Opportunities</div>
              <div className="stat-value" style={{ color: 'var(--primary-light)' }}>
                {activeLeadsCount} Leads
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-light)',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            {wonLeadsCount} Won contracts this period
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Estimated Pipeline Value</div>
              <div className="stat-value" style={{ color: 'var(--emerald)' }}>
                {formatETB(totalPipelineValue)}
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald)',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            Weighted advertising & signage deals
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Site Surveys Booked</div>
              <div className="stat-value" style={{ color: 'var(--cyan)' }}>
                {surveyLeads.length} Facades
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
              }}
            >
              <Ruler size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            Dimensions & elevation logged
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Managed Customer Accounts</div>
              <div className="stat-value" style={{ color: 'var(--amber)' }}>
                {customers.length} Accounts
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--amber)',
              }}
            >
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            {customers.filter((c) => c.isVatRegistered).length} 15% VAT Registered
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '2px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              background: activeTab === 'pipeline' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'pipeline' ? 'var(--primary-light)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === 'pipeline' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            }}
          >
            <TrendingUp size={16} />
            <span>Leads Pipeline ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              background: activeTab === 'customers' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'customers' ? 'var(--primary-light)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === 'customers' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            }}
          >
            <Building2 size={16} />
            <span>Customer Directory ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('surveys')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              background: activeTab === 'surveys' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'surveys' ? 'var(--primary-light)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === 'surveys' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            }}
          >
            <Ruler size={16} />
            <span>Site Surveys & Dimensions ({surveyLeads.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
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
            placeholder={
              activeTab === 'customers'
                ? 'Search customer name, TIN, code...'
                : 'Search leads, contacts, cities...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* TAB 1: LEADS PIPELINE */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters Bar & View Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Filter:</span>
              <select
                className="form-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as 'all' | LeadStage)}
                style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
              >
                <option value="all">All Pipeline Stages</option>
                {stageColumns.map((col) => (
                  <option key={col.stage} value={col.stage}>
                    {col.label}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={projectTypeFilter}
                onChange={(e) => setProjectTypeFilter(e.target.value as 'all' | SignageType)}
                style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
              >
                <option value="all">All Project Types</option>
                {Object.entries(projectTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: viewMode === 'kanban' ? 'var(--primary)' : 'var(--bg-card)',
                  color: viewMode === 'kanban' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Kanban Funnel
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: viewMode === 'table' ? 'var(--primary)' : 'var(--bg-card)',
                  color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Detailed List
              </button>
            </div>
          </div>

          {/* Kanban Board View */}
          {viewMode === 'kanban' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                alignItems: 'start',
              }}
            >
              {stageColumns.map((col) => {
                const stageLeads = filteredLeads.filter((l) => l.stage === col.stage);
                const colValue = stageLeads.reduce((sum, l) => sum + l.estimatedBudget, 0);

                return (
                  <div
                    key={col.stage}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '400px',
                    }}
                  >
                    {/* Column Header */}
                    <div
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: `3px solid ${col.color}`,
                        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {col.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {formatETB(colValue)}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: 'rgba(255,255,255,0.08)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          color: col.color,
                        }}
                      >
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Lead Cards List */}
                    <div
                      style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        flex: 1,
                      }}
                    >
                      {stageLeads.length === 0 ? (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '36px 12px',
                            color: 'var(--text-dim)',
                            fontSize: '12px',
                            border: '1px dashed var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          No deals in this stage
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            style={{
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              transition: 'border-color 0.15s ease',
                            }}
                          >
                            {/* Card Top */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
                                {lead.leadNumber}
                              </span>
                              <span
                                className="badge badge-indigo"
                                style={{ fontSize: '10px', padding: '1px 6px' }}
                              >
                                {projectTypeLabels[lead.projectType]}
                              </span>
                            </div>

                            {/* Company Name */}
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                                {lead.companyName}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <MapPin size={12} color="var(--text-dim)" />
                                <span>{lead.city}</span>
                              </div>
                            </div>

                            {/* Contact Person & Phone */}
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={11} />
                              <span>{lead.contactPerson} ({lead.phone})</span>
                            </div>

                            {/* Site Survey Badge */}
                            {lead.siteSurvey ? (
                              <button
                                onClick={() => handleOpenSurveyModal(lead)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '5px 8px',
                                  background: 'rgba(6, 182, 212, 0.1)',
                                  border: '1px solid rgba(6, 182, 212, 0.25)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--cyan)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Ruler size={12} />
                                  <span>
                                    {lead.siteSurvey.widthMeters}m × {lead.siteSurvey.heightMeters}m
                                    ({(lead.siteSurvey.widthMeters * lead.siteSurvey.heightMeters).toFixed(1)}m²)
                                  </span>
                                </div>
                                <span style={{ fontSize: '10px', textDecoration: 'underline' }}>View</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenSurveyModal(lead)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px dashed var(--border-subtle)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--text-dim)',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                }}
                              >
                                <PlusCircle size={11} />
                                <span>+ Record Dimensions</span>
                              </button>
                            )}

                            {/* Budget & Probability */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '8px',
                                borderTop: '1px solid var(--border-subtle)',
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--emerald)' }}>
                                {formatETB(lead.estimatedBudget)}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {lead.probabilityPercent}% Win rate
                              </div>
                            </div>

                            {/* Stage Progression Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              {lead.stage === 'new' && (
                                <button
                                  onClick={() => handleStageChange(lead.id, 'site_visit')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
                                >
                                  Book Site Survey →
                                </button>
                              )}
                              {lead.stage === 'site_visit' && (
                                <button
                                  onClick={() => handleStageChange(lead.id, 'quoted')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
                                >
                                  Issue Quote →
                                </button>
                              )}
                              {lead.stage === 'quoted' && (
                                <button
                                  onClick={() => handleStageChange(lead.id, 'negotiation')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
                                >
                                  In Negotiation →
                                </button>
                              )}
                              {lead.stage === 'negotiation' && (
                                <button
                                  onClick={() => setConvertModalLead(lead)}
                                  className="btn btn-primary btn-sm"
                                  style={{ flex: 1, padding: '4px 6px', fontSize: '11px', background: 'var(--emerald)' }}
                                >
                                  Mark Won & Convert ✓
                                </button>
                              )}
                              {lead.stage === 'won' && (
                                <div
                                  style={{
                                    width: '100%',
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--emerald)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Converted to Customer</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Deal #</th>
                      <th>Company & Location</th>
                      <th>Project Type</th>
                      <th>Contact Person</th>
                      <th>Stage</th>
                      <th>Dimensions</th>
                      <th style={{ textAlign: 'right' }}>Est. Budget (ETB)</th>
                      <th>Assigned To</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td style={{ fontWeight: 700, fontSize: '12px' }}>{lead.leadNumber}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{lead.companyName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{lead.city}</div>
                        </td>
                        <td>
                          <span className="badge badge-indigo" style={{ fontSize: '11px' }}>
                            {projectTypeLabels[lead.projectType]}
                          </span>
                        </td>
                        <td>
                          <div>{lead.contactPerson}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{lead.phone}</div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              color: stageColumns.find((c) => c.stage === lead.stage)?.color || '#fff',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {lead.stage.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {lead.siteSurvey ? (
                            <span style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 600 }}>
                              {lead.siteSurvey.widthMeters}m × {lead.siteSurvey.heightMeters}m
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Pending</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--emerald)' }}>
                          {formatETB(lead.estimatedBudget)}
                        </td>
                        <td style={{ fontSize: '12px' }}>{lead.assignedTo}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenSurveyModal(lead)}
                              className="btn btn-secondary btn-sm"
                              title="View or edit measurements"
                            >
                              <Ruler size={13} />
                            </button>
                            {lead.stage !== 'won' && lead.stage !== 'lost' && (
                              <button
                                onClick={() => setConvertModalLead(lead)}
                                className="btn btn-primary btn-sm"
                                style={{ background: 'var(--emerald)' }}
                                title="Convert to Customer"
                              >
                                Convert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMER DIRECTORY */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Verified Client Directory & Credit Ledgers
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Ethiopian TIN matching, 15% VAT status, and automated credit balance protection.
              </p>
            </div>

            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>New Customer Account</span>
            </button>
          </div>

          {/* Customer Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Customer Legal Name</th>
                    <th>TIN & VAT Status</th>
                    <th>Contact & City</th>
                    <th>Payment Terms</th>
                    <th style={{ textAlign: 'right' }}>Credit Limit</th>
                    <th style={{ textAlign: 'right' }}>Outstanding</th>
                    <th style={{ textAlign: 'right' }}>Available Credit</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((cust) => {
                    const availableCredit = cust.creditLimit - cust.outstandingBalance;
                    const isOverLimit = availableCredit <= 0;
                    const isWarning = availableCredit < cust.creditLimit * 0.25;

                    return (
                      <tr key={cust.id}>
                        <td style={{ fontWeight: 700, fontSize: '12px', color: 'var(--primary-light)' }}>
                          {cust.code}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                            {cust.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                            {cust.customerType} Account
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                            TIN: {cust.tin}
                          </div>
                          {cust.isVatRegistered ? (
                            <span className="badge badge-emerald" style={{ fontSize: '10px', marginTop: '2px' }}>
                              15% VAT Registered
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: '10px', marginTop: '2px' }}>
                              VAT Exempt Entity
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>{cust.phone}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{cust.address}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>{cust.paymentTerms}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatETB(cust.creditLimit)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: cust.outstandingBalance > 0 ? 'var(--rose)' : 'var(--text-dim)',
                          }}
                        >
                          {formatETB(cust.outstandingBalance)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 800,
                            color: isOverLimit ? 'var(--rose)' : isWarning ? 'var(--amber)' : 'var(--emerald)',
                          }}
                        >
                          {formatETB(availableCredit)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedCustomerProfile(cust)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} />
                            <span>Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SITE SURVEYS & MEASUREMENTS */}
      {activeTab === 'surveys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              Site Survey & Signboard Dimensions Center
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Accurate facade measurements ($W \times H$), installation elevation, and power availability needed for workshop cutting and BOM bills.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {surveyLeads.map((lead) => {
              const survey = lead.siteSurvey!;
              const areaSqm = (survey.widthMeters * survey.heightMeters).toFixed(2);

              return (
                <div
                  key={lead.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                        {projectTypeLabels[lead.projectType]}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{lead.leadNumber}</span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
                      {lead.companyName}
                    </h4>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={13} color="var(--cyan)" />
                      <span>{survey.locationAddress}</span>
                    </div>

                    {/* Dimensions Pill Box */}
                    <div
                      style={{
                        background: 'rgba(6, 182, 212, 0.08)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        marginTop: '14px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Width × Height
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                          {survey.widthMeters}m × {survey.heightMeters}m
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Total Surface Area
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--cyan)' }}>
                          {areaSqm} m²
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Installation Elevation
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {survey.installationHeightMeters}m from ground
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          220V Power Supply
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: survey.powerSourceAvailable ? 'var(--emerald)' : 'var(--amber)' }}>
                          {survey.powerSourceAvailable ? 'Available' : 'Needs Wiring'}
                        </div>
                      </div>
                    </div>

                    {survey.notes && (
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '10px' }}>
                        &ldquo;{survey.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <button
                      onClick={() => handleOpenSurveyModal(lead)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Edit3 size={12} />
                      <span>Edit Measurements</span>
                    </button>
                    {lead.stage === 'new' && (
                      <button
                        onClick={() => handleStageChange(lead.id, 'quoted')}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <span>Issue Quote →</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: NEW LEAD MODAL */}
      {showNewLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                  New Advertising Lead / Inquiry
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Record new incoming client project specifications and schedule site survey.
                </p>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Client / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dashen Bank, BGI Ethiopia..."
                    className="form-input"
                    value={leadForm.companyName}
                    onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Yared Girma (Procurement Lead)"
                    className="form-input"
                    value={leadForm.contactPerson}
                    onChange={(e) => setLeadForm({ ...leadForm, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+251 911 ..."
                    className="form-input"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="procurement@company.com"
                    className="form-input"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Project Type *</label>
                  <select
                    className="form-select"
                    value={leadForm.projectType}
                    onChange={(e) => setLeadForm({ ...leadForm, projectType: e.target.value as SignageType })}
                  >
                    {Object.entries(projectTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Budget (ETB) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="5000"
                    className="form-input"
                    value={leadForm.estimatedBudget}
                    onChange={(e) => setLeadForm({ ...leadForm, estimatedBudget: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Lead Source</label>
                  <select
                    className="form-select"
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value as LeadSource })}
                  >
                    <option value="walk_in">Walk-in Inquiry</option>
                    <option value="phone_inquiry">Phone Inquiry</option>
                    <option value="referral">Client Referral</option>
                    <option value="tender">Corporate Tender</option>
                    <option value="field_sales">Field Sales</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">City / Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={leadForm.city}
                    onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                  />
                </div>
              </div>

              {/* Site Survey Checkbox & Fields */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--cyan)' }}>
                  <input
                    type="checkbox"
                    checked={leadForm.hasSurvey}
                    onChange={(e) => setLeadForm({ ...leadForm, hasSurvey: e.target.checked })}
                  />
                  <span>Attach Initial Site Survey & Dimensions</span>
                </label>

                {leadForm.hasSurvey && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Installation Site Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Bole Medhanialem Mall, Building Exterior Facade"
                        className="form-input"
                        value={leadForm.surveyAddress}
                        onChange={(e) => setLeadForm({ ...leadForm, surveyAddress: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Width (Meters)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.2"
                          className="form-input"
                          value={leadForm.widthMeters}
                          onChange={(e) => setLeadForm({ ...leadForm, widthMeters: Number(e.target.value) })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Height (Meters)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.2"
                          className="form-input"
                          value={leadForm.heightMeters}
                          onChange={(e) => setLeadForm({ ...leadForm, heightMeters: Number(e.target.value) })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Install Height (m)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          className="form-input"
                          value={leadForm.installationHeightMeters}
                          onChange={(e) => setLeadForm({ ...leadForm, installationHeightMeters: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Project Notes & Specifications</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Material preferences (e.g. 3mm cast acrylic, high-lumen waterproof LEDs, aluminum composite backing)..."
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Add Customer Account
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Onboard client with verified TIN, VAT status, and credit limit.
                </p>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Bank of Ethiopia S.C."
                  className="form-input"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Ethiopian TIN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit TIN: 0001092834"
                    className="form-input"
                    value={customerForm.tin}
                    onChange={(e) => setCustomerForm({ ...customerForm, tin: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select
                    className="form-select"
                    value={customerForm.customerType}
                    onChange={(e) => setCustomerForm({ ...customerForm, customerType: e.target.value as any })}
                  >
                    <option value="business">Private Business / Corporate</option>
                    <option value="government">Government Ministry / Agency</option>
                    <option value="individual">Individual Sole Proprietor</option>
                    <option value="export">Export Client</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+251 115 ..."
                    className="form-input"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    placeholder="finance@client.com"
                    className="form-input"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Address</label>
                <input
                  type="text"
                  placeholder="Street / Building / Sub-City, Addis Ababa"
                  className="form-input"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Credit Limit (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    className="form-input"
                    value={customerForm.creditLimit}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Terms</label>
                  <select
                    className="form-select"
                    value={customerForm.paymentTerms}
                    onChange={(e) => setCustomerForm({ ...customerForm, paymentTerms: e.target.value })}
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="15 Days Net">15 Days Net</option>
                    <option value="30 Days Net">30 Days Net</option>
                    <option value="45 Days Net">45 Days Net</option>
                    <option value="Government Purchase Order">Government Purchase Order</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="vatReg"
                  checked={customerForm.isVatRegistered}
                  onChange={(e) => setCustomerForm({ ...customerForm, isVatRegistered: e.target.checked })}
                />
                <label htmlFor="vatReg" style={{ fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Is 15% VAT Registered Entity (Requires standard VAT Invoices)
                </label>
              </div>

              <div className="modal-footer" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SITE SURVEY MODAL */}
      {surveyModalLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Site Measurement Survey
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Record accurate field measurements for {surveyModalLead.companyName}
                </p>
              </div>
              <button
                onClick={() => setSurveyModalLead(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Installation Location Address *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={surveyForm.locationAddress}
                  onChange={(e) => setSurveyForm({ ...surveyForm, locationAddress: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Width (Meters) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    required
                    className="form-input"
                    value={surveyForm.widthMeters}
                    onChange={(e) => setSurveyForm({ ...surveyForm, widthMeters: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Height (Meters) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    required
                    className="form-input"
                    value={surveyForm.heightMeters}
                    onChange={(e) => setSurveyForm({ ...surveyForm, heightMeters: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Installation Height from Ground (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-input"
                    value={surveyForm.installationHeightMeters}
                    onChange={(e) => setSurveyForm({ ...surveyForm, installationHeightMeters: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Environment</label>
                  <select
                    className="form-select"
                    value={surveyForm.indoorOutdoor}
                    onChange={(e) => setSurveyForm({ ...surveyForm, indoorOutdoor: e.target.value as 'indoor' | 'outdoor' })}
                  >
                    <option value="outdoor">Outdoor (Weatherproof needed)</option>
                    <option value="indoor">Indoor (Retail / Office)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="powerAvail"
                  checked={surveyForm.powerSourceAvailable}
                  onChange={(e) => setSurveyForm({ ...surveyForm, powerSourceAvailable: e.target.checked })}
                />
                <label htmlFor="powerAvail" style={{ fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}>
                  220V AC Power Line Available on Site (For LED power supply)
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Technician Notes & Scaffold Requirements</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Need 6m mobile scaffolding, masonry anchor bolts, and waterproof silicone sealant..."
                  value={surveyForm.notes || ''}
                  onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSurveyModalLead(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Dimensions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONVERT LEAD TO CUSTOMER */}
      {convertModalLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={22} color="var(--emerald)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Convert Lead to Verified Customer
                </h3>
              </div>
              <button
                onClick={() => setConvertModalLead(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Congratulations! Converting this deal will automatically create a verified profile in your Customer Directory, assign credit limit, and enable direct order issuing.
              </p>

              <div
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {convertModalLead.companyName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Contact: {convertModalLead.contactPerson} ({convertModalLead.phone})
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald)', marginTop: '8px' }}>
                  Deal Value: {formatETB(convertModalLead.estimatedBudget)}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setConvertModalLead(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertLeadConfirm}
                className="btn btn-primary"
                style={{ background: 'var(--emerald)' }}
              >
                Confirm Onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CUSTOMER PROFILE DRAWER */}
      {selectedCustomerProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="var(--primary-light)" />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedCustomerProfile.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Code: {selectedCustomerProfile.code} • TIN: {selectedCustomerProfile.tin}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerProfile(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0' }}>
              {/* Credit Status Card */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Credit Limit
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                    {formatETB(selectedCustomerProfile.creditLimit)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Current Due
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: selectedCustomerProfile.outstandingBalance > 0 ? 'var(--rose)' : 'var(--text-dim)',
                      marginTop: '4px',
                    }}
                  >
                    {formatETB(selectedCustomerProfile.outstandingBalance)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Available Line
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>
                    {formatETB(selectedCustomerProfile.creditLimit - selectedCustomerProfile.outstandingBalance)}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Phone Number:</span>
                  <span style={{ fontWeight: 600 }}>{selectedCustomerProfile.phone}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Email:</span>
                  <span style={{ fontWeight: 600 }}>{selectedCustomerProfile.email}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Office Address:</span>
                  <span style={{ fontWeight: 600 }}>{selectedCustomerProfile.address}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Tax Status:</span>
                  <span style={{ fontWeight: 700, color: selectedCustomerProfile.isVatRegistered ? 'var(--emerald)' : 'var(--amber)' }}>
                    {selectedCustomerProfile.isVatRegistered ? 'Standard 15% VAT Invoiced' : 'Statutory VAT Exempt Entity'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Agreed Payment Terms:</span>
                  <span style={{ fontWeight: 600 }}>{selectedCustomerProfile.paymentTerms}</span>
                </div>
              </div>

              {/* Linked Orders */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Active Orders with this Client
                </h4>
                {orders.filter((o) => o.customerId === selectedCustomerProfile.id).length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No ongoing production work orders for this customer.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {orders
                      .filter((o) => o.customerId === selectedCustomerProfile.id)
                      .map((o) => (
                        <div
                          key={o.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--bg-app)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.orderNumber}: </span>
                            <span>{o.title}</span>
                          </div>
                          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                            {o.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <Link href="/orders" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShoppingBag size={13} />
                <span>Create Order</span>
              </Link>
              <Link href="/sales" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Issue Invoice →</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
