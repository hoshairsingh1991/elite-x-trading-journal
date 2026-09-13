# ELITE X TRADING JOURNAL

# COMBINED EXECUTION ARCHITECTURE — MASTER NOTES

**Document Type:** Master Architecture / Development / Handover Notes
**System:** Elite X Trading Journal / Trading OS
**Scope:** Manual Entry + Broker Sync + Canonical Execution Architecture
**Primary Broker:** Interactive Brokers (IBKR)
**Current Integration:** IBKR Activity Flex Query
**Status:** Active Development
**Last Major Work:** Atomic Execution Persistence
**Date:** September 13, 2026

---

# 1. PURPOSE OF THIS DOCUMENT

This is the **combined master architecture document** for the execution and trade lifecycle system in Elite X Trading Journal.

It connects the two major execution-ingestion paths:

```text id="9x2m7c"
                    ELITE X
                       │
             ┌─────────┴─────────┐
             │                   │
       MANUAL ENTRY          BROKER SYNC
             │                   │
             ▼                   ▼
     Normalized Executions  Normalized Executions
             │                   │
             └─────────┬─────────┘
                       ▼
              CANONICAL EXECUTION
                    LEDGER
                       │
                       ▼
                 pairTrades()
                       │
                       ▼
              DERIVED TRADES /
                 POSITIONS
                       │
                       ▼
             P&L / ANALYTICS /
                  DASHBOARD
```

This document explains how the entire architecture fits together.

---

# 2. MOST IMPORTANT ARCHITECTURAL PRINCIPLE

Elite X is an:

```text id="7q4m9x"
EXECUTION-FIRST SYSTEM
```

The canonical data flow is:

```text id="c8n3vy"
Input Source
    ↓
Normalized Executions
    ↓
Supabase Executions Ledger
    ↓
Deterministic FIFO Reconstruction
    ↓
Derived Trades / Positions
    ↓
P&L / Analytics / Dashboard
```

The fundamental rule is:

```text id="k5m8qx"
EXECUTIONS ARE THE SOURCE OF TRUTH.

TRADES AND POSITIONS ARE DERIVED STATE.
```

This rule governs both Manual Entry and Broker Sync.

---

# 3. TWO EXECUTION SOURCES

Elite X currently has two primary execution ingestion paths.

```text id="v7x3qm"
1. Manual Entry
2. Broker Sync
```

### Manual Entry

User manually enters a trade.

### Broker Sync

Broker data is imported from IBKR.

Both paths ultimately produce normalized executions.

Both paths write into the same canonical execution ledger.

Both paths eventually feed the same FIFO/reconstruction engine.

---

# 4. COMBINED DATA FLOW

The complete system is:

```text id="m4q8vz"
                    ┌────────────────────┐
                    │    MANUAL ENTRY    │
                    └─────────┬──────────┘
                              │
                              ▼
                    Normalized Executions
                              │
                              │
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    │                    │
                    ▼                    ▼
             ┌──────────────┐     ┌──────────────┐
             │  BROKER SYNC │     │ MANUAL EDIT  │
             │     IBKR     │     │ / DELETE     │
             └──────┬───────┘     └──────┬───────┘
                    │                    │
                    ▼                    ▼
             Normalized Data       Atomic Persistence
                    │                    │
                    └──────────┬─────────┘
                               ▼
                    CANONICAL EXECUTIONS
                         SUPABASE LEDGER
                               │
                               ▼
                         pairTrades()
                               │
                               ▼
                      DERIVED TRADES /
                         POSITIONS
                               │
                               ▼
                      ANALYTICS / P&L /
                         DASHBOARD
```

The important point is that Manual Entry and Broker Sync converge at the execution ledger.

---

# 5. CANONICAL EXECUTION LEDGER

The `executions` table is the canonical ledger.

Important fields include:

```text id="n8q4xc"
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
```

The exact current database schema remains authoritative in Supabase.

---

# 6. EXECUTION IDENTITY

Every execution requires a stable identity.

Broker executions retain their broker execution identity through:

```text id="r5m8qx"
brokerExecutionId
```

Manual executions use their generated execution identity and Manual contract-key convention.

The execution ID is particularly important for exact Partial Exit operations.

---

# 7. MANUAL EXECUTION IDENTIFICATION

Manual execution lifecycles use a contract key beginning with:

```text id="k7x2mc"
MANUAL-
```

The existing FIFO code identifies Manual executions using this convention.

This convention is also used by Manual Delete to ensure the destructive operation is restricted to Manual Trade data.

---

# 8. BROKER EXECUTION IDENTIFICATION

Broker executions are associated with the corresponding broker account and broker execution identity.

Broker replacement is scoped by:

```text id="p4m8vz"
user_id
broker account
execution dates
```

This ensures that Broker Sync does not replace unrelated execution data.

---

# 9. MANUAL ENTRY

Manual Entry is the user-facing path for manually recorded trades.

The conceptual flow is:

```text id="q6x3mv"
User Input
    ↓
Manual Execution Creation
    ↓
Normalized Execution
    ↓
executions table
    ↓
pairTrades()
    ↓
Derived Trade
```

Manual Entry does not create an independent FIFO system.

---

# 10. MANUAL TRADE LIFECYCLE

Manual trades can contain:

```text id="w8m3qy"
Entry
+
Partial Exits
```

Example:

```text id="c7x4nm"
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20
SELL 20
```

The five exits represent one underlying Manual Trade lifecycle.

The execution ledger remains canonical.

---

# 11. COMPLETE MANUAL TRADE

A Complete Trade lifecycle may look like:

```text id="q5n8xm"
BUY 100
SELL 100
```

Manual Edit or Delete of the complete lifecycle operates at the lifecycle level using:

```text id="m4x7qc"
contract_key
```

---

# 12. PARTIAL MANUAL EXIT

Partial exits operate at the individual execution level.

Example:

```text id="v8q2mx"
BUY 100
SELL 20  ← Exit 1
SELL 20  ← Exit 2
SELL 20  ← Exit 3
SELL 20  ← Exit 4
SELL 20  ← Exit 5
```

If Exit 4 is deleted, only that execution is removed.

The other exits remain.

---

# 13. CORRECT PARTIAL EXIT DELETE BEHAVIOR

Starting:

```text id="x4m7vz"
100 entered
100 exited
0 open
```

Delete one 20-share exit:

```text id="c9q3mx"
100 entered
80 exited
20 open
```

The system does not manually create the 20-share position.

Instead:

```text id="n5x8qm"
Delete canonical execution
        ↓
pairTrades()
        ↓
20 shares naturally remain OPEN
```

This is the correct behavior.

---

# 14. NO MANUAL POSITION RESTORATION

Never implement:

```text id="q8m4xc"
Delete exit
→ manually restore quantity
```

The execution ledger already contains the correct information.

The correct architecture is:

```text id="y3v7mq"
Executions
    ↓
FIFO
    ↓
Derived Position
```

This avoids duplicate state management.

---

# 15. FIFO / RECONSTRUCTION

The authoritative FIFO implementation is:

```text id="x7m4qz"
lib/parsers/pairTrades.ts
```

`pairTrades()` is responsible for:

* deterministic execution sorting;
* position buckets;
* LONG/SHORT separation;
* FIFO matching;
* closed trade creation;
* open trade creation;
* fee handling;
* remaining quantity;
* trade reconstruction.

Manual and broker operations must feed this system rather than duplicate it.

---

# 16. PROTECTED FIFO ENGINE

`pairTrades.ts` is protected infrastructure.

Do not modify it merely to support:

```text id="m8q3vx"
Manual Entry
Manual Edit
Manual Delete
Broker Sync
```

If the execution ledger is correct, reconstruction should derive the correct state.

Only modify FIFO code when a concrete FIFO defect is independently identified and verified.

---

# 17. MANUAL EDIT

Manual Edit originally had a client-side destructive sequence.

The old conceptual model was:

```text id="q4x7mn"
DELETE old executions
      ↓
INSERT corrected executions
```

This was unsafe because the delete could succeed while the insert failed.

---

# 18. ATOMIC MANUAL EDIT

Manual Edit now uses:

```text id="m8q2vx"
EditTradeModal
      ↓
POST /api/trades/edit
      ↓
Authenticated User
      ↓
replaceManualExecutionsAtomically()
      ↓
Supabase RPC
      ↓
Atomic DELETE + INSERT
```

---

# 19. MANUAL EDIT FILES

Current implementation:

```text id="p7x3mq"
components/trades/EditTradeModal.tsx

app/api/trades/edit/route.ts

lib/server/trades/replaceManualExecutionsAtomically.ts
```

Database:

```text id="x4m8vc"
public.replace_manual_executions_atomically(...)
```

---

# 20. MANUAL EDIT ROLLBACK SAFETY

The persistence guarantee is:

```text id="q7m4xz"
OLD EXECUTIONS
      ↓
ATOMIC OPERATION
      ↓
DELETE + INSERT
      ↓
SUCCESS → COMMIT
ERROR   → ROLLBACK
```

If the replacement fails:

```text id="v8x3mq"
OLD DATA REMAINS
```

The system must never leave the lifecycle half-deleted.

---

# 21. MANUAL EDIT MODES

Manual Edit supports two important modes.

### Partial Exit

```text id="n4q7xm"
deleteMode = "execution_id"
```

Only the exact selected exit is replaced.

### Complete/Open Lifecycle

```text id="c8m3vq"
deleteMode = "contract_key"
```

The lifecycle is replaced together.

This distinction is mandatory.

---

# 22. MANUAL DELETE

Manual Delete now follows:

```text id="x7q4mc"
EditTradeModal
      ↓
POST /api/trades/delete
      ↓
Authenticated User
      ↓
deleteManualExecutionsAtomically()
      ↓
Supabase RPC
      ↓
Executions deleted
      ↓
Reload
      ↓
pairTrades()
```

---

# 23. MANUAL DELETE FILES

Current implementation:

```text id="m5x8vq"
components/trades/EditTradeModal.tsx

app/api/trades/delete/route.ts

lib/server/trades/deleteManualExecutionsAtomically.ts
```

Database:

```text id="q4n7mc"
public.delete_manual_executions_atomically(...)
```

---

# 24. EXACT PARTIAL EXIT DELETE

For:

```text id="v8m2qx"
deleteMode = "execution_id"
```

the database requires:

```text id="c7x4mn"
execution ID
+
user ID
+
MANUAL-* contract key
```

Only that execution is deleted.

---

# 25. COMPLETE LIFECYCLE DELETE

For:

```text id="q3m8vx"
deleteMode = "contract_key"
```

the database requires a Manual contract key:

```text id="x7n4mc"
MANUAL-*
```

The deletion is scoped to:

```text id="m5q8vz"
contract_key
+
user_id
```

The entire Manual lifecycle is deleted.

---

# 26. MANUAL DELETE SAFETY

Manual Delete must preserve these rules:

```text id="p8x3mq"
1. Partial Exit → exact execution ID.

2. Complete lifecycle → contract key.

3. User ownership → authenticated user ID.

4. Manual-only lifecycle protection.

5. Zero-row deletion → error.

6. No direct reconstructed-trade deletion.

7. No manual position restoration.

8. FIFO reconstruction remains authoritative.
```

---

# 27. MANUAL DELETE ROLLBACK / TRANSACTION SAFETY

The delete RPC is a database-level destructive operation.

The RPC validates the request, performs the delete, checks the affected row count, and raises an exception if no matching Manual execution exists.

If an exception occurs:

```text id="c4m7vx"
DATABASE OPERATION
      ↓
ERROR
      ↓
ROLLBACK
```

The operation therefore fails safely rather than silently reporting success.

---

# 28. MANUAL DELETE ZERO-ROW SAFETY TEST

A nonexistent execution was intentionally tested.

The RPC returned:

```text id="n8x4mq"
ERROR: No matching manual execution was found.
```

This confirms the zero-row safety guard is functioning.

---

# 29. REAL MANUAL DELETE TEST

Real Manual Entries were created and then deleted through the application UI.

Observed result:

```text id="q7m3vx"
Create Manual Entries
      ↓
Delete through UI
      ↓
Reload
      ↓
Normal behavior
```

The real application deletion path therefore behaved as designed.

---

# 30. BROKER SYNC

Broker Sync is the broker-side execution ingestion path.

Current broker:

```text id="x8m4qz"
Interactive Brokers (IBKR)
```

Current import mechanism:

```text id="m7q3vx"
IBKR Activity Flex Query
```

---

# 31. BROKER SYNC DATA FLOW

The Broker Sync path is:

```text id="c5x8mq"
IBKR
 ↓
Activity Flex Query
 ↓
Broker Response
 ↓
Normalize Executions
 ↓
Atomic Broker Replacement
 ↓
Canonical Executions
 ↓
pairTrades()
 ↓
Derived Trades
```

---

# 32. FETCH BEFORE DELETE

The most important Broker Sync safety rule:

```text id="q8m3vx"
FETCH FIRST
    ↓
VALIDATE / NORMALIZE
    ↓
ONLY THEN REPLACE
```

Never:

```text id="v4x7mc"
DELETE LOCAL DATA
    ↓
FETCH BROKER DATA
```

A failed broker fetch must not destroy valid local executions.

---

# 33. BROKER REPLACEMENT VS MERGE

Broker Sync intentionally uses replacement rather than merge.

The logic is:

```text id="m8q4xz"
Broker response for affected window
      ↓
Replace local broker executions
```

This prevents stale executions from surviving when they are absent from the latest broker response.

---

# 34. WHY MERGE IS DANGEROUS

Example:

```text id="c7m3vx"
LOCAL:
A
B
C

LATEST BROKER RESPONSE:
A
B
```

Merge produces:

```text id="x8q4mn"
A
B
C  ← stale
```

Replacement produces:

```text id="q5m7vz"
A
B
```

Therefore replacement is the intended behavior for the synchronized window.

---

# 35. BROKER RESPONSE COMPLETENESS

The broker response should be checked for obvious incompleteness or invalidity before local replacement.

The principle is:

```text id="m4x8qc"
BROKER RESPONSE
      ↓
SANITY / COMPLETENESS CHECK
      ↓
SAFE REPLACEMENT
```

A clearly invalid broker response must not blindly destroy local data.

---

# 36. ATOMIC BROKER REPLACEMENT

Current helper:

```text id="x7m3qv"
lib/server/sync/replaceBrokerExecutionsAtomically.ts
```

Primary IBKR file:

```text id="c4x8mz"
lib/server/brokers/ibkr/fetchFlex.ts
```

Database RPC:

```text id="q7m4vc"
public.replace_broker_executions_atomically(...)
```

---

# 37. BROKER ATOMIC REPLACEMENT INPUTS

The atomic helper receives:

```text id="m8x3qv"
user_id
broker account
execution dates
normalized executions
```

Execution IDs are deduplicated before database persistence.

---

# 38. BROKER ATOMIC REPLACEMENT

The database operation is conceptually:

```text id="c7q4mx"
Validate
    ↓
Delete matching broker executions
    ↓
Insert new normalized broker executions
    ↓
Return inserted count
```

The delete and insert are performed transactionally.

---

# 39. BROKER ROLLBACK SAFETY

Correct behavior:

```text id="x8m3qv"
Existing Broker Executions
        ↓
Atomic Replacement
        ↓
DELETE
        ↓
INSERT
        ↓
SUCCESS
        ↓
COMMIT
```

Failure:

```text id="q4x7mz"
DELETE
   ↓
INSERT ERROR
   ↓
ROLLBACK
   ↓
Existing Data Remains
```

---

# 40. BROKER ROLLBACK TEST

An intentionally invalid execution payload was used to force the database insertion to fail.

Example invalid condition:

```text id="m7x4qc"
quantity = null
```

The insert failed.

The atomic replacement rolled back.

The rollback behavior was successfully verified.

---

# 41. LIVE BROKER TEST LIMITATION

During real IBKR testing, the tested accounts returned:

```text id="c8m4vx"
0 executions
```

Therefore the populated live replacement branch was not exercised during that specific test.

The database-level rollback test independently verified the atomic replacement behavior.

This distinction must remain documented.

---

# 42. MULTI-ACCOUNT IBKR ARCHITECTURE

Elite X supports multiple IBKR accounts.

Conceptually:

```text id="q7m3xc"
User
 ├── IBKR Account A
 ├── IBKR Account B
 └── IBKR Account C
```

Each account must remain isolated.

---

# 43. BROKER ACCOUNT SCOPING

Broker replacement is scoped by:

```text id="m4x8qv"
user_id
+
broker account
+
execution dates
```

This prevents one broker account from replacing another account's execution window.

---

# 44. MANUAL SYNC

Manual Sync is user initiated.

The correct behavior is:

```text id="x7q3mc"
User A
 ↓
Manual Sync
 ↓
User A's active broker accounts
```

It must not synchronize another user's accounts.

A previous issue caused Manual Sync to affect both users; this was corrected.

---

# 45. MANUAL SYNC AUTHENTICATION

A previous Manual Sync failure returned:

```text id="c5m8vx"
401 Unauthorized
```

The issue was related to the missing Authorization header.

The Manual Sync request was corrected to provide the user's session access token.

The server can then authenticate the requesting user.

---

# 46. AUTOMATIC CRON SYNC

Broker Sync also has scheduled synchronization.

Current intended architecture:

```text id="q8m4xz"
Automatic Cron
    ↓
Evening schedule
    ↓
Multiple scheduled runs
    ↓
Synchronize eligible users/accounts
```

This is distinct from Manual Sync.

---

# 47. MANUAL VS AUTOMATIC SYNC

```text id="m7x3qc"
MANUAL SYNC
→ user initiated
→ authenticated user
→ trading hours

AUTOMATIC SYNC
→ scheduled
→ system initiated
→ evening
```

Both use the same underlying broker execution synchronization architecture.

---

# 48. MULTI-ACCOUNT ERROR ISOLATION

If one account is invalid:

```text id="c8q4mx"
Account A → SUCCESS
Account B → ERROR
Account C → SUCCESS
```

The architecture should not unnecessarily stop valid accounts because one account has:

```text id="x7m3vq"
invalid token
invalid Flex Query
reference-code failure
```

---

# 49. IBKR ERROR EXAMPLE

A previously observed error was:

```text id="q4m8xc"
Failed to retrieve reference code
```

This is an account/broker integration failure.

It should be treated as an account-level synchronization problem wherever possible.

---

# 50. RATE LIMIT HANDLING

The current broker synchronization implementation uses:

```text id="m8x3qv"
3-second delay between brokers
```

This is intended to reduce excessive request frequency when multiple broker accounts are synchronized.

---

# 51. ZERO-EXECUTION BROKER RESPONSE

A valid broker response can contain zero executions.

Example:

```text id="c7m4xz"
Account A → 0 executions
```

This is not automatically an error.

The system must distinguish:

```text id="x8q3mv"
Valid empty response
```

from:

```text id="m5c7qx"
Failed / invalid / obviously incomplete response
```

---

# 52. BROKER IDEMPOTENCY

Broker Sync must be idempotent.

Repeated synchronization of the same broker state should result in equivalent canonical execution state.

The replacement model supports this naturally.

The system must not create duplicate executions simply because synchronization runs more than once.

---

# 53. MANUAL AND BROKER DATA COEXISTENCE

Manual and broker executions share the canonical execution ledger.

Conceptually:

```text id="q7m4vx"
executions
├── Manual executions
└── Broker executions
```

The ingestion paths remain separate.

The execution ledger is shared.

---

# 54. MANUAL DATA MUST BE PROTECTED FROM BROKER SYNC

Broker Sync must never delete Manual Trade executions.

Broker replacement is scoped to the broker account and execution window.

Manual execution identity is separate.

Therefore:

```text id="x4m8qc"
Broker Sync
→ Broker executions

Manual Trade
→ Manual executions
```

---

# 55. BROKER DATA MUST BE PROTECTED FROM MANUAL DELETE

Manual Delete must not delete broker executions.

The Manual Delete RPC requires Manual execution/lifecycle identification.

For lifecycle deletion:

```text id="q8m3vx"
contract_key LIKE 'MANUAL-%'
```

is required.

For exact execution deletion:

```text id="m7x4qc"
execution ID
+
user ID
+
MANUAL-* contract key
```

are required.

---

# 56. COMMON CANONICAL PIPELINE

Despite different ingestion paths, both systems converge here:

```text id="c5m8qx"
                MANUAL ENTRY
                     │
                     ▼
             Manual Executions
                     │
                     │
                     ├─────────────┐
                     │             │
                     │             │
                     ▼             ▼
                CANONICAL EXECUTIONS
                     ▲             ▲
                     │             │
                     │             │
             Broker Executions      │
                     ▲             │
                     │             │
                  IBKR SYNC         │
                                   │
                     └─────────────┘
                             │
                             ▼
                        pairTrades()
                             │
                             ▼
                     Derived Trades
                             │
                             ▼
                      Analytics / P&L
                             │
                             ▼
                       Dashboard V2
```

---

# 57. SECURITY BOUNDARY

The architecture increasingly separates:

```text id="x7m4qc"
CLIENT
   ↓
SERVER API
   ↓
AUTHENTICATED USER
   ↓
SERVER-SIDE DATABASE OPERATION
```

This is the required direction for destructive persistence operations.

---

# 58. AUTHENTICATED USER OWNERSHIP

Manual Edit and Manual Delete derive the user from the authenticated Supabase session.

The client should not be treated as authoritative for ownership.

The database operations also use user scoping.

A broader application-wide authorization audit remains future work.

---

# 59. SUPABASE RPC SECURITY

Atomic persistence RPCs use:

```text id="q8m3vx"
SECURITY DEFINER
set search_path = public
```

Public execution permissions were revoked.

The trusted server-side service role is granted execution permission.

This creates a server-side persistence boundary.

---

# 60. ATOMIC PERSISTENCE PATTERN

The combined system now uses a consistent pattern:

### Manual Edit

```text id="m7x4qc"
Server API
 ↓
Atomic RPC
 ↓
Delete + Insert
```

### Manual Delete

```text id="c8q3vx"
Server API
 ↓
Atomic RPC
 ↓
Delete
```

### Broker Sync

```text id="x5m7qz"
Server-side Sync
 ↓
Atomic RPC
 ↓
Delete + Insert
```

---

# 61. FAILURE SAFETY MODEL

The combined architecture has two major persistence safety patterns.

### Atomic replacement

Used for:

```text id="q4m8xc"
Manual Edit
Broker Sync
```

Behavior:

```text id="m7x3vq"
DELETE + INSERT
      ↓
SUCCESS → COMMIT
FAILURE → ROLLBACK
```

### Atomic destructive delete

Used for:

```text id="c8m4xz"
Manual Delete
```

Behavior:

```text id="x7q3mc"
VALIDATE
   ↓
DELETE
   ↓
SUCCESS → COMMIT
ERROR   → ROLLBACK
```

---

# 62. FETCH SAFETY + DATABASE SAFETY

Broker Sync has an additional safety layer.

```text id="m5x8qv"
BROKER FETCH SAFETY
        +
DATABASE ATOMICITY
```

Therefore:

```text id="q7c4mx"
Fetch fails
→ no replacement

Fetch succeeds but DB replacement fails
→ rollback

Fetch succeeds and DB replacement succeeds
→ commit
```

---

# 63. IDEMPOTENCY REQUIREMENT

All execution persistence paths must remain deterministic.

For the same canonical input:

```text id="x8m3qc"
same executions
```

the resulting reconstructed state must remain equivalent.

This is essential for:

```text id="q4v7mx"
manual operations
broker sync
repeated synchronization
reconstruction
analytics
```

---

# 64. FEES

Manual executions have fee handling in the FIFO engine.

`pairTrades()` tracks:

```text id="m8q3vx"
remainingQuantity
remainingFees
```

Manual entry fees can be proportionally allocated as the position is consumed.

Broker fee behavior remains governed by the existing broker execution data and FIFO implementation.

Fee logic must not be duplicated inside Delete or Sync persistence layers.

---

# 65. OPTIONS MULTIPLIER

Manual Entry uses:

```text id="c7m4qx"
Options → multiplier = 100
Non-options → multiplier = 1
```

This ensures normalized Manual executions remain compatible with the canonical execution and P&L architecture.

---

# 66. ERROR HANDLING PRINCIPLE

Persistence operations must fail safely.

Preferred behavior:

```text id="x8q3mc"
Validation failure
→ no destructive change
```

or:

```text id="m4v7qx"
Database failure
→ rollback
→ previous state remains
```

Never allow:

```text id="q7m3cx"
partial destructive mutation
+
false success
```

---

# 67. TESTING PHILOSOPHY

Execution persistence changes require more than a successful build.

Testing should include:

```text id="x4m8vq"
1. Build verification
2. Database-level safety test
3. Real application-level test
4. Reconstruction verification
5. Ownership/authorization verification
6. Failure-path verification
```

---

# 68. MANUAL TRADE TEST CHECKLIST

```text id="m7q3xc"
✓ Create Manual Entry
✓ Create Complete Trade
✓ Create Partial Exits
✓ Edit Partial Exit
✓ Edit Complete lifecycle
✓ Delete Partial Exit
✓ Delete Complete lifecycle
✓ Verify open-position reconstruction
✓ Verify exact execution deletion
✓ Verify user scoping
✓ Verify zero-row failure
✓ Verify atomic Edit rollback
✓ Verify Delete safety
✓ Build
```

---

# 69. BROKER SYNC TEST CHECKLIST

```text id="q8m4vx"
✓ IBKR Flex fetch
✓ Valid response
✓ Empty response
✓ Invalid token
✓ Invalid Flex configuration
✓ Multiple IBKR accounts
✓ Account-level failure isolation
✓ Fetch-before-delete
✓ Replace-not-merge
✓ Atomic replacement
✓ Rollback
✓ Execution deduplication
✓ User/account/date scope
✓ Manual Sync
✓ Automatic Sync
✓ Rate-limit pacing
✓ Sync logging
✓ FIFO reconstruction
```

---

# 70. BUILD VERIFICATION

After the Atomic Delete work:

```text id="c7m4qx"
npm run build
```

Result:

```text id="x8q3mv"
PASS
```

The application build was successfully verified after the latest Manual Trade persistence changes.

---

# 71. GIT CHECKPOINT — ATOMIC EXECUTION PERSISTENCE

Checkpoint:

```text id="m5q8xc"
Commit:
0a6b6de

Message:
Checkpoint: Atomic execution persistence
```

This checkpoint included the completed Atomic Manual Edit persistence and Atomic Broker Sync persistence work.

---

# 72. GIT CHECKPOINT — ATOMIC DELETE

The subsequent Manual Delete work was committed as:

```text id="q7x3mv"
Checkpoint: Atomic delete persistence
```

and pushed to:

```text id="c4m8qx"
origin/main
```

---

# 73. PROTECTED INFRASTRUCTURE

The following areas must remain protected:

```text id="x8m3qv"
executions table
pairTrades()
FIFO logic
reconstructed trades
reconciliation
P&L calculations
analytics
Dashboard V2
```

Manual Entry and Broker Sync should feed these systems rather than replace them.

---

# 74. LEGACY DASHBOARD

The legacy dashboard architecture must not be used as a target for new execution-system work.

Dashboard V2 is authoritative.

Execution persistence should remain independent of Dashboard UI implementation.

---

# 75. CURRENT MASTER ARCHITECTURE

The current intended architecture is:

```text id="m7q4xc"
                         INPUTS
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      MANUAL ENTRY                    IBKR SYNC
             │                           │
             ▼                           ▼
    Normalized Manual          Normalized Broker
       Executions                 Executions
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 CANONICAL EXECUTIONS
                      SUPABASE LEDGER
                           │
                           ▼
                      pairTrades()
                           │
                           ▼
                 DERIVED TRADES /
                    POSITIONS
                           │
                           ▼
                  P&L / ANALYTICS
                           │
                           ▼
                    DASHBOARD V2
```

---

# 76. MANUAL EDIT / DELETE BOUNDARY

Manual Trade mutation flows are:

```text id="q8m3vx"
                    MANUAL TRADE
                         │
                 ┌───────┴────────┐
                 │                │
                 ▼                ▼
               EDIT             DELETE
                 │                │
                 ▼                ▼
             Server API       Server API
                 │                │
                 ▼                ▼
             Atomic RPC       Atomic RPC
                 │                │
                 └───────┬────────┘
                         ▼
                     EXECUTIONS
                         │
                         ▼
                     pairTrades()
```

---

# 77. BROKER SYNC BOUNDARY

Broker Sync flows:

```text id="m5x8qv"
                     IBKR
                      │
                      ▼
                 Flex Query
                      │
                      ▼
              Fetch / Validate
                      │
                      ▼
        replaceBrokerExecutionsAtomically()
                      │
                      ▼
                 Executions
                      │
                      ▼
                  pairTrades()
```

---

# 78. WHAT MUST NEVER HAPPEN

Never implement:

```text id="q7m4xc"
❌ Separate Manual Trade FIFO engine
❌ Separate Broker Trade FIFO engine
❌ Direct reconstructed-trade persistence as source of truth
❌ Client-side privileged database mutation
❌ Broker Sync deleting Manual executions
❌ Manual Delete deleting broker executions
❌ Partial Exit delete using full contract lifecycle
❌ Manual quantity restoration after deleting an exit
❌ Broker Sync deleting before successful fetch
❌ Uncontrolled broker-data merge
❌ Cross-user execution mutation
❌ Cross-account broker replacement
❌ Failed atomic operation reported as success
```

---

# 79. DEVELOPMENT RULE — CURRENT CODE FIRST

Before any future implementation:

```text id="x4m8vq"
REQUEST CURRENT CODE
      ↓
REVIEW CURRENT IMPLEMENTATION
      ↓
IDENTIFY EXACT FILES
      ↓
PLAN SMALLEST SAFE CHANGE
      ↓
IMPLEMENT
      ↓
TEST
      ↓
BUILD
      ↓
CHECKPOINT
```

Never assume old checkpoint code is still identical to the repository.

---

# 80. EXACT FILE PATH RULE

Every future code change must identify the exact file path.

Example:

```text id="m8q3xc"
File:
lib/server/sync/replaceBrokerExecutionsAtomically.ts
```

Then explain:

```text id="q7x4mv"
What changes
Why it changes
What does not change
```

Only then provide the code modification.

---

# 81. ONE LOGICAL IMPROVEMENT AT A TIME

Do not combine unrelated architecture changes.

Each improvement should follow:

```text id="c5m8qx"
ONE CHANGE
    ↓
TEST
    ↓
VERIFY
    ↓
CHECKPOINT
```

This keeps the execution architecture auditable.

---

# 82. CURRENT COMPLETED WORK

The combined execution architecture currently has:

```text id="x7q4mc"
✓ Execution-first architecture
✓ Canonical executions ledger
✓ Manual Entry execution creation
✓ Manual Trade lifecycle support
✓ Partial Exit support
✓ Manual Edit server API
✓ Atomic Manual Edit
✓ Manual Edit rollback safety
✓ Exact Partial Exit edit targeting
✓ Complete lifecycle edit targeting
✓ Manual Delete server API
✓ Atomic Manual Delete
✓ Exact Partial Exit deletion
✓ Complete lifecycle deletion
✓ Manual-only deletion protection
✓ Manual Delete user scoping
✓ Zero-row delete protection
✓ IBKR Flex Query integration
✓ Multi-account IBKR architecture
✓ Manual Sync
✓ Automatic Cron Sync
✓ Fetch-before-delete
✓ Replace-not-merge strategy
✓ Atomic Broker Replacement
✓ Broker rollback safety
✓ Broker account scoping
✓ User scoping
✓ Execution deduplication
✓ Three-second broker pacing
✓ Account-level failure isolation design
✓ Sync logging requirement
✓ FIFO reconstruction
✓ Build verification
✓ Database rollback testing
✓ Real Manual Delete testing
✓ Git checkpoints
```

---

# 83. CURRENT STATUS

## Canonical Execution Architecture

```text id="m4x8qv"
STATUS: ACTIVE / PROTECTED
```

## Manual Entry

```text id="q7m3xc"
STATUS: ACTIVE
```

## Manual Edit Atomic Persistence

```text id="x8m4vq"
STATUS: COMPLETE
```

## Manual Delete Atomic Persistence

```text id="c5q7mx"
STATUS: COMPLETE
```

## IBKR Broker Sync

```text id="m8x3qv"
STATUS: ACTIVE
```

## Atomic Broker Replacement

```text id="q4m7xc"
STATUS: COMPLETE
```

## Rollback Safety

```text id="x7q3mv"
STATUS: VERIFIED
```

---

# 84. FUTURE HARDENING

Important future work includes:

```text id="m5q8vx"
Manual Trade:
#3  Server-side Ownership / Authorization
#27 Server-side Validation Mirror

Broker Sync:
Expanded sync observability
Improved incomplete-response detection
Account-level reporting
Retry strategy
Production monitoring
Expanded synchronization windows
Additional broker integrations
```

Each item should be implemented as an independent logical improvement.

---

# 85. SERVER-SIDE AUTHORIZATION — FUTURE

Manual Edit/Delete now use authenticated server-side identity.

However, the broader application should still receive a complete authorization audit.

Future review should cover:

```text id="q7m4xc"
authentication
authorization
resource ownership
user isolation
client-supplied identifiers
server-side validation
cross-user access
```

Do not assume that the completed Manual Delete protection represents a complete application-wide authorization audit.

---

# 86. SERVER-SIDE VALIDATION — FUTURE

Critical business rules should eventually be mirrored server-side.

Potential areas:

```text id="x8m3qv"
quantity
price
fees
side
action
asset type
multiplier
dates
contract identifiers
partial exit quantity
lifecycle consistency
```

The current source files must be reviewed when this work begins.

---

# 87. MASTER SECURITY PRINCIPLE

The client is never the ultimate authority for destructive data operations.

The trusted path is:

```text id="m7q4xc"
CLIENT
  ↓
AUTHENTICATED SERVER REQUEST
  ↓
SERVER VALIDATION
  ↓
DATABASE TRANSACTION
  ↓
CANONICAL EXECUTIONS
```

This is the architecture to continue building toward.

---

# 88. MASTER DATA-INTEGRITY PRINCIPLE

All downstream state should be derivable from canonical executions.

```text id="q8m3vx"
Executions
   ↓
FIFO
   ↓
Trades
   ↓
P&L
   ↓
Analytics
   ↓
Dashboard
```

If downstream state is wrong, investigate the execution ledger and reconstruction logic before introducing another source of truth.

---

# 89. MASTER ROLLBACK PRINCIPLE

Any persistence operation that can modify multiple pieces of canonical state must be transaction-safe.

For replacement:

```text id="x4m7qc"
DELETE + INSERT
→ ATOMIC
```

For destructive delete:

```text id="m8q3vx"
VALIDATE + DELETE
→ DATABASE TRANSACTION
```

For broker synchronization:

```text id="q7x4mc"
FETCH + VALIDATE
→ ATOMIC REPLACEMENT
```

---

# 90. MASTER BROKER SAFETY PRINCIPLE

Broker Sync must always follow:

```text id="x8m4qv"
FETCH
  ↓
VALIDATE
  ↓
REPLACE ATOMICALLY
  ↓
RECONSTRUCT
```

Never:

```text id="m5q3xc"
DELETE
  ↓
FETCH
```

---

# 91. MASTER MANUAL TRADE PRINCIPLE

Manual Trade operations must always follow:

```text id="q7m8vx"
CREATE / EDIT / DELETE
          ↓
CANONICAL EXECUTIONS
          ↓
pairTrades()
          ↓
DERIVED STATE
```

Never directly manipulate downstream trade state as the canonical operation.

---

# 92. FINAL COMBINED ARCHITECTURAL RULE

The single most important rule for the entire Elite X execution architecture is:

```text id="x4m7qc"
                    DO NOT TREAT
               DERIVED TRADES/POSITIONS
                    AS SOURCE OF TRUTH.

                         ALWAYS
                           ↓

               MAINTAIN CANONICAL
                    EXECUTIONS

                         ↓

                  RECONSTRUCT
                  DETERMINISTICALLY

                         ↓

                  DERIVE TRADES,
                   POSITIONS,
                    P&L AND
                   ANALYTICS.
```

---

# 93. FINAL HANDOVER SUMMARY

Elite X uses an execution-first architecture.

Manual Entry creates normalized Manual executions.

IBKR Broker Sync imports and normalizes broker executions.

Both sources write into the same canonical execution ledger.

Manual Edit uses a server-side atomic replacement mechanism.

Manual Delete uses a server-side authenticated deletion mechanism.

Partial Exit deletion targets the exact execution.

Complete Manual lifecycle deletion targets the Manual contract key.

Manual deletion is scoped to the authenticated user and protected against broker execution deletion.

IBKR synchronization fetches broker data before modifying local state.

Broker synchronization replaces the affected broker execution window rather than blindly merging.

Broker replacement is atomic.

If atomic replacement fails, the database rolls back.

Multiple IBKR accounts remain isolated.

Manual Sync is user-scoped.

Automatic Sync is scheduled independently.

Broker request pacing includes the current three-second delay between brokers.

The FIFO engine remains centralized in `lib/parsers/pairTrades.ts`.

No separate Manual FIFO engine or Broker FIFO engine exists.

No downstream reconstructed Trade state should become the canonical source of truth.

The architecture is designed so that:

```text id="m7x4qv"
BROKER / MANUAL INPUT
        ↓
EXECUTIONS
        ↓
FIFO
        ↓
TRADES / POSITIONS
        ↓
P&L / ANALYTICS
        ↓
DASHBOARD
```

This is the foundational architecture that future Manual Trade, Broker Sync, analytics, and dashboard work must preserve.

---

# END OF COMBINED EXECUTION ARCHITECTURE MASTER NOTES
