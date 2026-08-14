"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // =========================================================
  // VERIFY RECOVERY SESSION
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setError(
          "This password reset link is invalid or has expired."
        );
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // UPDATE PASSWORD
  // =========================================================

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message ??
          "Unable to update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING / SESSION CHECK
  // =========================================================

  if (checkingSession) {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#040914] text-slate-100">
        <div className="text-[13px] text-slate-400">
          Verifying password reset session...
        </div>
      </main>
    );
  }

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
          className="
            scale-[1.08]
            object-cover
            object-center
            opacity-30
            blur-[18px]
          "
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
              stroke="url(#update-password-arc)"
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
                id="update-password-arc"
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

          {/* LEFT CONTENT */}

          <div className="relative h-full w-full">

            {/* BRAND */}

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

            {/* EDITORIAL */}

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
                  Create a new password.
                </span>

                <span className="block">
                  Keep your account secure.
                </span>
              </h2>

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

            {/* SECURITY */}

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

          <div className="relative w-full max-w-[380px]">

            <div
              className="
                relative
                h-[590px]
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
              {/* HEADER                                             */}
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
                  Create a new{" "}
                  <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">
                    password
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
                  Choose a new password for your Elite X
                  account.
                </p>

              </div>

              {success ? (

                /* ================================================= */
                /* SUCCESS STATE                                     */
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
                    Password Updated
                  </h3>

                  <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-6 text-slate-400">
                    Your password has been successfully
                    updated. You can now sign in with your
                    new password.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/login")}
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
                  </button>

                </div>

              ) : !error || !error.includes("expired") ? (

                /* ================================================= */
                /* PASSWORD FORM                                     */
                /* ================================================= */

                <form
                  onSubmit={handleUpdatePassword}
                  className="
                    relative
                    left-[0px]
                    top-[0px]
                    mt-9
                  "
                >

                  {/* NEW PASSWORD */}

                  <div
                    className="
                      relative
                      left-[35px]
                      top-[50px]
                      mt-0
                      w-[80%]
                    "
                  >

                    <label
                      htmlFor="newPassword"
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
                      New password
                    </label>

                    <div className="relative">

                      <Lock
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          size-[16px]
                          -translate-y-1/2
                          text-slate-500
                        "
                      />

                      <input
                        id="newPassword"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(
                            e.target.value
                          )
                        }
                        placeholder="Create a new password"
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
                          [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0B1624_inset]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
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

                  {/* CONFIRM PASSWORD */}

                  <div
                    className="
                      relative
                      left-[35px]
                      top-[120px]
                      mt-7
                      w-[80%]
                    "
                  >

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
                      Confirm new password
                    </label>

                    <div className="relative">

                      <Lock
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          size-[16px]
                          -translate-y-1/2
                          text-slate-500
                        "
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        required
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        placeholder="Confirm your new password"
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
                          [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0B1624_inset]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
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
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div
                      className="
                        relative
                        left-[35px]
                        top-[175px]
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

                  {/* UPDATE PASSWORD BUTTON */}

                  <div
                    className="
                      relative
                      left-[35px]
                      top-[220px]
                      mt-8
                      w-[80%]
                    "
                  >

                    <button
                      type="submit"
                      disabled={loading}
                      className="
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
                          ? "Updating..."
                          : "Update password"}
                      </span>

                      {!loading && (
                        <ArrowRight className="size-[15px]" />
                      )}

                    </button>

                  </div>

                </form>

              ) : (

                /* ================================================= */
                /* INVALID / EXPIRED RESET LINK                     */
                /* ================================================= */

                <div
                  className="
                    relative
                    left-[35px]
                    top-[100px]
                    w-[80%]
                    text-center
                  "
                >

                  <h3 className="text-[22px] font-semibold text-white">
                    Reset link expired
                  </h3>

                  <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-6 text-slate-400">
                    This password reset link is invalid or
                    has expired. Please request a new one.
                  </p>

                  <Link
                    href="/forgot-password"
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
                    <span>Request new link</span>

                    <ArrowRight className="size-[15px]" />
                  </Link>

                </div>

              )}

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}