/**
 * ============================================================================
 * ELITEX TRADING OS
 * Reporting Formatters
 * ============================================================================
 *
 * Canonical formatting helpers used by all PDF reports.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Currency formatting
 * • Number formatting
 * • Percentage formatting
 * • Date formatting
 * • Date & time formatting
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

/* ============================================================================
   Currency
   ============================================================================ */

export function formatCurrency(
  amount: number,
  currency: string
): string {

  return `${currency} ${amount.toFixed(2)}`;

}

/* ============================================================================
   Number
   ============================================================================ */

export function formatNumber(
  value: number
): string {

  return value.toFixed(2);

}

/* ============================================================================
   Percentage
   ============================================================================ */

export function formatPercentage(
  value: number
): string {

  return `${value.toFixed(2)}%`;

}

/* ============================================================================
   Date
   ============================================================================ */

export function formatDate(
  date: Date
): string {

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const month =
    date.toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

  const year =
    date.getFullYear();

  return `${day} ${month} ${year}`;

}

/* ============================================================================
   Date & Time
   ============================================================================ */

export function formatDateTime(
  date: Date
): string {

  const formattedDate =
    date.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const formattedTime =
    date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );

  return `${formattedDate}, ${formattedTime}`;

}