# ELITE X TRADING JOURNAL
# PRE-IMPLEMENTATION SECURITY CHECKLIST
## Before Invite-Only Signup and Delete User Modal

**Project:** Elite X Trading Journal / Elite X Trading OS
**Checklist Date:** October 24, 2026
**Status:** NOT STARTED
**Audit:** Read-only discovery completed
**Scope:** Security remediation, execution integrity, database permissions, and account-deletion readiness

============================================================
# 1. OBJECTIVE
============================================================

Complete the security and data-integrity work that should precede
the invite-only beta rollout and safe account-deletion functionality.

The objective is NOT to redesign Elite X or audit every feature again.

The objective is to ensure:

- Existing trading data remains protected.
- Broker synchronization cannot accidentally delete manual executions.
- Manual editing and deletion cannot target unintended executions.
- Database permissions follow least privilege.
- Legacy server endpoints are no longer unsafe release exceptions.
- Authentication and authorization can support invite-only approval.
- Account deletion can be implemented without orphaning data or files.
- Existing FIFO reconstruction, analytics, password recovery, and
  canonical execution architecture remain intact.

No task is considered complete until its implementation and relevant
tests have been verified.

============================================================
# 2. PHASE 0 — ESTABLISH A SAFE CHECKPOINT
# PRIORITY: REQUIRED BEFORE MAKING CHANGES
============================================================

[ ] 2.1 Confirm current repository state.

    Run:

    git status --short
    git branch --show-current
    git log -1 --oneline

    Record the current branch and commit.

[ ] 2.2 Preserve existing local changes.

    The October 24 audit identified an existing local modification:

    docs/ToolKit.md

    Do not overwrite, discard, or accidentally include this unrelated
    modification in security-fix commits.

[ ] 2.3 Inspect the latest versions of every file being changed.

    Use the current repository as the authority.
    Do not assume historical notes describe the exact current code.

[ ] 2.4 Establish database migration/version-control workflow.

    The local repository search did not find SQL migration files.

    Before modifying live database functions or privileges:
    - Determine the appropriate migration directory/workflow.
    - Save the current relevant SQL definitions as a checkpoint.
    - Prepare reviewed, version-controlled migrations.
    - Define validation and rollback/recovery steps.
    - Do not apply unreviewed SQL directly to production.

[ ] 2.5 Establish a testing approach.

    Determine how to test execution RPC behavior without risking
    real trading records.

    Use a suitable test environment or isolated test fixtures.
    Do not run destructive tests against production trading data.


============================================================
# 3. PHASE 1 — PROTECT CANONICAL EXECUTION DATA
# PRIORITY: P1 — BEFORE EXPANDING PRODUCTION BETA ACCESS
============================================================

Elite X architecture:

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

Do not redesign FIFO reconstruction as part of these fixes.

------------------------------------------------------------
3.1 FIX MANUAL EDIT RPC
------------------------------------------------------------

Affected database function:

    public.replace_manual_executions_atomically(...)

Confirmed finding:

The current function deletes existing records by execution ID or
contract key and user ID, but does not consistently require the
existing records to be manual executions.

Required work:

[ ] Inspect the current function definition and back it up.

[ ] Add a database-enforced MANUAL- lifecycle restriction to both
    execution-ID and contract-key deletion modes.

[ ] Ensure the existing target belongs to the intended user.

[ ] Validate the target before deleting anything.

[ ] Preserve the current partial-exit versus complete-lifecycle
    replacement semantics.

[ ] Keep the transaction atomic:
    failed replacement must leave the original executions intact.

[ ] Preserve the existing manual execution validation layer.

[ ] Test that a manual edit cannot delete a non-manual execution
    owned by the same user.

[ ] Test that one user's request cannot affect another user's data.

[ ] Test that invalid replacement data causes rollback.

[ ] Verify current production data and the resulting SQL definition
    before applying a migration.

Completion criteria:

A manual-edit request cannot use the manual-edit database function
to delete broker executions or another user's executions.

------------------------------------------------------------
3.2 FIX BROKER EXECUTION REPLACEMENT
------------------------------------------------------------

Affected database function:

    public.replace_broker_executions_atomically(...)

Confirmed finding:

The current DELETE condition matches user, account and execution date.
It does not explicitly exclude manual executions.

Current database evidence:

- One user/account pair contains manual and non-manual or
  unclassified executions.
- Four manual executions and 303 non-manual or unclassified
  executions exist in that shared account pair.
- No current user/account/date group containing both types
  was found.

No previous data loss was established.

Required work:

[ ] Inspect the current broker import/parser source identification.

[ ] Confirm how broker account values and MANUAL- contract keys
    are assigned in existing data.

[ ] Add an explicit, evidence-backed exclusion so broker replacement
    cannot delete manual executions.

[ ] Preserve correct user, account and date-window scoping.

[ ] Preserve atomic replacement behavior.

[ ] Test a scenario where manual and broker executions share the
    same user, account and date.

[ ] Confirm manual executions survive a broker refresh.

[ ] Confirm intended broker records are still replaced correctly.

[ ] Test failure and rollback behavior.

Completion criteria:

Broker sync cannot delete manual executions, including when those
executions share an account and date with imported broker records.

------------------------------------------------------------
3.3 STANDARDIZE DIRECT EXECUTION DELETION PATHS
------------------------------------------------------------

Affected components:

    components/dashboard/TradingCalendar.tsx
    components/trades/TradeDetailModal.tsx
    components/trades/TradesTable.tsx

Current finding:

These components contain direct DELETE operations against
public.executions instead of consistently using the atomic
server-side delete API.

The existing API is:

    POST /api/trades/delete

Required work:

[ ] Inspect the current delete button visibility and conditions.

[ ] Identify which deletion actions apply only to manual trades.

[ ] Route supported manual deletion actions through the existing
    authenticated atomic delete API.

[ ] Preserve partial-exit deletion by exact execution ID.

[ ] Preserve complete-lifecycle deletion by contract key.

[ ] Enforce the manual-only restriction in the API and database,
    not solely in the UI.

[ ] Ensure broker-imported executions cannot be deleted using
    manual deletion actions.

[ ] Ensure user ownership is checked server-side.

[ ] Confirm legitimate existing manual deletion workflows still work.

[ ] Verify FIFO reconstruction recalculates the resulting state
    without special quantity-restoration logic.

Completion criteria:

All supported manual deletion paths use consistent server-side
authorization and database-enforced target validation.


============================================================
# 4. PHASE 2 — DATABASE LEAST-PRIVILEGE REVIEW
# PRIORITY: P1 — BEFORE EXPANDING PRODUCTION BETA ACCESS
============================================================

Confirmed findings:

- RLS is enabled on all 14 public tables.
- Effective privilege checks showed TRUNCATE privileges for
  anon and authenticated across all 14 tables.
- RLS does not protect against TRUNCATE.
- The audit did not establish that ordinary Supabase REST requests
  can invoke TRUNCATE directly.

Required work:

[ ] Identify the source of existing table privileges, including
    explicit grants, PUBLIC grants and default privileges.

[ ] Inventory the privileges actually required by current app paths.

[ ] Identify unnecessary TRUNCATE privileges.

[ ] Review excessive TRIGGER, REFERENCES and anonymous DML grants.

[ ] Determine which operations require authenticated access,
    service-role access, or a different access boundary.

[ ] Prepare a least-privilege migration.

[ ] Ensure existing RLS ownership protections are preserved.

[ ] Do not revoke required privileges blindly.

[ ] Test existing trade, expense, note, attachment, profile and
    broker-connection operations after applying changes in a
    safe environment.

[ ] Confirm that privileged server functions continue to work.

Completion criteria:

Roles receive only the database privileges needed for their intended
application responsibilities, without breaking existing functionality.


============================================================
# 5. PHASE 3 — SERVER ENDPOINT HARDENING
# PRIORITY: P1 — BEFORE EXPANDING PRODUCTION BETA ACCESS
============================================================

------------------------------------------------------------
5.1 LEGACY IBKR FLEX ENDPOINT
------------------------------------------------------------

Affected file:

    app/api/ibkr/flex/route.ts

Confirmed findings:

- No visible request authentication.
- No user ownership filter.
- Uses a privileged Supabase client.
- Selects an active broker connection without scoping the query
  to an authenticated user.
- Returns full IBKR statement XML.
- Logs statement XML.
- No current application callers were found in the source search.

Historical context:

The September audit documented this as an unused legacy weakness
and recorded a decision not to change it at that time.

Required work:

[ ] Reconfirm there are no legitimate current callers.

[ ] Determine whether the endpoint can be retired, disabled,
    removed, or safely secured.

[ ] Make an explicit decision before changing the legacy route.

[ ] Do not treat the endpoint as an approved secure API while
    it remains unauthenticated.

[ ] Remove full XML responses/logging if the endpoint is retained.

Completion criteria:

The endpoint is no longer an unresolved unauthenticated
production security exception.

------------------------------------------------------------
5.2 LEGACY TEST-SYNC ENDPOINT
------------------------------------------------------------

Affected file:

    app/api/test-sync/route.ts

Historical finding:

The September audit documented this as an unauthenticated test
endpoint that invokes global broker synchronization.

The complete current implementation was not re-inspected during
the October audit.

Required work:

[ ] Inspect the current endpoint implementation.

[ ] Verify whether it has legitimate callers.

[ ] Determine whether it can trigger all-user broker synchronization.

[ ] Secure, disable or remove it through a deliberate decision.

[ ] Ensure test routes cannot bypass the production cron security
    boundary.

Completion criteria:

No unauthenticated test endpoint can trigger privileged global sync.

------------------------------------------------------------
5.3 CRON SECRET MUST FAIL CLOSED
------------------------------------------------------------

Affected file:

    app/api/cron/sync-brokers/route.ts

Confirmed conditional issue:

The route interpolates CRON_SECRET into the expected bearer header.
If the environment variable is undefined, the expected value may
be the literal string:

    Bearer undefined

Production configuration has not been verified.

Required work:

[ ] Explicitly reject requests if CRON_SECRET is missing or empty.

[ ] Compare the provided authorization header with the configured
    secret only after confirming the secret exists.

[ ] Verify Vercel environment configuration without printing or
    sharing the secret value.

[ ] Confirm unauthorized requests do not trigger global sync.

[ ] Preserve the intended scheduled sync behavior for all users.

Completion criteria:

Cron authentication fails closed and cannot be bypassed by
missing-secret configuration.

------------------------------------------------------------
5.4 SANITIZE SENSITIVE LOGGING
------------------------------------------------------------

Review the following areas:

    app/api/ibkr/flex/route.ts
    lib/server/brokers/ibkr/fetchFlexStatement.ts
    lib/server/brokers/ibkr/fetchFlex.ts
    lib/storage/supabaseExecutionStorage.ts
    components/trades/TradeDetailModal.tsx

Required work:

[ ] Remove raw broker statement XML from production logs.

[ ] Avoid logging full execution objects on persistence failures.

[ ] Avoid logging full trade objects where a sanitized execution
    identifier or error code is sufficient.

[ ] Retain useful diagnostic context, such as operation, safe
    error code, record count and request correlation ID.

Completion criteria:

Production diagnostics remain useful without unnecessarily logging
broker statements, credentials or detailed trading records.


============================================================
# 6. PHASE 4 — VERIFY THE AUTHORIZATION FOUNDATION
# PRIORITY: REQUIRED BEFORE INVITE-ONLY PRODUCTION RELEASE
============================================================

Current state from the audit:

- Supabase Auth is already integrated.
- The current route guard checks session existence.
- Signup has no visible invitation/approval gate.
- Login redirects an authenticated user to /dashboard.
- No application approval or entitlement resolver was found
  in the inspected files.
- public.profiles currently stores only id and display_name.
- All six existing users are email-verified.
- The six existing users have matching profile rows.

This phase is the final prerequisite for the invite-only rollout.
It should be implemented after the critical security changes have
been designed and tested.

[ ] Reinspect current signup/login/auth-provider/route-guard code.

[ ] Preserve existing password-reset and update-password flows.

[ ] Design account approval independently of entitlement.

[ ] Design administrative privileges independently of plan level.

[ ] Design suspension/read-only restrictions independently of
    approval and underlying grants.

[ ] Define how the six existing verified accounts remain approved
    or are explicitly transitioned.

[ ] Require new users to remain pending until the server-side
    approval process authorizes access.

[ ] Ensure login and protected routes account for application
    approval status, not just valid Auth session.

[ ] Design the server authorization contract and machine-readable
    401/403 responses.

[ ] Ensure direct Supabase write paths cannot bypass approval and
    read-only restrictions.

Completion criteria:

The backend can distinguish unauthenticated, unverified, pending,
approved, read-only and suspended users without mixing those states
into one overloaded role field.


============================================================
# 7. PHASE 5 — ACCOUNT DELETION READINESS
# PRIORITY: REQUIRED BEFORE CONNECTING THE DELETE USER MODAL
============================================================

------------------------------------------------------------
7.1 CONFIRM THE ACTUAL AUTH DELETION ERROR
------------------------------------------------------------

Known facts:

- public.profiles.id references auth.users.id without ON DELETE CASCADE.
- All six Auth users have matching profiles.
- The profile creation trigger inserts a profile for a new Auth user.
- No custom Auth-user deletion trigger was identified.
- The exact deletion error has not yet been captured.

Required work:

[ ] Capture the exact Supabase Auth/Admin user deletion error.

[ ] Determine where the deletion is being attempted:
    dashboard, API, or another supported path.

[ ] Inspect relevant logs for a controlled test attempt.

[ ] Confirm whether profiles_id_fkey is the actual blocker.

[ ] Do not manually delete a profile to test the hypothesis.

Completion criteria:

The actual cause of the account deletion failure is established
before changing foreign keys or deletion order.

------------------------------------------------------------
7.2 DESIGN ACCOUNT DATA CLEANUP
------------------------------------------------------------

Tables requiring explicit attention because the current foreign-key
inventory did not show a reference to auth.users:

    public.executions
    public.expenses
    public.daily_notes

Other application tables have Auth-user cascade constraints.
Nested note tables also have parent-note/attachment cascades.

Required work:

[ ] Inventory all current user-owned tables.

[ ] Decide the correct handling of each table on account deletion.

[ ] Evaluate the profile foreign-key behavior.

[ ] Define a server-only account deletion procedure.

[ ] Ensure a user ID cannot be supplied by an untrusted client
    to delete another user's account.

[ ] Separate access suspension/expiration from permanent deletion.

[ ] Define retry and recovery behavior for partial failures.

[ ] Preserve appropriate audit records for privileged actions.

Completion criteria:

The delete procedure covers every owned database resource and
does not depend on accidental cascade behavior.

------------------------------------------------------------
7.3 PRIVATE STORAGE CLEANUP
------------------------------------------------------------

Current buckets:

    note-attachments
    receipts

Current object counts:

    note-attachments = 3
    receipts = 5

All eight current objects have a folder prefix matching an
existing Auth user's UUID.

Required work:

[ ] Use Supabase Storage APIs to list and delete objects.

[ ] Scope object deletion to the exact user's UUID folder.

[ ] Handle pagination and partial failures.

[ ] Do not delete storage.objects rows directly as a substitute
    for supported Storage API deletion.

[ ] Ensure another user's objects cannot be deleted.

[ ] Test the complete sequence using a disposable account.

[ ] Verify Auth deletion succeeds and no intended owned resources
    remain after completion.

Completion criteria:

User-owned database rows and private Storage objects are cleaned
up safely, with tested failure handling.

------------------------------------------------------------
7.4 DELETE USER MODAL RELEASE GATE
------------------------------------------------------------

[ ] Build the backend deletion procedure first.

[ ] Test it against a disposable account.

[ ] Verify all intended rows and files are removed.

[ ] Verify another user's data remains untouched.

[ ] Require deliberate confirmation in the UI.

[ ] Provide safe progress and error handling.

[ ] Do not expose privileged deletion capabilities to the browser.

Completion criteria:

The Delete User modal is connected only to a tested,
authorized server-side deletion service.


============================================================
# 8. RELEASE GATES — WHAT MUST BE DONE WHEN?
============================================================

BEFORE EXPANDING PRODUCTION BETA ACCESS:

[ ] Manual-edit RPC source-type protection fixed.
[ ] Broker replacement preserves manual executions.
[ ] Active manual-delete paths use the approved server API.
[ ] Excessive database grants corrected and tested.
[ ] Legacy IBKR Flex endpoint secured, disabled or retired.
[ ] Legacy test-sync endpoint reviewed and secured/disabled.
[ ] Cron secret guard fails closed.
[ ] Sensitive production logs sanitized.
[ ] Server-side signup approval enforcement implemented.
[ ] Direct write paths cannot bypass approval or read-only rules.
[ ] Access behavior tested for existing and new users.

BEFORE INVITE-ONLY SIGNUP IS CONSIDERED PRODUCTION-READY:

[ ] Signup communicates invite-only status.
[ ] Email verification requirement is enforced.
[ ] New users remain pending until approved.
[ ] Existing verified users are handled through an explicit
    migration strategy.
[ ] Pending users cannot access protected product features.
[ ] Admin approval is authorized and audited.
[ ] Backend—not merely React UI—enforces the approval gate.

BEFORE THE DELETE USER MODAL CAN DELETE REAL ACCOUNTS:

[ ] Actual Auth deletion error confirmed.
[ ] Profile foreign-key behavior resolved.
[ ] Database cleanup procedure covers all owned data.
[ ] Private Storage cleanup is implemented and tested.
[ ] Disposable-account end-to-end deletion test passes.
[ ] Other users' records and files remain untouched.
[ ] Partial-failure and retry behavior are tested.
[ ] Server-side account-deletion authorization is verified.

The signup modal's visual design can be developed in parallel.
It must not be enabled in production before its approval gate works.

The Delete User modal can be designed in parallel.
It must not perform real deletions before the deletion backend is safe.


============================================================
# 9. TESTING AND NON-REGRESSION REQUIREMENTS
============================================================

[ ] Existing Manual Entry works.

[ ] Existing Manual Edit works.

[ ] Partial-exit editing changes only the intended execution.

[ ] Complete-lifecycle editing remains atomic.

[ ] Manual deletion works through the server API.

[ ] Broker execution replacement remains correct.

[ ] Mixed manual/broker account-date test preserves manual rows.

[ ] RLS still protects cross-user data isolation.

[ ] Direct Supabase writes obey the intended authorization model.

[ ] Read-only users cannot write through either APIs or direct
    Supabase mutations.

[ ] Broker connections and sync operations obey entitlement rules.

[ ] Scheduled sync remains authorized.

[ ] Missing CRON_SECRET denies access.

[ ] Legacy/test endpoints do not expose privileged functionality.

[ ] Password reset and update-password flows still work.

[ ] Existing user sessions and approved access transition correctly.

[ ] Account deletion is tested using a disposable user.

[ ] Production build passes after implementation.

[ ] Final git diff contains only intended changes.

[ ] docs/ToolKit.md remains untouched unless explicitly requested.


============================================================
# 10. PROTECTED ARCHITECTURE — DO NOT REDESIGN AS PART OF THIS WORK
============================================================

Preserve:

- Canonical public.executions ledger.
- Deterministic FIFO reconstruction.
- Existing pairTrades() behavior.
- Existing P&L and analytics calculations.
- Existing manual execution lifecycle semantics.
- Existing atomic transaction boundaries.
- Existing note/editor data model unless a separate issue requires
  a reviewed change.
- Existing password recovery functionality.
- Existing user-owned data and Storage objects.
- Existing broker multi-account model.

Subscription status or access expiration must never trigger automatic
account deletion.

Never use UI-only checks as the final security boundary.

Never expose the Supabase service-role key to browser code.

Never make destructive database changes without a reviewed,
version-controlled migration and a test/recovery plan.


============================================================
# 11. CURRENT STATUS
============================================================

Phase 0 — Safe checkpoint:
    NOT STARTED

Phase 1 — Execution data-integrity remediation:
    NOT STARTED

Phase 2 — Least-privilege database correction:
    NOT STARTED

Phase 3 — Server endpoint hardening:
    NOT STARTED

Phase 4 — Invite-only authorization foundation:
    NOT STARTED

Phase 5 — Account deletion readiness:
    NOT STARTED

Code changes:
    NONE

Database changes:
    NONE

Trading data changes:
    NONE

Audit mode:
    READ-ONLY DISCOVERY COMPLETED FOR THE AREAS DOCUMENTED ABOVE


============================================================
# 12. NEXT ACTION
============================================================

When work resumes:

1. Read this checklist and the security audit master notes.
2. Inspect current git status and preserve unrelated local changes.
3. Start with Phase 0.
4. Prepare the exact execution RPC and direct-delete remediation.
5. Review the database privilege correction as a separate migration.
6. Verify the legacy endpoint and cron protections.
7. Implement the invite-only approval foundation.
8. Complete and test the account-deletion backend before connecting
   the Delete User modal.

Do not repeat the entire broad audit unless the code or database
state has changed.

Do not begin applying production migrations until their SQL,
impact, tests and recovery plan have been reviewed.

END OF PRE-IMPLEMENTATION SECURITY CHECKLIST