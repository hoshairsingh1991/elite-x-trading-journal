"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  loadProfile,
} from "@/lib/storage/profileStorage";

// =====================================================
// COMPONENT
// =====================================================

export default function UserMenu() {

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
  displayName,
  setDisplayName,
] = useState(
  "Elite X User"
);

  const [
    email,
    setEmail,
  ] = useState("");

  const dropdownRef =
    useRef<HTMLDivElement>(null);

// ===================================================
// LOAD USER
// ===================================================

useEffect(() => {

  async function loadUser() {

    // ===============================================
    // AUTH USER
    // ===============================================

    const {
      data,
    } = await supabase.auth.getUser();

    const user =
      data.user;

    if (user?.email) {

      setEmail(
        user.email
      );
    }

    // ===============================================
    // PROFILE
    // ===============================================

    const profile =
      await loadProfile();

    if (profile) {

      setDisplayName(
        profile.display_name
      );
    }
  }

  loadUser();

}, []);

// ===================================================
// OUTSIDE CLICK
// ===================================================

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {

        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // ===================================================
  // SIGN OUT
  // ===================================================

  async function handleSignOut() {

    await supabase.auth.signOut();

    window.location.href =
      "/login";
  }

  // ===================================================
  // INITIAL
  // ===================================================

  const initial =
    email.charAt(0).toUpperCase();

  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div
      ref={dropdownRef}
      className="relative left-3"
    >

      {/* ========================================== */}
      {/* AVATAR */}
      {/* ========================================== */}

      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className="
          relative right-3
          flex items-center justify-center
          rounded-full
          border border-slate-800
          bg-slate-950/80
          px-2 py-1.5
          transition-all
          hover:border-slate-700
        "
      >

        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-full
            bg-blue-500/20
            text-sm font-bold
            text-blue-400
          "
        >
          {initial}
        </div>

      </button>

      {/* ========================================== */}
      {/* DROPDOWN */}
      {/* ========================================== */}

      {isOpen && (

        <div
          className="
            absolute right-0 top-16
            z-50
            w-[220px]
            rounded-2xl
            border border-slate-800
            bg-[#060B14]
            shadow-2xl
            overflow-hidden
          "
        >

          {/* ====================================== */}
          {/* OUTER SPACING */}
          {/* ====================================== */}

          <div className="px-[14px] pt-[10px] pb-[10px]">

            <div className="h-[10px]" />

            {/* ================================== */}
            {/* USER INFO */}
            {/* ================================== */}

            <div
              className="
                rounded-xl
                border border-slate-800/70
                bg-slate-900/30
                px-4 py-4
              "
            >

              <p
  className="
    relative left-2
    text-[14px]
                  font-semibold
                  text-white
                "
              >
                {displayName}
              </p>

              <p
  className="
    relative left-2
    mt-1
                  text-xs
                  text-slate-400
                "
              >
                {email}
              </p>

            </div>

            {/* ================================== */}
            {/* GAP */}
            {/* ================================== */}

            <div className="h-[10px]" />

            {/* ================================== */}
            {/* PROFILE */}
            {/* ================================== */}

            <button
  onClick={() =>
    window.location.href = "/profile"
  }
  className="
    flex w-full items-center
    gap-3
    relative left-2
    rounded-xl
    border border-transparent
    px-4 py-3
    text-[14px]
    text-slate-300
    transition-all
    hover:border-slate-800
    hover:bg-slate-900/70
    hover:text-white
  "
>

              <User className="h-4 w-4" />

              <span>
                My Profile
              </span>

            </button>

            

            <div className="h-[2px]" />

            {/* ================================== */}
            {/* GAP */}
            {/* ================================== */}

            <div className="h-[10px]" />

            {/* ================================== */}
            {/* SETTINGS */}
            {/* ================================== */}

            <button
              className="
                flex w-full items-center
                gap-3
                relative left-2
                rounded-xl
                border border-transparent
                px-4 py-3
                text-[14px]
                text-slate-300
                transition-all
                hover:border-slate-800
                hover:bg-slate-900/70
                hover:text-white
              "
            >

              <Settings className="h-4 w-4" />

              <span>
                Account Settings
              </span>

            </button>

            {/* ================================== */}
            {/* GAP */}
            {/* ================================== */}

            <div className="h-[10px]" />

            {/* ================================== */}
            {/* SIGN OUT */}
            {/* ================================== */}

            <button
              onClick={handleSignOut}
              className="
                flex w-full items-center
                gap-3
                relative left-2
                rounded-2xl
                border border-transparent
                px-4 py-3
                text-[14px]
                text-red-400
                transition-all
                hover:border-red-500/20
                hover:bg-red-500/10
              "
            >

              <LogOut className="h-4 w-4" />

              

              <span>
                Sign Out
              </span>


            </button>

<p className="invisible text-[10px]">
  spacer
</p>
          </div>

        </div>

      )}

    </div>
  );
}