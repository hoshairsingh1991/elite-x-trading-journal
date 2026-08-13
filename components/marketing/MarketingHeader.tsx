"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#040914]/95 backdrop-blur-md">
      {/* Full-width Header Inner Flex Container with Explicit 40px Horizontal Edge Padding */}
      <div 
        className="flex h-[60px] w-full items-center justify-between"
        style={{ paddingInline: "clamp(24px, 3vw, 40px)" }}
      >
        {/* LEFT ZONE: Official Elite X Brand Wordmark */}
        <div className="flex items-center shrink-0">
          <Link href="/landing" className="flex flex-col transition-opacity hover:opacity-90">
            <div className="flex items-end">
              <span className="text-xl font-extrabold tracking-[-0.055em] text-white sm:text-2xl">
                Elite
              </span>
              <span className="ml-0.5 text-2xl font-black leading-none tracking-[-0.08em] text-[#4F8CFF] sm:text-3xl">
                X
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.38em] text-[#4F8CFF]/90">
              TRADING OS
            </span>
          </Link>
        </div>

        {/* CENTER ZONE: Desktop Commercial Navigation with Semantic Trigger Buttons */}
        <nav className="hidden items-center justify-center gap-7 lg:gap-8 md:flex">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-slate-200 transition-colors hover:text-white"
          >
            <span>Product</span>
            <ChevronDown className="size-3.5 opacity-70" />
          </button>

          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <span>Features</span>
            <ChevronDown className="size-3.5 opacity-70" />
          </button>

          <button
            type="button"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Pricing
          </button>

          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <span>Resources</span>
            <ChevronDown className="size-3.5 opacity-70" />
          </button>

          <button
            type="button"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            About
          </button>
        </nav>

        {/* RIGHT ZONE: Desktop Action CTAs */}
        <div className="hidden items-center justify-end gap-6 shrink-0 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Log in
          </Link>

<Link
  href="/signup"
  className="
    relative
    left-[0px]
    top-[0px]
    flex
    h-[40px]
    w-[145px]
    shrink-0
    items-center
    justify-center
    gap-2.5
    rounded-[8px]
    bg-gradient-to-r
    from-blue-600
    via-[#4F8CFF]
    to-cyan-500
    text-sm
    font-bold
    text-white
    shadow-[0_0_20px_rgba(79,140,255,0.3)]
    transition-all
    hover:opacity-95
    hover:shadow-[0_0_25px_rgba(79,140,255,0.45)]
  "
>
  <span>Start Free Trial</span>
  <ArrowRight className="size-4" />
</Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Navigation Menu"
          className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b1220] text-slate-300 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-white/[0.06] bg-[#07111C] px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-base font-semibold text-slate-200 text-left"
            >
              <span>Product</span>
              <ChevronDown className="size-4 opacity-70" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between text-base font-medium text-slate-300 text-left"
            >
              <span>Features</span>
              <ChevronDown className="size-4 opacity-70" />
            </button>

            <button
              type="button"
              className="text-base font-medium text-slate-300 text-left w-full"
            >
              Pricing
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between text-base font-medium text-slate-300 text-left"
            >
              <span>Resources</span>
              <ChevronDown className="size-4 opacity-70" />
            </button>

            <button
              type="button"
              className="text-base font-medium text-slate-300 text-left w-full"
            >
              About
            </button>

            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-white/[0.06]">
              <Link
                href="/login"
                className="flex h-11 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b1220] text-sm font-semibold text-white"
              >
                Log in
              </Link>
<Link
  href="/signup"
  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-[#4F8CFF] to-cyan-500 text-sm font-bold text-white shadow-[0_0_20px_rgba(79,140,255,0.3)]"
>
  <span>Start Free Trial</span>
  <ArrowRight className="size-4" />
</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
