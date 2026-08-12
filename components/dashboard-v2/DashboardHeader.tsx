"use client";

import UserMenuV2 from "@/components/layout/UserMenuV2";

import DateRangePicker from "@/components/shared/DateRangePicker";
import {
  Upload,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

type DashboardHeaderProps = {
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;

  availableAccounts: string[];

  selectedPreset: string;

  onDateRangeChange: (
    preset: string,
    start: Date | null,
    end: Date | null
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

  selectedPreset,
  onDateRangeChange,

  totalTrades,
  totalPnL,
  tradingDays,

  isSyncing,

  onSync,
  onUpload,
}: DashboardHeaderProps) {
  return (
    <div
      className="
        grid
        h-[58px]
        min-w-0
        grid-cols-[320px_minmax(0,1fr)_auto]
        items-center
        border-b
        border-white/[0.05]
      "
    >
      {/* ================================================= */}
      {/* LEFT SIDE */}
      {/* ================================================= */}

      <div
        className="
          relative
          left-8
          min-w-0
          w-[290px]
          shrink-0
        "
      >
        <h1 className="text-[22px] font-semibold leading-none text-white">
          Overview
        </h1>

        <p className="mt-1 text-[14px] text-slate-500">
          Your trading performance at a glance
        </p>
      </div>

      {/* ================================================= */}
      {/* CENTER FILTERS */}
      {/* ================================================= */}

      <div
        className="
          ml-16
          flex
          min-w-0
          items-center
          justify-center
          gap-3
          overflow-visible
        "
      >
        {/* ACCOUNTS */}

        <div className="relative shrink-0">
<select
  value={selectedAccount}
  onChange={(event) =>
    setSelectedAccount(event.target.value)
  }
  className="
    h-[38px]
    min-w-[132px]
    appearance-none
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b0c1e]
    text-center
    text-[14px]
    font-semibold
    text-slate-300
    outline-none
    transition-all
    duration-200
    hover:border-white/20
    hover:bg-white/[0.05]
  "
>
            {availableAccounts.map((account) => (
              <option
                key={account}
                value={account}
              >
                {account === "ALL"
                  ? "All Accounts"
                  : account}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
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

        {/* DATE RANGE */}

        <div className="shrink-0">
          <DateRangePicker
            selectedPreset={selectedPreset}
            onDateRangeChange={onDateRangeChange}
            heightClass="h-[38px]"
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* RIGHT SIDE */}
      {/* ================================================= */}

      <div
        className="
          relative
          right-4
          mr-2
          flex
          shrink-0
          items-center
          gap-3
        "
      >
        {/* CSV */}

        <label
          className="
            flex
            h-[38px]
            w-[160px]
            shrink-0
            cursor-pointer
            items-center
            justify-center
            gap-2
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]
            text-[13px]
            font-semibold
            text-slate-300
            transition-all
            duration-200
            hover:border-white/20
            hover:bg-white/[0.05]
          "
        >
          <Upload size={15} />

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
            h-[38px]
            w-[108px]
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-[8px]
            border
            border-emerald-400/20
            bg-emerald-500/10
            px-4
            text-[13px]
            font-semibold
            text-emerald-300
            transition-all
            hover:bg-emerald-500/20
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >
          <RefreshCw
            size={15}
            className={isSyncing ? "animate-spin" : ""}
          />

          {isSyncing ? "Syncing..." : "Sync IBKR"}
        </button>

        <div className="shrink-0">
          <UserMenuV2
            totalTrades={totalTrades}
            totalPnL={totalPnL}
            tradingDays={tradingDays}
          />
        </div>
      </div>
    </div>
  );
}