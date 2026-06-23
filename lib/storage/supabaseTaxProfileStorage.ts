import { supabase } from "@/lib/supabase";

import {
  TaxProfile,
  SaveTaxProfileInput,
} from "@/lib/types/taxProfile";

/* ==========================================
   LOAD TAX PROFILE
   ========================================== */

export async function loadTaxProfile(): Promise<TaxProfile | null> {

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return null;
  }

  const { data, error } = await supabase
    .from("user_tax_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "FAILED TO LOAD TAX PROFILE:",
      error.message
    );

    return null;
  }

  return data;
}

/* ==========================================
   SAVE TAX PROFILE
   ========================================== */

export async function saveTaxProfile(
  profile: SaveTaxProfileInput
): Promise<void> {

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return;
  }

const { error } = await supabase
  .from("user_tax_profiles")
  .upsert(
    {
      user_id: user.id,

      country: profile.country,
      country_code: profile.country_code,

      province: profile.province,

      entity_type: profile.entity_type,

      tax_rate: profile.tax_rate,

      tax_year: profile.tax_year,

      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error(
      "FAILED TO SAVE TAX PROFILE:",
      error.message
    );

    throw error;
  }
}