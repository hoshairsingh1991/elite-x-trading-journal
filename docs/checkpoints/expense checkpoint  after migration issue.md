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

 git add .

git commit -m "checkpoint: expenses analytics foundation

- Wired ExpensePage expenses state into analytics components
- Added expense analytics engine foundation
- Added total expense calculations
- Added recurring expense calculations
- Added tax deductible calculations
- Added non-deductible calculations
- Added deductible percentage calculations
- Added generateExpenseAnalytics() master function
- Wired TaxDeductibleSummary to live expense data
- Replaced hardcoded deductible metrics with analytics
- Added estimated tax savings calculation
- Validated ExpensePage -> Analytics -> UI architecture
- Preserved existing expense CRUD system
- Build clean"
 ========================================================= =========================================================
git add .

git commit -m "checkpoint: expense kpi grid v1

- Wired Manual Expenses KPI to live expense analytics
- Wired Recurring Costs KPI to live expense analytics
- Wired Tax Deductible KPI to live expense analytics
- Replaced hardcoded KPI values with analytics calculations
- Added live expense record count display
- Added deductible percentage display
- Replaced placeholder financial metrics with Coming Soon states
- Marked Commissions as Phase 2
- Marked Trading Costs as Phase 2
- Marked Net P&L After Costs as Phase 2
- Preserved existing UI layout and styling
- Build clean"

 ========================================================= =========================================================

 git add .

git commit -m "checkpoint: expenses overview analytics v1

- Added category breakdown analytics
- Added recurring breakdown analytics
- Added fixed category architecture with zero-value support
- Wired recurring donut to live expense data
- Wired recurring legend percentages to live expense data
- Wired expense breakdown donut to live expense data
- Wired Software category percentage
- Wired Market Data category percentage
- Wired Brokerage Fees category percentage
- Wired Education category percentage
- Wired Infrastructure category percentage
- Wired Other category percentage
- Validated category analytics against live Supabase expenses
- Preserved existing UI layout
- Build clean"
 ========================================================= =========================================================
git add .

git commit -m "checkpoint: expenses sources v1

- Wired Manual Expenses source card to live expense data
- Added live manual expense total calculation
- Removed placeholder manual expense values
- Converted Auto Calculated card to Coming Soon state
- Removed fake commission values from expense sources
- Added Phase 2 trade analytics placeholder
- Preserved existing UI layout
- Build clean"
  ========================================================= =========================================================
  
  git add .

git commit -m "feat(expenses): wire upcoming renewals card with live recurring expense analytics"

✓ Live recurring expense detection
✓ Renewal date calculation
✓ Weekly / Monthly / Quarterly / Yearly support
✓ Vendor logos
✓ Scrollable list
✓ Sorted by nearest renewal
✓ Urgency color coding
✓ Compact date formatting
✓ Dashboard-style day display

 ========================================================= =========================================================

 git add .

git commit -m "feat(expenses): add commission analytics and reporting currency support"

Expenses Module Checkpoint

Completed:
- Live commission analytics from trade history
- Business cost analytics layer
- Trading Costs KPI
- Net Business Profit KPI
- Reporting currency integration
- FX rates integration
- Global reporting currency sync with Dashboard
- Expense currency conversion layer
- KPI Grid fully FX-aware

Architecture:
Expenses
↓
convertExpensesToReportingCurrency()
↓
Expense Analytics
↓
KPI Grid

Trades
↓
convertTradesToReportingCurrency()
↓
Performance Analytics
↓
Business Cost Analytics

Remaining:
1. TaxDeductibleSummary FX conversion
2. ExpensesIntelligenceSection FX conversion
3. ExpensesOverviewSection FX conversion
4. ManualExpensesTable reporting currency support
5. Expense Sources analytics

 ========================================================= =========================================================

git commit -m "feat(expenses): add reporting currency support and FX conversion"

Checkpoint Notes
Completed
Reporting Currency Infrastructure
Expenses page now reads the Dashboard reporting currency from localStorage
FX rates loaded on Expenses page
Reporting currency displayed in Expenses header
Header automatically reflects Dashboard currency selection

 ========================================================= =========================================================

 git commit -m "feat(expenses): add reporting currency support across overview analytics"

 Expenses Header
Expense KPI Grid
Tax Deductible Summary
Manual Expenses Table
Expense Sources Card

 ========================================================= =========================================================


git commit -m "feat(expenses): complete expenses overview analytics and tooltip system"

 ========================================================= =========================================================

 git commit -m "feat(expenses): polish expenses over time interactions and tooltip sync"

 ✅ Expenses Over Time tooltip redesign
✅ Manual bar hover glow
✅ Commission bar hover glow
✅ Tooltip ↔ chart synchronization
✅ Manual row reacts to Manual hover
✅ Commission row reacts to Commission hover
✅ Tooltip color mapping corrected
   - Manual = Blue
   - Commission = Emerald
✅ Removed misleading Total dot
✅ Improved tooltip readability
✅ Preserved FX support

 ========================================================= =========================================================

git commit -m "feat(expenses): complete monthly and yearly expenses over time analytics"

✅ Expenses Over Time - Yearly View
✅ Expenses Over Time - Monthly View
✅ Manual Expense Bars
✅ Commission Bars
✅ Total Cost Calculations
✅ Weekly Commission Aggregation
✅ Monthly Commission Aggregation
✅ Tooltip Synchronization
✅ Hover Interactions
✅ Correct Color Mapping
   - Manual = Blue
   - Commissions = Emerald
✅ Removed Total Dot
✅ Reporting Currency Support
✅ FX Conversion Support

 ========================================================= =========================================================

 git commit -m "feat(expenses): complete expenses over time analytics and year filtering foundation"

Branch State:

Expenses Module
├─ KPI Grid ✅
├─ FX Conversion ✅
├─ Tax Summary ✅
├─ Expense Sources ✅
├─ Expense Breakdown ✅
├─ Recurring Card ✅
├─ Expenses Over Time ✅
│  ├─ Monthly View ✅
│  ├─ Yearly View ✅
│  ├─ Commissions ✅
│  ├─ Tooltips ✅
│  └─ Year Filtering Foundation ✅
├─ Manual Expense Table ✅
└─ Intelligence Section ⏳

Known Bugs:
1. Daily recurring + start date freezes page
2. Recurring engine not generating future expenses yet

Next Major Task:
Wire ExpensesHeader date controls into selectedYear/dateRange filtering.

 ========================================================= =========================================================

git commit -m "feat(shared): build reusable DateRangePicker UI component"

✓ Reusable
✓ Shared component
✓ Matches Elite X design language
✓ Close enough to target design
✓ Ready for wiring

========================================================= =========================================================

git commit -m "feat(expenses): wire date range filtering and persistence"
✓ Shared DateRangePicker created
✓ Expenses page wired to DateRangePicker
✓ Presets calculate real dates
✓ Custom range selection works
✓ Expenses filtering works
✓ Trades filtering works
✓ KPI cards update
✓ Charts update
✓ All Time = all data
✓ Filter persists via localStorage
✓ Outside days hidden (clean calendar)
✓ Build passing

========================================================= =========================================================

git commit -m "feat(expenses): add reusable date range filtering architecture"
DATE RANGE PICKER V1

✓ Shared DateRangePicker component
✓ ShadCN Calendar integration
✓ Preset date ranges
✓ Custom date range selection
✓ Parent-owned filter architecture
✓ Expense filtering
✓ Trade filtering
✓ KPI filtering
✓ Analytics filtering
✓ Tax summary filtering
✓ Manual expense table filtering
✓ LocalStorage persistence
✓ All Time support
✓ Calendar cleanup
✓ Hidden outside days
✓ Production verified

BUSINESS INTELLIGENCE

✓ Upcoming Renewals isolated from date filters
✓ Operational widgets separated from historical widgets
✓ Renewal forecasting uses full dataset
✓ Historical analytics uses filtered dataset

ARCHITECTURE

✓ Reusable across Dashboard
✓ Reusable across Trade History
✓ Reusable across Analytics
✓ Reusable across Reports
========================================================= =========================================================

git commit -m "feat(expenses): wire business intelligence metrics foundation

- add BusinessIntelligenceMetrics analytics interface
- add generateBusinessIntelligenceMetrics()
- implement avg cost per trade calculations
- implement commission per trade calculations
- implement expense per trade calculations
- add monthly burn architecture
- add projected annual burn architecture
- add profit retention architecture
- add expense efficiency architecture
- wire business intelligence metrics into ExpensePage
- pass metrics into ExpensesIntelligenceSection
- connect Avg Cost / Trade card to live analytics
- integrate reporting currency symbol support
- remove hardcoded Avg Cost card values
- preserve historical vs forecasting data separation"

========================================================= =========================================================

git commit -m "feat(expenses): wire avg cost and profit retention intelligence cards

- add BusinessIntelligenceMetrics interface
- add generateBusinessIntelligenceMetrics analytics layer
- implement avg cost per trade calculations
- implement commission per trade calculations
- implement expense per trade calculations
- implement profit retention calculations
- expose net business profit analytics
- expose total expense analytics
- wire business intelligence metrics into ExpensePage
- connect Avg Cost / Trade card to live analytics
- connect Profit Retention card to live analytics
- add reporting currency support for intelligence cards
- remove hardcoded KPI values
- replace fake trend indicators with contextual descriptions
- correct Gross P&L label to Net Trading P&L
- add subtitle positioning controls
- preserve presentation-only component architecture"
========================================================= =========================================================

