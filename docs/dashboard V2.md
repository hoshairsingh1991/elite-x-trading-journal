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

PHASE 1 – COMPLETE KPI CARD VISUALS

Remaining KPI charts to add:

1. Expectancy

* Green sparkline
* Independent data source
* Same layout as Net P&L / Profit Factor

2. Best Day

* Green sparkline
* Date remains visible
* May require chart-card layout

3. Worst Day

* Red sparkline
* Date remains visible
* May require chart-card layout

4. Max Drawdown

* Red sparkline
* Risk metric visual

Notes:

* Current Profit Factor trend is temporary placeholder logic.
* Real Profit Factor trend calculation will be implemented later.
* Focus now is UI completion and visual consistency.

---

PHASE 2 – KPI CARD ARCHITECTURE CLEANUP

Current issue:

* Chart cards and non-chart cards use the same layout system.
* Requires manual subtitle adjustments when charts are added.

Future solution:

Create two card layouts:

Chart KPI Layout:

* Net P&L
* Win Rate
* Profit Factor
* Expectancy
* Best Day
* Worst Day
* Max Drawdown

Simple KPI Layout:

* Total Trades
* Winning Trades
* Losing Trades
* Avg Hold

Benefits:

* No manual subtitle repositioning
* No repeated offset adjustments
* Cleaner architecture
* Easier future maintenance

---

PHASE 3 – INTERACTIVE KPI SPARKLINES

Goal:
Make dashboard feel alive and institutional-grade.

Features:

* Hover state
* Tooltip
* Value on hover
* Date on hover
* Crosshair / vertical guide
* Smooth interactions

Example:
Hover Net P&L chart
→ Show date
→ Show P&L value
→ Highlight chart position

---

PHASE 4 – KPI INFO TOOLTIP SYSTEM

Add ⓘ icon to every KPI card.

Tooltip structure:

Definition
Formula
Your Calculation
Interpretation

Examples:

* Net P&L
* Win Rate
* Profit Factor
* Expectancy
* Max Drawdown
* Avg Hold
* Trading Score
* Calmar Ratio
* Consistency Score

Goal:
Transparency + Education + Institutional feel

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