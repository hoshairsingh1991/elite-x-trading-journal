# Trading Calendar — Architecture & Implementation Notes

## Overview

The Trading Calendar is an institutional-grade visualization component that provides a month-based overview of realized trading activity while remaining synchronized with Elite X's canonical accounting and reporting currency architecture.

The calendar is designed as a **presentation-layer component**. It does not perform accounting, reconciliation, or canonical trade mutation.

Its responsibilities include:

* Daily realized P&L visualization
* Trading activity heatmap
* Trading day navigation
* Daily trade review modal
* Reporting-currency-aware presentation

---

# Core Philosophy

The Trading Calendar is **not an accounting engine**.

It consumes already-processed trade data and renders it for visualization.

Canonical architecture:

```text
Executions
↓
Deterministic Reconstruction
↓
Canonical Trades
↓
(Optional) Reporting Currency Conversion
↓
Trading Calendar
↓
User Interface
```

The calendar must never modify trades or executions.

---

# Realized Accounting Doctrine

Elite X officially attributes realized P&L to the trade close date.

The Trading Calendar groups activity using:

```text
closedAt || date
```

rather than trade entry date.

This keeps the calendar synchronized with:

* Daily P&L analytics
* Trading Behavior analytics
* Performance Breakdown
* Realized accounting systems

and avoids historical timezone and attribution inconsistencies.

---

# Dashboard Layout Refactor

Originally, the calendar was positioned using large negative translations:

```css
-translate-y-[860px]
```

This visually moved the component upward but left a large amount of unused layout space because CSS transforms do not affect document flow.

Result:

* massive phantom whitespace
* brittle layout behavior
* maintenance complexity

---

## Final Layout

The dashboard was refactored into a natural layout hierarchy.

The calendar is now rendered inside `EquitySection` beneath the primary analytics cards.

Structure:

```text
KPI Grid

EquitySection
├── Equity Curve
├── Performance Breakdown
├── Secondary Metrics
└── Trading Calendar

Right Column
├── Account & Currency
├── Open Positions
└── Recent Trades
```

Benefits:

* removed translate hacks
* removed phantom whitespace
* improved maintainability
* responsive layout behavior
* natural document flow

---

# Hover Effects

The Trading Calendar was updated to match Dashboard V2 interaction design.

Added:

* smooth transition
* subtle lift on hover
* consistent animation timing

Purpose:

Provide visual consistency with KPI cards and surrounding dashboard components.

---

# Modal Layer Fix

Clicking a calendar day opens a detailed review modal.

A stacking-context issue caused dashboard cards to appear above the modal.

Solution:

```css
z-[9999]
```

was applied to the modal overlay to guarantee proper rendering above all dashboard content.

---

# Footer Spacing

After removing translate-based positioning, the dashboard no longer had artificial bottom whitespace.

An intentional spacer was added at the bottom of the page:

```tsx
<div className="h-6 shrink-0" />
```

Purpose:

* visual breathing room
* cleaner scroll termination
* intentional layout spacing

---

# Monthly P&L Removal

The calendar originally displayed:

* Monthly P&L
* Trading Days
* Total Trades

Monthly P&L was removed because it duplicated information already available in:

* KPI Grid
* Performance Breakdown

The header now displays only:

* Trading Days
* Total Trades

This reduces redundancy and improves visual hierarchy.

---

# Reporting Currency Integration

## Previous Behavior

The calendar always rendered values in USD.

This caused inconsistency with the rest of Dashboard V2 when users selected another reporting currency.

Example:

Dashboard:

```text
CAD
```

Calendar:

```text
USD
```

This behavior was incorrect.

---

## Current Architecture

The calendar now receives:

```ts
reportingTrades
```

instead of:

```ts
filteredTrades
```

Flow:

```text
Canonical Trades
↓
convertTradesToReportingCurrency()
↓
reportingTrades
↓
Trading Calendar
```

As a result:

* day totals
* daily P&L labels
* calendar heatmap
* daily review values

all stay synchronized with the selected reporting currency.

---

# Reporting Currency Source

Conversion is **not performed inside TradingCalendar**.

Instead, conversion occurs upstream through:

```ts
convertTradesToReportingCurrency()
```

This follows Elite X's architecture of separating:

```text
Canonical Accounting
↓
Presentation FX Layer
↓
Dashboard Rendering
```

TradingCalendar should remain a passive consumer of already-converted presentation data.

---

# Currency Symbol Formatting

Hardcoded:

```text
$
```

symbols were removed.

The component now uses:

```ts
getCurrencySymbol(reportingCurrency)
```

which supports:

* USD
* CAD
* EUR
* GBP
* JPY
* INR

and any future supported reporting currencies.

This keeps formatting centralized and consistent across the platform.

---

# Canonical Data Safety

The Trading Calendar does **not** mutate canonical trades.

Changing reporting currency only affects presentation.

Architecture:

```text
filteredTrades
        │
        ├──────────────► Other dashboard systems
        │
        └──► convertTradesToReportingCurrency()
                     │
                     ▼
              reportingTrades
                     │
                     ▼
             Trading Calendar UI
```

Original trade data remains untouched.

No accounting records are modified.

---

# Accounting Integrity

Trading Calendar changes do **not** affect:

* executions
* deterministic reconstruction
* FIFO reconciliation
* pairTrades()
* analytics engine
* trade storage
* Supabase persistence
* reporting calculations
* broker-native currency storage

The component is strictly presentation-layer UI.

---

# Future-Proof Design

The current implementation aligns with planned future enhancements, including:

* historical FX rates
* trade-date FX conversion
* additional reporting currencies
* portfolio base currency support
* institutional FX presentation layers
* multi-broker environments

Because conversion is centralized, the calendar automatically benefits from future FX improvements without internal rewrites.

---

# Protected Architecture Rule

TradingCalendar must NEVER:

* perform its own FX conversion
* mutate canonical trades
* modify executions
* alter stored P&L
* create synthetic accounting values
* duplicate reporting conversion logic

It should always consume presentation-ready data generated by the centralized reporting currency pipeline.

---

# Current Status

Status:

```text
COMPLETE
```

Implemented features:

* Natural dashboard integration
* Removal of translate-based layout hacks
* Hover interactions
* Modal z-index fix
* Bottom footer spacing
* Monthly P&L removal
* Reporting currency synchronization
* Centralized currency symbol formatting
* Presentation-layer-only architecture
* Full compatibility with Elite X Reporting Currency V2

The Trading Calendar is now fully aligned with the dashboard's reporting currency system while preserving canonical accounting integrity and future scalability.
