import Link from "next/link";

import Navbar from "@/components/Navbar";


export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">

        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:p-12">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
            404
          </div>


          <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Page not found
          </p>


          <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            We couldn&apos;t find that page.
          </h1>


          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
            The page may have moved or may no longer be available.
            You can continue exploring available properties instead.
          </p>


          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/properties"
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Explore properties
            </Link>


            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
