"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function AuthDebug() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-400 shadow-2xl">
        AUTH LOADING...
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-400 shadow-2xl">
      {user ? (
        <div className="space-y-1">
          <p className="text-green-400">
            AUTHENTICATED
          </p>

          <p>{user.email}</p>
        </div>
      ) : (
        <p className="text-red-400">
          NOT AUTHENTICATED
        </p>
      )}
    </div>
  );
}