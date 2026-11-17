
import type {
  CapitalTransaction,
  CurrencyCode,
} from "@/lib/capital/types";

import { CURRENCY_ORDER } from "@/lib/capital/constants";

export interface MonthlyFundingActivity {
  month: string;
  monthLabel: string;
  currency: CurrencyCode;
  deposits: number;
  withdrawals: number;
}

export interface LargestCapitalTransaction {
  id: string;
  date: string;
  amount: number;
  currency: CurrencyCode;
}

export interface CapitalActivitySummary {
  depositCount: number;
  withdrawalCount: number;
  transferCount: number;
  totalCount: number;
  largestDeposits: LargestCapitalTransaction[];
  largestWithdrawals: LargestCapitalTransaction[];
}

/**
 * Returns all calendar months between two ISO date strings,
 * inclusive. Uses UTC to avoid local timezone boundary issues.
 */
function getMonthRange(
  startDate: string,
  endDate: string
): { key: string; label: string }[] {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return [];
  }

  const months: { key: string; label: string }[] = [];

  const current = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      1
    )
  );

  const last = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    1
  );

  while (current.getTime() <= last) {
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();

    months.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        timeZone: "UTC",
      }).format(current),
    });

    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return months;
}

/**
 * Groups completed deposits and withdrawals by month and currency.
 *
 * Transactions are expected to already respect the page's
 * active date, broker, account, and currency filters.
 */
export function getMonthlyFundingActivity(
  transactions: CapitalTransaction[],
  startDate: string,
  endDate: string
): MonthlyFundingActivity[] {
  const months = getMonthRange(startDate, endDate);

  if (months.length === 0) {
    return [];
  }

  const totals = new Map<
    string,
    { deposits: number; withdrawals: number }
  >();

  for (const transaction of transactions) {
    if (transaction.status !== "COMPLETED") {
      continue;
    }

    if (
      transaction.type !== "DEPOSIT" &&
      transaction.type !== "WITHDRAWAL"
    ) {
      continue;
    }

    const month = transaction.date.slice(0, 7);
    const key = `${month}:${transaction.currency}`;

    const current = totals.get(key) ?? {
      deposits: 0,
      withdrawals: 0,
    };

    if (transaction.type === "DEPOSIT") {
      current.deposits += transaction.amount;
    } else {
      current.withdrawals += transaction.amount;
    }

    totals.set(key, current);
  }

  return months.flatMap((month) =>
    CURRENCY_ORDER.map((currency) => {
      const values = totals.get(
        `${month.key}:${currency}`
      );

      return {
        month: month.key,
        monthLabel: month.label,
        currency,
        deposits: values?.deposits ?? 0,
        withdrawals: values?.withdrawals ?? 0,
      };
    })
  );
}

/**
 * Summarizes completed capital activity.
 *
 * Largest deposits and withdrawals are calculated separately
 * for each currency. Different currencies are never compared.
 */
export function getCapitalActivitySummary(
  transactions: CapitalTransaction[]
): CapitalActivitySummary {
  const completed = transactions.filter(
    (transaction) =>
      transaction.status === "COMPLETED"
  );

  const deposits = completed.filter(
    (transaction) =>
      transaction.type === "DEPOSIT"
  );

  const withdrawals = completed.filter(
    (transaction) =>
      transaction.type === "WITHDRAWAL"
  );

  const transfers = completed.filter(
    (transaction) =>
      transaction.type === "TRANSFER"
  );

  const getLargestByCurrency = (
    items: CapitalTransaction[]
  ): LargestCapitalTransaction[] => {
    const largest = new Map<
      CurrencyCode,
      CapitalTransaction
    >();

    for (const transaction of items) {
      const current = largest.get(transaction.currency);

      if (
        !current ||
        transaction.amount > current.amount
      ) {
        largest.set(transaction.currency, transaction);
      }
    }

    return CURRENCY_ORDER.flatMap((currency) => {
      const transaction = largest.get(currency);

      return transaction
        ? [{
            id: transaction.id,
            date: transaction.date,
            amount: transaction.amount,
            currency: transaction.currency,
          }]
        : [];
    });
  };

  return {
    depositCount: deposits.length,
    withdrawalCount: withdrawals.length,
    transferCount: transfers.length,
    totalCount: completed.length,
    largestDeposits: getLargestByCurrency(deposits),
    largestWithdrawals: getLargestByCurrency(withdrawals),
  };
}
