"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/providers/AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {

    if (!loading && !user) {

      router.replace("/login");
    }

  }, [
    user,
    loading,
    router,
  ]);

  // =========================================
  // HYDRATION / SESSION LOADING
  // =========================================

  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#020617]">

        <div className="text-sm font-bold tracking-[0.18em] text-slate-500">

          LOADING SESSION...

        </div>

      </main>
    );
  }

  // =========================================
  // BLOCK RENDER BEFORE REDIRECT
  // =========================================

  if (!user) {
    return null;
  }

  // =========================================
  // AUTHENTICATED APP
  // =========================================

  return <>{children}</>;
}