import { loadExecutionsFromSupabase } from "@/lib/storage/supabaseExecutionStorage";
import { loadTrades } from "@/lib/storage/tradeStorage";

import { pairTrades } from "@/lib/parsers/pairTrades";

import {
  calculateTotalPnL,
  calculateTotalTrades,
} from "@/lib/analytics";

export async function loadUserMenuStats() {
  const storedExecutions =
    await loadExecutionsFromSupabase();

  const rebuiltTrades =
    pairTrades(
      storedExecutions
    );

  const manualTrades =
    loadTrades().filter(
      (trade) =>
        !trade.contractKey
    );

  const allTrades = [
    ...rebuiltTrades,
    ...manualTrades,
  ];

  return {
    totalTrades:
      calculateTotalTrades(
        allTrades
      ),

    totalPnL:
      calculateTotalPnL(
        allTrades
      ),

    tradingDays:
      new Set(
        allTrades.map(
          trade => trade.date
        )
      ).size,
  };
}