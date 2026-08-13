"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#040914] text-slate-100 lg:flex-row">
      {/* Darkened & Heavily Blurred Atmospheric Dashboard Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/showcase/dashboard-approved.webp"
          alt="Elite X Atmospheric Background"
          fill
          priority
          quality={50}
          className="object-cover object-top opacity-15 blur-2xl filter scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040914]/80 via-[#040914]/90 to-[#040914]" />
      </div>

      {/* LEFT SIDE (~42% Usable Width): Editorial Brand Stage */}
      <div className="relative flex w-full flex-col justify-between border-b border-white/[0.06] p-8 sm:p-12 lg:w-[42%] lg:border-b-0 lg:border-r lg:p-16">
        {/* Subtle Large Curved Arc Visual with Glowing Node */}
        <svg 
          className="pointer-events-none absolute right-0 top-1/2 -z-10 hidden h-[650px] w-[320px] -translate-y-1/2 opacity-25 lg:block" 
          viewBox="0 0 320 650" 
          fill="none"
        >
          <path 
            d="M 320 0 A 320 320 0 0 0 320 650" 
            stroke="url(#arc-gradient-login)" 
            strokeWidth="1.5" 
          />
          <circle cx="2" cy="325" r="4" fill="#4F8CFF" className="animate-pulse" />
          <defs>
            <linearGradient id="arc-gradient-login" x1="320" y1="0" x2="320" y2="650" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F8CFF" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top Official Elite X Wordmark Header */}
        <div>
          <Link href="/landing" className="inline-flex flex-col transition-opacity hover:opacity-90">
            <div className="flex items-end leading-none">
              <span className="text-2xl font-extrabold tracking-[-0.055em] text-white sm:text-3xl">Elite</span>
              <span className="ml-0.5 text-3xl font-black tracking-[-0.08em] text-[#4F8CFF] sm:text-4xl">X</span>
            </div>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.38em] text-[#4F8CFF]/90">
              TRADING OS
            </span>
          </Link>
        </div>

        {/* Center Editorial Messaging */}
        <div className="my-10 max-w-md lg:my-auto">
          <h2 className="flex flex-col gap-2 text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[40px]">
            <span>Track your trades.</span>
            <span>Analyze your performance.</span>
            <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">
              Elevate your edge.
            </span>
          </h2>
          <div className="mt-6 h-0.5 w-16 rounded-full bg-gradient-to-r from-[#4F8CFF] to-transparent" />
        </div>

        {/* Lower-Left Presentational Security Block */}
        <div className="flex max-w-sm items-center gap-3.5 rounded-xl border border-white/[0.06] bg-[#07111C]/60 p-4 backdrop-blur-sm">
          <div className="flex size-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Bank-grade security</p>
            <p className="text-[11px] text-slate-400 leading-snug">Your data is encrypted and secure.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (~58% Usable Width): Centered Authentication Card */}
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-12 lg:w-[58%] lg:p-16">
        <div className="w-full max-w-[460px] rounded-2xl border border-white/[0.08] bg-[#07111C]/95 p-8 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10 lg:p-12">
          
          {/* Card Header */}
          <div className="mb-8 sm:mb-9">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-[28px]">
              Sign in to <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">Elite X</span>
            </h1>
            <p className="mt-2.5 text-xs text-slate-400 sm:text-sm">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="mb-2.5 block text-xs font-semibold text-slate-300">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-4 size-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-[52px] w-full rounded-xl border border-white/[0.08] bg-[#030814] pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="mb-2.5 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-4 size-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-[52px] w-full rounded-xl border border-white/[0.08] bg-[#030814] pl-11 pr-11 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 transition-colors hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400">
                {error}
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-[#4F8CFF] to-cyan-500 text-sm font-bold text-white shadow-[0_0_25px_rgba(79,140,255,0.3)] transition-all hover:opacity-95 hover:shadow-[0_0_30px_rgba(79,140,255,0.45)] disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="size-4" />}
            </button>
          </form>

          {/* Bottom Divider & Link to /signup */}
          <div className="mt-8 border-t border-white/[0.06] pt-6 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 font-semibold text-[#4F8CFF] transition-all hover:underline"
              >
                <span>Create account</span>
                <ArrowRight className="size-3" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}