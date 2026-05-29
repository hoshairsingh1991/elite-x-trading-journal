"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSignup = async () => {

    try {

      setLoading(true);

      setError("");

      const { error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      alert(
        "Signup successful. You can now log in."
      );

    } catch (err: any) {

      setError(
        err.message ??
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
  };

  const handleLogin = async () => {

    try {

      setLoading(true);

      setError("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      router.push("/");

    } catch (err: any) {

      setError(
        err.message ??
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6">

      <div className="w-full max-w-[420px] rounded-[28px] border border-white/[0.06] bg-[#071427] p-10 shadow-[0_0_40px_rgba(0,0,0,0.35)]">

        <div className="mb-10">

          <h1 className="text-[34px] font-black tracking-tight text-slate-200">
            Elite X
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Institutional Trading OS
          </p>
        </div>

        <div className="space-y-5">

          <div>

            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Email
            </p>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="h-[52px] w-full rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-sm text-slate-200 outline-none transition-all focus:border-blue-500"
            />
          </div>

          <div>

            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Password
            </p>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="h-[52px] w-full rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-sm text-slate-200 outline-none transition-all focus:border-blue-500"
            />
          </div>

          {error && (

            <div className="rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

              {error}

            </div>
          )}

          <div className="flex gap-4 pt-2">

            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex h-[52px] flex-1 items-center justify-center rounded-[18px] bg-blue-500 text-sm font-black text-white transition-all hover:bg-blue-600 disabled:opacity-50"
            >

              Login

            </button>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex h-[52px] flex-1 items-center justify-center rounded-[18px] border border-white/[0.08] bg-[#0b1730] text-sm font-black text-slate-300 transition-all hover:bg-[#13203a] disabled:opacity-50"
            >

              Sign Up

            </button>

          </div>
        </div>
      </div>
    </main>
  );
}