
import type {
  CurrencyCode,
  TransactionType,
  CapitalTransaction,
} from "@/lib/capital/types";

import { CURRENCY_ORDER } from "@/lib/capital/constants";
import { formatMoney } from "@/lib/capital/formatters";

export function getCurrencyTotals(
  transactions: CapitalTransaction[],
  useReceivedAmount = false
): { currency: CurrencyCode; amount: number }[] {
  const totals = new Map<CurrencyCode, number>();

  for (const transaction of transactions) {
    const currency =
      useReceivedAmount &&
      transaction.type === "TRANSFER"
        ? transaction.receivedCurrency ?? transaction.currency
        : transaction.currency;

    const amount =
      useReceivedAmount &&
      transaction.type === "TRANSFER"
        ? transaction.receivedAmount ?? transaction.amount
        : transaction.amount;

    totals.set(
      currency,
      (totals.get(currency) ?? 0) + amount
    );
  }

  return CURRENCY_ORDER
    .filter((currency) => (totals.get(currency) ?? 0) !== 0)
    .map((currency) => ({
      currency,
      amount: totals.get(currency) ?? 0,
    }));
}

export function formatBreakdown(
  transactions: CapitalTransaction[],
  useReceivedAmount = false
): string {
  const totals = getCurrencyTotals(
    transactions,
    useReceivedAmount
  );

  if (totals.length === 0) {
    return "—";
  }

  return totals
    .map(
      (item) =>
        `${item.currency} ${formatMoney(item.amount)}`
    )
    .join(" · ");
}

export function getNetFundingTotals(
  deposits: CapitalTransaction[],
  withdrawals: CapitalTransaction[]
): { currency: CurrencyCode; amount: number }[] {
  const totals = new Map<CurrencyCode, number>();

  for (const transaction of deposits) {
    totals.set(
      transaction.currency,
      (totals.get(transaction.currency) ?? 0) + transaction.amount
    );
  }

  for (const transaction of withdrawals) {
    totals.set(
      transaction.currency,
      (totals.get(transaction.currency) ?? 0) - transaction.amount
    );
  }

  return CURRENCY_ORDER
    .filter((currency) => (totals.get(currency) ?? 0) !== 0)
    .map((currency) => ({
      currency,
      amount: totals.get(currency) ?? 0,
    }));
}

export function getTypeLabel(type: TransactionType): string {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "TRANSFER":
      return "Internal transfer";
  }
}
