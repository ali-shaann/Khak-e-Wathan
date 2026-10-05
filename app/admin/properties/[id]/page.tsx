import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import PendingSubmitButton from "@/components/sell/PendingSubmitButton";

import {
  createClient,
} from "@/lib/supabase/server";

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
  } =
    await params;

  const query =
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
        "role"
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
      property,
    error,
  } =
    await supabase
      .from(
        "properties"
      )
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
          seller_identity_note,
          property_location_note,
          photos_note,
          ownership_evidence_note,
          physical_inspection_note,
          reviewer_display_name,
          reviewed_at,
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
      (
        image
      ) => {
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

  const primaryImage =
    gallery.find(
      (
        image
      ) =>
        image.is_primary
    ) ??
    gallery[0] ??
    null;

  const secondaryImages =
    primaryImage
      ? gallery.filter(
          (
            image
          ) =>
            image.id !==
            primaryImage.id
        )
      : [];

  type VerificationRow = {
    seller_identity:
      string;
    property_location:
      string;
    photos:
      string;
    ownership_evidence:
      string;
    physical_inspection:
      string;
    seller_identity_note:
      string | null;
    property_location_note:
      string | null;
    photos_note:
      string | null;
    ownership_evidence_note:
      string | null;
    physical_inspection_note:
      string | null;
    reviewer_display_name:
      string | null;
    reviewed_at:
      string | null;
    updated_at:
      string;
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

  const verificationNotes = {
    sellerIdentity:
      verification?.seller_identity_note ??
      "",

    propertyLocation:
      verification?.property_location_note ??
      "",

    photos:
      verification?.photos_note ??
      "",

    ownershipEvidence:
      verification?.ownership_evidence_note ??
      "",

    physicalInspection:
      verification?.physical_inspection_note ??
      "",
  };

  const verificationList = [
    verificationValues.sellerIdentity,
    verificationValues.propertyLocation,
    verificationValues.photos,
    verificationValues.ownershipEvidence,
    verificationValues.physicalInspection,
  ];

  const verifiedCount =
    verificationList.filter(
      (
        status
      ) =>
        status ===
        "verified"
    ).length;

  const pendingCount =
    verificationList.filter(
      (
        status
      ) =>
        status ===
        "pending"
    ).length;

  const isPendingReview =
    property.listing_status ===
    "pending_review";

  const canPublish =
    verificationValues
      .sellerIdentity ===
      "verified" &&
    verificationValues
      .propertyLocation ===
      "verified" &&
    verificationValues
      .photos ===
      "verified";

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <span aria-hidden="true">
              ←
            </span>
            Review queue
          </Link>


          <div className="mt-6 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <StatusBadge
                  status={
                    property.listing_status
                  }
                />


                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {verifiedCount}/5 checks verified
                </span>


                {pendingCount >
                  0 && (
                  <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">
                    {pendingCount} verification pending
                  </span>
                )}
              </div>


              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                {
                  property.title
                }
              </h1>


              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span>
                  {
                    locationName
                  }
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span className="capitalize">
                  {
                    formatValue(
                      property.property_type
                    )
                  }
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span>
                  Seller:{" "}
                  {property.seller_display_name ??
                    "Seller"}
                </span>
              </p>
            </div>


            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 lg:min-w-[250px] lg:text-right">

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Asking price
              </p>


              <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">
                PKR{" "}
                {Number(
                  property.price_pkr
                ).toLocaleString()}
              </p>


              <p className="mt-2 text-xs text-slate-400">
                Submitted{" "}
                {new Date(
                  property.created_at
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {query.error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">

            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>


            <span>
              {
                query.error
              }
            </span>
          </div>
        )}


        {query.message && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">

            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>


            <span>
              {
                query.message
              }
            </span>
          </div>
        )}


        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

          <div className="space-y-6">

            {/* ==================================================
                GALLERY
            ================================================== */}

            {primaryImage ? (
              <section className="grid gap-3 overflow-hidden rounded-[2rem] lg:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)]">

                <div className="relative overflow-hidden rounded-[2rem] bg-slate-100">

                  <img
                    src={
                      primaryImage.url
                    }
                    alt={
                      primaryImage.alt_text ??
                      property.title
                    }
                    className="aspect-[16/10] h-full min-h-[360px] w-full object-cover"
                  />


                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">

                    <span className="rounded-full bg-slate-950/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur">
                      Cover photo
                    </span>


                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
                      {gallery.length}{" "}
                      {gallery.length ===
                      1
                        ? "photo"
                        : "photos"}
                    </span>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">

                  {secondaryImages
                    .slice(
                      0,
                      2
                    )
                    .map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={
                            image.id
                          }
                          className="relative min-h-[180px] overflow-hidden rounded-[1.5rem] bg-slate-100"
                        >

                          <img
                            src={
                              image.url
                            }
                            alt={
                              image.alt_text ??
                              `${property.title} photo ${
                                index +
                                2
                              }`
                            }
                            className="h-full min-h-[180px] w-full object-cover"
                          />


                          {index ===
                            1 &&
                            secondaryImages.length >
                              2 && (
                            <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/35 to-transparent p-4">

                              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                                +{
                                  secondaryImages.length -
                                  2
                                } more
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    )}


                  {secondaryImages.length ===
                    0 && (
                    <div className="col-span-2 flex min-h-[190px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 lg:col-span-1">
                      No additional photos
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
                No uploaded photos
              </div>
            )}


            {/* ==================================================
                OVERVIEW
            ================================================== */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <SectionHeading
                eyebrow="Listing review"
                title="Property overview"
                description="Seller-provided details for this moderation record."
              />


              <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                {
                  property.description
                }
              </p>


              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

                <Field
                  label="Property type"
                  value={
                    formatValue(
                      property.property_type
                    )
                  }
                />


                <Field
                  label="Land size"
                  value={`${property.area_value} ${formatAreaUnit(
                    property.area_unit
                  )}`}
                />


                <Field
                  label="Location"
                  value={
                    locationName
                  }
                />


                <Field
                  label="Road access"
                  value={
                    property.road_access
                      ? "Available"
                      : "Not available"
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
                  label="Main road distance"
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
                    property.internet_quality
                      ? formatValue(
                          property.internet_quality
                        )
                      : "Not specified"
                  }
                />


                <Field
                  label="Terrain"
                  value={
                    property.terrain
                      ? formatValue(
                          property.terrain
                        )
                      : "Not specified"
                  }
                />


                <Field
                  label="Slope"
                  value={
                    property.slope
                      ? formatValue(
                          property.slope
                        )
                      : "Not specified"
                  }
                />


                <Field
                  label="Residential suitability"
                  value={
                    property.residential_suitability
                      ? formatValue(
                          property.residential_suitability
                        )
                      : "Not specified"
                  }
                />


                <Field
                  label="Agricultural suitability"
                  value={
                    property.agricultural_suitability
                      ? formatValue(
                          property.agricultural_suitability
                        )
                      : "Not specified"
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


            {/* ==================================================
                VERIFICATION
            ================================================== */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                <SectionHeading
                  eyebrow="Verification"
                  title="Property verification checklist"
                  description="Record only the checks that have actually been completed."
                />


                <div className="self-start rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    Verified
                  </p>


                  <p className="mt-1 text-xl font-bold text-emerald-950">
                    {verifiedCount}/5
                  </p>
                </div>
              </div>


              {(verification?.reviewed_at ||
                verification?.updated_at) && (
                <p className="mt-4 text-xs text-slate-400">
                  Last reviewed{" "}
                  {new Date(
                    verification.reviewed_at ??
                      verification.updated_at
                  ).toLocaleString()}
                  {verification.reviewer_display_name
                    ? ` by ${verification.reviewer_display_name}`
                    : ""}
                </p>
              )}


              <div className={`mt-6 rounded-[1.5rem] border p-4 ${
                canPublish
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                      canPublish
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}>
                      Publication readiness
                    </p>

                    <p className={`mt-1 text-sm font-semibold ${
                      canPublish
                        ? "text-emerald-950"
                        : "text-amber-950"
                    }`}>
                      {canPublish
                        ? "Core verification is complete."
                        : "Complete the three core checks before publishing."}
                    </p>
                  </div>


                  <div className="flex flex-wrap gap-2">
                    <CoreCheckPill
                      label="Identity"
                      complete={
                        verificationValues
                          .sellerIdentity ===
                        "verified"
                      }
                    />

                    <CoreCheckPill
                      label="Location"
                      complete={
                        verificationValues
                          .propertyLocation ===
                        "verified"
                      }
                    />

                    <CoreCheckPill
                      label="Photos"
                      complete={
                        verificationValues
                          .photos ===
                        "verified"
                      }
                    />
                  </div>
                </div>
              </div>


              <form
                action={
                  updateVerification
                }
                className="mt-7"
              >

                <input
                  type="hidden"
                  name="propertyId"
                  value={
                    property.id
                  }
                />


                <div className="grid gap-4 md:grid-cols-2">

                  <VerificationField
                    label="Seller identity"
                    name="sellerIdentity"
                    noteName="sellerIdentityNote"
                    defaultValue={
                      verificationValues.sellerIdentity
                    }
                    defaultNote={
                      verificationNotes.sellerIdentity
                    }
                    core
                  />


                  <VerificationField
                    label="Property location"
                    name="propertyLocation"
                    noteName="propertyLocationNote"
                    defaultValue={
                      verificationValues.propertyLocation
                    }
                    defaultNote={
                      verificationNotes.propertyLocation
                    }
                    core
                  />


                  <VerificationField
                    label="Photos"
                    name="photos"
                    noteName="photosNote"
                    defaultValue={
                      verificationValues.photos
                    }
                    defaultNote={
                      verificationNotes.photos
                    }
                    core
                  />


                  <VerificationField
                    label="Ownership evidence"
                    name="ownershipEvidence"
                    noteName="ownershipEvidenceNote"
                    defaultValue={
                      verificationValues.ownershipEvidence
                    }
                    defaultNote={
                      verificationNotes.ownershipEvidence
                    }
                  />


                  <VerificationField
                    label="Physical inspection"
                    name="physicalInspection"
                    noteName="physicalInspectionNote"
                    defaultValue={
                      verificationValues.physicalInspection
                    }
                    defaultNote={
                      verificationNotes.physicalInspection
                    }
                  />
                </div>


                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Record the evidence type or a short factual note. Do not enter
                  identity numbers, document numbers, phone numbers, or other
                  sensitive personal information.
                </p>


                <PendingSubmitButton
                  idleLabel="Save verification"
                  pendingLabel="Saving verification…"
                  className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                />
              </form>
            </section>
          </div>


          {/* ====================================================
              STICKY MODERATION PANEL
          ==================================================== */}

          <aside className="space-y-5 lg:sticky lg:top-[92px] lg:self-start">

            <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.75)]">

              <div className="p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Admin review
                </p>


                <h2 className="mt-2 text-2xl font-bold">
                  Review decision
                </h2>


                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Check the listing and verification record before publishing or
                  returning it to the seller.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-3">

                  <SummaryBox
                    label="Verified"
                    value={`${verifiedCount}/5`}
                  />


                  <SummaryBox
                    label="Photos"
                    value={String(
                      gallery.length
                    )}
                  />
                </div>


                <div className="mt-4 rounded-2xl bg-white/[0.06] p-4">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Seller
                  </p>


                  <p className="mt-2 font-semibold text-slate-200">
                    {property.seller_display_name ??
                      "Seller"}
                  </p>
                </div>
              </div>


              {isPendingReview ? (
                <div className="border-t border-white/10 p-6">

                  <form
                    action={
                      approveProperty
                    }
                  >

                    <input
                      type="hidden"
                      name="propertyId"
                      value={
                        property.id
                      }
                    />


                    <p className="text-xs leading-5 text-slate-400">
                      Approval publishes the listing to the public marketplace.
                      Seller identity, location, and photos must be verified
                      first.
                    </p>


                    {canPublish ? (
                      <PendingSubmitButton
                        idleLabel="Approve & publish"
                        pendingLabel="Publishing…"
                        className="mt-4 w-full rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                      />
                    ) : (
                      <span
                        aria-disabled="true"
                        className="mt-4 block w-full cursor-not-allowed rounded-full bg-white/10 px-6 py-3.5 text-center text-sm font-bold text-slate-500"
                      >
                        Complete core verification first
                      </span>
                    )}
                  </form>


                  <div className="my-6 flex items-center gap-3">

                    <div className="h-px flex-1 bg-white/10" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      or request changes
                    </span>

                    <div className="h-px flex-1 bg-white/10" />
                  </div>


                  <form
                    action={
                      rejectProperty
                    }
                  >

                    <input
                      type="hidden"
                      name="propertyId"
                      value={
                        property.id
                      }
                    />


                    <label className="block">

                      <span className="mb-2 block text-sm font-semibold text-slate-300">
                        Feedback for seller
                      </span>


                      <textarea
                        required
                        minLength={5}
                        name="reviewNotes"
                        rows={5}
                        placeholder="Explain what needs to be corrected before resubmission..."
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
                      />
                    </label>


                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      Be specific enough that the seller knows what to change.
                    </p>


                    <PendingSubmitButton
                      idleLabel="Return for changes"
                      pendingLabel="Returning listing…"
                      className="mt-4 w-full rounded-full border border-red-400/30 bg-red-400/10 px-6 py-3.5 text-sm font-bold text-red-300 transition hover:bg-red-400/20"
                    />
                  </form>
                </div>
              ) : (
                <div className="border-t border-white/10 p-6">

                  <div className="rounded-2xl bg-white/[0.06] p-5 text-sm leading-6 text-slate-300">
                    This listing has already been reviewed and no longer accepts
                    moderation actions from this panel.
                  </div>


                  {property.listing_status ===
                    "active" && (
                    <Link
                      href={`/properties/${encodeURIComponent(
                        property.id
                      )}`}
                      className="mt-4 block rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      View public listing
                    </Link>
                  )}
                </div>
              )}
            </section>


            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Moderation snapshot
              </p>


              <div className="mt-4 space-y-3">

                <QuickLine
                  label="Status"
                  value={
                    formatValue(
                      property.listing_status
                    )
                  }
                />


                <QuickLine
                  label="Verification"
                  value={`${verifiedCount}/5 verified`}
                />


                <QuickLine
                  label="Photos"
                  value={`${gallery.length}`}
                />


                <QuickLine
                  label="Location"
                  value={
                    locationName
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}


function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {
          eyebrow
        }
      </p>


      <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
        {
          title
        }
      </h2>


      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>
    </div>
  );
}


function VerificationField({
  label,
  name,
  noteName,
  defaultValue,
  defaultNote,
  core = false,
}: {
  label: string;
  name: string;
  noteName: string;
  defaultValue: string;
  defaultNote: string;
  core?: boolean;
}) {
  const stateClassName =
    defaultValue ===
    "verified"
      ? "border-emerald-200 bg-emerald-50/60"
      : defaultValue ===
          "pending"
        ? "border-amber-200 bg-amber-50/50"
        : "border-slate-100 bg-slate-50";


  return (
    <label className={`block rounded-[1.4rem] border p-4 transition focus-within:border-slate-300 focus-within:bg-white ${stateClassName}`}>

      <span className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        <span>
          {
            label
          }
        </span>

        {core && (
          <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
            Core
          </span>
        )}
      </span>


      <select
        name={
          name
        }
        defaultValue={
          defaultValue
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
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


      <span className="mb-2 mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Evidence note
        {defaultValue ===
          "verified" && (
          <span className="ml-1 text-red-500">
            Required
          </span>
        )}
      </span>


      <textarea
        name={
          noteName
        }
        defaultValue={
          defaultNote
        }
        maxLength={300}
        rows={3}
        placeholder="Example: Photo set matches the submitted location."
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
  );
}


function CoreCheckPill({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
      complete
        ? "border-emerald-200 bg-white text-emerald-700"
        : "border-amber-200 bg-white/70 text-amber-700"
    }`}>
      {complete
        ? "✓ "
        : "○ "}
      {
        label
      }
    </span>
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
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {
          label
        }
      </p>


      <p className="mt-2 text-sm font-semibold text-slate-800">
        {
          value
        }
      </p>
    </div>
  );
}


function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">

      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {
          label
        }
      </p>


      <p className="mt-1.5 text-lg font-bold text-white">
        {
          value
        }
      </p>
    </div>
  );
}


function QuickLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-none last:pb-0">

      <span className="text-xs text-slate-400">
        {
          label
        }
      </span>


      <span className="text-right text-xs font-semibold text-slate-700">
        {
          value
        }
      </span>
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status ===
    "active"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : status ===
          "rejected"
        ? "border-red-100 bg-red-50 text-red-700"
        : "border-amber-100 bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${className}`}
    >
      {
        formatValue(
          status
        )
      }
    </span>
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
