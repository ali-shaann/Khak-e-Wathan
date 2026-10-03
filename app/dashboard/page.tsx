import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import PendingSubmitButton from "@/components/sell/PendingSubmitButton";

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


  const countStatus = (
    status: string
  ) =>
    listings.filter(
      (
        listing
      ) =>
        listing.listing_status ===
        status
    ).length;


  const draftCount =
    countStatus(
      "draft"
    );

  const pendingCount =
    countStatus(
      "pending_review"
    );

  const activeCount =
    countStatus(
      "active"
    );

  const rejectedCount =
    countStatus(
      "rejected"
    );


  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Seller workspace
              </p>


              <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Welcome
                {profile?.full_name
                  ? `, ${profile.full_name}`
                  : ""}
                .
              </h1>


              <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                Create listings, continue drafts, respond to review feedback,
                and keep track of what is live.
              </p>
            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                href="/sell"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
              >
                + List property
              </Link>


              <form
                action={
                  logout
                }
              >
                <PendingSubmitButton
                  idleLabel="Sign out"
                  pendingLabel="Signing out…"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                />
              </form>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {params.message && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">

            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>

            <span>
              {
                params.message
              }
            </span>
          </div>
        )}


        {params.error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">

            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <span>
              {
                params.error
              }
            </span>
          </div>
        )}


        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <DashboardStat
            label="All listings"
            value={
              listings.length
            }
            hint="Everything you have created"
          />

          <DashboardStat
            label="Drafts"
            value={
              draftCount
            }
            hint="Still being prepared"
          />

          <DashboardStat
            label="Pending"
            value={
              pendingCount
            }
            hint="Waiting for review"
          />

          <DashboardStat
            label="Active"
            value={
              activeCount
            }
            hint="Visible to buyers"
          />

          <DashboardStat
            label="Needs changes"
            value={
              rejectedCount
            }
            hint="Review feedback received"
            attention={
              rejectedCount >
              0
            }
          />
        </div>


        {rejectedCount >
          0 && (
          <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-red-200 bg-red-50">

            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">
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


                <p className="mt-1 max-w-2xl text-sm leading-6 text-red-800/75">
                  Open the listing below, follow the admin feedback, then
                  continue through photos and final review before resubmitting.
                </p>
              </div>


              <span className="self-start rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm">
                Action required
              </span>
            </div>
          </section>
        )}


        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Your listings
              </p>


              <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                Property activity
              </h2>


              <p className="mt-2 text-sm text-slate-500">
                Each listing shows the next action available at its current stage.
              </p>
            </div>


            <Link
              href="/sell"
              className="self-start rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Create another
            </Link>
          </div>


          {listings.length ===
          0 ? (
            <div className="mt-7 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                ◇
              </div>


              <p className="mt-4 font-bold">
                No properties yet
              </p>


              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Start with the property details, add photos, then review the
                listing before sending it to the admin queue.
              </p>


              <Link
                href="/sell"
                className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
              >
                Create first listing
              </Link>
            </div>
          ) : (
            <div className="mt-7 grid gap-4 lg:grid-cols-2">

              {listings.map(
                (
                  property
                ) => (
                  <ListingCard
                    key={
                      property.id
                    }
                    property={
                      property
                    }
                  />
                )
              )}
            </div>
          )}
        </section>


        {profile?.role ===
          "admin" && (
          <section className="mt-6 rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Administrator
                </p>


                <h2 className="mt-2 text-2xl font-bold">
                  Property review center
                </h2>


                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Review seller submissions, verification checks, approvals,
                  and requested changes.
                </p>
              </div>


              <Link
                href="/admin"
                className="self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
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


type DashboardListing = {
  id: string;
  title: string;
  listing_status: string;
  price_pkr: number | string;
  review_notes: string | null;
  created_at: string;
};


function ListingCard({
  property,
}: {
  property:
    DashboardListing;
}) {
  const isRejected =
    property.listing_status ===
    "rejected";


  return (
    <article
      className={`rounded-[1.6rem] border p-5 transition duration-200 sm:p-6 ${
        isRejected
          ? "border-red-200 bg-red-50/35"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <StatusBadge
            status={
              property.listing_status
            }
          />


          <h3 className="mt-3 line-clamp-2 text-lg font-bold tracking-[-0.01em]">
            {
              property.title
            }
          </h3>


          <p className="mt-1 text-sm font-semibold text-slate-500">
            PKR{" "}
            {Number(
              property.price_pkr
            ).toLocaleString()}
          </p>
        </div>


        <div className="shrink-0 text-right">

          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Created
          </p>


          <p className="mt-1 text-xs text-slate-500">
            {new Date(
              property.created_at
            ).toLocaleDateString()}
          </p>
        </div>
      </div>


      {isRejected && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-white/70 px-4 py-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
            Admin feedback
          </p>


          <p className="mt-2 text-sm leading-6 text-red-800">
            {property.review_notes ||
              "Please update this listing before submitting it again."}
          </p>
        </div>
      )}


      <div className="mt-5 border-t border-slate-100 pt-4">

        {property.listing_status ===
          "draft" && (
          <div className="flex flex-wrap gap-2">

            <Link
              href={`/sell/edit/${encodeURIComponent(
                property.id
              )}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Edit details
            </Link>


            <Link
              href={`/sell/photos?property=${encodeURIComponent(
                property.id
              )}`}
              className="rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Continue listing →
            </Link>
          </div>
        )}


        {property.listing_status ===
          "rejected" && (
          <Link
            href={`/sell/edit/${encodeURIComponent(
              property.id
            )}`}
            className="inline-block rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Fix listing →
          </Link>
        )}


        {property.listing_status ===
          "pending_review" && (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700">

            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />

            Waiting for admin review
          </div>
        )}


        {property.listing_status ===
          "active" && (
          <Link
            href={`/properties/${encodeURIComponent(
              property.id
            )}`}
            className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            View public listing →
          </Link>
        )}
      </div>
    </article>
  );
}


function DashboardStat({
  label,
  value,
  hint,
  attention = false,
}: {
  label: string;
  value: number;
  hint: string;
  attention?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 shadow-sm ${
        attention
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >

      <p
        className={`text-3xl font-bold tracking-[-0.03em] ${
          attention
            ? "text-red-900"
            : "text-slate-950"
        }`}
      >
        {
          value
        }
      </p>


      <p className="mt-2 text-sm font-semibold text-slate-700">
        {
          label
        }
      </p>


      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        {
          hint
        }
      </p>
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    status ===
    "active"
      ? {
          label:
            "Active",
          className:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
        }
      : status ===
          "pending_review"
        ? {
            label:
              "Pending review",
            className:
              "border-amber-100 bg-amber-50 text-amber-700",
          }
        : status ===
            "rejected"
          ? {
              label:
                "Needs changes",
              className:
                "border-red-100 bg-red-50 text-red-700",
            }
          : status ===
              "draft"
            ? {
                label:
                  "Draft",
                className:
                  "border-slate-200 bg-slate-100 text-slate-600",
              }
            : status ===
                "sold"
              ? {
                  label:
                    "Sold",
                  className:
                    "border-sky-100 bg-sky-50 text-sky-700",
                }
              : {
                  label:
                    status.replaceAll(
                      "_",
                      " "
                    ),
                  className:
                    "border-slate-200 bg-slate-100 text-slate-500",
                };


  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.09em] ${config.className}`}
    >
      {
        config.label
      }
    </span>
  );
}
