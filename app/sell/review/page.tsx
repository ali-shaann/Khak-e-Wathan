import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  submitListingForReview,
} from "@/app/sell/actions";

export default async function ReviewListingPage({
  searchParams,
}: {
  searchParams: Promise<{
    property?: string;
    error?: string;
  }>;
}) {
  const params =
    await searchParams;

  const propertyId =
    params.property?.trim();

  if (!propertyId) {
    redirect("/dashboard");
  }

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: property,
  } = await supabase
    .from("properties")
    .select(
      `
        id,
        title,
        description,
        property_type,
        listing_status,
        price_pkr,
        area_value,
        area_unit,
        road_access,
        road_type,
        distance_to_main_road_m,
        water_available,
        water_source,
        electricity_available,
        irrigation_available,
        internet_quality,
        terrain,
        slope,
        residential_suitability,
        agricultural_suitability,
        latitude,
        longitude,
        locations (
          name
        )
      `
    )
    .eq(
      "id",
      propertyId
    )
    .eq(
      "seller_id",
      user.id
    )
    .maybeSingle();

  if (!property) {
    redirect("/dashboard");
  }

  const {
  data: propertyImages,
} = await supabase
  .from("property_images")
  .select(`
    id,
    storage_path,
    alt_text,
    display_order,
    is_primary
  `)
  .eq("property_id", property.id)
  .order("display_order", {
    ascending: true,
  });

const reviewImages =
  (propertyImages ?? []).map((image) => {
    const {
      data: publicData,
    } = supabase.storage
      .from("property-images")
      .getPublicUrl(image.storage_path);

    return {
      ...image,
      url: publicData.publicUrl,
    };
  });

  if (
    ![
      "draft",
      "rejected",
    ].includes(
      property.listing_status
    )
  ) {
    redirect("/dashboard");
  }

  // Supabase relation result can sometimes be
  // represented differently depending on generated types.
  type LocationRelation =
  | {
      name: string;
    }
  | {
      name: string;
    }[]
  | null;

const locationRelation =
  property.locations as LocationRelation;

const locationName =
  Array.isArray(locationRelation)
    ? locationRelation[0]?.name ??
      "Location not specified"
    : locationRelation?.name ??
      "Location not specified";

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Progress */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span>
            Property
          </span>

          <span>→</span>

          <span>
            Location
          </span>

          <span>→</span>

          <span>
            Details
          </span>

          <span>→</span>

          <Link
            href={`/sell/photos?property=${encodeURIComponent(
              property.id
            )}`}
            className="transition hover:text-slate-700"
          >
            Photos
          </Link>

          <span>→</span>

          <span className="font-semibold text-slate-950">
            Review
          </span>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Step 06
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Review your property.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-500">
            Check the information below before sending
            your listing to Khak-e-Wathan for review.
          </p>
        </div>

        {params.error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {params.error}
          </div>
        )}

        {/* Main summary */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Draft
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                {property.title}
              </h2>

              <p className="mt-2 text-slate-500">
                {locationName ??
                  "Location not specified"}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Asking price
              </p>

              <p className="mt-1 text-2xl font-bold">
                PKR{" "}
                {Number(
                  property.price_pkr
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8">
            <p className="text-sm leading-7 text-slate-600">
              {property.description}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Photos
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        Property gallery
      </h2>
    </div>

    <Link
      href={`/sell/photos?property=${encodeURIComponent(
        property.id
      )}`}
      className="text-sm font-semibold text-emerald-700"
    >
      Edit photos
    </Link>
  </div>

  {reviewImages.length > 0 ? (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reviewImages.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100"
        >
          <img
            src={image.url}
            alt={
              image.alt_text ??
              `Property photo ${index + 1}`
            }
            className="h-full w-full object-cover"
          />

          {image.is_primary && (
            <span className="absolute left-3 top-3 rounded-full bg-slate-950/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Cover
            </span>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-7 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
      No photos uploaded.
    </div>
  )}
</section>

        {/* Property Passport */}
        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Property Passport
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Listing details
          </h2>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ReviewField
              label="Property type"
              value={formatValue(
                property.property_type
              )}
            />

            <ReviewField
              label="Land size"
              value={`${property.area_value} ${formatAreaUnit(
                property.area_unit
              )}`}
            />

            <ReviewField
              label="Road access"
              value={
                property.road_access
                  ? "Available"
                  : "Not available"
              }
            />

            <ReviewField
              label="Road type"
              value={
                property.road_type ??
                "Not specified"
              }
            />

            <ReviewField
              label="Main road distance"
              value={
                property.distance_to_main_road_m !=
                null
                  ? `${property.distance_to_main_road_m} m`
                  : "Not specified"
              }
            />

            <ReviewField
              label="Water"
              value={
                property.water_available
                  ? property.water_source ||
                    "Available"
                  : "Not available"
              }
            />

            <ReviewField
              label="Electricity"
              value={
                property.electricity_available
                  ? "Available"
                  : "Not available"
              }
            />

            <ReviewField
              label="Irrigation"
              value={
                property.irrigation_available
                  ? "Available"
                  : "Not available"
              }
            />

            <ReviewField
              label="Connectivity"
              value={formatValue(
                property.internet_quality
              )}
            />

            <ReviewField
              label="Terrain"
              value={formatValue(
                property.terrain
              )}
            />

            <ReviewField
              label="Slope"
              value={formatValue(
                property.slope
              )}
            />

            <ReviewField
              label="Residential suitability"
              value={formatValue(
                property.residential_suitability
              )}
            />

            <ReviewField
              label="Agricultural suitability"
              value={formatValue(
                property.agricultural_suitability
              )}
            />

            <ReviewField
              label="Latitude"
              value={
                property.latitude != null
                  ? Number(
                      property.latitude
                    ).toFixed(6)
                  : "Not specified"
              }
            />

            <ReviewField
              label="Longitude"
              value={
                property.longitude != null
                  ? Number(
                      property.longitude
                    ).toFixed(6)
                  : "Not specified"
              }
            />
          </div>
        </section>

        {/* Final action */}
        <section className="mt-6 rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Final step
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Submit for review?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            After submission, the property will enter
            Khak-e-Wathan&apos;s review queue. It will remain
            hidden from the public marketplace until an
            administrator approves it.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/sell/photos?property=${encodeURIComponent(
                property.id
              )}`}
              className="rounded-full border border-white/15 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to photos
            </Link>

            <form
              action={
                submitListingForReview
              }
            >
              <input
                type="hidden"
                name="propertyId"
                value={
                  property.id
                }
              />

              <button
                type="submit"
                className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 sm:w-auto"
              >
                Submit for review
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}


function ReviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}


function formatValue(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


function formatAreaUnit(
  value: string
) {
  if (value === "sq_ft") {
    return "sq ft";
  }

  return value;
}