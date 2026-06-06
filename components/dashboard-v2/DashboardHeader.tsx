"use client";

import UserMenuV2 from "@/components/layout/UserMenuV2";
import {
  Upload,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import {
  TimeRange,
} from "@/lib/analytics";

type DashboardHeaderProps = {
  selectedAccount: string;
  setSelectedAccount: (
    value: string
  ) => void;

  availableAccounts: string[];

  selectedRange: TimeRange;
  setSelectedRange: (
    value: TimeRange
  ) => void;

  totalTrades: number;
  totalPnL: number;
  tradingDays: number;

  isSyncing: boolean;

  onSync: () => void;

  onUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function DashboardHeader({
  selectedAccount,
  setSelectedAccount,
  availableAccounts,

  selectedRange,
  setSelectedRange,

  totalTrades,
  totalPnL,
  tradingDays,

  isSyncing,

  onSync,
  onUpload,
}: DashboardHeaderProps) {

  return (
    <div className="grid h-[82px] grid-cols-[320px_1fr_auto] items-center border-b border-white/[0.05]">

      {/* ================================================= */}
      {/* LEFT SIDE */}
      {/* ================================================= */}

      <div
  className="
    relative
    left-8
    w-[320px]
    shrink-0
  "
>

        <h1 className="text-[24px] font-semibold text-white">
          Overview
        </h1>

        <p className="mt-2 text-[14px] text-slate-500">
          Your trading performance at a glance
        </p>

      </div>

      {/* ================================================= */}
      {/* CENTER FILTERS */}
      {/* ================================================= */}

      <div className="ml-20 flex justify-center gap-3">

        {/* ACCOUNTS */}

        <div className="relative">

          <select
            value={selectedAccount}
            onChange={(event) =>
              setSelectedAccount(
                event.target.value
              )
            }
            className="
  h-[42px]
  min-w-[140px]
  appearance-none
  rounded-[16px]
  border
  border-white/[0.06]
  bg-[#0b1730]
  text-center
  text-[15px]
  font-semibold
  text-slate-200
  outline-none
  transition-all
  hover:bg-[#13203a]
"
          >
            {availableAccounts.map(
              (account) => (
                <option
                  key={account}
                  value={account}
                >
                  {account === "ALL"
                    ? "All Accounts"
                    : account}
                </option>
              )
            )}
          </select>

          <ChevronDown
  size={16}
  className="
    pointer-events-none
    absolute
    right-1
    top-1/2
    -translate-y-1/2
    text-slate-500
  "
/>

        </div>

        {/* STRATEGIES */}

        <button
  disabled
  className="
    relative
    h-[42px]
    min-w-[150px]
    rounded-[16px]
    border
    border-white/[0.06]
    bg-[#0b1730]
    text-center
    text-[15px]
    font-semibold
    text-slate-400
    opacity-70
  "
>
  All Strategies

  <ChevronDown
    size={16}
    className="
      pointer-events-none
      absolute
      right-1
      top-1/2
      -translate-y-1/2
    "
  />
</button>

        {/* DATE RANGE */}

        <div className="relative">

          <select
            value={selectedRange}
            onChange={(event) =>
              setSelectedRange(
                event.target.value as TimeRange
              )
            }
            className="
  h-[42px]
  min-w-[150px]
  appearance-none
  rounded-[16px]
  border
  border-white/[0.06]
  bg-[#0b1730]
  text-center
  text-[15px]
  font-semibold
  text-slate-200
  outline-none
  transition-all
  hover:bg-[#13203a]
"
          >
            <option value="1D">
              Today
            </option>

            <option value="7D">
              Last 7 Days
            </option>

            <option value="30D">
              Last 30 Days
            </option>

            <option value="MTD">
              This Month
            </option>

            <option value="YTD">
              Year To Date
            </option>

            <option value="ALL">
              All Time
            </option>
          </select>

          <ChevronDown
  size={16}
  className="
    pointer-events-none
    absolute
    right-2
    top-1/2
    -translate-y-1/2
    text-slate-500
  "
/>

        </div>

      </div>

      {/* ================================================= */}
      {/* RIGHT SIDE */}
      {/* ================================================= */}

    <div
  className="
    relative
    right-6
    mr-4
    flex
    items-center
    gap-3
  "
>

        {/* CSV */}

        <label
          className="
  flex
  h-[44px]
  w-[180px]
  cursor-pointer
  items-center
  justify-center
  gap-3
  rounded-[16px]
  border
  border-white/[0.06]
  bg-[#0b1730]
  text-[14px]
  font-semibold
  text-slate-200
  transition-all
  hover:bg-[#13203a]
"
        >
          <Upload size={17} />

          UPLOAD IBKR CSV

          <input
            type="file"
            accept=".csv"
            onChange={onUpload}
            className="hidden"
          />
        </label>

       {/* SYNC */}

<button
  onClick={onSync}
  disabled={isSyncing}
  className="
    flex
    h-[44px]
    w-[120px]
    items-center
    justify-center
    gap-3
    rounded-[16px]
    border
    border-emerald-400/20
    bg-emerald-500/10
    px-5
    text-[14px]
    font-semibold
    text-emerald-300
    transition-all
    hover:bg-emerald-500/20
    disabled:cursor-not-allowed
    disabled:opacity-70
  "
>
  <RefreshCw
    size={17}
    className={
      isSyncing
        ? "animate-spin"
        : ""
    }
  />

  {isSyncing
    ? "Syncing..."
    : "Sync IBKR"}
</button>

<UserMenuV2
  totalTrades={totalTrades}
  totalPnL={totalPnL}
  tradingDays={tradingDays}
/>

      </div>
    </div>
  );
}