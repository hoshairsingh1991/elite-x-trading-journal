export const CURRENCY_SYMBOLS = {
  USD: "$",

  CAD: "C$",

  EUR: "€",

  GBP: "£",

  JPY: "¥",

  INR: "₹",
} as const;

// =================================================
// GET SYMBOL
// =================================================

export function getCurrencySymbol(
  currency: string
): string {

  return (
    CURRENCY_SYMBOLS[
      currency as keyof typeof CURRENCY_SYMBOLS
    ] ?? "$"
  );
}