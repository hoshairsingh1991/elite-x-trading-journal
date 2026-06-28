export type Expense = {
  id: string;
  user_id: string;

  expense_name: string;
  expense_date: string;

  category: string;
  description: string | null;

  original_amount: number;
  billed_currency: string;

  vendor: string | null;
  account: string | null;
  payment_method: string | null;

  // Business Details
expense_type: string | null;
business_purpose: string | null;
business_use_percent: number | null;

// Tax & Receipt
receipt_number: string | null;
tax_type: string | null;
tax_amount: number | null;

  is_recurring: boolean;
  frequency: string | null;
  start_date: string | null;

  recurring_group_id: string | null;
  is_template: boolean;
  is_generated: boolean;
  is_active: boolean;
  is_deleted: boolean;

  is_tax_deductible: boolean;
  deductible_percent: number;

  notes: string | null;
  receipt_url: string | null;

  created_at: string;
  updated_at: string;
};