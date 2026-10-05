import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import MLValuationCard from "@/components/MLValuationCard";
import Navbar from "@/components/Navbar";
import PropertyPassport from "@/components/PropertyPassport";
import PropertyInquiryForm from "@/components/PropertyInquiryForm";
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
    await getPropertyById(
      id
    );


  if (!property) {
    notFound();
  }


  const coverImage =
    property.images.find(
      (
        image
      ) =>
        image.isPrimary
    ) ??
    property.images[0] ??
    null;


  const secondaryImages =
    coverImage
      ? property.images.filter(
          (
            image
          ) =>
            image.id !==
            coverImage.id
        )
      : [];


  const verificationValues =
    Object.values(
      property.verification
    );


  const verifiedCount =
    verificationValues.filter(
      (
        status
      ) =>
        status ===
        "verified"
    ).length;


  const pendingCount =
    verificationValues.filter(
      (
        status
      ) =>
        status ===
        "pending"
    ).length;


  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-7 sm:px-6 sm:pb-10 lg:px-8">

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-400"
          >
            <Link
              href="/"
              className="transition hover:text-slate-700"
            >
              Home
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <Link
              href="/properties"
              className="transition hover:text-slate-700"
            >
              Properties
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span className="max-w-[22rem] truncate text-slate-700">
              {property.title}
            </span>
          </nav>


          <div className="mt-7 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {property.type}
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {property.location}, Chitral
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                  {verifiedCount}/5 checks verified
                </span>
              </div>


              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-[3.4rem] lg:leading-[1.02]">
                {property.title}
              </h1>


              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 sm:text-base">
                <span>{property.size}</span>
                <span className="text-slate-300">•</span>
                <span>{property.location}, Chitral</span>
                <span className="text-slate-300">•</span>
                <span>Approximate map location</span>
              </p>
            </div>


            <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/60 px-5 py-4 shadow-sm lg:min-w-[270px] lg:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Asking price
              </p>

              <p className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950">
                {property.price}
              </p>

              <p className="mt-2 text-xs font-semibold text-emerald-700">
                Estimate: {property.estimate}
              </p>


              <Link
                href="#request-viewing"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 lg:w-auto"
              >
                Request a viewing

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {coverImage ? (
          <section
            aria-label="Property photos"
            className="grid gap-3 overflow-hidden rounded-[2rem] lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)]"
          >
            <div className="group relative overflow-hidden rounded-[2rem] bg-slate-100">
              <img
                src={coverImage.url}
                alt={
                  coverImage.altText ??
                  property.title
                }
                className="aspect-[16/10] h-full min-h-[340px] w-full object-cover transition duration-700 group-hover:scale-[1.015] sm:min-h-[460px]"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/45 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div className="rounded-full border border-white/20 bg-slate-950/75 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
                  Cover photo
                </div>

                <div className="rounded-full border border-white/40 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
                  {property.images.length}{" "}
                  {property.images.length === 1
                    ? "photo"
                    : "photos"}
                </div>
              </div>
            </div>


            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {secondaryImages
                .slice(0, 2)
                .map(
                  (
                    image,
                    index
                  ) => (
                    <div
                      key={image.id}
                      className="group relative min-h-[180px] overflow-hidden rounded-[1.5rem] bg-slate-100"
                    >
                      <img
                        src={image.url}
                        alt={
                          image.altText ??
                          `${property.title} photo ${index + 2}`
                        }
                        className="h-full min-h-[180px] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                      />

                      {index === 1 &&
                        secondaryImages.length > 2 && (
                        <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/35 to-transparent p-4">
                          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                            +{secondaryImages.length - 2} more
                          </span>
                        </div>
                      )}
                    </div>
                  )
                )}


              {secondaryImages.length === 0 && (
                <div
                  className={`col-span-2 flex min-h-[190px] items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${property.gradient} lg:col-span-1`}
                >
                  <span className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur">
                    More photos coming soon
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section
            className={`flex min-h-[360px] items-center justify-center rounded-[2rem] bg-gradient-to-br ${property.gradient}`}
          >
            <span className="rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur">
              Property photos coming soon
            </span>
          </section>
        )}


        <section className="mt-5 grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm sm:grid-cols-3 lg:grid-cols-6">
          <HeroFact label="Area" value={property.size} />
          <HeroFact label="Type" value={property.type} />
          <HeroFact
            label="Road"
            value={property.roadAccess ? "Available" : "No"}
          />
          <HeroFact
            label="Water"
            value={property.waterAvailable ? "Available" : "Not confirmed"}
          />
          <HeroFact
            label="Power"
            value={property.electricityAvailable ? "Available" : "Not confirmed"}
          />
          <HeroFact
            label="Terrain"
            value={property.terrain || "Not specified"}
          />
        </section>


        <nav
          aria-label="Property sections"
          className="mt-5 overflow-x-auto rounded-[1.25rem] border border-slate-200 bg-white p-2 shadow-sm"
        >
          <div className="flex min-w-max items-center gap-1">
            <SectionLink href="#overview" label="Overview" />
            <SectionLink href="#passport" label="Passport" />
            <SectionLink href="#verification" label="Verification" />
            <SectionLink href="#valuation" label="Valuation" />
            <SectionLink href="#location" label="Location" />
            <SectionLink href="#request-viewing" label="Request viewing" />
          </div>
        </nav>


        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_340px] xl:grid-cols-[minmax(0,1.55fr)_360px]">

          <div className="space-y-6">

            <section
              id="overview"
              className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <SectionHeading
                eyebrow="Overview"
                title="About this property"
                description="The seller-provided summary for this listing."
              />

              <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                {property.description}
              </p>
            </section>


            <div
              id="passport"
              className="scroll-mt-28"
            >
              <PropertyPassport
                property={property}
              />
            </div>


            <section
              id="verification"
              className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <SectionHeading
                  eyebrow="Verification"
                  title="What has been checked?"
                  description="These statuses show which parts of this listing have been reviewed by Khak-e-Wathan."
                />

                <div className="self-start rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Completed
                  </p>

                  <p className="mt-1 text-xl font-bold text-emerald-900">
                    {verifiedCount}/5
                  </p>

                  {pendingCount > 0 && (
                    <p className="mt-1 text-[11px] text-amber-700">
                      {pendingCount} pending
                    </p>
                  )}
                </div>
              </div>


              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <VerificationItem
                  label="Seller identity"
                  status={property.verification.sellerIdentity}
                  note={
                    property.verificationDetails
                      .notes.sellerIdentity
                  }
                />

                <VerificationItem
                  label="Property location"
                  status={property.verification.location}
                  note={
                    property.verificationDetails
                      .notes.location
                  }
                />

                <VerificationItem
                  label="Property photos"
                  status={property.verification.photos}
                  note={
                    property.verificationDetails
                      .notes.photos
                  }
                />

                <VerificationItem
                  label="Ownership evidence"
                  status={property.verification.ownershipEvidence}
                  note={
                    property.verificationDetails
                      .notes.ownershipEvidence
                  }
                />

                <VerificationItem
                  label="Physical inspection"
                  status={property.verification.physicalInspection}
                  note={
                    property.verificationDetails
                      .notes.physicalInspection
                  }
                />
              </div>


              {property.verificationDetails
                .reviewedAt && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs leading-5 text-slate-500">
                  Last reviewed{" "}
                  {new Date(
                    property.verificationDetails
                      .reviewedAt
                  ).toLocaleDateString()}
                  {property.verificationDetails
                    .reviewerName
                    ? ` by ${property.verificationDetails.reviewerName}`
                    : ""}
                  . Public notes summarize the check without exposing private
                  documents.
                </div>
              )}


              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-xs leading-5 text-slate-500">
                Verification applies only to the specific checks shown above.
                Buyers should independently review legal documents and property
                details before making a decision.
              </div>
            </section>


            <section
              id="valuation"
              className="scroll-mt-28 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-38px_rgba(15,23,42,0.72)]"
            >
              <div className="border-b border-white/10 p-6 sm:p-8">

                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      Property intelligence
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Explainable valuation
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                      A transparent demo estimate based on the listing&apos;s
                      location, land size, access, utilities and land
                      characteristics.
                    </p>
                  </div>


                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
                      Estimated range
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-[-0.02em] text-white">
                      {property.estimate}
                    </p>

                    <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
                      {property.valuation.dataCompleteness} data completeness
                    </span>
                  </div>
                </div>


                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <ValuationSummary
                    label="Demo baseline"
                    value={`PKR ${property.valuation.baselineRatePerMarla.toLocaleString()} / Marla`}
                  />

                  <ValuationSummary
                    label="Converted area"
                    value={`${property.valuation.areaInMarla.toFixed(2)} Marla`}
                  />

                  <ValuationSummary
                    label="Total adjustment"
                    value={`${
                      property.valuation.totalAdjustmentPercent > 0
                        ? "+"
                        : ""
                    }${property.valuation.totalAdjustmentPercent}%`}
                  />
                </div>


                <MLValuationCard
                  property={property}
                />
              </div>


              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 transition hover:bg-white/[0.03] sm:px-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Why this estimate?
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      View the adjustment factors used by the rule-based model.
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>


                <div className="border-t border-white/10 px-6 pb-7 pt-5 sm:px-8">
                  {property.valuation.factors.length > 0 ? (
                    <div className="space-y-3">
                      {property.valuation.factors.map(
                        (
                          factor,
                          index
                        ) => (
                          <div
                            key={`${factor.label}-${index}`}
                            className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-200">
                                {factor.label}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {factor.explanation}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                                factor.direction === "positive"
                                  ? "bg-emerald-400/10 text-emerald-300"
                                  : factor.direction === "negative"
                                    ? "bg-red-400/10 text-red-300"
                                    : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {factor.impactPercent > 0 ? "+" : ""}
                              {factor.impactPercent}%
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white/[0.05] p-4 text-sm text-slate-400">
                      No additional adjustment factors were applied.
                    </div>
                  )}


                  <div className="mt-6 rounded-2xl border border-amber-300/10 bg-amber-300/[0.06] p-4">
                    <p className="text-xs leading-5 text-amber-100/70">
                      Hackathon demo estimate. Location baselines are synthetic
                      and should not be treated as verified Chitral market
                      prices or a professional appraisal.
                    </p>
                  </div>
                </div>
              </details>
            </section>


            <section
              id="location"
              className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <SectionHeading
                eyebrow="Location"
                title="Approximate property location"
                description="The public marker is rounded and offset from the precise seller-submitted location."
              />


              {property.latitude !== null &&
              property.longitude !== null ? (
                <>
                  <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <SinglePropertyMapShell
                      property={property}
                    />
                  </div>

                  <div className="mt-4 flex flex-col justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center">
                    <span>
                      Approximate coordinates
                    </span>

                    <span className="text-[11px] font-semibold text-slate-600">
                      Exact coordinates withheld for seller privacy
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-6 flex h-[320px] items-center justify-center rounded-[1.5rem] bg-slate-100 text-sm text-slate-400">
                  Map location not available
                </div>
              )}
            </section>
          </div>


          <aside className="space-y-5 lg:sticky lg:top-[92px] lg:self-start">

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-36px_rgba(15,23,42,0.45)]">

              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Property summary
                </p>

                <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">
                  {property.price}
                </p>


                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Khak-e-Wathan estimate
                  </p>

                  <p className="mt-1 font-bold text-emerald-900">
                    {property.estimate}
                  </p>

                  <p className="mt-1 text-[11px] capitalize text-emerald-700/80">
                    {property.valuation.dataCompleteness} data completeness
                  </p>
                </div>


                <div className="mt-6 space-y-4">
                  <QuickDetail label="Property type" value={property.type} />
                  <QuickDetail label="Area" value={property.size} />
                  <QuickDetail
                    label="Road access"
                    value={property.roadAccess ? "Available" : "No"}
                  />
                  <QuickDetail
                    label="Water"
                    value={property.waterAvailable ? "Available" : "Not confirmed"}
                  />
                  <QuickDetail
                    label="Electricity"
                    value={
                      property.electricityAvailable
                        ? "Available"
                        : "Not confirmed"
                    }
                  />
                  <QuickDetail
                    label="Terrain"
                    value={property.terrain || "Not specified"}
                  />
                </div>
              </div>


              <div className="border-t border-slate-100 bg-slate-50/70 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Listed by
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white shadow-sm">
                    {property.sellerName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {property.sellerName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Property seller
                    </p>
                  </div>
                </div>


                <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
                  Use the private viewing-request form below instead of sharing
                  sensitive information publicly.
                </div>
              </div>
            </section>


            <PropertyInquiryForm
              propertyId={
                property.id
              }
              propertyTitle={
                property.title
              }
            />


            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Verification snapshot
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold">
                    {verifiedCount}/5
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    checks verified
                  </p>
                </div>

                <Link
                  href="#verification"
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                >
                  Review checks
                </Link>
              </div>
            </section>


            <Link
              href="/properties"
              className="block rounded-full border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
            >
              ← Back to properties
            </Link>
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
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}


function SectionLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
    >
      {label}
    </Link>
  );
}


function HeroFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-r border-slate-100 p-4 last:border-r-0 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}


function VerificationItem({
  label,
  status,
  note,
}: {
  label: string;
  status: VerificationStatus;
  note: string | null;
}) {
  const display =
    status === "verified"
      ? {
          symbol: "✓",
          text: "Verified",
          className:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
        }
      : status === "pending"
        ? {
            symbol: "○",
            text: "Pending",
            className:
              "border-amber-100 bg-amber-50 text-amber-700",
          }
        : {
            symbol: "—",
            text: "Not checked",
            className:
              "border-slate-200 bg-slate-50 text-slate-500",
          };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-700">
          {label}
        </span>

        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${display.className}`}
        >
          {display.symbol} {display.text}
        </span>
      </div>

      {note && (
        <p className="mt-3 border-t border-slate-200/70 pt-3 text-xs leading-5 text-slate-500">
          {
            note
          }
        </p>
      )}
    </div>
  );
}


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


function ValuationSummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.05] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}
