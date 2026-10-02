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
    error?: string;
  }>;
}) {
  const params =
    await searchParams;


  /* ============================================================
     AUTH
  ============================================================ */

  const supabase =
    await createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    redirect(
      "/login"
    );
  }


  /* ============================================================
     PROFILE
  ============================================================ */

  const {
    data: profile,
  } =
    await supabase
      .from(
        "profiles"
      )
      .select(
        "full_name, role"
      )
      .eq(
        "id",
        user.id
      )
      .single();


  /* ============================================================
     SELLER LISTINGS
  ============================================================ */

  const {
    data: properties,
    error:
      propertiesError,
  } =
    await supabase
      .from(
        "properties"
      )
      .select(`
        id,
        title,
        listing_status,
        price_pkr,
        review_notes,
        created_at
      `)
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


  if (
    propertiesError
  ) {
    console.error(
      "DASHBOARD LISTINGS ERROR:",
      propertiesError
    );
  }


  const listings =
    properties ?? [];


  /* ============================================================
     STATS
  ============================================================ */

  const pendingCount =
    listings.filter(
      (
        property
      ) =>
        property.listing_status ===
        "pending_review"
    ).length;


  const draftCount =
    listings.filter(
      (
        property
      ) =>
        property.listing_status ===
        "draft"
    ).length;


  const activeCount =
    listings.filter(
      (
        property
      ) =>
        property.listing_status ===
        "active"
    ).length;


  const rejectedCount =
    listings.filter(
      (
        property
      ) =>
        property.listing_status ===
        "rejected"
    ).length;


  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      {/* ========================================================
          DASHBOARD HEADER
      ======================================================== */}

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
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sell Property
            </Link>


            <form
              action={
                logout
              }
            >
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>


      {/* ========================================================
          DASHBOARD CONTENT
      ======================================================== */}

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
          Manage your Khak-e-Wathan property activity
          from here.
        </p>


        {/* ======================================================
            SUCCESS / ERROR MESSAGES
        ====================================================== */}

        {params.message && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {
              params.message
            }
          </div>
        )}


        {params.error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {
              params.error
            }
          </div>
        )}


        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            value={String(
              listings.length
            )}
            label="Your properties"
          />


          <DashboardCard
            value={String(
              draftCount
            )}
            label="Drafts"
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


        {/* ======================================================
            NEEDS ATTENTION
        ====================================================== */}

        {rejectedCount >
          0 && (
          <section className="mt-6 rounded-[1.75rem] border border-red-200 bg-red-50 p-5 sm:p-6">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                  Needs attention
                </p>

                <h2 className="mt-2 text-lg font-bold text-red-950">
                  {rejectedCount}{" "}
                  {rejectedCount ===
                  1
                    ? "listing needs"
                    : "listings need"}{" "}
                  changes
                </h2>

                <p className="mt-1 text-sm text-red-800/70">
                  Review the admin feedback below, make the
                  requested changes, and submit again.
                </p>
              </div>
            </div>
          </section>
        )}


        {/* ======================================================
            LISTINGS
        ====================================================== */}

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
              className="self-start rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + Add property
            </Link>
          </div>


          {/* ====================================================
              EMPTY STATE
          ==================================================== */}

          {listings.length ===
          0 ? (
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

            /* ==================================================
                LISTING ROWS
            ================================================== */

            <div className="mt-8 space-y-4">

              {listings.map(
                (
                  property
                ) => (
                  <article
                    key={
                      property.id
                    }
                    className={`rounded-[1.5rem] border p-5 transition sm:p-6 ${
                      property.listing_status ===
                      "rejected"
                        ? "border-red-200 bg-red-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                      {/* ==========================================
                          LISTING INFORMATION
                      ========================================== */}

                      <div className="min-w-0 flex-1">

                        <StatusBadge
                          status={
                            property.listing_status
                          }
                        />


                        <h3 className="mt-3 text-lg font-bold">
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


                        {/* ========================================
                            REJECTION FEEDBACK
                        ======================================== */}

                        {property.listing_status ===
                          "rejected" && (
                          <div className="mt-4 max-w-2xl rounded-2xl border border-red-100 bg-red-50 px-4 py-4">

                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">
                              Admin feedback
                            </p>


                            <p className="mt-2 text-sm leading-6 text-red-800">
                              {property.review_notes ||
                                "Please update this listing before submitting it again."}
                            </p>
                          </div>
                        )}


                        {/* ========================================
                            DRAFT ACTIONS
                        ======================================== */}

                        {property.listing_status ===
                          "draft" && (
                          <div className="mt-5 flex flex-wrap items-center gap-4">

                            <Link
                              href={`/sell/edit/${encodeURIComponent(
                                property.id
                              )}`}
                              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                            >
                              Edit details
                            </Link>


                            <Link
                              href={`/sell/photos?property=${encodeURIComponent(
                                property.id
                              )}`}
                              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                              Continue listing →
                            </Link>
                          </div>
                        )}


                        {/* ========================================
                            REJECTED ACTION
                        ======================================== */}

                        {property.listing_status ===
                          "rejected" && (
                          <div className="mt-5">

                            <Link
                              href={`/sell/edit/${encodeURIComponent(
                                property.id
                              )}`}
                              className="inline-block rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              Edit listing
                            </Link>
                          </div>
                        )}


                        {/* ========================================
                            ACTIVE LISTING ACTION
                        ======================================== */}

                        {property.listing_status ===
                          "active" && (
                          <div className="mt-5">

                            <Link
                              href={`/properties/${encodeURIComponent(
                                property.id
                              )}`}
                              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                              View public listing →
                            </Link>
                          </div>
                        )}
                      </div>


                      {/* ==========================================
                          DATE / STATUS META
                      ========================================== */}

                      <div className="shrink-0 sm:text-right">

                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Created
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(
                            property.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>


        {/* ======================================================
            ADMIN PANEL LINK
        ====================================================== */}

        {profile?.role ===
          "admin" && (
          <section className="mt-6 rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Administrator
                </p>


                <h2 className="mt-2 text-2xl font-bold">
                  Property review center
                </h2>


                <p className="mt-2 text-sm text-slate-400">
                  Review seller submissions before they
                  become visible to buyers.
                </p>
              </div>


              <Link
                href="/admin"
                className="self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Open admin panel
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}


/* ============================================================
   DASHBOARD STAT CARD
============================================================ */

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


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (
    status ===
    "active"
  ) {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        Active
      </span>
    );
  }


  if (
    status ===
    "pending_review"
  ) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
        Pending review
      </span>
    );
  }


  if (
    status ===
    "rejected"
  ) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-700">
        Needs changes
      </span>
    );
  }


  if (
    status ===
    "draft"
  ) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
        Draft
      </span>
    );
  }


  if (
    status ===
    "sold"
  ) {
    return (
      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700">
        Sold
      </span>
    );
  }


  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      {status.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}