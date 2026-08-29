export function formatCurrency(
  value: number,
  currency: string = "USD"
): string {

  const absoluteValue =
    Math.abs(value);

  const normalizedCurrency =
    currency?.trim().toUpperCase() || "USD";

  const formattedNumber =
    absoluteValue.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  switch (normalizedCurrency) {

    case "CAD":
      return `C$${formattedNumber}`;

    case "EUR":
      return `€${formattedNumber}`;

    case "GBP":
      return `£${formattedNumber}`;

    case "JPY":
      return `¥${formattedNumber}`;

    case "INR":
      return `₹${formattedNumber}`;

    case "USD":
    default:
      return `$${formattedNumber}`;
  }
}