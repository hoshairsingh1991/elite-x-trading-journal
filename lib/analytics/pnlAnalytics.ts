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
// GROUP DAILY PNL
// =================================================

export function groupDailyPnL(
  trades: Trade[] = []
): DailyPnLData[] {

  const grouped:
    Record<string, number> = {};

  trades.forEach((trade) => {

    if (!grouped[trade.date]) {

      grouped[trade.date] = 0;
    }

    grouped[trade.date] +=
      trade.pnl;
  });

  return Object.entries(grouped)

    .map(([date, pnl]) => ({

      date,
      pnl,
    }))

    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
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

  let streakType =
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
  trades: Trade[] = []
): PnLAnalyticsData {

  const dailyPnL =
    groupDailyPnL(
      trades
    );

  const cumulativePnL =
    calculateCumulativePnL(
      dailyPnL
    );

  const bestDay =
    calculateBestDay(
      dailyPnL
    );

  const worstDay =
    calculateWorstDay(
      dailyPnL
    );

  const avgDaily =
    calculateAverageDaily(
      dailyPnL
    );

  const {
    streak,
    streakType,
  } = calculateStreak(
    dailyPnL
  );

  const volatility =
    calculateVolatility(
      dailyPnL
    );

  return {

    dailyPnL,

    cumulativePnL,

    bestDay,

    worstDay,

    avgDaily,

    streak,

    streakType,

    volatility,
  };
}