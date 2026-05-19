import { Trade } from "@/types/trade";

// =====================================================
// STORAGE KEY
// =====================================================

const STORAGE_KEY =
  "elite-x-trades";

// =====================================================
// LOAD TRADES
// =====================================================

export function loadTrades(): Trade[] {

  // ============================================
  // SSR SAFETY
  // ============================================

  if (
    typeof window === "undefined"
  ) {

    return [];
  }

  try {

    const storedTrades =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedTrades) {

      return [];
    }

    const parsedTrades =
      JSON.parse(storedTrades);

    // ============================================
    // SAFETY CHECK
    // ============================================

    if (
      !Array.isArray(
        parsedTrades
      )
    ) {

      return [];
    }

    return parsedTrades;

  } catch (error) {

    console.error(
      "FAILED TO LOAD TRADES:",
      error
    );

    return [];
  }
}

// =====================================================
// SAVE TRADES
// =====================================================

export function saveTrades(
  trades: Trade[]
): void {

  if (
    typeof window === "undefined"
  ) {

    return;
  }

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(trades)
    );

  } catch (error) {

    console.error(
      "FAILED TO SAVE TRADES:",
      error
    );
  }
}

// =====================================================
// APPEND TRADES
// =====================================================

export function appendTrades(
  newTrades: Trade[]
): Trade[] {

  const existingTrades =
    loadTrades();

  // ============================================
  // DUPLICATE PROTECTION
  // ============================================

  const existingIds =
    new Set(
      existingTrades.map(
        (trade) => trade.id
      )
    );

  const uniqueNewTrades =
    newTrades.filter(
      (trade) =>
        !existingIds.has(
          trade.id
        )
    );

  const updatedTrades = [

    ...existingTrades,

    ...uniqueNewTrades,
  ];

  saveTrades(updatedTrades);

  return updatedTrades;
}

// =====================================================
// UPDATE TRADE
// =====================================================

export function updateTrade(
  updatedTrade: Trade
): Trade[] {

  const existingTrades =
    loadTrades();

  const updatedTrades =
    existingTrades.map(
      (trade) => {

        if (
          trade.id ===
          updatedTrade.id
        ) {

          return {

            ...updatedTrade,

            updatedAt:
              new Date().toISOString(),
          };
        }

        return trade;
      }
    );

  saveTrades(updatedTrades);

  return updatedTrades;
}

// =====================================================
// CLEAR STORAGE
// =====================================================

export function clearTrades(): void {

  if (
    typeof window === "undefined"
  ) {

    return;
  }

  try {

    localStorage.removeItem(
      STORAGE_KEY
    );

  } catch (error) {

    console.error(
      "FAILED TO CLEAR TRADES:",
      error
    );
  }
}