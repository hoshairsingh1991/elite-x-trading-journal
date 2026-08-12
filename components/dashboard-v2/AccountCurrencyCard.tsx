import { useMemo } from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import {
  Landmark,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Globe,
  Calendar,
  Info,
  ChevronDown,
} from "lucide-react";

import EliteSelect, {
  EliteSelectOption,
} from "@/components/ui/EliteSelect";

import CurrencyFlag from "@/components/ui/CurrencyFlag";

import { Trade } from "@/types/trade";

import { BadgeInfo } from "lucide-react";

import { CircleHelp } from "lucide-react";

import { ShieldCheck } from "lucide-react";

import { BookOpen } from "lucide-react";

import { CircleAlert } from "lucide-react";

import { Sparkles } from "lucide-react";

import {
  getAccountCurrencyAnalytics,
} from "@/lib/analytics/accountCurrencyAnalytics";

// =================================================
// CURRENCY DISPLAY METADATA
// =================================================

const CURRENCY_INFO = {
  USD: {
    flag: "🇺🇸",
    name: "United States Dollar",
    symbol: "$",
  },

  CAD: {
    flag: "🇨🇦",
    name: "Canadian Dollar",
    symbol: "C$",
  },

  EUR: {
    flag: "🇪🇺",
    name: "Euro",
    symbol: "€",
  },

  GBP: {
    flag: "🇬🇧",
    name: "British Pound",
    symbol: "£",
  },

  JPY: {
    flag: "🇯🇵",
    name: "Japanese Yen",
    symbol: "¥",
  },

  INR: {
    flag: "🇮🇳",
    name: "Indian Rupee",
    symbol: "₹",
  },
};


type AccountCurrencyCardProps = {
  trades: Trade[];

  reportingCurrency: string;

  setReportingCurrency:
    Dispatch<
      SetStateAction<string>
    >;
};

export default function AccountCurrencyCard({
  trades,
  reportingCurrency,
  setReportingCurrency,
}: AccountCurrencyCardProps) {

  const todayDate =
  new Date().toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
  );

  const analytics = useMemo(
    () =>
      getAccountCurrencyAnalytics(
        trades
      ),
    [trades]
  );

const currencyOptions = [
  {
    value: "USD",
    label: "USD",
  },
  {
    value: "CAD",
    label: "CAD",
  },
  {
    value: "EUR",
    label: "EUR",
  },
  {
    value: "GBP",
    label: "GBP",
  },
  {
    value: "JPY",
    label: "JPY",
  },
  {
    value: "INR",
    label: "INR",
  },
];


const nativePnLRows = [...analytics.nativePnL];

while (nativePnLRows.length < 3) {
  nativePnLRows.push({
    currency: "",
    pnl: 0,
    percentage: 0,
  });
}

const commissionRows = [...analytics.commissions];

while (commissionRows.length < 3) {
  commissionRows.push({
    currency: "",
    commission: 0,
    percentage: 0,
  });
}

return (
  <div
    className="
      relative
      z-50

      h-[730px]
      overflow-hidden
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]
backdrop-blur-xl

      transition-all
      duration-300

      hover:-translate-y-1
      hover:border-white/[0.14]
      hover:bg-[#0b0c1e]
      hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
    "
  >

    {/* ===================================== */}
    {/* INVISIBLE SPACER */}
    {/* ===================================== */}

    <div className="h-[8px]" />

    {/* ===================================== */}
    {/* HEADER */}
    {/* ===================================== */}

    <div className="px-8 pt-7">

      <div className="relative left-6 flex items-start justify-between pr-8">

        {/* Title */}

        <div>

          <h3 className="text-[16px] font-semibold text-white">
            Account & Currency
          </h3>

          <p className="mt-2 text-[14px] text-slate-500">
            Multi-currency reporting
          </p>

        </div>

        {/* Icon */}

<div
  className="
    flex
    h-10
    w-10
    shrink-0
    items-center
    justify-center

    -translate-x-12
    translate-y-0

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
{/* ===================================== */}
    {/* INVISIBLE SPACER */}
    {/* ===================================== */}

    <div className="h-[2px]" />

      {/* Divider */}

      <div
        className="
          relative
          left-4

          mt-5
          h-px
          w-[92%]

          bg-white/[0.06]
        "
      />

    </div>
{/* ===================================== */}
    {/* INVISIBLE SPACER */}
    {/* ===================================== */}

    <div className="h-[6px]" />
{/* ===================================== */}
{/* NATIVE P&L */}
{/* ===================================== */}

<div className="mt-10 flex justify-center">

  <div className="w-[90%]">

    <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
      Native P&amp;L By Currency
    </div>

    

    {/* ===================================== */}
    {/* COLUMN HEADERS */}
    {/* ===================================== */}

    <div className="flex items-center">

      {/* Currency */}
      <div className="w-[150px] shrink-0 translate-x-4">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Currency
        </span>
      </div>

      {/* P&L */}
      <div className="w-[100px] shrink-0 -translate-x-2 text-right">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          P&amp;L
        </span>
      </div>

      {/* % */}
      <div className="ml-auto w-[140px] shrink-0 -translate-x-4  text-right">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          %
        </span>
      </div>

    </div>


    <div
      className="
        mt-2
        rounded-[8px]
        border
        border-white/[0.10]
        bg-white/[0.02]
        px-7
        py-5
      "
    >

      <div className="space-y-2">

        <div className="h-[4px]" />

        {nativePnLRows.map((item, index) => {

          const info =
            CURRENCY_INFO[
              item.currency as keyof typeof CURRENCY_INFO
            ];

            const isPlaceholder =
  item.currency === "";

          return (
            <div key={`${item.currency}-${index}`}>

              {index > 0 && (
                <>
                  <div className="h-[2px]" />
                  <div className="h-px bg-white/[0.06]" />
                  <div className="h-[2px]" />
                </>
              )}

              <div className="flex items-center">

{/* Currency */}

<div className="w-[150px] translate-x-4">

  {isPlaceholder ? (

    <>
      <div className="text-[12px] text-slate-600">
        —
      </div>

      <div className="mt-1 text-[11px] text-slate-700">
        —
      </div>
    </>

  ) : (

    <>
      <div className="text-[12px] font-medium text-slate-200">
        <div className="flex items-center gap-2">

  <CurrencyFlag
  currency={item.currency}
/>

  <span>{item.currency}</span>

</div>
      </div>

      <div className="mt-1 text-[11px] text-slate-500">
        {info?.name}
      </div>
    </>

  )}

</div>

{/* P&L */}

<div className="w-[100px] translate-x-2 text-right">

  {isPlaceholder ? (

    <span className="text-[12px] text-slate-600">
      —
    </span>

  ) : (

    <span
      className={`text-[12px] font-semibold ${
        item.pnl >= 0
          ? "text-emerald-400"
          : "text-rose-400"
      }`}
    >
      {item.pnl >= 0 ? "+" : "-"}
      {info?.symbol}
      {Math.abs(item.pnl).toFixed(2)}
    </span>

  )}

</div>

{/* Percentage */}

<div className="ml-auto w-[140px] translate-x-0 text-right">

  {isPlaceholder ? (

    <span className="text-[12px] text-slate-600">
      —
    </span>

  ) : (

    <span className="text-[12px] font-medium text-slate-400">
      {item.percentage}%
    </span>

  )}

</div>

              </div>

            </div>
          );
        })}

      </div>

    </div>

  </div>

</div>
<div className="h-[12px]" />
{/* ===================================== */}
{/* COMMISSIONS */}
{/* ===================================== */}

<div className="mt-10 flex justify-center">

  <div className="w-[90%]">

    <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
      Commissions By Currency
    </div>

    {/* ===================================== */}
    {/* COLUMN HEADERS */}
    {/* ===================================== */}

    <div className="flex items-center">

      {/* Currency */}

      <div className="w-[150px] shrink-0 translate-x-4">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Currency
        </span>
      </div>

      {/* Commission */}

      <div className="w-[100px] shrink-0 translate-x-6 text-right">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Commission
        </span>
      </div>

      {/* % */}

      <div className="ml-auto w-[140px] shrink-0 -translate-x-4 text-right">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          %
        </span>
      </div>

    </div>

    <div
      className="
        mt-2
        rounded-[8px]
        border
        border-white/[0.10]
        bg-white/[0.02]
        px-7
        py-5
      "
    >

      <div className="space-y-2">

        <div className="h-[4px]" />

        {commissionRows.map((item, index) => {

          const isPlaceholder =
            item.currency === "";

          const info =
            !isPlaceholder
              ? CURRENCY_INFO[
                  item.currency as keyof typeof CURRENCY_INFO
                ]
              : null;

          return (
            <div key={`${item.currency}-${index}`}>

              {index > 0 && (
                <>
                  <div className="h-[2px]" />
                  <div className="h-px bg-white/[0.06]" />
                  <div className="h-[2px]" />
                </>
              )}

              <div className="flex items-center">

                {/* Currency */}

                <div className="w-[150px] shrink-0 translate-x-4">

                  {isPlaceholder ? (

                    <>
                      <div className="text-[12px] text-slate-600">
                        —
                      </div>

                      <div className="mt-1 text-[11px] text-slate-700">
                        —
                      </div>
                    </>

                  ) : (

                    <>
                      <div className="text-[12px] font-medium text-slate-200">
                        <div className="flex items-center gap-2">

  <CurrencyFlag
    currency={item.currency}
  />

  <span>
    {item.currency}
  </span>

</div>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        {info?.name}
                      </div>
                    </>

                  )}

                </div>

                {/* Commission */}

                <div className="w-[100px] shrink-0 translate-x-2 text-right">

                  {isPlaceholder ? (

                    <span className="text-[12px] text-slate-600">
                      —
                    </span>

                  ) : (

                    <span className="text-[12px] font-semibold text-slate-300">
                      {info?.symbol}
                      {item.commission.toFixed(2)}
                    </span>

                  )}

                </div>

                {/* Percentage */}

                <div className="ml-auto w-[140px] shrink-0 translate-x-0 text-right">

                  {isPlaceholder ? (

                    <span className="text-[12px] text-slate-600">
                      —
                    </span>

                  ) : (

                    <span className="text-[12px] font-medium text-slate-400">
                      {item.percentage}%
                    </span>

                  )}

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  </div>

</div>

<div className="h-[12px]" />

{/* ===================================== */}
{/* CURRENCIES TRADED */}
{/* ===================================== */}

<div className="mt-10 flex justify-center">

  <div className="w-[90%]">

    <div
      className="
        mb-4
        text-[11px]
        font-medium
        uppercase
        tracking-[0.12em]
        text-slate-400
      "
    >
      Currencies Traded
    </div>

    <div className="h-[4px]" />

    <div className="flex flex-wrap gap-3">

      {analytics.currenciesTraded.map((currency) => {

        const info =
          CURRENCY_INFO[
            currency as keyof typeof CURRENCY_INFO
          ];

        return (
          <div
            key={currency}
            className="
              flex
              h-[30px]
              w-[70px]
              items-center
              justify-center

              rounded-[8px]
              border
              border-white/[0.08]
              bg-white/[0.02]

              text-[12px]
              font-medium
              text-slate-300

              transition-all
              duration-200

              hover:border-cyan-500/20
              hover:bg-white/[0.04]
              hover:-translate-y-[1px]
            "
          >
            <div className="flex items-center gap-2">

  <CurrencyFlag
    currency={currency}
  />

  <span>
    {currency}
  </span>

</div>
          </div>
        );
      })}

    </div>

    <div className="h-[6px]" />

    {/* Divider */}

    <div className="mt-6 h-px bg-white/[0.06]" />

  </div>

</div>
<div className="h-[12px]" />
{/* ===================================== */}
{/* REPORTING CONFIG */}
{/* ===================================== */}

<div className="mt-10 flex justify-center">

  <div className="w-[90%]">

    <div
      className="
        mb-4
        text-[11px]
        font-medium
        uppercase
        tracking-[0.12em]
        text-slate-400
      "
    >
      Reporting Configuration
    </div>
<div className="h-[8px]" />
    <div
      className="
        mt-2
        rounded-[8px]
        border
        border-white/[0.10]
        bg-white/[0.02]
        px-7
        py-5
      "
    >

      <div className="space-y-2">

        

        {/* Reporting Currency */}

        <div className="flex items-center justify-between">

          {/* Left */}

          <div className="flex items-center gap-3 translate-x-2">

            <DollarSign
              size={14}
              className="text-slate-500"
            />

            <span className="text-[12px] font-medium text-slate-400">
              Reporting Currency
            </span>

          </div>

          {/* Right */}

          <div className="-translate-x-2 -translate-y-0.5 ">

<EliteSelect
  value={reportingCurrency}
  options={currencyOptions}
  onChange={setReportingCurrency}
  width="w-[85px]"
  height="h-[28px]"
  variant="compact"
  align="center"
  xOffset="translate-x-3"
  yOffset="translate-y-0.5"
  iconOffset="translate-x-0"
  iconYOffset="translate-y-0.5"
/>

          </div>

        </div>

       

        <div className="h-px bg-white/[0.06]" />

{/* FX Conversion */}

<div className="h-[4px]" />

<div className="flex items-center justify-between">

  {/* Left */}

  <div className="flex items-center gap-3 translate-x-2">

    <RefreshCw
      size={14}
      className="text-slate-500"
    />

    <span className="text-[12px] font-medium text-slate-400">
      FX Conversion
    </span>

  </div>

  {/* Right */}

  <div className="flex items-center gap-2 -translate-x-2">

    <span className="text-[12px] font-medium text-emerald-400">
      Enabled
    </span>

    <div
      className="
        h-2
        w-2
        rounded-full
        bg-emerald-400
      "
    />

  </div>

</div>

<div className="h-[4px]" />

<div className="h-px bg-white/[0.06]" />

<div className="h-[4px]" />

{/* Conversion Method */}

<div className="flex items-center justify-between">

  {/* Left */}

  <div className="flex items-center gap-3 translate-x-2">

    <TrendingUp
      size={14}
      className="text-slate-500"
    />

    <span className="text-[12px] font-medium text-slate-400">
      Conversion Method
    </span>

  </div>

  {/* Right */}

  <div className="-translate-x-2">

    <span className="text-[12px] font-medium text-slate-200">
      Daily Reference
    </span>

  </div>

</div>

<div className="h-[4px]" />

<div className="h-px bg-white/[0.06]" />

{/* FX Source */}

<div className="h-[4px]" />

<div className="flex items-center justify-between">

{/* Left */}

<div className="flex items-center gap-3 translate-x-2">

  <Globe
    size={14}
    className="text-slate-500"
  />

  <span className="text-[12px] font-medium text-slate-400">
    Exchange Rate Source
  </span>

</div>

{/* Right */}

<div className="-translate-x-2">

  <span className="text-[12px] font-medium text-slate-200">
    European Central Bank
  </span>

</div>

</div>

<div className="h-[4px]" />

<div className="h-px bg-white/[0.06]" />

{/* Last Updated */}

<div className="h-[4px]" />

<div className="flex items-center justify-between">

  {/* Left */}

  <div className="flex items-center gap-3 translate-x-2">

    <Calendar
      size={14}
      className="text-slate-500"
    />

    <span className="text-[12px] font-medium text-slate-400">
      Last Updated
    </span>

  </div>

  {/* Right */}

  <div className="-translate-x-2">

    <span className="text-[12px] font-medium text-slate-200">
      {todayDate}
    </span>

  </div>

</div>

<div className="h-[4px]" />

</div>

</div>

<div className="h-[12px]" />

<div
  className="
    rounded-[8px]
    border
    border-blue-500/[0.12]
    bg-blue-500/[0.02]
    px-5
    py-4
  "
>

  <div className="flex items-start gap-3">

   <div
  className="
    flex
    h-7
    w-7
    shrink-0
    items-center
    justify-center
translate-x-[8px]
    translate-y-[10px]
    rounded-full

    border
    border-blue-500/20

    bg-blue-500/10
  "
>

<BookOpen
  size={15}
  className="
    shrink-0
    text-blue-400

    translate-x-[0px]
    translate-y-[1px]
  "
/>

</div>

    <p
      className="
        text-[12px]
        leading-6
        text-slate-400
        translate-x-[8px]
    translate-y-[1px]
      "
    >
      Dashboard metrics are
      displayed using the selected reporting currency
      and live FX rates.
    </p>

  </div>

</div>

</div>

</div>

</div>

);
}