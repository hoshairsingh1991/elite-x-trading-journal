# Elite X — Capital Management Database & Security Audit Checkpoint

**Date:** November 21, 2026  
**Project:** Elite X Trading Journal  
**Area:** Capital Management  
**Production Environment:** Supabase — elite-x-production  
**Project Ref:** vybvulhekvirefnujijh  
**Region:** East US (North Virginia)

---

# 1. Executive Summary

Capital Management database migrations 001–008 have been deployed to the production Supabase database.

The Local and Remote Supabase migration histories are synchronized.

The database foundation, capital accounts, capital transactions, account API, account subtype support, transaction API, and associated database structures have been established.

After Migration 008 was deployed, a deeper security audit was performed. That audit identified a confirmed privilege-boundary weakness in the transaction API architecture.

**The seven private transaction implementation functions currently grant direct EXECUTE privileges to the authenticated role.**

This means authenticated users can directly execute private implementation functions instead of being restricted to the application-facing `capital_api` functions.

The underlying transaction implementation functions were reviewed individually. Static review did not identify an obvious cross-user authorization bypass. However, the direct EXECUTE grants weaken the intended API/private separation and must be corrected.

A separate, forward-only Migration 009 is planned.

Migration 008 is already deployed and must not be edited.

The immediate next task is to inspect Migration 008's final privileges section, prepare Migration 009, and review the proposed correction before deployment.

## Overall status

| Area | Status |
|---|---|
| Migrations 001–008 | DEPLOYED |
| Local migration history | SYNCHRONIZED |
| Remote migration history | SYNCHRONIZED |
| Database structure verification | COMPLETED |
| Account API static review | COMPLETED |
| Transaction API static review | COMPLETED |
| Transaction implementation review | COMPLETED |
| Function ownership inspection | COMPLETED |
| Function security inspection | COMPLETED |
| Schema privilege inspection | COMPLETED |
| Confirmed private-function privilege weakness | IDENTIFIED |
| Migration 009 | PLANNED |
| Runtime RPC testing | NOT COMPLETED |
| Cross-user security testing | NOT COMPLETED |
| Frontend integration testing | NOT COMPLETED |
| End-to-end Capital Management testing | NOT COMPLETED |

**Important:** Migration deployment and static review do not establish that the complete Capital Management system has been runtime-tested.

---

# 2. Capital Management Architecture

Capital Management is a separate financial/account management subsystem.

It is independent of the canonical trading execution ledger.

The intended database architecture is:

Application
    |
    v
Supabase RPC
    |
    v
capital_api
    |
    v
capital_private implementation functions
    |
    v
capital_private tables

The architecture separates:

- Application-facing database API
- Private database implementation
- Internal database tables

The intended benefits include:

- Centralized validation
- Ownership enforcement
- Controlled database access
- Consistent business rules
- Reduced direct table exposure
- Stable application/database contracts
- Maintainability
- Future schema evolution without unnecessary frontend changes

The API layer should be the application-facing boundary.

The private implementation layer should contain the underlying database logic.

The frontend should not directly execute private implementation functions or access internal tables.

---

# 3. Capital Management Schema Boundaries

Capital Management uses two primary schemas.

## 3.1 capital_api

Application-facing database API.

Contains RPC functions intended to be called by the application.

## 3.2 capital_private

Internal implementation layer.

Contains:

- Database tables
- Private implementation functions
- Internal helper functions
- Supporting database functionality

## 3.3 Intended security model

Authenticated application user
    |
    v
capital_api RPC function
    |
    v
Controlled private implementation
    |
    v
Database operation

The frontend should interact with Capital Management through the application-facing API.

The private implementation layer should not become an alternative application-facing API.

---

# 4. Migration History

The Capital Management migration sequence consists of migrations 001–008.

| Migration | Timestamp | File |
|---|---|---|
| 001 | 20261120012229 | capital_management_security_foundation.sql |
| 002 | 20261120014500 | capital_accounts.sql |
| 003 | 20261120020300 | capital_transactions.sql |
| 004 | 20261120030700 | capital_api_functions.sql |
| 005 | 20261120033700 | capital_rpc_security_boundary.sql |
| 006 | 20261120042100 | capital_account_subtypes.sql |
| 007 | 20261120043000 | capital_account_rpc_subtypes.sql |
| 008 | 20261121000100 | capital_transaction_api.sql |

Migration files are located in:

    supabase/migrations/

The timestamp sequence is the canonical migration order.

---

# 5. Migration 001 — Capital Management Security Foundation

**Migration:**

    20261120012229_capital_management_security_foundation.sql

**Status:** DEPLOYED

## Purpose

Establish the security foundation for Capital Management before introducing its core account and transaction data models.

## Schema boundaries

The migration establishes the foundational schema separation:

- capital_private
- capital_api

## Intended separation

`capital_private`:

- Internal database objects
- Implementation layer
- Internal persistence functionality

`capital_api`:

- Application-facing database API
- Controlled RPC access

## Deployment status

- Migration was previously applied manually.
- Migration history was reconciled afterward.
- Local and Remote migration history was verified.

---

# 6. Migration 002 — Capital Accounts

**Migration:**

    20261120014500_capital_accounts.sql

**Status:** DEPLOYED

## Purpose

Establish the Capital Management account data model.

Capital accounts represent financial accounts managed by the Capital Management subsystem.

## Database object

    capital_private.accounts

## Account model responsibilities

The account model supports:

- Account identity
- User ownership
- Account name
- Broker identification
- Currency
- External account identity
- Source information
- Account status
- Account type
- Account subtype
- Account lifecycle management

## Verified structural elements

Remote database inspection confirmed the account table structure.

The reviewed structural elements included:

- Primary key
- User ownership
- User relationship to auth.users
- Account name
- Broker
- Currency
- External identity fields
- Source
- Account status
- Account type
- Account subtype
- Composite uniqueness
- Ownership constraints

## Constraints and relationships

The account model includes structural constraints associated with:

- Account primary key
- User ownership
- User/account uniqueness
- Account identity
- Account classification
- Account status
- Account subtype

The account model is the foundational object for Capital Management transactions.

---

# 7. Migration 003 — Capital Transactions

**Migration:**

    20261120020300_capital_transactions.sql

**Status:** DEPLOYED

## Purpose

Establish the Capital Management transaction data model.

Capital transactions represent capital movements associated with Capital Management accounts.

They are separate from the canonical trading execution ledger.

## Database object

    capital_private.transactions

## Transaction model responsibilities

The transaction model supports:

- Transaction identity
- User ownership
- Account ownership
- Transaction amount
- Transaction currency
- Transaction type
- Transaction status
- Precision handling
- Transaction structure
- Idempotency
- Reversal relationships

## Verified structural elements

Remote database inspection confirmed the transaction table and reviewed its structural elements.

The inspected elements included:

- Transaction primary key
- User ownership
- User foreign key
- Account ownership relationship
- Amount
- Currency
- Transaction type
- Status
- Precision-related fields
- Transaction structure
- Idempotency-related fields
- Reversal relationship

## Ownership and referential integrity

The transaction model includes ownership relationships to Capital Management accounts.

Composite ownership relationships were reviewed as part of the structural verification.

The intended relationship prevents transactions from being associated with accounts outside their ownership context.

## Idempotency

The transaction model includes idempotency-related uniqueness constraints.

These are intended to prevent duplicate transactions caused by:

- Network retries
- Repeated submissions
- Application retry behavior
- Duplicate requests
- Interrupted operations

## Reversal support

The transaction model includes reversal relationships.

The design supports representing reversals without destructively modifying the historical transaction record.

---

# 8. Migration 004 — Capital Management API Functions

**Migration:**

    20261120030700_capital_api_functions.sql

**Status:** DEPLOYED

## Purpose

Introduce the database function/API layer used by Capital Management.

The API layer provides database-side functionality required for account management.

## Architecture

Application
    |
    v
capital_api
    |
    v
capital_private implementation
    |
    v
Database tables

The API schema acts as the application-facing boundary.

Private implementation functions contain the underlying database operations.

## Account API functions observed

The remote database contained account API functions including:

- capital_api.archive_account(p_account_id uuid)
- capital_api.create_manual_account(...)
- capital_api.list_accounts()
- capital_api.update_account(...)

The create_manual_account function includes account-related parameters such as:

- Account name
- Broker name
- Account type
- Currency
- Account subtype

Corresponding private implementation functions were also observed.

## Architectural purpose

Application-facing database operations are routed through controlled API functions rather than exposing unrestricted access to internal implementation tables.

This separation is important for:

- Security
- Validation
- Ownership enforcement
- Business rule enforcement
- Maintaining a stable application/database contract
- Future schema changes
- Frontend/database decoupling

---

# 9. Migration 005 — Capital RPC Security Boundary

**Migration:**

    20261120033700_capital_rpc_security_boundary.sql

**Status:** DEPLOYED

## Purpose

Strengthen the security boundary between application-facing RPC functionality and the private Capital Management implementation.

## Intended security boundary

The architecture distinguishes between:

- Application-facing API functions
- Private implementation functions
- Internal database tables

The intended security model requires application requests to operate through controlled API functionality.

## Schema privilege inspection

Remote schema privileges were inspected.

### capital_api

| Role | USAGE | CREATE |
|---|---|---|
| anon | false | false |
| authenticated | true | false |
| postgres | true | true |
| service_role | false | false |

### capital_private

| Role | USAGE | CREATE |
|---|---|---|
| anon | false | false |
| authenticated | true | false |
| postgres | true | true |
| service_role | false | false |

## Interpretation

The inspected privileges confirmed:

- Anonymous users do not have schema USAGE privileges.
- Authenticated users have schema USAGE privileges.
- Authenticated users do not have schema CREATE privileges.
- PostgreSQL administrative access retains expected privileges.
- service_role does not have the inspected schema privileges.

These inspections were read-only verification of the deployed database state.

**Important:** Schema USAGE privileges and function EXECUTE privileges are separate security controls. Having schema USAGE does not, by itself, mean a role can execute every function in that schema.

---

# 10. Migration 006 — Capital Account Subtypes

**Migration:**

    20261120042100_capital_account_subtypes.sql

**Status:** DEPLOYED

## Purpose

Introduce account subtype support to the Capital Management account model.

## Account classification architecture

Account Type
    |
    v
Account Subtype

Account type provides the broad classification.

Account subtype provides a more specific classification within that category.

## Account model fields

The account model includes:

- account_type
- account_subtype

## Status

- Account subtype support was included in the reviewed migration.
- Account schema was inspected during remote verification.
- Subtype structure and related constraints were reviewed.
- Migration was deployed as part of the original 001–007 manually applied migration group.

---

# 11. Migration 007 — Account Subtype RPC Support

**Migration:**

    20261120043000_capital_account_rpc_subtypes.sql

**Status:** DEPLOYED

## Purpose

Extend Capital Management RPC functionality to support account subtypes.

Migration 006 introduced subtype support at the database model level.

Migration 007 extended the RPC/API functionality so account subtype information could be handled through account API operations.

## Relationship between migrations

Migration 006:

- Introduced subtype support in the account data model.

Migration 007:

- Extended account RPC/API functionality.
- Added subtype-aware account operations.

This separation keeps the database model and API functionality aligned.

## Deployment status

- Reviewed as part of migrations 001–007.
- Originally applied manually to the remote database.
- Migration history reconciled afterward.
- Local and Remote migration entries verified as matching.

---

# 12. Migration 008 — Capital Transaction API

**Migration:**

    20261121000100_capital_transaction_api.sql

**Status:** DEPLOYED

## Purpose

Introduce the Capital Management transaction API layer.

The migration provides transaction-related database API functionality required by Capital Management.

## Transaction API architecture

Application
    |
    v
capital_api
    |
    v
capital_private implementation
    |
    v
capital_private tables

The transaction API provides database operations for capital transactions.

The architecture separates:

- Application-facing API functions
- Private implementation functions
- Transaction persistence
- Ownership and validation logic

## Transaction API wrappers

Migration 008 introduced seven application-facing transaction API functions.

These were verified to exist remotely:

- capital_api.create_transaction
- capital_api.list_transactions
- capital_api.update_transaction
- capital_api.complete_transaction
- capital_api.cancel_transaction
- capital_api.delete_transaction
- capital_api.reverse_transaction

## Private transaction implementations

The migration also introduced the corresponding private implementation functions:

- capital_private.create_transaction_impl
- capital_private.list_transactions_impl
- capital_private.update_transaction_impl
- capital_private.complete_transaction_impl
- capital_private.cancel_transaction_impl
- capital_private.delete_transaction_impl
- capital_private.reverse_transaction_impl

Additional internal functions:

- capital_private.assert_transaction_payload
- capital_private.lock_transaction_accounts

## Deployment

Migration 008 was deployed using:

    npx supabase db push

Migration 008 was the pending migration during the final deployment.

---

# 13. Migration 008 Deployment Errors and Fixes

Two issues were corrected during the Migration 008 deployment process.

## 13.1 Malformed SQL comment

The initial deployment attempt failed with:

    ERROR: syntax error at or near "-"
    SQLSTATE: 42601

The error occurred in the transaction reversal implementation section.

### Root cause

A Markdown-style bullet was accidentally included in the SQL migration.

Incorrect:

    - Original accounts may now be archived.

PostgreSQL interpreted the line as SQL instead of a comment.

### Fix

The line was corrected to a valid SQL comment.

Correct:

    -- Original accounts may now be archived.

The SQL logic itself was not changed.

## 13.2 Transaction block header

The migration initially contained a top-level:

    BEGIN;

There was no matching COMMIT in the migration file.

The unmatched top-level BEGIN was removed before the successful deployment.

Command used:

    sed -i '' '1{/^BEGIN;$/d;}' supabase/migrations/20261121000100_capital_transaction_api.sql

This removed the first-line BEGIN statement.

## 13.3 Successful deployment

After correcting the SQL file, the migration was deployed again using:

    npx supabase db push

The CLI confirmed:

    Applying migration 20261121000100_capital_transaction_api.sql...

    Finished supabase db push.

## Result

Migration 008 was successfully deployed to the remote Supabase database.

The deployed migration must not be modified retroactively. Any subsequent correction must use a new migration.

---

# 14. Migration History Reconciliation

Migrations 001–007 had already been manually applied to the remote database.

However, the migration history did not initially reflect that state.

## 14.1 Migration history repair — 001–007

The following command was used:

    npx supabase migration repair --status applied 20261120012229 20261120014500 20261120020300 20261120030700 20261120033700 20261120042100 20261120043000

This registered migrations 001–007 as already applied.

## 14.2 Migration 008 history issue

After Migration 008 was deployed, the migration history initially showed:

Local:

    20261121000100

Remote:

    Missing

The remote migration history therefore required additional reconciliation.

## 14.3 Migration 008 history repair

The following command was used:

    npx supabase migration repair --status applied 20261121000100

## 14.4 Final verification

The following command was run:

    npx supabase migration list

Final verification confirmed Local and Remote migration entries matched.

## 14.5 Final migration history

| Migration | Local | Remote | Status |
|---|---|---|---|
| 20261024224324 | Present | Present | Synchronized |
| 20261024231200 | Present | Present | Synchronized |
| 20261120012229 | Present | Present | Synchronized |
| 20261120014500 | Present | Present | Synchronized |
| 20261120020300 | Present | Present | Synchronized |
| 20261120030700 | Present | Present | Synchronized |
| 20261120033700 | Present | Present | Synchronized |
| 20261120042100 | Present | Present | Synchronized |
| 20261120043000 | Present | Present | Synchronized |
| 20261121000100 | Present | Present | Synchronized |

The two October migrations were also present and synchronized.

Migration history is currently synchronized.

Do not repeat migration-history repair unless a concrete discrepancy is discovered.

---

# 15. Migration 008 — Remote Database Object Verification

Read-only remote database inspection confirmed the following objects.

## Tables

- capital_private.accounts
- capital_private.transactions
- capital_private.transaction_idempotency

## Index

- capital_transactions_activity_cursor_idx

## Transaction API wrappers

Seven transaction API wrappers exist in capital_api.

## Private transaction functions

Nine private transaction functions exist in capital_private.

Total transaction-related functions verified:

    16

## Function ownership

All 16 inspected transaction functions were confirmed to be owned by:

    postgres

## search_path

All 16 inspected functions use:

    SET search_path = ''

This was confirmed during remote function inspection.

---

# 16. Migration 008 — Function Security Configuration

Remote function security and privilege inspection was performed after deployment.

## 16.1 API wrapper functions

The seven API wrappers were verified as:

- Owner: postgres
- SECURITY INVOKER
- search_path: empty
- EXECUTE: granted to authenticated

## 16.2 Private implementation functions

The nine private transaction functions were verified as:

- Owner: postgres
- search_path: empty
- SECURITY DEFINER

Their EXECUTE privileges were inspected individually.

## 16.3 Private helper functions

The following helper functions were inspected:

- capital_private.assert_transaction_payload
- capital_private.lock_transaction_accounts

Direct EXECUTE privileges were verified to be denied to:

- anon
- authenticated
- service_role

These helper functions are intended to remain internal.

---

# 17. Migration 008 — Transaction API Wrapper Review

All seven transaction API wrappers were reviewed.

| Function | Static wrapper review |
|---|---|
| create_transaction | PASS |
| list_transactions | PASS |
| update_transaction | PASS |
| complete_transaction | PASS |
| cancel_transaction | PASS |
| delete_transaction | PASS |
| reverse_transaction | PASS |

## Wrapper characteristics

The wrappers:

- Exist remotely.
- Are owned by postgres.
- Use SECURITY INVOKER.
- Use an empty search_path.
- Have EXECUTE granted to authenticated.
- Forward calls to private implementations.
- Contain no separate business logic.
- Do not establish ownership using a caller-supplied user_id.

## Static review result

The wrappers are structurally thin forwarding functions.

However, the current SECURITY INVOKER configuration contributes to the identified privilege-boundary weakness.

The wrapper structure itself is not the primary issue.

The security configuration and private implementation EXECUTE grants require correction.

---

# 18. Migration 008 — Confirmed Private Transaction Function Privilege Finding

## CONFIRMED SECURITY FINDING

Authenticated users currently have direct EXECUTE privileges on the seven private transaction implementation functions.

The functions are:

- capital_private.create_transaction_impl
- capital_private.list_transactions_impl
- capital_private.update_transaction_impl
- capital_private.complete_transaction_impl
- capital_private.cancel_transaction_impl
- capital_private.delete_transaction_impl
- capital_private.reverse_transaction_impl

This was confirmed through direct remote ACL inspection.

The observed function ACL included:

    postgres=X/postgres,authenticated=X/postgres

The exact ACL output was inspected during the remote privilege audit.

## Why this is a problem

The intended architecture is:

Authenticated user
    |
    v
capital_api
    |
    v
Private implementation functions

However, the current privilege configuration also permits authenticated users to directly execute the private transaction implementation functions.

This weakens the intended API/private boundary.

The application-facing API is no longer the only execution path available to authenticated users.

## Confirmed facts

- Direct EXECUTE access to private transaction implementations exists.
- The intended API/private privilege separation is not fully enforced.
- The security boundary requires correction.

## Not confirmed

- A cross-user authorization bypass.
- An exploit.
- Unauthorized access to another user's transactions.
- A data breach.
- Successful exploitation of the privilege weakness.

Static review did not identify an obvious cross-user authorization bypass in the reviewed transaction implementations.

However, direct private EXECUTE privileges are a confirmed security configuration weakness and should not be left as the final architecture.

## Severity context

This is a confirmed privilege-boundary weakness.

It is not currently evidence of a known data breach or confirmed cross-user compromise.

The issue must be corrected before treating the transaction API security boundary as finalized.

---

# 19. Migration 008 — Private Transaction Implementation Static Review

All seven private transaction implementation functions were reviewed individually.

The review was static SQL review.

Runtime behavior has not yet been verified.

## 19.1 create_transaction_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Rejects unauthenticated execution.
- Handles idempotency keys.
- Handles request fingerprints.
- Performs user-scoped ledger lookups.
- Validates account ownership.
- Locks relevant accounts.
- Derives user identity from authentication context.
- Does not rely on caller-supplied user identity to establish ownership.

No obvious cross-user authorization bypass was identified during static review.

Runtime testing remains pending.

## 19.2 list_transactions_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Uses user-scoped queries.
- Validates filters.
- Validates date-related parameters.
- Validates cursor/pagination inputs.
- Implements keyset pagination.

Runtime testing remains pending.

## 19.3 update_transaction_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Performs user-scoped row locking.
- Rejects modification of reversal records.
- Rejects cancelled transactions.
- Prevents modification of original transactions with reversals.
- Uses optimistic concurrency timestamp validation.
- Validates transaction payloads.
- Locks old and new accounts.
- Uses scoped update operations.

Runtime testing remains pending.

## 19.4 complete_transaction_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Performs user-scoped row locking.
- Handles same-effective-date retry idempotency.
- Allows completion only for PENDING transactions.
- Rejects reversal transactions.
- Uses concurrency validation.
- Locks relevant accounts.
- Uses scoped update operations.

Runtime testing remains pending.

## 19.5 cancel_transaction_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Performs user-scoped row locking.
- Handles harmless cancellation retries.
- Allows cancellation only for PENDING transactions.
- Rejects reversal transactions.
- Uses concurrency validation.
- Uses scoped update operations.

Runtime testing remains pending.

## 19.6 delete_transaction_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Performs scoped locking.
- Returns false for unknown or non-owned transactions without disclosing ownership.
- Requires pending transactions to be cancelled before deletion.
- Prevents deleting an original transaction with an existing reversal.
- Uses scoped DELETE operations.

Runtime testing remains pending.

## 19.7 reverse_transaction_impl

**Static Review:** PASS

Reviewed responsibilities:

- Uses auth.uid().
- Performs user-scoped original transaction locking.
- Implements durable user-scoped idempotency.
- Handles request fingerprint validation.
- Allows reversal only for completed original transactions.
- Rejects reversal-of-reversal.
- Prevents duplicate reversals.
- Derives reversal amounts from the original transaction.
- Derives accounts from the original transaction.
- Derives FX information from the original transaction where applicable.
- Does not allow the caller to inject reversal financial values.
- Validates reversal payloads.
- Locks relevant accounts.
- Supports historical account handling where appropriate.
- Inserts linked reversal records.
- Handles conflict reconciliation.

Runtime testing remains pending.

---

# 20. Migration 008 — Private Helper Review

Two helper functions were reviewed separately.

## 20.1 assert_transaction_payload

**Static Review:** PASS

Reviewed:

- Payload validation responsibilities.
- Internal usage.
- Private function configuration.

Direct EXECUTE privileges were verified to be denied to:

- anon
- authenticated
- service_role

This function is intended to remain internal.

## 20.2 lock_transaction_accounts

**Static Review:** PASS

Reviewed:

- User context validation.
- Ownership validation.
- Account locking.
- Account lock ordering.
- Missing-account handling.
- Foreign-account rejection.
- Archived-account behavior.
- Historical transaction support where archived accounts are permitted.

Direct EXECUTE privileges were verified to be denied to:

- anon
- authenticated
- service_role

This function is intended to remain internal.

---

# 21. Migration 009 — Planned Security Correction

**Status:** PLANNED — NOT CREATED OR DEPLOYED

Migration 009 will correct the transaction API security boundary.

The correction must be performed through a separate forward-only migration.

Migration 008 must not be modified after deployment.

## 21.1 Planned migration scope

Migration 009 will address the following items.

### A. API wrappers

Change the seven transaction API wrappers from:

    SECURITY INVOKER

to:

    SECURITY DEFINER

The wrappers must remain:

- Owned by postgres.
- Using SET search_path = ''.
- Thin forwarding functions.
- Application-facing RPC entry points.

### B. Private implementation functions

Revoke direct EXECUTE privileges from authenticated on the seven private transaction implementation functions.

Authenticated users should not be able to call the private transaction implementations directly.

### C. Explicit privilege revocation

Explicitly revoke EXECUTE from:

- PUBLIC
- anon
- authenticated
- service_role

on the seven private transaction implementation functions, as appropriate.

Preserve the required privileges for the function owner.

### D. API wrapper privileges

Keep authenticated EXECUTE privileges on the seven application-facing transaction API wrappers.

Explicitly revoke inappropriate EXECUTE privileges from:

- PUBLIC
- anon
- service_role

where applicable.

### E. Helper functions

Preserve existing restrictions on:

- assert_transaction_payload
- lock_transaction_accounts

These helpers must remain internal.

### F. Schema privileges

Do not globally revoke:

    USAGE ON SCHEMA capital_private

The private schema is shared with Capital Accounts functionality.

A global schema-level privilege change could unintentionally break that subsystem.

Migration 009 must be narrowly scoped to the transaction API privilege boundary.

### G. Business logic

Migration 009 must not change:

- Transaction business logic
- Account API
- Account schema
- Transaction schema
- Transaction validation rules
- Idempotency logic
- Transaction lifecycle rules
- Reversal logic
- Ownership logic

This migration should be a security configuration correction only.

---

# 22. Expected Security Architecture After Migration 009

The intended architecture after the correction is:

Authenticated User
    |
    | RPC
    v
capital_api.create_transaction
capital_api.list_transactions
capital_api.update_transaction
capital_api.complete_transaction
capital_api.cancel_transaction
capital_api.delete_transaction
capital_api.reverse_transaction
    |
    | SECURITY DEFINER
    | Owner: postgres
    | search_path = ''
    v
capital_private implementation functions
    |
    | Direct EXECUTE denied to authenticated
    v
Internal database operations
    |
    v
capital_private tables

## Security requirements

The final architecture must enforce:

- Authenticated users execute application-facing API functions.
- API wrappers remain the controlled entry point.
- Private implementation functions are not directly executable by authenticated users.
- Internal helper functions remain inaccessible directly.
- Functions continue to derive identity from auth.uid().
- Ownership checks remain enforced inside the implementation layer.
- No caller-supplied user_id can establish transaction ownership.
- search_path remains empty.
- Function ownership remains postgres where intended.

## Important SECURITY DEFINER requirement

Changing API wrappers to SECURITY DEFINER requires careful verification.

The wrappers must be owned by the intended trusted role, which is currently postgres.

The functions must retain:

    SET search_path = ''

Object references should remain explicitly schema-qualified.

The implementation must not introduce unsafe dynamic SQL or an attacker-controlled search path.

## auth.uid() verification

The private implementations use:

    auth.uid()

The expected behavior is that auth.uid() continues to resolve the authenticated user's JWT identity even when called through SECURITY DEFINER wrappers.

This must be verified through authenticated RPC tests.

It must not be assumed from static inspection alone.

Migration 009 must preserve the user identity and ownership enforcement model.

---

# 23. Migration 009 — Verification Requirements

Migration 009 must be reviewed before deployment.

After deployment, perform remote verification.

## 23.1 Function ownership

Verify all seven transaction API wrappers remain owned by:

    postgres

## 23.2 SECURITY configuration

Verify the seven API wrappers are:

    SECURITY DEFINER

Verify private transaction implementation functions retain the intended SECURITY configuration.

## 23.3 search_path

Verify all affected functions continue to use:

    SET search_path = ''

## 23.4 API EXECUTE privileges

Verify authenticated users can execute these functions through capital_api:

- create_transaction
- list_transactions
- update_transaction
- complete_transaction
- cancel_transaction
- delete_transaction
- reverse_transaction

## 23.5 Private implementation EXECUTE privileges

Verify authenticated users cannot directly execute:

- create_transaction_impl
- list_transactions_impl
- update_transaction_impl
- complete_transaction_impl
- cancel_transaction_impl
- delete_transaction_impl
- reverse_transaction_impl

## 23.6 Helper EXECUTE privileges

Verify authenticated users cannot directly execute:

- assert_transaction_payload
- lock_transaction_accounts

## 23.7 Other roles

Verify appropriate direct execution restrictions for:

- PUBLIC
- anon
- service_role

## 23.8 Schema privileges

Verify that the correction did not unintentionally alter shared schema privileges or break Capital Accounts functionality.

## 23.9 Account API regression

After the transaction API privilege correction, verify that existing Capital Accounts API functionality still works.

The private schema is shared, so Migration 009 must not unintentionally disrupt existing account operations.

---

# 24. Runtime Testing — Not Yet Completed

Migration deployment and static review are not runtime verification.

The following tests remain outstanding.

## Account API

- Account listing
- Manual account creation
- Account update
- Account archiving
- Account type validation
- Account subtype validation
- Account ownership enforcement

## Transaction API

- Transaction creation
- Transaction listing
- Transaction update
- Transaction completion
- Transaction cancellation
- Transaction deletion
- Transaction reversal

## Idempotency

- Duplicate create requests
- Duplicate reversal requests
- Retry behavior
- Fingerprint mismatch behavior
- Concurrent retry behavior

## Validation

- Invalid payloads
- Invalid amounts
- Invalid currencies
- Invalid account references
- Invalid transaction state transitions
- Invalid date inputs
- Invalid filters
- Invalid pagination inputs

## Security

- Unauthenticated access
- Authenticated API access
- Private implementation direct access
- Helper direct access
- Cross-user ownership attempts
- Foreign account attempts
- Unauthorized update attempts
- Unauthorized deletion attempts
- Unauthorized reversal attempts
- auth.uid() behavior through SECURITY DEFINER wrappers

## Concurrency

- Concurrent transaction creation
- Concurrent updates
- Concurrent completion
- Concurrent cancellation
- Concurrent reversal requests
- Idempotency under concurrency
- Account locking behavior

## Frontend integration

- Capital Management account API integration
- Transaction API integration
- Error handling
- Loading states
- Retry behavior
- Duplicate request prevention
- Data refresh behavior
- UI state consistency

## End-to-end

Full Capital Management workflows must be tested through the actual application.

---

# 25. Environment and Validation Limitations

The migration and audit work was performed against the linked production Supabase project.

## Limitations

- Docker was unavailable.
- A local PostgreSQL/shadow database validation environment was not established.
- No staging Supabase project was created.
- Runtime RPC testing has not been completed.
- Cross-user security testing has not been completed.
- Concurrency testing has not been completed.
- Full frontend integration testing has not been completed.

The current review is therefore based primarily on:

- Static SQL review
- Remote read-only database inspection
- Function inspection
- Schema inspection
- Privilege inspection
- Migration history verification

The review should not be represented as a completed penetration test or full runtime security validation.

---

# 26. Supabase CLI Information

CLI version used during migration work:

    Supabase CLI v2.122.0

Update notification observed:

    v3.2.0 available

The CLI also displayed a warning concerning future changes to default target behavior for:

- db push
- migration list

No CLI upgrade was performed during this migration deployment.

The commands used successfully operated against the linked remote database.

---

# 27. Supabase Commands Used

## 27.1 Migration history repair — 001–007

    npx supabase migration repair --status applied 20261120012229 20261120014500 20261120020300 20261120030700 20261120033700 20261120042100 20261120043000

Purpose:

Register migrations 001–007 as already applied in remote migration history.

## 27.2 Migration history inspection

    npx supabase migration list

Purpose:

Compare Local and Remote migration histories.

This command was used multiple times during deployment and final verification.

## 27.3 Deployment

    npx supabase db push

Purpose:

Apply pending migrations to the linked remote Supabase project.

Migration 008 was deployed using this command.

## 27.4 Migration 008 history repair

    npx supabase migration repair --status applied 20261121000100

Purpose:

Synchronize Migration 008's history entry after deployment.

## 27.5 Migration 008 SQL correction

The malformed SQL comment was corrected from a Markdown-style bullet to a valid SQL comment.

The unmatched first-line BEGIN statement was removed with:

    sed -i '' '1{/^BEGIN;$/d;}' supabase/migrations/20261121000100_capital_transaction_api.sql

---

# 28. Important Capital Management Design Boundaries

Capital Management is separate from the canonical trading execution ledger.

Capital Management represents account-level financial activity and capital movements.

It must not replace:

- Canonical executions
- Trade pairing
- FIFO calculations
- Trading analytics
- Realized trading P&L calculations
- Commission accounting
- Trade journal records

Capital Management is a separate financial/account management subsystem.

Its data model and API should remain isolated from canonical trading analytics unless a deliberately designed integration is introduced.

---

# 29. Current Completed Work

## Database foundation

- Security foundation deployed.
- Capital accounts deployed.
- Capital transactions deployed.
- Account API functions deployed.
- RPC security boundary migration deployed.
- Account subtype model deployed.
- Subtype-aware account RPC functionality deployed.
- Transaction API deployed.

## Migration management

- Migration files exist locally.
- Migrations 001–007 were manually applied previously.
- Migration history for 001–007 was repaired.
- Migration 008 was deployed using Supabase CLI.
- Migration 008 migration history was repaired.
- Final Local/Remote migration history verified.
- All eight Capital Management migrations are synchronized.

## Database verification

- Account table verified.
- Transaction table verified.
- Transaction idempotency table verified.
- Transaction activity cursor index verified.
- Columns and data types inspected.
- Constraints inspected.
- Function existence inspected.
- Function ownership inspected.
- search_path inspected.
- Schema privileges inspected.
- Function EXECUTE privileges inspected.

## Static security review

- Seven transaction API wrappers reviewed.
- Seven private transaction implementation functions reviewed.
- Two private helper functions reviewed.
- Ownership logic reviewed.
- Validation logic reviewed.
- Idempotency logic reviewed.
- Transaction lifecycle logic reviewed.
- Reversal logic reviewed.
- Concurrency and locking patterns reviewed.

## Confirmed finding

Direct EXECUTE access to the seven private transaction implementation functions is currently granted to authenticated.

This privilege-boundary weakness is documented.

Migration 009 is planned to correct it.

---

# 30. Current Status — Do Not Misrepresent

## Migration phase

COMPLETE — MIGRATIONS 001–008 DEPLOYED

## Migration history

COMPLETE — LOCAL AND REMOTE SYNCHRONIZED

## Static database review

COMPLETE — MIGRATIONS 001–008 REVIEWED

## Transaction API static review

COMPLETE

## Transaction implementation logic review

COMPLETE — STATIC REVIEW

## Transaction API security configuration

NOT FINALIZED — PRIVILEGE-BOUNDARY WEAKNESS IDENTIFIED

## Migration 009

PLANNED — NOT CREATED

## Runtime API verification

NOT COMPLETED

## Authenticated RPC testing

NOT COMPLETED

## Cross-user security testing

NOT COMPLETED

## Frontend integration testing

NOT COMPLETED

## End-to-end Capital Management testing

NOT COMPLETED

---

# 31. Next Work — Migration 009 Security Correction

Do not repeat migration review or deployment work unless a concrete problem is discovered.

Do not modify Migration 008.

Do not reapply migrations 001–008.

Do not repeat migration-history repair.

The next database task is:

## MIGRATION 009 — TRANSACTION API PRIVILEGE-BOUNDARY CORRECTION

The sequence should be:

1. Inspect the final privilege/grant section of Migration 008.
2. Confirm the exact function signatures.
3. Confirm the currently deployed grants.
4. Prepare Migration 009.
5. Review the SQL carefully before execution.
6. Ensure the migration only changes the required function security configuration and EXECUTE privileges.
7. Preserve the existing account API and shared schema privileges.
8. Deploy Migration 009.
9. Verify the resulting remote function configuration.
10. Verify direct private implementation execution is denied.
11. Verify API wrapper execution remains available to authenticated users.
12. Perform authenticated runtime testing.
13. Verify auth.uid() behavior through SECURITY DEFINER wrappers.
14. Perform account API regression testing.
15. Continue with transaction functional testing.

---

# 32. Immediate Next Command

Before creating Migration 009, inspect the final privilege/grant section of Migration 008.

Run:

    sed -n '2210,2345p' supabase/migrations/20261121000100_capital_transaction_api.sql

The purpose is to establish the exact current grant configuration and function signatures before preparing the corrective migration.

Do not create Migration 009 until this section has been inspected.

---

# 33. Resume Instructions for Future Sessions

When resuming Capital Management work, read this checkpoint first.

Do not:

- Re-review all eight migrations from scratch.
- Repeat the manual migration-history investigation.
- Re-run migration repair for migrations 001–007.
- Reapply migrations.
- Assume migrations need to be pushed again.
- Modify deployed Migration 008.
- Treat the transaction API security boundary as finalized.
- Treat static review as runtime verification.
- Assume the transaction APIs are fully tested.
- Assume cross-user security has been proven.
- Globally revoke USAGE on capital_private.
- Redesign the database architecture without a concrete reason.

Current confirmed state:

- Migrations 001–008 deployed.
- Migration history synchronized.
- Local and Remote entries match.
- Database structure verified.
- Transaction API functions verified.
- Transaction API static review completed.
- Seven private transaction implementation functions have direct EXECUTE privileges granted to authenticated.
- This privilege-boundary weakness is confirmed.
- Migration 009 is planned but does not yet exist.
- Runtime verification remains pending.

The next task is to inspect the final Migration 008 grants section and prepare Migration 009.

---

# 34. Final Checkpoint

**Date:** November 21, 2026

**Capital Management migrations:** 001–008

**Deployment:** SUCCESS

**Migration history:** SYNCHRONIZED

**Remote database:** MIGRATIONS APPLIED

**Database structure review:** COMPLETED

**Transaction API static review:** COMPLETED

**Transaction implementation review:** COMPLETED — STATIC

**Transaction API security review:** COMPLETED — FINDING IDENTIFIED

**Confirmed privilege-boundary weakness:** IDENTIFIED

**Migration 009:** PLANNED — NOT CREATED

**Runtime verification:** PENDING

**Authenticated RPC testing:** PENDING

**Cross-user security testing:** PENDING

**Frontend integration testing:** PENDING

**End-to-end testing:** PENDING

**Next task:** INSPECT MIGRATION 008 FINAL GRANTS AND PREPARE MIGRATION 009 SECURITY CORRECTION

This checkpoint is the current source of truth for Capital Management database migration, deployment, verification, and security audit work completed through November 21, 2026.