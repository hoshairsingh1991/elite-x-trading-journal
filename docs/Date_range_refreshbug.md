# DASHBOARD DATE FILTER FIX — AUG 13, 2026

## ISSUE

Dashboard had the same issue we previously fixed on the Expenses page.

After syncing today's IBKR trades:

- Today's trades were successfully synced.
- Data existed correctly.
- Dashboard did NOT show today's trades immediately.
- User had to open the date range picker.
- Select YTD again.
- Then today's trades appeared.

---

## ROOT CAUSE

Dashboard was persisting:

dashboardDateFilter

The selected preset was being saved together with its calculated dates.

Example:

{
  "selectedPreset": "YTD",
  "startDate": "2026-01-01T05:00:00.000Z",
  "endDate": "2026-08-14T03:59:59.999Z"
}

When Dashboard loaded, it restored these exact dates.

For dynamic presets such as YTD, this meant the endDate could become stale.

The Dashboard was therefore using:

Saved YTD dates

instead of:

Fresh YTD dates based on the current day.

---

## WHY RESELECTING YTD FIXED IT

When the user manually selected YTD:

DateRangePicker recalculated:

startDate
endDate

using the current date.

Dashboard then immediately included today's trades.

This confirmed the issue was the persisted date-filter state.

---

## FIX

Updated Dashboard date persistence logic to behave the same way as the Expenses page.

Dynamic presets are now recalculated whenever Dashboard loads.

Dynamic presets:

- Today
- This Week
- This Month
- Last 30 Days
- This Quarter
- YTD

The selected preset is still persisted.

Only the actual date boundaries are recalculated.

Custom/fixed date ranges continue restoring their saved dates.

---

## RESULT

Before:

Sync today's trades
↓
Refresh Dashboard
↓
Old YTD endDate restored
↓
Today's trades missing
↓
Manually select YTD
↓
Today's trades appear

After:

Sync today's trades
↓
Refresh Dashboard
↓
YTD detected as dynamic preset
↓
Fresh YTD range calculated
↓
Today's trades immediately visible

---

## VERIFIED

Confirmed working.

After refreshing Dashboard:

Today's trade is visible immediately.

No need to open the date range picker.

---

## IMPORTANT

This was NOT an IBKR sync problem.

Do NOT modify the following to solve this issue:

- loadExecutionsFromSupabase()
- pairTrades()
- IBKR sync
- Supabase execution storage
- execution ledger
- trade reconstruction
- analytics

The problem was strictly the Dashboard's persisted date-filter state.

---

## FUTURE RULE

For any page using persisted relative/dynamic date presets:

Persist:

selectedPreset

But recalculate:

startDate
endDate

from the current date whenever the page initializes.

Do NOT permanently restore stale date boundaries for dynamic presets.