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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-[#4F8CFF]/30 selection:text-white">
      {/* Sticky Marketing Header */}
      <MarketingHeader />

      {/* Main Content Area */}
      <main className="flex-1">
        <HeroSection />
        <CapabilityStrip />
        <TradingIntelligenceSection />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
