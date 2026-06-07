export const FX_RATES = {
  USD: 1,

  CAD: 0.73,

  EUR: 1.14,

  GBP: 1.34,

  JPY: 0.0068,

  INR: 0.012,
} as const;

// =================================================
// CONVERT AMOUNT
// =================================================

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {

  if (
    fromCurrency === toCurrency
  ) {
    return amount;
  }

  const fromRate =
    FX_RATES[
      fromCurrency as keyof typeof FX_RATES
    ];

  const toRate =
    FX_RATES[
      toCurrency as keyof typeof FX_RATES
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