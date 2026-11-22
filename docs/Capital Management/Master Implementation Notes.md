# Elite X Trading Journal
# Capital Management — Master Implementation Notes

**Project:** Elite X Trading Journal  
**Module:** Capital Management  
**Checkpoint:** November 22, 2026
**Status:** Account Management taxonomy implemented and functionally tested; broader transaction testing remains outstanding.

---

# 1. Project Scope

Capital Management is a standalone financial management module within Elite X Trading Journal.

Its purpose is to manage capital movements involving brokerage accounts and other financial accounts.

Core functionality includes:

- Account management
- Deposits
- Withdrawals
- Transfers between accounts
- Pending transactions
- Completed transactions
- Cancelled transactions
- Multi-currency account movements
- Transfer exchange rates
- Transaction history
- Capital activity
- Account and transaction analytics

Capital Management provides a financial ledger for tracking account funding and capital movements.

## 1.1 Architectural separation

Capital Management is separate from the trading execution and analytics systems.

Capital transactions must never modify:

- Canonical trade executions
- FIFO trade pairing
- Realized trading P&L
- Trading commissions
- Trade performance analytics
- Trade journal records

Deposits, withdrawals and transfers are financial account movements, not trading executions.

This separation must remain intact as the application expands.

---

# 2. Development and Engineering Principles

The following principles govern Capital Management development.

- Correctness and data integrity take priority over quick frontend fixes.
- Database RPCs are authoritative transaction boundaries.
- Frontend validation improves UX but does not replace database validation.
- Account ownership and authorization must be enforced server-side.
- Transaction creation must be atomic.
- Retry behavior must not create duplicate financial transactions.
- Archived accounts must not be eligible for new transactions.
- Multi-currency handling must be explicit.
- Previously applied migrations must never be modified retroactively.
- New database changes must use new migrations.
- Existing UI layouts should be preserved unless a redesign is requested.
- Changes should remain narrowly scoped and independently testable.
- Every important database change requires post-deployment verification.

Changes under `docs/` must be treated as intentional user-authored documentation. Preserve them when reviewing, staging or committing work.

---

# 3. Capital Management Architecture

Capital Management follows a layered architecture.

## 3.1 Frontend

The frontend is responsible for:

- Rendering the Capital Management page
- Displaying accounts
- Displaying transaction history
- Displaying account and transaction metrics
- Opening account and transaction drawers
- Collecting user input
- Basic form validation
- Loading and saving states
- Error display
- Submitting requests to the storage layer

The frontend is not the authority for financial transaction integrity.

## 3.2 Storage layer

The storage layer is responsible for:

- Calling Capital API RPCs
- Passing structured inputs
- Handling database errors
- Validating RPC response structures
- Parsing returned records
- Mapping database records to frontend types
- Loading account and transaction data
- Normalizing optional strings and validating input lengths

## 3.3 Database/API layer

The database is authoritative for:

- Transaction creation
- Account ownership validation
- Account eligibility
- Transaction validation
- Financial integrity
- Idempotency
- Atomic execution
- Concurrency protection
- Canonical transaction records

---

# 4. Database Architecture and Security Boundary

Capital Management uses separated API and private implementation schemas.

## 4.1 Schemas

### `capital_api`

Public-facing RPC interface called by the frontend.

The application uses explicitly exposed API functions instead of directly manipulating private financial tables.

### `capital_private`

Private implementation schema containing the underlying database logic.

The frontend should not directly access private implementation functions or tables.

## 4.2 Database call flow

Frontend:

`Next.js → Supabase Client → capital_api RPC`

Database:

`capital_api RPC → capital_private implementation → canonical Capital tables`

The API schema acts as a controlled boundary between the application and the financial database.

## 4.3 Security configuration

Verified account functions use:

- API wrappers with `SECURITY INVOKER`
- Private implementations with `SECURITY DEFINER`
- Empty function `search_path`
- `postgres` ownership
- Explicit execution grants
- Authenticated execution
- Anonymous execution denied

The latest account Update functions were rechecked after migration 005.

Both functions were confirmed to have the expected security configuration and execution permissions.

The account implementation must continue enforcing `auth.uid()` and user ownership independently of frontend-supplied identifiers.

---

# 5. Database Migration History

Capital Management uses migration-based database deployment.

## 5.1 Earlier foundation migrations

The original Capital Management foundation migrations 001–007 were previously applied.

They covered the initial database foundation, including:

- Capital Management structures
- Account-related structures
- Database security configuration
- Row-level security
- Database permissions
- API/private schema separation
- RPC implementation foundations

The transaction API security correction is also part of the existing foundation:

`supabase/migrations/20261121000200_capital_transaction_api_security_correction.sql`

## 5.2 Account metadata and taxonomy migrations

The following date-stamped migrations were implemented on November 22, 2026.

| Migration | Purpose | Status |
|---|---|---|
| `20261122000100` | Capital account metadata | Applied |
| `20261122000200` | Create manual account ambiguity correction | Applied |
| `20261122000300` | Capital account taxonomy | Applied |
| `20261122000400` | Create manual account RETURNING alias correction | Applied |
| `20261122000500` | Account taxonomy Update semantics | Applied |

### Migration 003 — Account taxonomy

Added account taxonomy fields and the corresponding create/update/list/archive RPC implementation.

The user manually applied migration 003 through the Supabase SQL Editor.

It was initially missing from the remote migration history.

### Migration 004 — Create account correction

Corrected the account creation implementation to use an explicit insert alias:

```sql
INSERT INTO capital_private.accounts AS inserted (...)
...
RETURNING inserted.id INTO v_account_id;
```

The deployed implementation was inspected and confirmed to match the local migration.

The original execution method and exact deployment time were not established.

### Migration history reconciliation

Migrations 003 and 004 had already been deployed but were not registered in the remote migration ledger.

The following command successfully reconciled their history:

```bash
npx supabase migration repair 20261122000300 20261122000400 --status applied --linked
```

A subsequent `migration list --linked` confirmed that the local and remote migration histories matched through migration 004.

This repair changed migration history only. It did not rerun either migration.

### Migration 005 — Update semantics correction

File:

`supabase/migrations/20261122000500_capital_account_taxonomy_update_semantics.sql`

Purpose:

Correctly distinguish between an omitted taxonomy update and an intentional request to clear taxonomy fields.

Migration 005 was successfully applied using:

```bash
npx supabase db push --linked
```

The dry run identified migration 005 as the only pending migration.

The actual deployment completed successfully.

The remote functions were then inspected to confirm the new signatures, security configuration, ownership and permissions.

### Migration policy

For all future database changes:

1. Review the complete SQL.
2. Review authorization implications.
3. Verify function ownership and privileges.
4. Check RLS implications.
5. Check transaction integrity.
6. Consider backward compatibility.
7. Review the deployment plan.
8. Apply the migration.
9. Verify the deployed database state.
10. Verify migration history.

Never modify previously applied migrations to change production behavior.

---

# 6. Capital Account Data Model

Primary account table:

`capital_private.accounts`

The account management implementation uses the following canonical fields:

| Database field | Purpose |
|---|---|
| `id` | Account UUID |
| `user_id` | Account owner |
| `account_name` | Display name |
| `broker_name` | Broker or institution |
| `account_type` | Account category |
| `account_subtype` | Additional classification |
| `currency` | Account currency |
| `account_source` | Manual or broker import |
| `external_account_id` | External broker identity |
| `status` | Active or archived |
| `account_number_last4` | Last four digits |
| `trading_mode` | Brokerage trading mode |
| `ownership` | Account ownership |
| `ownership_custom` | Custom ownership description |
| `registration` | Account registration |
| `trading_mode_custom` | Custom trading mode description |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |

## 6.1 Account categories

Canonical account categories:

- Brokerage
- Bank
- Cash
- Other

Stored values:

- `brokerage`
- `bank`
- `cash`
- `other`

## 6.2 Account ownership

Supported UI options:

- Individual
- Joint
- Corporate
- Trust
- Other

Ownership is stored in a TEXT column, not a dedicated PostgreSQL enum.

The options above are the agreed UI taxonomy. Do not silently introduce additional choices.

### Custom Ownership

Custom Ownership:

- Is optional when another ownership category is selected.
- Is shown only when Ownership is Other.
- Is required when Ownership is Other.
- Has a maximum length of 80 characters.

Ownership has a maximum length of 40 characters.

## 6.3 Account registration

Registration:

- Is optional.
- Uses free-text input.
- Has a maximum length of 80 characters.
- Must be trimmed before saving.
- Empty values must be normalized to NULL.

Registration can represent country-specific account registrations.

Examples include:

Canadian:
- TFSA
- RRSP
- FHSA
- RESP
- RRIF

United States:
- IRA
- Roth IRA
- 401(k)

The registration field is intentionally searchable/extensible rather than restricted to a fixed global enum.

## 6.4 Trading Mode

Brokerage accounts support:

| Stored value | Display label |
|---|---|
| `unknown` | Unknown |
| `cash` | Cash |
| `margin` | Margin |
| `portfolio_margin` | Portfolio Margin |
| `limited_margin` | Limited Margin |
| `other` | Other |

Non-brokerage accounts use:

`not_applicable`

### Custom Trading Mode

- Visible only when Trading Mode is Other.
- Required when Trading Mode is Other.
- Maximum length: 80 characters.
- Must be cleared when the selected trading mode changes away from Other.

Trading Mode itself is validated against supported values by the database implementation.

---

# 7. Account Database Constraints and Validation

The account table contains database constraints for:

- Valid account categories
- Valid account sources
- Valid account statuses
- Supported currencies
- Supported trading modes
- Account name validity
- Broker name validity
- Account subtype length and validity
- Account number last-four format
- Ownership length
- Custom ownership length
- Registration length
- Custom trading mode length
- Broker-import identity requirements
- External account identity requirements

Account number last four must contain exactly four digits when supplied.

The taxonomy columns are TEXT fields.

Maximum lengths:

| Field | Maximum |
|---|---:|
| Ownership | 40 |
| Custom Ownership | 80 |
| Registration | 80 |
| Custom Trading Mode | 80 |

The database RPC implementation performs the corresponding trimming and conditional validation.

The UI and storage layer also normalize input for a better user experience, but database validation remains authoritative.

---

# 8. Account Management RPC Architecture

Account management uses public API wrappers and private implementations.

| Operation | API function | Private implementation |
|---|---|---|
| List | `capital_api.list_accounts` | `capital_private.list_accounts_impl` |
| Create | `capital_api.create_manual_account` | `capital_private.create_manual_account_impl` |
| Update | `capital_api.update_account` | `capital_private.update_account_impl` |
| Archive | `capital_api.archive_account` | `capital_private.archive_account_impl` |

The frontend uses the API schema.

## 8.1 Create Account

The create implementation:

1. Checks `auth.uid()`.
2. Validates the account name.
3. Normalizes broker and account metadata.
4. Validates account category and currency.
5. Validates trading mode.
6. Validates account ownership fields.
7. Requires Custom Ownership when Ownership is Other.
8. Requires Custom Trading Mode when Trading Mode is Other.
9. Validates field lengths.
10. Inserts a manual account.
11. Returns the newly created canonical account record.

The corrected implementation uses an explicit insert alias when returning the generated account ID.

## 8.2 Update Account

The Update function:

- Validates authentication.
- Validates account fields.
- Preserves account ownership protections.
- Protects broker integration identity.
- Validates account number behavior.
- Validates trading mode.
- Validates custom ownership.
- Validates registration.
- Updates only the authenticated user's account.
- Returns the canonical updated account record.

Broker name updates are restricted to appropriate manual accounts without an external account ID.

The current implementation uses an explicit account ID and authenticated user ID in the update condition.

## 8.3 Archive Account

The private archive implementation:

- Checks authentication.
- Locks the user-owned account row.
- Confirms that the account exists.
- Prevents archive when a pending transaction references the account.
- Changes the account status to archived.

Archived accounts must not be eligible for new transactions.

The database archive functionality exists, but the account archive UI action remains to be reviewed and completed.

---

# 9. Migration 005 — Explicit Taxonomy Update Semantics

## 9.1 Problem identified

The original Update function used:

```sql
ownership = COALESCE(v_ownership, a.ownership),
ownership_custom = COALESCE(v_ownership_custom, a.ownership_custom),
registration = COALESCE(v_registration, a.registration)
```

This made NULL ambiguous.

A NULL could mean:

- Preserve the existing value.
- Intentionally clear the existing value.

The application could not distinguish those two operations.

This caused a data integrity issue when a user switched Ownership from Other to Individual or cleared Registration.

## 9.2 Backward-compatible correction

Migration 005 added a trailing boolean parameter to both Update functions:

```sql
p_taxonomy_fields_provided BOOLEAN DEFAULT FALSE
```

This parameter defines the taxonomy update contract.

### When FALSE

The legacy behavior remains:

- NULL means preserve the existing value.
- Existing older callers can continue using the old behavior.

### When TRUE

Ownership taxonomy fields are treated as a complete replacement group.

The following values are replaced using the submitted values:

- Ownership
- Custom Ownership
- Registration

An explicit NULL clears the corresponding field.

The new application storage layer sends:

```ts
p_taxonomy_fields_provided: true,
```

This avoids using special text sentinels for free-text fields.

## 9.3 Fields intentionally excluded

The new boolean flag does not control:

- Account name
- Broker name
- Account category
- Account subtype
- Currency
- Account number last four
- Trading Mode
- Custom Trading Mode

Existing account-number sentinel behavior is preserved.

Existing Trading Mode and Custom Trading Mode logic is preserved.

Switching away from Trading Mode Other clears Custom Trading Mode using the existing SQL behavior.

## 9.4 Security and deployment verification

After migration 005, both functions were queried directly in Supabase.

Verified:

| Property | API Update | Private Update |
|---|---|---|
| New boolean argument | Present | Present |
| Default | FALSE | FALSE |
| Security | Invoker | Definer |
| Search path | Empty | Empty |
| Owner | postgres | postgres |
| Authenticated EXECUTE | Allowed | Allowed |
| Anonymous EXECUTE | Denied | Denied |

The migration also:

- Recreates both functions with the new parameter.
- Preserves the function return shape.
- Preserves private implementation security.
- Preserves authenticated-only execution permissions.
- Sends a PostgREST schema reload notification.

The remote function metadata was inspected and confirmed after deployment.

---

# 10. Account Frontend Implementation

## 10.1 Main account drawer

File:

`components/capital/ManageAccountsDrawer.tsx`

The drawer is responsible for:

- Creating accounts
- Editing accounts
- Loading existing account information into Edit state
- Validating account fields
- Showing account errors
- Rendering active accounts
- Rendering archived accounts

The existing drawer layout and styling were preserved during the taxonomy implementation.

## 10.2 Create Account form

The Create form now supports:

- Account Name
- Broker / Institution
- Account Category
- Account Subtype
- Account Number (Last 4 Digits)
- Currency
- Trading Mode
- Ownership
- Custom Ownership
- Registration
- Custom Trading Mode

Conditional form behavior:

- Custom Ownership appears only when Ownership is Other.
- Custom Trading Mode appears only when Trading Mode is Other.
- Trading Mode is hidden for non-brokerage accounts.
- Changing away from Other clears the corresponding custom-field UI state.

## 10.3 Edit Account form

The Edit form now:

1. Reads the selected account object.
2. Loads all existing account fields into form state.
3. Loads Ownership.
4. Loads Custom Ownership.
5. Loads Registration.
6. Loads Trading Mode.
7. Loads Custom Trading Mode.
8. Sends the actual edited values to the parent update callback.

The previous hardcoded NULL values in the Edit handler were removed.

## 10.4 Conditional validation

Ownership Other requires Custom Ownership.

Trading Mode Other requires Custom Trading Mode.

The form prevents submission when either required custom field is empty.

Switching away from Other clears the corresponding custom-field state.

## 10.5 Category transitions

Non-brokerage accounts must not expose a Trading Mode selector.

The UI hides Trading Mode for:

- Bank
- Cash
- Other

The database stores `not_applicable` for non-brokerage account trading modes.

When changing the category back to Brokerage, the Trading Mode control becomes visible again.

---

# 11. Account Storage Layer

File:

`lib/storage/supabaseCapitalStorage.ts`

The storage layer handles:

- Account database types
- Create input types
- Update input types
- Account response parsing
- Account mapping
- Input normalization
- Length validation
- RPC calls
- Error handling

## 11.1 Canonical frontend model

`BrokerageAccount` includes:

- `id`
- `name`
- `broker`
- `type`
- `accountCategory`
- `accountSubtype`
- `ownership`
- `ownershipCustom`
- `registration`
- `accountNumberLast4`
- `tradingMode`
- `tradingModeCustom`
- `baseCurrency`
- `source`
- `status`

The account taxonomy fields are already part of the canonical account model.

No separate UI-only taxonomy data model is required.

## 11.2 Input types

`CreateCapitalAccountInput` supports optional nullable taxonomy fields.

`UpdateCapitalAccountInput` requires the account's complete nullable taxonomy state.

The storage normalizer:

- Trims optional strings.
- Converts empty strings to NULL.
- Enforces configured maximum lengths.
- Validates account number last four.

## 11.3 Create RPC

The storage layer calls:

`capital_api.create_manual_account`

All supported account taxonomy fields are sent to the RPC.

## 11.4 Update RPC

The storage layer calls:

`capital_api.update_account`

It sends all account fields, including:

```ts
p_taxonomy_fields_provided: true,
```

This is required for the new migration 005 contract.

The flag is sent only by the Update operation. The Create function does not need it.

## 11.5 Update call-site audit

A source search was performed:

```bash
git grep -n -E 'updateCapitalAccount|update_account|onUpdate' -- app components lib supabase
```

The Capital account Update path was confirmed:

`ManageAccountsDrawer.tsx → app/capital/page.tsx → updateCapitalAccount() → capital_api.update_account()`

No additional Capital account Update RPC callers were identified in the searched application source.

Other `onUpdate` matches were unrelated editor callbacks.

---

# 12. Account Taxonomy Functional Testing

The account taxonomy implementation has undergone manual functional testing in the live application.

Testing included account creation, account editing, persistence after full browser refresh, conditional controls and validation.

## 12.1 Create account test

A Brokerage test account was created using:

- Account Name: Taxonomy Test – Brokerage
- Broker: Test Broker
- Account Category: Brokerage
- Account Subtype: Taxable
- Ownership: Other
- Custom Ownership: Test Ownership
- Registration: Test Registration
- Trading Mode: Other
- Custom Trading Mode: Test Trading Mode
- Currency: CAD

The account saved successfully.

The account could then be opened in Edit.

**Result: PASS**

## 12.2 Edit persistence

The account was reopened and its taxonomy fields were edited.

The user confirmed that updates were saving successfully after migration 005.

The values were checked again after refreshing the browser and reopening Edit.

**Result: PASS**

## 12.3 Ownership clearing

Test:

1. Change Ownership from Other to Individual.
2. Clear Registration.
3. Save.
4. Refresh the browser.
5. Reopen Edit.

Expected:

- Ownership = Individual
- Custom Ownership = NULL
- Registration = NULL

The user confirmed the expected result after refreshing.

**Result: PASS**

## 12.4 Trading Mode custom-field clearing

Test:

1. Change Trading Mode from Other to Margin.
2. Save.
3. Refresh.
4. Reopen Edit.

Expected:

- Trading Mode = Margin
- Custom Trading Mode = NULL

The user confirmed the expected result.

**Result: PASS**

## 12.5 Required Custom Ownership validation

Test:

1. Select Ownership Other.
2. Leave Custom Ownership empty.
3. Attempt to save.

The form prevented the save.

**Result: PASS**

## 12.6 Required Custom Trading Mode validation

Test:

1. Set Trading Mode to Other.
2. Leave Custom Trading Mode empty.
3. Attempt to save.

The form prevented the save.

**Result: PASS**

## 12.7 Non-brokerage account creation

A second test account was created:

`Taxonomy Test – Bank`

The Trading Mode field disappeared when Bank was selected.

The account was successfully created.

**Result: PASS**

## 12.8 Non-brokerage account editing

The Bank account was opened in Edit.

Account Subtype was changed to:

`Test Chequing`

After saving, refreshing and reopening Edit, the updated subtype remained present.

Trading Mode remained hidden.

**Result: PASS**

## 12.9 Limited Margin

Test:

1. Open Brokerage account in Edit.
2. Select Limited Margin.
3. Save.
4. Refresh.
5. Reopen Edit.

The user confirmed the value persisted.

**Result: PASS**

## 12.10 Account category transitions

Tested:

`Brokerage → Bank → Brokerage`

Verified:

- Trading Mode disappears for Bank.
- Category changes persist.
- Trading Mode reappears when switching back to Brokerage.
- Previous custom trading-mode information is not incorrectly restored.

**Result: PASS**

## 12.11 Ownership option testing

Ownership selection tests were performed for the supported categories.

The user confirmed the ownership-option tests passed.

Options covered:

- Individual
- Joint
- Corporate
- Trust
- Other

**Result: PASS**

---

# 13. Account Taxonomy Verification Summary

| Area | Result |
|---|---|
| Create Brokerage account | PASS |
| Save ownership taxonomy | PASS |
| Save custom ownership | PASS |
| Save registration | PASS |
| Save custom trading mode | PASS |
| Edit existing taxonomy values | PASS |
| Load saved values into Edit | PASS |
| Ownership Other → Individual | PASS |
| Clear Custom Ownership | PASS |
| Clear Registration | PASS |
| Trading Mode Other → Margin | PASS |
| Clear Custom Trading Mode | PASS |
| Require Custom Ownership | PASS |
| Require Custom Trading Mode | PASS |
| Bank account creation | PASS |
| Bank account editing | PASS |
| Non-brokerage Trading Mode hidden | PASS |
| Limited Margin persistence | PASS |
| Brokerage/Bank category transition | PASS |
| Ownership options | PASS |

These are manual functional tests. They do not replace automated unit tests or database integration tests.

---

# 14. Current Build and Static Verification

After the account drawer and storage changes:

Command:

```bash
git diff --check
npm run build
```

Result:

**PASS**

Build environment:

- Next.js 16.2.6
- Turbopack
- TypeScript completed successfully
- Static page generation completed successfully
- All 32 static pages generated
- No build errors

This confirms the application compiles.

It does not establish that all Capital Management functionality is production-ready.

---

# 15. Capital Transactions — Data Model

Transaction types:

- DEPOSIT
- WITHDRAWAL
- TRANSFER

Transaction statuses:

- PENDING
- COMPLETED
- CANCELLED

The canonical frontend type is:

`CapitalTransaction`

It includes:

- `id`
- `date`
- `effectiveDate`
- `type`
- `status`
- `amount`
- `currency`
- `fromAccountId`
- `toAccountId`
- `receivedAmount`
- `receivedCurrency`
- `exchangeRate`
- `method`
- `counterpartyInstitution`
- `referenceNumber`
- `notes`
- `reversalOfTransactionId`
- `reversalReason`
- `createdAt`
- `updatedAt`

Database values remain canonical.

---

# 16. Transaction Database Security and Validation

Transaction creation must validate all relevant information at the database boundary.

The database must not trust:

- Frontend account IDs
- Frontend transaction IDs
- Frontend account status
- Frontend transaction status
- Frontend ownership claims
- Frontend exchange-rate values without backend validation

## 16.1 Account ownership

Transaction creation must verify that involved accounts belong to the authenticated user.

A user must not be able to submit another user's account UUID and create a transaction involving that account.

## 16.2 Account eligibility

Archived accounts cannot be used for new capital transactions.

The database must enforce this independently of frontend account filtering.

## 16.3 Deposit

Required:

- Destination account
- Amount
- Currency
- Transaction date

The destination account must be owned by the authenticated user and eligible for the transaction.

## 16.4 Withdrawal

Required:

- Source account
- Amount
- Currency
- Transaction date

The source account must be owned by the authenticated user and eligible.

## 16.5 Transfer

Required:

- Source account
- Destination account
- Source amount
- Source currency
- Transaction date

Both accounts must:

- Belong to the authenticated user.
- Be eligible.
- Be different accounts.

A transfer to the same account must be rejected.

## 16.6 Status validation

Supported statuses:

- PENDING
- COMPLETED
- CANCELLED

Completed transactions require an effective date.

Pending transactions must not be assigned a completed effective date.

## 16.7 Concurrency

Transaction creation includes account-level locking and deterministic lock ordering.

The database is responsible for maintaining integrity when multiple operations arrive concurrently.

---

# 17. Transaction RPC Architecture

Public API:

`capital_api.create_transaction`

Private implementation:

`capital_private.create_transaction_impl`

The frontend must call the public API.

The transaction RPC supports:

| Parameter | Purpose |
|---|---|
| `p_idempotency_key` | Retry and duplicate protection |
| `p_transaction_type` | Deposit, withdrawal or transfer |
| `p_status` | Pending, completed or cancelled |
| `p_amount` | Transaction amount |
| `p_currency` | Transaction currency |
| `p_from_account_id` | Source account |
| `p_to_account_id` | Destination account |
| `p_received_amount` | Receiving-side amount |
| `p_received_currency` | Receiving currency |
| `p_exchange_rate` | Transfer exchange rate |
| `p_transaction_date` | Transaction date |
| `p_effective_date` | Completion date |
| `p_method` | Transaction method |
| `p_counterparty_institution` | Institution or counterparty |
| `p_reference_number` | External reference |
| `p_notes` | User notes |

The database performs validation, ownership checks, account checks, idempotency checks, locking and atomic creation.

---

# 18. Transaction Idempotency

Idempotency prevents duplicate financial transactions when requests are retried.

Scenarios include:

- User double-clicks Save.
- Network request times out.
- Database commits but the client does not receive the response.
- User retries after an error.
- Browser retries a request.
- Same transaction is accidentally submitted more than once.

## 18.1 Database behavior

Same key and same payload:

Return the existing canonical transaction.

Same key and different payload:

Reject the request.

Reuse after deletion:

Reject reuse of the previous idempotency key.

Orphaned transaction:

Fail closed if the idempotency relationship cannot be safely resolved.

Database-level uniqueness remains authoritative.

## 18.2 Frontend idempotency

The transaction drawer uses:

`idempotencyRef`

It stores:

- Fingerprint
- Idempotency key

The fingerprint is based on:

`JSON.stringify(transactionPayload)`

The payload is constructed before adding the idempotency key.

### Same payload retry

Reuse the existing key.

### Changed payload

Generate a new key.

### Failed submission

Preserve the key.

### Successful submission

Clear the key and close the drawer.

The frontend implementation complements database idempotency rather than replacing it.

---

# 19. Currency Architecture

Supported currencies:

- CAD
- USD
- EUR
- GBP
- JPY
- INR

Precision requirements:

- JPY: zero decimal places.
- Other supported currencies: two decimal places.

Currency precision must remain consistent across:

- Frontend input
- Database validation
- Transaction storage
- Transaction display
- Capital analytics

## 19.1 Multi-currency transfers

A transfer may contain:

- Source amount
- Source currency
- Receiving amount
- Receiving currency
- Exchange rate

For same-currency transfers:

- Source and receiving currency must match.
- Receiving amount equals source amount.
- Exchange rate equals 1.

For cross-currency transfers:

- Receiving currency differs from source currency.
- Receiving amount must be valid.
- Exchange rate must be valid.
- Database validation must enforce the relationship.

The frontend must not silently infer or change canonical financial values.

---

# 20. Capital Management Frontend

Main page:

`app/capital/page.tsx`

Responsibilities:

- Account data loading
- Transaction data loading
- Loading/error/retry states
- Account and transaction integration
- Transaction drawer integration
- Transaction persistence callback
- Refresh after successful transaction creation
- Capital activity and analytics display

Account and transaction loading states are handled separately.

This prevents an account loading failure from being silently conflated with a transaction loading failure.

The page includes loading states across relevant UI sections, including metrics, funding sections, activity sections, pending transaction areas and the recent transactions table.

---

# 21. Add Transaction Drawer

File:

`components/capital/AddTransactionDrawer.tsx`

Responsibilities:

- Deposit form
- Withdrawal form
- Transfer form
- Transaction status
- Amount and currency
- Source and destination accounts
- Cross-currency receiving values
- Transaction date
- Method
- Counterparty institution
- Reference number
- Notes
- Frontend validation
- Saving state
- Idempotency fingerprint
- Idempotency key preservation
- Error display
- Successful close behavior

The drawer uses active accounts.

Deposit uses a destination account.

Withdrawal uses a source account.

Transfer uses both source and destination accounts.

The drawer prevents same-account transfers.

## 21.1 Current transaction validation

The handler checks:

- Duplicate submission prevention through `isSaving`
- Positive amount
- Valid selected source account for withdrawals
- Valid selected destination account for deposits
- Valid selected source account for transfers
- Valid selected destination account for transfers
- Different source and destination accounts
- Positive and finite cross-currency received amount
- Positive and finite exchange rate

## 21.2 Error handling

The drawer:

- Clears previous errors before submission.
- Sets saving state during the request.
- Waits for parent persistence.
- Closes only after successful submission.
- Keeps the drawer open after failure.
- Displays the failure.
- Clears saving state after completion.

The UI must not display success when persistence has failed.

---

# 22. Transaction Storage Layer

File:

`lib/storage/supabaseCapitalTransactionStorage.ts`

Responsibilities:

- Transaction retrieval
- Transaction creation
- RPC calls
- Response validation
- Parsing
- Currency validation
- Status validation
- Type validation
- Database-to-frontend mapping
- Pagination cursor handling
- Error propagation

The storage adapter uses structured input types.

Important types include:

- `CapitalTransactionRow`
- `CreateCapitalTransactionInput`
- `CapitalTransactionFilters`
- `CapitalTransactionCursor`
- `CapitalTransactionPage`

The transaction parser validates required values and nullable fields.

The mapper converts database records into the canonical frontend `CapitalTransaction` type.

---

# 23. Transaction Retrieval and Pagination

Function:

`loadCapitalTransactions()`

RPC:

`capital_api.list_transactions`

Supported filters:

- Status
- Transaction type
- Account ID
- Currency
- Start date
- End date

Cursor-based pagination exists in the storage layer.

Current page size:

`TRANSACTION_PAGE_SIZE = 50`

The storage adapter requests 51 records to determine whether another page exists.

Pagination uses:

- Activity date
- Transaction ID

Activity date uses the effective date when available; otherwise it uses the transaction date.

## Known limitation

Pagination infrastructure exists in storage, but the Capital Management UI is not yet fully wired to load subsequent pages.

The current frontend loads only the initial page.

This means transaction history and analytics may operate on an incomplete dataset.

Pagination integration remains outstanding.

---

# 24. Parent Page Transaction Integration

File:

`app/capital/page.tsx`

The parent owns transaction persistence.

The drawer does not directly create database transactions.

The parent:

1. Receives the transaction payload.
2. Calls `createCapitalTransaction()`.
3. Waits for the RPC.
4. Increments transaction retry state after success.
5. Triggers transaction reload.
6. Displays the success notice.

A failed persistence request must not trigger a false success state or refresh as though a transaction was committed.

---

# 25. Current Account and Transaction Test Fixtures

The previous database baseline recorded:

- One archived test account
- Zero active accounts
- Zero capital transactions

That baseline was captured before the latest account taxonomy tests.

Since then, the following test accounts were created:

- `Taxonomy Test – Brokerage`
- `Taxonomy Test – Bank`

Both were used during the account taxonomy functional tests.

Their current account statuses should be rechecked before any future database cleanup.

The previous archived test account's current status has not been rechecked.

The current capital transaction count has also not been rechecked.

Do not assume the database is still in its original clean test state.

Test accounts should be cleaned up deliberately when testing is complete, subject to account archival restrictions and any transaction relationships.

---

# 26. Known Issues and Outstanding Risks

These are known areas that still require implementation, testing or design decisions.

## 26.1 Account Management UI refinement

The taxonomy UI is functionally implemented and tested.

Visual refinement remains outstanding.

Future review should evaluate:

- Drawer spacing
- Form hierarchy
- Field grouping
- Conditional field transitions
- Label clarity
- Validation message placement
- Responsive behavior
- Consistency between Create and Edit
- Accessibility

Do not redesign the entire drawer without need.

Preserve the existing premium Capital Management visual language.

## 26.2 Account archive UI

The backend archive function exists.

The user-facing archive action and lifecycle experience still require review.

Verify:

- Archive action visibility
- Confirmation behavior
- Error states
- Pending transaction restrictions
- Account list refresh
- Archived account presentation
- Protection against creating new transactions from archived accounts

## 26.3 Transaction pagination

The UI does not yet fully use the storage pagination infrastructure.

Potential impact:

- Transactions beyond the first 50 may not be visible.
- Analytics may use an incomplete dataset.
- Activity totals may not represent the full history.

This needs resolution before production readiness.

## 26.4 Analytics completeness

If analytics use only the currently loaded transaction page, totals may be incomplete.

The UX must distinguish:

- Complete data
- Partial loaded data
- Loading
- Error

Financial analytics must not silently present partial data as complete totals.

## 26.5 Date validation

The current frontend date validation is permissive.

Audit:

- Strict ISO date validation
- Invalid dates
- Timezone behavior
- Date boundaries
- Pending transaction dates
- Completed transaction effective dates

## 26.6 Currency precision

The transaction drawer does not yet comprehensively enforce currency-specific precision.

Verify:

- JPY rejects fractional amounts.
- Other supported currencies respect two decimal places.
- Frontend and backend behavior match.

Backend validation remains mandatory.

## 26.7 Numeric precision

Examine JavaScript floating-point behavior in financial inputs.

Avoid unnecessary rounding or precision inconsistencies.

Database numeric types remain canonical.

## 26.8 Cross-currency transfer consistency

Requires end-to-end functional verification of:

- Source amount
- Source currency
- Received amount
- Received currency
- Exchange rate
- Database validation
- UI display

## 26.9 Drawer close behavior during save

The transaction drawer prevents duplicate submissions through `isSaving`.

However, cancel, backdrop and header close behavior during an in-flight request needs review.

Potential risks:

- The user closes the drawer during a save.
- The request continues after the drawer closes.
- The user is unsure whether the transaction succeeded.
- Another transaction is submitted before the first result is known.

Define this behavior deliberately.

## 26.10 Error messaging

Review whether database errors expose inappropriate internal information to users.

A production error layer may need:

- Safe user-facing messages
- Internal diagnostic logging
- Error classification
- Retryable versus non-retryable errors

## 26.11 Transaction attachments

Displayed attachment UI must not be treated as proof of a secure persisted upload.

A complete attachment implementation needs review of:

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

## 26.12 Transaction lifecycle

Future review areas include:

- Pending transaction completion
- Cancellation
- Reversal
- Editing restrictions
- Transaction history
- Filtering
- Search
- Pagination UX

## 26.13 Automated verification

The account taxonomy has been manually tested, but dedicated automated coverage is still required.

Future tests should include:

- Storage adapter tests
- Account form validation tests
- RPC contract tests
- Database integration tests
- RLS regression tests
- Authorization regression tests
- Idempotency tests
- Concurrency tests

---

# 27. Current Files and Responsibilities

## Account management

`components/capital/ManageAccountsDrawer.tsx`

Create/Edit Account UI, taxonomy state and validation.

`lib/storage/supabaseCapitalStorage.ts`

Account RPC calls, normalization, parsing and mapping.

`lib/capital/types.ts`

Canonical account and transaction types.

`app/capital/page.tsx`

Capital page integration and account/transaction persistence callbacks.

## Transactions

`components/capital/AddTransactionDrawer.tsx`

Transaction creation UI, validation and idempotency behavior.

`lib/storage/supabaseCapitalTransactionStorage.ts`

Transaction retrieval, creation, response validation, mapping and pagination.

## Database

`supabase/migrations/`

Versioned Capital Management database implementation.

---

# 28. Latest Git and Working Tree Status

The latest confirmed working-tree status before the storage-layer change was:

```text
 M components/capital/ManageAccountsDrawer.tsx
 M docs/notes.md
?? supabase/migrations/20261122000500_capital_account_taxonomy_update_semantics.sql
```

The storage layer was subsequently modified to send the new taxonomy flag:

`lib/storage/supabaseCapitalStorage.ts`

The exact current Git status should be checked again before staging.

Expected intended changes now include:

- Account drawer taxonomy implementation
- Account storage Update flag
- Migration 005
- User-authored documentation changes

`docs/notes.md` is intentionally modified and must be preserved.

No commit or push for this latest account taxonomy work has been confirmed.

## Git discipline

Before committing:

1. Run `git status --short`.
2. Inspect every changed file.
3. Review the complete migration.
4. Review account drawer changes.
5. Review storage changes.
6. Preserve `docs/notes.md`.
7. Run `git diff --check`.
8. Run `npm run build`.
9. Stage only intended changes.
10. Inspect the staged diff.
11. Commit.
12. Push to `origin main`.
13. Confirm push success.

Do not stage unrelated files accidentally.

---

# 29. Completed Implementation Checklist

## Database foundation

- [x] Capital Management database foundation
- [x] API/private schema separation
- [x] Initial database permissions
- [x] RLS foundation
- [x] Account structures
- [x] Account ownership and status
- [x] Account CRUD database implementation
- [x] Account subtype support
- [x] Transaction database model
- [x] Transaction creation RPC
- [x] Transaction API security correction

## Account taxonomy

- [x] Ownership field
- [x] Custom Ownership field
- [x] Registration field
- [x] Custom Trading Mode field
- [x] Brokerage Trading Mode options
- [x] Limited Margin support
- [x] Other Trading Mode support
- [x] Create RPC taxonomy support
- [x] Edit RPC taxonomy support
- [x] Account listing taxonomy mapping
- [x] Migration 003 applied
- [x] Migration 004 correction deployed
- [x] Migration history reconciliation
- [x] Migration 005 deployed
- [x] Explicit taxonomy replacement semantics
- [x] Backward-compatible preserve default
- [x] Remote function security verified
- [x] Remote function permissions verified

## Account frontend and storage

- [x] Create taxonomy controls
- [x] Edit taxonomy controls
- [x] Load saved taxonomy values
- [x] Create RPC payload
- [x] Update RPC payload
- [x] Explicit taxonomy replacement flag
- [x] Input trimming
- [x] Empty values normalized to NULL
- [x] Field length validation
- [x] Conditional Custom Ownership
- [x] Conditional Custom Trading Mode
- [x] Required custom-field validation
- [x] Non-brokerage Trading Mode hiding
- [x] Category transition behavior

## Account functional verification

- [x] Create Brokerage account
- [x] Edit Brokerage account
- [x] Verify saved data after refresh
- [x] Clear Custom Ownership
- [x] Clear Registration
- [x] Clear Custom Trading Mode
- [x] Ownership Other → Individual
- [x] Trading Mode Other → Margin
- [x] Required Custom Ownership validation
- [x] Required Custom Trading Mode validation
- [x] Create Bank account
- [x] Edit Bank account
- [x] Verify account subtype persistence
- [x] Verify non-brokerage Trading Mode hiding
- [x] Limited Margin persistence
- [x] Brokerage → Bank → Brokerage transition
- [x] Ownership option testing

## Verification

- [x] Migration dry-run
- [x] Migration 005 deployed successfully
- [x] Remote Update function inspected
- [x] Function security verified
- [x] Function permissions verified
- [x] `git diff --check` passed
- [x] `npm run build` passed
- [ ] Dedicated automated account taxonomy tests
- [ ] Final Git review
- [ ] Commit and push

---

# 30. Remaining Transaction Functional Testing

Transaction creation is implemented but must not be considered end-to-end production-verified yet.

The following tests remain.

## Phase A — Test environment readiness

- Verify Supabase connection.
- Confirm Capital Management RPCs are available.
- Confirm account loading works.
- Confirm at least one active account exists.
- Confirm the account is eligible for transactions.
- Verify the Capital page loads without unexpected errors.

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
- Receiving amount equals source amount
- Exchange rate equals 1
- Same-account transfer rejected
- Database persistence

## Phase E — Cross-currency transfer

Test:

- Different source and destination currencies
- Source amount
- Receiving amount
- Receiving currency
- Exchange rate
- Validation
- Persisted values
- UI display

## Phase F — Pending transaction

Verify:

- Pending transaction can be created.
- Effective date is NULL.
- Pending transaction appears in pending activity.
- Pending transaction is not incorrectly treated as completed funding.

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
2. Reproduce a retry.
3. Submit the identical payload using the same key.
4. Confirm no duplicate transaction is created.
5. Change the payload.
6. Confirm a different key is generated.
7. Successfully save.
8. Confirm the key is cleared.
9. Create a new intentional transaction with identical details.
10. Confirm it can be created as a new transaction.

## Phase I — UI refresh

Verify:

- Save completes.
- Drawer closes.
- Success notice appears.
- Transaction list refreshes.
- Transaction appears exactly once.
- Displayed values match the database.
- Loading state is correct.
- No stale transaction state remains.

---

# 31. Production Readiness Roadmap

Capital Management still requires work beyond the current account taxonomy milestone.

Future areas:

- Account drawer visual refinement
- Account archive UI
- Full transaction pagination in UI
- Analytics completeness
- Strict date validation
- Currency precision validation
- Financial rounding strategy
- Safe error messaging
- Drawer behavior during in-flight requests
- Pending transaction lifecycle
- Cancellation behavior
- Completion behavior
- Reversal behavior
- Transaction editing restrictions
- Transaction filtering and search
- Pagination UX
- Secure attachments
- Large transaction history performance
- Accessibility
- Responsive behavior
- Automated tests
- Database integration tests
- Concurrency testing
- RLS regression testing
- Idempotency regression testing

Do not mark Capital Management production-ready merely because the account taxonomy tests and production build pass.

---

# 32. Next Development Sequence

The account taxonomy implementation is now functionally verified.

The next work should proceed in controlled phases.

## Phase 1 — Account Management UI refinement

Review the current Manage Accounts drawer.

Improve the visual presentation of the newly implemented taxonomy controls while preserving the existing drawer design.

Focus on:

- Create/Edit consistency
- Field hierarchy
- Spacing
- Conditional controls
- Ownership and Registration presentation
- Validation messages
- Responsive layout
- Accessibility

Do not change working database behavior without a concrete reason.

## Phase 2 — Continue Account Management testing

Continue testing additional account behaviors and edge cases.

Review:

- Account category changes
- Account metadata
- Empty optional fields
- Maximum field lengths
- Account number validation
- Error handling
- Account archive and lifecycle behavior
- Existing account data preservation

Fix defects individually and retest after each change.

## Phase 3 — Git checkpoint

After the UI changes and account tests are complete:

- Review Git status.
- Preserve `docs/notes.md`.
- Review the staged diff.
- Run the production build.
- Commit the intended changes.
- Push to `origin main`.

## Phase 4 — Transaction functional testing

Begin controlled end-to-end testing of deposits, withdrawals, transfers and transaction lifecycle behavior.

Test database persistence and UI consistency for every operation.

## Phase 5 — Broader Capital Management audit

Review pagination, analytics completeness, security, financial precision, date handling, attachments and performance.

---

# 33. Current Master Checkpoint

**Checkpoint date:** November 22, 2026

**Account Management taxonomy:** Implemented and manually functionally tested.

**Database migration history:** Reconciled through migration 004; migration 005 subsequently deployed successfully.

**Migration 005:** Applied and remote function metadata verified.

**Account storage Update contract:** Updated to send `p_taxonomy_fields_provided: true`.

**Production build:** PASS.

**Account Create/Edit persistence:** PASS.

**Intentional taxonomy clearing:** PASS.

**Conditional field validation:** PASS.

**Non-brokerage account behavior:** PASS.

**Transaction backend implementation:** Built, but end-to-end functional testing remains outstanding.

**Transaction pagination:** Storage support exists; UI integration remains incomplete.

**Git commit/push:** Latest account taxonomy changes have not yet been confirmed committed or pushed.

**Next milestone:** Refine the Account Management UI, continue account functionality testing, then proceed with end-to-end transaction testing.

---

## Important continuation instructions

When continuing this project:

- Use the existing architecture and canonical data models.
- Preserve existing account and transaction behavior.
- Do not repeat completed tests unnecessarily.
- Do not modify applied migrations.
- Do not use speculative SQL.
- Verify actual database state before making database changes.
- Keep changes narrow and testable.
- Preserve user-authored documentation.
- Continue with one concrete task at a time.
- Distinguish verified behavior from assumptions.
- Keep the Capital Management module isolated from canonical trading data.

**This document is the current master implementation checkpoint for Capital Management as of November 22, 2026.**