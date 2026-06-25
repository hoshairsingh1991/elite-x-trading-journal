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

    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/70 bg-[#071427] font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]">
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
        <div className="absolute right-0 top-16 z-50 w-[500px] min-h-[818px] max-h-[80vh] overflow-y-auto rounded-[36px] border border-white/10 bg-[#071427] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.85)]">

          <div className="overflow-hidden rounded-[40px] border border-blue-500/0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_35%),linear-gradient(180deg,#0b1e3b_0%,#071427_100%)] ">

            <div className="px-8 pt-8 pb-10 flex min-h-[200px] flex-col justify-center gap-6">

 


<div className="flex items-center gap-12 pl-8">

                <div className="translate-x-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-violet-400/30 bg-violet-500/20 text-3xl font-black text-violet-300">
                  {initial}
                </div>


                <div>
                  <h2 className="text-[26px] font-black text-white">
                    {displayName}
                  </h2>

                  <p className="mt-1 text-slate-400">{email}</p>

                   {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />

                  <div className="mt-4 inline-flex w-[130px] h-8 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-300">
                   <Crown
                     size={15}
                     style={{ position: "relative", left: "4px" }}
                      />
                      Elite Trader
                    </div>
                </div>
              </div>



         <div className="flex justify-center">


  <div
  className="
    w-[95%]
    min-h-[90px]
    overflow-hidden
    rounded-[22px]
    border border-white/[0.08]
    bg-[#081526]/80
  "
>
 <div className="grid min-h-[90px] grid-cols-3">

    <div className="flex min-h-[90px] flex-col items-center justify-center border-r border-white/[0.08] text-center"> 
      <p className="text-[22px] font-black text-white">
       {menuStats.totalTrades}
      </p>

      <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-slate-500">
        Total Trades
      </p>
    </div>

    <div className="flex min-h-[90px] flex-col items-center justify-center border-r border-white/[0.08] text-center">
      <p className="text-[20px] font-black text-emerald-400">
        {formattedPnL}
      </p>

      <p className="mt-1 text-[15px] uppercase tracking-[0.15em] text-slate-500">
        P&L
      </p>
    </div>

    <div className="flex min-h-[90px] flex-col items-center justify-center py-5 text-center">
      <p className="text-[22px] font-black text-white">
        {menuStats.tradingDays}
      </p>

      <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-slate-500">
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


<div className="h-[12px]" />

<div className="mt-4 flex justify-center">

  <div className="w-[95%] min-h-[90px] rounded-[24px] border border-white/10 bg-white/[0.03] flex flex-col justify-center">

    <div className="px-6 pt-5 pb-4">

            {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />

      <div className="grid grid-cols-[1fr_auto] items-center">

        <div className="relative left-8 flex items-center gap-3">

            

          <Crown
            className="text-amber-400"
            size={18}
          />


          <span className="text-[19px] font-semibold text-white">
            Elite Plan
          </span>

        </div>

        <div className="relative right-60 rounded-full bg-emerald-500/15 px-5 py-2 text-[15px] font-semibold text-emerald-400">
  Active
</div>

      </div>

    </div>

       {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />

    <div className="border-t border-white/5" />

    <div className="px-6 py-5">

               {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[6px]" />

      <div className="relative left-8 flex items-center gap-4">

        <div className="h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(34,197,94,0.8)]" />

        <p className="text-[16px] font-medium text-white">
          All systems operational
        </p>


      </div>

       {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />

    </div>

  </div>

</div>


  {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

          <div className="mt-4 flex justify-center">

  <button
    onClick={comingSoon}
    className="flex w-[95%] min-h-[90px] items-center justify-between rounded-[24px] border border-violet-500/20 bg-gradient-to-r from-violet-600/20 to-blue-600/10 p-6 text-left"
  >
    <div className="relative left-2 flex items-center gap-4">

      <div className="rounded-2xl bg-violet-500/20 p-5">
        <Zap className="text-violet-300" />
      </div>

      <div>
        <p className="font-bold text-white">
          Unlock Advanced Analytics
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Upgrade to Elite Pro for deeper insights
        </p>
      </div>

    </div>

    <ChevronRight className="text-slate-500" />

  </button>

</div>

  {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

<div className="mt-6 flex justify-center">

  <div className="w-[95%] rounded-[24px] border border-white/10 bg-white/[0.03] pb-8">
  
  
   {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      icon={<User size={22} />}
      title="My Profile"
      subtitle="Manage profile information"
      onClick={() => window.location.href="/profile"}
    />

     {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      icon={<Settings size={22} />}
      title="Account Settings"
      subtitle="Preferences and configuration"
      onClick={() => window.location.href="/settings"}
    />
 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />
    <Row
      icon={<ShieldCheck size={22} />}
      title="Security"
      subtitle="Password and account protection"
      onClick={comingSoon}
    />
 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />
    <Row
      icon={<CreditCard size={22} />}
      title="Billing & Subscription"
      subtitle="Manage plan and invoices"
      onClick={comingSoon}
    />

 {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />

    <Row
      icon={<HelpCircle size={22} />}
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
      icon={<LogOut size={22} />}
      title="Sign Out"
      subtitle="Sign out of your account"
      onClick={handleSignOut}
    />


  </div>

</div>

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
                ? "text-[17px] font-semibold text-red-400"
                : "text-[17px] font-semibold text-white"
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