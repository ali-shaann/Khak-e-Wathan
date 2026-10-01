import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  logout,
} from "@/app/login/actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string;
  }>;
}) {
  const params =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(
      "full_name, role"
    )
    .eq(
      "id",
      user.id
    )
    .single();

  const {
    data: properties,
  } = await supabase
    .from("properties")
    .select(
      `
        id,
        title,
        listing_status,
        price_pkr,
        created_at
      `
    )
    .eq(
      "seller_id",
      user.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  const listings =
    properties ?? [];

  const pendingCount =
    listings.filter(
      (property) =>
        property.listing_status ===
        "pending_review"
    ).length;

  const draftCount =
  listings.filter(
    (property) =>
      property.listing_status ===
      "draft"
  ).length;

  const activeCount =
    listings.filter(
      (property) =>
        property.listing_status ===
        "active"
    ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white">
              K
            </div>

            <div>
              <p className="font-bold">
                Khak-e-Wathan
              </p>

              <p className="hidden text-xs text-slate-400 sm:block">
                Seller dashboard
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sell Property
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
          Welcome
          {profile?.full_name
            ? `, ${profile.full_name}`
            : ""}
          .
        </h1>

        <p className="mt-3 text-slate-500">
          Manage your Khak-e-Wathan property
          activity from here.
        </p>

        {params.message && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {params.message}
          </div>
        )}

        {/* Stats */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <DashboardCard
            value={String(
              listings.length
            )}
            label="Your properties"
          />

          <DashboardCard
            value={String(
              pendingCount
            )}
            label="Pending review"
          />

          <DashboardCard
            value={String(
              activeCount
            )}
            label="Active listings"
          />
        </div>

        {/* Listings */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Seller listings
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Your properties
              </h2>
            </div>

            <Link
              href="/sell"
              className="self-start rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              + Add property
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="font-semibold">
                No properties yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create your first Khak-e-Wathan listing.
              </p>

              <Link
                href="/sell"
                className="mt-5 inline-block rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                List property
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {listings.map(

                (property) => (
                  <div
                    key={
                      property.id
                    }
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <StatusBadge
                        status={
                          property.listing_status
                        }
                      />

                      <h3 className="mt-3 font-bold">
                        {
                          property.title
                        }
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        PKR{" "}
                        {Number(
                          property.price_pkr
                        ).toLocaleString()}
                      </p>
                    </div>

                    {property.listing_status ===
  "draft" && (
  <Link
    href={`/sell/photos?property=${encodeURIComponent(
      property.id
    )}`}
    className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
  >
    Continue listing →
  </Link>
)}

                    <p className="text-xs text-slate-400">
                      {new Date(
                        property.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {profile?.role ===
          "admin" && (
          <section className="mt-6 rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Administrator
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Admin tools
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Listing approval and verification tools
              are coming in the admin phase.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}


function DashboardCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (
    status === "active"
  ) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        Active
      </span>
    );
  }

  if (
    status ===
    "pending_review"
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
        Pending review
      </span>
    );
  }

  if (
    status === "rejected"
  ) {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-700">
        Needs changes
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      {status.replace(
        "_",
        " "
      )}
    </span>
  );
}