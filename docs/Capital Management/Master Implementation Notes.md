# Capital Management — Master Implementation Notes
**Project:** Elite X Trading Journal  
**Module:** Capital Management  
**Checkpoint date:** November 21–22, 2026  
**Checkpoint purpose:** Preserve implementation state before beginning functional testing.

---

# 1. Project Scope

Capital Management is a standalone financial management module within Elite X Trading Journal.

Its purpose is to track capital movements involving brokerage accounts, including:

- Deposits
- Withdrawals
- Transfers between accounts
- Pending transactions
- Completed transactions
- Cancelled transactions
- Multi-currency account movements
- Transfer exchange rates
- Transaction history
- Capital activity and related analytics

Capital Management is intended to provide a financial ledger for managing account funding and capital movement.

## Architectural separation

Capital Management is separate from the trading execution and analytics systems.

Capital transactions must not modify:

- Canonical trade executions
- FIFO trade pairing
- Realized trading P&L
- Trading commissions
- Trade performance analytics
- Trade journal records

Capital deposits, withdrawals, and transfers are financial account movements—not trading executions.

This separation must remain intact as the module expands.

---

# 2. Scope and Development Rules

The implementation and audit were intentionally limited to Capital Management.

The following rules were followed:

- No unrelated application modules were modified intentionally.
- Existing dashboard design was preserved.
- No unnecessary redesign was introduced.
- Security and database integrity were prioritized over frontend-only validation.
- Database RPCs are treated as the authoritative transaction boundary.
- Frontend data must not be treated as canonical financial data.
- Account ownership and authorization must be enforced server-side.
- Transaction creation must be atomic.
- Retry behavior must not create duplicate financial transactions.
- Archived accounts must not be used for new transactions.
- Multi-currency handling must be explicit.
- Changes must be reviewed before functional testing.

---

# 3. Capital Management Architecture

Capital Management follows a layered architecture.

## Frontend

The frontend is responsible for:

- Rendering the Capital Management page
- Displaying brokerage accounts
- Displaying transaction history
- Rendering account and transaction metrics
- Opening transaction drawers
- Collecting user input
- Performing basic validation
- Managing loading states
- Displaying errors
- Submitting requests to the storage layer

The frontend is not the authority for financial transaction integrity.

## Storage layer

The storage layer is responsible for:

- Calling the Capital API RPCs
- Passing structured transaction input
- Handling database errors
- Validating RPC response structures
- Parsing returned transaction records
- Mapping database records to frontend types
- Loading transaction data

## Database/API layer

The database is the authoritative source for:

- Transaction creation
- Account ownership validation
- Account eligibility
- Transaction validation
- Financial data integrity
- Idempotency
- Atomic execution
- Concurrency protection
- Canonical transaction records

---

# 4. Database Architecture and Security Boundary

Capital Management uses a separated database API architecture.

## Schemas

### `capital_api`

Public-facing RPC interface used by the frontend.

The application accesses Capital Management through explicitly exposed RPC functions rather than directly manipulating private financial tables.

### `capital_private`

Private implementation schema containing the underlying database logic.

The frontend should not directly access private implementation functions or tables.

## Architecture pattern

Frontend:

`Next.js → Supabase Client → capital_api RPC`

Database:

`capital_api RPC → capital_private implementation → canonical Capital tables`

The public API layer acts as a controlled boundary between application code and the underlying financial database implementation.

---

# 5. Database Migration History

Capital Management database implementation was developed through migrations.

## Previously applied foundation migrations

Migrations `001–007` were previously applied and covered the initial Capital Management database foundation, including:

- Capital Management database structures
- Account management data
- Account-related structures
- Database security configuration
- Row-level security
- Database permissions
- API/private schema separation
- RPC implementation foundations

The initial foundation was completed before the transaction creation work.

## Latest security correction

Migration:

`supabase/migrations/20261121000200_capital_transaction_api_security_correction.sql`

This migration was added during the transaction API security audit.

The migration is part of the security checkpoint and must be preserved.

## Migration policy

Do not modify already-applied migrations to retroactively change database behavior.

New database changes must be delivered through new migrations.

Before applying any future migration:

1. Review the SQL.
2. Check authorization implications.
3. Check ownership and permissions.
4. Check RLS implications.
5. Check transaction integrity.
6. Check rollback or recovery considerations.
7. Apply it.
8. Verify the resulting database state.

---

# 6. Database Security Audit

A security audit was conducted on the Capital Management database architecture and transaction RPC boundary.

## Security principles

The implementation must not trust:

- Frontend account IDs
- Frontend transaction IDs
- Frontend account status
- Frontend transaction status
- Frontend validation
- Frontend ownership claims
- Frontend exchange-rate values without backend validation

The database must validate all relevant information before financial transaction creation.

## Account ownership

Transaction creation must verify that the accounts involved in the transaction belong to the authenticated user.

A user must not be able to submit another user's account UUID and create a financial transaction involving that account.

## Account status

Archived accounts must not be eligible for new capital transactions.

Account status must be checked at the database boundary—not only through frontend filtering.

## Transaction integrity

The database must enforce transaction-type rules.

### Deposit

- Destination account is required.
- Source account is not required.
- Account ownership must be validated.
- Destination account must be eligible.

### Withdrawal

- Source account is required.
- Destination account is not required.
- Account ownership must be validated.
- Source account must be eligible.

### Transfer

- Source account is required.
- Destination account is required.
- Both accounts must belong to the authenticated user.
- Both accounts must be eligible.
- Source and destination must be different accounts.

A transfer to the same account must be rejected.

## Transaction status

Transaction status must be validated against supported values.

Current transaction statuses:

- `PENDING`
- `COMPLETED`
- `CANCELLED`

Completed transactions require an effective date.

Pending transactions must not be assigned a completed effective date.

## Financial data validation

The database validates financial values, including:

- Amount
- Currency
- Received amount
- Received currency
- Exchange rate
- Transaction type
- Transaction status
- Source account
- Destination account
- Transaction dates

Frontend validation exists to improve user experience, but backend validation remains authoritative.

## Concurrency protection

Transaction creation includes account-level locking and deterministic lock ordering.

This helps protect concurrent transaction operations and reduces deadlock risk when multiple accounts are involved.

The database remains responsible for transaction integrity even if requests arrive simultaneously.

---

# 7. Capital Transaction Idempotency

Idempotency is a critical requirement for financial transaction creation.

The system must handle cases where:

- A user clicks Save more than once.
- A network request times out.
- The database commits successfully but the client does not receive the response.
- A user retries after an error.
- The browser retries a request.
- A transaction is submitted more than once.

## Database idempotency behavior

The database supports idempotent transaction creation using an idempotency key.

Expected behavior:

### Same key + same payload

Return the existing canonical transaction rather than creating a duplicate.

### Same key + different payload

Reject the request.

### Reuse after deletion

Reject the reuse of an idempotency key when its previous transaction has been deleted.

### Orphaned transaction

Fail closed if the idempotency relationship cannot be resolved safely.

This prevents silently treating a reused key as a new transaction.

## Unique database protection

A database-level uniqueness mechanism protects transaction idempotency.

The frontend's idempotency implementation is an additional layer of protection and does not replace database enforcement.

---

# 8. Capital Transaction RPC

## Public RPC

`capital_api.create_transaction`

## Private implementation

`capital_private.create_transaction_impl`

The public API calls the private implementation.

The frontend must only call the public API.

## RPC contract

The RPC accepts the following parameters:

| Parameter | Type | Purpose |
|---|---|---|
| `p_idempotency_key` | UUID | Retry and duplicate protection |
| `p_transaction_type` | TEXT | Deposit, withdrawal, or transfer |
| `p_status` | TEXT | Pending, completed, or cancelled |
| `p_amount` | NUMERIC | Transaction amount |
| `p_currency` | TEXT | Transaction currency |
| `p_from_account_id` | UUID | Source account |
| `p_to_account_id` | UUID | Destination account |
| `p_received_amount` | NUMERIC | Receiving-side transfer amount |
| `p_received_currency` | TEXT | Receiving currency |
| `p_exchange_rate` | NUMERIC | Transfer exchange rate |
| `p_transaction_date` | DATE | Transaction date |
| `p_effective_date` | DATE | Effective completion date |
| `p_method` | TEXT | Transaction method |
| `p_counterparty_institution` | TEXT | Institution or counterparty |
| `p_reference_number` | TEXT | External reference |
| `p_notes` | TEXT | User notes |

---

# 9. Currency Architecture

Supported currencies:

- CAD
- USD
- EUR
- GBP
- JPY
- INR

Currency precision rules:

- JPY uses zero decimal places.
- Other supported currencies use two decimal places.

Currency validation must remain consistent between:

- Frontend input
- Database validation
- Transaction storage
- Transaction display
- Capital analytics

## Multi-currency transfers

Transfers can support currency conversion.

The transaction may include:

- Source amount
- Source currency
- Receiving amount
- Receiving currency
- Exchange rate

For same-currency transfers:

- Source and receiving currency are identical.
- Receiving amount equals source amount.
- Exchange rate is `1`.

For cross-currency transfers:

- Receiving currency differs from source currency.
- Receiving amount must be valid.
- Exchange rate must be valid.
- The database must validate the relationship.

Cross-currency transfer information must not be inferred or silently changed by frontend display logic.

---

# 10. Account Management Foundation

Capital Management account management was implemented before transaction creation.

The account foundation includes:

- Account storage
- Account types and related structures
- Account ownership
- Account status
- Account-related database validation
- Account CRUD functionality
- Account subtype structures
- Storage-layer implementation
- Frontend account management integration

Account CRUD and account subtype functionality were previously live-tested.

## Account eligibility

Transaction creation uses active accounts.

Archived accounts must not be available for new deposits, withdrawals, or transfers.

The UI filters accounts to active accounts, while the database independently enforces eligibility.

---

# 11. Account and Transaction Types

Capital Management supports the following transaction types:

## Deposit

Money entering a brokerage account.

Required:

- Destination account
- Amount
- Currency
- Transaction date

Optional:

- Method
- Counterparty institution
- Reference number
- Notes

## Withdrawal

Money leaving a brokerage account.

Required:

- Source account
- Amount
- Currency
- Transaction date

Optional:

- Method
- Counterparty institution
- Reference number
- Notes

## Transfer

Money moving from one account to another.

Required:

- Source account
- Destination account
- Source amount
- Source currency
- Transaction date

For cross-currency transfers:

- Received amount
- Received currency
- Exchange rate

For same-currency transfers:

- Received amount is automatically equal to source amount.
- Exchange rate is `1`.

---

# 12. Frontend Implementation

## Capital Management page

File:

`app/capital/page.tsx`

The Capital Management page includes the Capital Management interface and its transaction/account data loading responsibilities.

Current responsibilities include:

- Account data loading
- Transaction data loading
- Loading state management
- Error state management
- Retry behavior
- Transaction drawer integration
- Refreshing transactions after successful creation
- Capital page analytics and activity displays

## Transaction loading state

The page maintains transaction-related state:

- `transactions`
- `transactionsLoading`
- `transactionsError`
- `transactionsRetry`

The transaction load effect calls:

`loadCapitalTransactions()`

The retry mechanism uses:

`transactionsRetry`

After a successful transaction creation, the retry counter is incremented to trigger transaction reload.

## Account loading state

Account state and loading/error/retry behavior are handled separately from transaction loading.

This keeps account loading failures from being silently conflated with transaction loading.

## Loading UI

Capital Management loading states were added across relevant UI sections, including:

- Metric cards
- Funding sections
- Activity sections
- Pending transaction areas
- Recent transactions table

Loading states help prevent misleading empty-state displays while data is being fetched.

---

# 13. Add Transaction Drawer

File:

`components/capital/AddTransactionDrawer.tsx`

The drawer is responsible for collecting transaction information and submitting the payload to the parent page.

It supports:

- Deposit
- Withdrawal
- Transfer
- Transaction status
- Amount
- Currency
- Source account
- Destination account
- Received amount
- Received currency
- Exchange rate
- Transaction date
- Method
- Counterparty institution
- Reference number
- Notes

## Account selection

The drawer filters accounts to active accounts.

Deposit:

- Destination account

Withdrawal:

- Source account

Transfer:

- Source account
- Destination account

The drawer also validates that transfer source and destination accounts are different.

## Validation currently implemented

The handler checks:

- Duplicate submission prevention through `isSaving`
- Positive amount
- Valid selected source account for withdrawals
- Valid selected destination account for deposits
- Valid selected source account for transfers
- Valid selected destination account for transfers
- Source and destination accounts are different
- Cross-currency received amount is positive and finite
- Cross-currency exchange rate is positive and finite

## Error handling

The drawer:

- Clears the previous error before submission.
- Sets saving state during the request.
- Awaits parent persistence.
- Closes only after successful submission.
- Keeps the drawer open after failure.
- Displays the error to the user.
- Clears the saving state after completion.

The drawer does not treat a failed submission as successful.

---

# 14. Saving State and Duplicate Click Prevention

The drawer contains:

`isSaving`

During submission:

- Save button is disabled.
- Button label changes to `Saving...`.
- Repeated submissions are blocked by the handler.

The save button currently uses the label:

`Save Transaction`

This provides basic UI protection against accidental duplicate clicks.

Database idempotency remains the authoritative duplicate protection mechanism.

---

# 15. Frontend Idempotency Improvement

An important frontend idempotency issue was identified and corrected.

## Previous behavior

The handler generated a new idempotency key on every submission:

`crypto.randomUUID()`

This meant that a retry of the same transaction could generate a new key.

If the first request committed successfully but the client lost the response, a retry could potentially submit the same financial transaction using a new key.

## New implementation

A React ref stores the current idempotency fingerprint and key.

The implementation uses:

`idempotencyRef`

The stored object contains:

- `fingerprint`
- `key`

## Fingerprint

The transaction payload is constructed first without the idempotency key.

The fingerprint is derived from the transaction payload:

`JSON.stringify(transactionPayload)`

The fingerprint includes transaction details such as:

- Transaction type
- Status
- Amount
- Currency
- Source account
- Destination account
- Received amount
- Received currency
- Exchange rate
- Transaction date
- Effective date
- Method
- Counterparty institution
- Reference number
- Notes

The idempotency key itself is excluded from the fingerprint.

## Key generation behavior

### Same payload

If the payload fingerprint is identical to the previous failed attempt:

- Reuse the existing key.

### Changed payload

If the user changes any transaction details:

- The fingerprint changes.
- A new idempotency key is generated.

### Successful save

After the parent persistence call succeeds:

- The stored idempotency ref is cleared.
- The drawer closes.

This allows a future intentional transaction with identical details to receive a new idempotency key.

## Retry behavior

The intended behavior is:

| Scenario | Expected behavior |
|---|---|
| First submission | Generate key |
| Same payload retry | Reuse key |
| Payload changed | Generate new key |
| Submission fails | Preserve key |
| Submission succeeds | Clear key |
| New intentional transaction | Generate fresh key |

This frontend behavior complements database-level idempotency.

---

# 16. Storage Layer

File:

`lib/storage/supabaseCapitalTransactionStorage.ts`

This file is responsible for transaction retrieval and creation.

## Type definitions

### `CapitalTransactionRow`

Defines the database transaction response shape.

Includes:

- ID
- Transaction type
- Status
- Amount
- Currency
- Source account
- Destination account
- Received amount
- Received currency
- Exchange rate
- Transaction date
- Effective date
- Method
- Counterparty institution
- Reference number
- Notes
- Reversal transaction relationship
- Reversal reason
- Created timestamp
- Updated timestamp

### `CreateCapitalTransactionInput`

Frontend transaction creation input includes:

- `idempotencyKey`
- `transactionType`
- `status`
- `amount`
- `currency`
- `fromAccountId`
- `toAccountId`
- `receivedAmount`
- `receivedCurrency`
- `exchangeRate`
- `transactionDate`
- `effectiveDate`
- `method`
- `counterpartyInstitution`
- `referenceNumber`
- `notes`

### `CapitalTransactionFilters`

Supports filtering by:

- Status
- Transaction type
- Account ID
- Currency
- Start date
- End date

### `CapitalTransactionCursor`

Contains:

- `activityDate`
- `id`

This is the transaction cursor structure used for paginated transaction loading.

### `CapitalTransactionPage`

Returns:

- Transactions
- Next cursor
- `hasMore`

---

# 17. Storage Validation and Parsing

The storage adapter contains validation helpers to ensure that RPC responses conform to the expected structure.

## Validation helpers

### `readRecord`

Validates that the received value is a non-null object and not an array.

### `readRequiredString`

Validates a required string.

### `readNullableString`

Validates nullable strings.

### `readRequiredNumber`

Validates a required finite numeric value.

### `readNullableNumber`

Validates nullable numbers.

### `parseTransactionType`

Validates transaction type:

- `DEPOSIT`
- `WITHDRAWAL`
- `TRANSFER`

### `parseTransactionStatus`

Validates transaction status:

- `PENDING`
- `COMPLETED`
- `CANCELLED`

### `parseCurrency`

Validates supported currencies:

- CAD
- USD
- EUR
- GBP
- JPY
- INR

### `parseNullableCurrency`

Validates nullable currency values.

## Response parser

`parseCapitalTransactionRow()`

The parser validates and converts the RPC response into a structured database transaction row.

The frontend should not blindly trust the shape of returned RPC data.

---

# 18. Frontend Transaction Mapping

Function:

`mapCapitalTransaction()`

The storage layer converts the database transaction row into the canonical frontend `CapitalTransaction` type.

Database field mappings include:

| Database | Frontend |
|---|---|
| `transaction_date` | `date` |
| `effective_date` | `effectiveDate` |
| `transaction_type` | `type` |
| `from_account_id` | `fromAccountId` |
| `to_account_id` | `toAccountId` |
| `received_amount` | `receivedAmount` |
| `received_currency` | `receivedCurrency` |
| `exchange_rate` | `exchangeRate` |
| `counterparty_institution` | `counterpartyInstitution` |
| `reference_number` | `referenceNumber` |
| `reversal_of_transaction_id` | `reversalOfTransactionId` |
| `reversal_reason` | `reversalReason` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

Nullable database metadata fields are mapped to empty strings where the frontend type requires strings.

Canonical transaction data remains sourced from the database.

---

# 19. Transaction Retrieval

Function:

`loadCapitalTransactions()`

RPC:

`capital_api.list_transactions`

The storage adapter passes supported filters to the RPC:

- Status
- Transaction type
- Account ID
- Currency
- Start date
- End date

It also passes pagination parameters.

## Pagination

Current page size:

`TRANSACTION_PAGE_SIZE = 50`

The adapter requests:

`TRANSACTION_PAGE_SIZE + 1`

The extra row is used to determine whether another page exists.

The adapter:

1. Receives transaction rows.
2. Validates the response.
3. Parses the rows.
4. Determines whether additional rows exist.
5. Returns the first 50 transactions.
6. Creates the next cursor if more rows are available.

The cursor is based on:

- Activity date
- Transaction ID

Activity date uses:

- Effective date when available
- Otherwise transaction date

## Current limitation

Pagination infrastructure exists in the storage layer, but the Capital Management UI is not yet fully wired to load subsequent pages.

The current frontend transaction loading is limited to the initial page.

This means transaction history and analytics may currently operate on the loaded subset rather than the complete ledger.

Pagination integration remains a future task.

---

# 20. Transaction Creation Storage Function

Function:

`createCapitalTransaction()`

## Behavior

The function:

1. Receives `CreateCapitalTransactionInput`.
2. Calls the public Capital API.
3. Passes all transaction fields to the RPC.
4. Throws if Supabase returns an error.
5. Validates the returned response.
6. Requires exactly one transaction record.
7. Parses the returned record.
8. Maps it to the canonical frontend transaction.
9. Returns the transaction.

## RPC call

The storage layer calls:

`capital_api.create_transaction`

The function passes:

- Idempotency key
- Transaction type
- Status
- Amount
- Currency
- Source account
- Destination account
- Received amount
- Received currency
- Exchange rate
- Transaction date
- Effective date
- Method
- Counterparty institution
- Reference number
- Notes

## Response validation

The function expects an array containing exactly one transaction record.

If the RPC response does not match the expected shape, the storage layer throws an error.

---

# 21. Parent Page Integration

File:

`app/capital/page.tsx`

The transaction drawer is integrated with the Capital Management page.

## Parent responsibilities

The parent owns persistence.

The drawer does not directly create database transactions.

The parent:

1. Receives the transaction payload from the drawer.
2. Calls `createCapitalTransaction()`.
3. Waits for the RPC to complete.
4. Increments the transaction retry state.
5. Triggers transaction reload.
6. Displays the success notice.

## Current callback

The drawer's `onSubmit` callback is asynchronous.

It:

- Calls the storage layer
- Refreshes transaction state after success
- Displays a success message

If persistence fails, the error propagates to the drawer.

The drawer catches it and displays the failure.

## Important behavior

Transaction refresh is triggered only after the creation RPC succeeds.

Failed creation must not trigger a success state or refresh as though the transaction were committed.

---

# 22. Current UI Transaction Flow

The current transaction creation flow is:

`User`

↓

`Capital Management page`

↓

`Add Transaction Drawer`

↓

Frontend validation

↓

Transaction payload construction

↓

Payload fingerprint

↓

Idempotency key generation/reuse

↓

Parent `onSubmit`

↓

`createCapitalTransaction()`

↓

Supabase RPC

↓

`capital_api.create_transaction`

↓

Private database implementation

↓

Database validation, ownership checks, account checks, idempotency, and atomic creation

↓

Canonical transaction returned

↓

Storage response validation and mapping

↓

Parent refresh trigger

↓

Transaction list reload

↓

Success notice

↓

Drawer closes

---

# 23. Current Error Handling

The transaction creation flow has error handling across layers.

## Database

Rejects invalid financial transactions and authorization violations.

## Storage

Throws RPC errors.

Throws response-validation errors when returned data is malformed.

## Parent

Does not swallow transaction creation errors.

## Drawer

Catches submission errors.

Displays the error message.

Keeps the drawer open.

Allows the user to correct the input or retry.

## Success

The drawer closes only after the parent persistence operation completes successfully.

---

# 24. TypeScript Verification

After wiring transaction persistence and idempotency:

Command:

`npx tsc --noEmit`

Result:

**PASS**

No TypeScript errors were reported following the transaction creation and idempotency changes.

This is a static verification result only.

It does not establish that:

- The RPC works in the live environment.
- The database transaction succeeds.
- The frontend correctly handles all responses.
- The transaction is displayed correctly.
- The transaction refresh works in practice.
- Currency conversion is correct in every scenario.

Functional verification remains outstanding.

---

# 25. Current Database Test State

The previously observed Capital Management database state included:

- One archived test account
- Zero active accounts
- Zero capital transactions

This is important for the upcoming testing phase.

The current transaction drawer filters to active accounts.

Therefore, transaction testing may require an active account before deposits, withdrawals, or transfers can be tested.

The existing archived test account should not be used to bypass account-status restrictions.

---

# 26. Known Issues and Outstanding Risks

These items are known and have not yet been fully resolved.

## 26.1 Transaction pagination not fully wired to UI

The storage layer supports cursor-based pagination.

The UI currently loads the initial transaction page.

Potential impact:

- Transactions beyond the first 50 may not be visible.
- Analytics may be based on an incomplete transaction dataset.
- Activity totals may not represent the complete history.

This needs to be addressed before Capital Management is considered production-ready.

## 26.2 Analytics completeness

If the page uses only the currently loaded transaction page, analytics can be incomplete.

This must be evaluated carefully.

Financial analytics should not silently present partial data as complete totals.

The UX must distinguish:

- Complete data
- Partial loaded data
- Loading
- Error

## 26.3 Date validation

Current frontend date validation is permissive.

A future audit should verify:

- Strict ISO date validation
- Invalid dates
- Timezone behavior
- Date boundaries
- Pending transaction dates
- Completed transaction effective dates

## 26.4 Currency precision

The drawer does not yet enforce currency-specific precision comprehensively.

Currency precision must be validated consistently.

JPY must not accept fractional values.

Other supported currencies should respect their allowed precision.

Backend validation remains mandatory.

## 26.5 Numeric precision

Financial amounts must be examined for JavaScript floating-point behavior.

The UI should avoid introducing unnecessary precision or rounding inconsistencies.

Database numeric types remain canonical.

## 26.6 Transfer consistency

Cross-currency transfer validation needs functional verification.

Test:

- Source amount
- Source currency
- Received amount
- Received currency
- Exchange rate

Verify consistency between user input and database validation.

## 26.7 Drawer close behavior during save

The drawer currently prevents duplicate submissions through `isSaving`.

However, cancel/backdrop/header close behavior during an in-flight request should be reviewed.

Potential risks:

- User closes drawer during save.
- Request continues after drawer closes.
- User may not know whether the transaction succeeded.
- User may submit another transaction after closing.

This behavior should be deliberately defined rather than changed without review.

## 26.8 Error messaging

The drawer currently displays the thrown error message.

We should verify that database errors do not expose inappropriate internal information to end users.

A future production-quality error layer may need:

- Safe user-facing messages
- Internal diagnostic logging
- Error classification
- Retryable vs non-retryable errors

## 26.9 Attachment handling

The transaction drawer may contain attachment-related UI.

Currently, attachment handling is not equivalent to a fully implemented secure document upload system.

Do not treat a displayed attachment filename as proof that a document has been securely uploaded and persisted.

A future attachment implementation requires separate review of:

- Storage bucket
- Access policies
- Ownership
- Upload validation
- File size
- MIME type
- File access
- Persistence
- Deletion
- Security

---

# 27. Current Files Involved

## Main frontend

`app/capital/page.tsx`

Responsibilities:

- Capital page
- Account loading
- Transaction loading
- Loading/error/retry state
- Transaction drawer integration
- Transaction persistence callback
- Refresh after successful transaction creation

## Transaction drawer

`components/capital/AddTransactionDrawer.tsx`

Responsibilities:

- Transaction form
- Deposit/withdrawal/transfer UI
- Account selection
- Validation
- Transaction payload
- Saving state
- Idempotency fingerprint
- Idempotency key reuse
- Error display
- Success close behavior

## Storage adapter

`lib/storage/supabaseCapitalTransactionStorage.ts`

Responsibilities:

- Transaction retrieval
- RPC calls
- RPC response parsing
- Validation
- Frontend mapping
- Pagination

## Capital types

`lib/capital/types.ts`

Canonical frontend Capital Management types, including:

- Account types
- Currency types
- Transaction types
- Transaction statuses
- Capital transaction structures

## Database migrations

`supabase/migrations/`

Contains Capital Management database foundation and transaction implementation migrations.

Important security correction:

`supabase/migrations/20261121000200_capital_transaction_api_security_correction.sql`

---

# 28. Implementation Completed So Far

## Database foundation

- [x] Capital Management database foundation implemented
- [x] Migrations 001–007 previously applied
- [x] Schema separation
- [x] Public API/private implementation architecture
- [x] Database permissions
- [x] RLS
- [x] Account data structures
- [x] Account-related functionality
- [x] Account CRUD implementation
- [x] Account subtype implementation
- [x] Account CRUD previously live-tested
- [x] Database security audit completed
- [x] Transaction API security correction migration created

## Transaction backend

- [x] Transaction model foundation
- [x] Transaction creation RPC
- [x] Public RPC boundary
- [x] Private transaction implementation
- [x] Ownership validation
- [x] Account eligibility validation
- [x] Transaction-type validation
- [x] Transfer validation
- [x] Same-account transfer prevention
- [x] Transaction status validation
- [x] Date validation at database boundary
- [x] Currency validation
- [x] Cross-currency transaction support
- [x] Idempotency backend
- [x] Duplicate transaction protection
- [x] Account locking
- [x] Deterministic account lock ordering
- [x] Atomic transaction creation

## Storage layer

- [x] Capital transaction types
- [x] Transaction input types
- [x] Transaction filters
- [x] Pagination cursor types
- [x] Response parser
- [x] Currency parser
- [x] Transaction status parser
- [x] Transaction type parser
- [x] Database-to-frontend mapper
- [x] Transaction list RPC
- [x] Transaction creation RPC
- [x] RPC response validation
- [x] Error propagation

## Frontend

- [x] Capital Management page transaction loading
- [x] Transaction loading states
- [x] Transaction error states
- [x] Retry mechanism
- [x] Loading states across Capital UI sections
- [x] Add Transaction drawer
- [x] Deposit form
- [x] Withdrawal form
- [x] Transfer form
- [x] Active account filtering
- [x] Transaction form validation
- [x] Saving state
- [x] Duplicate submission prevention
- [x] Async persistence integration
- [x] Error handling
- [x] Successful close behavior
- [x] Transaction refresh after creation
- [x] Success notice
- [x] Frontend idempotency fingerprint
- [x] Retry key preservation
- [x] New key for changed payload
- [x] Key clearing after success

## Verification

- [x] TypeScript verification passed
- [ ] Live transaction creation tested
- [ ] Transaction response verified in UI
- [ ] Database transaction row verified
- [ ] Transaction refresh verified
- [ ] Retry behavior functionally tested
- [ ] Duplicate prevention functionally tested
- [ ] Deposit tested
- [ ] Withdrawal tested
- [ ] Same-currency transfer tested
- [ ] Cross-currency transfer tested
- [ ] Pending transaction tested
- [ ] Cancelled transaction tested
- [ ] Invalid transaction behavior tested

---

# 29. Current Status

Capital Management is transitioning from implementation into functional testing.

The backend transaction creation architecture is implemented.

The frontend transaction creation flow is wired to the database.

Idempotency improvements have been implemented in both the database architecture and frontend retry flow.

TypeScript passes.

However, the actual end-to-end transaction creation flow has not yet been tested.

**Do not consider transaction creation production-verified until the functional testing phase is completed.**

---

# 30. Git Checkpoint Plan

Before functional testing:

1. Review `git status`.
2. Review all Capital Management source changes.
3. Review all database migrations.
4. Review `docs/notes.md`.
5. Verify no unrelated changes are accidentally included.
6. Preserve any intentional changes under `docs/`.
7. Run `git diff --check`.
8. Stage the intended changes.
9. Review the staged diff.
10. Commit.
11. Push to `origin main`.
12. Confirm the push succeeds.

This checkpoint should establish a recoverable baseline before testing the actual transaction flows.

---

# 31. Functional Testing Plan — Next Phase

Functional testing will begin only after the checkpoint has been pushed successfully.

## Phase A — Test environment readiness

- Verify Supabase connection.
- Confirm Capital Management RPCs are available.
- Confirm account loading works.
- Create or identify an active account.
- Confirm the account is eligible for transactions.
- Verify the page loads without unexpected errors.

## Phase B — Deposit

Test:

- Valid deposit
- Positive amount
- Currency
- Destination account
- Transaction date
- Completed status
- Database persistence
- Transaction list refresh

Verify the persisted transaction against the UI.

## Phase C — Withdrawal

Test:

- Valid withdrawal
- Source account
- Amount
- Currency
- Transaction date
- Completed status
- Database persistence

## Phase D — Same-currency transfer

Test:

- Source account
- Destination account
- Same currency
- Received amount automatically equal to source amount
- Exchange rate equal to `1`
- No same-account transfer
- Database persistence

## Phase E — Cross-currency transfer

Test:

- Different source and destination currencies
- Source amount
- Received amount
- Received currency
- Exchange rate
- Validation
- Persisted values
- UI display

## Phase F — Pending transaction

Verify:

- Pending transaction can be created
- Effective date is null
- Transaction appears in pending activity
- Pending transaction is not incorrectly treated as completed funding

## Phase G — Error scenarios

Test:

- Invalid amount
- Missing account
- Invalid account
- Archived account
- Same-account transfer
- Invalid received amount
- Invalid exchange rate
- Invalid date
- RPC failure
- Network failure

## Phase H — Idempotency

Test:

1. Submit a transaction.
2. Simulate or reproduce a retry.
3. Submit the identical payload using the same key.
4. Confirm the backend does not create a duplicate.
5. Change the payload.
6. Confirm a different key is generated.
7. Successfully save.
8. Confirm the key is cleared.
9. Create a new intentional transaction with the same details.
10. Confirm it can be created as a new transaction.

## Phase I — UI refresh

Verify:

- Save completes
- Drawer closes
- Success notice appears
- Transaction list refreshes
- Transaction appears exactly once
- Displayed values match the database
- Loading state is correct
- No stale transaction state remains

---

# 32. Production Readiness — Future Work

The following should not be assumed complete merely because transaction creation works.

Future review areas:

- Full transaction pagination in UI
- Analytics completeness across all transactions
- Strict date validation
- Currency precision validation
- Financial rounding strategy
- Error classification and safe messaging
- Drawer behavior during in-flight requests
- Pending transaction lifecycle
- Cancellation behavior
- Completion behavior
- Reversal behavior
- Transaction editing restrictions
- Account archive interactions
- Transaction history filtering
- Search
- Pagination UX
- Secure attachments
- Performance for large transaction histories
- Accessibility
- Responsive behavior
- Automated tests
- Database integration tests
- Concurrency testing
- RLS regression testing
- Idempotency regression tests

---

# 33. Final Checkpoint Decision

The current implementation should be committed and pushed before functional testing.

This checkpoint represents:

- The Capital Management database foundation
- The account management foundation
- Database security architecture
- Transaction RPC architecture
- Transaction creation implementation
- Storage adapter
- Frontend transaction integration
- Loading and error states
- Idempotency improvements
- TypeScript verification

After the successful Git push, functional testing will begin against the live application/database environment.

No additional feature development should be mixed into the initial functional testing phase unless a test exposes a defect requiring a targeted fix.

---

**Checkpoint:** Capital Management implementation saved before functional testing  
**Current verification:** TypeScript passed  
**Functional verification:** Not yet started  
**Next milestone:** Git commit and push, followed by controlled end-to-end transaction testing
