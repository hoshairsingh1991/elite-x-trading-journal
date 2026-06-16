/**
 * =========================================================
 * CHECKPOINT: f126461
 * refactor(expenses): centralize expense state and introduce shared Expense type
 * =========================================================
 *
 * THIS IS NOT A FINAL STABLE RELEASE.
 * THIS IS A TRANSITIONAL ARCHITECTURE REFACTOR CHECKPOINT.
 *
 * =========================================================
 * 1. EXPENSE SYSTEM REFACTOR
 * =========================================================
 *
 * - Introduced shared Expense type across entire system
 * - Centralized expense state management
 * - Unified editingExpense object used across UI
 * - Standardized expense flow across:
 *    - AddExpenseDrawer
 *    - ManualExpensesTable
 *    - ExpensePage state
 *    - Analytics layer
 *
 *
 * =========================================================
 * 2. STATE CENTRALIZATION
 * =========================================================
 *
 * BEFORE:
 * - Each component managed its own local expense state
 *
 * AFTER:
 * - Centralized state introduced:
 *
 *   const [expenses, setExpenses] = useState<Expense[]>([]);
 *   const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
 *
 * - AddExpenseDrawer became primary controller for create/update flow
 *
 *
 * =========================================================
 * 3. EXPENSE SCHEMA MIGRATION (IN PROGRESS)
 * =========================================================
 *
 * LEGACY FIELDS (still existing in system at this stage):
 * - original_amount
 * - billed_currency
 * - is_recurring
 * - is_tax_deductible
 * - frequency
 * - start_date
 * - deductible_percent
 *
 * NEW TARGET MODEL (introduced but NOT fully migrated):
 * - amount
 * - currency
 * - isRecurring
 * - isTaxDeductible
 *
 * ⚠️ IMPORTANT:
 * This checkpoint contains a HYBRID state between V1 and V2 schemas.
 *
 *
 * =========================================================
 * 4. ADD EXPENSE DRAWER REFACTOR
 * =========================================================
 *
 * - Drawer refactored into centralized form controller
 * - Pre-fills data using editingExpense
 * - Handles both CREATE and UPDATE flows
 * - Became tightly coupled with shared Expense type
 *
 *
 * =========================================================
 * 5. ANALYTICS MIGRATION (PARTIAL)
 * =========================================================
 *
 * - Started migration from legacy fields → new schema
 * - Not fully aligned across all analytics functions
 * - Mixed usage of:
 *    - original_amount vs amount
 *    - is_tax_deductible vs isTaxDeductible
 *
 *
 * =========================================================
 * 6. SYSTEM STATE WARNING
 * =========================================================
 *
 * THIS CHECKPOINT IS FRAGILE BECAUSE:
 *
 * - UI partially migrated to V2 schema
 * - Analytics partially migrated
 * - Supabase DB still V1 schema
 *
 * RESULT:
 * - Mixed schema usage across layers
 * - Temporary inconsistencies expected
 * - Not production-stable state
 *
 *
 * =========================================================
 * SUMMARY
 * =========================================================
 *
 * At f126461:
 *
 * ✔ Centralized Expense type introduced
 * ✔ Shared editingExpense state introduced
 * ✔ AddExpenseDrawer refactored into central controller
 * ✔ Analytics migration started
 * ❌ Schema not fully migrated
 * ❌ System still hybrid (V1 + V2)
 * ❌ Not stable production state
 */