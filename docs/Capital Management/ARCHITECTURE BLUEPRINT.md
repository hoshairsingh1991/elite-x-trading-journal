# ELITE X TRADING JOURNAL
# CAPITAL MANAGEMENT — PRODUCT & ARCHITECTURE BLUEPRINT

**Document Status:** Architecture Planning — Account Audit Completed  
**Version:** V1 Planning  
**Scope:** Manual capital movement tracking  
**Module:** Capital Management  
**Database Implementation:** Not Started  
**UI Implementation:** Not Started

---

# 1. PURPOSE AND VISION

Capital Management is an independent financial record system within Elite X Trading Journal.

Its primary purpose is to maintain an accurate history of money moving into, out of, and between the user's brokerage accounts.

The objective is to provide complete visibility into personal trading capital and brokerage funding activity.

At any point, the user should be able to answer:

- How much money did I deposit this year?
- Which brokerage account received each deposit?
- Where did the money come from?
- How did I send the money?
- How much money did I withdraw?
- Which account did the withdrawal come from?
- Where did the withdrawn money go?
- How much money moved between my brokerage accounts?
- What was my total external funding for a selected period?
- How much capital went into each individual account?
- What is the complete historical transaction record for each account?

**Core principle: Every capital movement must have a clear amount, currency, date, source, destination, direction, method, and auditable transaction history.**

Capital Management must remain separate from:

- The canonical trading execution ledger.
- Trading performance and P&L calculations.
- The existing Expenses module.

Capital Management tracks capital movements. It does not calculate brokerage cash balances, portfolio valuations, or investment performance.

---

# 2. V1 SCOPE — APPROVED TRANSACTION TYPES

V1 supports exactly three transaction types:

1. Deposits
2. Withdrawals
3. Internal Transfers

No additional transaction types should be introduced into the V1 interface.

## 2.1 DEPOSIT

A deposit represents money entering a tracked brokerage account from an external source.

**Required information:**

- Destination brokerage account.
- Amount.
- Transaction currency.
- Transaction date.
- Transaction status.

**Additional information:**

- Source institution (e.g. TD Bank).
- Source account nickname (e.g. Personal Chequing).
- Deposit method (EFT, wire transfer, bill payment, etc.).
- Initiated date, when different from the transaction date.
- Effective/credited date.
- Reference or confirmation number.
- Notes.
- Optional supporting attachment.

Example:

A user transfers C$5,000 from a TD Bank chequing account into an IBKR Margin account.

Elite X records:

- Type: DEPOSIT
- Destination: IBKR Margin Account
- Amount: 5,000
- Currency: CAD
- Source institution: TD Bank
- Source account: Personal Chequing
- Method: EFT
- Status: COMPLETED
- Effective date: Actual brokerage credit date.

## 2.2 WITHDRAWAL

A withdrawal represents money leaving a tracked brokerage account for an external destination.

**Required information:**

- Source brokerage account.
- Amount.
- Transaction currency.
- Transaction date.
- Transaction status.

**Additional information:**

- Destination institution.
- Destination account nickname.
- Withdrawal method.
- Initiated date.
- Effective/debited date.
- Reference or confirmation number.
- Notes.
- Optional supporting attachment.

Example:

A user withdraws $2,000 USD from an IBKR account into a bank account.

Elite X records the source brokerage account, amount, USD currency, destination information, method, effective date and status.

## 2.3 INTERNAL TRANSFER

An internal transfer represents money moving between two brokerage accounts owned by the user.

**Required information:**

- Source brokerage account.
- Destination brokerage account.
- Amount.
- Currency.
- Transaction date.
- Transaction status.

**Additional information:**

- Initiated date.
- Effective date.
- Reference number.
- Notes.
- Optional supporting attachment.

Example:

The user transfers $3,000 USD from IBKR Account A to IBKR Account B.

Elite X records one transfer transaction containing both account references.

**Important architectural rule:**

An internal transfer must be stored as one canonical transaction record, not as two independent user-entered transactions.

The account-level outgoing and incoming movements should be derived from that single transaction.

This avoids duplicate entries, incomplete transfers and inconsistent reporting.

**Validation rules:**

- Source and destination accounts cannot be identical.
- Both accounts must belong to the authenticated user.
- Both accounts must exist in the canonical brokerage account registry.
- Transfer records must preserve both account references.
- The transfer must be created, updated or cancelled atomically.
- Internal transfers must not inflate consolidated external deposit or withdrawal totals.

### Cross-currency transfers

Cross-currency transfers must preserve:

- Amount sent.
- Sending currency.
- Amount received.
- Receiving currency.
- Explicit exchange rate.
- Transaction date.

The exchange-rate direction must be consistent:

**Receiving currency units per one unit of sending currency.**

For example:

- Amount sent: 5,000 CAD.
- Amount received: 3,500 USD.
- Exchange rate: 0.70 USD per CAD.

The system must never assume that the sending amount equals the receiving amount when currencies differ.

For same-currency transfers, the sent and received amounts must match.

---

# 3. UNIFIED BROKERAGE ACCOUNT REGISTRY

This is one of the most important architectural components of Capital Management.

Elite X must have one canonical brokerage account registry.

This registry will be the single source of truth for brokerage account identity across Capital Management.

## 3.1 Multiple accounts per broker

A user may own multiple brokerage accounts with the same broker.

This must be supported without an artificial account limit.

For example, one user may have:

**Interactive Brokers**

- IBKR Margin Account 1.
- IBKR Margin Account 2.
- IBKR Cash Account.
- IBKR TFSA Account.
- IBKR RRSP Account.

All five accounts belong to the same broker but represent five separate financial accounts.

Each account must have its own stable internal UUID.

The same principle applies to other supported brokers.

The account registry must support:

- Unlimited accounts per broker.
- Multiple account types.
- Different base currencies.
- Multiple accounts with different aliases.
- Accounts connected through integrations.
- Manually registered accounts.

Account type must not be restricted to a short hardcoded list that prevents future account categories.

Examples include:

- Cash.
- Margin.
- TFSA.
- RRSP.
- Corporate.
- Other/custom.

## 3.2 Existing IBKR integration

Existing IBKR account connections should populate the canonical brokerage account registry.

Users should not have to recreate an account manually if it is already configured in Elite X.

The existing integration configuration is stored in:

`broker_connections`

Verified fields include:

- `id`
- `user_id`
- `broker`
- `account_alias`
- `broker_account_id`
- `flex_query_id`
- `flex_token`
- `is_active`
- Synchronization metadata.

The existing broker connection will be linked to the corresponding canonical brokerage account.

**Important limitation discovered during the audit:**

The current application stores configured IBKR account connections. We have not established that Elite X automatically discovers every account a user owns directly from IBKR.

Therefore:

- Existing configured IBKR connections should populate the new registry.
- IBKR accounts not yet configured in Elite X must first be added through the existing connection workflow or manually registered.
- Automatic discovery of additional IBKR accounts is not part of V1.

## 3.3 Manually created accounts

Users must be able to add brokerage accounts that are not connected through an Elite X integration.

For example:

- Questrade.
- Wealthsimple.
- Another brokerage.
- An additional account at an existing broker.

A manually created brokerage account must not require:

- IBKR Flex Query ID.
- IBKR Flex Token.
- Broker API credentials.
- Automatic synchronization configuration.

Potential account information:

- Broker/provider name.
- Account display name.
- Provider account identifier, when available.
- Account type.
- Base currency.
- Account creation source.
- Account status.
- Created and updated timestamps.

## 3.4 Proposed account architecture

Two separate concepts must be maintained.

**A. Brokerage Account**

Represents the actual financial account owned by the user.

Proposed table:

`brokerage_accounts`

**B. Broker Connection**

Represents the integration configuration used to communicate with a brokerage account.

Existing table:

`broker_connections`

Proposed relationship:

`broker_connections.brokerage_account_id` references `brokerage_accounts.id`.

Conceptually:

```text
                    brokerage_accounts
                           |
              +------------+------------+
              |            |            |
           IBKR A        IBKR B       Manual A
              |            |
              |            |
       broker_connections  broker_connections
              |            |
          Flex Sync     Flex Sync

              |
              |
       Capital Management
```

This separation is important because a financial account can exist independently of an active broker integration.

Capital Management must reference `brokerage_accounts.id`, not IBKR-specific integration credentials.

## 3.5 Account rules

- One unified registry powers all brokerage account selectors.
- Each account belongs to one authenticated user.
- Multiple accounts per broker are supported.
- Account identity remains stable when the display name changes.
- Provider account IDs should be unique per user and broker when present.
- Manually created accounts may have no provider account ID.
- Account base currency must not restrict transaction currency.
- Closing an account must not delete its transaction history.
- Broker synchronization must be idempotent.
- Existing IBKR connections must map to exactly one canonical account during the initial migration.
- Do not create duplicate IBKR accounts during repeated synchronization.

External bank accounts used as deposit sources or withdrawal destinations are counterparties, not brokerage accounts in this registry.

Do not store full external bank account numbers, passwords or banking credentials.

---

# 4. EXISTING DATABASE AND ACCOUNT ARCHITECTURE AUDIT

The initial application and live Supabase investigation has been completed.

This section documents verified findings to prevent future architectural assumptions.

## 4.1 Existing Supabase tables

The current `public` schema inventory returned 14 tables:

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

The following tables do not currently exist:

- `brokerage_accounts`
- `capital_transactions`
- `capital_transaction_events`
- `capital_transaction_attachments`

No existing dedicated brokerage account registry was found during this audit.

## 4.2 Verified `broker_connections` schema

The actual live database columns are:

| Column | Data type | Nullable |
|---|---|---|
| id | uuid | No |
| user_id | uuid | No |
| broker | text | No |
| flex_query_id | text | No |
| flex_token | text | No |
| is_active | boolean | Yes |
| created_at | timestamptz | Yes |
| updated_at | timestamptz | Yes |
| account_alias | text | Yes |
| last_sync_at | timestamptz | Yes |
| last_sync_status | text | Yes |
| last_sync_error | text | Yes |
| last_sync_execution_count | integer | Yes |
| sync_cursor_date | date | Yes |
| broker_account_id | text | Yes |

Important findings:

- `flex_query_id` is NOT NULL.
- `flex_token` is NOT NULL.
- `account_alias` is nullable.
- `broker_account_id` is nullable.
- The table combines brokerage account identity with integration credentials and synchronization information.

This is a primary reason why it should not become the universal brokerage account registry.

## 4.3 Verified constraints and indexes

Primary key:

```sql
broker_connections_pkey
PRIMARY KEY (id)
```

Foreign key:

```sql
broker_connections_user_id_fkey

FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE
```

Verified unique index:

```sql
CREATE UNIQUE INDEX
broker_connections_user_broker_account_unique
ON public.broker_connections
USING btree (user_id, broker_account_id);
```

Important implications:

- A user cannot have duplicate non-null account IDs within the current table.
- Multiple accounts per user are supported.
- The index does not include `broker`.
- Multiple NULL account identifiers can exist under PostgreSQL's default unique-index behavior.
- The new canonical registry should use a provider-aware identity rule.

Proposed canonical uniqueness:

`(user_id, broker, provider_account_id)`

This should be implemented as a partial unique index applying only when `provider_account_id` is not NULL.

The existing unique index must be preserved during the initial migration. Any later modification requires a separate compatibility review.

## 4.4 Verified RLS configuration

Live database result:

```text
rls_enabled = true
force_rls = false
```

Four existing policies were confirmed:

| Operation | Policy |
|---|---|
| SELECT | Users can view own broker connections |
| INSERT | Users can insert own broker connections |
| UPDATE | Users can update own broker connections |
| DELETE | Users can delete own broker connections |

The policies enforce:

`auth.uid() = user_id`

RLS is enabled.

`FORCE ROW LEVEL SECURITY` is false.

This is not automatically a problem. However, server-side use of the Supabase service-role client bypasses RLS and must enforce user ownership explicitly.

Every new Capital Management table must have appropriate RLS policies.

## 4.5 Existing broker connection population

The live database audit found:

| Metric | Result |
|---|---:|
| Active broker connections | 5 |
| Broker provider | IBKR |
| Users represented | 3 |
| Distinct user/account pairs | 5 |
| Maximum connections for one user | 3 |
| Missing account identifiers | 0 |
| Missing account aliases | 0 |

These are application-wide counts, not an assertion that the current user personally has five accounts.

An earlier aggregate query found four distinct external account ID values across the five connections. An external account identifier can therefore appear under more than one user.

The new account registry must enforce uniqueness within the user and broker scope, not globally across all Elite X users.

The result also confirms that all currently recorded connections have account identifiers and account aliases, which is useful for the initial backfill.

---

# 5. EXISTING APPLICATION INTEGRATION FINDINGS

The following existing code paths were inspected.

These findings must be considered during implementation.

## 5.1 Existing account option helper

File:

`lib/storage/accountStorage.ts`

The existing `AccountOption` type is a UI option abstraction, not a canonical account entity.

`loadManualAccountOptions()`:

- Reads `account` values from `executions`.
- Limits results to 1,000 records.
- Deduplicates text values.
- Labels every result as `manual`.

This mechanism is not suitable as the foundation for Capital Management.

Reasons:

- Accounts are inferred from execution history.
- Accounts without executions may be missing.
- There is no stable account UUID.
- Account source classification is not reliable.
- Old account names may disappear outside the latest 1,000 executions.

Capital Management must use the new canonical brokerage account registry.

## 5.2 Settings page

File:

`app/settings/page.tsx`

The Settings page:

- Loads broker connection records.
- Creates IBKR connection records.
- Supports editing broker account aliases and identifiers.
- Stores Flex Query configuration and authentication credentials.
- Uses `broker_connections` for integration management.

This remains the existing IBKR integration management workflow.

The new brokerage account registry must integrate with it without disrupting current functionality.

## 5.3 Trades page

File:

`app/trades/page.tsx`

The Trades page loads:

- `broker_account_id`
- `account_alias`

from `broker_connections`.

It also separately loads manual account options from `loadManualAccountOptions()`.

This confirms that the application currently has two separate account-selection mechanisms.

A future application-wide account registry should eventually consolidate these account sources.

However, the initial Capital Management implementation must not unnecessarily rewrite the Trades page.

## 5.4 Dashboard account workflow

File:

`app/dashboard/page.tsx`

The Dashboard contains an older IBKR connection workflow.

Findings:

- Its connection modal uses `.single()` for an IBKR connection.
- Its save operation uses an upsert conflict target of `(user_id, broker)`.

The live database has a unique index on `(user_id, broker_account_id)`, not `(user_id, broker)`.

The old single-account workflow is therefore incompatible with the newer multi-account architecture and should be investigated separately.

This is a pre-existing compatibility issue, not a Capital Management requirement.

Do not change this workflow as part of the initial Capital Management implementation.

## 5.5 IBKR synchronization architecture

The current synchronization flow is:

```text
broker_connections
        |
        v
syncUserBrokers()
        |
        v
syncBroker()
        |
        v
fetchFlex()
        |
        v
parseIBKRCsv()
        |
        v
replaceBrokerExecutionsAtomically()
        |
        v
Canonical executions
```

The newer manual sync endpoint authenticates the user and passes the authenticated user ID into the broker synchronization service.

The service queries only that user's active broker connections.

This integration must continue functioning after the brokerage account registry is introduced.

## 5.6 Canonical execution identity

The broker execution replacement workflow currently uses string-based account identity.

The existing execution replacement RPC receives:

- User ID.
- Broker account identifier as text.
- Execution dates.
- Serialized executions.

The execution records also contain an `account` text value.

There is no `brokerage_accounts.id` relationship in this existing execution-writing flow.

**Migration rule: Do not modify the canonical execution ledger simply to introduce Capital Management.**

Do not change:

- Execution identity.
- Trade pairing.
- FIFO calculations.
- Historical trade associations.
- Existing broker execution synchronization.

A future migration from text-based account identity to canonical account IDs would require its own separate technical justification and backward-compatibility plan.

## 5.7 Flex token endpoint

File:

`app/api/broker-connections/[brokerId]/token/route.ts`

The endpoint:

- Authenticates the caller.
- Obtains the broker connection ID.
- Filters the server-side query by both connection ID and authenticated user ID.
- Returns the token only after ownership is verified.

Settings retrieves this token when the user requests to reveal it.

This ownership pattern should be maintained for any future server-side broker credential operations.

---

# 6. SEPARATE SECURITY FOLLOW-UP ITEMS

The initial audit also uncovered issues unrelated to Capital Management.

These must be tracked separately and must not be silently ignored.

## 6.1 Legacy IBKR Flex endpoint

File:

`app/api/ibkr/flex/route.ts`

Findings:

- The handler does not authenticate the request.
- It uses `supabaseAdmin`.
- Its broker connection query filters only by `is_active`.
- It does not filter by authenticated user ID.
- It expects a single active connection globally.
- It returns the complete Flex statement XML.

No internal application references to `/api/ibkr/flex` were found in the searched application directories.

No Next.js `middleware.ts` or `proxy.ts` was found.

The inspected `vercel.json` contains scheduled synchronization jobs only.

Vercel dashboard Deployment Protection settings were not inspected.

**Security assessment:** Treat the legacy endpoint as potentially exposed until deployment-level access controls and external callers are verified.

Recommended separate action:

- Determine whether the endpoint is obsolete.
- If unused, retire it safely.
- Otherwise, add strict authentication and user/account ownership checks.
- Avoid logging or returning full sensitive statements unnecessarily.

Do not mix this remediation into Capital Management.

## 6.2 Dashboard legacy IBKR connection workflow

The Dashboard's old single-account connection workflow is incompatible with the verified multi-account schema.

Track this separately for a future compatibility fix.

---

# 7. TRANSACTION STATUS AND DATE MANAGEMENT

Capital Management must distinguish between an initiated transaction and a completed movement of money.

## 7.1 Transaction statuses

V1 supports:

1. PENDING — Initiated but not yet confirmed.
2. COMPLETED — Confirmed as having moved.
3. CANCELLED — Did not complete.

Only COMPLETED transactions contribute to confirmed funding totals.

PENDING transactions are displayed separately.

CANCELLED transactions remain available for historical reference but do not affect confirmed totals.

## 7.2 Transaction dates

The system should distinguish:

- Transaction date.
- Initiated date.
- Effective date.
- Created timestamp.
- Updated timestamp.

The effective date determines the reporting period for completed movements.

A pending transaction may not yet have an effective date.

A transaction must have an effective date before it can be marked COMPLETED.

The created timestamp must never replace the actual financial transaction date.

---

# 8. TRANSACTION METHODS AND EXTERNAL COUNTERPARTIES

The user should be able to record how money moved.

Supported examples:

- EFT.
- Bank wire.
- Bill payment.
- ACH.
- Cheque.
- Broker-to-broker transfer.
- Other.

The method field should remain extensible.

For deposits, capture:

- Source institution.
- Optional source account nickname.

For withdrawals, capture:

- Destination institution.
- Optional destination account nickname.

These fields are optional when information is not applicable or known.

Do not store complete external bank account numbers or banking credentials.

The objective is to make every movement understandable months or years later.

---

# 9. PROPOSED DATABASE ARCHITECTURE

The following is the recommended target architecture.

Exact column definitions, constraints, indexes, RPCs and migration SQL must be finalized in the next database-design phase.

No database changes have been approved or executed yet.

## 9.1 `brokerage_accounts` — NEW

Purpose:

Canonical registry of every brokerage account owned by the user.

Proposed fields:

| Field | Purpose |
|---|---|
| id | UUID primary key |
| user_id | Account owner |
| broker | Broker/provider |
| display_name | User-friendly account name |
| provider_account_id | External account identifier, nullable for manual accounts |
| account_type | Cash, Margin, TFSA, RRSP, etc. |
| base_currency | Account base currency |
| account_source | Origin of account record |
| account_status | Active or Closed |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

Design requirements:

- Support unlimited accounts per broker.
- Support multiple account types.
- Support different base currencies.
- Support manually created accounts.
- Support provider-linked accounts.
- Use stable UUID identity.
- Allow optional provider IDs for manual accounts.
- Enforce ownership.
- Preserve accounts with historical transactions.
- Use a provider-aware uniqueness rule.
- Do not rely on the account display name as the primary identifier.

## 9.2 `broker_connections` — EXTEND EXISTING

Retain the existing table and its current integration responsibilities.

Proposed extension:

`brokerage_account_id`

This references:

`brokerage_accounts.id`

Existing IBKR records will be mapped to their corresponding canonical brokerage account records.

Important migration rules:

- Preserve existing Flex Query IDs.
- Preserve existing Flex Tokens.
- Preserve existing synchronization metadata.
- Preserve existing broker account identifiers and aliases.
- Preserve current broker synchronization behavior.
- Do not remove old columns during the initial migration.
- Do not change the existing unique index without a specific compatibility decision.

The relationship and any additional provider-connection structure must be finalized before migration SQL is written.

## 9.3 `capital_transactions` — NEW

Purpose:

The canonical ledger of capital movements.

V1 transaction types:

- DEPOSIT
- WITHDRAWAL
- TRANSFER

Proposed fields:

| Field | Purpose |
|---|---|
| id | UUID primary key |
| user_id | Transaction owner |
| transaction_type | Deposit, withdrawal or transfer |
| status | Pending, completed or cancelled |
| from_account_id | Source brokerage account |
| to_account_id | Destination brokerage account |
| amount | Primary transaction amount |
| currency | Primary transaction currency |
| received_amount | Receiving amount for transfers |
| received_currency | Receiving currency for transfers |
| exchange_rate | Explicit transfer conversion rate |
| transaction_date | Financial transaction date |
| initiated_date | Date initiated |
| effective_date | Actual debit/credit date |
| method | How money moved |
| counterparty_institution | External bank or institution |
| counterparty_account_label | External account nickname |
| reference_number | Transaction reference |
| notes | Additional details |
| entry_source | MANUAL initially |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

Exact field nullability and conditional constraints will be specified in the database design.

### Transaction relationships

Deposit:

- `from_account_id` is NULL.
- `to_account_id` references the brokerage account receiving money.

Withdrawal:

- `from_account_id` references the brokerage account losing money.
- `to_account_id` is NULL.

Internal transfer:

- Both account references are required.
- Both must belong to the same user.
- They cannot reference the same account.

### Single-record transfer architecture

V1 will use one canonical transfer transaction row.

There will be no separate `capital_transaction_movements` table initially.

Incoming and outgoing account-level movement views will be derived from the source and destination references.

This reduces unnecessary duplication and keeps the transaction lifecycle simpler.

A separate posting/movement ledger can be considered if Elite X later evolves into a broader accounting platform.

## 9.4 `capital_transaction_events` — NEW

Purpose:

Maintain a historical audit trail for financial transaction changes.

Potential events:

- TRANSACTION_CREATED.
- STATUS_CHANGED.
- TRANSACTION_COMPLETED.
- TRANSACTION_CANCELLED.
- TRANSACTION_CORRECTED.
- TRANSACTION_REVERSED.

Each event should preserve:

- Transaction ID.
- User ID.
- Event type.
- Previous values, where applicable.
- New values, where applicable.
- Reason or explanation.
- Actor.
- Event timestamp.

The event history should be append-only through the application's supported write paths.

### Completed transaction correction rules

Completed transactions must not be silently edited or deleted.

Corrections must preserve the original record and its audit history.

The exact reversal/correction representation must be finalized before SQL implementation.

A correction should be linked to the original transaction.

The solution must not introduce an unnecessary fourth user-facing V1 transaction type.

Pending transactions may be edited or cancelled according to validation rules.

## 9.5 `capital_transaction_attachments` — OPTIONAL NEW TABLE

Purpose:

Associate evidence documents with a transaction.

Potential metadata:

- Attachment ID.
- Transaction ID.
- User ID.
- Storage object path.
- Original filename.
- MIME type.
- File size.
- Uploaded timestamp.

Files should be stored in a private Supabase Storage bucket.

Storage access must enforce ownership.

Attachments remain optional and must not complicate basic transaction entry.

---

# 10. CURRENCY AND FINANCIAL PRECISION

Currency handling is a foundational requirement.

Rules:

- Preserve original transaction amounts.
- Preserve original currency codes.
- Use database NUMERIC/DECIMAL types for monetary values.
- Never use JavaScript floating-point arithmetic as the financial source of truth.
- Validate supported currency codes.
- Account base currency must not restrict transaction currency.
- Store the actual sending and receiving amounts of cross-currency transfers.
- Record an explicit exchange rate for cross-currency transfers.
- Never add different currencies directly.

For V1, report currency-specific totals separately.

Do not introduce automatic reporting-currency conversion in this module yet.

Any future conversion must use a documented and consistent FX policy.

---

# 11. CAPITAL MANAGEMENT REPORTING

Reporting should support:

- Calendar year.
- Custom date range.
- Broker.
- Individual brokerage account.
- Account type.
- Transaction type.
- Currency.
- Transaction status.
- Transaction method.

## 11.1 External funding summary

Display:

- Total external deposits.
- Total external withdrawals.
- Net external funding.

Formula:

**Net External Funding = Completed External Deposits − Completed External Withdrawals**

Only completed transactions contribute to confirmed funding totals.

## 11.2 Account-level reporting

For each brokerage account, display:

- Deposits received.
- Withdrawals made.
- Transfers received.
- Transfers sent.
- Transaction count.
- Complete transaction history.

## 11.3 Internal transfer reporting

Internal transfers must be shown separately.

Account-level reports should reflect incoming and outgoing transfer amounts.

Consolidated reports must not count internal transfers as external deposits or withdrawals.

When a report filters to a selected group of accounts, transfers crossing the selection boundary must be shown separately.

For example, if a transfer moves money from a selected IBKR account to an account not included in the selected report, it should be identified as a transfer leaving the selected account group.

It must not automatically be classified as money leaving the user's ownership.

## 11.4 Currency reporting

Currency totals must remain separate.

For example:

- CAD deposits.
- CAD withdrawals.
- CAD net funding.
- USD deposits.
- USD withdrawals.
- USD net funding.

Never combine CAD, USD or other currencies without an explicit conversion policy.

## 11.5 Important reporting limitation

Net external funding is not:

- Current brokerage account balance.
- Trading profit or loss.
- Portfolio value.
- Total investment performance.

Capital Management V1 captures only deposits, withdrawals and internal transfers.

It does not capture every financial activity that affects brokerage cash balances.

---

# 12. TRANSACTION PROVENANCE AND FUTURE IMPORTS

Every transaction must identify its origin.

Initial V1 source:

- MANUAL.

Future-compatible sources:

- IBKR_IMPORT.
- OTHER_BROKER_IMPORT.

The data model should leave room for:

- Provider transaction identifiers.
- Import batch references.
- External transaction references.
- Duplicate detection.
- Reconciliation metadata.

This will help prevent duplicate entries when automated imports are added in the future.

Automatic imports are not part of V1.

---

# 13. SUPPORTING DOCUMENTS

Allow optional attachments to transactions.

Examples:

- Bank transfer confirmations.
- Deposit confirmations.
- Withdrawal confirmations.
- Broker transfer confirmations.
- Supporting financial statements.

Attachments provide evidence, but do not replace structured transaction information.

Private storage, file ownership, secure access and upload validation are mandatory.

---

# 14. SEPARATION FROM OTHER ELITE X MODULES

Capital Management must remain an independent domain.

## 14.1 Trading module

The canonical execution ledger remains the source of truth for trades.

Capital Management must never:

- Create trading executions.
- Modify historical executions.
- Change FIFO pairing.
- Change trade associations.
- Change trading P&L.
- Duplicate trading commissions.

## 14.2 Expenses module

Business expenses remain in the existing Expenses module.

Broker fees, trading commissions and taxes currently recorded as business expenses should remain there.

A future IBKR Activity Flex import for eligible fee and tax records may be considered as a separate Expenses enhancement.

Capital Management V1 must not become a second expense-tracking system.

## 14.3 Financial reporting

Capital Management must not derive brokerage cash balances from its limited transaction records.

Trading activity, commissions, broker fees, dividends, interest, FX executions and other cash movements are outside the current V1 scope.

---

# 15. FUTURE-PROOFING — DEFERRED FUNCTIONALITY

The architecture should allow future expansion without requiring a full redesign.

Potential future functionality:

- Automatic IBKR capital activity imports.
- Additional brokerage integrations.
- Dividend tracking.
- Interest received and paid.
- Brokerage fee imports.
- Tax tracking.
- FX conversion transactions.
- Automated reconciliation.
- Automatic transfer matching.
- Import history.
- Expanded reporting-currency support.
- More detailed account-level financial reporting.

These features are not V1 implementation requirements.

The system should leave room for additional transaction types, but must not expose or implement them prematurely.

---

# 16. V1 FEATURE SCOPE

## Included

- [x] Manual deposits.
- [x] Manual withdrawals.
- [x] Manual internal transfers.
- [x] Unified brokerage account registry.
- [x] Unlimited accounts per broker.
- [x] Multiple IBKR accounts.
- [x] Multiple account types.
- [x] Multiple account base currencies.
- [x] Reuse existing configured IBKR accounts.
- [x] Manually create accounts for other brokers.
- [x] Account-level transaction selection.
- [x] Transaction amount and currency.
- [x] Transaction dates.
- [x] External source/destination details.
- [x] Transaction method.
- [x] Pending, completed and cancelled statuses.
- [x] Initiated and effective dates.
- [x] Cross-currency transfer details.
- [x] Optional reference numbers and notes.
- [x] Optional supporting attachments.
- [x] Account-level reporting.
- [x] Consolidated external funding reporting.
- [x] Separate internal transfer reporting.
- [x] Controlled corrections and audit history.
- [x] Transaction provenance for future imports.

## Excluded from V1

- [ ] Dividends.
- [ ] Interest.
- [ ] Brokerage fee tracking.
- [ ] Tax tracking.
- [ ] Automatic IBKR capital activity imports.
- [ ] Automatic transfer matching.
- [ ] FX conversion transactions.
- [ ] Automated brokerage balance calculation.
- [ ] Portfolio valuation.
- [ ] Trading P&L calculations.
- [ ] Automatic brokerage account discovery.

---

# 17. IMPLEMENTATION ROADMAP

The initial account architecture audit is complete.

The next phases are:

## Phase 1 — Finalize Database Specification

Define the exact PostgreSQL design for:

- `brokerage_accounts`.
- The relationship between `brokerage_accounts` and `broker_connections`.
- `capital_transactions`.
- `capital_transaction_events`.
- Optional attachment metadata.
- Foreign keys.
- Unique indexes.
- Check constraints.
- Monetary precision.
- Currency validation.
- Status lifecycle.
- Audit requirements.
- RLS policies.
- Secure transaction-write operations.

Review the full specification before executing SQL.

## Phase 2 — Database Migration

Introduce the canonical brokerage account registry.

Migration requirements:

1. Create `brokerage_accounts`.
2. Backfill existing broker connection records.
3. Preserve each existing broker account alias and external account identifier.
4. Create and verify the relationship to `broker_connections`.
5. Add the canonical account foreign key to the existing connection records.
6. Verify all five currently recorded IBKR connections are mapped correctly.
7. Ensure the migration is safe to rerun or has explicit duplicate protection.
8. Preserve all existing integration credentials.
9. Preserve existing broker synchronization behavior.
10. Verify RLS and ownership isolation.

Do not delete or rename existing broker fields during this initial migration.

Create the new transaction and event tables only after the account registry relationship has been validated.

## Phase 3 — Capital Management UI Design

Design the module using Elite X's existing premium dark theme.

The UI should include:

- Capital Management overview.
- Brokerage account management.
- Add Account workflow.
- Unified brokerage account selectors.
- Add Transaction workflow.
- Transaction history table.
- Account-level reporting.
- External funding KPIs.
- Internal transfer reporting.

Use one Add Transaction workflow with a transaction-type selector and conditional fields.

Keep V1 focused and avoid building an oversized accounting interface.

## Phase 4 — Backend Implementation

Implement:

- Account creation and management.
- Broker connection/account relationships.
- Deposit operations.
- Withdrawal operations.
- Transfer operations.
- Status transitions.
- Audit history.
- Correction and reversal workflows.
- Secure attachment handling.
- Server-side validation.
- Atomic database writes.
- Duplicate prevention.

No browser-side service-role access.

## Phase 5 — Frontend Implementation

Implement:

- Account registry interface.
- Transaction entry drawer/modal.
- Conditional deposit, withdrawal and transfer fields.
- Transaction history.
- Filters.
- Reporting.
- Attachment interactions.

The UI must use the canonical brokerage account IDs.

## Phase 6 — Testing and Validation

Required tests:

**Account registry**

- One IBKR account.
- Five or more IBKR accounts.
- Multiple accounts with the same broker.
- Different account types.
- Different account base currencies.
- Manually created accounts.
- Accounts without provider identifiers.
- Closing an account.
- Account ownership isolation.
- Duplicate account prevention.
- Repeated provider synchronization.

**Deposits and withdrawals**

- Deposit creation.
- Withdrawal creation.
- Multiple currencies.
- Optional counterparty information.
- Pending-to-completed transition.
- Cancellation.
- Effective-date reporting.

**Transfers**

- Same-currency transfer.
- Cross-currency transfer.
- Source/destination validation.
- Transfer between different brokers.
- Transfer between accounts belonging to the same broker.
- No duplicate transfer legs.
- Correct incoming and outgoing reporting.
- Transfers excluded from consolidated external funding.

**Ledger integrity**

- Duplicate prevention.
- Completed transaction correction.
- Reversal handling.
- Audit history preservation.
- Failed transaction rollback.
- Secure transaction ownership.

**Reporting**

- Single-account reporting.
- Multiple-account reporting.
- Broker-level reporting.
- Calendar-year reporting.
- Custom date ranges.
- Currency-specific subtotals.
- External funding calculations.
- Transfers crossing report-selection boundaries.

**Security**

- Supabase RLS.
- Ownership checks.
- Server-side validation.
- Attachment ownership.
- Authorization of all transaction write operations.

---

# 18. ARCHITECTURAL DECISIONS THAT MUST NOT BE VIOLATED

1. Capital Management is independent of the canonical trading execution ledger.
2. There must be one canonical brokerage account registry.
3. A user can have unlimited brokerage accounts under the same broker.
4. Different account types and base currencies must be supported.
5. Existing IBKR integration credentials must remain separate from financial account identity.
6. Capital Management must reference canonical brokerage account UUIDs.
7. Existing IBKR connections must be linked without breaking broker synchronization.
8. Internal transfers are one canonical transaction with two derived account movements.
9. Internal transfers must not inflate consolidated external funding.
10. Original transaction amounts and currencies must always be preserved.
11. Different currencies must never be added together without an explicit conversion policy.
12. Completed financial transactions must retain auditable history.
13. Financial calculations must use decimal/numeric precision.
14. Every account and transaction must enforce user ownership.
15. Capital Management must not calculate brokerage cash balances or investment P&L.
16. Existing execution records, FIFO pairing and trade history must remain untouched.
17. V1 must remain limited to deposits, withdrawals and internal transfers.

---

# 19. IMMEDIATE NEXT STEP

**The next step is to prepare the complete PostgreSQL database specification.**

The architecture audit has established:

- There is no existing dedicated brokerage account registry.
- `broker_connections` currently combines account identity and IBKR integration credentials.
- Five active IBKR connection records currently exist across three users.
- The existing account identifiers and aliases are populated.
- Multiple accounts per user are supported.
- RLS and ownership policies are enabled.
- The trading execution ledger uses existing string-based account identity and must remain unchanged during this project.

The next deliverable must specify:

1. Exact `brokerage_accounts` columns and constraints.
2. Exact relationship with `broker_connections`.
3. Exact `capital_transactions` structure.
4. Transaction lifecycle and validation rules.
5. Audit event structure.
6. Optional attachment structure.
7. All required indexes and foreign keys.
8. RLS policies.
9. Secure database write operations.
10. Safe migration and rollback strategy.

**Do not execute database migrations or begin frontend development until the database specification has been reviewed and approved.**

The objective is to build a reliable, scalable capital movement system that can support Elite X as it grows without compromising the existing trading architecture.