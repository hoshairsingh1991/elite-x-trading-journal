"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
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
            stroke="url(#arc-gradient-signup)" 
            strokeWidth="1.5" 
          />
          <circle cx="2" cy="325" r="4" fill="#4F8CFF" className="animate-pulse" />
          <defs>
            <linearGradient id="arc-gradient-signup" x1="320" y1="0" x2="320" y2="650" gradientUnits="userSpaceOnUse">
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
            <span>Trade better.</span>
            <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">
              Journal smarter.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-sm">
            Track, analyze and improve your trades — all in one place.
          </p>
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
              Create your <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">account</span>
            </h1>
            <p className="mt-2.5 text-xs text-slate-400 sm:text-sm">
              Start your trading journey with Elite X.
            </p>
          </div>

          {success ? (
            /* Success State Confirmation */
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Account Created</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed max-w-xs">
                Signup successful! You can now log in to access your Elite X trading journal.
              </p>
              <Link
                href="/login"
                className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-[#4F8CFF] to-cyan-500 text-sm font-bold text-white shadow-[0_0_25px_rgba(79,140,255,0.3)] transition-all hover:opacity-95"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className="mb-2 block text-xs font-semibold text-slate-300">
                  Full name
                </label>
                <div className="relative flex items-center">
                  <User className="pointer-events-none absolute left-4 size-4 text-slate-500" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-[52px] w-full rounded-xl border border-white/[0.08] bg-[#030814] pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-300">
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
                <label htmlFor="password" className="mb-2 block text-xs font-semibold text-slate-300">
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
                    placeholder="Create a password"
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

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold text-slate-300">
                  Confirm password
                </label>
                <div className="relative flex items-center">
                  <Lock className="pointer-events-none absolute left-4 size-4 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="h-[52px] w-full rounded-xl border border-white/[0.08] bg-[#030814] pl-11 pr-11 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-slate-500 transition-colors hover:text-slate-300"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                <span>{loading ? "Creating Account..." : "Create account"}</span>
                {!loading && <ArrowRight className="size-4" />}
              </button>
            </form>
          )}

          {/* Bottom Divider & Link to /login */}
          <div className="mt-8 border-t border-white/[0.06] pt-6 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-[#4F8CFF] transition-all hover:underline"
              >
                <span>Sign in</span>
                <ArrowRight className="size-3" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
