"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(
    formData.get("email") ?? ""
  ).trim();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    redirect(
      "/login?error=Please enter your email and password."
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const fullName = String(
    formData.get("fullName") ?? ""
  ).trim();

  const email = String(
    formData.get("email") ?? ""
  ).trim();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!fullName || !email || !password) {
    redirect(
      "/login?error=Please complete all signup fields."
    );
  }

  if (password.length < 8) {
    redirect(
      "/login?error=Password must contain at least 8 characters."
    );
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name: fullName,
        },
      },
    });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/", "layout");

  // With email confirmation disabled,
  // signup should create a session immediately.
  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    "/login?error=Account was created but no session was returned."
  );
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}