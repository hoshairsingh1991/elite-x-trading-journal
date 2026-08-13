"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider";

import MarketingHeader from "@/components/marketing/MarketingHeader";
import HeroSection from "@/components/marketing/HeroSection";
import CapabilityStrip from "@/components/marketing/CapabilityStrip";
import TradingIntelligenceSection from "@/components/marketing/TradingIntelligenceSection";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function HomePage() {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [
    user,
    loading,
    router,
  ]);

  /*
   * Wait for the existing AuthProvider to finish
   * restoring the Supabase session.
   *
   * This prevents a logged-in user from briefly
   * seeing the landing page during hydration.
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040914]">
        <div className="text-sm font-bold tracking-[0.18em] text-slate-500">
          LOADING...
        </div>
      </main>
    );
  }

  /*
   * Authenticated user:
   * redirect effect above will send them to /dashboard.
   */
  if (user) {
    return null;
  }

  /*
   * Logged-out user:
   * show the public landing page.
   */
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