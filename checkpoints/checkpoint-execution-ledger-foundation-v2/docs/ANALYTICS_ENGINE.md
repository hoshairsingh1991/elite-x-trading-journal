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