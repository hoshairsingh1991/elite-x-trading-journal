export function generateWinRateTrend(
  trades: any[]
): number[] {

  const trend: number[] = [];

  let wins = 0;

  trades.forEach(
    (trade, index) => {

      if (trade.pnl > 0) {
        wins++;
      }

      const winRate =
        (wins / (index + 1)) * 100;

      trend.push(winRate);
    }
  );

  return trend;
}