"use client";

import {
  X,
} from "lucide-react";

import {
  DailyReviewHeaderProps,
} from "./dailyReviewTypes";

export default function DailyReviewHeader({
  selectedDay,
  monthName,
  currentYear,
  onClose,
}: DailyReviewHeaderProps) {
  return (
    <div className="flex items-start justify-between">

      <div>

        <h2
          className="
            text-[24px]
            font-black
            tracking-tight
            text-slate-400
          "
        >
          {monthName}{" "}
          {selectedDay},{" "}
          {currentYear}
        </h2>

        <p
          className="
            mt-2
            text-[12px]
            text-slate-400
          "
        >
          Institutional Trade Review
        </p>

      </div>

      <button
        onClick={onClose}
        className="
          flex
          h-[40px]
          w-[40px]
          translate-y-2
          items-center
          justify-center
          rounded-[14px]
          border
          border-white/[0.05]
          bg-white/[0.03]
          text-slate-400
          transition-all
          hover:text-slate-300
        "
      >
        <X size={20} />
      </button>

    </div>
  );
}