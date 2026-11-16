# IBKR Commission Accounting — Master Technical Reference

**Project:** Elite X Trading Journal  
**Module:** IBKR Import, Execution Pairing, Trade P&L, Performance Analytics  
**Status:** Implemented and validated  
**Date:** November 16, 2026

---

## 1. Purpose

This document records the commission accounting issue discovered during IBKR trade reconciliation and the corrections implemented in Elite X.

The objective was to ensure that:

- IBKR commission charges and commission credits are interpreted correctly.
- Commission amounts are allocated correctly across executions and FIFO-matched trades.
- Commission credits are not accidentally converted into expenses.
- Trade-level net P&L remains accurate.
- Gross P&L is reconstructed correctly.
- Open-position commissions are excluded from realized commission reporting.
- Commission values are displayed consistently throughout the application.

**Important:** Commission accounting is part of the canonical financial data pipeline. Future changes must preserve the sign convention and must not introduce a separate commission or P&L calculation engine.

---

## 2. Original Problem

During reconciliation of IBKR Flex Query data, an inconsistency was identified in how commissions were interpreted.

IBKR reports commission amounts as cashflows:

- Negative commission = commission expense charged to the account.
- Positive commission = commission credit or rebate received by the account.

Elite X previously needed a consistent internal representation so that commission expenses and credits could be correctly incorporated into trade accounting.

There were several areas requiring correction:

1. IBKR parser commission sign normalization.
2. FIFO commission allocation.
3. Gross P&L reconstruction.
4. Performance Breakdown commission reporting.
5. Daily Review commission presentation.

The objective was to correct commission accounting without changing unrelated trading calculations, dashboard layout, or canonical execution behavior.

---

## 3. Canonical Commission Sign Convention

This is the most important architectural decision from this fix.

Elite X uses the following convention:

| Commission Type | IBKR Flex Query | Elite X `fees` |
|---|---:|---:|
| Commission expense | -1.05 | +1.05 |
| Commission credit | +1.05 | -1.05 |
| No commission | 0.00 | 0.00 |

### Elite X rules

- `fees > 0` means commission expense.
- `fees < 0` means commission credit.
- `fees = 0` means no commission.

**Never use `Math.abs()` when normalizing commission values.**

Doing so destroys the distinction between expenses and credits.

All downstream calculations must preserve signed commission values unless a particular display explicitly requires an absolute magnitude.

---

## 4. IBKR Parser Correction

**File:**

`lib/parsers/ibkrParser.ts`

The parser now converts IBKR commission cashflow into the Elite X convention.

```ts
const commissionCashFlow = parseNumber(row.Commission);
const fees = -commissionCashFlow;
```

### Why this is necessary

IBKR and Elite X use opposite signs for commission expenses.

For example:

```text
IBKR Commission: -1.05
Elite X fees:    +1.05
```

For a commission credit:

```text
IBKR Commission: +1.05
Elite X fees:    -1.05
```

The parser performs this conversion at the ingestion boundary.

**Architectural rule:** Downstream application code should consume normalized Elite X `fees` values. It should not independently reinterpret the original IBKR sign convention.

---

## 5. FIFO Commission Allocation

**File:**

`lib/parsers/pairTrades.ts`

A second issue existed in FIFO commission allocation.

The previous implementation prevented negative unallocated commission balances. This was incorrect because negative commission values represent legitimate credits.

The clamp was removed.

The corrected assignment is:

```ts
execution.remainingFees = unallocatedFees.toNumber();
```

### Why this matters

Commission credits must survive the FIFO allocation process.

Example:

```text
Opening execution commission credit: -1.05
Quantity: 3

Allocated credit per contract: -0.35
```

The allocation process must preserve the negative sign.

**Architectural rule:** FIFO allocation must conserve the signed commission amount. It must not clamp negative balances to zero or convert credits into expenses.

---

## 6. Net P&L and Gross P&L Accounting

**File:**

`lib/analytics/performanceBreakdownAnalytics.ts`

Elite X treats `trade.pnl` as canonical net P&L.

The accounting relationship is:

```text
Net P&L = Gross P&L - Signed Fees
```

Therefore:

```text
Gross P&L = Net P&L + Signed Fees
```

The corrected implementation reconstructs gross P&L using signed realized commissions:

```ts
const grossPnL = netTradingPnL + realizedCommissions;
```

### Example A — Commission expense

```text
Gross P&L:        $100.00
Commission:         $2.00
Net P&L:           $98.00
```

Calculation:

```text
98 + 2 = 100
```

### Example B — Commission credit

```text
Gross P&L:        $100.00
Commission credit: -$2.00
Net P&L:          $102.00
```

Calculation:

```text
102 + (-2) = 100
```

### Important distinction

Do not use:

```ts
Math.abs(realizedCommissions)
```

when reconstructing gross P&L.

That would incorrectly handle commission credits.

Signed fees are required for accounting correctness.

---

## 7. Realized vs. Total Commissions

The Performance Breakdown analytics now maintains two commission totals.

**File:**

`lib/analytics/performanceBreakdownAnalytics.ts`

The data interface includes:

```ts
export interface PerformanceBreakdownData {
  longPnL: number;
  shortPnL: number;
  commissions: number;
  realizedCommissions: number;
  netTradingPnL: number;
  grossPnL: number;
  // Other existing properties remain unchanged.
}
```

### Total commissions

Includes commissions from:

- Completed trades.
- Open positions.

This represents all commission amounts currently associated with the supplied trades.

### Realized commissions

Includes commissions from completed trades only.

The completed-trade filter is:

```ts
function isCompletedTrade(trade: Trade): boolean {
  return (
    !trade.isOpen &&
    (
      trade.status === "WIN" ||
      trade.status === "LOSS" ||
      trade.status === "BREAKEVEN"
    )
  );
}
```

The analytics calculation:

```ts
const commissions = calculateCommissions(trades);

const realizedCommissions = calculateCommissions(
  trades.filter(isCompletedTrade)
);
```

### Why both values are necessary

Open positions may already contain commission amounts, but those amounts should not be included in realized commission reporting.

The application therefore retains both totals instead of changing the meaning of the existing `commissions` property.

---

## 8. Performance Breakdown UI Correction

**File:**

`components/dashboard/PerformanceBreakdownCard.tsx`

The card footer previously used total commissions, which included open-position commissions.

The footer was changed to use realized commissions:

```tsx
const commissionTotal = Math.abs(
  performanceBreakdownAnalytics.realizedCommissions ?? 0
);
```

### Reporting behavior

| Section | Commission Scope |
|---|---|
| Mix | All trades, including open positions |
| Symbol | All trades, including open positions |
| Weekday | Completed trades only |
| Total Commissions footer | Completed trades only |

The information tooltip was updated to explain the distinction:

```tsx
calculation="P&L and commissions use your selected reporting currency. Mix and Symbol trade counts and commissions include open trades; Weekday commissions and the Total Commissions footer use completed trades only. Net P&L and Win Rate use completed trades in every view."
```

**Important:** The footer uses an absolute value for display. The underlying analytics data remains signed. Do not change the accounting calculations merely to alter the visual presentation.

---

## 9. Daily Review Commission UI

### A. Trade Table

**File:**

`components/dashboard/daily-review/DailyReviewTradeTable.tsx`

Commission expenses and credits now have different visual treatments.

- Positive fees: standard muted commission text.
- Negative fees: green text.
- Negative sign is preserved for commission credits.

The display logic:

```tsx
{Number(trade.fees || 0) < 0
  ? `-${formatCurrency(
      Math.abs(Number(trade.fees || 0)),
      reportingCurrency
    )}`
  : formatCurrency(
      Number(trade.fees || 0),
      reportingCurrency
    )}
```

### B. Trade Drawer Timeline

**File:**

`components/dashboard/daily-review/DailyReviewTradeDrawer.tsx`

The timeline commission label was shortened to `Fee` to fit the available UI space.

Both buy-side and sell-side commission entries now:

- Display signed values.
- Use green text for commission credits.
- Use standard muted text for commission expenses.

Example:

```tsx
<div
  className={`mt-2 text-[12px] ${
    buyCommission < 0
      ? "text-emerald-400"
      : "text-slate-400"
  }`}
>
  Fee:{" "}
  {currencySymbol}
  {buyCommission.toFixed(2)}
</div>
```

The same treatment is applied to the sell-side commission entry.

**Important:** These are presentation changes only. They do not modify canonical commission values or P&L calculations.

---

## 10. Regression Tests

### A. IBKR Parser Tests

**File:**

`lib/parsers/ibkrParser.test.ts`

Coverage:

- Negative IBKR commission becomes positive Elite X fees.
- Positive IBKR commission becomes negative Elite X fees.

### B. FIFO Pairing Tests

**File:**

`lib/parsers/pairTrades.test.ts`

Coverage includes FIFO pairing and commission allocation behavior.

### C. End-to-End Commission Flow Test

**File:**

`lib/parsers/ibkrCommissionFlow.test.ts`

Tests the flow:

```text
IBKR CSV
   ↓
parseIBKRCsv()
   ↓
Normalized Executions
   ↓
pairTrades()
   ↓
FIFO Commission Allocation
```

The test verifies that commission signs survive parsing and pairing.

### D. Performance Breakdown Tests

**File:**

`lib/analytics/performanceBreakdownAnalytics.test.ts`

Three regression scenarios are covered:

1. Commission credits exceed expenses.
2. Commission expenses exceed credits.
3. Open-position commissions are excluded from realized commissions.

Expected accounting behavior:

| Scenario | Expected Result |
|---|---|
| Net P&L 102, signed fees -2 | Gross P&L 100 |
| Net P&L 98, signed fees +2 | Gross P&L 100 |
| Closed fees 2, open fees 5 | Total 7, realized 2 |

---

## 11. IBKR Data Reconciliation — November 16, 2026

The correction was also checked against the updated IBKR TFSA YTD report.

### Imported report

- Previous report: 171 rows.
- Updated report: 176 rows.
- Five additional execution IDs were present.
- Existing records were upserted by ID.
- New executions were inserted.

The Dashboard CSV import was used because the live sync workflow only fetches the current day's activity.

### BLNK and GPRO commission examples

The reconciled trades included:

- Three BLNK closing executions.
- One GPRO closing execution.
- Opening commission credits associated with BLNK and GPRO.

The opening commission credits were retained as negative Elite X fees and allocated through FIFO.

### Verified trade-level results

| Trade | Expected Net P&L |
|---|---:|
| BLNK — Exit 1 | -$31.68 |
| BLNK — Exit 2 | -$30.98 |
| BLNK — Exit 3 | -$31.33 |
| GPRO — Exit | -$61.02 |

Expected aggregate:

```text
Gross P&L: -$153.00
Net P&L:   approximately -$155.00
```

The precise aggregate net result was approximately `-$155.000497`, which rounds to `-$155.00`.

The sum of individually rounded trade values is `-$155.01`. This is a rounding difference, not an accounting discrepancy.

The user confirmed that the individual trades matched and the Dashboard daily P&L displayed `-$155.00`.

---

## 12. Validation Results

### Targeted automated tests

| Test Command | Result |
|---|---|
| `npx vitest run lib/parsers/ibkrParser.test.ts` | 2/2 passed |
| `npx vitest run lib/parsers/pairTrades.test.ts` | 5/5 passed |
| `npx vitest run lib/parsers/ibkrCommissionFlow.test.ts` | 1/1 passed |
| `npx vitest run lib/analytics/performanceBreakdownAnalytics.test.ts` | 3/3 passed |

### Production build

```bash
npm run build
```

**Result:** Passed on November 16, 2026.

The targeted regression tests and production build passed.

The complete Vitest suite was not established as passing by this validation, so do not interpret these results as a full-suite verification.

---

## 13. Future Development Rules

These rules should be preserved in all future commission-related development.

### Rule 1 — Preserve the canonical sign convention

```text
Positive fees = Expense
Negative fees = Credit
```

Never reverse this convention without a deliberate accounting migration and full regression analysis.

### Rule 2 — Never use absolute values in accounting calculations

Avoid `Math.abs()` when:

- Parsing commissions.
- Allocating FIFO commissions.
- Calculating net commission balances.
- Reconstructing gross P&L.
- Aggregating signed fees.

Absolute values may be used in presentation code when the UI intentionally displays a magnitude rather than a signed balance.

### Rule 3 — Preserve FIFO allocation

Commission credits must be allocated and retained exactly like commission expenses, with their original sign.

### Rule 4 — Respect canonical net P&L

`trade.pnl` is canonical net P&L.

Do not subtract fees from `trade.pnl` again.

That would double-count commissions.

### Rule 5 — Keep realized and unrealized reporting separate

Open-position commissions must not enter realized commission reporting.

Use the established completed-trade filter rather than creating inconsistent filters in individual UI components.

### Rule 6 — Do not introduce a second P&L engine

All commission and P&L calculations must remain consistent with the canonical execution ledger and existing analytics architecture.

### Rule 7 — Validate every ingestion path

The IBKR CSV parser path is covered by the correction and regression tests.

If another ingestion path is introduced or modified, including live sync or a different Flex Query format, verify that it produces the same normalized Elite X commission convention.

Do not assume that every ingestion path automatically uses the same parser.

### Rule 8 — Protect financial data integrity

Any future changes involving commissions must include regression coverage for:

- Positive IBKR commission values.
- Negative IBKR commission values.
- Commission credits.
- Commission expenses.
- Partial FIFO allocations.
- Multiple executions.
- Open-position commissions.
- Completed-trade commissions.
- Gross and net P&L reconciliation.

---

## 14. Final Architectural Summary

The corrected commission pipeline is:

```text
IBKR Flex Query
      ↓
IBKR Parser
      ↓
Commission Sign Normalization
      ↓
Normalized Executions
      ↓
FIFO Pairing
      ↓
Signed Commission Allocation
      ↓
Canonical Trade Data
      ↓
Net P&L
      ↓
Performance Analytics
      ↓
Realized / Total Commission Reporting
      ↓
Dashboard and Daily Review UI
```

The critical accounting relationship remains:

```text
Gross P&L = Net P&L + Signed Fees
```

The critical sign convention remains:

```text
IBKR Commission < 0  → Elite X fees > 0  → Expense
IBKR Commission > 0  → Elite X fees < 0  → Credit
```

**Final status:** The commission sign-normalization, FIFO allocation, gross P&L reconstruction, realized commission reporting, and related UI corrections have been implemented. Targeted regression tests passed, and the production build passed on November 16, 2026.

This document is the reference for future commission-accounting changes in Elite X Trading Journal.