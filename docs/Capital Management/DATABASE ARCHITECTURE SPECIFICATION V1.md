# ELITE X TRADING JOURNAL
# CAPITAL MANAGEMENT — DATABASE ARCHITECTURE SPECIFICATION V1

**Version:** 1.0 Draft  
**Status:** Architecture review — awaiting approval  
**Scope:** Capital Management only  
**Database:** Existing Elite X Supabase project  
**Database implementation:** Not started

---

# 1. ARCHITECTURAL OBJECTIVES

Capital Management will be an independent financial domain within the existing Supabase project.

It will reuse Supabase Authentication but maintain its own:

- Database tables.
- Financial account registry.
- Capital transaction ledger.
- Broker connection relationships.
- Financial validation rules.
- Database API functions.
- RLS policies.
- Audit history.
- Reporting operations.

Capital Management must not depend on the trading execution ledger to determine capital activity.

It must not modify trading executions, FIFO pairing, trading P&L, Expenses or existing broker synchronization behavior.

## Design targets

- Multi-tenant from day one.
- Support multiple brokerage accounts per user.
- Support multiple accounts from the same broker.
- Support manual and broker-connected accounts.
- Preserve original financial amounts and currencies.
- Support atomic financial transactions.
- Prevent duplicate transactions.
- Preserve completed transaction history.
- Support future brokerage integrations without redesigning the data model.

---

# 2. DATABASE SCHEMA ORGANIZATION

## Recommended: Two separate PostgreSQL schemas

Instead of placing all Capital Management objects in the default `public` schema, use two dedicated schemas.

### A. `capital_private`

Contains the actual financial data and internal relationships.

This schema will NOT be exposed through the Supabase Data API.

Proposed objects:

- brokerage_accounts
- capital_broker_connection_links
- capital_transactions
- capital_account_events
- capital_transaction_events
- capital_operation_requests
- capital_transaction_attachments (optional)

### B. `capital_api`

Contains the deliberately limited API surface.

This schema will be exposed through Supabase API settings.

It will contain database functions for:

- Reading accounts.
- Creating accounts.
- Updating account details.
- Closing accounts.
- Reconciling broker connections.
- Creating transactions.
- Updating pending transactions.
- Completing or cancelling transactions.
- Reversing completed transactions.
- Retrieving transaction history.
- Retrieving account summaries.
- Retrieving financial analytics.

It will not contain the actual financial tables.

### Access architecture

```text
             Supabase Authentication
                       |
                       |
                 Authenticated JWT
                       |
                       v
                 capital_api
              Exposed RPC functions
                       |
              SECURITY INVOKER
                       |
                PostgreSQL RLS
                       |
                       v
                 capital_private
                Internal tables
                       |
             Canonical financial data
```

### API configuration requirements

The Supabase project must expose `capital_api` through API settings.

It must NOT expose `capital_private`.

The application will call functions using:

```ts
supabase
  .schema("capital_api")
  .rpc("function_name", parameters);
```

The custom schema configuration and required grants must be tested before frontend integration.

**Important:** We will not use SECURITY DEFINER as the default solution. Functions should use SECURITY INVOKER, enforce ownership through RLS, and operate with the authenticated user's permissions.

Every function will use an empty search path and fully qualified object names.

Any future need for SECURITY DEFINER requires a separate security justification and review.

---

# 3. CANONICAL BROKERAGE ACCOUNT REGISTRY

## Table: `capital_private.brokerage_accounts`

**Purpose:** The single authoritative registry of brokerage accounts used by Capital Management.

Every financial transaction will reference this table using an internal UUID.

### Proposed columns

| Column | Type | Nullable | Purpose |
|---|---|---|---|
| id | UUID | No | Primary key |
| user_id | UUID | No | Account owner |
| provider_code | TEXT | No | Broker/provider identifier |
| display_name | TEXT | No | User-facing account name |
| provider_account_id | TEXT | Yes | External broker account ID |
| account_type | TEXT | No | Account category |
| base_currency | TEXT | Yes | Account's base currency |
| account_origin | TEXT | No | MANUAL or BROKER_CONNECTION |
| setup_status | TEXT | No | NEEDS_DETAILS or READY |
| account_status | TEXT | No | ACTIVE or CLOSED |
| closed_at | TIMESTAMPTZ | Yes | Account closure timestamp |
| created_at | TIMESTAMPTZ | No | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | Last update timestamp |
| version | BIGINT | No | Optimistic concurrency version |

### Account types

Examples:

- CASH
- MARGIN
- TFSA
- RRSP
- CORPORATE
- OTHER
- UNSPECIFIED

Account types should be stored as extensible text values, not a restrictive PostgreSQL ENUM.

### Account origin

Two initial values:

- MANUAL
- BROKER_CONNECTION

This identifies how the account was first registered.

A manually created account can later receive a broker connection without changing its original account identity.

### Account status

- ACTIVE
- CLOSED

Closing an account must not delete it or its financial history.

A closed account cannot accept new transactions.

Existing pending transactions must be resolved before closing the account.

### Setup status

Two values:

- NEEDS_DETAILS
- READY

This addresses an important problem in the existing infrastructure.

Broker connections currently provide the broker name, account alias and external account ID, but they do not establish the account's base currency or account type.

We must not invent those values.

An imported account with incomplete metadata will be created as NEEDS_DETAILS. The user completes its account information before it becomes READY.

### Account constraints

1. UUID primary key.
2. `user_id` foreign key to `auth.users(id)`.
3. `UNIQUE (user_id, id)` to support composite ownership foreign keys.
4. Non-empty provider and display name.
5. Valid supported currency when base currency is supplied.
6. READY accounts must have a valid base currency.
7. CLOSED accounts must have a closure timestamp.
8. ACTIVE accounts must not have a closure timestamp.
9. Account identifiers must be unique per user and provider when present.

### Provider identity uniqueness

Recommended partial unique index:

```sql
CREATE UNIQUE INDEX ...
ON capital_private.brokerage_accounts
(
  user_id,
  provider_code,
  provider_account_id
)
WHERE provider_account_id IS NOT NULL;
```

Manual accounts without external provider identifiers remain supported.

### Account deletion policy

No ordinary hard deletion.

An account with transactions must remain available for historical reporting.

Use controlled account closure instead.

---

# 4. BROKER CONNECTION INTEGRATION

## New table: `capital_private.capital_broker_connection_links`

**Purpose:** Establish a secure relationship between the existing broker integration and the new canonical account registry.

This is deliberately separate from `public.broker_connections`.

### Why a separate relationship table?

The Capital Management module should own its account relationships.

We do not need to add Capital Management account-management responsibilities to the existing broker connection code.

It also allows multiple integration connections to reference the same canonical account in the future.

### Proposed columns

| Column | Type | Nullable | Purpose |
|---|---|---|---|
| id | UUID | No | Primary key |
| user_id | UUID | No | Ownership |
| brokerage_account_id | UUID | No | Canonical account ID |
| broker_connection_id | UUID | No | Existing broker connection ID |
| linked_at | TIMESTAMPTZ | No | Link timestamp |

### Constraints

- Composite foreign key `(user_id, brokerage_account_id)` to the canonical account.
- Composite foreign key `(user_id, broker_connection_id)` to the existing broker connection.
- Unique `(user_id, broker_connection_id)` so one connection cannot map to multiple canonical accounts.
- Multiple connections may map to one canonical account.
- Removing a broker connection removes only its relationship record, not the brokerage account.

### Minimal existing-table compatibility change

To enforce the second composite foreign key, we will need an additive unique constraint on:

```sql
public.broker_connections (user_id, id)
```

The existing primary key on `id` remains unchanged.

This is a narrow database compatibility change. It does not require changing existing broker credentials, synchronization columns or execution behavior.

---

# 5. AUTOMATIC BROKER ACCOUNT PROVISIONING

## V1 functionality

When Capital Management loads, it will reconcile the user's existing broker connections into its own account registry.

This will be handled by a dedicated Capital Management database operation.

### Reconciliation algorithm

For each broker connection belonging to the authenticated user:

**Step 1 — Existing relationship**

Check whether a Capital Management link already exists for the broker connection.

If found, verify that the external account identity still matches.

**Step 2 — Existing canonical account**

If no link exists, search for a canonical brokerage account with the same:

- User ID.
- Provider.
- External provider account ID.

If exactly one exists, link it instead of creating a duplicate.

This also allows a previously manual account to become broker-linked without changing its UUID.

**Step 3 — New account**

If no matching account exists, create one using available verified information:

- Broker/provider.
- Account alias as display name.
- External broker account ID.
- BROKER_CONNECTION as origin.
- NEEDS_DETAILS if required metadata is missing.

Create its relationship record in the same database transaction.

**Step 4 — Conflict handling**

If matching is ambiguous or an identity has changed unexpectedly, do not guess.

Return a reconciliation conflict for controlled resolution.

### Critical limitations

This feature imports existing configured broker connections.

It does not discover every account directly from IBKR.

Automatic provider-side account discovery and automated capital transaction imports remain outside V1.

### Data that must never be copied

Capital Management must not store:

- IBKR Flex tokens.
- Flex Query IDs.
- Broker passwords.
- API secrets.
- Raw broker credentials.

Only safe account identity information is required.

Repeated reconciliation must be idempotent.

Inactive broker connections must not automatically close their canonical accounts.

---

# 6. CAPITAL TRANSACTION LEDGER

## Table: `capital_private.capital_transactions`

**Purpose:** The canonical financial ledger of deposits, withdrawals and internal transfers.

V1 transaction types:

- DEPOSIT
- WITHDRAWAL
- TRANSFER

There will be one canonical record for every internal transfer.

No separate movement rows are required.

### Proposed columns

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Transaction owner |
| transaction_type | TEXT | DEPOSIT, WITHDRAWAL, TRANSFER |
| status | TEXT | PENDING, COMPLETED, CANCELLED |
| from_account_id | UUID | Source brokerage account |
| to_account_id | UUID | Destination brokerage account |
| amount | NUMERIC(24,8) | Primary transaction amount |
| currency | TEXT | Primary transaction currency |
| received_amount | NUMERIC(24,8) | Transfer receiving amount |
| received_currency | TEXT | Transfer receiving currency |
| exchange_rate | NUMERIC(24,12) | Derived transfer rate |
| transaction_date | DATE | User-entered transaction date |
| initiated_date | DATE | Optional initiation date |
| effective_date | DATE | Actual financial movement date |
| method | TEXT | Payment/transfer method |
| counterparty_institution | TEXT | External institution |
| counterparty_account_label | TEXT | Optional external account nickname |
| reference_number | TEXT | External reference |
| notes | TEXT | User notes |
| entry_source | TEXT | MANUAL initially |
| idempotency_key | UUID | Duplicate request protection |
| reversal_of_transaction_id | UUID | Original transaction being reversed |
| correction_of_transaction_id | UUID | Original transaction being corrected |
| version | BIGINT | Optimistic concurrency |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last modification timestamp |
| completed_at | TIMESTAMPTZ | Completion timestamp |

Exact column nullability will be finalized alongside the SQL CHECK constraints.

### Transaction amount representation

The primary amount always represents the sending or primary transaction side.

For a deposit, it represents the amount received by the brokerage account.

For a withdrawal, it represents the amount removed from the brokerage account.

For a transfer, it represents the amount sent by the source account.

The receiving amount represents the other side of an internal transfer.

### Deposit requirements

- `from_account_id` must be NULL.
- `to_account_id` must be populated.
- `amount` must be positive.
- `currency` must be supported.
- Transfer-specific fields must be NULL.

### Withdrawal requirements

- `from_account_id` must be populated.
- `to_account_id` must be NULL.
- `amount` must be positive.
- `currency` must be supported.
- Transfer-specific fields must be NULL.

### Transfer requirements

- Both account IDs are required.
- Both accounts must belong to the same user.
- Source and destination cannot be identical.
- Sending amount and currency are required.
- Receiving amount and currency are required.
- Received amount must be positive.
- Both accounts must be eligible for the transaction.

For same-currency transfers:

- Sending and receiving currencies must match.
- Received amount must equal sending amount.
- Exchange rate must equal 1.

For cross-currency transfers:

- Receiving currency must differ from sending currency.
- The exchange rate must be positive.
- The stored rate must be derived consistently from the actual sending and receiving amounts.

### Important FX decision

The actual sending and receiving amounts are the authoritative financial facts.

The database should derive the effective exchange rate from them:

`exchange_rate = received_amount / amount`

This prevents a user from storing inconsistent amounts and exchange rates.

The UI can display the derived rate. It should not independently persist three conflicting financial values.

---

# 7. FINANCIAL PRECISION AND CURRENCY RULES

Use PostgreSQL NUMERIC for authoritative monetary values.

Proposed types:

- Amounts: NUMERIC(24,8)
- Exchange rates: NUMERIC(24,12)

These scales provide precision headroom, while validation enforces the permitted minor units for the supported currencies.

Supported V1 currencies:

- CAD
- USD
- EUR
- GBP
- JPY
- INR

Currency rules:

- CAD, USD, EUR, GBP and INR: two decimal places.
- JPY: zero decimal places.

The database must reject invalid monetary precision and invalid currency codes.

Application calculations must use Decimal arithmetic, not JavaScript binary floating point.

Never add different currency amounts without an explicit conversion policy.

Account base currency is informational and must not restrict the currency of an individual transaction.

V1 reporting will keep currency totals separate.

Automatic reporting-currency conversion is not part of this module's initial implementation.

---

# 8. TRANSACTION STATUS AND DATE RULES

## Supported statuses

| Status | Meaning |
|---|---|
| PENDING | Transaction initiated but not confirmed |
| COMPLETED | Funds confirmed as moved |
| CANCELLED | Transaction did not complete |

### Permitted transitions

```text
PENDING
   |
   +------> COMPLETED
   |
   +------> CANCELLED

COMPLETED
   |
   +------> Original remains unchanged.
            Correction uses a reversal.

CANCELLED
   |
   +------> Terminal state.
```

Only completed transactions affect confirmed funding totals.

Pending transactions appear separately.

Cancelled transactions remain available for historical reference.

### Date semantics

- `transaction_date`: The date associated with the transaction in the confirmation or user entry.
- `initiated_date`: The date the transfer was initiated, when separately known.
- `effective_date`: The date funds were actually credited or debited.
- `created_at`: Database record creation timestamp.
- `updated_at`: Database modification timestamp.

A transaction cannot become COMPLETED without an effective date.

Reporting periods use effective dates for completed transactions.

The exact mapping between the existing date input and these fields must be finalized before frontend integration.

---

# 9. CORRECTIONS, REVERSALS AND AUDIT HISTORY

Completed financial records must never be silently edited or deleted.

### Correction workflow

A correction will consist of:

1. Reversing the incorrect completed transaction.
2. Recording an explanation for the reversal.
3. Creating the corrected transaction.
4. Linking the corrected record to the original.
5. Recording all events in the audit history.

### Reversal behavior

Deposit reversal:

- Original deposit remains unchanged.
- A compensating withdrawal is created.

Withdrawal reversal:

- Original withdrawal remains unchanged.
- A compensating deposit is created.

Transfer reversal:

- Source and destination accounts are reversed.
- The original sending and receiving amounts are swapped.
- The corresponding inverse exchange rate is derived.

V1 supports full reversals, not partial reversals.

A transaction may have only one full reversal.

### Table: `capital_private.capital_transaction_events`

Proposed fields:

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Event ID |
| user_id | UUID | Owner |
| transaction_id | UUID | Related transaction |
| event_type | TEXT | Event classification |
| previous_values | JSONB | Previous state, where applicable |
| new_values | JSONB | New state, where applicable |
| reason | TEXT | Explanation |
| actor_user_id | UUID | Actor |
| occurred_at | TIMESTAMPTZ | Event timestamp |

Events include:

- TRANSACTION_CREATED
- TRANSACTION_UPDATED
- TRANSACTION_COMPLETED
- TRANSACTION_CANCELLED
- TRANSACTION_CORRECTED
- TRANSACTION_REVERSED

This table must be append-only through supported application operations.

Authenticated users cannot update or delete event history.

### Account event history

`capital_private.capital_account_events` records:

- Account created.
- Account metadata changed.
- Account closed.
- Account reopened, if supported.
- Broker connection linked or unlinked.

Account events must also be append-only.

---

# 10. IDEMPOTENCY AND CONCURRENCY

These are mandatory financial integrity controls.

## Idempotency

Create and mutation operations must accept a UUID idempotency key.

A proposed table:

`capital_private.capital_operation_requests`

Fields:

- id
- user_id
- idempotency_key
- operation_type
- request_hash
- resource_id
- created_at

Unique constraint:

`UNIQUE (user_id, idempotency_key)`

Rules:

- Retrying the same operation with the same key and payload returns the original result.
- Reusing the key with a different payload returns an idempotency conflict.
- The financial transaction and its idempotency record must commit atomically.

Broker connection reconciliation will use unique relationship constraints and provider identity uniqueness to prevent duplicate accounts.

## Concurrency

Financial write operations must:

- Use database transactions.
- Lock affected account rows where necessary.
- Lock transaction rows during state transitions.
- Lock multiple account IDs in deterministic UUID order to reduce deadlocks.
- Use optimistic version checks for pending record updates.
- Reject invalid or stale state transitions.

A failed operation must not leave a partial financial record or orphaned audit event.

---

# 11. ATTACHMENTS

The current product design includes an attachment concept.

If retained in V1, implement it using:

`capital_private.capital_transaction_attachments`

Fields:

- id
- user_id
- transaction_id
- storage_path
- original_filename
- content_type
- byte_size
- created_at

Files must be stored in a private Supabase Storage bucket.

Requirements:

- No public receipt URLs.
- User-owned object paths.
- Ownership verification against the transaction.
- MIME type allowlist.
- Maximum file-size enforcement.
- Safe filename handling.
- No execution of uploaded content.
- Signed URLs only when authorized.

The exact allowed formats and size limit must be finalized before implementation.

A filename-only attachment is not considered a completed upload feature.

---

# 12. DATABASE SECURITY AND AUTHORIZATION

This section defines the required security baseline.

## A. Authentication

Every Capital Management API function requires an authenticated Supabase user.

Use the trusted JWT identity:

`auth.uid()`

Never accept a client-supplied `user_id` as the authority for ownership.

Functions should fail explicitly when the request is unauthenticated.

## B. Row Level Security

Enable RLS on every table in `capital_private`.

Use FORCE ROW LEVEL SECURITY as an additional safeguard.

Every user-owned table must enforce the authenticated user's ownership.

Core policy condition:

`auth.uid() IS NOT NULL AND auth.uid() = user_id`

Use policies limited to the authenticated role.

No anonymous access.

## C. Grants and privileges

The API schema must expose only the required RPC functions.

Revoke public and anonymous execution privileges.

Grant EXECUTE only to authenticated users for functions explicitly approved for use.

Internal tables must not be directly available through the Data API.

No unnecessary:

- TRUNCATE
- REFERENCES
- TRIGGER
- DELETE

privileges for ordinary application roles.

## D. SECURITY INVOKER

All normal Capital Management functions should run as the authenticated caller.

This ensures the operation remains subject to database permissions and RLS.

If any SECURITY DEFINER function becomes necessary, it requires:

- Explicit technical justification.
- Empty search path.
- Fully qualified object names.
- Strict ownership validation.
- Narrow execution grants.
- Independent security testing.

## E. Foreign key tenant isolation

Every account relationship must enforce same-user ownership at the database level.

For example, a transaction cannot reference a source account owned by User A and a destination account owned by User B.

Composite ownership foreign keys are mandatory.

## F. Service-role restrictions

Normal user-facing Capital Management operations must not require the service-role key.

If a privileged administrative process is introduced later, it must be isolated and separately reviewed.

No browser-side service-role access.

## G. Application authorization

The module must support the product's approved/read-only access rules through a trusted server-side authorization decision.

The existing public-schema inspection did not identify an authoritative approval, subscription or read-only field.

We must identify the canonical server-controlled authorization source before claiming those product access restrictions are enforced.

Do not trust user-editable metadata or client-side flags.

This remains a production-readiness item.

---

# 13. CAPITAL MANAGEMENT API FUNCTIONS

The exposed `capital_api` schema will contain a narrow function allowlist.

## Account functions

- `list_accounts`
- `create_manual_account`
- `update_account`
- `close_account`
- `reconcile_broker_connections`

## Transaction functions

- `list_transactions`
- `get_transaction`
- `create_transaction`
- `update_pending_transaction`
- `complete_transaction`
- `cancel_transaction`
- `reverse_transaction`
- `get_transaction_events`

## Reporting functions

- `get_capital_overview`
- `get_account_capital_summary`
- `get_monthly_funding_activity`

All read functions must use bounded queries.

Suggested default pagination: 50 records.

Maximum pagination limit must be enforced server-side.

Use keyset pagination for transaction history rather than fetching an unlimited table into the browser.

The API must not expose internal account links, secrets or unrelated database columns.

---

# 14. INDEXING AND PERFORMANCE

Proposed indexes:

## Brokerage accounts

- Unique primary key.
- Unique `(user_id, id)`.
- Partial provider identity unique index.
- `(user_id, account_status, created_at DESC)`.

## Broker connection links

- Unique broker connection relationship.
- Account lookup by `(user_id, brokerage_account_id)`.
- Composite foreign keys.

## Capital transactions

- Unique `(user_id, id)`.
- Unique `(user_id, idempotency_key)`.
- `(user_id, status, transaction_date DESC, id DESC)`.
- Partial completed-transaction index by `(user_id, effective_date DESC, id DESC)`.
- Account-specific indexes for source and destination account reporting.
- Unique reversal relationship.

## Events

- `(user_id, transaction_id, occurred_at DESC, id DESC)`.

All indexes must be reviewed against the actual reporting queries.

Avoid premature table partitioning.

Performance must be tested using realistic multi-user datasets and concurrent workloads.

---

# 15. REPORTING RULES

Reporting calculations must be performed using validated database-backed data.

### External funding

Net External Funding:

Completed Deposits minus Completed Withdrawals.

Transfers are excluded.

### Account reporting

Display:

- Deposits received.
- Withdrawals made.
- Transfers received.
- Transfers sent.
- Transaction count.
- Transaction history.

### Currency reporting

Currency subtotals remain separate.

Never add CAD, USD, EUR or other currencies without an explicit conversion policy.

### Transfer filtering

A transfer crossing the selected reporting account boundary must remain identifiable as an internal transfer.

It must not automatically be classified as external funding.

### Effective dates

Completed financial reporting must use effective dates.

Pending activity must be displayed separately.

### Explicit exclusions

Capital Management does not calculate:

- Brokerage cash balances.
- Current portfolio value.
- Investment performance.
- Trading P&L.
- Dividends.
- Interest.
- Trading commissions.
- Tax obligations.

---

# 16. MIGRATION PLAN

All schema changes must be version-controlled in `supabase/migrations/`.

No production database changes until the specification is approved.

## Migration A — Schema and security foundation

1. Create `capital_private`.
2. Create `capital_api`.
3. Establish narrowly scoped grants.
4. Establish default privilege restrictions.
5. Configure API schema exposure.
6. Create database security tests.

## Migration B — Brokerage account registry

1. Create brokerage_accounts.
2. Create capital_broker_connection_links.
3. Add the minimal composite unique constraint to broker_connections.
4. Add owner-enforcing foreign keys.
5. Add RLS and policies.
6. Add indexes.
7. Add account provisioning functions.

## Migration C — Existing connection reconciliation

1. Reconcile existing broker connection records.
2. Create or link canonical accounts.
3. Verify provider identity uniqueness.
4. Verify every relationship belongs to the same user.
5. Verify repeated reconciliation produces no duplicate records.
6. Verify no broker credentials were copied.
7. Confirm historical account records remain independent of connection status.

## Migration D — Capital transaction ledger

1. Create capital_transactions.
2. Create capital_transaction_events.
3. Create capital_account_events.
4. Create capital_operation_requests.
5. Add constraints and indexes.
6. Add all RLS policies.
7. Implement transaction RPC functions.
8. Test atomicity and ownership.

## Migration E — Optional attachment infrastructure

Only after the attachment workflow is finalized:

1. Create private Storage bucket.
2. Create attachment metadata.
3. Implement ownership policies.
4. Implement secure upload and download.
5. Test unauthorized file access.

## Migration F — Reporting

1. Implement account summaries.
2. Implement external funding totals.
3. Implement monthly funding activity.
4. Implement currency-specific aggregation.
5. Implement bounded transaction queries.

---

# 17. SECURITY AUDIT ACCEPTANCE CHECKLIST

The module cannot be declared production-ready until these requirements have implementation evidence and passing tests.

## Authentication and tenant isolation

- [ ] Unauthenticated users cannot call protected operations.
- [ ] User A cannot read User B's accounts.
- [ ] User A cannot read User B's transactions.
- [ ] User A cannot read User B's audit events.
- [ ] User A cannot modify User B's records.
- [ ] Client-supplied user IDs cannot override authenticated identity.
- [ ] Cross-user account references are rejected.
- [ ] Cross-user broker connection links are rejected.

## Database exposure and privileges

- [ ] `capital_private` is not exposed through the Data API.
- [ ] Only intended functions are exposed through `capital_api`.
- [ ] RLS is enabled on every private data table.
- [ ] FORCE RLS is enabled and verified.
- [ ] RLS policies are tested with multiple users.
- [ ] Anonymous function execution is revoked.
- [ ] Unnecessary table privileges are revoked.
- [ ] No unintended DELETE or TRUNCATE capability exists.
- [ ] Database default privileges do not reintroduce broad access.
- [ ] No browser service-role credentials exist.

## Financial integrity

- [ ] Invalid amounts are rejected.
- [ ] Unsupported currencies are rejected.
- [ ] JPY precision is enforced correctly.
- [ ] Invalid FX rates are rejected.
- [ ] Inconsistent transfer amounts and currencies are rejected.
- [ ] A transfer creates exactly one canonical transaction.
- [ ] Partial transaction writes cannot occur.
- [ ] Duplicate requests cannot create duplicate financial activity.
- [ ] Stale concurrent updates are rejected.
- [ ] Completed transactions cannot be silently edited.
- [ ] Corrections and reversals retain the original transaction.
- [ ] Audit events cannot be modified or deleted by users.

## Broker account provisioning

- [ ] Existing connections create canonical accounts.
- [ ] Reconciliation is safe to retry.
- [ ] Same-user duplicates are prevented.
- [ ] External IDs from another user cannot be linked.
- [ ] Missing account metadata is not invented.
- [ ] Broker credentials never enter Capital Management.
- [ ] Disconnecting a broker does not delete its financial account.
- [ ] Manual accounts work without integrations.

## API and operational security

- [ ] RPC parameters have strict validation.
- [ ] Functions have bounded query limits.
- [ ] Pagination cannot request unlimited data.
- [ ] Errors do not reveal secrets or cross-user records.
- [ ] Private data is not logged unnecessarily.
- [ ] Idempotency conflicts are handled correctly.
- [ ] Concurrency tests cover simultaneous transaction operations.
- [ ] Product read-only/approval restrictions are enforced using an authoritative server-controlled source.

## Testing evidence

- [ ] Database RLS tests.
- [ ] Database privilege tests.
- [ ] Cross-tenant integration tests.
- [ ] Financial arithmetic tests.
- [ ] FX conversion and rounding tests.
- [ ] Transaction lifecycle tests.
- [ ] Correction and reversal tests.
- [ ] Broker reconciliation tests.
- [ ] Concurrent request tests.
- [ ] Performance/load tests.
- [ ] Production migration and rollback rehearsal.

A completed checklist will establish that the page meets our defined security baseline. It cannot guarantee a clean result from every independent external audit, but it gives us a defensible, testable basis for one.

---

# 18. OPEN DESIGN DECISIONS — BEFORE MIGRATION

These items need final review:

1. Confirm the `capital_private` plus `capital_api` schema separation and Supabase API configuration.
2. Confirm that imported accounts with missing base currency enter NEEDS_DETAILS status.
3. Finalize the distinction between transaction_date and initiated_date.
4. Finalize the exact account type values and currency precision checks.
5. Confirm whether account reopening is allowed.
6. Finalize full-reversal and replacement transaction behavior.
7. Confirm attachment formats and size limits.
8. Identify the authoritative source for approval and read-only authorization.

No migration SQL should be written until these decisions are resolved.

---

# 19. IMPLEMENTATION ORDER

1. Approve this architecture.
2. Finalize exact database column definitions and SQL constraints.
3. Finalize Supabase permissions and RLS.
4. Produce migration files.
5. Review the migration SQL.
6. Execute in a controlled environment.
7. Verify the live database schema and grants.
8. Implement backend RPC functions.
9. Test account ownership and financial operations.
10. Connect the existing Capital Management UI.
11. Run the complete security acceptance suite.
12. Prepare production deployment.

---

# FINAL ARCHITECTURAL PRINCIPLE

Capital Management owns its own account registry and financial ledger.

Broker integrations provide account identity information but do not own Capital Management financial records.

All money-related operations are validated and persisted atomically.

The database, not the frontend, is the ultimate enforcement boundary for ownership and financial integrity.

**No changes are authorized by this specification alone.**

**Next deliverable:** Detailed PostgreSQL schema specification, including exact column definitions, nullability, foreign keys, CHECK constraints, indexes, grants, RLS policies and API function signatures.