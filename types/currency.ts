export type SupportedCurrency =
  | "USD"
  | "CAD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CHF"
  | "NZD"
  | "HKD"
  | "SGD";

export interface FxRate {

  baseCurrency: SupportedCurrency;

  quoteCurrency: SupportedCurrency;

  rate: number;

  updatedAt: string;
}