import {
  Landmark,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Globe,
  Calendar,
  Info,
} from "lucide-react";

import { ChevronDown } from "lucide-react";

export default function AccountCurrencyCard() {
  return (
    <div
      className="
        h-[880px]
        overflow-hidden
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/[0.14]
        hover:bg-[#0A1A2E]/80
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
      "
    >
{/* ===================================== */}
{/* HEADER */}
{/* ===================================== */}

<div className="relative left-4 top-2">
  <div className="flex items-start justify-between pr-8">

    {/* Title */}

    <div className="relative left-4">
      <h3 className="text-[16px] font-semibold text-white">
        Account & Currency
      </h3>

      <p className="mt-2 text-[14px] text-slate-500">
        Native currency accounting
      </p>
    </div>

    {/* Icon */}

    <div
      className="
        relative
        right-14

        flex
        h-11
        w-11
        items-center
        justify-center

        rounded-xl
        border
        border-white/[0.08]
        bg-white/[0.03]

        transition-all
        duration-300
      "
    >
      <Landmark
        size={18}
        className="text-slate-400"
      />
    </div>

  </div>

  {/* Divider */}

  <div
    className="
      relative
      right-2

      mt-5
      h-px
      w-[92%]

      bg-white/[0.06]
    "
  />
</div>

{/* ===================================== */}
{/* NATIVE P&L */}
{/* ===================================== */}

<div className="relative translate-y-4 mt-10 flex justify-center">
  <div className="w-[90%]">

    <div className="mb-4 text-[13px] font-medium uppercase tracking-[0.12em] text-slate-400">
      Native P&amp;L By Currency
    </div>

    <div className="h-[6px]" />

    {/* Column Headers */}

    <div className="grid grid-cols-[170px_110px_90px] items-center px-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        Currency
      </span>

      <span className="text-right text-[11px] uppercase tracking-[0.14em] text-slate-500">
        P&amp;L
      </span>

<span className="relative left-20 text-right text-[12px] uppercase tracking-[0.14em] text-slate-500">
  %
</span>
    </div>

    <div
      className="
        relative
        rounded-[18px]
        border
        border-white/[0.10]
        bg-white/[0.04]
        px-7
        py-5
      "
    >
      <div className="space-y-2">

        {/* USD */}

        <div className="h-[4px]" />

        <div className="grid grid-cols-[170px_110px_180px] items-center">
          <div className="relative left-3">
            <div className="text-[14px] font-medium text-slate-200">
              🇺🇸 USD
            </div>

            <div className="mt-1 text-[14px] text-slate-500">
              United States Dollar
            </div>
          </div>

          <div className="text-right text-[16px] font-semibold text-emerald-400">
            +$819.23
          </div>

          <div className="text-right text-[16px] font-medium text-slate-400">
            65%
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* CAD */}

        <div className="h-[4px]" />

        <div className="grid grid-cols-[170px_110px_180px] items-center">
          <div className="relative left-3">
            <div className="text-[14px] font-medium text-slate-200">
              🇨🇦 CAD
            </div>

            <div className="mt-1 text-[14px] text-slate-500">
              Canadian Dollar
            </div>
          </div>

          <div className="text-right text-[16px] font-semibold text-emerald-400">
            +C$458.39
          </div>

          <div className="text-right text-[16px] font-medium text-slate-400">
            36%
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* EUR */}

        <div className="h-[4px]" />

        <div className="grid grid-cols-[170px_110px_180px] items-center">
          <div className="relative left-3">
            <div className="text-[14px] font-medium text-slate-200">
              🇪🇺 EUR
            </div>

            <div className="mt-1 text-[14px] text-slate-500">
              Euro
            </div>
          </div>

          <div className="text-right text-[16px] font-semibold text-rose-400">
            -€24.01
          </div>

          <div className="text-right text-[16px] font-medium text-slate-400">
            -2%
          </div>
        </div>

        <div className="h-[4px]" />

      </div>
    </div>
  </div>
</div>

{/* ===================================== */}
{/* COMMISSIONS */}
{/* ===================================== */}

<div className="relative translate-y-8 mt-10 flex justify-center">
  <div className="w-[90%]">

    <div className="mb-4 text-[13px] font-medium uppercase tracking-[0.12em] text-slate-400">
      Commissions By Currency
    </div>

    <div className="h-[6px]" />

    {/* Column Headers */}

    <div className="grid grid-cols-[170px_110px_90px] items-center px-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        Currency
      </span>

      <span className="text-right text-[11px] uppercase tracking-[0.14em] text-slate-500">
        Commission
      </span>

      <span className="relative left-20 text-right text-[12px] uppercase tracking-[0.14em] text-slate-500">
        %
      </span>
    </div>

    <div
      className="
        relative
        rounded-[18px]
        border
        border-white/[0.10]
        bg-white/[0.04]
        px-7
        py-5
      "
    >
      <div className="space-y-2">

        {/* USD */}

        <div className="h-[4px]" />

        <div className="grid grid-cols-[170px_110px_180px] items-center">
          <div className="relative left-3">
            <div className="text-[14px] font-medium text-slate-200">
              🇺🇸 USD
            </div>

            <div className="mt-1 text-[14px] text-slate-500">
              United States Dollar
            </div>
          </div>

          <div className="text-right text-[16px] font-semibold text-slate-300">
            $700.37
          </div>

          <div className="text-right text-[16px] font-medium text-slate-400">
            98%
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* CAD */}

        <div className="h-[4px]" />

        <div className="grid grid-cols-[170px_110px_180px] items-center">
          <div className="relative left-3">
            <div className="text-[14px] font-medium text-slate-200">
              🇨🇦 CAD
            </div>

            <div className="mt-1 text-[14px] text-slate-500">
              Canadian Dollar
            </div>
          </div>

          <div className="text-right text-[16px] font-semibold text-slate-300">
            C$3.11
          </div>

          <div className="text-right text-[16px] font-medium text-slate-400">
            1%
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* EUR */}

        <div className="h-[4px]" />

        <div className="grid grid-cols-[170px_110px_180px] items-center">
          <div className="relative left-3">
            <div className="text-[14px] font-medium text-slate-200">
              🇪🇺 EUR
            </div>

            <div className="mt-1 text-[14px] text-slate-500">
              Euro
            </div>
          </div>

          <div className="text-right text-[16px] font-semibold text-slate-300">
            €12.00
          </div>

          <div className="text-right text-[16px] font-medium text-slate-400">
            1%
          </div>
        </div>

        <div className="h-[4px]" />

      </div>
    </div>
  </div>
</div>

{/* ===================================== */}
{/* CURRENCIES TRADED */}
{/* ===================================== */}

<div className="relative translate-y-12 mt-10 flex justify-center">
  <div className="w-[90%]">
    <div className="mb-4 text-[13px] font-medium uppercase tracking-[0.12em] text-slate-400">
      Currencies Traded
    </div>
<div className="h-[4px]" />
<div className="relative left-0 flex flex-wrap gap-3">
  {[
    "🇺🇸 USD",
    "🇨🇦 CAD",
    "🇪🇺 EUR",
    "🇬🇧 GBP",
    "🇯🇵 JPY",
  ].map((currency) => (
<div
  key={currency}
  className="
    w-[80px]
    h-[42px]

    flex
    items-center
    justify-center

    rounded-xl
    border
    border-white/[0.08]
    bg-white/[0.04]

    text-[16px]
    font-medium
    text-slate-300
  "
>
  {currency}
</div>
  ))}
</div>
<div className="h-[4px]" />

{/* Divider */}

<div className="mt-6 h-px bg-white/[0.06]" />
    
  </div>
</div>

{/* ===================================== */}
{/* REPORTING CONFIG */}
{/* ===================================== */}

<div className="relative translate-y-16 mt-10 flex justify-center">
  <div className="w-[90%]">
    <div className="mb-4 text-[13px] font-medium uppercase tracking-[0.12em] text-slate-400">
      Reporting Configuration
    </div>

    <div
      className="
        relative
        translate-y-2

        rounded-[18px]
        border
        border-white/[0.10]
        bg-white/[0.04]

        p-5
      "
    >
      <div className="space-y-2">

        <div className="h-[2px]" />

        {/* Reporting Currency */}

        <div className="flex items-center justify-between">
          <div className="relative left-3 flex items-center gap-3">
            <DollarSign
              size={15}
              className="text-slate-500"
            />

            <span className="text-[16px] text-slate-400">
              Reporting Currency
            </span>
          </div>

          <div className="relative right-3 flex items-center gap-2">
            <span className="text-[15px] font-medium text-slate-200">
              USD
            </span>

            <ChevronDown
              size={14}
              className="text-slate-500"
            />
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* FX Conversion */}
<div className="h-[4px]" />
        <div className="flex items-center justify-between">
          <div className="relative left-3 flex items-center gap-3">
            <RefreshCw
              size={15}
              className="text-slate-500"
            />

            <span className="text-[16px] text-slate-400">
              FX Conversion
            </span>
          </div>

          <div className="relative right-3 flex items-center gap-2">
            <span className="text-[15px] font-medium text-amber-400">
              Disabled
            </span>

            <ChevronDown
              size={14}
              className="text-slate-500"
            />
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />
<div className="h-[4px]" />
        {/* Conversion Method */}

        <div className="flex items-center justify-between">
          <div className="relative left-3 flex items-center gap-3">
            <TrendingUp
              size={15}
              className="text-slate-500"
            />

            <span className="text-[16px] text-slate-400">
              Conversion Method
            </span>
          </div>

          <div className="relative right-3 flex items-center gap-2">
            <span className="text-[15px] font-medium text-slate-200">
              Spot Rate
            </span>

            <ChevronDown
              size={14}
              className="text-slate-500"
            />
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* FX Source */}
<div className="h-[4px]" />
        <div className="flex items-center justify-between">
          <div className="relative left-3 flex items-center gap-3">
            <Globe
              size={15}
              className="text-slate-500"
            />

            <span className="text-[16px] text-slate-400">
              FX Rate Source
            </span>
          </div>

          <div className="relative right-3 flex items-center gap-2">
            <span className="text-[15px] font-medium text-slate-200">
              ECB Daily
            </span>

            <ChevronDown
              size={14}
              className="text-slate-500"
            />
          </div>
        </div>

        <div className="h-[4px]" />
        <div className="h-px bg-white/[0.06]" />

        {/* Last Updated */}
<div className="h-[4px]" />
        <div className="flex items-center justify-between">
          <div className="relative left-3 flex items-center gap-3">
            <Calendar
              size={15}
              className="text-slate-500"
            />

            <span className="text-[16px] text-slate-400">
              Last Updated
            </span>
          </div>

<div className="relative right-3 flex items-center gap-2">
  <span className="text-[15px] font-medium text-slate-200">
    Jun 06, 2026
  </span>

  <div className="w-[14px]" />
</div>
        </div>

        <div className="h-[4px]" />

      </div>
    </div>

    <div className="h-[26px]" />

    <div
      className="
        rounded-[16px]
        border
        border-blue-500/[0.12]
        bg-blue-500/[0.04]
        p-4
      "
    >
      <div className="flex items-start gap-3">
        <Info
          size={18}
          className="mt-0.5 shrink-0 text-blue-400"
        />

        <p className="text-[14px] leading-relaxed text-slate-400">
          Dashboard metrics including P&amp;L,
          equity curve, performance analytics,
          and KPI calculations will use the
          selected reporting currency once
          FX conversion is enabled.
        </p>
      </div>
    </div>
  </div>
</div>
    </div>
  );
}