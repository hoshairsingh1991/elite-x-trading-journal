import type { Metadata } from "next";

import MarketingHeader from "@/components/marketing/MarketingHeader";
import HeroSection from "@/components/marketing/HeroSection";
import CapabilityStrip from "@/components/marketing/CapabilityStrip";
import TradingIntelligenceSection from "@/components/marketing/TradingIntelligenceSection";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "Elite X — Institutional Trading OS & Business Intelligence Platform",
  description:
    "Professional trading performance analytics, multi-account trade reconstruction, behavioral journaling, and operating expense accounting platform.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#040914] text-slate-200">
      <MarketingHeader />

      <main>
        <HeroSection />
        <CapabilityStrip />
        <TradingIntelligenceSection />
      </main>

      <MarketingFooter />
    </div>
  );
}