import Link from "next/link";

import {
  login,
  signup,
} from "@/app/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white">
            K
          </div>

          <div>
            <p className="font-bold">
              Khak-e-Wathan
            </p>

            <p className="text-xs text-slate-400">
              Property intelligence for Chitral
            </p>
          </div>
        </Link>

        <div className="mt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Your account
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Welcome to Khak-e-Wathan.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Sign in to manage your property activity,
            or create an account to start listing property.
          </p>
        </div>

        {params.error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {params.error}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* LOGIN */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Existing user
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Sign in
            </h2>

            <form
              action={login}
              className="mt-7 space-y-5"
            >
              <AuthInput
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
              />

              <AuthInput
                label="Password"
                name="password"
                type="password"
                placeholder="Your password"
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>
          </section>

          {/* SIGNUP */}
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              New user
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Create account
            </h2>

            <form
              action={signup}
              className="mt-7 space-y-5"
            >
              <DarkAuthInput
                label="Your name"
                name="fullName"
                type="text"
                placeholder="Your name"
              />

              <DarkAuthInput
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
              />

              <DarkAuthInput
                label="Password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-950"
              >
                Create account
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function AuthInput({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
      />
    </label>
  );
}

function DarkAuthInput({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
      />
    </label>
  );
}