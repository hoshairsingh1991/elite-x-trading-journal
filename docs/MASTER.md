# Elite X Trading Journal

---

# Vision

Elite X is a professional institutional-grade trading analytics and journaling platform focused on:

* discretionary futures trading
* options trading
* execution analytics
* performance review
* behavioral journaling
* business tracking
* workflow optimization
* long-term trading development

The platform should feel:

* clean
* premium
* minimal
* institutional
* fast
* calm
* analytical
* execution-focused

Elite X is NOT intended to feel like:

* retail trading software
* gambling UI
* flashy crypto dashboards
* neon-heavy interfaces
* crowded analytics systems

The platform should prioritize:

* clarity
* focus
* readability
* workflow speed
* structured review

---

# Core Development Principles

Elite X development follows:

* stability first
* modular architecture
* incremental feature building
* local-first development
* Git-safe workflow
* minimal rewrites
* clean UI systems
* beginner-safe development process
* typography-first design
* spacing-first hierarchy
* optical alignment systems
* surgical edits over aggressive rewrites

---

# Tech Stack

## Current Stack

* Next.js
* TypeScript
* TailwindCSS
* Local JSON storage (V1)
* localStorage persistence
* PapaParse CSV ingestion

## Future Stack

* Prisma
* Supabase
* PostgreSQL
* Vercel deployment
* Authentication system
* Cloud sync
* AI analytics engine

---

# Current Project Status

Elite X has transitioned from:

prototype dashboard architecture

into:

modular multi-page SaaS architecture.

The application now behaves as a real local-first trading operating system.

Current system state is considered:

STABLE CHECKPOINT

Current calendar + modal spacing systems are considered production-calibrated.

Current trade ingestion + date architecture is considered STABLE.

---

# Completed Systems

## Dashboard Foundation

Completed:

* institutional dashboard architecture
* stable layout structure
* stable spacing hierarchy
* optical alignment system established
* responsive dashboard structure stabilized
* safe-zone spacing system established
* typography-first hierarchy stabilized

---

## Trading Calendar System

Completed:

* institutional calendar layout
* dynamic monthly navigation
* P&L heatmap engine
* profit/loss intensity scaling
* monthly analytics display
* total trade tracking
* day drilldown modal system
* calendar trade synchronization
* stabilized safe-zone architecture
* modal-safe spacing system
* optical calendar compensation system
* left/right calendar spacing stabilization
* top/bottom calendar safe-zone balancing
* timezone-safe local date parsing
* unified trade date architecture

Important:

TradingCalendar.tsx is considered HIGHLY SENSITIVE.

Avoid modifying:

* wrapper structure
* width calculations
* parent flex systems
* alignment logic
* relative offsets
* spacing containers
* translate-x systems
* translate-y systems
* safe-zone spacers
* invisible spacing architecture
* local date parsing architecture

---

## Unified Trade Date Architecture

Elite X now uses a unified institutional-grade date system.

IMPORTANT:

Trade dates are now standardized internally as:

```txt
YYYY-MM-DD
```

Example:

```txt
2026-05-15
```

This format is now considered:

CANONICAL STORAGE FORMAT

This architecture permanently solves:

* timezone drift
* UTC conversion bugs
* previous-day calendar bugs
* inconsistent trade rendering
* CSV/manual trade mismatch
* browser timezone inconsistencies

---

## Date Rendering Rules

Elite X separates:

STORAGE FORMAT

from:

DISPLAY FORMAT

### Storage Layer

ALWAYS store trade dates as:

```txt
YYYY-MM-DD
```

Never store:

* localized date strings
* UTC timestamps
* browser-generated formatted dates
* display-layer formatted dates

### Display Layer

Trade dates may render visually as:

```txt
May 15, 2026
```

ONLY inside UI rendering layers.

Never use display formatting as storage format.

---

## Local Date Parsing System

Elite X now uses:

parseLocalDate()

instead of:

```ts
new Date("YYYY-MM-DD")
```

Reason:

JavaScript UTC parsing causes timezone drift.

Correct architecture uses:

```ts
new Date(year, month - 1, day)
```

for local timezone-safe parsing.

This architecture is considered CRITICAL.

Never casually revert back to:

```ts
new Date(trade.date)
```

inside:

* TradingCalendar.tsx
* TradesTable.tsx
* analytics systems
* charts
* KPI engines

---

## Calendar Safe-Zone Architecture

Trading calendar intentionally uses:

* invisible spacer balancing
* left/right safe-zones
* top spacing compensation
* bottom spacing compensation
* optical alignment calibration
* translate-x compensation
* translate-y compensation
* independent shell spacing
* visual breathing-room architecture

Important:

The calendar intentionally uses:

* invisible spacer divs
* opacity-0 safe-zones
* invisible text spacing
* relative positioning
* translate compensation

These are NOT accidental.

They are required for institutional spacing consistency.

Do NOT aggressively remove these systems.

---

## Trade Review Modal System

Completed:

* institutional modal architecture
* modal safe-spacing system
* inner safe-zone body architecture
* trade review table
* daily drilldown system
* win-rate calculations
* commission rendering
* entry/exit rendering
* open trade support
* status badge system
* ticker rendering
* account rendering
* modal KPI cards
* modal spacing stabilization
* modal optical balancing
* left/right modal safe-zones
* section separation rhythm

---

## Manual Trade Entry System

Completed:

* AddTradeModal.tsx
* institutional modal architecture
* centered execution workflow
* asset type selector
* LONG / SHORT selector
* commission support
* account support
* custom calendar input
* manual persistence
* centralized storage integration
* trade history integration
* calendar integration
* optical modal balancing
* safe-zone spacing architecture
* local timezone-safe date handling

Supported asset types:

* Stocks
* Options
* Futures
* Crypto
* CFD
* Forex

---

## Modal Layout Rules

The modal architecture intentionally uses:

* invisible spacer balancing
* optical vertical rhythm
* section-safe spacing
* inner-body containment
* manual spacing compensation

Spacing between:

* KPI cards
* win-rate graph
* trades table

is intentionally stabilized using:

* invisible spacer containers
* opacity-0 safe-zones
* fixed 18px spacing rhythm

Do NOT replace with random margin systems unless preserving visual rhythm consistency.

---

## CSV Import + Parser Architecture

Completed:

* IBKR CSV parsing
* execution normalization
* trade pairing engine
* open trade handling
* commission normalization
* duplicate prevention
* ticker normalization
* account mapping
* entry price rendering
* exit price rendering
* trade status mapping
* asset type mapping
* canonical date normalization
* unified ingestion architecture
* timezone-safe trade storage

Current parser supports:

* Futures
* Options
* Stocks
* Forex
* Crypto

IMPORTANT:

All imported trades must normalize dates into:

```txt
YYYY-MM-DD
```

before entering application state.

This is considered critical architecture.

---

## Persistent Storage Architecture

Completed:

* local-first storage system
* persistent trade database
* application hydration
* centralized trade storage
* durable CSV imports
* reload-safe architecture
* analytics persistence
* calendar persistence
* trade history persistence
* unified trade persistence architecture

Application now uses:

localStorage

as centralized V1 persistence layer.

---

## Multi-Page SaaS Architecture

Completed:

* route-aware sidebar
* scalable page routing
* modular page separation
* execution terminal architecture
* dashboard separation strategy
* trades page architecture

Current routes:

* /
* /trades

Future planned routes:

* /calendar
* /analytics
* /expenses
* /settings

---

## Trade History Execution Terminal

Trades page now acts as:

institutional execution terminal.

Completed:

* full Trade History table
* newest-to-oldest sorting
* entry/exit rendering
* commission rendering
* account rendering
* asset type rendering
* modal trade drilldowns
* centralized trade loading
* institutional table spacing system
* timezone-safe trade rendering
* local date parsing architecture
* unified date formatting system

IMPORTANT:

Trade history now uses:

parseLocalDate()

instead of:

```ts
new Date(trade.date)
```

to prevent UTC drift.

This is considered production-critical architecture.

---

# Current UI Architecture Rules

IMPORTANT:

The current spacing and alignment systems are considered STABLE.

Avoid unnecessary rewrites.

Preserve:

* spacing hierarchy
* optical alignment
* safe-zone spacing
* relative offsets
* institutional density
* typography rhythm
* dashboard proportions
* table proportions

DO NOT casually modify:

* wrapper structures
* parent flex containers
* TradingCalendar.tsx layout systems
* global dashboard spacing
* safe-zone containers
* invisible spacing architecture
* translate compensation systems

The application intentionally uses:

* relative left-*
* relative right-*
* top-*
* invisible spacing compensation
* optical balancing
* translate-x
* translate-y
* opacity-0 spacer systems

These are part of the institutional UI alignment system.

---

## P&L Analytics UI System

P&L Analytics is now considered a stabilized institutional UI module.

The current layout system intentionally uses:

* relative left offsets
* relative right offsets
* invisible spacing compensation
* optical alignment balancing
* asymmetric chart safe-zones
* manual typography positioning

These are NOT accidental.

They are part of the finalized dashboard alignment architecture.

---

### Daily P&L Distribution Rules

Current architecture intentionally uses:

* centered zero-line structure
* positive/negative directional bars
* tooltip-based interaction
* manual left-axis spacing
* optical x-axis balancing
* chart safe-zone compensation

Avoid modifying:

* left-[84px]
* chart safe-zones
* zero-line alignment
* tooltip positioning
* x-axis positioning logic
* relative chart offsets

The current spacing system is visually calibrated.

---

### Trading Behavior Rules

Trading Behavior now uses:

* isolated weekday card structure
* invisible spacing compensation
* independent row spacing
* optical separation rhythm
* manual alignment stabilization

Important:

Invisible spacing elements are intentionally used to stabilize:

* vertical rhythm
* flex alignment
* header balancing
* card separation
* institutional spacing consistency

Do NOT remove invisible spacing elements unless replacing them with an equally stable layout system.

---

### Metrics Card System

Bottom KPI cards now use:

* enlarged institutional card sizing
* balanced typography hierarchy
* centered metric alignment
* soft-border proportional spacing
* optical scaling on AVG DAILY

Preserve:

* card proportions
* spacing rhythm
* typography sizing
* current gap system
* visual hierarchy balance

---

### UI Development Philosophy

Elite X UI development prioritizes:

* optical alignment over mathematical alignment
* spacing rhythm over compact density
* calm institutional presentation
* modular stabilization
* surgical refinement
* layout predictability

If layout becomes unstable:

DO NOT aggressively rewrite containers first.

Instead evaluate:

* invisible spacer balancing
* relative positioning
* flex rhythm
* optical compensation
* local safe-zone stabilization

Institutional dashboards require optical balancing, not just technically valid alignment.

---

# Current Architecture Philosophy

Dashboard should function as:

high-level command center.

Trades page should function as:

execution review terminal.

Architecture separation is intentional.

Dashboard responsibilities:

* KPIs
* analytics snapshots
* calendar systems
* performance overview
* recent activity

Trades page responsibilities:

* execution history
* filtering
* search
* review workflows
* tagging
* screenshots
* exports
* future execution analytics

---

# Current Development Priority

## Priority Phase:

Trade Search + Filtering Architecture

Next development focus:

* search bar system
* trade filtering toolbar
* account filtering
* ticker filtering
* status filtering
* asset-type filtering
* scalable table state architecture

---

# Future Planned Systems

## Future Analytics Systems

Planned:

* advanced execution analytics
* expectancy calculations
* equity curve engine
* session analytics
* setup analytics
* behavior analytics
* consistency scoring
* AI trade review engine

---

## Future Database Architecture

Planned:

* Prisma integration
* SQLite local database
* PostgreSQL migration
* Supabase sync
* cloud persistence
* authentication layer
* multi-device sync
* user portfolios

---

## Future Broker Adapter Layer

Planned:

* Tradovate parser
* NinjaTrader parser
* TradeStation parser
* ThinkOrSwim parser
* broker abstraction architecture
* normalized ingestion pipelines

---

# Open Trade Architecture

Elite X supports open positions.

Trade status system:

```ts
"WIN"
"LOSS"
"BREAKEVEN"
"OPEN"
```
