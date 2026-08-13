"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SHOWCASE_ITEMS = [
  {
    id: "dashboard",
    num: "01",
    title: "Overview",
    image: "/images/showcase/dashboard-approved.webp",
  },
  {
    id: "trades",
    num: "02",
    title: "Trade History",
    image: "/images/showcase/trade-history.webp",
  },
  {
    id: "expenses",
    num: "03",
    title: "Expenses",
    image: "/images/showcase/expenses.webp",
  },
];

export default function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (current + 1) % SHOWCASE_ITEMS.length,
      );
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * Fixed visual positions.
   * Only the screenshots assigned to these positions change.
   */
  const front =
    SHOWCASE_ITEMS[activeIndex];

  const middle =
    SHOWCASE_ITEMS[
      (activeIndex + 1) % SHOWCASE_ITEMS.length
    ];

  const back =
    SHOWCASE_ITEMS[
      (activeIndex + 2) % SHOWCASE_ITEMS.length
    ];

  return (
    <section
      id="showcase"
      className="relative w-full"
      aria-label="Elite X Product Showcase"
    >
      <div className="w-full">
        {/* ===================================================== */}
        {/* FIXED PRODUCT DECK                                   */}
        {/* ===================================================== */}

        <div
          className="
            relative
            h-[520px]
            w-full
            overflow-visible
          "
        >
          {/* ================================================= */}
          {/* BACK                                              */}
          {/* ================================================= */}

          <div
            className="
              absolute
              left-[25%]
              top-[7%]
              z-10
              h-[85%]
              w-[78%]
              rotate-[1deg]
              overflow-hidden
              rounded-[8px]
              border
              border-white/[0.08]
              bg-[#030814]
              shadow-[0_28px_70px_rgba(2,6,23,0.55)]
              transition-opacity
              duration-700
            "
          >
<Image
  src={back.image}
  alt={`Elite X ${back.title}`}
  fill
  quality={100}
  sizes="(max-width: 1024px) 100vw, 70vw"
  className="
    scale-[1.18]
    translate-x-[-50px]
    translate-y-[0px]
    object-contain
    object-center
  "
/>
          </div>

          {/* ================================================= */}
          {/* MIDDLE                                            */}
          {/* ================================================= */}

          <div
            className="
              absolute
              left-[-18%]
              top-[5%]
              z-20
              h-[88%]
              w-[90%]
              rotate-[1deg]
              overflow-hidden
              rounded-[8px]
              border
              border-white/[0.09]
              bg-[#030814]
              shadow-[0_28px_70px_rgba(2,6,23,0.55)]
              transition-opacity
              duration-700
            "
          >
<Image
  src={middle.image}
  alt={`Elite X ${middle.title}`}
  fill
  quality={100}
  sizes="(max-width: 1024px) 100vw, 70vw"
  className="
    scale-[1.18]
    translate-x-[-50px]
    translate-y-[0px]
    object-contain
    object-center
  "
/>
          </div>

          {/* ================================================= */}
          {/* FRONT                                             */}
          {/* ================================================= */}

          <div
            className="
              absolute
              left-[-300px]
              top-[20px]
              z-30
              h-[88%]
              w-[78%]
              rotate-[1deg]
              overflow-hidden
              rounded-[8px]
              border
border-blue-400/50
bg-[#030814]
shadow-[0_0_14px_rgba(79,140,255,0.22),0_28px_70px_rgba(2,6,23,0.55)]
              transition-opacity
              duration-700
            "
          >
<Image
  src={front.image}
  alt={`Elite X ${front.title}`}
  fill
  priority
  quality={100}
  sizes="(max-width: 1024px) 100vw, 70vw"
  className="
    scale-[1.30]
    translate-x-[-18px]
    translate-y-[0px]
    object-contain
    object-center
  "
/>
          </div>
        </div>

        {/* ===================================================== */}
        {/* SLIDE INDICATORS                                     */}
        {/* ===================================================== */}

<div
  className="
    relative
    left-[-400px]
    top-[-20px]
    z-40
    mt-3
    flex
    items-center
    justify-center
    gap-1.5
  "
>
          {SHOWCASE_ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${item.title}`}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300
                ${
                  index === activeIndex
                    ? "w-7 bg-[#4F8CFF]"
                    : "w-1.5 bg-slate-700 hover:bg-slate-500"
                }
              `}
            />
          ))}
        </div>


      </div>
    </section>
  );
}