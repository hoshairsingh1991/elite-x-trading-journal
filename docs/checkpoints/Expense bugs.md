# EXPENSES MODULE - MASTER NOTES / NEXT STEPS

## Current Status

The Expenses module is now largely functional and connected to real data.

Completed:

* Supabase Expense CRUD
* Add Expense Drawer
* Edit Expense
* Delete Expense
* Search / Filters
* Pagination
* Reporting Currency Integration
* FX Conversion Layer
* KPI Grid FX Support
* Tax Summary FX Support
* Manual Expenses Table Reporting Amount
* Business Cost Analytics
* Commission Analytics
* Expense Sources Card
* Expense Breakdown Card
* Recurring Card
* Expenses Over Time Chart
* Commission + Manual Expense Chart Integration
* Premium Tooltip System

---

# BUG #1 - DAILY RECURRING EXPENSE CRASH

## Status

Confirmed Reproducible

## Reproduction Steps

1. Create Expense
2. Enable Recurring
3. Frequency = Daily
4. Select Start Date
5. Save Expense
6. Expenses Page becomes unresponsive

## Important Findings

Works:

* Daily + NO Start Date
* Weekly + Start Date
* Monthly + Start Date
* Yearly + Start Date

Crashes:

* Daily + Start Date

## What This Means

The issue is NOT:

* FX Conversion
* Expense Table
* Dashboard
* Browser
* Supabase
* Expense Amount

The issue is likely inside recurring date generation logic.

Most likely file:

```text
lib/analytics/expenseAnalytics.ts
```

Search for:

```text
start_date
frequency
is_recurring
Daily
while()
for()
Date calculations
```

Likely cause:

* Infinite loop
* Date increment bug
* Daily frequency not advancing correctly

Priority:

HIGH

---

# BUG #2 - RECURRING EXPENSES ARE NOT ACTUALLY RECURRING

## Current Behavior

Recurring expenses are currently stored as metadata only.

Example:

TradingView
$30
Monthly
Start Date = Feb 13

Current system stores:

1 expense row

Analytics likely count:

$30

---

## Expected Behavior

If expense starts Feb 13:

Generated entries should be:

Feb 13
Mar 13
Apr 13
May 13
Jun 13
...

End of year report should show:

12 separate expense entries

not 1.

---

## Business Requirement

Recurring expenses should automatically generate future expense entries.

User should NOT manually create:

* TradingView every month
* Bookmap every month
* Data Feed every month
* VPS every month

System should do this automatically.

---

# RECURRING EXPENSE ENGINE (V2)

Recommended Architecture

## Recurring Template

Original Expense:

```text
TradingView Pro
$30
Monthly
Start Date = Feb 13
```

## Generated Expenses

System automatically creates:

```text
Feb 13
Mar 13
Apr 13
May 13
Jun 13
...
```

Each should become a real expense record.

---

## Additional Field Needed

Potential future field:

```text
recurring_group_id
```

Purpose:

Link all generated expenses together.

Example:

```text
TradingView Feb
TradingView Mar
TradingView Apr
```

All belong to:

```text
recurring_group_id = abc123
```

Allows future support for:

* Edit future occurrences
* Cancel subscription
* Change amount
* Change frequency

---

# EXPENSES OVER TIME CARD

## Status

~95% Complete

Completed:

* Manual Expenses
* Commissions
* Total Costs
* Reporting Currency
* Stacked Bars
* Tooltip
* Chart Animation
* Monthly / Yearly Toggle

Remaining:

* Minor visual polish only
* Review colors
* Review spacing

No major development remaining.

---

# EXPENSE SOURCES CARD

Status:

Complete

Completed:

* Manual Expenses
* Auto Calculated Commissions
* Reporting Currency Support

---

# EXPENSE BREAKDOWN CARD

Status:

Complete

Completed:

* Category Breakdown
* Percentages
* Reporting Currency Support

---

# RECURRING CARD

Status:

Complete (UI)

Need validation after recurring engine is implemented.

---

# TAX SUMMARY CARD

Status:

Complete

Completed:

* Reporting Currency Support
* Deductible Calculations
* Donut Chart

---

# REPORTING CURRENCY

Status:

Complete

Completed:

* Dashboard Currency = Master Currency
* Expenses Page follows Dashboard Currency
* FX Conversion Layer
* KPI Cards
* Tax Summary
* Expense Sources
* Expense Table Reporting Amount

Remaining:

Review remaining placeholder cards during Intelligence section implementation.

---

# NEXT DEVELOPMENT ORDER

1. Final polish on Expenses Over Time Card
2. Expenses Intelligence Section
3. Investigate Daily Recurring Crash
4. Design Recurring Expense Generation Engine
5. Implement Automatic Recurring Expense Creation
6. Validate all analytics with generated recurring expenses
7. Validate year-end reporting

---

# IMPORTANT DISCOVERY

Daily recurring expenses previously appeared to work.

This suggests:

The bug was likely introduced recently during analytics/chart work.

Focus investigation on:

```text
expenseAnalytics.ts
```

rather than Expense CRUD or Supabase.

Most likely area:

Recurring date expansion logic.




# EXPENSES MODULE - PROJECTED ANNUAL BURN ARCHITECTURE REVIEW

## Status

DEFERRED

No implementation changes should be made at this time.

The current Projected Annual Burn card remains functional, but the calculation methodology is not yet finalized.

---

# CURRENT IMPLEMENTATION

Current Formula:

```text
Monthly Burn × 12
```

Where:

```text
Monthly Burn
=
Total Expenses
÷
Months Covered
```

Example:

```text
Total Expenses = $46.46

Months Covered = 6

Monthly Burn = $7.74

Projected Annual Burn
=
$7.74 × 12
=
$92.88
```

The mathematics are correct.

However, the metric may not accurately represent future operating costs.

---

# DISCOVERY

During implementation review, a major architectural issue was identified.

Recurring expenses are currently treated as metadata only.

Example:

```text
TradingView
$7.82
Recurring = Yes
Frequency = Monthly
Start Date = Jun 20
```

Current system stores:

```text
1 expense record
```

Analytics currently treat that as:

```text
$7.82
```

only.

No future occurrences are generated.

---

# WHY THIS MATTERS

Forecasting depends entirely on how recurring expenses are represented.

At present:

```text
Recurring expenses
≠
future expense occurrences
```

Therefore any annual forecast is inherently incomplete.

---

# EVALUATED APPROACHES

## Option 1

Historical Annualization

Formula:

```text
Monthly Burn × 12
```

Pros:

```text
Simple

Already implemented

Uses historical spending
```

Cons:

```text
One-time expenses distort forecast

Does not represent future obligations

Can understate or overstate true operating costs
```

Example:

```text
Monitor Purchase = $300

Annual forecast increases dramatically

Even though monitor is not recurring
```

Result:

Not ideal.

---

## Option 2

Recurring Expenses × 12

Formula:

```text
Monthly Recurring Expenses
×
12
```

Pros:

```text
Easy to understand

Future focused

Ignores one-time purchases
```

Cons:

```text
Assumes every recurring expense remains active
for a full 12 months

Ignores actual start dates

Ignores billing schedule timing
```

Example:

```text
Subscription added today

System assumes 12 future billings

May not be accurate depending on forecast window
```

Result:

Better than historical annualization, but still imperfect.

---

## Option 3

True 365-Day Forecast

Formula:

```text
Calculate all expected recurring billings
during the next 365 days.
```

Uses:

```text
is_recurring

frequency

start_date
```

Pros:

```text
Most accurate

Supports Monthly

Supports Quarterly

Supports Yearly

Uses actual recurring schedule
```

Cons:

```text
Depends on recurring architecture

Requires finalized recurring expense model
```

Result:

Preferred long-term solution.

---

# BLOCKING ISSUE

The recurring expense architecture has not yet been finalized.

Current roadmap contains:

```text
BUG #2

Recurring expenses are not actually recurring.
```

Planned V2 behavior:

```text
TradingView

Feb 13
Mar 13
Apr 13
May 13
Jun 13
...
```

Future occurrences must be represented either as:

```text
A)
Virtual generated occurrences
```

or

```text
B)
Real generated expense records
```

This decision will directly impact:

```text
Projected Annual Burn

Monthly Burn

Expenses Over Time

Recurring Costs

Tax Reporting

Forecasting

Year-End Reports
```

---

# FINAL DECISION

For now:

```text
DO NOT redesign Projected Annual Burn.
```

Keep current implementation temporarily.

Current card remains:

```text
Projected Annual Burn

Based on current run rate

Method:
Monthly Avg × 12
```

until recurring architecture is finalized.

---

# FUTURE REVISIT TRIGGER

Revisit Projected Annual Burn ONLY AFTER:

```text
Daily Recurring Expense Crash fixed

Recurring Expense Engine designed

Recurring Expense Engine implemented

Recurring occurrence generation validated
```

At that point:

```text
Projected Annual Burn
```

should be rebuilt using actual recurring billing schedules and next-365-day forecasting.

This will produce a business metric that accurately reflects future operating costs rather than historical spending patterns.
