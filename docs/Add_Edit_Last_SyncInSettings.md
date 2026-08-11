
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

============================================================
ELITE X TRADING JOURNAL
BROKER SYNC + FLEX TOKEN SECURITY
MASTER CHECKPOINT NOTES
============================================================

DATE:
2026-08-11

STATUS:
COMPLETE

BUILD:
PASS

PURPOSE:
Harden the multi-broker sync architecture and improve
Flex Token security/UX without changing the underlying
broker sync architecture.

============================================================
1. ORIGINAL PROBLEM
============================================================

The Settings page was calling:

POST /api/sync-all-brokers

without passing the authenticated user's access token.

This caused:

POST /api/sync-all-brokers 401

The Dashboard sync already passed the Supabase access token
correctly.

The Settings sync was therefore updated to use the same
authenticated request pattern.

============================================================
2. SETTINGS MANUAL SYNC AUTHENTICATION
============================================================

FILE:

app/settings/page.tsx

The Settings manual sync now retrieves the current Supabase
session:

const {
  data: {
    session,
  },
} = await supabase.auth.getSession();

The access token is validated before making the request.

The request now sends:

headers: {
  Authorization:
    `Bearer ${session.access_token}`,
}

This means the Settings page and Dashboard now follow the
same authenticated manual-sync architecture.

============================================================
3. API ROUTE AUTHENTICATION
============================================================

FILE:

app/api/sync-all-brokers/route.ts

The API route:

1. Reads the Authorization header.
2. Extracts the Bearer token.
3. Creates a Supabase client.
4. Calls:

supabase.auth.getUser(token)

5. Rejects unauthenticated requests with HTTP 401.
6. Uses the authenticated user's ID.
7. Calls:

syncUserBrokers(user.id)

This is important because the API route does NOT blindly
sync every broker in the database.

The sync is now scoped to the authenticated user.

============================================================
4. PER-USER BROKER SYNC
============================================================

FILE:

lib/server/sync/syncUserBrokers.ts

The broker query uses:

.eq("user_id", userId)
.eq("is_active", true)

Therefore:

Manual sync
    ↓
Authenticated user
    ↓
Only that user's active brokers
    ↓
Sync those brokers

One user cannot trigger another user's broker sync.

============================================================
5. MULTI-BROKER FAILURE ISOLATION
============================================================

FILE:

lib/server/sync/syncUserBrokers.ts

Previously, an exception from one broker could terminate the
entire synchronization process.

This was changed so each broker is isolated.

Conceptually:

for each broker:

    try:
        sync broker

    catch:
        log broker failure
        update broker status = error
        continue to next broker

This means:

BROKER A = valid
BROKER B = invalid
BROKER C = valid

Result:

BROKER A → sync succeeds
BROKER B → error recorded
BROKER C → sync succeeds

BROKER B does NOT prevent A or C from syncing.

This is critical for a multi-account trading journal.

============================================================
6. IBKR FLEX RATE-LIMIT PROTECTION
============================================================

FILE:

lib/server/sync/syncUserBrokers.ts

A delay was retained between broker sync attempts:

await new Promise(
  (resolve) =>
    setTimeout(
      resolve,
      3000
    )
);

Purpose:

- Reduce IBKR Flex API rate-limit pressure.
- Avoid firing multiple Flex requests immediately.
- Make sequential multi-account syncing safer.

Sync order remains sequential.

============================================================
7. SYNC STATUS TRACKING
============================================================

FILE:

lib/server/sync/updateSyncStatus.ts

Broker sync status is stored in:

broker_connections

Relevant fields:

last_sync_at
last_sync_status
last_sync_error
last_sync_execution_count

Successful sync:

last_sync_status = "success"

last_sync_error = null

last_sync_execution_count =
actual execution count

Failed sync:

last_sync_status = "error"

last_sync_error =
actual error message

This means the Settings UI can distinguish between:

SUCCESS
ERROR
NEVER SYNCED

============================================================
8. INVALID BROKER DOES NOT BLOCK VALID BROKERS
============================================================

Example:

Deleted Margin Account
    ↓
Invalid Flex Token
    ↓
IBKR:
Fail
1015
Token is invalid.

The system records:

SYNC STATUS UPDATED: error

Then continues:

TFSA Account
    ↓
successful

Margin Account
    ↓
successful

Therefore the invalid broker does not block the valid
accounts.

============================================================
9. SETTINGS UI SYNC STATUS
============================================================

FILE:

app/settings/page.tsx

Broker cards now display the latest sync state.

SUCCESS:

Sync Successful

and:

X Executions Processed

ERROR:

Sync Failed

and:

actual stored error message

This prevents a failed broker from visually appearing
successful.

============================================================
10. FAILED BROKER STATUS INDICATOR
============================================================

A failed/never-successful broker previously displayed a
grey status indicator.

This was changed so a failed broker displays RED.

Successful broker:

GREEN

Failed broker:

RED

This gives immediate visual feedback without requiring the
user to inspect logs.

============================================================
11. FLEX TOKEN EXPOSURE PROBLEM
============================================================

The Settings page originally loaded broker data using:

.select("*")

That meant the Flex Token was included in the normal
browser payload.

This was unnecessary secret exposure.

The broker queries were changed to explicitly select only
the fields required by the Settings UI.

The normal broker list no longer requests:

flex_token

This is an important security boundary.

The browser does NOT receive every broker's Flex Token just
because the Settings page loads.

============================================================
12. BROKER INSERT QUERY
============================================================

FILE:

app/settings/page.tsx

When creating a new broker, the insert still stores:

flex_token

because the server needs the token for IBKR Flex syncing.

However, the returned row uses an explicit select list and
does NOT return:

flex_token

The UI receives only the fields required to render the
broker connection.

============================================================
13. BROKER EDIT LOGIC
============================================================

FILE:

app/settings/page.tsx

The broker update now uses:

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

A new Flex Token is only included when the user actually
enters one:

const newFlexToken =
  editFlexToken.trim();

if (newFlexToken) {
  updatePayload.flex_token =
    newFlexToken;
}

This prevents an important bug.

If a user edits:

- Account Alias
- Broker Account ID
- Flex Query ID

but does NOT enter a new Flex Token,

the existing Flex Token is preserved.

We do NOT overwrite the stored token with an empty string.

============================================================
14. FLEX TOKEN MASKING
============================================================

FILE:

app/settings/page.tsx

Flex Token input uses:

type={
  showFlexToken
    ? "text"
    : "password"
}

Therefore the token is normally displayed as:

••••••••••••••••

instead of showing the actual secret.

The placeholder for an existing broker is also:

••••••••••••••••

This communicates:

"A token exists"

without exposing the actual value.

============================================================
15. EYE ICON
============================================================

FILE:

app/settings/page.tsx

Added:

Eye
EyeOff

The user can click the eye icon to reveal the Flex Token.

Clicking again masks it.

State:

const [
  showFlexToken,
  setShowFlexToken,
] = useState(false);

Behavior:

showFlexToken = false
    ↓
token masked

showFlexToken = true
    ↓
token visible

============================================================
16. SECURE TOKEN RETRIEVAL API
============================================================

NEW FILE:

app/api/broker-connections/[brokerId]/token/route.ts

This endpoint was created specifically for on-demand token
retrieval.

Route:

GET
/api/broker-connections/[brokerId]/token

The browser does NOT receive the Flex Token during the
normal broker list load.

The token is only requested when the user explicitly clicks
the eye icon.

============================================================
17. TOKEN API AUTHENTICATION
============================================================

FILE:

app/api/broker-connections/[brokerId]/token/route.ts

The route:

1. Reads the Authorization header.
2. Extracts the Bearer token.
3. Authenticates the user through:

supabase.auth.getUser(token)

4. Rejects unauthenticated requests.

No authenticated user:

HTTP 401

============================================================
18. BROKER OWNERSHIP CHECK
============================================================

FILE:

app/api/broker-connections/[brokerId]/token/route.ts

The broker lookup uses BOTH:

.eq(
  "id",
  brokerId
)

AND:

.eq(
  "user_id",
  user.id
)

This is critical.

It means a user cannot simply guess another broker's database
ID and retrieve its Flex Token.

The lookup is:

broker ID
+
authenticated user ID

Both must match.

============================================================
19. ADMIN CLIENT USED ONLY SERVER-SIDE
============================================================

FILE:

app/api/broker-connections/[brokerId]/token/route.ts

The token is retrieved using:

supabaseAdmin

The admin client is used only inside the server route.

The browser never receives the service-role credentials.

The browser only receives the token after:

1. User authentication.
2. Broker ownership verification.
3. Explicit token request.

============================================================
20. NORMAL BROKER QUERY
============================================================

The normal Settings broker query now explicitly selects:

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

IMPORTANT:

flex_token is intentionally absent.

============================================================
21. TOKEN REVEAL FLOW
============================================================

FINAL FLOW:

User opens Settings
        ↓
Broker connections loaded
        ↓
Flex Token NOT included
        ↓
UI displays:

••••••••••••••••

        ↓
User clicks Eye
        ↓
Get Supabase session
        ↓
Get access token
        ↓
GET:

/api/broker-connections/{brokerId}/token

        ↓
API authenticates user
        ↓
API verifies broker belongs to user
        ↓
Server retrieves Flex Token
        ↓
Token returned to browser
        ↓
editFlexToken state populated
        ↓
Token displayed
        ↓
User clicks Eye again
        ↓
Token masked

============================================================
22. ADD BROKER BEHAVIOR
============================================================

When clicking:

+ Add Broker

the state is reset:

setModalMode("add");

setSelectedBroker(null);

setEditAccountAlias("");

setEditQueryId("");

setEditFlexToken("");

setEditBrokerAccountId("");

setIsEditModalOpen(true);

Therefore Add Broker starts with an empty Flex Token field.

The eye icon does not attempt to retrieve a token because
there is no existing broker yet.

============================================================
23. EDIT BROKER BEHAVIOR
============================================================

When editing an existing broker:

setModalMode("edit");

setSelectedBroker(connection);

setEditAccountAlias(
  connection.account_alias || ""
);

setEditBrokerAccountId(
  connection.broker_account_id || ""
);

setEditQueryId(
  connection.flex_query_id || ""
);

setEditFlexToken("");

setIsEditModalOpen(true);

The actual token is intentionally NOT loaded immediately.

The token is only retrieved when the user clicks the eye.

============================================================
24. IMPORTANT SECURITY RESULT
============================================================

Before:

Settings page
    ↓
Load broker connections
    ↓
flex_token included in response

After:

Settings page
    ↓
Load broker connections
    ↓
flex_token excluded
    ↓
User explicitly clicks Eye
    ↓
Authenticated token request
    ↓
Ownership verified
    ↓
Token returned only when requested

This reduces unnecessary secret exposure.

============================================================
25. WHAT WAS NOT CHANGED
============================================================

The following architecture was intentionally preserved:

IBKR Flex API
        ↓
fetchFlexStatement()
        ↓
fetchFlex()
        ↓
syncBroker()
        ↓
syncUserBrokers()
        ↓
sync-all-brokers API
        ↓
Canonical execution storage
        ↓
Trade reconstruction

No changes were made to:

- Execution ledger architecture
- pairTrades()
- Trade reconstruction
- FIFO logic
- Execution persistence
- Trading analytics
- P&L calculations
- Dashboard analytics
- IBKR parsing architecture
- Supabase execution storage

The work was isolated to broker authentication,
multi-broker failure handling, sync status, and token
exposure/UX.

============================================================
26. FINAL ARCHITECTURE
============================================================

USER
 |
 | authenticated Supabase session
 v
/api/sync-all-brokers
 |
 v
authenticated user ID
 |
 v
syncUserBrokers(user.id)
 |
 +-------------------------+
 |                         |
 v                         v
Broker A                 Broker B
 |                         |
 v                         v
syncBroker()             syncBroker()
 |                         |
 v                         v
IBKR Flex                IBKR Flex
 |                         |
 +-----------+-------------+
             |
             v
      Per-broker status
             |
      +------+------+
      |             |
   SUCCESS        ERROR
      |             |
   GREEN           RED

============================================================

FLEX TOKEN SECURITY:

Settings
 |
 | normal load
 v
No Flex Token returned
 |
 | user clicks Eye
 v
/api/broker-connections/[brokerId]/token
 |
 v
Authenticate user
 |
 v
Verify broker belongs to user
 |
 v
supabaseAdmin
 |
 v
Retrieve token
 |
 v
Return token
 |
 v
Display token

============================================================
27. CURRENT STATUS
============================================================

BUILD:

PASS

Manual multi-broker sync:

PASS

Per-user sync isolation:

PASS

Failure isolation:

PASS

Per-broker sync status:

PASS

Error persistence:

PASS

Red failed-state UI:

PASS

Flex Token removed from normal broker payload:

PASS

Flex Token masking:

PASS

Eye reveal:

PASS

Authenticated token retrieval:

PASS

Broker ownership validation:

PASS

Existing token preservation during edits:

PASS

============================================================
28. FUTURE ROADMAP — NOT PART OF THIS CHECKPOINT
============================================================

Potential future improvement:

Replace:

useState<any[]>([])

with a proper canonical:

BrokerConnection

TypeScript interface/type.

This should be handled separately so it does not unnecessarily
expand the current change.

Potential future production hardening:

Consider dedicated secret-management/encryption architecture
if Elite X moves toward a larger commercial SaaS deployment.

DO NOT implement this as part of the current checkpoint.

============================================================
29. FINAL DECISION
============================================================

This implementation is considered complete for the current
scope.

Do not continue changing the architecture simply for the
sake of "future proofing."

The current design provides:

- Authentication
- User isolation
- Broker isolation
- Failure isolation
- Persistent sync status
- Clear error visibility
- Reduced secret exposure
- On-demand token retrieval
- Explicit broker ownership verification
- Safe token editing behavior
- Clean separation between UI and server-side secret access

BUILD PASSED.

READY FOR CHECKPOINT.

============================================================
END OF MASTER NOTES
============================================================