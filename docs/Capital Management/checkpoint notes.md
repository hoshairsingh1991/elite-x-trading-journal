# ELITE X TRADING JOURNAL
# CAPITAL MANAGEMENT — MASTER DEVELOPMENT & SECURITY NOTES

**Project:** Elite X Trading Journal  
**Module:** Capital Management  
**Document:** Master Development & Security Notes  
**Current checkpoint:** 02 — Database Foundation & Account Backend  
**Last updated:** November 20, 2026  
**Current phase:** Transaction Backend — Not Yet Implemented / Verified  
**Status:** Database foundation and account lifecycle backend completed; transaction engine remains outstanding.

---

# 1. PROJECT OBJECTIVE

The objective is to make the existing Capital Management page fully functional using real Supabase data.

The original Capital Management interface was built using static preview data. The initial audit examined the existing UI, data model, calculations, storage architecture, Supabase security, and related broker integration infrastructure.

We have since moved beyond the initial audit and started implementing the production database and account backend.

The implementation priorities remain:

- Financial data integrity.
- Accurate monetary calculations.
- Multi-user and multi-tenant security.
- Strict account ownership enforcement.
- Database-level validation.
- Atomic financial operations.
- Idempotency and duplicate-submission protection.
- Concurrency safety.
- Maintainable architecture.
- Performance and scalability.
- Consistent and reliable user experience.

Our design target is approximately 10,000 users, potentially with 10,000 concurrent users. These are architectural targets, not demonstrated load-test results.

**Important development rule:** Backend and financial correctness come before UI integration. The existing approved Capital Management UI should be preserved unless a specific change is necessary.

---

# 2. CAPITAL MANAGEMENT V1 — PRODUCT SCOPE

Capital Management V1 manages capital movements between external sources and the user's tracked accounts.

Supported operations:

1. Deposits.
2. Withdrawals.
3. Internal transfers.

Capital Management is a separate financial subsystem.

It must NOT become another:

- Trading P&L engine.
- Execution ledger.
- FIFO pairing engine.
- Portfolio valuation engine.
- Expenses module.
- Broker synchronization engine.

It must not modify canonical trading executions or trading analytics.

## 2.1 Supported currencies

- CAD
- USD
- EUR
- GBP
- JPY
- INR

Accounts may also have an `UNKNOWN` currency until their currency is established.

`UNKNOWN` is an account-level classification only. It is not a supported transaction or reporting currency.

## 2.2 Account categories

Supported account types:

- `brokerage`
- `bank`
- `cash`
- `other`

An optional account subtype provides additional classification.

Examples:

- Margin
- TFSA
- RRSP
- IRA
- Cash

Account subtype is free text, limited to 80 characters after trimming.

## 2.3 Account source

The account database supports:

- `manual`
- `broker_import`

Manual accounts are created by the user.

Broker-imported accounts are intended for future broker integration.

The account registry must remain independent of broker credentials and broker synchronization metadata.

## 2.4 Transaction types

Supported transaction types:

- `DEPOSIT`
- `WITHDRAWAL`
- `TRANSFER`

## 2.5 Transaction statuses

Supported statuses:

- `PENDING`
- `COMPLETED`
- `CANCELLED`

A completed transaction must have an effective date.

Pending and cancelled transactions must not have an effective date.

The effective date, rather than the transaction initiation date, drives historical reporting.

## 2.6 Transfers

An internal transfer is one canonical transaction with two account references.

It must not be represented by two independent transaction records.

A transfer stores:

- Sending amount.
- Sending currency.
- Receiving amount.
- Receiving currency.
- Exchange rate.
- Source account.
- Destination account.

Exchange rate direction:

**Receiving currency units per one sending currency unit.**

For same-currency transfers:

- Sending and receiving currencies must match.
- Sending and receiving amounts must match.
- Exchange rate must equal 1.

For cross-currency transfers, the actual received amount must be preserved.

## 2.7 Transaction corrections, deletion and reversals

The final V1 decisions are:

- Pending transactions may be cancelled.
- Pending transactions cannot be reversed.
- Completed transactions may be edited or physically deleted.
- Completed transactions may also be reversed.
- A transaction can have at most one reversal.
- A reversal is a new transaction linked to its original.
- A transfer reversal swaps the original source and destination accounts.
- Reversal amounts and currencies must be derived from the original transaction.
- Reversal operations must not introduce a new exchange conversion.
- Reversal reasons are required.

**Decision clarification:** The original Checkpoint 01 proposed preserving all completed records and avoiding silent editing/deletion. This has been superseded by the later explicit V1 product decision to allow editing and physical deletion. Do not reintroduce soft deletion or mandatory audit history without a new product decision.

The database already contains reversal relationships and a single-reversal constraint. The transaction RPC layer must enforce the full reversal rules.

## 2.8 Account archival

Accounts are archived rather than deleted.

Archiving must reject accounts with pending transactions.

Archived accounts retain their stable IDs and historical transaction relationships.

---

# 3. INITIAL ARCHITECTURE AUDIT — CHECKPOINT 01

The initial audit inspected 26 source files and performed two live database inspections.

The original cumulative issue register reached CM-148.

The initial audit covered:

## 3.1 Capital Management data model and calculations

1. `lib/capital/types.ts`
2. `lib/capital/preview-data.ts`
3. `lib/capital/calculations.ts`
4. `lib/capital/helpers.ts`
5. `lib/capital/constants.ts`
6. `lib/capital/formatters.ts`
7. `lib/capital/analytics.ts`

## 3.2 Capital Management page and components

8. `app/capital/page.tsx`
9. `components/capital/BrokerageAccountsCard.tsx`
10. `components/capital/PendingActivityPanel.tsx`
11. `components/capital/FundingActivityCard.tsx`
12. `components/capital/CapitalActivitySummaryCard.tsx`
13. `components/capital/RecentTransactionsTable.tsx`
14. `components/capital/AddTransactionDrawer.tsx`
15. `components/capital/CapitalFilters.tsx`
16. `components/capital/CapitalHeader.tsx`
17. `components/shared/DateRangePicker.tsx`
18. `components/capital/CapitalMetricCard.tsx`
19. `components/capital/StatusBadge.tsx`
20. `components/capital/CapitalTypeIcon.tsx`

## 3.3 Existing storage and Supabase infrastructure

21. `lib/storage/accountStorage.ts`
22. `lib/supabase.ts`
23. `lib/server/supabaseAdmin.ts`
24. `lib/supabaseAdmin.ts`

## 3.4 Existing security and persistence references

25. `app/api/ibkr/flex/route.ts`
26. `lib/storage/supabaseExpenseStorage.ts`

The audit also examined relevant live Supabase tables and broker connection references.

---

# 4. INITIAL AUDIT FINDINGS — CONSOLIDATED

The following findings remain part of the project history and should not be forgotten simply because implementation has started.

## 4.1 Financial data model

Initial findings included:

- Monetary values used JavaScript `number`.
- Authoritative financial values should use PostgreSQL `NUMERIC` and decimal-safe processing.
- Transaction types allowed combinations that could be invalid for particular operations.
- Transaction date and effective date semantics were insufficiently explicit.
- Missing, null and empty values needed consistent handling.
- Reversal and correction behavior needed a defined domain model.

The new database foundation addresses several of these requirements.

The transaction RPC and analytics layers must address the remaining business rules.

## 4.2 Preview data and calculations

Initial findings included:

- Preview IDs must never become permanent database IDs.
- Cross-currency fixtures were incomplete.
- Some calculations depended on callers filtering completed transactions correctly.
- Currency fallbacks could silently produce incorrect totals.
- Effective dates must drive reporting.
- Floating-point arithmetic is unsuitable for authoritative monetary calculations.
- Date validation must be strict.
- Analytics should eventually use bounded datasets or database-backed aggregates.

These concerns remain relevant when connecting real records to the existing UI.

## 4.3 Capital Management page

The existing page uses static preview data.

Initial risks included:

- Client-side filtering and sorting on an unrestricted production ledger.
- Transaction-date filtering instead of effective-date reporting.
- Currency filters potentially excluding the receiving side of cross-currency transfers.
- Broker filters potentially creating misleading totals for transfers between brokerage accounts.
- Recent transaction ordering based on inconsistent date fields.
- Need for authenticated, user-scoped production queries.

The UI remains intentionally unwired.

## 4.4 Add Transaction Drawer

Initial findings included:

- Hardcoded account IDs.
- Hardcoded initial transaction date.
- Preview transaction IDs.
- JavaScript `Number()` parsing.
- Inconsistent receiving amount and exchange-rate validation.
- Potentially inherited transfer methods from hidden form state.
- Attachment selection storing a filename rather than securely uploading a file.
- Missing backend validation.
- Missing duplicate-submission protection.
- Unclear create/update lifecycle and field mutability.

These must be addressed when implementing the production transaction workflow.

## 4.5 UI and date handling

Initial findings included:

- Duplicate date preset calculations.
- Custom date range and selected preset state potentially becoming inconsistent.
- Partial custom ranges affecting filtering.
- Calendar state not always synchronizing with external preset changes.
- Browser-local dates and UTC month grouping requiring a consistent reporting timezone policy.
- Currency-specific formatting requirements.
- JPY precision differing from CAD and USD.
- Unknown statuses and transaction types should be rejected at the data boundary.
- Components relying on parent components to supply correctly filtered records.

Do not automatically redesign the existing UI as part of backend implementation.

## 4.6 Existing account storage

`lib/storage/accountStorage.ts` derives account information from execution records.

It is not suitable as the canonical Capital Management account registry because:

- Accounts without executions cannot be represented reliably.
- It uses text account values rather than stable account UUIDs.
- It limits source records before deduplication.
- It labels broker-derived account information as manual.
- It is not an appropriate source of truth for Capital Management.

The new canonical account table solves the account-registry requirement.

---

# 5. INITIAL SUPABASE AND SECURITY AUDIT

## 5.1 Supabase clients

Reviewed:

- `lib/supabase.ts`
- `lib/server/supabaseAdmin.ts`
- `lib/supabaseAdmin.ts`

Initial findings:

- Browser client uses the public URL and anon key.
- Environment variables were asserted non-null without runtime validation.
- Browser and privileged server operations must remain separated.
- Two service-role modules were exact duplicates.
- Service-role operations bypass RLS.
- Service-role operations require explicit ownership enforcement.
- Privileged modules should have explicit server-only protection.
- Runtime environment validation was missing.
- Server auth options should explicitly disable unnecessary persistence and automatic refresh.
- A singleton service-role client must remain stateless and must not carry per-user identity.

These original findings remain outstanding audit items unless addressed separately.

They must not be assumed fixed by the Capital Management schema work.

## 5.2 Legacy IBKR Flex endpoint

Reviewed:

`app/api/ibkr/flex/route.ts`

Initial findings CM-111 through CM-125 included:

- No visible route-level authentication.
- Active broker connection selected globally without user ownership filtering.
- Service-role access.
- Complete broker statement XML returned in HTTP responses.
- Upstream XML exposed in an error response.
- Raw broker XML written to application logs.
- Unencoded database values used in provider URLs.
- Missing upstream request timeout and response-size limits.
- Missing upstream HTTP and IBKR response-status validation.
- Fragile XML readiness detection.
- No concurrency lock or idempotency mechanism.
- Inappropriate failure HTTP statuses.
- Missing explicit cache protection.
- No visible route-specific abuse protection.
- Dependency on the duplicate legacy admin client.
- Polling not coordinated with serverless execution limits.
- Unnecessary connection columns fetched.

A recursive search did not identify `proxy.ts`, `proxy.js`, `middleware.ts`, or `middleware.js` at the time of the original audit.

**Scope decision:** Do not expand Capital Management into a complete IBKR synchronization rewrite. Determine whether the legacy endpoint is still required and audit its security separately.

## 5.3 Expenses storage and database

Reviewed:

`lib/storage/supabaseExpenseStorage.ts`

Positive patterns:

- Authenticated Supabase client.
- Retrieves authenticated user.
- Sets `user_id` on insertion.
- User-scoped reads, updates and deletes.
- Soft deletion in the storage API.

Initial concerns:

- Inconsistent auth error handling.
- Query errors sometimes converted into empty results.
- Monetary values typed as JavaScript numbers.
- Broad `select("*")`.
- Update/delete operations not verifying affected row counts.
- Duplicated create/update mappings.
- Mutable fields not clearly distinguished.
- Insufficient storage-layer validation.

**Decision:** Do not copy this CRUD implementation blindly for Capital Management. Financial transfers need stronger atomicity and database validation.

## 5.4 Live Expenses database inspection

The original live inspection found:

- RLS enabled.
- FORCE RLS disabled.
- Four owner-based RLS policies.
- Only a primary-key constraint reported.
- No reported foreign key from `user_id` to `auth.users`.
- Monetary columns using fixed-decimal NUMERIC types.
- Several possible index and privilege concerns.
- A recurring unique index differing from earlier documentation.

These were initial audit findings, not changes made by Capital Management.

## 5.5 Live broker connections inspection

Original tables inspected:

- `public.broker_connections`
- `public.brokerage_accounts`

At that time:

- `broker_connections` existed.
- `brokerage_accounts` did not exist.

The existing broker connection table mixed:

- Broker credentials.
- External broker account identity.
- Account alias.
- Connection status.
- Synchronization metadata.

Relevant fields included:

- `flex_token`
- `flex_query_id`
- `broker`
- `broker_account_id` (TEXT)
- `account_alias`
- `is_active`
- `last_sync_at`
- `last_sync_status`
- `last_sync_error`
- `last_sync_execution_count`
- `sync_cursor_date`

Original findings CM-141 through CM-148 included:

- Reported TRUNCATE privileges for client roles.
- Unnecessary REFERENCES and TRIGGER privileges.
- Authenticated SELECT access to a table containing broker tokens.
- Authenticated UPDATE access to server-managed fields.
- No reported user-defined triggers.
- NULL external account IDs potentially allowing multiple unique-index entries.
- No separate canonical brokerage account table.
- DELETE RLS policy existing without a corresponding reported authenticated DELETE grant.

These concerns were not remediated by the Capital Management migrations described below. They remain separate security work.

---

# 6. FINAL CAPITAL MANAGEMENT ARCHITECTURE DECISIONS

The initial audit considered creating a `public.brokerage_accounts` table.

That proposal has been superseded.

The implemented canonical account registry is:

`capital_private.accounts`

The Capital Management subsystem uses dedicated schemas:

- `capital_private`
- `capital_api`

## 6.1 Canonical account registry

`capital_private.accounts` owns stable internal account UUIDs.

It supports:

- Manual accounts.
- Broker-import account source classification.
- Account name.
- Broker name.
- Account category.
- Account subtype.
- Currency, including `UNKNOWN`.
- External account ID.
- Active/archived status.
- Ownership through `user_id`.

## 6.2 Broker connections

The existing `public.broker_connections` table remains separate.

It continues to represent broker integration identity, credentials and synchronization metadata.

The existing TEXT `broker_account_id` remains an external broker identifier.

Do not treat it as the new canonical account UUID.

Future broker integration must explicitly link broker connections to canonical Capital Management accounts without damaging existing credential or synchronization behavior.

No broker synchronization rewrite is part of the current task.

## 6.3 Canonical transactions

`capital_private.transactions` is the single canonical Capital Management transaction ledger.

Deposits, withdrawals and transfers are separate transaction types within this ledger.

Internal transfers use one transaction record with two account references.

Capital transactions remain separate from canonical trading executions.

## 6.4 Reporting currency

Supported reporting currencies, in this order:

1. CAD
2. USD
3. EUR
4. GBP
5. JPY
6. INR

`UNKNOWN` must never appear as a reporting currency.

Capital Management calculations must not alter trading P&L or portfolio valuation.

---

# 7. DATABASE IMPLEMENTATION — MIGRATIONS 001–007

Seven migrations have been created, reviewed and applied.

All seven received a PASS review.

## 7.1 Migration 001 — Security Foundation

File:

`supabase/migrations/20261120012229_capital_management_security_foundation.sql`

Purpose:

- Create `capital_private`.
- Create `capital_api`.
- Stop migration execution if either schema already exists.
- Establish explicit schema permissions.
- Revoke default access from PUBLIC, anon, authenticated and service_role.
- Grant the required schema USAGE permissions to authenticated callers.

Important security design:

- `capital_private` is not exposed through the Supabase Data API.
- `capital_api` is the approved RPC interface.
- Private tables are not made directly accessible to ordinary clients.

**Review status: PASS.**  
**Application status: Applied.**

## 7.2 Migration 002 — Canonical Capital Accounts

File:

`supabase/migrations/20261120014500_capital_accounts.sql`

Creates:

`capital_private.accounts`

Important fields:

- `id`
- `user_id`
- `account_name`
- `broker_name`
- `account_type`
- `currency`
- `account_source`
- `external_account_id`
- `status`
- `created_at`
- `updated_at`

Includes:

- User ownership foreign key.
- Composite unique constraint on `(user_id, id)`.
- Account name validation.
- Broker name validation.
- External identity validation.
- Currency validation.
- Account type validation.
- Account source validation.
- Account status validation.
- Imported account identity validation.
- Per-user external broker identity uniqueness.
- User/status index.
- User/currency index.
- Automatic `updated_at` trigger.
- RLS enabled and forced.
- No direct table access granted.

**Review status: PASS.**  
**Application status: Applied.**

## 7.3 Migration 003 — Canonical Capital Transactions

File:

`supabase/migrations/20261120020300_capital_transactions.sql`

Creates:

`capital_private.transactions`

Important fields:

- `id`
- `user_id`
- `idempotency_key`
- `transaction_type`
- `status`
- `amount`
- `currency`
- `from_account_id`
- `to_account_id`
- `received_amount`
- `received_currency`
- `exchange_rate`
- `transaction_date`
- `effective_date`
- `method`
- `counterparty_institution`
- `reference_number`
- `notes`
- `reversal_of_transaction_id`
- `reversal_reason`
- `created_at`
- `updated_at`

Database rules include:

- Per-user idempotency uniqueness.
- Valid transaction types and statuses.
- Positive financial amounts.
- Supported transaction currencies.
- Positive received amounts.
- Positive exchange rates.
- Currency-specific amount precision.
- JPY zero-decimal precision.
- Other supported currencies two-decimal amount precision.
- Up to 12 decimal places for exchange rates.
- Type-specific transaction structure.
- Same-currency transfer consistency.
- Effective-date validation.
- Optional text length and trimming validation.
- Reversal relationship validation.
- Account ownership foreign keys.
- Reversal ownership foreign key.
- At most one reversal per original transaction.
- Indexes for completed activity, pending activity and account-level activity.
- Automatic `updated_at` trigger.
- RLS enabled and forced.
- No direct table access granted.

**Important distinction:** The schema enforces structural constraints. It does not implement the complete transaction business workflow.

The transaction RPC layer must still enforce:

- Valid status transitions.
- Reversal eligibility and type mapping.
- Exact reversal derivation from the original.
- Cross-currency exchange-rate mathematical consistency with appropriate rounding.
- Account archival concurrency rules.
- Idempotent retry behavior.

**Review status: PASS.**  
**Application status: Applied.**

## 7.4 Migration 004 — Capital Account API Functions

File:

`supabase/migrations/20261120030700_capital_api_functions.sql`

Introduces the initial account RPC functions:

Private implementations:

- `list_accounts_impl`
- `create_manual_account_impl`
- `update_account_impl`
- `archive_account_impl`

Exposed API wrappers:

- `capital_api.list_accounts`
- `capital_api.create_manual_account`
- `capital_api.update_account`
- `capital_api.archive_account`

Important behavior:

- Authenticated user identity derived from `auth.uid()`.
- Account ownership enforced server-side.
- Manual account creation.
- Account listing.
- Account updates.
- Broker integration identity protected after linking/import.
- Account archive operation locks the account.
- Pending transactions prevent account archival.

**Review status: PASS.**  
**Application status: Applied.**

## 7.5 Migration 005 — RPC Security Boundary

File:

`supabase/migrations/20261120033700_capital_rpc_security_boundary.sql`

Purpose:

- Establish explicit security boundaries between private implementations and exposed API wrappers.
- Use SECURITY DEFINER for private implementation helpers.
- Use SECURITY INVOKER for exposed API wrappers.
- Set empty search paths.
- Revoke broad execution privileges.
- Grant only the permissions required by authenticated callers.
- Keep `capital_private` unexposed through the Data API.

Important implementation detail:

Authenticated callers require the necessary schema USAGE and private helper execution privileges for SECURITY INVOKER wrappers to call the private helpers.

This does not expose the private schema through the Data API or grant direct table access.

**Review status: PASS.**  
**Application status: Applied.**

## 7.6 Migration 006 — Account Subtypes

File:

`supabase/migrations/20261120042100_capital_account_subtypes.sql`

Adds:

`account_subtype TEXT`

Includes:

- Nullable subtype.
- Trim validation.
- Length between 1 and 80 characters when present.
- Column documentation.

**Review status: PASS.**  
**Application status: Applied.**

## 7.7 Migration 007 — Account RPC Subtype Support

File:

`supabase/migrations/20261120043000_capital_account_rpc_subtypes.sql`

Recreates the account API functions to support `account_subtype`.

Updated functions:

- List accounts.
- Create manual account.
- Update account.
- Archive account.

The new RPC signatures include subtype support where required.

The migration also:

- Drops prior wrappers and private implementations.
- Recreates private implementations.
- Recreates exposed API wrappers.
- Preserves SECURITY DEFINER private helpers.
- Preserves SECURITY INVOKER exposed wrappers.
- Sets empty search paths.
- Reapplies ownership.
- Reapplies execution privileges.
- Reapplies function documentation.

**Review status: PASS.**  
**Application status: Applied.**

---

# 8. DATABASE MIGRATION REVIEW STATUS

| Migration | Description | Review | Applied |
|---|---|---|---|
| 001 | Security Foundation | PASS | Yes |
| 002 | Canonical Accounts | PASS | Yes |
| 003 | Canonical Transactions | PASS | Yes |
| 004 | Account API Functions | PASS | Yes |
| 005 | RPC Security Boundary | PASS | Yes |
| 006 | Account Subtypes | PASS | Yes |
| 007 | Account RPC Subtype Support | PASS | Yes |

**All seven migrations have been reviewed. No outstanding review of migrations 001–007 is required.**

Do not repeat these reviews unless a later change affects them.

---

# 9. ACCOUNT BACKEND IMPLEMENTATION

## 9.1 Storage file created

File:

`lib/storage/supabaseCapitalStorage.ts`

The storage layer was created to communicate with the Capital Management account RPC API.

Exports include:

- `CapitalAccountCategory`
- `CreateCapitalAccountInput`
- `UpdateCapitalAccountInput`
- `loadCapitalAccounts()`
- `createCapitalAccount(input)`
- `updateCapitalAccount(input)`
- `archiveCapitalAccount(accountId)`

## 9.2 Existing UI compatibility

The new storage layer maps database account records into the existing `BrokerageAccount` UI model.

Mappings include:

- `account_subtype ?? account_type` for type display.
- `manual` / `broker_import` to `MANUAL` / `CONNECTED`.
- `active` / `archived` to `ACTIVE` / `CLOSED`.
- `UNKNOWN` currency is supported.

The storage layer does not require the existing UI to be redesigned.

## 9.3 TypeScript and production build verification

Completed:

`npx tsc --noEmit`

Result: PASS.

Completed:

`npm run build`

Result: PASS.

These checks were run after the account storage implementation.

They verify compilation and build integrity, not the correctness of every future transaction operation.

---

# 10. LIVE ACCOUNT RPC TESTING

Account RPCs were tested against the live Supabase project using the authenticated browser session in Chrome DevTools.

No access tokens, anon keys or sensitive credentials should be pasted into project notes or chat.

## 10.1 List accounts

RPC:

`list_accounts`

Result:

- HTTP 200.
- Schema profile headers corrected.
- Account listing verified.

## 10.2 Create manual account

RPC:

`create_manual_account`

An initial implementation issue was discovered:

`RETURNING id` was ambiguous because the function used `RETURNS TABLE`, creating an output variable with the same name.

The insert was corrected to use an explicit table alias:

`RETURNING inserted.id`

The RPC was retested successfully.

Account persistence was verified using a separate list request.

## 10.3 Update account

RPC:

`update_account`

Verified:

- Account name update.
- Broker name update.
- Subtype update.
- Persisted values through a separate list operation.

## 10.4 Archive account

RPC:

`archive_account`

Verified:

- Archive request succeeded.
- Account status persisted as archived.
- Persisted status was confirmed using a separate list operation.

## 10.5 Retained test account

The following account was deliberately retained as an archived test record:

- Account ID: `f0c285ca-039d-4e7c-ab51-1c25c21a6829`
- Account name: `Capital RPC Test Account Updated`
- Broker: `Test Broker Updated`
- Category: `brokerage`
- Subtype: `RPC Test Updated`
- Currency: `USD`
- Source: `manual`
- Status: `archived`

Do not delete this test record automatically. It can remain available for future account-listing and archival verification.

## 10.6 Account lifecycle result

| Operation | Live result |
|---|---|
| Create | PASS |
| List | PASS |
| Update | PASS |
| Archive | PASS |

**Account lifecycle milestone: COMPLETE.**

## 10.7 Remaining account-specific questions

One behavior remains worth reviewing:

The current update RPC does not explicitly prevent updating an archived account.

We have not established a final product rule for whether archived accounts may still have their descriptive fields edited.

Do not treat this as a confirmed bug. Decide the intended lifecycle rule before changing the function.

Broker-import account creation and synchronization linking also remain future integration work.

---

# 11. CURRENT IMPLEMENTATION STATUS

| Area | Current status |
|---|---|
| Initial architecture audit | Complete |
| Original 26-file review | Complete |
| Original issue register CM-001–CM-148 | Established |
| Capital Management database schemas | Applied |
| Capital accounts table | Applied |
| Capital transactions table | Applied |
| Database RLS and privilege foundation | Applied |
| Account RPC security boundary | Applied |
| Account subtype support | Applied |
| Account RPC implementation | Applied |
| Account storage layer | Implemented |
| Account lifecycle live testing | Passed |
| TypeScript check | Passed |
| Production build | Passed |
| Transaction RPC engine | Not yet completed/verified |
| Transaction storage layer | Not yet completed |
| Transaction live tests | Not yet completed |
| Capital analytics integration | Not yet completed |
| UI integration with real data | Not started |
| End-to-end integration tests | Not completed |
| Load testing | Not completed |

**Do not describe Capital Management as a fully completed backend yet.**

The database foundation and account lifecycle backend are complete. The transaction engine and analytics integration are still required.

---

# 12. NEXT PHASE — TRANSACTION BACKEND

This is the next development phase.

Do not begin UI integration yet.

## 12.1 First action after the break

Inspect the migration inventory and determine whether any transaction API/RPC migration has already been created.

Run:

```bash
ls -1 supabase/migrations | sort
```

Then search for existing transaction RPC implementations:

```bash
rg -n "create_.*transaction|update_.*transaction|complete_.*transaction|cancel_.*transaction|reverse_.*transaction|delete_.*transaction" supabase/migrations
```

Do not assume transaction RPC functions exist just because the canonical transactions table exists.

If no transaction RPC implementation exists, design and implement it as the next backend milestone.

## 12.2 Transaction RPC operations

The transaction API must support the approved V1 workflows.

Expected operations:

- Create deposit.
- Create withdrawal.
- Create transfer.
- List transactions.
- Update transaction.
- Complete pending transaction.
- Cancel pending transaction.
- Delete transaction.
- Reverse completed transaction.

The final function signatures should be designed before writing the migration.

Avoid building one oversized RPC that handles every possible operation through loosely typed parameters.

Use clear operation boundaries and consistent validation.

## 12.3 Critical transaction invariants

The transaction RPC implementation must enforce the following.

### A. Authentication and ownership

- Derive the user from `auth.uid()`.
- Never trust a client-supplied `user_id`.
- Verify account ownership.
- Reject cross-user account references.
- Reject invalid or archived accounts where the operation requires an active account.
- Do not expose private transaction tables directly.

### B. Financial validation

- Positive amounts.
- Supported currencies only.
- Exact currency precision.
- Valid transaction structure.
- Same-currency transfer consistency.
- Cross-currency mathematical consistency.
- Correct rounding behavior for received amounts.
- No floating-point monetary calculations.

A cross-currency transfer must preserve the actual received amount. It must not silently recalculate and overwrite the broker or bank's recorded amount.

### C. Idempotency

The transaction table already contains:

`idempotency_key`

with unique per-user enforcement.

The backend must reuse the same key when retrying the same request.

Important cases:

- Duplicate button clicks.
- Network retries.
- Lost responses.
- Concurrent duplicate submissions.
- Reuse of the same key with different request data.

An idempotent retry must not create a duplicate financial movement.

### D. Status lifecycle

Enforce permitted transitions.

At minimum:

- Pending to completed.
- Pending to cancelled.
- No reversal of pending transactions.
- No accidental completion of cancelled transactions.
- Completed records cannot silently become pending again.

The approved edit and delete rules must be implemented without undermining these lifecycle constraints.

### E. Reversal behavior

For a reversal:

- Original must exist.
- Original must belong to the authenticated user.
- Original must be completed.
- Original must not itself be a reversal.
- Original must not already have a reversal.
- Reversal fields must be derived from the original.
- Deposit and withdrawal directions must be inverted.
- Transfer source and destination must be swapped.
- Original sending and receiving monetary values must be preserved correctly.
- No additional conversion should be introduced.

### F. Concurrency and account archival

This is particularly important.

The existing archive RPC locks the account row and rejects pending transactions.

Transaction RPC functions must lock the same account rows when creating or changing transactions.

For transfers:

- Lock both relevant accounts.
- Acquire locks in deterministic UUID order.
- Avoid deadlocks.
- Prevent a transaction from racing with account archival.

The archive and transaction operations must follow compatible locking rules.

### G. Reporting

Only completed transactions should contribute to completed capital movement reporting.

Reporting periods must use `effective_date`.

Pending transactions must remain separate from completed historical reporting.

## 12.4 Transaction RPC review standard

Review each implementation before applying it.

Check:

- Function security mode.
- Search path.
- Ownership checks.
- Validation.
- Locking.
- Idempotency.
- Error handling.
- Financial precision.
- Status transitions.
- Reversal rules.
- Privileges.
- Function ownership.
- API wrapper behavior.

Do not approve code simply because it compiles.

---

# 13. TRANSACTION STORAGE LAYER

After the transaction RPC migration and functions have been reviewed and applied, build the TypeScript storage layer.

Expected location:

`lib/storage/supabaseCapitalStorage.ts`

The existing file already contains account operations.

Extend it carefully or create a separate transaction storage module if that produces a cleaner separation.

Do not duplicate account functionality.

The transaction layer should provide strongly typed operations and explicit result/error handling.

It should not become a second financial calculation engine.

Database RPCs remain authoritative for protected financial operations.

The storage layer should normalize the database responses into the application's canonical Capital Management domain types.

---

# 14. LIVE TRANSACTION TESTING

After transaction storage is implemented, test the actual Supabase RPCs using authenticated sessions.

Required test cases:

## 14.1 Deposits

- Create pending deposit.
- Create completed deposit.
- Complete pending deposit.
- Cancel pending deposit.
- Edit permitted fields.
- Delete as approved by the V1 rules.

## 14.2 Withdrawals

- Create pending withdrawal.
- Create completed withdrawal.
- Complete pending withdrawal.
- Cancel pending withdrawal.
- Edit permitted fields.
- Delete as approved by the V1 rules.

## 14.3 Same-currency transfers

- Correct source and destination.
- Equal sending and receiving amounts.
- Exchange rate exactly 1.
- Reject same-account transfer.
- Reject incorrect monetary values.
- Confirm only one canonical transaction is created.

## 14.4 Cross-currency transfers

- Different sending and receiving currencies.
- Correct exchange rate direction.
- Correct received amount.
- Correct currency precision.
- Legitimate rounding.
- Reject invalid rate/amount combinations.
- Preserve the actual received amount.

## 14.5 Reversals

Test:

- Deposit reversal.
- Withdrawal reversal.
- Same-currency transfer reversal.
- Cross-currency transfer reversal.
- Reversal of a pending transaction rejection.
- Reversal of a cancelled transaction rejection.
- Reversal of an existing reversal rejection.
- Duplicate reversal rejection.

## 14.6 Idempotency

Test:

- Same request and same idempotency key.
- Same request submitted concurrently.
- Network retry after successful database commit.
- Same key with different request content.
- Duplicate submissions from the UI.

## 14.7 Ownership and security

Test:

- User A cannot read User B's accounts.
- User A cannot create a transaction referencing User B's account.
- User A cannot update User B's transaction.
- User A cannot delete User B's transaction.
- User A cannot reverse User B's transaction.
- Anonymous requests are rejected.
- Direct table access remains denied.

## 14.8 Concurrency

Test:

- Two transactions against the same account.
- Two simultaneous transfers involving the same accounts.
- Opposite-direction transfers.
- Archiving while a transaction is being created.
- Creating a transaction while an account is being archived.
- Duplicate requests arriving concurrently.

Do not claim concurrency safety without testing the relevant behavior.

---

# 15. CAPITAL MANAGEMENT ANALYTICS

Once transaction operations and persistence are verified, implement the production analytics layer.

Capital Management analytics must remain separate from trading P&L and portfolio valuation.

Expected areas:

- Total deposits.
- Total withdrawals.
- Net external capital movement.
- Transfers between accounts.
- Account-level capital activity.
- Pending capital activity.
- Completed historical activity.
- Date-range summaries.
- Currency-aware reporting.

Important calculation rule:

**Internal transfers must not be counted as new external capital entering or leaving the user's overall financial system.**

An internal transfer changes the distribution of capital between tracked accounts. It is not an external deposit or withdrawal.

For account-level views, transfers must still be represented as outgoing and incoming movements.

Reporting must use completed transactions and their effective dates.

Reporting currency conversion must use the approved reporting currency selection and a consistent conversion policy.

`UNKNOWN` must never be included in currency conversion or aggregated into an invented currency total.

Use bounded datasets and appropriate database indexes for production reporting.

---

# 16. FRONTEND INTEGRATION — ONLY AFTER BACKEND VERIFICATION

The existing Capital Management UI should remain the approved interface.

The current preview data should not be removed until the real backend is ready to replace it.

Once the transaction backend, storage layer and analytics have passed verification:

1. Connect account listing to real Supabase data.
2. Connect account creation.
3. Connect account editing.
4. Connect account archival.
5. Connect transaction listing.
6. Connect deposits and withdrawals.
7. Connect transfers.
8. Connect transaction lifecycle controls.
9. Connect reversals.
10. Connect summaries and analytics.
11. Implement production filtering and pagination.
12. Remove static preview dependencies when no longer needed.

The following existing UI components should be considered for integration:

- `app/capital/page.tsx`
- `components/capital/BrokerageAccountsCard.tsx`
- `components/capital/PendingActivityPanel.tsx`
- `components/capital/FundingActivityCard.tsx`
- `components/capital/CapitalActivitySummaryCard.tsx`
- `components/capital/RecentTransactionsTable.tsx`
- `components/capital/AddTransactionDrawer.tsx`
- `components/capital/CapitalFilters.tsx`
- `components/capital/CapitalHeader.tsx`
- `components/capital/CapitalMetricCard.tsx`
- `components/capital/StatusBadge.tsx`
- `components/capital/CapitalTypeIcon.tsx`

Do not redesign the page simply because it is being connected to production data.

Preserve the existing layout unless a concrete functional or usability issue requires a change.

---

# 17. TESTING AND PRODUCTION READINESS

Before considering Capital Management V1 production-ready, verify:

## Database

- All migrations apply cleanly.
- Constraints reject invalid records.
- Foreign keys enforce ownership.
- RLS and privileges are correct.
- RPC functions have appropriate security settings.
- Indexes support actual query patterns.

## Financial correctness

- Currency precision.
- Exchange-rate direction.
- Cross-currency rounding.
- Transfer accounting.
- Reversal calculations.
- Effective-date reporting.
- No double-counting of transfers.
- No interference with trading P&L.

## Application

- TypeScript checks pass.
- Production build passes.
- Storage functions handle errors consistently.
- UI loading and empty states work.
- Duplicate submissions are prevented.
- Pagination and filtering operate on bounded data.
- No preview IDs enter production records.

## Security

- User isolation.
- Account ownership.
- Transaction ownership.
- Authenticated RPC access.
- No unintended direct table access.
- No exposed private schema.
- No service-role credentials in client code.

## Reliability and performance

- Transaction operations are atomic.
- Idempotency works under retries.
- Concurrency behavior is tested.
- Archive/transaction races are safe.
- Query plans and indexes are reviewed.
- Load testing is performed before making performance claims.

---

# 18. SCOPE PROTECTION

Capital Management work must not casually modify:

- Canonical trading `executions`.
- Trade pairing.
- FIFO.
- Trading P&L calculations.
- IBKR parsing.
- Commission accounting.
- Expenses calculations.
- Notes V2.
- Existing broker synchronization behavior.

Any required integration change must be separately identified, justified and reviewed.

Preserve existing database columns, indexes and behavior unless an explicit migration plan has been reviewed and approved.

The existing `docs/` directory contains working documentation. Preserve user-authored changes when staging and committing.

---

# 19. GIT CHECKPOINT — NOVEMBER 20, 2026

We are preparing a Git checkpoint for the work completed so far.

The checkpoint should include:

- Capital Management database migrations 001–007.
- Account RPC implementation.
- RPC security boundary.
- Account subtype support.
- `lib/storage/supabaseCapitalStorage.ts`.
- Relevant Capital Management documentation updates.
- Any related tests or implementation files that belong to this work.

Before committing:

```bash
git status --short
git diff --stat
```

Inspect the modified and untracked files.

Do not accidentally omit relevant `docs/` changes.

Stage the intended checkpoint changes:

```bash
git add -A
```

Verify the staged changes:

```bash
git diff --cached --stat
git diff --cached
```

Commit:

```bash
git commit -m "feat(capital): establish account and database foundation"
```

Push:

```bash
git push origin main
```

After pushing, verify:

```bash
git status --short
git log -1 --oneline
```

Expected result:

- Commit successfully pushed to `origin/main`.
- Working tree clean, unless unrelated intentional changes remain.
- Checkpoint notes included in the commit.

**Git checkpoint is not complete until the actual commit and push are verified.**

---

# 20. CURRENT CHECKPOINT SUMMARY

## Completed

- Initial Capital Management architecture audit.
- Review of 26 original source files.
- Cumulative issue register through CM-148.
- Supabase client and privileged-access review.
- Legacy IBKR Flex endpoint review.
- Expenses storage review.
- Live Expenses database inspection.
- Live broker connections database inspection.
- Capital Management V1 scope and financial rules established.
- Dedicated `capital_private` and `capital_api` schemas.
- Canonical capital accounts table.
- Canonical capital transactions table.
- Ownership and financial constraints.
- RLS and privilege foundation.
- Account API functions.
- RPC security boundary.
- Account subtype support.
- Account RPC subtype support.
- All seven migrations reviewed and applied.
- Account storage layer implemented.
- Account create/list/update/archive verified live.
- TypeScript check passed.
- Production build passed.

## Not completed

- Transaction RPC functions.
- Transaction storage operations.
- Live transaction testing.
- Transaction concurrency verification.
- Complete idempotency verification.
- Transaction reversal testing.
- Capital analytics integration.
- Production UI integration.
- End-to-end tests.
- Load testing.

---

# 21. NEXT EXACT ACTION

**After the break, resume with the transaction backend.**

First run:

```bash
ls -1 supabase/migrations | sort
```

Then:

```bash
rg -n "create_.*transaction|update_.*transaction|complete_.*transaction|cancel_.*transaction|reverse_.*transaction|delete_.*transaction" supabase/migrations
```

Paste the results.

We will establish whether transaction RPC functions already exist. If they do, review them one at a time. If they do not, design the transaction RPC architecture and create the next migration.

Do not re-review migrations 001–007.

Do not connect the UI yet.

---

# CHECKPOINT 02 — FINAL STATUS

**Database foundation:** COMPLETE  
**Account backend:** COMPLETE  
**Account live testing:** PASSED  
**Transaction backend:** NOT COMPLETE  
**Analytics integration:** NOT COMPLETE  
**UI integration:** NOT STARTED  
**Production readiness:** NOT YET ESTABLISHED  

**Next milestone:** Build and verify the Capital Management transaction engine.

**Working principle:** Protect canonical financial data, enforce business rules at the database boundary, verify real behavior against Supabase, and integrate the UI only after the backend is dependable.