"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


export type AuthActionState = {
  error:
    | string
    | null;

  message:
    | string
    | null;
};


export async function login(
  _previousState:
    AuthActionState,
  formData:
    FormData
): Promise<AuthActionState> {
  const email =
    String(
      formData.get(
        "email"
      ) ??
        ""
    ).trim();


  const password =
    String(
      formData.get(
        "password"
      ) ??
        ""
    );


  if (
    !email ||
    !password
  ) {
    return {
      error:
        "Enter your email and password.",
      message:
        null,
    };
  }


  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.auth
      .signInWithPassword({
        email,
        password,
      });


  if (
    error
  ) {
    console.error(
      "LOGIN ERROR:",
      error.message
    );


    return {
      error:
        friendlyLoginError(
          error.message
        ),
      message:
        null,
    };
  }


  revalidatePath(
    "/",
    "layout"
  );


  redirect(
    "/dashboard"
  );
}


export async function signup(
  _previousState:
    AuthActionState,
  formData:
    FormData
): Promise<AuthActionState> {
  const fullName =
    String(
      formData.get(
        "fullName"
      ) ??
        ""
    ).trim();


  const email =
    String(
      formData.get(
        "email"
      ) ??
        ""
    ).trim();


  const password =
    String(
      formData.get(
        "password"
      ) ??
        ""
    );


  if (
    !fullName ||
    !email ||
    !password
  ) {
    return {
      error:
        "Complete all account fields.",
      message:
        null,
    };
  }


  if (
    fullName.length <
    2
  ) {
    return {
      error:
        "Enter your name.",
      message:
        null,
    };
  }


  if (
    password.length <
    8
  ) {
    return {
      error:
        "Use at least 8 characters for your password.",
      message:
        null,
    };
  }


  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.auth
      .signUp({
        email,
        password,

        options: {
          data: {
            full_name:
              fullName,
          },
        },
      });


  if (
    error
  ) {
    console.error(
      "SIGNUP ERROR:",
      error.message
    );


    return {
      error:
        friendlySignupError(
          error.message
        ),
      message:
        null,
    };
  }


  revalidatePath(
    "/",
    "layout"
  );


  if (
    data.session
  ) {
    redirect(
      "/dashboard"
    );
  }


  return {
    error:
      null,

    message:
      "Your account was created. Sign in to continue.",
  };
}


export async function logout() {
  const supabase =
    await createClient();


  await supabase.auth
    .signOut();


  revalidatePath(
    "/",
    "layout"
  );


  redirect(
    "/"
  );
}


function friendlyLoginError(
  message:
    string
) {
  const normalized =
    message.toLowerCase();


  if (
    normalized.includes(
      "invalid login credentials"
    ) ||
    normalized.includes(
      "invalid credentials"
    )
  ) {
    return "Email or password is incorrect.";
  }


  if (
    normalized.includes(
      "email not confirmed"
    )
  ) {
    return "Confirm your email before signing in.";
  }


  return "We couldn't sign you in. Check your details and try again.";
}


function friendlySignupError(
  message:
    string
) {
  const normalized =
    message.toLowerCase();


  if (
    normalized.includes(
      "already registered"
    ) ||
    normalized.includes(
      "already exists"
    )
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }


  if (
    normalized.includes(
      "password"
    )
  ) {
    return "Choose a stronger password and try again.";
  }


  return "We couldn't create the account. Check your details and try again.";
}
