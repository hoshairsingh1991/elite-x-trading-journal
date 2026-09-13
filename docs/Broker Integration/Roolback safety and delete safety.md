# ELITE X TRADING JOURNAL

# BROKER SYNC — MASTER NOTES

**Document Type:** Master Architecture / Development / Handover Notes
**System:** Elite X Trading Journal / Trading OS
**Scope:** Broker Sync ONLY
**Primary Broker:** Interactive Brokers (IBKR)
**Current Integration:** IBKR Activity Flex Query
**Status:** Active / Production Architecture
**Last Major Checkpoint:** Atomic Execution Persistence
**Date:** September 13, 2026

---

# 1. PURPOSE OF THIS DOCUMENT

This document is the authoritative master reference for the **Broker Sync system** in Elite X Trading Journal.

It documents:

* Broker Sync architecture
* IBKR integration
* IBKR Activity Flex Query
* Multi-account broker architecture
* Manual Sync
* Automatic Cron Sync
* Fetch-before-delete behavior
* Full replacement behavior
* Atomic Broker Sync persistence
* Rollback safety
* Execution normalization
* Sync account isolation
* Rate-limit handling
* Sync error handling
* Sync logging principles
* Current implementation
* Testing
* Git checkpoints
* Protected infrastructure
* Future Broker Sync improvements

This document is intentionally separate from the Manual Entry / Manual Trade documentation.

---

# 2. CORE BROKER SYNC ARCHITECTURE

Broker Sync follows the execution-first architecture:

```text id="8u6qf4"
IBKR
  ↓
IBKR Activity Flex Query
  ↓
Fetch Broker Executions
  ↓
Normalize Executions
  ↓
Supabase Executions Ledger
  ↓
Deterministic FIFO Reconstruction
  ↓
Derived Trades
  ↓
Analytics / Dashboard
```

The critical architectural rule is:

```text id="h9x2qa"
BROKER DATA IS THE SOURCE OF TRUTH
FOR THE BROKER SYNC WINDOW.
```

The broker is authoritative for the broker executions being synchronized.

---

# 3. EXECUTIONS ARE CANONICAL

The `executions` table is the canonical execution ledger.

Broker Sync must write normalized broker executions into this ledger.

The system must not maintain a separate broker-trades source of truth.

The architecture remains:

```text id="j4f5bx"
Broker Executions
      ↓
Canonical Executions
      ↓
FIFO
      ↓
Derived Trades
```

---

# 4. BROKER SYNC DOES NOT DIRECTLY BUILD TRADES

Broker Sync does not own the FIFO engine.

Broker Sync does not manually create reconstructed Trade records.

After executions are synchronized, the existing reconstruction architecture determines:

```text id="8u7z4x"
OPEN positions
CLOSED trades
FIFO matching
P&L
fees
```

The canonical reconstruction engine remains protected.

---

# 5. PRIMARY BROKER

Current broker integration:

```text id="w8m1yq"
Interactive Brokers
```

The current import mechanism is:

```text id="x7zq3m"
IBKR Activity Flex Query
```

The Flex Query is used to retrieve broker activity/execution information for the synchronization window.

---

# 6. IBKR FLEX QUERY MODEL

The current Flex Query synchronization behavior is designed around the broker's returned execution data.

The current Flex integration synchronizes today's data.

The system fetches the broker response before modifying the local execution ledger.

This is intentional.

---

# 7. FETCH BEFORE DELETE — CRITICAL RULE

The Broker Sync system must always:

```text id="c1e7qy"
FETCH FIRST
    ↓
VALIDATE / NORMALIZE
    ↓
ONLY THEN DELETE/REPLACE
```

Never:

```text id="8c4b8f"
DELETE LOCAL DATA
    ↓
FETCH BROKER DATA
```

The second approach is dangerous because a failed broker fetch could destroy valid local data.

Therefore:

```text id="6xq7bd"
NEVER DELETE THE EXISTING SYNC WINDOW
UNTIL THE BROKER RESPONSE HAS BEEN SUCCESSFULLY RECEIVED.
```

---

# 8. WHY BROKER SYNC USES REPLACEMENT

Broker Sync intentionally uses **replace**, not merge, for the synchronized execution window.

The model is:

```text id="4x5n7r"
Broker response
      ↓
Replace affected local execution window
```

This is intentional.

Do not change Broker Sync to a merge strategy merely to avoid deleting existing rows.

---

# 9. WHY MERGE IS NOT THE DEFAULT

IBKR Flex responses can be incomplete depending on when the query is run.

A merge strategy could create stale local executions.

Example:

```text id="2qz6hc"
Local:
Trade A
Trade B
Trade C

Broker response:
Trade A
Trade B
```

If the system merges:

```text id="v7p3na"
Trade C remains locally
```

even though it was not present in the latest broker response.

That can leave stale executions.

The replacement strategy instead makes the synchronized window reflect the latest broker response.

---

# 10. BROKER RESPONSE COMPLETENESS

The Sync Engine should remain alert to obviously incomplete broker responses.

The rule is:

```text id="n2z4kp"
BROKER RESPONSE
      ↓
CHECK FOR OBVIOUS INCOMPLETENESS
      ↓
WARN / HANDLE SAFELY
```

The system should not blindly destroy a local execution window if the broker response is clearly invalid or incomplete.

This is part of the Broker Sync safety model.

---

# 11. ATOMIC BROKER SYNC ARCHITECTURE

The Broker Sync persistence path is:

```text id="4i9g2j"
IBKR Flex Fetch
      ↓
Normalized Executions
      ↓
fetchFlex.ts
      ↓
replaceBrokerExecutionsAtomically()
      ↓
Supabase RPC
      ↓
DELETE affected broker execution window
      ↓
INSERT broker executions
      ↓
COMMIT
```

If the database operation fails:

```text id="v1p0qf"
ROLLBACK
```

The previous execution state remains intact.

---

# 12. CURRENT BROKER SYNC FILE

Primary IBKR fetch file:

```text id="n3k4yb"
lib/server/brokers/ibkr/fetchFlex.ts
```

This is the main Flex Query execution-fetch integration point.

It obtains the broker data, normalizes it, and sends the execution set into the atomic replacement layer.

---

# 13. ATOMIC REPLACEMENT HELPER

Current file:

```text id="f8k2wq"
lib/server/sync/replaceBrokerExecutionsAtomically.ts
```

Responsibilities:

* receive normalized broker executions;
* receive the relevant user;
* receive the broker account;
* determine the affected execution dates;
* serialize execution data for PostgreSQL;
* deduplicate execution IDs;
* call the atomic database RPC;
* throw on database failure.

The helper does not perform FIFO reconstruction.

---

# 14. BROKER ATOMIC RPC

Current database function:

```text id="p7m5vx"
public.replace_broker_executions_atomically(
  uuid,
  text,
  text[],
  jsonb
)
```

The RPC performs the broker execution replacement at the database level.

It receives:

```text id="j7k8zr"
p_user_id
p_account
p_execution_dates
p_executions
```

---

# 15. BROKER ATOMIC REPLACEMENT LOGIC

The database operation is conceptually:

```text id="m2k9qa"
Validate request
      ↓
Delete existing executions
for:
  authenticated user
  broker account
  affected execution dates
      ↓
Insert normalized broker executions
      ↓
Return inserted count
```

The delete and insert execute within the same database transaction.

---

# 16. ROLLBACK SAFETY

The critical guarantee is:

```text id="x3p8nw"
OLD BROKER EXECUTIONS
        ↓
ATOMIC REPLACEMENT
        ↓
DELETE
        ↓
INSERT
        ↓
SUCCESS
        ↓
COMMIT
```

If insertion fails:

```text id="j8r4qc"
DELETE
  ↓
INSERT ERROR
  ↓
ROLLBACK
  ↓
OLD BROKER EXECUTIONS REMAIN
```

This prevents a failed broker synchronization from leaving the affected execution window empty.

---

# 17. WHY THIS MATTERS

Without atomic replacement:

```text id="d9f5sw"
DELETE succeeds
      ↓
INSERT fails
      ↓
BROKER DATA DISAPPEARS LOCALLY
```

With atomic replacement:

```text id="x5r2hp"
DELETE succeeds
      ↓
INSERT fails
      ↓
DATABASE ROLLS BACK
      ↓
OLD DATA REMAINS
```

For financial/trading data, the second behavior is required.

---

# 18. BROKER ACCOUNT ISOLATION

Elite X supports multiple IBKR accounts.

Broker Sync must treat each broker account independently.

Current architecture includes broker/account identity when replacing executions.

The replacement operation is scoped by:

```text id="g8c4zn"
user_id
+
broker account
+
execution dates
```

This prevents one account's sync from deleting another account's execution data.

---

# 19. MULTI-ACCOUNT ARCHITECTURE

The previous architecture had a single hardcoded IBKR connection.

That architecture was replaced with true multi-account support.

The system can now maintain multiple IBKR broker connections for a user.

Example conceptual structure:

```text id="q1m8dc"
User
 ├── IBKR Account A
 ├── IBKR Account B
 └── IBKR Account C
```

Each broker account has its own credentials/configuration and synchronization context.

---

# 20. SYNC ALL BROKERS

The synchronization architecture contains:

```text id="n6x4vt"
syncAllBrokers()
```

This iterates through active broker connections and calls the appropriate broker-specific synchronization logic.

The important rule is account isolation.

One invalid broker account should not necessarily prevent valid accounts from being synchronized.

---

# 21. INVALID BROKER ACCOUNT HANDLING

A previous failure mode involved one IBKR account having:

```text id="q6k2vf"
invalid token
```

or:

```text id="x8j3mp"
incorrect Flex Query configuration
```

The desired multi-account behavior is:

```text id="g5y8rc"
Account A → SUCCESS
Account B → ERROR
Account C → SUCCESS
```

rather than:

```text id="b9w2kp"
Account A → SUCCESS
Account B → ERROR
Account C → NEVER SYNCHED
```

A single invalid account should not unnecessarily destroy the entire multi-account synchronization process.

---

# 22. MANUAL SYNC

Manual Sync is initiated by the user during trading hours.

Its purpose is to allow the user to refresh current broker data without waiting for the scheduled synchronization.

The architecture is:

```text id="q7v2mx"
User
 ↓
Manual Sync
 ↓
Authenticated request
 ↓
User's active broker accounts
 ↓
IBKR Flex
 ↓
Atomic replacement
```

---

# 23. MANUAL SYNC MUST BE PER-USER

A previous issue caused a manual synchronization to run against both users' broker accounts.

That behavior was incorrect.

Manual Sync must be scoped to the authenticated user.

Correct:

```text id="c9z5kr"
User A manual sync
→ User A's active broker accounts only
```

Not:

```text id="h3v7pq"
User A manual sync
→ User A + User B
```

---

# 24. MANUAL SYNC AUTHENTICATION

A previous Manual Sync issue returned:

```text id="x2v8nb"
401 Unauthorized
```

The cause was a missing Authorization header.

The Manual Sync request was corrected to include the user's session access token.

The server can therefore authenticate the requesting user before synchronizing broker accounts.

---

# 25. AUTOMATIC CRON SYNC

Broker Sync also supports automatic scheduled synchronization.

Current intended model:

```text id="f5n9qy"
Automatic Cron
    ↓
Runs every evening
    ↓
Three scheduled sync executions
    ↓
Synchronizes users' active IBKR accounts
```

This is distinct from Manual Sync.

Manual Sync is user initiated.

Cron Sync is system initiated.

---

# 26. TWO SYNC MODES

The system therefore has two primary sync modes:

```text id="m8q3xz"
1. Manual Sync
   User initiated
   Per-user
   Trading hours

2. Automatic Sync
   Scheduled
   System initiated
   Evening
```

These modes should not be accidentally merged into one authorization or execution behavior.

---

# 27. RATE LIMIT HANDLING

IBKR Flex Query requests require controlled pacing.

The current implementation includes:

```text id="k7p2vd"
3-second delay between brokers
```

This reduces the risk of excessive requests when multiple broker accounts are synchronized.

The delay is especially relevant for:

```text id="d4x9qm"
multi-account sync
```

---

# 28. ZERO-EXECUTION SYNC

A broker may legitimately return zero executions for the synchronization window.

Example:

```text id="w2c7bn"
TFSA Account
→ 0 executions

Margin Account
→ 0 executions
```

A zero-execution response is not automatically a database failure.

The system must distinguish between:

```text id="z5m4pk"
valid empty broker response
```

and:

```text id="q8n6rx"
invalid / incomplete / failed broker response
```

---

# 29. IMPORTANT TESTING LIMITATION

A real IBKR sync performed during testing returned zero executions for the tested accounts.

Therefore, the real-world synchronization test did not exercise the actual:

```text id="c4j7vz"
DELETE + INSERT
```

replacement branch with live execution data.

However, the atomic database rollback behavior was tested independently.

This distinction should remain documented rather than claiming that a live populated sync replacement was fully exercised when it was not.

---

# 30. BROKER ROLLBACK TEST

The atomic replacement RPC was intentionally tested with invalid execution data.

The test introduced an invalid field such as:

```text id="y6r2wm"
quantity = null
```

which caused the insert operation to fail.

The expected behavior was:

```text id="k3m8qa"
DELETE
   ↓
INSERT ERROR
   ↓
ROLLBACK
```

The rollback test succeeded.

Therefore the database-level atomic safety mechanism is verified.

---

# 31. BROKER SYNC NORMALIZATION

Broker responses must be converted into the normalized execution format expected by the canonical execution ledger.

The normalization layer is responsible for producing fields such as:

```text id="r7q4wp"
id
date
ticker
contract
contractKey
side
quantity
executionPrice
executionValue
fees
account
assetType
multiplier
currency
feeCurrency
brokerExecutionId
action
executionTimestamp
userId
```

The exact current implementation must be treated as authoritative in the source files.

---

# 32. BROKER EXECUTION IDENTIFICATION

Broker executions retain their broker identity through:

```text id="x8c2mp"
brokerExecutionId
```

Execution IDs are used for stable execution identity and deduplication.

The atomic replacement helper deduplicates execution IDs before sending the payload to the database.

---

# 33. IDEMPOTENCY

Broker Sync must be idempotent.

Meaning:

```text id="b7m4zc"
Run the same broker synchronization
multiple times
      ↓
Final execution state should remain equivalent
```

The replacement model naturally supports this because the affected broker window is replaced by the broker's current execution response rather than repeatedly merged.

---

# 34. WHY IDEMPOTENCY MATTERS

Without idempotency, repeated synchronization could create:

```text id="f8k2dn"
duplicate executions
```

or:

```text id="q3m7vz"
duplicate downstream trades
```

The execution ledger must therefore remain deterministic.

---

# 35. SYNC WINDOW

Broker Sync operates on a defined execution window.

The current Flex implementation is focused on today's data.

The affected execution dates are explicitly passed to the atomic replacement layer.

The replacement operation therefore knows which dates must be replaced.

---

# 36. REPLACEMENT SCOPE

The atomic broker replacement is scoped using:

```text id="s7k3qm"
user_id
broker account
execution dates
```

The database deletes only executions matching those dimensions before inserting the newly normalized broker executions.

This is critical for multi-account safety.

---

# 37. BROKER SYNC MUST NOT TOUCH MANUAL EXECUTIONS

Manual executions and broker executions coexist in the canonical `executions` ledger.

Broker Sync must never delete Manual Trade executions.

Broker replacement must be scoped to the synchronized broker account and execution window.

Manual executions are identified by their Manual contract-key convention.

Broker Sync must preserve them.

---

# 38. BROKER SYNC VS MANUAL ENTRY

These systems feed the same canonical execution ledger but have different responsibilities.

```text id="p8m5xc"
MANUAL ENTRY
→ creates user-entered executions

BROKER SYNC
→ imports broker executions
```

Both ultimately feed:

```text id="j7x3vn"
executions
    ↓
pairTrades()
```

They should not maintain separate FIFO engines.

---

# 39. BROKER SYNC VS MANUAL DELETE

Manual Delete operates on Manual executions.

Broker Sync operates on broker executions.

These operations must remain isolated.

Conceptually:

```text id="n4c8vy"
Manual Delete
→ MANUAL-* executions only

Broker Sync
→ specific broker account + broker sync window
```

Neither system should accidentally modify the other's canonical execution data.

---

# 40. SYNC ERROR HANDLING

Every broker synchronization attempt should have a clear result.

Possible outcomes include:

```text id="u7k2mz"
SUCCESS
EMPTY
FAILED
INVALID CONFIGURATION
INVALID TOKEN
INCOMPLETE RESPONSE
```

The synchronization system should preserve account-level failure information rather than collapsing every failure into a generic system failure.

---

# 41. SYNC LOGGING

The Sync Engine should log every sync attempt.

A sync log should conceptually allow investigation of:

```text id="m5x8qr"
who
which broker
which account
when
sync type
result
execution count
error
affected window
```

Logging is important for diagnosing production synchronization problems.

---

# 42. BROKER SYNC FAILURE PRINCIPLE

A failed fetch should not destroy existing data.

Correct:

```text id="y9p4kx"
FETCH FAILS
      ↓
NO DELETE
      ↓
EXISTING LOCAL DATA REMAINS
```

A database replacement failure should also preserve the previous state:

```text id="n8c3wm"
FETCH SUCCESS
      ↓
ATOMIC REPLACEMENT FAILS
      ↓
ROLLBACK
      ↓
PREVIOUS DATA REMAINS
```

Both failure boundaries are important.

---

# 43. TWO-LAYER SAFETY MODEL

Broker Sync therefore has two distinct safety boundaries.

### Layer 1 — Fetch Safety

```text id="c5m7qx"
Broker fetch must succeed
before replacement begins.
```

### Layer 2 — Database Atomicity

```text id="z2n8kp"
Delete + insert must succeed together.
```

Combined:

```text id="f4x7mc"
IBKR Fetch
    ↓
Valid Response
    ↓
Atomic DB Replacement
    ↓
Success
```

Failure at either stage must not unnecessarily destroy valid local data.

---

# 44. PROTECTED FIFO ENGINE

Broker Sync must not modify the FIFO implementation merely because new broker data is imported.

Protected file:

```text id="v8m3qx"
lib/parsers/pairTrades.ts
```

Broker Sync supplies executions.

`pairTrades()` reconstructs the resulting trade state.

---

# 45. PROTECTED DASHBOARD

Broker Sync must not directly rewrite Dashboard V2 logic.

Dashboard V2 consumes derived trading data.

Broker Sync's responsibility ends at maintaining correct canonical executions.

---

# 46. PROTECTED DATA FLOW

The complete protected flow is:

```text id="r5x8mw"
IBKR
 ↓
Flex Query
 ↓
Normalized Broker Executions
 ↓
Canonical executions ledger
 ↓
pairTrades()
 ↓
Trades
 ↓
Analytics
 ↓
Dashboard V2
```

Broker Sync owns the left side of this pipeline.

---

# 47. CURRENT ATOMIC BROKER SYNC FILES

Primary files:

```text id="m7q4xz"
lib/server/brokers/ibkr/fetchFlex.ts

lib/server/sync/replaceBrokerExecutionsAtomically.ts
```

Database:

```text id="b8n3kp"
public.replace_broker_executions_atomically(...)
```

---

# 48. DATABASE SECURITY

The Broker Sync atomic RPC uses:

```text id="k5v8qm"
SECURITY DEFINER
set search_path = public
```

Execution permissions were configured so that:

```text id="p7x2nz"
public → REVOKED
service_role → GRANTED
```

The privileged database operation is therefore intended to be invoked through trusted server-side code.

---

# 49. SERVER-SIDE SUPABASE CLIENT

The atomic Broker Sync helper uses:

```text id="q8m4yc"
supabaseAdmin
```

The privileged database operation remains server-side.

Client-side code must not directly receive or use the service-role key.

---

# 50. MULTI-ACCOUNT FAILURE ISOLATION

When multiple IBKR accounts are configured:

```text id="x4n7qm"
Account A
Account B
Account C
```

the synchronization loop should treat them independently.

A failure in Account B should be represented as an Account B failure.

It should not automatically erase successful synchronization results for Account A or C.

---

# 51. ACCOUNT CONFIGURATION ERRORS

Common account-specific errors may include:

```text id="z7m2cx"
invalid token
incorrect Flex Query ID
invalid broker configuration
failed reference code retrieval
```

The system should report the account-specific failure and continue where the architecture permits.

---

# 52. FAILED REFERENCE CODE RETRIEVAL

A previously observed IBKR failure was:

```text id="c4m8yz"
Failed to retrieve reference code
```

This is an IBKR/Flex integration error.

It should be handled as an account-level sync failure rather than corrupting unrelated broker account data.

---

# 53. MANUAL SYNC ERROR HANDLING

Manual Sync must not assume every configured broker account is valid.

Correct conceptual behavior:

```text id="q9x3mv"
Manual Sync
 ↓
Account A → sync
Account B → error
Account C → sync
 ↓
Return account-level results
```

The UI should be able to communicate which accounts succeeded and which failed.

---

# 54. AUTOMATIC SYNC ERROR HANDLING

Cron synchronization should similarly isolate account failures.

A single bad broker configuration should not cause all users/accounts to become unusable.

The cron system should record the failed account and continue processing other eligible accounts where supported.

---

# 55. BROKER SYNC TESTING CHECKLIST

Every significant Broker Sync change should test:

```text id="f3m7xc"
✓ Valid broker response
✓ Empty broker response
✓ Invalid broker token
✓ Invalid Flex configuration
✓ Multiple broker accounts
✓ One account failing while another succeeds
✓ Fetch-before-delete behavior
✓ Replacement behavior
✓ Duplicate execution handling
✓ Atomic rollback
✓ User/account isolation
✓ Manual Sync
✓ Automatic Sync
✓ Rate-limit pacing
✓ Sync logging
✓ FIFO reconstruction after sync
```

---

# 56. ATOMIC DATABASE TESTING CHECKLIST

Database-level testing should include:

```text id="y5q8mc"
✓ Valid replacement
✓ Invalid execution payload
✓ Failed insert
✓ Rollback after failed insert
✓ Correct user scope
✓ Correct broker account scope
✓ Correct date scope
✓ Zero execution response
✓ Duplicate execution IDs
```

---

# 57. CURRENT TEST RESULTS

The atomic Broker Sync database rollback test was successfully completed.

An intentionally invalid execution payload caused the insertion to fail.

The database rolled back the replacement operation.

This verified the intended transaction safety.

---

# 58. LIVE IBKR TEST LIMITATION

The real IBKR sync test performed during development returned:

```text id="n4c7xp"
0 executions
```

for the tested accounts.

Therefore the live test did not exercise a populated:

```text id="k8m3qy"
existing executions
      ↓
delete
      ↓
insert new broker executions
```

replacement.

The database-level rollback test did verify the critical atomic behavior independently.

Do not represent the empty live sync as a full populated replacement test.

---

# 59. GIT CHECKPOINT

Atomic Broker Sync was included in the checkpoint:

```text id="v6q2mx"
Commit:
0a6b6de

Message:
Checkpoint: Atomic execution persistence
```

The checkpoint was pushed to:

```text id="c8m5zn"
origin/main
```

This checkpoint included:

```text id="h3q7vx"
components/trades/EditTradeModal.tsx

lib/server/brokers/ibkr/fetchFlex.ts

lib/server/sync/replaceBrokerExecutionsAtomically.ts

app/api/trades/edit/route.ts

lib/server/trades/replaceManualExecutionsAtomically.ts
```

The Broker Sync atomic replacement implementation is therefore part of the committed production development history.

---

# 60. BROKER SYNC MASTER RULES

The following rules are mandatory:

```text id="p4x8mz"
1. IBKR is the source of truth for the synchronized broker window.

2. Always fetch broker data before deleting local data.

3. Never delete before a successful broker fetch.

4. Replace the affected broker execution window; do not casually change this to merge.

5. Delete + insert must be atomic.

6. A failed database replacement must roll back.

7. Sync operations must be idempotent.

8. Broker accounts must remain isolated.

9. Users must remain isolated.

10. Manual executions must not be deleted by Broker Sync.

11. One invalid broker account should not unnecessarily stop valid accounts.

12. Rate-limit pacing must be respected.

13. Every sync attempt should be logged.

14. Obviously incomplete broker responses must be handled safely.

15. Broker Sync must not create a second FIFO engine.

16. Broker Sync must not directly persist reconstructed trades.

17. pairTrades() remains the authoritative reconstruction engine.
```

---

# 61. WHAT HAS BEEN COMPLETED

Current Broker Sync hardening includes:

```text id="w7m4qx"
✓ IBKR Flex Query integration
✓ Today's execution synchronization
✓ Multi-account IBKR architecture
✓ Per-user manual synchronization
✓ Session token authentication for Manual Sync
✓ Automatic scheduled synchronization
✓ Account-level sync iteration
✓ 3-second broker pacing
✓ Fetch-before-delete architecture
✓ Replace-not-merge execution strategy
✓ Execution normalization
✓ Atomic broker replacement helper
✓ Atomic database replacement RPC
✓ Transaction rollback safety
✓ Broker account scoping
✓ User scoping
✓ Execution ID deduplication
✓ Broker sync idempotency design
✓ Invalid account failure handling design
✓ Sync logging requirement
✓ Build verification
✓ Database rollback verification
✓ Git checkpoint
```

---

# 62. CURRENT STATUS

## IBKR Flex Integration

```text id="m8q4vx"
STATUS: ACTIVE
```

## Multi-Account Broker Architecture

```text id="r5z7kc"
STATUS: IMPLEMENTED
```

## Manual Sync

```text id="n2x8qp"
STATUS: IMPLEMENTED
```

## Automatic Sync

```text id="q6m3vz"
STATUS: IMPLEMENTED
```

## Fetch-Before-Delete

```text id="y8k4mx"
STATUS: IMPLEMENTED
```

## Replace-Not-Merge

```text id="c7p2zn"
STATUS: IMPLEMENTED
```

## Atomic Broker Replacement

```text id="v4m9qx"
STATUS: COMPLETE
```

## Rollback Safety

```text id="x3k7mc"
STATUS: VERIFIED
```

---

# 63. FUTURE BROKER SYNC WORK

Future Broker Sync work should focus on improvements such as:

```text id="m9q4vx"
sync observability
account-level reporting
incomplete-response detection
additional broker validation
sync history
retry strategy
production monitoring
expanded date-window synchronization
additional broker integrations
```

These are future improvements and should not be mixed into the already completed Atomic Replacement work without a specific reason.

---

# 64. DO NOT REGRESS THESE BEHAVIORS

Future Broker Sync changes must preserve:

```text id="q7m3vx"
FETCH
  ↓
VALIDATE
  ↓
ATOMIC REPLACE
  ↓
RECONSTRUCT
```

Never regress to:

```text id="x4n8mc"
DELETE
  ↓
FETCH
```

Never replace the current deterministic execution model with an uncontrolled merge.

Never allow one user's broker synchronization to modify another user's executions.

Never allow one IBKR account to delete another account's execution window.

Never allow Broker Sync to delete Manual Trade executions.

---

# 65. CURRENT BROKER SYNC ARCHITECTURE

The intended production architecture is:

```text id="c5m8qx"
                    IBKR
                      │
                      ▼
              Activity Flex Query
                      │
                      ▼
              Broker Response
                      │
                      ▼
             Validate / Normalize
                      │
                      ▼
        replaceBrokerExecutionsAtomically()
                      │
                      ▼
              Supabase RPC
                      │
              ┌───────┴───────┐
              │               │
           DELETE           INSERT
              │               │
              └───────┬───────┘
                      │
                 TRANSACTION
                      │
                ┌─────┴─────┐
                │           │
             SUCCESS      FAILURE
                │           │
              COMMIT      ROLLBACK
                │           │
                └─────┬─────┘
                      ▼
              Canonical Executions
                      │
                      ▼
                 pairTrades()
                      │
                      ▼
              Derived Trades / P&L
                      │
                      ▼
               Analytics / UI
```

---

# 66. FINAL BROKER SYNC PRINCIPLE

The most important Broker Sync rule is:

```text id="a8q3mx"
NEVER DESTROY THE EXISTING EXECUTION WINDOW
UNTIL WE HAVE SUCCESSFULLY FETCHED THE BROKER DATA
THAT WILL REPLACE IT.

AND ONCE REPLACEMENT BEGINS:

DELETE + INSERT MUST SUCCEED TOGETHER.
```

Therefore:

```text id="j5m9qx"
BROKER FETCH SAFETY
        +
DATABASE ATOMICITY
        +
ACCOUNT ISOLATION
        +
USER ISOLATION
        +
DETERMINISTIC RECONSTRUCTION
```

form the foundation of the Broker Sync system.

---

# 67. HANDOVER SUMMARY

Broker Sync is an execution-ingestion system, not a trade-generation system.

IBKR Activity Flex Query supplies broker execution data.

The system fetches broker data before modifying the local execution ledger.

The affected broker execution window is replaced rather than merged.

The replacement is performed atomically through a server-side helper and PostgreSQL RPC.

If the database replacement fails, the transaction rolls back and the previous execution state remains intact.

Multiple IBKR accounts are supported and must remain isolated.

Manual Sync is user initiated and must operate only against the authenticated user's broker accounts.

Automatic Sync runs independently through the scheduled synchronization system.

IBKR request pacing includes a three-second delay between brokers.

Invalid broker accounts must be handled at the account level wherever possible so valid accounts can continue synchronizing.

The canonical execution ledger remains the source of truth.

`pairTrades()` remains the authoritative FIFO/reconstruction engine.

Broker Sync must never create a second trade engine or directly persist reconstructed trades.

The Atomic Broker Sync persistence work has been implemented, rollback-tested, build-verified, committed, and pushed.

---

# END OF BROKER SYNC MASTER NOTES
