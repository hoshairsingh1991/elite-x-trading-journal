# ELITE X TRADING JOURNAL

# MASTER NOTES — SHARED DATE RANGE PICKER SYSTEM (V1)

## PURPOSE

The Date Range Picker is a reusable filtering system designed to be used across all major Elite X Trading Journal pages including:

* Dashboard
* Expenses
* Trade History
* Analytics
* Reports
* Calendar
* Future modules

The objective is to build the filtering architecture once and reuse it everywhere while maintaining a consistent user experience and identical filtering behavior throughout the platform.

---

# ARCHITECTURE PHILOSOPHY

Date filtering must always be controlled by the parent page.

The DateRangePicker component should never own filtering logic.

The DateRangePicker acts only as:

1. UI Layer
2. Date Selection Layer
3. Preset Selection Layer

Actual filtering belongs to the page using the component.

Example:

ExpensePage
↓
ExpensesHeader
↓
DateRangePicker

The DateRangePicker sends:

* selectedPreset
* startDate
* endDate

back to the parent page.

The parent page performs all filtering.

This architecture allows the same DateRangePicker to be reused everywhere without modification.

---

# COMPONENT LOCATION

Shared Component:

components/shared/DateRangePicker.tsx

Current Integration:

components/expenses/ExpensesHeader.tsx

Parent State Owner:

app/expenses/page.tsx

---

# STATE OWNERSHIP

The parent page owns:

```ts
selectedPreset
startDate
endDate
```

Example:

```ts
const [
  selectedPreset,
  setSelectedPreset,
] = useState("All Time");

const [
  startDate,
  setStartDate,
] = useState<Date | null>(null);

const [
  endDate,
  setEndDate,
] = useState<Date | null>(null);
```

DateRangePicker receives:

```ts
selectedPreset
onDateRangeChange()
```

as props.

---

# SUPPORTED PRESETS

Current Presets:

* Today
* This Week
* This Month
* Last 30 Days
* Last Month
* This Quarter
* YTD
* Last Year
* All Time

Future Presets (optional):

* Yesterday
* Last 7 Days
* Last 90 Days
* Last Quarter
* MTD
* QTD
* Rolling 12 Months
* Custom Fiscal Year

---

# PRESET CALCULATIONS

TODAY

```ts
startDate = today
endDate = today
```

THIS WEEK

```ts
startDate = Sunday of current week
endDate = today
```

THIS MONTH

```ts
startDate = first day of current month
endDate = today
```

LAST 30 DAYS

```ts
startDate = today - 30 days
endDate = today
```

LAST MONTH

```ts
startDate = first day of previous month
endDate = last day of previous month
```

THIS QUARTER

```ts
startDate = first day of current quarter
endDate = today
```

YTD

```ts
startDate = January 1 current year
endDate = today
```

LAST YEAR

```ts
startDate = January 1 previous year
endDate = December 31 previous year
```

ALL TIME

```ts
startDate = null
endDate = null
```

Meaning:

Show all available data.

---

# FILTERING RULE

All Time behaves differently.

If:

```ts
startDate === null
```

OR

```ts
endDate === null
```

then:

```ts
return true
```

Meaning:

Do not filter.

Show all records.

Example:

```ts
if (!startDate || !endDate) {
  return true;
}
```

This ensures All Time includes:

* All trades
* All expenses
* All years
* All imported history

---

# EXPENSE FILTERING

Current Implementation:

```ts
const filteredExpenses =
  reportingExpenses.filter(...)
```

Logic:

Convert expense date:

```ts
new Date(
  expense.expense_date +
  "T12:00:00"
)
```

Compare:

```ts
expenseDate >= startDate &&
expenseDate <= endDate
```

Only matching records remain.

---

# TRADE FILTERING

Current Implementation:

```ts
const filteredTrades =
  reportingTrades.filter(...)
```

Logic:

Convert trade date:

```ts
new Date(
  trade.date +
  "T12:00:00"
)
```

Compare:

```ts
tradeDate >= startDate &&
tradeDate <= endDate
```

Only matching trades remain.

---

# WHY T12:00:00 IS USED

Never parse:

```ts
new Date("2026-06-01")
```

because timezone shifts can move the date backward.

Instead:

```ts
new Date(
  "2026-06-01T12:00:00"
)
```

This prevents timezone-related date drift.

This is now Elite X standard.

Use everywhere.

---

# LOCAL STORAGE PERSISTENCE

Current Storage Key:

```ts
expensesDateFilter
```

Stored Object:

```json
{
  "selectedPreset": "This Month",
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-06-19T00:00:00.000Z"
}
```

Purpose:

When user returns to Expenses page:

* Previous filter restored
* Previous preset restored
* Previous range restored

Provides professional dashboard behavior.

---

# PAGE-SPECIFIC PERSISTENCE RULE

Each page maintains its own filter.

Examples:

Dashboard:

```ts
dashboardDateFilter
```

Expenses:

```ts
expensesDateFilter
```

Trades:

```ts
tradesDateFilter
```

Analytics:

```ts
analyticsDateFilter
```

Do NOT share filters globally.

Reason:

Users often want:

Dashboard = This Month

while

Expenses = Last Year

at the same time.

---

# UI DESIGN DECISIONS

Date Range button displays:

Left:

* Calendar Icon
* Date Range Label

Right:

* Selected Preset

Examples:

```text
Date Range     This Month
```

```text
Date Range     YTD
```

```text
Date Range     Custom
```

---

# CALENDAR DESIGN DECISIONS

Calendar Technology:

react-day-picker

Wrapped inside:

ShadCN Calendar

---

# OUTSIDE DAYS

Final Decision:

```ts
outside: cn(
  "invisible",
  defaultClassNames.outside
)
```

Reason:

Default calendar shows:

* Previous month dates
* Next month dates

This created:

* visual clutter
* confusing range highlights
* range bleed into adjacent months

Using invisible:

* preserves grid alignment
* removes clutter
* creates cleaner institutional appearance

This is now Elite X standard.

---

# CUSTOM RANGE BEHAVIOR

When user manually selects dates:

```text
Calendar Click
```

DateRangePicker sends:

```ts
onDateRangeChange(
  "Custom",
  fromDate,
  toDate
)
```

Parent page updates state.

Filtering immediately updates.

---

# RESET BUTTON

Reset should:

```text
Clear Selection
↓
Set Preset = All Time
↓
Set startDate = null
↓
Set endDate = null
↓
Refresh analytics
```

Result:

Entire dataset visible.

---

# REUSABILITY STANDARD

Every future page should follow:

Page
↓
Owns Date State

Header
↓
Receives State

DateRangePicker
↓
Returns Date Selection

Never duplicate filtering logic.

Never duplicate preset calculations.

Never allow DateRangePicker to own business logic.

DateRangePicker remains reusable UI infrastructure.

---

# V1 COMPLETION STATUS

Completed:

✓ Shared DateRangePicker
✓ Presets
✓ Custom Range Selection
✓ Expense Filtering
✓ Trade Filtering
✓ Local Storage Persistence
✓ All Time Logic
✓ Calendar Cleanup
✓ Parent-Owned State Architecture
✓ Reusable Design Pattern

Future Enhancements:

□ Active Preset Highlight
□ Month Navigation Polish
□ Calendar Visual State Restoration
□ Fiscal Year Support
□ Rolling Date Presets
□ Global Filter Sync (optional)

STATUS:

DATE RANGE PICKER V1 COMPLETE AND APPROVED FOR REUSE ACROSS ELITE X PLATFORM.
