============================================================
ELITE X TRADING JOURNAL
MANUAL ENTRY — MASTER ROADMAP
============================================================

DOCUMENT STATUS
------------------------------------------------------------

Purpose:
Build a complete, production-ready, future-proof Manual Entry
system for Elite X.

Current priority:
Make Manual Entry capable of recording essentially every
normal trading execution sequence without modifying or
compromising the existing broker-sync, execution ledger,
FIFO, trade reconstruction, reconciliation, P&L, analytics,
or dashboard infrastructure.

Core principle:

MANUAL ENTRY IS AN EXECUTION PRODUCER.

The Manual Entry UI does NOT create trades directly.

It creates normalized executions.

The existing trading engine reconstructs positions/trades
from those executions.

============================================================
1. CORE ARCHITECTURE
============================================================

                         MANUAL ENTRY
                              │
                              ▼
                       ADD EXECUTION
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   BUY                 SELL
                    │                   │
                    └─────────┬─────────┘
                              ▼
                  NORMALIZED EXECUTION
                              │
                              ▼
                     EXECUTION LEDGER
                              │
                              ▼
                         FIFO ENGINE
                              │
                              ▼
                    TRADE RECONSTRUCTION
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              OPEN         PARTIAL       CLOSED
            POSITION        EXIT          TRADE
                 │            │            │
                 └────────────┴────────────┘
                              ▼
                         P&L / R
                              │
                              ▼
                   TRADE HISTORY / DETAILS
                              │
                              ▼
                    ANALYTICS / DASHBOARD


IMPORTANT:

We do NOT create a separate Manual FIFO engine.

We do NOT create a separate Manual Trade engine.

We do NOT bypass the existing trading engine.

Manual executions must eventually flow through the same
canonical execution/FIFO/reconstruction infrastructure.

============================================================
2. SOURCE OF TRUTH
============================================================

Elite X remains execution-first.

Canonical hierarchy:

BROKER / USER
      ↓
NORMALIZED EXECUTIONS
      ↓
EXECUTION LEDGER
      ↓
FIFO
      ↓
RECONSTRUCTED TRADES
      ↓
ANALYTICS / DASHBOARD


Executions are canonical.

Trades are derived state.

The Manual Entry system must follow the same philosophy.

============================================================
3. MANUAL VS BROKER DATA BOUNDARY
============================================================

Manual Entry must never interfere with broker-synced data.

Conceptually:

Execution
├── source = BROKER
│
└── source = MANUAL


Manual Entry operates only on:

source = MANUAL


Example:

User has:

BROKER
AAPL
100 shares

and:

MANUAL
AAPL
50 shares


A Manual SELL of 50 AAPL must affect:

MANUAL
50 shares remaining

and must NEVER consume:

BROKER
100 shares


The UI must filter appropriately.

More importantly, the data model / execution identity must
preserve the boundary.

UI filtering alone is NOT considered sufficient protection.

============================================================
4. ACCOUNT / POSITION IDENTITY
============================================================

Never identify a position only by:

user_id + ticker


Position identity must preserve the relevant trading context.

Conceptually:

user
+
source
+
account
+
instrument / contract
+
relevant contract identity


This prevents:

Manual AAPL
and
IBKR AAPL

from accidentally becoming the same position.

This is critical for future multi-account architecture.

============================================================
5. CURRENT IMPLEMENTATION — COMPLETE TRADE
============================================================

CURRENT STATUS:

WORKING.

The current Basic Add Trade supports:

- Ticker
- Quantity
- Entry Price
- Exit Price
- Commission
- Long / Short
- Asset Type
- Account
- Trade Date
- Entry Time
- Exit Time
- Currency
- Exchange
- Manual lifecycle identity
- Normalized executions
- Manual contract key
- Execution ledger insertion
- Existing FIFO reconstruction

Current lifecycle:

BUY + SELL
      ↓
2 normalized executions
      ↓
execution ledger
      ↓
FIFO
      ↓
closed trade


For SHORT:

SELL + BUY
      ↓
2 normalized executions
      ↓
execution ledger
      ↓
FIFO
      ↓
closed short trade


Options multiplier:

OPTIONS = 100

All other currently supported asset types:

multiplier = 1


This current implementation is considered the working
foundation.

DO NOT unnecessarily rewrite it.

============================================================
6. CURRENT EDIT / DELETE SYSTEM
============================================================

Edit Trade and Delete Trade are currently working for
manual trades.

Current rule:

Only MANUAL trades may be edited/deleted through the Manual
Trade workflow.

Existing Edit/Delete behavior is NOT the current priority.

DO NOT redesign or rewrite Edit Trade / Delete Trade during
the next Manual Entry expansion unless required for a
specific compatibility issue.

Future improvements can be handled after the Manual Entry
system itself is complete.

============================================================
7. MAIN OBJECTIVE
============================================================

Expand the current Basic Complete Trade into a complete
Manual Execution Entry system.

The system must be able to represent:

1. Complete trades
2. Buy-only entries
3. Sell-only entries
4. Long positions
5. Short positions
6. Multiple entries
7. Multiple partial exits
8. Partial entries
9. Partial exits
10. Positions remaining open
11. Positions becoming fully closed
12. Multiple executions across different dates
13. Multiple executions across different times
14. FIFO reconstruction
15. Correct realized P&L
16. Correct remaining position
17. Correct trade history
18. Correct trade details / activity timeline


The objective is:

ANY NORMAL MANUAL TRADING ACTIVITY
        ↓
CAN BE RECORDED
        ↓
WITHOUT CORRUPTING THE TRADING ENGINE

============================================================
8. MANUAL ENTRY TRADE TYPES
============================================================

The UI should eventually support three primary entry modes.

------------------------------------------------------------
A. COMPLETE TRADE
------------------------------------------------------------

Meaning:

Both entry and exit are being recorded.

Example:

BUY
50 AAPL
$200
Aug 28
10:15 AM

SELL
50 AAPL
$210
Sep 04
11:20 AM


Result:

CLOSED TRADE


The UI shows:

ENTRY
- Date
- Time
- Quantity
- Price

EXIT
- Date
- Time
- Quantity
- Price

COSTS
- Fees
- Currency
- Exchange
- Notes


------------------------------------------------------------
B. PARTIAL ENTRY
------------------------------------------------------------

Meaning:

The user is recording an opening/additional execution only.

Example:

BUY
50 AAPL
$200
Aug 28
10:15 AM


Result:

OPEN POSITION

+50 AAPL


No exit fields should be required.

The user can later add another execution.

Example:

BUY
50 AAPL
$205
Sep 04
11:20 AM


Result:

OPEN POSITION

+100 AAPL


FIFO will eventually use these executions when exits are
recorded.


------------------------------------------------------------
C. PARTIAL EXIT
------------------------------------------------------------

Meaning:

The user is recording a closing/reducing execution only.

Example:

Existing manual position:

+100 AAPL


User records:

SELL
50 AAPL
$210
Sep 10
2:00 PM


Result:

50 shares realized

50 shares remain open.


Later:

SELL
50 AAPL
$220
Sep 15
2:00 PM


Result:

Position fully closed.


The UI should clearly communicate that this execution is
reducing/closing an existing manual position.

============================================================
9. BUY / SELL SEMANTICS
============================================================

The system must not assume BUY always means entry.

The meaning depends on position direction.

------------------------------------------------------------
LONG
------------------------------------------------------------

BUY = OPEN / ADD

SELL = REDUCE / CLOSE


Example:

BUY 100
SELL 40
SELL 60


Result:

OPEN
   ↓
PARTIAL EXIT
   ↓
FINAL EXIT
   ↓
CLOSED


------------------------------------------------------------
SHORT
------------------------------------------------------------

SELL = OPEN / ADD

BUY = REDUCE / CLOSE


Example:

SELL 100
BUY 40
BUY 60


Result:

OPEN SHORT
   ↓
PARTIAL EXIT
   ↓
FINAL EXIT
   ↓
CLOSED


The FIFO engine remains responsible for determining the
actual reconstructed lifecycle.

============================================================
10. MULTIPLE ENTRIES
============================================================

Must support averaging / multiple entry executions.

Example:

BUY
50 AAPL @ $200
Aug 28

BUY
50 AAPL @ $205
Sep 04


Current position:

100 shares


FIFO / reconstruction must preserve the actual executions.

The system should NOT simply destroy the execution history
and replace it with:

100 @ $202.50


The average price can be calculated for display.

The underlying executions remain canonical.

Display:

ENTRY EXECUTIONS

50 @ $200
50 @ $205

Average Entry:
$202.50


Then:

SELL
100 @ $220


The reconstructed trade can display:

Average Entry:
$202.50

Exit:
100 @ $220


while the Activity / Timeline displays all individual
executions.

============================================================
11. MULTIPLE PARTIAL EXITS
============================================================

Must support:

BUY 100 @ $200

SELL 25 @ $210

SELL 25 @ $215

SELL 50 @ $220


Result:

25 shares realized
25 shares realized
50 shares realized


Total:

100 shares closed


Trade Details should show:

BUY
100 @ $200

SELL (PARTIAL)
25 @ $210

SELL (PARTIAL)
25 @ $215

SELL (FINAL)
50 @ $220


The user should see ONE reconstructed lifecycle rather than
three unrelated trades.

============================================================
12. PARTIAL ENTRY + PARTIAL EXIT COMBINATIONS
============================================================

Must support complex but normal sequences.

Example:

BUY 50 @ $200
BUY 50 @ $205
SELL 25 @ $210
BUY 25 @ $208
SELL 100 @ $215


The system must not make assumptions based on the UI.

Every action becomes an execution.

FIFO reconstructs the lifecycle.

This is one of the primary reasons Manual Entry must be
execution-first.

============================================================
13. OPEN POSITIONS
============================================================

A trade does not need an exit at creation time.

Example:

BUY
50 AAPL
$200


Result:

OPEN POSITION

+50 AAPL


Trade History should be capable of displaying:

OPEN

Position:
+50 Shares

Average Entry:
$200


No realized P&L should be reported until the relevant
quantity is closed.

Unrealized P&L is a separate future/current-market-data
concern and must not be fabricated from the manual entry.

============================================================
14. OPEN SHORT POSITIONS
============================================================

Example:

SELL
50 AAPL
$200


Result:

OPEN SHORT

-50 AAPL


Later:

BUY
50 AAPL
$180


Result:

CLOSED

Realized P&L:

+$1,000 before applicable fees.


The same FIFO infrastructure should reconstruct this.

============================================================
15. MULTIPLE OPEN POSITIONS
============================================================

The system must support multiple manual positions at once.

Example:

AAPL
+100

NVDA
+50

TSLA
-25


Each position must remain independent.

Instrument identity must be preserved.

============================================================
16. MULTIPLE ACCOUNTS
============================================================

Manual positions must remain isolated by account.

Example:

Manual Account A
AAPL +100

Manual Account B
AAPL +50


These must NOT become:

AAPL +150


unless the architecture explicitly defines them as the same
position context.

Default rule:

ACCOUNT BOUNDARY MUST BE PRESERVED.

============================================================
17. BROKER + MANUAL SAME SYMBOL
============================================================

Example:

IBKR Margin:
AAPL +100

Manual Account:
AAPL +50


Manual SELL 25 AAPL:

Must affect:

Manual Account
+25 remaining


IBKR remains:

+100


Manual Entry must never consume broker inventory.

This must be tested explicitly.

============================================================
18. DATE / TIME MODEL
============================================================

Complete Trade currently uses one trade date.

The advanced system must support:

ENTRY DATE
ENTRY TIME

and independently:

EXIT DATE
EXIT TIME


Example:

Entry:
Aug 28, 2026
10:15 AM


Exit:
Sep 04, 2026
11:20 AM


This is required.

The UI must NOT assume entry and exit occur on the same day.

The canonical execution timestamp should be generated from:

date + time


Each execution gets its own timestamp.

============================================================
19. CHRONOLOGICAL ORDER
============================================================

Executions must be ordered by their actual execution
timestamp.

Example:

Aug 28
BUY 50

Sep 02
BUY 50

Sep 05
SELL 25

Sep 10
SELL 75


The timeline must reflect this order.

The system must validate impossible sequences where appropriate.

Example:

An exit cannot close a position that does not exist in the
same manual position context.

This validation must be handled carefully so legitimate
short-selling sequences remain possible.

============================================================
20. QUANTITY RULES
============================================================

Quantity must be:

> 0

Must be numeric.

Must be finite.

No negative quantity.

The action determines direction.

Do NOT represent:

BUY -50


Instead:

SELL 50


The UI should make this intuitive.

============================================================
21. PRICE RULES
============================================================

Execution prices must be:

> 0

Must be finite.

Must support appropriate precision.

Do not unnecessarily hard-code everything to two decimal
places at the data layer.

Different instruments may require different precision.

UI display precision can be instrument-aware later.

============================================================
22. FEES / COMMISSIONS
============================================================

Current Complete Trade implementation splits total
commission across entry and exit executions.

Example:

Total fees:
$5

Entry:
$2.50

Exit:
$2.50


This is acceptable for the current Complete Trade model.

Future Manual Entry must support fees on individual
executions.

Example:

BUY 50
Fee $1

BUY 50
Fee $1.25

SELL 50
Fee $1

SELL 50
Fee $1.75


Total:

$5


This is more accurate than forcing all fees into a single
trade-level value.

The execution ledger remains the canonical fee source.

============================================================
23. CURRENCY
============================================================

Currency is execution-level information.

Current implementation supports a limited currency list.

This must eventually be expanded carefully.

Do NOT arbitrarily reject legitimate currencies.

The long-term approach should use a controlled currency
definition / ISO-style currency code model.

Examples:

USD
CAD
EUR
GBP
JPY
INR
etc.


Current GBP issue:

The current validation rejects GBP because GBP is not in the
current supported list.

This is a validation limitation, NOT an architectural
problem.

It should be corrected as part of the currency expansion
phase.

============================================================
24. FEE CURRENCY
============================================================

Execution structure already supports:

currency

and:

feeCurrency


For now Manual Entry can default:

feeCurrency = currency


Future versions can allow fees to be represented in a
different currency if required.

Do not complicate the initial UI unnecessarily.

============================================================
25. ASSET TYPES
============================================================

Manual Entry should support the existing asset categories:

STOCKS
OPTIONS
FUTURES
CRYPTO
CFD
FOREX


The UI should use a controlled asset-type selector.

The backend should normalize asset type.

Example:

stocks
Stocks
STOCKS


must become:

STOCKS


============================================================
26. MULTIPLIERS
============================================================

Current rule:

OPTIONS = 100

Everything else currently:

1


This must remain centralized.

Do not duplicate multiplier calculations throughout the UI.

Ideal architecture:

Asset Type
     ↓
Multiplier Resolver
     ↓
Execution


The UI should not become the source of truth for financial
multipliers.

Future instrument-specific multipliers can be supported
without rewriting the Manual Entry system.

============================================================
27. INSTRUMENT INFORMATION
============================================================

Current Basic Entry uses:

Ticker
Asset Type
Exchange
Currency


Future-proof Manual Entry should eventually support a more
complete instrument identity.

Conceptually:

Instrument
├── symbol
├── contract
├── contractKey
├── assetType
├── exchange
├── currency
├── multiplier
└── instrument-specific metadata


Do not break the existing execution model while expanding
this.

============================================================
28. NOTES
============================================================

Manual Entry should eventually support optional trade/execution
notes.

Example:

"Entered after breakout confirmation."

For multiple executions, we may eventually need:

Execution note

and/or:

Trade-level note


Important:

Notes are metadata.

They must never alter trading calculations.

============================================================
29. MANUAL ENTRY UI — FINAL DESIGN DIRECTION
============================================================

The selected design direction is the premium dark Elite X
interface.

Visual language:

- Dark navy / near-black background
- Premium glass/card surfaces
- Purple primary accent
- Green for BUY / positive
- Red for SELL / negative
- Rounded cards
- Strong hierarchy
- Minimal visual clutter
- Clear section numbering
- Professional fintech appearance
- Responsive layout
- Desktop-first but responsive

The selected overall concept:

LEFT / CENTER:
Manual Entry form

RIGHT:
Live Trade Preview


The right-side preview is important because it allows the
user to understand what will be recorded before saving.

============================================================
30. MANUAL ENTRY UI STRUCTURE
============================================================

Recommended structure:

HEADER

Add Trade
MANUAL ENTRY

"Record trading activity in your journal."


STEP 1
Select Trade Type

[ COMPLETE TRADE ]
Has both entry and exit

[ PARTIAL ENTRY (BUY) ]
Entry only

[ PARTIAL EXIT (SELL) ]
Exit only


STEP 2
Trade Direction

[ BUY ]
Open / Add to position

[ SELL ]
Close / Reduce / Short


STEP 3
Instrument

Symbol
Asset Type

Potential future:

Exchange
Currency


STEP 4
Trade Details

Dynamic based on selected trade type.


STEP 5
Costs & Other Details

Fees / Commission
Currency
Exchange
Notes


RIGHT SIDE:

Trade Preview
Position Summary
Financial Summary
Trade Timeline
Account / Instrument information


============================================================
31. DYNAMIC FORM BEHAVIOR
============================================================

The UI must NOT show irrelevant fields.

------------------------------------------------------------
COMPLETE TRADE
------------------------------------------------------------

Show:

ENTRY
- Date
- Time
- Price
- Quantity

EXIT
- Date
- Time
- Price
- Quantity

COSTS
- Fees
- Currency
- Exchange
- Notes


------------------------------------------------------------
PARTIAL ENTRY
------------------------------------------------------------

Show only:

ENTRY
- Date
- Time
- Price
- Quantity

COSTS
- Fees
- Currency
- Exchange
- Notes


No exit fields.

Preview should say:

OPEN POSITION

or:

POSITION IMPACT


------------------------------------------------------------
PARTIAL EXIT
------------------------------------------------------------

Show:

EXIT
- Date
- Time
- Price
- Quantity

COSTS
- Fees
- Currency
- Exchange
- Notes


The UI should identify the position being reduced/closed.

============================================================
32. RIGHT-SIDE TRADE PREVIEW
============================================================

The preview should update live.

Example:

AAPL
Apple Inc.

BUY

COMPLETE TRADE

Total P&L
+$1,500

Return
+7.50%


Position Summary

Quantity
100 Shares

Avg Entry
$200

Avg Exit
$215

Fees
$5


Timeline:

BUY
100 Shares @ $200
Apr 28
10:15 AM

SELL
100 Shares @ $215
May 11
2:15 PM


The preview is informational.

It must not become a second calculation engine.

Financial calculations should use shared deterministic
calculation logic.

============================================================
33. PREVIEW FOR OPEN POSITION
============================================================

Example:

BUY
50 AAPL
$200


Preview:

OPEN

Position:
+50 Shares

Avg Entry:
$200


Timeline:

BUY
50 Shares @ $200

No realized P&L.

No fake exit.

Message:

"This position will remain open until an exit is added."


============================================================
34. PREVIEW FOR PARTIAL EXIT
============================================================

Existing:

+100 AAPL


User enters:

SELL
40 @ $210


Preview:

PARTIAL EXIT

Position Impact:
40 Shares Closed

Remaining Position:
60 Shares


Realized P&L:
calculated from FIFO


This is important because the user should understand the
impact before saving.

============================================================
35. REVIEW BEFORE SAVE
============================================================

For advanced Manual Entry, consider:

FORM
  ↓
LIVE PREVIEW
  ↓
REVIEW
  ↓
SAVE EXECUTION(S)


The Review step should show exactly what will be written.

Example:

Execution 1
BUY
50 AAPL
$200
Aug 28
10:15 AM
Fee $1

Execution 2
SELL
50 AAPL
$210
Sep 04
11:20 AM
Fee $1


Then:

[Cancel]

[Save Trade]


The system should never save partially validated data.

============================================================
36. VALIDATION ARCHITECTURE
============================================================

Validation should exist at multiple levels.

------------------------------------------------------------
LEVEL 1 — UI VALIDATION
------------------------------------------------------------

Immediate feedback.

Examples:

Missing ticker
Missing quantity
Invalid price
Missing date
Invalid time


------------------------------------------------------------
LEVEL 2 — DOMAIN VALIDATION
------------------------------------------------------------

Manual execution creation must validate the canonical rules.

Examples:

quantity > 0
price > 0
valid side
valid asset type
valid currency
valid timestamp


------------------------------------------------------------
LEVEL 3 — POSITION / EXECUTION VALIDATION
------------------------------------------------------------

Before creating a closing execution:

Does the relevant manual position exist?

Is there enough quantity to close?

Does the requested action make sense?

For example:

Existing:
+50 AAPL

Attempt:

SELL 100 AAPL


The system must not silently create an impossible state.

The user should receive a clear error.

============================================================
37. OVER-CLOSING
============================================================

Example:

Position:

+50 AAPL


User attempts:

SELL 100


Default behavior:

Reject.

Message:

"You only have 50 shares available to close in this
manual position."


Do NOT silently convert the extra 50 into a short unless the
user explicitly selected a workflow that allows crossing
through zero / opening a short.

============================================================
38. CROSSING THROUGH ZERO
============================================================

This is an advanced edge case.

Example:

Current:

+50 AAPL


User enters:

SELL 100


Mathematically this can become:

50 shares closed
50 shares short


However, this should NOT happen accidentally.

For the initial complete Manual Entry system:

RECOMMENDED:

Reject over-closing.

Future version may support:

Close existing position
+
automatically open opposite position


but only with explicit UX and deterministic handling.

============================================================
39. FIFO
============================================================

The existing FIFO engine remains authoritative.

Manual Entry must not implement its own FIFO logic.

Example:

BUY 50 @ $200
BUY 50 @ $205

SELL 75 @ $220


FIFO determines which entry quantities are matched.

The Manual Entry UI should display the resulting calculation,
not independently reproduce FIFO behavior.

============================================================
40. MULTIPLE TRADE LIFECYCLES
============================================================

The system must distinguish between separate lifecycles.

Example:

Trade lifecycle A:

BUY 50
SELL 50


Trade lifecycle B:

BUY 100
SELL 100


They should remain separate reconstructed trades where the
existing FIFO architecture determines they are separate
lifecycles.

Manual lifecycle identifiers must not accidentally merge
unrelated manual trades.

============================================================
41. CONTRACT KEY
============================================================

Current Manual Entry uses:

MANUAL-{ticker}-{uuid}


This is useful for ensuring a manual lifecycle is uniquely
identified.

However:

Do not allow contractKey alone to become the complete
business identity of a position.

Future-proof identity must preserve:

user
+
source
+
account
+
instrument
+
execution context


Contract keys remain implementation identifiers.

============================================================
42. EXECUTION IDS
============================================================

Every manually created execution must have a unique ID.

Current model:

manual-{lifecycleId}-entry
manual-{lifecycleId}-exit


This is acceptable for the current two-execution Complete
Trade.

As Manual Entry becomes execution-based, each individual
execution must independently receive a unique canonical ID.

============================================================
43. ATOMIC SAVE
============================================================

Future Manual Entry saves should be treated as a single
logical operation.

Example:

Complete Trade:

Execution A
+
Execution B


Both should succeed.

Or:

Neither should be committed.


We must avoid:

Execution A saved
Execution B failed


leaving a broken lifecycle.

The production implementation should use an appropriate
transactional / server-side persistence mechanism.

Do not rely on the browser performing multiple independent
database writes and assuming they will always succeed.

============================================================
44. ERROR HANDLING
============================================================

Do not expose raw technical errors to users.

Bad:

"insert row violates foreign key constraint..."


Better:

"Unable to save this trade. Please try again."


Technical details should be logged for debugging.

The UI should remain understandable.

============================================================
45. DUPLICATE SUBMISSION PROTECTION
============================================================

Manual Entry must eventually protect against accidental
double-click / duplicate submission.

Example:

User clicks:

[Save Trade]

twice.


The same execution must NOT be inserted twice.

Use:

- Disabled save state
- Loading state
- Idempotency strategy where appropriate
- Unique execution identity


This becomes particularly important as the system scales.

============================================================
46. DATE / TIMEZONE
============================================================

Manual Entry timestamps must be handled carefully.

The user may enter:

Date:
Aug 28

Time:
10:15 AM


The system must not accidentally shift the execution to
another calendar day because of browser/server timezone
conversion.

Canonical timestamp handling must be explicitly defined.

This is especially important for:

- Day boundaries
- Overnight positions
- Futures
- Forex
- International users


Do not rely on implicit JavaScript Date conversions.

============================================================
47. OVERNIGHT TRADES
============================================================

Must support:

Entry:
Aug 28
10:15 PM


Exit:
Aug 29
2:15 AM


The system must recognize this as a valid multi-day lifecycle.

Duration should be calculated from actual timestamps.

============================================================
48. WEEKEND / HOLIDAY DATES
============================================================

Manual Entry should not automatically reject weekends or
holidays.

Manual entry exists partly because users may need to record
data that does not come from a broker sync.

Any market-calendar validation should be informational unless
there is a strong reason to block the entry.

============================================================
49. ASSET-SPECIFIC BEHAVIOR
============================================================

The common execution model should remain consistent.

However, asset-specific rules may eventually be added.

Examples:

STOCKS
- Shares
- Multiplier 1

OPTIONS
- Contracts
- Multiplier 100

FUTURES
- Contract-specific multiplier may eventually be required

FOREX
- Unit / lot semantics may differ

CRYPTO
- Fractional quantity may be required

CFD
- Instrument-specific behavior


IMPORTANT:

Do not hard-code every asset-specific rule into the UI.

Create centralized domain logic where possible.

============================================================
50. FRACTIONAL QUANTITIES
============================================================

Future Manual Entry should consider fractional quantity.

Example:

0.25 BTC

1.5 shares


Do not assume every instrument requires integer quantity.

Validation should be instrument-aware eventually.

============================================================
51. DECIMAL PRECISION
============================================================

Do not assume:

quantity = integer

price = 2 decimals


Different markets require different precision.

The database/domain model should preserve sufficient numeric
precision.

Display formatting can be handled separately.

============================================================
52. P&L
============================================================

P&L must remain deterministic.

For LONG:

(exitPrice - entryPrice)
× quantity
× multiplier
- fees


For SHORT:

(entryPrice - exitPrice)
× quantity
× multiplier
- fees


For multiple entries/exits:

DO NOT manually calculate using a simple average if FIFO is
required.

The existing FIFO engine must determine realized P&L.

Manual Entry should only produce executions.

============================================================
53. REALIZED VS UNREALIZED P&L
============================================================

OPEN position:

No realized P&L.


PARTIAL EXIT:

Realized P&L for the closed quantity.


Remaining quantity:

Still open.


FINAL EXIT:

Remaining quantity becomes realized.


This distinction must remain consistent throughout:

Trade History
Trade Details
Analytics
Dashboard

============================================================
54. R MULTIPLE
============================================================

Current project supports R-multiple concepts.

Manual Entry should not invent an R value without the required
risk information.

Initially:

P&L can be calculated.

R-multiple should only be calculated when the required risk
data exists.

Future:

Entry
Stop Loss
Risk
Exit
P&L
R Multiple


This belongs to a future enhancement once the base Manual
Entry execution system is stable.

============================================================
55. TRADE HISTORY
============================================================

Trade History should display reconstructed trades, not raw
execution rows as separate trades.

Example:

BUY 50
BUY 50
SELL 25
SELL 75


Trade History should be capable of displaying:

AAPL
100 Shares
CLOSED
P&L
Duration


Clicking the trade opens Trade Details.

Trade Details shows the underlying Activity / Timeline.

============================================================
56. TRADE DETAILS
============================================================

Trade Details should eventually show:

Header:

AAPL
Apple Inc.
Status
Total P&L
Return


Summary:

Side
Quantity
Avg Entry
Avg Exit
Entry Value
Exit Value
Fees
Realized P&L


Activity:

BUY
50 @ $200

BUY
50 @ $205

SELL (PARTIAL)
25 @ $210

SELL (FINAL)
75 @ $220


This gives the user a clean high-level trade while preserving
the full execution history.

============================================================
57. OPEN POSITION DETAILS
============================================================

For an open position:

AAPL

OPEN

Position:
+100 Shares

Avg Entry:
$202.50


Activity:

BUY
50 @ $200

BUY
50 @ $205


No final exit should be fabricated.

============================================================
58. PARTIAL TRADE DETAILS
============================================================

Example:

BUY 100
SELL 40


Trade Details:

Status:
OPEN


Original Quantity:
100

Closed:
40

Remaining:
60


Activity:

BUY
100 @ $200

SELL (PARTIAL)
40 @ $210


This is one lifecycle.

============================================================
59. USER EXPERIENCE PRINCIPLE
============================================================

The user should NOT need to understand:

FIFO
NormalizedExecution
Execution Ledger
Contract Key
Reconstruction


The UI should communicate in trader language.

Instead of:

"Create normalized execution"


say:

"Add Trade"


Instead of:

"Execution lifecycle"


say:

"Position Activity"


Instead of:

"FIFO allocation"


say:

"Realized P&L"


The complexity stays in the architecture.

============================================================
60. UI SHOULD GUIDE THE USER
============================================================

Manual Entry should prevent confusion rather than expose
every possible technical concept.

Example:

Trade Type:

Complete Trade
Partial Entry
Partial Exit


Direction:

BUY
SELL


The UI dynamically changes based on the selection.

This makes the system powerful without making it complicated.

============================================================
61. IMPLEMENTATION STRATEGY
============================================================

We will implement this incrementally.

DO NOT build everything at once.

Use controlled phases.

------------------------------------------------------------
PHASE 0 — CURRENT FOUNDATION
------------------------------------------------------------

STATUS:
COMPLETE / WORKING

Current:

Complete Trade
BUY + SELL
LONG + SHORT
Normalized executions
Execution ledger
FIFO
Manual lifecycle
Manual edit/delete


DO NOT destabilize this.

------------------------------------------------------------
PHASE 1 — UI FOUNDATION
------------------------------------------------------------

Build the final premium Manual Entry UI.

Implement:

- Trade Type selector
- Buy / Sell selector
- Instrument section
- Dynamic fields
- Entry date
- Entry time
- Exit date
- Exit time
- Quantity
- Price
- Fees
- Currency
- Exchange
- Notes
- Right-side live preview
- Validation states
- Save state


Do this before changing the deeper execution logic.

Reason:

The UI becomes the controlled interface through which we
test each execution scenario.

------------------------------------------------------------
PHASE 2 — BUY-ONLY / OPEN POSITION
------------------------------------------------------------

Implement:

BUY only


Example:

BUY 50 AAPL @ $200


Result:

OPEN POSITION


Verify:

- Execution saved
- FIFO reconstructs position
- Trade History shows OPEN
- Position quantity correct
- No realized P&L
- Trade Details correct

------------------------------------------------------------
PHASE 3 — SELL-ONLY / SHORT POSITION
------------------------------------------------------------

Implement:

SELL only


Example:

SELL 50 AAPL @ $200


Result:

OPEN SHORT


Verify:

- Correct sign
- Correct position
- Correct FIFO behavior
- Correct Trade History
- Correct Details

------------------------------------------------------------
PHASE 4 — PARTIAL EXIT
------------------------------------------------------------

Start with:

BUY 100


Then:

SELL 40


Verify:

- 40 realized
- 60 remaining
- One lifecycle
- Correct P&L
- Correct timeline
- Correct status

------------------------------------------------------------
PHASE 5 — FINAL EXIT
------------------------------------------------------------

Continue:

SELL 60


Verify:

- Position = 0
- Trade = CLOSED
- Correct total P&L
- Correct fees
- Correct duration
- Correct final activity

------------------------------------------------------------
PHASE 6 — MULTIPLE ENTRIES
------------------------------------------------------------

Implement:

BUY
BUY
BUY


Verify:

- Correct aggregate position
- Correct average entry display
- Original executions preserved
- FIFO remains authoritative

------------------------------------------------------------
PHASE 7 — MULTIPLE PARTIAL EXITS
------------------------------------------------------------

Implement:

BUY
SELL
SELL
SELL


Verify:

- Partial status
- Final status
- Realized P&L per matched quantity
- Total P&L
- Correct timeline

------------------------------------------------------------
PHASE 8 — COMPLEX SEQUENCES
------------------------------------------------------------

Test:

BUY
BUY
SELL
BUY
SELL
SELL


Then:

SELL
SELL
BUY
BUY


Verify both long and short workflows.

------------------------------------------------------------
PHASE 9 — ACCOUNT / SOURCE ISOLATION
------------------------------------------------------------

Test:

Manual AAPL
Broker AAPL


Verify manual actions never touch broker executions.

Test:

Manual Account A
Manual Account B


Verify account isolation.

------------------------------------------------------------
PHASE 10 — DATA VALIDATION
------------------------------------------------------------

Implement comprehensive validation.

Test:

- Missing ticker
- Missing account
- Missing quantity
- Zero quantity
- Negative quantity
- Invalid price
- Zero price
- Invalid date
- Invalid time
- Invalid currency
- Invalid asset type
- Over-closing
- Invalid position context
- Duplicate submission

------------------------------------------------------------
PHASE 11 — CURRENCY / INSTRUMENT EXPANSION
------------------------------------------------------------

Expand:

GBP
AUD
CHF
etc.


Move toward controlled currency definitions.

Improve:

- Currency validation
- Precision
- Asset-specific rules
- Multipliers

------------------------------------------------------------
PHASE 12 — ATOMIC PERSISTENCE
------------------------------------------------------------

Harden save architecture.

Goal:

Either all required executions are saved
OR
none are saved.

No partial lifecycle writes.

Add:

- Server-side validation
- Transactional persistence
- Duplicate protection
- Idempotency where appropriate

------------------------------------------------------------
PHASE 13 — TIMEZONE HARDENING
------------------------------------------------------------

Test:

Same-day trade
Overnight trade
Different timezone
DST transition
International user


Ensure execution timestamps remain correct.

------------------------------------------------------------
PHASE 14 — TRADE DETAILS / ACTIVITY
------------------------------------------------------------

Ensure Trade Details accurately represents:

- Multiple entries
- Partial exits
- Final exits
- Open positions
- Short positions
- Fees
- P&L
- Duration
- Timeline

------------------------------------------------------------
PHASE 15 — FINAL INTEGRATION
------------------------------------------------------------

Verify:

Manual Entry
     ↓
Executions
     ↓
FIFO
     ↓
Trades
     ↓
Trade History
     ↓
Trade Details
     ↓
Analytics
     ↓
Dashboard


No separate Manual calculations should contradict the
canonical trading engine.

============================================================
62. TEST MATRIX
============================================================

Before declaring Manual Entry complete, test at minimum:

TEST 1
BUY 100
Result:
OPEN LONG 100


TEST 2
SELL 100
Result:
OPEN SHORT 100


TEST 3
BUY 100
SELL 100
Result:
CLOSED LONG


TEST 4
SELL 100
BUY 100
Result:
CLOSED SHORT


TEST 5
BUY 100
SELL 40
Result:
OPEN LONG 60


TEST 6
BUY 100
SELL 40
SELL 60
Result:
CLOSED


TEST 7
BUY 50
BUY 50
SELL 100
Result:
CLOSED


TEST 8
BUY 100
SELL 25
SELL 25
SELL 50
Result:
CLOSED


TEST 9
SELL 100
BUY 25
BUY 75
Result:
CLOSED SHORT


TEST 10
BUY 50
BUY 50
SELL 25
BUY 25
SELL 100
Result:
Correct FIFO reconstruction


TEST 11
Manual AAPL 100
Broker AAPL 100
Manual SELL 50

Result:
Manual 50
Broker 100


TEST 12
Manual Account A AAPL 100
Manual Account B AAPL 100
Sell from A

Result:
Account A changes
Account B unchanged


TEST 13
BUY Aug 28
SELL Sep 04

Result:
Correct multi-day lifecycle


TEST 14
BUY 10:00 PM
SELL 2:00 AM next day

Result:
Correct overnight lifecycle


TEST 15
OPTIONS

Verify:

multiplier = 100


TEST 16
GBP

Verify:

currency accepted after currency expansion.


============================================================
63. WHAT WE WILL NOT DO DURING THIS PROJECT
============================================================

Do NOT:

- Rewrite the existing FIFO engine
- Create a second FIFO engine
- Create a separate Manual Trade database
- Modify broker-sync logic unnecessarily
- Modify broker execution behavior
- Merge broker and manual positions
- Change canonical execution architecture
- Rewrite Dashboard V2
- Rewrite analytics unnecessarily
- Redesign Edit Trade
- Redesign Delete Trade
- Introduce subscription enforcement into Manual Entry
- Add unnecessary complexity before the core workflow works


The Manual Entry project is addition-first.

============================================================
64. FUTURE ENHANCEMENTS — NOT CURRENT PRIORITY
============================================================

These can come later:

- Stop loss
- Take profit
- Risk amount
- R multiple
- Strategy
- Setup
- Tags
- Emotion
- Screenshot attachment
- Advanced notes
- Trade templates
- Import from CSV
- Bulk manual execution entry
- Drag/drop execution timeline
- Advanced instrument lookup
- Market calendar awareness
- Current market price
- Unrealized P&L
- Corporate actions
- Splits
- Dividends
- Assignment
- Exercise
- Option expiration
- Futures rollover
- Multi-leg options
- Complex strategies


These belong to later versions because they require broader
Elite X architecture.

============================================================
65. IMPORTANT ARCHITECTURAL RULE
============================================================

The Manual Entry project must remain addition-only.

Existing canonical infrastructure:

BROKER SYNC
EXECUTIONS
FIFO
RECONSTRUCTION
RECONCILIATION
P&L
ANALYTICS
DASHBOARD


is protected.

Manual Entry is an additional execution producer.

The target architecture is:

                         EXECUTION LEDGER
                                ▲
                                │
                    ┌───────────┴───────────┐
                    │                       │
                 BROKER                  MANUAL
                    │                       │
                   IBKR                    USER
                    │                       │
                    └───────────┬───────────┘
                                ▼
                              FIFO
                                │
                                ▼
                         RECONSTRUCTED
                            TRADES
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                  OPEN       PARTIAL      CLOSED
                    │           │           │
                    └───────────┴───────────┘
                                │
                                ▼
                         P&L / ANALYTICS
                                │
                                ▼
                       TRADE HISTORY
                                │
                                ▼
                         TRADE DETAILS
                                │
                                ▼
                           DASHBOARD


============================================================
66. FINAL PRODUCT GOAL
============================================================

The final Basic Manual Entry system should allow a user to
record their trading activity even without broker
integration.

A user should be able to manually record:

- Opening a position
- Adding to a position
- Reducing a position
- Completely closing a position
- Opening a short
- Covering a short
- Multiple entries
- Multiple exits
- Different dates
- Different times
- Different quantities
- Different prices
- Fees
- Currency
- Exchange
- Asset types


The user should never need to understand the underlying
execution architecture.

They simply record what happened.

Elite X then turns those executions into:

POSITION
      ↓
TRADE
      ↓
REALIZED P&L
      ↓
R MULTIPLE (when supported)
      ↓
TRADE HISTORY
      ↓
ANALYTICS
      ↓
DASHBOARD


============================================================
67. IMPLEMENTATION PHILOSOPHY
============================================================

BUILD IN THIS ORDER:

1. UI
2. Dynamic form behavior
3. Validation
4. Execution generation
5. Execution persistence
6. FIFO integration
7. Position reconstruction
8. Trade reconstruction
9. Trade History verification
10. Trade Details verification
11. Edge-case testing
12. Persistence hardening
13. Final UX polish


For every phase:

BUILD
  ↓
TEST
  ↓
VERIFY
  ↓
COMMIT
  ↓
MOVE TO NEXT PHASE


Never make large uncontrolled changes across the entire
trading architecture.

============================================================
68. CURRENT CHECKPOINT
============================================================

CURRENTLY WORKING:

[✓] Basic Manual Add Trade UI
[✓] Complete Trade
[✓] BUY
[✓] SELL
[✓] LONG
[✓] SHORT
[✓] Quantity
[✓] Entry Price
[✓] Exit Price
[✓] Commission
[✓] Account
[✓] Asset Type
[✓] Trade Date
[✓] Entry Time
[✓] Exit Time
[✓] Currency
[✓] Exchange
[✓] Manual execution creation
[✓] Manual lifecycle ID
[✓] Manual contract key
[✓] Normalized executions
[✓] Execution ledger
[✓] FIFO reconstruction
[✓] Edit Trade
[✓] Delete Trade


KNOWN CURRENT LIMITATIONS:

[ ] Buy-only / Open Position UI
[ ] Sell-only / Open Short UI
[ ] Partial Exit workflow
[ ] Multiple entry workflow
[ ] Multiple partial exit workflow
[ ] Independent Exit Date
[ ] Advanced dynamic preview
[ ] Full validation
[ ] Currency expansion
[ ] Atomic persistence hardening
[ ] Timezone hardening
[ ] Comprehensive edge-case testing


============================================================
69. NEXT IMMEDIATE STEP
============================================================

DO NOT start by changing the trading engine.

First:

BUILD THE FINAL MANUAL ENTRY UI.

Specifically:

1. Create the premium Add Trade layout.
2. Add Complete Trade / Partial Entry / Partial Exit.
3. Add BUY / SELL.
4. Add dynamic form sections.
5. Add independent Entry Date + Time.
6. Add independent Exit Date + Time.
7. Add Quantity.
8. Add Price.
9. Add Fees.
10. Add Currency.
11. Add Exchange.
12. Add Notes.
13. Build the right-side Trade Preview.
14. Make preview react to form changes.
15. Keep the current working execution-generation logic intact
    until the new UI is ready.

After the UI is stable:

Implement each execution scenario one at a time.

============================================================
70. GOLDEN RULE
============================================================

NEVER THINK:

"How do we create a trade?"

THINK:

"How do we accurately record what the trader did?"

Then:

EXECUTION
    ↓
FIFO
    ↓
RECONSTRUCTED TRADE


That distinction is the foundation of the entire Elite X
Manual Entry architecture.

============================================================
END OF MASTER ROADMAP
============================================================







=================================================
MANUAL ENTRY DEVELOPMENT RULE
=================================================

CURRENT COMPLETE TRADE:
    PROTECTED

CURRENT EDIT:
    PROTECTED

CURRENT DELETE:
    PROTECTED

CURRENT EXECUTION MODEL:
    PROTECTED

CURRENT FIFO ENGINE:
    PROTECTED

CURRENT TRADE RECONSTRUCTION:
    PROTECTED

CURRENT P&L:
    PROTECTED

CURRENT ANALYTICS:
    PROTECTED

NEW WORK:
    ADDITIVE

PHASE 1:
    UI

PHASE 2:
    UI STATE / PREVIEW

PHASE 3:
    COMPLETE TRADE REGRESSION

PHASE 4:
    BUY-ONLY / OPEN POSITION

PHASE 5:
    PARTIAL EXIT

PHASE 6:
    FULL EXIT

PHASE 7:
    SHORT ENTRY

PHASE 8:
    SHORT PARTIAL EXIT

PHASE 9:
    SHORT FULL EXIT

PHASE 10:
    MULTI-ENTRY / MULTI-EXIT

PHASE 11:
    EDGE CASES + VALIDATION

PHASE 12:
    FULL REGRESSION TEST

=================================================