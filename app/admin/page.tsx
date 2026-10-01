import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";


export default async function AdminPage({
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
    .maybeSingle();

  if (
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  const {
    data: properties,
    error,
  } = await supabase
    .from("properties")
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
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "ADMIN QUEUE ERROR:",
      error
    );
  }

  const pendingProperties =
    properties ?? [];

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Administration
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Review queue.
            </h1>

            <p className="mt-4 max-w-2xl text-slate-500">
              Review seller-submitted properties before
              they become publicly visible on
              Khak-e-Wathan.
            </p>
          </div>

          <div className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            {pendingProperties.length} pending
          </div>
        </div>

        {params.message && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {params.message}
          </div>
        )}

        {pendingProperties.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Review queue is clear.
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New seller submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {pendingProperties.map(
              (property) => {
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
                    (image) =>
                      image.is_primary
                  ) ??
                  images[0];

                let imageUrl:
                  | string
                  | null =
                  null;

                if (primary) {
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
                    href={`/admin/properties/${property.id}`}
                    className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="aspect-[16/8] overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl
                          }
                          alt={
                            property.title
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-200 text-sm text-slate-400">
                          No property photo
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                          Pending review
                        </span>

                        <span className="text-xs text-slate-400">
                          {new Date(
                            property.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-bold">
                        {property.title}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        {location?.name ??
                          "Chitral"}{" "}
                        ·{" "}
                        {
                          property.area_value
                        }{" "}
                        {
                          property.area_unit
                        }
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400">
                            Seller
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {property.seller_display_name ??
                              "Seller"}
                          </p>
                        </div>

                        <p className="font-bold">
                          PKR{" "}
                          {Number(
                            property.price_pkr
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}