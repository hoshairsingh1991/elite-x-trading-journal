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
  is_recurring?: boolean;
  frequency?: string | null;
  start_date?: string | null;
  is_tax_deductible?: boolean;
  deductible_percent?: number;
  notes?: string;
  receipt_url?: string | null;
};

export async function saveExpense(
  expense: SaveExpenseInput
): Promise<void> {
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

  const { error } = await supabase
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

      is_recurring: expense.is_recurring ?? false,
      frequency: expense.frequency ?? null,
      start_date: expense.start_date ?? null,

      is_tax_deductible:
        expense.is_tax_deductible ?? true,

      deductible_percent:
        expense.deductible_percent ?? 100,

      notes: expense.notes ?? null,
      receipt_url: expense.receipt_url ?? null,
    });

  if (error) {
    console.error(
      "FAILED TO SAVE EXPENSE:",
      error.message
    );

    throw error;
  }
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
    .delete()
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