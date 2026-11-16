# ELITE X TRADING JOURNAL
# CAPITAL MANAGEMENT — DEVELOPMENT EXECUTION PLAN

**Document Status:** Approved Development Direction  
**Version:** V1.0 Planning  
**Module:** Capital Management  
**Development Approach:** UI/UX First, Implementation Second  
**Current Stage:** Phase 1 — UI/UX Design

---

# 1. DEVELOPMENT STRATEGY

Capital Management will be developed in clearly defined phases.

Our approach is to finalize the complete user experience before beginning actual application development.

We will not rush into database migrations or backend implementation before we understand exactly how the finished module should work.

The development sequence is:

1. Product and UI/UX design.
2. Database architecture finalization.
3. Database implementation and migration.
4. Backend and business logic implementation.
5. Frontend implementation and integration.
6. Reporting and analytics.
7. Testing, security and release.

**Important:** Phase 1 is a design phase, not a frontend coding phase. All major screens, workflows, layouts and interactions must be reviewed and approved before we move into implementation.

---

# 2. PHASE 1 — COMPLETE UI/UX DESIGN

**Priority: FIRST**

Goal: Finalize the complete Capital Management experience.

We will design each major screen and workflow individually, review it, refine it, and approve it before moving to the next design.

The interface must follow Elite X's existing premium dark institutional design language.

We should prioritize:

- Clear financial information hierarchy.
- Compact and efficient layouts.
- Consistent spacing and typography.
- Professional financial tables.
- Consistent account selectors.
- Minimal unnecessary UI complexity.
- Responsive behavior.
- Clear transaction status and direction.
- Consistency with existing Elite X components.

## 2.1 Capital Management Overview

Design the main module landing page.

Proposed sections:

**KPI Cards**

- Total Deposits.
- Total Withdrawals.
- Net External Funding.
- Internal Transfers.

**Brokerage Account Summary**

Show each account with relevant capital movement information.

**Recent Transactions**

A compact transaction table displaying recent activity.

**Reporting Filters**

- Calendar year.
- Custom date range.
- Broker.
- Brokerage account.
- Currency.
- Transaction type.
- Status.

**Design objective:**

The user should immediately understand how much external capital entered or left their tracked brokerage accounts.

Internal transfers must remain visually and mathematically separate from external funding.

## 2.2 Brokerage Accounts Page

Design a dedicated account management interface.

Requirements:

- Display all brokerage accounts.
- Automatically display configured IBKR accounts.
- Support unlimited accounts per broker.
- Support different account types.
- Support different account base currencies.
- Allow manual account creation.
- Allow account editing.
- Allow account closure.
- Allow viewing account-specific transaction history.

Each account should display relevant information such as:

- Broker.
- Account name.
- Account type.
- Base currency.
- Connection source.
- Account status.

The interface must clearly distinguish connected accounts from manually registered accounts.

Do not require integration credentials to create a manual account.

## 2.3 Add Brokerage Account Workflow

Design the account creation and editing experience.

Potential fields:

- Broker/provider.
- Account display name.
- Account type.
- Base currency.
- Provider account identifier, when applicable.
- Account source.

Account identity and broker integration settings must remain separate.

## 2.4 Add Transaction Workflow

Design one unified transaction-entry drawer or modal.

The user selects one of three transaction types:

- Deposit.
- Withdrawal.
- Internal Transfer.

The form dynamically changes according to the selected type.

### Deposit form

- Destination brokerage account.
- Amount.
- Currency.
- Source institution.
- Source account nickname.
- Deposit method.
- Initiated date.
- Effective date.
- Status.
- Reference number.
- Notes.
- Optional attachment.

### Withdrawal form

- Source brokerage account.
- Amount.
- Currency.
- Destination institution.
- Destination account nickname.
- Withdrawal method.
- Initiated date.
- Effective date.
- Status.
- Reference number.
- Notes.
- Optional attachment.

### Internal transfer form

- From brokerage account.
- To brokerage account.
- Amount sent.
- Sending currency.
- Amount received.
- Receiving currency.
- Exchange rate for cross-currency transfers.
- Initiated date.
- Effective date.
- Status.
- Reference number.
- Notes.
- Optional attachment.

Same-currency and cross-currency transfer behavior must be visually clear.

## 2.5 Transaction Ledger

Design the main transaction history interface.

Requirements:

- Deposit records.
- Withdrawal records.
- Transfer records.
- Transaction date.
- Account.
- Broker.
- Amount.
- Currency.
- Status.
- Method.

Filtering should support:

- Date range.
- Calendar year.
- Broker.
- Account.
- Transaction type.
- Currency.
- Status.
- Transaction method.

The ledger must be easy to scan and should support reviewing historical activity.

## 2.6 Transaction Details and Management

Design the individual transaction details view.

It should display:

- Transaction type.
- Account information.
- Amount and currency.
- Source and destination details.
- Method.
- Initiated date.
- Effective date.
- Status.
- Reference.
- Notes.
- Attachments.
- Transaction event history.

Also design the workflows for:

- Editing pending transactions.
- Completing pending transactions.
- Cancelling transactions.
- Reviewing completed transactions.
- Requesting a controlled correction or reversal.

Completed financial records must not be silently overwritten or deleted.

## 2.7 Design Review and Approval

Before leaving Phase 1, review the complete module.

Approval checklist:

- [ ] Capital Management overview approved.
- [ ] Brokerage Accounts page approved.
- [ ] Add/Edit Brokerage Account workflow approved.
- [ ] Deposit workflow approved.
- [ ] Withdrawal workflow approved.
- [ ] Internal Transfer workflow approved.
- [ ] Transaction ledger approved.
- [ ] Transaction details approved.
- [ ] Status management approved.
- [ ] Filters and reporting interactions approved.
- [ ] Responsive layouts reviewed.
- [ ] Consistent Elite X visual design confirmed.

**Phase 1 completion requirement: All major UI screens and workflows must be finalized before actual coding begins.**

---

# 3. PHASE 2 — DATABASE ARCHITECTURE FINALIZATION

After the UI has been approved, finalize the database design based on the actual approved workflows.

The existing account architecture audit has already been completed.

Proposed database components:

### A. brokerage_accounts

The canonical registry for every brokerage account.

Supports:

- Unlimited accounts per broker.
- Multiple IBKR accounts.
- Manual accounts.
- Multiple account types.
- Different base currencies.
- Active and closed accounts.

### B. broker_connections

Retain the existing IBKR integration configuration.

Add the relationship to the canonical brokerage account registry.

Existing credentials and synchronization metadata must remain intact.

### C. capital_transactions

The canonical transaction ledger.

Supports:

- DEPOSIT.
- WITHDRAWAL.
- TRANSFER.

Internal transfers are stored as one canonical record with source and destination accounts.

A separate movement table is not required for V1.

### D. capital_transaction_events

Append-only audit history for transaction events and controlled corrections.

### E. capital_transaction_attachments

Optional attachment metadata, with files stored securely in private Supabase Storage.

## Database design requirements

Finalize:

- Exact columns.
- PostgreSQL data types.
- Monetary precision.
- Currency validation.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Indexes.
- Transaction lifecycle.
- Transfer validation.
- Correction and reversal rules.
- RLS policies.
- Secure write operations.
- Migration and rollback strategy.

**Phase 2 deliverable:** Complete PostgreSQL database specification, reviewed and approved before implementation.

---

# 4. PHASE 3 — DATABASE IMPLEMENTATION AND MIGRATION

Once the database specification is approved, begin SQL implementation.

Divide this phase into two milestones.

## Milestone A — Brokerage Account Registry

1. Create `brokerage_accounts`.
2. Backfill existing broker connection records.
3. Add `brokerage_account_id` to `broker_connections`.
4. Link existing IBKR connections to their canonical accounts.
5. Verify all five currently recorded IBKR connections.
6. Verify provider identity uniqueness.
7. Verify foreign keys and RLS.
8. Test existing broker synchronization.

Preserve all existing IBKR credentials and synchronization behavior.

Do not remove existing account identity fields during the initial migration.

## Milestone B — Capital Management Ledger

1. Create `capital_transactions`.
2. Create `capital_transaction_events`.
3. Create optional attachment metadata infrastructure.
4. Add all required constraints and indexes.
5. Implement secure transaction write operations.
6. Test transaction atomicity.
7. Test internal transfer handling.
8. Verify ownership isolation.

No historical execution records should be modified.

---

# 5. PHASE 4 — BACKEND IMPLEMENTATION

Implement business logic independently of the frontend.

Core responsibilities:

- Brokerage account management.
- Deposit creation and management.
- Withdrawal creation and management.
- Internal transfer creation.
- Transaction status transitions.
- Transaction corrections and reversals.
- Audit history.
- Attachment handling.
- Financial validation.
- Account ownership validation.
- Reporting calculations.

Requirements:

- Server-side validation.
- Atomic database operations.
- Decimal-safe calculations.
- Duplicate prevention.
- Explicit error handling.
- Appropriate Supabase security.
- No service-role credentials exposed in the browser.

The backend must enforce all financial rules, even when the frontend also performs validation.

**Phase 4 deliverable:** Tested Capital Management backend services and database operations.

---

# 6. PHASE 5 — FRONTEND IMPLEMENTATION

Once the database and backend are stable, implement the approved UI designs.

Recommended implementation order:

1. Brokerage Accounts interface.
2. Account creation and editing.
3. Unified brokerage account selectors.
4. Add Transaction drawer.
5. Deposit workflow.
6. Withdrawal workflow.
7. Internal Transfer workflow.
8. Transaction ledger.
9. Transaction details.
10. Pending and completed transaction management.
11. Attachments.
12. Account-specific transaction history.

Each feature should be connected to the actual backend and tested before moving forward.

Do not build all screens with placeholder data and connect everything at the end.

---

# 7. PHASE 6 — REPORTING AND ANALYTICS

Build reporting after transaction entry and management are stable.

Required capabilities:

- Total deposits.
- Total withdrawals.
- Net external funding.
- Transfers sent.
- Transfers received.
- Account-level funding history.
- Broker-level summaries.
- Calendar-year reporting.
- Custom date ranges.
- Currency-specific subtotals.
- Transaction history filters.

Financial reporting must distinguish external funding from internal transfers.

Different currencies must never be combined without an explicit conversion policy.

Reporting values must not be presented as brokerage cash balances or investment P&L.

---

# 8. PHASE 7 — TESTING, SECURITY AND RELEASE

Perform comprehensive testing before release.

### Account registry tests

- Multiple IBKR accounts.
- Five or more accounts under one broker.
- Multiple account types.
- Multiple base currencies.
- Manually added accounts.
- Duplicate prevention.
- Account closure.
- Historical account references.

### Transaction tests

- Deposit creation.
- Withdrawal creation.
- Same-currency transfer.
- Cross-currency transfer.
- Invalid source/destination account.
- Pending-to-completed transition.
- Cancellation.
- Duplicate prevention.
- Correction and reversal.
- Attachment security.

### Reporting tests

- Individual account.
- Multiple accounts.
- Multiple brokers.
- Different currencies.
- Calendar year.
- Custom date range.
- Internal transfer exclusions.
- Transfers crossing selected account groups.

### Security tests

- Supabase RLS.
- User ownership isolation.
- Server-side authorization.
- Transaction validation.
- Private attachment access.
- Secure financial data handling.

### Regression testing

Verify that Capital Management does not disrupt:

- IBKR integration.
- Broker synchronization.
- Trades page.
- Dashboard.
- Canonical executions.
- FIFO pairing.
- Existing trading analytics.
- Expenses module.

**Phase 7 completion requirement:** Financial calculations, data integrity, security and existing application compatibility must be verified before release.

---

# 9. DEVELOPMENT WORKING RULES

Throughout implementation, follow these rules.

1. Complete one phase before moving to the next.
2. Review and approve major deliverables before implementation.
3. Inspect actual project files before modifying existing code.
4. Avoid speculative changes.
5. Preserve existing application functionality.
6. Do not combine unrelated security fixes with Capital Management development.
7. Use exact replacement instructions when changing existing code.
8. Test each meaningful change.
9. Run production builds at appropriate milestones.
10. Update working documentation under `docs/` after completed milestones.
11. Preserve user-authored documentation changes.
12. Commit Git checkpoints at meaningful milestones.
13. Do not modify trading canonical data for Capital Management requirements.
14. Prefer small, testable and reversible migrations.
15. Treat financial data integrity and user ownership as mandatory requirements.

---

# 10. CURRENT PROJECT STATUS

| Phase | Status |
|---|---|
| Product scope definition | Completed |
| Capital Management blueprint | Completed |
| Existing account architecture audit | Completed |
| Development roadmap | Defined |
| Phase 1 — UI/UX design | Next |
| Phase 2 — Database specification | Pending |
| Phase 3 — Database implementation | Pending |
| Phase 4 — Backend implementation | Pending |
| Phase 5 — Frontend implementation | Pending |
| Phase 6 — Reporting and analytics | Pending |
| Phase 7 — Testing and release | Pending |

---

# 11. IMMEDIATE NEXT STEP

**BEGIN PHASE 1 — UI/UX DESIGN**

Start with the Capital Management overview page.

We will:

1. Establish the page layout.
2. Define KPI cards and their information hierarchy.
3. Design the brokerage account summary.
4. Design the recent transactions section.
5. Define date and account filters.
6. Review spacing, sizing and visual consistency.
7. Refine the design until approved.

Then move to the Brokerage Accounts page and the transaction workflows.

**No database migrations or production application code changes until the complete UI/UX has been finalized and approved.**

The goal is to establish the entire Capital Management experience first, then build the underlying system to support that approved design.

---

**FINAL DEVELOPMENT PRINCIPLE**

Design the experience first. Engineer the data model around the approved workflows. Implement the backend with financial integrity. Connect the frontend. Verify everything before release.

Capital Management should become a reliable, scalable part of Elite X without compromising the existing trading platform.