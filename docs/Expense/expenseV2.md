# Elite X Trading Journal – Expenses Module Master Notes

## Overview

The Expenses section has been transformed from a static UI into a fully functional CRUD system backed by Supabase. The implementation emphasizes premium UI, maintainability, and reusable architecture.

The Manual Expenses Table is now considered feature-complete for V1.

---

# Overall Architecture

The Expenses page consists of three major pieces:

1. Expenses page (`app/expenses/page.tsx`)
2. Manual Expenses Table (`components/expenses/ManualExpensesTable.tsx`)
3. Add/Edit Expense Drawer (`components/expenses/AddExpenseDrawer.tsx`)

Persistent storage is handled through:

* `lib/storage/supabaseExpenseStorage.ts`

Authentication is handled through Supabase Auth and expenses are scoped per authenticated user.

---

# Supabase Database

A dedicated `expenses` table is used.

Primary fields include:

* id (UUID)
* user_id
* expense_name
* expense_date
* category
* description
* original_amount
* billed_currency
* vendor
* account
* payment_method
* is_recurring
* frequency
* start_date
* is_tax_deductible
* deductible_percent
* notes
* receipt_url
* created_at
* updated_at

Every expense belongs to one authenticated user through `user_id`.

---

# Supabase Security

Row Level Security (RLS) is enabled.

Policies restrict users so they can only:

* Insert their own expenses
* Read their own expenses
* Update their own expenses
* Delete their own expenses

No cross-user access is allowed.

---

# Storage Layer

`supabaseExpenseStorage.ts` acts as the abstraction layer.

It contains functions such as:

* loadExpenses()
* saveExpense()
* updateExpense()
* deleteExpense()

UI components never talk directly to Supabase.

Instead:

UI → storage helper → Supabase

This keeps the project modular.

---

# Add Expense Drawer

The Add Expense Drawer supports:

* Creating new expenses
* Editing existing expenses

A single component is reused for both modes.

---

# Edit Mode

When editing:

* Drawer title changes from:

  * "Add Expense"

to

* "Edit Expense"

The existing expense is injected through:

`editingExpense`

A `useEffect()` pre-fills all fields automatically.

When edit mode ends, another `useEffect()` resets every field back to defaults so stale data never appears when adding a new expense.

---

# Save Logic

The save handler now performs two behaviors:

If:

`editingExpense !== null`

then:

* updateExpense(...)
* existing row is updated

Otherwise:

* saveExpense(...)
* new row is inserted

This prevents duplicate records.

---

# Auto Refresh

After successful save:

`onSaveSuccess()`

is called before closing.

The Expenses page increments:

`refreshKey`

ManualExpensesTable listens to:

`[refreshKey]`

inside `useEffect()` and reloads data automatically.

No manual browser refresh is required.

---

# Edit Workflow

Clicking the Pencil icon:

* opens the same drawer
* passes selected row into `editingExpense`
* pre-fills every field
* saves changes back into the same database row

No duplicate row is created.

---

# Delete Workflow

Clicking Trash:

* displays confirmation dialog
* deletes through `deleteExpense(row.id)`
* refreshes table immediately

Deletion occurs in Supabase.

---

# Table Pagination

Pagination is client-side.

Features:

* Previous
* Next
* Current page indicator
* "Showing X–Y of Z expenses"

Page resets automatically whenever filters/search change.

---

# Search

Live search is implemented.

Matches:

* Expense Name
* Vendor

Typing immediately filters rows.

Pagination resets to page 1.

---

# Category Filter

Implemented as dropdown.

Supports:

* All
* Software
* Infrastructure
* Market Data
* Brokerage Fees
* Education
* Other

Filtering occurs client-side.

---

# Vendor Filter

Dynamic dropdown.

Values are generated automatically from existing expense data.

No hardcoded vendor list exists.

Example:

TradingView
Bookmap
Udemy

Only vendors present in stored expenses appear.

---

# Account Filter

Currently intentionally disabled.

Reason:

Every expense currently stores:

`account = "General"`

The UI placeholder remains for future multi-account support.

---

# Payment Filter

Implemented as dropdown.

Uses fixed predefined options.

Supports filtering by payment method.

Examples:

* Credit Card
* Debit Card
* Bank Transfer
* Cash
* PayPal
* Wire Transfer
* Crypto
* Other

---

# Tax Filter

Implemented.

Options:

* Tax
* Yes
* No

Internally maps to:

`is_tax_deductible`

rather than displaying long labels like "Tax Deductible".

Chosen to better fit compact filter width.

---

# Recurring Filter

Implemented.

Supports:

* All
* One-Time
* Daily
* Weekly
* Monthly
* Quarterly
* Yearly

Logic:

* One-Time → `is_recurring = false`
* Others → `frequency` comparison

Table displays actual frequency instead of generic "Recurring".

---

# Date Filter

Implemented.

Supports:

* All Time
* Last 7 Days
* Last 30 Days
* Last 90 Days
* This Year

Used to filter expenses by `expense_date`.

Final implementation matches the rest of the filter system and integrates with pagination and search.

---

# Combined Filtering

All filters stack together.

Final result uses logical AND between:

* Search
* Category
* Vendor
* Payment
* Tax
* Recurring
* Date

Only rows matching every active filter are displayed.

---

# Currency Display

Amounts display with symbol helper:

`getCurrencySymbol()`

Rendering example:

CAD → C$20.00

USD → $20.00

Formatting remains separate from stored values.

---

# Date Rendering

Expense dates are rendered safely with:

`new Date(expense_date + "T12:00:00")`

This avoids timezone shifts where dates appear one day early.

---

# Drawer Reset Logic

When drawer closes without editing:

all state resets to defaults.

Prevents previous edit values from leaking into future Add operations.

---

# Current UI Status

Completed:

* Premium table
* Premium pagination
* Search
* Category filter
* Vendor filter
* Payment filter
* Tax filter
* Recurring filter
* Date filter
* Add expense
* Edit expense
* Delete expense
* Auto refresh
* Supabase persistence
* Edit prefill
* Edit reset
* Dynamic pagination
* Currency formatting
* Frequency display

---

# Design Philosophy

Major principles followed:

* Reuse components instead of duplicating them
* Keep storage logic outside UI
* Use one Add/Edit drawer
* Maintain premium institutional styling
* Favor maintainability over shortcuts
* Keep filtering composable
* Avoid unnecessary complexity

---

# Future Roadmap

Potential future improvements:

* Enable multi-account support and activate Account filter
* Receipt upload integration
* Reporting currency conversion
* Bulk delete / bulk edit
* CSV import/export
* Recurring expense automation
* Advanced date picker
* Saved filter presets
* Analytics cards driven directly from expenses
* Expense trends and charts
* Category spending breakdown
* Tax reporting dashboard

---

# Current Project Status

The Manual Expenses module is now production-quality for V1 and provides full CRUD functionality, rich filtering, pagination, and seamless Supabase integration while maintaining a premium user experience and clean architecture.
