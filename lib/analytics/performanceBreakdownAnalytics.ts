import { Trade } from "@/types/trade";

// =================================================
// PERFORMANCE BREAKDOWN ROW TYPES
// =================================================

export interface PerformanceMixRow {
  key: string;
  asset: string;

  leftLabel: string;
  rightLabel: string;

  leftTrades: number;
  rightTrades: number;

  leftCompletedTrades: number;
rightCompletedTrades: number;

  leftPnl: number;
  rightPnl: number;

  leftWinRate: number;
  rightWinRate: number;

  leftCommissions: number;
  rightCommissions: number;
}

export interface PerformanceWeekdayRow {
  day: string;
  trades: number;
  pnl: number;
  winRate: number;
  commissions: number;
}

export interface PerformanceSymbolRow {
  symbol: string;
  asset: string;

  trades: number;
  pnl: number;
  winRate: number;
  commissions: number;
}

// =================================================
// EXISTING PERFORMANCE BREAKDOWN DATA
// =================================================

export interface PerformanceBreakdownData {
  longPnL: number;
  shortPnL: number;

  commissions: number;

  netTradingPnL: number;
  grossPnL: number;

  longTrades: number;
  shortTrades: number;

  longPercentage: number;
  shortPercentage: number;

  // Canonical view data
  mixRows: PerformanceMixRow[];
  weekdayRows: PerformanceWeekdayRow[];
  symbolRows: PerformanceSymbolRow[];
}

// =================================================
// COMPLETED TRADE RULE
// =================================================

function isCompletedTrade(trade: Trade): boolean {
  return (
    !trade.isOpen &&
    trade.status !== "OPEN"
  );
}

// =================================================
// ASSET TYPE NORMALIZATION
// =================================================

function getAssetType(trade: Trade): string {
  const assetType = (
    trade.assetType ?? ""
  )
    .trim()
    .toUpperCase();

  switch (assetType) {
    case "STOCK":
    case "STOCKS":
    case "STK":
      return "Stocks";

    case "OPTION":
    case "OPTIONS":
    case "OPT":
      return "Options";

    case "CRYPTO":
      return "Crypto";

    case "FOREX":
    case "CASH":
      return "Forex";

    case "FUT":
    case "FUTURE":
    case "FUTURES":
      return "Futures";

    default:
      return "Other";
  }
}

// =================================================
// MANUAL TRADE DETECTION
// =================================================

function isManualTrade(trade: Trade): boolean {
  const contractKey =
    trade.contractKey?.trim().toUpperCase();

  // Legacy local manual trades do not have a
  // canonical contract key.
  return (
    !contractKey ||
    contractKey.startsWith("MANUAL-")
  );
}

// =================================================
// OPTION TYPE DETECTION
// =================================================

function getOptionType(
  trade: Trade
): "CALL" | "PUT" | null {
  const contractInformation = [
    trade.contractKey ?? "",
    trade.contract ?? "",
  ]
    .join(" ")
    .toUpperCase();

  // Supports token formats such as:
  // QQQ_2026-05-15_C_480
  // QQQ_2026-05-15_P_510
  // QQQ_2026-05-15_C
  // QQQ 15 MAY 2026 480 CALL
  // SPY 15 MAY 2026 510 PUT
  const hasCall = /(?:^|[^A-Z0-9])(?:C|CALLS?)(?=$|[^A-Z0-9])/
    .test(contractInformation);

  const hasPut = /(?:^|[^A-Z0-9])(?:P|PUTS?)(?=$|[^A-Z0-9])/
    .test(contractInformation);

  // Never guess if the contract is ambiguous.
  if (hasCall === hasPut) {
    return null;
  }

  return hasCall ? "CALL" : "PUT";
}

// =================================================
// COMPLETED P&L
// =================================================

function sumCompletedPnL(
  trades: Trade[]
): number {
  return trades
    .filter(isCompletedTrade)
    .reduce(
      (total, trade) => total + trade.pnl,
      0
    );
}

// =================================================
// COMMISSIONS
// =================================================

function sumCommissions(
  trades: Trade[]
): number {
  return trades.reduce(
    (total, trade) => total + trade.fees,
    0
  );
}

// =================================================
// WIN RATE
// =================================================

function calculateCompletedWinRate(
  trades: Trade[]
): number {
  const completedTrades =
    trades.filter(isCompletedTrade);

  if (completedTrades.length === 0) {
    return 0;
  }

  const winningTrades =
    completedTrades.filter(
      trade => trade.status === "WIN"
    ).length;

  return Number(
    (
      winningTrades /
      completedTrades.length *
      100
    ).toFixed(1)
  );
}

// =================================================
// MIX AGGREGATION
// =================================================

interface MixBucket {
  key: string;
  asset: string;

  leftLabel: string;
  rightLabel: string;

  left: Trade[];
  right: Trade[];
}

const MIX_GROUP_DEFINITIONS: Omit<
  MixBucket,
  "left" | "right"
>[] = [
  {
    key: "stocks",
    asset: "Stocks",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
  {
    key: "options",
    asset: "Options",
    leftLabel: "CALLS",
    rightLabel: "PUTS",
  },
  {
    key: "manual-options",
    asset: "Man. Opt.",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
  {
    key: "unclassified-options",
    asset: "Opt. Other",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
  {
    key: "crypto",
    asset: "Crypto",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
  {
    key: "forex",
    asset: "Forex",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
  {
    key: "futures",
    asset: "Futures",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
  {
    key: "other",
    asset: "Other",
    leftLabel: "LONG",
    rightLabel: "SHORT",
  },
];

function generateMixRows(
  trades: Trade[]
): PerformanceMixRow[] {
  const buckets = new Map<string, MixBucket>();

  for (const definition of MIX_GROUP_DEFINITIONS) {
    buckets.set(definition.key, {
      ...definition,
      left: [],
      right: [],
    });
  }

  for (const trade of trades) {
    const assetType = getAssetType(trade);

    let bucketKey: string;
    let direction: "LEFT" | "RIGHT";

    if (assetType === "Options") {
      // Manual option entries currently do not record
      // Call/Put metadata. Preserve their LONG/SHORT
      // direction and keep them in a separate group.
      if (isManualTrade(trade)) {
        bucketKey = "manual-options";
        direction =
          trade.side === "LONG" ? "LEFT" : "RIGHT";
      } else {
        const optionType = getOptionType(trade);

        if (optionType === "CALL") {
          bucketKey = "options";
          direction = "LEFT";
        } else if (optionType === "PUT") {
          bucketKey = "options";
          direction = "RIGHT";
        } else {
          // Keep unrecognized option contracts visible
          // without guessing their option type.
          bucketKey = "unclassified-options";
          direction =
            trade.side === "LONG" ? "LEFT" : "RIGHT";
        }
      }
    } else {
      switch (assetType) {
        case "Stocks":
          bucketKey = "stocks";
          break;

        case "Crypto":
          bucketKey = "crypto";
          break;

        case "Forex":
          bucketKey = "forex";
          break;

        case "Futures":
          bucketKey = "futures";
          break;

        default:
          bucketKey = "other";
          break;
      }

      direction =
        trade.side === "LONG" ? "LEFT" : "RIGHT";
    }

    const bucket = buckets.get(bucketKey);

    if (!bucket) {
      continue;
    }

    if (direction === "LEFT") {
      bucket.left.push(trade);
    } else {
      bucket.right.push(trade);
    }
  }

  return MIX_GROUP_DEFINITIONS
    .map(definition => {
      const bucket = buckets.get(definition.key)!;

      return {
        key: bucket.key,
        asset: bucket.asset,

        leftLabel: bucket.leftLabel,
        rightLabel: bucket.rightLabel,

        leftTrades: bucket.left.length,
        rightTrades: bucket.right.length,

        leftCompletedTrades:
  bucket.left.filter(isCompletedTrade).length,

rightCompletedTrades:
  bucket.right.filter(isCompletedTrade).length,

        leftPnl: sumCompletedPnL(bucket.left),
        rightPnl: sumCompletedPnL(bucket.right),

        leftWinRate: calculateCompletedWinRate(
          bucket.left
        ),
        rightWinRate: calculateCompletedWinRate(
          bucket.right
        ),

        leftCommissions: sumCommissions(bucket.left),
        rightCommissions: sumCommissions(bucket.right),
      };
    })
.filter((row) => {
  const conditionalRows = [
    "other",
    "manual-options",
    "unclassified-options",
  ];

  if (conditionalRows.includes(row.key)) {
    return (
      row.leftTrades > 0 ||
      row.rightTrades > 0
    );
  }

  return true;
})
.sort((a, b) => {
  const tradesA = a.leftTrades + a.rightTrades;
  const tradesB = b.leftTrades + b.rightTrades;

  return tradesB - tradesA;
});
}

// =================================================
// LOCAL DATE PARSING
// =================================================

function parseTradeDate(
  dateString: string
): Date | null {
  const datePart = dateString.split("T")[0];

  const match = /^(\d{4})-(\d{2})-(\d{2})$/
    .exec(datePart);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  // Reject invalid calendar dates.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// =================================================
// WEEKDAY AGGREGATION
// =================================================

const STANDARD_WEEKDAYS = [
  { dayNumber: 1, day: "Monday" },
  { dayNumber: 2, day: "Tuesday" },
  { dayNumber: 3, day: "Wednesday" },
  { dayNumber: 4, day: "Thursday" },
  { dayNumber: 5, day: "Friday" },
];

function generateWeekdayRows(
  trades: Trade[]
): PerformanceWeekdayRow[] {
  // Weekday performance is based on completed trades,
  // attributed to their trade.date (the closing date
  // for reconstructed completed trades).
  const completedTrades =
    trades.filter(isCompletedTrade);

  const tradesByDay = new Map<number, Trade[]>();

  for (const trade of completedTrades) {
    const date = parseTradeDate(trade.date);

    if (!date) {
      continue;
    }

    const dayNumber = date.getDay();
    const existing =
      tradesByDay.get(dayNumber) ?? [];

    existing.push(trade);
    tradesByDay.set(dayNumber, existing);
  }

  const buildRow = (
    dayNumber: number,
    day: string
  ): PerformanceWeekdayRow => {
    const dayTrades =
      tradesByDay.get(dayNumber) ?? [];

    return {
      day,
      trades: dayTrades.length,
      pnl: sumCompletedPnL(dayTrades),
      winRate: calculateCompletedWinRate(dayTrades),
      commissions: sumCommissions(dayTrades),
    };
  };

  const weekdayRows =
    STANDARD_WEEKDAYS.map(
      ({ dayNumber, day }) =>
        buildRow(dayNumber, day)
    );

  // Always show Monday through Friday.
  // Add Saturday and/or Sunday only when a completed
  // trade has that closing date.
  if ((tradesByDay.get(6) ?? []).length > 0) {
    weekdayRows.push(
      buildRow(6, "Saturday")
    );
  }

  if ((tradesByDay.get(0) ?? []).length > 0) {
    weekdayRows.push(
      buildRow(0, "Sunday")
    );
  }

  return weekdayRows;
}

// =================================================
// SYMBOL AGGREGATION
// =================================================

function generateSymbolRows(
  trades: Trade[]
): PerformanceSymbolRow[] {
  const groups = new Map<string, Trade[]>();

  for (const trade of trades) {
    const symbol =
      trade.ticker.trim().toUpperCase() ||
      "UNKNOWN";

    const existing = groups.get(symbol) ?? [];

    existing.push(trade);
    groups.set(symbol, existing);
  }

  return Array.from(groups.entries())
    .map(([symbol, symbolTrades]) => {
      const assetTypes = Array.from(
        new Set(
          symbolTrades.map(getAssetType)
        )
      );

      return {
        symbol,

        asset:
          assetTypes.length === 1
            ? assetTypes[0]
            : "Mixed",

        trades: symbolTrades.length,

        pnl: sumCompletedPnL(symbolTrades),

        winRate:
          calculateCompletedWinRate(symbolTrades),

        commissions:
          sumCommissions(symbolTrades),
      };
    })
    .sort(
      (a, b) =>
        b.trades - a.trades ||
        a.symbol.localeCompare(b.symbol)
    );
}

// =================================================
// EXISTING LONG P&L
// =================================================

export function calculateLongPnL(
  trades: Trade[]
): number {
  return trades
    .filter(
      trade => trade.side === "LONG"
    )
    .reduce(
      (total, trade) =>
        total + trade.pnl,
      0
    );
}

// =================================================
// EXISTING SHORT P&L
// =================================================

export function calculateShortPnL(
  trades: Trade[]
): number {
  return trades
    .filter(
      trade => trade.side === "SHORT"
    )
    .reduce(
      (total, trade) =>
        total + trade.pnl,
      0
    );
}

// =================================================
// EXISTING COMMISSIONS
// =================================================

export function calculateCommissions(
  trades: Trade[]
): number {
  return trades.reduce(
    (total, trade) =>
      total + trade.fees,
    0
  );
}

// =================================================
// MASTER PERFORMANCE BREAKDOWN
// =================================================

export function generatePerformanceBreakdownAnalytics(
  trades: Trade[]
): PerformanceBreakdownData {
  // Preserve the existing summary calculations.
  const longPnL =
    calculateLongPnL(trades);

  const shortPnL =
    calculateShortPnL(trades);

  const commissions =
    calculateCommissions(trades);

  const netTradingPnL =
    longPnL + shortPnL;

  const grossPnL =
    netTradingPnL + Math.abs(commissions);

  const longTrades =
    trades.filter(
      trade => trade.side === "LONG"
    ).length;

  const shortTrades =
    trades.filter(
      trade => trade.side === "SHORT"
    ).length;

  const totalDirectionalTrades =
    longTrades + shortTrades;

  const longPercentage =
    totalDirectionalTrades > 0
      ? (longTrades / totalDirectionalTrades) * 100
      : 0;

  const shortPercentage =
    totalDirectionalTrades > 0
      ? (shortTrades / totalDirectionalTrades) * 100
      : 0;

  return {
    longPnL,
    shortPnL,
    commissions,
    netTradingPnL,
    grossPnL,
    longTrades,
    shortTrades,
    longPercentage,
    shortPercentage,

    // Real data for the three Performance Breakdown views.
    mixRows: generateMixRows(trades),
    weekdayRows: generateWeekdayRows(trades),
    symbolRows: generateSymbolRows(trades),
  };
}