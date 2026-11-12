# ELITE X TRADING JOURNAL
# ADMINISTRATOR SECURITY AUDIT
## Security, Authorization, Data Integrity & Account Lifecycle

**Project:** Elite X Trading Journal / Elite X Trading OS  
**Document:** Master Security Audit & Implementation Roadmap  
**Version:** 2.0  
**Last Updated:** November 4, 2026  
**Platform:** Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel  
**Audit Mode:** Read-only discovery  
**Current Phase:** Security discovery and architecture assessment  
**Implementation Status:** No remediation changes made during the November 4 audit session.

---

# 1. PROJECT OBJECTIVE

The objective is to establish a secure foundation for Elite X before activating live Administrator functionality and expanding invite-only beta access.

The Administrator system will eventually allow an authorized administrator to:

- Review new user registrations.
- Approve or reject users.
- Suspend and reactivate accounts.
- Assign or change user access plans.
- Grant or revoke additional capabilities.
- Control trial access.
- Change account permissions.
- View account and subscription information.
- Review administrative activity through an audit log.
- Perform authorized account-management operations.

The user has explicitly decided that approval, rejection, and plan assignment will initially be handled manually by the administrator.

There will be no automated approval or paid-subscription assignment policy in the current beta implementation.

Payments, checkout, Stripe and production billing integration are outside the current implementation scope.

## 1.1 Primary security objective

Build one consistent authorization architecture that protects:

1. Frontend pages.
2. API routes.
3. Server-side functions.
4. Supabase database operations.
5. Direct browser-side Supabase operations.
6. Background synchronization.
7. Scheduled jobs.
8. Administrative operations.

The UI must never be the final security boundary.

A user must not be able to bypass application restrictions by directly calling an API or Supabase endpoint.

## 1.2 Protected architecture

The security project must preserve the existing Elite X trading architecture.

Canonical data flow:

Canonical Executions
        |
        v
Supabase Executions Ledger
        |
        v
pairTrades()
        |
        v
Derived Trades / Positions
        |
        v
P&L / Analytics / Dashboard

Executions remain the canonical source of truth.

Do not redesign or replace:

- Canonical execution ledger.
- FIFO pairing.
- pairTrades().
- Trade reconstruction.
- P&L calculations.
- Existing analytics architecture.
- Manual execution lifecycle behavior.
- Atomic execution persistence.
- Existing Notes V2 data model.
- Existing password recovery functionality.

Security remediation must protect this architecture, not replace it.

---

# 2. STATUS DEFINITIONS

Use these definitions throughout the document.

- [VERIFIED] Directly confirmed in the supplied current source or live database output.
- [IMPLEMENTED] Previously implemented and recorded as deployed.
- [NEEDS TESTING] Implementation exists, but required regression tests remain.
- [CONFIRMED GAP] A required security control is missing.
- [STRUCTURAL RISK] A missing safeguard creates a potential security or integrity problem.
- [OPEN] Not yet inspected or verified.
- [DEFERRED] Deliberately postponed.
- [HISTORICAL] Finding from an earlier audit that must not automatically be treated as current.
- [RISK] Known unresolved issue that must be addressed before the applicable release gate.

Severity levels:

- CRITICAL: Directly exposes highly sensitive information or permits an unauthorized privileged operation.
- HIGH: Significant security, authorization, or canonical data-integrity risk.
- MEDIUM: Meaningful security, operational, or reliability concern.
- LOW: Limited risk, maintenance concern, or non-critical improvement.
- INFORMATIONAL: Architecture observation or documentation improvement.

Important:

An implementation being present does not mean all regression tests have passed.

A database query confirming a privilege does not automatically prove that a particular public API exposes an exploitable path.

Always distinguish observed behavior from potential impact.

---

# 3. EXECUTIVE SUMMARY — NOVEMBER 4, 2026

## 3.1 Current overall position

The initial Administrator Security Audit has covered a substantial portion of the application.

We have inspected:

- Authentication and protected routes.
- Signup and login.
- AuthProvider.
- Manual trade creation.
- Manual trade editing.
- Manual trade deletion.
- Atomic execution RPC functions.
- Trade Intelligence API.
- Trade Review storage and RLS.
- Broker connection management.
- Broker credential retrieval.
- Manual broker synchronization.
- Scheduled broker synchronization.
- IBKR Flex statement retrieval.
- IBKR execution parsing.
- Broker replacement persistence.
- Cron authentication.
- Legacy IBKR Flex endpoint.
- Supabase service-role client imports.
- Broker connection table security.
- Trade Review table security.

The following architecture is already in place:

- Authenticated users are identified through Supabase Auth.
- The inspected manual trade API routes derive user identity from a verified Supabase user.
- Manual execution RPCs have restricted execution permissions.
- Trade Reviews have user-scoped RLS policies.
- Broker Connections have user-scoped RLS policies.
- Manual broker sync filters connections by authenticated user ID.
- Scheduled cron authentication requires an exact Bearer secret.
- Trade Intelligence retrieves canonical financial data server-side.

However, the application does not yet have centralized account approval, suspension, read-only, administrator-role, or entitlement enforcement.

This is the principal architectural gap.

## 3.2 Highest-priority current findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| SEC-001 | CRITICAL | Legacy IBKR Flex API has no authentication and exposes brokerage XML | OPEN / RELEASE BLOCKER |
| SEC-002 | HIGH | Broker replacement SQL deletes NULL contract-key legacy executions | CONFIRMED |
| SEC-003 | HIGH | Broker replacement SQL does not validate inserted account/date values against requested replacement scope | CONFIRMED |
| SEC-004 | HIGH | No centralized account approval or suspension enforcement | CONFIRMED |
| SEC-005 | HIGH | Scheduled broker sync does not check user eligibility or sync entitlement | CONFIRMED |
| SEC-006 | HIGH | Authenticated users can directly modify broker synchronization metadata | CONFIRMED |
| SEC-007 | HIGH | Excessive TRUNCATE grants exist on inspected public tables | CONFIRMED |
| SEC-008 | MEDIUM | Dashboard broker upsert conflict target does not match the live unique index | CONFIRMED |
| SEC-009 | MEDIUM | Dashboard directly retrieves stored Flex tokens through SELECT * | CONFIRMED |
| SEC-010 | MEDIUM | Manual execution helper silently deduplicates duplicate IDs | CONFIRMED |
| SEC-011 | MEDIUM | AI Trade Intelligence has no visible per-user usage or concurrency limit | CONFIRMED |
| SEC-012 | MEDIUM | IBKR parser does not verify returned account identity against expected account | CONFIRMED |
| SEC-013 | MEDIUM | IBKR-generated execution IDs do not include broker ExecID | POTENTIAL DATA-INTEGRITY RISK |
| SEC-014 | MEDIUM | Service-role clients do not explicitly establish a server-only import boundary | NEEDS FURTHER REVIEW |

These findings are described in detail below.

---

# 4. IMPORTANT CORRECTIONS TO OLDER AUDIT DOCUMENTS

The October 24 and October 25 documents contain historical findings that have since changed.

The current source files and live Supabase definitions inspected on November 4 take precedence.

Do not copy obsolete findings forward as current vulnerabilities.

## 4.1 Manual edit RPC

Older finding:

The manual edit RPC did not enforce manual-only deletion of the existing target.

November 4 verification:

The current live function now checks the existing target's contract key for both:

- execution_id mode.
- contract_key mode.

Both modes require the manual lifecycle prefix.

The function also verifies user ownership, locks the target rows, validates lifecycle preservation and performs atomic replacement.

Current status:

[IMPLEMENTED] Manual edit protection is present in the live SQL function.

[NEEDS TESTING] Cross-user and broker-execution regression tests remain necessary.

## 4.2 Broker replacement RPC

Older finding:

The broker replacement function did not explicitly exclude manual executions.

November 4 verification:

The live function now contains:

```sql
AND (
    contract_key IS NULL
    OR contract_key NOT LIKE 'MANUAL-%'
);
```

Therefore:

- Manual executions with MANUAL-% are preserved.
- Non-manual executions are eligible for deletion.
- NULL contract-key records are also deleted.

The previous remediation notes recorded an intention to preserve NULL contract-key legacy executions.

This creates a discrepancy between the previously documented intention and the current live SQL.

The current behavior must be reconciled before making another database change.

## 4.3 Cron authentication

Older finding:

The cron endpoint could potentially accept a literal Bearer undefined if CRON_SECRET was missing.

November 4 verification:

The current route explicitly rejects missing CRON_SECRET before checking the request header.

Current status:

[VERIFIED] Missing-secret configuration fails closed.

[VERIFIED] Authorization uses an exact Bearer-secret comparison.

Production Vercel environment configuration remains unverified.

## 4.4 Test-sync authentication

Older finding:

The test-sync endpoint was previously documented as unauthenticated.

November 4 verification:

The current route now checks CRON_SECRET and requires an exact Bearer-secret match.

Current status:

[VERIFIED] Authentication guard is present.

[NEEDS REVIEW] Whether the test endpoint should remain in production.

---

# 5. AUTHENTICATION AND AUTHORIZATION

## 5.1 AuthProvider

File:

providers/AuthProvider.tsx

Current behavior:

- Retrieves the Supabase session.
- Tracks the current user.
- Tracks authentication loading state.
- Subscribes to Supabase authentication state changes.

[VERIFIED] Authentication state is available globally.

[CONFIRMED GAP] No centralized application account state is exposed.

Missing concepts:

- Approval status.
- Account status.
- Administrator role.
- Read-only status.
- Effective plan.
- Feature capabilities.
- Quota usage.

## 5.2 ProtectedRoute

File:

components/auth/ProtectedRoute.tsx

Current behavior:

- Checks whether the user is authenticated.
- Redirects unauthenticated users to login.
- Displays a loading state.

[VERIFIED] It is a login guard.

[CONFIRMED GAP] It is not an application authorization guard.

A valid Supabase session currently does not establish that an Elite X account is approved or eligible.

## 5.3 Signup

File:

app/signup/page.tsx

Current behavior:

- Uses Supabase signUp().
- Accepts email and password.
- Collects full name metadata.
- Validates password confirmation.
- Uses a six-character minimum password check.
- Requires acceptance of terms.

[CONFIRMED GAP] No invitation or administrator approval gate is enforced.

## 5.4 Login

File:

app/login/page.tsx

Current behavior:

- Uses signInWithPassword().
- Starts the login transition.
- Navigates to dashboard after authentication.

[CONFIRMED GAP] No application approval or account-status resolution occurs before redirect.

## 5.5 Forgot password and update password

Files:

app/forgot-password/page.tsx

app/update-password/page.tsx

Current behavior:

- Password reset email is requested through Supabase.
- Generic success messaging helps avoid email enumeration.
- Update-password retrieves the current session.
- New password is submitted through updateUser().

These flows must remain functional when account approval is implemented.

Do not accidentally block password recovery for pending users.

## 5.6 Middleware / Proxy

The supplied project structure and earlier source searches did not reveal a root-level middleware.ts or proxy.ts.

[OPEN] Recheck the current project tree before implementation.

Do not introduce middleware merely because it is common in Next.js applications.

Choose the trusted authorization architecture based on the existing application and current Next.js version.

---

# 6. TARGET ACCOUNT AND ENTITLEMENT MODEL

The application must separate different concepts.

Do not combine approval, administrator role, plan, subscription and account status into one overloaded field.

## 6.1 Account approval

Expected concepts:

PENDING
APPROVED
REJECTED

The administrator decides approval manually.

Users must never be able to approve themselves by changing client-side state or editing their own profile.

## 6.2 Account status

Expected concepts:

ACTIVE
READ_ONLY
SUSPENDED

These are separate from administrator role and subscription plan.

## 6.3 Administrator role

Initial beta model:

OWNER
USER

Future model may introduce:

OWNER
ADMIN
SUPPORT
ANALYST
USER

Do not introduce unnecessary complexity in the first implementation.

Administrator permissions must be granted through a trusted server-side mechanism.

## 6.4 Plan and capability model

Existing intended capabilities:

| Plan | Manual Journal | IBKR Connections | Scheduled Sync | Manual Sync Now |
|---|---|---:|---|---|
| Basic | Yes | 0 | No | No |
| Pro | Yes | Up to 2 | Yes | No |
| Elite | Yes | Unlimited | Yes | Yes |
| Trial | Yes | Up to 1 | Yes | Yes |

The current beta does not introduce payments.

Administrator-assigned access should use an explicit grant or beta entitlement mechanism rather than pretending that a manually assigned plan is a paid Stripe subscription.

## 6.5 Important unresolved trial policy

The original product specification states that the 14-day trial starts after successful email verification.

The current manual approval direction introduces a possible alternative: trial starts when the administrator approves the user.

This decision remains unresolved.

Do not silently change trial commencement rules during schema implementation.

Resolve this before creating trial lifecycle migrations.

## 6.6 Entitlement precedence

The intended long-term precedence:

1. Active administrative/owner grant.
2. Active paid subscription, when billing exists.
3. Active trial.
4. Read-only access when no write entitlement remains.
5. Forced suspension/restriction overrides normal access.

For the current beta:

- No Stripe checkout.
- No real paid subscription records.
- No automated payment processing.
- Administrator-controlled approval and access assignment.

---

# 7. SUPABASE DATABASE SECURITY

## 7.1 Existing public tables

Historical October audit identified 14 public tables:

1. broker_connections
2. daily_notes
3. daily_review_trade_notes
4. executions
5. expenses
6. note_annotations
7. note_attachments
8. note_blocks
9. note_trade_links
10. note_trades
11. notes
12. profiles
13. trade_reviews
14. user_tax_profiles

The earlier audit recorded RLS enabled on all 14.

[HISTORICAL] Recheck the complete list before applying privilege migrations.

## 7.2 RLS versus privileges

Remember:

RLS controls which rows a role can access.

SQL privileges control which database operations a role can invoke.

These are different security layers.

RLS does not protect a table against TRUNCATE.

Service-role clients bypass ordinary RLS policies.

SECURITY DEFINER functions execute with their owner's privileges.

All privileged operations must therefore be independently reviewed.

## 7.3 Excessive grants

The older full-table audit reported TRUNCATE privileges for anon and authenticated across all 14 public tables.

November 4 live checks independently confirmed excessive privileges on:

- public.trade_reviews
- public.broker_connections

Both inspected tables showed TRUNCATE for anon and authenticated.

Other unnecessary privileges included:

- TRIGGER
- REFERENCES

Important limitation:

The grant metadata does not independently prove that normal Supabase REST requests can invoke TRUNCATE.

Nevertheless, these privileges require a least-privilege remediation plan.

Do not revoke privileges blindly.

Before creating a migration:

1. Inventory actual application operations.
2. Identify explicit grants.
3. Identify PUBLIC grants.
4. Identify default privileges.
5. Identify RPC dependencies.
6. Identify service-role requirements.
7. Prepare a version-controlled migration.
8. Test all dependent workflows.
9. Apply only after review and approval.

---

# 8. TRADE REVIEWS DATABASE AUDIT

## 8.1 Table

public.trade_reviews

Live inspection:

| Property | Result |
|---|---|
| Owner | postgres |
| RLS enabled | true |
| RLS forced | false |

## 8.2 RLS policies

Four policies were verified:

| Operation | Condition |
|---|---|
| SELECT | auth.uid() = user_id |
| INSERT | WITH CHECK auth.uid() = user_id |
| UPDATE | USING and WITH CHECK ownership |
| DELETE | auth.uid() = user_id |

[VERIFIED] Ownership policies are correctly configured.

All policies are limited to authenticated users.

## 8.3 Constraints

Verified:

trade_reviews_pkey
PRIMARY KEY (id)

trade_reviews_unique_closed_trade
UNIQUE (user_id, entry_execution_id, exit_execution_id)

trade_reviews_distinct_executions
CHECK (entry_execution_id <> exit_execution_id)

trade_reviews_user_id_fkey
REFERENCES auth.users(id) ON DELETE CASCADE

## 8.4 Indexes

Verified:

trade_reviews_pkey
trade_reviews_unique_closed_trade
trade_reviews_user_id_idx

The additional user-only index may be redundant because the composite unique index starts with user_id.

Do not remove it without query-plan and index-usage evidence.

## 8.5 Grants

November 4 table-grant query showed:

anon:
- REFERENCES
- TRIGGER
- TRUNCATE

authenticated:
- SELECT
- INSERT
- UPDATE
- DELETE
- REFERENCES
- TRIGGER
- TRUNCATE

service_role:
- REFERENCES
- TRIGGER
- TRUNCATE

postgres:
- Full listed privileges

The authenticated DML privileges remain constrained by RLS ownership policies.

[CONFIRMED GAP] Excessive privileges need review.

## 8.6 Trade Review application files

Files:

lib/storage/supabaseTradeReviewStorage.ts

lib/ai/tradeIntelligence/loadTradeReview.ts

The browser storage helper:

- Obtains the authenticated user.
- Filters reads by user_id.
- Filters updates and deletes by user_id.
- Sets user_id from the authenticated session during insertion.
- Uses the database's three-column unique identity.

The AI loader uses the authenticated, user-scoped Supabase client.

[VERIFIED] Ownership structure is sound.

[OPEN] Runtime validation of database results and consistent execution-ID trimming remain possible improvements.

---

# 9. BROKER CONNECTION DATABASE AUDIT

## 9.1 Table

public.broker_connections

Live inspection:

| Property | Result |
|---|---|
| Owner | postgres |
| RLS enabled | true |
| RLS forced | false |

## 9.2 RLS policies

Four ownership policies exist:

- Users can view own broker connections.
- Users can insert own broker connections.
- Users can update own broker connections.
- Users can delete own broker connections.

All use:

auth.uid() = user_id

The policies are assigned to PUBLIC.

The UPDATE policy does not explicitly list WITH CHECK; PostgreSQL uses its USING condition as the default check condition for UPDATE when WITH CHECK is omitted.

[VERIFIED] Row ownership is protected.

## 9.3 Constraints and indexes

Primary key:

broker_connections_pkey
PRIMARY KEY (id)

Foreign key:

broker_connections_user_id_fkey
REFERENCES auth.users(id) ON DELETE CASCADE

Unique index:

broker_connections_user_broker_account_unique
UNIQUE (user_id, broker_account_id)

Important:

No unique index on (user_id, broker) was returned.

## 9.4 Dashboard schema mismatch

File:

app/dashboard/page.tsx

The Dashboard uses:

```ts
.upsert(
  {
    user_id: user.id,
    broker: "IBKR",
    flex_query_id: flexQueryId,
    flex_token: flexToken,
    is_active: true,
  },
  {
    onConflict: "user_id,broker",
  }
);
```

But the live database has:

UNIQUE (user_id, broker_account_id)

The configured conflict target does not match the verified unique index.

The Dashboard also queries:

```ts
.eq("user_id", user.id)
.eq("broker", "IBKR")
.single();
```

This assumes one IBKR connection per user.

The current Settings implementation and database index support multiple broker accounts.

[CONFIRMED GAP] Dashboard broker-management logic is inconsistent with the multi-account database model.

Preserve the multi-account architecture when addressing this.

## 9.5 Table grants

The live table grants include:

anon:
- REFERENCES
- TRIGGER
- TRUNCATE

authenticated:
- INSERT
- SELECT
- UPDATE
- REFERENCES
- TRIGGER
- TRUNCATE

postgres:
- Full listed privileges

service_role:
- SELECT
- UPDATE
- REFERENCES
- TRIGGER
- TRUNCATE

Authenticated does not have table-level DELETE privilege in the returned results, even though a DELETE RLS policy exists.

A policy alone does not grant the required SQL privilege.

## 9.6 Column grants

Authenticated has INSERT, SELECT and UPDATE privileges across all inspected broker connection columns, including:

- user_id
- flex_token
- flex_query_id
- broker_account_id
- is_active
- last_sync_at
- last_sync_status
- last_sync_error
- last_sync_execution_count
- sync_cursor_date
- created_at
- updated_at

RLS protects row ownership.

However, it does not prevent the owner from modifying their own server-managed synchronization metadata.

[HIGH] Column-level access should be reviewed.

Server-managed synchronization fields should eventually be writable only through trusted server-side operations.

## 9.7 Flex credential exposure

The authenticated role can SELECT flex_token.

Therefore, the token is available through direct browser Supabase queries as well as the explicit token endpoint.

The Settings page intentionally reveals the user's own Flex token through a password field and eye control.

This is an established product behavior and should not be removed without examining the user experience.

However, a future design should consider separating sensitive credentials from ordinary broker configuration data.

---

# 10. MANUAL TRADE EXECUTION SECURITY

## 10.1 API routes inspected

app/api/trades/create/route.ts

app/api/trades/edit/route.ts

app/api/trades/delete/route.ts

All three:

- Read the Authorization header.
- Validate the Supabase access token using getUser().
- Derive the user ID from the verified Supabase user.
- Pass user.id to the appropriate server helper.
- Do not accept user_id from the request body.

[VERIFIED] User identity derivation is correct.

[CONFIRMED GAP] None of these routes checks approval, suspension, read-only access or entitlement.

## 10.2 Authorization header handling

Create, edit and delete use:

```ts
authHeader.replace("Bearer ", "")
```

This does not strictly validate the Bearer scheme.

The Trade Intelligence route uses more explicit parsing.

Future API hardening should use consistent token extraction and return predictable 401 responses.

## 10.3 Manual execution validator

File:

lib/server/trades/validateManualExecutions.ts

Existing validation includes:

- Non-empty execution arrays.
- Required fields.
- BUY/SELL action.
- Finite numeric values.
- Positive quantity.
- Positive execution price.
- Positive multiplier.
- Non-negative execution value and fees.
- Supported currency validation.
- MANUAL- contract-key prefix.
- Execution-value consistency.

Outstanding observations:

- Full calendar-date validation is not established.
- Duplicate execution IDs are not rejected.
- Contract-key validation only checks the prefix.
- No explicit maximum batch size.
- No maximum string-length limits.
- Currency normalization is used for validation but the original value is not necessarily rewritten.
- Fee-currency normalization has the same consideration.

## 10.4 Manual creation helper

File:

lib/server/trades/createManualExecutionsAtomically.ts

Uses:

supabaseAdmin.rpc("create_manual_executions_atomically", ...)

The helper validates the executions before the RPC.

It serializes normalized records and deduplicates them using a Map keyed by execution ID.

Important:

Duplicate IDs are silently discarded. The last record with an identical ID wins.

This behavior exists in create and edit helpers.

[MEDIUM] Investigate whether duplicates can arise legitimately before deciding whether they should be rejected.

## 10.5 Manual edit helper

File:

lib/server/trades/replaceManualExecutionsAtomically.ts

Uses:

supabaseAdmin.rpc("replace_manual_executions_atomically", ...)

It:

- Validates manual executions.
- Validates delete mode.
- Serializes replacement executions.
- Deduplicates execution IDs.
- Calls the privileged RPC.

No direct cross-user identity bypass was identified in the inspected API/helper flow.

## 10.6 Manual delete helper

File:

lib/server/trades/deleteManualExecutionsAtomically.ts

Uses:

supabaseAdmin.rpc("delete_manual_executions_atomically", ...)

Supports:

execution_id
contract_key

Validates required values before calling the RPC.

## 10.7 Manual RPC permissions

Three live database functions were verified:

public.create_manual_executions_atomically

public.replace_manual_executions_atomically

public.delete_manual_executions_atomically

All have:

- Owner: postgres.
- SECURITY DEFINER: true.
- search_path: public.
- anon EXECUTE: false.
- authenticated EXECUTE: false.
- service_role EXECUTE: true.

[VERIFIED] Ordinary users cannot execute these privileged RPCs directly.

The API routes authenticate users and pass server-derived identity to the helpers.

## 10.8 Manual creation SQL

The creation SQL:

- Requires user ID.
- Requires a JSON array.
- Inserts using p_user_id.
- Returns inserted row count.
- Raises an error when no rows are inserted.

The SQL does not independently enforce the MANUAL- prefix on every incoming execution.

The current server helper's validator provides that check.

[MEDIUM] Consider whether database-level manual-source enforcement is appropriate as additional defense in depth.

## 10.9 Manual edit SQL

Migration:

supabase/migrations/20261024224324_harden_manual_execution_edit.sql

Live function verification confirmed:

- User ID is required.
- Replacement array cannot be empty.
- Existing execution is retrieved using execution ID and user ID.
- Existing execution must have MANUAL-% contract key.
- Lifecycle mode requires MANUAL-% contract key.
- Target rows are locked using FOR UPDATE.
- Every replacement execution must preserve the original lifecycle key.
- Deletion is limited to the validated manual target.
- Insertion uses p_user_id.
- Operation is transactional.

[IMPLEMENTED] Manual edit source-type protection is present.

[NEEDS TESTING] Explicit broker-execution protection and rollback tests remain.

## 10.10 Manual delete SQL

Live function:

public.delete_manual_executions_atomically

Verified:

- User ID required.
- Supports individual execution deletion.
- Supports lifecycle deletion.
- Requires MANUAL-% prefix.
- Filters by user ID.
- Raises an exception if nothing is deleted.
- Returns deleted row count.
- Execute permission restricted to service_role and postgres.

[VERIFIED] Database deletion scope is manual-only and user-scoped.

---

# 11. BROKER EXECUTION REPLACEMENT

## 11.1 Helper

File:

lib/server/sync/replaceBrokerExecutionsAtomically.ts

Uses:

supabaseAdmin.rpc("replace_broker_executions_atomically", ...)

Arguments:

- p_user_id
- p_account
- p_execution_dates
- p_executions

The TypeScript helper:

- Rejects empty executions.
- Rejects empty date arrays.
- Serializes execution records.
- Deduplicates by ID.
- Calls the privileged RPC.

Duplicate IDs are silently deduplicated using last-record-wins behavior.

## 11.2 Live SQL function

Function:

public.replace_broker_executions_atomically

Permissions:

- Owner: postgres.
- SECURITY DEFINER: true.
- anon EXECUTE: false.
- authenticated EXECUTE: false.
- service_role EXECUTE: true.

Current deletion predicate:

```sql
DELETE FROM public.executions
WHERE user_id = p_user_id
  AND account = p_account
  AND date = ANY(p_execution_dates)
  AND (
      contract_key IS NULL
      OR contract_key NOT LIKE 'MANUAL-%'
  );
```

## 11.3 Finding: NULL contract-key legacy rows

[HIGH]

The current function preserves MANUAL-% executions.

However, it deletes rows with NULL contract_key.

Earlier migration notes documented an intention to preserve NULL legacy rows.

This discrepancy must be resolved.

Do not change the SQL until the intended treatment of NULL legacy executions is established.

## 11.4 Finding: empty replacement array

[MEDIUM]

The live SQL checks that p_executions is a JSON array but does not reject an empty array.

The TypeScript helper rejects empty arrays.

The current fetchFlex() flow also skips replacement when zero executions are parsed.

However, the database function itself could delete the replacement window and insert zero rows if invoked with valid parameters and an empty array.

This should receive database-level protection in the remediation design.

## 11.5 Finding: incoming account/date consistency

[HIGH]

The SQL DELETE is scoped by:

- user_id
- account
- execution dates

However, the INSERT takes account and date directly from the JSON payload.

The function does not independently require:

x.account = p_account

or:

x.date belongs to p_execution_dates

This is an internal trusted-caller data-integrity risk.

The TypeScript parser and helper should validate the data, but a privileged database function should also protect its replacement-window invariants where appropriate.

## 11.6 Manual execution preservation

[VERIFIED] The current SQL excludes MANUAL-% executions.

[CONFIRMED GAP] NULL-key legacy records are not preserved.

[NEEDS TESTING] Populated mixed-account and date replacement tests remain outstanding.

---

# 12. IBKR BROKER SYNCHRONIZATION

## 12.1 Manual synchronization API

File:

app/api/sync-all-brokers/route.ts

Previously inspected pattern:

- Authenticates Supabase user.
- Derives user.id.
- Calls syncUserBrokers(user.id).

[VERIFIED] Manual synchronization starts with authenticated user identity.

[CONFIRMED GAP] No account approval or entitlement check.

## 12.2 Manual sync helper

File:

lib/server/sync/syncUserBrokers.ts

Uses supabaseAdmin.

Query:

```ts
.from("broker_connections")
.select("*")
.eq("user_id", userId)
.eq("is_active", true);
```

[VERIFIED] Selects only active broker connections belonging to supplied user ID.

Processes connections sequentially.

Uses three-second rate-limit delay.

[CONFIRMED GAP] Does not check account approval, suspension or scheduled/manual-sync entitlement.

## 12.3 Shared broker sync helper

File:

lib/server/sync/syncBroker.ts

Calls fetchFlex() for IBKR.

Calls updateSyncStatus() after success/failure.

Observation:

Fetch and status update share one try/catch. If fetching succeeds but status update fails, the result can be reported as a broker sync failure.

[LOW/MEDIUM] Reliability issue.

## 12.4 Global scheduled sync

File:

lib/server/sync/syncAllBrokers.ts

Uses supabaseAdmin.

Selects all active broker connections across all users.

Does not filter by account approval or entitlement.

[HIGH] Scheduled synchronization does not currently enforce the intended account lifecycle.

A valid cron request can trigger synchronization for active broker connections regardless of their owner's current approval/suspension/plan state.

Do not solve this by scattering individual plan checks into every helper.

Use centralized account authorization and entitlement resolution.

## 12.5 Cron route

File:

app/api/cron/sync-brokers/route.ts

November 4 verification:

- Checks CRON_SECRET exists.
- Returns HTTP 500 when missing.
- Requires exact Authorization: Bearer <secret>.
- Returns HTTP 401 for incorrect/missing authorization.
- Invokes global sync only after successful verification.

[VERIFIED] Cron authentication is correctly implemented at the inspected source level.

[OPEN] Production Vercel environment configuration has not been verified.

Do not reveal the secret value during verification.

## 12.6 Test-sync route

File:

app/api/test-sync/route.ts

November 4 verification:

- Checks CRON_SECRET exists.
- Fails closed when absent.
- Requires exact Bearer-secret equality.
- Calls global sync only after authorization.

[VERIFIED] Current test-sync route is authenticated.

Observation:

It returns detailed broker result information, including broker IDs, account identifiers, aliases and per-broker error messages.

[MEDIUM] Consider whether this test endpoint should be retired or reduced to operationally necessary output before commercial release.

---

# 13. IBKR FLEX STATEMENT RETRIEVAL

## 13.1 fetchFlexStatement

File:

lib/server/brokers/ibkr/fetchFlexStatement.ts

Current behavior:

- Calls IBKR Flex SendRequest.
- Extracts the ReferenceCode.
- Retries rate-limit ErrorCode 1018.
- Polls for the statement.
- Returns the completed response.

Positive findings:

- Main helper does not log complete XML.
- Logs status/error-code diagnostics instead.
- Uses bounded polling.
- Does not directly persist execution data.

Findings:

[MEDIUM] Flex token is included in URL query parameters.

[MEDIUM] Network calls do not have explicit timeout controls.

[MEDIUM] HTTP response status is not explicitly checked before body processing.

[MEDIUM] Statement readiness uses a basic ClientAccountID string-existence check.

The exact returned account value is not verified here against the expected broker connection.

[OPEN] Inspect exact parser/response format behavior before proposing changes.

## 13.2 fetchFlex orchestration

File:

lib/server/brokers/ibkr/fetchFlex.ts

Flow:

1. Fetch statement.
2. Parse executions.
3. Skip replacement when no executions are returned.
4. Derive distinct execution dates.
5. Call broker replacement RPC.

Positive findings:

- Does not log complete statement XML.
- Logs XML length and execution counts.
- Skips destructive replacement when parsed executions are empty.

Observation:

Passes broker.user_id and broker.broker_account_id to the persistence helper.

The returned statement's account identity is not independently checked against the expected account before replacement.

## 13.3 IBKR parser

File:

lib/parsers/ibkrParser.ts

Current behavior:

- Parses IBKR statement content using Papa Parse.
- Selects EXECUTION rows.
- Excludes configured USD.CAD and CAD.USD conversion rows.
- Parses timestamp, contract, price, quantity, value, fees and currency.
- Maps asset classes.
- Validates BUY/SELL actions.
- Generates normalized executions.

Findings:

[MEDIUM] Does not verify ClientAccountID against the expected broker account.

[MEDIUM] Generated execution ID does not include IBKR ExecID.

Generated ID uses:

- Account.
- Raw timestamp.
- Ticker.
- Contract key.
- Action.
- Quantity.
- Price.
- Execution value.

Two distinct executions with identical generated fields could receive the same ID and be silently deduplicated.

This is a potential data-integrity issue requiring real IBKR sample validation.

[MEDIUM] parseNumber() uses fallback zero for NaN but does not explicitly reject Infinity.

[MEDIUM] Malformed numeric values may silently become zero.

[MEDIUM] Invalid BUY/SELL action logging includes the entire source row.

[LOW] Timestamp components are extracted by fixed string positions without full date/time validation.

[LOW] Parser uses any in several places.

Do not change execution identity or parsing until representative IBKR samples and existing canonical records are reviewed.

---

# 14. BROKER CONNECTION MANAGEMENT

## 14.1 Settings

File:

app/settings/page.tsx

Observed behavior:

- Loads broker metadata through browser Supabase client.
- Adds broker connections directly.
- Updates broker connections directly.
- Loads stored Flex token through the dedicated API when the user explicitly reveals it.
- Uses authenticated session for manual Sync Now.

Positive:

Settings broker metadata queries do not automatically retrieve the Flex token.

Findings:

[CONFIRMED GAP] Direct browser database writes do not enforce application approval or entitlement.

[MEDIUM] Broker UPDATE relies on RLS ownership and does not use a dedicated server operation.

[MEDIUM] The UI supports multiple broker connections and must remain aligned with the database multi-account model.

## 14.2 Dashboard

File:

app/dashboard/page.tsx

Observed behavior:

- Loads broker using SELECT *.
- Retrieves Flex token into browser state.
- Creates/upserts broker through direct browser Supabase.
- Uses onConflict user_id,broker.

Findings:

[MEDIUM] Direct SELECT * exposes stored Flex token to browser memory.

[MEDIUM] Dashboard assumes one IBKR connection per user through .single().

[MEDIUM] Dashboard upsert conflict target does not match the verified database unique index.

## 14.3 Trades page

File:

app/trades/page.tsx

Inspected queries:

- Loads broker account aliases and account IDs.
- Loads latest last_sync_at.

Both use the browser Supabase client and rely on broker_connections RLS.

[VERIFIED] These queries select appropriate non-credential fields.

No direct cross-user access path identified.

## 14.4 Flex token endpoint

File:

app/api/broker-connections/[brokerId]/token/route.ts

Current behavior:

- Validates Supabase token.
- Retrieves broker ID from route params.
- Queries broker by broker ID AND authenticated user ID.
- Returns the stored Flex token.

[VERIFIED] Ownership filtering is correct.

The Settings UI explicitly uses this endpoint when the user clicks Show Flex Token.

Do not remove this capability without a replacement design.

Findings:

[MEDIUM] No explicit Cache-Control: no-store header.

[CONFIRMED GAP] No account approval or suspension check.

[MEDIUM] Authenticated database role can also read flex_token directly.

---

# 15. LEGACY IBKR ENDPOINT

File:

app/api/ibkr/flex/route.ts

Severity:

CRITICAL — RELEASE BLOCKER.

Confirmed behavior:

- No request authentication.
- No user ownership check.
- Uses privileged Supabase admin client.
- Selects an active broker connection globally.
- Uses .single().
- Retrieves Flex token.
- Calls IBKR.
- Logs complete SendRequest XML.
- Logs complete statement XML.
- Can return raw error XML.
- Returns full brokerage XML in successful response.

Repository search:

```bash
grep -R -n 'api/ibkr/flex\|/ibkr/flex' app components lib
```

No current application callers were found.

Decision:

This endpoint is a known legacy route.

Do not treat it as secure.

Before invite-only production release, make an explicit decision to:

- Disable it.
- Retire it.
- Remove it.
- Or securely replace it.

Do not modify or delete it without first establishing whether any external operational dependency exists.

The separate module:

lib/supabaseAdmin.ts

is currently imported only by this legacy route in the supplied import search.

The newer main service-role module is:

lib/server/supabaseAdmin.ts

---

# 16. SUPABASE SERVICE-ROLE CLIENTS

## 16.1 Main server client

File:

lib/server/supabaseAdmin.ts

Current implementation:

- Uses NEXT_PUBLIC_SUPABASE_URL.
- Uses SUPABASE_SERVICE_ROLE_KEY.
- Creates Supabase client.
- Does not explicitly import server-only.
- Does not explicitly configure persistSession/autoRefreshToken options.

The service-role key itself is referenced through a non-public environment variable.

[OPEN] Confirm complete import graph and ensure the client cannot enter a browser bundle.

## 16.2 Legacy admin client

File:

lib/supabaseAdmin.ts

Uses the same service-role environment variable.

Import search found only:

app/api/ibkr/flex/route.ts

This is therefore legacy-route-specific duplication.

Do not consolidate until the legacy route disposition is decided.

## 16.3 Service-role rules

- Service-role key must never reach browser code.
- Privileged helpers must remain server-side.
- Service-role operations bypass RLS.
- Every privileged database operation must apply explicit ownership and operation constraints.
- Never trust arbitrary request-body user IDs.
- Do not expose service-role client functionality to client components.

---

# 17. TRADE INTELLIGENCE / AI

## 17.1 API

File:

app/api/ai/trade-summary/route.ts

Authentication:

- Requires Authorization header.
- Extracts Bearer token.
- Validates Supabase user.
- Creates second user-scoped Supabase client carrying the same JWT.

This deliberately preserves RLS during data retrieval.

[VERIFIED] No service-role database access is used for canonical trade/review loading.

## 17.2 Canonical input protection

Browser can provide only:

- entryExecutionId
- exitExecutionId

Server retrieves canonical data.

The AI cannot accept browser-provided financial facts as authoritative inputs.

[VERIFIED] Good data-integrity design.

## 17.3 Canonical trade loader

File:

lib/ai/tradeIntelligence/loadCanonicalTrade.ts

Behavior:

- Loads user executions.
- Filters by user_id.
- Uses 1,000-row pagination.
- Deterministic timestamp and ID ordering.
- Hydrates execution records.
- Reconstructs with pairTrades().
- Finds the exact entry/exit pair.

[VERIFIED] User-scoped canonical data loading.

Findings:

[MEDIUM] Loads the entire execution ledger for each analysis request.

[MEDIUM] Offset pagination across separate requests may observe inconsistent data during concurrent ledger changes.

[MEDIUM] Only closed trades containing exactly two executions are accepted.

Partial multi-execution trade behavior needs product validation.

[LOW] hydrateExecution() uses any.

## 17.4 Review loader

File:

lib/ai/tradeIntelligence/loadTradeReview.ts

Uses:

- authenticated user ID.
- entry execution ID.
- exit execution ID.

Filters all three.

[VERIFIED] Correct ownership scope.

## 17.5 AI output validation

The route:

- Uses structured JSON output.
- Uses Zod schema.
- Validates evidence references against the actual input.
- Converts internal result to UI result.
- Does not currently persist AI output.

[VERIFIED] Useful output integrity controls.

## 17.6 AI rate limits

[HIGH/MEDIUM]

No per-user quota, concurrency limit or rate limiter is visible in the inspected route.

Gemini retry logic permits up to three attempts for selected transient failures.

Add AI capability enforcement and usage controls through the future centralized authorization/quota architecture.

Do not create scattered plan-specific checks inside individual route handlers.

---

# 18. PREVIOUS AUDIT FINDINGS TO PRESERVE

These issues were documented in the October 24 handoff and have not all been revalidated in the November 4 inspection.

They remain part of the overall project.

## 18.1 Direct execution deletion paths

Previously identified components:

components/dashboard/TradingCalendar.tsx

components/trades/TradeDetailModal.tsx

components/trades/TradesTable.tsx

Older investigation found direct Supabase DELETE operations against public.executions.

The October 24 notes specifically documented concerns about manual-only restrictions and deletion semantics.

[HISTORICAL / OPEN]

Reinspect current source before changing these components.

Preserve:

- Partial-exit deletion by exact execution ID.
- Full-lifecycle deletion by contract key.
- Manual-only restrictions.
- Existing FIFO reconstruction semantics.

Do not delete reconstructed Trade objects as a substitute for deleting canonical executions.

## 18.2 CSV execution import

File:

lib/storage/supabaseExecutionStorage.ts

Previous audit found:

- Authenticated user retrieval.
- User ID assigned to serialized executions.
- Deduplication by execution ID.
- Direct browser Supabase upsert.

The direct write path must eventually enforce approval, read-only and entitlement restrictions.

The previous audit also identified logging of the first execution object in an error branch.

[HISTORICAL / REVALIDATE]

## 18.3 Notes and attachments

Previous audit recorded user-scoped authentication and ownership checks in:

lib/storage/supabaseNoteStorage.ts

lib/storage/noteAttachmentStorage.ts

lib/storage/noteAnnotationStorage.ts

Storage bucket:

note-attachments

These ownership checks are useful, but direct browser mutation paths must be included in the centralized read-only/entitlement design.

Do not redesign the existing Notes V2 architecture.

## 18.4 Daily notes, expenses and other direct writes

Previously identified:

lib/storage/supabaseExpenseStorage.ts

lib/storage/supabaseDailyNotesStorage.ts

lib/storage/supabaseDailyReviewTradeNoteStorage.ts

lib/storage/profileStorage.ts

Their exact current mutation behavior must be revisited before the authorization migration is written.

## 18.5 Account deletion

Previous October 24 database audit recorded:

- profiles.id references auth.users.id without ON DELETE CASCADE.
- executions, expenses and daily_notes had no FK directly referencing auth.users.
- Other tables had cascading relationships.
- Two private Storage buckets existed.
- Historical object count: eight objects total across note-attachments and receipts.
- No orphaned rows were found in the historical query.

These are historical findings, not verified November 4 database counts.

Account deletion is a separate project phase.

Do not allow trial expiration, suspension, plan downgrade, read-only status or subscription changes to trigger permanent data deletion.

Before enabling a real Delete User operation:

1. Capture the exact current Auth deletion error.
2. Recheck foreign keys.
3. Inventory all user-owned rows.
4. Implement safe database cleanup.
5. Delete Storage files through supported Storage APIs.
6. Handle partial failure and retries.
7. Test using a disposable account.
8. Verify another user's data remains untouched.
9. Require server-side admin authorization.

---

# 19. FINDING REGISTER

This is the consolidated working list.

## CRITICAL

### SEC-001 — Legacy IBKR Flex endpoint

File:
app/api/ibkr/flex/route.ts

Confirmed:
- No authentication.
- Global broker connection lookup.
- Uses service-role client.
- Returns full XML.
- Logs full XML.
- Exposes raw error XML.

Repository search found no current application callers.

Required action:

Explicitly decide whether to disable, retire or securely replace it before expanding production beta access.

## HIGH

### SEC-002 — NULL contract-key records deleted by broker replacement

Function:
public.replace_broker_executions_atomically

Current SQL:

```sql
contract_key IS NULL
OR contract_key NOT LIKE 'MANUAL-%'
```

Manual executions are preserved.

NULL-key legacy rows are deleted.

Reconcile with previous migration documentation that intended to preserve NULL legacy records.

### SEC-003 — Incoming broker execution scope not independently validated

Function:
public.replace_broker_executions_atomically

Incoming JSON records are inserted without requiring their account/date values to match the requested p_account and p_execution_dates.

Required:

Establish and enforce replacement-window consistency.

### SEC-004 — No centralized account authorization

Files:

AuthProvider
ProtectedRoute
signup
login
protected API routes
direct Supabase mutation paths

No centralized application approval, suspension or entitlement enforcement exists.

### SEC-005 — Scheduled sync eligibility missing

File:

lib/server/sync/syncAllBrokers.ts

All active connections are selected globally.

No per-user approval, account-state or scheduled-sync entitlement check.

### SEC-006 — Broker synchronization metadata writable by authenticated users

Table:

public.broker_connections

Authenticated users have UPDATE privileges across synchronization metadata columns.

Fields include:

- last_sync_at
- last_sync_status
- last_sync_error
- last_sync_execution_count
- sync_cursor_date

These fields should be evaluated for server-only mutation requirements.

### SEC-007 — Excessive TRUNCATE grants

Confirmed on:

public.trade_reviews
public.broker_connections

Historical broader audit reported all 14 public tables.

Required:

Complete grant-source investigation and least-privilege migration design.

Do not revoke permissions blindly.

## MEDIUM

### SEC-008 — Dashboard broker upsert conflict mismatch

File:

app/dashboard/page.tsx

Application:

onConflict: user_id,broker

Database:

UNIQUE (user_id, broker_account_id)

### SEC-009 — Dashboard direct Flex token retrieval

File:

app/dashboard/page.tsx

Uses SELECT * on broker_connections.

Token enters browser memory.

### SEC-010 — Manual execution duplicate IDs silently deduplicated

Files:

lib/server/trades/createManualExecutionsAtomically.ts

lib/server/trades/replaceManualExecutionsAtomically.ts

Last record wins.

### SEC-011 — AI usage restrictions not visible

File:

app/api/ai/trade-summary/route.ts

No visible per-user quota or concurrency limit.

### SEC-012 — IBKR returned account not checked against expected account

Files:

lib/server/brokers/ibkr/fetchFlexStatement.ts

lib/parsers/ibkrParser.ts

### SEC-013 — IBKR generated ID does not include ExecID

File:

lib/parsers/ibkrParser.ts

Potential duplicate-fill collision.

Requires representative data validation.

### SEC-014 — Service-role server-only boundary

Files:

lib/server/supabaseAdmin.ts

lib/supabaseAdmin.ts

No explicit server-only marker.

Complete import graph verification remains necessary.

### SEC-015 — Flex token appears in outbound URL parameters

File:

lib/server/brokers/ibkr/fetchFlexStatement.ts

Review logging and transport exposure.

### SEC-016 — Broker connection direct browser mutation

Files:

app/settings/page.tsx
app/dashboard/page.tsx

Must be covered by future approval/read-only/entitlement policy.

### SEC-017 — Trade Review grants

Table:

public.trade_reviews

Excessive REFERENCES, TRIGGER and TRUNCATE grants.

### SEC-018 — Broker connection grants

Table:

public.broker_connections

Excessive REFERENCES, TRIGGER and TRUNCATE grants.

### SEC-019 — No explicit no-store response on Flex token endpoint

File:

app/api/broker-connections/[brokerId]/token/route.ts

### SEC-020 — Full ledger loading in Trade Intelligence

File:

lib/ai/tradeIntelligence/loadCanonicalTrade.ts

Performance/scalability concern.

### SEC-021 — Broker synchronization concurrency

No per-user/per-broker overlap protection visible in inspected helpers.

### SEC-022 — Manual execution validation improvements

File:

lib/server/trades/validateManualExecutions.ts

Date validation, batch limits, duplicate rejection and string limits need consideration.

---

# 20. IMPLEMENTATION ROADMAP

Do not begin implementation until the remaining discovery pass is complete and the repository checkpoint is established.

## PHASE 0 — Safe checkpoint

Before any modifications:

- Run git status --short.
- Confirm active branch.
- Confirm latest commit.
- Preserve unrelated local modifications.
- Preserve existing docs files.
- Review current Supabase migrations.
- Verify local and remote migration history.
- Capture current live function definitions before changing SQL.
- Establish recovery and rollback approach.

No unrelated documentation should be overwritten or staged.

## PHASE 1 — Finish security discovery

Inspect remaining synchronization helpers:

1. lib/server/sync/saveExecutions.ts
2. lib/server/sync/deleteExecutionWindow.ts

Inspect all callers.

Also inspect:

3. app/api/fx-rates/route.ts
4. Remaining direct execution deletion UI handlers.
5. Remaining direct browser Supabase write paths.
6. The complete current API route inventory.

Complete the broker synchronization review before implementing its authorization changes.

## PHASE 2 — Resolve critical execution-integrity issues

Priority:

1. Reconcile NULL contract-key deletion behavior.
2. Validate account and execution-date consistency in broker replacement.
3. Add database protection against empty replacement arrays.
4. Confirm incoming broker execution account identity.
5. Investigate IBKR execution-ID collisions.
6. Test mixed manual/broker data.
7. Preserve current FIFO and canonical ledger design.

Tests must cover:

- Manual executions surviving broker replacement.
- NULL-key legacy execution handling.
- Correct account/date replacement.
- Incorrect account/date payload rejection.
- Empty replacement rejection.
- Transaction rollback.
- Cross-user isolation.
- Partial failures.

## PHASE 3 — Least-privilege database remediation

Build a complete privilege matrix for all public tables.

Determine:

- Required client SELECT.
- Required client INSERT.
- Required client UPDATE.
- Required client DELETE.
- Server-only operations.
- RPC execute permissions.
- PUBLIC grants.
- Default privileges.
- Column-level permissions.

Then prepare reviewed migrations.

Do not blindly revoke privileges.

Test:

- Dashboard.
- Trades.
- Expenses.
- Notes.
- Attachments.
- Reviews.
- Broker management.
- CSV import.
- Manual trade management.
- All privileged RPCs.

## PHASE 4 — Legacy endpoint and server boundary hardening

Resolve:

- Legacy /api/ibkr/flex endpoint.
- Test endpoint lifecycle.
- Sensitive broker XML logging.
- Execution payload logging.
- Flex token handling.
- Duplicate service-role modules.
- Server-only imports.
- Broker replacement helper validation.

Preserve legitimate broker functionality.

## PHASE 5 — Account authorization architecture

Design and document the authoritative model.

Keep separate:

- Approval.
- Administrator role.
- Account status.
- Effective entitlement.
- Feature capabilities.
- Quotas.

Implement a centralized server-side resolver.

Every protected operation must use that trusted authorization boundary.

Include:

- API routes.
- Direct Supabase writes.
- Broker connection changes.
- Manual broker sync.
- Scheduled broker sync.
- AI usage.
- Imports.
- Administrative operations.

Frontend checks must be for UX only.

## PHASE 6 — Live administrator functionality

Only after the authorization foundation is implemented and verified:

- User listing.
- Pending approvals.
- Approve/reject.
- Suspend/reactivate.
- Plan assignment.
- Access grants.
- Read-only controls.
- Account access details.
- Administrative audit log.

Every privileged action must record:

- Actor.
- Target.
- Action.
- Previous state.
- New state.
- Timestamp.
- Relevant metadata.
- Request context where appropriate.

Administrator controls must never directly modify canonical trading records.

## PHASE 7 — Account deletion readiness

Separate from approval and entitlement work.

Before enabling destructive operations:

- Confirm actual Auth deletion blocker.
- Recheck relationships.
- Design exact-owner cleanup.
- Design Storage cleanup.
- Add retry and partial-failure behavior.
- Test disposable accounts.
- Verify other users' records remain untouched.
- Add administrative audit records.

No automatic deletion due to subscription or trial lifecycle.

---

# 21. TESTING AND RELEASE GATES

## Execution integrity

- [ ] Manual edit cannot target broker executions.
- [ ] Manual deletion cannot target broker executions.
- [ ] Broker replacement preserves manual executions.
- [ ] NULL legacy records receive the explicitly selected treatment.
- [ ] Incoming broker account/date fields are validated.
- [ ] Empty replacement cannot erase existing broker windows.
- [ ] Duplicate execution IDs are handled deliberately.
- [ ] Transaction rollback verified.
- [ ] Cross-user ID manipulation rejected.

## Authentication and authorization

- [ ] Unauthenticated users cannot access protected APIs.
- [ ] Email-unverified users cannot gain normal access.
- [ ] Pending users cannot access protected features.
- [ ] Approved users receive assigned access.
- [ ] Read-only users cannot perform mutations.
- [ ] Suspended users are blocked.
- [ ] Existing sessions respect account-status changes.
- [ ] Users cannot self-approve.
- [ ] Users cannot self-assign administrator privileges.

## Database

- [ ] RLS ownership policies remain intact.
- [ ] Excessive TRUNCATE grants resolved.
- [ ] Unnecessary REFERENCES and TRIGGER grants resolved.
- [ ] Column privileges match intended operations.
- [ ] No service-role key enters client bundles.
- [ ] Privileged RPC execute permissions remain restricted.
- [ ] Existing data ownership remains unchanged.

## Broker synchronization

- [ ] Manual sync requires authenticated user.
- [ ] Scheduled sync checks per-user eligibility.
- [ ] Pending accounts cannot sync.
- [ ] Suspended accounts cannot sync.
- [ ] Basic users cannot sync.
- [ ] Pro users receive scheduled-sync capability only.
- [ ] Elite and eligible Trial users receive manual sync.
- [ ] Broker account isolation verified.
- [ ] Concurrent synchronization behavior tested.

## AI

- [ ] Only canonical trade data is trusted.
- [ ] Cross-user execution IDs rejected.
- [ ] Review ownership verified.
- [ ] AI capability enforced.
- [ ] Per-user usage limits implemented.
- [ ] Concurrency limits considered.
- [ ] AI output validation remains intact.

## Final release

- [ ] npm run build.
- [ ] Relevant tests pass.
- [ ] Supabase migration history verified.
- [ ] Live database policies verified.
- [ ] Git diff reviewed.
- [ ] Only intended files staged.
- [ ] No unintended documentation changes.
- [ ] Required release gates closed.

---

# 22. CURRENT PROJECT STATUS

| Phase | Status |
|---|---|
| Previous execution-integrity remediation | Implemented; additional tests outstanding |
| Manual create/edit/delete API review | Reviewed |
| Manual execution RPC permissions | Verified |
| Trade Intelligence review | Reviewed |
| Trade Review RLS and constraints | Verified |
| Broker connection RLS and grants | Reviewed; remediation required |
| Manual broker synchronization | Reviewed |
| Scheduled broker synchronization | Reviewed; eligibility gap confirmed |
| IBKR parser and statement flow | Reviewed; data-integrity findings recorded |
| Legacy IBKR endpoint | Critical unresolved risk |
| Database least-privilege audit | Partially completed |
| Account approval architecture | Not implemented |
| Centralized entitlement resolver | Not implemented |
| Live Admin Panel | Mock preview only |
| Account deletion backend | Not implemented |

---

# 23. NOVEMBER 4, 2026 — ENGINEERING LOG

## Work completed

### Authentication and account management

- Reviewed ProtectedRoute.
- Reviewed AuthProvider.
- Reviewed signup and login behavior in the previous checkpoint.
- Confirmed that application approval and entitlement checks are not implemented.

### Manual trading

- Reviewed create API.
- Reviewed edit API.
- Reviewed delete API.
- Reviewed create helper.
- Reviewed edit helper.
- Reviewed delete helper.
- Reviewed validation helper.
- Inspected live manual creation RPC.
- Inspected live manual edit RPC.
- Inspected live manual deletion RPC.
- Verified restricted RPC execute permissions.

### Trade Intelligence

- Reviewed Trade Intelligence API.
- Reviewed canonical trade loader.
- Reviewed review loader.
- Reviewed Trade Review browser storage.
- Verified Trade Review RLS policies.
- Verified constraints and indexes.
- Inspected table grants.

### Broker connections

- Reviewed Settings broker operations.
- Reviewed Dashboard broker operations.
- Reviewed Trades page broker queries.
- Reviewed broker token API.
- Verified broker_connections RLS policies.
- Verified constraints and unique index.
- Inspected table and column grants.
- Identified Dashboard multi-account mismatch.

### Broker synchronization

- Reviewed syncUserBrokers.
- Reviewed syncAllBrokers.
- Reviewed syncBroker.
- Reviewed updateSyncStatus.
- Reviewed fetchFlex.
- Reviewed fetchFlexStatement.
- Reviewed replaceBrokerExecutionsAtomically.
- Reviewed IBKR parser.
- Inspected live broker replacement RPC.

### Scheduled operations

- Verified cron secret fail-closed behavior.
- Verified exact Bearer comparison.
- Verified test-sync authentication.
- Confirmed global sync eligibility remains unimplemented.

### Legacy endpoint

- Reviewed /api/ibkr/flex.
- Confirmed no application callers through source search.
- Confirmed unauthenticated global broker lookup and raw XML exposure.
- Identified duplicate legacy service-role client module.

## Database checks completed today

- trade_reviews RLS status.
- trade_reviews policies.
- trade_reviews constraints.
- trade_reviews indexes.
- trade_reviews grants.
- broker_connections RLS status.
- broker_connections policies.
- broker_connections constraints.
- broker_connections indexes.
- broker_connections table grants.
- broker_connections column grants.
- Three manual execution RPC definitions and permissions.
- Broker replacement RPC definition and permissions.

## Changes made

None during the November 4 read-only audit session.

No:

- Application source modifications.
- SQL migrations.
- Database permission changes.
- RLS policy changes.
- Trading record modifications.
- Production configuration changes.

---

# 24. NEXT SESSION — EXACT STARTING POINT

Resume from the remaining synchronization persistence helpers.

### First file

lib/server/sync/saveExecutions.ts

Command:

```bash
cat lib/server/sync/saveExecutions.ts
```

### Second file

lib/server/sync/deleteExecutionWindow.ts

Command:

```bash
cat lib/server/sync/deleteExecutionWindow.ts
```

After reviewing both:

1. Inspect their callers.
2. Complete the remaining API inventory.
3. Review the FX API.
4. Finish identifying direct database mutation paths.
5. Complete the database privilege inventory.
6. Produce the final prioritized remediation plan.
7. Establish the Git checkpoint before implementing changes.

Do not restart the entire audit unnecessarily.

Use this document as the current handoff reference.

---

# 25. DAILY DOCUMENTATION RULES

This is a living engineering document.

At the end of each working day:

1. Update the Last Updated date.
2. Update the current phase.
3. Update finding status.
4. Record newly confirmed issues.
5. Record code changes and exact file paths.
6. Record migrations and database changes.
7. Record tests and actual results.
8. Record unresolved decisions.
9. Add a new dated engineering log.
10. Preserve previous historical entries.

Never mark a fix complete merely because code was written.

A fix becomes verified only after the relevant tests and database/source checks have been completed.

For every implementation proposal, document:

- Exact file or database object.
- Existing behavior.
- Proposed behavior.
- Security reason.
- Potential side effects.
- Migration requirements.
- Regression tests.
- Recovery plan.

Do not implement or apply database changes without explaining the change and obtaining approval.

---

# FINAL PROJECT PRINCIPLE

Elite X must have one reliable authorization architecture.

Authentication establishes who the user is.

Account approval establishes whether the user is admitted.

Account status establishes whether access is active, read-only or suspended.

Entitlements establish which capabilities the user may use.

Quotas establish how much of a limited capability the user may consume.

RLS establishes ownership of database rows.

Trusted server-side authorization protects privileged operations.

Administrative audit logs establish accountability.

These layers must work together.

The Administrator Panel is the management interface for this architecture, not the security mechanism itself.

Protect the canonical execution ledger, preserve existing user data, and introduce changes incrementally with evidence and regression testing.

**END OF ELITE X ADMINISTRATOR SECURITY AUDIT MASTER NOTES**