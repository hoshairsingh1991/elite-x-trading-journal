import { Trade } from "@/types/trade";

export interface NativePnLByCurrency {
  currency: string;
  pnl: number;
  percentage: number;
}

export interface CommissionByCurrency {
  currency: string;
  commission: number;
  percentage: number;
}

export interface AccountCurrencyAnalytics {
  nativePnL: NativePnLByCurrency[];
  commissions: CommissionByCurrency[];
  currenciesTraded: string[];
}

export function getAccountCurrencyAnalytics(
  trades: Trade[]
): AccountCurrencyAnalytics {

  const pnlMap = new Map<string, number>();
  const commissionMap = new Map<string, number>();

  // =====================================
  // P&L BY CURRENCY
  // =====================================

  trades.forEach((trade) => {

    const currency =
      trade.currency || "USD";

    pnlMap.set(
      currency,
      (pnlMap.get(currency) || 0) +
      (trade.pnl || 0)
    );
  });

  // =====================================
  // COMMISSIONS BY CURRENCY
  // =====================================

  trades.forEach((trade) => {

    const feeCurrency =
      trade.feeCurrency ||
      trade.currency ||
      "USD";

    commissionMap.set(
      feeCurrency,
      (commissionMap.get(feeCurrency) || 0) +
      Math.abs(trade.fees || 0)
    );
  });

  const totalPnL =
    Array.from(
      pnlMap.values()
    ).reduce(
      (sum, value) =>
        sum + Math.abs(value),
      0
    );

  const totalCommissions =
    Array.from(
      commissionMap.values()
    ).reduce(
      (sum, value) =>
        sum + Math.abs(value),
      0
    );

  const nativePnL =
    Array.from(
      pnlMap.entries()
    ).map(
      ([currency, pnl]) => ({
        currency,
        pnl,
        percentage:
          totalPnL > 0
            ? Math.round(
                (Math.abs(pnl) /
                  totalPnL) *
                  100
              )
            : 0,
      })
    );

  const commissions =
    Array.from(
      commissionMap.entries()
    ).map(
      ([
        currency,
        commission,
      ]) => ({
        currency,
        commission,
        percentage:
          totalCommissions > 0
            ? Math.round(
                (commission /
                  totalCommissions) *
                  100
              )
            : 0,
      })
    );

  const currenciesTraded =
    Array.from(
      new Set(
        trades.map(
          (trade) =>
            trade.currency
        )
      )
    ).sort();

  return {
    nativePnL,
    commissions,
    currenciesTraded,
  };
}