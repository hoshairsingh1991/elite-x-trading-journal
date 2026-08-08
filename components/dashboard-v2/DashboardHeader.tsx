"use client";

import UserMenuV2 from "@/components/layout/UserMenuV2";

import DateRangePicker
from "@/components/shared/DateRangePicker";
import {
  Upload,
  RefreshCw,
  ChevronDown,
} from "lucide-react";


type DashboardHeaderProps = {
  selectedAccount: string;
  setSelectedAccount: (
    value: string
  ) => void;

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
    <div className="grid h-[58px] grid-cols-[320px_1fr_auto] items-center border-b border-white/[0.05]">

      {/* ================================================= */}
      {/* LEFT SIDE */}
      {/* ================================================= */}

      <div
        className="
          relative
          left-8
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

      <div className="ml-16 flex justify-center gap-3">

        {/* ACCOUNTS */}

        <div className="relative">

          <select
            value={selectedAccount}
            onChange={(event) =>
              setSelectedAccount(event.target.value)
            }
className="
  h-[38px]
  min-w-[132px]
  appearance-none
  rounded-2xl
  border
  border-white/10
  bg-white/[0.03]
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

{/* DATE RANGE */}

<DateRangePicker
  selectedPreset={selectedPreset}
  onDateRangeChange={onDateRangeChange}
  heightClass="h-[38px]"
/>

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
  cursor-pointer
  items-center
  justify-center
  gap-2
  rounded-2xl
  border
  border-white/10
  bg-white/[0.03]
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
            items-center
            justify-center
            gap-2
            rounded-[13px]
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