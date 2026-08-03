/**
 * ============================================================================
 * ELITEX TRADING OS
 * Paginate Rows
 * ============================================================================
 *
 * Splits a collection into page-sized chunks.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Deterministic pagination
 * • Preserve row ordering
 * • Perform NO rendering
 * * Reusable across every PDF report
 *
 * ============================================================================
 */

/* ============================================================================
   Paginate Rows
   ============================================================================ */

export function paginateRows<T>(
  rows: T[],
  rowsPerPage: number,
): T[][] {

  if (rowsPerPage <= 0) {
    throw new Error(
      "rowsPerPage must be greater than zero."
    );
  }

  const pages: T[][] = [];

  for (
    let index = 0;
    index < rows.length;
    index += rowsPerPage
  ) {

    pages.push(

      rows.slice(
        index,
        index + rowsPerPage,
      )

    );

  }

  return pages;

}