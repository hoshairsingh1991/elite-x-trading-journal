import { Trade } from "@/types/trade";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import AssetIcon from "@/components/common/AssetIcon";

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

  // =================================================
  // POSITION / OPTION LABEL
  // =================================================

  function getPositionLabel(
    trade: Trade
  ) {
    if (
      trade.assetType ===
      "Options"
    ) {
      if (
        trade.contractKey?.endsWith(
          "_C"
        )
      ) {
        return "CALL";
      }

      if (
        trade.contractKey?.endsWith(
          "_P"
        )
      ) {
        return "PUT";
      }

      return "OPTION";
    }

    return trade.side;
  }

  // =================================================
  // RECENT TRADES
  // =================================================

  const recentTrades = trades
    .filter(
      (trade) => !trade.isOpen
    )
    .sort(
      (a, b) =>
        parseLocalDate(
          b.date
        ).getTime() -
        parseLocalDate(
          a.date
        ).getTime()
    );

  return (
    <div
      className="
        relative
        z-50
        h-[205px]
        overflow-hidden
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/[0.12]
        hover:bg-[#0b0c1e]
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]
      "
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          relative
          left-4
          top-2
          px-4
          pt-4
        "
      >
        <div className="flex items-center justify-between">
          <h3
            className="
              text-[14px]
              font-semibold
              text-white
            "
          >
            Recent Trades
          </h3>
        </div>
      </div>

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div
        className="
          relative
          left-1
          top-2
          mt-5
        "
      >
        <div
          className="
            relative
            left-1
            top-1
            mx-auto
            w-[95%]
            overflow-hidden
            rounded-[6px]
            border
            border-white/[0.05]
          "
        >

          {/* --------------------------------------------- */}
          {/* HEADER ROW */}
          {/* --------------------------------------------- */}

          <div
            className="
              border-b
              border-white/[0.06]
            "
          >
            <div
              className="
                relative
                left-1
                mx-auto
                w-[92%]
                grid
                grid-cols-4
                items-center
                h-[20px]
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-slate-500
              "
            >
              <div
                className="
                  relative
                  left-6
                  top-0.5
                "
              >
                Symbol
              </div>

              <div
                className="
                  relative
                  left-8
                  top-0.5
                "
              >
                Side
              </div>

              <div
                className="
                  relative
                  left-7
                  top-0.5
                "
              >
                Date
              </div>

              <div
                className="
                  relative
                  top-0.5
                  whitespace-nowrap
                  text-right
                "
              >
                P&L
              </div>
            </div>
          </div>

          {/* --------------------------------------------- */}
          {/* DATA ROWS */}
          {/* --------------------------------------------- */}

          <div
            className="
              max-h-[140px]
              overflow-y-auto
              overflow-x-hidden
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {recentTrades.length === 0 ? (
              <div
                className="
                  flex
                  h-[72px]
                  items-center
                  justify-center
                  text-[12px]
                  text-slate-500
                "
              >
                No recent trades
              </div>
            ) : (
              recentTrades.map((trade) => {
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
                      relative
                      left-1
                      mx-auto
                      w-[92%]
                      grid
                      grid-cols-4
                      items-center
                      h-[28px]
                      border-b
                      border-white/[0.04]
                      transition-all
                      duration-200
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      last:border-b-0
                      hover:-translate-y-[1px]
                      hover:scale-[1.002]
                      hover:bg-white/[0.028]
                      hover:shadow-[0_4px_14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.035)]
                    "
                  >

                    {/* ----------------------------------- */}
                    {/* SYMBOL */}
                    {/* ----------------------------------- */}

                    <div
                      className="
                        relative
                        left-2
                        flex
                        min-w-0
                        items-center
                        gap-2
                      "
                    >
                      <AssetIcon
                        ticker={trade.ticker}
                        assetType={trade.assetType}
                        contractKey={trade.contractKey}
                        size="sm"
                      />

                      <span
                        className="
                          min-w-0
                          truncate
                          text-[12px]
                          font-medium
                          text-slate-300
                        "
                      >
                        {trade.ticker}
                      </span>
                    </div>

                    {/* ----------------------------------- */}
                    {/* SIDE */}
                    {/* ----------------------------------- */}

                    <div
                      className={`
                        relative
                        left-8
                        text-[11px]
                        font-medium
                        ${
                          trade.assetType === "Options"
                            ? trade.contractKey?.endsWith("_C")
                              ? "text-cyan-400"
                              : trade.contractKey?.endsWith("_P")
                                ? "text-amber-400"
                                : "text-slate-400"
                            : trade.side === "LONG"
                              ? "text-emerald-400"
                              : "text-red-400"
                        }
                      `}
                    >
                      {getPositionLabel(
                        trade
                      )}
                    </div>

                    {/* ----------------------------------- */}
                    {/* DATE */}
                    {/* ----------------------------------- */}

                    <div
                      className="
                        relative
                        left-3
                        whitespace-nowrap
                        text-[11px]
                        text-slate-300
                      "
                    >
                      {formattedDate}
                    </div>

                    {/* ----------------------------------- */}
                    {/* P&L */}
                    {/* ----------------------------------- */}

                    <div
                      className={`
                        whitespace-nowrap
                        text-right
                        text-[11px]
                        font-semibold
                        tabular-nums
                        ${
                          isProfit
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      {isProfit ? "+" : "-"}
                      {getCurrencySymbol(
                        trade.currency
                      )}
                      {Math.abs(
                        trade.pnl
                      ).toFixed(2)}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

    </div>
  );
}