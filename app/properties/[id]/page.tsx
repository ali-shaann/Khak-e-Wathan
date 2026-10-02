import Link from "next/link";
import { notFound } from "next/navigation";

import MLValuationCard from "@/components/MLValuationCard";

import Navbar from "@/components/Navbar";
import PropertyPassport from "@/components/PropertyPassport";

import SinglePropertyMapShell from "@/components/map/SinglePropertyMapShell";

import {
  getPropertyById,
} from "@/lib/properties";

import type {
  VerificationStatus,
} from "@/types/property";


export default async function PropertyPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } = await params;

  const property =
    await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const coverImage =
    property.images.find(
      (image) =>
        image.isPrimary
    ) ??
    property.images[0] ??
    null;

  const secondaryImages =
    coverImage
      ? property.images.filter(
          (image) =>
            image.id !==
            coverImage.id
        )
      : [];

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ==================================================
            BREADCRUMBS
        ================================================== */}

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link
            href="/"
            className="transition hover:text-slate-700"
          >
            Home
          </Link>

          <span>→</span>

          <Link
            href="/properties"
            className="transition hover:text-slate-700"
          >
            Properties
          </Link>

          <span>→</span>

          <span className="text-slate-700">
            {property.title}
          </span>
        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {property.type}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {property.location}
              </span>
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {property.title}
            </h1>

            <p className="mt-4 text-slate-500">
              {property.size}
              {" · "}
              {property.location}
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Asking price
            </p>

            <p className="mt-2 text-3xl font-bold">
              {property.price}
            </p>
          </div>
        </div>


        {/* ==================================================
            PHOTO GALLERY
        ================================================== */}

        {coverImage ? (
          <section className="mt-10 grid gap-3 lg:grid-cols-3">

            <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 lg:col-span-2">
              <img
                src={
                  coverImage.url
                }
                alt={
                  coverImage.altText ??
                  property.title
                }
                className="aspect-[16/10] h-full w-full object-cover"
              />

              <div className="absolute bottom-4 left-4">
                <span className="rounded-full bg-slate-950/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                  Cover photo
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
                      className="overflow-hidden rounded-[1.5rem] bg-slate-100"
                    >
                      <img
                        src={
                          image.url
                        }
                        alt={
                          image.altText ??
                          `${property.title} photo ${
                            index + 2
                          }`
                        }
                        className="aspect-[16/10] h-full w-full object-cover"
                      />
                    </div>
                  )
                )}

              {secondaryImages.length ===
                0 && (
                <div
                  className={`flex min-h-[180px] items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${property.gradient}`}
                >
                  <span className="text-sm font-medium text-slate-400">
                    More photos coming soon
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section
            className={`mt-10 flex aspect-[16/6] items-center justify-center rounded-[2rem] bg-gradient-to-br ${property.gradient}`}
          >
            <span className="rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur">
              Property photos coming soon
            </span>
          </section>
        )}


        {/* ==================================================
            PAGE GRID
        ================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-6">

            {/* DESCRIPTION */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Overview
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                About this property
              </h2>

              <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
                {property.description}
              </p>
            </section>


            {/* PROPERTY PASSPORT */}

            <PropertyPassport
              property={property}
            />


            {/* ==================================================
                VERIFICATION
            ================================================== */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Verification
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                What has been checked?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                These statuses show which parts of this
                listing have been reviewed by
                Khak-e-Wathan.
              </p>

              <div className="mt-7 space-y-3">
                <VerificationItem
                  label="Seller identity"
                  status={
                    property.verification
                      .sellerIdentity
                  }
                />

                <VerificationItem
                  label="Property location"
                  status={
                    property.verification
                      .location
                  }
                />

                <VerificationItem
                  label="Property photos"
                  status={
                    property.verification
                      .photos
                  }
                />

                <VerificationItem
                  label="Ownership evidence"
                  status={
                    property.verification
                      .ownershipEvidence
                  }
                />

                <VerificationItem
                  label="Physical inspection"
                  status={
                    property.verification
                      .physicalInspection
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-xs leading-5 text-slate-500">
                Verification applies only to the specific
                checks shown above. Buyers should still
                independently review legal documents and
                property details before making a decision.
              </div>
            </section>


            {/* ==================================================
                EXPLAINABLE VALUATION
            ================================================== */}

            <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    Property Intelligence
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Explainable valuation
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                    Khak-e-Wathan estimates a value range
                    using location, land size, access,
                    utilities and land characteristics.
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Estimated range
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {property.estimate}
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
                    {
                      property.valuation
                        .confidence
                    }{" "}
                    confidence
                  </span>
                </div>
              </div>


              {/* VALUATION SUMMARY */}

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ValuationSummary
                  label="Demo baseline"
                  value={`PKR ${property.valuation.baselineRatePerMarla.toLocaleString()} / Marla`}
                />

                <ValuationSummary
                  label="Converted area"
                  value={`${property.valuation.areaInMarla.toFixed(
                    2
                  )} Marla`}
                />

                <ValuationSummary
                  label="Total adjustment"
                  value={`${
                    property.valuation
                      .totalAdjustmentPercent >
                    0
                      ? "+"
                      : ""
                  }${
                    property.valuation
                      .totalAdjustmentPercent
                  }%`}
                />
              </div>

              <MLValuationCard
  property={property}
/>


              {/* FACTORS */}

              <div className="mt-8 border-t border-white/10 pt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Why this estimate?
                </p>

                {property.valuation
                  .factors.length >
                0 ? (
                  <div className="mt-4 space-y-3">
                    {property.valuation.factors.map(
                      (
                        factor,
                        index
                      ) => (
                        <div
                          key={`${factor.label}-${index}`}
                          className="flex flex-col justify-between gap-3 rounded-2xl bg-white/[0.06] p-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-200">
                              {
                                factor.label
                              }
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {
                                factor.explanation
                              }
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                              factor.direction ===
                              "positive"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : factor.direction ===
                                    "negative"
                                  ? "bg-red-400/10 text-red-300"
                                  : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {factor.impactPercent >
                            0
                              ? "+"
                              : ""}
                            {
                              factor.impactPercent
                            }
                            %
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-white/[0.06] p-4 text-sm text-slate-400">
                    No additional adjustment factors were
                    applied.
                  </div>
                )}
              </div>


              {/* DISCLAIMER */}

              <div className="mt-7 rounded-2xl border border-amber-300/10 bg-amber-300/[0.06] p-4">
                <p className="text-xs leading-5 text-amber-100/70">
                  Hackathon demo estimate. Location
                  baselines are synthetic and should not
                  be treated as verified Chitral market
                  prices or a professional appraisal.
                </p>
              </div>
            </section>


            {/* ==================================================
                LOCATION MAP
            ================================================== */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Location
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Property location
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Map coordinates show the approximate
                location supplied for this listing.
              </p>

              {property.latitude !== null &&
              property.longitude !== null ? (
                <>
                  <div className="mt-6 overflow-hidden rounded-[1.5rem]">
                    <SinglePropertyMapShell
                      property={property}
                    />
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Approximate coordinates:{" "}
                    {property.latitude.toFixed(
                      6
                    )}
                    ,{" "}
                    {property.longitude.toFixed(
                      6
                    )}
                  </p>
                </>
              ) : (
                <div className="mt-6 flex h-[320px] items-center justify-center rounded-[1.5rem] bg-slate-100 text-sm text-slate-400">
                  Map location not available
                </div>
              )}
            </section>
          </div>


          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">

            {/* PRICE */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Asking price
              </p>

              <p className="mt-2 text-3xl font-bold">
                {property.price}
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Khak-e-Wathan estimate
                </p>

                <p className="mt-2 font-semibold text-emerald-700">
                  {property.estimate}
                </p>
              </div>
            </section>


            {/* SELLER */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Listed by
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 font-bold text-white">
                  {property.sellerName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="font-bold">
                    {
                      property.sellerName
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Property seller
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white"
              >
                Contact seller
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                Contact functionality will be connected in
                a later phase.
              </p>
            </section>


            {/* QUICK DETAILS */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                At a glance
              </p>

              <div className="mt-5 space-y-4">
                <QuickDetail
                  label="Property type"
                  value={
                    property.type
                  }
                />

                <QuickDetail
                  label="Area"
                  value={
                    property.size
                  }
                />

                <QuickDetail
                  label="Road access"
                  value={
                    property.roadAccess
                      ? "Yes"
                      : "No"
                  }
                />

                <QuickDetail
                  label="Water"
                  value={
                    property.waterAvailable
                      ? "Available"
                      : "Not available"
                  }
                />

                <QuickDetail
                  label="Electricity"
                  value={
                    property.electricityAvailable
                      ? "Available"
                      : "Not available"
                  }
                />

                <QuickDetail
                  label="Terrain"
                  value={
                    property.terrain
                  }
                />
              </div>
            </section>


            <Link
              href="/properties"
              className="block rounded-full border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-semibold shadow-sm transition hover:bg-slate-50"
            >
              ← Back to properties
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}


/* ============================================================
   VERIFICATION ITEM
============================================================ */

function VerificationItem({
  label,
  status,
}: {
  label: string;
  status: VerificationStatus;
}) {
  const display =
    status ===
    "verified"
      ? {
          symbol:
            "✓",

          text:
            "Verified",

          className:
            "bg-emerald-50 text-emerald-700",
        }
      : status ===
          "pending"
        ? {
            symbol:
              "○",

            text:
              "Pending",

            className:
              "bg-amber-50 text-amber-700",
          }
        : {
            symbol:
              "—",

            text:
              "Not checked",

            className:
              "bg-slate-100 text-slate-500",
          };

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <span
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${display.className}`}
      >
        {display.symbol}{" "}
        {display.text}
      </span>
    </div>
  );
}


/* ============================================================
   QUICK DETAIL
============================================================ */

function QuickDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}


/* ============================================================
   VALUATION SUMMARY
============================================================ */

function ValuationSummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}