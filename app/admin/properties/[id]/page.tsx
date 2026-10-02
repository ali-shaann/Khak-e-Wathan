import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

import {
  approveProperty,
  rejectProperty,
  updateVerification,
} from "@/app/admin/actions";


export default async function AdminPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
  error?: string;
  message?: string;
}>;

}) {
  const {
    id,
  } = await params;

  const query =
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
    .select("role")
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
    redirect("/dashboard");
  }

  const {
    data: property,
    error,
  } = await supabase
    .from("properties")
    .select(`
      id,
      title,
      description,
      property_type,
      listing_status,
      price_pkr,
      area_value,
      area_unit,

      latitude,
      longitude,

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

      seller_display_name,
      created_at,

      locations (
        name
      ),

      property_images (
        id,
        storage_path,
        alt_text,
        display_order,
        is_primary
      ),
      property_verifications (
  seller_identity,
  property_location,
  photos,
  ownership_evidence,
  physical_inspection,
  updated_at
)
      
    `)
    .eq(
      "id",
      id
    )
    .maybeSingle();


  if (
    error ||
    !property
  ) {
    notFound();
  }

  const locationRelation =
    property.locations as
      | {
          name: string;
        }
      | {
          name: string;
        }[]
      | null;

  const locationName =
    Array.isArray(
      locationRelation
    )
      ? locationRelation[0]
          ?.name ??
        "Not specified"
      : locationRelation
          ?.name ??
        "Not specified";

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

  const gallery =
    images.map(
      (image) => {
        const {
          data:
            publicData,
        } =
          supabase.storage
            .from(
              "property-images"
            )
            .getPublicUrl(
              image.storage_path
            );

        return {
          ...image,
          url:
            publicData.publicUrl,
        };
      }
    );

    type VerificationRow = {
  seller_identity: string;
  property_location: string;
  photos: string;
  ownership_evidence: string;
  physical_inspection: string;
  updated_at: string;
};

const verificationRelation =
  property.property_verifications as
    | VerificationRow
    | VerificationRow[]
    | null;

const verification =
  Array.isArray(
    verificationRelation
  )
    ? verificationRelation[0] ??
      null
    : verificationRelation;
const verificationValues = {
  sellerIdentity:
    verification?.seller_identity ??
    "not_checked",

  propertyLocation:
    verification?.property_location ??
    "not_checked",

  photos:
    verification?.photos ??
    "not_checked",

  ownershipEvidence:
    verification?.ownership_evidence ??
    "not_checked",

  physicalInspection:
    verification?.physical_inspection ??
    "not_checked",
};

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          ← Review queue
        </Link>

        

        {query.error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {query.error}
          </div>
        )}

        {query.message && (
  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
    {query.message}
  </div>
)}

        <div className="mt-8">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            {property.listing_status.replaceAll(
              "_",
              " "
            )}
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            {property.title}
          </h1>

          <p className="mt-3 text-slate-500">
            {locationName}
            {" · "}
            {
              property.property_type
            }
          </p>
        </div>

        {/* PHOTOS */}

        {gallery.length >
        0 ? (
          <section className="mt-10 grid gap-3 lg:grid-cols-3">
            <div className="overflow-hidden rounded-[2rem] bg-slate-100 lg:col-span-2">
              <img
                src={
                  (
                    gallery.find(
                      (image) =>
                        image.is_primary
                    ) ??
                    gallery[0]
                  ).url
                }
                alt={
                  property.title
                }
                className="aspect-[16/10] h-full w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {gallery
                .filter(
                  (image) =>
                    !image.is_primary
                )
                .slice(
                  0,
                  2
                )
                .map(
                  (image) => (
                    <div
                      key={
                        image.id
                      }
                      className="overflow-hidden rounded-[1.5rem] bg-slate-100"
                    >
                      <img
                        src={
                          image.url
                        }
                        alt={
                          image.alt_text ??
                          property.title
                        }
                        className="aspect-[16/10] h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
            </div>
          </section>
        ) : (
          <div className="mt-10 rounded-[2rem] bg-slate-100 px-6 py-16 text-center text-slate-400">
            No uploaded photos.
          </div>
        )}

        {/* SUMMARY */}

        

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Property details
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Property Passport
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              {
                property.description
              }
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field
                label="Asking price"
                value={`PKR ${Number(
                  property.price_pkr
                ).toLocaleString()}`}
              />

              <Field
                label="Land size"
                value={`${property.area_value} ${property.area_unit}`}
              />

              <Field
                label="Road access"
                value={
                  property.road_access
                    ? "Yes"
                    : "No"
                }
              />

              <Field
                label="Road type"
                value={
                  property.road_type ??
                  "Not specified"
                }
              />

              <Field
                label="Distance to main road"
                value={
                  property.distance_to_main_road_m !=
                  null
                    ? `${property.distance_to_main_road_m} m`
                    : "Not specified"
                }
              />

              <Field
                label="Water"
                value={
                  property.water_available
                    ? property.water_source ??
                      "Available"
                    : "Not available"
                }
              />

              <Field
                label="Electricity"
                value={
                  property.electricity_available
                    ? "Available"
                    : "Not available"
                }
              />

              <Field
                label="Irrigation"
                value={
                  property.irrigation_available
                    ? "Available"
                    : "Not available"
                }
              />

              <Field
                label="Connectivity"
                value={
                  property.internet_quality ??
                  "Not specified"
                }
              />

              <Field
                label="Terrain"
                value={
                  property.terrain ??
                  "Not specified"
                }
              />

              <Field
                label="Slope"
                value={
                  property.slope ??
                  "Not specified"
                }
              />

              <Field
                label="Residential suitability"
                value={
                  property.residential_suitability ??
                  "Not specified"
                }
              />

              <Field
                label="Agricultural suitability"
                value={
                  property.agricultural_suitability ??
                  "Not specified"
                }
              />

              <Field
                label="Latitude"
                value={
                  property.latitude !=
                  null
                    ? Number(
                        property.latitude
                      ).toFixed(
                        6
                      )
                    : "Not specified"
                }
              />

              <Field
                label="Longitude"
                value={
                  property.longitude !=
                  null
                    ? Number(
                        property.longitude
                      ).toFixed(
                        6
                      )
                    : "Not specified"
                }
              />
            </div>

            
          </section>

                
        

          {/* REVIEW PANEL */}
        
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Verification
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        Property verification checklist
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Record what has actually been checked.
        Verification statuses will later appear in the
        public Property Passport.
      </p>
    </div>

    {verification?.updated_at && (
      <p className="text-xs text-slate-400">
        Updated{" "}
        {new Date(
          verification.updated_at
        ).toLocaleString()}
      </p>
    )}
  </div>

  <form
    action={updateVerification}
    className="mt-8"
  >
    <input
      type="hidden"
      name="propertyId"
      value={property.id}
    />

    <div className="grid gap-4 md:grid-cols-2">
      <VerificationSelect
        label="Seller identity"
        name="sellerIdentity"
        defaultValue={
          verificationValues.sellerIdentity
        }
      />

      <VerificationSelect
        label="Property location"
        name="propertyLocation"
        defaultValue={
          verificationValues.propertyLocation
        }
      />

      <VerificationSelect
        label="Photos"
        name="photos"
        defaultValue={
          verificationValues.photos
        }
      />

      <VerificationSelect
        label="Ownership evidence"
        name="ownershipEvidence"
        defaultValue={
          verificationValues.ownershipEvidence
        }
      />

      <VerificationSelect
        label="Physical inspection"
        name="physicalInspection"
        defaultValue={
          verificationValues.physicalInspection
        }
      />
    </div>

    <button
      type="submit"
      className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      Save verification
    </button>
  </form>
</section>

          <aside className="self-start rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Admin review
            </p>
            

            <h2 className="mt-2 text-2xl font-bold">
              Review decision
            </h2>

            <div className="mt-6 rounded-2xl bg-white/[0.06] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Seller
              </p>

              <p className="mt-2 font-semibold">
                {property.seller_display_name ??
                  "Seller"}
              </p>
            </div>

            {property.listing_status ===
            "pending_review" ? (
              <form
                className="mt-6"
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Review notes
                  </span>

                  <textarea
                    name="reviewNotes"
                    rows={5}
                    placeholder="Optional for approval; required for rejection..."
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
                  />
                </label>

                <input
                  type="hidden"
                  name="propertyId"
                  value={
                    property.id
                  }
                />

                <button
                  formAction={
                    approveProperty
                  }
                  className="mt-5 w-full rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  Approve & publish
                </button>

                <button
                  formAction={
                    rejectProperty
                  }
                  className="mt-3 w-full rounded-full border border-red-400/30 bg-red-400/10 px-6 py-3.5 text-sm font-bold text-red-300 transition hover:bg-red-400/20"
                >
                  Reject listing
                </button>
                
              </form>
            ) : (
                
              <div className="mt-6 rounded-2xl bg-white/[0.06] p-5 text-sm text-slate-300">
                This listing has already
                been reviewed.
              </div>
            )}
            
          </aside>
        </div>
      </section>
    </main>
  );
}

function VerificationSelect({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block rounded-2xl bg-slate-50 p-4">
      <span className="mb-3 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
      >
        <option value="not_checked">
          Not checked
        </option>

        <option value="pending">
          Pending
        </option>

        <option value="verified">
          Verified
        </option>
      </select>
    </label>
  );
}

function Field({
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