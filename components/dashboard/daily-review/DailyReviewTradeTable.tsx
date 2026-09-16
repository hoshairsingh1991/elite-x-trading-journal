"use client";

import {
  Trade,
} from "@/types/trade";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";


interface DailyReviewTradeTableProps {
  selectedTrades: Trade[];
  allTrades: Trade[];
  reportingCurrency: string;
  onEditTrade: (trade: Trade) => void;
}

function formatTime(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

function formatDuration(
  openedAt?: string,
  closedAt?: string | null
) {
  if (
    !openedAt ||
    !closedAt
  ) {
    return "—";
  }

  const entryTime =
    new Date(
      openedAt
    ).getTime();

  const exitTime =
    new Date(
      closedAt
    ).getTime();

  if (
    Number.isNaN(
      entryTime
    ) ||
    Number.isNaN(
      exitTime
    )
  ) {
    return "—";
  }

  const totalSeconds =
    Math.max(
      0,
      Math.round(
        (
          exitTime -
          entryTime
        ) / 1000
      )
    );

  const hours =
    Math.floor(
      totalSeconds /
        3600
    );

  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) / 60
    );

  const seconds =
    totalSeconds %
    60;

  if (
    hours > 0
  ) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function formatQuantity(
  quantity: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    }
  ).format(
    Math.abs(
      Number(
        quantity || 0
      )
    )
  );
}

function formatPrice(
  value?: number | null
) {
  if (
    value == null ||
    !Number.isFinite(
      value
    )
  ) {
    return "—";
  }

  return `$${value.toFixed(2)}`;
}

function getAssetTypeLabel(
  assetType?: string
) {
  if (!assetType) {
    return "—";
  }

  const normalized =
    assetType
      .toLowerCase()
      .replace(
        /_/g,
        " "
      );

  return normalized.replace(
    /\b\w/g,
    (
      character
    ) =>
      character.toUpperCase()
  );
}

export default function DailyReviewTradeTable({
  selectedTrades,
  allTrades,
  reportingCurrency,
  onEditTrade,
}: DailyReviewTradeTableProps) {

  return (
<div
className="
  mt-3
  mb-4
  mx-auto
  w-[98%]
  translate-x-[1%]
  min-w-0
  overflow-hidden
  rounded-[8px]
  border
  border-white/[0.06]
  bg-[#0b1220]
"
>



{/* ================================================= */}
{/* TABLE */}
{/* ================================================= */}

      <div
        className="
          max-h-[360px]
          [@media(max-height:1079px)]:max-h-[244px]
          w-full
          min-w-0
          overflow-y-auto
          overflow-x-hidden
        "
      ></div>

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

<div
  className="
    max-h-[360px]
    [@media(max-height:1079px)]:max-h-[244px]
    w-full
    min-w-0
    overflow-y-auto
    overflow-x-hidden
  "
>

        <table
          className="
            w-full
            min-w-0
            table-fixed
            border-collapse
          "
        >

          {/* ================================================= */}
          {/* COLUMN WIDTHS */}
          {/* ================================================= */}

          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[7%]" />
            <col className="w-[6%]" />
            <col className="w-[5%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
          </colgroup>

          {/* ================================================= */}
          {/* TABLE HEADER */}
          {/* ================================================= */}

          <thead
            className="
              sticky
              top-0
              z-20
              bg-[#0b1220]
            "
          >

            <tr
              className="
                h-[34px]
                border-b
                border-white/[0.06]
              "
            >

              <th
                className="
                  truncate
                  px-1
                  text-center
                  text-[10px]
                  font-medium
                  text-slate-600
                "
              >
                #
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-left
                    translate-x-3
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Time In
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-left
                   translate-x-2
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Time Out
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-left
                -translate-x-1
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                <span className="inline-flex items-center gap-1">
                  Symbol
                  <span className="text-[8px] text-slate-600">
                    ▾
                  </span>
                </span>
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-left
                  translate-x-1
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Type
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-left
                  translate-x-3
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Side
              </th>

              <th
                className="
                  truncate
                  px-1
                  -translate-x-3
                  text-right
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Qty
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-right
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Entry
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-right
                  text-[11px]
                  -translate-x-1
                  font-medium
                  text-slate-500
                "
              >
                Exit
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-right
                  -translate-x-2
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                P&L
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-right
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                R-Multiple
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-right
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                <span className="inline-flex items-center gap-1">
                  Duration
                  <span className="text-[8px] text-slate-600">
                    ▾
                  </span>
                </span>
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-center
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Status
              </th>

              <th
                className="
                  truncate
                  px-1
                  text-center
                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Reviewed
              </th>

            </tr>

          </thead>

          {/* ================================================= */}
          {/* TABLE BODY */}
          {/* ================================================= */}

          <tbody>

            {selectedTrades.map(
              (
                trade,
                index
              ) => {

                const pnl =
                  Number(
                    trade.pnl || 0
                  );

                const canEdit =
                  trade.contractKey?.startsWith(
                    "MANUAL-"
                  ) &&
                  !(
                    trade.status ===
                      "OPEN" &&
                    allTrades.some(
                      (
                        otherTrade
                      ) =>
                        otherTrade.id !==
                          trade.id &&
                        otherTrade.contractKey ===
                          trade.contractKey &&
                        otherTrade.status !==
                          "OPEN"
                    )
                  );

                return (
                  <tr
                    key={
                      trade.id ||
                      index
                    }
                    onDoubleClick={() => {
                      if (
                        canEdit
                      ) {
                        onEditTrade(
                          trade
                        );
                      }
                    }}
                    className="
                      h-[42px]
                      cursor-default
                      border-b
                      border-white/[0.045]
                      transition-colors
                      hover:bg-white/[0.018]
                    "
                  >

                    {/* INDEX */}

                    <td
                      className="
                        truncate
                        px-1
                        text-center
                        text-[11px]
                        font-medium
                        text-slate-600
                      "
                    >
                      {index + 1}
                    </td>

                    {/* TIME IN */}

                    <td
                      className="
                        truncate
                        whitespace-nowrap
                        px-1
                        text-left
                        text-[11px]
                        font-medium
                        text-slate-300
                      "
                    >
                      {formatTime(
                        trade.openedAt
                      )}
                    </td>

                    {/* TIME OUT */}

                    <td
                      className="
                        truncate
                        whitespace-nowrap
                        px-1
                        text-left
                        text-[11px]
                        font-medium
                        text-slate-300
                      "
                    >
                      {formatTime(
                        trade.closedAt
                      )}
                    </td>

                    {/* SYMBOL */}

                    <td
                      className="
                        truncate
                        px-1
                        text-left
                        text-[11px]
                        font-semibold
                        text-slate-100
                      "
                    >
                      {trade.ticker}
                    </td>

                    {/* TYPE */}

                    <td
                      className="
                        truncate
                        px-1
                        text-left
                        text-[11px]
                        font-medium
                        text-slate-400
                      "
                    >
                      {getAssetTypeLabel(
                        trade.assetType
                      )}
                    </td>

                    {/* SIDE */}

<td
  className={`
    truncate
    px-1
    text-left
      translate-x-3
    text-[11px]
    font-bold
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
  {trade.assetType === "Options"
    ? trade.contractKey?.endsWith("_C")
      ? "CALL"
      : trade.contractKey?.endsWith("_P")
        ? "PUT"
        : "OPTION"
    : trade.side}
</td>

                    {/* QTY */}

                    <td
                      className="
                        truncate
                        px-1
                        text-right
                          -translate-x-5
                        text-[11px]
                        font-medium
                        text-slate-300
                      "
                    >
                      {formatQuantity(
                        trade.quantity
                      )}
                    </td>

                    {/* ENTRY */}

                    <td
                      className="
                        truncate
                        px-1
                        text-right
                        text-[11px]
                        text-slate-300
                      "
                    >
                      {formatPrice(
                        trade.entryPrice
                      )}
                    </td>

                    {/* EXIT */}

                    <td
                      className="
                        truncate
                        px-1
                        text-right
                        text-[11px]
                        text-slate-300
                      "
                    >
                      {trade.exitPrice ===
                        0 &&
                      trade.status ===
                        "LOSS" ? (
                        <span
                          className="
                            text-[11px]
                            font-semibold
                            text-red-400
                          "
                        >
                          Expired
                        </span>
                      ) : (
                        formatPrice(
                          trade.exitPrice
                        )
                      )}
                    </td>

                    {/* P&L */}

                    <td
                      className={`
                        truncate
                        px-1
                        text-right
                        text-[11px]
                        font-bold
                        ${
                          pnl >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      {pnl >= 0
                        ? "+"
                        : "-"}
                      {getCurrencySymbol(
                        reportingCurrency
                      )}
                      {Math.abs(
                        pnl
                      ).toFixed(
                        2
                      )}
                    </td>

                    {/* R-MULTIPLE */}

                    <td
                      className="
                        truncate
                        px-1
                        text-right
                        -translate-x-5
                        text-[11px]
                        font-semibold
                        text-slate-500
                      "
                    >
                      —
                    </td>

                    {/* DURATION */}

                    <td
                      className="
                        truncate
                        whitespace-nowrap
                        px-1
                        text-right
                         -translate-x-3
                        text-[11px]
                        font-medium
                        text-slate-400
                      "
                    >
                      {formatDuration(
                        trade.openedAt,
                        trade.closedAt
                      )}
                    </td>

                    {/* STATUS */}

                    <td
                      className="
                        px-1
                        text-center
                      "
                    >
<span
  className={`
    text-[11px]
    font-bold
    ${
      trade.status ===
      "OPEN"
        ? "text-yellow-400"
        : trade.status ===
            "WIN"
          ? "text-emerald-400"
          : trade.status ===
              "LOSS"
            ? "text-red-400"
            : "text-slate-400"
    }
  `}
>
  {trade.status}
</span>
                    </td>

                    {/* REVIEWED */}

                    <td
                      className="
                        px-1
                        text-center
                      "
                    >
                      <span
                        className="
                          inline-flex
                          h-[13px]
                          w-[13px]
                          items-center
                          justify-center
                          rounded-[4px]
                          border
                          border-white/[0.14]
                        "
                        aria-label="Not reviewed"
                      />
                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}