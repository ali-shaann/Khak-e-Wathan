import Link from "next/link";

import AuthForms from "@/components/auth/AuthForms";


export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const params =
    await searchParams;


  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between gap-4">

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


              <p className="hidden text-xs text-slate-400 sm:block">
                Property discovery for Chitral
              </p>
            </div>
          </Link>


          <Link
            href="/properties"
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
          >
            Browse properties
          </Link>
        </div>


        <div className="mx-auto mt-12 max-w-2xl text-center sm:mt-16">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Your account
          </p>


          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Welcome to Khak-e-Wathan.
          </h1>


          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
            Sign in to manage your listings, or create an account to list property.
          </p>
        </div>


        {params.error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {
              params.error
            }
          </div>
        )}


        <div className="mt-10">

          <AuthForms />
        </div>


        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-5 text-slate-400">
          Your account is used to manage property listings and review their status.
        </p>
      </div>
    </main>
  );
}
