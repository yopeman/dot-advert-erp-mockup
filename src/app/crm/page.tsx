'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Trash2,
  Plus,
  Box,
  Maximize2,
} from 'lucide-react';

interface DraftSurvey {
  id: string;
  title: string;
  signageType: SignageType;
  locationAddress: string;
  widthMeters: number;
  heightMeters: number;
  depthMeters: number;
  installationHeightMeters: number;
  powerSourceAvailable: boolean;
  indoorOutdoor: 'indoor' | 'outdoor';
  notes: string;
}

const getLeadSurveys = (lead: Lead): SiteSurvey[] => {
  if (lead.siteSurveys && lead.siteSurveys.length > 0) return lead.siteSurveys;
  if (lead.siteSurvey) {
    return [
      {
        ...lead.siteSurvey,
        id: lead.siteSurvey.id || `srv-${lead.id}-1`,
        title: lead.siteSurvey.title || `${lead.companyName} Primary Signboard`,
        leadId: lead.id,
      },
    ];
  }
  return [];
};

const getCustomerSurveys = (customer: Customer): SiteSurvey[] => {
  return customer.siteSurveys || [];
};

const calculateSurveysArea = (surveys: SiteSurvey[]): number => {
  return surveys.reduce(
    (sum, s) => sum + (Number(s.widthMeters) || 0) * (Number(s.heightMeters) || 0),
    0
  );
};

const createInitialDraftSurvey = (idx: number, city: string = 'Addis Ababa'): DraftSurvey => ({
  id: `draft-${Date.now()}-${idx}`,
  title: idx === 1 ? 'Main Entrance Facade Sign' : `Signboard #${idx} Location`,
  signageType: 'acrylic_3d',
  locationAddress: `${city}, Site Elevation`,
  widthMeters: 4.0,
  heightMeters: 1.2,
  depthMeters: 0.15,
  installationHeightMeters: 3.5,
  powerSourceAvailable: true,
  indoorOutdoor: 'outdoor',
  notes: '',
});

function CrmContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const {
    leads,
    customers,
    orders,
    createLead,
    updateLead,
    createCustomer,
    updateCustomer,
    convertLeadToCustomer,
    addSiteSurveyToLead,
    updateLeadSiteSurvey,
    deleteLeadSiteSurvey,
    addSiteSurveyToCustomer,
    updateCustomerSiteSurvey,
    deleteCustomerSiteSurvey,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'customers' | 'surveys'>('pipeline');

  useEffect(() => {
    if (tabParam === 'pipeline' || tabParam === 'customers' || tabParam === 'surveys') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | LeadStage>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | SignageType>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Tab 3 Filter States
  const [surveySourceFilter, setSurveySourceFilter] = useState<'all' | 'lead' | 'customer'>('all');
  const [surveyEnvironmentFilter, setSurveyEnvironmentFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');

  // Modals
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [surveyModalLead, setSurveyModalLead] = useState<Lead | null>(null);
  const [surveyModalCustomer, setSurveyModalCustomer] = useState<Customer | null>(null);
  const [editingSurveyId, setEditingSurveyId] = useState<string | 'new' | null>(null);
  const [showQuickAddSurveyModal, setShowQuickAddSurveyModal] = useState(false);
  const [quickAddTargetType, setQuickAddTargetType] = useState<'lead' | 'customer'>('lead');
  const [quickAddTargetId, setQuickAddTargetId] = useState<string>('');
  const [convertModalLead, setConvertModalLead] = useState<Lead | null>(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<Customer | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form States: New Lead (Multiple Surveys Supported)
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
    surveys: [createInitialDraftSurvey(1, 'Addis Ababa')],
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

  // Form States: Site Survey Edit/Add
  const [surveyForm, setSurveyForm] = useState<SiteSurvey>({
    id: '',
    title: '',
    signageType: 'acrylic_3d',
    locationAddress: '',
    widthMeters: 4.0,
    heightMeters: 1.5,
    depthMeters: 0.15,
    installationHeightMeters: 3.5,
    powerSourceAvailable: true,
    indoorOutdoor: 'outdoor',
    notes: '',
    surveyDate: '2026-10-20',
    surveyorName: 'Dawit Bekele',
    status: 'completed',
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

  // All display surveys across Leads and Customers
  interface DisplaySurveyItem {
    survey: SiteSurvey;
    sourceType: 'lead' | 'customer';
    parentName: string;
    parentCode: string;
    lead?: Lead;
    customer?: Customer;
  }

  const allDisplaySurveys = useMemo((): DisplaySurveyItem[] => {
    const list: DisplaySurveyItem[] = [];
    leads.forEach((l) => {
      const surveys = getLeadSurveys(l);
      surveys.forEach((s) => {
        list.push({
          survey: s,
          sourceType: 'lead',
          parentName: l.companyName,
          parentCode: l.leadNumber,
          lead: l,
        });
      });
    });
    customers.forEach((c) => {
      const surveys = getCustomerSurveys(c);
      surveys.forEach((s) => {
        list.push({
          survey: s,
          sourceType: 'customer',
          parentName: c.name,
          parentCode: c.code,
          customer: c,
        });
      });
    });
    return list;
  }, [leads, customers]);

  const filteredDisplaySurveys = useMemo(() => {
    return allDisplaySurveys.filter((item) => {
      if (surveySourceFilter !== 'all' && item.sourceType !== surveySourceFilter) return false;
      if (surveyEnvironmentFilter !== 'all' && item.survey.indoorOutdoor !== surveyEnvironmentFilter) return false;
      if (projectTypeFilter !== 'all' && item.survey.signageType !== projectTypeFilter) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.survey.title.toLowerCase().includes(q) ||
        item.parentName.toLowerCase().includes(q) ||
        item.parentCode.toLowerCase().includes(q) ||
        item.survey.locationAddress.toLowerCase().includes(q) ||
        (item.survey.notes && item.survey.notes.toLowerCase().includes(q))
      );
    });
  }, [allDisplaySurveys, surveySourceFilter, surveyEnvironmentFilter, projectTypeFilter, searchQuery]);

  // Total surveys count across system
  const totalSystemSurveysCount = allDisplaySurveys.length;
  const totalSystemSurveyArea = allDisplaySurveys.reduce(
    (acc, it) => acc + (Number(it.survey.widthMeters) || 0) * (Number(it.survey.heightMeters) || 0),
    0
  );

  // KPI calculations
  const totalPipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.stage !== 'lost' && l.stage !== 'won')
      .reduce((sum, l) => sum + l.estimatedBudget, 0);
  }, [leads]);

  const activeLeadsCount = leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won').length;
  const wonLeadsCount = leads.filter((l) => l.stage === 'won').length;

  // Handlers: Create Lead with multiple signboards
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.companyName || !leadForm.phone) {
      alert('Please provide company name and phone number.');
      return;
    }

    const createdSurveys: SiteSurvey[] = leadForm.hasSurvey
      ? leadForm.surveys.map((s, idx) => ({
          id: `srv-${Date.now()}-${idx + 1}`,
          title: s.title.trim() || `Signboard #${idx + 1}`,
          signageType: s.signageType || leadForm.projectType,
          locationAddress: s.locationAddress.trim() || `${leadForm.city}, Site Elevation`,
          widthMeters: Number(s.widthMeters) || 0,
          heightMeters: Number(s.heightMeters) || 0,
          depthMeters: Number(s.depthMeters) || 0.15,
          installationHeightMeters: Number(s.installationHeightMeters) || 0,
          powerSourceAvailable: Boolean(s.powerSourceAvailable),
          indoorOutdoor: s.indoorOutdoor || 'outdoor',
          notes: s.notes,
          surveyDate: new Date().toISOString().split('T')[0],
          surveyorName: leadForm.assignedTo,
          status: 'completed',
        }))
      : [];

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
      siteSurveys: createdSurveys,
      siteSurvey: createdSurveys[0] || undefined,
    });

    setShowNewLeadModal(false);
    showToast(
      `Lead ${newLead.leadNumber} (${newLead.companyName}) created with ${createdSurveys.length} signboard surveys!`
    );
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
      surveys: [createInitialDraftSurvey(1, 'Addis Ababa')],
    });
  };

  const handleAddDraftSurveyToLeadForm = () => {
    setLeadForm((prev) => ({
      ...prev,
      surveys: [...prev.surveys, createInitialDraftSurvey(prev.surveys.length + 1, prev.city)],
    }));
  };

  const handleRemoveDraftSurvey = (idx: number) => {
    setLeadForm((prev) => ({
      ...prev,
      surveys: prev.surveys.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateDraftSurvey = (idx: number, updates: Partial<DraftSurvey>) => {
    setLeadForm((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s, i) => (i === idx ? { ...s, ...updates } : s)),
    }));
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

  // Open survey manager for a Lead
  const handleOpenLeadSurveyManager = (lead: Lead) => {
    setSurveyModalLead(lead);
    setSurveyModalCustomer(null);
    setEditingSurveyId(null);
  };

  // Open survey manager for a Customer
  const handleOpenCustomerSurveyManager = (customer: Customer) => {
    setSurveyModalCustomer(customer);
    setSurveyModalLead(null);
    setEditingSurveyId(null);
  };

  const handleStartEditSurvey = (survey: SiteSurvey) => {
    setSurveyForm({ ...survey });
    setEditingSurveyId(survey.id);
  };

  const handleStartNewSurvey = (defaultAddress?: string, defaultTitle?: string) => {
    setSurveyForm({
      id: '',
      title: defaultTitle || 'New Signboard Location',
      signageType: 'acrylic_3d',
      locationAddress: defaultAddress || 'Addis Ababa, Site Elevation',
      widthMeters: 4.0,
      heightMeters: 1.5,
      depthMeters: 0.15,
      installationHeightMeters: 3.5,
      powerSourceAvailable: true,
      indoorOutdoor: 'outdoor',
      notes: '',
      surveyDate: new Date().toISOString().split('T')[0],
      surveyorName: 'Dawit Bekele',
      status: 'completed',
    });
    setEditingSurveyId('new');
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyForm.title.trim()) {
      alert('Please enter a signboard title.');
      return;
    }

    if (surveyModalLead) {
      if (editingSurveyId && editingSurveyId !== 'new') {
        updateLeadSiteSurvey(surveyModalLead.id, editingSurveyId, {
          ...surveyForm,
          widthMeters: Number(surveyForm.widthMeters),
          heightMeters: Number(surveyForm.heightMeters),
          depthMeters: Number(surveyForm.depthMeters) || 0,
          installationHeightMeters: Number(surveyForm.installationHeightMeters) || 0,
        });
        showToast(`Updated "${surveyForm.title}" for ${surveyModalLead.companyName}!`);
      } else {
        addSiteSurveyToLead(surveyModalLead.id, {
          ...surveyForm,
          widthMeters: Number(surveyForm.widthMeters),
          heightMeters: Number(surveyForm.heightMeters),
          depthMeters: Number(surveyForm.depthMeters) || 0,
          installationHeightMeters: Number(surveyForm.installationHeightMeters) || 0,
        });
        if (surveyModalLead.stage === 'new') {
          updateLead(surveyModalLead.id, { stage: 'site_visit' });
        }
        showToast(`Added signboard "${surveyForm.title}" to ${surveyModalLead.companyName}!`);
      }
      setEditingSurveyId(null);
    } else if (surveyModalCustomer) {
      if (editingSurveyId && editingSurveyId !== 'new') {
        updateCustomerSiteSurvey(surveyModalCustomer.id, editingSurveyId, {
          ...surveyForm,
          widthMeters: Number(surveyForm.widthMeters),
          heightMeters: Number(surveyForm.heightMeters),
          depthMeters: Number(surveyForm.depthMeters) || 0,
          installationHeightMeters: Number(surveyForm.installationHeightMeters) || 0,
        });
        showToast(`Updated "${surveyForm.title}" for ${surveyModalCustomer.name}!`);
      } else {
        addSiteSurveyToCustomer(surveyModalCustomer.id, {
          ...surveyForm,
          widthMeters: Number(surveyForm.widthMeters),
          heightMeters: Number(surveyForm.heightMeters),
          depthMeters: Number(surveyForm.depthMeters) || 0,
          installationHeightMeters: Number(surveyForm.installationHeightMeters) || 0,
        });
        showToast(`Added signboard "${surveyForm.title}" to ${surveyModalCustomer.name}!`);
      }
      setEditingSurveyId(null);
    }
  };

  const handleDeleteSurvey = (targetType: 'lead' | 'customer', targetId: string, surveyId: string) => {
    if (!confirm('Are you sure you want to remove this signboard survey?')) return;
    if (targetType === 'lead') {
      deleteLeadSiteSurvey(targetId, surveyId);
      showToast('Signboard survey removed.');
    } else {
      deleteCustomerSiteSurvey(targetId, surveyId);
      showToast('Signboard survey removed.');
    }
  };

  // Quick Add Survey from Tab 3 directly
  const handleQuickAddSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTargetId) {
      alert('Please select a Lead or Customer.');
      return;
    }
    if (!surveyForm.title.trim()) {
      alert('Please specify a title for this signboard.');
      return;
    }

    if (quickAddTargetType === 'lead') {
      const target = leads.find((l) => l.id === quickAddTargetId);
      addSiteSurveyToLead(quickAddTargetId, {
        ...surveyForm,
        widthMeters: Number(surveyForm.widthMeters),
        heightMeters: Number(surveyForm.heightMeters),
        depthMeters: Number(surveyForm.depthMeters) || 0,
        installationHeightMeters: Number(surveyForm.installationHeightMeters) || 0,
      });
      if (target?.stage === 'new') {
        updateLead(quickAddTargetId, { stage: 'site_visit' });
      }
      showToast(`Added "${surveyForm.title}" to ${target?.companyName || 'Lead'}!`);
    } else {
      const target = customers.find((c) => c.id === quickAddTargetId);
      addSiteSurveyToCustomer(quickAddTargetId, {
        ...surveyForm,
        widthMeters: Number(surveyForm.widthMeters),
        heightMeters: Number(surveyForm.heightMeters),
        depthMeters: Number(surveyForm.depthMeters) || 0,
        installationHeightMeters: Number(surveyForm.installationHeightMeters) || 0,
      });
      showToast(`Added "${surveyForm.title}" to ${target?.name || 'Customer'}!`);
    }

    setShowQuickAddSurveyModal(false);
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
                {totalSystemSurveysCount} Signboards
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
            {totalSystemSurveyArea.toFixed(1)} m² measured area
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
            <span>Site Surveys & Dimensions ({totalSystemSurveysCount})</span>
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

                            {/* Site Survey Badge (Multiple Surveys Supported) */}
                            {(() => {
                              const surveys = getLeadSurveys(lead);
                              const totalArea = calculateSurveysArea(surveys);
                              return surveys.length > 0 ? (
                                <button
                                  onClick={() => handleOpenLeadSurveyManager(lead)}
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
                                  title={surveys.map((s) => `${s.title}: ${s.widthMeters}m × ${s.heightMeters}m`).join(' | ')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Ruler size={12} />
                                    <span>
                                      {surveys.length} {surveys.length === 1 ? 'Signboard' : 'Signboards'} ({totalArea.toFixed(1)}m²)
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '10px', textDecoration: 'underline' }}>Manage</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenLeadSurveyManager(lead)}
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
                              );
                            })()}

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
                          {(() => {
                            const surveys = getLeadSurveys(lead);
                            const totalArea = calculateSurveysArea(surveys);
                            return surveys.length > 0 ? (
                              <button
                                onClick={() => handleOpenLeadSurveyManager(lead)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <div style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 700 }}>
                                  {surveys.length} {surveys.length === 1 ? 'Sign' : 'Signs'} ({totalArea.toFixed(1)} m²)
                                </div>
                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: 'var(--text-dim)',
                                    maxWidth: '160px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={surveys.map((s) => s.title).join(', ')}
                                >
                                  {surveys.map((s) => s.title).join(', ')}
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenLeadSurveyManager(lead)}
                                className="badge badge-amber"
                                style={{ fontSize: '10px', cursor: 'pointer', border: 'none' }}
                              >
                                + Add Survey
                              </button>
                            );
                          })()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--emerald)' }}>
                          {formatETB(lead.estimatedBudget)}
                        </td>
                        <td style={{ fontSize: '12px' }}>{lead.assignedTo}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenLeadSurveyManager(lead)}
                              className="btn btn-secondary btn-sm"
                              title="Manage site surveys & dimensions"
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

      {/* TAB 3: SITE SURVEYS & MEASUREMENTS CENTER (MULTIPLE PER LEAD/CUSTOMER) */}
      {activeTab === 'surveys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Header & Quick Action */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                Site Survey & Signboard Dimensions Center
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Manage multiple facade surveys, 3D channel letter depths, ground elevation, and power availability per deal/client.
              </p>
            </div>

            <button
              onClick={() => {
                setQuickAddTargetType('lead');
                setQuickAddTargetId(leads[0]?.id || '');
                handleStartNewSurvey();
                setShowQuickAddSurveyModal(true);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>+ New Site Survey</span>
            </button>
          </div>

          {/* Sub-KPI Bar for Surveys */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Total Signboards Surveyed
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px' }}>
                {totalSystemSurveysCount} Items
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Across {leads.filter((l) => getLeadSurveys(l).length > 0).length} Deals & {customers.filter((c) => getCustomerSurveys(c).length > 0).length} Accounts
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Combined Fabricated Area
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>
                {totalSystemSurveyArea.toFixed(1)} m²
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Directly drives vinyl & acrylic BOM cutting
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Outdoor Weatherproof Signages
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amber)', marginTop: '4px' }}>
                {allDisplaySurveys.filter((s) => s.survey.indoorOutdoor === 'outdoor').length} Signs
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                IP67 transformers & high-durability flex/acrylic
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Indoor / Retail POS Signages
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                {allDisplaySurveys.filter((s) => s.survey.indoorOutdoor === 'indoor').length} Signs
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                VIP lounges, trade booths & reception logos
              </div>
            </div>
          </div>

          {/* Filter Toolbar for Surveys */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              background: 'var(--bg-card)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Filter size={13} />
              <span>Filter Signboards:</span>
            </div>

            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
              value={surveySourceFilter}
              onChange={(e) => setSurveySourceFilter(e.target.value as 'all' | 'lead' | 'customer')}
            >
              <option value="all">All Accounts ({allDisplaySurveys.length})</option>
              <option value="lead">Pipeline Leads Only ({allDisplaySurveys.filter((i) => i.sourceType === 'lead').length})</option>
              <option value="customer">Customer Directory Only ({allDisplaySurveys.filter((i) => i.sourceType === 'customer').length})</option>
            </select>

            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
              value={surveyEnvironmentFilter}
              onChange={(e) => setSurveyEnvironmentFilter(e.target.value as 'all' | 'indoor' | 'outdoor')}
            >
              <option value="all">All Environments</option>
              <option value="outdoor">Outdoor Only</option>
              <option value="indoor">Indoor Only</option>
            </select>

            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
              value={projectTypeFilter}
              onChange={(e) => setProjectTypeFilter(e.target.value as 'all' | SignageType)}
            >
              <option value="all">All Signage Types</option>
              {Object.entries(projectTypeLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>

            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
              Showing {filteredDisplaySurveys.length} of {allDisplaySurveys.length} Signboards
            </span>
          </div>

          {/* Signboard Measurement Cards Grid */}
          {filteredDisplaySurveys.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '48px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <Ruler size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div style={{ fontSize: '15px', fontWeight: 600 }}>No site surveys match the current filters.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Click &quot;+ New Site Survey&quot; above to log signboard dimensions.</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredDisplaySurveys.map((item) => {
                const survey = item.survey;
                const areaSqm = ((Number(survey.widthMeters) || 0) * (Number(survey.heightMeters) || 0)).toFixed(2);
                const signageTypeKey = (survey.signageType || (item.lead?.projectType || 'acrylic_3d')) as SignageType;

                return (
                  <div
                    key={survey.id}
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
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            className={`badge ${item.sourceType === 'lead' ? 'badge-indigo' : 'badge-emerald'}`}
                            style={{ fontSize: '10px', textTransform: 'uppercase' }}
                          >
                            {item.sourceType === 'lead' ? 'Pipeline Deal' : 'Customer Account'}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                            {projectTypeLabels[signageTypeKey] || 'Signage'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                          {item.parentCode}
                        </span>
                      </div>

                      {/* Signboard Title */}
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '10px' }}>
                        {survey.title}
                      </h4>

                      {/* Parent Company Name */}
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-light)', marginTop: '2px' }}>
                        {item.parentName}
                      </div>

                      {/* Location Address */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                        }}
                      >
                        <MapPin size={13} color="var(--cyan)" style={{ flexShrink: 0 }} />
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
                          gap: '10px',
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
                            3D Letter / Box Depth
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {survey.depthMeters ? `${survey.depthMeters}m (${(survey.depthMeters * 100).toFixed(0)}cm)` : 'Flat Profile'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            Install Elevation
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {survey.installationHeightMeters}m from ground
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            Environment
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: survey.indoorOutdoor === 'outdoor' ? 'var(--amber)' : '#c084fc' }}>
                            {survey.indoorOutdoor === 'outdoor' ? 'Outdoor (Weatherproof)' : 'Indoor Retail'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            220V Power Line
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: survey.powerSourceAvailable ? 'var(--emerald)' : 'var(--amber)',
                            }}
                          >
                            {survey.powerSourceAvailable ? 'Available on Site' : 'Wiring Required'}
                          </div>
                        </div>
                      </div>

                      {/* Surveyor & Date */}
                      {(survey.surveyorName || survey.surveyDate) && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px' }}>
                          Surveyed by {survey.surveyorName || 'Technician'} • {survey.surveyDate || 'Recent'}
                        </div>
                      )}

                      {/* Notes */}
                      {survey.notes && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                          &ldquo;{survey.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <button
                        onClick={() => {
                          if (item.lead) {
                            handleOpenLeadSurveyManager(item.lead);
                            handleStartEditSurvey(survey);
                          } else if (item.customer) {
                            handleOpenCustomerSurveyManager(item.customer);
                            handleStartEditSurvey(survey);
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Edit3 size={12} />
                        <span>Edit Dimensions</span>
                      </button>

                      <button
                        onClick={() => {
                          if (item.lead) {
                            handleOpenLeadSurveyManager(item.lead);
                            handleStartNewSurvey(survey.locationAddress, `${item.parentName} Signboard #${getLeadSurveys(item.lead).length + 1}`);
                          } else if (item.customer) {
                            handleOpenCustomerSurveyManager(item.customer);
                            handleStartNewSurvey(survey.locationAddress, `${item.parentName} Signboard #${getCustomerSurveys(item.customer).length + 1}`);
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Add another signboard for this client"
                        style={{ padding: '6px 10px' }}
                      >
                        <Plus size={13} />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteSurvey(
                            item.sourceType,
                            item.lead?.id || item.customer?.id || '',
                            survey.id
                          )
                        }
                        className="btn btn-secondary btn-sm"
                        title="Delete this signboard survey"
                        style={{ color: 'var(--rose)', padding: '6px 10px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

              {/* Dynamic Multiple Site Surveys in New Lead Form */}
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.04)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--cyan)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={leadForm.hasSurvey}
                      onChange={(e) => setLeadForm({ ...leadForm, hasSurvey: e.target.checked })}
                    />
                    <span>Attach Site Surveys & Dimensions ({leadForm.surveys.length} Signboards)</span>
                  </label>

                  {leadForm.hasSurvey && (
                    <button
                      type="button"
                      onClick={handleAddDraftSurveyToLeadForm}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      <Plus size={12} />
                      <span>+ Add Another Sign</span>
                    </button>
                  )}
                </div>

                {leadForm.hasSurvey && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {leadForm.surveys.map((draft, idx) => (
                      <div
                        key={draft.id}
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                            Signboard #{idx + 1}
                          </span>
                          {leadForm.surveys.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftSurvey(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--rose)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Trash2 size={12} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '11px' }}>
                              Signboard Title / Facade Spot *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Main Entrance Pylon, Rooftop 3D Logo"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              value={draft.title}
                              onChange={(e) => handleUpdateDraftSurvey(idx, { title: e.target.value })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '11px' }}>
                              Signage Fabrication Type
                            </label>
                            <select
                              className="form-select"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              value={draft.signageType}
                              onChange={(e) =>
                                handleUpdateDraftSurvey(idx, { signageType: e.target.value as SignageType })
                              }
                            >
                              {Object.entries(projectTypeLabels).map(([val, label]) => (
                                <option key={val} value={val}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '11px' }}>
                            Specific Installation Location
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. South Elevation Facade, 1st Floor"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            value={draft.locationAddress}
                            onChange={(e) => handleUpdateDraftSurvey(idx, { locationAddress: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '10px' }}>Width (m) *</label>
                            <input
                              type="number"
                              step="0.05"
                              min="0.1"
                              required
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '12px' }}
                              value={draft.widthMeters}
                              onChange={(e) => handleUpdateDraftSurvey(idx, { widthMeters: Number(e.target.value) })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '10px' }}>Height (m) *</label>
                            <input
                              type="number"
                              step="0.05"
                              min="0.1"
                              required
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '12px' }}
                              value={draft.heightMeters}
                              onChange={(e) => handleUpdateDraftSurvey(idx, { heightMeters: Number(e.target.value) })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '10px' }}>Depth (m)</label>
                            <input
                              type="number"
                              step="0.02"
                              min="0"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '12px' }}
                              value={draft.depthMeters}
                              onChange={(e) => handleUpdateDraftSurvey(idx, { depthMeters: Number(e.target.value) })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '10px' }}>Elevation (m)</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '12px' }}
                              value={draft.installationHeightMeters}
                              onChange={(e) =>
                                handleUpdateDraftSurvey(idx, { installationHeightMeters: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={draft.powerSourceAvailable}
                              onChange={(e) => handleUpdateDraftSurvey(idx, { powerSourceAvailable: e.target.checked })}
                            />
                            <span>220V Power Line on Site</span>
                          </label>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`env-${draft.id}`}
                                value="outdoor"
                                checked={draft.indoorOutdoor === 'outdoor'}
                                onChange={() => handleUpdateDraftSurvey(idx, { indoorOutdoor: 'outdoor' })}
                              />
                              <span>Outdoor</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`env-${draft.id}`}
                                value="indoor"
                                checked={draft.indoorOutdoor === 'indoor'}
                                onChange={() => handleUpdateDraftSurvey(idx, { indoorOutdoor: 'indoor' })}
                              />
                              <span>Indoor</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
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

      {/* MODAL 3: SITE SURVEYS & SIGNBOARDS MANAGER (MULTIPLE PER LEAD/CUSTOMER) */}
      {(surveyModalLead || surveyModalCustomer) && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            {(() => {
              const activeLead = surveyModalLead ? (leads.find((l) => l.id === surveyModalLead.id) || surveyModalLead) : null;
              const activeCustomer = surveyModalCustomer ? (customers.find((c) => c.id === surveyModalCustomer.id) || surveyModalCustomer) : null;
              const entityName = activeLead ? activeLead.companyName : (activeCustomer ? activeCustomer.name : '');
              const entityCode = activeLead ? activeLead.leadNumber : (activeCustomer ? activeCustomer.code : '');
              const entityType = activeLead ? 'lead' : 'customer';
              const entityId = activeLead ? activeLead.id : (activeCustomer ? activeCustomer.id : '');
              const surveys = activeLead ? getLeadSurveys(activeLead) : (activeCustomer ? getCustomerSurveys(activeCustomer) : []);
              const totalArea = calculateSurveysArea(surveys);

              return (
                <div>
                  {/* Modal Header */}
                  <div className="modal-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ruler size={20} color="var(--cyan)" />
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                          Site Surveys & Signboard Manager
                        </h3>
                        <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                          {surveys.length} {surveys.length === 1 ? 'Signboard' : 'Signboards'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Account: <strong style={{ color: 'var(--primary-light)' }}>{entityName}</strong> ({entityCode}) • Total Area: <strong style={{ color: 'var(--cyan)' }}>{totalArea.toFixed(1)} m²</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSurveyModalLead(null);
                        setSurveyModalCustomer(null);
                        setEditingSurveyId(null);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Mode 1: Edit or Add Specific Signboard */}
                  {editingSurveyId !== null ? (
                    <form onSubmit={handleSaveSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6, 182, 212, 0.08)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>
                          {editingSurveyId === 'new' ? '+ Add New Signboard / Facade Location' : `Edit Signboard: "${surveyForm.title}"`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingSurveyId(null)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          ← Back to Signboards List
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Signboard Title / Facade Spot *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Main Entrance 3D Sign, Rooftop Sky Sign"
                            className="form-input"
                            value={surveyForm.title}
                            onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Signage Fabrication Type</label>
                          <select
                            className="form-select"
                            value={surveyForm.signageType || 'acrylic_3d'}
                            onChange={(e) => setSurveyForm({ ...surveyForm, signageType: e.target.value as SignageType })}
                          >
                            {Object.entries(projectTypeLabels).map(([val, label]) => (
                              <option key={val} value={val}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Installation Location Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CBE HQ Plaza South Facade, Sengatera, Addis Ababa"
                          className="form-input"
                          value={surveyForm.locationAddress}
                          onChange={(e) => setSurveyForm({ ...surveyForm, locationAddress: e.target.value })}
                        />
                      </div>

                      {/* Dimensional Blueprint Inputs */}
                      <div
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase' }}>
                          📐 Engineering Dimensions & Ground Elevation
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Width (m) *</label>
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
                            <label className="form-label">Height (m) *</label>
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

                          <div className="form-group">
                            <label className="form-label">Depth (m)</label>
                            <input
                              type="number"
                              step="0.02"
                              min="0"
                              placeholder="0.15"
                              className="form-input"
                              value={surveyForm.depthMeters || 0}
                              onChange={(e) => setSurveyForm({ ...surveyForm, depthMeters: Number(e.target.value) })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Elevation (m)</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="3.5"
                              className="form-input"
                              value={surveyForm.installationHeightMeters}
                              onChange={(e) => setSurveyForm({ ...surveyForm, installationHeightMeters: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        {/* Calculated area preview */}
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                          <span>Calculated Area: <strong style={{ color: 'var(--cyan)' }}>{((Number(surveyForm.widthMeters) || 0) * (Number(surveyForm.heightMeters) || 0)).toFixed(2)} m²</strong></span>
                          <span>Depth: <strong style={{ color: 'var(--text-main)' }}>{((Number(surveyForm.depthMeters) || 0) * 100).toFixed(0)} cm</strong></span>
                          <span>Elevation: <strong style={{ color: 'var(--text-main)' }}>{surveyForm.installationHeightMeters}m ground clearance</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Environment</label>
                          <select
                            className="form-select"
                            value={surveyForm.indoorOutdoor}
                            onChange={(e) => setSurveyForm({ ...surveyForm, indoorOutdoor: e.target.value as 'indoor' | 'outdoor' })}
                          >
                            <option value="outdoor">Outdoor (Weatherproof IP67 required)</option>
                            <option value="indoor">Indoor (Retail / Office reception)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Surveyor Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={surveyForm.surveyorName || 'Dawit Bekele'}
                            onChange={(e) => setSurveyForm({ ...surveyForm, surveyorName: e.target.value })}
                          />
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
                          220V AC Power Line Available on Site (Ready for internal LED modules)
                        </label>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Technician Notes & Scaffolding Requirements</label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          placeholder="e.g. Scaffolding needed up to 8m elevation, masonry anchor bolts, waterproof silicone sealant..."
                          value={surveyForm.notes || ''}
                          onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })}
                        />
                      </div>

                      <div className="modal-footer" style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingSurveyId(null)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Save Signboard Dimensions
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Mode 2: Multi-Signboard List for this Deal/Customer */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          All recorded signage locations & dimensions for this account:
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartNewSurvey(surveys[0]?.locationAddress, `${entityName} Signboard #${surveys.length + 1}`)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={13} />
                          <span>+ Add Another Signboard</span>
                        </button>
                      </div>

                      {surveys.length === 0 ? (
                        <div
                          style={{
                            background: 'var(--bg-app)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '32px',
                            textAlign: 'center',
                            color: 'var(--text-dim)',
                            border: '1px dashed var(--border-subtle)',
                          }}
                        >
                          <Ruler size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>No signboards measured yet for this client.</div>
                          <button
                            type="button"
                            onClick={() => handleStartNewSurvey('', `${entityName} Main Facade Sign`)}
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '10px' }}
                          >
                            + Record First Signboard Dimensions
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {surveys.map((s, idx) => {
                            const itemArea = ((Number(s.widthMeters) || 0) * (Number(s.heightMeters) || 0)).toFixed(2);
                            return (
                              <div
                                key={s.id}
                                style={{
                                  background: 'var(--bg-app)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                                        #{idx + 1}
                                      </span>
                                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                                        {s.title}
                                      </span>
                                      <span
                                        className="badge"
                                        style={{
                                          fontSize: '10px',
                                          background: s.indoorOutdoor === 'outdoor' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                                          color: s.indoorOutdoor === 'outdoor' ? 'var(--amber)' : '#c084fc',
                                        }}
                                      >
                                        {s.indoorOutdoor.toUpperCase()}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                      <MapPin size={12} color="var(--cyan)" />
                                      <span>{s.locationAddress}</span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditSurvey(s)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                                    >
                                      <Edit3 size={11} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSurvey(entityType, entityId, s.id)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ color: 'var(--rose)', padding: '5px 8px' }}
                                      title="Delete signboard"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* Dimension Metrics */}
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    background: 'rgba(6, 182, 212, 0.05)',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    gap: '8px',
                                    fontSize: '11px',
                                  }}
                                >
                                  <div>
                                    <span style={{ color: 'var(--text-dim)' }}>Width × Height: </span>
                                    <strong style={{ color: 'var(--text-main)' }}>{s.widthMeters}m × {s.heightMeters}m</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--text-dim)' }}>Surface Area: </span>
                                    <strong style={{ color: 'var(--cyan)' }}>{itemArea} m²</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--text-dim)' }}>3D Depth: </span>
                                    <strong style={{ color: 'var(--text-main)' }}>{s.depthMeters ? `${(s.depthMeters * 100).toFixed(0)}cm` : 'Flat'}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--text-dim)' }}>Elevation: </span>
                                    <strong style={{ color: 'var(--text-main)' }}>{s.installationHeightMeters}m high</strong>
                                  </div>
                                </div>

                                {s.notes && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                    &ldquo;{s.notes}&rdquo;
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="modal-footer" style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSurveyModalLead(null);
                            setSurveyModalCustomer(null);
                          }}
                          className="btn btn-primary"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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
                Congratulations! Converting this deal will automatically create a verified profile in your Customer Directory, transfer all attached site surveys and dimensions, and assign credit limit.
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
                <div style={{ fontSize: '12px', color: 'var(--cyan)', marginTop: '4px' }}>
                  📐 {getLeadSurveys(convertModalLead).length} Signboards ({calculateSurveysArea(getLeadSurveys(convertModalLead)).toFixed(1)} m²)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald)', marginTop: '6px' }}>
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
          <div className="modal-content" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            {(() => {
              const currentCust = customers.find((c) => c.id === selectedCustomerProfile.id) || selectedCustomerProfile;
              const custSurveys = getCustomerSurveys(currentCust);
              const custArea = calculateSurveysArea(custSurveys);

              return (
                <div>
                  <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={22} color="var(--primary-light)" />
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {currentCust.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                          Code: {currentCust.code} • TIN: {currentCust.tin}
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
                          {formatETB(currentCust.creditLimit)}
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
                            color: currentCust.outstandingBalance > 0 ? 'var(--rose)' : 'var(--text-dim)',
                            marginTop: '4px',
                          }}
                        >
                          {formatETB(currentCust.outstandingBalance)}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Available Line
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>
                          {formatETB(currentCust.creditLimit - currentCust.outstandingBalance)}
                        </div>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Contact Person:</span>
                        <span style={{ fontWeight: 600 }}>{currentCust.contactPerson || 'Account Representative'}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Phone Number:</span>
                        <span style={{ fontWeight: 600 }}>{currentCust.phone}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Email:</span>
                        <span style={{ fontWeight: 600 }}>{currentCust.email}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Office Address:</span>
                        <span style={{ fontWeight: 600 }}>{currentCust.address}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Tax Status:</span>
                        <span style={{ fontWeight: 700, color: currentCust.isVatRegistered ? 'var(--emerald)' : 'var(--amber)' }}>
                          {currentCust.isVatRegistered ? 'Standard 15% VAT Invoiced' : 'Statutory VAT Exempt Entity'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Agreed Payment Terms:</span>
                        <span style={{ fontWeight: 600 }}>{currentCust.paymentTerms}</span>
                      </div>
                    </div>

                    {/* Site Surveys & Installed Signboards Section */}
                    <div
                      style={{
                        background: 'rgba(6, 182, 212, 0.05)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Ruler size={15} color="var(--cyan)" />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                            Site Surveys & Signboards ({custSurveys.length})
                          </span>
                          {custSurveys.length > 0 && (
                            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                              {custArea.toFixed(1)} m² Total
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenCustomerSurveyManager(currentCust);
                            handleStartNewSurvey(currentCust.address, `${currentCust.name} Signboard #${custSurveys.length + 1}`);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          <Plus size={11} />
                          <span>+ Add Sign</span>
                        </button>
                      </div>

                      {custSurveys.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                          No site surveys logged yet for this client. Click &quot;+ Add Sign&quot; to attach measured dimensions.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {custSurveys.map((s) => (
                            <div
                              key={s.id}
                              style={{
                                background: 'var(--bg-app)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {s.title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                  {s.widthMeters}m × {s.heightMeters}m ({((Number(s.widthMeters) || 0) * (Number(s.heightMeters) || 0)).toFixed(1)} m²)
                                  {s.depthMeters ? ` • Depth: ${s.depthMeters}m` : ''} • Elev: {s.installationHeightMeters}m
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--cyan)', marginTop: '2px' }}>
                                  📍 {s.locationAddress}
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenCustomerSurveyManager(currentCust);
                                    handleStartEditSurvey(s);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 6px' }}
                                  title="Edit Dimensions"
                                >
                                  <Edit3 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSurvey('customer', currentCust.id, s.id)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 6px', color: 'var(--rose)' }}
                                  title="Remove Signboard"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Linked Orders */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Active Orders with this Client
                      </h4>
                      {orders.filter((o) => o.customerId === currentCust.id).length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                          No ongoing production work orders for this customer.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {orders
                            .filter((o) => o.customerId === currentCust.id)
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
                    <Link href="/dashboard/orders" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShoppingBag size={13} />
                      <span>Create Order</span>
                    </Link>
                    <Link href="/dashboard/sales" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Issue Invoice →</span>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 6: QUICK ADD SITE SURVEY MODAL (FROM TAB 3) */}
      {showQuickAddSurveyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="var(--cyan)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Add Site Survey & Signboard
                </h3>
              </div>
              <button
                onClick={() => setShowQuickAddSurveyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickAddSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Attach To</label>
                  <select
                    className="form-select"
                    value={quickAddTargetType}
                    onChange={(e) => {
                      const newType = e.target.value as 'lead' | 'customer';
                      setQuickAddTargetType(newType);
                      setQuickAddTargetId(newType === 'lead' ? (leads[0]?.id || '') : (customers[0]?.id || ''));
                    }}
                  >
                    <option value="lead">Pipeline Lead</option>
                    <option value="customer">Customer Directory</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {quickAddTargetType === 'lead' ? 'Select Lead Deal *' : 'Select Customer Account *'}
                  </label>
                  <select
                    className="form-select"
                    required
                    value={quickAddTargetId}
                    onChange={(e) => setQuickAddTargetId(e.target.value)}
                  >
                    {quickAddTargetType === 'lead'
                      ? leads.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.leadNumber} - {l.companyName}
                          </option>
                        ))
                      : customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Signboard Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Entrance Pylon, Rooftop 3D Logo"
                    className="form-input"
                    value={surveyForm.title}
                    onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Signage Type</label>
                  <select
                    className="form-select"
                    value={surveyForm.signageType || 'acrylic_3d'}
                    onChange={(e) => setSurveyForm({ ...surveyForm, signageType: e.target.value as SignageType })}
                  >
                    {Object.entries(projectTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Installation Location Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bole Road, Next to Cathedral, Addis Ababa"
                  className="form-input"
                  value={surveyForm.locationAddress}
                  onChange={(e) => setSurveyForm({ ...surveyForm, locationAddress: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Width (m) *</label>
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
                  <label className="form-label">Height (m) *</label>
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

                <div className="form-group">
                  <label className="form-label">Depth (m)</label>
                  <input
                    type="number"
                    step="0.02"
                    min="0"
                    placeholder="0.15"
                    className="form-input"
                    value={surveyForm.depthMeters || 0}
                    onChange={(e) => setSurveyForm({ ...surveyForm, depthMeters: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Elevation (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="3.5"
                    className="form-input"
                    value={surveyForm.installationHeightMeters}
                    onChange={(e) => setSurveyForm({ ...surveyForm, installationHeightMeters: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div className="form-group">
                  <label className="form-label">Surveyor Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={surveyForm.surveyorName || 'Dawit Bekele'}
                    onChange={(e) => setSurveyForm({ ...surveyForm, surveyorName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="quickPower"
                  checked={surveyForm.powerSourceAvailable}
                  onChange={(e) => setSurveyForm({ ...surveyForm, powerSourceAvailable: e.target.checked })}
                />
                <label htmlFor="quickPower" style={{ fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}>
                  220V AC Power Line Available on Site (LED ready)
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Technician Notes & Scaffold Requirements</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Need 6m scaffolding, masonry anchors, IP67 silicon..."
                  value={surveyForm.notes || ''}
                  onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowQuickAddSurveyModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Signboard Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrmPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '36px', color: 'var(--text-dim)', textAlign: 'center' }}>
          Loading CRM & Sales Pipeline...
        </div>
      }
    >
      <CrmContent />
    </Suspense>
  );
}
