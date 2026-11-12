# ELITE X TRADING JOURNAL
# Security, Authorization, Data Integrity & Account Lifecycle
## Master Audit and Remediation Handoff Notes

**Project:** Elite X Trading Journal / Elite X Trading OS  
**Audit date:** October 24, 2026  
**Document version:** 1.0  
**Status:** Read-only discovery completed; remediation not started  
**Platform:** Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel  
**Original objective:** Implement invite-only beta access, admin approval, centralized entitlements, and a safe account-deletion workflow.  
**Commercial scope:** No payments, pricing, checkout, Stripe, or production subscription billing in the current beta phase.

---

# 1. Purpose and Executive Summary

This document records the findings from the October 24, 2026 read-only review of Elite X's authentication, server authorization, execution persistence, Supabase policies and grants, Storage, and account-deletion foundation. It is intended to be saved as the handoff reference for a later implementation session.

The review began with the invite-only beta and account lifecycle project. During discovery, several existing execution and database-permission risks emerged. The audit should not become an indefinite review of every screen. These findings are documented so we can address the high-priority risks and return to the original work.

## Executive summary

### Positive findings

- Row-level security (RLS) is enabled on all 14 public-schema tables discovered during the audit.
- The four atomic execution RPCs inspected are `SECURITY DEFINER` and are executable by `service_role`, but not by the `anon` or `authenticated` roles.
- The reviewed trade create/edit/delete API handlers authenticate bearer tokens and derive the acting user ID from Supabase Auth.
- The manual broker sync path selects active broker connections by the authenticated user's ID.
- All 2,393 current execution rows have a non-null `user_id`.
- The six existing Auth users are all email-verified, each has a profile, and there are no orphaned profiles.
- Current database counts showed no orphaned execution, expense, or daily-note rows.
- All eight current Storage objects in the two private buckets use a first-folder segment that matches an existing Auth user's UUID.
- Existing atomic persistence and FIFO reconstruction architecture can be retained; a wholesale trading-system redesign is not needed.

### High-priority findings

1. `public.replace_manual_executions_atomically` does not enforce the `MANUAL-` prefix on the existing records it deletes. A manipulated authenticated edit request could potentially delete the same user's broker execution through the manual-edit path.
2. `public.replace_broker_executions_atomically` deletes all executions matching user, account, and date, without excluding manual executions. We found a user/account pair containing both manual and non-manual-or-unclassified executions. No current same-date overlap was found, so prior data loss was not established, but the SQL has a structural data-integrity risk.
3. Three active UI handlers issue direct deletes against `public.executions`, bypassing the newer atomic delete API. `TradeDetailModal` and `TradesTable` do not visibly enforce a `MANUAL-` restriction in their inspected handlers. Whether all corresponding buttons are exposed for broker trades has not yet been fully verified.
4. Effective table privilege checks show `TRUNCATE` privileges for both `anon` and `authenticated` on all 14 public tables. This is excessive. RLS does not protect against `TRUNCATE`; however, the audit did not establish that a normal Supabase REST client can directly invoke `TRUNCATE`.
5. The legacy `/api/ibkr/flex` route has no visible request authentication, no user ownership filter, and returns full IBKR statement XML. It was already documented as unused/legacy in the September audit. `/api/test-sync` was also documented in the older audit as an unauthenticated test route able to trigger global sync; its full current implementation was not re-reviewed in this session.
6. The cron route can accept the literal header `Bearer undefined` if `CRON_SECRET` is missing, because the current comparison interpolates the environment variable without checking that it is configured. Production Vercel configuration has not been verified.

### Account-deletion findings

- `public.profiles.id` references `auth.users.id` without `ON DELETE CASCADE`.
- All six existing Auth users have matching profile records. That foreign key is a strong possible explanation for the reported Auth-user deletion failure, but the exact error has not yet been captured.
- `executions`, `expenses`, and `daily_notes` do not have foreign keys to `auth.users`; deletion must explicitly account for these tables.
- Two private Storage buckets contain eight objects total. Their objects currently follow the user-folder convention, but Storage objects do not automatically disappear merely because an Auth user is deleted.

### Invite-only and entitlement gap

- The current `ProtectedRoute` checks whether a Supabase user session exists, not whether the application account is approved, suspended, read-only, or entitled to a feature.
- The inspected signup handler does not enforce an invitation or approval gate.
- The inspected login handler redirects a successfully authenticated user directly to `/dashboard` without an approval check.
- `public.profiles` currently contains only `id` and `display_name`. No dedicated entitlement/subscription table appeared in the 14-table public-schema inventory.
- Direct browser Supabase write paths exist for CSV execution import, notes, annotations, attachments, daily notes, trade-review notes, and broker-connection operations. RLS protects ownership but does not, by itself, enforce the future application's approval/entitlement rules.

**Audit mode:** read-only. No source files, database functions, RLS policies, table grants, Storage objects, or trading records were changed during this review.

---

# 2. Scope, Evidence and Limits

## 2.1 Inspected areas

- Supabase Auth provider and route guard.
- Signup and login handlers.
- Current API route list and selected API handlers.
- Manual create/edit/delete execution APIs and helper functions.
- Broker manual sync and scheduled sync call paths.
- Live Supabase RLS policies, table grants, public table columns, foreign keys, RPC definitions and RPC execution permissions.
- Auth user creation trigger and profile function.
- Existing Auth/profile counts and execution ownership counts.
- Storage bucket configuration, Storage object policies and object-folder ownership counts.
- Direct execution deletion call sites and client-storage write paths.

## 2.2 Evidence hierarchy

When current code and historical notes differ, **the current repository and live Supabase definitions must be treated as authoritative**. September 13, 2026 master notes are useful historical baseline evidence, but their conclusions must be rechecked against current code/database behavior when implementing changes.

Findings in this document use these categories:

- **Confirmed:** directly visible in the current source output or live SQL result supplied during this audit.
- **Structural risk:** the current code/function is missing a safeguard; whether that risk has already caused damage or is reachable in every situation is not established.
- **Likely cause / needs confirmation:** a database or code relationship plausibly explains a problem, but a specific error or runtime scenario is still needed.
- **Historical note:** reported in the previous September audit but not fully re-verified in the current session.

## 2.3 Audit limitations

- No independent connection to the source repository or Supabase was used. Source files and SQL results were inspected from output supplied in this conversation.
- No penetration test was performed.
- No destructive function was invoked to test failure modes.
- We did not prove that any execution was already lost because of the identified RPC gaps.
- We did not establish that ordinary REST calls can use the excessive `TRUNCATE` grants; the effective privilege result still warrants least-privilege correction.
- The complete current UI visibility conditions for all delete buttons were not returned before the audit was paused.
- The full current implementation of `/api/test-sync` was not re-inspected during this session; its status below is based on the September master notes and current route inventory.
- We did not receive the exact Supabase Auth user deletion error. The profile foreign key remains a strong lead, not a confirmed root cause.
- The repository did not contain local `*.sql`/migrations files in the search performed. This does not establish that the live database has no migrations recorded elsewhere; it means database changes need a deliberate, version-controlled migration workflow before any change is applied.

---

# 3. Current Database Baseline

## 3.1 Public tables and RLS

The following 14 tables were found in schema `public`; RLS is enabled on all of them and forced RLS is false on all of them:

1. `broker_connections`
2. `daily_notes`
3. `daily_review_trade_notes`
4. `executions`
5. `expenses`
6. `note_annotations`
7. `note_attachments`
8. `note_blocks`
9. `note_trade_links`
10. `note_trades`
11. `notes`
12. `profiles`
13. `trade_reviews`
14. `user_tax_profiles`

RLS being enabled is a good baseline. `FORCE ROW LEVEL SECURITY = false` is not automatically a defect, particularly because privileged server functions need separate review. The service-role client can bypass RLS, so the authorization and SQL logic used by privileged paths remain critical.

## 3.2 RLS policy observations

Most policies use ownership conditions or parent-child checks:

- `executions`: SELECT, INSERT, UPDATE, DELETE policies scoped to `auth.uid() = user_id` for the `authenticated` role.
- `broker_connections`: CRUD policies check `auth.uid() = user_id`.
- `notes`, `daily_notes`, `expenses`, `trade_reviews`: owner-scoped policy expressions are present.
- `profiles`: policies match `auth.uid()` with the profile `id`.
- Note attachments, blocks, annotations, note-trade links and note-trades check ownership through the parent note or attachment.
- `user_tax_profiles`: `ALL` policy uses `auth.uid() = user_id`.
- Some policies list role `{public}` while their expressions still enforce ownership. This is not, by itself, evidence of a vulnerability; grants and applicable role-specific policies must be considered together.

No immediate policy change should be made based solely on the policy listing. We should preserve these existing ownership predicates when implementing the access layer.

## 3.3 Effective table privileges — important hardening item

The `has_table_privilege` query reported `TRUNCATE = true` for both `anon` and `authenticated` on every one of the 14 public tables. The output also showed `anon` with table-level CRUD privileges on `daily_notes`, `executions`, and `notes`; applicable RLS policies still affect ordinary row operations.

Key distinction:

- RLS constrains ordinary row-level SELECT/INSERT/UPDATE/DELETE operations.
- RLS does not protect a table against `TRUNCATE`.
- The grant results do **not** independently prove a normal unauthenticated Supabase REST request can issue `TRUNCATE`.

**Required attention:** identify the source of these grants (including applicable default privileges / PUBLIC grants), determine what the application actually requires, and revoke excessive privileges through a reviewed migration. Do not blindly revoke all grants without checking existing application calls, and do not rely on RLS as a defense against `TRUNCATE`.

## 3.4 Auth users and profile state

Live counts:

- Auth users: 6
- Email-verified users: 6
- Email-unverified users: 0
- Profiles: 6
- Users with matching profiles: 6
- Users without profiles: 0
- Orphaned profiles: 0

The current `profiles` columns are only:

- `id` (UUID)
- `display_name` (text)

There are no approval, suspension, admin-role, entitlement, plan or quota fields in the inspected profile schema. Design these as separate concepts rather than one overloaded role field.

## 3.5 Execution counts and ownership

Live aggregate query results:

- Total executions: 2,393
- Executions with NULL `user_id`: 0
- Manual executions recognized by `contract_key LIKE 'MANUAL-%'`: 4
- Non-manual or unclassified executions: 2,389
- Ownerless manual executions: 0
- Ownerless non-manual or unclassified executions: 0

`executions.user_id` is nullable in the schema, even though no current row has a NULL owner. This is a schema-hardening candidate, not a data-cleanup requirement proven by current counts. Do not make it NOT NULL without first checking every insert/import path and planned migration impact.

The `non-manual or unclassified` count must not automatically be described as “all broker executions”; the query classified by contract-key prefix only.

## 3.6 Manual/non-manual account overlap

Two read-only aggregates established:

- User/account/date groups containing both manual and non-manual/unclassified records: **0**.
- User/account pairs containing both manual and non-manual/unclassified records: **1**.
- Manual executions in the shared account pair: **4**.
- Non-manual/unclassified executions in the shared account pair: **303**.

Therefore there is no evidence of current same-date overlap in the returned dataset, but manual and non-manual/unclassified executions do share an account value for one user. A future sync window that includes a manual execution date could be destructive if the broker replacement SQL is not constrained.

## 3.7 Foreign keys and Auth deletion dependencies

Foreign keys referencing `auth.users` were listed. Most application relationships use `ON DELETE CASCADE`, including broker connections, notes, trade reviews, daily review trade notes and tax profiles.

Exceptions and missing relationships of interest:

- `profiles.id REFERENCES auth.users(id)` has **no `ON DELETE CASCADE`**. PostgreSQL's default action can block deletion while the profile row exists.
- `executions.user_id` has no foreign key to `auth.users` in the current constraint inventory.
- `expenses.user_id` has no foreign key to `auth.users`.
- `daily_notes.user_id` has no foreign key to `auth.users`.
- No table was found with a foreign key referencing `public.profiles`.

A query comparing data with Auth users found zero orphaned rows for executions, expenses and daily notes. The absence of a foreign key still means that a future account-deletion workflow must deliberately remove these rows if that is the chosen deletion policy.

## 3.8 Auth creation trigger

One custom trigger was found on `auth.users`:

- `on_auth_user_created`: AFTER INSERT, calls `public.handle_new_user()`.

The function is `SECURITY DEFINER`, sets `search_path = public`, and inserts a profile with `id = NEW.id` and `display_name` from `NEW.raw_user_meta_data ->> 'full_name'`, falling back to `Elite X User`. It uses `ON CONFLICT (id) DO NOTHING`.

No custom trigger on `auth.users` for deletion was shown by the query. The profile trigger is a creation mechanism, not a deletion cleanup system.

## 3.9 Storage baseline

Private buckets:

- `note-attachments`
- `receipts`

All eight objects currently follow the user-folder UUID convention. A safe deletion workflow must find/delete only objects under the exact target user's folder prefix, handle pagination, and remove Storage objects through Supabase Storage APIs. Deleting rows from `storage.objects` directly is not an acceptable substitute for supported Storage deletion APIs.

Storage objects will not automatically be removed just because an Auth user is deleted. The delete-user backend must explicitly clean each user's objects in both private buckets, using exact owner-folder scoping.

---

# 4. Execution Ledger and Data-Integrity Findings

Elite X is execution-first:

`Normalized executions → Supabase executions ledger → pairTrades() / FIFO reconstruction → derived trades, P&L, analytics and dashboard.`

Executions remain canonical. Do not build a second persistence model for manual trades, delete reconstructed trades instead of source executions, or modify `pairTrades.ts` as part of these security fixes.

## 4.1 Confirmed gap: manual-edit RPC can target non-manual executions

**Live function:** `public.replace_manual_executions_atomically(p_user_id uuid, p_delete_mode text, p_delete_execution_id text, p_contract_key text, p_executions jsonb)`.

Confirmed properties:

- `SECURITY DEFINER`
- `SET search_path TO 'public'`
- Executable only by `service_role` among the three tested roles (`anon`, `authenticated`, `service_role`)
- The SQL assigns replacement row `user_id` from `p_user_id`, not from the execution JSON.
- The operation deletes then inserts inside a PostgreSQL transaction, so failed replacement rolls back.

Gap in current SQL:

- `execution_id` mode deletes by `id = p_delete_execution_id AND user_id = p_user_id`, but does **not** require the existing row to have a `MANUAL-` contract key.
- `contract_key` mode deletes by `contract_key = p_contract_key AND user_id = p_user_id`, but does **not** require the requested/existing lifecycle key to be manual.
- The new replacement executions are validated as manual by the current server helper, but validation of the replacement payload does not constrain which old records the SQL is allowed to delete.

Impact:

A user may be able to craft a request to their own authenticated `/api/trades/edit` route that targets a non-manual execution ID or contract key belonging to that same user. If the route passes it through as supplied, the RPC could delete the matching record and insert valid manual replacement data. This is not a demonstrated cross-user deletion; it is a missing source-type restriction.

Required fix:

- Enforce manual-only target conditions **inside the database function** for both deletion modes.
- Validate inputs in the API/helper too, but do not rely on frontend validation or JavaScript alone.
- Keep the function transactional and preserve current partial-exit versus lifecycle semantics.
- Add tests showing that a manual edit cannot delete a broker/non-manual execution, that another user's execution is not touched, and that a failed replacement leaves the original state intact.

## 4.2 Structural risk: broker replacement RPC can delete manual executions

**Live function:** `public.replace_broker_executions_atomically(p_user_id uuid, p_account text, p_execution_dates text[], p_executions jsonb)`.

Current deletion condition:

```sql
DELETE FROM public.executions
WHERE user_id = p_user_id
  AND account = p_account
  AND date = ANY(p_execution_dates);
```

The function does not explicitly exclude `MANUAL-` executions. Inserted rows receive `user_id = p_user_id`, which is a good ownership control, and the full operation is transactional. However, atomicity does not guarantee that the DELETE predicate targets only broker-imported records.

Data context:

- Current same-date mixed groups: 0.
- One user/account pair has both manual and non-manual/unclassified records: 4 manual and 303 non-manual/unclassified records.

No previous loss is proven. The schema currently classifies manual sources with the `MANUAL-` prefix; inspect broker import normalization and account semantics before choosing the exact exclusion predicate.

Required fix:

- Constrain the broker replacement DELETE so it cannot delete manual executions.
- Validate the chosen source-identification condition against existing imports; do not assume every row without `MANUAL-` is definitely an IBKR row.
- Preserve account/date replacement semantics for true broker executions and retain transactional behavior.
- Test a mixed account/date fixture where manual and broker rows share the same account and date; the manual row must survive.

## 4.3 Active UI direct-delete paths

The newer `POST /api/trades/delete` route authenticates the user and calls `deleteManualExecutionsAtomically()`. Its SQL function includes better constraints:

- `execution_id` mode scopes by execution ID, user ID and `contract_key LIKE 'MANUAL-%'`.
- `contract_key` mode requires the key to begin with `MANUAL-` and scopes by user ID.
- It raises an error when no matching manual execution is deleted.
- The RPC is service-role-only among the tested roles.

However, the active UI still has direct deletes against `public.executions`:

### `components/dashboard/TradingCalendar.tsx` (around lines 533–578)

- Handler checks `trade.contractKey.startsWith('MANUAL-')`.
- It directly deletes from `executions` by `contract_key` instead of calling the atomic delete API.
- RLS protects row ownership but does not enforce the manual-only source check at the database delete boundary.

### `components/trades/TradeDetailModal.tsx` (around lines 92–242)

- Computes `isManualTrade` for partial-exit classification.
- The partial-exit branch is restricted to manual partial exits by that condition, but deletes directly by execution ID.
- The complete-lifecycle branch directly deletes by `contract_key`; the inspected handler has no manual-only guard before that branch.
- Full button visibility/render conditions were not fully captured during this review, so the extent to which a broker trade can reach the handler must be verified.

### `components/trades/TradesTable.tsx` (around lines 102–145)

- Handler checks that `trade.contractKey` exists.
- It directly deletes rows by `contract_key`.
- The inspected handler has no visible `MANUAL-` prefix check. Full delete button conditions were not fully captured.

These components are imported by production pages (`/dashboard` and `/trades`) as well as demo pages. The direct operations therefore should not be considered dead code.

Required fix:

- Route supported manual delete actions through the existing atomic delete API.
- Keep partial-exit deletion on exact execution ID and full lifecycle deletion on contract key.
- Enforce manual-only ownership at both API/database layers.
- Verify broker-trade delete buttons cannot invoke manual deletion and that legitimate broker data is not accidentally made deletable through the UI.
- Do not modify FIFO reconstruction or directly delete reconstructed trade objects as a substitute.

## 4.4 Manual creation RPC

`public.create_manual_executions_atomically(p_user_id uuid, p_executions jsonb)` assigns `user_id` from `p_user_id` and validates the JSON shape. The current TypeScript create helper calls `validateManualExecutions()` before calling the RPC. The live SQL function itself does not check the `MANUAL-` prefix; the server boundary and restricted execute permissions therefore remain important. For future defense-in-depth, consider whether a manual-only check in the database function is appropriate, but do not change it without verifying the full execution input contract.

## 4.5 CSV import uses direct browser Supabase upsert

The current dashboard CSV handler calls `saveExecutionsToSupabase(parsedTrades)`. The storage helper:

- Calls `supabase.auth.getUser()`.
- Sets `user_id: user.id` in serialized execution rows.
- Deduplicates incoming rows by `id`.
- Calls browser Supabase `.from('executions').upsert(uniqueExecutions, { onConflict: 'id' })`.

This is not the same as the Manual Entry API. RLS can protect row ownership, but this direct write does not pass through future Next.js API-only entitlement checks. Before release, the central access design must cover it—either by moving the write through a server-authorized import endpoint or by an equally strong and maintainable database authorization design. Review implications for CSV/IBKR imports before choosing.

The error branch logs the first attempted execution object (`console.error('FIRST EXECUTION:', uniqueExecutions[0])`), which can expose account/ticker/quantity/price and other trading data. Replace with sanitized diagnostic fields and counts.

---

# 5. Authentication, Invite-Only Approval and Entitlements

## 5.1 Current observed behavior

- `providers/AuthProvider.tsx` uses Supabase session retrieval and auth-state updates, and exposes the current user/loading state. It does not provide application approval/entitlement state.
- `components/auth/ProtectedRoute.tsx` redirects unauthenticated users to `/login`; it does not check pending approval, suspension, read-only state, or capabilities.
- `app/signup/page.tsx` calls `supabase.auth.signUp()` with `full_name` metadata; no invitation or approval gate was visible in the inspected handler.
- `app/login/page.tsx` authenticates with password and directs the user to `/dashboard`; no approval check was visible between auth and navigation.
- `public.profiles` contains only `id` and `display_name`.
- The current public table list contains no dedicated subscription/entitlement/access-grant tables.

These are scoped observations of the inspected files, not proof that no other middleware or platform configuration exists. Recheck the full current route/auth tree before changes.

## 5.2 Target design principles

The intended beta has no payment integration. Build the entitlement foundation so subscriptions can be added later without introducing paid checkout now.

Keep separate concepts for:

1. **Account approval / invitation state** — whether a new account is allowed into the product.
2. **Administrative role** — e.g., Owner/admin; separate from a user's plan.
3. **Forced access restriction** — e.g., suspended or read-only override.
4. **Effective entitlement / plan capabilities** — which features/actions the user may use.
5. **Quotas / limits** — counters for features where limits apply.

Do not overload one `role` or `plan` field to represent all of these.

## 5.3 Beta behavior to implement

- Signup page communicates “invite-only”; do not add pricing/payment UI in this stage.
- Require email verification. Pending or unapproved users must not gain normal app access just because Auth succeeded.
- New users start pending/ineligible until the server-side approval process permits access.
- Approval is performed through an authorized admin/owner path, with an audit record.
- Preserve the six existing verified users using an explicit migration/seed strategy that does not accidentally lock out existing accounts.
- Implement a genuine server-side `read-only` mode. It should permit viewing and analytics/search/filter/export where appropriate, but deny all writes, imports, connection changes, and synchronization actions.
- Suspension/forced restrictions must override otherwise valid entitlement.
- Do not fake paid-subscription rows for free beta access. Use an explicit admin grant or beta entitlement model.
- Future invitation tokens must remain conceptually separate from future plan/access codes.
- Later subscription plans and Stripe billing can plug into the resolver; they are deferred for this beta.

## 5.4 Centralized authorization sequence

Every protected mutation and background job should apply a consistent server-side sequence:

1. Authenticate the request (or validate the trusted scheduled-job secret).
2. Derive the user identity on the server; never trust a request-body `user_id`.
3. Resolve account approval and email-verification state.
4. Check suspension/forced restriction.
5. Resolve the effective plan/grant and required capability.
6. Enforce quota atomically when a quota applies.
7. Validate input and ownership/source semantics.
8. Perform the database operation atomically where needed.
9. Return consistent machine-readable 401/403 errors without leaking internal records.
10. Record audit events for privileged administration actions.

Frontend checks are for UX, not the final security boundary.

## 5.5 Direct Supabase mutation implications

The mutation inventory found direct browser Supabase writes in:

- `lib/storage/supabaseExecutionStorage.ts` — execution upsert / CSV import.
- `lib/storage/noteAnnotationStorage.ts` — annotations.
- `lib/storage/noteAttachmentStorage.ts` — attachment metadata and Storage operations.
- `lib/storage/profileStorage.ts` — profile insert/update.
- `lib/storage/supabaseDailyNotesStorage.ts` — daily notes.
- `lib/storage/supabaseDailyReviewTradeNoteStorage.ts` — trade-review notes.
- `app/settings/page.tsx` — broker-connection insertion/update.
- `app/dashboard/page.tsx` — broker-connection upsert in the inspected code.
- Other read/write helpers that use `.from(...)` exist in notes, expenses, reviews and related modules; exact mutation coverage should be confirmed from the latest grep output before implementation.

Central entitlement enforcement must account for direct write paths. Options include moving selected writes behind server APIs or implementing carefully designed RLS/database checks for approval/restriction state. Quotas and atomic usage counters generally require a trusted server or transactional database operation. Do not assume `ProtectedRoute` alone prevents direct calls.

---

# 6. API Route and Privileged Client Findings

## 6.1 Positive patterns

- `app/api/trades/create/route.ts`, `/edit/route.ts`, and `/delete/route.ts` authenticate the bearer token using Supabase Auth and pass the derived `user.id` to server helpers.
- `app/api/sync-all-brokers/route.ts` authenticates the user and calls `syncUserBrokers(user.id)`.
- `lib/server/sync/syncUserBrokers.ts` selects active broker connections filtered by `user_id`.
- `app/api/broker-connections/[brokerId]/token/route.ts` authenticates and queries with both broker ID and `user_id`, then returns that user's Flex token. Confirm client necessity before any design change; ownership scoping is present.
- `app/api/cron/sync-brokers/route.ts` uses a server-side cron secret gate. The configuration edge case below must be hardened.

## 6.2 Legacy `/api/ibkr/flex`

Current source inspection confirmed:

- Its `POST` handler has no `Request` argument and no visible authentication check.
- It uses the privileged `supabaseAdmin` client.
- It selects an active `broker_connections` record with `is_active = true` but no `user_id` filter.
- It makes IBKR Flex calls and returns the full statement XML.
- It logs `SEND XML` and `FULL POLL XML`.
- Repository search found no current application call site.

September notes classify this as an unused/legacy known weakness, and record an earlier decision not to delete or modify it then. Maintain that history: do not blindly delete it, but do not treat it as an approved secure endpoint. Before broader beta access, confirm it is unnecessary and then secure, disable, archive, or remove it through a deliberate decision. If retained, it requires authentication/ownership and sanitized responses/logging appropriate to its purpose.

## 6.3 Legacy `/api/test-sync`

September 13 notes document it as an unauthenticated test endpoint that directly invokes `syncAllBrokers()`, potentially triggering all active broker connections. The current repository still lists the route, but the full current implementation was not re-inspected in this session.

Action: inspect it before release and secure, disable or remove it after confirming no current callers. Do not assume an old test route is harmless merely because the UI does not call it.

## 6.4 Cron secret fail-closed behavior

Current route compares the request header against the expected value `Bearer ${process.env.CRON_SECRET}`.

If `CRON_SECRET` is undefined, the expected string can become the literal `Bearer undefined`. That is a conditional flaw; production configuration has not been verified.

Required fix:

- Explicitly reject if the environment variable is absent/empty.
- Then compare the provided header against the configured secret.
- Verify the secret is configured in the required Vercel environments without printing or sharing its value.
- Retain the intended all-user scheduled sync, but ensure only a properly authenticated cron request reaches it.

## 6.5 Sensitive logging

Review and sanitize:

- Full XML output in `/api/ibkr/flex`.
- Raw IBKR error XML in `lib/server/brokers/ibkr/fetchFlexStatement.ts`.
- Account and query identifiers in `lib/server/brokers/ibkr/fetchFlex.ts`.
- Full first execution object in `saveExecutionsToSupabase()` error logging.
- Full trade object logged when `TradeDetailModal` cannot identify a partial-exit execution.

Production logs should use safe identifiers, operation names, counts, and sanitized error codes—not complete statements, credentials, or unnecessary trading details.

## 6.6 Duplicate privileged-client modules

Both `lib/server/supabaseAdmin.ts` and `lib/supabaseAdmin.ts` create a Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`. The current route import list uses both modules.

This is a maintenance and server-boundary risk, not proof the key leaked to the browser. Before consolidating, inspect all imports and ensure service-role clients are server-only and cannot enter client bundles. Keep the secret server environment variable only; never use a `NEXT_PUBLIC_` service-role variable.

---

# 7. Account Deletion — Findings and Required Design

## 7.1 Likely foreign-key blocker

Live relationship:

`public.profiles(id) REFERENCES auth.users(id)` with no `ON DELETE CASCADE`.

The profile is auto-created by `handle_new_user()`, and all six users currently have matching profiles. Deleting an Auth user while its profile row still exists can violate this foreign key and block deletion.

This is the strongest current hypothesis for the reported “unable to delete user” failure, but the actual Supabase error is not yet available. Before changing schema, capture the exact Auth/Admin API error and any relevant Postgres log details for a controlled test account. Do not delete a production profile manually to see whether it works.

## 7.2 Data needing explicit deletion

Because there are no foreign keys from these tables to `auth.users`, an account deletion routine must explicitly account for:

- `public.executions`
- `public.expenses`
- `public.daily_notes`

Current orphan checks returned zero for all three. That is a clean current state, not a reason to omit future deletion logic.

Other rows with cascading Auth references include `broker_connections`, `daily_review_trade_notes`, `notes`, `trade_reviews`, and `user_tax_profiles`. Note child tables cascade from `notes` and `note_attachments` according to the current foreign keys. Confirm every data table and dependency before writing the delete procedure.

## 7.3 Storage cleanup

Private buckets:

- `note-attachments`
- `receipts`

All eight objects currently follow the user-folder UUID convention. A safe deletion workflow must find/delete only objects under the exact target user's folder prefix, handle pagination, and remove Storage objects through Supabase Storage APIs. Deleting rows from `storage.objects` directly is not an acceptable substitute for supported Storage deletion APIs.

Database and Storage cleanup may not be one shared transaction. Design the workflow with explicit stages, error handling, retries/compensation, and a final Auth deletion only after the cleanup strategy is established. Do not let a modal directly invoke privileged Auth deletion from the browser.

## 7.4 Delete User modal sequencing

Do not wire a destructive Delete User modal to a backend operation yet. First:

1. Obtain the exact current deletion error and confirm the affected path (Dashboard/Auth UI/SQL/API).
2. Design and test a server-only account-deletion service using a disposable test account.
3. Resolve the profile FK behavior and explicit table cleanup.
4. Add exact-owner Storage cleanup and verify another user's objects remain untouched.
5. Test partial failure/retry behavior and verify Auth deletion completes only when intended.
6. Build/wire the modal to the already-tested server operation, requiring clear confirmation and handling errors safely.

A visual or static modal design can be prototyped independently, but production deletion must not be exposed before the backend is safe.

---

# 8. Recommended Priority and What Must Happen Before the Modals

The user requested that anything necessary before work on the Signup Modal or Delete User Modal be fixed first. Use these gates.

## Gate A — Before production invite-only signup is enabled or more users are admitted

Required high-priority remediation:

1. Correct the manual-edit RPC manual-only deletion boundary.
2. Correct broker-replacement DELETE scoping to preserve manual executions.
3. Route active supported manual deletion UI paths through the atomic server API; ensure manual-only restriction exists at the server/database boundary.
4. Review/correct excessive grants, especially `TRUNCATE` on all public tables for `anon` and `authenticated`, using a reviewed migration and checks that existing app workflows continue to work.
5. Harden cron to fail closed if `CRON_SECRET` is missing; verify Vercel configuration without revealing the value.
6. Treat `/api/ibkr/flex` and `/api/test-sync` as release-blocking legacy exceptions until they are confirmed unnecessary and secured/disabled/removed by a deliberate decision.
7. Sanitize sensitive logs where full XML or execution/trade objects are currently printed.

These are release gates for broadening production access, even though they do not all have to block local UI development. We can design the Signup Modal in parallel, but do not consider invite-only signup secure until the approval gate is enforced on the server and applicable database write paths.

## Gate B — Before the Delete User modal can perform deletion

Required:

1. Confirm the exact Auth deletion error.
2. Resolve the profile foreign-key blocker using a deliberate database design (for example, the right deletion/cascade behavior after evaluating dependencies—not an unreviewed change).
3. Explicitly handle `executions`, `expenses`, `daily_notes`, other owned tables and Storage objects.
4. Test using a disposable account and verify the remaining users' data and files are untouched.
5. Provide a server-only deletion endpoint/service that authorizes the admin/owner and logs the privileged action.

This is separate from subscription state: expiration, downgrade, suspension, or read-only access must never trigger account deletion.

## Gate C — Before the entitlement foundation is considered complete

- Introduce a centralized entitlement/authorization resolver.
- Apply it to API writes, direct Supabase writes, broker connection operations, imports, and scheduled/background tasks.
- Add a dedicated approval/access model rather than overloading `profiles.display_name` or a generic role field.
- Preserve existing verified users during migration.
- Test pending approval, approved beta access, read-only, suspended access, and unauthorized direct API/database mutation.
- Defer billing/payment/Stripe until explicitly scheduled for a later phase.

## Do we have to fix all of this before starting the Signup Modal UI?

No. The visual modal can be designed or prototyped in development. But the backend approval flow must exist before invite-only signup is treated as secure in production. The P1 execution/privilege/legacy-endpoint fixes should be addressed before expanding production access; they do not require redesigning the Signup Modal itself.

For the Delete User modal, a static design can be prototyped, but it should not be wired to an actual destructive endpoint until Gate B is completed and tested.

---

# 9. Suggested Implementation Sequence

## Phase 0 — Establish a safe change checkpoint

- Recheck `git status --short`, branch, and current commit.
- Preserve the existing local modification `docs/ToolKit.md` recorded during the audit. Do not accidentally stage or overwrite it.
- Create a current checkpoint/branch or commit only the explicitly intended files according to the user's workflow.
- Confirm how database SQL is currently versioned; the local search did not find SQL migration files.
- Do not apply production SQL directly without a version-controlled migration and rollback/recovery plan.

## Phase 1 — Execution data-integrity fixes

1. Capture current definitions of the relevant SQL functions from Supabase and keep a backup in a reviewed migration/checkpoint.
2. Update manual-edit SQL so both deletion modes enforce the manual-only target invariant.
3. Update broker replacement SQL to exclude manual executions using an evidence-backed source predicate.
4. Replace direct manual deletion handlers in `TradingCalendar`, `TradeDetailModal`, and `TradesTable` with the atomic delete API while preserving partial-exit and lifecycle semantics.
5. Add tests for:
   - manual lifecycle delete works;
   - partial exit delete targets one execution only;
   - edit cannot delete a non-manual execution owned by the same user;
   - one user cannot edit/delete another user's execution;
   - broker replacement preserves manual rows sharing the same account/date;
   - failed edit rolls back and preserves prior execution state;
   - zero-row deletes do not report success.
6. Build and test the app. Verify that `pairTrades.ts`, FIFO behavior, P&L and dashboard behavior did not change unexpectedly.

## Phase 2 — Least-privilege database grants and legacy routes

1. Identify where broad grants are granted (table grants, PUBLIC privileges, and default privileges).
2. Compare actual grants needed by the client, authenticated API paths, service-role helpers, and any SQL routines.
3. Revoke unnecessary `TRUNCATE`, `TRIGGER`, `REFERENCES`, and anonymous DML privileges in a reviewed migration.
4. Retest all existing storage and UI workflows after applying grants in a non-production/safe environment.
5. Harden `CRON_SECRET` missing-variable behavior and check Vercel environment configuration.
6. Decide and implement controlled treatment for `/api/ibkr/flex` and `/api/test-sync` after confirming they have no legitimate callers.
7. Remove full-payload logging and inspect duplicate admin client imports/server-only boundaries.

## Phase 3 — Approval and entitlement architecture

1. Reinspect current auth/signup/login/route guard code.
2. Design separate account approval, admin role, forced restriction and entitlement records.
3. Preserve the existing six verified users via explicit migration defaults.
4. Build an authoritative server-side resolver for approval, suspension, capabilities and future quota checks.
5. Update signup/login/protected page behavior to distinguish unauthenticated, unverified, pending, approved, read-only and suspended states.
6. Add admin approval/grant workflow and append-only audit events for privileged actions.
7. Cover direct browser mutations through RLS/database checks or move selected paths behind server APIs. Do not enforce write capabilities only in the UI.
8. Keep the beta free, without fake paid subscriptions or payment integration.
9. Test all relevant access states before enabling new production signup.

## Phase 4 — Safe account deletion and Delete User modal

1. Capture the actual failure message.
2. Resolve the profile FK and other data dependencies.
3. Implement server-only, owner-authorized deletion service and exact-user Storage cleanup.
4. Test the whole workflow on a disposable account with rollback/retry and data-isolation checks.
5. Add the confirmation modal only after the backend is validated.

## Phase 5 — Release validation

- Authenticated vs unauthenticated requests.
- Email unverified vs verified.
- Pending vs approved user.
- Full beta access vs read-only vs suspended.
- Direct Supabase writes as well as API writes.
- Cross-user ID/contract-key manipulation attempts.
- Mixed manual/broker account/date sync scenario.
- Missing cron secret.
- Legacy endpoint reachability.
- Account deletion with notes, executions, expenses, daily notes, broker connections, attachments, and receipts.
- Password reset/recovery still works.
- Production build succeeds.
- Git diff contains only intended changes and leaves `docs/ToolKit.md` untouched unless explicitly requested.

---

# 10. Historical September 13 Notes — How to Use Them

The following previous master notes were supplied during this audit:

- Atomic Delete Persistence.
- Atomic Edit Persistence.
- Server-Side Ownership & Authorization.
- Feature #27 — Server-Side Validation Mirror.

They document important existing architecture:

- Execution-first data model and deterministic FIFO reconstruction.
- Atomic delete/edit through server APIs and PostgreSQL functions.
- Ownership checks and restricted service-role RPC permissions.
- Manual-execution validation in the relevant server helper.
- Previous ownership audit pass results for the active routes that were reviewed in September.
- Previously known exceptions for `/api/ibkr/flex` and `/api/test-sync`.

The October review agrees with several of those foundations, but it also found that the current direct deletion call sites and current live SQL require attention. A prior “PASS” should not be interpreted as permanent proof that current implementation remains unchanged. When implementing, inspect current repository code and current database definitions again.

---

# 11. Exact Audit Results and Commands Already Run

This is the short audit trail so a future session can avoid repeating the discovery unnecessarily.

## Source inspection performed

- `ProtectedRoute.tsx`, `AuthProvider.tsx`, signup and login handlers.
- Existing API route tree.
- `app/api/ibkr/flex/route.ts`.
- `app/api/broker-connections/[brokerId]/token/route.ts`.
- `app/api/trades/create/route.ts`.
- `app/api/trades/edit/route.ts`.
- `app/api/trades/delete/route.ts`.
- `app/api/sync-all-brokers/route.ts`.
- `app/api/cron/sync-brokers/route.ts`.
- `lib/server/sync/syncUserBrokers.ts`.
- `lib/server/sync/syncAllBrokers.ts`.
- `lib/server/sync/syncBroker.ts`.
- `lib/server/brokers/ibkr/fetchFlex.ts`.
- `lib/server/brokers/ibkr/fetchFlexStatement.ts`.
- `lib/server/sync/replaceBrokerExecutionsAtomically.ts`.
- `lib/server/sync/deleteExecutionWindow.ts`.
- Manual create/edit/delete atomic helpers.
- `components/trades/AddTradeModal.tsx` create flow.
- `components/trades/EditTradeModal.tsx` edit/delete API flow.
- `components/dashboard/TradingCalendar.tsx` direct delete.
- `components/trades/TradeDetailModal.tsx` direct delete.
- `components/trades/TradesTable.tsx` direct delete.
- `lib/storage/supabaseExecutionStorage.ts` and CSV import call site.
- Direct mutation grep in `lib/storage`, `app`, and `components`.
- Duplicate Supabase admin client modules.

## Supabase read-only queries performed

1. Public tables and RLS enabled/forced status.
2. All `public` RLS policies.
3. Foreign keys referencing `auth.users`.
4. Four atomic execution RPC definitions.
5. Custom triggers on `auth.users`.
6. Execution RPC effective execute privileges.
7. `handle_new_user()` definition.
8. Auth-user/profile matching counts.
9. Foreign keys referencing `public.profiles`.
10. User/account/date groups containing manual and non-manual/unclassified executions.
11. User/account groups containing manual and non-manual/unclassified executions.
12. Selected public table column definitions.
13. Executions count and owner/source classification counts.
14. All public-schema foreign keys and deletion actions.
15. Orphan counts for executions, expenses and daily notes.
16. Email verification counts.
17. Storage buckets and configuration.
18. Storage object policies.
19. Storage object folder-prefix ownership counts.
20. Effective privileges for `anon` and `authenticated` across public tables.

No source or SQL migration files were found by the local search for `*.sql`/migration directories, which makes migration versioning a required setup item before database changes.

---

# 12. Handoff Checklist for the Next Session

When work resumes:

- [ ] Start from this master note and the September atomic persistence/ownership documents.
- [ ] Confirm the active branch and current commit; inspect `git status --short`.
- [ ] Preserve the pre-existing local change to `docs/ToolKit.md`.
- [ ] Do not repeat the full audit unless code/database state has changed.
- [ ] First prepare an implementation checklist and migration design for execution RPC boundaries and direct delete paths.
- [ ] Review actual SQL functions again before writing replacement definitions.
- [ ] Do not modify `pairTrades.ts`, canonical execution design, P&L logic or analytics as part of these fixes.
- [ ] Keep all DB changes as reviewed, version-controlled migrations; back up current live function definitions first.
- [ ] Add and run targeted tests and build verification.
- [ ] Before invite-only production launch, verify backend approval/entitlement enforcement and close P1 security exceptions.
- [ ] Before wiring the Delete User modal, confirm the actual Auth deletion error and test data/Storage cleanup with a disposable account.
- [ ] Keep pricing, checkout, Stripe and paid subscriptions out of the current beta implementation.

## Final status

**Audit status:** Read-only discovery completed for the targeted areas above.  
**Remediation status:** Not started.  
**Database changes:** None.  
**Application code changes:** None.  
**Trading data changes:** None.  
**Recommended immediate work:** Resolve the critical execution deletion and excessive grant issues in a controlled, tested way, then implement invite-only approval and centralized entitlements. Account deletion backend must be made safe before a working Delete User modal is exposed.

**End of master notes.**