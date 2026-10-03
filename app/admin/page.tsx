import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";

import {
  createClient,
} from "@/lib/supabase/server";


export default async function AdminPage({
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
    data:
      profile,
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
      .maybeSingle();

  if (
    !profile ||
    profile.role !==
      "admin"
  ) {
    redirect(
      "/dashboard"
    );
  }

  const {
    data:
      properties,
    error,
  } =
    await supabase
      .from(
        "properties"
      )
      .select(`
        id,
        title,
        price_pkr,
        area_value,
        area_unit,
        property_type,
        seller_display_name,
        created_at,

        locations (
          name
        ),

        property_images (
          storage_path,
          is_primary,
          display_order
        )
      `)
      .eq(
        "listing_status",
        "pending_review"
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      );

  if (
    error
  ) {
    console.error(
      "ADMIN QUEUE ERROR:",
      error
    );
  }

  const pendingProperties =
    properties ??
    [];

  const oldestSubmission =
    pendingProperties[0]
      ?.created_at ??
    null;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Property review queue.
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                Review seller submissions, record verification checks, and make
                the final moderation decision before a listing reaches buyers.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
            >
              Seller dashboard
            </Link>
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
              {params.message}
            </span>
          </div>
        )}

        {params.error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>
            <span>
              {params.error}
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <QueueStat
            label="Pending review"
            value={String(
              pendingProperties.length
            )}
            hint="Listings currently waiting for an admin decision"
          />

          <QueueStat
            label="Oldest waiting"
            value={
              oldestSubmission
                ? formatWaitingTime(
                    oldestSubmission
                  )
                : "—"
            }
            hint={
              oldestSubmission
                ? "Time since the oldest pending listing was created"
                : "No listings are waiting"
            }
          />
        </div>

        {pendingProperties.length ===
        0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Review queue is clear
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              New seller submissions will appear here automatically after the
              seller completes the details, photos, and final-review stages.
            </p>
          </div>
        ) : (
          <section className="mt-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Moderation queue
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Waiting for review
                </h2>
              </div>

              <p className="text-xs text-slate-400">
                Oldest submissions appear first
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {pendingProperties.map(
                (
                  property
                ) => {
                  const relation =
                    property.locations;

                  const location =
                    Array.isArray(
                      relation
                    )
                      ? relation[0]
                      : relation;

                  const images =
                    [
                      ...(
                        property.property_images ??
                        []
                      ),
                    ].sort(
                      (
                        a,
                        b
                      ) =>
                        a.display_order -
                        b.display_order
                    );

                  const primary =
                    images.find(
                      (
                        image
                      ) =>
                        image.is_primary
                    ) ??
                    images[0];

                  let imageUrl:
                    | string
                    | null =
                    null;

                  if (
                    primary
                  ) {
                    const {
                      data:
                        publicData,
                    } =
                      supabase.storage
                        .from(
                          "property-images"
                        )
                        .getPublicUrl(
                          primary.storage_path
                        );

                    imageUrl =
                      publicData.publicUrl;
                  }

                  return (
                    <Link
                      key={
                        property.id
                      }
                      href={`/admin/properties/${encodeURIComponent(
                        property.id
                      )}`}
                      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                    >
                      <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                        {imageUrl ? (
                          <img
                            src={
                              imageUrl
                            }
                            alt={
                              property.title
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-200 text-sm font-medium text-slate-400">
                            No property photo
                          </div>
                        )}

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-amber-50/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 shadow-sm backdrop-blur">
                            Pending review
                          </span>

                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
                            {images.length}{" "}
                            {images.length ===
                            1
                              ? "photo"
                              : "photos"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-700">
                              {formatValue(
                                property.property_type
                              )}
                            </p>

                            <h3 className="mt-2 line-clamp-2 text-xl font-bold tracking-[-0.02em]">
                              {property.title}
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                              {location?.name ??
                                "Chitral"}{" "}
                              ·{" "}
                              {property.area_value}{" "}
                              {formatAreaUnit(
                                property.area_unit
                              )}
                            </p>
                          </div>

                          <p className="shrink-0 text-xs text-slate-400">
                            {formatWaitingTime(
                              property.created_at
                            )}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Seller
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                              {property.seller_display_name ??
                                "Seller"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Asking price
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-950">
                              PKR{" "}
                              {Number(
                                property.price_pkr
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="text-xs font-semibold text-slate-500">
                            Open full moderation record
                          </span>

                          <span className="text-sm font-bold text-slate-950 transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}


function QueueStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        {hint}
      </p>
    </div>
  );
}


function formatValue(
  value:
    string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );
}


function formatAreaUnit(
  value:
    string
) {
  if (
    value ===
    "sq_ft"
  ) {
    return "sq ft";
  }

  return value;
}


function formatWaitingTime(
  createdAt:
    string
) {
  const created =
    new Date(
      createdAt
    ).getTime();

  const elapsed =
    Math.max(
      0,
      Date.now() -
        created
    );

  const hours =
    Math.floor(
      elapsed /
        (
          1000 *
          60 *
          60
        )
    );

  if (
    hours <
    1
  ) {
    return "< 1 hour";
  }

  if (
    hours <
    24
  ) {
    return `${hours}h`;
  }

  const days =
    Math.floor(
      hours /
        24
    );

  return `${days}d`;
}
