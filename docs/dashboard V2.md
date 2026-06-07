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



### KPISparkline.tsx

---

# VISUAL POLISH AUDIT

Review entire KPI area for consistency.

Check:

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