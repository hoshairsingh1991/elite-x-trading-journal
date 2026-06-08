import { Trade } from "@/types/trade";

interface OpenPositionsCardProps {
  trades: Trade[];
}

export default function OpenPositionsCard({
  trades,
}: OpenPositionsCardProps) {

  const openTrades = trades.filter(
  (trade) => trade.isOpen
);


function formatQuantity(
  quantity: number
) {
  if (quantity >= 1000) {
    return (
      quantity / 1000
    ).toFixed(1).replace(
      ".0",
      ""
    ) + "K";
  }

  return quantity.toString();
}

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
     Open Positions ({openTrades.length})
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
    left-5
  "
>
  Direction
</div>

<div
  className="
    relative
    right-5
    text-right
  "
>
  Size
</div>

            <div className="text-right">
              Unrealized P&L
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


  {openTrades.map((trade, index) => {



    const isProfit =
      trade.pnl >= 0;

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

        {/* DIRECTION */}

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

        {/* SIZE */}

        <div className="text-right text-slate-300">
          {formatQuantity(
            trade.quantity
          )}
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