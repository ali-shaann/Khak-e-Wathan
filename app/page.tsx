import Navbar from "@/components/Navbar";
import LocationSection from "@/components/LocationSection";
import Link from "next/link";

import HomeSearchForm from "@/components/HomeSearchForm";

import {
  getAllProperties,
} from "@/lib/properties";

export default async function Home() {
  const properties =
    await getAllProperties();

  const booniProperties =
    properties.filter(
      (property) =>
        property.locationSlug === "booni"
    );

  const balachProperties =
    properties.filter(
      (property) =>
        property.locationSlug === "balach"
    );
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fa] text-slate-950">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-[-10%] top-[15%] h-[500px] w-[500px] rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <Navbar />
      
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28">
          {/* Hero copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Smarter property discovery across Chitral
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Land decisions,
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                made clearer.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover property through maps, structured information,
              verification, access details, utilities and intelligent valuation —
              all in one place.
            </p>

            {/* Search panel */}
            <div className="mt-9 rounded-3xl border border-white bg-white/80 p-3 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center rounded-2xl bg-slate-100 px-4">
                  <span className="mr-3 text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Search land, areas or property type..."
                    className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <HomeSearchForm />
              </div>

              <div className="flex flex-wrap gap-2 px-1 pb-1 pt-3">
                <span className="text-xs font-medium text-slate-400">
                  Popular:
                </span>

                <LocationChip name="Booni" />
                <LocationChip name="Balach" />
                <LocationChip name="Residential" />
                <LocationChip name="Agricultural" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
              href="/map"
               className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
              Explore interactive map
              </Link>

              <button className="rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white">
                List your property →
              </button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -left-8 top-16 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_35px_100px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl">
              {/* Fake map */}
              <div className="relative h-[470px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50">
                <MapPattern />

                <div className="absolute left-[22%] top-[30%]">
                  <MapPin price="34L" />
                </div>

                <div className="absolute right-[25%] top-[20%]">
                  <MapPin price="58L" />
                </div>

                <div className="absolute bottom-[24%] left-[44%]">
                  <MapPin price="42L" />
                </div>

                {/* Selected property */}
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-20 rounded-xl bg-gradient-to-br from-emerald-200 to-slate-300" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-emerald-700">
                        VERIFIED PROPERTY
                      </p>

                      <p className="mt-1 font-bold">
                        5 Marla Residential Plot
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Booni, Chitral
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        PKR 34L
                      </p>

                      <p className="text-xs text-slate-400">
                        Est. 32–36L
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur">
                  Live map preview
                </div>
              </div>
            </div>

            {/* Floating stat */}
            <div className="absolute -bottom-6 -left-3 hidden rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur sm:block">
              <p className="text-xs text-slate-500">
                Property Passport
              </p>

              <p className="mt-1 font-bold">
                12+ structured fields
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                Access • utilities • terrain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / platform strip */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-4">
          <Metric
            value="2"
            label="Active areas"
          />

          <Metric
            value="Map"
            label="Geographic discovery"
          />

          <Metric
            value="Passport"
            label="Structured property data"
          />

          <Metric
            value="AI"
            label="Explainable valuation"
          />
        </div>
      </section>

      {/* Booni */}
      <LocationSection

      
        eyebrow="EXPLORE BOONI"
        title="Featured in Booni"
        description="Selected properties with detailed access, utility and location information."
        properties={booniProperties}
      />
        
      {/* Balach */}

      <LocationSection
      eyebrow="EXPLORE BALACH"
      title="Featured in Balach"
      description="Discover properties in Balach through a consistent and transparent property profile."
      properties={balachProperties}
      />
      

      {/* Property intelligence section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400">
                PROPERTY INTELLIGENCE
              </p>

              <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-tight sm:text-4xl">
                A listing should tell you more than its price.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-slate-400">
                Khak-e-Wathan turns scattered property details into a consistent
                digital profile that can be understood before visiting the land.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <DarkFeature
                  title="Road & access"
                  detail="Vehicle access and road distance"
                />

                <DarkFeature
                  title="Water & utilities"
                  detail="Essential infrastructure information"
                />

                <DarkFeature
                  title="Verification"
                  detail="Clearly visible completed checks"
                />

                <DarkFeature
                  title="Value estimate"
                  detail="Explainable estimated price range"
                />
              </div>
            </div>

            <div className="relative min-h-[420px] bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-600 p-8 sm:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.32),transparent_35%)]" />

              <div className="relative mx-auto max-w-md rounded-3xl border border-white/30 bg-white/95 p-6 text-slate-950 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      PROPERTY PASSPORT
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      BN-0021
                    </h3>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    4/5 verified
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <PassportRow
                    label="Vehicle access"
                    value="Available"
                  />

                  <PassportRow
                    label="Water"
                    value="Available"
                  />

                  <PassportRow
                    label="Electricity"
                    value="Available"
                  />

                  <PassportRow
                    label="Terrain"
                    value="Mostly flat"
                  />

                  <PassportRow
                    label="Estimated value"
                    value="PKR 32–36L"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">
              EXPANDING ACROSS CHITRAL
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              More locations are next.
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              The same system is designed to support additional Chitral
              communities as listings and local data are added.
            </p>
          </div>

          <button className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm">
            Explore all areas
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ComingSoonCard location="Chitral City" />
          <ComingSoonCard location="Drosh" />
          <ComingSoonCard location="Mastuj" />
          <ComingSoonCard location="Reshun" />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-medium text-white/70">
                Own property in Chitral?
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Create a clearer, smarter listing.
              </h2>

              <p className="mt-3 max-w-xl text-white/80">
                Add structured property information, location, photos and access
                details so buyers understand what you are offering.
              </p>
            </div>

            <button className="self-start rounded-full bg-white px-7 py-4 font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5">
              List a property
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              K
            </div>

            <div>
              <p className="font-bold">
                Khak-e-Wathan
              </p>

              <p className="text-xs text-slate-400">
                Property intelligence for Chitral
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Hackathon prototype
          </p>
        </div>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */



function LocationChip({
  name,
}: {
  name: string;
}) {
  return (
    <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200">
      {name}
    </button>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="border-b border-r border-slate-100 p-6 last:border-r-0 sm:p-7">
      <p className="text-xl font-bold tracking-tight sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

function MapPin({
  price,
}: {
  price: string;
}) {
  return (
    <div className="relative">
      <div className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xl">
        {price}
      </div>

      <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-2 rotate-45 bg-slate-950" />
    </div>
  );
}

function MapPattern() {
  return (
    <>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[15%] top-0 h-full w-px rotate-12 bg-slate-300" />
        <div className="absolute left-[38%] top-0 h-full w-px -rotate-6 bg-slate-300" />
        <div className="absolute right-[22%] top-0 h-full w-px rotate-6 bg-slate-300" />
        <div className="absolute left-0 top-[25%] h-px w-full -rotate-3 bg-slate-300" />
        <div className="absolute left-0 top-[55%] h-px w-full rotate-6 bg-slate-300" />
        <div className="absolute left-0 top-[78%] h-px w-full -rotate-2 bg-slate-300" />
      </div>

      <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-emerald-200/70 blur-2xl" />
      <div className="absolute bottom-24 left-10 h-32 w-32 rounded-full bg-sky-200/60 blur-3xl" />
    </>
  );
}

function DarkFeature({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="font-semibold">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {detail}
      </p>
    </div>
  );
}

function PassportRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function ComingSoonCard({
  location,
}: {
  location: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm">
          ◇
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Soon
        </span>
      </div>

      <p className="mt-7 text-lg font-bold">
        {location}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Chitral
      </p>
    </div>
  );
}