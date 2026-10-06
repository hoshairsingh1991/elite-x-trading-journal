import type { Metadata } from "next";

import MarketingHeader from "@/components/marketing/MarketingHeader";
import HeroSection from "@/components/marketing/HeroSection";
import CapabilityStrip from "@/components/marketing/CapabilityStrip";
import TradingIntelligenceSection from "@/components/marketing/TradingIntelligenceSection";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title:
    "Elite X Trading Journal | Trading Analytics & Performance Intelligence",
  description:
    "Elite X is a professional trading journal and performance analytics platform for tracking trades, analyzing performance, reviewing execution, and improving trading decisions.",
  alternates: {
    canonical: "https://www.elitextrading.ca/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#040914] text-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Elite X Trading Journal",
            url: "https://www.elitextrading.ca",
            description:
              "Professional trading journal and performance analytics platform for tracking trades, analyzing performance, reviewing execution, and improving trading decisions.",
          }),
        }}
      />

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