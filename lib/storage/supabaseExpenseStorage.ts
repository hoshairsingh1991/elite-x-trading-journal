import { supabase } from "@/lib/supabase";

export type SaveExpenseInput = {

  expense_name: string;
  expense_date: string;

  category: string;
  description?: string;

  original_amount: number;
  billed_currency: string;

  vendor?: string;
  account?: string;
  payment_method?: string;

  // Business Details
expense_type?: string;
business_purpose?: string;
business_use_percent?: number;

receipt_number?: string;

tax_type?: string;
tax_amount?: number;

  is_recurring?: boolean;
  frequency?: string | null;
  start_date?: string | null;

  recurring_group_id?: string | null;
  is_template?: boolean;
  is_generated?: boolean;
  is_active?: boolean;
  is_deleted?: boolean;

  is_tax_deductible?: boolean;
  deductible_percent?: number;

  notes?: string;
  receipt_url?: string | null;
};

export async function saveExpense(
  expense: SaveExpenseInput
) {
  // ==========================================
  // AUTHENTICATED USER
  // ==========================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return;
  }



// ==========================================
// SAVE EXPENSE
// ==========================================

const {
  data,
  error: expenseError,
} = await supabase
  .from("expenses")
  .insert({
    user_id: user.id,

    expense_name: expense.expense_name,
    expense_date: expense.expense_date,

    category: expense.category,
    description: expense.description ?? null,

    original_amount: expense.original_amount,
    billed_currency: expense.billed_currency,

    vendor: expense.vendor ?? null,
    account: expense.account ?? "General",
    payment_method: expense.payment_method ?? null,

    expense_type:
  expense.expense_type ?? null,

business_purpose:
  expense.business_purpose ?? null,

business_use_percent:
  expense.business_use_percent ?? 100,

receipt_number:
  expense.receipt_number ?? null,

tax_type:
  expense.tax_type ?? "None",

tax_amount:
  expense.tax_amount ?? 0,

    is_recurring:
      expense.is_recurring ?? false,

    frequency:
      expense.frequency ?? null,

    start_date:
      expense.start_date ?? null,

    recurring_group_id:
      expense.recurring_group_id ?? null,

    is_template:
      expense.is_template ?? false,

    is_generated:
      expense.is_generated ?? false,

    is_active:
      expense.is_active ?? true,

      is_deleted:
  expense.is_deleted ?? false,

    is_tax_deductible:
      expense.is_tax_deductible ?? true,

    deductible_percent:
      expense.deductible_percent ?? 100,

    notes:
      expense.notes ?? null,

    receipt_url:
      expense.receipt_url ?? null,
  })
  .select()
  .single();

if (expenseError) {
  console.error(
    "FAILED TO SAVE EXPENSE:",
    expenseError.message
  );

  throw expenseError;
}

return data;

}

// ==========================================
// LOAD EXPENSES
// ==========================================

export async function loadExpenses() {
  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return [];
  }

const { data, error } = await supabase
  .from("expenses")
  .select("*")
  .eq("user_id", user.id)
  .eq("is_deleted", false)
  .order("expense_date", {
    ascending: false,
  });

  if (error) {
    console.error(
      "FAILED TO LOAD EXPENSES:",
      error.message
    );

    return [];
  }

  return data ?? [];
}

// ==========================================
// UPDATE EXPENSE
// ==========================================

export async function updateExpense(
  id: string,
  expense: SaveExpenseInput
): Promise<void> {
  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return;
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      expense_name: expense.expense_name,
      expense_date: expense.expense_date,

      category: expense.category,
      description: expense.description ?? null,

      original_amount: expense.original_amount,
      billed_currency: expense.billed_currency,

      vendor: expense.vendor ?? null,
      account: expense.account ?? "General",
      payment_method: expense.payment_method ?? null,

      expense_type:
  expense.expense_type ?? null,

business_purpose:
  expense.business_purpose ?? null,

business_use_percent:
  expense.business_use_percent ?? 100,

receipt_number:
  expense.receipt_number ?? null,

tax_type:
  expense.tax_type ?? "None",

tax_amount:
  expense.tax_amount ?? 0,

      is_recurring: expense.is_recurring ?? false,
      frequency: expense.frequency ?? null,
      start_date: expense.start_date ?? null,

      is_tax_deductible:
        expense.is_tax_deductible ?? true,

      deductible_percent:
        expense.deductible_percent ?? 100,

      notes: expense.notes ?? null,
      receipt_url: expense.receipt_url ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "FAILED TO UPDATE EXPENSE:",
      error.message
    );

    throw error;
  }
}

// ==========================================
// DELETE EXPENSE
// ==========================================

export async function deleteExpense(
  id: string
): Promise<void> {
  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return;
  }

 const { error } = await supabase
  .from("expenses")
  .update({
    is_deleted: true,
  })
  .eq("id", id)
  .eq("user_id", user.id);

  if (error) {
    console.error(
      "FAILED TO DELETE EXPENSE:",
      error.message
    );

    throw error;
  }
}