# Dot Advert ERP
These are the right business areas to collect. Organize them into **modules**, then define the data you must capture and the calculations the system should produce automatically.

## Module map

| Area | What to collect |
|---|---|
| Procurement | Suppliers, purchase requests, quotations, purchase orders, goods receipts, supplier invoices, payments |
| Inventory / Store | Items, categories, units, warehouses/stores, opening stock, receipts, issues, transfers, adjustments, wastage, low-stock levels |
| Production / Orders | Customer orders, work orders, BOMs, materials consumed, labor, machine time, output, scrap/waste |
| Sales & Invoicing | Customers, sales orders, deliveries, invoices with/without VAT, credit notes, receipts, customer credit balances |
| Payroll | Employees, positions, salary structure, attendance, overtime, deductions, advances, payslips, payments |
| Expenses | Operating expenses, utilities, rent, transport, maintenance, salaries, depreciation, order-linked expenses |
| Finance / Profitability | Revenue, cost of goods sold, fixed cost, variable cost, gross profit, operating profit, net profit |

## 1. Procurement and inventory

Collect supplier and item master data first; almost every other module depends on it.

### Supplier data
- Supplier name, TIN, address, phone, email
- Bank account details
- Payment terms, e.g. cash, 15 days, 30 days
- Supplier category: raw material, packaging, service, equipment
- VAT-registered status

### Item / product data
- Item code, name, Amharic name if needed
- Type: raw material, packaging, semi-finished, finished good, service
- Unit: kg, liter, piece, meter, carton
- Purchase price, selling price
- VAT rate: 0%, 15%, exempt
- Reorder level and reorder quantity
- Preferred supplier
- Batch/lot number and expiry date, if relevant

### Store / warehouse data
- Store name: main store, raw-material store, finished-goods store, production floor
- Location/section
- Responsible storekeeper
- Stock balance per item, per store, and per batch

### Stock movements
Every stock change should be recorded as a movement, not by directly editing stock balances.

| Movement type | Example |
|---|---|
| Purchase receipt | Raw material received from supplier |
| Production issue | Flour issued to production |
| Production receipt | Finished bread received into store |
| Sales issue | Goods delivered to customer |
| Transfer | Stock moved from main store to production store |
| Adjustment | Count correction |
| Wastage | Damaged, expired, spoiled, or lost stock |
| Return | Customer return or supplier return |

### Low-stock alerts
For each item, store:

- Current stock
- Minimum/reorder level
- Reorder quantity
- Average daily usage
- Expected days of stock remaining

Alert rule:

\[
\text{Expected days remaining} = \frac{\text{Current stock}}{\text{Average daily usage}}
\]

Trigger an alert when current stock is at or below the reorder level, or when expected days remaining is below a safety threshold.

### Wastage
Record wastage with a reason so management can reduce losses:

- Damaged
- Expired
- Spoiled
- Production scrap
- Theft/loss
- Measurement error
- Customer return

Capture: item, quantity, unit cost, store, date, responsible person, reason, production order if applicable, and approval status.

## 2. Purchase module

A purchase should follow a clear flow:

**Purchase request → Purchase order → Goods receipt → Supplier invoice → Payment**

### Purchase order fields
- PO number and date
- Supplier
- Item, quantity, unit, unit price
- VAT amount
- Total amount
- Expected delivery date
- Status: draft, approved, partially received, received, closed, cancelled
- Requested by and approved by

### Goods receipt
- Receipt number and date
- Purchase order reference
- Item, received quantity, rejected quantity, accepted quantity
- Batch/lot number
- Store location
- Inspector and quality result
- Attached supplier delivery note

### Purchase invoice
- Supplier invoice number and date
- PO/receipt reference
- Net amount
- VAT amount
- Withholding tax, if applicable
- Total payable
- Due date
- Payment status: unpaid, partially paid, paid

## 3. Sales, invoices, VAT, and collections

Separate **sales order**, **delivery**, **invoice**, and **payment**. They are related but not the same event.

### Customer data
- Customer name, TIN, address, phone
- Customer type: individual, business, government, export
- Credit limit
- Payment terms
- VAT-registered status

### Invoice types
Support both:

- **VAT invoice:** net price + 15% VAT + total
- **Non-VAT invoice / exempt sale:** total amount without VAT, with a valid reason such as exempt product or non-VAT customer

For each invoice, store:

- Invoice number and date
- Customer
- Sales order/delivery reference
- Item, quantity, unit price
- Discount
- Taxable amount
- VAT amount
- Total invoice amount
- Payment status
- Due date
- Credit note references, if any

### Collections
A collection is money actually received—not the same as revenue.

- Receipt number and date
- Customer
- Invoice(s) being paid
- Payment method: cash, bank transfer, Telebirr, Chapa, cheque
- Amount received
- Bank/transaction reference
- Remaining customer balance

### Customer credit
Track:

- Credit limit
- Total unpaid invoices
- Overdue amount
- Available credit:

\[
\text{Available credit} = \text{Credit limit} - \text{Outstanding balance}
\]

Block or warn when a new order exceeds available credit.

## 4. Payroll

Payroll should connect to both expense and production cost.

### Employee data
- Employee ID, name, position, department
- Base salary
- Allowances
- Bank account
- Tax ID/Pension information
- Employment status
- Start date

### Monthly payroll inputs
- Attendance days
- Absence days
- Overtime hours
- Allowances
- Deductions
- Loan/advance repayment
- Pension and income-tax calculations
- Net pay

### Payroll output
For each employee and each month:

\[
\text{Gross pay} = \text{Base salary} + \text{Allowances} + \text{Overtime}
\]

\[
\text{Net pay} = \text{Gross pay} - \text{Deductions} - \text{Taxes} - \text{Advances}
\]

Then allocate payroll cost:

- Direct labor → production order or work center
- Indirect labor → factory overhead
- Admin staff → administrative expense

## 5. Expenses

Classify every expense by nature and by whether it can be assigned to an order.

| Cost type | Examples | Allocation |
|---|---|---|
| Fixed cost | Rent, admin salaries, insurance, depreciation, security | Period expense |
| Variable cost | Raw materials, packaging, direct labor, electricity for production, transport per delivery | Product/order cost |
| Semi-variable cost | Electricity, maintenance, fuel | Split by usage or allocation rule |

For each expense record:

- Expense date
- Category
- Supplier/payee
- Amount
- VAT amount
- Payment method
- Department/cost center
- Production order reference, if directly related
- Approval status
- Attachment/receipt

## 6. Orders and profitability

This is the most valuable part of your ERP: knowing whether each customer order actually made money.

### Customer order
- Order number and date
- Customer
- Product and quantity
- Agreed selling price
- Expected delivery date
- Status: pending, in production, delivered, invoiced, paid, cancelled

### Production order / work order
- Work order number
- Customer order reference
- Product/BOM version
- Planned quantity
- Actual good quantity
- Scrap/waste quantity
- Start and end date
- Work center/machine
- Operators/labor hours

### Cost collected per order

| Cost | Source |
|---|---|
| Direct material | Inventory issues to the work order |
| Direct labor | Payroll/time logs assigned to the order |
| Machine/equipment cost | Machine hours × hourly rate |
| Packaging | Inventory issue |
| Order-specific transport | Expense records linked to the order |
| Order-specific overhead | Allocated factory overhead |
| Wastage cost | Wasted material quantity × unit cost |

### Revenue and profit per order

\[
\text{Order revenue} = \text{Invoiced amount excluding VAT}
\]

\[
\text{Total order cost} = \text{Direct material} + \text{Direct labor} + \text{Variable overhead} + \text{Allocated fixed overhead} + \text{Wastage cost}
\]

\[
\text{Gross profit} = \text{Order revenue} - \text{Variable cost}
\]

\[
\text{Order profit} = \text{Order revenue} - \text{Total order cost}
\]

\[
\text{Profit margin} = \frac{\text{Order profit}}{\text{Order revenue}} \times 100
\]

Important: VAT should not be counted as revenue, because it is collected on behalf of the tax authority. Use the net invoice amount for revenue and profitability.

## 7. Company-level reports

From the above data, generate:

- Stock balance and low-stock report
- Wastage report by item, reason, store, and production order
- Purchase report by supplier and item
- Accounts payable aging
- Accounts receivable aging
- Customer credit report
- VAT report: output VAT, input VAT, net VAT payable
- Payroll report by department and cost center
- Income statement: revenue, COGS, gross profit, expenses, operating profit, net profit
- Order profitability report
- Production yield and scrap report
- Cash collection report

## Build order

1. Items, stores, stock movements, low-stock alerts, wastage  
2. Suppliers, purchase orders, goods receipts, supplier invoices  
3. Customers, sales orders, VAT/non-VAT invoices, collections, credit  
4. Employees, attendance, payroll, labor allocation  
5. BOMs, work orders, material issue, production output, scrap  
6. Expenses, cost allocation, order profitability, financial reports  

Your first demo should show one complete story: **purchase raw material → issue to production → record waste → produce finished goods → deliver → issue VAT invoice → collect payment → show order profit.** That will convince factory owners faster than a large feature list.