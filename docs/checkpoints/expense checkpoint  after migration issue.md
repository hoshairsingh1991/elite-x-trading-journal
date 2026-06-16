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

 ========================================================= =========================================================
 git add .

git commit -m "checkpoint: expenses tax deductible summary wired

- Added ExpensePage -> expenses[] -> analytics data flow
- Passed expenses prop into ExpenseKpiGrid
- Passed expenses prop into ExpensesOverviewSection
- Passed expenses prop into ExpensesIntelligenceSection
- Passed expenses prop into TaxDeductibleSummary
- Rebuilt expenseAnalytics.ts using current Expense schema
- Added total expense calculations
- Added recurring expense calculations
- Added tax deductible calculations
- Added non-deductible calculations
- Added deductible percentage calculations
- Added generateExpenseAnalytics() master function
- Wired TaxDeductibleSummary to live Supabase expense data
- Replaced hardcoded deductible total with analytics
- Replaced hardcoded non-deductible total with analytics
- Replaced hardcoded deductible percentages with analytics
- Replaced hardcoded estimated tax savings with analytics
- Preserved existing expense CRUD architecture
- Build clean"

 ========================================================= =========================================================

 Reson for not wiring pnl, commision and tardes data to expsne yet

 # Expenses Module Wiring Roadmap

## Current Status

### Fully Complete

* Supabase Expenses CRUD
* AddExpenseDrawer
* ManualExpensesTable
* Search
* Filters
* Pagination
* Edit Expense
* Delete Expense
* Auto Refresh

### Analytics Foundation Complete

ExpensePage now owns:

```ts
const [expenses, setExpenses] =
  useState<Expense[]>([]);
```

and passes expenses into:

```tsx
<ExpenseKpiGrid expenses={expenses} />

<ExpensesOverviewSection expenses={expenses} />

<ExpensesIntelligenceSection expenses={expenses} />

<TaxDeductibleSummary expenses={expenses} />
```

Expense analytics engine created:

```txt
lib/analytics/expenseAnalytics.ts
```

Current analytics:

* totalExpenses
* recurringExpenses
* taxDeductibleAmount
* nonDeductibleAmount
* deductiblePercent

---

## Completed Wiring

### TaxDeductibleSummary

Now uses live Supabase expense data.

Live values:

* Tax Deductible Total
* Non-Deductible Total
* Deductible %
* Estimated Tax Savings
* Donut Chart

Architecture:

```txt
Supabase
    ↓
loadExpenses()
    ↓
ExpensePage
    ↓
expenses[]
    ↓
generateExpenseAnalytics()
    ↓
TaxDeductibleSummary
```

---

# NEXT PHASE

## Phase 1 — Expense Only Analytics

Data Source:

```txt
expenses[]
```

Only.

No trade analytics.

No commissions.

No FX conversion.

No reporting currency.

### ExpenseKpiGrid

Wire:

* Manual Expenses
* Recurring Costs
* Tax Deductible

Leave mocked:

* Commissions
* Trading Costs
* Net P&L After Costs

### ExpensesOverviewSection

Wire:

* Monthly Expenses
* Category Breakdown
* Recurring vs One-Time

Use only:

```txt
expenses[]
```

### ExpensesIntelligenceSection

Wire only metrics that depend entirely on:

```txt
expenses[]
```

Leave cross-system metrics for later.

---

# Phase 2 — Combined Analytics

After expense-only analytics are complete.

ExpensePage will eventually load:

```txt
expenses[]
trades[]
```

at the same time.

Then create combined analytics.

---

## Commissions

Source:

```ts
generatePerformanceBreakdownAnalytics(
  trades
).commissions
```

Formula:

```ts
sum(trade.fees)
```

---

## Trading Costs

Formula:

```txt
Manual Expenses
+
Commissions
```

---

## Net P&L After Costs

IMPORTANT:

Net P&L already includes commissions.

Therefore:

```txt
Net P&L After Costs
=
Net P&L
-
Manual Expenses
```

NOT:

```txt
Net P&L
-
Commissions
-
Manual Expenses
```

That would double-count commissions.

---

## Avg Cost Per Trade

Formula:

```txt
Manual Expenses
÷
Trade Count
```

---

## Profit Retention

Formula:

```txt
(Net P&L - Manual Expenses)
÷
Net P&L
```

---

# Phase 3 — FX Conversion Layer

Current analytics use:

```txt
original_amount
billed_currency
```

directly.

This is intentional.

No FX conversion is being applied yet.

Future architecture:

```txt
Expense
(original_amount + billed_currency)
        ↓
FX Conversion Layer
        ↓
Reporting Currency
        ↓
Analytics
        ↓
UI
```

Original values remain source of truth forever.

Reporting currency is presentation only.

---

# Guiding Principle

ExpensePage = Orchestrator

```txt
ExpensePage
      ↓
expenses[]
      ↓
Analytics
      ↓
UI
```

Components never fetch data.

Components never talk to Supabase.

Components receive data and render it.

Supabase remains the source of truth.

 ========================================================= =========================================================