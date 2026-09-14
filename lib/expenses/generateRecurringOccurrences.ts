import { Expense } from "@/lib/types/expense";
import { supabase } from "@/lib/supabase";
import { getNextOccurrenceDate } from "@/lib/expenses/recurrenceUtils";

export async function generateRecurringOccurrences(
  recurringExpense: Expense
): Promise<void> {
  // ==========================================
  // RECURRING EXPENSE VALIDATION
  // ==========================================

  if (
    !recurringExpense.is_recurring ||
    !recurringExpense.is_active ||
    recurringExpense.is_generated
  ) {
    return;
  }

  if (!recurringExpense.recurring_group_id) {
    console.error(
      "RECURRING EXPENSE MISSING RECURRING GROUP ID:",
      recurringExpense.id
    );
    return;
  }

  // ==========================================
  // GENERATE OCCURRENCE DATES
  // ==========================================

  const today = new Date();

  const currentDate = new Date(
    recurringExpense.expense_date + "T12:00:00"
  );

  const occurrenceDates: string[] = [];

  while (currentDate <= today) {
    occurrenceDates.push(
      currentDate.toISOString().split("T")[0]
    );

    currentDate.setTime(
      getNextOccurrenceDate(
        currentDate,
        recurringExpense.frequency ?? ""
      ).getTime()
    );
  }

  // ==========================================
  // FIND EXISTING OCCURRENCES
  // ==========================================

  const { data: existingOccurrences, error: existingError } =
    await supabase
      .from("expenses")
      .select("expense_date")
      .eq(
        "user_id",
        recurringExpense.user_id
      )
      .eq(
        "recurring_group_id",
        recurringExpense.recurring_group_id
      )
      .in(
        "expense_date",
        occurrenceDates
      );

  if (existingError) {
    console.error(
      "FAILED TO CHECK EXISTING RECURRING OCCURRENCES:",
      existingError.message
    );
    return;
  }

  const existingDates = new Set(
    (existingOccurrences ?? []).map(
      (occurrence) => occurrence.expense_date
    )
  );

  const missingDates = occurrenceDates.filter(
    (date) => !existingDates.has(date)
  );

  if (missingDates.length === 0) {
    return;
  }

  // ==========================================
  // CREATE MISSING OCCURRENCES
  // ==========================================
  //
  // The database unique index on:
  //
  // user_id + recurring_group_id + expense_date
  //
  // is the final concurrency protection.
  //
  // ignoreDuplicates ensures that if another
  // generator creates the same occurrence
  // between our SELECT and INSERT, we simply
  // keep the existing row instead of treating
  // the race as a failure.
  //
  // ==========================================

  const occurrenceRows = missingDates.map((date) => ({
    user_id: recurringExpense.user_id,

    expense_name:
      recurringExpense.expense_name,

    expense_date:
      date,

    category:
      recurringExpense.category,

    description:
      recurringExpense.description,

    original_amount:
      recurringExpense.original_amount,

    billed_currency:
      recurringExpense.billed_currency,

    vendor:
      recurringExpense.vendor,

    account:
      recurringExpense.account,

    payment_method:
      recurringExpense.payment_method,

    is_recurring:
      true,

    frequency:
      recurringExpense.frequency,

    start_date:
      recurringExpense.expense_date,

    recurring_group_id:
      recurringExpense.recurring_group_id,

    is_template:
      false,

    is_generated:
      true,

    is_active:
      true,

    is_tax_deductible:
      recurringExpense.is_tax_deductible,

    deductible_percent:
      recurringExpense.deductible_percent,

    notes:
      recurringExpense.notes,

    receipt_url:
      recurringExpense.receipt_url,
  }));

  const { error: insertError } =
    await supabase
      .from("expenses")
      .upsert(
        occurrenceRows,
        {
          onConflict:
            "user_id,recurring_group_id,expense_date",
          ignoreDuplicates: true,
        }
      );

  if (insertError) {
    console.error(
      "FAILED TO CREATE RECURRING OCCURRENCES:",
      insertError.message
    );
  }
}