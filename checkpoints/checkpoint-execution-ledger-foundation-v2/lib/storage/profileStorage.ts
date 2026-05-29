import { supabase } from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

export interface Profile {

  id: string;

  display_name: string;
}

// =====================================================
// LOAD PROFILE
// =====================================================

export async function
loadProfile():
Promise<Profile | null> {

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq(
      "id",
      user.id
    )
    .maybeSingle();

  if (
  error &&
  error.code !== "PGRST116"
) {

  console.error(
    "FAILED TO LOAD PROFILE:",
    error
  );

  return null;
}

  // ===============================================
  // CREATE EMPTY PROFILE
  // ===============================================

  if (!data) {

    const newProfile = {

      id:
        user.id,

      display_name:
        "Elite X User",
    };

    const {
      error: insertError,
    } = await supabase
      .from("profiles")
      .insert(newProfile);

    if (insertError) {

      console.error(
        "FAILED TO CREATE PROFILE:",
        insertError
      );

      return null;
    }

    return newProfile;
  }

  return data;
}

// =====================================================
// UPDATE PROFILE
// =====================================================

export async function
updateProfile(
  displayName: string
): Promise<void> {

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    return;
  }

  const {
    error,
  } = await supabase
    .from("profiles")
    .update({

      display_name:
        displayName,
    })
    .eq(
      "id",
      user.id
    );

  if (error) {

    console.error(
      "FAILED TO UPDATE PROFILE:",
      error
    );
  }
}