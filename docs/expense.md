# ELITE X TRADING JOURNAL

# EXPENSES SYSTEM ARCHITECTURE (CURRENT STATUS)

## PURPOSE

The Expenses system exists to track non-trading costs associated with operating a trading business.

These expenses are NOT commissions and are NOT execution fees.

Commissions are already imported from IBKR and are already included in trade P&L calculations.

Expenses are separate operational costs such as:

* TradingView subscriptions
* Bookmap subscriptions
* Data feeds
* Funded account fees
* VPS hosting
* News services
* Education
* Other trading-related costs

The ultimate goal is to calculate:

Real Profit

instead of only:

Trading P&L

---

# CURRENT STATUS

## Completed

### Database

Supabase table created:

expenses

Columns:

* id
* user_id
* date
* category
* description
* amount
* currency
* created_at
* updated_at

RLS enabled.

Policies created for:

* SELECT
* INSERT
* UPDATE
* DELETE

Each user can only access their own expenses.

---

### Type Definitions

File:

types/expense.ts

Created:

ExpenseCategory

Values:

* SOFTWARE
* DATA
* FUNDED_ACCOUNT
* EDUCATION
* VPS
* NEWS_SERVICE
* OTHER

Created:

Expense interface

Fields:

* id
* userId
* date
* category
* description
* amount
* currency
* createdAt
* updatedAt

---

### Expense Analytics

File:

lib/analytics/expenseAnalytics.ts

Created:

ExpenseAnalyticsData

Contains:

totalExpenses

Created:

calculateTotalExpenses()

Created:

generateExpenseAnalytics()

Current output:

{
totalExpenses: 0
}

---

### Performance Breakdown Integration

File:

lib/analytics/performanceBreakdownAnalytics.ts

Current metrics:

* longPnL
* shortPnL
* commissions
* expenses
* netTradingPnL
* realProfit

Current formulas:

Net Trading P&L

= Long P&L + Short P&L

IMPORTANT:

Commissions are NOT subtracted here.

Reason:

Trade P&L is already NET P&L.

IBKR commissions are already reflected inside trade.pnl.

Subtracting commissions again would double count them.

Real Profit

= Net Trading P&L - Expenses

Current dashboard output:

{
longPnL: 402.33,
shortPnL: 0,
commissions: 148.67,
expenses: 0,
netTradingPnL: 402.33,
realProfit: 402.33
}

This is mathematically correct.

---

### Dashboard Integration

Current page.tsx contains:

const expenses: Expense[] = [];

const expenseAnalytics =
generateExpenseAnalytics(
expenses
);

const performanceBreakdown =
generatePerformanceBreakdownAnalytics(
filteredTrades,
expenseAnalytics.totalExpenses
);

Current state:

Expenses are placeholders.

No Supabase connection yet.

Build passes.

Analytics architecture complete.

---

### Routing

Created:

app/expense/page.tsx

Currently placeholder only.

Route exists.

No functionality implemented yet.

---

# IMPORTANT DECISIONS

## Decision 1

Use the term:

Expenses

NOT:

Business Expenses

Reason:

Cleaner wording.

More trader-friendly.

Less corporate.

---

## Decision 2

Expenses are NOT commissions.

Commissions come from executions.

Expenses come from subscriptions, funded accounts, software, etc.

Never combine them.

Keep them separate.

---

## Decision 3

Real Profit must always be:

Net Trading P&L
minus
Expenses

Never:

Net Trading P&L
minus
Commissions
minus
Expenses

Commissions are already reflected in trade.pnl.

---

## Decision 4

Expenses page should remain simple initially.

Do not over-engineer.

Functionality first.

UI later.

---

# WHAT STILL NEEDS TO BE BUILT

## Phase 1

Expense CRUD

Required:

Create Expense

Load Expenses

Delete Expense

Edit Expense optional

---

## Phase 2

Expense Page

Simple form:

* Date
* Category
* Description
* Amount
* Currency

Save button

Below:

Expense table

Columns:

* Date
* Category
* Description
* Amount
* Delete

No charts.

No analytics.

No filters.

No advanced UI.

---

## Phase 3

Supabase Integration

Load expenses:

supabase
.from("expenses")
.select("*")

Create expenses:

supabase
.from("expenses")
.insert(...)

Delete expenses:

supabase
.from("expenses")
.delete()

---

## Phase 4

Dashboard Connection

Replace:

const expenses: Expense[] = [];

with:

const expenses =
fetchedExpenses;

Then:

Expense Analytics

↓

Performance Breakdown

↓

Real Profit

becomes fully live.

No analytics changes required.

Architecture already completed.

---

# FUTURE ENHANCEMENTS

Not required for V1.

Possible future features:

* Expense categories chart
* Monthly expense summaries
* Expense trends
* Expense filtering
* Expense search
* Expense editing
* Expense attachments/receipts
* Tax reporting support

None of these are required for Dashboard V2.

---

# CURRENT RECOMMENDATION

Expenses architecture is complete.

Do NOT spend additional time on Expenses right now.

The only missing piece is CRUD/UI.

This can safely be completed later.

Higher priority item:

FX / Multi-Currency Architecture

Reason:

FX affects all portfolio analytics.

Expenses currently affect only Real Profit and can safely remain at:

Expenses = 0

until the CRUD page is implemented.

Current project status:

Expenses System Architecture = COMPLETE
Expenses CRUD = NOT STARTED
Expenses UI = NOT STARTED
Dashboard Integration = COMPLETE
Analytics Integration = COMPLETE
