import { Trade } from "@/types/trade";

import {
  convertAmount,
} from "./fxConversion";

// =================================================
// CONVERT TRADES TO REPORTING CURRENCY
// =================================================

export function convertTradesToReportingCurrency(
  trades: Trade[],
  reportingCurrency: string
): Trade[] {

  return trades.map(
    (trade) => ({

      ...trade,

      pnl: convertAmount(
        trade.pnl,
        trade.currency,
        reportingCurrency
      ),

      fees: convertAmount(
        trade.fees,
        trade.feeCurrency ??
          trade.currency,
        reportingCurrency
      ),

      currency:
        reportingCurrency,

      feeCurrency:
        reportingCurrency,
    })
  );
}