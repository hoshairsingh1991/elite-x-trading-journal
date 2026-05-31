"use client";

import {
useEffect,
useRef,
useState,
} from "react";

import {
User,
Settings,
LogOut,
ChevronRight,
CreditCard,
HelpCircle,
BarChart3,
Crown,
ShieldCheck,
PlugZap,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
loadProfile,
} from "@/lib/storage/profileStorage";

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

    const isPositivePnL =
  totalPnL >= 0;

const formattedPnL =
  `${isPositivePnL ? "+" : ""}$${Math.abs(
    totalPnL
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const [
isOpen,
setIsOpen,
] = useState(false);

const [
displayName,
setDisplayName,
] = useState(
"Elite X User"
);

const [
email,
setEmail,
] = useState("");

const dropdownRef =
useRef<HTMLDivElement>(null);

useEffect(() => {


async function loadUser() {

  const {
    data,
  } =
    await supabase.auth.getUser();

  const user =
    data.user;

  if (
    user?.email
  ) {

    setEmail(
      user.email
    );
  }

  const profile =
    await loadProfile();

  if (
    profile
  ) {

    setDisplayName(
      profile.display_name
    );
  }
}

loadUser();


}, []);

useEffect(() => {


function handleClickOutside(
  event: MouseEvent
) {

  if (
    dropdownRef.current &&
    !dropdownRef.current.contains(
      event.target as Node
    )
  ) {

    setIsOpen(false);
  }
}

document.addEventListener(
  "mousedown",
  handleClickOutside
);

return () => {

  document.removeEventListener(
    "mousedown",
    handleClickOutside
  );
};


}, []);

async function handleSignOut() {


await supabase.auth.signOut();

window.location.href =
  "/login";


}

const initial =
email.charAt(0).toUpperCase();

function comingSoon() {


alert(
  "Coming Soon"
);


}

return (


<div
  ref={dropdownRef}
  className="relative left-3"
>

  <button
    onClick={() =>
      setIsOpen(
        !isOpen
      )
    }
    className="
      relative right-3
      flex items-center justify-center
      rounded-full
      border border-white/[0.08]
      bg-[#071427]
      p-1
      transition-all
      hover:border-blue-500/30
    "
  >

    <div
      className="
        flex h-10 w-10
        items-center justify-center
        rounded-full
        bg-blue-500/20
        text-sm font-bold
        text-blue-400
      "
    >
      {initial}
    </div>

  </button>

  {isOpen && (

    <div
      className="
        absolute right-0 top-16
        z-50
        w-[420px]
        overflow-hidden
        rounded-[28px]
        border border-white/[0.08]
        bg-[#071427]
        shadow-[0_30px_80px_rgba(0,0,0,0.65)]
        backdrop-blur-xl
      "
    >

      <div className="p-6">

        {/* HEADER */}

        <div
          className="
            rounded-[24px]
            border border-white/[0.06]
            bg-[linear-gradient(180deg,rgba(17,24,39,0.65)_0%,rgba(9,24,45,0.55)_100%)]
            p-6
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                flex h-16 w-16
                items-center justify-center
                rounded-full
                bg-blue-500/20
                text-xl font-black
                text-blue-400
              "
            >
              {initial}
            </div>

            <div>

              <h3 className="text-[18px] font-black text-slate-200">
                {displayName}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {email}
              </p>

              <div
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border border-blue-500/20
                  bg-blue-500/10
                  px-3 py-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-blue-300
                "
              >
                <Crown size={12} />
                Elite Trader
              </div>

            </div>

          </div>

        </div>

        {/* STATS */}

        <div
          className="
            mt-5
            grid grid-cols-3
            gap-3
          "
        >

         {[
  {
    value: totalTrades,
    label: "Trades",
  },
  {
    value: formattedPnL,
    label: "PnL",
  },
  {
    value: tradingDays,
    label: "Days",
  },
].map(
            (item) => (

              <div
                key={item.label}
                className="
                  rounded-[18px]
                  border border-white/[0.06]
                  bg-white/[0.03]
                  p-4
                  text-center
                "
              >

                <p className="text-[20px] font-black text-slate-200">
                  {item.value}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>

              </div>
            )
          )}

        </div>

        {/* ELITE PLAN */}

        <div
          className="
            mt-5
            rounded-[20px]
            border border-amber-500/20
            bg-amber-500/10
            p-5
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-bold text-slate-200">
                Elite Plan
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Active
              </p>

            </div>

            <Crown className="text-amber-400" />

          </div>

        </div>

        {/* SYSTEM STATUS */}

        <div
          className="
            mt-4
            rounded-[20px]
            border border-emerald-500/20
            bg-emerald-500/10
            p-5
          "
        >

          <div className="flex items-center gap-3">

            <ShieldCheck
              size={18}
              className="text-emerald-400"
            />

            <div>

              <p className="text-sm font-bold text-slate-200">
                System Status
              </p>

              <p className="text-xs text-slate-400">
                All systems operational
              </p>

            </div>

          </div>

        </div>

        {/* ANALYTICS */}

        <button
          onClick={comingSoon}
          className="
            mt-4
            w-full
            rounded-[20px]
            border border-blue-500/20
            bg-blue-500/10
            p-5
            text-left
            transition-all
            hover:bg-blue-500/15
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="font-bold text-slate-200">
                Unlock Advanced Analytics
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Deeper insights coming soon
              </p>

            </div>

            <BarChart3
              className="text-blue-400"
            />

          </div>

        </button>

        {/* NAVIGATION */}

        <div className="mt-5 space-y-2">

          <MenuItem
            icon={<User size={18} />}
            title="My Profile"
            subtitle="Manage profile information"
            onClick={() => {
              setIsOpen(false);
              window.location.href = "/profile";
            }}
          />

          <MenuItem
            icon={<Settings size={18} />}
            title="Account Settings"
            subtitle="Preferences and configuration"
            onClick={() => {
              setIsOpen(false);
              window.location.href = "/settings";
            }}
          />

          <MenuItem
            icon={<PlugZap size={18} />}
            title="Broker Connections"
            subtitle="Manage connected brokers"
            onClick={comingSoon}
          />

          <MenuItem
            icon={<CreditCard size={18} />}
            title="Billing & Subscription"
            subtitle="Manage plan and invoices"
            onClick={comingSoon}
          />

          <MenuItem
            icon={<HelpCircle size={18} />}
            title="Help & Support"
            subtitle="Documentation and assistance"
            onClick={comingSoon}
          />

        </div>

        {/* SIGN OUT */}

        <button
          onClick={handleSignOut}
          className="
            mt-5
            flex w-full items-center
            justify-center
            gap-3
            rounded-[18px]
            border border-red-500/20
            bg-red-500/10
            px-5 py-4
            font-semibold
            text-red-400
            transition-all
            hover:bg-red-500/15
          "
        >

          <LogOut size={18} />

          Sign Out

        </button>

      </div>

    </div>

  )}

</div>


);
}

function MenuItem({
icon,
title,
subtitle,
onClick,
}: {
icon: React.ReactNode;
title: string;
subtitle: string;
onClick: () => void;
}) {

return (

<button
  onClick={onClick}
  className="
    flex w-full items-center
    justify-between
    rounded-[18px]
    border border-white/[0.04]
    bg-white/[0.02]
    px-4 py-4
    text-left
    transition-all
    hover:border-white/[0.08]
    hover:bg-white/[0.04]
  "
>

  <div className="flex items-center gap-4">

    <div className="text-slate-400">
      {icon}
    </div>

    <div>

      <p className="font-semibold text-slate-200">
        {title}
      </p>

      <p className="text-xs text-slate-500">
        {subtitle}
      </p>

    </div>

  </div>

  <ChevronRight
    size={16}
    className="text-slate-500"
  />

</button>


);
}
