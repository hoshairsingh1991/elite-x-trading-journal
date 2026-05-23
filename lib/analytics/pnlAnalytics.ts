import { Trade } from "@/types/trade";

// =================================================
// TYPES
// =================================================

export interface DailyPnLData {

  date: string;

  pnl: number;
}

export interface PnLAnalyticsData {

  dailyPnL: DailyPnLData[];

  cumulativePnL: number[];

  bestDay: number;

  worstDay: number;

  avgDaily: number;

  streak: number;

  streakType: "WINNING" | "LOSING";

  volatility: number;
}

// =================================================
// LOCAL DATE PARSER
// =================================================

function parseLocalDate(
  dateString: string
) {

  const cleanDate =
    dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

  const [
    year,
    month,
    day,
  ] = cleanDate
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

// =================================================
// DAILY PNL
// =================================================

export function groupDailyPnL(
  trades: Trade[] = []
): DailyPnLData[] {

  const grouped:
    Record<string, number> = {};

  trades.forEach((trade) => {

  const accountingDate =
    trade.closedAt ||
    trade.date;

  if (!grouped[accountingDate]) {

    grouped[accountingDate] = 0;
  }

  grouped[accountingDate] +=
    trade.pnl;
});

  return Object.entries(grouped)

    .map(([date, pnl]) => ({

      date,
      pnl,
    }))

    .sort(
      (a, b) =>
        parseLocalDate(
          a.date
        ).getTime() -
        parseLocalDate(
          b.date
        ).getTime()
    );
}

// =================================================
// WEEKLY PNL
// =================================================

export function groupWeeklyPnL(
  dailyData: DailyPnLData[] = []
): DailyPnLData[] {

  const grouped:
    Record<string, number> = {};

  dailyData.forEach((day) => {

    const date =
      parseLocalDate(
        day.date
      );

    const week =
      Math.ceil(
        date.getDate() / 7
      );

    const key =
      `${date.getFullYear()}-${date.getMonth()}-W${week}`;

    if (!grouped[key]) {

      grouped[key] = 0;
    }

    grouped[key] +=
      day.pnl;
  });

  return Object.entries(grouped)

    .map(([date, pnl]) => ({

      date,
      pnl,
    }));
}

// =================================================
// MONTHLY PNL
// =================================================

export function groupMonthlyPnL(
  dailyData: DailyPnLData[] = []
): DailyPnLData[] {

  const grouped:
    Record<string, number> = {};

  dailyData.forEach((day) => {

    const date =
      parseLocalDate(
        day.date
      );

    const key =
      `${date.getFullYear()}-${date.getMonth()}`;

    if (!grouped[key]) {

      grouped[key] = 0;
    }

    grouped[key] +=
      day.pnl;
  });

  return Object.entries(grouped)

    .map(([date, pnl]) => ({

      date,
      pnl,
    }));
}

// =================================================
// CUMULATIVE CURVE
// =================================================

export function calculateCumulativePnL(
  dailyData: DailyPnLData[] = []
): number[] {

  let runningTotal = 0;

  return dailyData.map((day) => {

    runningTotal += day.pnl;

    return runningTotal;
  });
}

// =================================================
// BEST DAY
// =================================================

export function calculateBestDay(
  dailyData: DailyPnLData[] = []
): number {

  if (dailyData.length === 0)
    return 0;

  return Math.max(
    ...dailyData.map(
      (day) => day.pnl
    )
  );
}

// =================================================
// WORST DAY
// =================================================

export function calculateWorstDay(
  dailyData: DailyPnLData[] = []
): number {

  if (dailyData.length === 0)
    return 0;

  return Math.min(
    ...dailyData.map(
      (day) => day.pnl
    )
  );
}

// =================================================
// AVERAGE DAILY
// =================================================

export function calculateAverageDaily(
  dailyData: DailyPnLData[] = []
): number {

  if (dailyData.length === 0)
    return 0;

  const total =
    dailyData.reduce(
      (sum, day) =>
        sum + day.pnl,
      0
    );

  return total / dailyData.length;
}

// =================================================
// STREAK
// =================================================

export function calculateStreak(
  dailyData: DailyPnLData[] = []
): {

  streak: number;

  streakType:
    | "WINNING"
    | "LOSING";
} {

  if (dailyData.length === 0) {

    return {

      streak: 0,

      streakType:
        "WINNING",
    };
  }

  let currentStreak = 1;

  let streakType:
  "WINNING" | "LOSING" =
  dailyData[
    dailyData.length - 1
  ].pnl >= 0
    ? "WINNING"
    : "LOSING";

  for (
    let i =
      dailyData.length - 2;

    i >= 0;

    i--
  ) {

    const pnl =
      dailyData[i].pnl;

    const currentType =
      pnl >= 0
        ? "WINNING"
        : "LOSING";

    if (
      currentType ===
      streakType
    ) {

      currentStreak++;

    } else {

      break;
    }
  }

  return {

    streak:
      currentStreak,

    streakType,
  };
}

// =================================================
// VOLATILITY
// =================================================

export function calculateVolatility(
  dailyData: DailyPnLData[] = []
): number {

  if (dailyData.length === 0)
    return 0;

  const avg =
    calculateAverageDaily(
      dailyData
    );

  const variance =
    dailyData.reduce(
      (sum, day) => {

        return (
          sum +
          Math.pow(
            day.pnl - avg,
            2
          )
        );
      },
      0
    ) / dailyData.length;

  return Math.sqrt(
    variance
  );
}

// =================================================
// MASTER ANALYTICS
// =================================================

export function generatePnLAnalytics(
  trades: Trade[] = [],
  range:
  | "1D"
  | "7D"
  | "30D"
  | "MTD"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "ALL" = "ALL"
): PnLAnalyticsData {

  const rawDailyPnL =
    groupDailyPnL(
      trades
    );

  let displayPnL =
    rawDailyPnL;

  // =================================================
// ADAPTIVE AGGREGATION
// =================================================

// ================================================
// WEEKLY AGGREGATION
// ================================================

if (
  range === "30D" ||
  range === "MTD" ||
  range === "3M"
) {

  displayPnL =
    groupWeeklyPnL(
      rawDailyPnL
    );
}

// ================================================
// MONTHLY AGGREGATION
// ================================================

if (
  range === "6M" ||
  range === "YTD" ||
  range === "1Y" ||
  range === "ALL"
) {

  displayPnL =
    groupMonthlyPnL(
      rawDailyPnL
    );
}

const cumulativePnL =
  calculateCumulativePnL(
    displayPnL
  );

const bestDay =
  calculateBestDay(
    displayPnL
  );

const worstDay =
  calculateWorstDay(
    displayPnL
  );

const avgDaily =
  calculateAverageDaily(
    displayPnL
  );

const {
  streak,
  streakType,
} = calculateStreak(
  displayPnL
);

const volatility =
  calculateVolatility(
    displayPnL
  );

return {

  dailyPnL:
    displayPnL,

  cumulativePnL,

  bestDay,

  worstDay,

  avgDaily,

  streak,

  streakType,

  volatility,
};
}