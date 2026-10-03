import Link from "next/link";

import BrandMark from "@/components/BrandMark";

import {
  createClient,
} from "@/lib/supabase/server";


const navItems = [
  {
    href: "/properties",
    label: "Explore",
  },
  {
    href: "/map",
    label: "Map",
  },
];


export default async function Navbar() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  const loggedIn =
    Boolean(user);

  const accountHref =
    loggedIn
      ? "/dashboard"
      : "/login";

  const accountLabel =
    loggedIn
      ? "Dashboard"
      : "Sign In";


  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">

      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Khak-e-Wathan home"
        >
          <BrandMark
            size={40}
            className="shrink-0 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.5)] transition duration-300 group-hover:-translate-y-0.5"
          />

          <div>
            <p className="font-bold tracking-[-0.025em] text-slate-950">
              Khak-e-Wathan
            </p>

            <p className="hidden text-xs text-slate-500 sm:block">
              Property discovery for Chitral
            </p>
          </div>
        </Link>


        <div className="hidden items-center gap-1 md:flex">

          <div className="mr-3 flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1">
            {navItems.map(
              (
                item
              ) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition duration-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                >
                  {
                    item.label
                  }
                </Link>
              )
            )}
          </div>


          <Link
            href={
              accountHref
            }
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {
              accountLabel
            }
          </Link>


          <Link
            href="/sell"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            List property
          </Link>
        </div>


        <details className="nav-details group relative md:hidden">

          <summary className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">

            Menu

            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4 transition duration-200 group-open:rotate-180"
            >
              <path
                d="m6 8 4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>


          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_-25px_rgba(15,23,42,0.45)]">

            {navItems.map(
              (
                item
              ) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  {
                    item.label
                  }
                </Link>
              )
            )}


            <Link
              href="/sell"
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
            >
              List property
            </Link>


            <div className="my-2 h-px bg-slate-100" />


            <Link
              href={
                accountHref
              }
              className="block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {
                accountLabel
              }
            </Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
