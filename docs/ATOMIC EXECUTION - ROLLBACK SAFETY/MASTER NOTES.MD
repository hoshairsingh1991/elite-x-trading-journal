============================================================
ELITE X TRADING JOURNAL
MASTER CHECKPOINT NOTES
ATOMIC EXECUTION PERSISTENCE / ROLLBACK SAFETY
============================================================

CHECKPOINT DATE:
September 13, 2026

GIT COMMIT:
0a6b6de

GIT COMMIT MESSAGE:
Checkpoint: Atomic execution persistence


============================================================
1. PURPOSE OF THIS CHECKPOINT
============================================================

We identified an important data-integrity risk in two areas of
Elite X:

1. Manual Trade Editing
2. IBKR Broker Sync

Both workflows were using a delete-then-insert replacement
pattern.

The problem was:

    DELETE old executions
          ↓
    INSERT corrected/new executions
          ↓
    INSERT fails
          ↓
    OLD DATA IS ALREADY DELETED

This could leave the canonical executions ledger empty or
partially replaced.

Because Elite X treats the executions table as the canonical
source of truth, this was considered a serious data-integrity
risk.

The objective was therefore:

    Preserve the existing application behavior
    +
    Make replacement operations atomic
    +
    Roll back automatically if anything fails

IMPORTANT:

We did NOT redesign the trading engine.

We did NOT change FIFO behavior.

We did NOT change P&L calculations.

We did NOT change reconciliation.

We did NOT change Dashboard V2.

We did NOT change the established IBKR replacement strategy.

We only added transactional safety around the existing
delete-and-replace operations.


============================================================
2. CORE ARCHITECTURAL RULE
============================================================

Elite X architecture remains:

    Broker
       ↓
    Normalized Executions
       ↓
    Supabase Executions Ledger
       ↓
    Deterministic FIFO Reconstruction
       ↓
    Trades
       ↓
    Analytics
       ↓
    Dashboard

Executions remain the canonical source of truth.

Trades remain derived state.

Manual Entry and Broker Sync both ultimately write normalized
execution records.

There must NOT be a second independent trade/FIFO engine for
manual trades.


============================================================
3. SAFETY MODEL IMPLEMENTED
============================================================

The new behavior is transactional atomicity.

It is NOT a backup table.

It is NOT a copy of the old data.

It is NOT a manual restore mechanism.

Instead:

    Either the entire replacement succeeds,
    OR the entire database operation is rolled back.

Conceptually:

    OLD STATE
        ↓
    BEGIN TRANSACTION
        ↓
    DELETE OLD EXECUTIONS
        ↓
    INSERT NEW EXECUTIONS
        ↓
    EVERYTHING SUCCEEDS?
        ├── YES → COMMIT → NEW STATE
        │
        └── NO  → ROLLBACK → OLD STATE REMAINS

This prevents partial replacement.


============================================================
4. MANUAL TRADE EDIT — PROBLEM
============================================================

Before this change, EditTradeModal performed the replacement
through the client flow.

The general behavior was:

    Delete existing execution(s)
          ↓
    Insert corrected execution(s)

If the insert failed after the delete, the original execution
could be lost.

This was especially important for:

    Complete Trades
    Partial Exit Trades
    Partial Entry / Open Position lifecycle records


============================================================
5. MANUAL TRADE EDIT — NEW ARCHITECTURE
============================================================

Manual Trade Edit now sends the replacement request to:

    POST /api/trades/edit

The API authenticates the user's Supabase access token.

The server obtains the authenticated user's ID.

The server then calls:

    replaceManualExecutionsAtomically()

The actual delete + insert operation happens inside a PostgreSQL
transaction through an RPC function.

This means the browser does NOT directly perform the dangerous
delete-then-insert replacement.


============================================================
6. FILE:
components/trades/EditTradeModal.tsx
============================================================

The existing manual trade editing behavior was preserved.

The important change is the persistence layer.

The file now:

1. Builds the corrected normalized executions.

2. Determines the correct deletion mode.

3. Gets the current Supabase session.

4. Sends the access token through:

       Authorization:
       Bearer <session access token>

5. Calls:

       POST /api/trades/edit

6. Sends:

       deleteMode
       deleteExecutionId
       contractKey
       executions

7. Handles server failure without closing/reloading the trade.

8. Only closes and reloads after successful atomic persistence.


============================================================
7. MANUAL EDIT DELETE MODES
============================================================

Two deletion modes were introduced.

MODE 1:

    execution_id

Used for Partial Exit editing.

Only the exact existing exit execution is deleted.

The existing exit execution is located from the trade's
executions using the opposite action:

    SHORT trade → BUY exit
    LONG trade  → SELL exit

The exact execution ID is then sent to the server.


MODE 2:

    contract_key

Used for Complete Trade / Open Position Entry lifecycle
replacement.

The existing lifecycle is replaced using:

    trade.contractKey

This preserves the existing manual lifecycle behavior.


============================================================
8. PARTIAL EXIT BEHAVIOR
============================================================

For a Partial Exit edit:

    Existing entry remains untouched.

    Existing exit execution:
        ↓
    Delete exact execution ID

    Corrected replacement exit:
        ↓
    Insert new execution

Both operations occur inside one database transaction.

If the insert fails:

    DELETE rolls back

Therefore:

    Original exit remains.


============================================================
9. COMPLETE TRADE / OPEN POSITION BEHAVIOR
============================================================

For Complete Trade or Open Position Entry editing:

    Existing lifecycle identified by contract_key
        ↓
    Existing lifecycle deleted
        ↓
    Corrected executions inserted

The existing contract key is preserved.

For open-position entries, the existing manual lifecycle behavior
was intentionally preserved.

No FIFO or trade-engine behavior was changed.


============================================================
10. NEW FILE:
app/api/trades/edit/route.ts
============================================================

This API route was created to provide a server-side boundary for
atomic manual execution replacement.

Responsibilities:

    1. Read Authorization header.

    2. Reject missing authorization.

    3. Extract Bearer token.

    4. Create Supabase client using:

           NEXT_PUBLIC_SUPABASE_URL
           NEXT_PUBLIC_SUPABASE_ANON_KEY

    5. Authenticate the token using:

           supabase.auth.getUser(token)

    6. Obtain the authenticated user's ID.

    7. Validate the edit request.

    8. Call:

           replaceManualExecutionsAtomically()

    9. Return success and inserted count.

   10. Return HTTP 500 on failure.

Important security property:

The browser does NOT get to choose the trusted user ID.

The server derives:

    user.id

from the authenticated Supabase token.

That user ID is then passed into the atomic database operation.


============================================================
11. NEW FILE:
lib/server/trades/replaceManualExecutionsAtomically.ts
============================================================

This server helper is responsible for translating normalized
executions into the database RPC format.

Function:

    replaceManualExecutionsAtomically(
        executions,
        userId,
        deleteMode,
        deleteExecutionId?,
        contractKey?
    )

Validation includes:

    - executions must not be empty
    - execution_id mode requires an execution ID
    - contract_key mode requires a contract key
    - invalid delete mode is rejected

Normalized execution fields are mapped to the Supabase
executions table fields.

The helper also deduplicates executions by:

    execution.id

before sending them to PostgreSQL.

The database operation is then performed through:

    supabaseAdmin.rpc(
        "replace_manual_executions_atomically",
        ...
    )

Any RPC error is thrown back to the API route.


============================================================
12. MANUAL ATOMIC DATABASE FUNCTION
============================================================

PostgreSQL function:

    public.replace_manual_executions_atomically(
        uuid,
        text,
        text,
        text,
        jsonb
    )

Parameters:

    p_user_id
    p_delete_mode
    p_delete_execution_id
    p_contract_key
    p_executions


Behavior:

    Validate user ID.

    Validate executions JSON array.

    IF delete_mode = execution_id:

        Validate execution ID.

        Delete only the execution belonging to that user.

        If no execution was found:
            raise exception.

    ELSE IF delete_mode = contract_key:

        Validate contract key.

        Delete executions matching that contract key
        and user ID.

        If nothing was found:
            raise exception.

    ELSE:

        raise exception for invalid delete mode.


Then:

    INSERT replacement executions.

If no replacement rows were inserted:

    raise exception.


Because the delete and insert are inside the same PostgreSQL
function/transaction context, any exception causes the complete
operation to roll back.


============================================================
13. MANUAL DATABASE INSERT MAPPING
============================================================

The RPC inserts:

    id
    broker_execution_id
    date
    execution_timestamp
    ticker
    contract
    contract_key
    exchange
    action
    side
    quantity
    execution_price
    execution_value
    fees
    currency
    fee_currency
    account
    asset_type
    multiplier
    user_id

The authenticated server-side user ID is explicitly inserted as:

    p_user_id


============================================================
14. BROKER SYNC — ORIGINAL RISK
============================================================

IBKR sync intentionally uses a replacement strategy.

The established rule is:

    Broker is source of truth for today's returned data.

    Fetch first.

    Parse first.

    Then replace the affected execution window.

The existing strategy was:

    Fetch IBKR Flex
        ↓
    Parse executions
        ↓
    Determine execution dates
        ↓
    DELETE existing executions
        ↓
    INSERT new broker executions

The problem was that a failure during INSERT could leave the
old broker executions deleted.


============================================================
15. IMPORTANT — IBKR REPLACEMENT STRATEGY WAS NOT CHANGED
============================================================

We intentionally did NOT switch to merging.

The established Elite X rule remains:

    REPLACE TODAY'S BROKER DATA COMPLETELY.

Reason:

IBKR Flex can return incomplete data when synced too early.

Merging can leave stale executions from an earlier sync.

Therefore:

    Fetch broker data
        ↓
    Parse broker data
        ↓
    Determine returned dates
        ↓
    Replace those dates completely

remains the intended architecture.

The only change is that delete + insert are now atomic.


============================================================
16. NEW FILE:
lib/server/sync/replaceBrokerExecutionsAtomically.ts
============================================================

Function:

    replaceBrokerExecutionsAtomically(
        executions,
        userId,
        account,
        executionDates
    )

Validation:

    - executions must not be empty
    - executionDates must not be empty

The normalized executions are serialized into database format.

Executions are deduplicated by:

    execution.id


Then the helper calls:

    supabaseAdmin.rpc(
        "replace_broker_executions_atomically",
        ...
    )


Parameters passed:

    p_user_id
    p_account
    p_execution_dates
    p_executions


Any RPC failure is thrown.


============================================================
17. FILE:
lib/server/brokers/ibkr/fetchFlex.ts
============================================================

This file was changed narrowly.

Removed the direct persistence imports:

    saveExecutions
    deleteExecutionWindow

Added:

    replaceBrokerExecutionsAtomically


The old sequence:

    await deleteExecutionWindow(...)

    await saveExecutions(...)

was replaced with:

    await replaceBrokerExecutionsAtomically(
        executions,
        broker.user_id,
        broker.broker_account_id,
        executionDates
    );


Everything else in fetchFlex remains the same.

The flow is still:

    IBKR Flex request
        ↓
    XML received
        ↓
    Parse CSV
        ↓
    If no executions:
        skip sync
        ↓
    Determine execution dates
        ↓
    Atomic broker replacement
        ↓
    Return sync result


============================================================
18. BROKER ATOMIC DATABASE FUNCTION
============================================================

PostgreSQL function:

    public.replace_broker_executions_atomically(
        uuid,
        text,
        text[],
        jsonb
    )

Parameters:

    p_user_id
    p_account
    p_execution_dates
    p_executions


Validation includes:

    User ID required.

    Account required.

    Execution dates required.

    Executions must be a JSON array.


Then:

    DELETE from public.executions

    WHERE:

        user_id = p_user_id
        AND account = p_account
        AND date = ANY(p_execution_dates)


Then:

    INSERT the new broker executions.


If the insert succeeds:

    COMMIT

If any error occurs:

    ROLLBACK


Therefore the old broker execution state cannot be left deleted
because of a failed replacement.


============================================================
19. BROKER ACCOUNT IS PART OF REPLACEMENT SCOPE
============================================================

Broker replacement is scoped by:

    user_id
    account
    execution dates

This is important for the multi-account IBKR architecture.

A sync for one IBKR account does not intentionally delete
executions belonging to another account.


============================================================
20. SECURITY MODEL
============================================================

Both atomic PostgreSQL functions were created as:

    SECURITY DEFINER

with:

    SET search_path = public


Direct public execution was revoked.

The following were revoked from:

    public


Execute permission was granted only to:

    service_role


Functions:

    replace_broker_executions_atomically

    replace_manual_executions_atomically


The browser therefore does not directly call these privileged
database functions.

Manual edit:

    Browser
        ↓
    Authenticated API route
        ↓
    Server helper
        ↓
    service_role RPC
        ↓
    PostgreSQL


Broker sync:

    Server-side IBKR sync
        ↓
    Server helper
        ↓
    service_role RPC
        ↓
    PostgreSQL


============================================================
21. EXECUTIONS TABLE STRUCTURE USED
============================================================

public.executions includes:

    id text PRIMARY KEY
    date text NOT NULL
    ticker text NOT NULL
    contract text NOT NULL
    contract_key text NULL
    side text NOT NULL
    quantity numeric NOT NULL
    execution_price numeric NOT NULL
    execution_value numeric NOT NULL
    fees numeric NOT NULL
    account text NOT NULL
    asset_type text NOT NULL
    multiplier numeric NOT NULL
    created_at timestamptz NULL
    user_id uuid NULL
    currency text NULL
    fee_currency text NULL
    broker_execution_id text NULL
    action text NULL
    execution_timestamp text NULL
    exchange text NULL

There is currently no foreign-key constraint on user_id.


============================================================
22. DATABASE ROLLBACK TEST — MANUAL
============================================================

A dedicated SQL rollback test was performed.

The test used:

    Fake UUID
    Fake account/date context
    Invalid execution data

The invalid insert intentionally used:

    quantity = null

The result returned:

    Success. No rows returned

No failure exception escaped the test block.

This means the test confirmed that the intentional failure caused
the transaction to roll back and cleanup completed.

The purpose was to prove:

    DELETE
        +
    FAILED INSERT

does NOT leave the database in the deleted state.


============================================================
23. DATABASE ROLLBACK TEST — BROKER
============================================================

A separate broker rollback SQL test was performed.

Again:

    Fake UUID
    Fake account
    Fake execution date
    Invalid execution data

The insert intentionally contained:

    quantity = null

The result:

    Success. No rows returned

This confirmed the broker replacement transaction also rolls back
when insertion fails.


============================================================
24. REAL MANUAL EDIT TESTING
============================================================

After implementation:

    npm run build

passed successfully.


Then real application testing was performed.

Tests included:

    Complete Manual Trade Edit

and:

    Partial Exit Edit


The results were reported as working as designed.

This confirms the new API/RPC persistence path works for real
manual trade editing.


============================================================
25. IBKR REAL SYNC TESTING
============================================================

A real IBKR sync was also attempted.

It was Sunday, so all three IBKR accounts returned:

    0 executions

Therefore the normal broker replacement branch was not exercised
during that particular real sync.

However, the isolated database rollback test for the broker
replacement function passed.

Important:

    Real zero-execution sync behavior remains unchanged.

If Flex returns zero executions, fetchFlex still skips the
replacement operation and returns success with executionCount = 0.


============================================================
26. DELETE TRADE WAS NOT REDESIGNED
============================================================

The existing Delete Trade behavior was intentionally left alone.

The current Delete Trade handler still performs its established
logic.

For Partial Exit:

    Delete exact exit execution ID.

For Complete lifecycle:

    Delete by contract_key.

For open remainder:

    Existing lifecycle locking behavior remains.

We did NOT convert Delete Trade into the new replacement RPC because
the goal of this checkpoint was specifically atomic replacement for:

    Manual Trade Edit
    IBKR Broker Sync

Delete Trade is a separate operation and remains unchanged unless
a separate defect is identified.


============================================================
27. WHAT WAS NOT CHANGED
============================================================

The following were deliberately NOT changed:

    FIFO engine
    pairTrades / reconstructed trades
    Trade reconstruction behavior
    Reconciliation
    P&L calculations
    Analytics
    Dashboard V2
    Dashboard legacy architecture
    Manual Entry execution generation
    IBKR Flex parsing logic
    IBKR account architecture
    Multi-account sync architecture
    Manual sync authentication behavior
    Automatic cron sync behavior
    Delete Trade behavior
    Execution schema
    Broker source-of-truth rules
    Date replacement strategy
    Contract lifecycle semantics


============================================================
28. FILES CHANGED / CREATED
============================================================

MODIFIED:

    components/trades/EditTradeModal.tsx

    lib/server/brokers/ibkr/fetchFlex.ts


CREATED:

    app/api/trades/edit/route.ts

    lib/server/sync/replaceBrokerExecutionsAtomically.ts

    lib/server/trades/replaceManualExecutionsAtomically.ts


DATABASE FUNCTIONS CREATED:

    public.replace_manual_executions_atomically

    public.replace_broker_executions_atomically


UNRELATED FILE:

    docs/Manual Entery/Future Improvements

This file was intentionally NOT included in the checkpoint.


============================================================
29. BUILD VERIFICATION
============================================================

After all code changes:

    npm run build

PASSED.


============================================================
30. GIT CHECKPOINT
============================================================

The intended five code files were staged.

The unrelated documentation file was left unstaged.

Commit created:

    0a6b6de


Commit message:

    Checkpoint: Atomic execution persistence


Commit output:

    5 files changed
    593 insertions
    107 deletions

Created files:

    app/api/trades/edit/route.ts

    lib/server/sync/replaceBrokerExecutionsAtomically.ts

    lib/server/trades/replaceManualExecutionsAtomically.ts


The commit was then pushed successfully to:

    origin/main


============================================================
31. FINAL RESULT
============================================================

Elite X now has transactional safety around the two major
execution replacement workflows.

MANUAL EDIT:

    Existing state
        ↓
    Atomic replacement
        ↓
    Success → new state
    Failure → previous state preserved


IBKR SYNC:

    Existing broker state
        ↓
    Atomic replacement
        ↓
    Success → fresh broker state
    Failure → previous broker state preserved


The important guarantee is:

    NO PARTIAL DELETE + INSERT STATE


If a replacement fails halfway through, PostgreSQL rolls back the
entire transaction.

Therefore Elite X's canonical execution ledger is protected from
the specific failure scenario we identified:

    Old executions deleted
        +
    New executions fail to insert
        =
    DATA LOSS


That scenario is now prevented for:

    Manual Trade Edit

and:

    IBKR Broker Sync


============================================================
32. ARCHITECTURAL PRINCIPLE GOING FORWARD
============================================================

Any future feature that performs:

    DELETE existing canonical executions
        +
    INSERT replacement executions

must follow the same atomic transaction principle.

Do NOT introduce a client-side:

    delete()
    then
    insert()

replacement flow for canonical execution data.

Preferred pattern:

    Validate
        ↓
    Authenticate / authorize
        ↓
    Prepare replacement data
        ↓
    Server-side atomic database operation
        ↓
    DELETE + INSERT in ONE transaction
        ↓
    Commit only if everything succeeds
        ↓
    Rollback automatically on failure


============================================================
33. CURRENT STATUS
============================================================

ATOMIC MANUAL TRADE EDIT:
    IMPLEMENTED
    TESTED
    WORKING

ATOMIC IBKR BROKER REPLACEMENT:
    IMPLEMENTED
    DATABASE ROLLBACK TEST PASSED
    REAL ZERO-EXECUTION SYNC TESTED

DATABASE FUNCTIONS:
    CREATED
    SECURITY RESTRICTED
    ROLLBACK TESTED

BUILD:
    PASSED

GIT:
    COMMITTED
    PUSHED TO origin/main

CHECKPOINT:
    0a6b6de

STATUS:
    COMPLETE


============================================================
END OF CHECKPOINT
============================================================