// ============================================================
// ELITE X — EXECUTION / FIFO / LONG-SHORT MASTER HANDOVER NOTES
// ============================================================
//
// DATE:
// 2026-08-26
//
// STATUS:
// STABLE — FREEZE CURRENT IMPLEMENTATION
//
// PURPOSE:
// These notes document the execution reconstruction work,
// the LONG/SHORT correction, the expired-worthless investigation,
// the CSV import issue, the validation performed, and the final
// architectural decisions.
//
// IMPORTANT:
// DO NOT CONTINUE MODIFYING THE FIFO / PAIRING ENGINE JUST TO
// FORCE YTD TOTALS TO MATCH PRODUCTION.
//
// Current behavior is sufficiently validated that the system
// should now be tested naturally for several days.
//
// ============================================================



// ============================================================
// 1. CORE ELITE X TRADING ARCHITECTURE
// ============================================================
//
// Elite X follows an execution-first architecture.
//
// The canonical hierarchy is:
//
//   BROKER
//      ↓
//   NORMALIZED EXECUTIONS
//      ↓
//   SUPABASE executions TABLE
//      ↓
//   pairTrades()
//      ↓
//   DERIVED TRADES
//      ↓
//   ANALYTICS / DASHBOARD
//
// IMPORTANT:
//
// Executions are canonical.
//
// Trades are derived state.
//
// The executions table must remain the source of truth.
//
// pairTrades() reconstructs trades from executions.
//
// Dashboard analytics consume reconstructed trades.
//
// Therefore:
//
//   executions ≠ trades
//
// An execution is an individual broker event.
//
// A trade is a reconstructed position lifecycle.
//
//
//
// NEVER make dashboard logic independently invent trade state.
//
// NEVER use dashboard totals to mutate executions.
//
// NEVER modify canonical executions simply to make a dashboard
// number match another version.
//
// ============================================================



// ============================================================
// 2. ORIGINAL PROBLEM
// ============================================================
//
// We were comparing:
//
//   PRODUCTION
//   vs
//   LOCAL / NEW VERSION
//
// During the comparison we observed:
//
// - Current month matched 1:1.
// - Previous month matched 1:1.
// - P&L was effectively matching.
// - Commissions were matching.
// - Some historical YTD trade counts differed.
// - Expired Worthless counts differed.
// - Earlier versions showed options incorrectly classified
//   as SHORT in places where they should have been LONG.
//
//
//
// The important discovery was:
//
// BUY / SELL and LONG / SHORT are NOT the same concept.
//
//
//
// BUY / SELL:
//
//   describes the execution action.
//
// LONG / SHORT:
//
//   describes the resulting position direction.
//
//
//
// This distinction is critical for options and for any
// position reconstruction engine.
//
// ============================================================



// ============================================================
// 3. EXECUTION ACTION VS POSITION SIDE
// ============================================================
//
// CORRECT MODEL:
//
// execution.action
//
// can be:
//
//   BUY
//   SELL
//
// This describes what happened at the broker.
//
//
//
// trade.side
//
// can be:
//
//   LONG
//   SHORT
//
// This describes the position created by the execution sequence.
//
//
//
// Example:
//
// BUY 1 QQQ PUT
//
// means:
//
//   execution.action = BUY
//
// If there was no existing SHORT position:
//
//   BUY closes no SHORT
//   BUY opens LONG
//
// Therefore:
//
//   resulting trade.side = LONG
//
//
//
// Example:
//
// SELL 1 QQQ PUT
//
// If there is no existing LONG:
//
//   SELL closes no LONG
//   SELL opens SHORT
//
// Therefore:
//
//   resulting trade.side = SHORT
//
//
//
// Therefore a PUT is NOT automatically SHORT.
//
// The option type (CALL / PUT) does not determine whether the
// position is LONG or SHORT.
//
// The execution sequence determines position direction.
//
//
//
// CORRECT:
//
//   BUY → potentially LONG
//   SELL → potentially SHORT
//
// after considering the existing opposite position.
//
// ============================================================



// ============================================================
// 4. WHY THE OLD BEHAVIOR LOOKED WRONG
// ============================================================
//
// The old implementation / data model had situations where
// execution-side information was effectively being treated
// like position direction.
//
// That caused confusing output such as options appearing
// incorrectly classified.
//
//
//
// The new architecture explicitly separates:
//
//   execution.action
//
// from:
//
//   trade.side
//
//
//
// This is why the current output now looks more correct.
//
//
//
// IMPORTANT:
//
// Do NOT interpret a raw execution row's BUY/SELL as the
// final LONG/SHORT position.
//
// Only pairTrades() can determine the resulting position.
//
// ============================================================



// ============================================================
// 5. CURRENT pairTrades() POSITION MODEL
// ============================================================
//
// Each contract now has two independent queues:
//
//   LONG
//   SHORT
//
// Example:
//
// openPositions[contractKey] = {
//
//   LONG:  [],
//   SHORT: [],
//
// }
//
//
//
// This is intentional.
//
// BUY / SELL are execution actions.
//
// LONG / SHORT are position states.
//
//
//
// For every execution:
//
//
// BUY:
//
//   1. Close existing SHORT positions.
//   2. If quantity remains, open LONG.
//
//
//
// SELL:
//
//   1. Close existing LONG positions.
//   2. If quantity remains, open SHORT.
//
//
//
// This is the core deterministic FIFO reconstruction behavior.
//
// ============================================================



// ============================================================
// 6. CURRENT pairTrades() FLOW
// ============================================================
//
// The algorithm does the following:
//
//
// STEP 1
//
// Load existing open trades if provided.
//
//
//
// STEP 2
//
// Convert existing open trades into position buckets:
//
//   LONG
//   SHORT
//
//
//
// STEP 3
//
// Sort all canonical executions.
//
//
//
// STEP 4
//
// Ignore CASH FX instruments.
//
//
//
// STEP 5
//
// Validate execution.action.
//
// Only:
//
//   BUY
//   SELL
//
// are valid.
//
//
//
// STEP 6
//
// Determine:
//
//   closingSide
//   openingSide
//
//
//
// BUY:
//
//   closingSide = SHORT
//   openingSide = LONG
//
//
//
// SELL:
//
//   closingSide = LONG
//   openingSide = SHORT
//
//
//
// STEP 7
//
// Consume existing opposite positions FIFO.
//
//
//
// STEP 8
//
// Create a closed Trade for each consumed quantity.
//
//
//
// STEP 9
//
// If execution quantity remains after closing the opposite
// position, create a new open position.
//
//
//
// STEP 10
//
// After processing all executions, convert remaining position
// quantities into OPEN trades.
//
// ============================================================



// ============================================================
// 7. FIFO BEHAVIOR
// ============================================================
//
// The matching engine is FIFO.
//
// Example:
//
// BUY 1 @ 3.00
// BUY 1 @ 4.00
// SELL 1 @ 5.00
//
// The SELL closes:
//
//   first BUY @ 3.00
//
// leaving:
//
//   BUY @ 4.00
//
// open.
//
//
//
// This is deterministic and must remain so.
//
//
//
// Partial quantities are also supported.
//
// Example:
//
// BUY 5
// SELL 2
//
// results in:
//
//   closed = 2
//   remaining open = 3
//
//
//
// The engine uses:
//
//   remainingQuantity
//
// to track this.
//
// ============================================================



// ============================================================
// 8. FLOATING POINT PROTECTION
// ============================================================
//
// pairTrades() uses:
//
//   EPSILON = 0.00000001
//
//
//
// This prevents tiny floating-point leftovers from becoming
// fake open positions.
//
//
//
// Example:
//
// remainingQuantity = 0.000000000001
//
// should effectively be treated as zero.
//
//
//
// Do not remove EPSILON without a specific reason.
//
// ============================================================



// ============================================================
// 9. CLOSED TRADE P&L
// ============================================================
//
// For LONG:
//
//   priceDifference =
//       exitPrice - entryPrice
//
//
//
// For SHORT:
//
//   priceDifference =
//       entryPrice - exitPrice
//
//
//
// Realized P&L:
//
//   priceDifference
//   × quantity
//   × multiplier
//   - entry fees
//   - exit fees
//
//
//
// Therefore:
//
// LONG profits when exit > entry.
//
// SHORT profits when entry > exit.
//
//
//
// This logic is independent of CALL vs PUT.
//
// ============================================================



// ============================================================
// 10. EXPIRED-WORTHLESS OPTIONS
// ============================================================
//
// One of the major investigation areas was:
//
//   Expired Worthless
//
//
//
// Example discovered:
//
// QQQ 08JUL26 707 P
//
// BUY 1 @ 1.11
// SELL 1 @ 0
//
//
//
// This is correctly reconstructed as:
//
//   LONG
//
// because:
//
//   BUY opened LONG
//
// and:
//
//   SELL @ 0 closed it.
//
//
//
// The resulting P&L includes the loss of the option premium
// plus applicable fees.
//
//
//
// This is why the July 8 expired-worthless trade now appears
// correctly after the execution data was fixed.
//
// ============================================================



// ============================================================
// 11. IMPORTANT EXPIRED-WORTHLESS FINDING
// ============================================================
//
// Before the latest correction:
//
//   Local expired worthless = 15
//
// After correctly persisting:
//
//   side = execution.action
//
// the local result became:
//
//   Expired Worthless = 21
//
//
//
// July 8 now correctly shows an expired-worthless trade.
//
//
//
// Production had:
//
//   YTD expired worthless = 26
//
// Local had:
//
//   YTD expired worthless = 21
//
//
//
// This remaining difference was NOT sufficient evidence to
// change pairTrades().
//
//
//
// The correct approach is to observe and investigate specific
// records if another discrepancy appears.
//
// ============================================================



// ============================================================
// 12. EXECUTIONS TABLE — SIDE COLUMN ISSUE
// ============================================================
//
// Supabase executions table contains:
//
//   action
//   side
//
//
//
// The database has a NOT NULL constraint on:
//
//   side
//
// During YTD CSV testing, the following error occurred:
//
//
//   null value in column "side"
//   of relation "executions"
//   violates not-null constraint
//
//
//
// PostgreSQL error:
//
//   CODE: 23502
//
//
//
// The failed import attempted:
//
//   1304 executions
//
//
//
// The first execution showed that the incoming serialized
// object contained:
//
//   action: "SELL"
//
// but did NOT contain:
//
//   side
//
//
//
// Therefore Supabase rejected the insert/upsert.
//
// ============================================================



// ============================================================
// 13. CORRECT FIX FOR CSV / EXECUTION STORAGE
// ============================================================
//
// In:
//
//   lib/storage/supabaseExecutionStorage.ts
//
//
//
// saveExecutionsToSupabase()
//
// must serialize:
//
//   action
//
// AND:
//
//   side
//
//
//
// Correct mapping:
//
//   action:
//     execution.action,
//
//   side:
//     execution.action,
//
//
//
// Example:
//
// action:
//   "BUY"
//
// side:
//   "BUY"
//
//
//
// OR:
//
// action:
//   "SELL"
//
// side:
//   "SELL"
//
//
//
// This satisfies the database NOT NULL requirement.
//
//
//
// IMPORTANT:
//
// This does NOT mean side = LONG/SHORT.
//
// In the executions table:
//
//   side is currently being persisted as the raw execution
//   action for compatibility with the existing schema.
//
//
//
// The derived Trade object is where LONG/SHORT is determined.
//
//
//
// Therefore:
//
// executions.side
//     ↓
// raw execution-side compatibility field
//
// executions.action
//     ↓
// canonical execution action
//
// pairTrades()
//     ↓
// determines LONG / SHORT
//
// trade.side
//     ↓
// actual position direction
//
// ============================================================



// ============================================================
// 14. HYDRATION
// ============================================================
//
// In:
//
//   lib/storage/supabaseExecutionStorage.ts
//
// loadExecutionsFromSupabase()
//
// hydrates database rows into NormalizedExecution.
//
//
//
// Important fields:
//
//   id
//   brokerExecutionId
//   date
//   executionTimestamp
//   ticker
//   contract
//   contractKey
//   exchange
//   action
//   quantity
//   executionPrice
//   executionValue
//   fees
//   currency
//   feeCurrency
//   account
//   assetType
//   multiplier
//
//
//
// pairTrades() should consume:
//
//   NormalizedExecution[]
//
// and derive position state.
//
//
//
// Do not introduce LONG/SHORT inference into the hydration
// layer unless there is a specific architectural requirement.
//
// ============================================================



// ============================================================
// 15. EXECUTION PAGINATION
// ============================================================
//
// loadExecutionsFromSupabase() was also verified to use
// pagination.
//
// Current:
//
//   PAGE_SIZE = 1000
//
//
//
// Supabase execution history is loaded in pages:
//
//   range(0, 999)
//   range(1000, 1999)
//   range(2000, 2999)
//   ...
//
//
//
// This is important because a single Supabase request must
// not silently truncate the canonical execution history.
//
//
//
// pairTrades() must receive the complete execution history.
//
//
//
// DO NOT replace this with:
//
//   .select("*")
//
// without pagination.
//
// ============================================================



// ============================================================
// 16. EXECUTION SORTING
// ============================================================
//
// pairTrades() sorts executions using:
//
//   executionTimestamp
//
// with fallback:
//
//   date
//
//
//
// If timestamps are equal, it uses:
//
//   brokerExecutionId
//
// then:
//
//   id
//
//
//
// This provides deterministic ordering.
//
//
//
// Current helper:
//
//   getExecutionDateTime()
//
// returns:
//
//   execution.executionTimestamp
//   ||
//   execution.date
//
//
//
// compareExecutions() then sorts chronologically.
//
//
//
// IMPORTANT:
//
// Historical records can have incomplete timestamp data.
//
// Therefore older records may behave differently from newly
// imported records if their execution_timestamp is missing.
//
//
//
// This was one reason we considered whether some historical
// discrepancies could be related to older records.
//
//
//
// However:
//
// Current month and previous month matching 1:1 is strong
// evidence that the active reconstruction path is behaving
// correctly for recent data.
//
// ============================================================



// ============================================================
// 17. HISTORICAL DATA VS NEW CODE
// ============================================================
//
// We investigated whether the remaining YTD difference could
// simply be caused by:
//
//   old data
//   missing timestamps
//   legacy side values
//   new pairing logic
//
//
//
// Current conclusion:
//
// DO NOT assume the new pairing algorithm is broken.
//
//
//
// Evidence:
//
//   Current month       = 1:1
//   Previous month      = 1:1
//   P&L                 = effectively matching
//   Commissions         = matching
//   Expired Worthless   = improved after side fix
//   July 8              = now correctly appears expired worthless
//   LONG/SHORT          = now conceptually correct
//
//
//
// Therefore the remaining YTD difference is currently treated
// as a historical/data reconciliation issue until proven
// otherwise.
//
//
//
// Confidence:
//
// HIGH that the current LONG/SHORT model is conceptually
// correct.
//
// MEDIUM-HIGH that the remaining YTD difference is historical
// rather than a fundamental FIFO bug.
//
//
//
// If another concrete discrepancy appears, trace the exact
// execution records before changing the algorithm.
//
// ============================================================



// ============================================================
// 18. SQL VALIDATION PERFORMED
// ============================================================
//
// We queried execution action/side combinations.
//
// Current result:
//
//   BUY,BUY     = 658
//   BUY,LONG    = 271
//   SELL,SELL   = 646
//   SELL,SHORT  = 245
//
//
//
// This tells us the executions table currently contains a
// mixture of legacy/raw side values and newer normalized
// values.
//
//
//
// This is NOT itself proof of a pairing bug.
//
//
//
// The key distinction is:
//
// executions.side
//
// versus:
//
// trade.side
//
//
//
// Do not use this raw SQL combination count as the final
// LONG/SHORT validation.
//
// pairTrades() output must be validated instead.
//
// ============================================================



// ============================================================
// 19. JULY DAILY SQL CHECK
// ============================================================
//
// We also checked daily action/side combinations.
//
// Example:
//
// 2026-07-01:
//
//   BUY,BUY     = 19
//   BUY,LONG    = 3
//   SELL,SELL   = 16
//   SELL,SHORT  = 1
//
//
//
// 2026-07-08:
//
//   BUY,BUY     = 4
//   SELL,SELL   = 4
//
//
//
// Other days contain BUY/LONG and SELL/SHORT combinations.
//
//
//
// This is expected given the historical data and compatibility
// state of the side column.
//
//
//
// Again:
//
// raw execution side ≠ final position side.
//
// ============================================================



// ============================================================
// 20. HISTORICAL ZERO-PRICE SELL RECORDS
// ============================================================
//
// We inspected records such as:
//
//   QQQ 08JUL26 707 P
//   SELL 1 @ 0
//
// and similar expired option records.
//
//
//
// Examples included:
//
//   AMZN
//   LEVI
//   CNC
//   QQQ
//   META
//   NFLX
//   ADBE
//   INTC
//   BKE
//   NOK
//   NIO
//
//
//
// These records represent historical zero-price option events
// and are relevant to Expired Worthless classification.
//
//
//
// Some have:
//
//   side = SHORT
//
// while others have:
//
//   side = SELL
//
//
//
// This further reinforces why raw executions.side must not be
// interpreted as final position direction.
//
// The position direction must be reconstructed from the
// execution sequence.
//
// ============================================================



// ============================================================
// 21. SPECIFIC JULY 8 TEST CASE
// ============================================================
//
// Important execution sequence:
//
//
// QQQ 08JUL26 707 P
//
// BUY:
//
//   quantity        = 1
//   execution_price = 1.11
//   execution_value = -111.8573
//   fees            = 0.86
//
//
//
// SELL:
//
//   quantity        = 1
//   execution_price = 0
//   execution_value = 0
//   fees            = 0
//
//
//
// Correct interpretation:
//
//   BUY → opens LONG
//
//   SELL @ 0 → closes LONG
//
//
//
// Therefore:
//
//   Trade.side = LONG
//
//   status = LOSS
//
//   expired-worthless classification should be possible
//   based on the higher-level trade classification logic.
//
//
//
// This test case is now working in local.
//
// ============================================================



// ============================================================
// 22. CURRENT pairTrades() MUST REMAIN FROZEN
// ============================================================
//
// Current logic:
//
//
// BUY:
//
//   close SHORT
//   then open LONG if quantity remains
//
//
//
// SELL:
//
//   close LONG
//   then open SHORT if quantity remains
//
//
//
// FIFO:
//
//   first position in opposite queue is consumed first.
//
//
//
// Partial fills:
//
//   supported.
//
//
//
// Existing open trades:
//
//   loaded into the appropriate LONG/SHORT bucket.
//
//
//
// Cash FX:
//
//   ignored.
//
//
//
// Invalid actions:
//
//   logged and ignored.
//
//
//
// Missing contract key:
//
//   logged and ignored.
//
//
//
// Floating-point dust:
//
//   removed using EPSILON.
//
//
//
// This is currently the correct deterministic structure.
//
// ============================================================



// ============================================================
// 23. DASHBOARD ARCHITECTURE
// ============================================================
//
// Current Dashboard V2 loads canonical executions:
//
//   loadExecutionsFromSupabase()
//
// then reconstructs:
//
//   pairTrades(storedExecutions)
//
// then combines with manual trades:
//
//   manualTrades.filter(
//     trade => !trade.contractKey
//   )
//
//
//
// Therefore:
//
//   canonical broker trades
//       = reconstructed from executions
//
//   manual trades
//       = legacy/manual layer
//
//
//
// Dashboard analytics then operate on the resulting trades.
//
//
//
// This separation must remain intact.
//
// ============================================================



// ============================================================
// 24. CSV IMPORT FLOW
// ============================================================
//
// Current flow:
//
//   CSV
//     ↓
//   parseIBKRCsv()
//     ↓
//   NormalizedExecution[]
//     ↓
//   saveExecutionsToSupabase()
//     ↓
//   loadExecutionsFromSupabase()
//     ↓
//   pairTrades()
//     ↓
//   dashboard
//
//
//
// This is useful for historical validation because we can
// re-import a YTD dataset and verify the reconstruction.
//
//
//
// IMPORTANT:
//
// A CSV import must not silently fail.
//
// The previous failure was caused by:
//
//   side = NULL
//
// because the serializer omitted side while the DB requires
// it.
//
//
//
// The serializer now includes:
//
//   side: execution.action
//
//
//
// After this correction:
//
//   July 8 expired-worthless appeared.
//
//
//
// This was strong evidence that the missing side field was
// materially affecting the historical reconstruction/data
// state.
//
// ============================================================



// ============================================================
// 25. CURRENT PRODUCTION VS LOCAL RECONCILIATION
// ============================================================
//
// Current comparison:
//
//
// PRODUCTION:
//
//   YTD total trades = 738
//
// LOCAL:
//
//   YTD total trades = 741
//
// Difference:
//
//   3 trades
//
//
//
// Expired Worthless:
//
//   Production = 26
//   Local      = 21
//
// Difference:
//
//   5
//
//
//
// However:
//
//   Current month = 1:1
//   Previous month = 1:1
//
//
//
// P&L:
//
//   only approximately $3 difference YTD
//
//
//
// Commissions:
//
//   matching in the investigated examples
//
//
//
// Therefore this is NOT currently considered a critical
// financial integrity failure.
//
// It is an isolated historical reconciliation difference.
//
// ============================================================



// ============================================================
// 26. WHY WE ARE NOT FORCING YTD TO MATCH
// ============================================================
//
// It would be dangerous to modify pairTrades() simply to
// make:
//
//   741 → 738
//
//
//
// because we do not yet know which three records explain the
// difference.
//
//
//
// Possible causes include:
//
//   legacy execution data
//   missing timestamps
//   historical side values
//   expired option records
//   old data imported under a previous schema
//   different historical reconstruction behavior
//
//
//
// Changing the algorithm without identifying the exact
// records could break:
//
//   current month
//   previous month
//   options
//   short positions
//   expired worthless
//   P&L
//
//
//
// Since current and previous month already match 1:1,
// the correct engineering decision is:
//
//   FREEZE THE ALGORITHM.
//
//
//
// Investigate exact records only if the discrepancy becomes
// material or reproducible.
//
// ============================================================



// ============================================================
// 27. TESTING STRATEGY GOING FORWARD
// ============================================================
//
// The application should now be used normally for several
// trading days.
//
//
//
// Monitor:
//
//
// 1. CURRENT MONTH
//
// Must continue matching production.
//
//
//
// 2. PREVIOUS MONTH
//
// Must remain stable.
//
//
//
// 3. LONG / SHORT
//
// Pay particular attention to:
//
//   options
//   puts
//   short options
//   zero-price expiration events
//
//
//
// 4. EXPIRED WORTHLESS
//
// Watch newly expired contracts.
//
//
//
// 5. P&L
//
// Should match broker / production expectations.
//
//
//
// 6. COMMISSIONS
//
// Should remain consistent.
//
//
//
// 7. TRADE COUNT
//
// If a discrepancy appears:
//
//   identify the date first.
//
// Do NOT immediately change pairTrades().
//
//
//
// 8. YTD
//
// Continue observing the 3-trade difference.
//
//
//
// If the difference remains stable while current and previous
// months continue matching, treat it as historical until
// specifically reconciled.
//
// ============================================================



// ============================================================
// 28. DEBUGGING RULE FOR FUTURE DISCREPANCIES
// ============================================================
//
// If something differs:
//
//
//
// STEP 1
//
// Identify exact date.
//
//
//
// STEP 2
//
// Compare:
//
//   production trade count
//   local trade count
//
//
//
// STEP 3
//
// Compare P&L.
//
//
//
// STEP 4
//
// Compare commissions.
//
//
//
// STEP 5
//
// Identify exact contract(s).
//
//
//
// STEP 6
//
// Inspect canonical executions.
//
//
//
// STEP 7
//
// Run pairTrades() against those executions.
//
//
//
// STEP 8
//
// Only after the exact mismatch is understood should code
// be changed.
//
//
//
// NEVER:
//
//   "Production has 3 more trades, let's change FIFO."
//
//
//
// ALWAYS:
//
//   "Which three trades are different, and why?"
//
// ============================================================



// ============================================================
// 29. IMPORTANT DATA INTEGRITY PRINCIPLE
// ============================================================
//
// Never use derived Trade records to repair canonical
// executions unless there is explicit evidence that the
// execution ledger itself is corrupt.
//
//
//
// Correct direction:
//
//   Broker
//      ↓
//   Executions
//      ↓
//   pairTrades()
//      ↓
//   Trades
//
//
//
// NOT:
//
//   Production trade count
//      ↓
//   modify executions
//
//
//
// The execution ledger must remain deterministic and
// reproducible.
//
// ============================================================



// ============================================================
// 30. SIDE COLUMN — LONG-TERM ARCHITECTURAL NOTE
// ============================================================
//
// Current executions table contains:
//
//   action
//   side
//
//
//
// Current compatibility behavior:
//
//   side = action
//
//
//
// This is acceptable for the current system because
// pairTrades() derives actual position direction.
//
//
//
// Long-term architectural preference:
//
// executions should conceptually represent broker execution
// facts, not reconstructed position state.
//
//
//
// Therefore:
//
//   action = canonical execution action
//
// and:
//
//   trade.side = canonical position direction
//
//
//
// If the executions.side column is eventually removed or
// repurposed, perform a proper migration rather than casually
// changing it during FIFO work.
//
//
//
// DO NOT make that migration now.
//
// ============================================================



// ============================================================
// 31. TIMESTAMP CONSIDERATION
// ============================================================
//
// Historical records may have:
//
//   executionTimestamp = null
//
// or older records where timestamp quality is weaker.
//
//
//
// pairTrades() falls back:
//
//   executionTimestamp
//      OR
//   date
//
//
//
// Sorting then uses:
//
//   timestamp
//   brokerExecutionId
//   id
//
//
//
// This means historical records can have less precise ordering
// than recent records.
//
//
//
// However:
//
// Current and previous month matching 1:1 indicates that the
// current active execution stream is behaving correctly.
//
//
//
// If an old-date discrepancy appears again:
//
//   inspect timestamp availability first.
//
//
//
// Do not assume timestamp problems without evidence.
//
// ============================================================



// ============================================================
// 32. CURRENT CODE FILES INVOLVED
// ============================================================
//
// FIFO / reconstruction:
//
//   lib/parsers/pairTrades.ts
//
//
//
// Execution storage:
//
//   lib/storage/supabaseExecutionStorage.ts
//
//
//
// Dashboard:
//
//   app/page.tsx
//
//
//
// Parser:
//
//   lib/parsers/ibkrParser.ts
//
//
//
// The dashboard uses:
//
//   pairTrades()
//   loadExecutionsFromSupabase()
//   saveExecutionsToSupabase()
//
//
//
// IMPORTANT:
//
// Dashboard V2 remains authoritative.
//
// Legacy dashboard components must not be reintroduced.
//
// ============================================================



// ============================================================
// 33. EXACT STORAGE FIX
// ============================================================
//
// File:
//
//   lib/storage/supabaseExecutionStorage.ts
//
//
//
// saveExecutionsToSupabase()
//
// must contain:
//
//
//   action:
//     execution.action,
//
//   side:
//     execution.action,
//
//
//
// This fixes:
//
//   PostgreSQL 23502
//
//
//
// Error previously seen:
//
//   null value in column "side"
//   of relation "executions"
//   violates not-null constraint
//
//
//
// This was observed during a YTD CSV import of:
//
//   1304 executions
//
//
//
// After adding side:
//
//   side is no longer NULL
//
// and historical import/reconstruction can proceed.
//
// ============================================================



// ============================================================
// 34. CURRENT VERIFIED RESULT
// ============================================================
//
// After the side persistence fix:
//
//
// Expired Worthless:
//
//   15 → 21
//
//
//
// July 8:
//
//   expired worthless now appears.
//
//
//
// LONG / SHORT:
//
//   now behaves according to actual execution sequence.
//
//
//
// Current month:
//
//   matches production 1:1
//
//
//
// Previous month:
//
//   matches production 1:1
//
//
//
// P&L:
//
//   effectively matches
//
//
//
// Commission:
//
//   matches
//
//
//
// YTD:
//
//   local 741
//   production 738
//
//
//
// Current conclusion:
//
//   ACCEPT AND FREEZE.
//
// ============================================================



// ============================================================
// 35. WHAT NOT TO DO NEXT
// ============================================================
//
// DO NOT:
//
//   - rewrite pairTrades()
//   - change FIFO
//   - infer LONG/SHORT from CALL/PUT
//   - use execution.side as trade.side
//   - delete canonical executions
//   - force YTD count to match production
//   - alter P&L formulas without evidence
//   - change timestamp sorting without a failing example
//   - modify Dashboard V2 just to fix historical counts
//
//
//
// DO:
//
//   - trade normally
//   - observe several days
//   - compare current month
//   - compare previous month
//   - watch expired worthless
//   - watch options
//   - record exact discrepancies
//
// ============================================================



// ============================================================
// 36. IF A NEW BUG APPEARS
// ============================================================
//
// Bring:
//
//   1. Date
//
//   2. Ticker
//
//   3. Contract
//
//   4. Production result
//
//   5. Local result
//
//   6. P&L difference
//
//   7. Commission difference
//
//   8. Relevant execution rows
//
//   9. execution.action
//
//   10. execution.side
//
//   11. execution_timestamp
//
//   12. broker_execution_id
//
//
//
// Then trace:
//
//   execution
//       ↓
//   sorting
//       ↓
//   position bucket
//       ↓
//   FIFO match
//       ↓
//   closed trade
//       ↓
//   classification
//       ↓
//   dashboard
//
//
//
// This gives us evidence instead of assumptions.
//
// ============================================================



// ============================================================
// 37. FINAL ENGINEERING DECISION
// ============================================================
//
// CURRENT STATUS:
//
//   STABLE
//
//
//
// Current implementation correctly separates:
//
//   EXECUTION ACTION
//
// from:
//
//   POSITION DIRECTION
//
//
//
// The core model is:
//
//   BUY
//      ↓
//   close SHORT
//      ↓
//   remaining quantity → LONG
//
//
//
//   SELL
//      ↓
//   close LONG
//      ↓
//   remaining quantity → SHORT
//
//
//
// FIFO is deterministic.
//
// Partial fills are supported.
//
// Existing open positions are supported.
//
// Cash FX is ignored.
//
// Floating-point dust is handled.
//
// Canonical executions remain the source of truth.
//
//
//
// The side persistence bug during CSV import has been fixed:
//
//   side = execution.action
//
//
//
// The remaining YTD discrepancy is currently:
//
//   3 trades
//
// and should NOT trigger another algorithm change.
//
//
//
// The system should now be tested in real usage for several
// days before any further reconstruction changes are made.
//
// ============================================================



// ============================================================
// 38. HANDOVER CHECKPOINT
// ============================================================
//
// IF RESUMING THIS WORK LATER:
//
// Start here:
//
//   "Current pairTrades() logic is frozen and working.
//    Current month and previous month match production 1:1.
//    The CSV side NOT NULL issue was fixed by persisting
//    side = execution.action.
//    Expired Worthless improved from 15 to 21 and July 8
//    now correctly appears.
//    YTD remains local 741 vs production 738.
//    Do not change FIFO unless a specific discrepancy is
//    identified."
//
//
//
// NEXT INVESTIGATION ONLY IF NEEDED:
//
//   Identify the exact 3 YTD trade differences.
//
//
//
// DO NOT START BY MODIFYING pairTrades().
//
// Start with data reconciliation.
//
// ============================================================



// ============================================================
// END OF MASTER NOTES
// ============================================================