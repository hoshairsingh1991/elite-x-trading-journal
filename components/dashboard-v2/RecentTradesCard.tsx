import { Trade } from "@/types/trade";

interface RecentTradesCardProps {
  trades: Trade[];
}

export default function RecentTradesCard({
  trades,
}: RecentTradesCardProps) {

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

  const recentTrades = trades
    .filter(
      (trade) => !trade.isOpen
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

  return (
    <div
      className="
        relative
        z-50

        h-[220px]
        overflow-visible
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-white/[0.14]
        hover:bg-[#0A1A2E]/80
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]
      "
    >
      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[10px]" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-8 pt-5">

        <div className="flex items-center">

          <h3
            className="
              relative
              left-4
              text-[16px]
              font-semibold
              text-white
            "
          >
            Recent Trades
          </h3>

        </div>

      </div>

      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[12px]" />

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-50
          mt-6
          flex
          justify-center
        "
      >
        <div className="w-[90%]">

          {/* HEADER ROW */}

          <div
            className="
              grid
              grid-cols-4
              text-[11px]
              uppercase
              tracking-[0.12em]
              text-slate-500
            "
          >
            <div>Symbol</div>

            <div
              className="
                relative
                left-9
              "
            >
              Side
            </div>

            <div
              className="
                relative
                left-12
              "
            >
              Date
            </div>

            <div className="text-right">
              P&amp;L
            </div>

          </div>

          {/* DATA ROWS */}

          <div
            className="
              mt-4
              h-[150px]
              overflow-y-scroll
              overflow-x-hidden
              pr-1
            "
          >

            {recentTrades.map((trade) => {

              const isProfit =
                trade.pnl >= 0;
const formattedDate =
  parseLocalDate(
    trade.date
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

              return (

                <div
                  key={trade.id}
                  className="
                    grid
                    grid-cols-[1fr_1fr_0.8fr_1.2fr]
                    items-center
                    border-t
                    border-white/[0.04]
                    py-3
                  "
                >

                  {/* SYMBOL */}

                  <div className="font-medium text-slate-300">
                    {trade.ticker}
                  </div>

                  {/* SIDE */}

                  <div
                    className={`
                      relative
                      left-8
                      ${
                        trade.side === "LONG"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {trade.side}
                  </div>
{/* DATE */}

<div
  className="
    relative
    left-6
    text-slate-300
  "
>
  {formattedDate}
</div>

                  {/* PNL */}

                  <div
                    className={`relative right-4 text-right font-medium ${
                      isProfit
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {isProfit ? "+" : "-"}$
                    {Math.abs(
                      trade.pnl
                    ).toFixed(2)}
                  </div>

                </div>

              );
            })}

          </div>

        </div>
      </div>
    </div>
  );
}