"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const [termsAccepted, setTermsAccepted] = useState(false);
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
if (!termsAccepted) {
  setError("You must agree to the Terms of Service and Privacy Policy.");
  return;
}
    try {
      setLoading(true);
      setError("");

const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName.trim(),
    },
  },
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
    <main className="relative min-h-screen w-full overflow-hidden bg-[#040914] text-slate-100">
      {/* ========================================================= */}
      {/* ATMOSPHERIC BACKGROUND                                    */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/images/showcase/dashboard-approved.webp"
          alt=""
          fill
          priority
          quality={45}
          className="scale-[1.08] object-cover object-center opacity-30 blur-[18px]"
        />

        <div className="absolute inset-0 bg-[#040914]/58" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(79,140,255,0.10),transparent_34%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,#040914_0%,rgba(4,9,20,0.88)_40%,rgba(4,9,20,0.64)_100%)]" />
      </div>

      {/* ========================================================= */}
      {/* MAIN AUTH CANVAS                                          */}
      {/* ========================================================= */}

      <div className="relative flex min-h-screen w-full">
        {/* ======================================================= */}
        {/* LEFT BRAND PANEL                                         */}
        {/* ======================================================= */}

        <section className="relative hidden w-[40%] shrink-0 border-r border-white/[0.08] lg:flex">
          {/* ===================================================== */}
          {/* LARGE BACKGROUND ARC                                  */}
          {/* ===================================================== */}

          <svg
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[-0px]
              top-1/2
              h-[820px]
              w-[700px]
              -translate-y-1/2
              scale-x-[-0.8]
              opacity-80
            "
            viewBox="0 0 410 820"
            fill="none"
          >
            <path
              d="M410 0C180 85 30 295 30 410C30 525 180 735 410 820"
              stroke="url(#signup-arc)"
              strokeWidth="1"
            />

            <circle
              cx="30"
              cy="410"
              r="4"
              fill="#4F8CFF"
            />

            <circle
              cx="30"
              cy="410"
              r="12"
              fill="#4F8CFF"
              opacity="0.08"
            />

            <defs>
              <linearGradient
                id="signup-arc"
                x1="0"
                y1="0"
                x2="380"
                y2="820"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stopColor="#4F8CFF"
                  stopOpacity="0"
                />

                <stop
                  offset="0.46"
                  stopColor="#7C5CFF"
                  stopOpacity="0.70"
                />

                <stop
                  offset="0.62"
                  stopColor="#4F8CFF"
                  stopOpacity="0.45"
                />

                <stop
                  offset="1"
                  stopColor="#38BDF8"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>

          {/* ===================================================== */}
          {/* LEFT PANEL CONTENT                                    */}
          {/* ===================================================== */}

          <div className="relative h-full w-full">
            {/* =================================================== */}
            {/* BRAND                                               */}
            {/* =================================================== */}

            <Link
              href="/landing"
              className="
                absolute
                left-[200px]
                top-[30%]
                inline-flex
                -translate-y-1/2
                flex-col
                transition-opacity
                hover:opacity-90
              "
            >
              <div className="flex items-end leading-none">
                <span className="text-[34px] font-extrabold tracking-[-0.055em] text-white">
                  Elite
                </span>

                <span className="relative left-[8px] text-[38px] font-black tracking-normal text-[#4F8CFF]">
                  X
                </span>
              </div>

              <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.38em] text-slate-300/80">
                TRADING JOURNAL
              </span>
            </Link>

            {/* =================================================== */}
            {/* EDITORIAL MESSAGE                                  */}
            {/* =================================================== */}

            <div
              className="
                absolute
                left-[140px]
                top-[50%]
                -translate-y-1/2
              "
            >
              <h2
                className="
                  text-[32px]
                  font-medium
                  leading-[1.28]
                  tracking-[-0.02em]
                  text-white
                "
              >
                <span className="block">
                  Trade better.
                </span>

                <span className="block">
                  Journal smarter.
                </span>
              </h2>

              <p
                className="
                  relative
                  left-[0px]
                  top-[0px]
                  mt-5
                  max-w-[320px]
                  text-[14px]
                  leading-6
                  text-slate-400
                "
              >
                Track, analyze and improve your trades — all in one place.
              </p>

              <div
                className="
                  relative
                  left-[0px]
                  top-[20px]
                  mt-7
                  h-px
                  w-[68px]
                  bg-gradient-to-r
                  from-[#7C5CFF]
                  to-cyan-400
                "
              />
            </div>

            {/* =================================================== */}
            {/* SECURITY                                            */}
            {/* =================================================== */}

            <div
              className="
                absolute
                bottom-[200px]
                left-[140px]
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  size-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                "
              >
                <ShieldCheck className="size-4 text-[#7C5CFF]" />
              </div>

              <div>
                <p className="text-[12px] font-semibold text-slate-200">
                  Bank-grade security
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Your data is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* RIGHT AUTH PANEL                                        */}
        {/* ======================================================= */}

        <section
          className="
            relative
            left-[0px]
            top-[0px]
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            px-6
            py-10
            sm:px-10
            lg:px-10
            xl:px-14
          "
        >
          {/* AUTH CARD WRAPPER */}
          <div className="relative left-[0px] top-[0px] w-full max-w-[380px]">
            {/* AUTH CARD */}
            <div
              className="
                relative
                left-[0px]
                top-[0px]
                h-[750px]
                w-full
                rounded-[14px]
                border
                border-white/[0.09]
                bg-[#07111C]/95
                px-10
                py-10
                shadow-[0_24px_80px_rgba(0,0,0,0.42)]
                backdrop-blur-xl
                sm:px-11
                sm:py-11
              "
            >
              {/* ================================================= */}
              {/* CARD HEADER                                       */}
              {/* ================================================= */}

              <div>
                <h1
                  className="
                    relative
                    left-[50px]
                    top-[20px]
                    text-[30px]
                    font-semibold
                    leading-tight
                    tracking-[-0.025em]
                    text-white
                  "
                >
                  Create your{" "}
                  <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">
                    account
                  </span>
                </h1>

                <p
                  className="
                    relative
                    left-[50px]
                    top-[20px]
                    mt-3
                    text-[13px]
                    leading-5
                    text-slate-400
                  "
                >
                  Start your trading journey with Elite X.
                </p>
              </div>

              {success ? (
                /* ================================================= */
                /* SUCCESS STATE                                    */
                /* ================================================= */

                <div
                  className="
                    relative
                    left-[35px]
                    top-[90px]
                    w-[80%]
                    text-center
                  "
                >
<div
  className="
    relative
    left-[120px]
    top-[-20px]
    mx-auto
    mb-5
    flex
    size-14
    items-center
    justify-center
    rounded-2xl
    border
    border-emerald-500/20
    bg-emerald-500/10
    text-emerald-400
  "
>
  <CheckCircle2 className="size-7" />
</div>

                  <h3 className="text-[22px] font-semibold text-white">
                    Account Created
                  </h3>

                  <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-6 text-slate-400">
                    Signup successful. You can now sign in to access your
                    Elite X trading journal.
                  </p>

<Link
  href="/login"
  className="
    relative
    top-[30px]
    mt-7
    flex
    h-[52px]
    w-full
    items-center
    justify-center
    gap-2
    rounded-[9px]
    bg-gradient-to-r
    from-[#4F46E5]
    via-[#4F8CFF]
    to-[#06B6D4]
    text-[13px]
    font-semibold
    text-white
    shadow-[0_6px_18px_rgba(79,140,255,0.10)]
    transition-all
    hover:brightness-[1.04]
  "
>
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="size-[15px]" />
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSignup}
                  className="
                    relative
                    left-[0px]
                    top-[0px]
                    mt-9
                  "
                >
                  {/* ================================================= */}
                  {/* FULL NAME                                        */}
                  {/* ================================================= */}

                  <div className="relative left-[35px] top-[50px] mt-0 w-[80%]">
                    <label
                      htmlFor="fullName"
                      className="
                        relative
                        left-[0px]
                        top-[-6px]
                        mb-2
                        block
                        text-[12px]
                        font-semibold
                        text-slate-300
                      "
                    >
                      Full name
                    </label>

                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 size-[16px] -translate-y-1/2 text-slate-500" />

                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        style={{
                          WebkitTextFillColor: "#ffffff",
                          caretColor: "#ffffff",
                          textIndent: "42px",
                        }}
                        className="
                          h-[52px]
                          w-full
                          rounded-[9px]
                          border
                          border-white/[0.08]
                          bg-[#0B1624]
                          pl-[58px]
                          pr-4
                          text-[13px]
                          font-medium
                          text-white
                          caret-white
                          outline-none
                          transition-colors
                          placeholder:text-slate-500
                          focus:border-[#4F8CFF]/70
                          focus:ring-1
                          focus:ring-[#4F8CFF]/30
                          [&:-webkit-autofill]:bg-[#0B1624]
                          [&:-webkit-autofill]:text-fill-white
                          [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0B1624_inset]
                        "
                      />
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* EMAIL                                             */}
                  {/* ================================================= */}

                  <div className="relative left-[35px] top-[70px] mt-7 w-[80%]">
                    <label
                      htmlFor="email"
                      className="
                        relative
                        left-[0px]
                        top-[-6px]
                        mb-2
                        block
                        text-[12px]
                        font-semibold
                        text-slate-300
                      "
                    >
                      Email
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-[16px] -translate-y-1/2 text-slate-500" />

                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                        style={{
                          WebkitTextFillColor: "#ffffff",
                          caretColor: "#ffffff",
                          textIndent: "42px",
                        }}
                        className="
                          h-[52px]
                          w-full
                          rounded-[9px]
                          border
                          border-white/[0.08]
                          bg-[#0B1624]
                          pl-[58px]
                          pr-4
                          text-[13px]
                          font-medium
                          text-white
                          caret-white
                          outline-none
                          transition-colors
                          placeholder:text-slate-500
                          focus:border-[#4F8CFF]/70
                          focus:ring-1
                          focus:ring-[#4F8CFF]/30
                          [&:-webkit-autofill]:bg-[#0B1624]
                          [&:-webkit-autofill]:text-fill-white
                          [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0B1624_inset]
                        "
                      />
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* PASSWORD                                          */}
                  {/* ================================================= */}

                  <div className="relative left-[35px] top-[90px] mt-7 w-[80%]">
                    <label
                      htmlFor="password"
                      className="
                        relative
                        left-[0px]
                        top-[-6px]
                        mb-2
                        block
                        text-[12px]
                        font-semibold
                        text-slate-300
                      "
                    >
                      Password
                    </label>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 size-[16px] -translate-y-1/2 text-slate-500" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        style={{
                          WebkitTextFillColor: "#ffffff",
                          caretColor: "#ffffff",
                          textIndent: "42px",
                        }}
                        className="
                          h-[52px]
                          w-full
                          rounded-[9px]
                          border
                          border-white/[0.08]
                          bg-[#0B1624]
                          pl-[58px]
                          pr-12
                          text-[13px]
                          font-medium
                          text-white
                          caret-white
                          outline-none
                          transition-colors
                          placeholder:text-slate-500
                          focus:border-[#4F8CFF]/70
                          focus:ring-1
                          focus:ring-[#4F8CFF]/30
                          [&:-webkit-autofill]:bg-[#0B1624]
                          [&:-webkit-autofill]:text-fill-white
                          [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0B1624_inset]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-slate-500
                          transition-colors
                          hover:text-slate-300
                        "
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    <p
                      className="
                        relative
                        left-[0px]
                        top-[8px]
                        text-[11px]
                        text-slate-500
                      "
                    >
                      Must be at least 6 characters
                    </p>
                  </div>

                  {/* ================================================= */}
                  {/* CONFIRM PASSWORD                                  */}
                  {/* ================================================= */}

                  <div className="relative left-[35px] top-[120px] mt-7 w-[80%]">
                    <label
                      htmlFor="confirmPassword"
                      className="
                        relative
                        left-[0px]
                        top-[-6px]
                        mb-2
                        block
                        text-[12px]
                        font-semibold
                        text-slate-300
                      "
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 size-[16px] -translate-y-1/2 text-slate-500" />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        style={{
                          WebkitTextFillColor: "#ffffff",
                          caretColor: "#ffffff",
                          textIndent: "42px",
                        }}
                        className="
                          h-[52px]
                          w-full
                          rounded-[9px]
                          border
                          border-white/[0.08]
                          bg-[#0B1624]
                          pl-[58px]
                          pr-12
                          text-[13px]
                          font-medium
                          text-white
                          caret-white
                          outline-none
                          transition-colors
                          placeholder:text-slate-500
                          focus:border-[#4F8CFF]/70
                          focus:ring-1
                          focus:ring-[#4F8CFF]/30
                          [&:-webkit-autofill]:bg-[#0B1624]
                          [&:-webkit-autofill]:text-fill-white
                          [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0B1624_inset]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-slate-500
                          transition-colors
                          hover:text-slate-300
                        "
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* ERROR                                             */}
                  {/* ================================================= */}

                  {error && (
                    <div
                      className="
                        relative
                        left-[35px]
                        top-[270px]
                        mt-5
                        w-[80%]
                        rounded-[9px]
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-3
                        text-[12px]
                        leading-5
                        text-red-400
                      "
                    >
                      {error}
                    </div>
                  )}

{/* ================================================= */}
{/* TERMS AGREEMENT                                  */}
{/* ================================================= */}

<div className="relative left-[35px] top-[140px] mt-6 flex w-[80%] items-start gap-2">
  <label className="flex cursor-pointer items-start gap-2">
    <input
      type="checkbox"
      required
      checked={termsAccepted}
      onChange={(e) => {
        setTermsAccepted(e.target.checked);
        setError("");
      }}
      className="
        peer
        mt-[1px]
        size-[17px]
        shrink-0
        cursor-pointer
        appearance-none
        rounded-[4px]
        border
        border-white/[0.12]
        bg-[#0B1624]
        checked:border-[#4F46E5]
        checked:bg-[#4F46E5]
      "
    />

    <span className="text-[11px] leading-5 text-slate-400">
      I agree to the{" "}
      <span className="text-[#A78BFA]">
        Terms of Service
      </span>{" "}
      and{" "}
      <span className="text-[#A78BFA]">
        Privacy Policy
      </span>
    </span>
  </label>
</div>

                  {/* ================================================= */}
                  {/* CREATE ACCOUNT BUTTON                             */}
                  {/* ================================================= */}

                  <div
                    className="
                      relative
                      left-[35px]
                      top-[160px]
                      mt-8
                      w-[80%]
                    "
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        mt-0
                        flex
                        h-[52px]
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-[9px]
                        bg-gradient-to-r
                        from-[#4F46E5]
                        via-[#4F8CFF]
                        to-[#06B6D4]
                        text-[13px]
                        font-semibold
                        text-white
                        shadow-[0_6px_18px_rgba(79,140,255,0.10)]
                        transition-all
                        hover:brightness-[1.04]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span>
                        {loading
                          ? "Creating account..."
                          : "Create account"}
                      </span>

                      {!loading && (
                        <ArrowRight className="size-[15px]" />
                      )}
                    </button>
                  </div>

                  {/* ================================================= */}
                  {/* DIVIDER                                           */}
                  {/* ================================================= */}

                  <div
                    className="
                      relative
                      left-[35px]
                      top-[180px]
                      flex
                      w-[80%]
                      items-center
                      gap-3
                    "
                  >
                    <div className="h-px flex-1 bg-white/[0.08]" />

                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      OR
                    </span>

                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>

                  {/* ================================================= */}
                  {/* GOOGLE                                            */}
                  {/* ================================================= */}

                  <div
                    className="
                      relative
                      left-[35px]
                      top-[200px]
                      mt-5
                      w-[80%]
                    "
                  >
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="
                        flex
                        h-[52px]
                        w-full
                        cursor-not-allowed
                        items-center
                        justify-center
                        gap-3
                        rounded-[9px]
                        border
                        border-white/[0.08]
                        bg-white/[0.025]
                        text-[13px]
                        font-semibold
                        text-slate-500
                        opacity-80
                      "
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-[18px]"
                      >
                        <path
                          fill="#4285F4"
                          d="M21.35 12.27c0-.68-.06-1.35-.17-1.99H12v3.77h5.23a4.46 4.46 0 0 1-1.94 2.93v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.16Z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.03H3.27v2.53A9.75 9.75 0 0 0 12 21.75Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M6.51 13.83A5.86 5.86 0 0 1 6.2 12c0-.64.11-1.26.31-1.83V7.64H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.36l3.24-2.53Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 6.14c1.43 0 2.7.49 3.71 1.46l2.78-2.78C16.84 3.25 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.73 5.39l3.24 2.53C7.29 7.86 9.45 6.14 12 6.14Z"
                        />
                      </svg>

                      <span>Continue with Google</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ================================================= */}
              {/* FOOTER                                            */}
              {/* ================================================= */}

              <div
                className="
                  relative
                  left-[35px]
                  top-[215px]
                  mt-8
                  w-[80%]
                  pt-6
                "
              >
                <p className="text-center text-[12px] text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      font-semibold
                      transition-colors
                    "
                    style={{
                      color: "#A78BFA",
                    }}
                  >
                    <span>Sign in</span>
                    <ArrowRight className="size-[13px]" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}