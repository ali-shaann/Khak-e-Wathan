import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import PropertyPassport from "@/components/PropertyPassport";
import VerificationPanel from "@/components/VerificationPanel";

import SinglePropertyMapShell from "@/components/map/SinglePropertyMapShell";

import {
  getPropertyById,
} from "@/lib/properties";



export default async function PropertyPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const property =
  await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link
            href="/properties"
            className="transition hover:text-slate-950"
          >
            Properties
          </Link>

          <span>→</span>

          <span>{property.location}</span>

          <span>→</span>

          <span className="text-slate-700">
            {property.title}
          </span>
        </div>
      </div>

      {/* Main property area */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Image / visual placeholder */}
        <div
          className={`relative h-[340px] overflow-hidden rounded-[2rem] bg-gradient-to-br sm:h-[460px] ${property.gradient}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.8),transparent_30%)]" />

          <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-slate-900/5 [clip-path:polygon(0_80%,15%_40%,30%_65%,48%_15%,65%_60%,80%_25%,100%_70%,100%_100%,0_100%)]" />

          <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur">
            {property.type}
          </div>

          <div className="absolute right-5 top-5 rounded-full bg-slate-950/85 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
            Demo listing
          </div>

          <div className="absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/85 px-5 py-3 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Location
            </p>

            <p className="mt-1 font-bold">
              {property.location}, Chitral
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  {property.location}, Chitral
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  {property.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <SummaryChip text={property.size} />

                  <SummaryChip
                    text={
                      property.roadAccess
                        ? "Road access"
                        : "No road access"
                    }
                  />

                  <SummaryChip
                    text={
                      property.waterAvailable
                        ? "Water available"
                        : "Water unconfirmed"
                    }
                  />

                  <SummaryChip
                    text={
                      property.electricityAvailable
                        ? "Electricity"
                        : "Power unconfirmed"
                    }
                  />
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-sm text-slate-400">
                  Asking price
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {property.price}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
                Contact seller
              </button>

              <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold shadow-sm">
                Save property
              </button>

              <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold shadow-sm">
                Compare
              </button>
            </div>

            {/* Description */}
            <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                About this property
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Property overview
              </h2>

              <p className="mt-5 max-w-3xl leading-7 text-slate-600">
                {property.description}
              </p>
            </section>

            {/* Valuation */}
            <section className="mt-8 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
              <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    Price Intelligence
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    Estimated value
                  </h2>

                  <p className="mt-2 text-3xl font-bold">
                    PKR {property.estimate}
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                    Prototype estimate based on property
                    characteristics and demonstration market
                    data. It is not a formal property
                    appraisal.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Important factors
                  </p>

                  <div className="mt-4 space-y-3 text-sm">
                    {property.roadAccess && (
                      <ValuationFactor>
                        ↑ Road access
                      </ValuationFactor>
                    )}

                    {property.waterAvailable && (
                      <ValuationFactor>
                        ↑ Water availability
                      </ValuationFactor>
                    )}

                    {property.electricityAvailable && (
                      <ValuationFactor>
                        ↑ Electricity access
                      </ValuationFactor>
                    )}

                    {property.slope === "Moderate" && (
                      <ValuationFactor>
                        ↓ Moderate slope
                      </ValuationFactor>
                    )}

                    {property.slope === "Steep" && (
                      <ValuationFactor>
                        ↓ Steeper terrain
                      </ValuationFactor>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            <VerificationPanel
              verification={property.verification}
            />

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Seller
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white">
                  D
                </div>

                <div>
                  <p className="font-bold">
                    {property.sellerName}
                  </p>

                  <p className="text-sm text-slate-400">
                    Hackathon demonstration profile
                  </p>
                </div>
              </div>

              <button className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white">
                Contact seller
              </button>
            </section>
          </aside>
        </div>

        {property.images.length > 0 ? (
  <section className="grid gap-3 lg:grid-cols-3">
    <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 lg:col-span-2">
      <img
        src={
          (
            property.images.find(
              (image) => image.isPrimary
            ) ?? property.images[0]
          ).url
        }
        alt={
          (
            property.images.find(
              (image) => image.isPrimary
            ) ?? property.images[0]
          ).altText ??
          property.title
        }
        className="aspect-[16/10] h-full w-full object-cover"
      />
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
      {property.images
        .filter(
          (image) =>
            !image.isPrimary
        )
        .slice(0, 2)
        .map((image) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-[1.5rem] bg-slate-100"
          >
            <img
              src={image.url}
              alt={
                image.altText ??
                property.title
              }
              className="aspect-[16/10] h-full w-full object-cover"
            />
          </div>
        ))}
    </div>
  </section>
) : (
  <section
    className={`flex aspect-[16/6] items-center justify-center rounded-[2rem] bg-gradient-to-br ${property.gradient}`}
  >
    <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 backdrop-blur">
      Property photos coming soon
    </span>
  </section>
)}

        {/* Passport */}
        <div className="mt-8">
          <PropertyPassport property={property} />
        </div>

        {/* Location placeholder */}
        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Property Location
            </p>

            <h2 className="mt-2 text-2xl font-bold">
            {property.location}, Chitral
       </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Explore the approximate property location and its
        surrounding area.
      </p>
    </div>

    <Link
      href="/map"
      className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      Open full map →
    </Link>
  </div>

  <div className="h-[320px] border-t border-slate-100 sm:h-[400px]">
    <SinglePropertyMapShell
      property={property}
    />
  </div>

  <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
    <p className="text-xs leading-5 text-slate-500">
      Demo property location for the hackathon prototype.
      Production listings would use seller-submitted and
      verified coordinates.
    </p>
  </div>
</section>
      </section>
    </main>
  );
}

function SummaryChip({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
      {text}
    </span>
  );
}

function ValuationFactor({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/[0.06] px-3 py-2 text-slate-200">
      {children}
    </div>
  );
}