
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Activity,
} from "lucide-react";

import type {
  CapitalActivitySummary,
} from "@/lib/capital/analytics";

import { CURRENCY_ORDER } from "@/lib/capital/constants";

import type { BrokerageAccount } from "@/lib/capital/types";

interface CapitalActivitySummaryCardProps {
  summary: CapitalActivitySummary;
  accounts: BrokerageAccount[];
  loading?: boolean;
}

function formatAmount(
  amount: number,
  currency: string
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function CapitalActivitySummaryCard({
  summary,
  accounts,
  loading = false,
}: CapitalActivitySummaryCardProps) {

  const activeAccountCurrencies = new Set(
  accounts
    .filter((account) => account.status === "ACTIVE")
    .map((account) => account.baseCurrency)
);

const secondaryCurrency =
  CURRENCY_ORDER.find(
    (currency) =>
      currency !== "CAD" &&
      activeAccountCurrencies.has(currency)
  ) ?? "USD";

const displayCurrencies = ["CAD", secondaryCurrency] as const;

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#091321] shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">

        <div className="relative left-4">
          <div className="h-1" />

          <div className="flex items-center gap-2">
            <Activity size={15} className="text-blue-400" />

            <h2 className="text-[14px] font-semibold text-white">
              Capital Activity Summary
            </h2>
          </div>

          <p className="mt-1 text-[12px] text-slate-500">
            Completed transaction overview
          </p>

          <div className="h-1" />
        </div>

       <span className="relative right-4 inline-flex h-[28px] w-[50px] items-center justify-center rounded-[8px] border border-blue-500/20 bg-blue-500/[0.08] px-2.5 text-[10px] font-semibold text-blue-400">
  {loading ? (
    <span className="h-2 w-5 animate-pulse rounded bg-blue-400/20" />
  ) : (
    `${summary.totalCount} total`
  )}
</span>

      </div>

      {/* PANEL BODY */}
      <div className="flex flex-1 flex-col p-4">


{/* ACTIVITY COUNTS */}
<div className="relative left-2 top-3 grid w-[96%] grid-cols-3 gap-2">

{/* DEPOSITS */}
<div className="flex h-[58px] w-full items-center gap-3 rounded-[8px] border border-emerald-500/25 bg-emerald-500/[0.045] px-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

  <div className="relative left-2 flex items-center gap-4">

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-emerald-500/15 bg-emerald-500/[0.12] text-emerald-400">
      <ArrowDownToLine size={19} />
    </div>

    <div className="min-w-0 flex flex-col gap-1">
      <p className="text-[20px] font-semibold leading-none tabular-nums text-white">
  {loading ? (
    <span className="block h-5 w-6 animate-pulse rounded bg-white/[0.08]" />
  ) : (
    summary.depositCount
  )}
</p>

      <p className="text-[11px] font-medium leading-none text-slate-300">
        Deposits
      </p>
    </div>

  </div>
</div>

{/* WITHDRAWALS */}
<div className="flex h-[58px] w-full items-center gap-3 rounded-[8px] border border-rose-500/25 bg-rose-500/[0.045] px-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

  <div className="relative left-2 flex items-center gap-4">

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-rose-500/15 bg-rose-500/[0.12] text-rose-400">
      <ArrowUpFromLine size={19} />
    </div>

    <div className="min-w-0 flex flex-col gap-1">
      <p className="text-[20px] font-semibold leading-none tabular-nums text-white">
  {loading ? (
    <span className="block h-5 w-6 animate-pulse rounded bg-white/[0.08]" />
  ) : (
    summary.withdrawalCount
  )}
</p>

      <p className="text-[11px] font-medium leading-none text-slate-300">
        Withdrawals
      </p>
    </div>

  </div>
</div>

{/* TRANSFERS */}
<div className="flex h-[58px] w-full items-center gap-3 rounded-[8px] border border-blue-500/25 bg-blue-500/[0.045] px-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)] ">

  <div className="relative left-2 flex items-center gap-4">

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-blue-500/15 bg-blue-500/[0.12] text-blue-400">
      <ArrowLeftRight size={19} />
    </div>

   <div className="min-w-0 flex flex-col gap-1">
      <p className="text-[20px] font-semibold leading-none tabular-nums text-white">
  {loading ? (
    <span className="block h-5 w-6 animate-pulse rounded bg-white/[0.08]" />
  ) : (
    summary.transferCount
  )}
</p>

      <p className="text-[11px] font-medium leading-none text-slate-300">
        Transfers
      </p>
    </div>

  </div>
</div>

</div>

<div className="h-4" />

{/* LARGEST TRANSACTIONS */}
<div className="relative left-2 top-1.5 grid w-[96%] grid-cols-2 gap-2">

{/* LARGEST DEPOSIT */}
<div className="flex h-auto w-full min-w-0 items-center self-start rounded-[8px] border border-emerald-500/15 bg-emerald-500/[0.035] px-3 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

  <div className="relative left-2 flex items-center gap-3">

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-emerald-500/15 bg-emerald-500/[0.12] text-emerald-400">
      <ArrowDownToLine size={17} />
    </div>

    <div className="min-w-0">
      <div className="h-2" />

{loading ? (
  <>
    <div className="h-4 w-20 animate-pulse rounded bg-white/[0.08]" />
    <p className="mt-1 h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
  </>
) : summary.largestDeposits.length === 0 ? (
  <>
    <p className="text-[14px] font-semibold text-slate-500">
      —
    </p>
    <p className="mt-1 text-[10px] text-slate-500">
      Largest Deposit
    </p>
  </>
) : (
  <div className="flex flex-col gap-2">
    {summary.largestDeposits.map((transaction) => (
      <div key={transaction.id} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-semibold leading-none tabular-nums text-white">
            {formatAmount(
              transaction.amount,
              transaction.currency
            )}
          </p>

          <span className="inline-flex min-w-[30px] h-[18px] items-center justify-center rounded-[4px] border border-white/[0.08] bg-white/[0.04] px-2 text-[9px] font-semibold text-slate-400">
            {transaction.currency}
          </span>
        </div>

        <p className="text-[10px] font-medium leading-none text-slate-300">
          Largest Deposit
        </p>
      </div>
    ))}
  </div>
)}

      <div className="h-3" />
    </div>

  </div>

</div>

{/* LARGEST WITHDRAWAL */}
<div className="flex h-auto w-full min-w-0 items-center self-start rounded-[8px] border border-rose-500/15 bg-rose-500/[0.035] px-3 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

  <div className="relative left-2 flex items-center gap-3">

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-rose-500/15 bg-rose-500/[0.12] text-rose-400">
      <ArrowUpFromLine size={17} />
    </div>

    <div className="min-w-0">
      <div className="h-2" />

{loading ? (
  <div className="flex flex-col gap-1.5">
    {displayCurrencies.map((currency) => (
      <div key={currency} className="flex items-center gap-2">
        <div className="h-4 w-20 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-[18px] w-10 animate-pulse rounded bg-white/[0.06]" />
      </div>
    ))}

    <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
  </div>
) : (
  <div className="flex flex-col gap-1.5">
{displayCurrencies.map((currency) => {
  const transaction = summary.largestWithdrawals.find(
    (item) => item.currency === currency
  );

  return (
    <div key={currency} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <p
          className={`text-[15px] font-semibold leading-none tabular-nums ${
            transaction ? "text-white" : "text-slate-500"
          }`}
        >
          {transaction
            ? formatAmount(transaction.amount, currency)
            : "—"}
        </p>

        <span className="inline-flex h-[18px] min-w-[30px] items-center justify-center rounded-[4px] border border-white/[0.08] bg-white/[0.04] px-2 text-[9px] font-semibold text-slate-400">
          {currency}
        </span>
      </div>

      <p className="text-[10px] font-medium leading-none text-slate-300">
        Largest Withdrawal
      </p>
    </div>
  );
})}
  </div>
)}

<div className="h-3" />
    </div>

  </div>

</div>

</div>


</div>

</section>
  );
}
