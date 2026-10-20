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
  id: string;
  title: string; // e.g. "Main Facade 3D Acrylic Lettering", "Rooftop Sky Sign", "Driveway Pylon"
  signageType?: SignageType;
  locationAddress: string;
  widthMeters: number;
  heightMeters: number;
  depthMeters?: number; // 3D letter or box depth in meters (e.g. 0.15 = 15cm)
  installationHeightMeters: number; // ground clearance / elevation in meters
  powerSourceAvailable: boolean;
  indoorOutdoor: 'indoor' | 'outdoor';
  surveyDate?: string;
  surveyorName?: string;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'verified';
  leadId?: string;
  customerId?: string;
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
  siteSurveys?: SiteSurvey[];
  /** @deprecated backwards compatibility for single survey */
  siteSurvey?: SiteSurvey;
  notes?: string;
  convertedCustomerId?: string;
  lostReason?: string;
  lostNotes?: string;
  lostDate?: string;
  competitorName?: string;
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
  contactPerson?: string;
  siteSurveys?: SiteSurvey[];
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
  designProofId?: string;
}

export type DesignStatus =
  | 'drafting'
  | 'client_proofing'
  | 'revision_requested'
  | 'approved'
  | 'rejected';

export interface DesignRevision {
  id: string;
  versionNumber: number; // e.g. 1, 2, 3
  date: string;
  notes: string;
  authorName: string;
  status: DesignStatus;
}

export interface DesignProof {
  id: string;
  designNumber: string; // e.g. "DSG-2026-081"
  customerOrderId: string;
  orderNumber: string;
  customerName: string;
  title: string;
  designerName: string;
  status: DesignStatus;
  widthMeters: number;
  heightMeters: number;
  depthCm?: number;
  resolutionDpi: number; // e.g. 300 DPI
  colorProfile: 'CMYK' | 'Pantone' | 'RGB';
  materialSpec: string; // e.g. "3mm Cast Acrylic + 3M High-Tack Vinyl"
  mockupUrl?: string; // Preview artwork thumbnail/graphic url or badge
  clientContactPerson?: string;
  clientFeedback?: string;
  approvedDate?: string;
  approvedBy?: string;
  revisionCount: number;
  revisions: DesignRevision[];
  createdDate: string;
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
  status: 'scheduled' | 'in_progress' | 'quality_inspection' | 'completed' | 'on_hold';
  workCenterMachine: string;
  operatorNames: string[];
  machineHours: number;
  machineHourlyRate: number; // e.g., 650 ETB/hr
  bomItems: WorkOrderBomItem[];
  designProofId?: string;
  designNumber?: string;
  qualityInspectionNotes?: string;
  qualityInspector?: string;
  targetWorkCenters?: string[];
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
  | 'order_direct_supplies'
  | 'crane_scaffolding_rental'
  | 'installation_per_diem'
  | 'permits_licensing';

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
  orderDirectExpensesCost?: number;
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
  | 'storekeeper'
  | 'procurement_officer'
  | 'production_supervisor'
  | 'machine_operator'
  | 'sales_rep'
  | 'accountant_cashier'
  | 'hr_officer';
