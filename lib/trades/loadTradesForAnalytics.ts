import { Trade } from "@/types/trade";

import { pairTrades }
from "@/lib/parsers/pairTrades";

import {
  loadExecutionsFromSupabase,
} from "@/lib/storage/supabaseExecutionStorage";

import {
  loadTrades,
} from "@/lib/storage/tradeStorage";

// =================================================
// CANONICAL ANALYTICS TRADE LOADER
// =================================================

export async function loadTradesForAnalytics():
Promise<Trade[]> {

  // =============================================
  // IMPORTED TRADES
  // =============================================

  const executions =
    await loadExecutionsFromSupabase();

  const importedTrades =
    pairTrades(
      executions
    );

  // =============================================
  // MANUAL TRADES
  // =============================================

  const manualTrades =
    loadTrades().filter(
      trade =>
        !trade.contractKey
    );

  // =============================================
  // COMBINED RENDER LAYER
  // =============================================

  return [
    ...importedTrades,
    ...manualTrades,
  ];
}