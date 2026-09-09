import { supabase } from "@/lib/supabase";

// =====================================================
// ACCOUNT OPTION
// =====================================================

export interface AccountOption {
  value: string;
  label: string;
  source: "broker" | "manual";
}

// =====================================================
// LOAD PREVIOUSLY USED MANUAL ACCOUNTS
// =====================================================
//
// Reads account values already stored in executions.
//
// RLS protects this query so the authenticated user
// only receives their own execution rows.
//
// =====================================================

export async function
loadManualAccountOptions():
Promise<AccountOption[]> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return [];
  }

  // ===================================================
  // LOAD ACCOUNT VALUES
  // ===================================================

const {
  data,
  error,
} = await supabase
  .from("executions")
  .select("account")
  .eq(
    "user_id",
    user.id
  )
  .not(
    "account",
    "is",
    null
  )
  .order(
    "created_at",
    { ascending: false }
  )
  .limit(1000);

  if (error) {

    console.error(
      "FAILED TO LOAD MANUAL ACCOUNT OPTIONS:",
      error
    );

    return [];
  }


  // ===================================================
  // NORMALIZE + DEDUPLICATE
  // ===================================================

  const uniqueAccounts =
    Array.from(
      new Set(
        (data || [])
          .map(
            (row) =>
              String(
                row.account || ""
              ).trim()
          )
          .filter(Boolean)
      )
    );

  // ===================================================
  // RETURN OPTIONS
  // ===================================================


  return uniqueAccounts.map(
    (account) => ({
      value: account,
      label: account,
      source: "manual",
    })
  );
}