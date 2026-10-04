import { supabase } from "@/lib/supabase";

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  collegeId: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        college_id: collegeId,
        role: "student",
      },
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}
export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { user: null, profile: null, college: null, error: userError };
  }

  if (!user) {
    return {
      user: null,
      profile: null,
      college: null,
      error: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, college_id, created_at")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { user, profile: null, college: null, error: profileError };
  }

  const { data: college, error: collegeError } = await supabase
    .from("colleges")
    .select("id, name, code")
    .eq("id", profile.college_id)
    .single();

  if (collegeError) {
    return { user, profile, college: null, error: collegeError };
  }

  return { user, profile, college, error: null };
}
