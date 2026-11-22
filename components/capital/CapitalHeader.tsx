
"use client";

import DateRangePicker from "@/components/shared/DateRangePicker";

import { Plus, Settings2 } from "lucide-react";


type CapitalHeaderProps = {
  selectedPreset: string;
  onDateRangeChange: (
    preset: string,
    start: Date | null,
    end: Date | null
  ) => void;
  onAddTransaction: () => void;
  onManageAccounts: () => void;
};

export default function CapitalHeader({
  selectedPreset,
  onDateRangeChange,
  onAddTransaction,
  onManageAccounts,
}: CapitalHeaderProps) {


  return (
    <header
      className="
        mb-6
        grid
        min-w-0
        grid-cols-[320px_minmax(0,1fr)_auto]
        items-center
      "
    >
      {/* LEFT SIDE */}
<div
  className="
    relative
    left-8
    top-3
    min-w-0
    w-[290px]
    shrink-0
  "
>
<p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400/80">
  FINANCIAL MANAGEMENT
</p>

<h1 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] text-white">
  Capital Management
</h1>

<p className="mt-0.5 whitespace-nowrap text-[12px] text-slate-500">
  Track deposits, withdrawals and transfers across your brokerage accounts.
</p>

      </div>

      {/* CENTER */}
      <div className="min-w-0" />

      {/* RIGHT SIDE */}
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
        <DateRangePicker
          selectedPreset={selectedPreset}
          onDateRangeChange={onDateRangeChange}
          heightClass="h-[38px]"
        />

<button
  type="button"
  onClick={onManageAccounts}
  className="
    group
    inline-flex
    h-[38px]
    w-[150px]
    shrink-0
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    border-blue-400/25
    bg-blue-500/[0.09]
    text-[12px]
    font-semibold
    text-blue-200
    shadow-[0_3px_12px_rgba(37,99,235,0.08)]
    transition-all
    duration-200
    ease-out
    hover:border-blue-400/50
    hover:bg-blue-500/[0.17]
    hover:text-white
    hover:shadow-[0_5px_18px_rgba(37,99,235,0.20)]
    active:scale-[0.97]
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-blue-400/50
  "
>
  <Settings2
    size={15}
    strokeWidth={2}
    className="
      text-blue-400
      transition-transform
      duration-300
      group-hover:rotate-45
      group-hover:text-blue-300
    "
  />
  Manage Accounts
</button>


        <button
          type="button"
          onClick={onAddTransaction}
className="
  group
  inline-flex
  h-[38px]
  w-[130px]
  shrink-0
  items-center
  justify-start
  gap-2
  rounded-lg
  border
  border-blue-400/30
  bg-[#2563EB]
  text-[12px]
  font-semibold
  text-white
  shadow-[0_5px_18px_rgba(37,99,235,0.22)]
  transition
  hover:bg-blue-500
"
        >
          <span className="inline-flex translate-x-1 items-center gap-2">
  <Plus
  size={16}
  strokeWidth={2.5}
  className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
/>
  Add Transaction
</span>
        </button>
      </div>
    </header>
  );
}
