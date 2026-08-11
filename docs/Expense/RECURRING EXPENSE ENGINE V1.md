# ELITE X TRADING JOURNAL – RECURRING EXPENSE ENGINE V1 (MASTER NOTES)

## PURPOSE

The Recurring Expense Engine exists to automatically create recurring business expenses (TradingView, Market Data, VPS, News Services, Funded Account Fees, Education Subscriptions, etc.) while preserving historical accounting records and respecting user modifications.

Recurring expenses are treated as real expense occurrences, not calculated virtual rows.

Every occurrence exists as a physical row inside the expenses table.

This design ensures:

* Accurate accountant exports
* Accurate CRA reporting
* Accurate yearly tax summaries
* Full editability of historical expenses
* Full deletion control by user
* Automatic catch-up generation after periods of inactivity

---

# CORE PHILOSOPHY

Recurring expenses must behave exactly like real expenses.

Once an occurrence is generated:

* User can edit it
* User can delete it
* User can export it
* User can filter it
* User can include it in tax reports

Generated occurrences are not special after creation.

They become normal expense records.

---

# RECURRING SOURCE OF TRUTH

Expense Date is the only recurring anchor.

We intentionally removed the separate recurring start date concept.

Reason:

Two different dates created ambiguity.

Example:

Expense Date = June 20
Recurring Start Date = July 1

This creates confusion about when the recurrence should begin.

Final decision:

Expense Date is always the recurring anchor date.

Examples:

Expense Date = Jan 1
Monthly

Generates:

Jan 1
Feb 1
Mar 1
Apr 1
...

Expense Date = June 20
Monthly

Generates:

June 20
July 20
Aug 20
Sept 20
...

User controls recurrence simply by selecting the Expense Date.

---

# SUPPORTED FREQUENCIES

Daily

Weekly

Monthly

Quarterly

Yearly

Generation logic uses date increments:

Daily:
+1 day

Weekly:
+7 days

Monthly:
+1 month

Quarterly:
+3 months

Yearly:
+1 year

---

# DATABASE FIELDS

Additional recurring fields:

recurring_group_id

Purpose:

Links all occurrences belonging to the same recurring chain.

Example:

TradingView Subscription

Jan 1
Feb 1
Mar 1
Apr 1

All rows share the same recurring_group_id.

---

is_recurring

true = recurring schedule

false = one-time expense

---

is_generated

false = original user-created anchor occurrence

true = automatically generated occurrence

Purpose:

Allows system to identify the recurring anchor record.

Only anchor records are allowed to generate future occurrences.

---

is_active

true = recurring schedule remains active

false = recurring schedule disabled

Future use:

Can stop future generation while preserving historical records.

---

is_deleted

false = visible expense

true = hidden expense

Used for soft delete architecture.

Critical field.

---

# RECURRING CREATION FLOW

User creates:

TradingView

Jan 1

Monthly

Save

System creates:

Jan 1 occurrence

is_generated = false

is_recurring = true

This becomes the anchor expense.

Immediately after save:

generateRecurringOccurrences()

runs.

System creates all missing occurrences up to current date.

Example:

Today = June

System creates:

Feb
Mar
Apr
May
Jun

All generated occurrences have:

is_generated = true

---

# HISTORICAL BACKFILL

Supported by design.

Example:

User joins Elite X today.

Adds:

Market Data

Start Date (Expense Date)

Jan 1

Monthly

Current month = June

System immediately generates:

Jan
Feb
Mar
Apr
May
Jun

User instantly sees complete historical expense history.

---

# CATCH-UP GENERATION

Implemented.

Location:

app/expenses/page.tsx

On Expenses Page load:

loadExpenses()
↓
catchUpRecurringExpenses()
↓
generateRecurringOccurrences()
↓
reloadExpenses()
↓
render UI

Purpose:

If user disappears for months:

Jan
Feb
Mar

exist

User returns in June

System automatically creates:

Apr
May
Jun

No user action required.

---

# ANCHOR EXPENSE RULE

Only anchor expenses may generate occurrences.

Requirements:

is_recurring = true

is_generated = false

is_deleted = false

is_active = true

Generated occurrences never generate more occurrences.

This prevents infinite loops.

---

# DUPLICATE PREVENTION

Before creating an occurrence:

System checks:

recurring_group_id

AND

expense_date

If matching row already exists:

Skip creation.

No duplicate occurrence generated.

Purpose:

Protects against:

Page refreshes

Multiple page visits

Repeated catch-up runs

Repeated generation attempts

---

# SOFT DELETE ARCHITECTURE

User deletion no longer removes rows from database.

Instead:

is_deleted = true

is applied.

loadExpenses() only loads:

is_deleted = false

Result:

Deleted occurrence disappears from UI.

But database still remembers it existed.

---

# DELETED OCCURRENCE PROTECTION

Critical behavior.

Example:

Jan
Feb
Mar
Apr

User deletes:

Mar

System:

Mar
is_deleted = true

Later:

Catch-up generation runs.

Generator checks:

Does Mar exist?

Answer:

YES

Because row still exists.

Therefore:

DO NOT RECREATE

Result:

Deleted occurrences never come back.

User intent is preserved forever.

---

# EDIT BEHAVIOR

Every occurrence is independent.

Example:

Jan = $50
Feb = $50
Mar = $50

User edits:

Mar = $100

Result:

Jan = $50

Feb = $50

Mar = $100

Future occurrences remain unchanged.

Historical accounting integrity preserved.

---

# EXPORT BEHAVIOR

Exports only include:

is_deleted = false

expenses.

Deleted occurrences remain hidden.

Generated occurrences are treated exactly like normal expenses.

No special export handling required.

Accountant receives clean expense history.

---

# ACCOUNTING / CRA DESIGN PRINCIPLE

Recurring expenses must produce real accounting records.

We intentionally rejected:

Virtual recurring calculations

Frontend-only recurring projections

Synthetic recurring rows

Reason:

Accountants need actual dated expense entries.

Generated occurrences provide:

Accurate monthly reports

Accurate yearly reports

Accurate tax summaries

Accurate vendor spending

Accurate category spending

Accurate recurring cost analysis

---

# FINAL V1 STATUS

Completed:

✓ Daily recurring expenses

✓ Weekly recurring expenses

✓ Monthly recurring expenses

✓ Quarterly recurring expenses

✓ Yearly recurring expenses

✓ Historical backfill generation

✓ Automatic catch-up generation

✓ Duplicate prevention

✓ Recurring chain grouping

✓ Soft delete architecture

✓ Deleted occurrence protection

✓ Individual occurrence editing

✓ Individual occurrence deletion

✓ Accountant-safe exports

✓ CRA-safe expense history

✓ Page-load self-healing generation

Recurring Expense Engine V1 is considered feature complete unless future bugs are discovered.
