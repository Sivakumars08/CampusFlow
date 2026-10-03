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