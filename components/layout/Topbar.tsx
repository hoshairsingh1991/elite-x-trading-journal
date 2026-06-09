"use client";

import UserMenuV2
from "@/components/layout/UserMenuV2";

export default function Topbar() {

  return (

    <header
      className="
        flex
        h-[62px]
        items-center
        justify-end
        rounded-[28px]
        border
        border-white/[0.04]
        bg-[#07101a]
        px-7
        shadow-[0_0_30px_rgba(0,0,0,0.22)]
      "
    >

<UserMenuV2
  totalTrades={0}
  totalPnL={0}
  tradingDays={0}
/>

    </header>
  );
}