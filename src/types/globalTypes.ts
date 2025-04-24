export interface StudentPersonalInformation {
  student_id?: number
  student_name: string
  gender_id: number | null
  date_of_birth: string
  phone_number: string
  email: string
  marital_status_id: number | null
  father_name: string
  mother_name: string
  passport_number: string
  passport_issued_date: string
  passport_expiry_date: string
  postal_address: string
  is_completed: boolean
  created_at?: string
  updated_at?: string
}
export interface StudentEmergencyContact {
  id?: number
  student_id: number
  name: string
  relationship: string
  phone_number: string
  email?: string | null
  is_completed: boolean
  created_at?: Date
  updated_at?: Date
}
export interface StudentEducationalQualification {
  id?: number;
  student_id: number;
  qualification_name: string;
  country_id: number;
  qualification_obtained: string;
  grade: string;
  institution_name: string;
  year_started_id: number;
  qualification_order: number; // 1 for first, 2 for second, etc.
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface Country {
  id: number;
  name: string;
}

export interface Year {
  id: number;
  year: string;
}
export interface StudentProgramChoice {
  id?: number;
  student_id: number;
  country_id: number;
  university_id: number;
  program_id: number;
  priority: number;
  is_completed: boolean;
}
// types/globalTypes.ts
export interface ProgramChoice {
  id?: number;
  student_id?: number;
  country_id: number;
  university_id: number;
  program_id: number;
  priority: number;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface AboutUs {
  id?: number;
  student_id: number;
  name_of_referal?: string;
  where_did_you_hear_about_us?: string;
  parent_guardian?: string;
  government?: string;
  ngo?: string;
  self?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Branch {
  id?: number
  name: string
  address?: string
  contact_person?: string
  email?: string
  phone?: string
  state_id?: number
  region_id?: number
  country_id?: number
}
export interface Permission {
  id?: number // Unique identifier for the permission
  name: string // Name of the permission
  // Add any additional fields if necessary
}
export interface Role {
  id: number // Unique identifier for the role
  name: string // Name of the role
  permissions: Permission[] // Array of associated permissions
  created_at: string // Creation timestamp (ISO format)
  updated_at: string // Last update timestamp (ISO format)
}
export interface Warehouse {
  id?: number
  name: string
  warehouse_address: string
  branch_id: number
  zipcode: string
  contact_person: string
  phone: string
  email: string
}
export interface Release {
  id?: number
  customer_id: number
  create_item_id: number
  branch_id: number
  store_id: number
  sales_receipt_id: number
  quantity_released: number
  user_id: number
  release_date: string
}

export interface PrimaryFolder {
  id?: number
  name:string
  year_id: number
  company_id: number

}

export interface UploadDoc {
  id?: number;
  subfolder_id: number | { id: number; name: string }; // Supports ID or full object
  file_title: string;
  filetype_id: number | { id: number; name: string }; // Supports ID or full object
  file_description: string;
  financial_value?: string;
  file_expiry_date?: string | Date;
  attach_file: number | { id: number; name: string; file_url: string }; // Supports ID or full object
  upload?: Upload;
  created_at: string | Date;

  // Add these properties
  company?: {
    id: number;
    name: string;
  };
  primary_folder?: {
    id: number;
    name: string;
  };
}



export interface Subfolder {
  id?: number
  name:string
  primary_folder_id: number
  company_name: string; // Add this field
  

}


export interface Customer {
  id?: number
  surname: string
  firstname: string
  middlename?: string
  name: string
  address?: string
  phone_number: string
  customer_type_id?: number
  title_id?: number
  branch_id: number
  branch_name?: string
  credit_limit?: number
  credit_balance?: number
}

export interface CustomerResource {
  id?: number
  surname: string
  firstname: string
  middlename?: string
  name: string
  address?: string
  phone_number: string
  customer_type_id?: number
  title_id?: number
  branch_id: number
  branch_name?: string
  credit_limit?: number
  credit_balance?: number
  total_credit?: number
  total_payment?: number
  total_inflow?: number
  total_outflow?: number
  deposit_balance?: number
  balance?: number
  inflows?: any[]
  outflows?: any[]
  creditTransactions?: any[]
}
export interface User {
  id?: number
  name?: string
  email?: string
  password?: string

  roles?: number
 
 
  created_at?: string
}

export interface GenericSetUp {
  id?: number
  name: string
}

export interface Upload {
    id: number;
    file_name: string;
    file_path: string;
}

export interface Vendor {
  id?: number
  name: string
  title: number
  designation: number
  contact_surname: string
  contact_firstname: string
  contact_middlename: string
  vendor_type: number
  service_type: number
  contact_phone_number: string
  contact_email: string
  image_url: string
  tin: string
  	bank: number
  	account_number: string
  account_name: string
}

export interface SalesOrder {
  id: number // Primary key
  sales_order_number: string // Unique identifier for the sales order
  customer_id: number // Foreign key referencing the customer
  branch_id: number // Foreign key referencing the branch
  store_id: number // Foreign key referencing the store
  credit_limit?: number // Nullable field for the credit limit
  total_amount?: number // Nullable field for credit amount
  credit_balance?: number // Nullable field for credit balance
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
}

export interface ItemSold {
  [x: string]: any
  id: number // Primary key
  sales_order_id: number // Foreign key referencing the Sales Order
  product_id: number // Foreign key referencing the product
  product_name?: string // Foreign key referencing the product
  quantity: number // Quantity of the item sold
  unit_price: number // Price per unit of the item
  amount: number // Total amount for this line item
  store_id: number
  store_name?: string
  discount: number
  sales_date: string // Date of sale (ISO format)
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
}

export interface SalesInvoice {
  id: number // Primary key
  sales_order_id: number // Foreign key referencing the Sales Order
  product_id: number // Foreign key referencing the product
  unit_price: number // Price per unit of the item
  amount: number // Total amount of the invoice
  sales_invoice_number: string // Unique identifier for the invoice
  invoice_date: string // Date of invoice (ISO format)
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
}

export interface SalesReceipt {
  id: number // Primary key
  sales_order_id: number // Foreign key referencing the Sales Order
  sales_invoice_id: number // Foreign key referencing the Sales Invoice
  customer_id: number // Foreign key referencing the customer
  branch_id: number // Foreign key referencing the branch
  store_id: number // Foreign key referencing the store
  sales_receipt_number: string // Unique identifier for the receipt
  total_amount: number // Total amount of the receipt
  amount_paid: number // Amount paid
  payment_type: string
  item_sold_id: number // Foreign key for sold item, can be used to fetch detailed data
  items_sold: ItemSold[] // Array containing the sold items with details
  receipt_date: string // Date of receipt (ISO format)
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
}

export interface GenericSetUp2 {
  id?: string
  name: string
}

export interface PostInflow {
  id?: number
  bank_id: number
  amount: number
  narration?: string
  inflow_status?: number
  inflow_date: string
  customer_id?: number
}

export interface EnhancedPostOutflow extends PostOutflow {
  bankName?: string // Adding bankName as an optional property
  outflowModeName?: string // Adding outflowModeName as an optional property
  customerName?: string
}

export interface EnhancedPostOutflow extends PostOutflow {
  sn: number // Adding the sn property for display purposes
}

export interface PostOutflow {
  id: number
  org_bank: number

  // beneficiary: string
  account_name?: string
  account_number: number
  bene_bank: number
  amount: number
  narration?: string
  outflow_date?: Date
  outflow_mode?: number
  customer_id: number
}

export interface CashExpense {
  id: number
  expense_line_id: number
  branch_id: number
  branch_name: string
  amount: number
  date: Date
  user_id: number
  user_name:string
  store_id:number
  created_at:Date
  approval_date: Date
  approved_by:number
}


export interface CashierRemittance {
  id: number
  cash_discrepancy_id: number
  cash_discrepancy_name: string
  approved_by: number
  approved_date: Date
  branch_id: number
  branch_name: string
  amount: number
  discrepancy_amount: number
  date: Date
  user_id: number
  user_name:string
  store_id:number
  store_name:string
  created_at:Date
}

export interface BankRemittance {
  id: number
 
  bank_id: number
  bank_name: string
  branch_id: number
  branch_name: string
  amount: number
  account_number:number
  date: Date
  user_id: number
  user_name:string
  store_id:number
  created_at:Date
}
export interface CreditTransactionResource {
  branch_id: number
  customer_id: number
  sales_order_id: number
  sales_receipt_id: number
  amount: number
  credit_limit: number
  credit_balance_before: number
  type: string
  salesReceipts?: SalesReceiptResource
  created_at: Date
}
export interface SettleCredit {
  id: number
  customer_id: number
  credit_limit?: number
  current_debt?: number
  settlement_amount: number
  settlement_date: Date

}

export interface InventoryItem {
  id?: number
  name: string
  item_category_id: number
  item_category_name?: string
  batch_number?: string
  brand_id: number
  // branch_id: number
  // branch_name?: string
  vendor_id: number
  quantity?: number
  selling_price?: number
}

export interface Account {
  id?: string
  name: string
  code: string
  account_group_id: string
  account_type_id: string
  account_subtype_id: string
  account_owner_id?: string
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface AccountGroup {
  id?: string
  name: string
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface AccountSubtype {
  id?: string
  name: string
  account_type_id: string
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface AccountType {
  id?: string
  account_group_id: string
  account_group?: string
  name: string
  code: string
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface FinancialPeriod {
  id?: string
  name: string
  date_from: Date
  date_to: Date
  is_active: boolean
  financial_year_id: string
  financial_quarter_id: string
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface FinancialQuarter {
  id?: string
  name: string
  date_from: Date
  date_to: Date
  is_active: boolean
  financial_year_id: string
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface FinancialYear {
  id?: string
  name: string
  date_from: Date
  date_to: Date
  is_active: boolean
  created_by?: number
  modified_by?: number
  deleted_by?: number
  created_at?: Date
  updated_at?: Date
}

export interface TransferOrder {
  id?: number
  transfer_order_number: string
  transfer_date: string
  transfer_reason: number
  source_id: number
  destination_id: number
  image_url?: string
  transfer_quantity: string
  item_id: number
}

export interface Store {
  id?: number
  name: string
  branch_id: number
  store_type_id: number
  items?: any[]
}

export interface InventoryAdjustment {
  id?: number
  adjustment_type_id: number
  item_id: number
  date: string
  branch_id: number
  warehouse_id: number
  store_id: number
  reason_id: number
  description?: string
  item_category_id: number
  quantity: number
  cost_price?: number
  selling_price?: number

  // ... (other fields based on your InventoryAdjustment type)

}

export interface ApprovalLimit {
  id: string
  amount: number
  user_id: string
}

export interface ApprovalProcessModule {
  id: string
  name: string
  max_approval_count: number
}

export interface ApprovalProcessType {
  id: string
  name: string
}

export interface ApprovalStage {
  id: string
  name: string
  process_type_id: string
}

export interface ApprovalType {
  id: string
  name: string
  description: string
}

export interface ApprovalInstance {
  id: string
  approval_stage_id: string
  approval_type_id: string
}

export interface ApprovalProcessFlow {
  id: string
  sequence_no: number
  process_module_id: string
  approval_stage_id: string
  status_id: number
}

export interface JournalType {
  id: number
  name: string
  sign: number
}

export interface JournalEntry {
  id?: number
  payment_date: Date
  description: string
  vendor_id?: number
  warehouse_id: number

  // description: string;
}

export interface PaymentVoucher {
  id?: string
  payment_date: Date
  description: string
  vendor_id?: number
  warehouse_id: number
  branch_id: string
  tax_id: string
  payment_mode_id: number
  expense_account_id: string

  // description: string;
}

export interface PaymentVoucherDetail {
  id?: string
  description: string
  item_id?: number
  amount: number
  quantity: number
  expense_account_id: string

  // description: string;
}

export interface TableItem extends ApprovalProcessFlow {
  process_module_name: string
  approval_stage_name: string
  status: string
}

export interface VendorTarget {
  id?: number
  vendor_id: number
  year: number
  quantity: string
  value: string
  product_id: number
}

export interface SalesOrderResource {
  id: number // Primary key
  sales_order_number: string // Unique identifier for the sales order
  customer_id: number // Foreign key referencing the customer
  customer_name: string // Foreign key referencing the customer
  branch_id: number // Foreign key referencing the branch
  branch_name: string // Foreign key referencing the branch
  user_id: number
  user_name: string
  store_id: number // Foreign key referencing the store
  store_name: string // Foreign key referencing the store
  credit_limit?: number // Nullable field for the credit limit
  total_amount: number // Nullable field for credit amount
  total_paid?: number // Nullable field for credit amount
  credit_balance?: number // Nullable field for credit balance
  payment_type: string
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
  items: ItemSold[]
  deposit?: number
  customer?: Customer
}

export interface SalesReceiptResource {
  id: number // Primary key
  sales_order_id: number // Foreign key referencing the Sales Order
  sales_invoice_id: number // Foreign key referencing the Sales Invoice
  customer_id: number
  customer_name: string// Foreign key referencing the customer
  branch_id: number // Foreign key referencing the branch
  store_id: number // Foreign key referencing the store
  cashier_id: number
  user_id: number
  cashier_name: string
  sales_receipt_number: string // Unique identifier for the receipt
  total_amount: number // Total amount of the receipt
  amount_paid: number // Amount paid
  payment_type: string
  item_sold_id: number // Foreign key for sold item, can be used to fetch detailed data
  sales_order: SalesOrderResource // Array containing the sold items with details
  receipt_date: string // Date of receipt (ISO format)
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
  payment_detail?: { payment_type: string; amount: number }[]
}

export interface SalesReleaseResource {
  id: number // Primary key
  sales_receipt_id: number // Foreign key referencing the Sales Order
  customer_id: number // Foreign key referencing the customer
  customer_name: string // Foreign key referencing the customer
  branch_id: number // Foreign key referencing the branch
  branch_name: string // Foreign key referencing the branch
  store_id: number // Foreign key referencing the store
  store_name: string // Foreign key referencing the store
  user_id: number
  user_name: string
  release_date: string // Date of receipt (ISO format)
  created_at: string // Timestamp for creation
  updated_at: string // Timestamp for last update
  items: []
}

export interface StoreItem {
  id?: number
  item_category_id: number
  name?: string
  create_item_id: number
  branch_id: number
  cost_price: number
  selling_price: number
  reorder_level: number // Adjusted to number if it represents a numeric value
  quantity: number
  quantity_holding?: number
  store_id: number
  discount?: number // Optional if nullable, else defaults to 0 in back-end

}

// export interface SalesReleaseResource{
//   id: number; // Primary key
//     sales_receipt_id: number; // Foreign key referencing the Sales Order
//     customer_id: number; // Foreign key referencing the customer
//     customer_name: string; // Foreign key referencing the customer
//     branch_id: number; // Foreign key referencing the branch
//     branch_name: string; // Foreign key referencing the branch
//     store_id: number; // Foreign key referencing the store
//     store_name: string; // Foreign key referencing the store
//     user_id:number;
//     user_name: string;
//     release_date: string; // Date of receipt (ISO format)
//     created_at: string; // Timestamp for creation
//     updated_at: string; // Timestamp for last update
//     items: []
// }

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
