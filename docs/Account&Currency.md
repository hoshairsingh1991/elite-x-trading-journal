# Account & Currency System — Implementation Notes

## Overview

The Account & Currency card evolved from a simple informational widget into the foundation of Elite X's multi-currency reporting architecture.

The goal was not simply to display account currencies, but to build a future-proof reporting system capable of supporting:

* USD traders
* CAD traders
* EUR traders
* GBP traders
* JPY traders
* INR traders

using a single analytics engine.

---

# Phase 1 — Account & Currency Card

## New Dashboard Card

Created:

```text
components/dashboard-v2/AccountCurrencyCard.tsx
```

Purpose:

* Account currency breakdown
* Currency allocation display
* Reporting currency selection
* Future FX integration entry point

This card sits inside:

```text
components/dashboard-v2/EquitySection.tsx
```

alongside:

* Equity Curve
* Performance Breakdown
* Open Positions
* Recent Trades

---

# Phase 2 — Currency Analytics Engine

Created:

```text
lib/analytics/accountCurrencyAnalytics.ts
```

Purpose:

Aggregate trade data by currency.

Calculates:

* P&L by currency
* Commission by currency
* Percentage allocation
* Currency distribution

Outputs dashboard-ready analytics.

Example:

USD:
+$819.23

CAD:
+C$458.39

EUR:
-€24.01

---

# Phase 3 — FX Infrastructure

Created:

```text
lib/fx/fxConversion.ts
```

Purpose:

Centralized FX conversion utilities.

Contains:

* exchange rate lookup
* currency conversion helpers
* future live FX integration hooks

Current version uses static conversion rates.

Architecture intentionally designed so rate source can later be replaced with:

* live FX API
* historical FX database
* Supabase FX table

without changing analytics logic.

---

Created:

```text
lib/fx/convertTradesToReportingCurrency.ts
```

Purpose:

Convert all trade-level values into selected reporting currency before analytics are calculated.

Converts:

* pnl
* commissions
* fees

This file became the central reporting currency transformation layer.

Flow:

Trades
↓
Currency Conversion
↓
Reporting Currency
↓
Analytics Engine
↓
Dashboard

---

Created:

```text
lib/fx/currencyFormatting.ts
```

Purpose:

Centralized currency symbol management.

Supported:

USD → $
CAD → C$
EUR → €
GBP → £
JPY → ¥
INR → ₹

All dashboard components now use this helper.

No dashboard component should hardcode currency symbols.

---

# Phase 4 — Reporting Currency Selector

Implemented inside:

```text
components/dashboard-v2/AccountCurrencyCard.tsx
```

Added dropdown:

* USD
* CAD
* EUR
* GBP
* JPY
* INR

State created in:

```text
app/page.tsx
```

```ts
const [
  reportingCurrency,
  setReportingCurrency,
] = useState("USD");
```

Reporting currency is propagated through the dashboard via props.

---

# Phase 5 — Reporting Currency Persistence

Implemented:

```text
app/page.tsx
```

Added:

```ts
localStorage
```

persistence.

Behavior:

User selects INR
↓
Refresh page
↓
Still INR

No database required.

Future migration path:

localStorage
↓
Supabase User Preferences

---

# Phase 6 — Dashboard Integration

Reporting currency was wired into all major dashboard analytics.

Files touched:

```text
app/page.tsx
```

```text
components/dashboard-v2/EquitySection.tsx
```

```text
components/dashboard-v2/KPIGrid.tsx
```

Analytics are now calculated against converted trades.

---

# Phase 7 — KPI Currency Support

Modified:

```text
components/dashboard-v2/KPIGrid.tsx
```

Converted:

* Net P&L
* Avg Win
* Avg Loss
* Best Day
* Worst Day
* Expectancy

from hardcoded USD display to dynamic reporting currency display.

All values now use:

```text
getCurrencySymbol()
```

---

# Phase 8 — Equity Curve Integration

Created:

```text
components/dashboard-v2/EquityCurveCard.tsx
```

Created:

```text
components/dashboard-v2/EquityCurveChart.tsx
```

Reporting currency support added to:

* KPI strip
* Chart axis
* Tooltip values

Fixed:

Hardcoded "$" values.

Now displays:

USD:
$1.5K

CAD:
C$1.5K

INR:
₹103K

---

# Phase 9 — Net P&L Sparkline Integration

Modified:

```text
components/dashboard-v2/NetPnLSparkline.tsx
```

Fixed tooltip formatting.

Before:

$123.45

After:

₹123.45
C$123.45
€123.45

based on selected reporting currency.

---

# Phase 10 — Performance Breakdown Integration

Modified:

```text
components/dashboard-v2/PerformanceBreakdownCard.tsx
```

Removed hardcoded USD values.

Converted:

* Net P&L
* Long P&L
* Short P&L
* Commissions
* Expenses
* Gross P&L

to reporting currency aware formatting.

---

# Final Architecture

Current flow:

Trades
↓
Trade Currency
↓
FX Conversion Layer
↓
Reporting Currency
↓
Analytics Engine
↓
Dashboard Components

This architecture supports future:

* Live FX rates
* Historical FX rates
* Multi-currency manual trade entry
* User-specific reporting preferences

without redesigning analytics.

---

# Files Created

```text
lib/fx/fxConversion.ts
```

```text
lib/fx/convertTradesToReportingCurrency.ts
```

```text
lib/fx/currencyFormatting.ts
```

```text
lib/analytics/accountCurrencyAnalytics.ts
```

```text
components/dashboard-v2/AccountCurrencyCard.tsx
```

```text
components/dashboard-v2/EquityCurveCard.tsx
```

```text
components/dashboard-v2/EquityCurveChart.tsx
```

---

# Files Modified

```text
app/page.tsx
```

```text
components/dashboard-v2/EquitySection.tsx
```

```text
components/dashboard-v2/KPIGrid.tsx
```

```text
components/dashboard-v2/NetPnLSparkline.tsx
```

```text
components/dashboard-v2/PerformanceBreakdownCard.tsx
```

---

# Current Status

Reporting Currency V1

Status:

COMPLETE

Supports:

* USD
* CAD
* EUR
* GBP
* JPY
* INR

Persistence:

* localStorage

Deployment:

* Production (main)
* Commit: 8343c86

Future Phase:

Reporting Currency V2

Planned:

* Live FX rates
* Historical FX rates
* Supabase FX storage
* Trade-date FX conversion
* User preference persistence
