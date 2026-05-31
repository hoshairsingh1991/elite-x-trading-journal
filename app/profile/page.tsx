"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  Shield,
  User,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Sidebar from "@/components/layout/Sidebar";
import UserMenuV2 from "@/components/layout/UserMenuV2";

import { supabase } from "@/lib/supabase";

import {
  loadProfile,
  updateProfile,
} from "@/lib/storage/profileStorage";

// =====================================================
// PAGE
// =====================================================

export default function ProfilePage() {

  // ===================================================
  // STATE
  // ===================================================

  const [
    email,
    setEmail,
  ] = useState("");

  const [
  displayName,
  setDisplayName,
] = useState("");

const [
  isSaving,
  setIsSaving,
] = useState(false);

  // ===================================================
  // LOAD USER
  // ===================================================

  useEffect(() => {

    async function loadUser() {

      const {
        data,
      } = await supabase.auth.getUser();

      const user =
        data.user;

      if (user?.email) {

        setEmail(
          user.email
        );
const profile =
  await loadProfile();

if (profile) {

  setDisplayName(
    profile.display_name
  );
}

      }
    }

    loadUser();

  }, []);

  // ===================================================
  // INITIAL
  // ===================================================

  const initial =
    email.charAt(0).toUpperCase();

  // ===================================================
  // RENDER
  // ===================================================

  return (

    <ProtectedRoute>

      <main className="flex h-screen overflow-hidden bg-[#020617] text-slate-300">

        {/* ========================================== */}
        {/* SIDEBAR */}
        {/* ========================================== */}

        <div className="p-4">
          <Sidebar />
        </div>

        {/* ========================================== */}
        {/* GAP */}
        {/* ========================================== */}

        <div className="w-8 shrink-0" />

        {/* ========================================== */}
        {/* MAIN */}
        {/* ========================================== */}

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden pr-10 pt-4">

          {/* ======================================== */}
          {/* HEADER */}
          {/* ======================================== */}

          <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/[0.05] px-8 pb-4">

            <div className="flex items-center gap-5">

              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0b1730] transition-all hover:bg-[#13203a]"
              >

                <ArrowLeft className="h-5 w-5 text-slate-300" />

              </Link>

              <div>

                <h1 className="text-[30px] font-black tracking-tight text-slate-200">
                  My Profile
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Account identity & authentication
                </p>

              </div>

            </div>

            <div className="relative right-[12px]">
            <UserMenuV2
  totalTrades={0}
  totalPnL={0}
  tradingDays={0}
/>
            </div>

          </div>

          {/* ======================================== */}
          {/* CONTENT GAP */}
          {/* ======================================== */}

          <div className="h-8 shrink-0" />

          {/* ======================================== */}
          {/* SCROLL AREA */}
          {/* ======================================== */}

          <div className="flex-1 overflow-y-auto px-8">

            {/* ====================================== */}
            {/* PROFILE CARD */}
            {/* ====================================== */}

            <div className="max-w-[920px] rounded-[32px] bg-[#071427] p-8 shadow-[0_0_40px_rgba(0,0,0,0.18)]">

              <div className="rounded-[28px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-10">

                {/* ================================== */}
                {/* TOP PROFILE */}
                {/* ================================== */}
                <p className="invisible text-[12px]">
  spacer
                </p>

                <div className="relative left-[12px] flex items-center gap-8 border-b border-white/[0.05] pb-10">

                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-500/15 text-[42px] font-black text-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.15)]">

                    {initial}

                  </div>

                  <div className="flex flex-col gap-3">

                    <div>

                      <p className="text-[12px] font-black uppercase tracking-[0.22em] text-slate-500">
                        Account Identity
                      </p>

                      <h2 className="mt-3 text-[36px] font-black tracking-tight text-slate-200">
                        <input
  value={displayName}
  onChange={(event) =>
    setDisplayName(
      event.target.value
    )
  }
  className="
    bg-transparent
    text-[36px]
    font-black
    tracking-tight
    text-slate-200
    outline-none
  "
/>
                      </h2>

                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-[#081120] px-5 py-3">
                    

                      <Mail className="h-5 w-5 text-blue-400" />

                      <span className="text-[15px] text-slate-300">
                        {email}
                      </span>

                    </div>

<p className="invisible text-[12px]">
  spacer
</p>

</div>

</div>

                <button
  onClick={async () => {

    setIsSaving(true);

    await updateProfile(
      displayName
    );

    setIsSaving(false);
  }}
  className="
  relative left-[12px]
  mt-6
  rounded-2xl
  border border-blue-500/20
  bg-blue-500/10
  px-5 py-3
  text-sm font-semibold
  text-blue-400
  transition-all
  hover:bg-blue-500/20
"
>

  {
    isSaving
      ? "Saving..."
      : "Save Display Name"
  }

</button>

                {/* ================================== */}
                {/* LOWER CARDS */}
                {/* ================================== */}
                <div className="h-[12px]" />

                <div className="grid grid-cols-2 gap-6 pt-14">

                  {/* ================================ */}
                  {/* PROFILE STATUS */}
                  {/* ================================ */}

                  <div className="rounded-[26px] border border-white/[0.04] bg-[#081120] px-[12px] py-7">

                  <p className="invisible text-[12px]">
                spacer
                </p>

                    <div className="relative left-[12px] flex items-center gap-4">
                        

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                        <User className="h-6 w-6 text-blue-400" />
                        

                      </div>

                      

                      <div>

                        <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Profile Status
                        </p>

                        <h3 className="mt-2 text-[24px] font-black tracking-tight text-slate-200">
                          Active
                        </h3>

                      </div>

                    </div>


                    <p className="relative left-[12px] mt-6 text-[15px] leading-7 text-slate-400">

                      Your Elite X account is authenticated and securely connected to your isolated trading workspace.

                    </p>

                    <div className="h-[12px]" />

                  </div>

                  

                  {/* ================================ */}
                  {/* SECURITY */}
                  {/* ================================ */}

                  <div className="rounded-[26px] border border-white/[0.04] bg-[#081120] p-7">

                  <p className="invisible text-[12px]">
                    spacer
                    </p>

                    <div className="relative left-[12px] flex items-center gap-4">
                        

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

                        <Shield className="h-6 w-6 text-emerald-400" />

                      </div>

                      <div>

                        <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Security
                        </p>

                        <h3 className="mt-2 text-[24px] font-black tracking-tight text-slate-200">
                          Protected
                        </h3>

                      </div>

                    </div>


                    <p className="relative left-[12px] mt-6 text-[15px] leading-7 text-slate-400">

                      Your account is protected through Supabase authentication and isolated tenant-level security.

                    </p>

                  </div>

                </div>

             </div>

<div className="h-[12px]" />

</div>

<div className="h-12" />

          </div>

        </section>

      </main>

    </ProtectedRoute>
  );
}