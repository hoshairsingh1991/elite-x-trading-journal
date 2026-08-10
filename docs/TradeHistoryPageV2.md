# ELITE X TRADING JOURNAL
# TRADE HISTORY — PERMANENT MASTER NOTES

============================================================
PURPOSE OF THIS DOCUMENT
============================================================

This document is the permanent reference for the Trade History
page and everything directly connected to it.

It documents:

- Current Trade History architecture
- Canonical execution/trade relationship
- All relevant files
- Supabase execution storage
- IBKR execution parsing
- Trade reconstruction
- Manual Add Trade
- Manual Edit Trade
- Manual Delete Trade
- Trade History toolbar
- Search/filter/reset behavior
- Exchange data addition
- Historical-data behavior
- Production-safety decisions
- Trade History V2 implementation plan
- Future UI direction
- Architectural rules that must not be violated

IMPORTANT:

Trade History is a UI consumer of the canonical trading data model.

It must NOT become a second source of truth.


============================================================
1. CORE ARCHITECTURE
============================================================

Elite X uses the canonical Execution Ledger architecture.

The fundamental rule is:

EXECUTIONS ARE CANONICAL TRUTH.

Trades are reconstructed representations of executions.

The primary pipeline is:

IBKR CSV / IBKR Sync
        ↓
NormalizedExecution[]
        ↓
Supabase executions
        ↓
loadExecutionsFromSupabase()
        ↓
pairTrades()
        ↓
Trade[]
        ↓
Trade History UI


Manual trading workflow:

Manual Trade Input
        ↓
Manual Trade lifecycle
        ↓
Trade data
        ↓
Trade History UI


IMPORTANT:

Broker-derived trades must not be manually modified by the UI
in a way that breaks the execution ledger.

If information originates from broker executions, it belongs to
NormalizedExecution and ultimately the Supabase executions table.

Trade History should consume that data.


============================================================
2. CANONICAL TYPE FILE
============================================================

FILE:

types/trade.ts


This is the central domain type file for Trade History.

It contains:

- TradeSide
- TradeStatus
- TradingSession
- TradeEmotion
- TradeMistake
- NormalizedExecution
- Trade


============================================================
3. TRADE SIDE
============================================================

Current type:

TradeSide =

"LONG"
"SHORT"


This is used by both executions and reconstructed trades.


============================================================
4. TRADE STATUS
============================================================

Current canonical TradeStatus:

"WIN"
"LOSS"
"BREAKEVEN"
"OPEN"


NOTE:

The Trade History toolbar currently has an additional filter:

"EXPIRED_WORTHLESS"

This exists in the UI filter logic, but it is not currently
part of the canonical TradeStatus union shown in types/trade.ts.

Do NOT silently change this during V2.

If Expired Worthless becomes a formal lifecycle/status later,
we should deliberately update the domain model and all dependent
logic together.


============================================================
5. NORMALIZEDEXECUTION
============================================================

FILE:

types/trade.ts


Current important structure:

NormalizedExecution {

  id

  date

  executionTimestamp

  brokerExecutionId?

  ticker

  contract

  contractKey?

  exchange?

  side

  quantity

  executionPrice

  executionValue

  fees

  currency

  feeCurrency?

  account

  assetType

  multiplier
}


IMPORTANT V2 ADDITION:

exchange?: string;


Exchange is intentionally optional.

Reason:

Historical executions may not have exchange data.

We explicitly decided:

IF EXCHANGE DATA EXISTS
    → SHOW THE EXCHANGE

IF EXCHANGE DATA DOES NOT EXIST
    → SHOW "-"


We are NOT going to backfill or modify old trades just to
populate exchange.

Historical missing exchange data is acceptable.


============================================================
6. CANONICAL TRADE OBJECT
============================================================

FILE:

types/trade.ts


Trade contains the reconstructed trade representation.

Important fields include:

Basic information:

ticker
contract
contractKey
side
status
date
strategy
setup
session
assetType
account


Execution:

entryPrice
exitPrice
quantity
riskRewardRatio
stopLoss
takeProfit


Performance:

pnl
pnlPercent
fees
currency
feeCurrency


Open position:

isOpen
openedAt
closedAt


Journaling:

notes
emotions
mistakes
tags


Media:

screenshots


Lifecycle:

lifecycleId
parentTradeId
remainingQuantity
holdingDays


MOST IMPORTANT FOR TRADE HISTORY V2:

executions?: NormalizedExecution[]


This allows a reconstructed Trade to expose its underlying
execution records.

Therefore execution-level information can be displayed in
Trade History without creating duplicate trade-level data.


============================================================
7. IBKR PARSER
============================================================

FILE:

lib/parsers/ibkrParser.ts


Purpose:

Convert IBKR CSV rows into:

NormalizedExecution[]


The parser does NOT directly create the final Trade History UI.

It creates normalized execution records.

Current pipeline:

IBKR CSV
    ↓
Papa.parse()
    ↓
execution rows
    ↓
NormalizedExecution[]
    ↓
save to Supabase


============================================================
8. IBKR EXECUTION FILTERING
============================================================

The parser only accepts rows where:

LevelOfDetail === "EXECUTION"


Forex conversion rows are filtered out.

Currently excluded examples:

USD.CAD
CAD.USD


This prevents currency-conversion activity from being treated
as trading executions.


============================================================
9. IBKR ASSET TYPE MAPPING
============================================================

Current mapping in:

lib/parsers/ibkrParser.ts


OPT
    → Options

STK
    → Stocks

FUT
    → Futures

CASH
    → Forex

CRYPTO
    → Crypto


Unknown values fall back to the broker-provided asset class.


============================================================
10. EXECUTION TIMESTAMP
============================================================

The parser extracts:

Date/Time


It creates:

date

executionTimestamp


Example:

2026-08-07T09:35:46


The execution timestamp is important because deterministic
execution ordering is required for correct trade reconstruction.


============================================================
11. CONTRACT INFORMATION
============================================================

The parser derives:

contract

contractKey


contract:

row.Description
OR
row.Symbol
OR
ticker


contractKey is normalized by replacing whitespace and converting
to uppercase.


============================================================
12. EXCHANGE ADDITION
============================================================

FILE:

lib/parsers/ibkrParser.ts


We added:

const exchange =
  row.UnderlyingListingExchange ||
  undefined;


The normalized execution now contains:

exchange


This means IBKR data can carry the exchange into the canonical
execution model.


============================================================
13. IMPORTANT EXCHANGE DECISION
============================================================

We initially inspected existing Supabase execution data and found
that exchange was missing from historical rows.

Example before the addition:

account,date,ticker,asset_type,exchange,execution_timestamp

U18458305,2026-08-03,QQQ,Options,null,...


We then verified that newer normalized data can contain:

NASDAQ


Example:

U18458305,2026-08-07,QQQ,Options,NASDAQ,2026-08-07T11:04:11


Therefore:

Old execution:
exchange = null / undefined

New execution:
exchange = NASDAQ


Trade History behavior:

Old:
-

New:
NASDAQ


This is intentional.


============================================================
14. SUPABASE EXECUTIONS TABLE
============================================================

TABLE:

public.executions


We inspected the actual production schema.

Current columns include:

id
date
ticker
contract
contract_key
side
quantity
execution_price
execution_value
fees
account
asset_type
multiplier
created_at
user_id
currency
fee_currency
broker_execution_id
action
execution_timestamp


The exchange column was added as an additive schema change.

IMPORTANT:

The exchange change is additive only.

We are not deleting existing columns.

We are not changing existing execution values.

We are not rebuilding historical data.

We are not modifying the existing trade reconstruction architecture.

Production data remains intact.


============================================================
15. SUPABASE SCHEMA VERIFICATION
============================================================

The schema was inspected using:

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'executions'
ORDER BY ordinal_position;


This was used to verify the actual executions table before
making the additive change.


============================================================
16. SUPABASE EXECUTION STORAGE FILE
============================================================

FILE:

lib/storage/supabaseExecutionStorage.ts


Purpose:

Load and save NormalizedExecution records from/to Supabase.


============================================================
17. LOADING EXECUTIONS FROM SUPABASE
============================================================

Function:

loadExecutionsFromSupabase()


The function:

1. Gets the authenticated Supabase user.
2. Loads only that user's executions.
3. Paginates through the executions table.
4. Orders by execution_timestamp ascending.
5. Hydrates database rows into NormalizedExecution objects.


IMPORTANT:

Pagination is intentional.

PAGE_SIZE:

1000


We must NOT replace this with a single request.

Reason:

Supabase may return a maximum number of rows per request.

Trade reconstruction must receive the complete execution history.

Current architecture:

executions 0–999
    ↓
executions 1000–1999
    ↓
executions 2000–2999
    ↓
...
    ↓
allData[]
    ↓
NormalizedExecution[]


============================================================
18. USER ISOLATION
============================================================

loadExecutionsFromSupabase():

Gets:

supabase.auth.getUser()


Then filters:

.eq("user_id", user.id)


This ensures the current user only loads their own
execution records.


============================================================
19. SUPABASE EXECUTION HYDRATION
============================================================

Database field:

broker_execution_id
    ↓
brokerExecutionId


Database field:

execution_timestamp
    ↓
executionTimestamp


Database field:

contract_key
    ↓
contractKey


Database field:

exchange
    ↓
exchange


Database field:

execution_price
    ↓
executionPrice


Database field:

execution_value
    ↓
executionValue


Database field:

fee_currency
    ↓
feeCurrency


Database field:

asset_type
    ↓
assetType


This mapping is important because Supabase uses snake_case while
the TypeScript domain model uses camelCase.


============================================================
20. EXCHANGE HYDRATION
============================================================

The updated hydration logic includes:

exchange:
  execution.exchange


Therefore:

Supabase
    ↓
execution.exchange
    ↓
NormalizedExecution.exchange


If Supabase has:

NASDAQ

the application receives:

exchange = "NASDAQ"


If Supabase has:

null

the application receives:

exchange = null / undefined


The UI will later normalize that to:

"-"


============================================================
21. SAVING EXECUTIONS TO SUPABASE
============================================================

Function:

saveExecutionsToSupabase()


It:

1. Gets the authenticated user.
2. Converts NormalizedExecution objects into database rows.
3. Adds user_id.
4. Removes duplicate execution IDs inside the batch.
5. Upserts into public.executions.


Database mapping includes:

brokerExecutionId
    ↓
broker_execution_id

executionTimestamp
    ↓
execution_timestamp

contractKey
    ↓
contract_key

exchange
    ↓
exchange

feeCurrency
    ↓
fee_currency


============================================================
22. DUPLICATE PROTECTION
============================================================

saveExecutionsToSupabase() creates a Map keyed by:

execution.id


This ensures duplicate execution IDs within the current
save batch are removed before upsert.


The final Supabase operation uses:

upsert()

with:

onConflict: "id"


This preserves idempotent execution storage.


============================================================
23. TRADE RECONSTRUCTION
============================================================

FILE:

lib/analytics/pairTrades.ts


This is one of the most important files in the architecture.

pairTrades() is authoritative for reconstructing trades from
executions.


Conceptually:

NormalizedExecution[]
        ↓
pairTrades()
        ↓
Trade[]


Trade History must not implement its own pairing logic.


============================================================
24. EXECUTION ORDERING
============================================================

Execution ordering is important.

The execution ledger is ordered using execution timestamp.

This is required for deterministic trade reconstruction.

Trade History must not sort executions using arbitrary UI values
when reconstructing trades.

The canonical ordering belongs to the execution layer.


============================================================
25. TRADE HISTORY DATA FLOW
============================================================

Complete flow:

IBKR CSV
    ↓
lib/parsers/ibkrParser.ts
    ↓
NormalizedExecution[]
    ↓
saveExecutionsToSupabase()
    ↓
public.executions
    ↓
loadExecutionsFromSupabase()
    ↓
NormalizedExecution[]
    ↓
pairTrades()
    ↓
Trade[]
    ↓
Trade History page


This is the architecture we protect.


============================================================
26. MANUAL TRADE SUPPORT
============================================================

Trade History also supports manually created trades.

Manual trading is different from broker-imported executions.

The UI must distinguish between:

BROKER-DERIVED DATA

and

MANUALLY CREATED TRADE DATA.


Manual trades must not corrupt the broker execution ledger.


============================================================
27. MANUAL ADD TRADE
============================================================

FILE:

AddTradeModal component/file


The Add Trade modal is responsible for manually creating a trade.

Current purpose includes entering trade information such as:

ticker
side
status
date
strategy
setup
session
asset type
account
entry price
exit price
quantity
risk/reward
stop loss
take profit
notes
emotions
mistakes
tags
screenshots


IMPORTANT:

Manual trade creation should continue to follow the existing
application's manual-trade persistence architecture.

Do not introduce execution records for a manual trade unless the
application explicitly decides that manual trades should also be
represented in the canonical execution ledger.


============================================================
28. MANUAL EDIT TRADE
============================================================

FILE:

EditTradeModal component/file


The Edit Trade modal is responsible for editing a manually
managed Trade.

Trade History V2 must preserve this functionality.

The new UI must not accidentally remove the Edit action.

Important principle:

Editing a manual trade is allowed.

Editing broker-derived execution truth directly from a generic
Trade History row is a separate architectural decision and should
not be introduced casually.


============================================================
29. MANUAL DELETE TRADE
============================================================

Trade History currently supports deletion of manually created
trades.

Delete behavior must remain intact during V2.

Important distinction:

MANUAL TRADE DELETE

is not the same as:

DELETE BROKER EXECUTIONS.


Broker execution records are canonical data.

V2 must not introduce a UI action that accidentally deletes
broker execution history.


============================================================
30. ADD / EDIT / DELETE SAFETY RULE
============================================================

Trade History V2 must preserve:

ADD
EDIT
DELETE


for manual trades.

The new UI should change presentation first.

Do not rewrite persistence simply because the UI is being upgraded.


============================================================
31. TRADE HISTORY TOOLBAR
============================================================

FILE:

TradesToolbar component/file


Current responsibilities:

- Search
- Status filter
- Side filter
- Asset filter
- From date
- To date
- Reset


Props include:

searchQuery
setSearchQuery

statusFilter
setStatusFilter

sideFilter
setSideFilter

assetFilter
setAssetFilter

fromDate
setFromDate

toDate
setToDate


============================================================
32. SEARCH
============================================================

Current search placeholder:

Search ticker, account, date...


Search state:

searchQuery


The actual filtering logic belongs to the parent Trade History
page unless another filtering layer exists.


V2 should preserve search functionality.


============================================================
33. STATUS FILTER
============================================================

Current values:

ALL
WIN
LOSS
OPEN
EXPIRED_WORTHLESS


Canonical TradeStatus also contains:

BREAKEVEN


This mismatch should be reviewed during V2.

Do not blindly add/remove values without checking the existing
filtering logic and trade status behavior.


============================================================
34. SIDE FILTER
============================================================

Current values:

ALL
LONG
SHORT


This corresponds to:

TradeSide


============================================================
35. ASSET FILTER
============================================================

Current values:

ALL
Futures
Options
Stocks
Forex


Parser also supports:

Crypto


If Crypto is already a supported application asset type, V2 may
eventually include it in the UI.

Do not change the existing filter until the actual parent filtering
logic is inspected.


============================================================
36. DATE FILTER
============================================================

Current toolbar has:

fromDate
toDate


Both are strings.

The toolbar itself only manages the controls.

The parent page performs the actual filtering.


============================================================
37. RESET BUTTON
============================================================

Current reset behavior:

setSearchQuery("")

setStatusFilter("ALL")

setSideFilter("ALL")

setAssetFilter("ALL")

setFromDate("")

setToDate("")


This reset behavior should remain intact during V2 unless we
explicitly redesign the filtering architecture.


============================================================
38. CURRENT TOOLBAR UI
============================================================

Current controls:

Search
From date
To date
Status
Side
Asset
Reset


The toolbar is currently visually compact and positioned inside
a dark rounded container.

V2 can redesign the presentation, but the existing functionality
must not be lost.


============================================================
39. TEST MODAL IN TOOLBAR
============================================================

The current TradesToolbar contains temporary test state:

isAddTradeOpen


and a temporary:

"STATE WORKING"

modal.

This is development/test code.

It should NOT become part of the production V2 architecture.

Before finalizing V2, this test modal should be removed if it is
still present.


============================================================
40. HISTORICAL EXCHANGE DECISION
============================================================

This decision is FINAL for the current V2:

We do NOT care if older trades have exchange data.

If exchange data exists:

SHOW IT.


If exchange data does not exist:

SHOW "-"


Example:

NASDAQ


or:

-


No historical migration is required.

No artificial exchange value should be created.

No guessing.


============================================================
41. PRODUCTION SAFETY
============================================================

The exchange work was intentionally additive.

We are NOT:

- deleting executions
- rewriting historical executions
- rebuilding old trades
- changing P&L
- changing pairing logic
- changing IBKR import behavior beyond extracting exchange
- changing existing execution IDs
- changing existing execution timestamps
- changing existing prices
- changing quantities
- changing fees


The objective was simply:

MAKE EXCHANGE AVAILABLE WHEN THE BROKER PROVIDES IT.


============================================================
42. WHAT HAS ALREADY BEEN VERIFIED
============================================================

We verified the Supabase executions schema.

We verified execution records exist.

We verified execution timestamps exist.

We verified accounts exist.

We verified ticker information exists.

We verified asset type information exists.

We verified newer execution records can contain:

NASDAQ


We also verified that older records may contain:

null


Therefore the data layer is ready for the Trade History V2
exchange display.


============================================================
43. IMPORTANT CURRENT CONCLUSION
============================================================

For the current V2 scope:

THE DATA FOUNDATION IS READY.

We do not need another database migration just to start the UI.

The next work should primarily be:

TRADE HISTORY V2 UI


============================================================
44. TRADE HISTORY V2 — OBJECTIVE
============================================================

V2 should make Trade History significantly more useful while
remaining clean, premium, institutional, and easy to scan.

Target characteristics:

- Dense but readable
- Professional
- Minimal visual noise
- Strong hierarchy
- Clear P&L
- Clear trade direction
- Clear status
- Clear instrument
- Clear account
- Clear execution information
- Easy filtering
- Easy search
- Easy manual editing
- Easy manual deletion
- Scalable to large trade histories


============================================================
45. V2 PRINCIPLE
============================================================

DO NOT redesign the data architecture while redesigning the UI.

V2 should primarily be:

DATA ALREADY EXISTS
        ↓
PRESENT IT BETTER


Not:

NEW UI
        ↓
NEW DATA MODEL


============================================================
46. V2 TRADE HISTORY ROW
============================================================

The exact final column set will be decided after inspecting the
current Trade History page and row renderer.

Potential information includes:

Date
Ticker
Contract
Side
Status
Asset
Account
Entry
Exit
Quantity
P&L
P&L %
Fees
Holding time
Exchange


The final set should be based on the existing page architecture
rather than guessing.


============================================================
47. EXCHANGE COLUMN
============================================================

V2 should be able to display:

Exchange


Example:

NASDAQ


Missing:

-


The UI must never show:

undefined

null

blank unexpected values


unless blank is explicitly part of the intended design.


============================================================
48. EXECUTION DETAILS
============================================================

Because:

Trade.executions[]

already exists,

V2 can eventually provide deeper execution detail.

Potential information:

Execution timestamp
Execution price
Execution quantity
Execution side
Exchange
Contract
Broker execution ID
Fees


This should preferably appear through an expandable detail view,
drawer, modal, or trade detail interaction rather than making the
main table excessively wide.


============================================================
49. MAIN TABLE VS DETAIL VIEW
============================================================

Recommended architecture:

MAIN TRADE HISTORY TABLE

Keep the most important trade-level information visible.

TRADE DETAIL

Expose deeper execution information.

This avoids turning the main table into an unreadable broker
statement.


============================================================
50. MANUAL TRADE ACTIONS
============================================================

V2 should retain:

Edit
Delete


for manual trades.

Actions should be visually available without dominating the table.


============================================================
51. BROKER TRADE ACTIONS
============================================================

Be careful with broker-derived trades.

Broker execution data is canonical.

Do not provide generic "Delete Trade" functionality that deletes
canonical broker executions unless the architecture explicitly
supports that operation.


============================================================
52. OPEN TRADES
============================================================

Trade History must continue to support:

OPEN


Open trades may have:

exitPrice = null

closedAt = null

isOpen = true


The UI must render missing values safely.

Example:

Exit:
-


============================================================
53. MISSING DATA RULE
============================================================

Trade History must never crash because optional information is
missing.

Expected display behavior:

Missing exchange:
-

Missing exit:
-

Missing optional strategy:
-

Missing setup:
-

Missing session:
-

Missing risk/reward:
-

Missing screenshot:
No screenshot available


The exact visual treatment can be refined in V2.


============================================================
54. HISTORICAL DATA RULE
============================================================

Do NOT require old data to match the newest data model perfectly.

The application must support progressive enrichment.

Example:

Old trade:
exchange = missing

New trade:
exchange = NASDAQ


Both are valid.

This is especially important for a long-lived trading journal.


============================================================
55. V2 UI IMPLEMENTATION ORDER
============================================================

Recommended implementation sequence:

STEP 1

Inspect the full current Trade History page.


STEP 2

Inspect the current trade row/table renderer.


STEP 3

Inspect the current Add Trade modal.


STEP 4

Inspect the current Edit Trade modal.


STEP 5

Inspect the current Delete behavior.


STEP 6

Inspect the parent filtering logic.


STEP 7

Confirm exactly how Trade[] reaches the page.


STEP 8

Confirm how manual trades are distinguished from broker trades.


STEP 9

Design V2 table structure.


STEP 10

Add exchange display.


STEP 11

Add execution detail presentation.


STEP 12

Improve filters/search.


STEP 13

Improve row actions.


STEP 14

Test manual Add/Edit/Delete.


STEP 15

Test broker-derived trades.


STEP 16

Test open trades.


STEP 17

Test missing exchange data.


STEP 18

Test historical trades.


STEP 19

Test multiple accounts.


STEP 20

Test large execution history.


============================================================
56. FILES THAT BELONG TO TRADE HISTORY
============================================================

KNOWN FILES CURRENTLY IDENTIFIED:

types/trade.ts

lib/parsers/ibkrParser.ts

lib/storage/supabaseExecutionStorage.ts

lib/analytics/pairTrades.ts

TradesToolbar component

AddTradeModal component

EditTradeModal component

Trade History page/component


Additional files may be connected to the page.

Before changing architecture, inspect the actual imports of the
Trade History page and follow them outward.


============================================================
57. FILE RESPONSIBILITY SUMMARY
============================================================

types/trade.ts

DOMAIN CONTRACTS

Defines:

Trade
NormalizedExecution
TradeSide
TradeStatus
TradingSession
TradeEmotion
TradeMistake


------------------------------------------------------------

lib/parsers/ibkrParser.ts

BROKER NORMALIZATION

IBKR CSV
    ↓
NormalizedExecution[]


------------------------------------------------------------

lib/storage/supabaseExecutionStorage.ts

EXECUTION PERSISTENCE

NormalizedExecution[]
    ↕
Supabase executions


------------------------------------------------------------

lib/analytics/pairTrades.ts

TRADE RECONSTRUCTION

NormalizedExecution[]
    ↓
Trade[]


------------------------------------------------------------

TradesToolbar

FILTERING UI

Search
Status
Side
Asset
Date range
Reset


------------------------------------------------------------

AddTradeModal

MANUAL TRADE CREATION


------------------------------------------------------------

EditTradeModal

MANUAL TRADE EDITING


------------------------------------------------------------

Trade History page

ORCHESTRATION + PRESENTATION

Loads/receives trades
Applies filters
Renders table
Controls actions
Opens Add/Edit/Delete UI


============================================================
58. IMPORTANT ARCHITECTURAL RULE
============================================================

Never duplicate broker-derived data into another Trade History
specific database table simply because the UI needs a new column.

For example:

DO NOT create:

trade_history_exchange


if exchange already belongs to:

NormalizedExecution


The correct architecture is:

executions.exchange
        ↓
NormalizedExecution.exchange
        ↓
Trade.executions[]
        ↓
Trade History UI


============================================================
59. IMPORTANT UI RULE
============================================================

Trade History should not know how to reconstruct trades.

It should receive:

Trade[]


and render/filter them.

The pairing logic belongs to:

pairTrades()


The parser belongs to:

ibkrParser.ts


The persistence belongs to:

supabaseExecutionStorage.ts


The domain model belongs to:

types/trade.ts


This separation must remain intact.


============================================================
60. IMPORTANT DATA INTEGRITY RULE
============================================================

Never modify canonical execution information merely to make the
UI look correct.

If exchange is missing:

show "-"

Do NOT:

invent an exchange
infer an exchange from ticker
infer an exchange from asset type
copy exchange from another execution
modify historical execution records


============================================================
61. IMPORTANT TESTING RULE
============================================================

Before V2 is considered complete, test at minimum:

1. Broker trade with exchange

Expected:
NASDAQ


2. Historical broker trade without exchange

Expected:
-


3. Open trade

Expected:
missing exit safely displayed


4. Manual trade

Expected:
appears normally


5. Manual Add

Expected:
new trade appears


6. Manual Edit

Expected:
edited trade updates correctly


7. Manual Delete

Expected:
trade disappears without affecting unrelated broker executions


8. Multiple accounts

Expected:
correct account shown


9. Options

Expected:
contract information remains correct


10. Stocks

Expected:
stock trade remains correct


11. Futures

Expected:
futures remain correct


12. Large execution history

Expected:
pagination still loads all executions


============================================================
62. CURRENT STATUS
============================================================

DATA LAYER:

READY


SUPABASE:

READY


EXCHANGE FIELD:

READY


IBKR PARSER:

READY


EXECUTION HYDRATION:

READY


EXECUTION SAVE:

READY


HISTORICAL MISSING EXCHANGE HANDLING:

DECIDED


TRADE RECONSTRUCTION:

EXISTING / PROTECTED


MANUAL ADD:

EXISTING / MUST PRESERVE


MANUAL EDIT:

EXISTING / MUST PRESERVE


MANUAL DELETE:

EXISTING / MUST PRESERVE


TRADE HISTORY V2 UI:

NEXT PHASE


============================================================
63. WHAT WE SHOULD NOT DO NOW
============================================================

Do NOT:

- perform a historical exchange migration
- rewrite old executions
- modify pairTrades unnecessarily
- create a duplicate trade-history database table
- duplicate execution data
- change P&L calculations
- change execution IDs
- change the broker sync architecture
- redesign Supabase persistence
- remove manual trade functionality
- remove Edit
- remove Delete
- remove Reset
- remove existing filters without a deliberate replacement


============================================================
64. NEXT FILE TO INSPECT
============================================================

The next file to inspect before writing Trade History V2 UI is:

THE FULL CURRENT TRADE HISTORY PAGE COMPONENT.


Reason:

We need to see exactly:

- Where Trade[] comes from
- How filtering works
- How rows are generated
- How AddTradeModal is opened
- How EditTradeModal is opened
- How Delete works
- How pagination works
- What data is currently rendered
- Whether execution data is already available
- How manual and broker trades are currently distinguished


After that, inspect the actual row/table component if it is
separated into another file.


============================================================
65. V2 DESIGN PHILOSOPHY
============================================================

Elite X Trade History should feel like a professional trading
journal rather than a generic CRUD table.

The hierarchy should be:

TRADE IDENTITY
    ↓
POSITION / DIRECTION
    ↓
EXECUTION
    ↓
PERFORMANCE
    ↓
JOURNAL / CONTEXT


The main table should remain highly scannable.

Deep information should be available without overwhelming the
main table.


============================================================
66. FUTURE TRADE DETAIL DIRECTION
============================================================

A trade detail interaction can eventually expose:

------------------------------------------------------------
TRADE SUMMARY
------------------------------------------------------------

Ticker
Contract
Side
Status
Account
Asset
Date


------------------------------------------------------------
PERFORMANCE
------------------------------------------------------------

Entry
Exit
Quantity
P&L
P&L %
Fees


------------------------------------------------------------
EXECUTIONS
------------------------------------------------------------

Timestamp
Side
Quantity
Price
Exchange
Fees
Broker Execution ID


------------------------------------------------------------
JOURNAL
------------------------------------------------------------

Strategy
Setup
Session
Emotions
Mistakes
Tags
Notes


------------------------------------------------------------
MEDIA
------------------------------------------------------------

Screenshots


This is a future direction, not something to implement blindly
before inspecting the existing Trade History structure.


============================================================
67. FUTURE CHART / ENTRY / EXIT DIRECTION
============================================================

A future Trade Detail experience may include a chart with:

Entry marker
Exit marker
Position direction
Potential execution markers


This is intentionally separate from the initial V2 table work.

The architecture already gives us an important foundation because
the Trade contains:

executions[]


Therefore execution timestamps and prices can eventually support
richer visual trade analysis.


============================================================
68. FINAL ARCHITECTURAL DOCTRINE
============================================================

The permanent rule for Trade History is:

EXECUTIONS ARE TRUTH.

TRADES ARE DERIVED.

TRADE HISTORY IS PRESENTATION.

MANUAL TRADES ARE SUPPORTED EXPLICITLY.

SUPABASE IS PERSISTENCE.

pairTrades() IS THE TRADE RECONSTRUCTION AUTHORITY.

The UI must not create a competing source of truth.


============================================================
69. FINAL CURRENT PLAN
============================================================

PHASE 1 — COMPLETE

Add exchange support to execution model.

DONE.


PHASE 2 — COMPLETE

Add exchange extraction to IBKR parser.

DONE.


PHASE 3 — COMPLETE

Persist exchange in Supabase executions.

DONE.


PHASE 4 — COMPLETE

Load exchange back into NormalizedExecution.

DONE.


PHASE 5 — COMPLETE

Verify actual Supabase data.

DONE.


PHASE 6 — COMPLETE

Decide historical behavior.

Decision:

Missing exchange = "-"


PHASE 7 — CURRENT

Inspect full Trade History page and connected UI files.


PHASE 8

Design Trade History V2 table.


PHASE 9

Implement V2 presentation.


PHASE 10

Add execution detail presentation.


PHASE 11

Verify Add/Edit/Delete manual trades.


PHASE 12

Regression-test broker synchronization, reconstruction,
filtering, and historical data.


============================================================
70. GOLDEN RULE FOR FUTURE CHANGES
============================================================

When adding a new Trade History feature, first ask:

"Does this information already exist in the canonical execution
or trade model?"

If YES:

Expose it through the existing model.

If NO:

Determine which canonical layer owns it before adding a database
field.

Never create UI-specific duplicate data just because it is easier.

The long-term goal is:

ONE CANONICAL DATA MODEL
        ↓
MANY HIGH-QUALITY VIEWS


Trade History is one of those views.


============================================================
END OF TRADE HISTORY MASTER NOTES
============================================================