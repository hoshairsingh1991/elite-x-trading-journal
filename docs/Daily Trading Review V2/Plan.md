============================================================
ELITE X — DAILY TRADING REVIEW V2
MASTER PROJECT / HANDOVER NOTES
============================================================

PROJECT STATUS
============================================================

Project:
Elite X Trading Journal / Elite X Trading OS

Feature:
Calendar → Daily Trading Review V2

Current Status:
DESIGN PHASE FINALIZED.
UI IMPLEMENTATION STARTS NEXT.
BACKEND / DATA IMPLEMENTATION COMES AFTER UI IS COMPLETE.

Primary Objective:
Turn the current basic calendar day popup into a premium,
institutional-grade Daily Trading Review experience that
can compete with the best trading journal platforms.

The new experience must allow a trader to:

1. Click a calendar date.
2. See the complete story of that trading day.
3. Understand performance, activity, costs, and breakdowns.
4. Inspect any individual trade.
5. Review the trade using structured journal questions.
6. Optionally add Stop Loss information and calculate R-Multiple.
7. Add notes / ratings / review information.
8. Move through trades quickly.
9. Eventually generate meaningful daily and behavioral insights.

IMPORTANT:
This is a major product feature.
Do not treat it as a simple modal redesign.
It is a complete Daily Review workflow.

============================================================
PRODUCT PHILOSOPHY
============================================================

The current calendar popup answers:

"Here are the trades from this day."

Daily Review V2 should answer:

"Here is what happened in your trading today."

The system should help the trader understand:

- How did I perform?
- How much did I actually make after fees?
- When was I most active?
- Where did I make money?
- Where did I lose money?
- Which trades mattered?
- Which behaviors should I review?
- What did I do well?
- What mistakes did I make?
- What can I learn from the day?

The Daily Review is the DAY-level story.

The Trade Drawer is the TRADE-level story.

Core workflow:

Calendar
    ↓
Select Date
    ↓
Daily Trading Review
    ↓
Select Trade
    ↓
Trade Review Drawer
    ↓
Overview / Review / Notes / Executions

============================================================
IMPORTANT ARCHITECTURAL PRINCIPLE
============================================================

Elite X is designed as a multi-user SaaS product.

Everything in this feature must remain compatible with:

- multiple users
- multiple IBKR accounts
- multiple accounts per user
- multiple asset types
- broker-synced trades
- manual trades
- future brokers
- large trade volumes
- user-specific review data

Tenant isolation is mandatory.

All review/journal data must ultimately belong to the
authenticated user and the appropriate trade.

Conceptually:

Authenticated User
    ↓
User Scope
    ↓
User Accounts
    ↓
Canonical Executions
    ↓
Canonical Trades
    ↓
Daily Review
    ↓
Trade Review Metadata

Never introduce global/shared review records.

============================================================
CANONICAL DATA PRINCIPLE
============================================================

Do NOT modify or replace the existing execution/FIFO/trade
reconstruction architecture just to support this feature.

Existing philosophy remains protected:

Broker / Manual Entry
    ↓
Normalized Executions
    ↓
Execution Ledger
    ↓
FIFO Reconstruction
    ↓
Canonical Trades
    ↓
Analytics
    ↓
Daily Review
    ↓
Trade Review Metadata

The Daily Review is a consumer of canonical trade data.

It must NOT independently reconstruct financial truth.

Do not create a second P&L engine inside the Daily Review.

Do not independently calculate trade lifecycle logic if
canonical trade data already provides the result.

============================================================
CURRENT FILE / IMPLEMENTATION CONTEXT
============================================================

Current calendar file supplied for this project:

components/dashboard/TradingCalendar.tsx

Current implementation already contains:

- calendar rendering
- month navigation
- local date parsing
- monthly trade aggregation
- trades-by-day aggregation
- selected-day trade filtering
- selected-day P&L
- selected-day commission
- win count
- loss count
- win rate
- calendar heatmap
- daily notes
- daily notes modal
- selected-day trade review modal
- trade table
- manual trade deletion
- EditTradeModal integration

IMPORTANT:
The existing TradingCalendar.tsx is already large and contains
too many responsibilities.

DO NOT continue turning TradingCalendar.tsx into a larger
"god component."

The calendar itself should remain stable.

The existing calendar click behavior should remain:

User clicks date
    ↓
setSelectedDay(day)
    ↓
Daily Review V2 opens

The calendar remains the entry point.

The current day popup is what gets replaced.

============================================================
UI IMPLEMENTATION PRINCIPLE
============================================================

PHASE 1:
UI / UX FIRST.

PHASE 2:
BACKEND / DATA SECOND.

Do NOT mix backend architecture into the design phase.

During UI phase:

- use existing Trade[] data
- use temporary/local state for new review fields
- create the final visual hierarchy
- finalize interactions
- finalize drawer behavior
- finalize responsive behavior
- finalize stock/options display
- finalize tabs
- finalize hover states
- finalize selected states
- finalize navigation

After UI is visually locked:

Implement real backend/data behavior.

============================================================
FINAL UI DESIGN
============================================================

The approved UI design is the current high-end mockup.

TARGET:
1:1 implementation of the approved visual design.

Do NOT redesign the design while implementing unless
a genuine usability/technical issue is discovered.

The UI is considered visually finalized.

The goal now is to reproduce it accurately.

============================================================
DAILY REVIEW MODAL
============================================================

User action:

Dashboard
    ↓
Calendar
    ↓
User clicks September 12
    ↓
Daily Trading Review popup/workspace opens

The calendar itself should NOT be replaced.

The selected-day popup should become the new
DailyReviewModal.

Recommended structure:

components/dashboard/

    TradingCalendar.tsx

    daily-review/
        DailyReviewModal.tsx
        DailyReviewHeader.tsx
        DailyReviewKpis.tsx
        DailyReviewPerformance.tsx
        DailyReviewTradeActivity.tsx
        DailyReviewInsights.tsx
        DailyReviewBreakdowns.tsx
        DailyReviewTradeTable.tsx

        TradeReviewDrawer.tsx
        TradeOverviewTab.tsx
        TradeReviewTab.tsx
        TradeNotesTab.tsx
        TradeExecutionsTab.tsx

NOTE:
Do not create all files blindly at once.
Create them as implementation progresses.

============================================================
DAILY REVIEW HEADER
============================================================

Header should communicate:

- trading date
- weekday
- trading-day state
- market context
- number of trades
- trading session time range
- account scope
- close control

Example:

September 11, 2026
Friday

[ Trading Day ]
[ US Markets ]
[ 11 Trades ]
[ 9:31 AM – 3:47 PM ]

[ All Accounts ▼ ]
[ Close X ]

Multi-account support:
All Accounts should be a first-class scope.

The same Daily Review must work for:

- one account
- multiple accounts
- many accounts

============================================================
KPI ROW
============================================================

Approved primary metrics:

1. Net P&L
2. Gross P&L
3. Total Trades
4. Win Rate
5. Profit Factor
6. Total Fees / Commission
7. Average Hold Time

R-Multiple is NOT a mandatory daily KPI because many
broker-synced trades will not have an initial stop-loss.

Do NOT invent R-Multiple.

If no risk data exists:
R-Multiple = —

============================================================
DAILY PERFORMANCE AREA
============================================================

Main visual sections:

1. P&L Over Time
2. Trade Activity
3. Day Insights

These are the major analytical cards.

============================================================
P&L OVER TIME
============================================================

Purpose:

Show how cumulative P&L developed throughout the day.

Should communicate:

- when the trader made money
- when the trader gave money back
- when the day peaked
- when drawdown occurred
- final net outcome

The visual should stay premium and clean.

Do not overcomplicate it.

============================================================
TRADE ACTIVITY CARD
============================================================

IMPORTANT:
This is one of the strongest visual elements in the approved
design.

The current high-end appearance should remain.

Do NOT overload the card with excessive visual information.

Purpose:

Show the rhythm of the trading day.

Primary information:

- trading timeline
- trade markers
- green = winning trade
- red = losing trade
- number of trades
- trading activity throughout the session

The card should feel advanced through precision,
interaction, and information hierarchy.

Do not turn it into a Bloomberg-style overloaded chart.

Potential interaction:

Hover marker
    ↓
Trade tooltip

Click marker
    ↓
Select Trade
    ↓
Highlight corresponding table row
    ↓
Open Trade Review Drawer

Table row selection and chart marker selection should
eventually remain synchronized.

The card should remain visually clean.

============================================================
DAY INSIGHTS
============================================================

Purpose:

Provide deterministic data-driven observations about
the trading day.

Examples:

- Positive trading day
- 64% win rate
- High trading costs
- AAPL was top performer
- QQQ was biggest drag
- Two losses exceeded average loss
- Most active period was 10:00–11:00

IMPORTANT:
These are data-driven observations.

Do not initially make them free-form AI opinions.

AI can be layered on later.

============================================================
SECONDARY PERFORMANCE CARDS
============================================================

Include:

- Best Trade
- Worst Trade
- Average Winner
- Average Loser
- Total Volume
- Fee / Gross P&L
- Expectancy

Additional metrics may be introduced later if justified.

Do not clutter the main screen.

============================================================
BREAKDOWN SECTION
============================================================

Approved breakdown cards:

1. By Symbol
2. By Account
3. By Direction
4. By Asset Type

Examples:

By Symbol:
AAPL
5 trades
+$62.44

QQQ
6 trades
-$59.92

By Account:
Margin Account
8 trades
+$...

TFSA
3 trades
-$...

By Direction:
LONG
8 trades
+$...

SHORT
3 trades
-$...

By Asset Type:
Stocks
8 trades
+$...

Options
3 trades
-$...

This section must work naturally for multi-account users.

============================================================
TRADE TABLE
============================================================

Purpose:

Provide the detailed day-level trade list.

Approved filters:

[ All Trades ]
[ Winners ]
[ Losers ]
[ Stocks ]
[ Options ]
[ Long ]
[ Short ]

Also:

- Search
- Sort
- selected row state

The table should expose important trade data without
trying to expose every database field.

The table is an investigation surface.

It is NOT the canonical data model.

============================================================
TRADE TABLE COLUMNS
============================================================

Current visual direction includes:

- Time In
- Time Out
- Symbol
- Type
- Side
- Qty
- Entry
- Exit
- P&L
- Duration
- Status
- Reviewed

R-Multiple may appear as an optional column if appropriate
to the finalized UI.

DO NOT invent R-Multiple when no stop-loss data exists.

If unavailable:
—

============================================================
TRADE CLICK BEHAVIOR
============================================================

Clicking any trade must NOT close the Daily Review.

Instead:

Daily Review remains open
    ↓
Right-side Trade Review Drawer opens

The selected trade remains visible in context.

User can close drawer and return to the same place
in the Daily Review.

============================================================
RIGHT-SIDE TRADE DRAWER
============================================================

Approved tabs:

1. Overview
2. Review
3. Notes
4. Executions

Top area should show:

- ticker
- stock/options/futures/etc.
- side
- quantity/contracts
- WIN / LOSS / OPEN
- Net P&L
- trade number
- Previous / Next navigation

Example:

AAPL
Stock
LONG
1,000 shares

WIN
+$45.91

Trade 1 of 11

============================================================
TAB 1 — OVERVIEW
============================================================

Overview is objective trade information.

Performance:

- Gross P&L
- Commission
- Net P&L

Execution:

- Entry Price
- Exit Price
- Quantity
- Entry Time
- Exit Time
- Duration
- Exchange
- Currency

Account:

- Account
- Account Type
- Broker

For options, include relevant contract information:

- Call / Put
- Strike
- Expiration
- Contracts
- Multiplier
- Underlying

Only show asset-specific fields when relevant.

Do not show:

Call: N/A
Strike: N/A

for stocks.

============================================================
R-MULTIPLE / STOP LOSS DESIGN
============================================================

R-Multiple STAYS in Elite X.

However:

Broker sync generally cannot know the trader's intended
initial stop-loss point.

Therefore Elite X must allow the user to add it manually
inside Trade Review.

User flow:

Trade
    ↓
Review
    ↓
Risk / Stop Loss
    ↓
User enters Initial Stop Price
    ↓
Elite X calculates Initial Risk
    ↓
Elite X calculates R-Multiple

Do NOT infer or fabricate a stop.

If no stop is entered:

R-Multiple = —

============================================================
STOP LOSS DATA
============================================================

Store user-supplied initial risk information separately
from broker execution truth.

Relevant concepts:

- Entry Price
- Initial Stop Price
- Quantity
- Multiplier
- Initial Risk
- Exit Price
- Net P&L
- R-Multiple

For LONG:

Initial Risk =
(Entry Price - Initial Stop Price) × Quantity × Multiplier

For SHORT:

Initial Risk =
(Initial Stop Price - Entry Price) × Quantity × Multiplier

R-Multiple:

R-Multiple =
Net P&L / Initial Risk

For options, the contract multiplier must be respected.

The user should NOT have to manually calculate this.

============================================================
IMPORTANT STOP-LOSS PRINCIPLE
============================================================

The "initial stop" should represent the trader's intended
initial risk.

Do not overwrite it with later stop movement.

That allows Elite X to eventually distinguish:

- Initial Stop
- Stop Was Moved
- Stop Was Respected
- Actual Outcome

This becomes valuable behavioral data.

============================================================
R-MULTIPLE UX
============================================================

Potential Risk & Reward section:

RISK & REWARD

Initial Stop
[ $1.42 ]

Risk / Share
$0.12

Initial Risk
$120.00

Net P&L
+$45.91

R-Multiple
+0.38R

Optional future fields:

Target Price
Planned Reward
Planned R:R

Do NOT require these fields to complete a review.

R-Multiple is optional.

============================================================
TAB 2 — REVIEW
============================================================

This is the core journaling experience.

The trader should be able to review the entire trade
with structured answers.

Top:

TRADE QUALITY SCORE

A
91 / 100

Breakdown:

- Plan Adherence
- Setup Quality
- Risk Discipline
- Execution
- Psychology

IMPORTANT:
Do NOT use R-Multiple to automatically determine whether
a trade was "good" or "bad."

A losing trade can be an excellent trade.

A winning trade can be a poor trade.

Trade Quality is behavioral / process oriented.

P&L is outcome.

Keep those concepts separate.

============================================================
TRADE REVIEW QUESTIONS
============================================================

1. TRADE CONTEXT

What was the overall market environment?

Options:

- Trend Day
- Range Day
- News / Catalyst
- High Volatility
- Low Volatility
- Choppy

Potentially future asset-specific context options.

============================================================

2. SETUP

Options:

- Breakout
- Break & Retest
- Support / Resistance
- EMA Pullback
- VWAP Reclaim
- Opening Range
- Liquidity Sweep
- Other

============================================================
3. ENTRY REASON
============================================================

Options:

- Break of Structure
- Volume Confirmation
- Momentum
- Support / Resistance
- Other

============================================================
4. EXIT REASON
============================================================

Options:

- Target Hit
- Stop Loss
- Structure Break
- Trailing Stop
- Manual Exit
- End of Day
- Other

============================================================
5. PSYCHOLOGY
============================================================

Options:

- Calm
- Confident
- Hesitant
- FOMO
- Revenge

Keep the visual interaction compact and premium.

============================================================
6. MISTAKES
============================================================

Multi-select.

Potential options:

- None
- Entered Early
- Chased Price
- Moved Stop
- Oversized
- Overtraded
- Ignored Setup
- Other

Prefer collapsible presentation to avoid cognitive overload.

============================================================
7. STRENGTHS
============================================================

Multi-select.

Potential options:

- Followed Plan
- Waited for Setup
- Good Risk Control
- Good Entry
- Good Exit
- Stayed Disciplined
- Other

Prefer collapsible presentation.

============================================================
8. CONFIDENCE
============================================================

Optional confidence rating.

Can use:

- star rating
- numerical rating
- confidence selection

Do not overcomplicate.

============================================================
9. TRADER RATING
============================================================

Keep subjective trader rating separate from
Elite X Trade Quality Score.

Example:

Trade Quality Score:
91 / 100
A

Trader Rating:
★★★★☆
4 / 5

Definitions:

Trade Quality Score:
Elite X process evaluation based on structured review.

Trader Rating:
The trader's own subjective assessment.

============================================================
TAB 3 — NOTES
============================================================

Free-form journal area.

Purpose:
Anything the structured review does not capture.

Example:

TRADE NOTES

[ free-form text area ]

Suggested max length:
1000 characters initially.

Structured review data should NOT be forced into Notes.

Notes are for unstructured thoughts.

============================================================
TAB 4 — EXECUTIONS
============================================================

Execution tab is an audit / source view.

Show the underlying normalized executions.

Example:

ENTRY
09:42:18
BUY
1,000
$1.54
NASDAQ
USD

EXIT
10:18:43
SELL
1,000
$2.02
NASDAQ
USD

For options include:

- contract
- expiration
- strike
- multiplier
- side/action
- quantity
- price
- execution timestamp

This gives users confidence that the trade detail
is backed by the actual execution history.

============================================================
AUTO TRADE SUMMARY
============================================================

At the bottom of Trade Review:

AI / Auto Trade Summary

Summary should be generated from:

- canonical trade data
- structured review answers
- user-entered risk data
- notes where appropriate

Example:

"Entered AAPL long after a confirmed breakout with
volume confirmation. Position was held for 36 minutes
and exited at the target. Trade followed the selected
setup and showed strong plan adherence with no major
execution mistakes."

IMPORTANT:
The summary must not invent facts.

It must use structured data actually available.

Potential controls:

[ Generate ]
[ Regenerate ]
[ Edit ]

AI generation can be implemented after the base UI/data
architecture is complete.

============================================================
TRADE NAVIGATION
============================================================

Inside the right drawer:

← Previous Trade
Next Trade →

Example:

Trade 1 of 11

The user must be able to review the entire day without
closing the drawer.

Expected workflow:

Trade 1
    ↓
Review
    ↓
Next
    ↓
Trade 2
    ↓
Review
    ↓
Next
    ↓
...

============================================================
REVIEW COMPLETION
============================================================

Each trade can have:

Reviewed / Not Reviewed

Daily Review progress:

8 / 11 trades reviewed

Progress bar

When complete:

11 / 11 trades reviewed

REVIEW COMPLETE

The UI may eventually show:

- average Trade Quality Score
- average Trader Rating
- most common setup
- most common mistake
- strongest behavior
- weakest behavior

============================================================
DAILY REVIEW INTELLIGENCE
============================================================

Once individual trade reviews exist,
the daily review can derive:

- average Trade Quality Score
- average Trader Rating
- most common setup
- most common mistake
- most common psychological state
- strongest behavior
- weakest behavior
- best performing setup
- worst performing setup
- symbol-level patterns
- account-level patterns
- direction-level patterns

These should be derived from structured data.

============================================================
IMPORTANT PRODUCT PRINCIPLE
============================================================

Separate:

1. WHAT ACTUALLY HAPPENED
   - broker executions
   - entry
   - exit
   - quantity
   - fees
   - P&L
   - account
   - timestamps

2. WHAT THE TRADER BELIEVED
   - market context
   - setup
   - entry reason
   - exit reason
   - expected risk

3. HOW THE TRADER BEHAVED
   - psychology
   - mistakes
   - strengths
   - plan adherence
   - risk discipline

4. WHAT THE TRADER LEARNED
   - notes
   - summary
   - rating
   - daily lessons

This separation is foundational.

============================================================
STOCK VS OPTIONS PRESENTATION
============================================================

The underlying data model can remain unified.

Presentation should be asset-aware.

Stock example:

AAPL
LONG
1,000 shares
NASDAQ
USD

Options example:

AAPL 250C
LONG CALL
2 contracts
Sep 18, 2026
$250 strike
multiplier 100
NASDAQ
USD

Do not show irrelevant fields.

Future asset types may include:

- Stocks
- Options
- Futures
- Crypto
- Forex
- CFD
- other supported instruments

The UI architecture should not be hardcoded exclusively
around stocks.

============================================================
MULTI-ACCOUNT REQUIREMENTS
============================================================

Daily Review scope:

[ All Accounts ▼ ]

Must support:

- one account
- multiple accounts
- many accounts

Breakdown by account is required.

Trade drawer should show:

Account
Account Type
Broker

Account context must remain user-scoped.

============================================================
MULTI-USER / SaaS REQUIREMENTS
============================================================

Everything added by the trader must eventually be
persisted against the authenticated user.

Examples:

- trade review answers
- review completion
- notes
- trader rating
- stop loss
- risk values
- generated summary
- review timestamps

No cross-user visibility.

No global review state.

============================================================
UI VISUAL STANDARD
============================================================

Approved visual direction:

- dark premium UI
- institutional
- clean
- analytical
- calm
- precise
- dense but readable
- strong hierarchy
- restrained semantic color
- subtle borders
- subtle glow
- premium spacing
- typography-focused

Do NOT turn the interface into:

- flashy crypto dashboard
- excessive neon
- overloaded terminal
- decorative analytics wall

The current approved screenshot is the target.

Target:
1:1 visual implementation.

============================================================
CURRENT CALENDAR PROTECTION
============================================================

TradingCalendar.tsx has existing visual alignment systems.

These include:

- spacing compensation
- invisible spacer elements
- relative positioning
- translate-x / translate-y
- safe-zone spacing
- optical alignment

These should NOT be casually rewritten.

The calendar itself is not the redesign target.

The selected-day popup is the redesign target.

Goal:

Minimal change to TradingCalendar.tsx.

Prefer:

TradingCalendar
    ↓
<DailyReviewModal ... />

instead of keeping the complete V2 implementation inside
TradingCalendar.tsx.

============================================================
COMPONENTIZATION
============================================================

Preferred architecture:

components/dashboard/

    TradingCalendar.tsx

    daily-review/
        DailyReviewModal.tsx
        DailyReviewHeader.tsx
        DailyReviewKpis.tsx
        DailyReviewPerformance.tsx
        DailyReviewTradeActivity.tsx
        DailyReviewInsights.tsx
        DailyReviewBreakdowns.tsx
        DailyReviewTradeTable.tsx

        TradeReviewDrawer.tsx
        TradeOverviewTab.tsx
        TradeReviewTab.tsx
        TradeNotesTab.tsx
        TradeExecutionsTab.tsx

Do not create unnecessary abstractions.

Components should have clear responsibilities.

============================================================
IMPLEMENTATION PHASE 1 — UI ONLY
============================================================

Objective:

Make the approved Daily Review UI work visually and
interactively using existing trade data.

Implement:

- modal
- header
- KPI cards
- P&L visualization
- Trade Activity visualization
- Day Insights
- breakdown cards
- trade table
- filters
- search
- sorting
- trade selection
- right-side drawer
- four tabs
- previous/next trade
- reviewed state UI
- stop-loss input UI
- R-Multiple display UI
- rating UI
- structured review inputs
- notes UI
- execution UI
- responsive behavior
- loading/empty states where appropriate

Temporary/local state is acceptable during this phase.

Do NOT implement full persistence yet.

============================================================
IMPLEMENTATION PHASE 2 — BACKEND / DATA
============================================================

After UI is locked:

Implement real data behavior.

Daily Review backend/data:

- daily aggregation
- P&L calculations
- fees
- win rate
- profit factor
- average hold
- best/worst
- symbol breakdown
- account breakdown
- direction breakdown
- asset-type breakdown
- P&L timeline
- Trade Activity data

Trade Review backend/data:

- review persistence
- market context
- setup
- entry reason
- exit reason
- psychology
- mistakes
- strengths
- confidence
- trader rating
- review completion
- review timestamp
- notes
- initial stop loss
- risk calculation
- R-Multiple
- generated summary

============================================================
BACKEND RISK / R-MULTIPLE REQUIREMENTS
============================================================

Broker sync does NOT provide trader's intended stop-loss
in a reliable way.

Therefore:

User manually enters Initial Stop Price.

Elite X calculates:

Initial Risk
R-Multiple

R-Multiple must never be guessed.

If Initial Stop is missing:

R-Multiple = null / unavailable

No fabricated value.

============================================================
PERFORMANCE REQUIREMENTS
============================================================

Do not build this so the browser downloads huge datasets
and performs all analytics during every render.

Prefer:

- memoized frontend transformations where appropriate
- server-side aggregation where appropriate
- indexed queries
- lazy loading of trade detail
- pagination where needed
- scalable filtering
- minimal rerenders

The feature must remain usable when users have:

- dozens of trades
- hundreds of trades
- potentially thousands of executions

============================================================
DATA INTEGRITY
============================================================

Do not change canonical trade values because of journal
review data.

Review metadata must be additive.

Example:

Canonical Trade:
P&L = +$45.91

Review metadata:
Initial Stop = $1.42
R-Multiple = +0.38R

Review does NOT rewrite:
- execution
- entry
- exit
- fees
- canonical P&L
- FIFO result

============================================================
REVIEW SCORING PRINCIPLE
============================================================

Trade Quality Score should represent process quality.

It should NOT simply reward positive P&L.

Examples:

Winning trade with poor discipline:
Could receive low score.

Losing trade with excellent process:
Could receive high score.

Potential scoring dimensions:

- Plan Adherence
- Setup Quality
- Risk Discipline
- Execution
- Psychology

Scoring implementation should be designed carefully
before backend finalization.

Do not create arbitrary scoring math without defining
the product logic.

============================================================
FUTURE ANALYTICS OPPORTUNITY
============================================================

Structured review data should eventually allow Elite X
to answer questions such as:

- Which setups are most profitable?
- Which setups have the highest Trade Quality?
- How expensive are FOMO trades?
- How much money was lost from chasing?
- Is the trader better at LONG or SHORT?
- Which account performs best?
- Which asset type performs best?
- What happens after a loss?
- Which psychological states correlate with bad outcomes?
- How often are stops moved?
- Which mistakes are repeated?
- Which setups have the best expectancy?
- How does execution quality correlate with P&L?

This is one of the long-term differentiators of Elite X.

============================================================
WHAT NOT TO DO
============================================================

Do NOT:

- redesign the calendar again
- modify Dashboard V2 unnecessarily
- alter canonical execution architecture
- create a separate P&L engine
- invent broker data
- infer stop-loss values
- force R-Multiple onto every trade
- require review completion to enter stop data
- force structured data into free-form notes
- make AI responsible for factual financial calculations
- overload Trade Activity with too many visual dimensions
- turn the popup into a spreadsheet
- put every possible database field into the main table
- expand TradingCalendar.tsx into another monolithic file
- change established calendar spacing casually

============================================================
CURRENT DECISION SUMMARY
============================================================

FINAL:

Calendar remains the entry point.

Click date
    ↓
Daily Review V2 popup/workspace

Daily Review contains:

- header
- KPI row
- P&L Over Time
- Trade Activity
- Day Insights
- secondary metrics
- breakdowns
- filters
- trade table

Click trade
    ↓
Right-side Trade Review Drawer

Drawer tabs:

- Overview
- Review
- Notes
- Executions

Review contains:

- Trade Quality Score
- Trade Context
- Setup
- Entry Reason
- Exit Reason
- Psychology
- Stop Loss / Risk
- R-Multiple
- Mistakes
- Strengths
- Confidence
- Trader Rating
- Auto / AI Summary

R-Multiple:

- KEEP
- OPTIONAL
- USER ENTERS INITIAL STOP LOSS
- ELITE X CALCULATES RISK + R-MULTIPLE
- NEVER INFER FROM BROKER DATA
- NEVER REQUIRED TO COMPLETE REVIEW

Backend comes AFTER UI.

============================================================
PROJECT WORKFLOW
============================================================

STEP 1
Inspect current files.

STEP 2
Create V2 component structure.

STEP 3
Replace current day popup with DailyReviewModal.

STEP 4
Implement UI using existing Trade data.

STEP 5
Match approved design 1:1.

STEP 6
Test interactions:
- calendar date click
- modal open/close
- table scrolling
- filters
- search
- trade selection
- drawer open/close
- tabs
- previous/next trade
- review selections
- stop-loss entry
- R-Multiple display
- notes UI
- responsive behavior

STEP 7
UI checkpoint / Git checkpoint.

STEP 8
Backend architecture planning.

STEP 9
Implement persistent review data.

STEP 10
Implement server-side / canonical analytics.

STEP 11
Implement multi-user isolation.

STEP 12
Implement review scoring.

STEP 13
Implement R-Multiple persistence/calculation.

STEP 14
Implement daily insights.

STEP 15
Implement auto/AI summary.

STEP 16
Full QA.

============================================================
FIRST TASK WHEN STARTING TOMORROW
============================================================

DO NOT immediately rewrite TradingCalendar.tsx.

First:

1. Confirm the current file.
2. Identify the exact selected-day modal boundary.
3. Extract the current day popup into a dedicated component.
4. Preserve current calendar behavior.
5. Preserve existing data flow.
6. Replace only the popup surface.
7. Begin building DailyReviewModal V2.

IMPORTANT:
The user explicitly wants UI finalized BEFORE backend work.

Therefore:

PHASE 1 = UI
PHASE 2 = BACKEND

Do not merge these phases casually.

============================================================
SUCCESS CRITERIA
============================================================

The UI phase is successful when:

- clicking a calendar date opens the new Daily Review
- the popup visually matches the approved design
- daily information is understandable at a glance
- Trade Activity feels premium and advanced
- trade table is usable
- clicking a trade opens the right drawer
- Overview / Review / Notes / Executions work visually
- trade navigation works
- stop-loss field can be entered locally
- R-Multiple displays correctly from entered stop data
- no canonical trade data is modified
- calendar behavior remains intact
- no Dashboard V2 regressions occur
- no unnecessary architecture rewrite occurs

The backend phase is successful when:

- all review data persists
- data is user-scoped
- account-scoped behavior is correct
- canonical trade data remains protected
- analytics are deterministic
- R-Multiple is correct
- review state survives refresh/login
- daily insights use real data
- AI summary uses actual structured data
- system remains performant at scale

============================================================
FINAL PRODUCT VISION
============================================================

Elite X Daily Review should become:

A professional daily trading intelligence and review
workspace.

It should not merely show:

"What trades happened?"

It should enable:

"What happened today?"
"Why did it happen?"
"How did I behave?"
"Which trades were good or bad process?"
"What should I learn?"

The long-term product progression is:

Execution Ledger
    ↓
Trades
    ↓
Daily Review
    ↓
Structured Trade Review
    ↓
Behavioral Analytics
    ↓
Trading Intelligence

The Daily Review V2 is therefore a major foundational
product surface for Elite X, not simply a calendar popup.

============================================================
END OF MASTER NOTES
============================================================