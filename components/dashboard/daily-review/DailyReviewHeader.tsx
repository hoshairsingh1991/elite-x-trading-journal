"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Clock3,
  X,
} from "lucide-react";

import {
  DailyReviewHeaderProps,
} from "./dailyReviewTypes";

function parseDateTime(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

export default function DailyReviewHeader({
  selectedDay,
  currentMonth,
  monthName,
  currentYear,
  selectedTrades,
  accountOptions,
  selectedAccount,
  onAccountChange,
  onClose,
}: DailyReviewHeaderProps) {

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const accountMenuRef =
  useRef<HTMLDivElement | null>(
    null
  );

const accountLabel =
  selectedAccount === "ALL"
    ? "All Accounts"
    : selectedAccount;

    const hasTradingDay =
  selectedTrades.length > 0;

useEffect(() => {
  if (!accountMenuOpen) {
    return;
  }

  const handlePointerDown = (
    event: PointerEvent
  ) => {

    const target =
      event.target as Node;

    if (
      accountMenuRef.current &&
      !accountMenuRef.current.contains(
        target
      )
    ) {
      setAccountMenuOpen(
        false
      );
    }
  };

  document.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  return () => {
    document.removeEventListener(
      "pointerdown",
      handlePointerDown
    );
  };
}, [accountMenuOpen]);

const tradingStart =
    selectedTrades.reduce(
      (
        earliest,
        trade
      ) => {

        const candidate =
          parseDateTime(
            trade.openedAt
          );

        if (!candidate) {
          return earliest;
        }

        if (!earliest) {
          return candidate;
        }

        return candidate < earliest
          ? candidate
          : earliest;
      },
      null as Date | null
    );

  const tradingEnd =
    selectedTrades.reduce(
      (
        latest,
        trade
      ) => {

        const candidate =
          parseDateTime(
            trade.closedAt
          );

        if (!candidate) {
          return latest;
        }

        if (!latest) {
          return candidate;
        }

        return candidate > latest
          ? candidate
          : latest;
      },
      null as Date | null
    );

  const date =
    new Date(
      currentYear,
      currentMonth,
      selectedDay
    );

  const weekday =
    date.toLocaleDateString(
      undefined,
      {
        weekday: "long",
      }
    );

  const sessionStart =
    tradingStart
      ? tradingStart.toLocaleTimeString(
          undefined,
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "—";

  const sessionEnd =
    tradingEnd
      ? tradingEnd.toLocaleTimeString(
          undefined,
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "—";

  return (
    <header
      className="
        @container
        flex
        min-h-[76px]
        w-full
        min-w-0
        items-center
        justify-between
        gap-6
      "
    >

      {/* ================================================= */}
      {/* LEFT SIDE */}
      {/* ================================================= */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-3
        "
      >

        {/* BACK */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="Close daily review"
        >
          <ChevronLeft size={16} />
        </button>

        {/* CALENDAR */}

        <button
          type="button"
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="Calendar"
        >
          <CalendarDays size={16} />
        </button>

        {/* DATE */}

        <div
          className="
            shrink-0
            whitespace-nowrap
          "
        >
          <h1
            className="
              whitespace-nowrap
              text-[20px]
              font-black
              tracking-tight
              text-slate-100
            "
          >
            {monthName} {selectedDay}, {currentYear}
          </h1>

          <p
            className="
              mt-0.5
              whitespace-nowrap
              text-[11px]
              font-medium
              text-slate-500
            "
          >
            {weekday}
          </p>
        </div>

      </div>

      {/* ================================================= */}
      {/* RIGHT SIDE */}
      {/* ================================================= */}

      <div
        className="
          flex
          min-w-0
          shrink
          items-center
          justify-end
          gap-2
        "
      >

{/* TRADING DAY */}

<div
  className={`
    hidden
    h-[34px]
    ${
      hasTradingDay
        ? "w-[108px]"
        : "w-[120px]"
    }
    shrink-0
    items-center
    justify-center
    gap-2
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    @[900px]:flex
  `}
>

  {hasTradingDay ? (
    <>
      <span
        className="
          h-[6px]
          w-[6px]
          shrink-0
          rounded-full
          bg-emerald-400
        "
      />

      <span
        className="
          whitespace-nowrap
          text-[12px]
          font-semibold
          text-emerald-400
        "
      >
        Trading Day
      </span>
    </>
  ) : (
    <>
      <CircleOff
        size={12}
        className="
          shrink-0
          text-slate-500
        "
      />

      <span
        className="
          whitespace-nowrap
          text-[12px]
          font-semibold
          text-slate-500
        "
      >
        No Trading Day
      </span>
    </>
  )}

</div>

        {/* SESSION */}

        <div
          className="
            hidden
            h-[34px]
            w-[148px]
            shrink-0
            items-center
            justify-center
            gap-1.5
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            @[820px]:flex
          "
        >
          <Clock3
            size={12}
            className="
              shrink-0
              text-slate-500
            "
          />

          <span
            className="
              whitespace-nowrap
              text-[12px]
              font-semibold
              text-slate-400
            "
          >
            {sessionStart} – {sessionEnd}
          </span>
        </div>

{/* ACCOUNT */}

<div
  ref={accountMenuRef}
  className="relative hidden shrink-0 @[760px]:block"
>

  <button
    type="button"
    onClick={() =>
      setAccountMenuOpen(
        (open) => !open
      )
    }
    aria-haspopup="menu"
    aria-expanded={
      accountMenuOpen
    }
    className="
      flex
      h-[34px]
      w-[100px]
      shrink-0
      items-center
      justify-center
      gap-1
      rounded-[8px]
      border
      border-white/[0.06]
      bg-[#0b1220]
      px-2
      text-[12px]
      font-semibold
      text-slate-300
      outline-none
      transition-all
      hover:border-white/[0.12]
      hover:text-slate-200
      focus:border-blue-500/40
    "
  >

    <span
      className="
        min-w-0
        overflow-hidden
        text-ellipsis
        whitespace-nowrap
      "
    >
      {accountLabel}
    </span>

    <ChevronRight
      size={12}
      className={`
        shrink-0
        transition-transform
        ${
          accountMenuOpen
            ? "rotate-[270deg]"
            : "rotate-90"
        }
      `}
    />

  </button>

  {accountMenuOpen && (
    <div
      className="
        absolute
        -right-1
        top-[38px]
        z-50
        max-h-[240px]
        w-[110px]
        overflow-y-auto
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        p-1
        shadow-[0_12px_30px_rgba(0,0,0,0.45)]
      "
      role="menu"
    >

      {/* ALL ACCOUNTS */}

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onAccountChange(
            "ALL"
          );

          setAccountMenuOpen(
            false
          );
        }}
className={`
  flex
  w-full
  items-center
  justify-center
  rounded-[6px]
  px-0
  py-2
  text-center
  text-[13px]
  font-semibold
  transition-all
  ${
    selectedAccount ===
    "ALL"
      ? "bg-white/[0.04] text-white"
      : "text-white hover:bg-white/[0.04]"
  }
`}
      >
        All Accounts
      </button>

      {/* ACCOUNTS */}

      {accountOptions.map(
        (account) => (
<button
  key={account}
  type="button"
  role="menuitem"
  onClick={() => {
    onAccountChange(
      account
    );

    setAccountMenuOpen(
      false
    );
  }}
className={`
  flex
  w-full
  items-center
  justify-center
  rounded-[6px]
  px-0
  py-2
  text-center
  text-[13px]
  font-semibold
  transition-all
  ${
    selectedAccount ===
    account
      ? "bg-white/[0.04] text-cyan-300"
      : "text-cyan-300 hover:bg-white/[0.04] hover:text-cyan-200"
  }
`}
>
  {account}
</button>
        )
      )}

    </div>
  )}

</div>

        {/* REPLAY */}

        <button
          type="button"
          className="
            hidden
            h-[34px]
            w-[90px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-[12px]
            font-semibold
            text-violet-300
            transition-all
            hover:border-violet-500/20
            hover:bg-[#0d1426]
          "
          aria-label="Replay day"
        >
          <span
            className="
              whitespace-nowrap
            "
          >
            Replay Day
          </span>
        </button>

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="Close"
        >
          <X size={16} />
        </button>

      </div>

    </header>
  );
}