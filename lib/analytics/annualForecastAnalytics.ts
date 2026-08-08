import { ReportingExpense } from "@/lib/types/expense";


// =================================================
// HISTORICAL ACTUALS
// =================================================

function calculateHistoricalActuals(
  expenses: ReportingExpense[]
): number {

  const today = new Date();

  const currentYear =
    today.getFullYear();

  const startDate =
    `${currentYear}-01-01`;

  const endDate =
    today.toISOString()
      .split("T")[0];


  return expenses
    .filter((expense) => {

      if (expense.is_deleted) {
        return false;
      }


      return (
        expense.expense_date >= startDate &&
        expense.expense_date <= endDate
      );

    })
    .reduce(
      (total, expense) =>
        total +
        expense.reporting_amount,

      0
    );

}


// =================================================
// FUTURE RECURRING FORECAST
// =================================================

function calculateRemainingRecurringForecast(
  expenses: ReportingExpense[]
): number {

  const today = new Date();

  const endOfYear =
    new Date(
      today.getFullYear(),
      11,
      31
    );


  const recurringAnchors =
    expenses.filter((expense) => {

      return (
        expense.is_recurring &&
        !expense.is_generated &&
        !expense.is_deleted &&
        expense.is_active
      );

    });


  let forecastTotal = 0;


  for (const expense of recurringAnchors) {


    if (!expense.frequency) {
      continue;
    }


    let nextDate =
      new Date(
        expense.expense_date +
        "T12:00:00"
      );


    // Move to next unpaid occurrence
    while (
      nextDate <= today
    ) {

      nextDate =
        getNextOccurrence(
          nextDate,
          expense.frequency
        );

    }


    // Add remaining occurrences until Dec 31
    while (
      nextDate <= endOfYear
    ) {

      forecastTotal +=
        expense.reporting_amount;


      nextDate =
        getNextOccurrence(
          nextDate,
          expense.frequency
        );

    }

  }


  return forecastTotal;

}


// =================================================
// RECURRENCE HELPER
// =================================================

function getNextOccurrence(
  date: Date,
  frequency: string
): Date {

  const nextDate =
    new Date(date);


  switch (frequency) {

    case "Daily":

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      break;


    case "Weekly":

      nextDate.setDate(
        nextDate.getDate() + 7
      );

      break;


    case "Monthly":

      nextDate.setMonth(
        nextDate.getMonth() + 1
      );

      break;


    case "Quarterly":

      nextDate.setMonth(
        nextDate.getMonth() + 3
      );

      break;


    case "Yearly":

      nextDate.setFullYear(
        nextDate.getFullYear() + 1
      );

      break;


default:

  throw new Error(
    `Unsupported recurrence frequency: ${frequency}`
  );

  }


  return nextDate;

}


// =================================================
// PUBLIC FUNCTION
// =================================================

export function calculateAnnualForecast(
  expenses: ReportingExpense[]
): number {


  const historical =
    calculateHistoricalActuals(
      expenses
    );


  const forecast =
    calculateRemainingRecurringForecast(
      expenses
    );


  return (
    historical +
    forecast
  );

}