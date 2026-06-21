import { Expense } from "@/lib/types/expense";
import { supabase } from "@/lib/supabase";

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
      currentDate
        .toISOString()
        .split("T")[0]
    );

    switch (recurringExpense.frequency) {
      case "Daily":
        currentDate.setDate(
          currentDate.getDate() + 1
        );
        break;

      case "Weekly":
        currentDate.setDate(
          currentDate.getDate() + 7
        );
        break;

      case "Monthly":
        currentDate.setMonth(
          currentDate.getMonth() + 1
        );
        break;

      case "Quarterly":
        currentDate.setMonth(
          currentDate.getMonth() + 3
        );
        break;

      case "Yearly":
        currentDate.setFullYear(
          currentDate.getFullYear() + 1
        );
        break;

      default:
        return;
    }
  }

  // ==========================================
  // FIND MISSING OCCURRENCES
  // ==========================================

  const missingDates: string[] = [];

  for (const date of occurrenceDates) {
    const { data: existing } =
      await supabase
        .from("expenses")
        .select("id")
        .eq(
          "recurring_group_id",
          recurringExpense.recurring_group_id
        )
        .eq(
          "expense_date",
          date
        )
        .limit(1);

    if (existing && existing.length > 0) {
      
    } else {
      

      missingDates.push(date);
    }
  }



for (const date of missingDates) {

  const { error } =
    await supabase
      .from("expenses")
      .insert({
        user_id:
          recurringExpense.user_id,

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
      });

  if (error) {

    console.error(
      "FAILED TO CREATE OCCURRENCE:",
      error.message
    );

  } else {

    
  }
}

}