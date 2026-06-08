import { Trade } from "@/types/trade";

import {
  convertAmount,
} from "./fxConversion";

import {
  FxRates,
  FALLBACK_RATES,
} from "./fxRateProvider";

// =================================================
// CONVERT TRADES TO REPORTING CURRENCY
// =================================================

export function convertTradesToReportingCurrency(
  trades: Trade[],
  reportingCurrency: string,
  rates: FxRates = FALLBACK_RATES
): Trade[] {

  return trades.map(
    (trade) => ({

      ...trade,

      pnl: convertAmount(
        trade.pnl,
        trade.currency,
        reportingCurrency,
        rates
      ),

      fees: convertAmount(
        trade.fees,
        trade.feeCurrency ??
          trade.currency,
        reportingCurrency,
        rates
      ),

      currency:
        reportingCurrency,

      feeCurrency:
        reportingCurrency,
    })
  );
}