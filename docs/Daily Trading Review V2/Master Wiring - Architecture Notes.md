============================================================
ELITE X — DAILY TRADE REVIEW SYSTEM
MASTER WIRING / ARCHITECTURE / SUPABASE NOTES
============================================================

PURPOSE
------------------------------------------------------------

This document is the permanent master reference for how the
Elite X Daily Trade Review system is wired.

This document covers ONLY the Review system and its current
persistence architecture.

AI Trade Summary is intentionally NOT covered here.

AI Trade Summary will be designed and documented separately
and must remain a presentation/intelligence layer on top of
this Review system.

The Review system is a journaling/behavioral metadata layer.

It MUST NOT modify:

  - canonical executions
  - broker executions
  - FIFO pairing
  - pairTrades()
  - canonical Trade accounting
  - P&L calculation
  - fees / commissions
  - FX conversion
  - broker sync
  - reconciliation
  - account balances
  - execution identity
  - trading analytics source-of-truth logic

The Review system records what the trader thought, felt,
observed, or selected about an already reconstructed trade.

The architectural principle is:

  WHAT ACTUALLY HAPPENED
      =
  canonical executions / reconstructed Trade

  WHAT THE TRADER BELIEVED / FELT / LEARNED
      =
  Trade Review

These two layers must remain separate.


============================================================
1. REVIEW PRODUCT RULES
============================================================

1.1 REVIEWABLE TRADES
------------------------------------------------------------

Only CLOSED canonical trades are reviewable.

Reviewable statuses:

  - WIN
  - LOSS
  - BREAKEVEN

Not reviewable:

  - OPEN

The frontend checks:

  !trade.isOpen &&
  trade.status !== "OPEN"

A review additionally requires both:

  - canonical entry execution ID
  - canonical exit execution ID


============================================================
1.2 REVIEW IDENTITY
============================================================

Trade.id MUST NOT be used as the permanent Review identity.

Reason:

Trade.id is reconstruction-derived.

Current pairTrades() creates closed Trade IDs using:

  entryExecution.id
  +
  exitExecution.id
  +
  index
  +
  consumeQuantity

Example structure:

  `${entryExecution.id}-${exitExecution.id}-${index}-${consumeQuantity}`

Because Trade[] is reconstructed from executions, Trade.id is
not considered a durable Review key.

Additionally, an OPEN trade can later become CLOSED and receive
a different derived Trade.id.

Therefore Review identity is based on the exact canonical
execution pair:

  user_id
  +
  entry_execution_id
  +
  exit_execution_id

This is the permanent Review identity model.


============================================================
1.3 PARTIAL EXIT SAFETY
============================================================

This identity model correctly supports partial exits.

Example:

  Entry:
    E1 = 100 shares

  Exits:
    X1 = 20
    X2 = 20
    X3 = 20
    X4 = 20
    X5 = 20

pairTrades() can reconstruct:

  E1 -> X1
  E1 -> X2
  E1 -> X3
  E1 -> X4
  E1 -> X5

Each closed Trade has a unique Review identity because the exit
execution differs.

Therefore five separate Reviews can exist without collision.

This is one of the main reasons Review identity MUST use
entry_execution_id + exit_execution_id rather than Trade.id.


============================================================
1.4 REVIEW CONTENT
============================================================

Current structured Review fields:

  tradeContext
  setup
  entryReason
  exitReason
  psychology
  mistakes[]
  strengths[]

These represent trader-provided Review metadata.

Current UI categories:

  Trade Context
    - Trend Day
    - Range Day
    - News / Catalyst
    - High Volatility
    - Low Volatility
    - Choppy

  Setup
    - Breakout
    - Break & Retest
    - Support / Resistance
    - Fib Retracement
    - EMA Pullback
    - VWAP Reclaim
    - Opening Range
    - Liquidity Sweep
    - Trend Continuation
    - Reversal
    - Other

  Entry Reason
    - Break of Structure
    - Volume Confirmation
    - Momentum
    - Support / Resistance
    - Fib Confluence
    - EMA Confluence
    - VWAP Confirmation
    - Liquidity Confirmation
    - Market Structure
    - Other

  Exit Reason
    - Target Hit
    - Stop Loss
    - Structure Break
    - Trailing Stop
    - Momentum Loss
    - Manual Exit
    - End of Day
    - Risk Reduction
    - Other

  Psychology
    - Calm
    - Confident
    - Hesitant
    - Anxious
    - FOMO
    - Revenge
    - Overconfident

  Mistakes
    - Overtrading
    - FOMO Entry
    - Early Entry
    - Early Exit
    - Late Entry
    - Late Exit
    - Oversized Position
    - No Stop Loss
    - Moved Stop
    - Plan Deviation
    - Revenge Trading
    - Chased Price

  Strengths
    - Followed Plan
    - Good Risk Management
    - Patient Entry
    - Clean Execution
    - Managed Trade Well
    - Good Exit Discipline
    - Waited for Confirmation
    - Protected Profit


============================================================
1.5 SINGLE-SELECT BEHAVIOR
============================================================

Trade Context, Setup, Entry Reason, Exit Reason, and Psychology
are single-select fields.

They are intentionally toggleable.

Behavior:

  no selection
      ->
  click option
      ->
  option selected
      ->
  click same option again
      ->
  option cleared

Implementation helper:

  toggleSingleSelection(
    current,
    value,
    setValue
  )

Behavior:

  current === value
      -> ""

  otherwise
      -> value

This allows the trader to intentionally clear a selection.

It is NOT valid to force at least one selection per section.


============================================================
1.6 MULTI-SELECT BEHAVIOR
============================================================

Mistakes and Strengths are multi-select fields.

Behavior:

  click unselected option
      ->
  add to array

  click selected option
      ->
  remove from array

The existing helper:

  toggleSelection()

handles this behavior.

An empty array is valid.


============================================================
1.7 EMPTY REVIEW RULE
============================================================

A critical product decision:

  EMPTY REVIEW = NO REVIEW

A Review is considered meaningful only when at least one Review
field contains content.

Therefore:

  select something
      +
  Save Review
      ->
  Review row exists
      ->
  trade is Reviewed

But:

  clear EVERYTHING
      +
  Save Review
      ->
  Review row is deleted
      ->
  trade is NOT Reviewed

This is intentionally better than forcing the user to keep one
option selected.

It allows the user to completely clear a Review.

The rule is:

  Review row exists
      =
  reviewed

  Review row does not exist
      =
  not reviewed


============================================================
2. FILE / COMPONENT ARCHITECTURE
============================================================

The Review flow is distributed across these layers:

  DailyReviewModal.tsx
      |
      +--> DailyReviewTradeTable.tsx
      |
      +--> DailyReviewTradeDrawer.tsx
                |
                +--> TradeReviewTab.tsx
      |
      +--> Review storage layer


============================================================
2.1 DAILY REVIEW MODAL
============================================================

File:

  components/dashboard/daily-review/DailyReviewModal.tsx

Responsibility:

  - owns selected trade
  - owns account filter
  - computes filteredSelectedTrades
  - owns review-status key set
  - loads Review existence for the visible trade set
  - owns Previous / Next navigation
  - passes Review status to Trade Table
  - passes Review status callback into Drawer
  - passes navigation callbacks into Drawer


============================================================
2.2 DAILY REVIEW TRADE TABLE
============================================================

File:

  components/dashboard/daily-review/DailyReviewTradeTable.tsx

Responsibility:

  - display trades
  - identify selected trade visually
  - display Review status
  - allow trade selection
  - allow manual-trade editing
  - does NOT query Supabase per row

Important:

  The table MUST NOT perform N+1 Review queries.

Review status is loaded in the parent and passed down.

Props now include:

  selectedTrades
  allTrades
  reportingCurrency
  reviewedTradeKeys
  selectedTradeId
  onSelectTrade
  onEditTrade

The table derives the exact Review key using:

  entryExecutionId
  exitExecutionId

Then checks:

  reviewedTradeKeys.has(reviewKey)

The Reviewed column displays:

  ✓

when a Review row exists.

Otherwise it shows the empty square.


============================================================
2.3 DAILY REVIEW TRADE DRAWER
============================================================

File:

  components/dashboard/daily-review/DailyReviewTradeDrawer.tsx

Responsibility:

  - display the selected trade
  - display Overview
  - display Review
  - display Executions
  - display Notes
  - relay Review status changes
  - relay Previous / Next navigation

Relevant callbacks:

  onReviewStatusChange
  onPreviousTrade
  onNextTrade
  canGoPrevious
  canGoNext


============================================================
2.4 TRADE REVIEW TAB
============================================================

File:

  components/dashboard/daily-review/trade-review/TradeReviewTab.tsx

Responsibility:

  - render structured Review UI
  - load Review data
  - hydrate controls
  - allow selections
  - save Review
  - delete Review when completely cleared
  - notify parent of Review status changes

It MUST NOT modify canonical Trade / Execution data.


============================================================
2.5 REVIEW STORAGE LAYER
============================================================

File:

  lib/storage/supabaseTradeReviewStorage.ts

This is the dedicated persistence layer for Review data.

Current exported pieces include:

  TradeReview
  SaveTradeReviewInput

  loadTradeReview()
  deleteTradeReview()
  saveTradeReview()

  getTradeReviewKey()
  loadTradeReviewKeys()

The old:

  updateTradeReviewStatus()

mechanism is no longer part of frontend behavior.

It existed during the first persistence implementation but became
obsolete after adopting:

  Review row exists = Reviewed

The database columns associated with that old mechanism still
exist currently and are intentionally documented as pending
cleanup.


============================================================
3. SUPABASE DATABASE
============================================================

Table:

  public.trade_reviews


============================================================
3.1 CURRENT SCHEMA
============================================================

Current columns:

  id
    uuid
    NOT NULL
    default gen_random_uuid()

  user_id
    uuid
    NOT NULL

  entry_execution_id
    text
    NOT NULL

  exit_execution_id
    text
    NOT NULL

  trade_context
    text
    NULL

  setup
    text
    NULL

  entry_reason
    text
    NULL

  exit_reason
    text
    NULL

  psychology
    text
    NULL

  mistakes
    text[]
    NOT NULL
    default '{}'

  strengths
    text[]
    NOT NULL
    default '{}'

  reviewed
    boolean
    NOT NULL
    default false

  reviewed_at
    timestamptz
    NULL

  created_at
    timestamptz
    NOT NULL
    default now()

  updated_at
    timestamptz
    NOT NULL
    default now()


============================================================
3.2 PRIMARY KEY
============================================================

Primary key:

  trade_reviews_pkey

Column:

  id


============================================================
3.3 REVIEW UNIQUENESS
============================================================

Unique constraint:

  trade_reviews_unique_closed_trade

Columns:

  user_id
  entry_execution_id
  exit_execution_id

This guarantees one Review row per exact user + execution pair.


============================================================
3.4 EXECUTION FOREIGN KEY DECISION
============================================================

There is intentionally NO foreign key from:

  trade_reviews.entry_execution_id
  trade_reviews.exit_execution_id

to:

  executions.id

Reason:

Broker synchronization can atomically replace broker execution
rows.

Review persistence must not become coupled to execution-table
replacement through a database FK.

The Review layer therefore uses application-level identity
validation:

  user_id
  +
  entry execution ID
  +
  exit execution ID

This avoids creating unwanted cascade / replacement coupling
between Review metadata and the canonical execution ledger.


============================================================
3.5 USER FOREIGN KEY
============================================================

Current foreign key:

  trade_reviews_user_id_fkey

References:

  auth.users(id)

with:

  ON DELETE CASCADE

This ties Review ownership to the authenticated user.


============================================================
3.6 INDEXES
============================================================

Current indexes include:

  Primary key index on id

  Unique composite index on:
    user_id
    entry_execution_id
    exit_execution_id

  user_id index

The unique composite index is the important identity/performance
index for Review operations.


============================================================
4. ROW LEVEL SECURITY
============================================================

RLS is enabled on:

  public.trade_reviews


============================================================
4.1 SELECT POLICY
============================================================

Authenticated users may SELECT only rows where:

  auth.uid() = user_id


============================================================
4.2 INSERT POLICY
============================================================

Authenticated users may INSERT only where:

  auth.uid() = user_id


============================================================
4.3 UPDATE POLICY
============================================================

Authenticated users may UPDATE only rows where:

  auth.uid() = user_id

Both USING and WITH CHECK are scoped to the authenticated user.


============================================================
4.4 DELETE POLICY
============================================================

Authenticated users may DELETE only rows where:

  auth.uid() = user_id


============================================================
4.5 TABLE PRIVILEGES
============================================================

RLS alone was not sufficient.

The initial Review implementation returned:

  permission denied

because authenticated role table privileges were missing.

The following grant was added:

  grant select, insert, update, delete
  on table public.trade_reviews
  to authenticated;

Therefore the Review table requires BOTH:

  table privileges
  +
  RLS policies

for normal application operation.


============================================================
5. REVIEW STORAGE FUNCTIONS
============================================================


------------------------------------------------------------
5.1 loadTradeReview()
------------------------------------------------------------

Purpose:

  Load one Review for one exact closed trade.

Inputs:

  entryExecutionId
  exitExecutionId

Validation:

  both IDs must be non-empty

  entry ID must not equal exit ID

Authentication:

  supabase.auth.getUser()

Query:

  trade_reviews
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_execution_id", entryExecutionId)
    .eq("exit_execution_id", exitExecutionId)
    .maybeSingle()

Return:

  TradeReview
  or
  null

Meaning:

  row exists
      ->
  Review exists

  no row
      ->
  Review does not exist


------------------------------------------------------------
5.2 saveTradeReview()
------------------------------------------------------------

Purpose:

  Create or update the Review for a closed trade.

Inputs:

  entryExecutionId
  exitExecutionId
  tradeContext
  setup
  entryReason
  exitReason
  psychology
  mistakes
  strengths

Authentication:

  supabase.auth.getUser()

Writes only to:

  public.trade_reviews

Upsert conflict target:

  user_id
  entry_execution_id
  exit_execution_id

Therefore:

  First save
      ->
  INSERT

  Later save
      ->
  UPDATE

Important:

  saveTradeReview()
  MUST NOT modify executions or canonical Trade data.


------------------------------------------------------------
5.3 deleteTradeReview()
------------------------------------------------------------

Purpose:

  Remove the Review for a closed trade.

Used when:

  user clears ALL Review content
  AND
  clicks Save Review

Inputs:

  entryExecutionId
  exitExecutionId

Query:

  trade_reviews
    .delete()
    .eq("user_id", user.id)
    .eq("entry_execution_id", entryExecutionId)
    .eq("exit_execution_id", exitExecutionId)

This deletes only the Review metadata.

It does NOT modify:

  executions
  trades
  P&L
  fees
  analytics
  broker data


------------------------------------------------------------
5.4 getTradeReviewKey()
------------------------------------------------------------

Purpose:

  Generate a deterministic client-side key for Review lookup.

Implementation:

  `${entryExecutionId}::${exitExecutionId}`

Example:

  ENTRY123::EXIT456

This is NOT a database identity.

It is only a convenient in-memory key for:

  reviewedTradeKeys

The true Review identity remains:

  user_id
  +
  entry_execution_id
  +
  exit_execution_id


------------------------------------------------------------
5.5 loadTradeReviewKeys()
------------------------------------------------------------

Purpose:

  Batch-load Review existence for a set of displayed trades.

This avoids N+1 queries.

Input:

  array of:

    {
      entryExecutionId,
      exitExecutionId
    }

Behavior:

  1. Validate authenticated user.

  2. Build exact requested pair set.

  3. Build unique entry execution ID list.

  4. Build unique exit execution ID list.

  5. Query trade_reviews once using:

       .eq("user_id", user.id)
       .in("entry_execution_id", entryExecutionIds)
       .in("exit_execution_id", exitExecutionIds)

  6. Because the two IN clauses produce a candidate set rather
     than guaranteed exact pairs, validate each returned row
     against the exact requested pair set in memory.

  7. Return:

       Set<string>

     containing only exact existing Review keys.


============================================================
6. DAILY REVIEW STATUS LOADING
============================================================

DailyReviewModal owns:

  reviewedTradeKeys

type:

  Set<string>

When the Daily Review is rendered or the selected account changes,
the modal derives Review pairs from the displayed trade set.

Only trades satisfying:

  !trade.isOpen
  &&
  trade.status !== "OPEN"
  &&
  entry execution exists
  &&
  exit execution exists

are included.

Then:

  loadTradeReviewKeys(reviewPairs)

is called.

The result populates:

  reviewedTradeKeys

The result is passed to:

  DailyReviewTradeTable


============================================================
7. REVIEWED TICK LOGIC
============================================================

TradeTable does NOT ask:

  "Is reviewed === true?"

It asks:

  "Does a Review row exist for this exact trade?"

For each trade:

  entryExecutionId
  =
  trade.executions?.[0]?.id

  exitExecutionId
  =
  trade.executions?.[1]?.id

Then:

  reviewKey =
    getTradeReviewKey(
      entryExecutionId,
      exitExecutionId
    )

Then:

  isReviewed =
    reviewedTradeKeys.has(reviewKey)

If true:

  ✓

is shown in the Reviewed column.

If false:

  empty square

is shown.


============================================================
8. IMMEDIATE REVIEW STATUS UPDATE
============================================================

A full page refresh is NOT required after Save.

The flow is:

  TradeReviewTab
      |
      | onReviewStatusChange(trade, true/false)
      v
  DailyReviewTradeDrawer
      |
      | forwards callback
      v
  DailyReviewModal
      |
      v
  setReviewedTradeKeys(...)

For a saved Review:

  onReviewStatusChange(
    trade,
    true
  )

For a deleted/cleared Review:

  onReviewStatusChange(
    trade,
    false
  )

DailyReviewModal uses the exact execution pair to:

  add the key
  or
  remove the key

from the Set.

Therefore the Trade Table updates immediately.


============================================================
9. REVIEW SAVE LOGIC
============================================================

TradeReviewTab determines:

  hasReviewContent

using:

  tradeContext.trim()
  setup.trim()
  entryReason.trim()
  exitReason.trim()
  psychology.trim()
  selectedMistakes.length > 0
  selectedStrengths.length > 0

Logic:

------------------------------------------------------------

IF hasReviewContent === true

  saveTradeReview(...)

  then:

  onReviewStatusChange(
    trade,
    true
  )

------------------------------------------------------------

IF hasReviewContent === false

  deleteTradeReview(...)

  then:

  onReviewStatusChange(
    trade,
    false
  )

------------------------------------------------------------

This is the permanent product rule:

  Save with content
      =
  Review exists

  Save completely empty
      =
  Review removed


============================================================
10. REVIEW HYDRATION
============================================================

When TradeReviewTab opens for a trade:

  reviewLoading = true

Existing local selection state is cleared first.

Then:

  loadTradeReview(
    entryExecutionId,
    exitExecutionId
  )

is called.

If no row exists:

  all selections remain blank

If a row exists:

  tradeContext
  setup
  entryReason
  exitReason
  psychology
  mistakes
  strengths

are populated from the saved Review row.

This guarantees:

  select trade
      ->
  load exact Review
      ->
  restore saved selections


============================================================
11. REVIEW LOADING IS TRADE-SPECIFIC
============================================================

The Review hydration effect depends on:

  trade.id
  entryExecutionId
  exitExecutionId
  canReviewTrade

Most importantly, the database query itself is based on:

  entryExecutionId
  exitExecutionId

Trade.id is not used as Review identity.

The component also uses a cancellation guard so an outdated
async Review load does not overwrite a newer selected trade if
the user navigates quickly.


============================================================
12. PREVIOUS / NEXT NAVIGATION
============================================================

Previous / Next navigation is owned by:

  DailyReviewModal

because the modal owns:

  filteredSelectedTrades
  selectedTrade

The modal calculates:

  selectedTradeIndex

from:

  filteredSelectedTrades.findIndex(
    trade => trade.id === selectedTrade.id
  )

Then:

  canGoPrevious =
    selectedTradeIndex > 0

  canGoNext =
    selectedTradeIndex >= 0
    &&
    selectedTradeIndex <
      filteredSelectedTrades.length - 1

Navigation:

  Previous
      ->
  filteredSelectedTrades[
    selectedTradeIndex - 1
  ]

  Next
      ->
  filteredSelectedTrades[
    selectedTradeIndex + 1
  ]

This automatically respects the selected Account filter because
navigation uses filteredSelectedTrades.

Boundary behavior:

  first trade:
    Previous disabled

  middle trade:
    Previous enabled
    Next enabled

  last trade:
    Next disabled

Selected Trade changes through the same state used by the table,
so navigation automatically updates:

  - drawer content
  - Review hydration
  - selected table row highlight


============================================================
13. SELECTED TRADE VISUAL STATE
============================================================

DailyReviewTradeTable receives:

  selectedTradeId

from DailyReviewModal.

The selected row is determined by:

  selectedTradeId === trade.id

The UI uses a deliberately subtle visual treatment.

Current selected row:

  bg-violet-500/[0.035]

plus subtle top/bottom inset violet boundary:

  inset_0_1px
  inset_0_-1px

This was intentionally designed to be visible but not dominant.

The selected row remains synchronized with:

  table click
  Previous
  Next

The visual highlight is UI-only.

It does not affect Review identity or canonical accounting.


============================================================
14. DRAWER NAVIGATION WIRING
============================================================

DailyReviewModal passes:

  onPreviousTrade
  onNextTrade
  canGoPrevious
  canGoNext

to:

  DailyReviewTradeDrawer

The drawer passes these through to:

  TradeReviewTab

TradeReviewTab's action bar contains:

  Previous
  Next
  Save Review

Previous and Next buttons:

  call the corresponding callback

and become disabled at the appropriate boundary.

Disabled UI:

  disabled:cursor-not-allowed
  disabled:opacity-40


============================================================
15. TRADE REVIEW DRAWER UI
============================================================

Drawer:

  width = 340px

Current tabs:

  Overview
  Review
  Executions
  Notes

The Review tab is intentionally isolated from objective Overview
data.

Review content includes:

  Quality Score
  Trade Context
  Setup
  Entry Reason
  Exit Reason
  Psychology
  Mistakes
  Strengths
  Previous
  Next
  Save Review
  AI Trade Summary placeholder

AI Trade Summary is NOT part of this Review persistence master
implementation and is documented separately.


============================================================
16. REMOVED REVIEW STATUS TOGGLE
============================================================

The original Review implementation contained a separate manual
Reviewed mechanism:

  CircleCheck
  markedReviewed
  setMarkedReviewed
  updateTradeReviewStatus()
  reviewed
  reviewed_at

That approach was rejected as unnecessary UX.

The product decision is now:

  Save Review
      =
  create/update Review

  Empty Save
      =
  delete Review

  Reviewed tick
      =
  Review row existence

The user does NOT press a separate Reviewed button.

This avoids two different concepts:

  "saved Review"

versus

  "marked Reviewed"

There is now one clear concept.


============================================================
17. DATABASE LEGACY FIELDS STILL PRESENT
============================================================

IMPORTANT:

The current Supabase table still contains:

  reviewed
  reviewed_at

The old storage function:

  updateTradeReviewStatus()

was part of the original implementation.

The frontend no longer uses this status system.

Current Review truth is:

  existence of trade_reviews row

Therefore:

  reviewed
  reviewed_at

are currently redundant legacy fields.

They have NOT yet been removed from Supabase in the current
checkpoint.

Do NOT remove them casually.

Before dropping them, verify that:

  - no frontend code references them
  - no storage code requires them
  - no other application feature references them
  - no future migration depends on them

Then remove them through a deliberate database cleanup step.

The same applies to:

  updateTradeReviewStatus()


============================================================
18. NO TRADES TABLE
============================================================

There is no persistent canonical:

  public.trades

table.

Trade objects are reconstructed in memory from canonical
executions through pairTrades().

Therefore Review rows intentionally do NOT reference a persistent
Trade row.

Review persistence is attached to canonical execution identity.


============================================================
19. MANUAL TRADES
============================================================

Manual Trade creation produces NormalizedExecution objects.

Manual lifecycle IDs are generated independently.

Manual execution IDs follow the manual lifecycle pattern.

Example:

  manual-{lifecycleId}-entry
  manual-{lifecycleId}-exit

Partial manual exits still become separate canonical execution
pairs during pairing.

Review uses those canonical execution IDs exactly the same way
as broker-synced executions.

Therefore manual and broker trades use the same Review
persistence architecture.


============================================================
20. REVIEW DATA OWNERSHIP
============================================================

Canonical data ownership:

  Executions
      |
      v
  pairTrades()
      |
      v
  Trade[]
      |
      v
  Analytics

Review ownership:

  Trade Review UI
      |
      v
  trade_reviews
      |
      v
  Review metadata only

Review data must never be written into:

  executions
  canonical Trade fields
  pairTrades()
  broker sync state
  accounting tables


============================================================
21. SECURITY MODEL
============================================================

Every Review storage operation begins by obtaining the current
authenticated user through:

  supabase.auth.getUser()

Database queries are always constrained by:

  user_id = authenticated user ID

RLS independently enforces the same ownership boundary.

Therefore a user must not be able to access another user's
Review row simply by supplying another execution ID pair.

RLS is the database enforcement layer.

Application validation is the application correctness layer.


============================================================
22. ERROR HANDLING
============================================================

Storage functions log database failures with explicit context.

Examples:

  FAILED TO LOAD TRADE REVIEW:
  FAILED TO SAVE TRADE REVIEW:
  FAILED TO DELETE TRADE REVIEW:
  FAILED TO LOAD TRADE REVIEW KEYS:

TradeReviewTab converts failures into user-facing state:

  reviewError

Examples:

  "Failed to load trade review."

  "Failed to save trade review."

DailyReviewModal logs batch Review status loading errors and
resets the in-memory Review status set rather than fabricating
Reviewed state.


============================================================
23. IMPORTANT UX RULES
============================================================

Do NOT introduce any of the following without revisiting this
master architecture:

  - mandatory Review selections
  - mandatory Psychology selection
  - mandatory Setup selection
  - a second Reviewed checkbox
  - Review identity based on Trade.id
  - per-row Supabase Review queries
  - modifying canonical Trade data when Review changes
  - creating a persistent trades table just for Review
  - attaching Review persistence directly to broker metadata
  - automatically marking Review complete merely because the
    drawer was opened
  - marking Reviewed based on UI state that was never saved

The user explicitly controls Review completion through Save.


============================================================
24. CURRENT COMPLETE DATA FLOW
============================================================

The complete current Review flow is:

  Canonical Executions
        |
        v
  pairTrades()
        |
        v
  Trade[]
        |
        v
  DailyReviewModal
        |
        +-------------------------------+
        |                               |
        v                               v
  Trade Table                    Selected Trade
        |                               |
        |                               v
        |                       Trade Review Drawer
        |                               |
        |                               v
        |                       TradeReviewTab
        |                               |
        |                       +-------+-------+
        |                       |               |
        |                       v               v
        |                 loadTradeReview   save/delete
        |                                       |
        |                                       v
        |                                trade_reviews
        |                                       |
        +--------------- status ----------------+
                        |
                        v
                reviewedTradeKeys
                        |
                        v
                Reviewed column


============================================================
25. CURRENT REVIEW STATUS SOURCE OF TRUTH
============================================================

FINAL RULE:

  public.trade_reviews row exists
      =
  Review exists
      =
  Reviewed tick

No separate frontend Boolean determines permanent Review
existence.

No separate "Mark Reviewed" action exists.

The database row itself represents Review existence.


============================================================
26. CURRENT CHECKPOINT STATE
============================================================

The Review persistence system was completed and verified.

Confirmed working:

  - Review database table created
  - RLS configured
  - authenticated table privileges fixed
  - Review load works
  - Review save works
  - Review update works through upsert
  - Review exact execution-pair identity works
  - Review persistence survives switching trades
  - Review persistence survives reopening the trade
  - Review persistence survives refresh
  - Reviewed tick loads from Supabase
  - Reviewed tick updates immediately after save
  - Reviewed tick disappears immediately after clearing and save
  - single-select fields can be selected
  - single-select fields can be deselected
  - multi-select fields can be selected/deselected
  - empty Review deletes the Review row
  - old manual Reviewed toggle removed from frontend
  - Previous / Next navigation works
  - navigation respects account filter
  - selected table row highlight follows the drawer
  - build passes


============================================================
27. GITHUB CHECKPOINT
============================================================

A Git checkpoint was created after the working Review persistence
flow was completed.

Checkpoint intent:

  save the known-good Review persistence state

The checkpoint contains:

  - Supabase Review persistence
  - exact execution-pair identity
  - batch Reviewed status loading
  - Reviewed table indicator
  - empty Review deletion behavior
  - selection toggle behavior
  - old manual Reviewed toggle removal
  - selected trade highlight
  - Previous / Next navigation

Future work should start from this known-good checkpoint rather
than restructuring the Review architecture.


============================================================
28. FUTURE CLEANUP ITEMS
============================================================

These are NOT part of the current working implementation and
must be handled separately.

A. Remove obsolete database columns after verification:

  reviewed
  reviewed_at

B. Remove obsolete storage function:

  updateTradeReviewStatus()

C. Verify no references remain anywhere in the codebase before
   dropping legacy database fields.

D. Consider adding Review migration/versioning discipline if
   schema changes become more frequent.

E. Preserve the execution-pair identity model permanently.

F. Preserve separation between:

  canonical trading truth
  and
  trader behavioral Review data



============================================================
END OF ELITE X DAILY REVIEW SYSTEM
MASTER REVIEW WIRING NOTES
============================================================