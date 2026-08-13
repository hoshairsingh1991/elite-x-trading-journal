"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { LayoutDashboard, CandlestickChart, Wallet, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface ShowcaseItem {
  id: string;
  num: string;
  title: string;
  imageSrc: string;
  placeholderTitle: string;
  icon: typeof LayoutDashboard;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "dashboard",
    num: "01",
    title: "Overview",
    imageSrc: "/images/showcase/dashboard-approved.webp",
    placeholderTitle: "Elite X Dashboard V2 Screenshot Asset Pending",
    icon: LayoutDashboard,
  },
  {
    id: "trades",
    num: "02",
    title: "Trade History",
    imageSrc: "/images/showcase/trade-history.webp",
    placeholderTitle: "Elite X Trade History Screenshot Asset Pending",
    icon: CandlestickChart,
  },
  {
    id: "expenses",
    num: "03",
    title: "Expenses",
    imageSrc: "/images/showcase/expenses.webp",
    placeholderTitle: "Elite X Expenses Screenshot Asset Pending",
    icon: Wallet,
  },
];

export default function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [resetTimerKey, setResetTimerKey] = useState(0);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Detect user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle automatic rotation (5000ms interval)
  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, nextSlide, resetTimerKey]);

  // Manual tab selection - resets autoplay timer
  const handleSelectTab = (index: number) => {
    setActiveIndex(index);
    setResetTimerKey((prev) => prev + 1);
  };

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === "ArrowRight") {
      newIndex = (index + 1) % SHOWCASE_ITEMS.length;
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      newIndex = (index - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length;
      e.preventDefault();
    } else if (e.key === "Home") {
      newIndex = 0;
      e.preventDefault();
    } else if (e.key === "End") {
      newIndex = SHOWCASE_ITEMS.length - 1;
      e.preventDefault();
    }

    if (newIndex !== index) {
      handleSelectTab(newIndex);
      tabRefs.current[newIndex]?.focus();
    }
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const currentItem = SHOWCASE_ITEMS[activeIndex];

  return (
    <section
      id="showcase"
      className="w-full"
      aria-label="Elite X Product Showcase"
    >
      <div className="w-full">
        {/* Showcase Frame (Screenshot Stage Above Controls) */}
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-blue-500/20 bg-[#07111C] shadow-[0_30px_90px_rgba(2,6,23,0.85)] transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div
            id={`panel-${currentItem.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentItem.id}`}
            className="relative aspect-[16/10] w-full bg-[#030814]"
          >
            {SHOWCASE_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;
              const hasError = imgErrors[item.id];

              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 size-full transition-opacity duration-500 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  } ${prefersReducedMotion ? "transition-none" : ""}`}
                >
                  {!hasError ? (
                    <Image
                      src={item.imageSrc}
                      alt={`Elite X ${item.title} Interface Screenshot`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 1440px"
                      quality={95}
                      className="object-contain object-center p-1.5"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    /* Minimal Neutral Placeholder Frame (No Fabricated UI) */
                    <div className="flex size-full flex-col items-center justify-center p-8 text-center bg-[#07111C]">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b1220] text-slate-400">
                        <ImageIcon className="size-6 text-slate-500" />
                      </div>
                      <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
                        {item.placeholderTitle}
                      </span>
                      <p className="mt-1.5 text-[11px] font-mono text-slate-500">
                        Target asset path: <code className="text-blue-400">{item.imageSrc}</code>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Showcase Controls BELOW the Screenshot Frame */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Module Selector Tabs */}
          <div
            role="tablist"
            aria-label="Elite X Product Modules"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#07111C]/90 p-1 backdrop-blur-md"
          >
            {SHOWCASE_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleSelectTab(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all outline-none ${
                    isActive
                      ? "bg-[#4F8CFF] text-white shadow-[0_0_15px_rgba(79,140,255,0.35)]"
                      : "text-slate-400 hover:bg-[#0b1730] hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-75">{item.num}</span>
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Carousel Arrows & Dots Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                prevSlide();
                setResetTimerKey((prev) => prev + 1);
              }}
              aria-label="Previous Module Screenshot"
              className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b1220] text-slate-400 transition-colors hover:border-white/20 hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {SHOWCASE_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-6 bg-[#4F8CFF]"
                      : "w-1.5 bg-slate-700 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                nextSlide();
                setResetTimerKey((prev) => prev + 1);
              }}
              aria-label="Next Module Screenshot"
              className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b1220] text-slate-400 transition-colors hover:border-white/20 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
