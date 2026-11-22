
"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

import type { CurrencyCode } from "@/lib/capital/types";
import type { MonthlyFundingActivity } from "@/lib/capital/analytics";

interface FundingActivityCardProps {
  data: MonthlyFundingActivity[];
  currencyFilter: string;
  loading?: boolean;
}

const CURRENCIES: CurrencyCode[] = [
  "CAD",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "INR",
];

const CHART_HEIGHT = 125;
const TICK_COUNT = 4;

function formatAmount(
  amount: number,
  currency: CurrencyCode
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatAxisValue(
  value: number,
  currency: CurrencyCode
): string {
  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

  switch (currency) {
    case "CAD":
      return `C$${formattedValue}`;

    case "USD":
      return `$${formattedValue}`;

    case "INR":
      return `Rs${formattedValue}`;

    case "EUR":
      return `€${formattedValue}`;

    case "GBP":
      return `£${formattedValue}`;

    case "JPY":
      return `¥${formattedValue}`;

    default:
      return formattedValue;
  }
}

export default function FundingActivityCard({
  data,
  currencyFilter,
  loading = false,
}: FundingActivityCardProps) {
  const availableCurrencies = useMemo(
    () =>
      CURRENCIES.filter((currency) =>
        data.some(
          (item) =>
            item.currency === currency &&
            (item.deposits > 0 || item.withdrawals > 0)
        )
      ),
    [data]
  );

  const [chartCurrency, setChartCurrency] =
    useState<CurrencyCode>("CAD");

  const effectiveCurrency: CurrencyCode =
    currencyFilter !== "ALL"
      ? (currencyFilter as CurrencyCode)
      : availableCurrencies.includes(chartCurrency)
        ? chartCurrency
        : availableCurrencies[0] ?? "CAD";

  const monthlyData = useMemo(
    () =>
      data
        .filter((item) => item.currency === effectiveCurrency)
        .sort((a, b) => a.month.localeCompare(b.month)),
    [data, effectiveCurrency]
  );

  const hasActivity = monthlyData.some(
    (item) => item.deposits > 0 || item.withdrawals > 0
  );

  const maxValue = Math.max(
    0,
    ...monthlyData.flatMap((item) => [
      item.deposits,
      item.withdrawals,
    ])
  );

  // Calculate a rounded axis scale with four equal intervals.
  const rawStep =
    maxValue > 0 ? (maxValue * 1.2) / TICK_COUNT : 1;

  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(rawStep))
  );

  const normalizedStep = rawStep / magnitude;

const niceStep =
  (normalizedStep <= 1
    ? 1
    : normalizedStep <= 2
      ? 2
      : normalizedStep <= 2.5
        ? 2.5
        : normalizedStep <= 3
          ? 3
          : normalizedStep <= 4
            ? 4
            : normalizedStep <= 5
              ? 5
              : normalizedStep <= 6
                ? 6
                : normalizedStep <= 8
                  ? 8
                  : 10) * magnitude;

const axisMaximum = niceStep * TICK_COUNT;

  const ticks = Array.from(
    { length: TICK_COUNT + 1 },
    (_, index) => niceStep * (TICK_COUNT - index)
  );

  const currencyOptions =
    availableCurrencies.length > 0
      ? availableCurrencies
      : CURRENCIES;

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#091321] shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">

        <div className="relative left-4 top-1 flex items-center gap-3">
          <Activity
            size={17}
            strokeWidth={1.8}
            className="shrink-0 text-slate-300"
          />

          <div>
            <h3 className="text-[14px] font-semibold text-white">
              Funding Activity
            </h3>

            <p className="mt-1 text-[12px] text-slate-500">
              Monthly deposits and withdrawals
            </p>

            <div className="h-1" />
          </div>
        </div>

        {currencyFilter === "ALL" ? (
          <select
            value={effectiveCurrency}
            onChange={(event) =>
              setChartCurrency(
                event.target.value as CurrencyCode
              )
            }
            className="relative right-2 h-8 rounded-[8px] border border-white/[0.08] bg-[#0C1928] px-2 text-[11px] font-semibold text-slate-300 outline-none transition focus:border-blue-500/50"
            aria-label="Funding activity currency"
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        ) : (
          <span className="relative right-1 inline-flex h-[28px] items-center justify-center rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-3 text-[11px] font-semibold text-slate-400">
            {effectiveCurrency}
          </span>
        )}

      </div>

      <div className="h-1" />

      {/* CHART */}
      <div className="relative left-2 top-0 w-[97%] px-5 pt-3 pb-3">

        {/* CHART LEGEND */}
        <div className="mb-2 flex items-center justify-end gap-4">

          <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <span className="h-2 w-2 rounded-[1px] bg-emerald-400" />
            Deposits
          </span>

          <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <span className="h-2 w-2 rounded-[1px] bg-rose-400" />
            Withdrawals
          </span>

        </div>

        <div className="h-1" />

        {loading ? (
          <div className="flex h-[130px] items-center justify-center">
            <div className="h-5 w-32 animate-pulse rounded bg-white/[0.08]" />
          </div>
        ) : !hasActivity ? (
          <div className="flex h-[130px] items-center justify-center">
            <p className="text-[11px] text-slate-500">
              No funding activity for this period.
            </p>
          </div>
        ) : (
          <div className="flex min-w-0 gap-2">

            {/* Y AXIS */}
            <div className="flex w-[42px] shrink-0 flex-col">

              <div
                className="relative"
                style={{ height: `${CHART_HEIGHT}px` }}
              >
                {ticks.map((tick, index) => (
                  <span
                    key={tick}
                    className="absolute right-0 -translate-y-1/2 text-[9px] font-semibold tabular-nums text-emerald-400/70"
                    style={{
                      top: `${(index / TICK_COUNT) * 100}%`,
                    }}
                  >
                    {formatAxisValue(tick, effectiveCurrency)}
                  </span>
                ))}
              </div>

              <div className="mt-2 h-[25px]" />

            </div>


            {/* PLOT AREA */}
            <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden">

              <div
                className="relative min-w-full"
                style={{
                  minWidth: `${Math.max(
                    100,
                    monthlyData.length * 48
                  )}px`,
                }}
              >

                {/* HORIZONTAL GRIDLINES */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0"
                  style={{ height: `${CHART_HEIGHT}px` }}
                >
                  {ticks.map((tick, index) => (
                    <div
                      key={tick}
                      className="absolute inset-x-0 border-t border-dashed border-white/[0.10]"
                      style={{
                        top: `${(index / TICK_COUNT) * 100}%`,
                      }}
                    />
                  ))}
                </div>

                {/* MONTHLY BARS */}
                <div
                  className="relative flex items-end"
                  style={{ height: `${CHART_HEIGHT}px` }}
                >
                  {monthlyData.map((item) => {
                    const depositHeight =
                      item.deposits > 0
                        ? Math.max(
                            2,
                            (item.deposits / axisMaximum) *
                              CHART_HEIGHT
                          )
                        : 0;

                    const withdrawalHeight =
                      item.withdrawals > 0
                        ? Math.max(
                            2,
                            (item.withdrawals / axisMaximum) *
                              CHART_HEIGHT
                          )
                        : 0;

                    return (
                      <div
                        key={`${item.month}-${item.currency}`}
                        className="flex h-full min-w-0 flex-1 items-end justify-center gap-1"
                      >

                        <div
                          title={`Deposits: ${formatAmount(
                            item.deposits,
                            effectiveCurrency
                          )}`}
                          className="relative z-[1] w-[18px] max-w-[40%] rounded-t-[2px] bg-emerald-400/90 transition-colors duration-200 hover:bg-emerald-300"
                          style={{
                            height: `${depositHeight}px`,
                          }}
                        />

                        <div
                          title={`Withdrawals: ${formatAmount(
                            item.withdrawals,
                            effectiveCurrency
                          )}`}
                          className="relative z-[1] w-[18px] max-w-[40%] rounded-t-[2px] bg-rose-400/90 transition-colors duration-200 hover:bg-rose-300"
                          style={{
                            height: `${withdrawalHeight}px`,
                          }}
                        />

                      </div>
                    );
                  })}
                </div>

                {/* MONTH / YEAR LABELS */}
                <div className="flex border-t border-white/[0.10] pt-2">

                  {monthlyData.map((item) => (
                    <div
                      key={`${item.month}-label`}
                      className="flex min-w-0 flex-1 flex-col items-center"
                    >
                      <div className="h-1" />

                      <span className="text-[10px] font-medium text-slate-400">
                        {item.monthLabel}
                      </span>

                      <span className="mt-0.5 text-[9px] tabular-nums text-slate-500">
                        {item.month.slice(0, 4)}
                      </span>
                    </div>
                  ))}

                </div>

                <div className="h-1" />

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
