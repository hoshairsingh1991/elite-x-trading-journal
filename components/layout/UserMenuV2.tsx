// ELITE X UserMenuV2 - Ground Up Visual Rebuild
"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Crown,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { loadProfile } from "@/lib/storage/profileStorage";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";



type UserMenuV2Props = {
  totalTrades: number;
  totalPnL: number;
  tradingDays: number;
};

export default function UserMenuV2({
  totalTrades,
  totalPnL,
  tradingDays,
}: UserMenuV2Props) {


  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Elite X User");
  const [email, setEmail] = useState("");

  const [menuStats, setMenuStats] =
  useState({
    totalTrades: 0,
    totalPnL: 0,
    tradingDays: 0,
  });

const [
  reportingCurrency,
  setReportingCurrency,
] = useState("USD");

  const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  async function loadUser() {
    const { data } =
      await supabase.auth.getUser();

    if (data.user?.email) {
      setEmail(
        data.user.email
      );
    }

    const profile =
      await loadProfile();

    if (
      profile?.display_name
    ) {
      setDisplayName(
        profile.display_name
      );
    }

    const storedStats =
      localStorage.getItem(
        "elite-x-menu-stats"
      );

    if (storedStats) {
      setMenuStats(
        JSON.parse(
          storedStats
        )
      );
    }
  }

const storedCurrency =
  localStorage.getItem(
    "reportingCurrency"
  );

if (storedCurrency) {
  setReportingCurrency(
    storedCurrency
  );
}

  loadUser();
}, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const initial = email?.charAt(0)?.toUpperCase() || "E";



const formattedPnL = `${
  menuStats.totalPnL >= 0
    ? "+"
    : "-"
}${getCurrencySymbol(
  reportingCurrency
)}${Math.abs(
  menuStats.totalPnL
).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

  const comingSoon = () => alert("Coming Soon");

  return (
    <div
  ref={dropdownRef}
  className="relative z-[99999]"
>
      <button
  onClick={() => {
  const storedStats =
    localStorage.getItem(
      "elite-x-menu-stats"
    );

  if (storedStats) {
    setMenuStats(
      JSON.parse(
        storedStats
      )
    );
  }

const storedCurrency =
  localStorage.getItem(
    "reportingCurrency"
  );

if (storedCurrency) {
  setReportingCurrency(
    storedCurrency
  );
}

  setIsOpen(!isOpen);
}}
  className="flex items-center gap-3"
>
  <div className="relative">

    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-[#071427] font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]">
  {initial}
</div>

    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#071427] bg-emerald-400" />

  </div>
        <ChevronDown
    size={16}
    className={`text-slate-400 transition-transform ${
      isOpen ? "rotate-180" : ""
    }`}
  />
</button>

{isOpen && (
  <div className="absolute right-0 top-16 z-50 w-[360px] max-h-[80vh] overflow-y-auto rounded-[8px] border border-white/[0.06] bg-[#0f1728] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.85)]">

    <div className="overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#0b0c1e]">

      <div className="flex min-h-[200px] flex-col justify-center gap-6 px-8 pt-8 pb-10">

 


<div className="flex items-center gap-10 pl-6">

  <div
    className="
      translate-x-3
      flex
      h-16
      w-16
      items-center
      justify-center
      rounded-full
      border-[3px]
      border-violet-400/30
      bg-violet-500/20
      text-[30px]
      font-black
      text-violet-300
    "
  >
    {initial}
  </div>

  <div>

    <h2
      className="
        text-[20px]
        font-black
        text-white
      "
    >
      {displayName}
    </h2>

                  <p
  className="
    mt-1
    text-[14px]
    font-medium
    text-slate-400
  "
>
  {email}
</p>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />

                  <div
  className="
    mt-4
    inline-flex

    h-7
    w-[120px]

    items-center
    gap-2

    rounded-[8px]
    border
    border-cyan-400/20
    bg-cyan-400/10

    px-3

    text-[10px]
    font-bold
    uppercase
    tracking-[0.14em]
    text-cyan-300
  "
>
  <Crown
    size={13}
    style={{
      position: "relative",
      left: "2px",
    }}
  />

  Elite Trader
</div>
                </div>
              </div>



<div className="flex justify-center">

<div
  className="
    w-[95%]
    h-[72px]
    -translate-y-[10px]
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
  "
>

    <div className="grid h-[72px] grid-cols-3">

      <div className="flex h-[72px] flex-col items-center justify-center border-r border-white/[0.08] text-center">

        <p className="text-[18px] font-bold text-white">
          {menuStats.totalTrades}
        </p>

        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Total Trades
        </p>

      </div>

      <div className="flex h-[72px] flex-col items-center justify-center border-r border-white/[0.08] text-center">

        <p className="text-[18px] font-bold text-emerald-400">
          {formattedPnL}
        </p>

        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
          P&L
        </p>

      </div>

      <div className="flex h-[72px] flex-col items-center justify-center text-center">

        <p className="text-[18px] font-bold text-white">
          {menuStats.tradingDays}
        </p>

        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Trading Days
        </p>

      </div>

    </div>
     </div>

  </div>

</div>


  {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[0px]" />

<div className="mt-6 flex justify-center">

  <div className="w-[95%] rounded-[8px] border border-white/[0.06] bg-[#0b1220] mb-4">
  
  
   {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      icon={<User size={18} />}
      title="My Profile"
      subtitle="Manage profile information"
      onClick={() => window.location.href="/profile"}
    />

     {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      icon={<Settings size={18} />}
      title="Account Settings"
      subtitle="Preferences and configuration"
      onClick={() => window.location.href="/settings"}
    />
 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />
    <Row
      icon={<ShieldCheck size={18} />}
      title="Security"
      subtitle="Password and account protection"
      onClick={comingSoon}
    />
 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />
    <Row
      icon={<CreditCard size={18} />}
      title="Billing & Subscription"
      subtitle="Manage plan and invoices"
      onClick={comingSoon}
    />

 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      icon={<HelpCircle size={18} />}
      title="Help & Support"
      subtitle="Documentation and assistance"
      onClick={comingSoon}
    />

     {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      danger
      icon={<LogOut size={18} />}
      title="Sign Out"
      subtitle="Sign out of your account"
      onClick={handleSignOut}
    />


  </div>

</div>
<div className="h-4" />
        </div>
      </div>
    )}
  </div>
);
}


function Row({
  icon,
  title,
  subtitle,
  onClick,
  danger,
}: any) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        justify-between
        border-b
        border-white/5
        px-7
        py-6
        text-left
        transition-all
        duration-200
        hover:bg-white/[0.02]
        last:border-b-0
      "
    >

      <div className="flex items-center gap-5">

        

        <div
          className={
            danger
              ? "flex h-10 w-10 items-center justify-center text-red-400"
              : "flex h-10 w-10 items-center justify-center text-slate-300"
          }
        >
          {icon}
          
        </div>

        <div>

                 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[6px]" />

          <p
            className={
              danger
                ? "text-[14px] font-semibold text-red-400"
                : "text-[14px] font-semibold text-white"
            }
          >
            {title}
          </p>

          {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

         <p className="mt-1 mb-3 text-sm text-slate-500">
  {subtitle}
</p>
{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />

        </div>


      </div>
      

      <ChevronRight
        className="text-slate-500"
        size={18}
      />
    </button>



  );
}