"use client";

import {
  useActionState,
} from "react";

import {
  login,
  signup,
  type AuthActionState,
} from "@/app/login/actions";


const initialState:
  AuthActionState = {
  error:
    null,

  message:
    null,
};


export default function AuthForms() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      <LoginForm />

      <SignupForm />
    </div>
  );
}


function LoginForm() {
  const [
    state,
    formAction,
    pending,
  ] =
    useActionState(
      login,
      initialState
    );


  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Welcome back
      </p>


      <h2 className="mt-2 text-2xl font-bold">
        Sign in
      </h2>


      <p className="mt-2 text-sm leading-6 text-slate-500">
        Access your listings, drafts and property activity.
      </p>


      {state.error && (
        <AuthNotice
          tone="error"
        >
          {
            state.error
          }
        </AuthNotice>
      )}


      <form
        action={
          formAction
        }
        className="mt-7 space-y-5"
      >

        <AuthInput
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={
            pending
          }
        />


        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          disabled={
            pending
          }
        />


        <button
          type="submit"
          disabled={
            pending
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
        >

          {pending && (
            <Spinner />
          )}


          {pending
            ? "Signing in…"
            : "Sign in"}
        </button>
      </form>
    </section>
  );
}


function SignupForm() {
  const [
    state,
    formAction,
    pending,
  ] =
    useActionState(
      signup,
      initialState
    );


  return (
    <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        New to Khak-e-Wathan
      </p>


      <h2 className="mt-2 text-2xl font-bold">
        Create an account
      </h2>


      <p className="mt-2 text-sm leading-6 text-slate-400">
        Create listings and manage them from one place.
      </p>


      {state.error && (
        <AuthNotice
          tone="dark-error"
        >
          {
            state.error
          }
        </AuthNotice>
      )}


      {state.message && (
        <AuthNotice
          tone="dark-success"
        >
          {
            state.message
          }
        </AuthNotice>
      )}


      <form
        action={
          formAction
        }
        className="mt-7 space-y-5"
      >

        <DarkAuthInput
          label="Your name"
          name="fullName"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          minLength={2}
          disabled={
            pending
          }
        />


        <DarkAuthInput
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={
            pending
          }
        />


        <DarkAuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          disabled={
            pending
          }
        />


        <p className="text-xs leading-5 text-slate-500">
          Use at least 8 characters for your password.
        </p>


        <button
          type="submit"
          disabled={
            pending
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
        >

          {pending && (
            <Spinner
              dark
            />
          )}


          {pending
            ? "Creating account…"
            : "Create account"}
        </button>
      </form>
    </section>
  );
}


function AuthInput({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  minLength,
  disabled,
}: {
  label:
    string;

  name:
    string;

  type:
    string;

  placeholder:
    string;

  autoComplete:
    string;

  minLength?:
    number;

  disabled:
    boolean;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {
          label
        }
      </span>


      <input
        required
        name={
          name
        }
        type={
          type
        }
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
        minLength={
          minLength
        }
        disabled={
          disabled
        }
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:cursor-wait disabled:opacity-60"
      />
    </label>
  );
}


function DarkAuthInput({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  minLength,
  disabled,
}: {
  label:
    string;

  name:
    string;

  type:
    string;

  placeholder:
    string;

  autoComplete:
    string;

  minLength?:
    number;

  disabled:
    boolean;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {
          label
        }
      </span>


      <input
        required
        name={
          name
        }
        type={
          type
        }
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
        minLength={
          minLength
        }
        disabled={
          disabled
        }
        className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10 disabled:cursor-wait disabled:opacity-60"
      />
    </label>
  );
}


function AuthNotice({
  tone,
  children,
}: {
  tone:
    | "error"
    | "dark-error"
    | "dark-success";

  children:
    React.ReactNode;
}) {
  const className =
    tone ===
    "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone ===
          "dark-success"
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        : "border-red-400/20 bg-red-400/10 text-red-200";


  return (
    <div
      role="alert"
      aria-live="polite"
      className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${className}`}
    >
      {
        children
      }
    </div>
  );
}


function Spinner({
  dark = false,
}: {
  dark?:
    boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`h-4 w-4 animate-spin rounded-full border-2 border-r-transparent ${
        dark
          ? "border-slate-950"
          : "border-white"
      }`}
    />
  );
}
