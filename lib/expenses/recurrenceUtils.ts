export function getNextOccurrenceDate(
  currentDate: Date,
  frequency: string
): Date {

  const nextDate = new Date(currentDate);

  switch (frequency) {

    case "Daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case "Weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case "Monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case "Quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;

    case "Yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    default:
      throw new Error(
        `Unsupported recurring frequency: ${frequency}`
      );
  }

  return nextDate;
}