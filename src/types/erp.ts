// TypeScript definitions for Dot Advert ERP

export type ItemType = 'raw_material' | 'packaging' | 'semi_finished' | 'finished_good' | 'service';
export type UnitOfMeasure = 'kg' | 'liter' | 'piece' | 'meter' | 'sqm' | 'carton' | 'roll';
export type VatType = 'standard_15' | 'exempt' | 'zero_rated';

export interface Item {
  id: string;
  code: string;
  name: string;
  amharicName?: string;
  type: ItemType;
  unit: UnitOfMeasure;
  purchasePrice: number;
  sellingPrice: number;
  vatRate: number; // 0.15 or 0
  vatType: VatType;
  reorderLevel: number;
  reorderQuantity: number;
  currentStock: number;
  averageDailyUsage: number; // for Expected Days remaining calculation
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  storeBalances: { [storeId: string]: number };
}

export interface Store {
  id: string;
  code: string;
  name: string;
  location: string;
  storekeeper: string;
  storeType: 'main' | 'raw_material' | 'finished_goods' | 'production_floor';
  itemCount?: number;
}

export type MovementType =
  | 'purchase_receipt'
  | 'production_issue'
  | 'production_receipt'
  | 'sales_issue'
  | 'transfer'
  | 'adjustment'
  | 'wastage'
  | 'return';

export interface StockMovement {
  id: string;
  movementNumber: string;
  date: string;
  itemId: string;
  itemName: string;
  fromStoreId?: string;
  fromStoreName?: string;
  toStoreId?: string;
  toStoreName?: string;
  movementType: MovementType;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  totalCost: number;
  referenceType?: 'PO' | 'WORK_ORDER' | 'INVOICE' | 'ADJUSTMENT' | 'WASTE';
  referenceId?: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
}

export type WastageReason =
  | 'damaged'
  | 'expired'
  | 'spoiled'
  | 'production_scrap'
  | 'theft_loss'
  | 'measurement_error'
  | 'customer_return';

export interface WastageRecord {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  totalCost: number;
  storeId: string;
  storeName: string;
  reason: WastageReason;
  orderId?: string;
  orderNumber?: string;
  reportedBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  tin: string;
  address: string;
  phone: string;
  email: string;
  bankAccount: string;
  bankName: string;
  paymentTerms: string; // e.g. "Cash", "15 Days", "30 Days"
  category: 'raw_material' | 'packaging' | 'service' | 'equipment';
  isVatRegistered: boolean;
}

export type POStatus = 'draft' | 'approved' | 'partially_received' | 'received' | 'closed' | 'cancelled';

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  supplierTin: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  expectedDeliveryDate: string;
  status: POStatus;
  requestedBy: string;
  approvedBy?: string;
  paymentTerms: string;
  notes?: string;
}

export interface GoodsReceiptItem {
  itemId: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  acceptedQty: number;
  unit: UnitOfMeasure;
  batchLotNumber: string;
  storeId: string;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  date: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierName: string;
  items: GoodsReceiptItem[];
  storeId: string;
  storeName: string;
  inspectorName: string;
  qualityResult: 'passed' | 'partial' | 'failed';
  deliveryNoteNumber: string;
  notes?: string;
}

export type LeadStage = 'new' | 'site_visit' | 'quoted' | 'negotiation' | 'won' | 'lost';
export type LeadSource = 'walk_in' | 'phone_inquiry' | 'referral' | 'tender' | 'social_media' | 'field_sales';
export type SignageType =
  | 'acrylic_3d'
  | 'billboard_skin'
  | 'pylon_sign'
  | 'neon_led'
  | 'vehicle_branding'
  | 'expo_booth'
  | 'indoor_pos'
  | 'other';

export interface SiteSurvey {
  locationAddress: string;
  widthMeters: number;
  heightMeters: number;
  installationHeightMeters: number;
  powerSourceAvailable: boolean;
  indoorOutdoor: 'indoor' | 'outdoor';
  surveyDate?: string;
  surveyorName?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  date: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  tin?: string;
  city: string;
  stage: LeadStage;
  source: LeadSource;
  projectType: SignageType;
  estimatedBudget: number; // in ETB
  probabilityPercent: number; // 10 - 100%
  expectedCloseDate: string;
  assignedTo: string;
  siteSurvey?: SiteSurvey;
  notes?: string;
  convertedCustomerId?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  tin: string;
  address: string;
  phone: string;
  email: string;
  customerType: 'business' | 'individual' | 'government' | 'export';
  creditLimit: number;
  outstandingBalance: number;
  paymentTerms: string;
  isVatRegistered: boolean;
}

export type OrderStatus = 'pending' | 'in_production' | 'delivered' | 'invoiced' | 'paid' | 'cancelled';

export interface CustomerOrderItem {
  description: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  total: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerTin: string;
  title: string;
  items: CustomerOrderItem[];
  totalAgreedPrice: number; // Invoiced base revenue
  expectedDeliveryDate: string;
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface WorkOrderBomItem {
  itemId: string;
  itemName: string;
  plannedQty: number;
  actualIssuedQty: number;
  unit: UnitOfMeasure;
  unitCost: number;
  totalCost: number;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  customerOrderId: string;
  orderNumber: string;
  customerName: string;
  productDescription: string;
  plannedQty: number;
  actualGoodQty: number;
  scrapQty: number;
  startDate: string;
  endDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
  workCenterMachine: string;
  operatorNames: string[];
  machineHours: number;
  machineHourlyRate: number; // e.g., 650 ETB/hr
  bomItems: WorkOrderBomItem[];
}

export type InvoiceType = 'vat_15' | 'non_vat_exempt';
export type InvoicePaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerOrderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerTin: string;
  customerAddress: string;
  invoiceType: InvoiceType;
  exemptReason?: string;
  items: InvoiceItem[];
  subtotalNet: number; // Revenue base (excluding VAT)
  vatAmount: number;   // 15% VAT (collected on behalf of Ministry of Revenues)
  grandTotal: number;  // Net + VAT
  paymentStatus: InvoicePaymentStatus;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
}

export type PaymentMethod = 'telebirr' | 'chapa' | 'bank_transfer' | 'cash' | 'cheque';

export interface Collection {
  id: string;
  receiptNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amountReceived: number;
  paymentMethod: PaymentMethod;
  bankReference: string;
  remainingCustomerBalance: number;
  receivedBy: string;
  notes?: string;
}

export interface EmployeeGuarantor {
  fullName: string;
  relationship: string;
  organization: string;
  jobTitle?: string;
  phone: string;
  kebeleId?: string;
  guaranteeAmount?: number;
  letterStatus: 'verified' | 'submitted' | 'pending';
  notes?: string;
}

export interface EmployeeEmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  citySubCity?: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  category: 'identity' | 'contract' | 'warranty' | 'education' | 'medical' | 'police_clearance';
  fileUrl?: string;
  uploadDate: string;
  verified: boolean;
  notes?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: 'production' | 'stores' | 'procurement' | 'sales' | 'finance' | 'admin';
  baseSalary: number;
  hourlyRate: number;
  allowances: number;
  bankAccount: string;
  bankName: string;
  tin: string;
  pensionNumber: string;
  employmentStatus: 'active' | 'on_leave' | 'terminated';
  startDate: string;

  // Detailed Onboarding & Profile Attributes
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  maritalStatus?: 'single' | 'married' | 'divorced';
  nationalIdNumber?: string;
  kebeleCity?: string;
  phone?: string;
  email?: string;

  // Contract Details
  contractType?: 'permanent' | 'fixed_term' | 'probation_45_days' | 'apprentice';
  contractEndDate?: string;
  probationEndDate?: string;
  noticePeriodDays?: number;
  workShift?: 'standard_day' | 'evening_shift' | 'night_shift' | 'flexible';
  dutyStation?: string;

  // Warranty / Legal Guarantor (Wase / ዋስ)
  guarantor?: EmployeeGuarantor;

  // Emergency Contact
  emergencyContact?: EmployeeEmergencyContact;

  // Verified Onboarding Documents
  documents?: EmployeeDocument[];
}

export interface PayrollEntry {
  id: string;
  payrollMonth: string; // "2026-10"
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  attendanceDays: number;
  overtimeHours: number;
  overtimePay: number;
  allowances: number;
  grossPay: number;
  pensionEmployee7Pct: number;
  pensionEmployer11Pct: number;
  incomeTax: number;
  deductions: number;
  netPay: number;
  allocatedOrderId?: string;
  allocatedOrderNumber?: string;
}

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'compassionate' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_leave' | 'half_day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string; // e.g. "08:02"
  checkOut?: string; // e.g. "17:15"
  status: AttendanceStatus;
  overtimeHours: number;
  notes?: string;
  checkInPhoto?: string;
  checkOutPhoto?: string;
  photoVerified?: boolean;
  terminalLocation?: string;
}

export type RecruitmentStage = 'sourcing' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: 'full_time' | 'contract' | 'shift_work';
  openPositions: number;
  location: string;
  experienceLevel: string;
  salaryRange: string;
  status: 'active' | 'closed' | 'draft';
  postedDate: string;
  deadline: string;
  applicantsCount: number;
  description: string;
  urgency?: 'urgent' | 'normal' | 'high';
  requirements?: string[];
  responsibilities?: string[];
  skillsKeywords?: string[];
  benefits?: string[];
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  date: string; // "2026-10-24"
  time: string; // "10:30"
  durationMinutes: number; // 45
  interviewType: 'practical_shopfloor_test' | 'technical_face_to_face' | 'hr_screening' | 'remote_call';
  interviewers: string[];
  locationOrLink: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scoreRating?: number; // 1 to 5
  evaluationNotes?: string;
  preparationChecklist?: string[];
}

export interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  phone: string;
  email: string;
  experienceYears: number;
  currentEmployer?: string;
  expectedSalary: number;
  stage: RecruitmentStage;
  appliedDate: string;
  rating: number; // 1 to 5
  notes?: string;
  resumeSummary?: string;
  portfolioUrl?: string;
  skills?: string[];
  educationLevel?: string;
  interviewDate?: string;
  interviewStatus?: string;
  interviews?: InterviewSchedule[];
}

export type ExpenseCostType = 'fixed' | 'variable' | 'semi_variable';
export type ExpenseCategory =
  | 'workshop_rent'
  | 'electricity'
  | 'generator_fuel'
  | 'machine_maintenance'
  | 'delivery_transport'
  | 'admin_salaries'
  | 'security'
  | 'office_supplies'
  | 'order_direct_supplies';

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: ExpenseCategory;
  categoryLabel: string;
  costType: ExpenseCostType;
  supplierOrPayee: string;
  amountNet: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  department: string;
  orderId?: string; // Direct order linkage
  orderNumber?: string;
  status: 'approved' | 'pending';
  receiptRef?: string;
  notes?: string;
}

export interface OrderProfitability {
  orderId: string;
  orderNumber: string;
  customerName: string;
  orderTitle: string;
  orderRevenue: number; // Net invoice amount excluding VAT
  directMaterialCost: number;
  directLaborCost: number;
  machineCost: number;
  packagingCost: number;
  orderTransportCost: number;
  allocatedOverheadCost: number;
  wastageCost: number;
  totalOrderCost: number;
  grossProfit: number; // Revenue - Variable Cost
  orderProfit: number; // Revenue - Total Cost
  profitMarginPct: number; // (Order Profit / Order Revenue) * 100
  status: OrderStatus;
}

export type ErpRole =
  | 'general_manager'
  | 'super_admin'
  | 'admin'
  | 'hr_manager'
  | 'employee'
  | 'storekeeper'
  | 'procurement_officer'
  | 'production_supervisor'
  | 'machine_operator'
  | 'sales_rep'
  | 'accountant_cashier'
  | 'hr_officer';

