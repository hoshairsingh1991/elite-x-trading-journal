import { Trade } from "@/types/trade";

// =====================================================
// PNL BY CURRENCY
// =====================================================

export function
calculatePnLByCurrency(
  trades: Trade[]
): Record<string, number> {

  const totals:
    Record<string, number> = {};

  trades.forEach(
    (trade) => {

      const currency =
        trade.currency ||
        "USD";

      if (
        !totals[currency]
      ) {

        totals[currency] = 0;
      }

      totals[currency] +=
        trade.pnl || 0;
    }
  );

  return totals;
}

// =====================================================
// FEES BY CURRENCY
// =====================================================

export function
calculateFeesByCurrency(
  trades: Trade[]
): Record<string, number> {

  const totals:
    Record<string, number> = {};

  trades.forEach(
    (trade) => {

      const currency =
        trade.feeCurrency ||
        trade.currency ||
        "USD";

      if (
        !totals[currency]
      ) {

        totals[currency] = 0;
      }

      totals[currency] +=
        trade.fees || 0;
    }
  );

  return totals;
}