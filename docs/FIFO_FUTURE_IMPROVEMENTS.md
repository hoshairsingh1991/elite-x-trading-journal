// ============================================================
// ELITE X — EXECUTION / FIFO FUTURE IMPROVEMENT NOTES
// ============================================================
//
// STATUS:
// Current execution storage, broker sync, and FIFO reconstruction
// are working correctly.
//
// IMPORTANT:
// These are FUTURE IMPROVEMENTS.
// Do NOT implement them simply because they are listed here.
//
// Current production behavior has been tested and should remain
// stable while we continue manual trading/testing.
//
// ============================================================


// ============================================================
// 1. AUTOMATED FIFO REGRESSION TESTS
// ============================================================
//
// PRIORITY:
// HIGH — LONG TERM
//
// PURPOSE:
// Prevent future changes from silently breaking the FIFO engine.
//
// WHY:
// The current pairTrades() logic is complex and handles:
//
// - LONG positions
// - SHORT positions
// - partial fills
// - partial closes
// - position reversals
// - multiple executions
// - multiple contracts
// - options
// - expired options
// - open positions
// - existing stored open positions
// - execution ordering
//
// A future modification could appear to work in the UI while
// subtly changing trade reconstruction.
//
// FUTURE PLAN:
//
// Create deterministic automated tests for:
//
// 1. LONG entry → LONG exit
//
// 2. SHORT entry → SHORT exit
//
// 3. Partial LONG close
//
// 4. Partial SHORT close
//
// 5. LONG position reversal
//
// 6. SHORT position reversal
//
// 7. Multiple fills
//
// 8. Multiple contracts on the same ticker
//
// 9. Options
//
// 10. Expired worthless options
//
// 11. Open LONG positions
//
// 12. Open SHORT positions
//
// 13. Same timestamp executions
//
// 14. Multiple broker accounts
//
// 15. Fractional quantities where applicable
//
// 16. Fees included in realized P&L
//
// 17. Currency / multiplier handling
//
// 18. Duplicate execution protection
//
// EXPECTATION:
//
// pairTrades() should eventually have a permanent regression
// test suite before major architectural changes are made.
//
// ============================================================


// ============================================================
// 2. EXECUTION DATA VALIDATION
// ============================================================
//
// PRIORITY:
// HIGH
//
// FUTURE IMPROVEMENT:
//
// Add a validation layer before executions enter the canonical
// execution ledger.
//
// Validate:
//
// - id
// - brokerExecutionId
// - ticker
// - contract
// - contractKey
// - action
// - side
// - quantity
// - executionPrice
// - executionTimestamp
// - account
// - assetType
// - multiplier
// - currency
//
// INVALID DATA SHOULD:
//
// - be rejected or quarantined
// - generate a clear error
// - never silently enter canonical storage
//
// IMPORTANT:
//
// Do not use validation to alter valid broker data.
// Validation should protect the execution ledger, not rewrite
// broker truth.
//
// ============================================================


// ============================================================
// 3. BROKER NORMALIZATION LAYER
// ============================================================
//
// PRIORITY:
// HIGH — FUTURE BROKER SCALING
//
// CURRENT:
//
// IBKR data is normalized into NormalizedExecution.
//
// FUTURE:
//
// Formalize a broker-independent normalization contract:
//
// Broker Raw Data
//       ↓
// Broker Adapter
//       ↓
// NormalizedExecution
//       ↓
// Execution Ledger
//       ↓
// FIFO Reconstruction
//       ↓
// Trades
//
// IMPORTANT:
//
// FIFO should never contain broker-specific logic.
//
// Adding Questrade, Wealthsimple, etc. should require a new
// broker adapter rather than changes to pairTrades().
//
// ============================================================


// ============================================================
// 4. EXECUTION LEDGER INTEGRITY
// ============================================================
//
// PRIORITY:
// HIGH
//
// FUTURE IMPROVEMENT:
//
// Strengthen canonical execution guarantees.
//
// Requirements:
//
// - Executions remain the source of truth.
// - Trades remain derived state.
// - FIFO never modifies executions.
// - Analytics never modifies executions.
// - Notes never modifies executions.
// - Dashboard never becomes the source of truth.
//
// IMPORTANT:
//
// Do not introduce logic that manually edits reconstructed
// trades instead of fixing the underlying execution data.
//
// ============================================================


// ============================================================
// 5. STRONGER EXECUTION IDENTITY
// ============================================================
//
// PRIORITY:
// MEDIUM / HIGH
//
// CURRENT:
//
// Execution id is used for duplicate protection.
//
// FUTURE:
//
// Review whether the execution identity strategy is sufficiently
// robust for every supported broker.
//
// Consider:
//
// - brokerExecutionId
// - broker account
// - broker identifier
// - execution timestamp
// - contract
// - quantity
// - execution price
//
// IMPORTANT:
//
// Do not change the current primary-key strategy casually.
//
// This requires migration planning because execution identity
// affects synchronization and duplicate prevention.
//
// ============================================================


// ============================================================
// 6. BROKER SYNC OBSERVABILITY
// ============================================================
//
// PRIORITY:
// MEDIUM / HIGH
//
// CURRENT:
//
// Sync logs already provide useful information:
//
// - broker account
// - Flex query
// - XML size
// - execution count
// - sync status
// - errors
//
// FUTURE:
//
// Create a formal sync history / audit system.
//
// Track:
//
// - startedAt
// - completedAt
// - duration
// - broker
// - account
// - execution count
// - rows deleted
// - rows inserted
// - rows replaced
// - status
// - error message
// - warning
//
// This will make production debugging significantly easier.
//
// ============================================================


// ============================================================
// 7. INCOMPLETE BROKER RESPONSE DETECTION
// ============================================================
//
// PRIORITY:
// MEDIUM / HIGH
//
// CURRENT ARCHITECTURAL RULE:
//
// Broker is the source of truth for the sync window.
//
// FUTURE:
//
// Detect obviously incomplete broker responses.
//
// Examples:
//
// - unexpected XML structure
// - missing execution section
// - malformed execution
// - suspiciously low execution count
// - missing required broker identifiers
//
// IMPORTANT:
//
// "0 executions" is not automatically an error.
//
// A legitimate trading account may genuinely have no trades.
//
// The system must distinguish:
//
// VALID EMPTY RESULT
//
// from
//
// BROKEN / INCOMPLETE BROKER RESPONSE
//
// ============================================================


// ============================================================
// 8. ATOMIC SYNC TRANSACTION
// ============================================================
//
// PRIORITY:
// HIGH
//
// ARCHITECTURAL REQUIREMENT:
//
// The following operation should eventually be fully atomic:
//
// 1. Download broker data
//
// 2. Validate broker response
//
// 3. Delete existing execution window
//
// 4. Insert replacement executions
//
// 5. Commit
//
// If insertion fails:
//
// - deletion must NOT leave the account with missing data.
//
// IMPORTANT:
//
// Current sync behavior has been tested successfully.
// This item is an architectural hardening task, not a reason
// to change working code immediately.
//
// ============================================================


// ============================================================
// 9. MULTI-ACCOUNT ISOLATION TESTS
// ============================================================
//
// PRIORITY:
// HIGH
//
// CURRENT:
//
// Multiple IBKR accounts are supported.
//
// FUTURE:
//
// Add automated tests proving:
//
// Account A executions cannot affect Account B.
//
// Test:
//
// - manual sync
// - automatic sync
// - deletion window
// - execution insertion
// - FIFO reconstruction
// - trade generation
// - analytics
//
// IMPORTANT:
//
// user_id and broker account identity must remain properly
// isolated.
//
// ============================================================


// ============================================================
// 10. ACCOUNT-AWARE TRADE RECONSTRUCTION
// ============================================================
//
// PRIORITY:
// HIGH
//
// FUTURE REVIEW:
//
// Ensure contractKey alone is never allowed to accidentally
// combine positions belonging to different accounts.
//
// Example:
//
// Account A:
// QQQ option → LONG
//
// Account B:
// QQQ option → SHORT
//
// These must remain independent.
//
// Account identity should be part of the reconstruction boundary
// where required by the architecture.
//
// ============================================================


// ============================================================
// 11. OPTIONS-SPECIFIC TEST COVERAGE
// ============================================================
//
// PRIORITY:
// HIGH
//
// Options introduce additional lifecycle cases.
//
// Future tests should cover:
//
// - Long Call
// - Long Put
// - Short Call
// - Short Put
// - Buy to Open
// - Sell to Close
// - Sell to Open
// - Buy to Close
// - Expired worthless
// - Partial option closes
// - Multiple contracts
// - Different expirations
// - Different strikes
//
// IMPORTANT:
//
// BUY / SELL = execution action
//
// LONG / SHORT = reconstructed position direction
//
// These concepts must remain separate.
//
// ============================================================


// ============================================================
// 12. EXPIRED-WORTHLESS TRADE HANDLING
// ============================================================
//
// PRIORITY:
// MEDIUM / HIGH
//
// CURRENT:
//
// Expired-worthless options are now appearing correctly based on
// the execution data available.
//
// FUTURE:
//
// Explicitly formalize the lifecycle:
//
// OPEN OPTION
//      ↓
// EXPIRATION
//      ↓
// NO CLOSING EXECUTION
//      ↓
// EXPIRED WORTHLESS
//
// The system should eventually represent this lifecycle explicitly
// rather than relying only on inferred behavior.
//
// IMPORTANT:
//
// Do not fabricate a broker execution for an expired option.
//
// Expiration is an event/state, not necessarily an execution.
//
// ============================================================


// ============================================================
// 13. TRADE STATUS MODEL
// ============================================================
//
// PRIORITY:
// MEDIUM
//
// CURRENT:
//
// Trade statuses include:
//
// - OPEN
// - WIN
// - LOSS
// - BREAKEVEN
//
// FUTURE:
//
// Consider whether additional lifecycle states are required:
//
// - EXPIRED_WORTHLESS
// - ASSIGNED
// - EXERCISED
// - CANCELLED
// - REVERSED
//
// Only add states when the canonical data model requires them.
//
// ============================================================


// ============================================================
// 14. ASSIGNMENT / EXERCISE SUPPORT
// ============================================================
//
// PRIORITY:
// FUTURE
//
// Important for a mature options platform.
//
// Eventually support:
//
// - option assignment
// - option exercise
// - resulting stock position
// - resulting stock execution relationship
//
// This should NOT be implemented inside simple FIFO logic.
//
// It requires a dedicated corporate-action / lifecycle model.
//
// ============================================================


// ============================================================
// 15. CORPORATE ACTIONS
// ============================================================
//
// PRIORITY:
// FUTURE
//
// Eventually consider:
//
// - stock splits
// - reverse splits
// - mergers
// - ticker changes
// - spin-offs
// - symbol changes
//
// These can affect contract identity and historical analytics.
//
// This is a major future architecture area.
//
// ============================================================


// ============================================================
// 16. CURRENCY / FX HANDLING
// ============================================================
//
// PRIORITY:
// MEDIUM / HIGH
//
// CURRENT:
//
// currency and feeCurrency are stored.
//
// FUTURE:
//
// Formalize multi-currency P&L.
//
// Example:
//
// Execution currency = USD
// Account currency = CAD
// Fee currency = USD
//
// Eventually the platform may need:
//
// - FX conversion
// - account-base currency
// - historical FX rates
// - converted P&L
// - converted fees
//
// IMPORTANT:
//
// Do not assume all P&L is USD forever.
//
// ============================================================


// ============================================================
// 17. MULTIPLIER VALIDATION
// ============================================================
//
// PRIORITY:
// MEDIUM
//
// Current FIFO uses:
//
// execution.multiplier
//
// FUTURE:
//
// Validate multiplier at normalization time.
//
// Examples:
//
// Stocks:
// 1
//
// Standard options:
// 100
//
// Future broker integrations may introduce other multipliers.
//
// Never hard-code 100 inside FIFO.
//
// ============================================================


// ============================================================
// 18. TIMESTAMP DETERMINISM
// ============================================================
//
// PRIORITY:
// HIGH
//
// CURRENT SORT:
//
// 1. execution timestamp
// 2. broker execution ID
// 3. execution ID
//
// This is good deterministic behavior.
//
// FUTURE:
//
// Formalize timestamp normalization across brokers.
//
// Important cases:
//
// - timezone
// - daylight savings
// - missing timestamps
// - identical timestamps
// - broker timestamp formats
//
// FIFO must produce the same result from the same execution set.
//
// ============================================================


// ============================================================
// 19. REMOVE IMPLICIT "NOW" FROM DERIVED TRADE DATA
// ============================================================
//
// PRIORITY:
// MEDIUM
//
// CURRENT:
//
// createClosedTrade() and createOpenTrade() generate:
//
// createdAt = new Date().toISOString()
//
// FUTURE:
//
// Review whether derived trade metadata should use a deterministic
// timestamp instead.
//
// Why:
//
// Re-running FIFO against identical executions should ideally
// produce identical derived output.
//
// P&L and lifecycle data should be deterministic.
//
// ============================================================


// ============================================================
// 20. FLOATING-POINT / MONEY PRECISION
// ============================================================
//
// PRIORITY:
// MEDIUM / HIGH
//
// CURRENT:
//
// EPSILON is used for quantity cleanup.
//
// P&L is rounded to two decimals.
//
// FUTURE:
//
// Review monetary precision architecture.
//
// Consider:
//
// - decimal arithmetic
// - currency precision
// - option multiplier
// - fractional shares
// - FX precision
//
// JavaScript floating-point arithmetic should not become a hidden
// source of financial discrepancies.
//
// ============================================================


// ============================================================
// 21. LARGE DATASET PERFORMANCE
// ============================================================
//
// PRIORITY:
// MEDIUM
//
// CURRENT:
//
// Execution loading is paginated at:
//
// PAGE_SIZE = 1000
//
// FUTURE:
//
// Test performance with:
//
// 10,000 executions
// 100,000 executions
// 1,000,000 executions
//
// Review:
//
// - Supabase pagination
// - memory usage
// - FIFO runtime
// - dashboard loading
// - trade reconstruction caching
//
// Do not optimize prematurely.
//
// Measure first.
//
// ============================================================


// ============================================================
// 22. INCREMENTAL FIFO RECONSTRUCTION
// ============================================================
//
// PRIORITY:
// FUTURE / HIGH SCALE
//
// CURRENT:
//
// Full execution history can be loaded and reconstructed.
//
// FUTURE:
//
// Consider incremental reconstruction:
//
// New executions
//      ↓
// Existing position state
//      ↓
// Process only new executions
//
// This could become important as user execution history grows.
//
// IMPORTANT:
//
// Do NOT implement until correctness tests exist.
//
// Deterministic full reconstruction remains the reference model.
//
// ============================================================


// ============================================================
// 23. RECONSTRUCTION RECONCILIATION
// ============================================================
//
// PRIORITY:
// HIGH
//
// Future system should automatically detect:
//
// Execution quantity ≠ reconstructed quantity
//
// For every contract/account:
//
// Opening quantity
// + additions
// - closures
// = remaining quantity
//
// This should reconcile against the reconstructed open position.
//
// ============================================================


// ============================================================
// 24. BROKER VS INTERNAL RECONCILIATION
// ============================================================
//
// PRIORITY:
// FUTURE
//
// Eventually Elite X should be able to identify:
//
// Broker position
//        VS
// Elite X reconstructed position
//
// Example:
//
// IBKR:
// QQQ 712C = 1 contract
//
// Elite X:
// QQQ 712C = 1 contract
//
// → MATCH
//
// If mismatch:
//
// → RECONCILIATION WARNING
//
// This becomes extremely valuable for production reliability.
//
// ============================================================


// ============================================================
// 25. DATA QUALITY / HEALTH DASHBOARD
// ============================================================
//
// PRIORITY:
// FUTURE
//
// Eventually expose system health:
//
// ✓ Last successful sync
// ✓ Accounts synced
// ✓ Executions imported
// ✓ Open positions
// ✓ Reconciliation status
// ✓ Data warnings
// ✓ Sync errors
//
// This turns silent data problems into visible problems.
//
// ============================================================


// ============================================================
// 26. GOLDEN DATASET
// ============================================================
//
// PRIORITY:
// HIGH
//
// Create a permanent known-good execution dataset.
//
// It should contain:
//
// - stocks
// - options
// - long
// - short
// - partial fills
// - reversals
// - expired worthless
// - multiple accounts
// - fees
// - different currencies
//
// Expected trades and P&L should be permanently documented.
//
// Every major FIFO change should run against this dataset.
//
// ============================================================


// ============================================================
// 27. DO NOT CHANGE CANONICAL ARCHITECTURE CASUALLY
// ============================================================
//
// IMPORTANT ARCHITECTURAL RULE:
//
// Broker
//   ↓
// Normalized Executions
//   ↓
// Execution Ledger
//   ↓
// Deterministic FIFO
//   ↓
// Trades
//   ↓
// Analytics
//   ↓
// Dashboard
//
// Executions = SOURCE OF TRUTH
//
// Trades = DERIVED STATE
//
// Never reverse this relationship.
//
// ============================================================


// ============================================================
// CURRENT STATUS
// ============================================================
//
// CURRENTLY VERIFIED:
//
// ✓ Multi-account IBKR sync
// ✓ Accounts with executions sync successfully
// ✓ Accounts with zero executions return success
// ✓ Server execution storage
// ✓ side column populated
// ✓ BUY / SELL preserved as execution action
// ✓ LONG / SHORT reconstructed independently
// ✓ Duplicate protection
// ✓ Full execution pagination
// ✓ Full-year re-import
// ✓ Expired-worthless results updated from current data
// ✓ FIFO reconstruction functioning
//
// CURRENT DECISION:
//
// STOP MODIFYING THE FOUNDATION.
//
// Move to manual trading/testing.
//
// Collect real-world discrepancies.
//
// Fix only evidence-based issues.
//
// ============================================================


// ============================================================
// NEXT DEVELOPMENT PRIORITY
// ============================================================
//
// 1. Manual trading/testing
//
// 2. Monitor for real discrepancies
//
// 3. Build automated FIFO regression tests
//
// 4. Build execution validation
//
// 5. Strengthen sync transaction/reconciliation
//
// 6. Expand broker abstraction
//
// 7. Improve options lifecycle handling
//
// 8. Scale performance only when measurements justify it
//
// ============================================================


// ============================================================
// GOLDEN RULE
// ============================================================
//
// DO NOT "IMPROVE" WORKING FIFO LOGIC WITHOUT A TEST.
//
// Before changing pairTrades():
//
// 1. Capture the bug.
// 2. Create a reproducible execution dataset.
// 3. Define expected trades.
// 4. Add a regression test.
// 5. Make the smallest architectural change.
// 6. Run the complete regression suite.
// 7. Verify real broker data.
//
// This prevents one fix from creating three new trading-data bugs.
//
// ============================================================