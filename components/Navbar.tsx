import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg">
            K
          </div>

          <div>
            <p className="font-bold tracking-tight">
              Khak-e-Wathan
            </p>

            <p className="hidden text-xs text-slate-500 sm:block">
              Property intelligence for Chitral
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <Link
            href="/properties"
            className="transition hover:text-slate-950"
          >
            Explore
          </Link>

          <Link
            href="/map"
            className="transition hover:text-slate-950"
          >
            Map
          </Link>

          <Link
            href="/estimate"
            className="transition hover:text-slate-950"
          >
            Estimate
          </Link>

          <Link
            href="/sell"
            className="transition hover:text-slate-950"
          >
            Sell
          </Link>

          {loggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-950 px-5 py-2.5 font-semibold text-white"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-5 py-2.5 font-semibold text-white"
            >
              Sign In
            </Link>
          )}
        </div>

        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm md:hidden">
          Menu
        </button>
      </nav>
    </header>
  );
}