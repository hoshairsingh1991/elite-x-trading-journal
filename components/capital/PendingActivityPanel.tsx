
import type {
  BrokerageAccount,
  CapitalTransaction,
  CurrencyCode,
} from "@/lib/capital/types";

import {
  CheckCircle2,
  Clock3,
} from "lucide-react";

import {
  formatMoney,
  formatDate,
} from "@/lib/capital/formatters";

import {
  getTypeLabel,
} from "@/lib/capital/calculations";

import {
  getAccountName,
} from "@/lib/capital/helpers";

import { StatusBadge } from "@/components/capital/StatusBadge";

type PendingActivityPanelProps = {
  pendingTransactions: CapitalTransaction[];
  pendingTotals: {
    currency: CurrencyCode;
    amount: number;
  }[];
  accounts: BrokerageAccount[];
  loading?: boolean;
};

export default function PendingActivityPanel({
  pendingTransactions,
  pendingTotals,
  accounts,
  loading = false,
}: PendingActivityPanelProps) {
  return (
    <aside className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#091321] shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">

        <div className="relative left-4">
          <div className="h-1" />

          <h2 className="text-[14px] font-semibold text-white">
            Pending Activity
          </h2>

          <p className="mt-1 text-[12px] text-slate-500">
            Awaiting confirmation
          </p>

          <div className="h-1" />
        </div>

        <span className="relative right-4 inline-flex h-[28px] w-[80px] items-center justify-center rounded-[8px] border border-amber-500/20 bg-amber-500/[0.08] px-2.5 text-[11px] font-semibold text-amber-400">
  {loading ? (
    <span className="h-2 w-5 animate-pulse rounded bg-amber-400/20" />
  ) : (
    `${pendingTransactions.length} pending`
  )}
</span>

      </div>

      {/* PANEL BODY */}
      <div className="flex flex-1 flex-col p-4">

        {loading ? (
  <div className="flex flex-1 flex-col gap-2 py-2">
    <div className="h-[90px] animate-pulse rounded-[8px] border border-white/[0.05] bg-white/[0.025]" />
    <div className="h-[90px] animate-pulse rounded-[8px] border border-white/[0.05] bg-white/[0.025]" />
  </div>
) : pendingTransactions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
 <div className="h-2" />
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-slate-500">
              <CheckCircle2 size={20} />
            </div>
 <div className="h-1" />
            <p className="text-[12px] font-semibold text-slate-300">
              No pending transactions
            </p>

            <p className="mt-1 max-w-[190px] text-[10px] leading-relaxed text-slate-500">
              All recorded transactions are up to date.
            </p>

          </div>
        ) : (
         <div className="flex max-h-[230px] flex-col gap-2 overflow-y-auto overflow-x-hidden pt-1.5 pr-1">
            <div className="h-0.2" />
            {pendingTransactions.map((transaction) => (
           <div
  key={transaction.id}
  className="relative left-2 top-0 mx-auto w-[95%] rounded-[8px] border border-amber-500/15 bg-amber-500/[0.035] p-3 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
>
<div className="h-1" />
                <div className="flex items-start justify-between gap-2">

                  <div>
                    <p className="relative left-2 text-[11px] font-semibold text-slate-200">
                      {getTypeLabel(transaction.type)}
                    </p>

                    <p className="relative left-2 mt-1 text-[10px] text-slate-500">
                      {getAccountName(
                        accounts,
                        transaction.toAccountId ??
                          transaction.fromAccountId
                      )}
                    </p>
                  </div>

                 <Clock3
  size={15}
  className="relative top-1 -left-2 shrink-0 text-amber-400"
/>

                </div>

                <p className="relative left-2 mt-3 text-[16px] font-semibold text-white tabular-nums">
                  {transaction.currency}{" "}
                  {formatMoney(transaction.amount)}
                </p>

                <div className="mt-2 flex items-center justify-between">

                  <span className="relative left-2 text-[10px] text-slate-500">
                    {formatDate(transaction.date)}
                  </span>

                  <div className="relative -left-2">
  <StatusBadge status="PENDING" />
</div>

                </div>

{transaction.notes && (
  <div className="mt-2">
    <div className="relative -left-0 border-t border-white/[0.06]" />
<div className="h-0.5" />
    <p className="relative left-2 pt-2 text-[10px] leading-relaxed text-slate-400">
      {transaction.notes}
    </p>
  </div>
)}
<div className="h-0.5" />
              </div>
            ))}

          </div>
        )}
<div className="h-1.5" />
        {/* PENDING TOTALS */}
        <div className="mt-auto border-t border-white/[0.06] pt-3">
<div className="h-1" />
          <div className="relative left-4 mb-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Pending value
            </span>

            <span className="relative top-2 right-8 text-[9px] font-medium text-amber-400">
              Not included in KPIs
            </span>
          </div>

{loading ? (
  <div className="relative left-4 flex flex-col gap-1">
    <div className="h-3 w-24 animate-pulse rounded bg-white/[0.08]" />
    <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
  </div>
) : pendingTotals.length > 0 ? (
  <div className="relative left-4 space-y-1">
    {pendingTotals.map((item) => (
      <p
        key={item.currency}
        className="text-[12px] font-semibold text-slate-200 tabular-nums"
      >
        {item.currency}{" "}
        {formatMoney(item.amount)}
      </p>
    ))}
  </div>
) : (
  <p className="relative left-4 text-[12px] font-semibold text-slate-400">
    —
  </p>
)}

        </div>

      </div>

    </aside>
  );
}
