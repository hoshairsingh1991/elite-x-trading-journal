import { Trade } from "@/types/trade";


// =================================================
// TIME RANGE TYPE
// =================================================

export type TimeRange =
  | "1D"
  | "7D"
  | "30D"
  | "MTD"
  | "1Y"
  | "ALL";


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
// FILTER TRADES BY RANGE
// =================================================

export function filterTradesByRange(
  trades: Trade[],
  range: TimeRange
): Trade[] {

  if (range === "ALL") {
    return trades;
  }

  const now = new Date();

  // =================================================
  // MONTH TO DATE
  // =================================================

  if (range === "MTD") {

    return trades.filter((trade) => {

      const tradeDate =
        parseLocalDate(
          trade.date
        );

      return (
        tradeDate.getFullYear() ===
          now.getFullYear() &&
        tradeDate.getMonth() ===
          now.getMonth()
      );
    });
  }

  let days = 0;

  switch (range) {

    case "1D":
      days = 1;
      break;

    case "7D":
      days = 7;
      break;

    case "30D":
      days = 30;
      break;

    case "1Y":
      days = 365;
      break;
  }

  const cutoffDate = new Date();

  cutoffDate.setDate(
    now.getDate() - days
  );

  return trades.filter((trade) => {

    const tradeDate =
      parseLocalDate(
        trade.date
      );

    return (
      tradeDate >= cutoffDate
    );
  });
}


// =================================================
// TOTAL PNL
// =================================================

export function calculateTotalPnL(
  trades: Trade[]
): number {

  return trades.reduce(
    (total, trade) =>
      total + trade.pnl,
    0
  );
}


// =================================================
// TOTAL TRADES
// =================================================

export function calculateTotalTrades(
  trades: Trade[]
): number {

  return trades.length;
}


// =================================================
// WINNING TRADES
// =================================================

export function calculateWinningTrades(
  trades: Trade[]
): number {

  return trades.filter(
    (trade) =>
      trade.status === "WIN"
  ).length;
}


// =================================================
// LOSING TRADES
// =================================================

export function calculateLosingTrades(
  trades: Trade[]
): number {

  return trades.filter(
    (trade) =>
      trade.status === "LOSS"
  ).length;
}


// =================================================
// BREAKEVEN TRADES
// =================================================

export function calculateBreakevenTrades(
  trades: Trade[]
): number {

  return trades.filter(
    (trade) =>
      trade.status ===
      "BREAKEVEN"
  ).length;
}


// =================================================
// WIN RATE
// =================================================

export function calculateWinRate(
  trades: Trade[]
): number {

  if (
    trades.length === 0
  ) return 0;

  const winningTrades =
    calculateWinningTrades(
      trades
    );

  return Number(
    (
      (
        winningTrades /
        trades.length
      ) * 100
    ).toFixed(1)
  );
}


// =================================================
// AVERAGE WIN
// =================================================

export function calculateAverageWin(
  trades: Trade[]
): number {

  const winningTrades =
    trades.filter(
      (trade) =>
        trade.status ===
        "WIN"
    );

  if (
    winningTrades.length === 0
  ) return 0;

  const totalWins =
    winningTrades.reduce(
      (total, trade) =>
        total + trade.pnl,
      0
    );

  return Number(
    (
      totalWins /
      winningTrades.length
    ).toFixed(2)
  );
}


// =================================================
// AVERAGE LOSS
// =================================================

export function calculateAverageLoss(
  trades: Trade[]
): number {

  const losingTrades =
    trades.filter(
      (trade) =>
        trade.status ===
        "LOSS"
    );

  if (
    losingTrades.length === 0
  ) return 0;

  const totalLosses =
    losingTrades.reduce(
      (total, trade) =>
        total +
        Math.abs(
          trade.pnl
        ),
      0
    );

  return Number(
    (
      totalLosses /
      losingTrades.length
    ).toFixed(2)
  );
}


// =================================================
// PROFIT FACTOR
// =================================================

export function calculateProfitFactor(
  trades: Trade[]
): number {

  const grossProfit =
    trades
      .filter(
        (trade) =>
          trade.pnl > 0
      )
      .reduce(
        (total, trade) =>
          total + trade.pnl,
        0
      );

  const grossLoss =
    trades
      .filter(
        (trade) =>
          trade.pnl < 0
      )
      .reduce(
        (total, trade) =>
          total +
          Math.abs(
            trade.pnl
          ),
        0
      );

  if (
    grossLoss === 0
  ) return grossProfit;

  return Number(
    (
      grossProfit /
      grossLoss
    ).toFixed(2)
  );
}


// =================================================
// TOTAL FEES
// =================================================

export function calculateTotalFees(
  trades: Trade[]
): number {

  return Number(
    trades
      .reduce(
        (total, trade) =>
          total +
          trade.fees,
        0
      )
      .toFixed(2)
  );
}


// =================================================
// BEST TRADE
// =================================================

export function calculateBestTrade(
  trades: Trade[]
): Trade | null {

  if (
    trades.length === 0
  ) return null;

  return trades.reduce(
    (best, trade) =>
      trade.pnl >
      best.pnl
        ? trade
        : best
  );
}


// =================================================
// WORST TRADE
// =================================================

export function calculateWorstTrade(
  trades: Trade[]
): Trade | null {

  if (
    trades.length === 0
  ) return null;

  return trades.reduce(
    (worst, trade) =>
      trade.pnl <
      worst.pnl
        ? trade
        : worst
  );
}