# ELITE X TRADING JOURNAL

# PRE-IMPLEMENTATION SECURITY CHECKLIST
## Before Invite-Only Signup and Delete User Modal

**Project:** Elite X Trading Journal / Elite X Trading OS  
**Last Updated:** October 25, 2026  
**Status:** Security remediation partially completed; invite-only authorization remains in the audit/design phase.

**Audit Scope:** Execution integrity, database permissions, API security, authentication, account approval, user-owned data, broker synchronization, and account-deletion readiness.

## STATUS DEFINITIONS

- [x] Implemented and verified within the stated scope.
- [~] Implemented, but full validation or production verification remains outstanding.
- [ ] Not implemented or not yet verified.
- [DEFERRED] Deliberately postponed by decision; not considered complete.
- [RISK] Known unresolved security concern.

A completed implementation does not automatically mean every possible regression test has passed.

---

# 1. OBJECTIVE

Prepare Elite X for controlled, invite-only access and eventual safe account-deletion functionality.

The objective is not to redesign the application or repeat the entire audit unnecessarily.

The objectives are to ensure:

- Existing trading data remains protected.
- Broker synchronization cannot accidentally delete manual executions.
- Manual editing and deletion cannot target unintended executions.
- Database permissions follow least privilege.
- Server endpoints enforce authentication and appropriate authorization.
- Invite-only approval and account permissions are enforced by trusted backend components.
- Scheduled and manual broker synchronization follow consistent account-eligibility rules.
- Account deletion removes intended user-owned data and files safely.
- Existing FIFO reconstruction, analytics, manual-trade behavior, note editing, and password recovery remain intact.

No task should be considered complete without the implementation and relevant validation being recorded.

---

# 2. PHASE 0 — SAFE CHECKPOINT AND MIGRATION WORKFLOW

## Current findings

- The project uses Next.js, TypeScript, Supabase, and Vercel.
- Supabase CLI has been initialized and linked to the project.
- The local `supabase/migrations` directory now contains the two execution-integrity migrations added during the security work.
- The manual-edit migration was applied to the live database and marked as applied in migration history.
- The broker-replacement migration was applied through the linked Supabase CLI workflow.
- Security changes and documentation have been committed and pushed during this remediation session.

## Required maintenance

- [x] Establish a tracked migration directory.
- [x] Add version-controlled migrations for the manual-edit and broker-replacement fixes.
- [x] Establish a linked Supabase CLI workflow.
- [ ] Before the next code change, run `git status --short`.
- [ ] Confirm the current branch and latest commit.
- [ ] Preserve any unrelated local modifications.
- [ ] Verify the current status of `docs/ToolKit.md` before staging changes.
- [ ] Review the complete diff before each commit.
- [ ] Preserve rollback or recovery instructions for future destructive migrations.
- [ ] Continue using isolated test fixtures or disposable accounts for destructive tests.

**Checkpoint rule:** Do not overwrite unrelated notes or include unrelated changes in security commits.

---

# 3. PHASE 1 — PROTECT CANONICAL EXECUTION DATA

Elite X's canonical architecture remains:

Canonical Executions
        |
        v
    pairTrades()
        |
        v
 Derived Trades / Positions
        |
        v
    P&L / Analytics

Executions remain the canonical source of truth.

Do not redesign FIFO reconstruction as part of this security work.

## 3.1 Manual Edit RPC

**Affected function:**

`public.replace_manual_executions_atomically(...)`

### Implementation

- [x] Inspect the existing database function.
- [x] Add manual-lifecycle restrictions to the deletion/replacement behavior.
- [x] Preserve intended user ownership checks.
- [x] Preserve atomic replacement semantics.
- [x] Preserve partial-exit versus complete-lifecycle replacement behavior.
- [x] Add migration:

  `supabase/migrations/20261024224324_harden_manual_execution_edit.sql`

- [x] Apply the migration to the live Supabase database.
- [x] Mark the migration as applied in Supabase migration history.
- [x] Validate the existing manual edit workflow using a disposable test trade.
- [x] Confirm the test edit and cleanup succeeded.
- [x] Confirm the project build passed during the remediation session.

### Remaining validation

- [ ] Add or run an explicit test proving a manual edit cannot delete a broker-imported execution owned by the same user.
- [ ] Verify another user's executions cannot be affected.
- [ ] Test invalid replacement data and transaction rollback.
- [ ] Reconfirm partial-exit editing changes only the intended execution.
- [ ] Reconfirm complete-lifecycle replacement remains atomic.

**Current status:** Implemented and deployed; targeted UI testing completed. Additional regression tests remain.

## 3.2 Broker Execution Replacement

**Affected function:**

`public.replace_broker_executions_atomically(...)`

### Implementation

- [x] Inspect broker replacement behavior and manual execution identification.
- [x] Add an explicit exclusion for manual executions.
- [x] Preserve records whose `contract_key` is NULL for backward compatibility.
- [x] Preserve user, account, and date-window scoping.
- [x] Preserve the existing atomic replacement behavior.
- [x] Add migration:

  `supabase/migrations/20261024231200_protect_manual_executions_from_broker_sync.sql`

- [x] Apply the migration to the linked Supabase database.
- [x] Confirm the migration appears in local and remote migration history.
- [x] Run SQL-level checks without errors.

### Remaining validation

- [ ] Test a populated mixed account/date scenario containing both manual and broker executions.
- [ ] Verify manual executions survive an actual controlled broker refresh.
- [ ] Verify intended broker records are still replaced correctly.
- [ ] Verify failure and rollback behavior.
- [ ] Record the result of a populated end-to-end replacement test.

The recent on-demand sync did not exercise populated replacement: the inspected active IBKR accounts returned zero executions, and replacement was skipped.

**Current status:** Implemented and deployed; the populated mixed-data runtime test remains outstanding.

## 3.3 Standardize Direct Execution Deletion Paths

**Affected components:**

- `components/dashboard/TradingCalendar.tsx`
- `components/trades/TradeDetailModal.tsx`
- `components/trades/TradesTable.tsx`

**Existing API:**

`POST /api/trades/delete`

### Findings

- Direct deletion handlers were identified in existing components.
- Some handlers appeared unused in their respective components.
- The existing TradeDetailModal workflow contains deletion behavior for manual trade executions.
- The user explicitly chose to defer changes because the existing manual edit/delete workflow had already been made to work.

### Status

- [DEFERRED] Do not change these paths without revisiting the decision.
- [ ] Keep this item open for a future dedicated review.
- [ ] Before revisiting, map each visible deletion action to its actual handler and API.
- [ ] Preserve partial-exit deletion by exact execution ID.
- [ ] Preserve full-lifecycle deletion semantics.
- [ ] Verify server-side ownership and manual-only restrictions.
- [ ] Test FIFO reconstruction after deletion.

**This item is deferred, not complete. No additional direct-delete refactor is authorized by this checklist update.**

---

# 4. PHASE 2 — DATABASE LEAST-PRIVILEGE REVIEW

## Live database findings

The live RLS audit returned 14 public tables:

- RLS is enabled on all 14 tables.
- Existing policies generally restrict records to their owner.
- The profile table currently has ownership-based SELECT, INSERT, and UPDATE policies.
- The audit identified excessive table privileges, including TRUNCATE, REFERENCES, and TRIGGER privileges.
- Broad grants affecting some application tables were also observed.
- RLS does not protect against operations such as TRUNCATE in the same way it protects ordinary row-level access.

## Status

- [x] Inspect the live RLS configuration.
- [x] Inspect the profile policies.
- [x] Inspect effective table privileges and default privileges.
- [x] Record the finding that RLS enablement alone does not establish least privilege.
- [DEFERRED] Do not revoke privileges or change grants as part of the current work without a separate reviewed plan.

## Future requirements

- [ ] Identify required privileges for every current application access path.
- [ ] Trace explicit grants, PUBLIC grants, and default privileges.
- [ ] Determine which grants are unnecessary.
- [ ] Review anonymous DML privileges and privileged server operations.
- [ ] Prepare a version-controlled least-privilege migration.
- [ ] Preserve the existing ownership policies.
- [ ] Test trade, expense, note, attachment, profile, and broker workflows after any changes.
- [ ] Verify privileged RPCs and server-side operations continue to work.

**Current status:** Audit completed; corrections deliberately deferred.

---

# 5. PHASE 3 — SERVER ENDPOINT HARDENING

## 5.1 Legacy IBKR Flex Endpoint

**Affected file:**

`app/api/ibkr/flex/route.ts`

### Confirmed findings

- No visible request authentication.
- No user ownership filter for broker selection.
- Uses privileged Supabase access.
- Selects an active broker connection without scoping it to an authenticated user.
- Logs and returns raw IBKR statement XML.
- No current application callers were found during the source search.
- The route is documented as a legacy endpoint.

### Decision

The user explicitly chose to leave this endpoint unchanged for now.

### Status

- [x] Inspect the endpoint.
- [x] Search application source for callers.
- [RISK] Leave the endpoint as a documented unresolved security exception.
- [ ] Before invite-only production release, make an explicit decision to secure, disable, retire, or remove it.
- [ ] If retained, authenticate requests, enforce ownership, and remove raw XML responses/logging.
- [ ] Confirm the selected remediation with tests.

**Do not treat this endpoint as secure while it remains unchanged.**

## 5.2 Test-Sync Endpoint

**Affected file:**

`app/api/test-sync/route.ts`

### Implementation

- [x] Add a fail-closed check when `CRON_SECRET` is missing.
- [x] Require the configured Bearer secret.
- [x] Reject unauthenticated/incorrectly authenticated requests.
- [x] Preserve the existing global sync behavior for authorized calls.
- [x] Test an unauthenticated local request and confirm a `401` response.
- [x] Search application source for legitimate callers; none were found.

### Remaining validation

- [ ] Confirm production Vercel environment configuration without displaying the secret.
- [ ] Verify missing-secret behavior in a controlled environment.
- [ ] Do not exercise the valid-secret path casually: it invokes global broker synchronization.
- [ ] Make a future explicit decision about retiring or retaining the test route.

**Current status:** Authentication guard implemented; production and valid-secret behavior remain unverified.

## 5.3 Cron Secret Must Fail Closed

**Affected file:**

`app/api/cron/sync-brokers/route.ts`

### Implementation

- [x] Explicitly reject requests if `CRON_SECRET` is missing.
- [x] Reject requests with an invalid or missing Bearer secret.
- [x] Preserve scheduled global synchronization behavior when correctly authorized.
- [x] Test an unauthenticated local request and confirm a `401` response.

### Remaining validation

- [ ] Verify production environment configuration without exposing the secret.
- [ ] Test the missing-secret branch in a safe environment.
- [ ] Verify a correctly authorized scheduled run through a controlled operational procedure.

**Current status:** Fail-closed guard implemented; production configuration and authorized execution have not been independently verified.

## 5.4 Sensitive Logging

### `lib/server/brokers/ibkr/fetchFlexStatement.ts`

- [x] Replace raw XML logging for the initial SendRequest failure with safe HTTP status and error-code logging.
- [x] Preserve the existing retry behavior, including handling ErrorCode 1018.

### `lib/server/brokers/ibkr/fetchFlex.ts`

- [x] Review current logging.
- [DEFERRED] Retain the account and Flex Query ID logs according to the user's explicit decision.
- [ ] Revisit only if new evidence shows these logs create a material security exposure.

### `lib/storage/supabaseExecutionStorage.ts`

- [x] Replace logging of the full first execution object with the first execution ID.
- [x] Preserve execution counts, useful database error details, and thrown errors.
- [x] Confirm the build passed after the change.

### `components/trades/TradeDetailModal.tsx`

- [x] Review existing diagnostic logging.
- [DEFERRED] Leave the reviewed trade-object logging unchanged for now, based on the user's decision.

### Legacy `/api/ibkr/flex/route.ts`

- [RISK] Raw XML logging and XML responses remain unresolved because the endpoint was deliberately left unchanged.

### Status

- [x] Sanitize the targeted execution-storage and initial Flex SendRequest logs.
- [~] Retain useful diagnostic context.
- [ ] Revisit the legacy route before invite-only production release.
- [ ] Reassess deferred logs only if justified by concrete risk.
- [ ] Verify final repository diff and commit history.

**Current status:** Partially completed; the listed deferred exceptions remain open.

---

# 6. PHASE 4 — INVITE-ONLY AUTHORIZATION FOUNDATION

**Priority:** Required before invite-only production release.

**Current state:** Discovery and read-only audit are underway. Approval enforcement has not been implemented.

## 6.1 Signup, Login, and Auth Provider

### Findings

`app/signup/page.tsx`:
- Supports ordinary signup through Supabase Auth.
- Does not require an invitation or approval.
- Signup success messaging assumes the user can proceed to the application.

`app/login/page.tsx`:
- Signs in through Supabase Auth.
- Redirects the signed-in user to `/dashboard`.
- Does not check application approval or account permissions.

`providers/AuthProvider.tsx`:
- Tracks the Supabase user, session, and loading state.
- Does not resolve approval, administrator privileges, read-only access, or suspension.

`components/auth/ProtectedRoute.tsx`:
- Checks whether a user is signed in.
- Redirects unauthenticated users.
- Does not check approval or account permissions.

`app/layout.tsx`:
- Wraps the application in `AuthProvider` and `TooltipProvider`.
- Does not globally enforce authentication or approval.

### Findings and required work

- [x] Inspect signup, login, AuthProvider, ProtectedRoute, and root layout.
- [x] Confirm there is no `middleware.ts`, `middleware.js`, `proxy.ts`, or `proxy.js` in the searched project paths.
- [ ] Design invitation and approval rules.
- [ ] Decide whether signup should require an invitation token, administrator-issued invitation, or another explicit approval workflow.
- [ ] Ensure a new registration cannot grant itself approval.
- [ ] Ensure login distinguishes a valid Supabase session from an approved Elite X account.
- [ ] Preserve password reset and update-password functionality.
- [ ] Preserve the existing signup trigger/profile-creation lifecycle.
- [ ] Define clear pending, approved, read-only, suspended, and administrator behavior.

## 6.2 Profile Table and Signup Trigger

### Live schema findings

The live `public.profiles` table contains only:

- `id`
- `display_name`

Its RLS is enabled, with policies allowing authenticated users to read, insert, and update their own profile rows.

The `auth.users` trigger `on_auth_user_created` executes `public.handle_new_user()`.

The function:
- Uses `SECURITY DEFINER`.
- Uses `search_path = public`.
- Inserts a profile after user creation.
- Takes `display_name` from signup metadata or defaults to `Elite X User`.
- Does not assign approval or permission status.

### Required design work

- [x] Inspect the live profile schema.
- [x] Inspect the profile RLS policies.
- [x] Inspect the signup trigger and function definition.
- [ ] Decide where authoritative account status is stored.
- [ ] Ensure users cannot approve themselves by updating their profile.
- [ ] Protect administrator status against self-modification.
- [ ] Preserve profile creation for new Auth users.
- [ ] Decide how existing verified users are migrated or explicitly approved.
- [ ] Recheck the current existing-user and profile counts before implementation.
- [ ] Prepare and review migrations before applying any production changes.

**Important:** Approval must not be trusted merely because a client-side page reads an `is_approved` field.

## 6.3 Account States and Permission Model

The authorization design must distinguish account states without conflating approval, administrator privileges, subscription/entitlement, and write permissions.

Proposed states to design:

- **Pending:** Registered but not approved.
- **Approved:** May use permitted product features.
- **Read-only:** May view permitted data but cannot modify it.
- **Suspended:** Cannot use protected application functions.
- **Administrator:** Has separately controlled administrative permissions.

### Required work

- [ ] Define the valid status values and allowed transitions.
- [ ] Decide how administrator privileges are granted and revoked.
- [ ] Define the difference between approval, plan/entitlement, and write permissions.
- [ ] Define machine-readable authentication and authorization responses, including `401` and `403`.
- [ ] Define how revocation and suspension affect existing sessions.
- [ ] Ensure approval changes do not automatically delete data.
- [ ] Ensure password recovery remains available for pending users.
- [ ] Preserve existing users through an explicit migration strategy.

## 6.4 Page Access and Data Loading

### Findings

`app/dashboard/page.tsx`:
- Uses `ProtectedRoute`.
- The guard verifies sign-in rather than approval.

`app/profile/page.tsx`:
- Uses `ProtectedRoute`.
- Displays a hardcoded `Active` status rather than a database-verified account status.

`app/expenses/page.tsx`:
- Does not visibly use `ProtectedRoute` or perform an initial authentication check.
- Loads expenses, recurring expense data, profile data, and trading analytics through storage helpers.

`lib/storage/supabaseExpenseStorage.ts`:
- Checks the authenticated user.
- Scopes expense reads, updates, and soft deletes to the user's ID.
- Assigns the authenticated user's ID during insertion.

`app/trades/page.tsx`:
- Does not visibly use `ProtectedRoute` or perform an initial authentication check.
- Loads imported executions and manual trades.

`lib/storage/tradeStorage.ts`:
- Stores manual trades in browser `localStorage` using the shared key `elite-x-trades`.
- Does not separate trades by authenticated user.

`lib/trades/loadTradesForAnalytics.ts`:
- Loads imported trades through the Supabase execution loader.
- Loads manual trades from browser storage.

`app/notes/page.tsx`:
- Does not visibly use `ProtectedRoute` or perform an initial authentication check.
- Loads notes and executions through storage helpers.

`lib/storage/supabaseNoteStorage.ts`:
- Checks authentication.
- Scopes note reads, updates, and deletes to the authenticated user.
- Checks parent-note ownership for several linked data operations.

`lib/storage/noteAttachmentStorage.ts`:
- Authenticates the user and verifies note ownership before upload, deletion, or layout updates.
- Uses the `note-attachments` bucket.

`lib/storage/noteAnnotationStorage.ts`:
- Verifies attachment-to-note-to-user ownership for annotation creation, update, and deletion.

`app/settings/page.tsx`:
- Does not visibly use `ProtectedRoute` or perform a general initial authentication check.
- Loads broker connections; its query relies on existing RLS for row ownership.
- Adds brokers with the authenticated user's ID.
- Edits brokers by ID, relying on RLS for ownership.

### Required work

- [ ] Design consistent route-level behavior for unauthenticated, pending, approved, read-only, and suspended users.
- [ ] Enforce access at trusted authorization boundaries rather than relying on UI visibility.
- [ ] Preserve existing user-scoped storage operations.
- [ ] Decide how local manual trades should be migrated or separated by user without losing existing browser data.
- [ ] Ensure read-only users cannot write directly through the application or direct Supabase mutations.
- [ ] Update the Profile page to display the authoritative account status when that status exists.
- [ ] Preserve the existing notes editor and linked-data model.
- [ ] Recheck ownership policies before modifying storage behavior.
- [ ] Avoid clearing `elite-x-trades` as part of authorization changes.

## 6.5 Broker Credentials and Sync Authorization

### Flex-token endpoint

`app/api/broker-connections/[brokerId]/token/route.ts`:

- [x] Validates the supplied Supabase access token.
- [x] Filters broker lookup by both broker ID and authenticated user's ID.
- [x] Returns the stored Flex token only after the ownership lookup succeeds.
- [ ] Add the future account-approval and permission checks without breaking the Show Flex Token feature.

### Manual sync endpoint

`app/api/sync-all-brokers/route.ts`:

- [x] Validates the user's Supabase access token.
- [x] Calls `syncUserBrokers(user.id)`.

`lib/server/sync/syncUserBrokers.ts`:

- [x] Filters broker connections by the supplied user ID and active status.
- [x] Preserves sequential processing and the three-second delay between brokers.
- [ ] Enforce the future account-eligibility rules before privileged sync operations.

`lib/server/sync/syncBroker.ts`:

- Calls the broker fetch helper and updates sync status.
- Does not independently enforce account approval.

`lib/server/sync/updateSyncStatus.ts`:

- Uses `supabaseAdmin`.
- Updates sync status by broker ID.
- Does not independently verify account ownership or status.

### Scheduled sync

`lib/server/sync/syncAllBrokers.ts`:

- Uses `supabaseAdmin`.
- Selects active broker connections across all users.
- Calls the shared broker-sync engine sequentially.
- Does not filter by account approval or suspension.

### Required work

- [x] Inspect user-triggered sync authentication and user scoping.
- [x] Inspect the global scheduled sync flow.
- [ ] Define which account states are eligible for scheduled sync.
- [ ] Ensure pending and suspended users' broker connections are not synced when the new policy requires that restriction.
- [ ] Ensure read-only permissions are distinguished from broker-sync entitlement.
- [ ] Apply consistent account-eligibility rules to manual and scheduled sync paths.
- [ ] Preserve the intended multi-account model.
- [ ] Verify privileged database operations cannot be triggered by an unauthorized client.

## 6.6 Manual Trade Creation and Privileged RPC

### Findings

`app/api/trades/create/route.ts`:
- Validates the caller's access token.
- Obtains the user ID from Supabase Auth.
- Passes the authenticated user ID to the creation helper.
- Performs basic request-shape validation.

`lib/server/trades/validateManualExecutions.ts`:
- Validates the execution array, required fields, actions, currencies, numeric values, manual contract-key prefix, and execution-value calculation.

`lib/server/trades/createManualExecutionsAtomically.ts`:
- Uses `supabaseAdmin.rpc("create_manual_executions_atomically", ...)`.
- Passes the supplied user ID to the RPC.

Live database inspection of `public.create_manual_executions_atomically(p_user_id uuid, p_executions jsonb)` confirmed:

- It is owned by `postgres`.
- It uses `SECURITY DEFINER`.
- It sets `search_path = public`.
- `anon` cannot execute it.
- `authenticated` cannot execute it.
- `service_role` can execute it.
- It writes `p_user_id` into each inserted execution.

### Required work

- [x] Inspect the creation route and validation helper.
- [x] Inspect the live RPC definition and execution grants.
- [ ] Finish auditing the manual edit and delete API routes.
- [ ] Ensure every privileged write path checks account authorization before invoking privileged functions.
- [ ] Continue deriving user identity from the validated session, not from an untrusted request-body user ID.
- [ ] Preserve the atomic creation and replacement mechanisms.

## 6.7 Remaining API Inventory

Current route inventory:

- `app/api/ai/trade-summary/route.ts`
- `app/api/broker-connections/[brokerId]/token/route.ts`
- `app/api/cron/sync-brokers/route.ts`
- `app/api/fx-rates/route.ts`
- `app/api/ibkr/flex/route.ts`
- `app/api/sync-all-brokers/route.ts`
- `app/api/test-sync/route.ts`
- `app/api/trades/create/route.ts`
- `app/api/trades/delete/route.ts`
- `app/api/trades/edit/route.ts`

### Required work

- [x] Inventory the current `app/api` route handlers.
- [x] Review broker token retrieval.
- [x] Review user-triggered broker sync.
- [x] Review scheduled-sync helper structure.
- [x] Review manual trade creation and its RPC.
- [ ] Review `app/api/trades/edit/route.ts`.
- [ ] Review `app/api/trades/delete/route.ts`.
- [ ] Review `app/api/ai/trade-summary/route.ts`.
- [ ] Review `app/api/fx-rates/route.ts` and confirm whether it has private-data or authorization implications.
- [ ] Apply consistent authentication and account-authorization requirements to applicable endpoints.
- [ ] Preserve the explicit decision to defer the legacy IBKR Flex route until it is reconsidered separately.

## Phase 4 completion criteria

- [ ] New users cannot obtain access merely by registering.
- [ ] Pending users cannot access protected product features.
- [ ] Approval and administrator privileges cannot be self-assigned.
- [ ] Read-only users cannot mutate data through APIs or direct Supabase requests.
- [ ] Suspended users cannot continue protected operations through existing sessions.
- [ ] Existing approved users retain intended access.
- [ ] Password reset and update-password flows still work.
- [ ] User-owned database and Storage protections remain intact.
- [ ] Broker sync follows account-eligibility rules for both manual and scheduled operation.
- [ ] All privileged RPC paths are protected by trusted authorization checks.

**Current status:** In discovery/design. Approval enforcement has not been implemented.

---

# 7. PHASE 5 — ACCOUNT DELETION READINESS

Account deletion must be a separate, server-authorized process. Suspension, subscription expiration, or entitlement changes must never trigger permanent deletion automatically.

The previous audit recorded the following facts, which must be revalidated before implementing deletion:

- `profiles.id` references `auth.users.id` without `ON DELETE CASCADE`.
- A profile-creation trigger exists.
- No custom Auth-user deletion trigger was identified in the previous audit.
- Some application tables, including `executions`, `expenses`, and `daily_notes`, were not shown as directly referencing `auth.users`.
- The earlier Storage inventory recorded three objects in `note-attachments` and five in `receipts`. These counts are historical and must be rechecked.

## 7.1 Confirm the Actual Auth Deletion Error

- [ ] Capture the exact Supabase Auth/Admin deletion error.
- [ ] Determine the current code path used for deletion.
- [ ] Verify whether `profiles_id_fkey` is the actual blocker.
- [ ] Do not manually delete a profile merely to test the hypothesis.

## 7.2 Design Database Cleanup

- [ ] Inventory every user-owned table.
- [ ] Determine each table's intended deletion behavior.
- [ ] Recheck foreign-key and cascade behavior.
- [ ] Define a server-only account-deletion procedure.
- [ ] Ensure the client cannot provide an arbitrary user ID to delete another account.
- [ ] Define retry and partial-failure recovery.
- [ ] Preserve appropriate audit records for privileged administrative actions.

## 7.3 Private Storage Cleanup

Current buckets observed:

- `note-attachments`
- `receipts`

The live Storage audit confirmed:

- `note-attachments` is private.
- It has a 3 MB file-size limit.
- Its configured MIME types are PNG, JPEG, and WebP.
- Upload, read, and delete policies restrict objects to a folder prefixed by the authenticated user's UUID.
- The current attachment uploader uses the path convention `user_id/note_id/attachment_id.extension`.

Required work:

- [ ] Recheck current object counts and paths.
- [ ] Use supported Supabase Storage APIs for listing and deletion.
- [ ] Restrict cleanup to the exact user's UUID folder.
- [ ] Handle pagination and partial failures.
- [ ] Never delete `storage.objects` rows directly as a substitute for Storage API cleanup.
- [ ] Test deletion with a disposable account.
- [ ] Verify another user's files remain untouched.

## 7.4 Delete User Modal Release Gate

- [ ] Complete the deletion backend first.
- [ ] Test against a disposable account.
- [ ] Verify intended rows and files are removed.
- [ ] Verify other users' data remains untouched.
- [ ] Require deliberate UI confirmation.
- [ ] Provide safe progress and error handling.
- [ ] Keep privileged deletion capabilities on the server.

**Current status:** Not implemented; existing deletion-error and cleanup assumptions require verification.

---

# 8. RELEASE GATES

## Before expanding production beta access

- [x] Manual-edit RPC source-type protection implemented.
- [x] Broker replacement excludes manual executions.
- [ ] Complete the populated mixed manual/broker replacement test.
- [DEFERRED] Direct execution deletion refactor.
- [DEFERRED] Database least-privilege corrections.
- [RISK] Resolve the legacy unauthenticated IBKR Flex endpoint.
- [x] Test-sync endpoint requires the configured cron secret.
- [x] Cron endpoint explicitly fails closed when the secret is missing.
- [~] Verify production secret configuration and authorized scheduled behavior.
- [~] Sanitize targeted execution-storage and broker-request logging.
- [ ] Complete the remaining API authorization review.
- [ ] Implement server-side signup approval enforcement.
- [ ] Prevent direct write paths from bypassing approval/read-only restrictions.
- [ ] Verify access behavior for existing and newly registered users.

## Before invite-only signup is considered production-ready

- [ ] Signup communicates invite-only status.
- [ ] Email verification requirements are defined and enforced.
- [ ] New users remain pending until authorized approval.
- [ ] Existing users are handled through an explicit migration plan.
- [ ] Pending users cannot access protected product features.
- [ ] Administrative approval is authorized and audited.
- [ ] Backend authorization enforces approval.
- [ ] Read-only and suspended states are enforced server-side.
- [ ] Broker synchronization follows account-eligibility rules.

## Before the Delete User modal can delete real accounts

- [ ] Actual Auth deletion error confirmed.
- [ ] Profile foreign-key behavior verified.
- [ ] Database cleanup covers all owned data.
- [ ] Private Storage cleanup implemented.
- [ ] Disposable-account end-to-end deletion test passes.
- [ ] Other users' data remains untouched.
- [ ] Partial-failure and retry behavior tested.
- [ ] Server-side account-deletion authorization verified.

The signup and Delete User modals may be designed separately, but they must not be enabled for production use before their respective backend release gates pass.

---

# 9. TESTING AND NON-REGRESSION REQUIREMENTS

## Execution integrity

- [x] Manual-edit migration applied.
- [x] Broker-replacement migration applied.
- [x] Existing manual-edit workflow tested using a disposable test trade.
- [~] Project build passed during this remediation.
- [ ] Manual edit cannot delete broker-imported executions.
- [ ] Cross-user isolation tested for privileged manual-edit operations.
- [ ] Invalid replacement rollback tested.
- [ ] Populated mixed manual/broker replacement tested.
- [DEFERRED] Direct manual-delete workflow refactor remains postponed.

## Endpoint security

- [x] Cron rejects unauthenticated local requests.
- [x] Test-sync rejects unauthenticated local requests.
- [x] Cron and test-sync explicitly reject missing-secret configuration in code.
- [ ] Verify missing-secret behavior in a controlled environment.
- [ ] Verify production secret configuration.
- [ ] Review manual trade edit and delete routes.
- [ ] Review AI trade-summary authorization.
- [ ] Review applicable FX endpoint behavior.
- [RISK] Legacy IBKR Flex endpoint remains unresolved.

## Authorization and data isolation

- [x] Confirm RLS is enabled on the 14 public tables returned by the audit.
- [x] Inspect current ownership policies.
- [x] Inspect the profile trigger and schema.
- [x] Inspect private note-attachment bucket configuration and policies.
- [ ] Implement and test approval enforcement.
- [ ] Test direct Supabase writes under pending/read-only/suspended states.
- [ ] Test cross-user data isolation.
- [ ] Test password reset and update-password flows after authorization changes.
- [ ] Test session behavior after suspension or approval revocation.
- [ ] Preserve existing user-owned data.

## Broker synchronization

- [x] Review user-scoped manual synchronization.
- [x] Review global scheduled synchronization.
- [ ] Enforce account-eligibility rules for scheduled synchronization.
- [ ] Verify rejected account states cannot invoke prohibited sync operations.
- [ ] Preserve rate-limit delays and the existing multi-account model.

## Account deletion

- [ ] Test the backend with a disposable user.
- [ ] Verify database cleanup and Storage cleanup.
- [ ] Verify unrelated users remain untouched.
- [ ] Test partial-failure and retry behavior.

## Final validation

- [ ] Run `npm run build`.
- [ ] Inspect the final `git diff`.
- [ ] Confirm only intended files are included.
- [ ] Preserve unrelated documentation and local changes.
- [ ] Record commit hashes and deployment/test evidence.

---

# 10. PROTECTED ARCHITECTURE — DO NOT REDESIGN AS PART OF THIS WORK

Preserve:

- Canonical `public.executions` ledger.
- Deterministic FIFO reconstruction.
- Existing `pairTrades()` behavior.
- Existing P&L and analytics calculations.
- Existing manual-execution lifecycle semantics.
- Existing atomic transaction boundaries.
- Existing note/editor data model unless a separately reviewed change requires otherwise.
- Existing password recovery and password update functionality.
- Existing user-owned data and Storage objects.
- Existing broker multi-account model.
- Existing manual trade workflow while authorization is being introduced.

Additional rules:

- Subscription status or access expiration must never trigger automatic account deletion.
- UI-only checks must never be treated as the final security boundary.
- Never expose the Supabase service-role key to browser code.
- Privileged server operations must not trust user IDs supplied by untrusted clients.
- Do not revoke database privileges blindly.
- Do not make destructive database changes without a reviewed, version-controlled migration and a test/recovery plan.
- Do not clear existing browser storage as a shortcut for resolving account separation.

---

# 11. CURRENT STATUS SUMMARY

## Phase 0 — Safe checkpoint and migration workflow

**Status:** Partially complete.

- Migration workflow established.
- Two execution-integrity migrations added and applied.
- Git and documentation checkpoints used.
- Verify current repository state before the next changes.

## Phase 1 — Execution data integrity

**Status:** Partially complete.

- Manual-edit RPC protection implemented and deployed.
- Broker replacement protection implemented and deployed.
- Additional automated and populated mixed-data tests remain.
- Direct deletion refactor deliberately deferred.

## Phase 2 — Database least privilege

**Status:** Audited; corrections deferred.

- RLS and ownership policies inspected.
- Excessive privilege grants identified.
- No privilege-revocation migration applied during this work.

## Phase 3 — Endpoint hardening

**Status:** Partially complete.

- Cron/test-sync secret guards implemented.
- Selected sensitive logging sanitized.
- Production configuration and additional runtime validation remain.
- Legacy IBKR Flex route remains an unresolved security exception.
- The user's chosen logging/deletion deferrals remain in force.

## Phase 4 — Invite-only authorization

**Status:** Discovery/design.

- Existing signup, login, AuthProvider, ProtectedRoute, profile schema/trigger, and public-table RLS reviewed.
- Expense, manual-trade, notes, attachment, annotation, settings, broker-token, and sync paths reviewed.
- Manual trade creation and its privileged RPC reviewed.
- Remaining trade edit/delete and selected API reviews are outstanding.
- Approval enforcement has not been implemented.
- No approval schema migration has been applied.

## Phase 5 — Account deletion

**Status:** Not implemented.

- Previous foreign-key and Storage findings need revalidation.
- Exact Auth deletion error has not been established.
- Safe server-side cleanup is still required.

---

# 12. NEXT ACTION

When work resumes:

1. Inspect `app/api/trades/edit/route.ts`.
2. Inspect `app/api/trades/delete/route.ts`.
3. Inspect remaining relevant API routes, especially AI trade summary.
4. Finish the current authorization discovery pass without reopening deliberately deferred items.
5. Finalize the account/invitation model and status transitions.
6. Design trusted server-side and database enforcement.
7. Prepare reviewed migrations and staged implementation steps.
8. Implement invite-only authorization while preserving existing users and data.
9. Test approval, read-only, suspension, sync eligibility, and cross-user isolation.
10. Finish account-deletion design only after its release requirements are met.

Do not repeat the entire broad audit unless the code or database state has changed.

Do not apply production migrations until their SQL, impact, tests, and recovery plan have been reviewed.

**END OF UPDATED PRE-IMPLEMENTATION SECURITY CHECKLIST**