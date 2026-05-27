# Elite X Trading Journal

---

# Vision

Elite X is a professional institutional-grade trading analytics and journaling platform designed for:

* discretionary futures trading
* options trading
* execution review
* performance analytics
* behavioral journaling
* trading business management
* workflow optimization
* long-term trader development

Elite X is intended to feel:

* calm
* premium
* analytical
* fast
* focused
* institutional
* execution-driven

Elite X is NOT intended to resemble:

* retail trading software
* flashy crypto dashboards
* gambling interfaces
* crowded analytics systems
* neon-heavy UIs
* social trading platforms

The platform prioritizes:

* clarity
* structured review
* calm information density
* execution workflow speed
* analytical precision
* modular scalability

---

# Core Development Philosophy

Elite X development follows:

* stability-first architecture
* cloud-canonical development / cloud-backed deterministic architecture
* modular systems
* deterministic rebuild architecture
* execution-authentic reconciliation
* surgical edits over aggressive rewrites
* typography-first UI design
* spacing-first hierarchy
* optical alignment systems
* incremental feature stabilization
* Git-safe workflow
* regression-resistant refinement

The platform intentionally favors:

* predictable layouts
* visual rhythm
* institutional spacing
* optical balancing
* calm density
* broker-authentic accounting
* deterministic trade rebuilding

over:

* compact UI packing
* flashy effects
* mathematical-only alignment
* aggressive auto-layout systems
* synthetic trade mutation
* append-based reconciliation

---

# Current Project Status

Elite X has transitioned from:

prototype dashboard architecture

into:

modular scalable SaaS-grade reconciliation architecture.

The application now behaves as:

institutional cloud-canonical execution-ledger platform.

Current project state:

STABLE DETERMINISTIC REBUILD CHECKPOINT

Current architecture milestone:

```txt
CLOUD-CANONICAL EXECUTION LEDGER STABILIZED
```

This milestone finalized:

* deterministic cloud reconstruction
* execution identity stability
* cross-browser convergence
* cross-device accounting consistency
* duplicate upload stability
* canonical Supabase persistence
* immutable execution-ledger doctrine

---


## Dashboard Foundation

Stabilized:

* institutional dashboard shell
* safe-zone spacing architecture
* typography hierarchy
* optical alignment systems
* responsive dashboard structure
* stable spacing rhythm
* visual breathing-room architecture
* modular dashboard separation

Current dashboard spacing is considered:

PRODUCTION-CALIBRATED

Avoid unnecessary rewrites.

---

# Unified Date Architecture

Elite X now uses unified institutional-grade date handling.

Canonical storage format:

```txt
YYYY-MM-DD
```

Example:

```txt
2026-05-19
```

This architecture permanently solves:

* timezone drift
* UTC conversion bugs
* previous-day rendering bugs
* CSV/manual trade mismatch
* browser timezone inconsistencies
* analytics date instability

---

## Critical Date Rule

Elite X intentionally avoids:

```ts
new Date("YYYY-MM-DD")
```

Reason:

JavaScript interprets this as UTC.

This causes timezone rollback issues.

Correct architecture uses:

```ts
new Date(year, month - 1, day)
```

through:

```ts
parseLocalDate()
```

This rule is considered:

CRITICAL ARCHITECTURE

Never casually revert to raw UTC parsing.

---

# Reconciliation Architecture

Elite X now operates on:

```txt
Cloud-Canonical Deterministic Execution Reconstruction
```

Core flow:

```txt
IBKR CSV
↓
Normalize Executions
↓
Persist Canonical Executions
↓
FIFO Quantity-Aware Reconciliation Engine
↓
Canonical Trade Reconstruction
↓
Analytics + UI
```

This architecture replaced the old:

```txt
append synthetic trades forever
```

model.

---

# Source of Truth Architecture

## Executions Are Canonical Truth

Elite X no longer treats:

```txt
Trade[]
```

as canonical persistence.

The true source of truth is now:

```txt
NormalizedExecution[]
```

Trades are rebuilt deterministically from executions.

This architecture prevents:

* duplicate imports
* overlapping CSV corruption
* ghost shorts
* orphan open positions
* lifecycle drift
* synthetic trade mutation
* append corruption
* repeated upload corruption

---

# Deterministic Rebuild Rules

Given the same execution set:

```txt
same executions
→ same reconstructed trades
→ every single time
```

This behavior is now considered:

FOUNDATIONAL ARCHITECTURE

Elite X must NEVER return to:

```txt
append-based synthetic trade persistence
```

---

# FIFO Quantity-Aware Accounting

Elite X now supports:

* quantity depletion
* FIFO matching
* multi-fill entries
* aggregated exits
* partial fills
* cross-day lifecycle continuity
* worthless expirations
* open-position carry-forward
* open-to-closed lifecycle migration
* execution-level traceability

The reconciliation engine now behaves much closer to:

```txt
institutional broker reconciliation systems
```

than:

```txt
retail journaling software
```

---

# Critical Accounting Philosophy

Elite X intentionally prioritizes:

```txt
execution-authentic accounting
```

instead of aggressively compressing fills into synthetic position summaries.

This means Elite X may show:

```txt
multiple execution-derived trade fragments
```

where systems like Tradelizer show:

```txt
single averaged position abstraction
```

Elite X prioritizes:

* broker-traceable execution history
* deterministic FIFO accounting
* auditable reconciliation
* institutional accuracy

over:

* compressed visual simplicity
* averaged fill abstraction
* aggressive aggregation

Future UI aggregation layers may later simplify presentation while preserving execution-authentic accounting internally.

---

# Canonical Trade Date Policy

Elite X officially uses:

```txt
close-date realized accounting
```

for all realized P&L systems.

For reconstructed closed trades:

```txt
trade.date
```

represents:

```txt
realized/accounting date
```

NOT entry date.

Lifecycle metadata:

```txt
openedAt
closedAt
```

exists separately for behavioral and lifecycle analysis.

---

# Realized Analytics Systems

The following systems MUST group by:

```txt
closedAt || date
```

- Trading Calendar
- Daily P&L Distribution
- Trading Behavior
- Account Overview
- Realized P&L analytics
- Performance aggregation systems

This preserves institutional realized accounting consistency.

---

# Behavioral vs Accounting Separation

Elite X distinguishes between:

```txt
behavioral trade initiation
```

and:

```txt
realized accounting attribution
```

Behavioral systems MAY use:

```txt
openedAt
```

ONLY when explicitly performing:

- entry-session analysis
- execution timing analysis
- trade initiation behavior review

Behavioral systems MUST NOT silently drift away from realized accounting semantics.

---

# Protected Accounting Architecture Rule

Do NOT reintroduce:

```txt
entry-date pnl attribution
```

for realized accounting systems.

This previously caused:

- calendar drift
- analytics inconsistency
- weekday mismatch
- distribution mismatch
- lifecycle attribution corruption

Elite X now officially standardizes:

```txt
realized pnl belongs to close date
```

---

# Reconciliation Override Experiments (FAILED / DO NOT REINTRODUCE)

Elite X experimented with:

manual synthetic reconciliation closures
for imported open positions.

The attempted architecture introduced:

* synthetic closing executions
* manual lifecycle overrides
* unresolved short suppression
* synthetic close flags
* reconciliation patching logic

This architecture is currently considered:

UNSTABLE

The experiment produced:

* runaway open position generation
* duplicate unresolved shorts
* corrupted lifecycle reconstruction
* reconciliation ambiguity
* persistent synthetic execution pollution
* execution bucket mismatch problems
* unstable state rebuilds

Critical lesson learned:

Elite X deterministic rebuild architecture is currently stable ONLY when:

```txt
NormalizedExecution[]
→ deterministic FIFO rebuild
→ immutable execution history
```

The system becomes unstable when introducing:

```txt
manual synthetic lifecycle mutation
```

without a dedicated reconciliation subsystem.

---

# Current Official Position Lifecycle Policy

Imported broker executions are currently treated as:

```txt
IMMUTABLE ACCOUNTING HISTORY
```

This means:

* imported open positions should NOT be manually force-closed
* synthetic close executions should NOT be injected
* unresolved imported lifecycle mismatches are acceptable
* stability is prioritized over forced reconciliation

This is intentional.

Future reconciliation systems must be designed as:

```txt
dedicated institutional reconciliation layer
```

NOT:

```txt
patches inside pairTrades()
```

---

# DO NOT REINTRODUCE THESE PATTERNS

The following experimental patterns are considered:

ARCHITECTURALLY UNSAFE

Do NOT casually reintroduce:

```ts
isSyntheticClose
```

```ts
handleResolvePosition()
```

```ts
syntheticExecution
```

```ts
manual-close-${trade.id}
```

```ts
!execution.isSyntheticClose
```

inside unmatched short handling.

Do NOT attempt:

* synthetic lifecycle overrides
* synthetic close injections
* forced open-position mutation
* reconciliation shortcuts
* stateful rebuild patching
* mutable imported accounting

without first designing:

```txt
true reconciliation ledger architecture
```

---

# Stable Architectural Boundary

Current stable system boundary:

```txt
deterministic imported execution rebuilding
```

NOT:

```txt
interactive accounting mutation engine
```

This distinction is critical.

Elite X is currently stable because:

```txt
executions remain immutable
```

and:

```txt
trades are deterministic derived state
```

This architecture must remain protected.

# Behavioral Journaling Architecture

Elite X includes isolated behavioral journaling systems
designed to remain fully separated from canonical accounting architecture.

Current stabilized systems include:

* hydration-safe behavioral notes
* isolated calendar journaling
* rebuild-independent note persistence
* institutional notes modal systems
* behavioral metadata isolation
* non-accounting journal storage
* calendar note indicators

Behavioral journaling systems MUST NEVER:

* mutate executions
* mutate reconstructed trades
* affect reconciliation
* affect realized P&L
* affect analytics calculations
* interfere with deterministic rebuild behavior

Behavioral journaling is intentionally treated as:

```txt
non-accounting metadata layer
```


# Execution Identity Architecture


Execution IDs are now deterministic.

Old broken architecture:

```ts
id: `${ticker}-${index}`
```

Problem:

* CSV row ordering changes between exports
* overlapping ranges produced different IDs
* duplicate detection failed

Current architecture:

```ts
id:
`${account}-${executionTimestamp}-${ticker}-${contractKey}-${side}-${quantity}-${executionPrice}-${executionValue}`
```

This guarantees:

```txt
same broker execution
→ same internal identity
→ regardless of CSV export range
```

This architecture permanently solves:

* overlapping import duplication
* repeated upload duplication
* ghost short reconstruction
* duplicated open positions
* partial overlap corruption

## Deterministic Execution Identity v2

Execution identities are now fully deterministic and collision-resistant.

Previous architectures allowed execution collisions when:

- same timestamp
- same ticker
- same contract
- same side
- same quantity
- same execution price

occurred across:
- split fills
- duplicated timestamps
- overlapping exports
- multiple broker accounts

This caused:

- false duplicate suppression
- phantom open positions
- incomplete FIFO reconstruction
- execution identity collapse
- deterministic rebuild instability

Current architecture uses:

```ts
id:
`${account}-${executionTimestamp}-${ticker}-${contractKey}-${side}-${quantity}-${executionPrice}-${executionValue}`
```

Execution identity now includes:

* account
* full execution timestamp
* ticker
* contractKey
* side
* quantity
* executionPrice
* executionValue

This architecture permanently solves:

* duplicate timestamp collisions
* split-fill identity collapse
* repeated upload drift
* overlapping export ambiguity
* ghost open positions
* deterministic reconstruction instability

---

# Current Persistence Doctrine

Elite X now officially operates on:

```txt
cloud-canonical deterministic execution reconstruction
```

Canonical accounting truth now exists ONLY in:

```txt
Supabase execution ledger
```

Imported executions are persisted as:

```txt
NormalizedExecution[]
```

through:

```txt
Supabase executions table
```

Current canonical flow:

```txt
CSV Upload
↓
Normalize Executions
↓
Persist To Supabase
↓
Load Canonical Executions From Supabase
↓
Deterministic FIFO Rebuild
↓
Canonical Trades
↓
Analytics + UI
```

This architecture permanently solves:

* browser divergence
* cross-device reconstruction mismatch
* stale local execution pollution
* hybrid state drift
* local reconstruction inconsistency
* duplicate upload instability
* domain-level accounting divergence
* inconsistent open positions


---

# Canonical Cloud Persistence Rule

Supabase persistence stores ONLY:

```txt
NormalizedExecution[]
```

NOT:

```txt
Trade[]
```

Trades MUST remain:

```txt
deterministic derived state
```

through:

```txt
pairTrades()
```

This architecture is considered:

FOUNDATIONAL

Do NOT bypass deterministic rebuild systems by:

* directly persisting synthetic trades
* mutating reconstructed trade objects
* storing analytics snapshots as canonical truth
* introducing append-based trade persistence
* creating mutable trade-ledger architectures


---

# Execution Identity Protection

Execution deduplication now exists at BOTH:

## Local Layer

```txt
appendExecutions()
```

AND:

## Cloud Layer

```txt
PRIMARY KEY(id)
+
upsert(onConflict: "id")
```

Duplicate protection MUST remain execution-scoped.

Do NOT move duplicate prevention into:

```txt
synthetic trade layer
```

---

# Current Cloud Persistence Boundary

Cloud persistence currently applies ONLY to:

```txt
imported executions
```

Manual trade entries currently remain:

```txt
local-only presentation persistence
```

until future manual execution architecture is designed.

---

---

# Canonical Reconstruction Loading Behavior

Elite X now performs:

```txt
single-source canonical cloud reconstruction
```

during initialization.

Current flow:

```txt
Supabase executions
↓
Deterministic chronological ordering
↓
FIFO quantity-aware reconstruction
↓
pairTrades()
↓
canonical reconstructed trades
```

All environments now reconstruct from:

```txt
single immutable cloud execution ledger
```

This architecture guarantees:

```txt
same execution ledger
→ same reconstructed trades
→ every single time
```

provided execution identity remains deterministic.


# Protected Persistence Architecture Rule

Elite X MUST NEVER evolve toward:

```txt
mutable trade CRUD architecture
```

Canonical accounting truth MUST remain:

```txt
execution-first deterministic reconstruction
```

Cloud synchronization exists ONLY to transport immutable execution history.

NOT to mutate reconstructed trade state.


---

# CSV Import Architecture

Completed:

* IBKR CSV parser
* execution normalization
* deterministic execution identity
* FIFO reconciliation engine
* quantity-aware pairing
* open trade handling
* commission normalization
* account mapping
* ticker normalization
* asset-type normalization
* canonical date conversion
* deterministic rebuild system

Supported:

* Futures
* Options
* Stocks
* Forex
* Crypto

All imported executions MUST normalize into:

```txt
YYYY-MM-DD
```

before entering application state.

---

# Trade Architecture

Elite X currently supports:

```ts
"WIN"
"LOSS"
"BREAKEVEN"
"OPEN"
```

Trade system includes:

* manual trade entry
* CSV import ingestion
* modal editing
* deterministic trade rebuilding
* FIFO reconciliation
* open position support
* account tracking
* commission tracking
* asset-type support
* cross-day lifecycle continuity

Supported asset types:

* Futures
* Options
* Stocks
* Forex
* Crypto
* CFD

---

# Option Architecture

Elite X supports:

institutional options multiplier handling.

Important:

Options quantity:

```txt
1
```

internally represents:

```txt
100 shares equivalent
```

for P&L calculations.

This architecture fixes:

* incorrect option P&L
* incorrect close calculations
* manual reconciliation mismatch

Non-option assets still retain:

```txt
1 = 1
```

behavior.

---

# Trade History Architecture

Trades page now functions as:

institutional execution terminal.

Stabilized systems:

* trade table
* newest-first sorting
* account rendering
* status rendering
* asset rendering
* entry/exit rendering
* commission rendering
* modal drilldowns
* calendar synchronization
* edit integration
* spacing calibration
* deterministic rebuild synchronization

Trade rendering uses:

```ts
parseLocalDate()
```

instead of raw UTC parsing.

---

# Calendar Architecture

TradingCalendar.tsx is considered:

HIGHLY SENSITIVE

Current stabilized systems:

* institutional calendar shell
* monthly navigation
* P&L heatmap engine
* profit/loss intensity scaling
* drilldown modals
* trade synchronization
* safe-zone spacing
* invisible spacer compensation
* optical balancing
* timezone-safe rendering
* lifecycle continuity rendering

* behavioral journaling integration
* daily session notes system
* hydration-safe note rendering
* calendar note indicators
* institutional notes modal
* isolated behavioral metadata layer

---

# Calendar Layout Rules

The calendar intentionally uses:

* invisible spacer divs
* opacity-0 spacing systems
* relative positioning
* translate compensation
* optical alignment offsets
* left/right safe-zones
* top/bottom spacing balancing

These are NOT accidental.

Do NOT aggressively remove these systems.

---

# Modal Architecture

Elite X uses:

institutional modal-safe architecture.

Stabilized systems:

* centered modal shell
* KPI cards
* spacing-safe layout
* optical balancing
* invisible spacer rhythm
* section-safe separation
* modal-safe scrolling
* trade drilldown integration

Spacing compensation is intentional.

Avoid aggressive wrapper rewrites.

---

# P&L Analytics Architecture

P&L Analytics is considered:

STABILIZED INSTITUTIONAL MODULE

Current architecture includes:

* adaptive aggregation engine
* timeframe-aware rendering
* monthly grouping
* weekly grouping
* daily grouping
* centered zero-line system
* positive/negative directional bars
* tooltip interaction
* optical x-axis balancing
* safe-zone chart compensation

---

# Adaptive Aggregation System

Elite X dynamically aggregates analytics based on selected timeframe.

Current behavior:

| Range | Aggregation     |
| ----- | --------------- |
| 1D    | Daily           |
| 7D    | Daily           |
| 30D   | Weekly          |
| MTD   | Monthly-to-date |
| 1Y    | Monthly         |
| ALL   | Monthly         |

This architecture solves:

* chart overcrowding
* label overflow
* analytics scaling instability
* dense yearly rendering

This system is considered:

FOUNDATIONAL ANALYTICS ARCHITECTURE

---

# Timeframe Architecture

Current supported ranges:

```txt
1D
7D
30D
MTD
1Y
ALL
```

Elite X persists timeframe selection across refreshes using:

```txt
localStorage
```

This is considered:

production-grade UX behavior.

---

# Trading Behavior Architecture

Trading Behavior is considered:

STABILIZED ANALYTICS MODULE

The system currently operates using:

```txt
realized close-date attribution
```

to remain synchronized with:

- Trading Calendar
- Daily P&L Distribution
- Account Overview
- Realized P&L analytics

Trading Behavior intentionally groups realized performance using:

```txt
closedAt || date
```

NOT:

```txt
openedAt
```

unless explicitly performing behavioral entry-session analysis.

---

# Current Stabilized Systems

Trading Behavior currently includes:

* isolated weekday analytics cards
* realized weekday performance aggregation
* realized trade-count aggregation
* institutional spacing rhythm
* invisible spacing compensation
* optical row stabilization
* manual alignment balancing
* independent card-spacing architecture
* timezone-safe weekday rendering
* lifecycle-aware analytics grouping

---

# Protected Layout Rules

Trading Behavior intentionally uses:

* invisible spacer systems
* optical compensation offsets
* spacing-safe flex balancing
* manual row calibration
* independent rhythm stabilization

These systems are intentional.

Do NOT aggressively remove:

* invisible spacing systems
* relative alignment compensation
* optical balancing offsets
* manual spacing calibration

without fully validating visual rhythm consistency.

---

# Protected Behavioral Rule

Do NOT silently reintroduce:

```txt
entry-date pnl attribution
```

inside realized behavioral analytics.

This previously caused:

* calendar mismatch
* weekday drift
* trade-count inconsistency
* analytics desynchronization
* realized pnl attribution corruption

Elite X officially standardizes:

```txt
realized pnl belongs to close date
```

for all realized behavioral aggregation systems.

---

# KPI Card Architecture

Current KPI system includes:

* Total P&L
* Average Win
* Commissions
* Win Rate
* Best Day
* Worst Day
* Volatility
* Streak Tracking

Current KPI cards intentionally use:

* enlarged institutional sizing
* centered typography
* proportional spacing
* optical hierarchy balancing

---

# UI Philosophy

Elite X intentionally prioritizes:

* calm density
* breathing room
* optical alignment
* spacing rhythm
* visual predictability
* institutional presentation

Important principle:

Optical alignment is more important than mathematical alignment.

---

# Protected UI Systems

The following systems are considered:

SENSITIVE / STABILIZED

Avoid unnecessary rewrites:

* TradingCalendar.tsx
* PnLAnalytics.tsx
* modal safe-zones
* dashboard wrapper spacing
* invisible spacer architecture
* translate compensation systems
* left/right safe-zones
* chart alignment systems

When instability occurs:

DO NOT immediately rewrite containers.

Instead evaluate:

* spacer balancing
* relative offsets
* flex rhythm
* optical compensation
* safe-zone calibration

---

# Multi-Page SaaS Architecture

Current routes:

```txt
/
```

```txt
/trades
```

Planned routes:

```txt
/calendar
```

```txt
/analytics
```

```txt
/expenses
```

```txt
/settings
```

---

# Current Development Priorities

Current priority phase:

Execution Review + Business Tracking

Next likely systems:

* expense architecture
* subscription tracking
* business expense analytics
* trade search
* filtering toolbar
* ticker filtering
* setup tagging
* screenshot support
* execution notes
* UI aggregation layer

---

# Future Planned Systems

## Analytics Expansion

Planned:

* expectancy engine
* consistency scoring
* setup analytics
* session analytics
* AI trade review
* advanced behavior analytics
* execution grading

---

## Future UI Aggregation Layer

Potential future enhancement:

```txt
execution-authentic reconciliation internally
+
aggregated position presentation externally
```

Example:

Instead of:

```txt
BUY 1 @ 0.40
BUY 1 @ 0.46
BUY 1 @ 0.30
SELL 3 @ 0.11
```

UI may later show:

```txt
AVG ENTRY 0.39
EXIT 0.11
QTY 3
```

But internally:

```txt
FIFO execution truth must remain preserved
```

---

## Database Architecture

Future stack:

* Prisma
* PostgreSQL
* Supabase
* authentication
* cloud sync
* multi-device persistence

---

## Broker Adapter Layer

Planned:

* Tradovate parser
* NinjaTrader parser
* ThinkOrSwim parser
* TradeStation parser
* normalized ingestion pipelines

---

# Development Rules

Before modifying any stabilized system:

1. Understand existing spacing architecture
2. Avoid aggressive rewrites
3. Preserve optical balancing
4. Preserve invisible spacer systems
5. Prefer surgical edits
6. Protect timezone-safe date systems
7. Maintain canonical date storage
8. Preserve safe-zone compensation
9. Preserve deterministic rebuild behavior
10. Never reintroduce append-based synthetic trade persistence

Institutional dashboards require:

optical stability

not merely:

technically valid layout.

---

# Current Stable Milestones

## fifo-stable-v1

First stable FIFO quantity-aware reconciliation engine.

## deterministic-rebuild-v1

First stable deterministic execution-based rebuild architecture.

---

# Safe Reset Command

```js
localStorage.clear()
location.reload()
```

---

# Current Project State

Status:

```txt
STABLE
```

Architecture:

```txt
CLOUD-CANONICAL DETERMINISTIC EXECUTION RECONSTRUCTION
```

Elite X now behaves significantly closer to:

```txt
professional broker reconciliation infrastructure
```

than:

```txt
basic retail journaling software
```

Major architectural milestone achieved.

---

# Multi-Account Presentation Architecture

Elite X supports:

```txt
multi-account unified portfolio rendering
```

through:

```txt
presentation-layer account filtering
```

NOT through:
- separate accounting ledgers
- duplicated rebuild systems
- mutable account partitioning
- account-scoped reconciliation mutation

---

# Trade History Filtering Architecture

Elite X trade history filtering operates as:

```txt
pure presentation-layer derived filtering
```

Filtering MUST NEVER:
- mutate canonical trades
- alter execution history
- modify reconciliation
- alter accounting semantics
- create synthetic trade states
- mutate lifecycle continuity

---

# Canonical Filter Pipeline

Trade history rendering officially follows:

```txt
canonical trades
→ search filtering
→ account filtering
→ status filtering
→ side filtering
→ asset filtering
→ date-range filtering
→ render layer
```

All filtering systems are:

```txt
non-destructive render derivations
```

---

# Date Filtering Doctrine

Elite X date filtering uses:

```txt
canonical YYYY-MM-DD comparison
```

This intentionally avoids:
- timezone mutation
- locale parsing instability
- Date object drift
- UTC conversion ambiguity

Date filtering operates exclusively on:

```txt
canonical realized trade dates
```

using:

```txt
trade.date
```

---

# Toolbar Persistence Philosophy

Trade history filters are considered:

```txt
workflow-state persistence
```

NOT:
```txt
accounting persistence
```

Persistent filters MUST remain:
- UI-scoped
- non-canonical
- fully resettable
- isolated from rebuild systems
- isolated from reconciliation systems

---

# Workflow Persistence Doctrine

Elite X distinguishes between:

```txt
workflow-state persistence
```

and:

```txt
canonical accounting persistence
```

These are NOT equivalent systems.

---

# Workflow Persistence Scope

Workflow persistence exists ONLY for:

- toolbar filters
- render preferences
- temporary UI continuity
- operator workflow state
- session continuity ergonomics

Examples include:

```txt
searchQuery
statusFilter
sideFilter
assetFilter
fromDate
toDate
```

These may persist using:

```txt
localStorage
```

because they are:

```txt
non-canonical presentation state
```

---

# Protected Persistence Rule

Workflow persistence MUST NEVER:
- mutate canonical trade data
- alter rebuild systems
- modify reconciliation state
- affect execution continuity
- create accounting divergence
- persist synthetic calculations
- fork canonical execution history

---

# Canonical Persistence Boundary

Only the following may persist as canonical truth:

```txt
executions
manual trades
rebuild state
reconciliation truth
```

All workflow persistence must remain:

```txt
fully resettable
presentation-layer scoped
architecturally isolated
```


---

# Protected Filtering Architecture Rule

Filtering systems MUST ALWAYS remain:

```txt
presentation-layer only
```

They must NEVER:
- fork accounting state
- create derived persistence layers
- alter canonical trade structures
- modify execution reconstruction
- introduce hidden trade mutation



# Canonical Architecture Flow

Elite X officially follows:

```txt
Executions
→ Deterministic Rebuild
→ Canonical Trades
→ Account Filter Layer
→ Range Filter Layer
→ Analytics/UI
```

Imported executions remain:

```txt
canonical immutable accounting history
```

Account filtering operates ONLY as:

```txt
derived render-layer presentation state
```

---

# Protected Account Architecture Rule

Account filtering MUST NEVER:

- mutate executions
- mutate reconstructed trades
- alter reconciliation
- create duplicate accounting layers
- fork deterministic rebuild behavior
- create account-specific trade persistence
- introduce synthetic account partitioning

All account views MUST derive from:

```txt
single canonical trade universe
```

---

# Current Supported Behavior

Elite X currently supports:

- combined portfolio analytics
- per-account analytics
- per-account trade history
- per-account calendar rendering
- per-account behavioral aggregation
- synchronized account-aware dashboard rendering

through:

```txt
selectedAccount
→ accountFilteredTrades
→ rangeFilteredTrades
→ analytics/UI
```

This architecture preserves:
- deterministic rebuild consistency
- accounting integrity
- lifecycle synchronization
- analytics synchronization
- institutional portfolio scalability

# Notes Workspace Architecture

Elite X now includes:

```txt
institutional rich-text workspace system
```

through:

```txt
Tiptap modular editor architecture
```

The Notes system now supports:

* rich-text editing
* structured headings
* bold formatting
* italic formatting
* bullet lists
* color-coded annotations
* persistent HTML note serialization
* modular editor isolation
* workspace-safe UI spacing
* institutional toolbar architecture

The editor intentionally prioritizes:

* focused trader workflow
* calm typography
* restrained formatting
* structured thinking
* institutional note-taking
* modular extensibility

over:

* bloated document tooling
* excessive formatting controls
* consumer-style writing editors
* visual clutter

---

# Notes Persistence Doctrine

Notes currently persist as:

```txt
serialized rich-text HTML
```

through:

```txt
localStorage
```

This architecture intentionally isolates:

```txt
behavioral workspace systems
```

from:

```txt
canonical accounting systems
```

Notes MUST NEVER:
- mutate executions
- mutate reconstructed trades
- affect reconciliation
- alter analytics calculations
- fork deterministic rebuild behavior

Notes are officially classified as:

```txt
non-canonical behavioral workspace metadata
```

---

# Editor Architecture Boundary

Tiptap editor systems are intentionally isolated into:

```txt
components/notes/TiptapEditor.tsx
```

This preserves:

* modular scalability
* editor-state isolation
* future extension safety
* toolbar modularity
* future cloud-sync migration
* future AI workspace compatibility

Editor logic MUST NOT be aggressively merged into:

```txt
app/notes/page.tsx
```

---

# Current Notes System Status

Current milestone:

```txt
RICH TEXT WORKSPACE STABILIZED
```

Stabilized systems include:

* safe-zone spacing architecture
* optical alignment systems
* institutional toolbar spacing
* rich-text rendering
* heading hierarchy rendering
* HTML-safe preview rendering
* modular editor isolation
* restrained institutional formatting system

Current Notes architecture is considered:

```txt
FOUNDATIONALLY STABLE
```

# Lifecycle Intelligence System (v10)

Elite X now supports institutional trade lifecycle tracking.

Features added:

- Open Date / Close Date columns
- Holding duration visualization
- Expired Worthless lifecycle semantics
- Derived lifecycle filtering
- Case-insensitive options detection
- Institutional trade table spacing/alignment refinements

Architecture Notes:

- Canonical trade accounting remains unchanged
- Expired Worthless is derived presentation-layer logic
- holdingDays is derived inside pairTrades()
- Lifecycle metadata now flows through:
  - calendar
  - trade table
  - filters
  - detail views

  # Institutional Lifecycle UX System (v11)

Elite X now includes:

```txt
institutional lifecycle-aware trade visualization
```

Current lifecycle systems include:

* live-position indicators
* holding-duration intelligence
* semantic lifecycle dots
* hover-based lifecycle tooltips
* open-position duration tracking
* intraday lifecycle semantics
* multi-day holding visualization
* lifecycle-aware calendar continuity

Lifecycle semantics now follow:

| State | Visualization |
|---|---|
| OPEN | Green lifecycle dot |
| CLOSED SAME DAY | Slate lifecycle dot |
| CLOSED MULTI-DAY | Cyan lifecycle dot |

Tooltip behavior includes:

* Position still open for X days
* Held for X days
* Same Day lifecycle detection

This architecture intentionally prioritizes:

```txt
minimal visual density
+
high semantic information delivery
```

instead of:

```txt
large lifecycle badges
extra columns
heavy status labels
```

Lifecycle visualization is considered:

```txt
presentation-layer intelligence
```

NOT canonical accounting logic.

---

# Adaptive Timeframe Analytics Expansion (v11)

Elite X now supports expanded institutional analytics ranges.

Current supported ranges:

```txt
1D
7D
30D
MTD
3M
6M
YTD
1Y
ALL
```

Adaptive aggregation behavior now follows:

| Range | Aggregation |
|---|---|
| 1D | Daily |
| 7D | Daily |
| 30D | Weekly |
| MTD | Weekly |
| 3M | Weekly |
| 6M | Monthly |
| YTD | Monthly |
| 1Y | Monthly |
| ALL | Monthly |

This architecture intentionally solves:

* analytics overcrowding
* x-axis instability
* excessive bar density
* long-range visualization noise
* timeframe scaling inconsistency

Elite X now dynamically adjusts:

```txt
analytics density
```

based on:

```txt
selected timeframe
```

This behavior is considered:

```txt
FOUNDATIONAL ANALYTICS ARCHITECTURE
```

---

# Typography Normalization System (v11)

Elite X now uses:

```txt
institutional contrast hierarchy
```

throughout the platform.

Current typography doctrine:

| Layer | Color |
|---|---|
| Primary Titles | text-white |
| Operational Data | text-slate-400 |
| Secondary Labels | text-slate-500 |
| Semantic Metrics | contextual semantic colors |

This architecture intentionally reduces:

* excessive contrast noise
* dashboard glare
* retail-dashboard brightness
* visual fatigue

while improving:

* calm density
* information hierarchy
* institutional presentation
* analytical readability

Typography normalization is now considered:

```txt
production-calibrated UI doctrine
```

# Execution-Centric Architecture Doctrine

Elite X no longer uses mutable Trade objects as the canonical source of truth.

The platform has officially transitioned to:

execution-centric architecture

where:

executions

are the immutable canonical ledger.

All platform systems now derive from:

Supabase executions table

including:

- dashboard
- analytics
- calendar
- trade history
- lifecycle reconstruction
- open positions
- P&L systems

---

# Canonical Reconstruction Engine

Elite X reconstructs all trade lifecycles through:

pairTrades()

This is now the central accounting engine.

Trade objects are considered:

derived presentation views

NOT mutable persistence entities.

---

# Manual Trade Doctrine

Manual trades are no longer stored as direct Trade objects.

Manual trades now generate:

synthetic NormalizedExecution lifecycles

which are persisted into:

Supabase executions

and reconstructed identically to broker-imported executions.

This preserves:

- deterministic rebuilds
- unified analytics
- unified lifecycle accounting
- cross-device consistency
- canonical persistence doctrine

---

# Immutable Ledger Doctrine

Broker-imported executions are treated as:

immutable historical ledger data

Broker trades:
- cannot be edited
- cannot be deleted
- are reconstruction-only

This prevents:
- accounting drift
- lifecycle corruption
- audit inconsistency

---

# Manual Lifecycle Management

Elite X manual trades now operate through:

```txt
execution-native lifecycle replacement
```

NOT:

```txt
mutable Trade object mutation
```

Manual trade editing flow:

```txt
edit manual trade
↓
delete previous manual executions
↓
generate corrected synthetic executions
↓
persist corrected executions
↓
pairTrades() reconstructs canonical lifecycle state
```

This architecture preserves:

- deterministic rebuild integrity
- canonical execution accounting
- cross-device consistency
- immutable broker execution doctrine
- lifecycle-safe editing
- analytics synchronization
- execution-ledger authenticity

Manual lifecycle deletion is intentionally restricted ONLY to executions using:

```txt
MANUAL-
```

contractKey namespaces.

This prevents:

- accidental deletion of broker-imported executions
- imported ledger corruption
- accounting drift
- immutable history mutation

Imported broker executions remain:

```txt
immutable historical accounting truth
```

and are NEVER directly editable.

---

# Fee Reconciliation Integrity

Elite X manual execution generation now preserves:

```txt
exact fee reconciliation
```

across synthetic execution lifecycles.

Commission allocation now follows:

```txt
entryFees + exitFees
= exact original commission
```

instead of naïve:

```txt
commission / 2
```

rounding.

This prevents:

- fee drift
- reconciliation mismatch
- floating rounding leakage
- lifecycle accounting divergence

Example:

```txt
2.11
→ 1.05 + 1.06
→ exact reconciliation
```

instead of:

```txt
2.11
→ 1.05 + 1.05
→ 2.10 incorrect drift
```

This behavior is now considered:

```txt
ledger-safe accounting doctrine
```

---

# Manual Options Accounting

Elite X manual execution generation now supports:

```txt
institutional options multiplier semantics
```

Manual options trades automatically apply:

```txt
multiplier = 100
```

for:

- execution value
- pnl reconstruction
- lifecycle accounting

Non-option assets retain:

```txt
multiplier = 1
```

This architecture preserves:

- options accounting integrity
- realistic options P&L
- broker-authentic reconstruction
- analytics consistency

---

# Institutional Manual Lifecycle UX

Elite X now supports:

- manual lifecycle editing
- manual lifecycle deletion
- execution-native lifecycle replacement
- calendar-integrated editing
- trade-table integrated editing
- lifecycle-safe modal reconciliation

Manual lifecycle editing now behaves as:

```txt
institutional synthetic execution management
```

instead of:

```txt
mutable frontend trade CRUD
```

This architecture officially transitions Elite X further toward:

```txt
execution-native trading operating system architecture
```

---

# Behavioral Cloud Persistence

Elite X now supports cloud persistence for:

- Notes
- Daily Calendar Notes
- Execution Ledger

via:

```txt
Supabase
```

This enables:

- cross-device continuity
- behavioral journaling persistence
- cloud-native reconstruction
- production-safe persistence architecture
- execution-ledger synchronization
- deterministic cloud rebuilds

---

# Legacy Architecture Status

The following systems are now considered:

```txt
legacy transitional layers
```

- tradeStorage.ts
- createTrade.ts

Trade objects are now treated as:

```txt
derived presentation state
```

NOT:

```txt
canonical persistence truth
```

Future development should prioritize:

```txt
execution-native workflows
```

instead of:

```txt
mutable Trade persistence
```

---

# Current Platform State

Elite X currently supports:

✅ canonical execution persistence  
✅ deterministic lifecycle reconstruction  
✅ hybrid local + cloud synchronization  
✅ Supabase execution ledger  
✅ cloud behavioral notes  
✅ manual execution ingestion  
✅ immutable broker history  
✅ lifecycle-safe manual deletion  
✅ production Vercel deployment  

---

# NEXT PHASE

PHASE 3 — Behavioral & Financial Systems

Planned systems:
- expense tracking
- advanced journaling
- behavioral analytics
- reminders
- metadata systems
- workspace continuity
- user authentication
- multi-user architecture
- role separation
- institutional reporting

---

Elite X has officially transitioned from:

frontend trading journal

into:

ledger-based trading platform architecture


# Multi-Currency Architecture (v12)

Elite X now supports:

```txt
native multi-currency execution accounting
```

through:

```txt
execution-level currency persistence
```

Current supported currencies include:

- USD
- CAD
- EUR

Architecture includes:

- execution-native currency tracking
- fee-currency persistence
- canonical currency propagation
- Supabase currency persistence
- adaptive account overview rendering
- presentation-layer currency grouping

Execution schema now includes:

```ts
currency
feeCurrency
```

Currency metadata flows through:

```txt
IBKR CSV
↓
NormalizedExecution
↓
Supabase persistence
↓
Deterministic reconstruction
↓
Canonical trades
↓
Analytics/UI rendering
```

This architecture intentionally preserves:

```txt
native broker accounting truth
```

instead of:

```txt
forced synthetic USD conversion
```

Current account overview rendering intentionally groups metrics by:

```txt
native accounting currency
```

Example:

```txt
USD +15,420
CAD +466
EUR -120
```

instead of silently mixing currencies.

---

# Protected Currency Architecture Rule

Elite X MUST NEVER:

- silently merge currencies
- synthesize fake FX conversions
- flatten mixed-currency accounting
- mutate broker-native currency truth
- hide native currency attribution

Until institutional FX infrastructure is implemented:

```txt
native currency truth
```

is considered:

```txt
canonical accounting doctrine
```

Future FX systems must operate as:

```txt
derived presentation-layer conversion
```

NOT:

```txt
canonical accounting mutation
```
## multi-currency-native-v12

First stable native multi-currency accounting architecture.

Features stabilized:

- execution-native currency persistence
- fee currency persistence
- Supabase currency propagation
- adaptive account overview rendering
- mixed-currency portfolio safety
- native broker currency truth preservation

## Institutional FX Layer

Planned future architecture:

```txt
native accounting truth
+
derived FX presentation layer
```

Planned capabilities:

- historical FX conversion
- portfolio base-currency rendering
- realized FX attribution
- daily FX snapshots
- broker-native currency preservation
- institutional portfolio conversion

FX systems MUST remain:

```txt
presentation-layer derived systems
```

NOT:

```txt
canonical accounting mutation
```

# Canonical Execution Identity Doctrine

Elite X treats broker executions as:

```txt
globally canonical immutable accounting events
```

Execution identity MUST remain deterministic across:

- CSV imports
- IBKR Flex sync
- future broker APIs
- backup restores
- reconciliation passes
- multi-device sync

The SAME broker execution MUST ALWAYS produce:

```txt
the same execution ID
```

regardless of ingestion source.

This architecture guarantees:

- duplicate-safe synchronization
- reconciliation integrity
- deterministic lifecycle reconstruction
- immutable accounting consistency

Elite X MUST NEVER generate:

```txt
random broker execution identity
```

for imported broker executions.

Execution identity is considered:

```txt
canonical accounting infrastructure
```