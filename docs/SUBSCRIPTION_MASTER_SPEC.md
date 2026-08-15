# ELITE X TRADING
# SUBSCRIPTION & ENTITLEMENT SYSTEM
# MASTER ARCHITECTURE & PRODUCT SPECIFICATION

Version: 1.0
Status: APPROVED FOR IMPLEMENTATION
Purpose: Source of truth for the Elite X subscription, billing, entitlement,
         quota, access-control, trial, admin, and read-only architecture.

======================================================================
0. MASTER PRINCIPLE
======================================================================

Elite X is a subscription-based SaaS trading journal.

The subscription system controls ACCESS TO FEATURES.

It must NEVER control the existence of the user's canonical trading data.

CORE RULE:

    Subscription changes modify ACCESS.
    Subscription changes NEVER DELETE USER DATA.

This applies to:

    - Trial expiration
    - Payment failure
    - Cancellation
    - Downgrade
    - Upgrade
    - Access-grant expiration
    - Access-code expiration
    - Plan changes
    - Read-only transitions

Canonical user data remains intact unless the USER explicitly performs
a valid data-deletion operation.

======================================================================
1. PRODUCT VISION
======================================================================

Elite X should feel like a premium, institutional-grade trading journal.

The subscription system must therefore be:

    - Simple
    - Predictable
    - Secure
    - Scalable
    - Easy to understand
    - Data-safe
    - Server-enforced
    - Maintainable
    - Extensible

DO NOT build an unnecessarily complicated SaaS billing system.

The V1 philosophy is:

    ONE USER
    ONE ACCOUNT
    ONE EFFECTIVE ACCESS STATE
    ONE PLAN AT A TIME
    SIMPLE LIMITS
    CENTRALIZED ENTITLEMENTS

======================================================================
2. USER / ACCOUNT MODEL
======================================================================

Each user has one Elite X account.

Identity is based on:

    auth.users.id

The user's UUID is the permanent identity.

The user may change their email without creating a new Elite X identity.

One user maps to:

    ONE Elite X account
    ONE Stripe customer

The system must not create duplicate customer/account identities
because of email changes.

======================================================================
3. EMAIL VERIFICATION
======================================================================

Email verification is REQUIRED.

A user must verify their email before receiving normal application
access/trial functionality.

Email verification is also required for:

    - Access-code redemption
    - Trial activation
    - Normal write access

Unverified users should remain restricted to the authentication/
verification flow.

======================================================================
4. SUBSCRIPTION PLANS
======================================================================

Elite X has THREE paid plans:

    BASIC
    PRO
    ELITE

There is also:

    TRIAL
    READ_ONLY

IMPORTANT:

    TRIAL is a temporary entitlement state.
    READ_ONLY is an access state, NOT a subscription plan.

======================================================================
5. BASIC PLAN
======================================================================

Purpose:

    Basic is the inexpensive manual trading-journal tier.

Positioning:

    "A simple Excel replacement for traders who want a proper journal."

Target price:

    $4.99/month

Basic includes:

    - Manual trade journal
    - Manual expense tracking
    - Manual notes
    - Trade history
    - Analytics
    - Dashboard
    - Calendar
    - Historical data access
    - Exports

Basic does NOT include:

    - IBKR integration
    - Scheduled IBKR sync
    - Manual Sync Now
    - Automated broker synchronization

Basic must feel like a complete manual product.

It should NOT feel like a broken version of Elite.

IMPORTANT:

    Trial limits of 20 trades / 20 expenses / 20 notes are TRIAL limits.
    They must NOT automatically become Basic limits.

Basic's own limits can be defined separately later.

======================================================================
6. PRO PLAN
======================================================================

Purpose:

    Automated trading journal.

Pro includes everything in Basic PLUS:

    - IBKR integration
    - Scheduled IBKR synchronization
    - Up to 2 IBKR accounts

Pro does NOT include:

    - User-triggered "Sync Now"

The key Pro value proposition:

    "Your journal automatically stays updated."

Scheduled synchronization is allowed.

Manual synchronization is an Elite-only capability.

======================================================================
7. ELITE PLAN
======================================================================

Elite is the complete Elite X experience.

Elite includes:

    - Everything in Basic
    - Everything in Pro
    - IBKR integration
    - Scheduled IBKR synchronization
    - Manual "Sync Now"
    - Unlimited IBKR accounts
    - Full feature access

Elite is the highest normal paid entitlement.

======================================================================
8. PLAN COMPARISON
======================================================================

                    BASIC        PRO             ELITE
----------------------------------------------------------------------
Manual Journal       YES         YES             YES
Expenses             YES         YES             YES
Notes                YES         YES             YES
Analytics            YES         YES             YES
Trade History        YES         YES             YES
Calendar             YES         YES             YES
Exports              YES         YES             YES

IBKR Integration     NO          YES             YES
Scheduled Sync       NO          YES             YES
Sync Now             NO          NO              YES
IBKR Accounts        N/A         2               UNLIMITED

======================================================================
9. TRIAL
======================================================================

Every new verified user receives:

    14-DAY ELITE TRIAL

The trial provides:

    ELITE CAPABILITIES

with simplified trial limits.

Trial limits:

    Trades:        20
    Expenses:      20
    Notes:         20
    IBKR Accounts: 1

Trial capabilities:

    - Manual entries
    - Trade viewing
    - Analytics
    - Expenses
    - Notes
    - IBKR integration
    - Scheduled IBKR sync
    - Sync Now

Trial should feel like:

    "Try Elite."

NOT:

    "Use a crippled demo."

======================================================================
10. TRIAL START
======================================================================

Trial starts AFTER successful email verification.

Unverified account:

    NO normal trial access.

Verified account:

    Trial starts.

Recommended conceptual fields:

    trial_started_at
    trial_ends_at
    trial_status

The trial must be deterministic.

Do not extend the trial simply because a user logs in late.

======================================================================
11. TRIAL QUOTA SEMANTICS
======================================================================

Trial quotas represent CONSUMPTION.

They do NOT represent current record count.

Example:

    User creates 20 trades.
    User deletes 15 trades.

Current trades:

    5

Trial consumption:

    20 / 20

The user CANNOT create another trial trade.

Deleting records does NOT restore quota.

This prevents quota bypass.

======================================================================
12. TRIAL QUOTA TRANSACTION RULE
======================================================================

Quota must be checked server-side.

Example:

    Current usage:
        18 / 20 trades

    User imports:
        5 new trades

Required result:

    18 + 5 = 23

Therefore:

    REJECT ENTIRE OPERATION

Do NOT create:

    2 trades successfully
    3 trades unsuccessfully

No partial operation.

The transaction must fail atomically.

Failed transactions do NOT consume quota.

======================================================================
13. TRIAL EXPIRATION
======================================================================

When the 14-day trial expires:

    TRIAL
       ↓
    READ_ONLY

No data is deleted.

The user can still:

    - View trades
    - View expenses
    - View notes
    - View analytics
    - Search
    - Filter
    - Review history
    - Export

The user cannot:

    - Create
    - Edit
    - Delete
    - Import
    - Sync

The UI should clearly communicate:

    "Your Elite trial has ended.
     Your data is safe.
     Your account is now read-only."

Provide:

    [ Choose a Plan ]

======================================================================
14. READ-ONLY ACCESS
======================================================================

READ_ONLY is an access state, not a plan.

A read-only user retains access to historical information.

READ:

    YES

WRITE:

    NO

SYNC:

    NO

The user can continue getting value from Elite X even without an
active subscription.

This protects the user's trust and prevents the subscription system
from appearing destructive.

======================================================================
15. READ-ONLY CAPABILITIES
======================================================================

READ_ONLY users can:

    - View trades
    - View executions where appropriate
    - View expenses
    - View notes
    - View analytics
    - View dashboard
    - View calendar
    - Search
    - Filter
    - Export historical information

READ_ONLY users cannot:

    - Create trades
    - Edit trades
    - Delete trades
    - Create expenses
    - Edit expenses
    - Delete expenses
    - Create notes
    - Edit notes
    - Delete notes
    - Import data
    - Sync IBKR
    - Connect new IBKR accounts

======================================================================
16. BILLING AUTHORITY
======================================================================

Stripe is the BILLING AUTHORITY.

Elite X/Supabase is the APPLICATION ENTITLEMENT AUTHORITY.

Architecture:

    Stripe
       ↓
    Stripe Webhook
       ↓
    Elite X Server
       ↓
    Subscription State
       ↓
    Entitlement Resolver
       ↓
    Application Access

The browser is NEVER trusted to determine payment state.

A successful frontend checkout redirect does NOT independently grant
access.

Access changes only after trusted server-side billing confirmation.

======================================================================
17. STRIPE CUSTOMER MODEL
======================================================================

One Elite X user:

    ONE Stripe customer

Recommended mapping:

    profiles.user_id
        ↕
    subscriptions.user_id
        ↕
    Stripe customer ID

The mapping must remain stable.

Changing an email must NOT create a second Stripe customer.

======================================================================
18. SUBSCRIPTION RECORD
======================================================================

Conceptual table:

    subscriptions

Fields:

    id
    user_id
    stripe_customer_id
    stripe_subscription_id
    plan
    status
    current_period_start
    current_period_end
    cancel_at_period_end
    scheduled_plan
    scheduled_change_at
    created_at
    updated_at

Constraint:

    ONE current subscription relationship per user.

user_id should be unique where appropriate.

======================================================================
19. STRIPE WEBHOOKS
======================================================================

Stripe webhooks are the trusted billing-state synchronization mechanism.

Relevant events may include:

    - Checkout completion
    - Subscription creation
    - Subscription update
    - Subscription cancellation
    - Payment success
    - Payment failure
    - Subscription deletion

Exact Stripe event list can be finalized during implementation.

Webhook processing MUST be idempotent.

Duplicate Stripe webhook delivery must NOT:

    - Create duplicate subscriptions
    - Create duplicate grants
    - Corrupt billing state
    - Trigger duplicate entitlement transitions

Recommended:

    stripe_webhook_events

with a unique Stripe event ID.

======================================================================
20. UPGRADE RULE
======================================================================

UPGRADES ARE IMMEDIATE.

Examples:

    Basic → Pro
    Basic → Elite
    Pro → Elite

Once Stripe confirms the upgrade:

    NEW PLAN BECOMES EFFECTIVE IMMEDIATELY.

Do not wait for the existing billing period to end.

======================================================================
21. DOWNGRADE RULE
======================================================================

DOWNGRADES OCCUR AT THE END OF THE CURRENT BILLING PERIOD.

Examples:

    Elite → Pro
    Elite → Basic
    Pro → Basic

Before period end:

    Current plan remains active.

At period end:

    Scheduled plan becomes effective.

Example:

    Current plan:
        Elite

    User requests:
        Pro

    Current period ends:
        September 14

    Until September 14:
        Effective plan = Elite

    September 14:
        Effective plan = Pro

======================================================================
22. CANCELLATION
======================================================================

Cancellation is treated as:

    cancel_at_period_end = true

The user retains their current plan until the end of the paid period.

After the period ends:

    No active entitlement
        ↓
    READ_ONLY

No data is deleted.

======================================================================
23. PAYMENT FAILURE
======================================================================

NO GRACE PERIOD.

If payment fails and Stripe confirms the subscription is no longer
active:

    PAID PLAN
       ↓
    READ_ONLY

The user immediately loses write/sync access.

The user retains historical read access.

UI:

    "Subscription payment failed.

     Your account is currently read-only.
     Your data has not been deleted."

Provide:

    [ Update Payment Method ]

======================================================================
24. PAYMENT RECOVERY
======================================================================

If payment is successfully recovered:

    READ_ONLY
       ↓
    PREVIOUS ACTIVE PAID PLAN

No new trial.

No new account.

No data migration.

Access simply becomes active again.

======================================================================
25. DATA PRESERVATION
======================================================================

THIS IS A HARD ARCHITECTURAL INVARIANT.

Entitlement changes MUST NEVER delete:

    - Trades
    - Executions
    - Expenses
    - Notes
    - Broker connections
    - Historical analytics data
    - User profile information

Examples:

    Trial expires
        → no deletion

    Payment fails
        → no deletion

    Elite → Pro
        → no deletion

    Pro → Basic
        → no deletion

    Grant expires
        → no deletion

    Access code expires
        → no deletion

Only explicit valid user/admin data-deletion functionality may delete
data.

======================================================================
26. DOWNGRADE WITH EXCESS IBKR ACCOUNTS
======================================================================

Example:

    Elite
    5 IBKR accounts

User downgrades to Pro.

Pro allows:

    2 active accounts

DO NOT delete accounts 3-5.

Instead:

    Account 1 → ACTIVE
    Account 2 → ACTIVE
    Account 3 → INACTIVE
    Account 4 → INACTIVE
    Account 5 → INACTIVE

User can choose which accounts remain active.

The inactive account configurations remain stored.

This preserves data and makes re-upgrade seamless.

======================================================================
27. BASIC WITH EXISTING IBKR DATA
======================================================================

If a user moves:

    Pro → Basic

IBKR functionality becomes unavailable.

However:

    Existing IBKR-derived trades remain visible.

Existing execution/trading history remains intact.

Existing broker connection records are not deleted.

IBKR synchronization stops.

======================================================================
28. PRO WITH EXCESS IBKR ACCOUNTS
======================================================================

If user has:

    5 accounts

and moves:

    Elite → Pro

only 2 accounts may be ACTIVE for Pro.

Remaining accounts:

    RETAINED
    INACTIVE
    NOT DELETED

The user may select which two remain active.

======================================================================
29. ENTITLEMENT SOURCES
======================================================================

Effective access can originate from:

    1. Active admin/owner grant
    2. Active paid subscription
    3. Active trial
    4. No active entitlement

The result is ONE effective access state.

Multiple sources do NOT stack into an imaginary combined plan.

Example:

    Subscription = PRO
    Admin Grant = ELITE

Effective:

    ELITE

When grant expires:

    Effective = PRO

======================================================================
30. ENTITLEMENT PRECEDENCE
======================================================================

Recommended precedence:

    ADMIN / OWNER GRANT
            ↓
    PAID SUBSCRIPTION
            ↓
    TRIAL
            ↓
    READ_ONLY

This allows temporary promotional/admin access to override a lower
subscription without modifying billing data.

======================================================================
31. MANUAL ADMIN GRANTS
======================================================================

Admin-created grants support:

    - Permanent
    - Fixed duration
    - Fixed expiration
    - Revocation

Conceptual table:

    manual_access_grants

Fields:

    id
    user_id
    plan
    starts_at
    expires_at
    status
    source
    reason
    created_by
    created_at
    revoked_at
    revoked_by

A revoked grant is NOT deleted.

It remains for auditability.

======================================================================
32. ACCESS GRANT EXAMPLE
======================================================================

User:

    user@example.com

Grant:

    ELITE
    90 days
    Reason: Beta tester

Effective access:

    ELITE

At expiration:

    Resolver recalculates.

If user has Pro:

    Effective → PRO

If user has no subscription:

    Effective → READ_ONLY

======================================================================
33. PERMANENT ADMIN GRANT
======================================================================

Admin may create:

    ELITE
    PERMANENT

This grant remains active until explicitly revoked.

If user later buys Pro:

    Grant still wins.

If admin revokes the grant:

    Resolver recalculates.

Result:

    Pro subscription becomes effective.

======================================================================
34. ACCESS CODES
======================================================================

Access codes are ADMIN-CREATED ONLY.

Admin may create:

    - Single-use codes
    - Multi-use codes
    - Redemption limits
    - Expiration
    - Plan
    - Grant duration

Example:

    ELITE-BETA-2026

    Plan:
        Elite

    Duration:
        30 days

    Maximum redemptions:
        100

======================================================================
35. ACCESS CODE STORAGE
======================================================================

Raw access codes MUST NOT be stored in plaintext.

Store:

    code_hash

When generated:

    Display raw code to admin once.

After generation:

    Store only the secure hash.

This protects active promotional codes if the database is compromised.

======================================================================
36. ACCESS CODE NORMALIZATION
======================================================================

Before hashing/validation:

    - Trim surrounding whitespace
    - Normalize case (recommended uppercase)

Example:

    elite-beta-2026

and:

    ELITE-BETA-2026

should resolve consistently.

Do not perform overly aggressive character stripping that could create
ambiguous codes.

======================================================================
37. ACCESS CODE REDEMPTION
======================================================================

Requirements:

    Authenticated user
    +
    Verified email

Flow:

    Submitted code
        ↓
    Normalize
        ↓
    Hash
        ↓
    Find code
        ↓
    Validate active state
        ↓
    Validate expiration
        ↓
    Validate redemption count
        ↓
    Create access grant
        ↓
    Create redemption record
        ↓
    Increment redemption count
        ↓
    Commit

Entire operation must be transactional.

======================================================================
38. CONCURRENT CODE REDEMPTION
======================================================================

Example:

    Maximum redemptions = 100
    Current redemptions = 99

Two users redeem simultaneously.

The system MUST NOT allow:

    101 redemptions.

Use transactional locking / atomic database operations.

Only one transaction can consume the final available redemption.

======================================================================
39. ACCESS CODE REDEMPTION HISTORY
======================================================================

Conceptual table:

    access_code_redemptions

Fields:

    id
    access_code_id
    user_id
    grant_id
    redeemed_at

Admin can inspect redemption history.

Example:

    BETA-2026

    3 / 100 used

    user1@example.com
    user2@example.com
    user3@example.com

======================================================================
40. ADMIN MODEL
======================================================================

V1 roles:

    OWNER
    USER

Do NOT build complex RBAC yet.

Future roles can be added later:

    OWNER
    ADMIN
    SUPPORT
    ANALYST
    USER

The architecture should allow expansion without requiring a redesign.

======================================================================
41. ADMIN DASHBOARD
======================================================================

Admin dashboard sections:

    Users
    Subscriptions
    Access Grants
    Access Codes
    Audit Log

======================================================================
42. ADMIN USERS PAGE
======================================================================

Admin should be able to:

    - Search users
    - Inspect account
    - Inspect subscription
    - Inspect effective access
    - Inspect trial
    - Inspect quotas
    - Inspect IBKR accounts
    - Inspect grant source

Example:

    USER
    --------------------------------
    Email
    Name
    Created
    Email Verified

    CURRENT ACCESS
    Elite

    ACCESS SOURCE
    Paid Subscription

    SUBSCRIPTION
    Elite
    Active
    Renews: ...

    TRIAL
    ...

    IBKR ACCOUNTS
    2 / Unlimited

    USAGE
    Trades: ...
    Expenses: ...
    Notes: ...

======================================================================
43. ADMIN MUST NOT EDIT TRADING DATA
======================================================================

The subscription admin system should NOT provide:

    - Edit Trade
    - Delete Trade
    - Modify Execution
    - Modify Expense

The admin system manages:

    Identity
    Access
    Billing
    Entitlements

It does not modify the canonical trading ledger.

This protects data integrity.

======================================================================
44. ADMIN AUDIT LOG
======================================================================

Every privileged administrative action must be audited.

Conceptual table:

    admin_audit_log

Fields:

    id
    actor_user_id
    action
    target_user_id
    target_resource
    target_resource_id
    metadata
    ip_address
    user_agent
    created_at

Examples:

    Owner granted Elite access.

    Owner revoked Elite access.

    Owner created access code.

    Owner disabled access code.

Audit entries should be append-only.

======================================================================
45. EFFECTIVE ACCESS VIEW
======================================================================

Admin should see EFFECTIVE ACCESS rather than only subscription.

Example:

    SUBSCRIPTION:
        Pro

    ADMIN GRANT:
        Elite until September 14

    EFFECTIVE ACCESS:
        Elite

This prevents support/debugging confusion.

======================================================================
46. ENTITLEMENT ENGINE
======================================================================

Do NOT scatter plan checks across the application.

BAD:

    if (plan === "elite") ...

BAD:

    if (user.plan === "pro") ...

Instead use centralized entitlement resolution.

Conceptual architecture:

    User
      ↓
    Active Access Sources
      ↓
    Entitlement Resolver
      ↓
    Effective Plan
      ↓
    Capabilities + Limits
      ↓
    Authorization

Application asks:

    can("ibkr.manual_sync")

NOT:

    isElite()

======================================================================
47. CAPABILITY MODEL
======================================================================

Capabilities should be granular.

Examples:

    trade.view
    trade.create
    trade.update
    trade.delete

    expense.view
    expense.create
    expense.update
    expense.delete

    note.view
    note.create
    note.update
    note.delete

    ibkr.connect
    ibkr.scheduled_sync
    ibkr.manual_sync

    analytics.view
    export.create

Future features can simply introduce new capabilities.

Example:

    ai.trade_review

Then assign the capability to appropriate plans.

======================================================================
48. CAPABILITY VS QUOTA
======================================================================

These are different concepts.

CAPABILITY:

    "Can the user do this?"

QUOTA:

    "How much can the user consume?"

Example:

    Trial:

        trade.create = YES
        trade quota = 20

After 20 trades:

    trade.create capability may still exist conceptually,
    but quota authorization rejects additional creation.

======================================================================
49. SERVER AUTHORIZATION
======================================================================

Every mutation follows:

    REQUEST
       ↓
    Authenticate
       ↓
    Resolve user
       ↓
    Resolve entitlement
       ↓
    Check capability
       ↓
    Check quota
       ↓
    Database transaction
       ↓
    Commit
       ↓
    Response

The browser is NEVER trusted for:

    - Plan
    - Entitlement
    - Quota
    - Admin role
    - Access level

======================================================================
50. UI IS NOT A SECURITY BOUNDARY
======================================================================

Hiding a button is NOT authorization.

Example:

    Sync button hidden

does NOT mean:

    POST /api/ibkr/sync

is protected.

The server must independently reject unauthorized operations.

======================================================================
51. API ERROR MODEL
======================================================================

Unauthenticated:

    HTTP 401

Authenticated but not authorized:

    HTTP 403

Use machine-readable application codes.

Examples:

    CAPABILITY_NOT_AVAILABLE
    QUOTA_EXCEEDED
    READ_ONLY
    ACCOUNT_LIMIT_REACHED

Example conceptual response:

    {
        "code": "QUOTA_EXCEEDED",
        "resource": "trades"
    }

Frontend uses the application code to provide appropriate UX.

======================================================================
52. RLS
======================================================================

RLS protects DATA OWNERSHIP.

RLS answers:

    "Whose data is this?"

Entitlement answers:

    "What can this user do?"

Both are required.

Example:

    User owns Trade #123

    RLS:
        SELECT → allowed

    Entitlement:
        READ_ONLY

    UPDATE:
        rejected

======================================================================
53. USER DATA RLS
======================================================================

User-owned tables must enforce user isolation.

Relevant existing areas include:

    trades
    executions
    expenses
    notes
    broker_connections

A user must never be able to query or mutate another user's records
by supplying another UUID.

======================================================================
54. SUBSCRIPTION RLS
======================================================================

Normal users may READ their own subscription information.

Normal users must NOT directly modify subscription state.

Conceptually:

    SELECT own subscription → YES

    INSERT → NO
    UPDATE → NO
    DELETE → NO

Server-side billing/webhook logic performs trusted mutations.

======================================================================
55. SERVICE ROLE
======================================================================

Supabase service-role credentials are SERVER ONLY.

Never:

    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

Never expose the service role to the browser.

Never return service-role credentials through API responses.

======================================================================
56. BACKGROUND JOB AUTHORIZATION
======================================================================

Scheduled jobs are subject to the same entitlement rules.

Before scheduled IBKR sync:

    Load user
        ↓
    Resolve entitlement
        ↓
    Check ibkr.scheduled_sync
        ↓
    Check account limits
        ↓
    Execute sync

Examples:

    Trial active:
        YES

    Pro:
        YES

    Elite:
        YES

    Basic:
        NO

    Read Only:
        NO

======================================================================
57. EXISTING CANONICAL TRADING ARCHITECTURE
======================================================================

Subscription architecture must NOT alter the canonical trading model.

Existing architecture remains:

    IBKR CSV / IBKR Sync
        ↓
    Normalize Executions
        ↓
    Persist NormalizedExecution[]
        ↓
    Deterministic FIFO Reconstruction
        ↓
    pairTrades()
        ↓
    Trade[]
        ↓
    Analytics / UI

pairTrades() remains authoritative.

Executions remain canonical truth.

Subscription quotas must not create an alternate trading ledger.

======================================================================
58. TRIAL TRADE COUNTING
======================================================================

Trial "trade" usage must be based on actual reconstructed trades,
NOT raw executions.

Do not count:

    BUY execution = 1
    SELL execution = 1

as two trades.

Use the application's canonical reconstructed trade model.

This prevents subscription logic from corrupting trading semantics.

======================================================================
59. SUBSCRIPTION DATABASE DOMAIN
======================================================================

Recommended separation:

    AUTH
    ├── auth.users
    └── profiles

    TRADING
    ├── executions
    ├── trades
    ├── expenses
    ├── notes
    ├── broker_connections
    └── existing trading tables

    BILLING
    ├── subscriptions
    ├── subscription_events
    └── stripe_webhook_events

    ACCESS
    ├── manual_access_grants
    ├── access_codes
    └── access_code_redemptions

    ENTITLEMENTS
    ├── plans
    ├── plan_entitlements
    └── quota_usage

    ADMIN
    └── admin_audit_log

Exact table names may be adjusted during implementation.

The DOMAIN separation must remain.

======================================================================
60. SUBSCRIPTION HISTORY
======================================================================

Subscription state should not be treated as the only historical record.

Maintain subscription events/history.

Examples:

    Trial started
    Trial expired
    Basic activated
    Pro activated
    Elite activated
    Upgrade
    Downgrade scheduled
    Downgrade effective
    Cancellation
    Payment failure
    Payment recovery

Historical records are valuable for:

    - Support
    - Debugging
    - Billing reconciliation
    - Analytics
    - Auditability

======================================================================
61. COMPLETE LIFECYCLE MATRIX
======================================================================

STATE:

    TRIAL

Capabilities:

    Elite capabilities

Limits:

    20 trades
    20 expenses
    20 notes
    1 IBKR account

Sync:

    Scheduled YES
    Sync Now YES

--------------------------------------------------

STATE:

    BASIC

Capabilities:

    Manual journal

IBKR:

    No integration
    No scheduled sync
    No Sync Now

--------------------------------------------------

STATE:

    PRO

Capabilities:

    Manual journal
    IBKR integration
    Scheduled sync

Limits:

    2 IBKR accounts

Sync Now:

    NO

--------------------------------------------------

STATE:

    ELITE

Capabilities:

    Full platform

IBKR:

    Unlimited accounts
    Scheduled sync
    Sync Now

--------------------------------------------------

STATE:

    READ_ONLY

Read:

    YES

Write:

    NO

Sync:

    NO

Data:

    PRESERVED

======================================================================
62. LIFECYCLE TRANSITIONS
======================================================================

TRIAL → BASIC

    Immediate after purchase confirmation.

    Result:
        Manual journal
        No IBKR functionality

TRIAL → PRO

    Immediate after purchase confirmation.

    Result:
        Pro functionality

TRIAL → ELITE

    Immediate after purchase confirmation.

    Result:
        Full Elite functionality
        Trial restrictions disappear

BASIC → PRO

    Immediate.

BASIC → ELITE

    Immediate.

PRO → ELITE

    Immediate.

ELITE → PRO

    Scheduled at billing-period end.

ELITE → BASIC

    Scheduled at billing-period end.

PRO → BASIC

    Scheduled at billing-period end.

PAID PLAN → CANCELED

    Remains active until billing period ends.

CANCELED → READ_ONLY

    At period end if no other entitlement exists.

PAID PLAN → READ_ONLY

    When Stripe confirms payment/subscription failure and no active
    entitlement remains.

READ_ONLY → PAID PLAN

    Immediate after successful subscription confirmation.

READ_ONLY → ADMIN GRANT

    Immediate.

ADMIN GRANT EXPIRATION

    Resolver falls back to subscription/trial/read-only.

======================================================================
63. TRIAL + ACCESS CODE
======================================================================

If a trial user redeems an Elite access code:

    The system must NOT create confusing stacked plans.

Access sources are resolved centrally.

The access code creates a grant.

The grant becomes an entitlement source.

Exact start/precedence behavior can be finalized during implementation,
but the architectural rule remains:

    MULTIPLE SOURCES DO NOT STACK INTO MULTIPLE PLANS.

There is ONE EFFECTIVE ACCESS STATE.

======================================================================
64. ADMIN GRANT + SUBSCRIPTION
======================================================================

Example:

    Subscription:
        PRO

    Admin Grant:
        ELITE

Effective:

    ELITE

When grant expires:

    PRO

When grant is revoked:

    PRO

No billing state is modified by the grant.

======================================================================
65. USER ACCOUNT DELETION
======================================================================

Account deletion is completely separate from subscription lifecycle.

The following MUST NOT trigger account deletion:

    - Trial expiration
    - Payment failure
    - Cancellation
    - Downgrade
    - Grant expiration
    - Access-code expiration

Explicit account deletion is a separate user-driven process.

======================================================================
66. SUBSCRIPTION UX
======================================================================

Subscription page:

    /settings/subscription

Should display:

    Current plan
    Status
    Renewal date
    Effective access
    Available capabilities
    Relevant limits
    IBKR account limit
    Billing information
    Manage Billing

======================================================================
67. CURRENT ACCESS DISPLAY
======================================================================

Do not show only:

    "Plan: Pro"

Show effective capabilities.

Example:

    YOUR ACCESS

    Trading Journal       ✓
    Expenses              ✓
    Analytics             ✓
    IBKR Integration      ✓
    Scheduled Sync        ✓
    Sync Now              Elite
    IBKR Accounts         2

This makes the actual entitlement obvious.

======================================================================
68. TRIAL UI
======================================================================

Use a subtle application-shell indicator:

    Trial · 12 days left

Do NOT use a huge intrusive dashboard banner.

Premium UX principle:

    Clear
    Calm
    Minimal
    Informative

Relevant usage:

    Trades       18 / 20
    Expenses      7 / 20
    Notes        12 / 20
    IBKR          1 / 1

======================================================================
69. QUOTA WARNING UX
======================================================================

Warn users before they hit the limit.

Example:

    16 / 20 trades

Potential message:

    "4 trades remaining in your trial."

Do not display quota warnings everywhere.

Only surface them where contextually useful.

======================================================================
70. QUOTA EXCEEDED UX
======================================================================

When the user reaches the limit:

    20 / 20 trades

and attempts another:

    "Trade limit reached.

     Your trial includes 20 trades.
     Upgrade to continue adding trades."

Provide:

    [ View Plans ]

The user must understand exactly why the operation failed.

======================================================================
71. FEATURE LOCK UX
======================================================================

Features unavailable on a plan can remain visible where useful.

Example:

    IBKR Integration
    Available on Pro and Elite

Example:

    Sync Now
    Available on Elite

Do not hide every unavailable feature.

Do not flood the UI with upgrade prompts.

======================================================================
72. PRO VS ELITE UX
======================================================================

Pro:

    Scheduled Sync       ✓
    Accounts              2
    Sync Now              Elite

Elite:

    Scheduled Sync       ✓
    Accounts              Unlimited
    Sync Now              ✓

This should clearly communicate why Elite exists.

======================================================================
73. UPGRADE UX
======================================================================

Upgrade is immediate.

Example:

    Current:
        Pro

    Upgrade:
        Elite

    [ Upgrade to Elite ]

Stripe handles payment.

After trusted confirmation:

    Elite becomes active.

======================================================================
74. DOWNGRADE UX
======================================================================

Downgrade is scheduled.

Example:

    "Your Elite plan remains active until September 14, 2026."

Then explain:

    "On September 14:
     - Sync Now will be disabled
     - IBKR accounts will be limited to 2
     - Scheduled sync remains available"

Provide:

    [ Confirm Downgrade ]

======================================================================
75. PAYMENT FAILURE UX
======================================================================

No grace period.

Display:

    "Subscription payment failed.

     Your account is currently read-only.
     Your data has not been deleted."

Provide:

    [ Update Payment Method ]

======================================================================
76. READ-ONLY UX
======================================================================

Show a subtle:

    READ ONLY

indicator.

Mutation controls should be:

    - Disabled
    OR
    - Hidden where appropriate

but the user must retain historical visibility.

======================================================================
77. BILLING UX
======================================================================

Billing details should be handled primarily through Stripe.

Elite X should not become a sensitive payment-management system.

Display:

    Plan
    Price
    Billing period
    Renewal
    Payment status

Provide:

    [ Manage Billing ]

======================================================================
78. PLAN COMPARISON UX
======================================================================

Keep the comparison concise.

Recommended:

                    BASIC    PRO      ELITE

Manual journal       YES      YES      YES
Expenses             YES      YES      YES
Analytics            YES      YES      YES
IBKR integration     NO       YES      YES
Scheduled sync       NO       YES      YES
Sync Now             NO       NO       YES
IBKR accounts        N/A      2        Unlimited

Avoid 40 tiny feature checkboxes.

======================================================================
79. SECURITY ARCHITECTURE
======================================================================

Three security layers:

    1. UI
    2. Server/API
    3. Database/RLS

UI:

    Controls visibility/UX.

Server:

    Enforces entitlement.

RLS:

    Protects ownership.

IMPORTANT:

    UI IS NOT A SECURITY BOUNDARY.

======================================================================
80. API AUTHORIZATION
======================================================================

Example:

    POST /api/trades

Flow:

    authenticate()
        ↓
    authorize("trade.create")
        ↓
    checkQuota("trades")
        ↓
    createTrade()

Example:

    POST /api/ibkr/sync

Flow:

    authenticate()
        ↓
    authorize("ibkr.manual_sync")
        ↓
    execute sync

Read-only user:

    403 READ_ONLY

Pro user attempting Sync Now:

    403 CAPABILITY_NOT_AVAILABLE

Trial user at quota:

    403 QUOTA_EXCEEDED

======================================================================
81. RLS VS ENTITLEMENT
======================================================================

RLS:

    Protects WHOSE DATA.

Entitlement:

    Protects WHAT USER CAN DO.

Never substitute one for the other.

Both must be enforced.

======================================================================
82. BACKGROUND SYNC SECURITY
======================================================================

Scheduled sync must verify entitlement before execution.

Never assume:

    "The job exists, therefore run it."

Always resolve:

    User
    ↓
    Entitlement
    ↓
    Capability
    ↓
    Account limit
    ↓
    Sync

This prevents expired/read-only users from continuing to sync.

======================================================================
83. ADMIN SECURITY
======================================================================

Admin routes must be isolated.

Conceptual routes:

    /api/admin/users
    /api/admin/access-grants
    /api/admin/access-codes
    /api/admin/audit

Each route must verify:

    Authenticated
    +
    Authorized admin/owner role

Privileged actions must be audited.

======================================================================
84. DATABASE SECURITY
======================================================================

Normal users:

    Can read their own subscription.

Normal users:

    Cannot directly modify subscription state.

Normal users:

    Cannot modify access grants.

Normal users:

    Cannot modify access-code state.

Normal users:

    Cannot modify audit logs.

Server-side trusted operations handle those mutations.

======================================================================
85. IDEMPOTENCY
======================================================================

The subscription system must be idempotent.

Critical areas:

    Stripe webhooks
    Subscription transitions
    Access-code redemption
    Quota consumption
    Scheduled sync
    Manual sync

Repeated requests must not create duplicate state.

======================================================================
86. TRANSACTIONAL INTEGRITY
======================================================================

Operations that change multiple related records must use database
transactions.

Examples:

    Access-code redemption
    Quota-consuming imports
    Subscription state transitions where multiple local records change
    Resource activation/deactivation

If one required step fails:

    ROLLBACK

No partial state.

======================================================================
87. EXISTING IBKR SYNC ARCHITECTURE
======================================================================

Existing IBKR sync rules remain authoritative.

Broker is source of truth for broker execution data.

Existing sync doctrine:

    Download before delete
    Replace today's executions
    Do not merge today's execution window
    Rebuild trades from executions
    Require idempotency
    Log every sync attempt
    Warn on incomplete broker responses

Subscription authorization sits ABOVE this architecture.

It does not replace it.

======================================================================
88. EXISTING DATA ARCHITECTURE
======================================================================

Canonical execution architecture remains:

    Executions = canonical truth

    pairTrades() = authoritative reconstruction

    Trades = derived from executions

Subscription logic must not mutate Trade objects to enforce limits.

Subscription logic controls whether the operation is allowed.

======================================================================
89. ENTITLEMENT CODE ORGANIZATION
======================================================================

Recommended domain:

    lib/entitlements/

        types.ts
        plans.ts
        capabilities.ts
        resolver.ts
        quotas.ts
        authorization.ts

Exact filenames may change if the existing project architecture suggests
a better organization.

The responsibilities must remain centralized.

======================================================================
90. PLAN CONFIGURATION
======================================================================

Plans should be represented as configuration/data rather than hardcoded
throughout UI components.

Conceptually:

    BASIC
    PRO
    ELITE
    TRIAL

Each plan can define:

    capabilities
    limits
    IBKR account limit

This allows future plans/features without rewriting authorization logic.

======================================================================
91. FUTURE EXTENSIBILITY
======================================================================

The architecture must support future capabilities.

Example future feature:

    AI Trade Review

Define:

    ai.trade_review

Then assign:

    Basic → NO
    Pro → NO
    Elite → YES

No subscription architecture redesign should be necessary.

Other future capabilities may include:

    Advanced analytics
    AI journal analysis
    Additional broker integrations
    Advanced exports
    Team functionality
    API access
    Additional automation

======================================================================
92. CORE ARCHITECTURAL INVARIANTS
======================================================================

INVARIANT 1:

    A user can never access another user's data.

INVARIANT 2:

    A user cannot bypass entitlement restrictions through the browser.

INVARIANT 3:

    Plan changes never delete canonical data.

INVARIANT 4:

    Trial quota cannot be bypassed by deleting records.

INVARIANT 5:

    Concurrent requests cannot exceed quota.

INVARIANT 6:

    Duplicate Stripe webhooks cannot corrupt state.

INVARIANT 7:

    Background sync cannot execute without entitlement.

INVARIANT 8:

    Admin actions are server-authorized and audited.

INVARIANT 9:

    One user has one effective access state.

INVARIANT 10:

    Canonical trading data remains independent of subscription state.

======================================================================
93. MASTER ACCESS RESOLUTION
======================================================================

The entire access system should resolve approximately as:

    AUTHENTICATED USER
            ↓
    ACTIVE ACCESS SOURCES
            ↓
    ENTITLEMENT RESOLVER
            ↓
    EFFECTIVE PLAN
            ↓
    CAPABILITIES + LIMITS
            ↓
    AUTHORIZATION
            ↓
    APPLICATION
            ↓
    RLS
            ↓
    CANONICAL DATA

Stripe sits outside the application:

    STRIPE
       ↓
    WEBHOOK
       ↓
    SUBSCRIPTION STATE
       ↓
    ENTITLEMENT RESOLVER

======================================================================
94. COMPLETE SYSTEM DIAGRAM
======================================================================

                         USER
                           │
                           ▼
                    AUTHENTICATION
                           │
                           ▼
                ┌────────────────────┐
                │ ACCESS SOURCES     │
                │                    │
                │ Trial              │
                │ Stripe Subscription│
                │ Admin Grant        │
                │ Code Grant         │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ ENTITLEMENT ENGINE │
                └─────────┬──────────┘
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
          CAPABILITIES            LIMITS
                │                   │
                └─────────┬─────────┘
                          ▼
                   AUTHORIZATION
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
               API             BACKGROUND JOBS
                │                   │
                └─────────┬─────────┘
                          ▼
                         RLS
                          │
                          ▼
                    CANONICAL DATA


                         STRIPE
                           │
                           │ WEBHOOK
                           ▼
                    ELITE X SERVER
                           │
                           ▼
                   SUBSCRIPTION STATE
                           │
                           ▼
                  ENTITLEMENT ENGINE

======================================================================
95. IMPLEMENTATION ORDER
======================================================================

DO NOT begin by modifying random UI pages.

Implementation order:

    PHASE 1
        Inspect current Supabase schema.

    PHASE 2
        Inspect current authentication/profile architecture.

    PHASE 3
        Inspect current broker_connections structure.

    PHASE 4
        Inspect current API/server boundaries.

    PHASE 5
        Design database migration.

    PHASE 6
        Create subscription tables.

    PHASE 7
        Create entitlement/access tables.

    PHASE 8
        Build entitlement domain.

    PHASE 9
        Build server authorization.

    PHASE 10
        Build quota enforcement.

    PHASE 11
        Build Stripe webhook infrastructure.

    PHASE 12
        Build admin access grants.

    PHASE 13
        Build access codes.

    PHASE 14
        Build audit logging.

    PHASE 15
        Add trial lifecycle.

    PHASE 16
        Integrate read-only state.

    PHASE 17
        Integrate IBKR authorization.

    PHASE 18
        Integrate scheduled sync authorization.

    PHASE 19
        Build subscription UI.

    PHASE 20
        Build billing UI.

    PHASE 21
        Add lifecycle tests.

    PHASE 22
        Security/RLS testing.

    PHASE 23
        Stripe webhook testing.

    PHASE 24
        Production migration/release.

======================================================================
96. TESTING REQUIREMENTS
======================================================================

Before production, test at minimum:

    Trial creation
    Email verification
    Trial expiration
    Trial quota
    Trial quota after deletion
    Trial concurrent creation
    Basic access
    Pro access
    Elite access
    Upgrade
    Downgrade
    Cancellation
    Payment failure
    Payment recovery
    Read-only state
    Admin grant
    Grant expiration
    Grant revocation
    Access-code creation
    Access-code redemption
    Duplicate redemption
    Concurrent redemption
    Code expiration
    Redemption limit
    Excess IBKR accounts
    Scheduled sync authorization
    Manual Sync authorization
    RLS isolation
    Stripe webhook duplication
    Stripe webhook ordering
    Unauthorized API requests
    Direct client manipulation attempts

======================================================================
97. SECURITY TESTING
======================================================================

Attempt to bypass the system by manipulating:

    plan
    role
    quota
    user_id
    capability
    API payload
    browser state
    localStorage
    cookies
    frontend state

All such attempts must fail server-side.

The frontend must never be the source of truth for entitlement.

======================================================================
98. PRODUCT PHILOSOPHY
======================================================================

Elite X should NOT punish users by deleting or hiding their historical
work when billing changes.

A user who stops paying should still be able to see the trading journal
they built.

The subscription controls:

    FUTURE ACTIONS

not:

    HISTORICAL OWNERSHIP.

This is a major trust principle.

======================================================================
99. FINAL LOCKED DECISIONS
======================================================================

ONE USER:

    YES

ONE PLAN / EFFECTIVE ACCESS:

    YES

SAME DATA MODEL:

    YES

READ-ONLY USERS:

    YES

READ-ONLY CAN VIEW:

    Trades
    Expenses
    Notes
    Analytics
    Historical information
    Exports

READ-ONLY CAN WRITE:

    NO

PLAN CHANGE DELETES DATA:

    NEVER

UPGRADE:

    IMMEDIATE

DOWNGRADE:

    END OF BILLING PERIOD

PAYMENT FAILURE:

    READ-ONLY

GRACE PERIOD:

    NONE

TRIAL:

    14 DAYS

TRIAL PLAN:

    ELITE

TRIAL IBKR:

    1 ACCOUNT

TRIAL TRADES:

    20

TRIAL EXPENSES:

    20

TRIAL NOTES:

    20

TRIAL SYNC:

    YES

TRIAL SYNC NOW:

    YES

BASIC:

    MANUAL JOURNAL

PRO:

    IBKR + SCHEDULED SYNC + 2 ACCOUNTS

ELITE:

    FULL ACCESS + SYNC NOW + UNLIMITED ACCOUNTS

ACCESS CODES:

    ADMIN CREATED ONLY

ACCESS GRANTS:

    ADMIN CREATED

ACCESS GRANT EXPIRATION:

    NO DATA DELETION

EMAIL VERIFICATION:

    REQUIRED

ADMIN V1:

    OWNER ONLY

IBKR DATA:

    EXISTING CANONICAL EXECUTION LEDGER REMAINS AUTHORITATIVE

ENTITLEMENTS:

    CENTRALIZED

AUTHORIZATION:

    SERVER SIDE

DATA ISOLATION:

    RLS

BILLING:

    STRIPE

SERVICE ROLE:

    SERVER ONLY

======================================================================
100. SOURCE OF TRUTH
======================================================================

This document is the MASTER PRODUCT + ARCHITECTURE SPECIFICATION for
Elite X subscription and entitlement behavior.

Future implementation decisions should conform to this document unless
a genuine architectural conflict is discovered.

If implementation reveals a contradiction, DO NOT silently work around it.

Instead:

    1. Identify the conflict.
    2. Explain the technical consequence.
    3. Propose the smallest architectural correction.
    4. Update this master specification.
    5. Then implement.

DO NOT allow subscription logic to become scattered, duplicated, or
implicitly defined across UI components.

The final system must preserve:

    - Canonical execution architecture
    - User data ownership
    - RLS isolation
    - Deterministic trade reconstruction
    - Secure server-side authorization
    - Idempotent billing synchronization
    - Data preservation across plan changes
    - Simple and predictable user experience

======================================================================
END OF ELITE X SUBSCRIPTION & ENTITLEMENT MASTER SPECIFICATION
======================================================================