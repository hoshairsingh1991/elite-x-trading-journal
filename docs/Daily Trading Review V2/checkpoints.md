============================================================
ELITE X TRADING JOURNAL
DAILY TRADING REVIEW V2 — CHECKPOINT NOTES
============================================================

CHECKPOINT
----------
Daily Review V2 — Current Component Baseline

DATE
----
2026-09-18

STATUS
------
Daily Review V2 UI implementation is established and the current
component source has been reviewed and captured as the working
baseline for the next development phase.

IMPORTANT
---------
The code supplied in this checkpoint is the CURRENT SOURCE OF TRUTH
for the Daily Review V2 components.

Do NOT revert to, reconstruct, or assume implementations from older
conversations, checkpoints, or memory.

Before making any future code change:
1. Use the current code supplied in the active conversation.
2. If a relevant file has changed since this checkpoint, request the
   current version before modifying it.
3. Preserve existing behavior unless the requested change explicitly
   requires behavioral modification.
4. Treat canonical trading data and existing analytics behavior as
   protected architecture.

============================================================
DAILY REVIEW V2 — ARCHITECTURAL CONTEXT
============================================================

PURPOSE
-------
Daily Review V2 provides a premium daily trading review experience.

The workflow is:

Calendar
  ↓
Selected Trading Day
  ↓
Daily Review
  ↓
Daily KPIs / Performance / Insights / Secondary Metrics
  ↓
Breakdowns
  ↓
Trade Activity / Trade Table
  ↓
Trade Review Drawer

The Daily Review is an analytics and review layer.

It must not modify canonical trading calculations such as:
- executions
- FIFO matching
- reconstructed trades
- pairTrades
- reconciliation
- canonical P&L

Any future review/journaling functionality must remain separated
from the canonical trading-data engine.

============================================================
CURRENT COMPONENTS
============================================================

The following current implementations were supplied and reviewed:

1. DailyReviewHeader
2. DailyReviewKpis
3. dailyReviewTypes
4. DailyReviewInsights
5. DailyReviewSecondaryMetrics
6. DailyReviewBreakdown
7. DailyReviewTradeTable
8. DailyReviewPerformance

These versions represent the current implementation baseline.

============================================================
1. DailyReviewHeader
============================================================

RESPONSIBILITY
--------------
Displays the Daily Review header for the selected trading day.

CURRENT PROPS
-------------
DailyReviewHeaderProps:

- selectedDay
- currentMonth
- monthName
- currentYear
- selectedTrades
- onClose

CURRENT BEHAVIOR
----------------
The header calculates the trading session start and end times from
selectedTrades.

Trading start:
- Finds the earliest valid trade.openedAt.

Trading end:
- Finds the latest valid trade.closedAt.

Invalid or missing timestamps are ignored.

Date display:
- Uses currentYear/currentMonth/selectedDay.
- Displays:
    Month Day, Year
    Weekday

Current controls:

LEFT:
- Back button
- Calendar button
- Selected date
- Weekday

RIGHT:
- Trading Day indicator
- Session time
- All Accounts control
- Replay Day control
- Close button

RESPONSIVE BEHAVIOR
-------------------
Several right-side controls are hidden below container-width
breakpoints.

Container queries currently include:

- @[900px]: Trading Day
- @[820px]: Session
- @[760px]: Account
- Replay Day currently remains hidden below its configured breakpoint

CURRENT VISUAL STANDARD
-----------------------
Uses the established Elite X dark UI:

- Primary card background:
    bg-[#0b1220]

- Standard border:
    border-white/[0.06]

- Hover border:
    border-white/[0.12]

- Standard radius:
    rounded-[8px]

============================================================
2. DailyReviewKpis
============================================================

RESPONSIBILITY
--------------
Displays the primary Daily Review KPI row.

CURRENT PROPS
-------------
DailyReviewKpisProps:

- selectedTrades
- reportingCurrency

CURRENT KPI CARDS
-----------------
Seven KPI cards are currently rendered:

1. Net P&L
2. Gross P&L
3. Total Trades
4. Win Rate
5. Profit Factor
6. Total Fees
7. Avg Hold Time

NET P&L
-------
Calculated from:

sum of trade.pnl

trade.pnl is currently treated as the canonical net trade result.

GROSS P&L
---------
Calculated as:

grossPnL = netPnL + totalFees

The implementation assumes trade.pnl already includes fees.

Therefore:

Gross P&L = Net P&L + Fees

TOTAL TRADES
------------
selectedTrades.length

WIN / LOSS
----------
Wins are identified by:

trade.status === "WIN"

Losses are identified by:

trade.status === "LOSS"

WIN RATE
--------
Currently calculated using totalTrades:

winCount / totalTrades * 100

PROFIT FACTOR
-------------
Current definition:

Gross winning P&L /
absolute gross losing P&L

Winning P&L is calculated from WIN trades.

Losing P&L is calculated from LOSS trades.

If gross loss is zero:
- positive gross profit → Infinity
- otherwise → 0

Display:
- finite values → two decimals
- infinite positive result → "∞"
- zero/no result → "—" in the display branch

AVG HOLD TIME
-------------
Uses only trades containing both:

- openedAt
- closedAt

Duration is calculated in minutes.

Display:
- hours + minutes when >= 1 hour
- minutes otherwise

Examples:
- 45m
- 1h 20m

============================================================
3. dailyReviewTypes
============================================================

CURRENT TYPE DEFINITIONS
------------------------

DailyReviewBaseProps

Fields:
- selectedDay: number
- monthName: string
- currentYear: number
- selectedTrades: Trade[]
- allTrades: Trade[]
- reportingCurrency: string


DailyReviewHeaderProps

Fields:
- selectedDay: number
- currentMonth: number
- monthName: string
- currentYear: number
- selectedTrades: Trade[]
- onClose: () => void


DailyReviewKpisProps

Fields:
- selectedTrades: Trade[]
- reportingCurrency: string


DailyReviewPerformanceProps

Fields:
- selectedTrades: Trade[]
- reportingCurrency: string


DailyReviewTradeActivityProps

Fields:
- selectedTrades: Trade[]
- reportingCurrency: string


DailyReviewInsightsProps

Fields:
- selectedTrades: Trade[]
- reportingCurrency: string


DailyReviewSecondaryMetricsProps

Fields:
- selectedTrades: Trade[]
- reportingCurrency: string


DailyReviewBreakdownsProps

Fields:
- selectedTrades: Trade[]
- reportingCurrency: string


DailyReviewTradeTableProps

CURRENT DEFINITION:
- selectedTrades: Trade[]
- allTrades: Trade[]
- reportingCurrency: string
- onSelectTrade: (trade: Trade) => void


TradeReviewDrawerProps

Fields:
- trade: Trade | null
- allTrades: Trade[]
- reportingCurrency: string
- onClose: () => void
- onPrevious: () => void
- onNext: () => void

IMPORTANT TYPE NOTE
-------------------
The currently supplied DailyReviewTradeTable implementation uses:

onEditTrade: (trade: Trade) => void

while the currently supplied dailyReviewTypes definition declares:

onSelectTrade: (trade: Trade) => void

This is an existing interface/implementation naming mismatch in the
supplied baseline.

Do NOT silently change one side in a future task.

Verify the actual parent/component integration before modifying it.

============================================================
4. DailyReviewInsights
============================================================

RESPONSIBILITY
--------------
Displays derived textual insights for the selected trading day.

CURRENT ANALYTICS
-----------------

1. Total P&L
2. Total Fees
3. Wins
4. Losses
5. Win Rate
6. Symbol Performance
7. Losing Trade Analysis
8. Most Active Period
9. Trading Cost Impact

TOTAL P&L
---------
sum of trade.pnl

TOTAL FEES
----------
sum of trade.fees

WIN RATE
--------
Unlike DailyReviewKpis, the Insights component currently calculates
win rate using CLOSED trades:

closedTrades.length

where:

trade.status !== "OPEN"

Then:

wins / closedTrades * 100

This means the current KPI and Insights win-rate definitions are not
identical when OPEN trades exist.

SYMBOL PERFORMANCE
------------------
Trades are grouped by:

trade.ticker

For each symbol:
- trade count
- cumulative P&L

Symbols are sorted by descending P&L.

TOP SYMBOL
----------
First symbol after descending P&L sorting.

BIGGEST DRAG
------------
Symbol with the lowest P&L.

LOSING TRADE ANALYSIS
---------------------
All negative trade.pnl values are collected.

Average loss is:

sum(abs(losses)) / number of losses

Then the component counts losses whose absolute value is greater
than the calculated average loss.

MOST ACTIVE PERIOD
------------------
Trade activity is grouped into one-hour buckets.

Timestamp priority:
1. trade.openedAt
2. trade.closedAt

The hour is derived from the local Date object.

The bucket with the greatest trade count becomes the
"Most active period."

TRADING COST IMPACT
-------------------
Current fee ratio:

totalFees / abs(totalPnL) * 100

High trading costs are flagged when:

feeRatio >= 20

EMPTY DAY
---------
If selectedTrades.length === 0, the component displays:

"No trading activity is available for this day."

============================================================
5. DailyReviewSecondaryMetrics
============================================================

RESPONSIBILITY
--------------
Displays a second row of seven secondary performance metrics.

CURRENT CARDS
-------------

1. Best Trade
2. Worst Trade
3. Avg. Winner
4. Avg. Loser
5. Total Volume
6. Fee / Gross P&L
7. Expectancy

BEST TRADE
----------
Trade with the highest trade.pnl.

Display:
- ticker
- P&L

WORST TRADE
-----------
Trade with the lowest trade.pnl.

Display:
- ticker
- P&L

AVERAGE WINNER
--------------
Uses trades where:

trade.pnl > 0

Average of positive P&L values.

AVERAGE LOSER
-------------
Uses trades where:

trade.pnl < 0

Average remains negative.

TOTAL VOLUME
------------
Calculated from:

sum(abs(trade.quantity))

Displayed using en-US number formatting with zero decimal
places.

Subtitle:
"shares/contracts"

FEE / GROSS P&L
--------------
Gross P&L is:

netPnL + totalFees

Fee/gross ratio:

abs(totalFees) / abs(grossPnL) * 100

A value >= 20% receives red styling.

EXPECTANCY
----------
Current Daily Review definition:

netPnL / totalTrades

Displayed as currency per trade.

============================================================
6. DailyReviewBreakdown
============================================================

RESPONSIBILITY
--------------
Provides grouped daily performance breakdowns.

CURRENT BREAKDOWN CARDS
-----------------------

1. By Symbol
2. By Account
3. By Direction
4. By Asset Type

GROUPING
--------
Generic grouping supports:

- ticker
- account
- side
- assetType

Each row contains:
- label
- trade count
- grouped P&L
- positive/negative state

Rows are sorted by absolute P&L descending.

DIRECTION SPECIAL CASE
-----------------------
For Options:

side is represented using contractKey suffix:

_CONTRACT KEY ending "_C"
    → CALL

_CONTRACT KEY ending "_P"
    → PUT

otherwise:
    → OPTION

For non-options:

trade.side is used.

EXPANSION
---------
Cards with more than three rows support:

- View All
- Show Less

Expanded rows are vertically scrollable.

============================================================
7. DailyReviewTradeTable
============================================================

RESPONSIBILITY
--------------
Displays the detailed daily trade activity table.

CURRENT PROPS IMPLEMENTATION
----------------------------
The component currently receives:

- selectedTrades
- allTrades
- reportingCurrency
- onEditTrade

NOTE:
This differs from the current type definition, which declares
onSelectTrade.

CURRENT TABLE COLUMNS
---------------------

1. #
2. Time In
3. Time Out
4. Symbol
5. Type
6. Side
7. Qty
8. Entry
9. Exit
10. P&L
11. Commission
12. R-Multiple
13. Duration
14. Status
15. Reviewed

TABLE BEHAVIOR
--------------
Table is vertically scrollable.

Height:
- max-h-[360px]
- max-h-[244px] when viewport height is <= 1079px

Header is sticky.

Rows support hover styling.

MANUAL TRADE EDITING
--------------------
A trade can be edited only when:

trade.contractKey starts with:

MANUAL-

Additionally, an OPEN manual trade cannot be edited when another
trade exists with:

- different trade.id
- same contractKey
- status !== OPEN

This protects lifecycle situations where a manual position has
already progressed beyond the editable state.

DOUBLE CLICK
------------
Double-clicking a row calls onEditTrade(trade) only when canEdit is true.

TIME FORMATTING
---------------
Times use local browser formatting:

hour
minute
second

DURATION
--------
Uses openedAt and closedAt.

Displays:
- hours + minutes if >= 1 hour
- minutes + seconds otherwise

QUANTITY
--------
Absolute quantity is displayed.

PRICE
-----
Prices currently use:

$

with two decimal places.

NOTE:
This is independent of reportingCurrency.

EXIT SPECIAL CASE
------------------
If:

trade.exitPrice === 0
AND
trade.status === "LOSS"

the table displays:

Expired

otherwise exitPrice is formatted normally.

P&L
---
Uses reportingCurrency symbol.

Positive:
+symbol amount

Negative:
-symbol amount

COMMISSION
----------
Uses reportingCurrency symbol and trade.fees.

R-MULTIPLE
----------
Currently placeholder:

—

REVIEWED
--------
Currently placeholder unchecked visual state.

No persisted review-state behavior is present in this supplied
implementation.

============================================================
8. DailyReviewPerformance
============================================================

RESPONSIBILITY
--------------
Displays the cumulative realized P&L curve for the selected day.

CURRENT DATA MODEL
------------------
Only CLOSED trades are plotted.

The plotting timestamp is:

trade.closedAt

OPEN trades are excluded from the realized curve.

TRADES ARE SORTED
-----------------
Chronologically by closedAt.

When timestamps are identical, original selectedTrades array order
is preserved.

CUMULATIVE P&L
--------------
Each closed trade contributes:

Number(trade.pnl || 0)

to cumulative P&L.

A zero starting point is inserted before the first realized trade.

CHART
-----
SVG-based custom chart.

Current dimensions:

chartWidth = 620
chartHeight = 200

Chart is rendered visually at:

h-[128px]
w-full

CURRENT PADDING
---------------

leftPadding = 46
rightPadding = 8
topPadding = 6
bottomPadding = 24

Y-axis includes dynamically generated "nice" steps.

Current step logic:

range <= 25
    → 5

range <= 50
    → 10

range <= 100
    → 20

range <= 250
    → 50

range <= 500
    → 100

range <= 1000
    → 200

otherwise
    → 500

VISUALIZATION
-------------
The chart currently includes:

- horizontal grid lines
- zero line
- cumulative P&L area
- line segments
- trade points
- X-axis time labels
- final cumulative P&L value in header

Line segments are colored based on cumulative movement:

positive/up movement
    → emerald

negative/down movement
    → red

TRADE POINTS
------------
Each realized trade receives a point.

Point color is based on individual trade P&L:

trade.pnl >= 0
    → emerald

trade.pnl < 0
    → red

X-AXIS
------
Maximum seven time labels are displayed.

============================================================
UI / DESIGN STANDARD
============================================================

The supplied components follow the Elite X premium dark visual
language.

PRIMARY SURFACE
---------------
bg-[#0b1220]

BORDER
------
border-white/[0.06]

HOVER BORDER
------------
border-white/[0.12]

STANDARD RADIUS
---------------
rounded-[8px]

Typography is compact and analytics-oriented.

Common sizes:
- 10px labels
- 11px body text
- 12px section/card titles
- 13px section headers
- 18px secondary metric values
- 20–21px primary KPI values

Semantic colors currently include:

Positive:
- emerald

Negative:
- red

Warning:
- amber/yellow

Informational:
- blue

Active:
- violet

============================================================
IMPORTANT CURRENT IMPLEMENTATION OBSERVATIONS
============================================================

These are NOT automatically changes to make.

They are documented observations that must be considered before
future modifications.

1. WIN RATE DEFINITIONS DIFFER
------------------------------
DailyReviewKpis uses:

wins / totalTrades

DailyReviewInsights uses:

wins / closedTrades

If OPEN trades are possible in Daily Review, these can produce
different percentages.

Future work should establish the intended canonical definition
before changing either implementation.

2. CURRENCY HANDLING
--------------------
Most P&L displays use reportingCurrency.

DailyReviewTradeTable's price formatter currently hardcodes "$".

Do not assume entry/exit prices should use reportingCurrency without
first verifying the intended price-currency model.

3. GROSS P&L ASSUMPTION
-----------------------
Several components assume:

trade.pnl = canonical NET result

and therefore:

grossPnL = netPnL + totalFees

This assumption must remain consistent with the canonical Trade
model and existing analytics architecture.

4. FEE SIGN CONVENTION
----------------------
Fee calculations use trade.fees directly in some places and
Math.abs() in others.

Future fee-related changes must verify the canonical fee sign
convention rather than introducing another interpretation.

5. DAILY REVIEW IS AN ANALYTICS LAYER
-------------------------------------
Do not move calculations into Daily Review that belong to:

- execution reconstruction
- FIFO
- pairTrades
- reconciliation
- canonical P&L
- FX conversion architecture

Daily Review should consume canonical trade data.

6. REVIEW STATE IS NOT IMPLEMENTED
----------------------------------
The trade table currently displays a visual "Not reviewed" state.

There is no supplied persistence mechanism for review status.

Any future Reviewed functionality must define:
- persistence
- ownership
- RLS
- lifecycle
- optimistic update behavior
- synchronization
- failure recovery

before implementation.

7. R-MULTIPLE IS PLACEHOLDER
----------------------------
R-Multiple currently displays:

—

The supplied implementation does not calculate R-Multiple.

Any future R-Multiple implementation must first establish the source
of the initial stop/risk value and its persistence model.

8. TRADE TABLE PROP NAMING MISMATCH
-----------------------------------
Current component:
    onEditTrade

Current type:
    onSelectTrade

This must be reconciled deliberately after inspecting the actual
parent component.

9. UNUSED / POTENTIAL PROP DEFINITIONS
--------------------------------------
dailyReviewTypes contains:

DailyReviewTradeActivityProps
DailyReviewBreakdownsProps

These are currently type definitions and should not be assumed to
correspond to the exact current component implementations without
checking their parent/import usage.

============================================================
ARCHITECTURAL PROTECTION RULES
============================================================

Future Daily Review work must preserve:

- canonical Trade data
- deterministic trade reconstruction
- execution-first architecture
- reporting currency architecture
- broker/manual source isolation
- existing P&L semantics
- existing Supabase/RLS boundaries
- existing manual-trade protections

Do not introduce duplicated trade-calculation engines inside UI
components.

If a calculation becomes shared across:
- Dashboard
- Daily Review
- analytics
- reports

it should be evaluated for extraction into the appropriate analytics
layer rather than duplicated in multiple components.

============================================================
NEXT DEVELOPMENT PHASE
============================================================

The current source baseline is ready for continued Daily Review V2
development.

Potential future areas already represented by the architecture include:

- Trade Review Drawer
- structured trade review
- Reviewed persistence
- Notes integration
- R-Multiple
- Trade Activity
- replay functionality
- calendar navigation
- account filtering
- review analytics
- AI / Auto Trade Summary

Any such feature should be implemented against the current source and
canonical data model rather than inferred from previous versions.

============================================================
CHECKPOINT RULE
============================================================

Before changing any Daily Review file:

1. Request the CURRENT file if it is not present in the active
   conversation.
2. Inspect the parent integration when props/types are involved.
3. Preserve canonical trading-data behavior.
4. Make the smallest architectural change necessary.
5. Prefer deterministic calculations.
6. Avoid duplicated business logic.
7. Preserve the established UI positioning unless the task explicitly
   requests visual changes.
8. Validate TypeScript and component integration after changes.
9. Test empty-day, OPEN-trade, LOSS/WIN, zero-fee, zero-P&L,
   multi-currency, and multiple-trade scenarios where relevant.

============================================================
END OF CHECKPOINT
============================================================