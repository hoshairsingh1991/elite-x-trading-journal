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
the same canonical execution identity
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
Canonical Accounting Layer

- Native broker currency preserved
- No FX mutation
- No synthetic accounting
- Currency remains attached to execution

Presentation Layer

- User selects Base Currency
- Dashboard metrics rendered in Base Currency
- FX conversion occurs only at display time

Supported Base Currencies

USD
CAD
EUR
GBP
JPY
AUD
CHF
NZD
HKD
SGD

FX PRESENTATION LAYER V1

Goal:
Render dashboard metrics in selected base currency.

Supported:
USD
CAD
EUR
GBP
JPY
AUD
CHF
NZD
HKD
SGD

Rules:

- Never modify canonical trade data
- Never modify execution data
- Never modify stored pnl
- Conversion happens only in dashboard rendering
- Native currency remains available for auditability

# Broker-Native Execution Identity Enrichment (v13)

brokerExecutionId is enrichment metadata,
NOT current canonical accounting identity.

Elite X now supports:

```txt
broker-native execution identity enrichment
```

through:

```ts
brokerExecutionId
```

persisted on:

```txt
NormalizedExecution
```

This architecture introduces:

```txt
dual execution identity systems
```

## Canonical Internal Identity

```ts
execution.id
```

Used for:

* deterministic rebuilds
* duplicate prevention
* FIFO reconciliation
* lifecycle reconstruction
* canonical accounting continuity

Current deterministic identity architecture remains unchanged.

---

## Broker-Native Identity

```ts
brokerExecutionId
```

Currently sourced from:

```txt
IBKR ExecID
```

Used for:

* broker reconciliation
* auditability
* sync parity validation
* broker traceability
* future broker sync infrastructure
* ingestion-source normalization

This architecture intentionally preserves:

```txt
deterministic canonical accounting
```

while introducing:

```txt
broker-aware reconciliation enrichment
```

Elite X intentionally does NOT yet use:

```txt
brokerExecutionId
```

as canonical execution identity.

Current architecture prioritizes:

* rebuild stability
* duplicate safety
* lifecycle continuity
* deterministic parity protection

before transitioning toward future:

```txt
broker-native canonical synchronization
```


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
