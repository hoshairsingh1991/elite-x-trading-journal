# Current Persistence Doctrine

Elite X now officially operates on:

```txt
cloud-canonical deterministic execution reconstruction
```

Canonical accounting truth now exists ONLY in:

```txt
Supabase execution ledger
```

Imported executions are persisted as:

```txt
NormalizedExecution[]
```

through:

```txt
Supabase executions table
```

Current canonical flow:

```txt
CSV Upload
↓
Normalize Executions
↓
Persist To Supabase
↓
Load Canonical Executions From Supabase
↓
Deterministic FIFO Rebuild
↓
Canonical Trades
↓
Analytics + UI
```

This architecture permanently solves:

* browser divergence
* cross-device reconstruction mismatch
* stale local execution pollution
* hybrid state drift
* local reconstruction inconsistency
* duplicate upload instability
* domain-level accounting divergence
* inconsistent open positions


---

# Canonical Cloud Persistence Rule

Supabase persistence stores ONLY:

```txt
NormalizedExecution[]
```

NOT:

```txt
Trade[]
```

Trades MUST remain:

```txt
deterministic derived state
```

through:

```txt
pairTrades()
```

This architecture is considered:

FOUNDATIONAL

Do NOT bypass deterministic rebuild systems by:

* directly persisting synthetic trades
* mutating reconstructed trade objects
* storing analytics snapshots as canonical truth
* introducing append-based trade persistence
* creating mutable trade-ledger architectures


---

# Execution Identity Protection

Execution deduplication now exists at BOTH:

## Local Layer

```txt
appendExecutions()
```

AND:

## Cloud Layer

```txt
PRIMARY KEY(id)
+
upsert(onConflict: "id")
```

Duplicate protection MUST remain execution-scoped.

Do NOT move duplicate prevention into:

```txt
synthetic trade layer
```

---

# Current Cloud Persistence Boundary

Cloud persistence currently applies ONLY to:

```txt
imported executions
```

Manual trade entries currently remain:

```txt
local-only presentation persistence
```

until future manual execution architecture is designed.

---

---

# Canonical Reconstruction Loading Behavior

Elite X now performs:

```txt
single-source canonical cloud reconstruction
```

during initialization.

Current flow:

```txt
Supabase executions
↓
Deterministic chronological ordering
↓
FIFO quantity-aware reconstruction
↓
pairTrades()
↓
canonical reconstructed trades
```

All environments now reconstruct from:

```txt
single immutable cloud execution ledger
```

This architecture guarantees:

```txt
same execution ledger
→ same reconstructed trades
→ every single time
```

provided execution identity remains deterministic.

# Sync Ordering Doctrine

Elite X MUST always reconstruct executions using:

1. execution timestamp
2. stable deterministic secondary ordering

The same execution set MUST always reconstruct
in identical chronological order.

Sync systems MUST NEVER rely on:
- insertion order
- upload order
- async fetch order
- Supabase return order


Elite X MUST always reconstruct executions using:

1. execution timestamp
2. stable deterministic secondary ordering

The same execution ledger MUST always reconstruct:

```txt
same executions
→ same chronological ordering
→ same lifecycle reconstruction
→ same accounting result


# Protected Persistence Architecture Rule

Elite X MUST NEVER evolve toward:

```txt
mutable trade CRUD architecture
```

Canonical accounting truth MUST remain:

```txt
execution-first deterministic reconstruction
```

Cloud synchronization exists ONLY to transport immutable execution history.

NOT to mutate reconstructed trade state.

# Behavioral Cloud Persistence

Elite X now supports cloud persistence for:

- Notes
- Daily Calendar Notes
- Execution Ledger

via:

```txt
Supabase
```

This enables:

- cross-device continuity
- behavioral journaling persistence
- cloud-native reconstruction
- production-safe persistence architecture
- execution-ledger synchronization
- deterministic cloud rebuilds

# Elite X — Execution Ledger Architecture Notes

## Current Stable Checkpoint

0b91fe1
checkpoint/broker-execution-enrichment-v10

Current working branch:

checkpoint/execution-ledger-architecture-v11

---

# What We Investigated

We attempted to make:

IBKR Activity Flex Query

behave as a canonical execution source for:
- trade reconstruction
- lifecycle pairing
- P&L
- open/closed trades
- journal history

Similar to:

IBKR Trade Confirmation Flex Query

---

# Main Problems Encountered

## Symptoms

Activity Flex imports produced:

- Nov 30 1899 trades
- duplicate lifecycle states
- orphan closes
- malformed open trades
- phantom CLOSED trades
- duplicated P&L
- corrupted dashboard metrics
- synthetic inventory reconstruction
- inconsistent account lifecycle states

Examples:

AMD
1899 → Aug 7 2025

RCI.B
1899 → 1899

PLUG
fractional ghost inventory

---

# What We Tried

## Parser Filtering

We added:
- commission filters
- execution ID filters
- trade ID filters
- LevelOfDetail filters
- FX exclusion
- micro fractional filtering
- Open/Close validation
- orphan sell suppression

## Lifecycle Guards

We attempted:
- strict lifecycle validation
- entry existence enforcement
- invalid date rejection
- synthetic trade blocking
- dedupe logic
- execution integrity checks

## Pairing Engine Fixes

We investigated:
- fallback dates
- synthetic entry creation
- orphan execution handling
- carryover inventory reconstruction

---

# Key Discovery

The issue was NOT primarily pairTrades().

The issue was architectural.

---

# Critical Difference Between IBKR Sources

## Trade Confirmation Flex

Behavior:
- deterministic
- immutable execution history
- true broker fills only
- lifecycle complete
- execution-centric

Result:
- stable pairing
- correct open/closed trades
- deterministic accounting

---

## Activity Flex Query

Behavior:
- accounting-centric
- contains broker reconstruction rows
- includes:
  - position snapshots
  - MTM rows
  - accounting summaries
  - carryover inventory
  - reopening events
  - cost basis adjustments
  - synthetic lifecycle bookkeeping

Result:
- duplicate economic trades
- partial lifecycle states
- synthetic reconstruction rows
- impossible deterministic pairing

---

# Important Realization

Activity Flex is NOT a pure execution feed.

It is:

broker accounting history

not:

canonical execution history

This distinction is critical.

---

# Final Architectural Decision

## Canonical Execution Source

IBKR Trade Confirmation Flex

Responsibilities:
- executions
- pairing
- lifecycle reconstruction
- open trades
- closed trades
- P&L
- commissions
- analytics
- dashboard metrics

This becomes Elite X’s:

canonical execution ledger

---

# Activity Flex New Role

Activity Flex will remain supported, but ONLY for:

- cash balances
- FX balances
- deposits
- withdrawals
- dividends
- interest
- NAV/account reconciliation
- supplemental broker accounting analytics

NOT:
- trade reconstruction
- pairing
- canonical executions
- lifecycle generation

---

# Important Production Insight

Professional systems separate:

| Layer | Purpose |
|---|---|
| Execution Systems | trade lifecycle |
| Accounting Systems | balances/accounting |

Elite X now follows this architecture.

---

# Flex Sync Foundation

The platform is now architecturally prepared for:

* IBKR Flex ingestion
* overnight synchronization
* broker-native reconciliation
* idempotent sync behavior
* cross-source execution parity

Future ingestion systems MUST guarantee:

```txt
same broker execution
→ same canonical execution identity
```

regardless of source:

* CSV import
* Flex query
* future broker APIs

This behavior is considered:

```txt
FOUNDATIONAL RECONCILIATION DOCTRINE
```

# Current Platform State

Elite X currently supports:

✅ canonical execution persistence  
✅ deterministic lifecycle reconstruction  
✅ hybrid local + cloud synchronization  
✅ Supabase execution ledger  
✅ cloud behavioral notes  
✅ manual execution ingestion  
✅ immutable broker history  
✅ lifecycle-safe manual deletion  
✅ production Vercel deployment  

---

# Current Status

Stable baseline restored successfully via:

git reset --hard HEAD
git clean -fd

System reverted to stable V10 production state before Activity Flex experimentation.

---

# Current Stable Git State

git log --oneline -5

0b91fe1 (HEAD -> checkpoint/execution-ledger-architecture-v11, origin/main, main)
checkpoint/broker-execution-enrichment-v10

30d6a9a checkpoint/broker-execution-enrichment-v10

774092a checkpoint/account-overview-multi-currency-v2

4b985a3 checkpoint/multi-currency-accounting-v1

d25de5b checkpoint/profile-system-auth-v10

Latest Stable Checkpoint with USER ID AUTH
git commit -m "checkpoint/account-overview-multi-currency-v2"
checkpoint/broker-execution-enrichment-v10
git checkout -b checkpoint/execution-ledger-architecture-v11

---

# Safe Reset Command

```js
localStorage.clear()
location.reload()
```

# ELITE X TRADING JOURNAL
# MASTER CHECKPOINT NOTES
# Broker Sync — Multi-User / Multi-Account Hardening + Credential Protection

Date:
2026-08-10

Status:
COMPLETED
BUILD PASSED
CHECKPOINT COMMITTED AND PUSHED TO origin/main


============================================================
1. OBJECTIVE
============================================================

The goal of this work was to harden the IBKR broker synchronization
architecture before moving further into production development.

The main problems addressed were:

1. Manual sync could previously operate through the global
   syncAllBrokers() path.

2. Manual sync needed to be scoped strictly to the currently
   authenticated user.

3. One user's manual sync must NEVER synchronize another user's
   broker accounts.

4. A single invalid broker connection must NOT prevent the user's
   other valid broker connections from syncing.

5. Sync status needed to distinguish SUCCESS from ERROR.

6. Settings UI needed to clearly show failed broker synchronization.

7. Broker credentials, especially the IBKR Flex Token, should not
   be exposed unnecessarily to the client UI.

8. Editing a broker connection without entering a new Flex Token
   must preserve the existing token.

9. The system must remain compatible with multiple IBKR accounts
   per user.

10. The architecture must remain compatible with the existing
    canonical execution-ledger system.


============================================================
2. FINAL ARCHITECTURE
============================================================

There are now two different synchronization entry points.

------------------------------------------------------------
MANUAL USER SYNC
------------------------------------------------------------

User clicks Sync in the application.

Flow:

Browser
    ↓
/api/sync-all-brokers
    ↓
Authenticate Supabase access token
    ↓
Get authenticated user.id
    ↓
syncUserBrokers(user.id)
    ↓
Load ONLY that user's active broker_connections
    ↓
syncBroker(broker)
    ↓
IBKR fetchFlex()
    ↓
Update individual broker sync status

This is USER-SCOPED.

A user cannot manually synchronize another user's broker
connections through this route.


------------------------------------------------------------
GLOBAL / AUTOMATED SYNC
------------------------------------------------------------

The global synchronization path remains available for automated
server-side synchronization.

Flow:

syncAllBrokers()
    ↓
Load active broker_connections
    ↓
syncBroker(broker)
    ↓
Each broker is processed independently

This path is intended for server-side/cron synchronization and
should not be exposed directly as the user-scoped manual endpoint.


============================================================
3. FILES ADDED / USED
============================================================

The following synchronization structure is now part of the
architecture:

lib/server/sync/syncAllBrokers.ts

lib/server/sync/syncUserBrokers.ts

lib/server/sync/syncBroker.ts

lib/server/sync/updateSyncStatus.ts

lib/server/brokers/ibkr/fetchFlex.ts

lib/server/brokers/ibkr/fetchFlexStatement.ts

lib/server/sync/saveExecutions.ts

lib/server/sync/deleteExecutionWindow.ts

app/api/sync-all-brokers/route.ts


============================================================
4. syncAllBrokers.ts
============================================================

Purpose:

Global/server-side synchronization of all active broker
connections.

Current structure:

import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  syncBroker,
} from "@/lib/server/sync/syncBroker";

export async function
syncAllBrokers() {

  const {
    data: brokers,
    error,
  } = await supabaseAdmin
    .from("broker_connections")
    .select("*")
    .eq(
      "is_active",
      true
    );

  if (error) {

    console.error(
      "FAILED TO LOAD ACTIVE BROKERS:",
      error
    );

    throw error;
  }

  const results = [];

  for (
    const broker of brokers || []
  ) {

    const result =
      await syncBroker(
        broker
      );

    results.push(
      result
    );

    // ==========================================
    // IBKR FLEX RATE LIMIT PROTECTION
    // ==========================================

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          3000
        )
    );
  }

  return results;
}


============================================================
5. syncUserBrokers.ts
============================================================

Purpose:

User-scoped manual synchronization.

This is the important security boundary for manual sync.

Current structure:

import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  syncBroker,
} from "@/lib/server/sync/syncBroker";

export async function
syncUserBrokers(
  userId: string
) {

  const {
    data: brokers,
    error,
  } = await supabaseAdmin
    .from("broker_connections")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .eq(
      "is_active",
      true
    );

  if (error) {

    console.error(
      "FAILED TO LOAD USER BROKERS:",
      error
    );

    throw error;
  }

  const results = [];

  for (
    const broker of brokers || []
  ) {

    try {

      const result =
        await syncBroker(
          broker
        );

      results.push(
        result
      );

    } catch (error) {

      console.error(
        "BROKER SYNC FAILED:",
        broker.account_alias,
        broker.broker_account_id,
        error
      );

      results.push({
        success: false,
        brokerId:
          broker.id,
        brokerAccountId:
          broker.broker_account_id,
        accountAlias:
          broker.account_alias,
        error:
          error instanceof Error
            ? error.message
            : "Unknown broker sync error",
      });
    }

    // ==========================================
    // IBKR FLEX RATE LIMIT PROTECTION
    // ==========================================

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          3000
        )
    );
  }

  return results;
}


IMPORTANT:

The try/catch around each broker is intentional.

A failed broker must NOT terminate the entire loop.

Example:

Broker A → SUCCESS
Broker B → ERROR
Broker C → SUCCESS

All three are processed.


============================================================
6. syncBroker.ts
============================================================

Purpose:

Synchronize one individual broker connection.

Current architecture:

import {
  fetchFlex,
} from "@/lib/server/brokers/ibkr/fetchFlex";

import {
  updateSyncStatus,
} from "@/lib/server/sync/updateSyncStatus";

export async function
syncBroker(
  broker: any
) {

  console.log(
    "SYNCING BROKER:",
    broker.account_alias
  );

  if (
    broker.broker ===
    "IBKR"
  ) {

    try {

      const result =
        await fetchFlex(
          broker
        );

      await updateSyncStatus(
        broker.id,
        result.executionCount,
        "success",
        null
      );

      console.log(
        "FETCH RESULT:",
        result
      );

      return {
        success: true,
        brokerId:
          broker.id,
      };

    } catch (error) {

      console.error(
        "BROKER SYNC FAILED:",
        broker.account_alias,
        broker.broker_account_id,
        error
      );

      await updateSyncStatus(
        broker.id,
        0,
        "error",
        error instanceof Error
          ? error.message
          : "Unknown broker sync error"
      );

      throw error;
    }
  }

  return {
    success: true,
    brokerId:
      broker.id,
  };
}


IMPORTANT:

The critical behavior is:

fetchFlex()
    ↓
SUCCESS
    ↓
updateSyncStatus(..., "success", null)

OR

fetchFlex()
    ↓
ERROR
    ↓
updateSyncStatus(..., "error", error message)
    ↓
throw error

The error is re-thrown so syncUserBrokers() can record the
individual broker failure while continuing with the next broker.


============================================================
7. updateSyncStatus.ts
============================================================

Purpose:

Persist the latest synchronization result for each broker
connection.

The broker_connections table contains:

last_sync_at
last_sync_status
last_sync_error
last_sync_execution_count

Current function:

import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

export async function
updateSyncStatus(
  brokerId: string,
  executionCount: number,
  status: "success" | "error",
  errorMessage: string | null
) {

  const {
    error,
  } = await supabaseAdmin
    .from("broker_connections")
    .update({
      last_sync_at:
        new Date().toISOString(),

      last_sync_status:
        status,

      last_sync_error:
        errorMessage,

      last_sync_execution_count:
        executionCount,
    })
    .eq(
      "id",
      brokerId
    );

  if (error) {

    console.error(
      "FAILED TO UPDATE SYNC STATUS:",
      error
    );

    throw error;
  }

  console.log(
    "SYNC STATUS UPDATED:",
    status
  );
}


IMPORTANT:

The old version only supported:

last_sync_status = "success"

and always cleared the error.

That was replaced with explicit:

"success"

or

"error"

and an optional error message.


============================================================
8. MANUAL API ROUTE
============================================================

File:

app/api/sync-all-brokers/route.ts

Purpose:

This endpoint is now USER-SCOPED.

The browser sends the authenticated Supabase access token.

Current structure:

import {
  createClient,
} from "@supabase/supabase-js";

import {
  syncUserBrokers,
} from "@/lib/server/sync/syncUserBrokers";

export async function POST(
  request: Request
) {

  try {

    const authHeader =
      request.headers.get(
        "authorization"
      );

    if (!authHeader) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const supabase =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

    const {
      data: {
        user,
      },
      error,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      error ||
      !user
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const results =
      await syncUserBrokers(
        user.id
      );

    return Response.json({
      success: true,
      results,
    });

  } catch (error) {

    console.error(
      "MANUAL SYNC FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Manual sync failed",
      },
      {
        status: 500,
      }
    );
  }
}


IMPORTANT SECURITY CHANGE:

The API does NOT accept a userId from the browser.

The user is derived from:

Supabase access token
        ↓
supabase.auth.getUser(token)
        ↓
user.id
        ↓
syncUserBrokers(user.id)


This prevents a client from requesting another user's broker
synchronization by supplying a different user ID.


============================================================
9. SETTINGS PAGE MANUAL SYNC
============================================================

File:

app/settings/page.tsx


The old implementation:

fetch(
  "/api/sync-all-brokers",
  {
    method: "POST",
  }
);

was replaced with authenticated request handling.

Current structure:

const handleSyncNow =
async () => {

  try {

    setIsSyncing(true);

    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    if (
      !session?.access_token
    ) {

      console.error(
        "NO AUTHENTICATED SESSION"
      );

      return;
    }

    const response =
      await fetch(
        "/api/sync-all-brokers",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

    const data =
      await response.json();

    console.log(
      "SYNC RESULT:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {

      console.error(
        "SYNC FAILED:",
        data
      );

      return;
    }

    window.location.reload();

  } catch (error) {

    console.error(
      "SYNC FAILED:",
      error
    );

  } finally {

    setIsSyncing(false);
  }
};


IMPORTANT:

The Dashboard and Settings manual sync must use the same
authenticated user-scoped API behavior.

The browser must send:

Authorization:
Bearer <session.access_token>


============================================================
10. WHY THE 401 ERROR HAPPENED
============================================================

Initially Settings called:

POST /api/sync-all-brokers

without the Authorization header.

The API correctly returned:

401 Unauthorized

The Settings page was then updated to retrieve:

supabase.auth.getSession()

and send:

Authorization:
Bearer ${session.access_token}

After this change:

POST /api/sync-all-brokers 200

was observed.

Therefore the authentication flow is working.


============================================================
11. MULTI-BROKER ERROR ISOLATION
============================================================

A deliberate invalid IBKR account was created for testing.

Example:

Deleted Margin account
IBKR ACCOUNT: U27682445
FLEX QUERY: 1600000

IBKR returned:

1015
Token is invalid.

or:

1025
Too many failed attempts.
Please review your configuration.

The system now records:

last_sync_status = "error"

and stores the actual error message.

The important behavior is that synchronization continues.

Example observed:

Deleted Margin account
    ↓
ERROR

TFSA Account.
    ↓
SUCCESS

Margin Account
    ↓
SUCCESS

The API still returned:

POST /api/sync-all-brokers 200

because the overall manual operation completed even though one
individual broker failed.

This is intentional.


============================================================
12. SYNC STATUS UI
============================================================

Settings now distinguishes:

SUCCESS

ERROR

and previously-uninitialized/unknown state.

Successful broker:

Sync Successful

X Executions Processed


Failed broker:

Sync Failed

<actual error message>


The previous generic grey state was changed so that a broker
with an error is visually represented by a RED status indicator.

This makes it immediately obvious that the broker did not
synchronize successfully.

Example:

Deleted Margin account
    RED
    Sync Failed
    Failed to retrieve reference code


============================================================
13. IMPORTANT IBKR BEHAVIOR
============================================================

A broker returning:

NO EXECUTIONS FOUND. SKIPPING SYNC.

is NOT considered an error.

Example:

XML RECEIVED: 2182 bytes
NO EXECUTIONS FOUND. SKIPPING SYNC.
SYNC STATUS UPDATED: success

This means:

- Flex request succeeded
- XML was received
- Parser found zero executions
- No execution replacement was performed
- Sync itself succeeded

Therefore:

executionCount = 0

does NOT mean sync failed.


============================================================
14. EXECUTION REPLACEMENT ARCHITECTURE
============================================================

When executions ARE returned:

parseIBKRCsv(xml)
    ↓
executionDates
    ↓
deleteExecutionWindow(...)
    ↓
saveExecutions(...)

The existing canonical execution-ledger architecture remains
unchanged.

The system still follows:

IBKR
    ↓
Normalize Executions
    ↓
Persist NormalizedExecution[]
    ↓
Deterministic FIFO Rebuild
    ↓
pairTrades()
    ↓
Trades
    ↓
Analytics / UI


============================================================
15. FLEX TOKEN SECURITY CHANGE
============================================================

Previous problem:

The Settings page selected:

flex_token

from broker_connections and could expose the real Flex Token
to client-side state.

That was unnecessary.

The client-side SELECT statements were changed so broker
connections loaded by the Settings page no longer include:

flex_token


The client still receives:

id
user_id
broker
account_alias
broker_account_id
flex_query_id
is_active
created_at
updated_at
last_sync_at
last_sync_status
last_sync_error
last_sync_execution_count


The actual Flex Token remains in the database and is used by
server-side synchronization.


============================================================
16. BROKER INSERT
============================================================

When ADDING a new broker, the token is still written to the
database because the server/client form must submit the token
during initial configuration.

Example:

.insert({
  user_id: user.id,

  broker: "IBKR",

  account_alias:
    editAccountAlias.trim(),

  broker_account_id:
    editBrokerAccountId.trim(),

  flex_query_id:
    editQueryId.trim(),

  flex_token:
    editFlexToken.trim(),

  is_active: true,
})


The INSERT response deliberately does NOT select flex_token.

Instead it selects:

id
user_id
broker
account_alias
broker_account_id
flex_query_id
is_active
created_at
updated_at
last_sync_at
last_sync_status
last_sync_error
last_sync_execution_count


This prevents the newly-created record from returning the secret
back into client state.


============================================================
17. BROKER EDIT TOKEN PROTECTION
============================================================

IMPORTANT:

When editing an existing broker, the Flex Token should NOT be
loaded into editFlexToken.

Instead the UI displays a masked placeholder:

••••••••••••••••


The actual value is never placed into client state.


============================================================
18. EDIT BROKER UPDATE LOGIC
============================================================

Current update logic:

if (!selectedBroker) {
  return;
}

const updatePayload: {
  account_alias: string;
  broker_account_id: string;
  flex_query_id: string;
  flex_token?: string;
} = {

  account_alias:
    editAccountAlias.trim(),

  broker_account_id:
    editBrokerAccountId.trim(),

  flex_query_id:
    editQueryId.trim(),
};

const newFlexToken =
  editFlexToken.trim();

if (newFlexToken) {

  updatePayload.flex_token =
    newFlexToken;
}

const { error } =
await supabase
  .from("broker_connections")
  .update(
    updatePayload
  )
  .eq(
    "id",
    selectedBroker.id
  );


CRITICAL BEHAVIOR:

If the user does NOT enter a new token:

newFlexToken === ""

Therefore:

flex_token

is NOT included in updatePayload.

The existing database token remains untouched.


If the user DOES enter a new token:

updatePayload.flex_token =
newFlexToken

and the existing token is replaced.


============================================================
19. FLEX TOKEN INPUT UI
============================================================

The Flex Token input was changed from:

<input
  value={editFlexToken}
  onChange={(e) =>
    setEditFlexToken(
      e.target.value
    )
  }
/>


to:

<input
  type="password"
  value={editFlexToken}
  placeholder={
    modalMode === "edit"
      ? "••••••••••••••••"
      : ""
  }
  onChange={(e) =>
    setEditFlexToken(
      e.target.value
    )
  }
  className="
    relative
    left-[10px]
    w-[95%]
    rounded-xl
    bg-[#050816]
    border
    border-white/10
    px-4
    py-4
    text-white
    placeholder:text-slate-500
  "
/>


This means:

EDIT MODE:

Flex Token
••••••••••••••••


ADD MODE:

Flex Token
[empty input]


The dots are only a placeholder.

They are NOT the actual token.

This is important because placing fake asterisks into
editFlexToken would cause the database to potentially be
overwritten with fake token data.


============================================================
20. VERIFIED TOKEN-PRESERVATION TEST
============================================================

Test performed:

Existing TFSA broker was edited.

Account alias was changed from:

TFSA Account

to:

TFSA Account.


The Flex Token was NOT entered.

Then manual synchronization was performed.

Result:

SYNCING BROKER: TFSA Account.

IBKR ACCOUNT: U24697147
FLEX QUERY: 1515767

XML RECEIVED: 2182 bytes

NO EXECUTIONS FOUND.
SKIPPING SYNC.

SYNC STATUS UPDATED: success

This proves:

- Existing token remained valid.
- Editing the broker did not erase the token.
- Masked token behavior works.
- Existing broker configuration remains functional.


============================================================
21. VERIFIED ERROR ISOLATION TEST
============================================================

Test configuration:

Broker 1:
Deleted Margin account
Invalid Flex Token

Broker 2:
Margin Account
Valid credentials

Broker 3:
TFSA Account.
Valid credentials


Observed:

Deleted Margin account
    ↓
IBKR error 1015/1025
    ↓
Sync status = error

Margin Account
    ↓
XML received
    ↓
No executions
    ↓
Sync status = success

TFSA Account.
    ↓
XML received
    ↓
No executions
    ↓
Sync status = success


This proves that a single invalid broker no longer stops the
remaining brokers from synchronizing.


============================================================
22. SERVER-SIDE SUPABASE ADMIN CLIENT
============================================================

File:

lib/server/supabaseAdmin.ts


Current implementation:

import {
  createClient,
} from "@supabase/supabase-js";


export const supabaseAdmin =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  );


This client is server-only.

It is used by:

syncAllBrokers()
syncUserBrokers()
updateSyncStatus()
and other server synchronization operations.


IMPORTANT:

Never import supabaseAdmin into client components.


============================================================
23. SETTINGS CLIENT SUPABASE
============================================================

Settings continues to use:

import { supabase }
from "@/lib/supabase";


This client is used for:

- authenticated session retrieval
- broker configuration UI
- broker insert/update
- loading safe broker metadata


The service-role client remains server-only.


============================================================
24. DATA NOW EXPOSED TO CLIENT
============================================================

Safe broker metadata loaded by Settings:

id
user_id
broker
account_alias
broker_account_id
flex_query_id
is_active
created_at
updated_at
last_sync_at
last_sync_status
last_sync_error
last_sync_execution_count


NOT loaded into client state:

flex_token


This is an intentional security boundary.


============================================================
25. THINGS WE DID NOT CHANGE
============================================================

We did NOT change:

- pairTrades()
- canonical execution ledger
- execution normalization
- FIFO reconstruction
- trade reconstruction
- analytics
- P&L calculations
- dashboard analytics
- reporting currency
- FX conversion
- expense system
- PDF export
- trade history
- calendar
- Supabase execution schema
- IBKR execution parser architecture
- execution deletion/replacement strategy


This checkpoint is specifically about:

BROKER SYNCHRONIZATION
+
USER ISOLATION
+
ERROR ISOLATION
+
SYNC STATUS
+
CREDENTIAL EXPOSURE


============================================================
26. CURRENT BROKER SYNC BEHAVIOR
============================================================

MANUAL SYNC:

Authenticated user
    ↓
Get access token
    ↓
API verifies token
    ↓
Get user.id
    ↓
Load:
broker_connections
WHERE:
user_id = authenticated user
AND:
is_active = true
    ↓
Loop brokers
    ↓
Sync each broker
    ↓
Continue even if one fails


AUTOMATED SYNC:

syncAllBrokers()
    ↓
Load active broker connections
    ↓
Process each broker sequentially
    ↓
3-second delay between brokers


============================================================
27. RATE LIMIT PROTECTION
============================================================

A 3-second delay exists between broker synchronization attempts.

Current pattern:

await new Promise(
  resolve =>
    setTimeout(
      resolve,
      3000
    )
);


This is specifically important for IBKR Flex API protection.

Do not remove this casually.


============================================================
28. CURRENT ERROR HANDLING
============================================================

Broker-level error:

fetchFlex()
    ↓
throws
    ↓
syncBroker catches
    ↓
updateSyncStatus(
  broker.id,
  0,
  "error",
  error.message
)
    ↓
throw error
    ↓
syncUserBrokers catches
    ↓
records failed broker
    ↓
continues loop


Therefore an invalid account does not prevent valid accounts
from syncing.


============================================================
29. CURRENT UI STATUS MODEL
============================================================

SUCCESS:

Green status indicator

Sync Successful

X Executions Processed


ERROR:

Red status indicator

Sync Failed

Actual error message


UNKNOWN / NEVER SYNCED:

Should not be visually represented as successful.

The failed state was specifically changed from the previous
generic grey indicator to RED.


============================================================
30. TEST ACCOUNT
============================================================

A deliberately invalid broker was created during testing:

Account alias:

Deleted Margin account

IBKR account:

U27682445

Flex Query:

1600000

Its token is invalid.

Expected behavior:

IBKR error

last_sync_status:
"error"

Red UI status

Other valid accounts continue syncing.


This account should eventually be disabled or deleted once
testing is finished.

DO NOT mistake its error for a system-wide sync failure.


============================================================
31. IMPORTANT OBSERVED LOGS
============================================================

Successful broker:

SYNCING BROKER: TFSA Account.

IBKR ACCOUNT: U24697147

FLEX QUERY: 1515767

XML RECEIVED: 2182 bytes

NO EXECUTIONS FOUND.
SKIPPING SYNC.

SYNC STATUS UPDATED: success


Another successful broker:

SYNCING BROKER: Margin Account

IBKR ACCOUNT: U18458305

FLEX QUERY: 1523205

XML RECEIVED: 1146 bytes

NO EXECUTIONS FOUND.
SKIPPING SYNC.

SYNC STATUS UPDATED: success


Failed broker:

SYNCING BROKER: Deleted Margin account

IBKR ACCOUNT: U27682445

FLEX QUERY: 1600000

Warn
1025
Too many failed attempts.
Please review your configuration.

BROKER SYNC FAILED:
Deleted Margin account
U27682445

Error:
Failed to retrieve reference code

SYNC STATUS UPDATED: error


The final API request still completed:

POST /api/sync-all-brokers 200


This is correct because the synchronization operation itself
completed and individual broker failures were isolated.


============================================================
32. BUILD VERIFICATION
============================================================

After all changes:

npm run build

PASSED.

No build errors were reported.


============================================================
33. GIT CHECKPOINT
============================================================

A checkpoint was created after the build passed.

Recommended checkpoint message:

checkpoint: harden multi-account broker sync

The changes were pushed to:

origin/main


This checkpoint should be treated as the rollback point before
future broker-sync architecture changes.


============================================================
34. FUTURE IMPROVEMENTS
============================================================

These were intentionally NOT implemented in this checkpoint.

They should be considered future hardening work.


------------------------------------------------------------
A. DISABLE / DELETE BROKER
------------------------------------------------------------

Currently an invalid broker can remain active and generate
errors on every sync.

Preferred future solution:

Do NOT immediately hard-delete broker connections.

Instead support:

is_active = false

This allows the configuration to remain stored while preventing
future synchronization.

UI should eventually provide:

Enable Sync
Disable Sync
Delete Connection


Preferred behavior:

Disabled broker
    ↓
excluded from:
syncUserBrokers()
syncAllBrokers()


------------------------------------------------------------
B. STRONG TYPES
------------------------------------------------------------

Current code still uses:

broker: any

and:

useState<any[]>([])

This should eventually become a proper:

BrokerConnection

TypeScript interface/type.

The type should distinguish:

SERVER-ONLY SECRET FIELDS

from:

CLIENT-SAFE FIELDS.


------------------------------------------------------------
C. BETTER API RESULT MODEL
------------------------------------------------------------

Current API can return:

success: true

while one broker failed.

This is acceptable for the current implementation because the
operation itself completed.

Future improvement:

{
  success: true,
  status: "partial",
  successful: 2,
  failed: 1,
  results: [...]
}


Possible states:

success
partial
failed


This will improve UI reporting.


------------------------------------------------------------
D. CONCURRENT SYNC LOCK
------------------------------------------------------------

Future-proofing should eventually prevent:

Cron Sync
+
Manual Sync

from simultaneously synchronizing the same broker connection.

Possible future architecture:

broker_sync_lock

or:

sync_started_at
sync_status = "running"


The system should reject or skip duplicate synchronization
requests for the same broker.


------------------------------------------------------------
E. RETRY / BACKOFF
------------------------------------------------------------

IBKR errors such as:

1015
1025

should eventually be classified.

Do not blindly retry authentication/configuration errors.

Potential categories:

AUTHENTICATION_ERROR
RATE_LIMIT_ERROR
BROKER_API_ERROR
NETWORK_ERROR
PARSER_ERROR
DATABASE_ERROR
EMPTY_RESULT


Different categories can receive different retry policies.


------------------------------------------------------------
F. SYNC AUDIT LOG
------------------------------------------------------------

Future production architecture should eventually maintain a
dedicated sync history table.

Example:

broker_sync_runs

id
broker_connection_id
user_id
started_at
completed_at
status
execution_count
error_code
error_message
duration_ms


This would allow historical visibility instead of only keeping
the latest sync status.


------------------------------------------------------------
G. CREDENTIAL ENCRYPTION
------------------------------------------------------------

The current improvement prevents the Flex Token from being
unnecessarily exposed to the client.

The next security level would be encrypting broker secrets at
rest rather than storing them as plaintext.

This should be treated as a separate security project and should
not be mixed into ordinary UI work.


============================================================
35. ARCHITECTURAL RULES GOING FORWARD
============================================================

RULE 1:

Manual sync must always derive the user identity from the
authenticated Supabase session.

Never trust:

userId

supplied by the browser.


RULE 2:

Never expose:

flex_token

to the client unless there is a compelling reason.


RULE 3:

Editing a broker without entering a new Flex Token must never
erase the existing token.


RULE 4:

A broker failure must not terminate synchronization of other
brokers belonging to the same user.


RULE 5:

A zero-execution successful Flex response is NOT a sync error.


RULE 6:

Broker-level errors must be persisted in:

last_sync_status
last_sync_error
last_sync_at


RULE 7:

The canonical execution ledger remains the source of truth.

Broker synchronization only creates/updates executions.


RULE 8:

Never reconstruct or mutate trades directly as part of the
broker synchronization layer.


RULE 9:

Keep server-only Supabase service-role access inside server
modules.


RULE 10:

Do not remove the IBKR Flex delay without revisiting rate-limit
behavior.


============================================================
36. FINAL STATE OF THIS CHECKPOINT
============================================================

STATUS:

[COMPLETED]

Manual sync:
USER-SCOPED

Multi-account:
SUPPORTED

Multi-user isolation:
SUPPORTED

Broker failure isolation:
SUPPORTED

Sync status:
SUCCESS / ERROR

Error message:
PERSISTED

Failed UI indicator:
RED

Successful UI indicator:
GREEN

Flex Token:
NOT EXPOSED IN CLIENT BROKER DATA

Flex Token Edit:
MASKED

Existing token preservation:
VERIFIED

Invalid broker:
DOES NOT STOP OTHER BROKERS

IBKR Flex rate-limit delay:
3 SECONDS

Build:
PASSED

Git:
CHECKPOINT CREATED

GitHub:
PUSHED TO origin/main


============================================================
37. CHECKPOINT SUMMARY
============================================================

This checkpoint establishes a significantly safer foundation
for Elite X broker synchronization.

The synchronization system now follows:

AUTHENTICATED USER
        ↓
USER-SCOPED BROKER CONNECTIONS
        ↓
INDIVIDUAL BROKER SYNC
        ↓
SUCCESS / ERROR
        ↓
PERSIST STATUS
        ↓
CONTINUE NEXT BROKER


Credentials follow:

BROKER CONFIGURATION
        ↓
SERVER-SIDE STORAGE
        ↓
SERVER-SIDE IBKR REQUEST

while the client only receives safe broker metadata.

The most important architectural principle established here is:

ONE BROKER FAILURE MUST NEVER BECOME
A SYSTEM-WIDE USER SYNC FAILURE.

This checkpoint should be treated as the baseline for all future
broker synchronization development.