import { LeaveRequest, AttendanceRecord, JobOpening, Candidate, InterviewSchedule } from '@/types/erp';

export interface OrgEmployeeDetail {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  bandLevel: string; // e.g. "Band L4 — Senior Lead"
  managerName: string;
  location: string;
  kebeleId: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInsuranceTier: string; // e.g. "Jubilee Gold Tier — 100% Hospital Coverage"
  certifications: string[];
  kpiScorePct: number; // 92%
  performanceRating: number; // 4.8 / 5.0
  boxMatrixPosition: 'Star' | 'High Impact' | 'Core' | 'Growth';
}

export const DETAILED_EMPLOYEES_MAP: Record<string, OrgEmployeeDetail> = {
  'emp-1': {
    id: 'emp-1',
    employeeId: 'EMP-001',
    name: 'Alazar Tadesse',
    position: 'Production Lead & CNC Supervisor',
    department: 'production',
    bandLevel: 'Band L4 — Senior Supervisor',
    managerName: 'General Manager (Mulugeta Teshome)',
    location: 'Bole Lemi Industrial Zone, Plant #2',
    kebeleId: 'KB-08-29481',
    emergencyContact: {
      name: 'Tigist Haile',
      relationship: 'Spouse',
      phone: '+251 911 234567',
    },
    medicalInsuranceTier: 'Nyala Insurance VIP Executive — 100% Inpatient/Outpatient',
    certifications: [
      'ArtCAM / SolidWorks 3D Routing Certified',
      'OSHA Factory High-Voltage Safety',
      'First Aid & Workshop Fire Marshal',
    ],
    kpiScorePct: 96,
    performanceRating: 4.9,
    boxMatrixPosition: 'Star',
  },
  'emp-2': {
    id: 'emp-2',
    employeeId: 'EMP-002',
    name: 'Ermias Kebede',
    position: 'Large Format Printer Operator',
    department: 'production',
    bandLevel: 'Band L2 — Technician Specialist',
    managerName: 'Alazar Tadesse (Production Lead)',
    location: 'Bole Lemi Industrial Zone, Clean Room A',
    kebeleId: 'KB-03-88291',
    emergencyContact: {
      name: 'Kebede Alemu',
      relationship: 'Father',
      phone: '+251 922 456789',
    },
    medicalInsuranceTier: 'Nyala Standard Corporate Health Tier',
    certifications: [
      'Ricoh Gen5 / Konica Print Head Calibration',
      'UV-Curing Ink Chemical Safety Certification',
    ],
    kpiScorePct: 91,
    performanceRating: 4.5,
    boxMatrixPosition: 'Core',
  },
  'emp-3': {
    id: 'emp-3',
    employeeId: 'EMP-003',
    name: 'Biniyam Assefa',
    position: '3D Letter & Acrylic Fabricator',
    department: 'production',
    bandLevel: 'Band L3 — Senior Artisan',
    managerName: 'Alazar Tadesse (Production Lead)',
    location: 'Bole Lemi Industrial Zone, Assembly Floor',
    kebeleId: 'KB-12-77291',
    emergencyContact: {
      name: 'Aster Zewde',
      relationship: 'Mother',
      phone: '+251 933 678901',
    },
    medicalInsuranceTier: 'Nyala Standard Corporate Health Tier',
    certifications: [
      'Precision Acrylic Bending & Flame Polishing',
      'High-Rise Signage Structural Anchor Certification',
    ],
    kpiScorePct: 94,
    performanceRating: 4.7,
    boxMatrixPosition: 'High Impact',
  },
  'emp-4': {
    id: 'emp-4',
    employeeId: 'EMP-004',
    name: 'Dawit Bekele',
    position: 'Head Storekeeper & Inventory Controller',
    department: 'stores',
    bandLevel: 'Band L3 — Operations Lead',
    managerName: 'General Manager (Mulugeta Teshome)',
    location: 'Main Warehouse & Raw Materials Depot',
    kebeleId: 'KB-05-99214',
    emergencyContact: {
      name: 'Hiwot Bekele',
      relationship: 'Sister',
      phone: '+251 944 890123',
    },
    medicalInsuranceTier: 'Nyala Standard Corporate Health Tier',
    certifications: [
      'APICS Certified Supply Chain Associate (CSCA)',
      'FIFO / Barcode Auditing Master',
    ],
    kpiScorePct: 95,
    performanceRating: 4.8,
    boxMatrixPosition: 'High Impact',
  },
  'emp-5': {
    id: 'emp-5',
    employeeId: 'EMP-005',
    name: 'Rahel Girma',
    position: 'Senior Accountant & Tax Specialist',
    department: 'finance',
    bandLevel: 'Band L4 — Senior Controller',
    managerName: 'General Manager (Mulugeta Teshome)',
    location: 'Kazanchis Commercial Office, 4th Floor',
    kebeleId: 'KB-01-38192',
    emergencyContact: {
      name: 'Girma Wolde',
      relationship: 'Father',
      phone: '+251 910 112233',
    },
    medicalInsuranceTier: 'Nyala Insurance VIP Executive — 100% Inpatient/Outpatient',
    certifications: [
      'ACCA Qualified Fellow',
      'Ministry of Revenues Certified Ethiopian Tax Agent',
    ],
    kpiScorePct: 98,
    performanceRating: 4.95,
    boxMatrixPosition: 'Star',
  },
  'emp-6': {
    id: 'emp-6',
    employeeId: 'EMP-006',
    name: 'Selamawit Abebe',
    position: 'Key Account Sales Executive',
    department: 'sales',
    bandLevel: 'Band L3 — Senior Account Manager',
    managerName: 'Commercial Director (Hanna Mengesha)',
    location: 'Kazanchis Commercial Office & Client On-Site',
    kebeleId: 'KB-07-49201',
    emergencyContact: {
      name: 'Abebe Tadesse',
      relationship: 'Brother',
      phone: '+251 912 334455',
    },
    medicalInsuranceTier: 'Nyala Standard Corporate Health Tier',
    certifications: [
      'Consultative B2B Contract Negotiation Certified',
      'National Public Tender Procurement Law Certification',
    ],
    kpiScorePct: 97,
    performanceRating: 4.85,
    boxMatrixPosition: 'Star',
  },
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-2',
    employeeName: 'Ermias Kebede',
    department: 'production',
    leaveType: 'annual',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    daysCount: 3,
    reason: 'Family visit to Hawassa for Meskel seasonal celebration',
    status: 'pending',
    appliedDate: '2026-10-18',
  },
  {
    id: 'leave-2',
    employeeId: 'emp-4',
    employeeName: 'Dawit Bekele',
    department: 'stores',
    leaveType: 'sick',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    daysCount: 2,
    reason: 'Severe acute throat infection; medical certificate provided from Yekatit 12 Hospital',
    status: 'approved',
    appliedDate: '2026-10-12',
    approvedBy: 'HR Director',
  },
  {
    id: 'leave-3',
    employeeId: 'emp-6',
    employeeName: 'Selamawit Abebe',
    department: 'sales',
    leaveType: 'annual',
    startDate: '2026-11-02',
    endDate: '2026-11-06',
    daysCount: 5,
    reason: 'Annual scheduled rest leave following closing of Ethiopian Airlines Mega-Tender',
    status: 'approved',
    appliedDate: '2026-10-15',
    approvedBy: 'General Manager',
  },
  {
    id: 'leave-4',
    employeeId: 'emp-3',
    employeeName: 'Biniyam Assefa',
    department: 'production',
    leaveType: 'compassionate',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    daysCount: 3,
    reason: 'Close family bereavement ceremony',
    status: 'pending',
    appliedDate: '2026-10-19',
  },
  {
    id: 'leave-5',
    employeeId: 'emp-5',
    employeeName: 'Rahel Girma',
    department: 'finance',
    leaveType: 'annual',
    startDate: '2026-11-20',
    endDate: '2026-11-25',
    daysCount: 5,
    reason: 'Pre-planned personal annual leave period',
    status: 'pending',
    appliedDate: '2026-10-17',
  },
];

export const makeBiometricSelfie = (nameOrInitials: string, bg: string = '#2563eb', label: string = 'CHECK-IN VERIFIED') => {
  // Extract initials if full name is passed
  const cleanStr = (nameOrInitials || 'EMP').trim();
  const parts = cleanStr.split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : cleanStr.slice(0, 2).toUpperCase();

  let resolvedBg = bg;
  let resolvedLabel = label;
  if (bg === 'check-in' || bg === 'in') {
    resolvedBg = '#1d4ed8'; // Royal Blue
    resolvedLabel = 'IN: VERIFIED';
  } else if (bg === 'check-out' || bg === 'out') {
    resolvedBg = '#0f766e'; // Deep Teal
    resolvedLabel = 'OUT: VERIFIED';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${resolvedBg}" />
        <stop offset="100%" stop-color="#09090b" />
      </linearGradient>
    </defs>
    <rect width="140" height="140" rx="18" fill="url(#bgGrad)"/>
    <circle cx="70" cy="50" r="26" fill="#ffffff" fill-opacity="0.9"/>
    <path d="M30 118 C30 88 48 78 70 78 C92 78 110 88 110 118 Z" fill="#ffffff" fill-opacity="0.9"/>
    <ellipse cx="70" cy="62" rx="46" ry="54" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6,4"/>
    <text x="70" y="56" font-family="sans-serif" font-size="16" font-weight="900" fill="#09090b" text-anchor="middle">${initials}</text>
    <rect x="12" y="112" width="116" height="20" rx="6" fill="#09090b" fill-opacity="0.92"/>
    <circle cx="24" cy="122" r="3.5" fill="#22c55e" />
    <text x="72" y="125.5" font-family="sans-serif" font-size="7.5" font-weight="900" fill="#22c55e" text-anchor="middle">${resolvedLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'Alazar Tadesse',
    department: 'production',
    date: '2026-10-20',
    checkIn: '07:48',
    checkOut: '17:30',
    status: 'present',
    overtimeHours: 2.5,
    notes: 'Supervised CNC late night precision milling run',
    checkInPhoto: makeBiometricSelfie('AT', '#3b82f6', 'IN: 07:48 VERIFIED'),
    checkOutPhoto: makeBiometricSelfie('AT', '#1d4ed8', 'OUT: 17:30 VERIFIED'),
    photoVerified: true,
    terminalLocation: 'Bole Plant Gate #2 (Face Cam Terminal)',
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    employeeName: 'Ermias Kebede',
    department: 'production',
    date: '2026-10-20',
    checkIn: '08:14',
    checkOut: '17:00',
    status: 'late',
    overtimeHours: 1.0,
    notes: 'Bole road heavy traffic delay; notified supervisor',
    checkInPhoto: makeBiometricSelfie('EK', '#10b981', 'IN: 08:14 VERIFIED'),
    checkOutPhoto: makeBiometricSelfie('EK', '#047857', 'OUT: 17:00 VERIFIED'),
    photoVerified: true,
    terminalLocation: 'Bole Plant Gate #2 (Face Cam Terminal)',
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    employeeName: 'Biniyam Assefa',
    department: 'production',
    date: '2026-10-20',
    checkIn: '07:55',
    checkOut: '17:45',
    status: 'present',
    overtimeHours: 2.0,
    notes: 'Fabricating acrylic 3D letters for Awash Rooftop',
    checkInPhoto: makeBiometricSelfie('BA', '#f59e0b', 'IN: 07:55 VERIFIED'),
    checkOutPhoto: makeBiometricSelfie('BA', '#b45309', 'OUT: 17:45 VERIFIED'),
    photoVerified: true,
    terminalLocation: 'Bole Assembly Floor Gate #1',
  },
  {
    id: 'att-4',
    employeeId: 'emp-4',
    employeeName: 'Dawit Bekele',
    department: 'stores',
    date: '2026-10-20',
    checkIn: '07:58',
    checkOut: '17:05',
    status: 'present',
    overtimeHours: 0,
    notes: 'GRN inspection for imported Acrylic sheets',
    checkInPhoto: makeBiometricSelfie('DB', '#8b5cf6', 'IN: 07:58 VERIFIED'),
    checkOutPhoto: makeBiometricSelfie('DB', '#6d28d9', 'OUT: 17:05 VERIFIED'),
    photoVerified: true,
    terminalLocation: 'Kazanchis Logistics Hub Face Cam',
  },
  {
    id: 'att-5',
    employeeId: 'emp-5',
    employeeName: 'Rahel Girma',
    department: 'finance',
    date: '2026-10-20',
    checkIn: '08:02',
    checkOut: '17:15',
    status: 'present',
    overtimeHours: 0.5,
    notes: 'Monthly VAT & Withholding tax audit reconciliation',
    checkInPhoto: makeBiometricSelfie('RG', '#ec4899', 'IN: 08:02 VERIFIED'),
    checkOutPhoto: makeBiometricSelfie('RG', '#be185d', 'OUT: 17:15 VERIFIED'),
    photoVerified: true,
    terminalLocation: 'Kazanchis Finance Office Biometric Kiosk',
  },
  {
    id: 'att-6',
    employeeId: 'emp-6',
    employeeName: 'Selamawit Abebe',
    department: 'sales',
    date: '2026-10-20',
    checkIn: '08:30',
    checkOut: '17:00',
    status: 'present',
    overtimeHours: 0,
    notes: 'On-site field measurement visit with client',
    checkInPhoto: makeBiometricSelfie('SA', '#06b6d4', 'IN: 08:30 VERIFIED'),
    checkOutPhoto: makeBiometricSelfie('SA', '#0e7490', 'OUT: 17:00 VERIFIED'),
    photoVerified: true,
    terminalLocation: 'Mobile Sales App Geo-Selfie Check',
  },
];

export const INITIAL_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior CNC Router & Laser Cutting Specialist',
    department: 'production',
    type: 'full_time',
    openPositions: 2,
    location: 'Bole Lemi Industrial Zone, Dot Factory',
    experienceLevel: '3-5 years',
    salaryRange: '20,000 - 26,000 ETB/mo',
    status: 'active',
    urgency: 'urgent',
    postedDate: '2026-10-01',
    deadline: '2026-10-31',
    applicantsCount: 14,
    description: 'Lead operator for heavy-duty 3-axis CNC router bed and industrial CO2/fiber laser cutter. Executes precision cutouts on acrylic sheets, ACP composite panels, brass, and MDF for architectural 3D channel letters.',
    requirements: [
      'Diploma/BSc in Mechanical Technology, Manufacturing, or TVET Level IV CNC certificate',
      'Minimum 3 years active machine operation in advertising signage or metal/woodworking',
      'Proficiency in ArtCAM, AutoCAD, Aspire, or CorelDraw G-code toolpath generation',
      'Demonstrated material knowledge: Acrylic cast sheets, Alucobond ACP, Forex, Stainless steel sheets'
    ],
    responsibilities: [
      'Calibrate zero-points, spindle speeds, and feed rates to avoid raw material burns/scraps',
      'Maintain daily tool bits inventory (carbide endmills, v-groove, ball-nose cutters)',
      'Inspect cut parts against structural production blueprints before handing to welding team',
      'Execute routine lubrication and stepper motor alignment weekly'
    ],
    skillsKeywords: ['CNC Router Bed', 'Fiber Laser', 'ArtCAM', 'G-Code', 'ACP Routing', 'Acrylic Cutting'],
    benefits: ['1.5x Overtime Shift Rate', 'Factory Lunch & Transport Shuttle', 'Nyala VIP Health Coverage', 'Annual Safety Gear Allowance']
  },
  {
    id: 'job-2',
    title: 'Large-Format UV Flatbed & Hybrid Print Technician',
    department: 'production',
    type: 'full_time',
    openPositions: 1,
    location: 'Bole Lemi Industrial Zone, Dot Factory',
    experienceLevel: '2-4 years',
    salaryRange: '17,000 - 22,000 ETB/mo',
    status: 'active',
    urgency: 'high',
    postedDate: '2026-10-05',
    deadline: '2026-11-05',
    applicantsCount: 9,
    description: 'Expert industrial printer operator managing roll-to-roll and UV flatbed machinery (Ricoh Gen5 / Konica heads). Produces backlit signage film, billboard flex canvas, frosted vinyl, and direct-to-substrate acrylic displays.',
    requirements: [
      'TVET Certificate or Degree in Graphic Tech / Printing Operations',
      '2+ years operating large format solvent, eco-solvent, or UV curing printers',
      'Deep mastery of RIP software (Onyx, Photoprint, or Caldera) and ICC color profiles',
      'Handling toxic UV-curable inks with rigorous safety compliance'
    ],
    responsibilities: [
      'Perform color match proofs against corporate client pantone specifications',
      'Perform nozzle checks, ultrasonic print head cleanings, and anti-static grounding',
      'Manage raw media tensioning on vacuum beds for rigid boards up to 10cm thickness'
    ],
    skillsKeywords: ['UV Flatbed', 'Ricoh Gen5', 'Onyx RIP', 'ICC Profiling', 'Substrate Printing'],
    benefits: ['Chemical Hazard Allowance', 'Health Insurance', 'Overtime Compensation', 'Free Factory Transport']
  },
  {
    id: 'job-3',
    title: 'Corporate B2B Signage Key Account Executive',
    department: 'sales',
    type: 'full_time',
    openPositions: 2,
    location: 'Kazanchis Commercial Office, Addis Ababa',
    experienceLevel: '2+ years',
    salaryRange: '18,000 - 25,000 ETB + Commission',
    status: 'active',
    urgency: 'normal',
    postedDate: '2026-10-08',
    deadline: '2026-11-10',
    applicantsCount: 19,
    description: 'Drive high-ticket commercial accounts across Ethiopian banking, real estate, hospitality, and retail chains. Consultative sales of rooftop pylon signs, LED dynamic screens, and branch rebranding packages.',
    requirements: [
      'BA in Marketing, Business Management, Architecture, or related discipline',
      '2+ years B2B consultative solution sales track record in Addis Ababa corporate circles',
      'Valid Ethiopian 3rd grade driver license is an asset',
      'Fluent in Amharic & Professional English (verbal and formal RFP written proposals)'
    ],
    responsibilities: [
      'Identify enterprise tenders and coordinate cost estimations with factory engineers',
      'Lead site visits for technical dimension audits and municipal advertising billboard clearances',
      'Achieve minimum 850,000 ETB monthly booked signage orders'
    ],
    skillsKeywords: ['B2B Sales', 'Key Account Management', 'RFP Tender Bids', 'Corporate Real Estate'],
    benefits: ['Tiered Sales Commission (2.5% - 5%)', 'Fuel & Vehicle Allowance', 'Company Smartphone', 'Performance Bonus']
  },
  {
    id: 'job-4',
    title: 'Factory Structural Safety & Quality Inspector',
    department: 'admin',
    type: 'full_time',
    openPositions: 1,
    location: 'Bole Workshop Floor',
    experienceLevel: '4+ years',
    salaryRange: '22,000 - 28,000 ETB/mo',
    status: 'active',
    urgency: 'high',
    postedDate: '2026-10-10',
    deadline: '2026-11-15',
    applicantsCount: 6,
    description: 'Ensuring structural wind-load safety compliance for high-rise rooftop 3D signs, scaffolding protocol, welding joint penetration testing, and ISO factory occupational safety.',
    requirements: [
      'BSc in Civil Engineering, Structural Technology, or Occupational Health & Safety',
      '4+ years industrial structural inspection or facade installation safety',
      'Familiarity with Ethiopian Building Proclamation safety standards for outdoor advertisement structures'
    ],
    responsibilities: [
      'Perform ultrasonic and dye-penetrant weld testing on structural truss joints',
      'Inspect safety harnesses, ropes, crane riggings, and fall-arrest systems before deployment',
      'Audit monthly workshop waste disposal, chemical storage, and fire suppression systems'
    ],
    skillsKeywords: ['Structural Safety', 'Wind-Load Calculation', 'Weld Inspection', 'OSHA Standards'],
    benefits: ['Life & Disability Insurance', 'Mobile Airtime Package', 'Comprehensive Health Plan']
  },
];

export const INITIAL_INTERVIEWS: InterviewSchedule[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    candidateName: 'Yared Hailu',
    jobTitle: 'Senior CNC Router & Laser Cutting Specialist',
    date: '2026-10-22',
    time: '10:00',
    durationMinutes: 60,
    interviewType: 'practical_shopfloor_test',
    interviewers: ['Alazar Tadesse (Production Lead)', 'Bethlehem (HR Director)'],
    locationOrLink: 'Bole Lemi Factory — CNC Workshop Bed #02',
    status: 'scheduled',
    scoreRating: 5,
    evaluationNotes: 'Practical shopfloor evaluation scheduled: candidate will execute 10mm cast acrylic 3D profile cut with zero chip melt.',
    preparationChecklist: ['Bring steel-toe workshop boots', 'Prepare USB with ArtCAM toolpath files', 'National ID copy']
  },
  {
    id: 'int-2',
    candidateId: 'cand-5',
    candidateName: 'Mulugeta Worku',
    jobTitle: 'Factory Structural Safety & Quality Inspector',
    date: '2026-10-23',
    time: '14:30',
    durationMinutes: 45,
    interviewType: 'technical_face_to_face',
    interviewers: ['Mulugeta Teshome (General Manager)', 'Bethlehem (HR Director)'],
    locationOrLink: 'Kazanchis Commercial Office — Executive Boardroom A',
    status: 'scheduled',
    scoreRating: 5,
    evaluationNotes: 'Review high-altitude rooftop mounting permits and seismic/wind vibration load calculations for 12m pylon signs.',
    preparationChecklist: ['Structural engineering degree original', 'Past project safety portfolio', 'Reference contact list']
  },
  {
    id: 'int-3',
    candidateId: 'cand-2',
    candidateName: 'Natnael Tesfaye',
    jobTitle: 'Senior CNC Router & Laser Cutting Specialist',
    date: '2026-10-24',
    time: '11:15',
    durationMinutes: 45,
    interviewType: 'technical_face_to_face',
    interviewers: ['Alazar Tadesse (Production Lead)'],
    locationOrLink: 'Bole Lemi Plant — Foreman Office',
    status: 'scheduled',
    scoreRating: 4,
    evaluationNotes: 'G-code speed and feed rate oral assessment.',
    preparationChecklist: ['TVET Level IV Certification copy']
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    jobId: 'job-1',
    jobTitle: 'Senior CNC Router & Laser Cutting Specialist',
    fullName: 'Yared Hailu',
    phone: '+251 912 345678',
    email: 'yared.hailu@gmail.com',
    experienceYears: 4,
    currentEmployer: 'Rainbow Plastic & Advertising',
    expectedSalary: 24000,
    stage: 'interview',
    appliedDate: '2026-10-08',
    rating: 5,
    notes: 'Strong portfolio in 3D acrylic routing and LED module assembly. Practical machine test booked with Alazar.',
    resumeSummary: '4 years operating heavy industrial 3-axis CNC router beds. Expert in ArtCAM and multi-layer acrylic sign fabrication.',
    portfolioUrl: 'https://portfolio.dotadvert.et/yared-hailu-cnc',
    skills: ['ArtCAM', 'AutoCAD', 'CNC 3-Axis', 'Fiber Laser', 'Cast Acrylic', 'ACP Fabrication'],
    educationLevel: 'TVET Level IV - Machine Tool Tech',
    interviewDate: '2026-10-22 at 10:00 AM (Shopfloor Practical Test)',
    interviewStatus: 'Practical Test Confirmed',
    interviews: [INITIAL_INTERVIEWS[0]],
  },
  {
    id: 'cand-2',
    jobId: 'job-1',
    jobTitle: 'Senior CNC Router & Laser Cutting Specialist',
    fullName: 'Natnael Tesfaye',
    phone: '+251 922 987654',
    email: 'natnael.t@yahoo.com',
    experienceYears: 3,
    currentEmployer: 'Century Signage PLC',
    expectedSalary: 21000,
    stage: 'interview',
    appliedDate: '2026-10-12',
    rating: 4,
    notes: 'Good technical test results on ArtCAM toolpath creation. Interview scheduled for Oct 24.',
    resumeSummary: 'Experienced in aluminum composite cutting and wood relief routing. Prior supervisor at Century Signage.',
    skills: ['ArtCAM', 'G-Code', 'ACP Grooving', 'Wood Carving'],
    educationLevel: 'Diploma in Manufacturing Tech',
    interviewDate: '2026-10-24 at 11:15 AM',
    interviewStatus: 'Scheduled',
    interviews: [INITIAL_INTERVIEWS[2]],
  },
  {
    id: 'cand-3',
    jobId: 'job-2',
    jobTitle: 'Large-Format UV Flatbed Print Technician',
    fullName: 'Bethlehem Demisse',
    phone: '+251 911 654321',
    email: 'bethy.demisse@gmail.com',
    experienceYears: 3,
    currentEmployer: 'Master Printing Press',
    expectedSalary: 19500,
    stage: 'offer',
    appliedDate: '2026-10-06',
    rating: 5,
    notes: 'Formal offer letter dispatched for 20,500 ETB + transport allowance. Awaiting final acceptance or one-click hire.',
    resumeSummary: 'Certified Ricoh Gen5 operator with 3 years production floor experience. Specializes in white ink backing on glass and acrylic.',
    skills: ['Ricoh Gen5', 'Onyx RIP', 'ICC Color Calibration', 'Backlit Film', 'UV Curable Ink'],
    educationLevel: 'BSc in Graphic Technology - AAU',
    interviewDate: 'Passed Oct 16 (Score: 98%)',
    interviewStatus: 'Offer Extended',
  },
  {
    id: 'cand-4',
    jobId: 'job-3',
    jobTitle: 'Corporate B2B Signage Key Account Executive',
    fullName: 'Kidus Solomon',
    phone: '+251 930 112233',
    email: 'kidus.solo@outlook.com',
    experienceYears: 2,
    currentEmployer: 'Flintstone Engineering Sales',
    expectedSalary: 22000,
    stage: 'screening',
    appliedDate: '2026-10-14',
    rating: 4,
    notes: 'Strong client contacts in financial and retail banking sector. Ready for HR interview screening.',
    resumeSummary: 'Proven track record in high-value commercial construction sales and municipal signage permits in Addis Ababa.',
    skills: ['B2B Sales', 'Client Presentations', 'Contract Negotiation', 'Tender Preparation'],
    educationLevel: 'BA in Marketing Management',
  },
  {
    id: 'cand-5',
    jobId: 'job-4',
    jobTitle: 'Factory Structural Safety & Quality Inspector',
    fullName: 'Mulugeta Worku',
    phone: '+251 910 887766',
    email: 'mulugeta.w@gmail.com',
    experienceYears: 6,
    currentEmployer: 'MIDROC Construction Ethiopia',
    expectedSalary: 26000,
    stage: 'interview',
    appliedDate: '2026-10-11',
    rating: 5,
    notes: 'Certified in high-altitude rooftop mounting safety and crane rigging safety protocols. Interview set for Oct 23.',
    resumeSummary: '6 years of structural engineering and occupational safety on complex steel frameworks and high-rise facades.',
    skills: ['OSHA Safety', 'Structural Calculations', 'Weld NDT Testing', 'Crane Rigging'],
    educationLevel: 'BSc in Civil Engineering',
    interviewDate: '2026-10-23 at 02:30 PM',
    interviewStatus: 'Confirmed',
    interviews: [INITIAL_INTERVIEWS[1]],
  },
  {
    id: 'cand-6',
    jobId: 'job-1',
    jobTitle: 'Senior CNC Router & Laser Cutting Specialist',
    fullName: 'Henok Girma',
    phone: '+251 944 332211',
    email: 'henok.girma@gmail.com',
    experienceYears: 1,
    currentEmployer: 'Freelance Designer',
    expectedSalary: 18000,
    stage: 'sourcing',
    appliedDate: '2026-10-17',
    rating: 3,
    notes: 'Recently graduated from Tegbare-Id TVET college in manufacturing machinery. Enthusiastic learner.',
    resumeSummary: 'Junior machinist with strong CAD drafting and 3D modeling fundamentals.',
    skills: ['AutoCAD', 'CorelDraw', 'Shop Safety', 'Laser Cutting'],
    educationLevel: 'TVET Level III Certification',
  },
];

export const ATTENDANCE_WEEK_HISTORY = [
  { day: 'Mon', date: 'Oct 14', presentPct: 96, onTime: 5, late: 1, onLeave: 0, overtimeHrs: 5.5 },
  { day: 'Tue', date: 'Oct 15', presentPct: 100, onTime: 6, late: 0, onLeave: 0, overtimeHrs: 7.0 },
  { day: 'Wed', date: 'Oct 16', presentPct: 83, onTime: 4, late: 1, onLeave: 1, overtimeHrs: 6.0 },
  { day: 'Thu', date: 'Oct 17', presentPct: 100, onTime: 6, late: 0, onLeave: 0, overtimeHrs: 8.5 },
  { day: 'Fri', date: 'Oct 18', presentPct: 100, onTime: 5, late: 1, onLeave: 0, overtimeHrs: 9.0 },
  { day: 'Sat', date: 'Oct 19', presentPct: 67, onTime: 4, late: 0, onLeave: 0, overtimeHrs: 12.0 },
  { day: 'Sun', date: 'Oct 20', presentPct: 0, onTime: 0, late: 0, onLeave: 0, overtimeHrs: 0 },
];

export const COMPANY_OKRS = [
  {
    id: 'okr-1',
    objective: 'Factory Signage Scrap & Material Wastage Reduction',
    target: '< 3.0%',
    current: '2.4%',
    progressPct: 92,
    status: 'on_track',
    owner: 'Alazar Tadesse (Production)',
  },
  {
    id: 'okr-2',
    objective: 'On-Time Work Order Delivery for Key Banking Clients',
    target: '95.0%',
    current: '96.2%',
    progressPct: 98,
    status: 'exceeded',
    owner: 'Selamawit Abebe & Alazar',
  },
  {
    id: 'okr-3',
    objective: 'ISO 45001 Workshop Safety & Zero Lost-Time Incidents',
    target: '0 Accidents',
    current: '0 Incidents',
    progressPct: 100,
    status: 'achieved',
    owner: 'Operations Leadership',
  },
  {
    id: 'okr-4',
    objective: 'Statutory Ministry of Revenues (MoR) Filing Accuracy',
    target: '100% On-Time',
    current: '100% Filed',
    progressPct: 100,
    status: 'achieved',
    owner: 'Rahel Girma (Finance/Tax)',
  },
];

export const SALARY_BENCHMARKS = [
  { role: 'CNC Lead / Shop Supervisor', industryP25: 18000, industryP50: 22000, industryP75: 25000, dotSalary: 24000, competitiveTier: 'Top 15%' },
  { role: 'UV Flatbed Operator', industryP25: 12000, industryP50: 15000, industryP75: 18000, dotSalary: 16000, competitiveTier: 'Market Median' },
  { role: '3D Acrylic Fabricator', industryP25: 13000, industryP50: 16000, industryP75: 19000, dotSalary: 17500, competitiveTier: 'Top 30%' },
  { role: 'Senior Accountant / Tax', industryP25: 16000, industryP50: 19000, industryP75: 23000, dotSalary: 21000, competitiveTier: 'Top 25%' },
  { role: 'Head Storekeeper', industryP25: 11000, industryP50: 13500, industryP75: 15500, dotSalary: 14500, competitiveTier: 'Top 35%' },
  { role: 'B2B Sales Executive', industryP25: 14000, industryP50: 17000, industryP75: 22000, dotSalary: 18000, competitiveTier: 'Top 30%' },
];

export const WORKFORCE_STATS = {
  totalHeadcount: 6,
  activeStaff: 6,
  onLeave: 0,
  averageTenureYears: 2.1,
  monthlyTurnoverRatePct: 0.0,
  overtimeHoursThisMonth: 86,
  averageHourlyRateETB: 115,
  statutoryComplianceRatePct: 100,
  totalMonthlyPayrollETB: 111000,
  maleHeadcount: 4,
  femaleHeadcount: 2,
};
