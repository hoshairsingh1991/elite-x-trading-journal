git add .
git commit -m "Dashboard V2 KPI visualization overhaul

- Added KPI sparkline architecture
- Added unique gradient IDs for sparkline rendering
- Added Win Rate sparkline
- Added Profit Factor sparkline
- Added Expectancy sparkline
- Added Best Day sparkline
- Added Worst Day sparkline
- Added Max Drawdown sparkline (v1 synthetic)
- Added KPIHistogram component
- Added Avg Win / Avg Loss histogram visualization
- Added Trading Score circular gauge
- Added gradient ring for Trading Score
- Added /100 score display
- Added KPI card offset controls
- Added per-card positioning controls
- Improved KPI visual hierarchy
- Refined Dashboard V2 Account Overview layout"


Current latest checkpoint

git commit -m "checkpoint/kpi-grid-v1"

git commit -m "checkpoint: KPI Grid V1 complete"
git tag checkpoint/kpi-grid-v1


ELITE X DASHBOARD V2 – KPI SECTION ROADMAP

CURRENT STATUS

Completed:

* Net P&L sparkline
* Win Rate sparkline
* Profit Factor sparkline
* Independent sparkline color system
* Matching line + gradient fill colors
* Unique SVG gradient IDs (fixed purple/green fill issue)
* Increased top-row card height
* Improved sparkline positioning and breathing room
* Independent chart data pipeline (each KPI can have its own data source)

---


---



---

PHASE 5 – DATE RANGE CONTEXT

Add date range display under KPI values.

Examples:

7 Days:
May 1 – May 7, 2026

30 Days:
May 1 – May 30, 2026

YTD:
Jan 1 – Current Date

All Time:
First Trade – Latest Trade

Purpose:
Give KPI context based on selected dashboard filter.

---

PHASE 6 – KPI HOVER EFFECTS

Every card should feel interactive.

Potential effects:

* Slight lift on hover
* Border glow
* Soft background highlight
* Subtle scale effect
* Smooth transition

Goal:
Cards should feel active rather than static.

---

PHASE 7 – REAL ANALYTICS TRENDS

Replace temporary placeholder chart logic with actual analytics.

Future implementations:

Profit Factor Trend

* Rolling profit factor over time

Expectancy Trend

* Rolling expectancy calculation

Drawdown Trend

* Actual drawdown progression

Win Rate Trend

* Rolling win rate

Goal:
Charts become analytically meaningful rather than visual placeholders.

---

CURRENT PRIORITY ORDER

1. Expectancy Sparkline
2. Best Day Sparkline
3. Worst Day Sparkline
4. Max Drawdown Sparkline
5. Interactive Hover Tooltips
6. KPI Info Dot System
7. Hover Effects
8. Date Range Context
9. Chart / Simple KPI Layout Separation
10. Real Analytics Trend Calculations


KPI Sparkline Edge Case

Current behavior:
- Sparklines require 2+ data points.
- Today filter may produce only 1 day of data.
- Charts intentionally hide when insufficient data exists.

Future improvement:
- Display a subtle flat line or "Insufficient data" state for 1-point datasets.

Max Drawdown V1

Current:
- Synthetic drawdown trend.
- Used to complete KPI row visuals.

Future:
- Build true historical drawdown curve from equity curve.
- Calculate rolling peak-to-trough drawdown.
- Replace synthetic trend with actual drawdown history.

---
To-Do List 
---

# DASHBOARD V2 — NEXT PHASE ROADMAP

## Current Status

Completed:

### Header

* Dashboard V2 header finalized
* Account selector styling finalized
* Strategy selector styling finalized
* Date range selector styling finalized
* Upload CSV button finalized
* Sync IBKR button finalized
* Profile section finalized

### KPI Row 1

Completed:

* Net P&L
* Win Rate
* Profit Factor
* Expectancy
* Avg Win / Avg Loss
* Max Drawdown

### KPI Row 2

Completed:

* Total Trades
* Winning Trades
* Losing Trades
* Best Day
* Worst Day
* Avg Hold
* Trading Score

### KPI Tooltips

Completed:

* MetricInfoTooltip architecture
* Profit Factor tooltip
* Expectancy tooltip
* Trading Score tooltip

### Net P&L Interactive Chart

Completed:

* Dedicated NetPnLSparkline component
* Hover tracking
* Dynamic date display
* Dynamic P&L display
* Hover indicator dot
* Mouse-follow tooltip
* Timezone-safe date parsing

Architecture approved.

---

# IMPORTANT DECISION

Do NOT build:

* ProfitFactorSparkline.tsx
* ExpectancySparkline.tsx
* DrawdownSparkline.tsx

at this stage.

Reason:

The target dashboard does not appear to use advanced hover interactions for these KPI charts.

Adding additional hover systems would increase complexity without materially improving usability.

NetPnLSparkline remains the only advanced KPI chart for now.

---

# NEXT PRIORITY

## KPI Sparkline Visual Fidelity Pass

Goal:

Match target dashboard KPI charts more closely.

Review:

### KPISparkline.tsx

Investigate:

* Vertical scaling
* Chart amplitude
* Stroke thickness
* Gradient opacity
* Chart height
* Visual contrast

Target outcome:

* More visible trend movement
* Stronger chart presence
* Closer match to institutional dashboard reference

---

# VISUAL POLISH AUDIT

Review entire KPI area for consistency.

Check:

### KPI Row 1

* Card spacing
* Chart alignment
* Tooltip alignment
* Title spacing
* Value spacing

### KPI Row 2

* Card spacing
* Trading Score balance
* Text hierarchy
* Vertical alignment

---

# DASHBOARD V2 PRIORITY ORDER

## Phase 1

KPI Sparkline Visual Refinement

Goal:
Match target KPI appearance.

---

## Phase 2

Trading Score Visual Refinement

Review:

* Circle sizing
* Metric spacing
* Overall balance

Compare directly against target dashboard.

---

## Phase 3

Equity Curve Section

Review:

* Chart proportions
* Header controls
* KPI summary row
* Card spacing
* Visual hierarchy

This is currently one of the largest differences versus target.

---

## Phase 4

Performance Breakdown Section

Review:

* Donut chart sizing
* Legend spacing
* Metric presentation
* Card proportions

---

## Phase 5

Right Sidebar Refinement

Review:

* Account Overview card
* Open Positions card
* Recent Trades card

Match target layout more closely.

---

# ARCHITECTURE RULES

Continue following:

* Full file rewrites preferred
* Build-safe changes only
* Dedicated components for advanced functionality
* Avoid adding conditional complexity to shared components
* Preserve Dashboard V2 architecture cleanliness

Current reference architecture:

KPISparkline.tsx
→ Standard KPI charts

NetPnLSparkline.tsx
→ Advanced interactive KPI charts

Future advanced charts should follow the NetPnLSparkline pattern only when clear user value exists.

---

# CURRENT COMPLETION ESTIMATE

Header:
100%

KPI Row 1:
~90%

KPI Row 2:
~90%

Dashboard V2 Overall:
~60–65%

Largest remaining work:

* Equity Curve section
* Performance Breakdown section
* Right-side dashboard panels
* Final institutional visual polish













Remaining Known Backlog
Dashboard V2 UI              🔥 Next

Expenses CRUD                Later

FX Presentation Layer        During Dashboard V2

Long/Short Classification    Investigate later

Advanced Expense Analytics   Future

Historical FX Conversion     Future

And importantly:

Checkpoint V8
────────────────────────

dashboard-header-v2-foundation

Status:
COMPLETE

Includes:
- DashboardHeader component
- Filter system migration
- Sync UX improvements
- Header visual baseline
- Build-clean state