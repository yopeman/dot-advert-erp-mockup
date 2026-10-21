'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Item,
  Store,
  StockMovement,
  WastageRecord,
  Supplier,
  PurchaseOrder,
  POStatus,
  Customer,
  CustomerOrder,
  WorkOrder,
  Invoice,
  Collection,
  Employee,
  Expense,
  OrderProfitability,
  ErpRole,
  MovementType,
  WastageReason,
  PaymentMethod,
  OrderStatus,
  Lead,
  LeadStage,
  SiteSurvey,
  DesignProof,
  DesignRevision,
  DesignStatus,
  WorkOrderBomItem,
  ProformaInvoice,
  ProformaStatus,
  StoreFinancials,
  ItemType,
} from '@/types/erp';
import {
  INITIAL_ITEMS,
  INITIAL_STORES,
  INITIAL_SUPPLIERS,
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_WORK_ORDERS,
  INITIAL_DESIGN_PROOFS,
  INITIAL_INVOICES,
  INITIAL_PROFORMAS,
  INITIAL_COLLECTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_EXPENSES,
  INITIAL_WASTAGE,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
} from '@/data/initialMockData';

const STORAGE_KEY_PREFIX = 'dot_advert_erp_v1_';

interface ErpContextType {
  // Datasets
  items: Item[];
  stores: Store[];
  suppliers: Supplier[];
  leads: Lead[];
  customers: Customer[];
  orders: CustomerOrder[];
  workOrders: WorkOrder[];
  designProofs: DesignProof[];
  invoices: Invoice[];
  proformas: ProformaInvoice[];
  collections: Collection[];
  employees: Employee[];
  expenses: Expense[];
  wastages: WastageRecord[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];

  // Role
  currentRole: ErpRole;
  setCurrentRole: (role: ErpRole) => void;

  // Actions
  addItem: (itemData: Omit<Item, 'id'>) => Item;
  addStockMovement: (params: {
    itemId: string;
    fromStoreId?: string;
    toStoreId?: string;
    movementType: MovementType;
    quantity: number;
    unitCost?: number;
    referenceType?: 'PO' | 'WORK_ORDER' | 'INVOICE' | 'ADJUSTMENT' | 'WASTE' | 'SUPPLIER_RETURN';
    referenceNumber?: string;
    counterparty?: string;
    notes?: string;
  }) => void;

  recordWastage: (params: {
    itemId: string;
    quantity: number;
    storeId: string;
    reason: WastageReason;
    orderId?: string;
    notes?: string;
  }) => void;

  // CRM & Customer Actions
  createLead: (lead: Omit<Lead, 'id' | 'leadNumber' | 'date'>) => Lead;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  markLeadAsLost: (leadId: string, lostData: { reason: string; notes?: string; competitorName?: string; date?: string }) => void;
  reopenLead: (leadId: string, targetStage?: LeadStage) => void;
  createCustomer: (customer: Omit<Customer, 'id' | 'code' | 'outstandingBalance'>) => Customer;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  convertLeadToCustomer: (leadId: string, customerData?: Partial<Customer>) => Customer;

  // Site Survey & Measurement Actions (Multiple per Lead/Customer)
  addSiteSurveyToLead: (leadId: string, survey: Omit<SiteSurvey, 'id'>) => SiteSurvey;
  updateLeadSiteSurvey: (leadId: string, surveyId: string, updates: Partial<SiteSurvey>) => void;
  deleteLeadSiteSurvey: (leadId: string, surveyId: string) => void;
  addSiteSurveyToCustomer: (customerId: string, survey: Omit<SiteSurvey, 'id'>) => SiteSurvey;
  updateCustomerSiteSurvey: (customerId: string, surveyId: string, updates: Partial<SiteSurvey>) => void;
  deleteCustomerSiteSurvey: (customerId: string, surveyId: string) => void;

  // Suppliers
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'code'> & { code?: string }) => Supplier;
  updateSupplier: (supplierId: string, updates: Partial<Supplier>) => void;

  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'date' | 'status'> & { status?: POStatus }) => PurchaseOrder;
  receivePurchaseOrder: (poId: string, storeId: string) => void;
  approvePurchaseOrder: (poId: string, approvedBy: string, approvalNotes?: string) => void;
  updatePurchaseOrderStatus: (poId: string, status: POStatus) => void;
  createCustomerOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'date' | 'status'>) => CustomerOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderSurveys: (orderId: string, siteSurveyIds: string[]) => void;

  // Graphic Design & Artwork Proof Actions
  createDesignProof: (proof: Omit<DesignProof, 'id' | 'designNumber' | 'createdDate' | 'revisions' | 'revisionCount'>) => DesignProof;
  updateDesignProof: (designId: string, updates: Partial<DesignProof>) => void;
  addDesignRevision: (designId: string, revision: { notes: string; authorName: string; status: DesignStatus }) => void;
  approveDesignProof: (designId: string, approverName: string, notes?: string) => void;
  requestDesignRevision: (designId: string, feedbackNotes: string) => void;

  // Work Orders & Production BOM Actions
  createWorkOrder: (wo: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'status' | 'actualGoodQty' | 'scrapQty'>) => void;
  updateWorkOrder: (woId: string, updates: Partial<WorkOrder>) => void;
  advanceWorkOrderStatus: (woId: string, status: WorkOrder['status']) => void;
  recordWorkOrderScrap: (woId: string, scrapData: { itemId: string; quantity: number; reason: WastageReason; notes?: string }) => void;
  addBomItemToWorkOrder: (woId: string, item: Omit<WorkOrderBomItem, 'totalCost'>) => void;

  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'paidAmount' | 'balanceDue' | 'paymentStatus'>) => Invoice;
  createProforma: (proforma: Omit<ProformaInvoice, 'id' | 'proformaNumber' | 'date' | 'status'>) => ProformaInvoice;
  updateProformaStatus: (proformaId: string, status: ProformaStatus) => void;
  convertProformaToInvoice: (proformaId: string) => Invoice | null;
  recordCollection: (params: {
    invoiceId: string;
    amountReceived: number;
    paymentMethod: PaymentMethod;
    bankReference: string;
    notes?: string;
  }) => void;
  recordExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'date' | 'status'>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (empId: string, updates: Partial<Employee>) => void;

  // Order Profitability Engine
  calculateOrderProfitability: (orderId: string) => OrderProfitability | null;
  allOrderProfitability: OrderProfitability[];

  // Analytics & Stats
  lowStockItems: { item: Item; expectedDays: number }[];
  companyFinancials: {
    totalRevenueNet: number;
    totalOutputVat: number;
    totalInputVat: number;
    netVatPayable: number;
    cogs: number;
    grossProfit: number;
    totalExpenses: number;
    operatingProfit: number;
    totalCollected: number;
    totalReceivables: number;
  };
  storeFinancials: StoreFinancials;

  // Demo Control
  resetDemoData: () => void;
  isHydrated: boolean;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export function ErpDataProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // States
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [designProofs, setDesignProofs] = useState<DesignProof[]>(INITIAL_DESIGN_PROOFS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [proformas, setProformas] = useState<ProformaInvoice[]>(INITIAL_PROFORMAS);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [wastages, setWastages] = useState<WastageRecord[]>(INITIAL_WASTAGE);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [currentRole, setCurrentRole] = useState<ErpRole>('general_manager');

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const getStored = (key: string, fallback: unknown) => {
        const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
        return item ? JSON.parse(item) : fallback;
      };

      setItems(getStored('items', INITIAL_ITEMS));
      setStores(getStored('stores', INITIAL_STORES));
      setSuppliers(getStored('suppliers', INITIAL_SUPPLIERS));

      const loadedLeads: Lead[] = getStored('leads', INITIAL_LEADS);
      const normalizedLeads = loadedLeads.map((l) => {
        if ((!l.siteSurveys || l.siteSurveys.length === 0) && l.siteSurvey) {
          const s = l.siteSurvey;
          return {
            ...l,
            siteSurveys: [
              {
                ...s,
                id: s.id || `srv-${l.id}-1`,
                title: s.title || `${l.companyName} Primary Signage`,
                leadId: l.id,
              },
            ],
          };
        }
        return l;
      });
      setLeads(normalizedLeads);

      const loadedCustomers: Customer[] = getStored('customers', INITIAL_CUSTOMERS);
      const normalizedCustomers = loadedCustomers.map((c) => {
        if (!c.siteSurveys) {
          return { ...c, siteSurveys: [] };
        }
        return c;
      });
      setCustomers(normalizedCustomers);
      setOrders(getStored('orders', INITIAL_ORDERS));
      setWorkOrders(getStored('workOrders', INITIAL_WORK_ORDERS));
      setDesignProofs(getStored('designProofs', INITIAL_DESIGN_PROOFS));
      setInvoices(getStored('invoices', INITIAL_INVOICES));
      setProformas(getStored('proformas', INITIAL_PROFORMAS));
      setCollections(getStored('collections', INITIAL_COLLECTIONS));
      setEmployees(getStored('employees', INITIAL_EMPLOYEES));
      setExpenses(getStored('expenses', INITIAL_EXPENSES));
      setWastages(getStored('wastages', INITIAL_WASTAGE));
      setPurchaseOrders(getStored('purchaseOrders', INITIAL_PURCHASE_ORDERS));
      setStockMovements(getStored('stockMovements', INITIAL_STOCK_MOVEMENTS));
      const savedRole = localStorage.getItem(STORAGE_KEY_PREFIX + 'role');
      if (savedRole) setCurrentRole(savedRole as ErpRole);
    } catch (e) {
      console.warn('LocalStorage hydration error, using initial defaults:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to LocalStorage helper
  const save = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, []);

  // Sync state changes to LocalStorage once hydrated
  useEffect(() => {
    if (!isHydrated) return;
    save('items', items);
  }, [items, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('stores', stores);
  }, [stores, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('suppliers', suppliers);
  }, [suppliers, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('leads', leads);
  }, [leads, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('customers', customers);
  }, [customers, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('orders', orders);
  }, [orders, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('workOrders', workOrders);
  }, [workOrders, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('designProofs', designProofs);
  }, [designProofs, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('invoices', invoices);
  }, [invoices, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('proformas', proformas);
  }, [proformas, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('collections', collections);
  }, [collections, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('expenses', expenses);
  }, [expenses, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('wastages', wastages);
  }, [wastages, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('purchaseOrders', purchaseOrders);
  }, [purchaseOrders, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    save('stockMovements', stockMovements);
  }, [stockMovements, isHydrated, save]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY_PREFIX + 'role', currentRole);
  }, [currentRole, isHydrated]);

  // RESET DEMO DATA
  const resetDemoData = useCallback(() => {
    localStorage.clear();
    setItems(INITIAL_ITEMS);
    setStores(INITIAL_STORES);
    setSuppliers(INITIAL_SUPPLIERS);
    setLeads(INITIAL_LEADS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setDesignProofs(INITIAL_DESIGN_PROOFS);
    setInvoices(INITIAL_INVOICES);
    setProformas(INITIAL_PROFORMAS);
    setCollections(INITIAL_COLLECTIONS);
    setEmployees(INITIAL_EMPLOYEES);
    setExpenses(INITIAL_EXPENSES);
    setWastages(INITIAL_WASTAGE);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setCurrentRole('general_manager');
  }, []);

  // MUTATOR: Add Item (SKU onboarding)
  const addItem = useCallback((itemData: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  // MUTATOR: Add Stock Movement
  const addStockMovement = useCallback(
    ({
      itemId,
      fromStoreId,
      toStoreId,
      movementType,
      quantity,
      unitCost,
      referenceType,
      referenceNumber,
      counterparty,
      notes,
    }: {
      itemId: string;
      fromStoreId?: string;
      toStoreId?: string;
      movementType: MovementType;
      quantity: number;
      unitCost?: number;
      referenceType?: 'PO' | 'WORK_ORDER' | 'INVOICE' | 'ADJUSTMENT' | 'WASTE' | 'SUPPLIER_RETURN';
      referenceNumber?: string;
      counterparty?: string;
      notes?: string;
    }) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const cost = unitCost ?? item.purchasePrice;
      const fromStore = stores.find((s) => s.id === fromStoreId);
      const toStore = stores.find((s) => s.id === toStoreId);

      const newMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        movementNumber: `MOV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        itemId: item.id,
        itemName: item.name,
        fromStoreId,
        fromStoreName: fromStore?.name,
        toStoreId,
        toStoreName: toStore?.name,
        movementType,
        quantity,
        unit: item.unit,
        unitCost: cost,
        totalCost: quantity * cost,
        referenceType,
        referenceNumber,
        counterparty,
        notes,
        createdBy: currentRole.replace('_', ' ').toUpperCase(),
      };

      setStockMovements((prev) => [newMovement, ...prev]);

      // Finance link: a PO-backed goods receipt settles the payable in Finance.
      if (movementType === 'purchase_receipt' && referenceType === 'PO' && referenceNumber) {
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            po.poNumber === referenceNumber && po.status !== 'received'
              ? { ...po, status: 'received' as const }
              : po
          )
        );
      }

      // Finance link: material issued from a store against a work order posts to that
      // work order's BOM so the cost rolls into job costing and COGS automatically.
      if ((movementType === 'production_issue' || movementType === 'sales_issue') && referenceNumber) {
        const linkedWo = workOrders.find(
          (wo) => wo.workOrderNumber === referenceNumber || wo.orderNumber === referenceNumber
        );
        if (linkedWo) {
          setWorkOrders((prev) =>
            prev.map((wo) => {
              if (wo.id !== linkedWo.id) return wo;
              const existing = wo.bomItems.find((b) => b.itemId === itemId);
              const bomItems = existing
                ? wo.bomItems.map((b) => {
                    if (b.itemId !== itemId) return b;
                    const issuedQty = (b.actualIssuedQty || 0) + quantity;
                    return {
                      ...b,
                      actualIssuedQty: issuedQty,
                      unitCost: cost,
                      totalCost: issuedQty * cost,
                    };
                  })
                : [
                    ...wo.bomItems,
                    {
                      itemId,
                      itemName: item.name,
                      plannedQty: quantity,
                      actualIssuedQty: quantity,
                      unit: item.unit,
                      unitCost: cost,
                      totalCost: quantity * cost,
                    },
                  ];
              return { ...wo, bomItems };
            })
          );
        }
      }

      // Update Item Stock and store balances
      setItems((prevItems) =>
        prevItems.map((it) => {
          if (it.id !== itemId) return it;

          let newCurrentStock = it.currentStock;
          const newBalances = { ...it.storeBalances };

          if (movementType === 'purchase_receipt' || movementType === 'production_receipt') {
            newCurrentStock += quantity;
            if (toStoreId) newBalances[toStoreId] = (newBalances[toStoreId] || 0) + quantity;
          } else if (
            movementType === 'production_issue' ||
            movementType === 'sales_issue' ||
            movementType === 'wastage'
          ) {
            newCurrentStock = Math.max(0, newCurrentStock - quantity);
            if (fromStoreId) {
              newBalances[fromStoreId] = Math.max(0, (newBalances[fromStoreId] || 0) - quantity);
            }
          } else if (movementType === 'return') {
            if (toStoreId) {
              newCurrentStock += quantity;
              newBalances[toStoreId] = (newBalances[toStoreId] || 0) + quantity;
            } else if (fromStoreId) {
              newCurrentStock = Math.max(0, newCurrentStock - quantity);
              newBalances[fromStoreId] = Math.max(0, (newBalances[fromStoreId] || 0) - quantity);
            }
          } else if (movementType === 'adjustment') {
            if (toStoreId) {
              newCurrentStock += quantity;
              newBalances[toStoreId] = (newBalances[toStoreId] || 0) + quantity;
            } else if (fromStoreId) {
              newCurrentStock = Math.max(0, newCurrentStock - quantity);
              newBalances[fromStoreId] = Math.max(0, (newBalances[fromStoreId] || 0) - quantity);
            }
          } else if (movementType === 'transfer') {
            if (fromStoreId) {
              newBalances[fromStoreId] = Math.max(0, (newBalances[fromStoreId] || 0) - quantity);
            }
            if (toStoreId) {
              newBalances[toStoreId] = (newBalances[toStoreId] || 0) + quantity;
            }
          }

          return {
            ...it,
            currentStock: newCurrentStock,
            storeBalances: newBalances,
          };
        })
      );
    },
    [items, stores, currentRole, workOrders]
  );

  // MUTATOR: Record Wastage
  const recordWastage = useCallback(
    ({
      itemId,
      quantity,
      storeId,
      reason,
      orderId,
      notes,
    }: {
      itemId: string;
      quantity: number;
      storeId: string;
      reason: WastageReason;
      orderId?: string;
      notes?: string;
    }) => {
      const item = items.find((i) => i.id === itemId);
      const store = stores.find((s) => s.id === storeId);
      const linkedOrder = orders.find((o) => o.id === orderId);
      if (!item || !store) return;

      const totalCost = quantity * item.purchasePrice;

      const newWaste: WastageRecord = {
        id: `wst-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        itemId: item.id,
        itemName: item.name,
        quantity,
        unit: item.unit,
        unitCost: item.purchasePrice,
        totalCost,
        storeId,
        storeName: store.name,
        reason,
        orderId,
        orderNumber: linkedOrder?.orderNumber,
        reportedBy: currentRole.replace('_', ' ').toUpperCase(),
        notes,
      };

      setWastages((prev) => [newWaste, ...prev]);

      // Also trigger a stock movement
      addStockMovement({
        itemId,
        fromStoreId: storeId,
        movementType: 'wastage',
        quantity,
        referenceType: 'WASTE',
        referenceNumber: newWaste.id,
        notes: `Wastage logged: ${reason} - ${notes || ''}`,
      });
    },
    [items, stores, orders, currentRole, addStockMovement]
  );

  // MUTATOR: Add Supplier
  const addSupplier = useCallback(
    (supplierData: Omit<Supplier, 'id' | 'code'> & { code?: string }): Supplier => {
      const code = supplierData.code || `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
      const newSupplier: Supplier = {
        ...supplierData,
        id: `sup-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        code,
      };
      setSuppliers((prev) => [newSupplier, ...prev]);
      return newSupplier;
    },
    [suppliers.length]
  );

  // MUTATOR: Update Supplier
  const updateSupplier = useCallback((supplierId: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplierId ? { ...s, ...updates } : s)));
  }, []);

  // MUTATOR: Create Purchase Order (Requires Admin Approval by default unless admin creates it)
  const createPurchaseOrder = useCallback(
    (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'date' | 'status'> & { status?: POStatus }): PurchaseOrder => {
      const isAdminRole = currentRole === 'admin' || currentRole === 'super_admin' || currentRole === 'general_manager';
      const initialStatus: POStatus = poData.status || (isAdminRole ? 'approved' : 'pending_admin');

      const newPO: PurchaseOrder = {
        ...poData,
        id: `po-${Date.now()}`,
        poNumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        status: initialStatus,
        approvedBy: initialStatus === 'approved' ? (poData.approvedBy || 'General Manager (Auto-Approved)') : undefined,
        approvedAt: initialStatus === 'approved' ? new Date().toISOString() : undefined,
      };

      setPurchaseOrders((prev) => [newPO, ...prev]);
      return newPO;
    },
    [currentRole]
  );

  // MUTATOR: Admin Approval for Purchase Order
  const approvePurchaseOrder = useCallback((poId: string, approvedBy: string, approvalNotes?: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId
          ? {
              ...po,
              status: 'approved' as const,
              approvedBy,
              approvedAt: new Date().toISOString(),
              approvalNotes,
            }
          : po
      )
    );
  }, []);

  // MUTATOR: Receive Goods Receipt from PO & Connect Directly to Store Stock
  const receivePurchaseOrder = useCallback(
    (poId: string, targetStoreId: string) => {
      const po = purchaseOrders.find((p) => p.id === poId);
      if (!po || po.status === 'received') return;

      const targetStore = stores.find((s) => s.id === targetStoreId) || stores[0];

      po.items.forEach((poItem) => {
        // Direct Store Connection: If item does not exist yet (e.g. newly onboarded item on PO), register it in items catalog!
        setItems((currentItems) => {
          const itemExists = currentItems.some(
            (i) => i.id === poItem.itemId || (i.name && i.name.toLowerCase() === poItem.itemName.toLowerCase())
          );
          if (!itemExists) {
            const newItem: Item = {
              id: poItem.itemId || `item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
              code: poItem.itemCode || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
              name: poItem.itemName,
              type: (poItem.category as Item['type']) || 'raw_material',
              unit: poItem.unit,
              purchasePrice: poItem.unitPrice,
              sellingPrice: Math.round(poItem.unitPrice * 1.35),
              vatRate: poItem.vatRate ?? 0.15,
              vatType: poItem.vatRate === 0 ? 'exempt' : 'standard_15',
              reorderLevel: 10,
              reorderQuantity: Math.max(poItem.quantity, 20),
              currentStock: 0,
              averageDailyUsage: 1,
              preferredSupplierId: po.supplierId,
              preferredSupplierName: po.supplierName,
              storeBalances: {},
            };
            return [newItem, ...currentItems];
          }
          return currentItems;
        });

        // Add verified stock movement directly into target warehouse
        addStockMovement({
          itemId: poItem.itemId,
          toStoreId: targetStore.id,
          movementType: 'purchase_receipt',
          quantity: poItem.quantity,
          unitCost: poItem.unitPrice,
          referenceType: 'PO',
          referenceNumber: po.poNumber,
          notes: `Goods received from supplier: ${po.supplierName}${poItem.specifications ? ` [Specs: ${poItem.specifications}]` : ''}`,
        });
      });

      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === poId ? { ...p, status: 'received' as const } : p))
      );
    },
    [purchaseOrders, stores, addStockMovement]
  );

  // MUTATOR: Update Purchase Order Status
  const updatePurchaseOrderStatus = useCallback((poId: string, status: POStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status } : p))
    );
  }, []);

  // CRM: Create Lead
  const createLead = useCallback(
    (leadData: Omit<Lead, 'id' | 'leadNumber' | 'date'>): Lead => {
      const newLead: Lead = {
        ...leadData,
        id: `lead-${Date.now()}`,
        leadNumber: `LEAD-${new Date().getFullYear()}-${String(leads.length + 81).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
      };
      setLeads((prev) => [newLead, ...prev]);
      return newLead;
    },
    [leads.length]
  );

  // CRM: Update Lead
  const updateLead = useCallback(
    (leadId: string, updates: Partial<Lead>) => {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead))
      );
    },
    []
  );

  // CRM: Mark Lead as Closed / Lost
  const markLeadAsLost = useCallback(
    (
      leadId: string,
      lostData: { reason: string; notes?: string; competitorName?: string; date?: string }
    ) => {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                stage: 'lost',
                probabilityPercent: 0,
                lostReason: lostData.reason,
                lostNotes: lostData.notes,
                competitorName: lostData.competitorName,
                lostDate: lostData.date || new Date().toISOString().split('T')[0],
              }
            : lead
        )
      );
    },
    []
  );

  // CRM: Reopen Lost Lead
  const reopenLead = useCallback(
    (leadId: string, targetStage?: LeadStage) => {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                stage: targetStage || 'negotiation',
                probabilityPercent: 50,
                lostDate: undefined,
              }
            : lead
        )
      );
    },
    []
  );

  // CRM: Create Customer
  const createCustomer = useCallback(
    (custData: Omit<Customer, 'id' | 'code' | 'outstandingBalance'>): Customer => {
      const cleanCode = custData.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      const newCust: Customer = {
        ...custData,
        id: `cust-${Date.now()}`,
        code: `CUST-${cleanCode || 'NEW'}`,
        outstandingBalance: 0,
      };
      setCustomers((prev) => [newCust, ...prev]);
      return newCust;
    },
    []
  );

  // CRM: Update Customer
  const updateCustomer = useCallback(
    (customerId: string, updates: Partial<Customer>) => {
      setCustomers((prev) =>
        prev.map((cust) => (cust.id === customerId ? { ...cust, ...updates } : cust))
      );
    },
    []
  );

  // CRM: Convert Lead to Customer
  const convertLeadToCustomer = useCallback(
    (leadId: string, customerData?: Partial<Customer>): Customer => {
      const targetLead = leads.find((l) => l.id === leadId);
      if (!targetLead) throw new Error('Lead not found');

      const cleanCode = targetLead.companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      const newCustId = `cust-${Date.now()}`;

      const leadSurveys = (targetLead.siteSurveys && targetLead.siteSurveys.length > 0)
        ? targetLead.siteSurveys
        : targetLead.siteSurvey
        ? [{
            ...targetLead.siteSurvey,
            id: targetLead.siteSurvey.id || `srv-${newCustId}-1`,
            title: targetLead.siteSurvey.title || `${targetLead.companyName} Primary Signage`,
          }]
        : [];

      const customerSurveys: SiteSurvey[] = leadSurveys.map((s, idx) => ({
        ...s,
        id: s.id || `srv-${newCustId}-${idx + 1}`,
        customerId: newCustId,
        leadId: targetLead.id,
      }));

      const primaryAddress = customerSurveys[0]?.locationAddress || targetLead.siteSurvey?.locationAddress || `${targetLead.city}, Ethiopia`;

      const newCustomer: Customer = {
        id: newCustId,
        code: `CUST-${cleanCode || 'NEW'}`,
        name: targetLead.companyName,
        tin: targetLead.tin || '0000000000',
        address: primaryAddress,
        phone: targetLead.phone,
        email: targetLead.email || `info@${cleanCode.toLowerCase() || 'client'}.com`,
        customerType: 'business',
        creditLimit: Math.max(targetLead.estimatedBudget * 1.2, 200000),
        outstandingBalance: 0,
        paymentTerms: '30 Days Net',
        isVatRegistered: true,
        contactPerson: targetLead.contactPerson,
        siteSurveys: customerSurveys,
        ...customerData,
      };

      setCustomers((prev) => [newCustomer, ...prev]);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, stage: 'won', convertedCustomerId: newCustomer.id } : l
        )
      );

      return newCustomer;
    },
    [leads]
  );

  // CRM: Site Survey Mutators for Leads
  const addSiteSurveyToLead = useCallback(
    (leadId: string, surveyData: Omit<SiteSurvey, 'id'>): SiteSurvey => {
      const newSurvey: SiteSurvey = {
        ...surveyData,
        id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        leadId,
      };
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== leadId) return lead;
          const currentSurveys = lead.siteSurveys || (lead.siteSurvey ? [lead.siteSurvey] : []);
          return {
            ...lead,
            siteSurveys: [...currentSurveys, newSurvey],
            siteSurvey: currentSurveys.length === 0 ? newSurvey : lead.siteSurvey,
          };
        })
      );
      return newSurvey;
    },
    []
  );

  const updateLeadSiteSurvey = useCallback(
    (leadId: string, surveyId: string, updates: Partial<SiteSurvey>) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== leadId) return lead;
          const currentSurveys = lead.siteSurveys || (lead.siteSurvey ? [lead.siteSurvey] : []);
          const updated = currentSurveys.map((s) => (s.id === surveyId ? { ...s, ...updates } : s));
          return {
            ...lead,
            siteSurveys: updated,
            siteSurvey: updated[0] || undefined,
          };
        })
      );
    },
    []
  );

  const deleteLeadSiteSurvey = useCallback(
    (leadId: string, surveyId: string) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== leadId) return lead;
          const currentSurveys = lead.siteSurveys || (lead.siteSurvey ? [lead.siteSurvey] : []);
          const remaining = currentSurveys.filter((s) => s.id !== surveyId);
          return {
            ...lead,
            siteSurveys: remaining,
            siteSurvey: remaining[0] || undefined,
          };
        })
      );
    },
    []
  );

  // CRM: Site Survey Mutators for Customers
  const addSiteSurveyToCustomer = useCallback(
    (customerId: string, surveyData: Omit<SiteSurvey, 'id'>): SiteSurvey => {
      const newSurvey: SiteSurvey = {
        ...surveyData,
        id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerId,
      };
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id !== customerId) return cust;
          const current = cust.siteSurveys || [];
          return {
            ...cust,
            siteSurveys: [...current, newSurvey],
          };
        })
      );
      return newSurvey;
    },
    []
  );

  const updateCustomerSiteSurvey = useCallback(
    (customerId: string, surveyId: string, updates: Partial<SiteSurvey>) => {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id !== customerId) return cust;
          const current = cust.siteSurveys || [];
          return {
            ...cust,
            siteSurveys: current.map((s) => (s.id === surveyId ? { ...s, ...updates } : s)),
          };
        })
      );
    },
    []
  );

  const deleteCustomerSiteSurvey = useCallback(
    (customerId: string, surveyId: string) => {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id !== customerId) return cust;
          const current = cust.siteSurveys || [];
          return {
            ...cust,
            siteSurveys: current.filter((s) => s.id !== surveyId),
          };
        })
      );
    },
    []
  );

  // MUTATOR: Create Customer Order
  const createCustomerOrder = useCallback(
    (orderData: Omit<CustomerOrder, 'id' | 'orderNumber' | 'date' | 'status'>) => {
      const newOrder: CustomerOrder = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        siteSurveyIds: orderData.siteSurveyIds || [],
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  // MUTATOR: Update Order Status
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }, []);

  // MUTATOR: Update / Link Site Surveys for Order (1-to-many)
  const updateOrderSurveys = useCallback((orderId: string, siteSurveyIds: string[]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, siteSurveyIds } : o))
    );
  }, []);

  // MUTATOR: Graphic Design & Proofing Engine
  const createDesignProof = useCallback(
    (
      proofData: Omit<DesignProof, 'id' | 'designNumber' | 'createdDate' | 'revisions' | 'revisionCount'>
    ): DesignProof => {
      const newProof: DesignProof = {
        ...proofData,
        id: `des-${Date.now()}`,
        designNumber: `DSG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        createdDate: new Date().toISOString().split('T')[0],
        revisionCount: 1,
        revisions: [
          {
            id: `rev-${Date.now()}-1`,
            versionNumber: 1,
            date: new Date().toISOString().split('T')[0],
            notes: 'Initial artwork & vector proof generated for client review.',
            authorName: proofData.designerName,
            status: proofData.status,
          },
        ],
      };
      setDesignProofs((prev) => [newProof, ...prev]);
      if (proofData.customerOrderId) {
        setOrders((prev) =>
          prev.map((o) => (o.id === proofData.customerOrderId ? { ...o, designProofId: newProof.id } : o))
        );
      }
      return newProof;
    },
    []
  );

  const updateDesignProof = useCallback((designId: string, updates: Partial<DesignProof>) => {
    setDesignProofs((prev) =>
      prev.map((d) => (d.id === designId ? { ...d, ...updates } : d))
    );
  }, []);

  const addDesignRevision = useCallback(
    (
      designId: string,
      revision: { notes: string; authorName: string; status: DesignStatus }
    ) => {
      setDesignProofs((prev) =>
        prev.map((d) => {
          if (d.id !== designId) return d;
          const nextVer = d.revisionCount + 1;
          const newRev: DesignRevision = {
            id: `rev-${Date.now()}-${nextVer}`,
            versionNumber: nextVer,
            date: new Date().toISOString().split('T')[0],
            notes: revision.notes,
            authorName: revision.authorName,
            status: revision.status,
          };
          return {
            ...d,
            status: revision.status,
            revisionCount: nextVer,
            revisions: [newRev, ...d.revisions],
          };
        })
      );
    },
    []
  );

  const approveDesignProof = useCallback(
    (designId: string, approverName: string, notes?: string) => {
      setDesignProofs((prev) =>
        prev.map((d) => {
          if (d.id !== designId) return d;
          const nextVer = d.revisionCount + 1;
          const approvalRev: DesignRevision = {
            id: `rev-${Date.now()}-${nextVer}`,
            versionNumber: nextVer,
            date: new Date().toISOString().split('T')[0],
            notes: notes || 'Artwork & dimensions officially approved by client. Ready for print & fabrication.',
            authorName: approverName,
            status: 'approved',
          };
          return {
            ...d,
            status: 'approved',
            approvedDate: new Date().toISOString().split('T')[0],
            approvedBy: approverName,
            clientFeedback: notes || d.clientFeedback,
            revisionCount: nextVer,
            revisions: [approvalRev, ...d.revisions],
          };
        })
      );
    },
    []
  );

  const requestDesignRevision = useCallback(
    (designId: string, feedbackNotes: string) => {
      setDesignProofs((prev) =>
        prev.map((d) => {
          if (d.id !== designId) return d;
          const nextVer = d.revisionCount + 1;
          const revRecord: DesignRevision = {
            id: `rev-${Date.now()}-${nextVer}`,
            versionNumber: nextVer,
            date: new Date().toISOString().split('T')[0],
            notes: feedbackNotes,
            authorName: 'Client Revision Request',
            status: 'revision_requested',
          };
          return {
            ...d,
            status: 'revision_requested',
            clientFeedback: feedbackNotes,
            revisionCount: nextVer,
            revisions: [revRecord, ...d.revisions],
          };
        })
      );
    },
    []
  );

  // MUTATOR: Work Orders
  const createWorkOrder = useCallback(
    (woData: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'status' | 'actualGoodQty' | 'scrapQty'>) => {
      const newWO: WorkOrder = {
        ...woData,
        id: `wo-${Date.now()}`,
        workOrderNumber: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'scheduled',
        actualGoodQty: 0,
        scrapQty: 0,
      };
      setWorkOrders((prev) => [newWO, ...prev]);
      updateOrderStatus(woData.customerOrderId, 'in_production');
    },
    [updateOrderStatus]
  );

  const updateWorkOrder = useCallback((woId: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) => prev.map((w) => (w.id === woId ? { ...w, ...updates } : w)));
  }, []);

  const advanceWorkOrderStatus = useCallback(
    (woId: string, nextStatus: WorkOrder['status']) => {
      setWorkOrders((prev) =>
        prev.map((wo) => {
          if (wo.id !== woId) return wo;
          const isDone = nextStatus === 'completed';
          return {
            ...wo,
            status: nextStatus,
            endDate: isDone ? new Date().toISOString().split('T')[0] : wo.endDate,
            actualGoodQty: isDone && wo.actualGoodQty === 0 ? wo.plannedQty : wo.actualGoodQty,
          };
        })
      );
    },
    []
  );

  const recordWorkOrderScrap = useCallback(
    (
      woId: string,
      scrapData: {
        itemId: string;
        quantity: number;
        reason: WastageReason;
        notes?: string;
      }
    ) => {
      const wo = workOrders.find((w) => w.id === woId);
      if (!wo) return;

      // 1. Update WO scrap count
      setWorkOrders((prev) =>
        prev.map((w) =>
          w.id === woId ? { ...w, scrapQty: w.scrapQty + scrapData.quantity } : w
        )
      );

      // 2. Record wastage to ERP wastage log
      recordWastage({
        itemId: scrapData.itemId,
        quantity: scrapData.quantity,
        storeId: 'store-2', // Production floor
        reason: scrapData.reason,
        orderId: wo.customerOrderId,
        notes: `Work Order ${wo.workOrderNumber}: ${scrapData.notes || 'Production scrap/wastage'}`,
      });
    },
    [workOrders, recordWastage]
  );

  const addBomItemToWorkOrder = useCallback(
    (woId: string, itemData: Omit<WorkOrderBomItem, 'totalCost'>) => {
      setWorkOrders((prev) =>
        prev.map((wo) => {
          if (wo.id !== woId) return wo;
          const totalCost = (itemData.actualIssuedQty || itemData.plannedQty) * itemData.unitCost;
          const newItem: WorkOrderBomItem = {
            ...itemData,
            totalCost,
          };
          return {
            ...wo,
            bomItems: [...wo.bomItems, newItem],
          };
        })
      );
    },
    []
  );

  // MUTATOR: Create Invoice (with VAT or Non-VAT)
  const createInvoice = useCallback(
    (invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'paidAmount' | 'balanceDue' | 'paymentStatus'>) => {
      const newInvoice: Invoice = {
        ...invData,
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        paidAmount: 0,
        balanceDue: invData.grandTotal,
        paymentStatus: 'unpaid',
      };

      setInvoices((prev) => [newInvoice, ...prev]);
      updateOrderStatus(invData.customerOrderId, 'invoiced');

      // Update customer outstanding balance
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === invData.customerId
            ? { ...c, outstandingBalance: c.outstandingBalance + invData.grandTotal }
            : c
        )
      );

      return newInvoice;
    },
    [updateOrderStatus]
  );

  // MUTATOR: Create Proforma
  const createProforma = useCallback(
    (data: Omit<ProformaInvoice, 'id' | 'proformaNumber' | 'date' | 'status'>) => {
      const newProforma: ProformaInvoice = {
        ...data,
        id: `prof-${Date.now()}`,
        proformaNumber: `PROF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'sent',
      };
      setProformas((prev) => [newProforma, ...prev]);
      return newProforma;
    },
    []
  );

  // MUTATOR: Update Proforma Status
  const updateProformaStatus = useCallback((proformaId: string, status: ProformaStatus) => {
    setProformas((prev) =>
      prev.map((p) => (p.id === proformaId ? { ...p, status } : p))
    );
  }, []);

  // MUTATOR: Convert Proforma to Official Tax Invoice
  const convertProformaToInvoice = useCallback(
    (proformaId: string) => {
      const prof = proformas.find((p) => p.id === proformaId);
      if (!prof) return null;

      const newInv = createInvoice({
        customerOrderId: prof.customerOrderId || `ord-ref-${Date.now()}`,
        orderNumber: prof.orderNumber || `ORD-REF-${prof.proformaNumber}`,
        customerId: prof.customerId,
        customerName: prof.customerName,
        customerTin: prof.customerTin,
        customerAddress: prof.customerAddress,
        invoiceType: prof.invoiceType,
        dueDate: prof.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        items: prof.items,
        subtotalNet: prof.subtotalNet,
        vatAmount: prof.vatAmount,
        grandTotal: prof.grandTotal,
        notes: `Converted from Proforma ${prof.proformaNumber}. ${prof.notes || ''}`.trim(),
      });

      setProformas((prev) =>
        prev.map((p) =>
          p.id === proformaId
            ? { ...p, status: 'converted', convertedInvoiceId: newInv.id }
            : p
        )
      );

      return newInv;
    },
    [proformas, createInvoice]
  );

  // MUTATOR: Record Collection (Telebirr, Chapa, CBE, Cash)
  const recordCollection = useCallback(
    ({
      invoiceId,
      amountReceived,
      paymentMethod,
      bankReference,
      notes,
    }: {
      invoiceId: string;
      amountReceived: number;
      paymentMethod: PaymentMethod;
      bankReference: string;
      notes?: string;
    }) => {
      const inv = invoices.find((i) => i.id === invoiceId);
      if (!inv) return;

      const newCollection: Collection = {
        id: `col-${Date.now()}`,
        receiptNumber: `RCPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        customerId: inv.customerId,
        customerName: inv.customerName,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amountReceived,
        paymentMethod,
        bankReference,
        remainingCustomerBalance: Math.max(0, inv.balanceDue - amountReceived),
        receivedBy: currentRole.replace('_', ' ').toUpperCase(),
        notes,
      };

      setCollections((prev) => [newCollection, ...prev]);

      // Update invoice payment state
      const updatedPaidAmount = inv.paidAmount + amountReceived;
      const updatedBalanceDue = Math.max(0, inv.grandTotal - updatedPaidAmount);
      const newPaymentStatus =
        updatedBalanceDue === 0 ? 'paid' : updatedPaidAmount > 0 ? 'partially_paid' : 'unpaid';

      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoiceId
            ? {
                ...i,
                paidAmount: updatedPaidAmount,
                balanceDue: updatedBalanceDue,
                paymentStatus: newPaymentStatus,
              }
            : i
        )
      );

      // Update customer outstanding balance
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === inv.customerId
            ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amountReceived) }
            : c
        )
      );

      // If fully paid, mark order as paid
      if (updatedBalanceDue === 0) {
        updateOrderStatus(inv.customerOrderId, 'paid');
      }
    },
    [invoices, currentRole, updateOrderStatus]
  );

  // MUTATOR: Record Expense
  const recordExpense = useCallback(
    (expData: Omit<Expense, 'id' | 'expenseNumber' | 'date' | 'status'>) => {
      const newExpense: Expense = {
        ...expData,
        id: `exp-${Date.now()}`,
        expenseNumber: `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'approved',
      };
      setExpenses((prev) => [newExpense, ...prev]);
    },
    []
  );

  // MUTATOR: Add Employee
  const addEmployee = useCallback((empData: Omit<Employee, 'id'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [...prev, newEmp]);
    return newEmp;
  }, []);

  // MUTATOR: Update Employee
  const updateEmployee = useCallback((empId: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, ...updates } : e))
    );
  }, []);

  // CALCULATION: Order Profitability Engine
  const calculateOrderProfitability = useCallback(
    (orderId: string): OrderProfitability | null => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return null;

      // Invoiced revenue excluding VAT (or agreed price if invoice pending)
      const linkedInvoice = invoices.find((i) => i.customerOrderId === orderId);
      const orderRevenue = linkedInvoice ? linkedInvoice.subtotalNet : order.totalAgreedPrice;

      // Work orders linked
      const linkedWOs = workOrders.filter((w) => w.customerOrderId === orderId);

      // 1. Direct Material Cost from actual issued BOM items
      let directMaterialCost = 0;
      let machineCost = 0;
      linkedWOs.forEach((wo) => {
        wo.bomItems.forEach((bi) => {
          directMaterialCost += (bi.actualIssuedQty || bi.plannedQty) * bi.unitCost;
        });
        machineCost += wo.machineHours * wo.machineHourlyRate;
      });

      // 2. Direct Labor Cost (from assigned operators on this order's WOs)
      let directLaborCost = 0;
      linkedWOs.forEach((wo) => {
        // Average operator hourly rate ~ 120 ETB * hours * count of operators
        const numOps = Math.max(1, wo.operatorNames.length);
        directLaborCost += wo.machineHours * 120 * numOps;
      });

      // 3. Order-specific direct expenses (transport, crane rental, permits, site installation, etc.)
      const linkedExpenses = expenses.filter((e) => e.orderId === orderId);
      const orderDirectExpensesCost = linkedExpenses.reduce((sum, e) => sum + e.amountNet, 0);
      const orderTransportCost = orderDirectExpensesCost; // Kept for backwards compatibility

      // 4. Wastage cost attributed to this order
      const linkedWastage = wastages.filter((w) => w.orderId === orderId);
      const wastageCost = linkedWastage.reduce((sum, w) => sum + w.totalCost, 0);

      // 5. Allocated factory overhead (5% of revenue base)
      const allocatedOverheadCost = orderRevenue * 0.05;

      const packagingCost = 1200; // standard packaging allocation

      // Total Order Cost
      const totalOrderCost =
        directMaterialCost +
        directLaborCost +
        machineCost +
        packagingCost +
        orderDirectExpensesCost +
        allocatedOverheadCost +
        wastageCost;

      // Profit calculations
      const variableCosts = directMaterialCost + directLaborCost + machineCost + wastageCost + orderDirectExpensesCost;
      const grossProfit = orderRevenue - variableCosts;
      const orderProfit = orderRevenue - totalOrderCost;
      const profitMarginPct = orderRevenue > 0 ? (orderProfit / orderRevenue) * 100 : 0;

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        orderTitle: order.title,
        orderRevenue,
        directMaterialCost,
        directLaborCost,
        machineCost,
        packagingCost,
        orderTransportCost,
        orderDirectExpensesCost,
        allocatedOverheadCost,
        wastageCost,
        totalOrderCost,
        grossProfit,
        orderProfit,
        profitMarginPct,
        status: order.status,
      };
    },
    [orders, invoices, workOrders, expenses, wastages]
  );

  // All order profitabilities memoized
  const allOrderProfitability = useMemo(() => {
    return orders
      .map((o) => calculateOrderProfitability(o.id))
      .filter((p): p is OrderProfitability => p !== null);
  }, [orders, calculateOrderProfitability]);

  // CALCULATION: Low stock alerts
  const lowStockItems = useMemo(() => {
    return items
      .map((item) => {
        const expectedDays =
          item.averageDailyUsage > 0 ? item.currentStock / item.averageDailyUsage : 999;
        return { item, expectedDays };
      })
      .filter(
        ({ item, expectedDays }) => item.currentStock <= item.reorderLevel || expectedDays <= 5
      );
  }, [items]);

  // CALCULATION: Store ledger -> Finance bridge
  const storeFinancials = useMemo<StoreFinancials>(() => {
    const sumMovements = (predicate: (m: StockMovement) => boolean) =>
      stockMovements.filter(predicate).reduce((sum, m) => sum + m.totalCost, 0);

    const purchaseReceipts = stockMovements.filter((m) => m.movementType === 'purchase_receipt');
    const linkedReceipts = purchaseReceipts.filter((m) => m.referenceType === 'PO');
    const unlinkedReceipts = purchaseReceipts.filter((m) => m.referenceType !== 'PO');

    const productionIssueValue = sumMovements((m) => m.movementType === 'production_issue');
    const salesIssueValue = sumMovements((m) => m.movementType === 'sales_issue');
    const wastageValue = wastages.reduce((sum, w) => sum + w.totalCost, 0);
    const unallocatedWastageValue = wastages
      .filter((w) => !w.orderId)
      .reduce((sum, w) => sum + w.totalCost, 0);

    const storeValuations = stores.map((store) => {
      const storeItems = items
        .map((item) => ({ item, qty: item.storeBalances?.[store.id] || 0 }))
        .filter(({ qty }) => qty > 0);
      return {
        storeId: store.id,
        storeName: store.name,
        storeType: store.storeType,
        skuCount: storeItems.length,
        totalUnits: storeItems.reduce((sum, { qty }) => sum + qty, 0),
        totalValue: storeItems.reduce((sum, { item, qty }) => sum + qty * item.purchasePrice, 0),
      };
    });

    const categoryMap = new Map<ItemType, { skuCount: number; totalValue: number }>();
    items.forEach((item) => {
      const current = categoryMap.get(item.type) || { skuCount: 0, totalValue: 0 };
      categoryMap.set(item.type, {
        skuCount: current.skuCount + 1,
        totalValue: current.totalValue + item.currentStock * item.purchasePrice,
      });
    });

    const recentPostings = [...stockMovements]
      .sort((a, b) => b.date.localeCompare(a.date) || b.movementNumber.localeCompare(a.movementNumber))
      .slice(0, 60)
      .map((m) => {
        let debitAccount = 'Inventory — Raw Materials';
        let creditAccount = 'Inventory — Raw Materials';
        if (m.movementType === 'purchase_receipt') {
          debitAccount = 'Inventory — Raw Materials';
          creditAccount = m.referenceType === 'PO' ? 'Accounts Payable — Suppliers' : 'Unreconciled Goods Received';
        } else if (m.movementType === 'production_issue') {
          debitAccount = 'Work in Progress — Direct Materials';
          creditAccount = 'Inventory — Raw Materials';
        } else if (m.movementType === 'production_receipt') {
          debitAccount = 'Inventory — Finished Goods';
          creditAccount = 'Work in Progress — Direct Materials';
        } else if (m.movementType === 'sales_issue') {
          debitAccount = 'Cost of Goods Sold';
          creditAccount = 'Inventory — Finished Goods';
        } else if (m.movementType === 'wastage') {
          debitAccount = 'Wastage & Shrinkage Expense';
          creditAccount = 'Inventory — Raw Materials';
        } else if (m.movementType === 'return') {
          if (m.referenceType === 'SUPPLIER_RETURN') {
            debitAccount = 'Accounts Payable — Suppliers';
            creditAccount = 'Inventory — Raw Materials';
          } else {
            debitAccount = 'Inventory — Raw Materials';
            creditAccount = 'Work in Progress — Direct Materials';
          }
        } else if (m.movementType === 'adjustment') {
          if (m.toStoreId && !m.fromStoreId) {
            debitAccount = 'Inventory — Raw Materials';
            creditAccount = 'Stock Adjustment Gain';
          } else {
            debitAccount = 'Stock Adjustment Loss';
            creditAccount = 'Inventory — Raw Materials';
          }
        } else if (m.movementType === 'transfer') {
          debitAccount = `Inventory — ${m.toStoreName || 'Destination Store'}`;
          creditAccount = `Inventory — ${m.fromStoreName || 'Source Store'}`;
        }

        return {
          id: m.id,
          date: m.date,
          movementNumber: m.movementNumber,
          movementType: m.movementType,
          reference: m.referenceNumber,
          itemName: m.itemName,
          storeName: m.fromStoreName || m.toStoreName || 'Store ledger',
          quantity: m.quantity,
          unit: m.unit,
          value: m.totalCost,
          debitAccount,
          creditAccount,
          reconciled: m.movementType !== 'purchase_receipt' || m.referenceType === 'PO',
        };
      });

    return {
      inventoryValuation: items.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0),
      productionIssueValue,
      salesIssueValue,
      purchaseReceiptValue: purchaseReceipts.reduce((sum, m) => sum + m.totalCost, 0),
      wastageValue,
      unallocatedWastageValue,
      adjustmentLossValue: sumMovements(
        (m) => m.movementType === 'adjustment' && !!m.fromStoreId && !m.toStoreId
      ),
      adjustmentGainValue: sumMovements(
        (m) => m.movementType === 'adjustment' && !!m.toStoreId && !m.fromStoreId
      ),
      supplierReturnValue: sumMovements(
        (m) => m.movementType === 'return' && m.referenceType === 'SUPPLIER_RETURN'
      ),
      staffReturnValue: sumMovements(
        (m) => m.movementType === 'return' && m.referenceType !== 'SUPPLIER_RETURN'
      ),
      transferValue: sumMovements((m) => m.movementType === 'transfer'),
      storeValuations,
      categoryValuations: Array.from(categoryMap.entries()).map(([category, value]) => ({
        category,
        ...value,
      })),
      recentPostings,
      linkedPurchaseReceipts: linkedReceipts.length,
      unlinkedPurchaseReceipts: unlinkedReceipts.length,
      linkedPurchaseReceiptValue: linkedReceipts.reduce((sum, m) => sum + m.totalCost, 0),
      unlinkedPurchaseReceiptValue: unlinkedReceipts.reduce((sum, m) => sum + m.totalCost, 0),
    };
  }, [items, stores, stockMovements, wastages]);

  // CALCULATION: Company-level Financials
  const companyFinancials = useMemo(() => {
    // Net Revenue from all invoices
    const totalRevenueNet = invoices.reduce((sum, inv) => sum + inv.subtotalNet, 0);
    const totalOutputVat = invoices.reduce((sum, inv) => sum + inv.vatAmount, 0);

    // Input VAT from POs and expenses
    const poVat = purchaseOrders
      .filter((p) => p.status === 'received')
      .reduce((sum, p) => sum + p.vatTotal, 0);
    const expVat = expenses.reduce((sum, e) => sum + e.vatAmount, 0);
    const totalInputVat = poVat + expVat;
    const netVatPayable = Math.max(0, totalOutputVat - totalInputVat);

    // Cost of goods sold (COGS) from all orders, plus unallocated store wastage
    // and stock-count shrinkage posted directly by the Stores module.
    const cogs =
      allOrderProfitability.reduce(
        (sum, p) => sum + (p.directMaterialCost + p.directLaborCost + p.machineCost + p.wastageCost),
        0
      ) +
      storeFinancials.unallocatedWastageValue +
      storeFinancials.adjustmentLossValue -
      storeFinancials.adjustmentGainValue;
    const grossProfit = totalRevenueNet - cogs;

    // General Period Expenses (excluding direct order expenses to avoid double counting)
    const generalExpenses = expenses
      .filter((e) => !e.orderId)
      .reduce((sum, e) => sum + e.amountNet, 0);

    const operatingProfit = grossProfit - generalExpenses;
    const totalCollected = collections.reduce((sum, c) => sum + c.amountReceived, 0);
    const totalReceivables = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

    return {
      totalRevenueNet,
      totalOutputVat,
      totalInputVat,
      netVatPayable,
      cogs,
      grossProfit,
      totalExpenses: generalExpenses,
      operatingProfit,
      totalCollected,
      totalReceivables,
    };
  }, [
    invoices,
    purchaseOrders,
    expenses,
    allOrderProfitability,
    collections,
    customers,
    storeFinancials,
  ]);

  return (
    <ErpContext.Provider
      value={{
        items,
        stores,
        suppliers,
        leads,
        customers,
        orders,
        workOrders,
        designProofs,
        invoices,
        collections,
        employees,
        expenses,
        wastages,
        purchaseOrders,
        stockMovements,
        currentRole,
        setCurrentRole,
        createLead,
        updateLead,
        markLeadAsLost,
        reopenLead,
        createCustomer,
        updateCustomer,
        convertLeadToCustomer,
        addSiteSurveyToLead,
        updateLeadSiteSurvey,
        deleteLeadSiteSurvey,
        addSiteSurveyToCustomer,
        updateCustomerSiteSurvey,
        deleteCustomerSiteSurvey,
        addItem,
        addSupplier,
        updateSupplier,
        addStockMovement,
        recordWastage,
        createPurchaseOrder,
        receivePurchaseOrder,
        approvePurchaseOrder,
        updatePurchaseOrderStatus,
        createCustomerOrder,
        updateOrderStatus,
        updateOrderSurveys,
        createDesignProof,
        updateDesignProof,
        addDesignRevision,
        approveDesignProof,
        requestDesignRevision,
        createWorkOrder,
        updateWorkOrder,
        advanceWorkOrderStatus,
        recordWorkOrderScrap,
        addBomItemToWorkOrder,
        createInvoice,
        proformas,
        createProforma,
        updateProformaStatus,
        convertProformaToInvoice,
        recordCollection,
        recordExpense,
        addEmployee,
        updateEmployee,
        calculateOrderProfitability,
        allOrderProfitability,
        lowStockItems,
        companyFinancials,
        storeFinancials,
        resetDemoData,
        isHydrated,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpDataProvider');
  }
  return context;
}
