# ELITE X TRADING JOURNAL

# SERVER-SIDE OWNERSHIP & AUTHORIZATION

# MASTER NOTES

**Project:** Elite X Trading Journal / Elite X Trading OS
**Technology:** Next.js 16.2.6 + TypeScript + Supabase
**Audit Area:** Server-Side Ownership / Authorization
**Status:** COMPLETE — ACTIVE PRODUCTION PATHS PASSED
**Date:** September 13, 2026

---

# 1. PURPOSE OF THIS AUDIT

The purpose of this work was to perform a dedicated:

**Server-Side Ownership / Authorization Audit**

The objective was not to add a new trading feature.

The objective was to answer one fundamental security question:

> Can User A use the application, API, or database layer to access, modify, delete, replace, or synchronize User B's trading data?

This audit was performed after completing:

1. Atomic Edit Trade Persistence
2. Atomic Delete Behavior
3. Atomic Broker Sync Replacement

Those changes introduced server-side API routes, privileged Supabase RPCs, and multi-account broker synchronization.

Because Elite X is intended to become a multi-user SaaS platform, user isolation must be verified independently from UI behavior.

The frontend must never be considered the final security boundary.

The database and server must independently enforce ownership.

---

# 2. SECURITY PRINCIPLE

Elite X follows this general ownership model:

```text
Authenticated User
        ↓
Server identifies authenticated user
        ↓
Server derives user.id
        ↓
Server operation
        ↓
Database ownership enforcement
        ↓
User-owned data only
```

For direct client database operations:

```text
Authenticated Supabase Session
        ↓
Supabase RLS
        ↓
auth.uid() = row.user_id
        ↓
User-owned data only
```

For privileged server operations:

```text
Authenticated Request
        ↓
API authentication
        ↓
server-derived user.id
        ↓
server helper
        ↓
SECURITY DEFINER RPC
        ↓
user-scoped database operation
```

The client is never supposed to be trusted to determine ownership.

---

# 3. WHAT WAS AUDITED

The audit covered the active trading and broker ownership paths:

```text
Manual Edit
Manual Delete
Manual Entry execution persistence
Manual IBKR Sync
Broker execution replacement
Nightly Cron Sync
Broker connection access
Executions table RLS
Broker Connections table RLS
Privileged RPC permissions
```

The complete `app/api` tree was also reviewed to identify potentially exposed server endpoints.

Current API routes audited:

```text
app/api/broker-connections/[brokerId]/token/route.ts
app/api/cron/sync-brokers/route.ts
app/api/fx-rates/route.ts
app/api/ibkr/flex/route.ts
app/api/sync-all-brokers/route.ts
app/api/test-sync/route.ts
app/api/trades/delete/route.ts
app/api/trades/edit/route.ts
```

---

# 4. MANUAL EDIT OWNERSHIP AUDIT

## File

```text
app/api/trades/edit/route.ts
```

The API authenticates the incoming Bearer token through Supabase:

```ts
supabase.auth.getUser(token)
```

The authenticated user's identity is obtained from:

```ts
user.id
```

The request body does not provide a `userId`.

The server passes:

```ts
user.id
```

to:

```text
replaceManualExecutionsAtomically()
```

This means the client cannot request:

```text
"Perform this edit as another user."
```

The server determines the owner from the authenticated session.

## Result

```text
PASS
```

No code change required.

---

# 5. MANUAL EDIT SERVER HELPER AUDIT

## File

```text
lib/server/trades/replaceManualExecutionsAtomically.ts
```

The helper receives:

```ts
userId: string
```

and passes it to the PostgreSQL RPC as:

```text
p_user_id: userId
```

The serialized execution payload does not allow a client-supplied `user_id` to override the server-derived owner.

The database RPC ultimately assigns the replacement executions to:

```text
p_user_id
```

rather than accepting an arbitrary user ID from the execution JSON.

## Result

```text
PASS
```

No code change required.

---

# 6. MANUAL EDIT RPC OWNERSHIP AUDIT

## RPC

```text
public.replace_manual_executions_atomically()
```

The current function is:

```text
replace_manual_executions_atomically(
    p_user_id uuid,
    p_delete_mode text,
    p_delete_execution_id text,
    p_contract_key text,
    p_executions jsonb
)
```

The function is:

```text
SECURITY DEFINER
SET search_path TO 'public'
```

## Partial Exit deletion

The database deletes by:

```sql
id = p_delete_execution_id
AND user_id = p_user_id
```

Therefore knowing another user's execution ID is not sufficient to delete that execution.

## Complete Manual Lifecycle deletion

The database deletes by:

```sql
contract_key = p_contract_key
AND user_id = p_user_id
```

Therefore another user's manual lifecycle cannot be deleted through this RPC simply by knowing its contract key.

## Replacement insert

The inserted `user_id` is:

```sql
p_user_id
```

The JSON execution payload does not control the final owner.

## RPC permissions

Current permissions were verified:

```text
anon          → EXECUTE = false
authenticated → EXECUTE = false
service_role  → EXECUTE = true
```

Therefore the privileged RPC cannot be directly invoked by normal client roles.

## Result

```text
PASS
```

No database change required.

---

# 7. MANUAL DELETE API AUDIT

## File

```text
app/api/trades/delete/route.ts
```

The route:

1. Requires an Authorization header.
2. Extracts the Bearer token.
3. Validates the token through Supabase.
4. Obtains the authenticated `user.id`.
5. Does not accept a `userId` from the request body.
6. Passes the authenticated `user.id` to the server helper.

The request only controls the intended delete mode and relevant execution/lifecycle identifier.

The client does not determine ownership.

## Result

```text
PASS
```

No code change required.

---

# 8. MANUAL DELETE SERVER HELPER AUDIT

## File

```text
lib/server/trades/deleteManualExecutionsAtomically.ts
```

The helper requires a server-provided:

```ts
userId: string
```

It validates that the user ID is present.

It supports only:

```text
execution_id
contract_key
```

It passes:

```text
p_user_id: userId
```

to the PostgreSQL RPC.

No client-provided ownership field is accepted.

## Result

```text
PASS
```

No code change required.

---

# 9. MANUAL DELETE RPC OWNERSHIP AUDIT

## RPC

```text
public.delete_manual_executions_atomically()
```

## Partial Exit

The function deletes only when:

```sql
id = p_delete_execution_id
AND user_id = p_user_id
AND contract_key LIKE 'MANUAL-%'
```

This provides three protections:

1. Exact execution identification
2. User ownership
3. Manual execution restriction

## Complete/Open Manual Lifecycle

The function requires:

```sql
contract_key LIKE 'MANUAL-%'
```

and then deletes only:

```sql
contract_key = p_contract_key
AND user_id = p_user_id
```

Therefore lifecycle deletion remains user-scoped.

## Empty deletion protection

If no matching execution is deleted, the function raises:

```text
No matching manual execution was found.
```

Therefore the RPC does not falsely report success when nothing was deleted.

## Security-definer configuration

The function uses:

```text
SECURITY DEFINER
SET search_path TO 'public'
```

## RPC permissions

Verified:

```text
anon          → EXECUTE = false
authenticated → EXECUTE = false
service_role  → EXECUTE = true
```

## Result

```text
PASS
```

No code or database change required.

---

# 10. EXECUTIONS TABLE RLS AUDIT

The current `public.executions` table policies were inspected.

Policies found:

```text
Users can view own executions
Users can insert own executions
Users can update own executions
Users can delete own executions
```

## SELECT

Condition:

```sql
auth.uid() = user_id
```

Result:

```text
PASS
```

## INSERT

Condition:

```sql
auth.uid() = user_id
```

via `WITH CHECK`.

Result:

```text
PASS
```

This is particularly important because Manual Entry uses direct Supabase persistence.

Even if a malicious client modifies the browser request and attempts to submit another user's UUID, the database independently verifies ownership.

## UPDATE

Condition:

```sql
auth.uid() = user_id
```

Result:

```text
PASS
```

## DELETE

Condition:

```sql
auth.uid() = user_id
```

Result:

```text
PASS
```

Therefore direct client access to `executions` is protected by database-level ownership enforcement.

---

# 11. MANUAL ENTRY PERSISTENCE AUDIT

## File

```text
lib/storage/supabaseExecutionStorage.ts
```

Manual execution persistence uses a direct Supabase upsert.

The application assigns:

```ts
user_id: user.id
```

However, the frontend value itself was not considered sufficient security.

The underlying RLS policy was therefore inspected.

The database requires:

```sql
auth.uid() = user_id
```

for INSERT.

This means:

```text
Frontend user_id
        ↓
Supabase request
        ↓
RLS WITH CHECK
        ↓
auth.uid() = user_id
```

The database independently enforces ownership.

## Result

```text
PASS
```

No architecture change required.

---

# 12. BROKER CONNECTION TOKEN API AUDIT

## File

```text
app/api/broker-connections/[brokerId]/token/route.ts
```

This route handles sensitive broker information, specifically the Flex token.

The route first authenticates the incoming Bearer token.

It then obtains:

```text
user.id
```

The broker query requires both:

```text
broker_connections.id = brokerId
```

and:

```text
broker_connections.user_id = user.id
```

Therefore knowing another user's broker ID is not sufficient to retrieve their Flex token.

The route uses `supabaseAdmin`, so the explicit server-side ownership condition is important.

## Result

```text
PASS
```

No code change required.

---

# 13. BROKER CONNECTIONS RLS AUDIT

The current `broker_connections` RLS policies were inspected.

Policies found:

```text
Users can view own broker connections
Users can insert own broker connections
Users can update own broker connections
Users can delete own broker connections
```

## SELECT

```sql
auth.uid() = user_id
```

Result:

```text
PASS
```

## INSERT

```sql
WITH CHECK (auth.uid() = user_id)
```

Result:

```text
PASS
```

## UPDATE

Ownership condition:

```sql
auth.uid() = user_id
```

Result:

```text
PASS
```

## DELETE

Ownership condition:

```sql
auth.uid() = user_id
```

Result:

```text
PASS
```

The policies use the `public` role declaration, but the ownership expression still requires:

```text
auth.uid()
```

to match the row owner.

An anonymous request does not obtain another user's authenticated UUID.

No change was made because the current policies already enforce the required ownership behavior.

---

# 14. MANUAL IBKR SYNC API AUDIT

## File

```text
app/api/sync-all-brokers/route.ts
```

The route requires an Authorization header.

The Supabase token is validated.

The authenticated user's ID is obtained from:

```text
user.id
```

The route then calls:

```text
syncUserBrokers(user.id)
```

The request does not provide a user ID.

Therefore a user cannot request synchronization for another user's brokers through this endpoint.

## Result

```text
PASS
```

No change required.

---

# 15. USER BROKER SELECTION AUDIT

## File

```text
lib/server/sync/syncUserBrokers.ts
```

The broker query is:

```text
broker_connections
WHERE user_id = userId
AND is_active = true
```

The `userId` originates from the authenticated API route.

Therefore the manual sync flow is:

```text
Authenticated User
        ↓
user.id
        ↓
syncUserBrokers(user.id)
        ↓
broker_connections
WHERE user_id = authenticated user
        ↓
only that user's active brokers
```

This is the correct multi-account behavior.

## Result

```text
PASS
```

No change required.

---

# 16. SINGLE BROKER SYNC AUDIT

## File

```text
lib/server/sync/syncBroker.ts
```

This function receives a broker object that has already been selected by the user-scoped broker loader.

It does not select a broker based on client-supplied data.

It passes the broker into:

```text
fetchFlex(broker)
```

and maintains the broker identity throughout the sync.

## Result

```text
PASS
```

No change required.

---

# 17. IBKR FLEX FETCH AUDIT

## File

```text
lib/server/brokers/ibkr/fetchFlex.ts
```

The function receives the already-authorized broker object.

The broker identity is preserved through:

```text
broker.user_id
broker.broker_account_id
```

The execution replacement call receives:

```text
broker.user_id
broker.broker_account_id
executionDates
```

The execution payload itself does not override the final user ownership.

## Result

```text
PASS
```

No change required.

---

# 18. BROKER EXECUTION REPLACEMENT AUDIT

## File

```text
lib/server/sync/replaceBrokerExecutionsAtomically.ts
```

The helper receives:

```text
userId
account
executionDates
executions
```

and passes the ownership information to:

```text
replace_broker_executions_atomically()
```

The execution JSON does not control the final `user_id`.

## Result

```text
PASS
```

No change required.

---

# 19. BROKER REPLACEMENT RPC AUDIT

## RPC

```text
public.replace_broker_executions_atomically()
```

The current function deletes using:

```sql
user_id = p_user_id
AND account = p_account
AND date = ANY(p_execution_dates)
```

This is critical.

The broker replacement cannot delete another user's executions merely because the same account/date exists elsewhere.

## Insert ownership

The function inserts:

```sql
p_user_id
```

as the final execution owner.

The execution JSON cannot override this.

## Security-definer configuration

The function uses:

```text
SECURITY DEFINER
SET search_path TO 'public'
```

## RPC permissions

Verified:

```text
anon          → EXECUTE = false
authenticated → EXECUTE = false
service_role  → EXECUTE = true
```

## Result

```text
PASS
```

No change required.

---

# 20. NIGHTLY CRON SYNC AUDIT

## File

```text
app/api/cron/sync-brokers/route.ts
```

Cron is intentionally different from Manual Sync.

The nightly job is supposed to synchronize all users' active brokers.

Therefore user-session authentication is not the correct ownership model here.

Instead, the endpoint requires:

```text
Bearer ${process.env.CRON_SECRET}
```

Requests without the correct secret receive:

```text
401 Unauthorized
```

Only the protected cron request can reach:

```text
syncAllBrokers()
```

## Result

```text
PASS
```

No change required.

---

# 21. ALL-BROKER CRON SELECTION AUDIT

## File

```text
lib/server/sync/syncAllBrokers.ts
```

This function intentionally selects:

```text
broker_connections
WHERE is_active = true
```

without filtering by a single user.

This is correct because it is reached through the protected cron route.

The intended architecture is:

```text
CRON_SECRET
      ↓
Protected Cron Endpoint
      ↓
syncAllBrokers()
      ↓
all active broker connections
      ↓
syncBroker()
      ↓
broker.user_id
      ↓
user/account-scoped execution replacement
```

This is not a cross-user vulnerability because the all-user behavior is intentional and server-controlled.

## Result

```text
PASS
```

No change required.

---

# 22. UNUSED LEGACY IBKR ENDPOINT

## File

```text
app/api/ibkr/flex/route.ts
```

During the audit, this endpoint was identified as problematic from a security perspective.

It has:

```text
no user authentication
no CRON_SECRET
no user ownership filter
```

It directly selects an active broker connection and uses its Flex credentials.

This endpoint therefore does not meet the security standard of the active production architecture.

However, a repository search found:

```text
NO CURRENT CALLERS
```

The endpoint is therefore classified as:

```text
UNUSED / LEGACY
```

## Decision

The endpoint was intentionally **not deleted or modified**.

Reason:

* Its original purpose is unknown.
* There is no current application caller.
* Removing old functionality unnecessarily introduces risk.
* The current production sync architecture does not depend on it.
* The user explicitly decided to preserve it.

## Status

```text
KNOWN LEGACY SECURITY WEAKNESS
NO CURRENT CALLER
NO CHANGE
```

Future work may decide to archive, secure, or remove it separately.

It must not be treated as an approved production API.

---

# 23. UNUSED TEST SYNC ENDPOINT

## File

```text
app/api/test-sync/route.ts
```

This endpoint was also identified as a security weakness.

It has:

```text
no authentication
no CRON_SECRET
```

and directly calls:

```text
syncAllBrokers()
```

Because `syncAllBrokers()` intentionally synchronizes all active broker connections, an exposed version of this endpoint could potentially trigger a universal broker sync.

The endpoint also returns broker synchronization results.

A repository search found:

```text
NO CURRENT CALLERS
```

## Decision

The endpoint was intentionally **not deleted or modified**.

Reason:

* It may have been created for testing/debugging.
* Its original purpose is unknown.
* There are no current application callers.
* Removing it is outside the necessary scope of this ownership audit.
* The user explicitly decided to leave it in place.

## Status

```text
KNOWN LEGACY / TEST SECURITY WEAKNESS
NO CURRENT CALLER
NO CHANGE
```

It should not be considered part of the approved production API surface.

---

# 24. FX RATES API AUDIT

## File

```text
app/api/fx-rates/route.ts
```

This endpoint does not access user-specific data.

It:

* retrieves public FX information;
* calculates currency conversion rates;
* returns rates;
* does not access executions;
* does not access broker connections;
* does not perform user-specific mutations.

Authentication is therefore not required for the ownership scope of this audit.

## Result

```text
PASS / NOT USER-SCOPED
```

No change required.

---

# 25. COMPLETE ACTIVE OWNERSHIP FLOW

The active Manual Trade architecture now follows:

```text
                    SUPABASE AUTH
                         │
                         ▼
                  authenticated user
                         │
                         ▼
                      user.id
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
       Manual Operations         Broker Operations
            │                         │
            ▼                         ▼
       Server API                User broker lookup
            │                         │
            ▼                         ▼
      Server helper               Broker object
            │                         │
            ▼                         ▼
       Secure RPC                  IBKR Flex
            │                         │
            └────────────┬────────────┘
                         ▼
                    executions
                         │
                         ▼
                    FIFO Engine
                         │
                         ▼
                  Reconstructed Trades
                         │
                         ▼
                    Analytics
                         │
                         ▼
                    Dashboard
```

Ownership is enforced before canonical trading data can be modified.

---

# 26. DIRECT CLIENT DATABASE FLOW

For direct client access:

```text
Authenticated Supabase Session
            ↓
        auth.uid()
            ↓
       Supabase RLS
            ↓
    row.user_id = auth.uid()
            ↓
       User-owned data
```

This protects:

```text
executions
broker_connections
```

from cross-user direct database access.

---

# 27. PRIVILEGED SERVER DATABASE FLOW

For privileged operations:

```text
Client
   ↓
Bearer token
   ↓
Supabase authentication
   ↓
authenticated user.id
   ↓
server helper
   ↓
SECURITY DEFINER RPC
   ↓
user-scoped SQL
```

The client does not get to choose the ownership identity.

---

# 28. WHAT THIS AUDIT PROVED

The audit established that the active production architecture has multiple independent ownership controls.

We are not relying solely on:

```text
React UI
```

or:

```text
client-provided user_id
```

Instead:

```text
API authentication
+
server-derived user.id
+
server-side ownership conditions
+
Supabase RLS
+
restricted privileged RPC permissions
```

work together.

This substantially reduces the risk of cross-user data access.

---

# 29. WHAT WAS NOT CHANGED

During this entire audit:

```text
NO Manual Entry behavior changed
NO Manual Edit behavior changed
NO Manual Delete behavior changed
NO FIFO logic changed
NO pairTrades.ts changed
NO reconstructed trade logic changed
NO P&L logic changed
NO analytics changed
NO Dashboard V2 changed
NO IBKR parser changed
NO broker replacement behavior changed
NO atomic persistence logic changed
NO execution schema changed
NO UI changed
NO broker-sync architecture changed
```

The audit was intentionally read-only.

No production code or database policy was modified because the active paths passed the ownership checks.

---

# 30. SECURITY FINDINGS

## Active Production Paths

```text
Manual Edit                         PASS
Manual Delete                       PASS
Manual Entry execution persistence PASS
Executions RLS                      PASS
Broker connection access            PASS
Broker Connections RLS              PASS
Manual Broker Sync                  PASS
Broker execution replacement        PASS
Broker replacement RPC              PASS
Nightly Cron authentication         PASS
Nightly all-user sync               PASS
FX Rates API                        PASS / NOT USER-SCOPED
```

## Legacy / Test Paths

```text
/api/ibkr/flex
    Status: UNUSED / LEGACY
    Security: NOT SUFFICIENT
    Action: LEAVE UNCHANGED

/api/test-sync
    Status: UNUSED / TEST
    Security: NOT SUFFICIENT
    Action: LEAVE UNCHANGED
```

---

# 31. FINAL STATUS

## SERVER-SIDE OWNERSHIP / AUTHORIZATION

```text
STATUS: COMPLETE
```

The active production execution and broker architecture has passed the ownership audit.

No active-path ownership fix was required.

The two known unauthenticated legacy/test endpoints remain documented exceptions because they are currently unused and were intentionally left untouched.

---

# 32. IMPORTANT FUTURE RULE

Going forward, any new API or server-side operation that touches user-specific data must follow this pattern:

```text
1. Authenticate the request.
2. Obtain the authenticated user's ID server-side.
3. Never trust client-supplied user_id for ownership.
4. Scope database operations to that authenticated user.
5. Use RLS for direct client database access.
6. Use restricted SECURITY DEFINER RPCs for privileged atomic operations.
7. Never expose privileged RPC execution to anon/authenticated roles.
8. Preserve account-level isolation for multi-account broker data.
9. Treat frontend checks as UX only, never as the security boundary.
```

---

# 33. RELATIONSHIP TO THE TRADING ARCHITECTURE

This security work reinforces the existing canonical architecture:

```text
Broker
   ↓
Normalized Executions
   ↓
Supabase Execution Ledger
   ↓
Deterministic FIFO Reconstruction
   ↓
Trades
   ↓
Analytics
   ↓
Dashboard
```

Executions remain the canonical source of truth.

Ownership enforcement happens at the execution and broker-connection boundaries.

The FIFO engine and derived trade layer remain untouched.

---

# 34. NEXT ROADMAP ITEM

With:

```text
#1 Atomic Edit Persistence       COMPLETE
#2 Atomic Delete Behavior        COMPLETE
#3 Ownership / Authorization      COMPLETE
```

the next planned improvement is:

```text
#27 Server-Side Validation Mirror
```

The purpose of that work will be different.

Ownership asks:

> "Does this user have permission to operate on this data?"

Validation asks:

> "Even if the user owns the data, is the submitted data itself valid and safe?"

That should be treated as a separate logical improvement.

Do not combine the two systems unnecessarily.

---

# END OF MASTER NOTES
