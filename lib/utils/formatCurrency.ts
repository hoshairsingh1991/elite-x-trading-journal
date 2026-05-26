export function formatCurrency(
  value: number,
  currency: string = "USD"
): string {

  const absoluteValue =
    Math.abs(value);

  const formattedNumber =
    absoluteValue.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  switch (currency) {

    case "CAD":
      return `C$${formattedNumber}`;

    case "EUR":
      return `€${formattedNumber}`;

    case "GBP":
      return `£${formattedNumber}`;

    case "USD":
    default:
      return `$${formattedNumber}`;
  }
}