
import {
  Filter as FilterIcon,
  Landmark,
  Layers,
  Coins,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import type {
  BrokerageAccount,
  CurrencyCode,
} from "@/lib/capital/types";

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function FilterSelect({
  label,
  value,
  onChange,
  icon,
  children,
}: FilterSelectProps) {
  return (
    <div className="flex min-w-0 items-center gap-10">
    <span className="relative left-6 shrink-0 text-[11px] font-medium text-slate-400">
  {label}
</span>

     <div className="relative w-[240px] max-w-full min-w-0 flex-none">
        <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-300">
          {icon}
        </div>

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
         className="!h-[30px] w-full appearance-none rounded-md border border-white/[0.10] bg-[#0A1422] !pl-11 !pr-8 text-[11px] font-medium text-slate-200 outline-none transition hover:border-white/[0.18] focus:border-blue-500/50"
        >
          {children}
        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

type FilterProps = {
  brokerFilter: string;
  accountFilter: string;
  currencyFilter: string;
  accounts: BrokerageAccount[];
  currencies: CurrencyCode[];
  onBrokerChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onReset: () => void;
};

export default function Filter({
  brokerFilter,
  accountFilter,
  currencyFilter,
  accounts,
  currencies,
  onBrokerChange,
  onAccountChange,
  onCurrencyChange,
  onReset,
}: FilterProps) {

  const brokerOptions = Array.from(
    new Set(
      accounts
        .map((account) => account.broker)
        .filter((broker) => broker.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const currencyOptions = currencies.filter((currency) =>
    accounts.some(
      (account) =>
        account.status === "ACTIVE" &&
        account.baseCurrency === currency
    )
  );

  return (
  <div className="relative left-3 mx-auto mt-5 flex min-h-[54px] w-[98%] items-center gap-4 rounded-[8px] border border-white/[0.08] bg-[#091321] px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

{/* FILTER TITLE */}
<div className="relative left-3 flex shrink-0 items-center gap-2">
  <span className="flex h-8 w-[90px] items-center justify-center gap-2 rounded-lg bg-white/[0.05] text-slate-300">
    <FilterIcon size={15} />
    <span className="text-[12px] font-semibold">
      Filters
    </span>
  </span>
</div>

     <div className="relative left-5 h-7 w-px shrink-0 bg-white/[0.10]" />

      {/* FILTER CONTROLS */}
     <div className="grid min-w-0 flex-[0.95] grid-cols-1 items-center gap-3 md:grid-cols-3">

        <FilterSelect
          label="Broker"
          value={brokerFilter}
          onChange={onBrokerChange}
          icon={<Landmark size={14} />}
        >
<option value="ALL">All brokers</option>

{brokerOptions.map((broker) => (
  <option key={broker} value={broker}>
    {broker}
  </option>
))}
        </FilterSelect>

        <FilterSelect
          label="Account"
          value={accountFilter}
          onChange={onAccountChange}
          icon={<Layers size={14} />}
        >
          <option value="ALL">All accounts</option>

{accounts
  .filter(
    (account) =>
      account.status === "ACTIVE" &&
      (brokerFilter === "ALL" ||
        account.broker === brokerFilter)
  )
  .map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
        </FilterSelect>

        <FilterSelect
          label="Currency"
          value={currencyFilter}
          onChange={onCurrencyChange}
          icon={<Coins size={14} />}
        >
          <option value="ALL">All currencies</option>

{currencyOptions.map((currency) => (
  <option key={currency} value={currency}>
    {currency}
  </option>
))}
        </FilterSelect>

      </div>

     <div className="relative left-5 h-7 w-px shrink-0 bg-white/[0.10]" />

      {/* RESET */}
      <button
        type="button"
        onClick={onReset}
        className="group relative left-6 flex shrink-0 items-center gap-2 px-2 text-[12px] font-semibold text-sky-400 transition hover:text-sky-300"
      >
        <RotateCcw
  size={14}
  className="transition-transform duration-300 group-hover:-rotate-180"
/>
        Reset
      </button>

    </div>
  );
}
