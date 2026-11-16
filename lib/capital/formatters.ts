
export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
