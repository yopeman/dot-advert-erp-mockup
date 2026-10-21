'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  TrendingUp,
  Calendar,
  Check,
  AlertCircle,
  Award,
  Filter,
  UserPlus,
  Send,
  Download,
  PieChart as PieIcon,
  BarChart3,
  CalendarDays,
  FileText,
  DollarSign,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Sliders,
  HeartHandshake,
  Target,
  BadgeCheck,
  FileCheck,
  Building,
  UserCheck,
  ExternalLink,
  Info,
  Lock,
  Settings,
  Activity,
  Wallet,
  Percent,
  ArrowUpRight,
  RefreshCw,
  Camera,
  Scan,
  Eye,
  Video,
  VideoOff,
} from 'lucide-react';
import {
  Employee,
  LeaveRequest,
  AttendanceRecord,
  JobOpening,
  Candidate,
  LeaveType,
  RecruitmentStage,
  InterviewSchedule,
  EmployeeGuarantor,
  EmployeeEmergencyContact,
  EmployeeDocument,
} from '@/types/erp';
import {
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_JOB_OPENINGS,
  INITIAL_CANDIDATES,
  INITIAL_INTERVIEWS,
  ATTENDANCE_WEEK_HISTORY,
  DETAILED_EMPLOYEES_MAP,
  COMPANY_OKRS,
  SALARY_BENCHMARKS,
  WORKFORCE_STATS,
  OrgEmployeeDetail,
  makeBiometricSelfie,
} from '@/data/hrMockData';

function HrModuleDashboardInner() {
  const { employees, workOrders, updateWorkOrder, addEmployee, currentRole, setCurrentRole } = useErp();
  const searchParams = useSearchParams();

  // URL Params initialization
  const paramTab = searchParams.get('tab');
  const paramRole = searchParams.get('role');
  const paramSub = searchParams.get('sub');

  // Role View State: 'employee' | 'hr_manager' | 'admin' | 'super_admin'
  const [roleView, setRoleView] = useState<'employee' | 'hr_manager' | 'admin' | 'super_admin'>('hr_manager');
  const [superAdminViewMode, setSuperAdminViewMode] = useState<'governance' | 'operations'>('governance');
  const [selectedEssEmpId, setSelectedEssEmpId] = useState<string>(employees[0]?.id || 'emp-1');

  // Navigation Tabs (International HCM Standard)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'payroll' | 'allocation' | 'employees' | 'attendance' | 'leaves' | 'recruitment' | 'performance'
  >('overview');

  // Sub-tabs for Payroll & Labor: 'payroll_tax' | 'labor_allocation' | 'labor_analytics'
  const [payrollSubTab, setPayrollSubTab] = useState<'payroll_tax' | 'labor_allocation' | 'labor_analytics'>('payroll_tax');

  // Super Admin Configurable Engine State
  const [pensionEmployeePct, setPensionEmployeePct] = useState(0.07);
  const [pensionEmployerPct, setPensionEmployerPct] = useState(0.11);
  const [taxExemptBase, setTaxExemptBase] = useState(600);
  const [isPayrollFrozen, setIsPayrollFrozen] = useState(false);
  const [auditFilterCategory, setAuditFilterCategory] = useState('all');

  // Synchronize roleView with global ERP role
  useEffect(() => {
    if (currentRole === 'employee' || currentRole === 'machine_operator') {
      setRoleView('employee');
    } else if (currentRole === 'hr_manager' || currentRole === 'hr_officer') {
      setRoleView('hr_manager');
    } else if (currentRole === 'admin') {
      setRoleView('admin');
    } else if (currentRole === 'super_admin' || currentRole === 'general_manager') {
      setRoleView('super_admin');
    }
  }, [currentRole]);

  // React to URL search parameters
  useEffect(() => {
    if (paramTab === 'payroll') setActiveTab('payroll');
    if (paramTab === 'allocation') {
      setActiveTab('payroll');
      setPayrollSubTab('labor_allocation');
    }
    if (paramRole === 'employee') {
      setRoleView('employee');
      setCurrentRole('employee');
    } else if (paramRole === 'admin') {
      setRoleView('admin');
      setCurrentRole('admin');
    } else if (paramRole === 'super_admin') {
      setRoleView('super_admin');
      setCurrentRole('super_admin');
    } else if (paramRole === 'hr_manager' || paramRole === 'manager') {
      setRoleView('hr_manager');
      setCurrentRole('hr_manager');
    }
    if (paramSub === 'labor') setPayrollSubTab('labor_allocation');
    if (paramSub === 'analytics') setPayrollSubTab('labor_analytics');
  }, [paramTab, paramRole, paramSub, setCurrentRole]);

  const handleSwitchRole = (newRole: 'employee' | 'hr_manager' | 'admin' | 'super_admin') => {
    setRoleView(newRole);
    if (newRole === 'employee') setCurrentRole('employee');
    else if (newRole === 'hr_manager') setCurrentRole('hr_manager');
    else if (newRole === 'admin') setCurrentRole('admin');
    else if (newRole === 'super_admin') setCurrentRole('super_admin');
  };

  // Super Admin Configurable Engine Temp State
  const [tempExemptBase, setTempExemptBase] = useState(600);
  const [tempEmpPension, setTempEmpPension] = useState(7.0);
  const [tempEmprPension, setTempEmprPension] = useState(11.0);

  // RBAC Matrix State
  const [rbacList, setRbacList] = useState([
    {
      id: 'p1',
      category: 'Self-Service',
      name: 'View Personal Dossier & Payslips',
      desc: 'Access personal identification, bank account, and official salary payslip',
      employee: true,
      hr_manager: true,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p2',
      category: 'Self-Service',
      name: 'Punch Biometric Terminal',
      desc: 'Punch personal work shifts via biometric terminal punch',
      employee: true,
      hr_manager: true,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p3',
      category: 'Self-Service',
      name: 'Submit Leave Requests',
      desc: 'Request annual, sick, or compassionate leave time-off',
      employee: true,
      hr_manager: true,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p4',
      category: 'Workforce Hub',
      name: 'View All Personnel Salaries',
      desc: 'Inspect confidential base salaries, allowances, and gross compensation of all employees',
      employee: false,
      hr_manager: true,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p5',
      category: 'Workforce Hub',
      name: 'Onboard New Employees',
      desc: 'Register new personnel with Ethiopian TIN, Pension number, and Bank account',
      employee: false,
      hr_manager: true,
      admin: false,
      super_admin: true,
    },
    {
      id: 'p6',
      category: 'Workforce Hub',
      name: 'Approve / Reject Staff Leaves',
      desc: 'Review queued employee leave requests and grant or reject days',
      employee: false,
      hr_manager: true,
      admin: false,
      super_admin: true,
    },
    {
      id: 'p7',
      category: 'Production',
      name: 'Direct Labor Work Order Allocation',
      desc: 'Absorb machine operator hours directly into customer work orders and job costs',
      employee: false,
      hr_manager: true,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p8',
      category: 'Payroll',
      name: 'Disburse Bank Payroll (CBE Wire)',
      desc: 'Generate Commercial Bank of Ethiopia bulk salary batch wire disbursement file',
      employee: false,
      hr_manager: true,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p9',
      category: 'Operations',
      name: 'Edit Machine Labor Absorption Rates',
      desc: 'Configure standard hourly rates for CNC, Laser, UV Flatbed, and Welding',
      employee: false,
      hr_manager: false,
      admin: true,
      super_admin: true,
    },
    {
      id: 'p10',
      category: 'Governance',
      name: 'Override MoR Proclamation 979 Rates',
      desc: 'Modify income tax brackets, exempt base, and POSE pension rates',
      employee: false,
      hr_manager: false,
      admin: false,
      super_admin: true,
    },
    {
      id: 'p11',
      category: 'Governance',
      name: 'Emergency Payroll Freeze & Audit Lock',
      desc: 'Halt all salary disbarments during statutory fiscal audits',
      employee: false,
      hr_manager: false,
      admin: false,
      super_admin: true,
    },
    {
      id: 'p12',
      category: 'Security',
      name: 'Export Cryptographic Audit Ledger',
      desc: 'Download immutable JSON/CSV trail of financial and personnel operations',
      employee: false,
      hr_manager: false,
      admin: false,
      super_admin: true,
    },
  ]);

  const toggleRbacPermission = (id: string, roleKey: 'employee' | 'hr_manager' | 'admin' | 'super_admin') => {
    if (roleKey === 'super_admin') return; // Super admin always retains master privileges
    setRbacList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [roleKey]: !item[roleKey] } : item))
    );
    setNotification('RBAC Access Policy updated dynamically by Super Admin!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleApplyTaxConfig = () => {
    setTaxExemptBase(tempExemptBase);
    setPensionEmployeePct(tempEmpPension / 100);
    setPensionEmployerPct(tempEmprPension / 100);
    setNotification(`Statutory Tax & Pension Rules updated! Base Exemption: ${tempExemptBase} ETB, Employee Pension: ${tempEmpPension}%, Employer Pension: ${tempEmprPension}%. Live payroll recalculated!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetTaxConfig = () => {
    setTempExemptBase(600);
    setTempEmpPension(7.0);
    setTempEmprPension(11.0);
    setTaxExemptBase(600);
    setPensionEmployeePct(0.07);
    setPensionEmployerPct(0.11);
    setNotification('Statutory Tax & Pension engine reset to Federal MoR Proclamation 979/2016 defaults!');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTogglePayrollFreeze = () => {
    const next = !isPayrollFrozen;
    setIsPayrollFrozen(next);
    if (next) {
      setNotification('🚨 CRITICAL: Company Payroll Disbursement batch CBE-BULK-202610-8812 has been FROZEN by Super Admin for compliance audit.');
    } else {
      setNotification('✅ Company Payroll Disbursement batch CBE-BULK-202610-8812 has been UNLOCKED for normal operations.');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(attendanceRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dot_advert_hr_audit_ledger_${selectedMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotification('Master Cryptographic Audit Ledger exported as JSON successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportAuditCsv = () => {
    const headers = 'Employee,Department,Date,CheckIn,CheckOut,Status,OvertimeHours,Notes\n';
    const rows = attendanceRecords
      .map((r) => `"${r.employeeName}","${r.department}","${r.date}","${r.checkIn}","${r.checkOut || ''}","${r.status}",${r.overtimeHours},"${r.notes || ''}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dot_advert_hr_audit_ledger_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setNotification('Master Security Audit Ledger exported as CSV successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Interactive Local State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(INITIAL_JOB_OPENINGS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);

  // Filters & Periods
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState('2026-10-20');
  const [candidateFilterStage, setCandidateFilterStage] = useState<string>('all');

  // Modals State
  const [previewPayslipEmp, setPreviewPayslipEmp] = useState<Employee | null>(null);
  const [viewEmployee360, setViewEmployee360] = useState<Employee | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobOpening | null>(null);
  const [showArrangeInterviewModal, setShowArrangeInterviewModal] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<Candidate | null>(null);
  const [selectedCandidateDossier, setSelectedCandidateDossier] = useState<Candidate | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Recruitment & Interview Scheduler State
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(INITIAL_INTERVIEWS);
  const [interviewDate, setInterviewDate] = useState('2026-10-25');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewDuration, setInterviewDuration] = useState(60);
  const [interviewType, setInterviewType] = useState<InterviewSchedule['interviewType']>('practical_shopfloor_test');
  const [interviewLocation, setInterviewLocation] = useState('Bole Lemi Factory — CNC Workshop Bed #02');
  const [interviewers, setInterviewers] = useState('Alazar Tadesse (Production Lead), Bethlehem (HR Director)');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Job Opening Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState<'production' | 'stores' | 'procurement' | 'sales' | 'finance' | 'admin'>('production');
  const [newJobType, setNewJobType] = useState<'full_time' | 'contract' | 'shift_work'>('full_time');
  const [newJobPositions, setNewJobPositions] = useState(2);
  const [newJobLocation, setNewJobLocation] = useState('Bole Lemi Industrial Zone, Dot Factory');
  const [newJobExp, setNewJobExp] = useState('2-4 years');
  const [newJobMinSalary, setNewJobMinSalary] = useState(20000);
  const [newJobMaxSalary, setNewJobMaxSalary] = useState(26000);
  const [newJobDeadline, setNewJobDeadline] = useState('2026-11-20');
  const [newJobUrgency, setNewJobUrgency] = useState<'urgent' | 'high' | 'normal'>('high');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobReqs, setNewJobReqs] = useState('');
  const [newJobResps, setNewJobResps] = useState('');
  const [newJobBenefits, setNewJobBenefits] = useState('');

  // Interactive Tax Simulator State
  const [simSalary, setSimSalary] = useState(25000);
  const [simAllowances, setSimAllowances] = useState(3000);
  const [simOvertimeHours, setSimOvertimeHours] = useState(8);

  // Forms State
  const [allocEmpId, setAllocEmpId] = useState(employees[0]?.id || '');
  const [allocWoId, setAllocWoId] = useState(workOrders[0]?.id || '');
  const [allocHours, setAllocHours] = useState(8);

  // Ultra-Detailed Employee Onboarding Form State
  const [onboardActiveTab, setOnboardActiveTab] = useState<'personal' | 'contract' | 'compensation' | 'guarantor' | 'emergency' | 'documents'>('personal');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPosition, setNewEmpPosition] = useState('');
  const [newEmpDept, setNewEmpDept] = useState<'production' | 'stores' | 'procurement' | 'sales' | 'finance' | 'admin'>('production');
  const [newEmpSalary, setNewEmpSalary] = useState(18000);
  const [newEmpAllowances, setNewEmpAllowances] = useState(2500);
  const [newEmpHourly, setNewEmpHourly] = useState(115);
  const [newEmpBank, setNewEmpBank] = useState('Commercial Bank of Ethiopia');
  const [newEmpAccount, setNewEmpAccount] = useState('1000' + Math.floor(100000000 + Math.random() * 900000000));
  const [newEmpTin, setNewEmpTin] = useState('00' + Math.floor(10000000 + Math.random() * 90000000));
  const [newEmpPension, setNewEmpPension] = useState('PEN-' + Math.floor(10000 + Math.random() * 90000));

  // Personal & Identity
  const [newEmpDob, setNewEmpDob] = useState('1997-04-18');
  const [newEmpGender, setNewEmpGender] = useState<'male' | 'female'>('male');
  const [newEmpMarital, setNewEmpMarital] = useState<'single' | 'married' | 'divorced'>('single');
  const [newEmpNationalId, setNewEmpNationalId] = useState('ET-ID-8829104');
  const [newEmpKebeleCity, setNewEmpKebeleCity] = useState('Addis Ababa, Bole Sub-City, Woreda 03, H.No 812');
  const [newEmpPhone, setNewEmpPhone] = useState('+251 9');
  const [newEmpEmail, setNewEmpEmail] = useState('');

  // Contract Details
  const [newEmpContractType, setNewEmpContractType] = useState<'permanent' | 'fixed_term' | 'probation_45_days' | 'apprentice'>('permanent');
  const [newEmpContractEnd, setNewEmpContractEnd] = useState('');
  const [newEmpDutyStation, setNewEmpDutyStation] = useState('Bole Lemi Factory Campus');
  const [newEmpWorkShift, setNewEmpWorkShift] = useState<'standard_day' | 'evening_shift' | 'night_shift' | 'flexible'>('standard_day');
  const [newEmpNoticePeriod, setNewEmpNoticePeriod] = useState(30);

  // Warranty / Legal Guarantor (Wase / ዋስ)
  const [newEmpGuarantorName, setNewEmpGuarantorName] = useState('Kassahun Wolde');
  const [newEmpGuarantorRel, setNewEmpGuarantorRel] = useState('Uncle / Business Owner');
  const [newEmpGuarantorOrg, setNewEmpGuarantorOrg] = useState('Commercial Bank of Ethiopia (Branch Head)');
  const [newEmpGuarantorJob, setNewEmpGuarantorJob] = useState('Operations Branch Manager');
  const [newEmpGuarantorPhone, setNewEmpGuarantorPhone] = useState('+251 911 889900');
  const [newEmpGuarantorKebele, setNewEmpGuarantorKebele] = useState('KB-04-77123');
  const [newEmpGuarantorAmount, setNewEmpGuarantorAmount] = useState(150000);
  const [newEmpGuarantorStatus, setNewEmpGuarantorStatus] = useState<'verified' | 'submitted' | 'pending'>('verified');

  // Emergency Contact
  const [newEmpEmergName, setNewEmpEmergName] = useState('Genet Bekele');
  const [newEmpEmergRel, setNewEmpEmergRel] = useState('Spouse');
  const [newEmpEmergPhone, setNewEmpEmergPhone] = useState('+251 922 445566');

  // Documents Compliance Checklist
  const [newEmpDocKebele, setNewEmpDocKebele] = useState(true);
  const [newEmpDocContract, setNewEmpDocContract] = useState(true);
  const [newEmpDocGuarantor, setNewEmpDocGuarantor] = useState(true);
  const [newEmpDocEducation, setNewEmpDocEducation] = useState(true);
  const [newEmpDocMedical, setNewEmpDocMedical] = useState(true);
  const [newEmpDocPolice, setNewEmpDocPolice] = useState(true);
  const [newEmpDocPension, setNewEmpDocPension] = useState(true);

  // New Leave Form State
  const [leaveEmpId, setLeaveEmpId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [leaveStart, setLeaveStart] = useState('2026-10-24');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-27');
  const [leaveReason, setLeaveReason] = useState('');

  // Clock In / Out & Biometric Selfie Form State
  const [clockEmpId, setClockEmpId] = useState(employees[0]?.id || '');
  const [clockPunchMode, setClockPunchMode] = useState<'in' | 'out'>('in');
  const [clockTime, setClockTime] = useState('08:00');
  const [clockStatus, setClockStatus] = useState<'present' | 'late'>('present');
  const [clockOvertime, setClockOvertime] = useState(0);
  const [clockNotes, setClockNotes] = useState('');
  const [clockSelfiePhoto, setClockSelfiePhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AttendanceRecord | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported on this browser or context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Webcam start failed:', err);
      setCameraError('Live webcam permission unavailable. Click "⚡ Simulate AI Face Scan" to verify facial biometric instant snapshot.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureSelfieFromWebcam = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.85);
      setClockSelfiePhoto(photoUrl);
      stopCamera();
    }
  };

  const simulateFacialScan = () => {
    setIsScanningFace(true);
    stopCamera();
    setTimeout(() => {
      const emp = employees.find((e) => e.id === clockEmpId);
      const photo = makeBiometricSelfie(
        emp?.name || 'Staff Member',
        clockPunchMode === 'in' ? 'check-in' : 'check-out',
        `${clockPunchMode === 'in' ? 'IN' : 'OUT'}: ${clockTime} VERIFIED`
      );
      setClockSelfiePhoto(photo);
      setIsScanningFace(false);
    }, 600);
  };

  const resetSelfie = () => {
    setClockSelfiePhoto(null);
    setCameraError(null);
  };

  // Currency Formatter
  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('ETB', 'ETB ');
  };

  // Statutory Ethiopian Income Tax Calculation (Federal MoR Proclamation 979/2016)
  const calculateIncomeTax = (taxableIncome: number) => {
    if (taxableIncome <= taxExemptBase) return 0;
    if (taxableIncome <= 1650) return taxableIncome * 0.1 - 60;
    if (taxableIncome <= 3200) return taxableIncome * 0.15 - 142.5;
    if (taxableIncome <= 5250) return taxableIncome * 0.2 - 302.5;
    if (taxableIncome <= 7800) return taxableIncome * 0.25 - 565;
    if (taxableIncome <= 10900) return taxableIncome * 0.3 - 955;
    return taxableIncome * 0.35 - 1500;
  };

  // Tax Simulator Calculations
  const simGross = simSalary + simAllowances + simOvertimeHours * ((simSalary / 160) * 1.5);
  const simPension7 = simSalary * pensionEmployeePct;
  const simPension11 = simSalary * pensionEmployerPct;
  const simTaxable = Math.max(0, simGross - simPension7);
  const simTax = calculateIncomeTax(simTaxable);
  const simNet = simGross - simPension7 - simTax;
  const simEffectiveTaxRate = Math.round((simTax / simGross) * 100);

  // Live Payroll Computations
  const payrollData = useMemo(() => {
    return employees.map((emp) => {
      const overtimeHours = emp.department === 'production' ? 12 : 2;
      const overtimePay = overtimeHours * (emp.hourlyRate * 1.5);
      const grossPay = emp.baseSalary + emp.allowances + overtimePay;

      const pension7Pct = emp.baseSalary * pensionEmployeePct;
      const pension11Pct = emp.baseSalary * pensionEmployerPct;

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
  }, [employees, pensionEmployeePct, pensionEmployerPct, taxExemptBase]);

  const totalGrossSalaries = payrollData.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNetPay = payrollData.reduce((sum, p) => sum + p.netPay, 0);
  const totalTaxWithheld = payrollData.reduce((sum, p) => sum + p.incomeTax, 0);
  const totalPension7 = payrollData.reduce((sum, p) => sum + p.pension7Pct, 0);
  const totalPension11 = payrollData.reduce((sum, p) => sum + p.pension11Pct, 0);
  const totalOvertimeExpenditure = payrollData.reduce((sum, p) => sum + p.overtimePay, 0);

  // Direct Labor Computations for Job-Costing
  const totalDirectLaborCost = useMemo(() => {
    return workOrders.reduce((sum, wo) => {
      const numOps = Math.max(1, wo.operatorNames.length);
      return sum + wo.machineHours * 120 * numOps;
    }, 0);
  }, [workOrders]);

  const totalMachineHours = useMemo(() => {
    return workOrders.reduce((sum, wo) => sum + wo.machineHours, 0);
  }, [workOrders]);

  const selectedEssEmp = useMemo(() => {
    return employees.find((e) => e.id === selectedEssEmpId) || employees[0];
  }, [employees, selectedEssEmpId]);

  const selectedEssPayroll = useMemo(() => {
    return payrollData.find((p) => p.emp.id === selectedEssEmp?.id) || payrollData[0];
  }, [payrollData, selectedEssEmp]);

  // Department Breakdown
  const departmentBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach((e) => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });

    const colors: Record<string, string> = {
      production: '#facc15', // Vibrant Yellow
      stores: '#09090b',     // Deep Black
      sales: '#ca8a04',      // Deep Gold/Amber
      finance: '#71717a',    // Charcoal Zinc
      admin: '#e4e4e7',      // Cool Gray
      procurement: '#fbbf24',
    };

    return Object.entries(counts).map(([dept, count]) => ({
      dept,
      count,
      pct: Math.round((count / employees.length) * 100),
      color: colors[dept] || '#a1a1aa',
    }));
  }, [employees]);

  // Handle Labor Allocation
  const handleAllocateLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.id === allocWoId);
    const emp = employees.find((em) => em.id === allocEmpId);
    if (!wo || !emp) return;

    const updatedOperators = wo.operatorNames.includes(emp.name)
      ? wo.operatorNames
      : [...wo.operatorNames, emp.name];

    updateWorkOrder(wo.id, {
      operatorNames: updatedOperators,
      machineHours: wo.machineHours + allocHours,
    });

    setShowAllocateModal(false);
    setNotification(
      `Direct Labor Logged: ${allocHours} hrs from ${emp.name} allocated to ${wo.workOrderNumber} (${wo.customerName}). Job cost updated!`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Add New Employee (Detailed Compliance Onboarding)
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const newCode = `EMP-00${employees.length + 1}`;
    const newEmp = addEmployee({
      employeeId: newCode,
      name: newEmpName,
      position: newEmpPosition,
      department: newEmpDept,
      baseSalary: Number(newEmpSalary),
      hourlyRate: Number(newEmpHourly),
      allowances: Number(newEmpAllowances),
      bankAccount: newEmpAccount,
      bankName: newEmpBank,
      tin: newEmpTin,
      pensionNumber: newEmpPension,
      employmentStatus: 'active',
      startDate: new Date().toISOString().split('T')[0],
      dateOfBirth: newEmpDob,
      gender: newEmpGender,
      maritalStatus: newEmpMarital,
      nationalIdNumber: newEmpNationalId,
      kebeleCity: newEmpKebeleCity,
      phone: newEmpPhone,
      email: newEmpEmail,
      contractType: newEmpContractType,
      contractEndDate: newEmpContractEnd || undefined,
      dutyStation: newEmpDutyStation,
      workShift: newEmpWorkShift,
      noticePeriodDays: Number(newEmpNoticePeriod),
      guarantor: {
        fullName: newEmpGuarantorName,
        relationship: newEmpGuarantorRel,
        organization: newEmpGuarantorOrg,
        jobTitle: newEmpGuarantorJob,
        phone: newEmpGuarantorPhone,
        kebeleId: newEmpGuarantorKebele,
        guaranteeAmount: Number(newEmpGuarantorAmount),
        letterStatus: newEmpGuarantorStatus,
      },
      emergencyContact: {
        fullName: newEmpEmergName,
        relationship: newEmpEmergRel,
        phone: newEmpEmergPhone,
      },
      documents: [
        { id: `doc-1`, name: 'National Kebele ID Scan', category: 'identity', uploadDate: new Date().toISOString().split('T')[0], verified: newEmpDocKebele },
        { id: `doc-2`, name: 'Countersigned Employment Contract', category: 'contract', uploadDate: new Date().toISOString().split('T')[0], verified: newEmpDocContract },
        { id: `doc-3`, name: 'Legal Guarantor (Wase / ዋስ) Notarized Letter', category: 'warranty', uploadDate: new Date().toISOString().split('T')[0], verified: newEmpDocGuarantor },
        { id: `doc-4`, name: 'Educational / TVET Certification', category: 'education', uploadDate: new Date().toISOString().split('T')[0], verified: newEmpDocEducation },
        { id: `doc-5`, name: 'Pre-Employment Medical Clearance', category: 'medical', uploadDate: new Date().toISOString().split('T')[0], verified: newEmpDocMedical },
        { id: `doc-6`, name: 'Police / Criminal Record Clearance', category: 'police_clearance', uploadDate: new Date().toISOString().split('T')[0], verified: newEmpDocPolice },
      ],
    });

    // Mirror to 360 detailed dossier map
    if (newEmp?.id) {
      DETAILED_EMPLOYEES_MAP[newEmp.id] = {
        id: newEmp.id,
        employeeId: newCode,
        name: newEmpName,
        position: newEmpPosition,
        department: newEmpDept,
        bandLevel: newEmpSalary > 22000 ? 'Band L4 — Senior Lead' : 'Band L3 — Professional',
        managerName: 'General Manager (Mulugeta Teshome)',
        location: newEmpDutyStation,
        kebeleId: newEmpNationalId,
        emergencyContact: {
          name: newEmpEmergName,
          relationship: newEmpEmergRel,
          phone: newEmpEmergPhone,
        },
        medicalInsuranceTier: 'Nyala Corporate Standard Health Coverage',
        certifications: [
          'Dot Advert Safety & Machine Compliance Certified',
          'Legal Guarantor (Wase) Verified',
        ],
        kpiScorePct: 90,
        performanceRating: 4.5,
        boxMatrixPosition: 'Core',
      };
    }

    setShowAddEmployeeModal(false);
    setNewEmpName('');
    setNewEmpPosition('');
    setNotification(`✅ Staff Member "${newEmpName}" onboarded with complete Legal Guarantor, Contract & Dossier (ID: ${newCode})!`);
    setTimeout(() => setNotification(null), 4500);
  };

  // Handle Create Job Opening
  const handleCreateJobOpening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      department: newJobDept,
      type: newJobType,
      openPositions: Number(newJobPositions) || 1,
      location: newJobLocation,
      experienceLevel: newJobExp,
      salaryRange: `${newJobMinSalary.toLocaleString()} - ${newJobMaxSalary.toLocaleString()} ETB/mo`,
      status: 'active',
      urgency: newJobUrgency,
      postedDate: new Date().toISOString().split('T')[0],
      deadline: newJobDeadline,
      applicantsCount: 0,
      description: newJobDesc || 'Job opening at Dot Advert manufacturing and advertising plant.',
      requirements: newJobReqs.split('\n').filter((l) => l.trim()),
      responsibilities: newJobResps.split('\n').filter((l) => l.trim()),
      benefits: newJobBenefits.split('\n').filter((l) => l.trim()),
    };

    setJobOpenings((prev) => [newJob, ...prev]);
    setShowCreateJobModal(false);
    setNewJobTitle('');
    setNewJobDesc('');
    setNewJobReqs('');
    setNewJobResps('');
    setNotification(`🎉 New Job Requisition "${newJob.title}" published with full specifications!`);
    setTimeout(() => setNotification(null), 4500);
  };

  // Handle Arrange Interview
  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateForInterview) return;

    const newInterview: InterviewSchedule = {
      id: `int-${Date.now()}`,
      candidateId: selectedCandidateForInterview.id,
      candidateName: selectedCandidateForInterview.fullName,
      jobTitle: selectedCandidateForInterview.jobTitle,
      date: interviewDate,
      time: interviewTime,
      durationMinutes: Number(interviewDuration) || 45,
      interviewType,
      interviewers: interviewers.split(',').map((s) => s.trim()).filter(Boolean),
      locationOrLink: interviewLocation,
      status: 'scheduled',
      evaluationNotes: interviewNotes || 'Candidate scheduled for interview.',
    };

    setInterviews((prev) => [newInterview, ...prev]);

    // Update candidate status and append interview
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidateForInterview.id
          ? {
              ...c,
              stage: 'interview',
              interviewDate: `${interviewDate} at ${interviewTime}`,
              interviewStatus: 'Interview Scheduled',
              interviews: [...(c.interviews || []), newInterview],
            }
          : c
      )
    );

    setShowArrangeInterviewModal(false);
    const candName = selectedCandidateForInterview.fullName;
    setSelectedCandidateForInterview(null);
    setNotification(
      `✅ Interview & shopfloor test arranged for ${candName} on ${interviewDate} at ${interviewTime}!`
    );
    setTimeout(() => setNotification(null), 4500);
  };

  // Handle One-Click Hire & Auto Pre-fill Onboarding Form
  const handleOneClickHireCandidate = (cand: Candidate) => {
    // 1. Mark candidate as hired
    setCandidates((prev) =>
      prev.map((c) => (c.id === cand.id ? { ...c, stage: 'hired', notes: 'Hired & Converted to Staff' } : c))
    );

    // 2. Pre-fill detailed onboarding form state
    setNewEmpName(cand.fullName);
    setNewEmpPosition(cand.jobTitle);
    setNewEmpSalary(cand.expectedSalary || 20000);
    setNewEmpPhone(cand.phone || '+251 9');
    setNewEmpEmail(cand.email || '');
    setNewEmpHourly(Math.round((cand.expectedSalary || 20000) / 160));
    setNewEmpContractType('permanent');

    const matchingJob = jobOpenings.find((j) => j.id === cand.jobId || j.title === cand.jobTitle);
    if (matchingJob) {
      setNewEmpDept(matchingJob.department as any);
      setNewEmpDutyStation(matchingJob.location);
    }

    if (selectedCandidateDossier) {
      setSelectedCandidateDossier(null);
    }

    // 3. Open Detailed Onboarding Modal
    setOnboardActiveTab('personal');
    setShowAddEmployeeModal(true);
    setNotification(`🎉 Candidate "${cand.fullName}" marked as HIRED! Review and complete their detailed legal onboarding dossier.`);
    setTimeout(() => setNotification(null), 4500);
  };

  // Handle Submit Leave Request
  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === leaveEmpId);
    if (!emp) return;

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveType: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: 3,
      reason: leaveReason || 'Standard leave request',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests((prev) => [newReq, ...prev]);
    setShowLeaveModal(false);
    setLeaveReason('');
    setNotification(`Leave request for ${emp.name} queued for HR Director approval!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Approve / Reject Leave
  const handleUpdateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status, approvedBy: 'HR Director' } : l))
    );
    setNotification(`Leave request status changed to ${status.toUpperCase()}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle Clock In / Clock Out with Biometric Selfie
  const handleRecordClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === clockEmpId);
    if (!emp) return;

    const capturedPhoto =
      clockSelfiePhoto ||
      makeBiometricSelfie(
        emp.name,
        clockPunchMode === 'in' ? 'check-in' : 'check-out',
        `${clockPunchMode === 'in' ? 'IN' : 'OUT'}: ${clockTime} VERIFIED`
      );

    if (clockPunchMode === 'out') {
      // Find today's existing check-in record for this employee if available
      const existingTodayIndex = attendanceRecords.findIndex(
        (r) => r.employeeId === emp.id && r.date === attendanceDate
      );

      if (existingTodayIndex >= 0) {
        const updated = [...attendanceRecords];
        updated[existingTodayIndex] = {
          ...updated[existingTodayIndex],
          checkOut: clockTime,
          checkOutPhoto: capturedPhoto,
          photoVerified: true,
          overtimeHours: Number(clockOvertime),
          notes: clockNotes
            ? `${updated[existingTodayIndex].notes || ''} | Out: ${clockNotes}`
            : updated[existingTodayIndex].notes,
        };
        setAttendanceRecords(updated);
      } else {
        const newAtt: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: attendanceDate,
          checkIn: '08:00',
          checkOut: clockTime,
          checkInPhoto: makeBiometricSelfie(emp.name, 'check-in', 'IN: 08:00 VERIFIED'),
          checkOutPhoto: capturedPhoto,
          photoVerified: true,
          terminalLocation: 'Bole Plant Gate #2 (Face Cam Station #04)',
          status: clockStatus,
          overtimeHours: Number(clockOvertime),
          notes: clockNotes || 'Biometric departure clock-out verified',
        };
        setAttendanceRecords((prev) => [newAtt, ...prev]);
      }
      setNotification(`✅ Biometric Clock-Out selfie verified for ${emp.name} at ${clockTime}!`);
    } else {
      // Clock In
      const newAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: attendanceDate,
        checkIn: clockTime,
        checkOut: undefined,
        checkInPhoto: capturedPhoto,
        photoVerified: true,
        terminalLocation: 'Bole Plant Gate #2 (Face Cam Station #04)',
        status: clockStatus,
        overtimeHours: Number(clockOvertime),
        notes: clockNotes || 'Biometric arrival check-in verified with facial scan',
      };
      setAttendanceRecords((prev) => [newAtt, ...prev]);
      setNotification(`✅ Biometric Clock-In selfie verified for ${emp.name} at ${clockTime} (${clockStatus})!`);
    }

    stopCamera();
    setShowClockInModal(false);
    setClockSelfiePhoto(null);
    setClockNotes('');
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Candidate Stage Advancement
  const handleAdvanceCandidate = (candId: string, nextStage: RecruitmentStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: nextStage } : c))
    );
    setNotification(`Candidate advanced to "${nextStage.toUpperCase()}" stage!`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered lists
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchEmployeeQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  const filteredCandidates = candidates.filter((c) => {
    if (candidateFilterStage === 'all') return true;
    return c.stage === candidateFilterStage;
  });

  return (
    <div className="hr-page-shell" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* ========================================================
          0. ENTERPRISE HCM ROLE & PORTAL SWITCHER
          ======================================================== */}
      <div
        style={{
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '14px',
          padding: '10px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 800,
              color: '#facc15',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={14} />
            Active Portal Role:
          </span>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              background: '#18181b',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #3f3f46',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchRole('employee')}
              style={{
                background: roleView === 'employee' ? '#facc15' : 'transparent',
                color: roleView === 'employee' ? '#09090b' : '#a1a1aa',
                border: 'none',
                borderRadius: '7px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: roleView === 'employee' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👤</span>
              <span>Employee Self-Service (ESS)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('hr_manager')}
              style={{
                background: roleView === 'hr_manager' ? '#facc15' : 'transparent',
                color: roleView === 'hr_manager' ? '#09090b' : '#a1a1aa',
                border: 'none',
                borderRadius: '7px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: roleView === 'hr_manager' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👔</span>
              <span>HR Manager Hub</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('admin')}
              style={{
                background: roleView === 'admin' ? '#facc15' : 'transparent',
                color: roleView === 'admin' ? '#09090b' : '#a1a1aa',
                border: 'none',
                borderRadius: '7px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: roleView === 'admin' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🛡️</span>
              <span>Admin Operations</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('super_admin')}
              style={{
                background: roleView === 'super_admin' ? '#facc15' : 'transparent',
                color: roleView === 'super_admin' ? '#09090b' : '#a1a1aa',
                border: 'none',
                borderRadius: '7px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: roleView === 'super_admin' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>⚡</span>
              <span>Super Admin Master</span>
            </button>
          </div>
        </div>

        {roleView === 'employee' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600 }}>
              Viewing Profile:
            </span>
            <select
              className="hr-input"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#18181b',
                color: '#facc15',
                borderColor: '#3f3f46',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              value={selectedEssEmpId}
              onChange={(e) => setSelectedEssEmpId(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.position} ({emp.department})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.7rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              ● Self-Service Mode
            </span>
          </div>
        )}

        {roleView === 'hr_manager' && (
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span>Workforce Operations • 8 Modules • Personnel & Leave Approvals • CBE Payroll</span>
          </div>
        )}

        {roleView === 'admin' && (
          <div style={{ fontSize: '0.75rem', color: '#facc15', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <ShieldCheck size={14} />
            <span>Administrative Governance & Statutory MoR 979 Compliance Schedule</span>
          </div>
        )}

        {roleView === 'super_admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.725rem', color: '#facc15', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} />
              Super Admin Mode:
            </span>
            <div style={{ display: 'flex', gap: '4px', background: '#18181b', padding: '3px', borderRadius: '8px', border: '1px solid #3f3f46' }}>
              <button
                type="button"
                onClick={() => setSuperAdminViewMode('governance')}
                style={{
                  background: superAdminViewMode === 'governance' ? '#facc15' : 'transparent',
                  color: superAdminViewMode === 'governance' ? '#09090b' : '#a1a1aa',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  fontWeight: superAdminViewMode === 'governance' ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                ⚡ Governance Hub
              </button>
              <button
                type="button"
                onClick={() => setSuperAdminViewMode('operations')}
                style={{
                  background: superAdminViewMode === 'operations' ? '#facc15' : 'transparent',
                  color: superAdminViewMode === 'operations' ? '#09090b' : '#a1a1aa',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  fontWeight: superAdminViewMode === 'operations' ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                🏢 Operations Explorer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          1. INTERNATIONAL ENTERPRISE HCM COMMAND BANNER
          (Solid Deep Black Surface with Vibrant Yellow Highlights)
          ======================================================== */}
      <div
        style={{
          background: 'linear-gradient(180deg, #09090b 0%, #111115 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '26px 30px',
          marginBottom: '24px',
          border: '1px solid #27272a',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative background graphic */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 900,
                  color: '#facc15',
                  background: 'rgba(250, 204, 21, 0.14)',
                  border: '1px solid rgba(250, 204, 21, 0.4)',
                  padding: '3px 12px',
                  borderRadius: '6px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} />
                ENTERPRISE HCM SYSTEM • ISO 45001 COMPLIANT
              </span>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                • Ethiopian Ministry of Revenues & POSE Pension Proclamations
              </span>
            </div>

            <h1 style={{ color: '#ffffff', fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.025em', margin: 0 }}>
              Human Capital Management & Workforce ERP
            </h1>

            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '6px', maxWidth: '820px', lineHeight: 1.45 }}>
              International-standard workforce operations for advertising and large-format signage manufacturing: End-to-end personnel lifecycles, 360° employee dossiers, progressive MoR income tax modeling, shopfloor operator job costing, biometric shift terminals, and talent acquisition.
            </p>
          </div>

          {/* Quick Action Buttons (Role Adaptive) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {roleView === 'employee' && (
              <>
                <button
                  className="btn-hr-black"
                  onClick={() => {
                    setClockEmpId(selectedEssEmp?.id || employees[0]?.id);
                    setClockPunchMode('in');
                    setClockSelfiePhoto(null);
                    setShowClockInModal(true);
                  }}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <Camera size={15} color="#facc15" />
                  <span>Punch Biometric Selfie</span>
                </button>
                <button
                  className="btn-hr-black"
                  onClick={() => {
                    setLeaveEmpId(selectedEssEmp?.id || employees[0]?.id);
                    setShowLeaveModal(true);
                  }}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <Calendar size={15} color="#facc15" />
                  <span>Request Time-Off</span>
                </button>
                <button
                  className="btn-hr-yellow"
                  onClick={() => setPreviewPayslipEmp(selectedEssEmp)}
                >
                  <Printer size={15} />
                  <span>View & Print Payslip</span>
                </button>
              </>
            )}

            {roleView === 'hr_manager' && (
              <>
                <button
                  className="btn-hr-black"
                  onClick={() => setShowSimulatorModal(true)}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                  title="Test Ethiopian income tax and net take-home salary increments"
                >
                  <Sliders size={15} color="#facc15" />
                  <span>Tax & Salary Simulator</span>
                </button>
                <button
                  className="btn-hr-black"
                  onClick={() => setShowAddEmployeeModal(true)}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <UserPlus size={15} color="#facc15" />
                  <span>+ Onboard Staff</span>
                </button>
                <button
                  className="btn-hr-black"
                  onClick={() => {
                    setClockPunchMode('in');
                    setClockSelfiePhoto(null);
                    setShowClockInModal(true);
                  }}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <Camera size={15} color="#facc15" />
                  <span>Punch Biometric</span>
                </button>
                <button
                  className="btn-hr-yellow"
                  onClick={() => setShowAllocateModal(true)}
                >
                  <DollarSign size={15} />
                  <span>Allocate Job Labor</span>
                </button>
              </>
            )}

            {roleView === 'admin' && (
              <>
                <button
                  className="btn-hr-black"
                  onClick={() => setShowSimulatorModal(true)}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <Sliders size={15} color="#facc15" />
                  <span>Simulate MoR Tax Brackets</span>
                </button>
                <button
                  className="btn-hr-black"
                  onClick={() => {
                    setClockPunchMode('in');
                    setClockSelfiePhoto(null);
                    setShowClockInModal(true);
                  }}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <Camera size={15} color="#facc15" />
                  <span>Audit Biometric Terminal</span>
                </button>
                <button
                  className="btn-hr-yellow"
                  onClick={() => {
                    setNotification('Monthly CBE-BULK wire batch verified against Federal MoR Proclamation 979!');
                    setTimeout(() => setNotification(null), 3000);
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>Verify Payroll Batch</span>
                </button>
              </>
            )}

            {roleView === 'super_admin' && (
              <>
                <button
                  className="btn-hr-black"
                  onClick={handleTogglePayrollFreeze}
                  style={{
                    background: isPayrollFrozen ? '#e11d48' : '#18181b',
                    border: isPayrollFrozen ? '1px solid #e11d48' : '1px solid #3f3f46',
                    color: isPayrollFrozen ? '#ffffff' : '#facc15',
                  }}
                >
                  <Lock size={15} />
                  <span>{isPayrollFrozen ? '🚨 Unlock Payroll' : 'Freeze Payroll Disbursal'}</span>
                </button>
                <button
                  className="btn-hr-black"
                  onClick={handleExportAuditCsv}
                  style={{ background: '#18181b', border: '1px solid #3f3f46' }}
                >
                  <Download size={15} color="#facc15" />
                  <span>Export CSV Audit</span>
                </button>
                <button
                  className="btn-hr-yellow"
                  onClick={handleExportAuditJson}
                >
                  <FileText size={15} />
                  <span>Export JSON Audit</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Real-Time Live Workforce Ticker Bar */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.75rem',
            color: '#a1a1aa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span>Biometric Terminals: <strong style={{ color: '#ffffff' }}>2 Online (Bole Plant, Kazanchis)</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={13} color="#facc15" />
              <span>Operating Currency: <strong style={{ color: '#ffffff' }}>ETB (Ethiopian Birr) • 15% VAT</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} color="#facc15" />
              <span>Safety Compliance: <strong style={{ color: '#ffffff' }}>100% (0 Lost Time Incidents)</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={13} color="#22c55e" />
              <span>Annual Retention Rate: <strong style={{ color: '#22c55e' }}>100%</strong></span>
            </div>
          </div>

          <div style={{ color: '#facc15', fontWeight: 600 }}>
            Active Fiscal Year: 2026/27 Q2
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #facc15',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 6px 20px rgba(234, 179, 8, 0.25)',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#09090b',
            }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>System Notification</div>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>{notification}</div>
          </div>
        </div>
      )}

      {/* Emergency Payroll Freeze Alert Banner */}
      {isPayrollFrozen && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(225, 29, 72, 0.12) 0%, rgba(225, 29, 72, 0.04) 100%)',
            border: '2px solid #e11d48',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 6px 20px rgba(225, 29, 72, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 900, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>PAYROLL DISBURSEMENT FROZEN FOR STATUTORY AUDIT</span>
                <span style={{ fontSize: '0.7rem', background: '#e11d48', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Restricted
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Super Admin has temporarily frozen all bank batch wire disbursements (CBE-BULK-202610-8812) for regulatory tax auditing and internal wage compliance.
              </div>
            </div>
          </div>

          {roleView === 'super_admin' && (
            <button
              onClick={handleTogglePayrollFreeze}
              style={{
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
              }}
            >
              <Lock size={14} />
              <span>Unlock Payroll Now</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          2. ENTERPRISE KPI HIGHLIGHT CARDS
          (White Surface, Crisp Dark Typography, Yellow Accent Marks)
          ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="hr-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
              Active Personnel
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#facc15" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#09090b', margin: '8px 0 4px' }}>
            {employees.length} Staff
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>● 100% Active Duty</span>
            <span style={{ color: '#64748b' }}>4 Male • 2 Female</span>
          </div>
        </div>

        <div className="hr-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
              Monthly Gross Payroll
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={16} color="#facc15" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#09090b', margin: '8px 0 4px' }}>
            {formatETB(totalGrossSalaries)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Base Salaries + {formatETB(totalOvertimeExpenditure)} Overtime
          </div>
        </div>

        <div className="hr-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
              Net Banking Disbursement
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} color="#facc15" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', margin: '8px 0 4px' }}>
            {formatETB(totalNetPay)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Disbursed to CBE, Awash & Dashen
          </div>
        </div>

        <div className="hr-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
              Statutory MoR & Pension
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="#facc15" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', margin: '8px 0 4px' }}>
            {formatETB(totalTaxWithheld + totalPension7 + totalPension11)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Tax: {formatETB(totalTaxWithheld)} • Pension: {formatETB(totalPension7 + totalPension11)}
          </div>
        </div>

        <div className="hr-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
              Shift Punctuality Rate
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#facc15" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#09090b', margin: '8px 0 4px' }}>
            94.2%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            5 On-Time • 1 Late • {pendingLeaves.length} Queued Leaves
          </div>
        </div>
      </div>

      {/* ========================================================
          3. INTERNATIONAL NAVIGATION TABS BAR
          (Deep Black Bar with High-Contrast Yellow Active State)
          ======================================================== */}
      {(roleView === 'hr_manager' || (roleView === 'super_admin' && superAdminViewMode === 'operations')) && (
        <div
          style={{
            background: '#09090b',
            borderRadius: '12px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '24px',
            overflowX: 'auto',
            border: '1px solid #27272a',
          }}
        >
          {[
            { key: 'overview', label: 'Executive Graphical Command Center', icon: BarChart3 },
            { key: 'payroll', label: 'Payroll & Labor Hub', icon: FileSpreadsheet, badge: `${formatETB(totalGrossSalaries)}` },
            { key: 'allocation', label: 'Direct Labor Order Costing', icon: Clock, badge: `${workOrders.length} Orders` },
            { key: 'employees', label: '360° Personnel Directory', icon: Users, badge: `${employees.length} Dossiers` },
            { key: 'attendance', label: 'Attendance & Biometrics', icon: CalendarDays },
            { key: 'leaves', label: 'Leaves & Time-off', icon: Calendar, badge: pendingLeaves.length > 0 ? `${pendingLeaves.length} Pending` : undefined },
            { key: 'recruitment', label: 'ATS Recruitment Pipeline', icon: Briefcase, badge: `${candidates.length} Apps` },
            { key: 'performance', label: '9-Box Performance & OKRs', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  if (tab.key === 'allocation') {
                    setPayrollSubTab('labor_allocation');
                  }
                }}
              style={{
                background: isSelected ? '#facc15' : 'transparent',
                color: isSelected ? '#09090b' : '#a1a1aa',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 15px',
                fontSize: '0.825rem',
                fontWeight: isSelected ? 800 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} color={isSelected ? '#09090b' : '#71717a'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.675rem',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: isSelected ? '#09090b' : '#27272a',
                    color: isSelected ? '#facc15' : '#e4e4e7',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      )}

      {/* ========================================================
          MANAGER OPERATIONS HUB (TABS 1 TO 8)
          ======================================================== */}
      {(roleView === 'hr_manager' || (roleView === 'super_admin' && superAdminViewMode === 'operations')) && (
        <>
          {/* TAB 1: EXECUTIVE GRAPHICAL COMMAND CENTER */}
          {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            {/* Chart 1: Headcount & Department Distribution Donut */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#09090b', fontSize: '1.05rem', fontWeight: 800 }}>
                    Workforce Department Distribution
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Headcount allocation across manufacturing, engineering, and support units
                  </p>
                </div>
                <span className="badge badge-yellow">6 Full-Time Personnel</span>
              </div>

              {/* Graphic SVG Donut */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap', padding: '10px 0' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                    {/* Production 50% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="16"
                      strokeDasharray="119.38 238.76"
                      strokeDashoffset="0"
                    />
                    {/* Stores 16.6% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#09090b"
                      strokeWidth="16"
                      strokeDasharray="39.8 238.76"
                      strokeDashoffset="-119.38"
                    />
                    {/* Finance 16.6% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#ca8a04"
                      strokeWidth="16"
                      strokeDasharray="39.8 238.76"
                      strokeDashoffset="-159.18"
                    />
                    {/* Sales 16.6% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#71717a"
                      strokeWidth="16"
                      strokeDasharray="39.8 238.76"
                      strokeDashoffset="-198.98"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09090b' }}>
                      {employees.length}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                      FTE Staff
                    </div>
                  </div>
                </div>

                {/* Legend List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '190px' }}>
                  {departmentBreakdown.map((item) => (
                    <div key={item.dept} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }} />
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#334155' }}>
                          {item.dept}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#09090b' }}>{item.count}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={14} color="#facc15" />
                <span>Shopfloor manufacturing accounts for 50% of headcount, ensuring swift order execution.</span>
              </div>
            </div>

            {/* Chart 2: Monthly Payroll Composition Waterfall Stacked Bar */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#09090b', fontSize: '1.05rem', fontWeight: 800 }}>
                    Monthly Payroll Expenditure Composition
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Gross salary vs Statutory Income Tax vs 7% & 11% Pension breakdown
                  </p>
                </div>
                <span className="badge badge-yellow">October 2026 Run</span>
              </div>

              {/* Graphical Stacked Horizontal Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#09090b' }}>Gross Factory Salaries</span>
                    <span style={{ fontWeight: 800, color: '#09090b' }}>{formatETB(totalGrossSalaries)} (100%)</span>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#09090b', borderRadius: '6px' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#059669' }}>Net Employee Take-Home (Disbursed)</span>
                    <span style={{ fontWeight: 800, color: '#059669' }}>
                      {formatETB(totalNetPay)} ({Math.round((totalNetPay / totalGrossSalaries) * 100)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${(totalNetPay / totalGrossSalaries) * 100}%`, height: '100%', background: '#10b981', borderRadius: '6px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#ca8a04' }}>Statutory Income Tax Withheld (PAYE)</span>
                    <span style={{ fontWeight: 800, color: '#ca8a04' }}>
                      {formatETB(totalTaxWithheld)} ({Math.round((totalTaxWithheld / totalGrossSalaries) * 100)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${(totalTaxWithheld / totalGrossSalaries) * 100}%`, height: '100%', background: '#facc15', borderRadius: '6px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#475569' }}>Combined Pension Fund (7% Employee + 11% Employer)</span>
                    <span style={{ fontWeight: 800, color: '#475569' }}>
                      {formatETB(totalPension7 + totalPension11)} ({Math.round(((totalPension7 + totalPension11) / totalGrossSalaries) * 100)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${((totalPension7 + totalPension11) / totalGrossSalaries) * 100}%`, height: '100%', background: '#64748b', borderRadius: '6px' }} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Statutory Employer Liability (11% Pension): <strong>{formatETB(totalPension11)}</strong></span>
                <span style={{ color: '#09090b', fontWeight: 700 }}>MoR Tax Due Date: 30th of Month</span>
              </div>
            </div>
          {/* Integrated Highlight Card: Factory Payroll & Direct Labor Cost Center */}
          <div
            className="hr-card"
            style={{
              background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
              color: '#ffffff',
              border: '1px solid #27272a',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: '#facc15',
                      color: '#09090b',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    Core Manufacturing Engine
                  </span>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem', fontWeight: 800 }}>
                    Factory Payroll & Direct Labor Job-Costing Center
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#a1a1aa' }}>
                  Direct order labor absorption integrated with statutory Ethiopian MoR Proclamation 979/2016 progressive tax calculations and POSE 7% + 11% pension pool.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-hr-black"
                  onClick={() => {
                    setActiveTab('payroll');
                    setPayrollSubTab('payroll_tax');
                  }}
                  style={{ background: '#27272a', border: '1px solid #3f3f46' }}
                >
                  <FileSpreadsheet size={14} color="#facc15" />
                  <span>Run Payroll Ledger</span>
                </button>

                <button
                  className="btn-hr-yellow"
                  onClick={() => {
                    setActiveTab('payroll');
                    setPayrollSubTab('labor_allocation');
                  }}
                >
                  <Clock size={14} />
                  <span>Allocate Direct Labor</span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                padding: '16px',
                background: '#09090b',
                borderRadius: '10px',
                border: '1px solid #27272a',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Monthly Payroll
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '3px' }}>
                  {formatETB(totalGrossSalaries)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>
                  Base + {formatETB(totalOvertimeExpenditure)} OT
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 700 }}>
                  Direct Labor Absorbed
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#facc15', marginTop: '3px' }}>
                  {formatETB(totalDirectLaborCost)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '2px' }}>
                  Across {workOrders.length} customer work orders
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>
                  Net Disbursed Take-Home
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '3px' }}>
                  {formatETB(totalNetPay)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>
                  Via CBE & Awash batch wire
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>
                  POSE Pension (7% + 11%)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e2e8f0', marginTop: '3px' }}>
                  {formatETB(totalPension7 + totalPension11)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>
                  Agency: POSE Procl. 715/2011
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>
                  Labor Absorption Efficiency
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24', marginTop: '3px' }}>
                  94.2%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>
                  120 ETB/hr std shopfloor rate
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            {/* Chart 3: 7-Day Biometric Attendance Rate Bar Chart */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#09090b', fontSize: '1.05rem', fontWeight: 800 }}>
                    7-Day Attendance Rate & Shift History
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Daily punch-in percentages and overtime hours logged across workshop shifts
                  </p>
                </div>
                <span className="badge badge-yellow">Weekly Avg: 93%</span>
              </div>

              {/* Graphic SVG Bar Chart */}
              <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" />

                  {ATTENDANCE_WEEK_HISTORY.map((item, index) => {
                    const x = index * 70 + 25;
                    const barHeight = (item.presentPct / 100) * 110;
                    const y = 140 - barHeight;

                    return (
                      <g key={item.day}>
                        <rect x={x} y="30" width="36" height="110" rx="4" fill="#f8fafc" />
                        <rect
                          x={x}
                          y={y}
                          width="36"
                          height={barHeight}
                          rx="4"
                          fill={item.presentPct >= 90 ? '#09090b' : item.presentPct > 0 ? '#facc15' : '#e2e8f0'}
                        />
                        <text
                          x={x + 18}
                          y={y - 6}
                          textAnchor="middle"
                          fill="#09090b"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {item.presentPct}%
                        </text>
                        <text
                          x={x + 18}
                          y="158"
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {item.day}
                        </text>
                        <text
                          x={x + 18}
                          y="172"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9"
                        >
                          {item.overtimeHrs}h OT
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', background: '#09090b', borderRadius: '2px' }} />
                  <span style={{ color: '#475569' }}>Standard Daytime Shift (≥90%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', background: '#facc15', borderRadius: '2px' }} />
                  <span style={{ color: '#475569' }}>Weekend & Evening Overtime Shift</span>
                </div>
              </div>
            </div>

            {/* Chart 4: Recruitment & Sourcing Pipeline Funnel */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#09090b', fontSize: '1.05rem', fontWeight: 800 }}>
                    Talent Acquisition Pipeline Funnel
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Active applicant progression across CNC, printing & sales requisitions
                  </p>
                </div>
                <span className="badge badge-yellow">{candidates.length} Applicants</span>
              </div>

              {/* Graphic Funnel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 0' }}>
                {[
                  { stage: 'Sourced Candidates', count: 48, widthPct: 100, color: '#09090b' },
                  { stage: 'Screened & Tested', count: 24, widthPct: 75, color: '#18181b' },
                  { stage: 'Technical Interview', count: 8, widthPct: 50, color: '#ca8a04' },
                  { stage: 'Job Offer Dispatched', count: 2, widthPct: 30, color: '#facc15', textColor: '#09090b' },
                  { stage: 'Hired & Onboarded', count: 1, widthPct: 18, color: '#10b981' },
                ].map((funnel) => (
                  <div key={funnel.stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{funnel.stage}</span>
                      <strong style={{ color: '#09090b' }}>{funnel.count} candidates</strong>
                    </div>
                    <div style={{ width: '100%', height: '18px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${funnel.widthPct}%`,
                          height: '100%',
                          background: funnel.color,
                          borderRadius: '6px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Top Priority: <strong>Senior CNC Router Specialist</strong> (2 openings)
                </span>
                <button
                  className="btn-hr-black"
                  style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                  onClick={() => setActiveTab('recruitment')}
                >
                  <span>View Pipeline</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================
          TAB 2: FACTORY PAYROLL & LABOR HUB
          ======================================================== */}
      {activeTab === 'payroll' && (
        <div className="hr-card">
          {/* Sub-Tabs Navigation for Payroll & Labor */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px',
              background: '#f1f5f9',
              borderRadius: '10px',
              marginBottom: '24px',
              width: 'fit-content',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setPayrollSubTab('payroll_tax')}
              style={{
                background: payrollSubTab === 'payroll_tax' ? '#09090b' : 'transparent',
                color: payrollSubTab === 'payroll_tax' ? '#facc15' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: payrollSubTab === 'payroll_tax' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <FileSpreadsheet size={15} />
              <span>Factory Payroll & MoR Tax Run</span>
            </button>

            <button
              onClick={() => setPayrollSubTab('labor_allocation')}
              style={{
                background: payrollSubTab === 'labor_allocation' ? '#09090b' : 'transparent',
                color: payrollSubTab === 'labor_allocation' ? '#facc15' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: payrollSubTab === 'labor_allocation' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock size={15} />
              <span>Direct Labor Job-Costing ({workOrders.length} Orders)</span>
            </button>

            <button
              onClick={() => setPayrollSubTab('labor_analytics')}
              style={{
                background: payrollSubTab === 'labor_analytics' ? '#09090b' : 'transparent',
                color: payrollSubTab === 'labor_analytics' ? '#facc15' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: payrollSubTab === 'labor_analytics' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <BarChart3 size={15} />
              <span>Labor Absorption & Overtime Analytics</span>
            </button>
          </div>

          {/* Sub-View 1: Factory Payroll & MoR Tax Run */}
          {payrollSubTab === 'payroll_tax' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                      Factory Payroll & Ethiopian Statutory Tax Ledger
                    </h3>
                    <span className="badge badge-yellow">MoR Proclamation 979/2016 Compliant</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Progressive Ethiopian Personal Income Tax schedule (0% up to 600 ETB, scaling to 35% above 10,900 ETB) and 7% + 11% POSE Pension fund.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    className="btn-hr-black"
                    onClick={() => setShowSimulatorModal(true)}
                  >
                    <Sliders size={14} color="#facc15" />
                    <span>Simulate Tax / Increments</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Period:</span>
                    <input
                      type="month"
                      className="hr-input"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '0.825rem' }}
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn-hr-yellow"
                    onClick={() => setNotification(`Banking wire batch formatted and queued for CBE & Awash upload for ${selectedMonth}!`)}
                  >
                    <Send size={14} />
                    <span>Process Bank Batch</span>
                  </button>
                </div>
              </div>

              {/* Statutory Tax Summary Bar */}
              <div
                style={{
                  background: '#09090b',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Gross Salaries
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    {formatETB(totalGrossSalaries)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 700 }}>
                    Net Disbursed Take-Home
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#facc15', marginTop: '2px' }}>
                    {formatETB(totalNetPay)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>
                    Employee Pension (7%)
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', marginTop: '2px' }}>
                    {formatETB(totalPension7)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>
                    Employer Pension (11%)
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', marginTop: '2px' }}>
                    {formatETB(totalPension11)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>
                    Income Tax (PAYE)
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                    {formatETB(totalTaxWithheld)}
                  </div>
                </div>
              </div>

              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Employee & Role</th>
                      <th>Department</th>
                      <th>Base Salary</th>
                      <th>Allowances</th>
                      <th>Overtime Pay</th>
                      <th>Gross Pay</th>
                      <th>Pension (7%)</th>
                      <th>Income Tax</th>
                      <th>Net Take-Home</th>
                      <th>Bank & Account</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map(
                      ({ emp, overtimeHours, overtimePay, grossPay, pension7Pct, incomeTax, netPay }) => (
                        <tr key={emp.id}>
                          <td>
                            <strong style={{ color: '#09090b', fontSize: '0.9rem' }}>{emp.name}</strong>
                            <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                              {emp.employeeId} • {emp.position}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                emp.department === 'production'
                                  ? 'badge-yellow'
                                  : emp.department === 'finance'
                                  ? 'badge-gray'
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
                                <span style={{ color: '#09090b', fontWeight: 700 }}>
                                  {formatETB(overtimePay)}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                  {overtimeHours} hrs @ 1.5x
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: '#09090b' }}>{formatETB(grossPay)}</strong>
                          </td>
                          <td style={{ color: '#475569', fontWeight: 600 }}>{formatETB(pension7Pct)}</td>
                          <td style={{ color: '#ca8a04', fontWeight: 700 }}>{formatETB(incomeTax)}</td>
                          <td>
                            <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                              {formatETB(netPay)}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#09090b' }}>{emp.bankName}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{emp.bankAccount}</div>
                          </td>
                          <td>
                            <button
                              className="btn-hr-black"
                              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                              onClick={() => setPreviewPayslipEmp(emp)}
                            >
                              <Printer size={13} color="#facc15" />
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

          {/* Sub-View 2: Direct Labor Job-Costing */}
          {payrollSubTab === 'labor_allocation' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                      Direct Shopfloor Labor Cost Allocation Engine
                    </h3>
                    <span className="badge badge-yellow">Order Level Job Costing</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Links workshop machine operators directly to customer client orders, feeding actual labor expenditure into gross margin calculations.
                  </p>
                </div>

                <button className="btn-hr-yellow" onClick={() => setShowAllocateModal(true)}>
                  <Clock size={15} />
                  <span>+ Log & Allocate Labor Hours</span>
                </button>
              </div>

              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Work Order & Product</th>
                      <th>Customer / Client</th>
                      <th>Assigned Workshop Operators</th>
                      <th>Direct Labor Hours</th>
                      <th>Hourly Rate</th>
                      <th>Total Allocated Direct Labor</th>
                      <th>Order Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map((wo) => {
                      const numOps = Math.max(1, wo.operatorNames.length);
                      const directLaborCost = wo.machineHours * 120 * numOps;

                      return (
                        <tr key={wo.id}>
                          <td>
                            <strong style={{ color: '#09090b' }}>{wo.workOrderNumber}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {wo.productDescription}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#09090b' }}>{wo.customerName}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {wo.operatorNames.map((name, i) => (
                                <span
                                  key={i}
                                  style={{
                                    background: '#09090b',
                                    color: '#facc15',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.725rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.9rem', color: '#09090b' }}>
                              {wo.machineHours} hrs
                            </strong>
                          </td>
                          <td style={{ color: '#64748b' }}>120 ETB/hr/op</td>
                          <td>
                            <strong style={{ color: '#09090b', fontSize: '0.95rem' }}>
                              {formatETB(directLaborCost)}
                            </strong>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                wo.status === 'completed'
                                  ? 'badge-emerald'
                                  : wo.status === 'in_progress'
                                  ? 'badge-yellow'
                                  : 'badge-gray'
                              }`}
                            >
                              {wo.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-hr-black"
                              style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                              onClick={() => {
                                setAllocWoId(wo.id);
                                setShowAllocateModal(true);
                              }}
                            >
                              <span>+ Add Hours</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-View 3: Labor Absorption & Overtime Analytics */}
          {payrollSubTab === 'labor_analytics' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                      Labor Cost Absorption & Productivity Analytics
                    </h3>
                    <span className="badge badge-yellow">Order Margin Integration</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Evaluating direct shopfloor labor capitalized into customer work orders vs indirect administrative overhead wages.
                  </p>
                </div>

                <button
                  className="btn-hr-yellow"
                  onClick={() => setPayrollSubTab('labor_allocation')}
                >
                  <Clock size={15} />
                  <span>View Work Order Allocations</span>
                </button>
              </div>

              {/* KPI Cards Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                    Direct Labor Absorbed
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#facc15', margin: '4px 0 2px' }}>
                    {formatETB(totalDirectLaborCost)}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a1a1aa' }}>
                    Capitalized directly into 3 active client orders
                  </div>
                </div>

                <div
                  style={{
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                    Indirect Labor / Overhead
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 2px' }}>
                    {formatETB(totalGrossSalaries - totalDirectLaborCost)}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a1a1aa' }}>
                    Stores, Sales, Finance & Admin period cost
                  </div>
                </div>

                <div
                  style={{
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                    Machine Labor Hours
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0 2px' }}>
                    {totalMachineHours} hrs
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a1a1aa' }}>
                    CNC routing, UV printing & laser stations
                  </div>
                </div>

                <div
                  style={{
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                    Plant Overtime Expenditure
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', margin: '4px 0 2px' }}>
                    {formatETB(totalOvertimeExpenditure)}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a1a1aa' }}>
                    86 total OT hours logged this month
                  </div>
                </div>
              </div>

              {/* Absorption Visualization Bar */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>
                    Workforce Cost Distribution (Direct vs Indirect Period Expense)
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                    Total Payroll: {formatETB(totalGrossSalaries)}
                  </span>
                </div>

                <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${Math.round((totalDirectLaborCost / totalGrossSalaries) * 100)}%`,
                      height: '100%',
                      background: '#facc15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#09090b',
                    }}
                    title="Direct Labor Absorbed"
                  >
                    Direct Labor ({Math.round((totalDirectLaborCost / totalGrossSalaries) * 100)}%)
                  </div>
                  <div
                    style={{
                      width: `${100 - Math.round((totalDirectLaborCost / totalGrossSalaries) * 100)}%`,
                      height: '100%',
                      background: '#09090b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#ffffff',
                    }}
                    title="Indirect Overhead"
                  >
                    Indirect & Admin ({100 - Math.round((totalDirectLaborCost / totalGrossSalaries) * 100)}%)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#facc15' }} />
                    <span>Direct Productive Labor ({formatETB(totalDirectLaborCost)})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#09090b' }} />
                    <span>Indirect Operating Overhead ({formatETB(totalGrossSalaries - totalDirectLaborCost)})</span>
                  </div>
                </div>
              </div>

              {/* Departmental Labor Efficiency Table */}
              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Department / Unit</th>
                      <th>Personnel Count</th>
                      <th>Standard Rate</th>
                      <th>Regular Hours</th>
                      <th>Overtime Hours</th>
                      <th>Direct Labor Absorbed</th>
                      <th>Absorption Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { dept: 'Production & Shopfloor', staff: 3, rate: '120 ETB/hr', reg: 480, ot: 36, absorbed: totalDirectLaborCost, eff: '96.4%' },
                      { dept: 'Stores & Stock Logistics', staff: 1, rate: '95 ETB/hr', reg: 160, ot: 8, absorbed: 0, eff: '89.0%' },
                      { dept: 'Commercial Sales & Survey', staff: 1, rate: '110 ETB/hr', reg: 160, ot: 4, absorbed: 0, eff: '94.0%' },
                      { dept: 'Finance, Billing & Tax', staff: 1, rate: '135 ETB/hr', reg: 160, ot: 6, absorbed: 0, eff: '98.5%' },
                    ].map((row) => (
                      <tr key={row.dept}>
                        <td><strong style={{ color: '#09090b' }}>{row.dept}</strong></td>
                        <td>{row.staff} Staff</td>
                        <td>{row.rate}</td>
                        <td>{row.reg} hrs</td>
                        <td>
                          {row.ot > 0 ? (
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>{row.ot} hrs OT</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <strong style={{ color: row.absorbed > 0 ? '#059669' : '#94a3b8' }}>
                            {row.absorbed > 0 ? formatETB(row.absorbed) : 'Indirect Overhead'}
                          </strong>
                        </td>
                        <td>
                          <span className="badge badge-yellow">{row.eff}</span>
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

      {/* ========================================================
          TAB 3: DIRECT LABOR WORK ORDER JOB-COST ALLOCATION
          ======================================================== */}
      {activeTab === 'allocation' && (
        <div className="hr-card">
          {/* Sub-Tabs Navigation for Payroll & Labor */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px',
              background: '#f1f5f9',
              borderRadius: '10px',
              marginBottom: '24px',
              width: 'fit-content',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('payroll');
                setPayrollSubTab('payroll_tax');
              }}
              style={{
                background: 'transparent',
                color: '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileSpreadsheet size={15} />
              <span>Factory Payroll & MoR Tax Run</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('payroll');
                setPayrollSubTab('labor_allocation');
              }}
              style={{
                background: '#09090b',
                color: '#facc15',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={15} />
              <span>Direct Labor Job-Costing ({workOrders.length} Orders)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('payroll');
                setPayrollSubTab('labor_analytics');
              }}
              style={{
                background: 'transparent',
                color: '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BarChart3 size={15} />
              <span>Labor Absorption & Overtime Analytics</span>
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                  Direct Shopfloor Labor Cost Allocation Engine
                </h3>
                <span className="badge badge-yellow">Order Level Job Costing</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Links workshop machine operators directly to customer client orders, feeding actual labor expenditure into gross margin calculations.
              </p>
            </div>

            <button className="btn-hr-yellow" onClick={() => setShowAllocateModal(true)}>
              <Clock size={15} />
              <span>+ Log & Allocate Labor Hours</span>
            </button>
          </div>

          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Work Order & Product</th>
                  <th>Customer / Client</th>
                  <th>Assigned Workshop Operators</th>
                  <th>Direct Labor Hours</th>
                  <th>Hourly Rate</th>
                  <th>Total Allocated Direct Labor</th>
                  <th>Order Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo) => {
                  const numOps = Math.max(1, wo.operatorNames.length);
                  const directLaborCost = wo.machineHours * 120 * numOps;

                  return (
                    <tr key={wo.id}>
                      <td>
                        <strong style={{ color: '#09090b' }}>{wo.workOrderNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {wo.productDescription}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#09090b' }}>{wo.customerName}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {wo.operatorNames.map((name, i) => (
                            <span
                              key={i}
                              style={{
                                background: '#09090b',
                                color: '#facc15',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.725rem',
                                fontWeight: 600,
                              }}
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.9rem', color: '#09090b' }}>
                          {wo.machineHours} hrs
                        </strong>
                      </td>
                      <td style={{ color: '#64748b' }}>120 ETB/hr/op</td>
                      <td>
                        <strong style={{ color: '#09090b', fontSize: '0.95rem' }}>
                          {formatETB(directLaborCost)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            wo.status === 'completed'
                              ? 'badge-emerald'
                              : wo.status === 'in_progress'
                              ? 'badge-yellow'
                              : 'badge-gray'
                          }`}
                        >
                          {wo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-hr-black"
                          style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                          onClick={() => {
                            setAllocWoId(wo.id);
                            setShowAllocateModal(true);
                          }}
                        >
                          <span>+ Add Hours</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: 360° PERSONNEL DIRECTORY & PROFILES
          ======================================================== */}
      {activeTab === 'employees' && (
        <div className="hr-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                Manufacturing Personnel & 360° Staff Profiles
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Complete records with Ethiopian TIN, Pension numbers, CBE bank accounts, Band levels, and 9-box performance rating.
              </p>
            </div>

            <button className="btn-hr-yellow" onClick={() => setShowAddEmployeeModal(true)}>
              <UserPlus size={15} />
              <span>+ Onboard Staff Member</span>
            </button>
          </div>

          {/* Search & Department Filters */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              marginBottom: '18px',
              flexWrap: 'wrap',
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
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder="Search staff name, ID or role..."
                className="hr-input"
                style={{ paddingLeft: '36px' }}
                value={searchEmployeeQuery}
                onChange={(e) => setSearchEmployeeQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Department:</span>
              <select
                className="hr-select"
                style={{ width: 'auto' }}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments ({employees.length})</option>
                <option value="production">Production Floor</option>
                <option value="stores">Inventory & Stores</option>
                <option value="sales">Commercial Sales</option>
                <option value="finance">Finance & Accounts</option>
                <option value="admin">Administration</option>
              </select>
            </div>
          </div>

          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee ID & Full Name</th>
                  <th>Designation / Title</th>
                  <th>Department</th>
                  <th>Band / Grade Level</th>
                  <th>Base Monthly Salary</th>
                  <th>Hourly Rate</th>
                  <th>Performance</th>
                  <th>Bank Account</th>
                  <th>360° Dossier</th>
                  <th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const detail = DETAILED_EMPLOYEES_MAP[emp.id];

                  return (
                    <tr key={emp.id}>
                      <td>
                        <strong style={{ color: '#09090b', fontSize: '0.9rem' }}>{emp.name}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{emp.employeeId}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{emp.position}</td>
                      <td>
                        <span className="badge badge-yellow">{emp.department}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#09090b' }}>
                          {detail?.bandLevel || 'Band L2 Specialist'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#09090b' }}>{formatETB(emp.baseSalary)}</strong>
                      </td>
                      <td style={{ color: '#09090b', fontWeight: 600 }}>{formatETB(emp.hourlyRate)}/hr</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 800, color: '#09090b' }}>
                            ★ {detail?.performanceRating || 4.7}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                            ({detail?.kpiScorePct || 94}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#09090b' }}>{emp.bankName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>A/C: {emp.bankAccount}</div>
                      </td>
                      <td>
                        <button
                          className="btn-hr-black"
                          style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                          onClick={() => setViewEmployee360(emp)}
                        >
                          <Info size={12} color="#facc15" />
                          <span>360° View</span>
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-hr-outline"
                          style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                          onClick={() => setPreviewPayslipEmp(emp)}
                        >
                          <Printer size={12} />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: ATTENDANCE & BIOMETRIC SHIFTS TRACKING
          ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="hr-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                  Biometric Terminal Attendance & Shift Management
                </h3>
                <span className="badge badge-yellow">Biometric ZKTeco Synced</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Factory workshop punch monitoring with overtime tracking, shift punctuality records, and anomaly logs.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="date"
                className="hr-input"
                style={{ width: 'auto', padding: '6px 12px' }}
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
              <button
                className="btn-hr-yellow"
                onClick={() => {
                  setClockPunchMode('in');
                  setClockSelfiePhoto(null);
                  setShowClockInModal(true);
                }}
              >
                <Camera size={15} />
                <span>+ Punch Biometric Log</span>
              </button>
            </div>
          </div>

          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee & Role</th>
                  <th>Shift Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Facial Biometric Verification</th>
                  <th>Status</th>
                  <th>Overtime Hours</th>
                  <th>Supervisor Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((att) => (
                  <tr key={att.id}>
                    <td>
                      <strong style={{ color: '#09090b' }}>{att.employeeName}</strong>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        {att.department.toUpperCase()}
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{att.date}</td>
                    <td>
                      <strong style={{ color: '#09090b' }}>{att.checkIn}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>{att.checkOut || 'Active'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {att.checkInPhoto && (
                          <div
                            onClick={() => setSelectedAuditRecord(att)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                            title="Click to inspect Check-In selfie & biometric liveness"
                          >
                            <img
                              src={att.checkInPhoto}
                              alt="Check In Selfie"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '2px solid #22c55e',
                                background: '#18181b',
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                background: '#22c55e',
                                color: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '8px',
                                fontWeight: 900,
                                padding: '1px 3px',
                                lineHeight: 1,
                              }}
                            >
                              IN
                            </span>
                          </div>
                        )}
                        {att.checkOutPhoto && (
                          <div
                            onClick={() => setSelectedAuditRecord(att)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                            title="Click to inspect Check-Out selfie & biometric liveness"
                          >
                            <img
                              src={att.checkOutPhoto}
                              alt="Check Out Selfie"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '2px solid #0d9488',
                                background: '#18181b',
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                background: '#0d9488',
                                color: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '8px',
                                fontWeight: 900,
                                padding: '1px 3px',
                                lineHeight: 1,
                              }}
                            >
                              OUT
                            </span>
                          </div>
                        )}
                        <div>
                          <div
                            onClick={() => setSelectedAuditRecord(att)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            <ShieldCheck size={11} color="#16a34a" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a' }}>
                              99.4% Match
                            </span>
                          </div>
                          <div style={{ fontSize: '0.675rem', color: '#64748b', marginTop: '2px' }}>
                            {att.terminalLocation || 'Bole Plant Gate #2'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          att.status === 'present'
                            ? 'badge-emerald'
                            : att.status === 'late'
                            ? 'badge-yellow'
                            : 'badge-rose'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td>
                      {att.overtimeHours > 0 ? (
                        <span style={{ color: '#ca8a04', fontWeight: 700 }}>
                          +{att.overtimeHours} hrs (1.5x)
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>0.0 hrs</span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{att.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: LEAVE & ABSENCE MANAGEMENT
          ======================================================== */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="hr-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b' }}>
                    Leave Requests & Statutory Entitlement Management
                  </h3>
                  <span className="badge badge-yellow">
                    {pendingLeaves.length} Action Required
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Complies with Ethiopian Labor Proclamation No. 1156/2019: 16 working days annual leave + 1 day for every 2 additional service years.
                </p>
              </div>

              <button className="btn-hr-yellow" onClick={() => setShowLeaveModal(true)}>
                <Calendar size={15} />
                <span>+ Submit Leave Application</span>
              </button>
            </div>

            {/* Leave Balance Meters Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
                marginBottom: '24px',
              }}
            >
              {employees.slice(0, 3).map((emp, i) => {
                const usedDays = [3, 2, 5][i];
                const totalDays = 16;
                const rem = totalDays - usedDays;
                const pct = Math.round((rem / totalDays) * 100);

                return (
                  <div
                    key={emp.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <strong style={{ color: '#09090b' }}>{emp.name}</strong>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{emp.department}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', margin: '6px 0 4px', color: '#64748b' }}>
                      <span>Remaining Balance</span>
                      <strong style={{ color: '#09090b' }}>{rem} / {totalDays} days left</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: '#facc15',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hr-table-container">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Applicant & Department</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason / Justification</th>
                    <th>Status</th>
                    <th>Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong style={{ color: '#09090b' }}>{req.employeeName}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                          {req.department.toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-yellow">{req.leaveType}</span>
                      </td>
                      <td style={{ color: '#09090b', fontWeight: 600 }}>{req.startDate}</td>
                      <td style={{ color: '#09090b', fontWeight: 600 }}>{req.endDate}</td>
                      <td>
                        <strong>{req.daysCount} days</strong>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.8rem', maxWidth: '280px' }}>
                        {req.reason}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            req.status === 'approved'
                              ? 'badge-emerald'
                              : req.status === 'pending'
                              ? 'badge-yellow'
                              : 'badge-rose'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-hr-black"
                              style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                              onClick={() => handleUpdateLeaveStatus(req.id, 'approved')}
                            >
                              <Check size={12} color="#facc15" />
                              <span>Approve</span>
                            </button>
                            <button
                              className="btn-hr-outline"
                              style={{ padding: '4px 8px', fontSize: '0.725rem', color: '#e11d48' }}
                              onClick={() => handleUpdateLeaveStatus(req.id, 'rejected')}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Signed by {req.approvedBy || 'HR Director'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: RECRUITMENT, JOB POSTINGS & INTERVIEW SCHEDULING
          ======================================================== */}
      {activeTab === 'recruitment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Job Openings / Vacancies */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color="#ca8a04" />
                  <span>Factory Job Requisitions & Vacancies</span>
                  <span className="badge badge-yellow">{jobOpenings.length} Active Posts</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Standardized recruitment specifications for high-precision CNC machinists, UV print operators, and corporate signage engineers.
                </p>
              </div>

              <button
                className="btn-hr-yellow"
                onClick={() => setShowCreateJobModal(true)}
              >
                <PlusCircle size={15} />
                <span>+ Create Job Posting</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {jobOpenings.map((job) => (
                <div
                  key={job.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-yellow">{job.department.toUpperCase()}</span>
                        {job.urgency === 'urgent' && (
                          <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            🔥 URGENT
                          </span>
                        )}
                        {job.urgency === 'high' && (
                          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            ⚡ HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Due: {job.deadline}</span>
                    </div>

                    <h4 style={{ margin: '4px 0 6px', fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>
                      {job.title}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} color="#f59e0b" />
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.experienceLevel}</span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: '#475569', lineHeight: 1.45, margin: '0 0 12px' }}>
                      {job.description}
                    </p>

                    {job.skillsKeywords && job.skillsKeywords.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                        {job.skillsKeywords.slice(0, 4).map((sk, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              color: '#334155',
                              padding: '2px 6px',
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Salary Range
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#09090b' }}>{job.salaryRange}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#09090b',
                          color: '#facc15',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                        }}
                      >
                        {job.applicantsCount} Applicants
                      </span>

                      <button
                        className="btn-hr-outline"
                        style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                        onClick={() => setSelectedJobDetail(job)}
                        title="View Full Job Requisition & Requirements"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Interviews & Shopfloor Machine Tests */}
          <div className="hr-card" style={{ background: '#fafafa', border: '1px solid #e4e4e7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#eab308" />
                  <span>Scheduled Candidate Interviews & Shopfloor Tests</span>
                  <span className="badge badge-emerald">{interviews.length} Booked</span>
                </h3>
                <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                  Practical machine cutting assessments, engineering portfolio reviews, and executive boardroom panels.
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px' }}>
                ● Auto-synced with Plant Supervisor Shifts
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              {interviews.map((iv) => (
                <div
                  key={iv.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <strong style={{ color: '#09090b', fontSize: '0.95rem' }}>{iv.candidateName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{iv.jobTitle}</div>
                    </div>
                    <span
                      className={`badge ${
                        iv.interviewType === 'practical_shopfloor_test'
                          ? 'badge-yellow'
                          : iv.interviewType === 'technical_face_to_face'
                          ? 'badge-emerald'
                          : 'badge-gray'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {iv.interviewType === 'practical_shopfloor_test'
                        ? '🛠 Shopfloor Practical Test'
                        : iv.interviewType === 'technical_face_to_face'
                        ? '📐 Technical Face-to-Face'
                        : '📞 HR Screening'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', marginTop: '8px', color: '#334155' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Date & Time: </span>
                      <strong>{iv.date} @ {iv.time}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Duration: </span>
                      <strong>{iv.durationMinutes} mins</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: '#475569', marginTop: '6px' }}>
                    <span style={{ color: '#64748b' }}>Location: </span>
                    <span style={{ color: '#09090b', fontWeight: 600 }}>{iv.locationOrLink}</span>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: '#475569', marginTop: '4px' }}>
                    <span style={{ color: '#64748b' }}>Interviewers: </span>
                    <span style={{ color: '#09090b', fontWeight: 600 }}>{iv.interviewers.join(', ')}</span>
                  </div>

                  {iv.evaluationNotes && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', marginTop: '8px', fontStyle: 'italic' }}>
                      "{iv.evaluationNotes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Tracking Table & Pipeline Progression */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#09090b' }}>
                  Applicant Tracking (ATS) & Pipeline Progression
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Track applications, schedule practical tests, review dossiers, and 1-click onboard approved talent directly into payroll & contract systems.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Stage Filter:</span>
                <select
                  className="hr-select"
                  style={{ width: 'auto' }}
                  value={candidateFilterStage}
                  onChange={(e) => setCandidateFilterStage(e.target.value)}
                >
                  <option value="all">All Stages ({candidates.length})</option>
                  <option value="sourcing">Sourcing</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer Extended</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            <div className="hr-table-container">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Applicant Details</th>
                    <th>Applying Role</th>
                    <th>Experience & Education</th>
                    <th>Expected Salary</th>
                    <th>Pipeline Stage</th>
                    <th>Interview Status / Notes</th>
                    <th>ATS Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.id}>
                      <td>
                        <strong
                          style={{ color: '#09090b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => setSelectedCandidateDossier(cand)}
                          title="Click to view candidate dossier"
                        >
                          <span>{cand.fullName}</span>
                          <ExternalLink size={12} color="#f59e0b" />
                        </strong>
                        <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                          {cand.phone} • {cand.email}
                        </div>
                        {cand.currentEmployer && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Prior: {cand.currentEmployer}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>
                        <div>{cand.jobTitle}</div>
                        {cand.skills && cand.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {cand.skills.slice(0, 2).map((s, idx) => (
                              <span key={idx} style={{ background: '#f1f5f9', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', color: '#475569' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#09090b', fontSize: '0.8rem' }}>{cand.experienceYears} yrs exp</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{cand.educationLevel || 'Vocational Certified'}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#09090b' }}>{formatETB(cand.expectedSalary)}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Expected Gross</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            cand.stage === 'offer' || cand.stage === 'hired'
                              ? 'badge-emerald'
                              : cand.stage === 'interview'
                              ? 'badge-yellow'
                              : 'badge-gray'
                          }`}
                          style={{ textTransform: 'uppercase', fontSize: '0.725rem', fontWeight: 800 }}
                        >
                          {cand.stage}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.775rem', color: '#475569', maxWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#eab308' }}>
                          <span>★ {cand.rating}/5 Rating</span>
                          {cand.interviewStatus && (
                            <span style={{ fontSize: '0.7rem', color: '#16a34a', background: '#f0fdf4', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              {cand.interviewStatus}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                          {cand.interviewDate ? `📅 ${cand.interviewDate}` : cand.notes}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Arrange Interview Action */}
                          <button
                            className="btn-hr-black"
                            style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                            onClick={() => {
                              setSelectedCandidateForInterview(cand);
                              setShowArrangeInterviewModal(true);
                            }}
                            title="Schedule In-Person or Workshop Interview"
                          >
                            <Calendar size={12} color="#facc15" />
                            <span>Arrange Interview</span>
                          </button>

                          {/* Dossier inspect */}
                          <button
                            className="btn-hr-outline"
                            style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                            onClick={() => setSelectedCandidateDossier(cand)}
                            title="Inspect Full Applicant Dossier"
                          >
                            <FileText size={12} />
                            <span>Dossier</span>
                          </button>

                          {/* Stage Transition */}
                          {cand.stage === 'screening' && (
                            <button
                              className="btn-hr-yellow"
                              style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                              onClick={() => handleAdvanceCandidate(cand.id, 'interview')}
                            >
                              <span>Pass Screen</span>
                            </button>
                          )}
                          {cand.stage === 'interview' && (
                            <button
                              className="btn-hr-yellow"
                              style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                              onClick={() => handleAdvanceCandidate(cand.id, 'offer')}
                            >
                              <span>Dispatch Offer</span>
                            </button>
                          )}
                          {cand.stage === 'offer' && (
                            <button
                              className="btn-hr-black"
                              style={{ padding: '4px 8px', fontSize: '0.725rem', background: '#059669', borderColor: '#059669', color: '#ffffff' }}
                              onClick={() => handleOneClickHireCandidate(cand)}
                              title="Convert candidate and pre-fill detailed onboarding form"
                            >
                              <UserPlus size={12} color="#ffffff" />
                              <span>Hire & Onboard Staff</span>
                            </button>
                          )}
                          {cand.stage === 'hired' && (
                            <button
                              className="btn-hr-outline"
                              style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                              onClick={() => handleOneClickHireCandidate(cand)}
                              title="Review or Complete Onboarding Dossier"
                            >
                              <FileCheck size={12} color="#16a34a" />
                              <span>Onboard Dossier</span>
                            </button>
                          )}
                          {cand.stage === 'sourcing' && (
                            <button
                              className="btn-hr-outline"
                              style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                              onClick={() => handleAdvanceCandidate(cand.id, 'screening')}
                            >
                              <span>Screen</span>
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
        </div>
      )}

      {/* ========================================================
          TAB 8: 9-BOX PERFORMANCE MATRIX & BENCHMARKING
          ======================================================== */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: 9-Box Grid & OKR List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            {/* 9-Box Matrix Grid */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#09090b' }}>
                    Enterprise 9-Box Talent Matrix
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Standard HCM classification: Potential vs Current Job Performance
                  </p>
                </div>
                <span className="badge badge-yellow">Global Succession Planning</span>
              </div>

              {/* 3x3 Grid Graphic */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 100px)',
                  gap: '8px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Row 1: High Potential */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>ENIGMA (Low/High)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>—</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ca8a04' }}>HIGH POTENTIAL</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>Selamawit Abebe</div>
                </div>
                <div style={{ background: '#09090b', color: '#ffffff', borderRadius: '8px', padding: '8px', border: '1px solid #facc15' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#facc15' }}>★ STAR PERFORMER</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>Alazar T. • Rahel G.</div>
                </div>

                {/* Row 2: Medium Potential */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>DILEMMA</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>—</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>CORE PERFORMER</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>Ermias Kebede</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ca8a04' }}>HIGH IMPACT PRO</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>Biniyam A. • Dawit B.</div>
                </div>

                {/* Row 3: Low Potential */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444' }}>RISK / ACTION</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>0 Staff</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>SOLID SPECIALIST</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>—</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>TRUSTED ANCHOR</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>—</div>
                </div>
              </div>
            </div>

            {/* Company OKRs & Quality Standards */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#09090b' }}>
                    Q4 Operational Key Results (OKRs)
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Manufacturing performance benchmarks linked to department bonus pools
                  </p>
                </div>
                <span className="badge badge-yellow">Q4 2026</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {COMPANY_OKRS.map((okr) => (
                  <div key={okr.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                      <strong style={{ color: '#09090b' }}>{okr.objective}</strong>
                      <span className="badge badge-emerald">{okr.current} (Target: {okr.target})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', marginBottom: '6px' }}>
                      <span>Owner: {okr.owner}</span>
                      <strong style={{ color: '#09090b' }}>{okr.progressPct}% Achieved</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${okr.progressPct}%`,
                          height: '100%',
                          background: okr.progressPct >= 95 ? '#09090b' : '#facc15',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Manufacturing Compensation Benchmark Comparison Table */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#09090b' }}>
                  Addis Ababa Manufacturing Wage Benchmarks (Market Competitiveness)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                  Comparison against Bole Lemi Industrial Park & Ethiopian Advertising Industry salary bands
                </p>
              </div>
              <span className="badge badge-yellow">Competitive Percentile: Top 25%</span>
            </div>

            <div className="hr-table-container">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Designation / Role</th>
                    <th>Market 25th % (Entry)</th>
                    <th>Market Median (50th %)</th>
                    <th>Market 75th % (Top)</th>
                    <th>Dot Advert Paid Salary</th>
                    <th>Competitiveness Index</th>
                  </tr>
                </thead>
                <tbody>
                  {SALARY_BENCHMARKS.map((bench) => (
                    <tr key={bench.role}>
                      <td style={{ fontWeight: 700, color: '#09090b' }}>{bench.role}</td>
                      <td style={{ color: '#64748b' }}>{formatETB(bench.industryP25)}</td>
                      <td style={{ color: '#64748b' }}>{formatETB(bench.industryP50)}</td>
                      <td style={{ color: '#64748b' }}>{formatETB(bench.industryP75)}</td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                          {formatETB(bench.dotSalary)}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#09090b',
                            color: '#facc15',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.725rem',
                            fontWeight: 800,
                          }}
                        >
                          {bench.competitiveTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* ========================================================
          PORTAL 2: EMPLOYEE SELF-SERVICE (ESS) DASHBOARD
          ======================================================== */}
      {roleView === 'employee' && selectedEssEmp && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Employee Hero Profile Dossier */}
          <div
            style={{
              background: '#09090b',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#facc15',
                  color: '#09090b',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(250, 204, 21, 0.4)',
                }}
              >
                {selectedEssEmp.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.5rem', fontWeight: 900 }}>
                    {selectedEssEmp.name}
                  </h2>
                  <span className="badge badge-yellow" style={{ textTransform: 'capitalize' }}>
                    {selectedEssEmp.department} Department
                  </span>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    ● Active Full-Time Staff
                  </span>
                </div>

                <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '4px' }}>
                  {selectedEssEmp.position} • ID: <strong style={{ color: '#ffffff' }}>{selectedEssEmp.employeeId}</strong> • Base Rate: <strong style={{ color: '#facc15' }}>{selectedEssEmp.hourlyRate} ETB/hr</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '8px', fontSize: '0.75rem', color: '#71717a', flexWrap: 'wrap' }}>
                  <span>TIN: <strong style={{ color: '#e4e4e7' }}>{selectedEssEmp.tin}</strong></span>
                  <span>Pension No: <strong style={{ color: '#e4e4e7' }}>{selectedEssEmp.pensionNumber}</strong></span>
                  <span>Bank: <strong style={{ color: '#e4e4e7' }}>{selectedEssEmp.bankName} ({selectedEssEmp.bankAccount})</strong></span>
                  <span>Joined: <strong style={{ color: '#e4e4e7' }}>{selectedEssEmp.startDate}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Self-Service Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn-hr-yellow"
                onClick={() => setPreviewPayslipEmp(selectedEssEmp)}
                title="View and download printable official monthly salary payslip"
              >
                <Printer size={15} />
                <span>View & Print Payslip</span>
              </button>

              <button
                className="btn-hr-black"
                onClick={() => {
                  setLeaveEmpId(selectedEssEmp.id);
                  setShowLeaveModal(true);
                }}
                style={{ background: '#18181b', border: '1px solid #3f3f46' }}
              >
                <Calendar size={15} color="#facc15" />
                <span>Request Time-Off</span>
              </button>

              <button
                className="btn-hr-black"
                onClick={() => {
                  setClockEmpId(selectedEssEmp.id);
                  setClockPunchMode('in');
                  setClockSelfiePhoto(null);
                  setShowClockInModal(true);
                }}
                style={{ background: '#18181b', border: '1px solid #3f3f46' }}
              >
                <Camera size={15} color="#facc15" />
                <span>Punch Biometric Selfie</span>
              </button>
            </div>
          </div>

          {/* ESS Section 1: My Factory Payroll & Direct Labor Costing */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#09090b' }}>
                    My Factory Payroll & Direct Labor Dossier
                  </h3>
                  <span className="badge badge-yellow">October 2026 Active Run</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                  Verified net salary take-home, statutory Ethiopian POSE 7% pension deduction, progressive income tax schedule, and direct order shopfloor labor logged.
                </p>
              </div>

              <button
                className="btn-hr-black"
                onClick={() => setPreviewPayslipEmp(selectedEssEmp)}
              >
                <FileText size={14} color="#facc15" />
                <span>Download Official MoR Payslip</span>
              </button>
            </div>

            {/* Live Personal Payroll Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  background: '#09090b',
                  color: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #27272a',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>
                  Net Take-Home Pay (Disbursed)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', margin: '4px 0 2px' }}>
                  {formatETB(selectedEssPayroll.netPay)}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#a1a1aa' }}>
                  Direct wire to {selectedEssEmp.bankName}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Base Salary & Allowances
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', margin: '4px 0 2px' }}>
                  {formatETB(selectedEssEmp.baseSalary + selectedEssEmp.allowances)}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                  Base: {formatETB(selectedEssEmp.baseSalary)} + Allowances: {formatETB(selectedEssEmp.allowances)}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700 }}>
                  Overtime Pay Logged
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ca8a04', margin: '4px 0 2px' }}>
                  {formatETB(selectedEssPayroll.overtimePay)}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                  {selectedEssPayroll.overtimeHours} hours approved @ 1.5x shift multiplier
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Statutory Deductions
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', margin: '4px 0 2px' }}>
                  -{formatETB(selectedEssPayroll.pension7Pct + selectedEssPayroll.incomeTax)}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                  POSE 7%: {formatETB(selectedEssPayroll.pension7Pct)} • Tax: {formatETB(selectedEssPayroll.incomeTax)}
                </div>
              </div>
            </div>

            {/* My Direct Labor & Work Orders Logged */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>
                  My Assigned Manufacturing Orders & Direct Labor Hours
                </h4>
                <span className="badge badge-yellow">Workshop Job Costing</span>
              </div>

              {workOrders.filter((wo) => wo.operatorNames.includes(selectedEssEmp.name)).length > 0 ? (
                <div className="hr-table-container">
                  <table className="hr-table">
                    <thead>
                      <tr>
                        <th>Work Order Number</th>
                        <th>Product & Specification</th>
                        <th>Customer / Client</th>
                        <th>Machine Station Hours</th>
                        <th>Absorption Rate</th>
                        <th>Direct Labor Value</th>
                        <th>Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrders
                        .filter((wo) => wo.operatorNames.includes(selectedEssEmp.name))
                        .map((wo) => (
                          <tr key={wo.id}>
                            <td><strong style={{ color: '#09090b' }}>{wo.workOrderNumber}</strong></td>
                            <td>{wo.productDescription}</td>
                            <td><span style={{ fontWeight: 600, color: '#09090b' }}>{wo.customerName}</span></td>
                            <td><strong style={{ color: '#09090b' }}>{wo.machineHours} hrs</strong></td>
                            <td style={{ color: '#64748b' }}>120 ETB/hr</td>
                            <td>
                              <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                                {formatETB(wo.machineHours * 120)}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  wo.status === 'completed'
                                    ? 'badge-emerald'
                                    : wo.status === 'in_progress'
                                    ? 'badge-yellow'
                                    : 'badge-gray'
                                }`}
                              >
                                {wo.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.85rem',
                  }}
                >
                  <Clock size={20} color="#a1a1aa" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div>No direct shopfloor machine work orders currently assigned to your station.</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Direct labor is allocated by workshop supervisors during active printing or fabrication jobs.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ESS Section 2: Biometric Shift Terminal & Punctuality */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                    My Biometric Attendance & Shift Hours
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Weekly biometric terminal punch records and punctuality score
                  </p>
                </div>
                <span className="badge badge-yellow">100% On-Time This Week</span>
              </div>

              {(() => {
                const todayEssRec = attendanceRecords.find(
                  (r) => r.employeeId === selectedEssEmp.id
                );
                const isClockedOut = Boolean(todayEssRec?.checkOut && todayEssRec.checkOut !== 'Active');
                const checkInTime = todayEssRec?.checkIn || '08:00';
                const checkOutTime = todayEssRec?.checkOut || '17:00';

                return (
                  <div
                    style={{
                      background: '#09090b',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      border: '1px solid #27272a',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Biometric Selfie Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {todayEssRec?.checkInPhoto ? (
                          <div
                            onClick={() => setSelectedAuditRecord(todayEssRec)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                            title="Click to view full biometric audit & liveness scan"
                          >
                            <img
                              src={todayEssRec.checkInPhoto}
                              alt="Check In Selfie"
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '10px',
                                border: '2px solid #22c55e',
                                objectFit: 'cover',
                                background: '#18181b',
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                background: '#22c55e',
                                color: '#09090b',
                                borderRadius: '4px',
                                fontSize: '7.5px',
                                fontWeight: 900,
                                padding: '1px 3px',
                                lineHeight: 1,
                              }}
                            >
                              IN
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              border: '1px dashed #52525b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#18181b',
                            }}
                          >
                            <Camera size={18} color="#a1a1aa" />
                          </div>
                        )}

                        {todayEssRec?.checkOutPhoto && (
                          <div
                            onClick={() => setSelectedAuditRecord(todayEssRec)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                            title="Click to view departure biometric audit & liveness scan"
                          >
                            <img
                              src={todayEssRec.checkOutPhoto}
                              alt="Check Out Selfie"
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '10px',
                                border: '2px solid #0d9488',
                                objectFit: 'cover',
                                background: '#18181b',
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                background: '#0d9488',
                                color: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '7.5px',
                                fontWeight: 900,
                                padding: '1px 3px',
                                lineHeight: 1,
                              }}
                            >
                              OUT
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                          Today's Biometric Terminal Status
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isClockedOut ? '#2dd4bf' : '#22c55e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: isClockedOut ? '#2dd4bf' : '#22c55e',
                              boxShadow: isClockedOut ? '0 0 8px #2dd4bf' : '0 0 8px #22c55e',
                            }}
                          />
                          <span>
                            {isClockedOut
                              ? `Shift Completed (${checkInTime} - ${checkOutTime})`
                              : `Clocked In (${checkInTime}) • Active Shift`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '0.725rem', color: '#a1a1aa' }}>
                          <span style={{ color: '#facc15', fontWeight: 700 }}>
                            📍 {todayEssRec?.terminalLocation || 'Bole Plant Gate #2 (Face Cam Station #04)'}
                          </span>
                          <span>•</span>
                          <span style={{ color: '#22c55e', fontWeight: 700 }}>
                            ✓ Biometric Anti-Spoofing Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-hr-black"
                        onClick={() => {
                          setClockEmpId(selectedEssEmp.id);
                          setClockPunchMode('in');
                          setClockSelfiePhoto(null);
                          setShowClockInModal(true);
                        }}
                        style={{
                          background: '#18181b',
                          border: '1px solid #3f3f46',
                          padding: '8px 14px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Camera size={14} color="#facc15" />
                        <span>Clock-In Selfie</span>
                      </button>

                      <button
                        className="btn-hr-yellow"
                        onClick={() => {
                          const now = new Date();
                          const hours = String(now.getHours()).padStart(2, '0');
                          const minutes = String(now.getMinutes()).padStart(2, '0');
                          setClockEmpId(selectedEssEmp.id);
                          setClockPunchMode('out');
                          setClockTime(`${hours}:${minutes}`);
                          setClockSelfiePhoto(null);
                          setShowClockInModal(true);
                        }}
                        style={{
                          padding: '8px 14px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Camera size={14} />
                        <span>Clock-Out Selfie</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 5-Day Attendance Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { day: 'Friday, Oct 18', time: '07:58 AM - 05:00 PM', status: 'Present • On Time', hours: '8.0h + 3.0h OT', badge: 'badge-emerald' },
                  { day: 'Thursday, Oct 17', time: '08:00 AM - 05:00 PM', status: 'Present • On Time', hours: '8.0h + 2.0h OT', badge: 'badge-emerald' },
                  { day: 'Wednesday, Oct 16', time: '08:05 AM - 05:00 PM', status: 'Present • On Time', hours: '8.0h + 1.5h OT', badge: 'badge-emerald' },
                  { day: 'Tuesday, Oct 15', time: '07:55 AM - 05:00 PM', status: 'Present • On Time', hours: '8.0h + 3.0h OT', badge: 'badge-emerald' },
                  { day: 'Monday, Oct 14', time: '08:00 AM - 05:00 PM', status: 'Present • On Time', hours: '8.0h + 2.5h OT', badge: 'badge-emerald' },
                ].map((record) => (
                  <div
                    key={record.day}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#09090b' }}>{record.day}</strong>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{record.time}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${record.badge}`}>{record.status}</span>
                      <div style={{ fontSize: '0.725rem', color: '#ca8a04', fontWeight: 700, marginTop: '2px' }}>
                        {record.hours}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ESS Section 3: Leave Quotas & Time-Off History */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                    My Leaves & Time-Off Balances
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Annual vacation balance, sick leave allowances & requests
                  </p>
                </div>

                <button
                  className="btn-hr-yellow"
                  onClick={() => {
                    setLeaveEmpId(selectedEssEmp.id);
                    setShowLeaveModal(true);
                  }}
                  style={{ padding: '6px 14px', fontSize: '0.775rem' }}
                >
                  <PlusCircle size={14} />
                  <span>+ Request Time-Off</span>
                </button>
              </div>

              {/* Leave Balances Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Annual Leave
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#09090b', margin: '4px 0 2px' }}>
                    14 <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 16 d</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>2 days utilized</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Sick Leave
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#09090b', margin: '4px 0 2px' }}>
                    5 <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 6 d</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>1 day utilized</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Emergency
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#09090b', margin: '4px 0 2px' }}>
                    3 <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 3 d</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>Fully available</div>
                </div>
              </div>

              {/* My Leave Requests Table */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>
                  My Time-Off Requests
                </div>

                {leaveRequests.filter((l) => l.employeeId === selectedEssEmp.id).length > 0 ? (
                  <div className="hr-table-container">
                    <table className="hr-table">
                      <thead>
                        <tr>
                          <th>Leave Type</th>
                          <th>Dates</th>
                          <th>Days</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests
                          .filter((l) => l.employeeId === selectedEssEmp.id)
                          .map((leave) => (
                            <tr key={leave.id}>
                              <td>
                                <strong style={{ textTransform: 'capitalize', color: '#09090b' }}>
                                  {leave.leaveType}
                                </strong>
                              </td>
                              <td style={{ fontSize: '0.75rem' }}>
                                {leave.startDate} → {leave.endDate}
                              </td>
                              <td>{leave.daysCount} d</td>
                              <td>
                                <span
                                  className={`badge ${
                                    leave.status === 'approved'
                                      ? 'badge-emerald'
                                      : leave.status === 'pending'
                                      ? 'badge-yellow'
                                      : 'badge-rose'
                                  }`}
                                >
                                  {leave.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', fontSize: '0.775rem', color: '#94a3b8' }}>
                    No pending or past leave requests logged for this period.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PORTAL 3: ADMINISTRATOR & STATUTORY COMPLIANCE PORTAL
          ======================================================== */}
      {roleView === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Admin Command Banner */}
          <div
            style={{
              background: '#09090b',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-yellow">System Governance & Legal Audit</span>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                  Federal Negarit Gazette Proclamations Active
                </span>
              </div>
              <h2 style={{ margin: '6px 0 2px', color: '#ffffff', fontSize: '1.45rem', fontWeight: 900 }}>
                Statutory Tax Rules, Pension Regulations & Labor Standard Costing
              </h2>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#a1a1aa' }}>
                Configuring progressive personal income tax tiers under MoR Proclamation 979/2016, Private Organization Employees' Pension (POSE), and shopfloor machine labor absorption rates.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn-hr-yellow"
                onClick={() => setShowSimulatorModal(true)}
              >
                <Sliders size={15} />
                <span>Simulate MoR Tax Brackets</span>
              </button>
            </div>
          </div>

          {/* Admin Section 1: Statutory MoR Tax Brackets Schedule */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#09090b' }}>
                    Ethiopian Personal Income Tax (PIT) Schedule — Proclamation 979/2016
                  </h3>
                  <span className="badge badge-yellow">Statutory Standard</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                  Progressive monthly tax brackets calculated automatically on taxable earnings (Gross Pay minus 7% Employee Pension).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                <div style={{ padding: '6px 12px', background: '#09090b', color: '#facc15', borderRadius: '6px', fontWeight: 700 }}>
                  POSE Employee Pension: 7.0%
                </div>
                <div style={{ padding: '6px 12px', background: '#09090b', color: '#ffffff', borderRadius: '6px', fontWeight: 700 }}>
                  POSE Employer Pension: 11.0%
                </div>
              </div>
            </div>

            <div className="hr-table-container">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Monthly Taxable Income Range (ETB)</th>
                    <th>Statutory Tax Rate</th>
                    <th>Fixed Deductible Threshold (ETB)</th>
                    <th>Effective Net Formula</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: '0 — 600 ETB', rate: '0%', deduction: '0 ETB', formula: 'Tax-Exempt Base Floor', status: 'Active Law' },
                    { range: '601 — 1,650 ETB', rate: '10%', deduction: '60.00 ETB', formula: '(Taxable × 10%) - 60', status: 'Active Law' },
                    { range: '1,651 — 3,200 ETB', rate: '15%', deduction: '142.50 ETB', formula: '(Taxable × 15%) - 142.5', status: 'Active Law' },
                    { range: '3,201 — 5,250 ETB', rate: '20%', deduction: '302.50 ETB', formula: '(Taxable × 20%) - 302.5', status: 'Active Law' },
                    { range: '5,251 — 7,800 ETB', rate: '25%', deduction: '565.00 ETB', formula: '(Taxable × 25%) - 565', status: 'Active Law' },
                    { range: '7,801 — 10,900 ETB', rate: '30%', deduction: '955.00 ETB', formula: '(Taxable × 30%) - 955', status: 'Active Law' },
                    { range: 'Above 10,900 ETB', rate: '35%', deduction: '1,500.00 ETB', formula: '(Taxable × 35%) - 1,500', status: 'Active Law' },
                  ].map((tier, index) => (
                    <tr key={tier.range}>
                      <td>
                        <strong style={{ color: '#09090b' }}>{tier.range}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: index === 0 ? '#16a34a' : '#09090b' }}>
                          {tier.rate}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>{tier.deduction}</td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#09090b' }}>
                          {tier.formula}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-emerald">{tier.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Section 2: Shopfloor Machine Labor Rate Benchmarks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                    Shopfloor Machine Labor Standard Absorption Rates
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Standardized hourly labor costing absorbed into production orders
                  </p>
                </div>
                <span className="badge badge-yellow">Cost Standards</span>
              </div>

              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Machine / Workstation</th>
                      <th>Standard Absorption Rate</th>
                      <th>Overtime Rate (1.5x)</th>
                      <th>Target Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { station: 'CNC 3D Router Station', rate: '120 ETB/hr', ot: '180 ETB/hr', util: '95.0%' },
                      { station: 'Laser Cutting & Precision Engraving', rate: '140 ETB/hr', ot: '210 ETB/hr', util: '92.5%' },
                      { station: 'Large-Format UV Flatbed Printing', rate: '110 ETB/hr', ot: '165 ETB/hr', util: '90.0%' },
                      { station: 'Metal Welding & Channel Letter Forming', rate: '115 ETB/hr', ot: '172.5 ETB/hr', util: '94.0%' },
                      { station: 'Vinyl Weeding & Sign Assembly', rate: '95 ETB/hr', ot: '142.5 ETB/hr', util: '88.0%' },
                    ].map((st) => (
                      <tr key={st.station}>
                        <td><strong style={{ color: '#09090b' }}>{st.station}</strong></td>
                        <td><strong style={{ color: '#059669' }}>{st.rate}</strong></td>
                        <td style={{ color: '#ca8a04', fontWeight: 600 }}>{st.ot}</td>
                        <td><span className="badge badge-yellow">{st.util}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Section 3: Payroll & Direct Labor Audit Security Ledger */}
            <div className="hr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                    Payroll & Direct Labor Audit Security Ledger
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Immutable timestamped audit trail of financial wire files and labor allocations
                  </p>
                </div>
                <span className="badge badge-gray">SHA-256 Verified</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    action: 'CBE Wire Batch CBE-BULK-202610-8812 Formatted',
                    actor: 'HR & Payroll Officer (System)',
                    time: 'Today • 09:15 AM',
                    status: 'Disbursed ETB 82,900',
                    badge: 'badge-emerald',
                  },
                  {
                    action: 'Direct Labor Logged to WO-2026-081 (8.0h CNC Router)',
                    actor: 'Alazar Tadesse (Supervisor)',
                    time: 'Today • 08:30 AM',
                    status: 'Capitalized ETB 960',
                    badge: 'badge-yellow',
                  },
                  {
                    action: 'Annual Leave Approved for Ermias Kebede (3 Days)',
                    actor: 'Operations Lead (Authorized)',
                    time: 'Yesterday • 04:45 PM',
                    status: 'Quota Decremented',
                    badge: 'badge-gray',
                  },
                  {
                    action: 'Statutory MoR Proclamation 979 PIT Schedule Validated',
                    actor: 'Rahel Girma (Finance/Tax Lead)',
                    time: 'Oct 18 • 11:20 AM',
                    status: '100% Compliant',
                    badge: 'badge-emerald',
                  },
                ].map((log, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.775rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#09090b' }}>{log.action}</strong>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        By {log.actor} • {log.time}
                      </div>
                    </div>
                    <span className={`badge ${log.badge}`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PORTAL 4: SUPER ADMIN MASTER GOVERNANCE & STATUTORY ENGINE
          ======================================================== */}
      {roleView === 'super_admin' && superAdminViewMode === 'governance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Super Admin Executive Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #09090b 0%, #1c1917 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '26px 30px',
              border: '1px solid #facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 8px 32px rgba(250, 204, 21, 0.15)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-yellow" style={{ fontSize: '0.725rem', fontWeight: 900 }}>
                  ⚡ ROOT SUPER ADMIN PRIVILEGE ACTIVE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                  Federal MoR Proclamation 979/2016 • POSE Pension Authority
                </span>
              </div>
              <h2 style={{ margin: '8px 0 4px', color: '#ffffff', fontSize: '1.6rem', fontWeight: 900 }}>
                Federal Statutory Override Engine & Enterprise RBAC Governance
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa', maxWidth: '820px', lineHeight: 1.5 }}>
                Master administrative governance tier: Reconfigure Federal Personal Income Tax (PIT) thresholds, override POSE retirement pension rates, manage granular role permissions, audit shopfloor labor standard absorption rates, and execute emergency financial disbarment freezes.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn-hr-black"
                onClick={() => setSuperAdminViewMode('operations')}
                style={{ background: '#18181b', border: '1px solid #3f3f46' }}
              >
                <Users size={15} color="#facc15" />
                <span>🏢 Operations Explorer (All 8 Modules)</span>
              </button>

              <button
                className="btn-hr-black"
                onClick={handleTogglePayrollFreeze}
                style={{
                  background: isPayrollFrozen ? '#e11d48' : '#18181b',
                  border: isPayrollFrozen ? '1px solid #e11d48' : '1px solid #3f3f46',
                  color: isPayrollFrozen ? '#ffffff' : '#facc15',
                }}
              >
                <Lock size={15} />
                <span>{isPayrollFrozen ? '🚨 Unlock Payroll' : 'Freeze Payroll Disbursal'}</span>
              </button>
            </div>
          </div>

          {/* Super Admin Section 1: Statutory Tax & Pension Rule Engine */}
          <div className="hr-card" style={{ border: '2px solid #facc15' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#09090b' }}>
                    ⚙️ Statutory MoR Tax & POSE Pension Rule Engine
                  </h3>
                  <span className="badge badge-yellow">Proclamation 979/2016 Live</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
                  Adjust statutory baseline exemptions and social security pension percentages. Applying updates recalculates company-wide payroll across all {employees.length} personnel in real-time.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-hr-outline"
                  onClick={handleResetTaxConfig}
                  style={{ fontSize: '0.775rem' }}
                >
                  <RefreshCw size={13} />
                  <span>Reset to Proclamation Defaults</span>
                </button>
                <button
                  className="btn-hr-yellow"
                  onClick={handleApplyTaxConfig}
                  style={{ fontSize: '0.8rem', fontWeight: 800 }}
                >
                  <Check size={15} />
                  <span>Apply & Recalculate Company Payroll</span>
                </button>
              </div>
            </div>

            {/* Configurable Statutory Inputs Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                padding: '18px',
                background: '#09090b',
                color: '#ffffff',
                borderRadius: '12px',
                marginBottom: '22px',
              }}
            >
              <div>
                <label style={{ fontSize: '0.725rem', color: '#facc15', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tax-Exempt Base Floor (ETB/Month)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="number"
                    className="hr-input"
                    style={{ background: '#18181b', color: '#ffffff', borderColor: '#3f3f46', fontWeight: 800, fontSize: '1.1rem' }}
                    value={tempExemptBase}
                    onChange={(e) => setTempExemptBase(Number(e.target.value))}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>ETB</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
                  Monthly income below this threshold has 0% PIT liability.
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', color: '#facc15', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  POSE Employee Pension Deduction (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="number"
                    step="0.1"
                    className="hr-input"
                    style={{ background: '#18181b', color: '#ffffff', borderColor: '#3f3f46', fontWeight: 800, fontSize: '1.1rem' }}
                    value={tempEmpPension}
                    onChange={(e) => setTempEmpPension(Number(e.target.value))}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>%</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
                  Deducted directly from base salary before income tax calculation.
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', color: '#facc15', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  POSE Employer Pension Contribution (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="number"
                    step="0.1"
                    className="hr-input"
                    style={{ background: '#18181b', color: '#ffffff', borderColor: '#3f3f46', fontWeight: 800, fontSize: '1.1rem' }}
                    value={tempEmprPension}
                    onChange={(e) => setTempEmprPension(Number(e.target.value))}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>%</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
                  Company-funded contribution to Ethiopian Social Security Agency.
                </div>
              </div>
            </div>

            {/* Live Statutory Tax Brackets Schedule */}
            <div className="hr-table-container">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Monthly Taxable Tier</th>
                    <th>Statutory Tax Rate</th>
                    <th>Fixed Deductible Offset (ETB)</th>
                    <th>Formula Expression</th>
                    <th>Super Admin Override</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: `0 — ${taxExemptBase} ETB`, rate: '0%', deduction: '0.00 ETB', formula: 'Tax-Exempt Base Floor', status: 'Compliant' },
                    { range: `${taxExemptBase + 1} — 1,650 ETB`, rate: '10%', deduction: '60.00 ETB', formula: '(Taxable × 10%) - 60', status: 'Active Law' },
                    { range: '1,651 — 3,200 ETB', rate: '15%', deduction: '142.50 ETB', formula: '(Taxable × 15%) - 142.5', status: 'Active Law' },
                    { range: '3,201 — 5,250 ETB', rate: '20%', deduction: '302.50 ETB', formula: '(Taxable × 20%) - 302.5', status: 'Active Law' },
                    { range: '5,251 — 7,800 ETB', rate: '25%', deduction: '565.00 ETB', formula: '(Taxable × 25%) - 565', status: 'Active Law' },
                    { range: '7,801 — 10,900 ETB', rate: '30%', deduction: '955.00 ETB', formula: '(Taxable × 30%) - 955', status: 'Active Law' },
                    { range: 'Above 10,900 ETB', rate: '35%', deduction: '1,500.00 ETB', formula: '(Taxable × 35%) - 1,500', status: 'Active Law' },
                  ].map((tier, idx) => (
                    <tr key={tier.range}>
                      <td><strong style={{ color: '#09090b' }}>{tier.range}</strong></td>
                      <td>
                        <span style={{ fontWeight: 800, color: idx === 0 ? '#16a34a' : '#09090b' }}>
                          {tier.rate}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>{tier.deduction}</td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#09090b' }}>
                          {tier.formula}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-emerald">{tier.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Super Admin Section 2: Role-Based Access Control (RBAC) Matrix */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#09090b' }}>
                    🔒 Enterprise Role-Based Access Control (RBAC) Matrix
                  </h3>
                  <span className="badge badge-yellow">Dynamic Access Policy</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
                  Configure functional rights across Employee (ESS), HR Manager, Admin, and Super Admin. Click any checkbox to toggle permissions on or off.
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#71717a', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                Total Defined Rights: <strong style={{ color: '#09090b' }}>{rbacList.length} Permissions</strong>
              </div>
            </div>

            <div className="hr-table-container">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Privilege Name & Description</th>
                    <th>Domain</th>
                    <th style={{ textAlign: 'center' }}>👤 Employee (ESS)</th>
                    <th style={{ textAlign: 'center' }}>👔 HR Manager</th>
                    <th style={{ textAlign: 'center' }}>🛡️ Admin</th>
                    <th style={{ textAlign: 'center' }}>⚡ Super Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {rbacList.map((perm) => (
                    <tr key={perm.id}>
                      <td>
                        <strong style={{ color: '#09090b', fontSize: '0.85rem' }}>{perm.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{perm.desc}</div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{perm.category}</span>
                      </td>

                      {/* Employee Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleRbacPermission(perm.id, 'employee')}
                          style={{
                            background: perm.employee ? '#22c55e' : '#e4e4e7',
                            color: perm.employee ? '#ffffff' : '#71717a',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {perm.employee ? <Check size={12} /> : <X size={12} />}
                          <span>{perm.employee ? 'Allowed' : 'Blocked'}</span>
                        </button>
                      </td>

                      {/* HR Manager Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleRbacPermission(perm.id, 'hr_manager')}
                          style={{
                            background: perm.hr_manager ? '#22c55e' : '#e4e4e7',
                            color: perm.hr_manager ? '#ffffff' : '#71717a',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {perm.hr_manager ? <Check size={12} /> : <X size={12} />}
                          <span>{perm.hr_manager ? 'Allowed' : 'Blocked'}</span>
                        </button>
                      </td>

                      {/* Admin Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleRbacPermission(perm.id, 'admin')}
                          style={{
                            background: perm.admin ? '#22c55e' : '#e4e4e7',
                            color: perm.admin ? '#ffffff' : '#71717a',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {perm.admin ? <Check size={12} /> : <X size={12} />}
                          <span>{perm.admin ? 'Allowed' : 'Blocked'}</span>
                        </button>
                      </td>

                      {/* Super Admin (Locked Master) */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            background: '#09090b',
                            color: '#facc15',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>Master Root</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Super Admin Section 3: Executive Labor Economics & Wage Disparity */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="hr-card" style={{ borderLeft: '4px solid #facc15' }}>
              <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                Wage Disparity Ratio
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#09090b', margin: '6px 0 2px' }}>
                2.1x Ratio
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                ● Top Earner vs Factory Median
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Top wage: 24,000 ETB vs median 11,400 ETB. Highly equitable manufacturing wage structure.
              </p>
            </div>

            <div className="hr-card" style={{ borderLeft: '4px solid #09090b' }}>
              <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                Direct vs Indirect Labor Split
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#09090b', margin: '6px 0 2px' }}>
                68% Direct
              </div>
              <div style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 600 }}>
                32% Administrative Overhead
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Production-heavy labor allocation optimizing absorbed work order profitability.
              </p>
            </div>

            <div className="hr-card" style={{ borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                Overtime Burden Ratio
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a', margin: '6px 0 2px' }}>
                {Math.round((totalOvertimeExpenditure / totalGrossSalaries) * 100)}% of Payroll
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                ● Target Threshold &lt; 10%
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Total OT expenditure: {formatETB(totalOvertimeExpenditure)}. Controlled shopfloor shift costs.
              </p>
            </div>

            <div className="hr-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                Standard Machine Labor Absorption
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#09090b', margin: '6px 0 2px' }}>
                120 ETB/hr
              </div>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                CNC Router & Laser Stations
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Total absorbed direct machine labor: {formatETB(totalDirectLaborCost)} across {totalMachineHours} hours.
              </p>
            </div>
          </div>

          {/* Super Admin Section 4: Master Security Audit Ledger with Cryptographic Export */}
          <div className="hr-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#09090b' }}>
                    🛡️ Master Security & Cryptographic Audit Ledger
                  </h3>
                  <span className="badge badge-emerald">SHA-256 Validated</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Immutable audit records of statutory parameter changes, bank wire formatting, labor costing, and access policy alterations.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="hr-input"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                  value={auditFilterCategory}
                  onChange={(e) => setAuditFilterCategory(e.target.value)}
                >
                  <option value="all">All Audit Events</option>
                  <option value="payroll">Payroll & Tax Engine</option>
                  <option value="labor">Labor Job Costing</option>
                  <option value="leaves">Leave Approvals</option>
                  <option value="rbac">RBAC & Governance</option>
                </select>

                <button
                  className="btn-hr-black"
                  onClick={handleExportAuditCsv}
                >
                  <Download size={14} color="#facc15" />
                  <span>Download CSV Ledger</span>
                </button>

                <button
                  className="btn-hr-yellow"
                  onClick={handleExportAuditJson}
                >
                  <FileText size={14} />
                  <span>Download JSON Ledger</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  action: `Statutory MoR Proclamation 979 Engine Parameter Verified (Base Floor: ${taxExemptBase} ETB, Pension: ${Math.round(pensionEmployeePct * 100)}% / ${Math.round(pensionEmployerPct * 100)}%)`,
                  actor: 'Super Admin (Master Session)',
                  time: 'Just Now • Local Session',
                  status: 'Active Rule Set',
                  badge: 'badge-yellow',
                  category: 'payroll',
                },
                {
                  action: `CBE Wire Batch CBE-BULK-202610-8812 Formatted (${formatETB(totalNetPay)} to CBE Accounts)`,
                  actor: 'HR & Payroll Officer (System Disbursal)',
                  time: 'Today • 09:15 AM',
                  status: isPayrollFrozen ? 'DISBURSEMENT FROZEN' : 'Ready for Telebirr / CBE',
                  badge: isPayrollFrozen ? 'badge-rose' : 'badge-emerald',
                  category: 'payroll',
                },
                {
                  action: 'Direct Labor Logged to WO-2026-081 (8.0h CNC Router)',
                  actor: 'Alazar Tadesse (Supervisor)',
                  time: 'Today • 08:30 AM',
                  status: 'Capitalized ETB 960',
                  badge: 'badge-yellow',
                  category: 'labor',
                },
                {
                  action: 'Annual Leave Approved for Ermias Kebede (3 Days)',
                  actor: 'Operations Lead (Authorized)',
                  time: 'Yesterday • 04:45 PM',
                  status: 'Quota Decremented',
                  badge: 'badge-gray',
                  category: 'leaves',
                },
                {
                  action: 'RBAC Policy Matrix Validated: 12 Security Rules Active',
                  actor: 'Security Architect (Automated Audit)',
                  time: 'Oct 19 • 02:15 PM',
                  status: 'Policy Enforced',
                  badge: 'badge-emerald',
                  category: 'rbac',
                },
              ]
                .filter((log) => auditFilterCategory === 'all' || log.category === auditFilterCategory)
                .map((log, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#09090b' }}>{log.action}</strong>
                      <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                        By {log.actor} • {log.time}
                      </div>
                    </div>
                    <span className={`badge ${log.badge}`}>{log.status}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: PREVIEW & PRINT OFFICIAL PAYSLIP
          ======================================================== */}
      {previewPayslipEmp && (
        <div
          onClick={() => setPreviewPayslipEmp(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Printer size={20} color="#facc15" />
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                    Official Salary Payslip & Tax Schedule
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: '#facc15' }}>
                    Dot Advert & Print Solutions PLC • TIN: 0048291032
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewPayslipEmp(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  fontSize: '0.825rem',
                }}
              >
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Employee Name & ID:</div>
                  <strong style={{ color: '#09090b', fontSize: '0.95rem' }}>{previewPayslipEmp.name}</strong>
                  <div style={{ color: '#64748b' }}>{previewPayslipEmp.employeeId} • {previewPayslipEmp.position}</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Department & Status:</div>
                  <strong style={{ color: '#09090b', textTransform: 'capitalize' }}>{previewPayslipEmp.department}</strong>
                  <div style={{ color: '#059669', fontWeight: 600 }}>Active Full-Time Staff</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Ethiopian Tax ID (TIN):</div>
                  <strong style={{ color: '#09090b' }}>{previewPayslipEmp.tin}</strong>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Pension Agency ID:</div>
                  <strong style={{ color: '#09090b' }}>{previewPayslipEmp.pensionNumber}</strong>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Disbursement Bank:</div>
                  <strong style={{ color: '#09090b' }}>{previewPayslipEmp.bankName}</strong>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Bank Account Number:</div>
                  <strong style={{ color: '#09090b' }}>{previewPayslipEmp.bankAccount}</strong>
                </div>
              </div>

              {(() => {
                const overtimeHours = previewPayslipEmp.department === 'production' ? 12 : 2;
                const overtimePay = overtimeHours * (previewPayslipEmp.hourlyRate * 1.5);
                const grossPay = previewPayslipEmp.baseSalary + previewPayslipEmp.allowances + overtimePay;
                const pension7 = previewPayslipEmp.baseSalary * 0.07;
                const taxableIncome = Math.max(0, grossPay - pension7);
                const tax = calculateIncomeTax(taxableIncome);
                const net = grossPay - pension7 - tax;

                return (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#09090b', fontSize: '0.85rem', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                          GROSS EARNINGS
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Base Salary:</span>
                          <strong style={{ color: '#09090b' }}>{formatETB(previewPayslipEmp.baseSalary)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Allowances:</span>
                          <strong style={{ color: '#09090b' }}>{formatETB(previewPayslipEmp.allowances)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Overtime ({overtimeHours} hrs @ 1.5x):</span>
                          <strong style={{ color: '#09090b' }}>{formatETB(overtimePay)}</strong>
                        </div>
                        <div style={{ borderTop: '2px solid #09090b', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <strong style={{ color: '#09090b' }}>Total Gross:</strong>
                          <strong style={{ color: '#09090b' }}>{formatETB(grossPay)}</strong>
                        </div>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#09090b', fontSize: '0.85rem', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                          STATUTORY DEDUCTIONS
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Pension Fund (7%):</span>
                          <strong style={{ color: '#09090b' }}>{formatETB(pension7)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Income Tax (PAYE):</span>
                          <strong style={{ color: '#ca8a04' }}>{formatETB(tax)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Salary Advance:</span>
                          <strong style={{ color: '#94a3b8' }}>ETB 0</strong>
                        </div>
                        <div style={{ borderTop: '2px solid #09090b', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <strong style={{ color: '#09090b' }}>Total Withheld:</strong>
                          <strong style={{ color: '#ca8a04' }}>{formatETB(pension7 + tax)}</strong>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#09090b',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.725rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 800 }}>
                          NET SALARY PAYABLE
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                          Credited directly to {previewPayslipEmp.bankName}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#facc15' }}>
                        {formatETB(net)}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.725rem', color: '#64748b', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      Certified as accurate per Ethiopian Proclamation No. 979/2016 (Federal Income Tax) and Pension Proclamation No. 715/2011.
                    </div>
                  </div>
                );
              })()}
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button className="btn-hr-outline" onClick={() => setPreviewPayslipEmp(null)}>
                <span>Close Preview</span>
              </button>
              <button
                className="btn-hr-black"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={15} color="#facc15" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: 360° EMPLOYEE DOSSIER VIEW
          ======================================================== */}
      {viewEmployee360 && (
        <div
          onClick={() => setViewEmployee360(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BadgeCheck size={20} color="#facc15" />
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                    360° Personnel Dossier
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: '#facc15' }}>
                    {viewEmployee360.employeeId} • {viewEmployee360.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewEmployee360(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const detail = DETAILED_EMPLOYEES_MAP[viewEmployee360.id];

              return (
                <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                  {/* Top card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#09090b' }}>
                        {viewEmployee360.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        {viewEmployee360.position} • {viewEmployee360.department.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ca8a04', marginTop: '4px' }}>
                        {detail?.bandLevel || 'Band L3 — Professional'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          background: '#09090b',
                          color: '#facc15',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        ★ {detail?.performanceRating || 4.8} / 5.0
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                        {detail?.boxMatrixPosition || 'Star Performer'}
                      </div>
                    </div>
                  </div>

                  {/* Grid of details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', marginBottom: '18px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Reporting Manager:</div>
                      <strong style={{ color: '#09090b' }}>{detail?.managerName || 'General Manager'}</strong>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Duty Station / Location:</div>
                      <strong style={{ color: '#09090b' }}>{detail?.location || 'Bole Lemi Factory Campus'}</strong>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Kebele / National ID:</div>
                      <strong style={{ color: '#09090b' }}>{detail?.kebeleId || 'KB-08-99201'}</strong>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Medical Insurance Tier:</div>
                      <strong style={{ color: '#09090b' }}>{detail?.medicalInsuranceTier || 'Corporate Gold Tier'}</strong>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#09090b', marginBottom: '4px' }}>
                      Emergency Contact:
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                      {detail?.emergencyContact.name} ({detail?.emergencyContact.relationship}) —{' '}
                      <strong>{detail?.emergencyContact.phone}</strong>
                    </div>
                  </div>

                  {/* Certifications list */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
                      Active Skills & Factory Certifications:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {detail?.certifications.map((cert, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.775rem',
                            color: '#334155',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '8px 12px',
                          }}
                        >
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button className="btn-hr-black" onClick={() => setViewEmployee360(null)}>
                <span>Close Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: TAX & SALARY SIMULATOR WIDGET
          ======================================================== */}
      {showSimulatorModal && (
        <div
          onClick={() => setShowSimulatorModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color="#facc15" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                  Ethiopian Income Tax & Salary Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <label style={{ fontWeight: 700, color: '#09090b' }}>Base Monthly Salary: {formatETB(simSalary)}</label>
                  <span style={{ color: '#64748b' }}>Range: 2k - 60k ETB</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="60000"
                  step="500"
                  style={{ width: '100%', accentColor: '#09090b', cursor: 'pointer' }}
                  value={simSalary}
                  onChange={(e) => setSimSalary(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <label style={{ fontWeight: 700, color: '#09090b' }}>Allowances (Transport, etc.): {formatETB(simAllowances)}</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="500"
                  style={{ width: '100%', accentColor: '#09090b', cursor: 'pointer' }}
                  value={simAllowances}
                  onChange={(e) => setSimAllowances(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <label style={{ fontWeight: 700, color: '#09090b' }}>Estimated Overtime Hours: {simOvertimeHours} hrs (1.5x)</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  style={{ width: '100%', accentColor: '#09090b', cursor: 'pointer' }}
                  value={simOvertimeHours}
                  onChange={(e) => setSimOvertimeHours(parseFloat(e.target.value))}
                />
              </div>

              {/* Simulation Result Box */}
              <div
                style={{
                  background: '#09090b',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#a1a1aa' }}>Calculated Total Gross Pay:</span>
                  <strong style={{ color: '#ffffff' }}>{formatETB(simGross)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#a1a1aa' }}>7% Employee Pension:</span>
                  <strong style={{ color: '#e2e8f0' }}>{formatETB(simPension7)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#a1a1aa' }}>11% Employer Pension (Co. Cost):</span>
                  <strong style={{ color: '#e2e8f0' }}>{formatETB(simPension11)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#a1a1aa' }}>Statutory MoR Income Tax:</span>
                  <strong style={{ color: '#facc15' }}>{formatETB(simTax)} ({simEffectiveTaxRate}% eff.)</strong>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#facc15', fontWeight: 800, fontSize: '0.85rem' }}>SIMULATED NET TAKE-HOME:</span>
                  <strong style={{ color: '#facc15', fontSize: '1.4rem', fontWeight: 900 }}>
                    {formatETB(simNet)}
                  </strong>
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <button className="btn-hr-black" onClick={() => setShowSimulatorModal(false)}>
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ALLOCATE DIRECT LABOR TO WORK ORDER
          ======================================================== */}
      {showAllocateModal && (
        <div
          onClick={() => setShowAllocateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#facc15" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                  Allocate Direct Labor to Work Order
                </h3>
              </div>
              <button
                onClick={() => setShowAllocateModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAllocateLabor}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Select Workshop Operator *
                  </label>
                  <select
                    className="hr-select"
                    value={allocEmpId}
                    onChange={(e) => setAllocEmpId(e.target.value)}
                    required
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.position} ({formatETB(e.hourlyRate)}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Select Target Customer Work Order *
                  </label>
                  <select
                    className="hr-select"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Direct Labor Hours Worked *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    step="0.5"
                    className="hr-input"
                    value={allocHours}
                    onChange={(e) => setAllocHours(parseFloat(e.target.value) || 0)}
                    required
                  />
                  <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Direct workshop labor is costed at standard benchmark rate: 120 ETB/hr per operator.
                  </span>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Calculated Order Direct Labor Cost:</span>
                    <strong style={{ color: '#09090b' }}>{formatETB(allocHours * 120)}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setShowAllocateModal(false)}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <span>Allocate Hours</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: ULTRA-DETAILED COMPLIANCE STAFF ONBOARDING
          ======================================================== */}
      {showAddEmployeeModal && (
        <div
          onClick={() => setShowAddEmployeeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '92vh',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#facc15', padding: '8px', borderRadius: '8px', color: '#09090b' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem', fontWeight: 800 }}>
                    Factory Personnel Onboarding & Legal Dossier
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>
                    Ethiopian Labor Proclamation 1156/2019 • Notarized Legal Guarantor (ዋስ) • MoR Statutory Registration
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab navigation within Onboarding Modal */}
            <div
              style={{
                display: 'flex',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '6px 16px 0',
                overflowX: 'auto',
                gap: '4px',
              }}
            >
              {[
                { id: 'personal', label: '1. Personal & Identity', icon: UserCheck },
                { id: 'contract', label: '2. Contract & Station', icon: FileText },
                { id: 'compensation', label: '3. Salary & MoR Tax', icon: DollarSign },
                { id: 'guarantor', label: '4. Legal Guarantor (ዋስ)', icon: ShieldCheck },
                { id: 'emergency', label: '5. Emergency Contact', icon: Phone },
                { id: 'documents', label: '6. Document Checklist', icon: FileCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = onboardActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOnboardActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      color: isActive ? '#09090b' : '#64748b',
                      background: isActive ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderTop: isActive ? '2px solid #facc15' : '2px solid transparent',
                      borderTopLeftRadius: '6px',
                      borderTopRightRadius: '6px',
                      borderBottom: isActive ? '1px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={14} color={isActive ? '#ca8a04' : '#94a3b8'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                {/* TAB 1: PERSONAL & IDENTITY */}
                {onboardActiveTab === 'personal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.775rem', color: '#475569' }}>
                      📋 <strong>Identity Verification:</strong> Enter employee legal identification as per their Ethiopian National ID (Fayda) or Kebele Resident Card.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Full Legal Name (English) *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Yohannes Assefa Bekele"
                          value={newEmpName}
                          onChange={(e) => setNewEmpName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Date of Birth (DOB) *
                        </label>
                        <input
                          type="date"
                          className="hr-input"
                          value={newEmpDob}
                          onChange={(e) => setNewEmpDob(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Gender *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpGender}
                          onChange={(e) => setNewEmpGender(e.target.value as any)}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Marital Status *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpMarital}
                          onChange={(e) => setNewEmpMarital(e.target.value as any)}
                        >
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Kebele / National ID No. *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. KB-08-99201 / ET-8849"
                          value={newEmpNationalId}
                          onChange={(e) => setNewEmpNationalId(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Phone Number (+251) *
                        </label>
                        <input
                          type="tel"
                          className="hr-input"
                          placeholder="+251 911 234567"
                          value={newEmpPhone}
                          onChange={(e) => setNewEmpPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Personal Email Address
                        </label>
                        <input
                          type="email"
                          className="hr-input"
                          placeholder="yohannes.assefa@gmail.com"
                          value={newEmpEmail}
                          onChange={(e) => setNewEmpEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                        Residential Address (Region, Sub-City, Woreda, House No.) *
                      </label>
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Addis Ababa, Bole Sub-City, Woreda 03, House No. 812"
                        value={newEmpKebeleCity}
                        onChange={(e) => setNewEmpKebeleCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTRACT & POSITION */}
                {onboardActiveTab === 'contract' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.775rem', color: '#475569' }}>
                      📜 <strong>Employment Framework:</strong> Complies with Ethiopian Labor Proclamation 1156/2019 regarding probationary limits (max 45 days) and shift operations.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Designation / Job Role *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Senior CNC Router Specialist"
                          value={newEmpPosition}
                          onChange={(e) => setNewEmpPosition(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Factory / Functional Department *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpDept}
                          onChange={(e) => setNewEmpDept(e.target.value as any)}
                        >
                          <option value="production">Production & Signage Fabrication Floor</option>
                          <option value="stores">Inventory, Stores & Raw Media</option>
                          <option value="procurement">Procurement & Sheet Metal Supply</option>
                          <option value="sales">Commercial & B2B Signage Sales</option>
                          <option value="finance">Finance & Statutory Accounting</option>
                          <option value="admin">Operations & Plant Administration</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Contract Structure *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpContractType}
                          onChange={(e) => setNewEmpContractType(e.target.value as any)}
                        >
                          <option value="permanent">Indefinite (Permanent Staff)</option>
                          <option value="fixed_term">1-Year Fixed-Term Contract</option>
                          <option value="probation_45_days">Statutory 45-Day Probationary Trial</option>
                          <option value="apprentice">TVET Vocational Apprentice / Intern</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Contract Expiry / Renewal Date {newEmpContractType === 'fixed_term' && '*'}
                        </label>
                        <input
                          type="date"
                          className="hr-input"
                          value={newEmpContractEnd}
                          onChange={(e) => setNewEmpContractEnd(e.target.value)}
                          placeholder="Optional for permanent contracts"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Duty Station / Workshop Location *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpDutyStation}
                          onChange={(e) => setNewEmpDutyStation(e.target.value)}
                        >
                          <option value="Bole Lemi Industrial Zone, Dot Factory Campus">Bole Lemi Factory Campus (Main Production Plant)</option>
                          <option value="Kazanchis Commercial Head Office">Kazanchis Commercial Head Office (Sales & Admin)</option>
                          <option value="Lebu Industrial Stores & Warehouse">Lebu Raw Materials Depot & Vehicle Bay</option>
                          <option value="Regional Installation Mobile Team">Regional Installation Mobile Site Crew</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Shift Schedule *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpWorkShift}
                          onChange={(e) => setNewEmpWorkShift(e.target.value as any)}
                        >
                          <option value="standard_day">Day Shift (08:00 AM - 05:00 PM)</option>
                          <option value="evening_shift">Evening Shift (04:00 PM - 12:00 AM)</option>
                          <option value="night_shift">Night Shift UV Run (11:00 PM - 07:00 AM)</option>
                          <option value="flexible">Flexible / Field Installation Shift</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                        Statutory Notice Period (Days) *
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="90"
                        className="hr-input"
                        value={newEmpNoticePeriod}
                        onChange={(e) => setNewEmpNoticePeriod(parseInt(e.target.value) || 30)}
                      />
                      <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Standard 30 days statutory notice period as per proclamation guidelines.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: SALARY, MOR TAX & BANK */}
                {onboardActiveTab === 'compensation' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.775rem', color: '#475569' }}>
                      💰 <strong>Statutory MoR & Banking:</strong> Federal Income Tax Proclamation 979/2016 and 7% Employee / 11% Employer POESSA pension withholdings will automatically apply.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Base Monthly Salary (ETB) *
                        </label>
                        <input
                          type="number"
                          min="2000"
                          className="hr-input"
                          value={newEmpSalary}
                          onChange={(e) => setNewEmpSalary(parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Transport / Hardship Allowance (ETB)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="hr-input"
                          value={newEmpAllowances}
                          onChange={(e) => setNewEmpAllowances(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Hourly Direct Labor Cost Rate (ETB) *
                        </label>
                        <input
                          type="number"
                          min="10"
                          className="hr-input"
                          value={newEmpHourly}
                          onChange={(e) => setNewEmpHourly(parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Ethiopian Tax Identification Number (TIN) *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. 0039281729"
                          value={newEmpTin}
                          onChange={(e) => setNewEmpTin(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          POESSA Pension Scheme Number *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. PEN-82910"
                          value={newEmpPension}
                          onChange={(e) => setNewEmpPension(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Disbursement Bank *
                        </label>
                        <select
                          className="hr-select"
                          value={newEmpBank}
                          onChange={(e) => setNewEmpBank(e.target.value)}
                        >
                          <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                          <option value="Awash Bank">Awash Bank</option>
                          <option value="Dashen Bank">Dashen Bank</option>
                          <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                          <option value="Zemen Bank">Zemen Bank</option>
                          <option value="Telebirr Corporate Payroll">Telebirr Corporate Payroll</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Bank Account Number *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          value={newEmpAccount}
                          onChange={(e) => setNewEmpAccount(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: LEGAL GUARANTOR & WARRANTY (ዋስ) */}
                {onboardActiveTab === 'guarantor' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#fefce8', padding: '14px 16px', borderRadius: '8px', border: '1px solid #fef08a', fontSize: '0.775rem', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ShieldCheck size={24} color="#ca8a04" />
                      <div>
                        <strong>Mandatory Legal Guarantor Requirement (ዋስ / Wase):</strong>
                        <div style={{ marginTop: '2px' }}>
                          Factory personnel operating multimillion-birr industrial CNC router beds, laser cutting machines, high-rise boom lifts, or handling raw inventory require a notarized legal guarantee agreement.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Guarantor Full Legal Name (የዋስ ሙሉ ስም) *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Kassahun Wolde Gebre"
                          value={newEmpGuarantorName}
                          onChange={(e) => setNewEmpGuarantorName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Relationship to Employee (ዝምድና) *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Uncle / Civil Servant / Property Owner"
                          value={newEmpGuarantorRel}
                          onChange={(e) => setNewEmpGuarantorRel(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Guarantor Employer / Organization (መስሪያ ቤት) *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Commercial Bank of Ethiopia (Branch Head)"
                          value={newEmpGuarantorOrg}
                          onChange={(e) => setNewEmpGuarantorOrg(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Guarantor Job Title / Designation *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Senior Branch Manager / Officer"
                          value={newEmpGuarantorJob}
                          onChange={(e) => setNewEmpGuarantorJob(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Guarantor Phone Number *
                        </label>
                        <input
                          type="tel"
                          className="hr-input"
                          placeholder="+251 911 889900"
                          value={newEmpGuarantorPhone}
                          onChange={(e) => setNewEmpGuarantorPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Guarantor Kebele / ID Card *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. KB-04-77123"
                          value={newEmpGuarantorKebele}
                          onChange={(e) => setNewEmpGuarantorKebele(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Guarantee Bond Liability (ETB) *
                        </label>
                        <input
                          type="number"
                          min="10000"
                          step="10000"
                          className="hr-input"
                          value={newEmpGuarantorAmount}
                          onChange={(e) => setNewEmpGuarantorAmount(parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                        Warranty Letter Legal Notarization Status *
                      </label>
                      <select
                        className="hr-select"
                        value={newEmpGuarantorStatus}
                        onChange={(e) => setNewEmpGuarantorStatus(e.target.value as any)}
                      >
                        <option value="verified">✅ Verified & Authenticated by Doc Auth Agency (የሰነዶች ማረጋገጫ የፀደቀ)</option>
                        <option value="submitted">📄 Submitted & Pending Legal Dept Review (ለግምገማ የቀረበ)</option>
                        <option value="pending">⏳ Pending Submission within 15-day Grace Period (በሂደት ላይ)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TAB 5: EMERGENCY CONTACTS */}
                {onboardActiveTab === 'emergency' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.775rem', color: '#475569' }}>
                      🏥 <strong>Factory Emergency Protocol:</strong> Contact person designated in case of workshop accidents, medical hospitalization, or off-site installation incidents.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Emergency Contact Full Name *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Genet Bekele Tadesse"
                          value={newEmpEmergName}
                          onChange={(e) => setNewEmpEmergName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                          Relationship to Staff *
                        </label>
                        <input
                          type="text"
                          className="hr-input"
                          placeholder="e.g. Spouse / Father / Sister"
                          value={newEmpEmergRel}
                          onChange={(e) => setNewEmpEmergRel(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                        Primary Emergency Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="hr-input"
                        placeholder="+251 922 445566"
                        value={newEmpEmergPhone}
                        onChange={(e) => setNewEmpEmergPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* TAB 6: DOCUMENTS COMPLIANCE CHECKLIST */}
                {onboardActiveTab === 'documents' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.775rem', color: '#475569' }}>
                      📁 <strong>Mandatory Document Audit:</strong> Check and verify all required documentation prior to generating employee badge and signing final payroll entry.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        {
                          key: 'kebele',
                          checked: newEmpDocKebele,
                          toggle: () => setNewEmpDocKebele(!newEmpDocKebele),
                          title: 'National Kebele Resident ID / Fayda Biometric Card Copy',
                          sub: 'Clear photocopy verified against original government document',
                        },
                        {
                          key: 'contract',
                          checked: newEmpDocContract,
                          toggle: () => setNewEmpDocContract(!newEmpDocContract),
                          title: 'Signed Official Employment Contract Agreement',
                          sub: 'Two countersigned copies executed with DOT Advert General Manager stamp',
                        },
                        {
                          key: 'guarantor',
                          checked: newEmpDocGuarantor,
                          toggle: () => setNewEmpDocGuarantor(!newEmpDocGuarantor),
                          title: 'Notarized Legal Guarantor Letter (የዋስ ውልና ማረጋገጫ)',
                          sub: 'Signed guarantee bond document authenticated by Federal Doc Auth Agency',
                        },
                        {
                          key: 'education',
                          checked: newEmpDocEducation,
                          toggle: () => setNewEmpDocEducation(!newEmpDocEducation),
                          title: 'Educational Degree / TVET Level Certificate Copies',
                          sub: 'Machinery operation, CNC technology, or business management transcripts',
                        },
                        {
                          key: 'medical',
                          checked: newEmpDocMedical,
                          toggle: () => setNewEmpDocMedical(!newEmpDocMedical),
                          title: 'Pre-Employment Occupational Health & Fitness Clearance',
                          sub: 'Certified fitness check for factory floor machinery and height safety',
                        },
                        {
                          key: 'police',
                          checked: newEmpDocPolice,
                          toggle: () => setNewEmpDocPolice(!newEmpDocPolice),
                          title: 'Federal Police Fingerprint / Criminal Record Clearance',
                          sub: 'Valid clean police clearance certificate within the last 6 months',
                        },
                        {
                          key: 'pension',
                          checked: newEmpDocPension,
                          toggle: () => setNewEmpDocPension(!newEmpDocPension),
                          title: 'POESSA Pension & MoR Tax Registration Form',
                          sub: 'Private Organizations Employees Social Security Agency yellow form',
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={item.toggle}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: item.checked ? '#f0fdf4' : '#ffffff',
                            border: `1px solid ${item.checked ? '#bbf7d0' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: item.checked ? '#16a34a' : '#ffffff',
                                border: `2px solid ${item.checked ? '#16a34a' : '#cbd5e1'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                              }}
                            >
                              {item.checked && <Check size={14} />}
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.825rem', color: item.checked ? '#166534' : '#09090b' }}>
                                {item.title}
                              </strong>
                              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                                {item.sub}
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: item.checked ? '#16a34a' : '#94a3b8',
                              background: item.checked ? '#dcfce7' : '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.checked ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with tab navigation & submit */}
              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Step {['personal', 'contract', 'compensation', 'guarantor', 'emergency', 'documents'].indexOf(onboardActiveTab) + 1} of 6
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-hr-outline"
                    onClick={() => setShowAddEmployeeModal(false)}
                  >
                    <span>Cancel</span>
                  </button>

                  {onboardActiveTab !== 'documents' ? (
                    <button
                      type="button"
                      className="btn-hr-black"
                      onClick={() => {
                        const tabs = ['personal', 'contract', 'compensation', 'guarantor', 'emergency', 'documents'];
                        const currIdx = tabs.indexOf(onboardActiveTab);
                        if (currIdx < tabs.length - 1) {
                          setOnboardActiveTab(tabs[currIdx + 1] as any);
                        }
                      }}
                    >
                      <span>Next Section &rarr;</span>
                    </button>
                  ) : null}

                  <button type="submit" className="btn-hr-yellow">
                    <UserPlus size={15} />
                    <span>Complete Legal Onboarding & Register Personnel</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: SUBMIT LEAVE REQUEST
          ======================================================== */}
      {showLeaveModal && (
        <div
          onClick={() => setShowLeaveModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#facc15" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                  Submit Leave Application
                </h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLeave}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    <span>Staff Member *</span>
                    {roleView === 'employee' && (
                      <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                        ● Self-Service: Locked to your profile
                      </span>
                    )}
                  </label>
                  <select
                    className="hr-select"
                    value={leaveEmpId}
                    onChange={(e) => setLeaveEmpId(e.target.value)}
                    disabled={roleView === 'employee'}
                    required
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.position}){roleView === 'employee' && e.id === selectedEssEmp?.id ? ' — [Active Account]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Leave Classification *
                  </label>
                  <select
                    className="hr-select"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                  >
                    <option value="annual">Annual Leave (16 Days Entitlement)</option>
                    <option value="sick">Medical / Sick Leave</option>
                    <option value="compassionate">Compassionate / Bereavement</option>
                    <option value="maternity">Maternity Leave (120 Days)</option>
                    <option value="paternity">Paternity Leave (3 Days)</option>
                    <option value="unpaid">Unpaid Personal Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className="hr-input"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      className="hr-input"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Reason & Work Handover
                  </label>
                  <textarea
                    rows={3}
                    className="hr-input"
                    placeholder="Enter reason for leave and peer covering work..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setShowLeaveModal(false)}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 7: CLOCK IN / PUNCH ATTENDANCE
          ======================================================== */}
      {showClockInModal && (
        <div
          onClick={() => setShowClockInModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#facc15" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                  Terminal Biometric Attendance Clock-In
                </h3>
              </div>
              <button
                onClick={() => setShowClockInModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordClockIn}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    <span>Staff Member *</span>
                    {roleView === 'employee' && (
                      <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                        ● Self-Service: Locked to your profile
                      </span>
                    )}
                  </label>
                  <select
                    className="hr-select"
                    value={clockEmpId}
                    onChange={(e) => setClockEmpId(e.target.value)}
                    disabled={roleView === 'employee'}
                    required
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.position}){roleView === 'employee' && e.id === selectedEssEmp?.id ? ' — [Active Account]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Punch Timestamp *
                    </label>
                    <input
                      type="time"
                      className="hr-input"
                      value={clockTime}
                      onChange={(e) => setClockTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Punctuality Status *
                    </label>
                    <select
                      className="hr-select"
                      value={clockStatus}
                      onChange={(e) => setClockStatus(e.target.value as any)}
                    >
                      <option value="present">Present (On-Time)</option>
                      <option value="late">Late Arrival</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Overtime Shift Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    className="hr-input"
                    value={clockOvertime}
                    onChange={(e) => setClockOvertime(parseFloat(e.target.value) || 0)}
                  />
                  <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Compensated at standard 1.5x regular daytime hourly rate.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Log Notes
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="e.g. UV printer night run supervision"
                    value={clockNotes}
                    onChange={(e) => setClockNotes(e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setShowClockInModal(false)}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <span>Record Punch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 8: CREATE JOB REQUISITION / POSTING
          ======================================================== */}
      {showCreateJobModal && (
        <div
          onClick={() => setShowCreateJobModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={20} color="#facc15" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                  Publish Factory Job Opening & Requisition
                </h3>
              </div>
              <button
                onClick={() => setShowCreateJobModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateJobOpening} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Job Vacancy Title *
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="e.g. 3D Channel Letter Acrylic Welder & Assembler"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Department *
                    </label>
                    <select
                      className="hr-select"
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value as any)}
                    >
                      <option value="production">Production & Fabrication</option>
                      <option value="stores">Inventory & Stores</option>
                      <option value="procurement">Procurement</option>
                      <option value="sales">Commercial B2B Sales</option>
                      <option value="finance">Finance & Accounts</option>
                      <option value="admin">Operations / Safety</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Employment Type *
                    </label>
                    <select
                      className="hr-select"
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value as any)}
                    >
                      <option value="full_time">Full-Time Permanent</option>
                      <option value="contract">Fixed-Term Contract</option>
                      <option value="shift_work">Shift Operator</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Hiring Urgency *
                    </label>
                    <select
                      className="hr-select"
                      value={newJobUrgency}
                      onChange={(e) => setNewJobUrgency(e.target.value as any)}
                    >
                      <option value="urgent">🔥 Immediate / Urgent</option>
                      <option value="high">⚡ High Priority</option>
                      <option value="normal">Standard Pipeline</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Headcount Openings *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="hr-input"
                      value={newJobPositions}
                      onChange={(e) => setNewJobPositions(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Min Salary (ETB/mo) *
                    </label>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      className="hr-input"
                      value={newJobMinSalary}
                      onChange={(e) => setNewJobMinSalary(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Max Salary (ETB/mo) *
                    </label>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      className="hr-input"
                      value={newJobMaxSalary}
                      onChange={(e) => setNewJobMaxSalary(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Duty Station / Plant Location *
                    </label>
                    <input
                      type="text"
                      className="hr-input"
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      className="hr-input"
                      value={newJobDeadline}
                      onChange={(e) => setNewJobDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Job Role Summary & Mission *
                  </label>
                  <textarea
                    rows={2}
                    className="hr-input"
                    placeholder="Brief description of the job objectives and main daily operations..."
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Key Required Qualifications & Machines (One per line)
                  </label>
                  <textarea
                    rows={3}
                    className="hr-input"
                    placeholder="TVET Level IV Certificate in Manufacturing / Mechanical&#10;Minimum 2 years operating CNC router beds or laser cutting&#10;Proficiency in ArtCAM and AutoCAD G-Code generation"
                    value={newJobReqs}
                    onChange={(e) => setNewJobReqs(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Key Daily Responsibilities (One per line)
                  </label>
                  <textarea
                    rows={3}
                    className="hr-input"
                    placeholder="Perform zero-point calibration and feed rate optimization&#10;Fabricate 3D acrylic letters with zero material burn&#10;Conduct weekly stepper motor alignment and lubrication"
                    value={newJobResps}
                    onChange={(e) => setNewJobResps(e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => setShowCreateJobModal(false)}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <Briefcase size={15} />
                  <span>Publish Job Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 9: INSPECT JOB REQUISITION DETAILS
          ======================================================== */}
      {selectedJobDetail && (
        <div
          onClick={() => setSelectedJobDetail(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-yellow">{selectedJobDetail.department.toUpperCase()}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Requisition #{selectedJobDetail.id}</span>
                </div>
                <h3 style={{ margin: '6px 0 0', color: '#ffffff', fontSize: '1.15rem', fontWeight: 800 }}>
                  {selectedJobDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJobDetail(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Salary Range</div>
                  <strong style={{ fontSize: '0.85rem', color: '#09090b' }}>{selectedJobDetail.salaryRange}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Openings</div>
                  <strong style={{ fontSize: '0.85rem', color: '#09090b' }}>{selectedJobDetail.openPositions} Headcount</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Experience</div>
                  <strong style={{ fontSize: '0.85rem', color: '#09090b' }}>{selectedJobDetail.experienceLevel}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Deadline</div>
                  <strong style={{ fontSize: '0.85rem', color: '#e11d48' }}>{selectedJobDetail.deadline}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px' }}>
                  Role Description
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {selectedJobDetail.description}
                </p>
              </div>

              {selectedJobDetail.requirements && selectedJobDetail.requirements.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px' }}>
                    Required Technical Qualifications & Competencies
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
                    {selectedJobDetail.requirements.map((req, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJobDetail.responsibilities && selectedJobDetail.responsibilities.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px' }}>
                    Key Daily Shopfloor Responsibilities
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
                    {selectedJobDetail.responsibilities.map((resp, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJobDetail.benefits && selectedJobDetail.benefits.length > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', margin: '0 0 6px' }}>
                    Standard Factory Benefits & Allowances
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedJobDetail.benefits.map((b, i) => (
                      <span key={i} style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '4px', fontSize: '0.725rem', fontWeight: 700, color: '#15803d', padding: '3px 8px' }}>
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                className="btn-hr-black"
                onClick={() => setSelectedJobDetail(null)}
              >
                <span>Close Requisition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 10: ARRANGE INTERVIEW & SHOPFLOOR ASSESSMENT
          ======================================================== */}
      {showArrangeInterviewModal && selectedCandidateForInterview && (
        <div
          onClick={() => {
            setShowArrangeInterviewModal(false);
            setSelectedCandidateForInterview(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '580px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#facc15" />
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                    Arrange Candidate Interview & Practical Test
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#facc15' }}>
                    {selectedCandidateForInterview.fullName} • {selectedCandidateForInterview.jobTitle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowArrangeInterviewModal(false);
                  setSelectedCandidateForInterview(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Interview Date *
                    </label>
                    <input
                      type="date"
                      className="hr-input"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Time *
                    </label>
                    <input
                      type="time"
                      className="hr-input"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Interview Assessment Format *
                    </label>
                    <select
                      className="hr-select"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as any)}
                    >
                      <option value="practical_shopfloor_test">🛠 Practical Machine & Cutting Test</option>
                      <option value="technical_face_to_face">📐 Technical Blueprint & Portfolio Review</option>
                      <option value="hr_screening">📞 HR Behavioral & Cultural Screening</option>
                      <option value="remote_call">💻 Remote Video Call (Google Meet)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                      Duration (Mins) *
                    </label>
                    <select
                      className="hr-select"
                      value={interviewDuration}
                      onChange={(e) => setInterviewDuration(parseInt(e.target.value) || 45)}
                    >
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes (Standard Machine Test)</option>
                      <option value="90">90 Minutes (Comprehensive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Venue / Meeting Station *
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="e.g. Bole Lemi Factory CNC Lab 2 or Conf Room A"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Panel Interviewers (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    value={interviewers}
                    onChange={(e) => setInterviewers(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '6px' }}>
                    Preparation Notes & Machine Safety Instructions
                  </label>
                  <textarea
                    rows={2}
                    className="hr-input"
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    placeholder="e.g. Bring steel-toe safety boots, original TVET degree, and USB portfolio..."
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  className="btn-hr-outline"
                  onClick={() => {
                    setShowArrangeInterviewModal(false);
                    setSelectedCandidateForInterview(null);
                  }}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-hr-yellow">
                  <Calendar size={15} />
                  <span>Confirm & Send Interview Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 11: CANDIDATE DOSSIER, RATING & 1-CLICK HIRE
          ======================================================== */}
      {selectedCandidateDossier && (
        <div
          onClick={() => setSelectedCandidateDossier(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-yellow">{selectedCandidateDossier.stage.toUpperCase()}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Applied: {selectedCandidateDossier.appliedDate}</span>
                </div>
                <h3 style={{ margin: '4px 0 0', color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedCandidateDossier.fullName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#facc15', marginTop: '2px' }}>
                  Candidate for: {selectedCandidateDossier.jobTitle}
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateDossier(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Contact and Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Phone & Email</div>
                  <strong style={{ fontSize: '0.8rem', color: '#09090b' }}>{selectedCandidateDossier.phone}</strong>
                  <div style={{ fontSize: '0.725rem', color: '#475569' }}>{selectedCandidateDossier.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Experience & Education</div>
                  <strong style={{ fontSize: '0.8rem', color: '#09090b' }}>{selectedCandidateDossier.experienceYears} Years Active</strong>
                  <div style={{ fontSize: '0.725rem', color: '#475569' }}>{selectedCandidateDossier.educationLevel || 'Vocational Certified'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Expected Compensation</div>
                  <strong style={{ fontSize: '0.85rem', color: '#09090b' }}>{formatETB(selectedCandidateDossier.expectedSalary)}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>★ {selectedCandidateDossier.rating}/5 Evaluation</div>
                </div>
              </div>

              {selectedCandidateDossier.resumeSummary && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px' }}>
                    Professional Background Summary
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {selectedCandidateDossier.resumeSummary}
                  </p>
                </div>
              )}

              {selectedCandidateDossier.skills && selectedCandidateDossier.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px' }}>
                    Verified Machinery & Technical Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedCandidateDossier.skills.map((s, idx) => (
                      <span key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Interviews History */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#ca8a04" />
                  <span>Interview & Assessment Logs</span>
                </h4>
                {selectedCandidateDossier.interviews && selectedCandidateDossier.interviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCandidateDossier.interviews.map((iv) => (
                      <div key={iv.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.775rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#09090b' }}>
                          <span>{iv.date} @ {iv.time} ({iv.durationMinutes}m)</span>
                          <span className="badge badge-emerald">{iv.status.toUpperCase()}</span>
                        </div>
                        <div style={{ color: '#64748b', marginTop: '2px' }}>
                          Location: {iv.locationOrLink} • Panel: {iv.interviewers.join(', ')}
                        </div>
                        {iv.evaluationNotes && (
                          <div style={{ marginTop: '4px', color: '#334155', fontStyle: 'italic' }}>
                            "{iv.evaluationNotes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.775rem', color: '#64748b', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    No interview sessions recorded yet. Click "Arrange Interview" below to book a shopfloor practical assessment.
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <button
                type="button"
                className="btn-hr-outline"
                onClick={() => setSelectedCandidateDossier(null)}
              >
                <span>Close</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-hr-black"
                  onClick={() => {
                    setSelectedCandidateForInterview(selectedCandidateDossier);
                    setShowArrangeInterviewModal(true);
                  }}
                >
                  <Calendar size={14} color="#facc15" />
                  <span>Arrange Interview</span>
                </button>

                <button
                  type="button"
                  className="btn-hr-yellow"
                  onClick={() => handleOneClickHireCandidate(selectedCandidateDossier)}
                >
                  <UserPlus size={14} />
                  <span>Hire & Open Onboarding Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HrModuleDashboard() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
          <div
            style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid #facc15',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: '16px', fontWeight: 600, color: '#09090b', fontSize: '1rem' }}>
            Loading DOT Advert HR & Labor Platform...
          </p>
        </div>
      }
    >
      <HrModuleDashboardInner />
    </Suspense>
  );
}
