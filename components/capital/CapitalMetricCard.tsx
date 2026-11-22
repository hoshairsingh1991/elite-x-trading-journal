
import type { ReactNode } from "react";

import type { CurrencyCode } from "@/lib/capital/types";
import { formatMoney } from "@/lib/capital/formatters";

export function MetricCard({
  label,
  icon,
  accent,
  values,
  countLabel,
  description,
  loading = false,
}: {
  label: string;
  icon: ReactNode;
  accent: "green" | "red" | "blue" | "neutral";
  values: { currency: CurrencyCode; amount: number }[];
  countLabel?: string;
  description: string;
  loading?: boolean;
}) {
  const accentClasses = {
    green: {
      border: "border-emerald-500/50",
      background: "bg-gradient-to-br from-emerald-500/[0.09] to-[#081321]",
      icon: "bg-emerald-500/20 text-emerald-400",
      amount: "text-emerald-400",
    },
    red: {
      border: "border-rose-500/50",
      background: "bg-gradient-to-br from-rose-500/[0.09] to-[#081321]",
      icon: "bg-rose-500/20 text-rose-400",
      amount: "text-rose-400",
    },
    blue: {
      border: "border-blue-500/50",
      background: "bg-gradient-to-br from-blue-500/[0.09] to-[#081321]",
      icon: "bg-blue-500/20 text-blue-400",
      amount: "text-blue-300",
    },
    neutral: {
      border: "border-white/[0.10]",
      background: "bg-[#0A1422]",
      icon: "bg-white/[0.06] text-slate-300",
      amount: "text-white",
    },
  };

  const colors = accentClasses[accent];

  return (
    <div
      className={`
        flex h-[112px] min-w-0 items-center justify-start
        overflow-hidden rounded-[8px] border
        p-3 shadow-[0_6px_20px_rgba(0,0,0,0.16)]
        transition-all duration-200 ease-out
        hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]
        ${colors.border}
        ${colors.background}
      `}
    >
      <div className="relative left-4 flex min-w-0 items-center gap-3">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-lg ${colors.icon}
          `}
        >
          {icon}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-[12px] font-semibold leading-4 text-white">
            {label}
          </p>

          {loading ? (
            <div className="mt-1 h-6 w-32 animate-pulse rounded bg-white/[0.08]" />
          ) : countLabel ? (
            <p className="mt-1 text-[22px] font-bold leading-6 text-white tabular-nums">
              {countLabel}
            </p>
          ) : values.length > 0 ? (
            <p
              className={`mt-1 truncate text-[21px] font-bold leading-6 tracking-tight tabular-nums ${colors.amount}`}
            >
              {values[0].currency} {formatMoney(values[0].amount)}
            </p>
          ) : (
            <p className="mt-1 text-[21px] font-bold leading-6 text-slate-500">
              —
            </p>
          )}

          {!loading &&
            (countLabel ? (
              <div className="flex items-center gap-3 whitespace-nowrap">
                {values.map((item) => (
                  <span
                    key={item.currency}
                    className={`text-[11px] font-medium leading-4 tabular-nums ${
                      item.currency === "CAD"
                        ? "text-blue-300"
                        : "text-slate-300"
                    }`}
                  >
                    {item.currency} {formatMoney(item.amount)}
                  </span>
                ))}
              </div>
            ) : (
              values.map((item, index) => (
                <p
                  key={item.currency}
                  className={
                    index > 0
                      ? "truncate text-[11px] font-medium leading-4 text-slate-300 tabular-nums"
                      : "hidden"
                  }
                >
                  {item.currency} {formatMoney(item.amount)}
                </p>
              ))
            ))}

          <p className="mt-1 line-clamp-2 pt-1 text-[10px] leading-3 text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
