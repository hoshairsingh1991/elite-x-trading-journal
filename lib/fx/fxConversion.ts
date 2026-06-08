import {
  FxRates,
  FALLBACK_RATES,
} from "./fxRateProvider";

// =================================================
// DEFAULT FX RATES
// =================================================

export const FX_RATES: FxRates =
  FALLBACK_RATES;

// =================================================
// CONVERT AMOUNT
// =================================================

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: FxRates = FX_RATES
): number {

  if (
    fromCurrency === toCurrency
  ) {
    return amount;
  }

  const fromRate =
    rates[
      fromCurrency as keyof FxRates
    ];

  const toRate =
    rates[
      toCurrency as keyof FxRates
    ];

  // Unknown currency
  // Return original amount for safety

  if (
    !fromRate ||
    !toRate
  ) {
    return amount;
  }

  // Convert to USD first

  const usdAmount =
    amount * fromRate;

  // Convert USD to target currency

  return (
    usdAmount / toRate
  );
}