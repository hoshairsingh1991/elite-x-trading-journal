# ELITE X TRADING JOURNAL

# MANUAL ENTRY / MANUAL TRADE — MASTER NOTES

**Document Type:** Master Architecture / Development / Handover Notes
**System:** Elite X Trading Journal / Trading OS
**Scope:** Manual Entry and Manual Trade functionality ONLY
**Status:** Active Development
**Last Major Checkpoint:** Atomic Delete Persistence
**Date:** September 13, 2026

---

# 1. PURPOSE OF THIS DOCUMENT

This document is the authoritative master reference for the **Manual Entry / Manual Trade system** in Elite X Trading Journal.

It documents:

* Manual Trade architecture
* Manual Entry execution creation
* Complete Trade lifecycle
* Partial Exit lifecycle
* Execution-based persistence
* Manual Trade editing
* Atomic Edit persistence
* Rollback safety
* Manual Trade deletion
* Atomic Delete persistence
* Partial Exit deletion behavior
* Complete lifecycle deletion behavior
* Server API architecture
* Supabase RPC architecture
* FIFO/reconstruction relationship
* Testing and verification
* Protected infrastructure
* Development rules
* Current implementation
* Future Manual Trade improvements
* Git checkpoints

This document is intentionally separated from the Broker Sync documentation.

Broker Sync has its own master documentation.

---

# 2. CORE ARCHITECTURAL PRINCIPLE

Elite X is fundamentally an **execution-first trading system**.

The canonical architecture is:

```text
Manual Entry
      ↓
Normalized Executions
      ↓
Supabase Executions Ledger
      ↓
Deterministic FIFO Reconstruction
      ↓
Reconstructed Trades
      ↓
Analytics / P&L / Dashboard
```

The most important rule is:

```text
EXECUTIONS ARE THE SOURCE OF TRUTH.
TRADES ARE DERIVED STATE.
```

Manual Entry must therefore produce execution records compatible with the existing execution model.

Manual Trade functionality must NOT create a second independent trade engine.

Manual Trade functionality must NOT maintain a separate source-of-truth trade table.

Manual Edit and Delete must operate on the underlying executions.

The existing FIFO/reconstruction system remains responsible for determining the resulting trade state.

---

# 3. MANUAL ENTRY DESIGN PRINCIPLE

Manual Entry exists for trades that are not imported from a broker.

The Manual Entry system converts the user's manual trade information into normalized executions.

Those executions enter the same canonical execution ledger used by the rest of the trading system.

The Manual Entry system therefore follows:

```text
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

Manual Entry does not directly create a permanent reconstructed Trade record as the canonical source.

---

# 4. MANUAL EXECUTION IDENTIFICATION

Manual executions are identified using a manual contract key.

Current Manual Trade identification:

```text
contractKey starts with:

MANUAL-
```

The FIFO/reconstruction code contains:

```ts
function isManualExecution(execution: PositionExecution) {
  return execution.contractKey.startsWith("MANUAL-");
}
```

This identifier is important because Manual Trade destructive operations must never accidentally target broker executions.

---

# 5. MANUAL EXECUTION MODEL

Manual executions are normalized into the existing execution structure.

Important execution fields include:

```text
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

Manual execution creation must remain compatible with the existing execution ledger.

---

# 6. OPTIONS MULTIPLIER RULE

Manual Entry uses the existing multiplier convention:

```text
Options:
multiplier = 100

Non-options:
multiplier = 1
```

This allows manual options executions to participate correctly in value and P&L calculations.

---

# 7. COMPLETE TRADE LIFECYCLE

A Complete Trade represents an entire lifecycle.

Example:

```text
BUY 100 AAPL
SELL 100 AAPL
```

The two executions belong to the same manual lifecycle through their `contractKey`.

The FIFO engine subsequently reconstructs the resulting closed trade.

Manual Edit of a Complete Trade operates at the lifecycle level.

Manual Delete of a Complete Trade operates at the lifecycle level.

---

# 8. PARTIAL EXIT LIFECYCLE

Manual trades support multiple partial exits.

Example:

```text
Entry:
BUY 100

Exit 1:
SELL 20

Exit 2:
SELL 20

Exit 3:
SELL 20

Exit 4:
SELL 20

Exit 5:
SELL 20
```

After all five exits:

```text
100 entered
100 exited
0 open
```

If Exit 4 is deleted:

```text
100 entered
80 remaining exits
20 open
```

The system must NOT manually manufacture a new 20-share position.

Instead:

```text
Delete Exit 4 execution
        ↓
Executions become canonical state
        ↓
pairTrades()
        ↓
FIFO reconstruction
        ↓
20 shares become OPEN
```

This is the correct architecture.

---

# 9. IMPORTANT PARTIAL EXIT DELETE RULE

When deleting a Partial Exit:

```text
DELETE EXACT EXIT EXECUTION
```

Do NOT delete the entire `contract_key` lifecycle.

This distinction is critical.

For example:

```text
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20  ← selected exit
SELL 20
```

Deleting the selected exit must result in:

```text
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20
```

and therefore:

```text
20 shares OPEN
```

The other four exits remain untouched.

---

# 10. COMPLETE LIFECYCLE DELETE RULE

When the selected Manual Trade represents the complete lifecycle, deletion operates using:

```text
contract_key
```

The entire Manual Trade lifecycle is removed from the canonical execution ledger.

The system then reconstructs the remaining execution state.

If the lifecycle had no remaining executions, no trade should remain.

---

# 11. FIFO / RECONSTRUCTION

The authoritative FIFO implementation is:

```text
lib/parsers/pairTrades.ts
```

This file is protected infrastructure.

Manual Trade development must not duplicate or replace its logic.

`pairTrades()`:

* sorts executions deterministically;
* isolates positions by `contractKey`;
* maintains independent LONG and SHORT buckets;
* processes BUY and SELL executions;
* closes opposing positions;
* uses FIFO ordering;
* creates closed trades;
* creates open trades from remaining quantities;
* carries fees appropriately;
* reconstructs the final derived trade state.

---

# 12. OPEN POSITION RECONSTRUCTION

An important behavior of the current architecture:

If deleting a partial exit causes an open quantity to exist again, the system does not explicitly "restore" the position.

Instead, reconstruction naturally derives it.

Example:

```text
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20
SELL 20
```

Result:

```text
0 OPEN
```

Delete one 20-share exit:

```text
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20
```

Result:

```text
20 OPEN
```

This behavior is already correctly provided by `pairTrades()`.

No special delete-side restoration logic is required.

---

# 13. MANUAL EDIT — ORIGINAL PROBLEM

Originally, Manual Trade editing performed destructive database operations from the client.

The conceptual sequence was:

```text
Client
  ↓
DELETE old execution(s)
  ↓
INSERT corrected execution(s)
```

The problem was that these operations were not one atomic persistence unit.

Potential failure:

```text
DELETE succeeds
INSERT fails
```

Result:

```text
Original data lost
Corrected data never saved
```

This was unacceptable for a financial/trading journal.

---

# 14. ATOMIC EDIT ARCHITECTURE

Manual Edit was redesigned as:

```text
EditTradeModal
      ↓
POST /api/trades/edit
      ↓
Authenticated user
      ↓
replaceManualExecutionsAtomically()
      ↓
Supabase RPC
      ↓
DELETE + INSERT in one DB transaction
```

The client no longer owns the destructive persistence sequence.

---

# 15. MANUAL EDIT API

Current file:

```text
app/api/trades/edit/route.ts
```

The API:

1. receives the authenticated session token;
2. extracts the Bearer token;
3. authenticates the user through Supabase;
4. obtains the authenticated `user.id`;
5. validates the request;
6. calls the atomic server helper;
7. returns success only after the database operation succeeds.

The authenticated user's ID is therefore derived server-side.

---

# 16. MANUAL EDIT SERVER HELPER

Current file:

```text
lib/server/trades/replaceManualExecutionsAtomically.ts
```

Responsibilities:

* validate input;
* normalize execution data;
* serialize executions for PostgreSQL;
* deduplicate execution IDs;
* call the Supabase atomic RPC;
* throw on database failure.

The helper does not implement FIFO.

It only handles persistence.

---

# 17. MANUAL EDIT DATABASE RPC

The Manual Edit persistence layer uses:

```text
public.replace_manual_executions_atomically(...)
```

The database function is:

```text
SECURITY DEFINER
set search_path = public
```

The function validates:

* user ID;
* delete mode;
* required identifiers;
* execution input.

It performs the required delete and insert inside the database transaction.

If an exception occurs:

```text
DELETE
  ↓
INSERT
  ↓
ERROR
  ↓
ROLLBACK
```

The original state remains intact.

---

# 18. MANUAL EDIT DELETE MODES

Manual Edit uses two persistence modes.

### Partial Exit

```text
deleteMode = "execution_id"
```

Only the exact selected exit execution is replaced.

### Complete / Open Position Lifecycle

```text
deleteMode = "contract_key"
```

The lifecycle executions are replaced together.

This distinction prevents a Partial Exit edit from accidentally modifying the entire lifecycle.

---

# 19. MANUAL EDIT CLIENT BEHAVIOR

Current file:

```text
components/trades/EditTradeModal.tsx
```

The component:

* determines the appropriate edit mode;
* builds corrected normalized executions;
* obtains the current Supabase session token;
* sends the request to `/api/trades/edit`;
* waits for successful server response;
* only then closes the modal and reloads the page.

The UI does not assume persistence succeeded before receiving the server response.

---

# 20. MANUAL EDIT ROLLBACK SAFETY

The atomic edit guarantee is:

```text
OLD EXECUTIONS
      ↓
ATOMIC DATABASE OPERATION
      ↓
DELETE + INSERT
      ↓
SUCCESS → COMMIT
ERROR   → ROLLBACK
```

Therefore:

```text
If INSERT fails:
OLD DATA REMAINS
```

This is the required behavior.

---

# 21. MANUAL DELETE — ORIGINAL PROBLEM

Manual Trade deletion originally relied on direct client-side deletion.

The problem with this architecture was that destructive persistence was occurring directly from the UI rather than through a controlled server-side operation.

This created concerns around:

* authorization;
* ownership;
* destructive-operation validation;
* exact deletion semantics;
* lifecycle-vs-execution deletion;
* consistency with the Atomic Edit architecture.

---

# 22. ATOMIC DELETE DESIGN

Manual Delete now follows:

```text
EditTradeModal
      ↓
POST /api/trades/delete
      ↓
Authenticated user
      ↓
deleteManualExecutionsAtomically()
      ↓
Supabase RPC
      ↓
Executions deleted
      ↓
Page reload
      ↓
pairTrades()
      ↓
Derived trade state
```

The canonical execution ledger remains the only source of truth.

---

# 23. MANUAL DELETE API

Current file:

```text
app/api/trades/delete/route.ts
```

The API:

1. reads the Authorization header;
2. extracts the Bearer token;
3. authenticates through Supabase;
4. obtains the authenticated `user.id`;
5. validates `deleteMode`;
6. calls the server-side atomic delete helper;
7. returns success only after deletion succeeds;
8. returns an error response if authentication or deletion fails.

---

# 24. MANUAL DELETE SERVER HELPER

Current file:

```text
lib/server/trades/deleteManualExecutionsAtomically.ts
```

Supported modes:

```ts
type ManualDeleteMode =
  | "execution_id"
  | "contract_key";
```

The helper validates:

```text
userId
deleteMode
deleteExecutionId
contractKey
```

depending on the selected operation.

It then calls:

```text
delete_manual_executions_atomically
```

through the server-side Supabase admin client.

---

# 25. MANUAL DELETE DATABASE RPC

Current RPC:

```text
public.delete_manual_executions_atomically(
  uuid,
  text,
  text,
  text
)
returns integer
```

The function is:

```text
SECURITY DEFINER
set search_path = public
```

It supports:

```text
execution_id
contract_key
```

---

# 26. EXACT EXECUTION DELETE

For:

```text
p_delete_mode = 'execution_id'
```

the database deletes only when all relevant conditions match:

```text
id = requested execution ID
AND
user_id = authenticated user
AND
contract_key LIKE 'MANUAL-%'
```

Therefore the operation cannot intentionally target a broker execution through the Manual Delete path.

After deletion, PostgreSQL reports the number of deleted rows.

If:

```text
deleted_count = 0
```

the function raises:

```text
No matching manual execution was found.
```

There is no silent success.

---

# 27. COMPLETE LIFECYCLE DELETE

For:

```text
p_delete_mode = 'contract_key'
```

the database first requires:

```text
contract_key LIKE 'MANUAL-%'
```

Otherwise it raises:

```text
Only manual trade lifecycles can be deleted.
```

It then deletes executions matching:

```text
contract_key = requested contract key
AND
user_id = requested user
```

This protects the Manual Delete path from deleting non-manual broker executions through the lifecycle mode.

---

# 28. DELETE ROLLBACK / TRANSACTION SAFETY

The delete RPC uses a database operation inside PostgreSQL's transactional execution context.

The function:

```text
validates request
      ↓
performs DELETE
      ↓
checks deleted row count
      ↓
returns success
```

If the function raises an exception:

```text
DELETE
  ↓
ERROR
  ↓
TRANSACTION ROLLBACK
```

The database does not leave a partially completed operation.

The current Delete operation is intentionally simple.

There is no unnecessary multi-step delete/reinsert workflow because deletion itself is a single database mutation.

The important safety improvements are:

* server-side authentication;
* user scoping;
* manual-only validation;
* exact execution targeting;
* explicit lifecycle targeting;
* zero-row failure;
* database transactional behavior.

---

# 29. DELETE AFTER SUCCESS

The client only reloads after receiving a successful API response.

Conceptually:

```text
POST /api/trades/delete
      ↓
SUCCESS
      ↓
close modal
      ↓
reload page
      ↓
reconstruct trades
```

If the server returns an error:

```text
DO NOT treat delete as successful
DO NOT reload as though deletion succeeded
```

---

# 30. PARTIAL EXIT DELETE — FULL EXAMPLE

Starting state:

```text
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20
SELL 20
```

Delete Exit 4.

The system deletes:

```text
exact Exit 4 execution ID
```

It does NOT delete:

```text
contract_key lifecycle
```

Remaining executions:

```text
BUY 100
SELL 20
SELL 20
SELL 20
SELL 20
```

FIFO reconstruction produces:

```text
20 OPEN
```

This is expected.

---

# 31. NO SPECIAL "RESTORE POSITION" LOGIC

Do not add code such as:

```text
if partial exit deleted:
    restore quantity
```

That would duplicate canonical state.

The correct process is:

```text
delete execution
      ↓
reconstruct from executions
```

The open quantity is a consequence of the remaining executions.

---

# 32. COMPLETE TRADE DELETE — FULL EXAMPLE

Starting state:

```text
BUY 100
SELL 100
```

Delete Complete Trade.

The system uses:

```text
deleteMode = "contract_key"
```

The Manual lifecycle is removed.

No separate reconstructed Trade deletion is necessary.

The derived state disappears because its canonical executions no longer exist.

---

# 33. WHY RECONSTRUCTED TRADES ARE NOT DELETED DIRECTLY

A common architectural mistake would be:

```text
Delete Trade row
```

That is not the source-of-truth operation.

The correct operation is:

```text
Delete execution(s)
      ↓
Re-run/reconstruct FIFO
      ↓
Derived trade state changes
```

This preserves the execution-first architecture.

---

# 34. FEES AND MANUAL EXECUTIONS

`pairTrades.ts` contains special handling for manual execution fees.

For manual entries, entry fees are allocated proportionally as quantities are consumed.

The reconstruction tracks:

```text
remainingQuantity
remainingFees
```

This is important for partial exits.

When a manual position is partially consumed, the appropriate portion of the entry fees is allocated to the resulting closed trade.

Any remaining fee amount stays associated with the remaining position.

This behavior is part of the existing FIFO engine and must not be duplicated inside Manual Delete or Manual Edit.

---

# 35. PROTECTED FIFO FILE

File:

```text
lib/parsers/pairTrades.ts
```

Current behavior is authoritative.

Manual Trade development must NOT modify this file merely to support Edit/Delete.

If a Manual Trade operation changes the execution ledger, FIFO reconstruction should naturally produce the new state.

Only modify `pairTrades.ts` if a concrete, independently verified FIFO defect is discovered.

---

# 36. PROTECTED CANONICAL INFRASTRUCTURE

Manual Trade development must not rewrite or bypass:

```text
executions
FIFO engine
pairTrades()
reconstructed trades
reconciliation
P&L calculations
analytics
Dashboard V2
```

Manual Entry is an input path into the canonical execution architecture.

It is not a replacement architecture.

---

# 37. SERVER-SIDE ARCHITECTURE

Current Manual Edit architecture:

```text
components/trades/EditTradeModal.tsx
          ↓
app/api/trades/edit/route.ts
          ↓
lib/server/trades/replaceManualExecutionsAtomically.ts
          ↓
Supabase RPC
          ↓
executions
```

Current Manual Delete architecture:

```text
components/trades/EditTradeModal.tsx
          ↓
app/api/trades/delete/route.ts
          ↓
lib/server/trades/deleteManualExecutionsAtomically.ts
          ↓
Supabase RPC
          ↓
executions
```

This provides a consistent persistence boundary.

---

# 38. CURRENT MANUAL DELETE FILES

The current Manual Delete implementation consists of:

```text
components/trades/EditTradeModal.tsx

app/api/trades/delete/route.ts

lib/server/trades/deleteManualExecutionsAtomically.ts
```

Database function:

```text
public.delete_manual_executions_atomically(...)
```

---

# 39. CURRENT MANUAL EDIT FILES

The current Manual Edit implementation consists of:

```text
components/trades/EditTradeModal.tsx

app/api/trades/edit/route.ts

lib/server/trades/replaceManualExecutionsAtomically.ts
```

Database function:

```text
public.replace_manual_executions_atomically(...)
```

---

# 40. SUPABASE RPC SECURITY

The Manual Delete RPC has:

```text
SECURITY DEFINER
set search_path = public
```

Execution permissions were configured so that:

```text
public → REVOKED
service_role → GRANTED
```

The same pattern was used for the Manual Edit atomic RPC.

This means the client does not directly execute the privileged RPC.

The server-side code uses the service-role Supabase client after authenticating the user.

---

# 41. CURRENT OWNERSHIP PROTECTION

Manual Delete currently scopes database deletion using:

```text
user_id = authenticated user ID
```

This is an important protection.

The API obtains the authenticated user from the supplied session token rather than trusting a client-provided user ID.

The RPC then receives that authenticated user ID.

This prevents the client from selecting an arbitrary user's execution set through the normal API path.

A broader server-side authorization audit remains a separate roadmap item.

---

# 42. VALIDATION LAYERS

Manual Delete currently has multiple validation layers.

### Client

Determines the correct delete mode and target.

### API

Validates authentication and delete mode.

### Server helper

Validates required identifiers.

### Database RPC

Validates:

```text
user ID
delete mode
execution ID
contract key
manual lifecycle identity
matching row existence
```

This layered approach is intentional.

---

# 43. TESTING — ATOMIC DELETE

The first database safety test used a nonexistent execution:

```sql
select public.delete_manual_executions_atomically(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'execution_id',
  'ATOMIC-DELETE-TEST-NONEXISTENT',
  null
);
```

Expected result:

```text
ERROR: No matching manual execution was found.
```

Actual result:

```text
Failed to run sql query:
ERROR: P0001:
No matching manual execution was found.

CONTEXT:
PL/pgSQL function
delete_manual_executions_atomically(...)
line 76 at RAISE
```

This confirms the zero-row protection is functioning.

---

# 44. REAL MANUAL DELETE TEST

A real Manual Entry lifecycle was created and then deleted through the application UI.

The observed behavior was:

```text
Manual entries created
      ↓
Delete performed through UI
      ↓
Page reloaded
      ↓
Result appeared normal
```

This successfully exercised the actual application path rather than only the SQL function.

---

# 45. BUILD VERIFICATION

After implementing Atomic Delete:

```bash
npm run build
```

Result:

```text
PASS
```

Therefore the current TypeScript/Next.js build is clean.

---

# 46. GIT CHECKPOINT — ATOMIC EXECUTION PERSISTENCE

Previous checkpoint:

```text
Commit:
0a6b6de

Message:
Checkpoint: Atomic execution persistence
```

This checkpoint contained the completed Atomic Edit persistence and Broker Sync atomic persistence work.

---

# 47. GIT CHECKPOINT — MANUAL DELETE

The subsequent Manual Delete work was staged and committed as:

```text
Checkpoint: Atomic delete persistence
```

It was then pushed to:

```text
origin/main
```

Current branch:

```text
main
```

The checkpoint represents the completed Manual Delete persistence work.

---

# 48. DOCUMENTATION SEPARATION

Manual Trade documentation is intentionally separated from Broker Sync documentation.

Manual Trade documentation covers:

```text
Manual Entry
Manual executions
Manual Edit
Manual Delete
Atomic Edit
Atomic Delete
Rollback safety
Partial exits
Complete lifecycle
FIFO relationship
Manual Trade roadmap
```

Broker Sync documentation should separately cover:

```text
IBKR
Flex Query
broker execution fetching
broker replacement
broker sync rollback
sync logs
multi-account broker architecture
sync scheduling
```

Do not combine the two systems into one operational master document.

---

# 49. DEVELOPMENT RULE — ONE LOGICAL CHANGE AT A TIME

For Manual Trade development:

```text
One logical improvement
        ↓
Review current implementation
        ↓
Identify exact files
        ↓
Make smallest safe change
        ↓
Build
        ↓
Test
        ↓
Verify canonical behavior unchanged
        ↓
Git checkpoint
```

Do not combine unrelated improvements into one change.

---

# 50. CRITICAL DEVELOPMENT RULE — CURRENT CODE FIRST

Before making any future Manual Trade code change:

**Always request and review the current code of the relevant file.**

Do not assume that the current implementation is identical to:

* old checkpoints;
* previous pasted code;
* memory;
* previous versions;
* earlier architecture notes.

The current repository code is authoritative.

---

# 51. EXACT FILE PATH RULE

Whenever proposing a Manual Trade code modification:

Always identify the exact file path first.

Example:

```text
File:
components/trades/EditTradeModal.tsx
```

Then explain:

```text
What changes
Why it changes
What does NOT change
```

Only then provide the exact modification.

---

# 52. DO NOT MODIFY PROTECTED INFRASTRUCTURE WITHOUT PROOF

Do not modify:

```text
lib/parsers/pairTrades.ts
```

or other canonical trading infrastructure simply because a Manual Trade feature needs new UI behavior.

First determine whether the requested behavior can be achieved by modifying the Manual Entry/persistence layer.

The existing execution-first architecture should be preserved.

---

# 53. MANUAL DELETE SAFETY RULES

The following rules are mandatory:

```text
1. Never delete a broker execution through Manual Delete.

2. Partial Exit deletion must target the exact execution ID.

3. Complete lifecycle deletion must use the Manual contract key.

4. Every deletion must be scoped to the authenticated user.

5. The server derives the user ID from authentication.

6. Client code must not be trusted as the authority for ownership.

7. A zero-row delete is an error, not a successful delete.

8. Do not manually restore open quantity after deleting an exit.

9. Let pairTrades() reconstruct the resulting state.

10. Never delete reconstructed Trade state as the canonical operation.

11. Do not create a second FIFO engine.

12. Do not modify broker executions through the Manual Trade delete path.
```

---

# 54. MANUAL EDIT SAFETY RULES

The following rules are mandatory:

```text
1. Do not perform destructive delete-then-insert directly from the client.

2. Use the Manual Edit server API.

3. Authenticate the user server-side.

4. Use the authenticated user ID.

5. Use the atomic persistence helper.

6. Use the database RPC for the destructive persistence operation.

7. Delete + insert must succeed together.

8. If insertion fails, old data must remain.

9. Partial Exit edits must target the exact exit execution.

10. Complete lifecycle edits may replace the lifecycle.

11. Never modify reconstructed trades directly.
```

---

# 55. WHAT HAS BEEN COMPLETED

Manual Trade persistence hardening completed so far:

```text
✓ Manual execution architecture established
✓ Execution-first persistence
✓ Manual contract identification
✓ Manual Edit server API
✓ Manual Edit authenticated persistence
✓ Atomic Manual Edit persistence
✓ Manual Edit rollback safety
✓ Partial Exit edit targeting
✓ Complete lifecycle edit targeting
✓ Manual Delete server API
✓ Manual Delete authenticated persistence
✓ Exact Partial Exit deletion
✓ Complete lifecycle deletion
✓ Manual-only lifecycle protection
✓ user_id scoping for Delete
✓ zero-row delete protection
✓ Database transactional delete behavior
✓ Real Manual Delete UI test
✓ npm run build verification
✓ Git checkpoint
```

---

# 56. CURRENT STATUS

## Manual Trade Atomic Edit

```text
STATUS: COMPLETE
```

## Manual Trade Atomic Delete

```text
STATUS: COMPLETE
```

## Manual Trade FIFO Reconstruction

```text
STATUS: EXISTING / PROTECTED
```

## Manual Trade Server Ownership / Authorization Audit

```text
STATUS: FUTURE
```

## Server-Side Validation Mirror

```text
STATUS: FUTURE
```

---

# 57. FUTURE MANUAL TRADE ROADMAP

The broader Manual Trade improvement roadmap contains additional work.

Important upcoming items include:

```text
#3  Server-side Ownership / Authorization
#27 Server-side Validation Mirror
```

Other Manual Entry improvements may be addressed later.

These must be handled independently and must not be mixed into Atomic Delete or Atomic Edit retroactively unless a concrete defect requires it.

---

# 58. SERVER-SIDE OWNERSHIP / AUTHORIZATION — FUTURE

Although Manual Delete now derives and uses the authenticated user ID, a broader authorization audit remains planned.

Future work should review all Manual Trade server operations for:

```text
authentication
authorization
user ownership
resource ownership
cross-user access
client-supplied identifiers
server-side trust boundaries
```

This should be treated as a separate security hardening phase.

Do not assume that completing Manual Delete's ownership protection means the entire application has completed its authorization audit.

---

# 59. SERVER-SIDE VALIDATION MIRROR — FUTURE

Future validation hardening should ensure that critical Manual Entry rules are enforced server-side and not only through UI validation.

Potential areas include:

```text
quantity
price
fees
side
action
asset type
multiplier
dates
contract identifiers
required fields
partial exit quantities
lifecycle consistency
```

The exact implementation must be based on the current Manual Entry code when this phase begins.

Do not assume current validation behavior without reviewing the current files.

---

# 60. IMPORTANT ARCHITECTURAL DISTINCTION

There are three separate concepts:

```text
Execution
Trade
Position
```

### Execution

Canonical recorded event.

### Trade

Derived result of matching executions.

### Position

Derived remaining quantity after matching executions.

Manual Delete changes:

```text
Execution state
```

The system then derives:

```text
Position state
Trade state
P&L state
```

This distinction must remain intact.

---

# 61. EXAMPLE — WHY THIS MATTERS

Suppose:

```text
BUY 100 @ $100
SELL 20 @ $110
SELL 20 @ $112
SELL 20 @ $115
SELL 20 @ $118
SELL 20 @ $120
```

The five exits create five derived closed-trade portions.

If the fourth exit is deleted, the system should not try to manipulate the five derived trades individually.

It should simply remove:

```text
SELL 20 @ $118
```

from the canonical execution ledger.

Then:

```text
pairTrades()
```

reconstructs everything.

The result is deterministic.

---

# 62. DETERMINISM REQUIREMENT

Given the same canonical execution set:

```text
Executions A
```

the FIFO engine should always produce:

```text
Trades A
```

Therefore:

```text
Delete execution
+
reconstruct
```

is safer than attempting to manually update every downstream representation.

---

# 63. NO SECOND SOURCE OF TRUTH

Never introduce:

```text
manualTrades table
manualPositions table
manualClosedTrades table
```

as an independent source of truth merely to make Manual Entry easier.

If a new persistent structure is ever proposed, it must be justified against the execution-first architecture first.

---

# 64. UI RESPONSIBILITY

The Manual Trade UI is responsible for:

```text
input
selection
display
confirmation
request initiation
error display
```

The server is responsible for:

```text
authentication
authorization
validation
persistence
destructive operations
```

The database is responsible for:

```text
transactional integrity
```

The FIFO engine is responsible for:

```text
trade reconstruction
position reconstruction
matching
P&L derivation
```

This separation should be maintained.

---

# 65. ERROR HANDLING PRINCIPLE

Manual Trade destructive operations must fail safely.

Preferred behavior:

```text
Request
  ↓
Validation failure
  ↓
No destructive change
```

or:

```text
Request
  ↓
Database failure
  ↓
Rollback
  ↓
Original state remains
```

Never:

```text
DELETE succeeds
INSERT/UPDATE fails
UI assumes success
```

for an atomic edit workflow.

---

# 66. TESTING PRINCIPLE

Every future destructive Manual Trade change should be tested at two levels where practical:

### Database level

Verify:

```text
valid operation
invalid operation
zero-row operation
ownership scope
rollback behavior
```

### Application level

Verify:

```text
UI request
authentication
API behavior
database mutation
reload/reconstruction
final displayed state
```

A build passing is necessary but is not sufficient for persistence changes.

---

# 67. CURRENT KNOWN GOOD STATE

As of September 13, 2026:

```text
Manual Entry
    ↓
Normalized executions
    ↓
Canonical executions ledger
    ↓
Manual Edit / Delete through server persistence boundary
    ↓
pairTrades()
    ↓
Derived trade state
```

Atomic Edit has been implemented and tested.

Atomic Delete has been implemented and tested.

The application build passes.

Real Manual Trade deletion behavior has been tested through the UI and appeared normal.

---

# 68. DO NOT REGRESS THESE BEHAVIORS

Future Manual Trade work must preserve:

```text
Partial Exit deletion
→ exact exit only

Complete lifecycle deletion
→ complete Manual lifecycle only

Delete one partial exit
→ remaining quantity naturally becomes OPEN when appropriate

Manual Edit
→ exact execution/lifecycle replacement according to edit mode

Failed atomic edit
→ original executions remain

Failed delete
→ destructive operation does not silently succeed

Manual Delete
→ authenticated user scope

Manual lifecycle
→ MANUAL-* identification

FIFO
→ existing pairTrades() remains authoritative
```

---

# 69. FINAL MANUAL TRADE ARCHITECTURE

The intended architecture is:

```text
                    MANUAL ENTRY
                         │
                         ▼
              Normalized Executions
                         │
                         ▼
                Supabase Executions
                  Canonical Ledger
                         │
              ┌──────────┴──────────┐
              │                     │
        Manual Edit           Manual Delete
              │                     │
              ▼                     ▼
       Server API             Server API
              │                     │
              ▼                     ▼
       Atomic RPC              Atomic RPC
              │                     │
              └──────────┬──────────┘
                         ▼
                  Executions State
                         │
                         ▼
                    pairTrades()
                         │
                         ▼
              Derived Trades / Positions
                         │
                         ▼
                Analytics / P&L / UI
```

---

# 70. MASTER RULE

The single most important rule for future Manual Trade development is:

```text
DO NOT FIX DERIVED TRADE STATE DIRECTLY.

FIX THE CANONICAL EXECUTIONS.

THEN LET THE EXISTING FIFO / RECONSTRUCTION
ENGINE DERIVE THE CORRECT RESULT.
```

This principle protects the integrity of the entire Elite X trading architecture.

---

# 71. NEXT DEVELOPMENT AREA

The next planned Manual Trade data-integrity/security improvement is:

```text
#3 — Server-side Ownership / Authorization
```

This should be treated as a separate logical change.

Before beginning it:

1. Review the current implementation.
2. Request the current relevant files.
3. Do not assume the current code.
4. Identify exact files that require changes.
5. Define the security boundary.
6. Implement the smallest safe change.
7. Test.
8. Build.
9. Verify Manual Trade behavior.
10. Create a Git checkpoint.

---

# 72. HANDOVER SUMMARY

Manual Trade is now built around the canonical execution ledger.

Manual Entry creates normalized executions.

Manual Edit uses a server-side atomic persistence path.

Manual Delete uses a server-side authenticated persistence path.

Partial Exit deletion deletes the exact exit execution.

Complete lifecycle deletion deletes the Manual lifecycle by `contractKey`.

Manual Delete is scoped by authenticated `user_id`.

Manual-only protection prevents the Manual Delete RPC from intentionally deleting broker executions through the supported modes.

The FIFO engine remains untouched and authoritative.

Deleting a partial exit does not manually restore quantity. The remaining open position is derived automatically by `pairTrades()`.

Atomic persistence failures are designed to fail safely rather than leave incomplete state.

The current build passes.

Real Manual Delete UI testing has been completed successfully.

The Manual Trade system is therefore ready for the next independent hardening phase.

---

# END OF MANUAL ENTRY / MANUAL TRADE MASTER NOTES
