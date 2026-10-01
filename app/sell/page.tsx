import LocationPickerShell from "@/components/sell/LocationPickerShell";

import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";

import { createClient } from "@/lib/supabase/server";

import { createListing } from "@/app/sell/actions";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Sell Property
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          Tell us about your property.
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
          Your listing will be submitted for review before becoming visible
          publicly on Khak-e-Wathan.
        </p>

        {params.error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {params.error}
          </div>
        )}

        <form action={createListing} className="mt-10 space-y-6">
          {/* ----------------------------------------------
              BASIC PROPERTY INFO
          ---------------------------------------------- */}

          <FormSection
            eyebrow="01"
            title="Property"
            description="Basic information buyers will see first."
          >
            <FormField label="Listing title" required>
              <input
                required
                name="title"
                type="text"
                placeholder="e.g. 5 Marla Residential Plot"
                className={inputClass}
              />
            </FormField>

            <FormField label="Property type" required>
              <select required name="propertyType" className={inputClass}>
                <option value="">Select type</option>

                <option value="residential">Residential</option>

                <option value="agricultural">Agricultural</option>

                <option value="commercial">Commercial</option>
              </select>
            </FormField>

            <FormField label="Location" required>
              <select required name="locationId" className={inputClass}>
                <option value="">Select location</option>

                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Land size" required>
                <input
                  required
                  min="0.01"
                  step="0.01"
                  name="areaValue"
                  type="number"
                  placeholder="5"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Unit" required>
                <select required name="areaUnit" className={inputClass}>
                  <option value="marla">Marla</option>

                  <option value="kanal">Kanal</option>

                  <option value="sq_ft">Square feet</option>
                </select>
              </FormField>
            </div>

            <FormField label="Asking price (PKR)" required>
              <input
                required
                min="1"
                name="pricePkr"
                type="number"
                placeholder="3400000"
                className={inputClass}
              />
            </FormField>

            <FormField label="Description" required>
              <textarea
                required
                name="description"
                rows={5}
                placeholder="Describe the property, access, surrounding area and anything a buyer should know..."
                className={inputClass}
              />
            </FormField>
          </FormSection>

          <FormSection
            eyebrow="02"
            title="Property location"
            description="Mark the approximate location of the property on the map."
          >
            <LocationPickerShell />

            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              For the demo, sellers should mark an approximate property
              location. Exact parcel boundaries and legal ownership verification
              happen during review.
            </div>
          </FormSection>

          {/* ----------------------------------------------
              ACCESS + UTILITIES
          ---------------------------------------------- */}

          <FormSection
            eyebrow="02"
            title="Access & utilities"
            description="Important practical information about the property."
          >
            <CheckboxField name="roadAccess" label="Vehicle road access" />

            <FormField label="Road type">
              <input
                name="roadType"
                type="text"
                placeholder="e.g. Paved access"
                className={inputClass}
              />
            </FormField>

            <FormField label="Distance to main road (metres)">
              <input
                min="0"
                name="distanceToMainRoadM"
                type="number"
                placeholder="180"
                className={inputClass}
              />
            </FormField>

            <CheckboxField name="waterAvailable" label="Water available" />

            <FormField label="Water source">
              <input
                name="waterSource"
                type="text"
                placeholder="e.g. Local supply"
                className={inputClass}
              />
            </FormField>

            <CheckboxField
              name="electricityAvailable"
              label="Electricity available"
            />

            <CheckboxField
              name="irrigationAvailable"
              label="Irrigation available"
            />

            <FormField label="Internet / mobile connectivity">
              <select name="internetQuality" className={inputClass}>
                <option value="">Not specified</option>

                <option value="poor">Poor</option>

                <option value="fair">Fair</option>

                <option value="good">Good</option>
              </select>
            </FormField>
          </FormSection>

          {/* ----------------------------------------------
              LAND DETAILS
          ---------------------------------------------- */}

          <FormSection
            eyebrow="03"
            title="Land characteristics"
            description="Structured information for the Property Passport."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Terrain">
                <select name="terrain" className={inputClass}>
                  <option value="">Not specified</option>

                  <option value="flat">Flat</option>

                  <option value="mixed">Mixed</option>

                  <option value="sloped">Sloped</option>
                </select>
              </FormField>

              <FormField label="Slope">
                <select name="slope" className={inputClass}>
                  <option value="">Not specified</option>

                  <option value="low">Low</option>

                  <option value="moderate">Moderate</option>

                  <option value="steep">Steep</option>
                </select>
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <SuitabilityField
                name="residentialSuitability"
                label="Residential suitability"
              />

              <SuitabilityField
                name="agriculturalSuitability"
                label="Agricultural suitability"
              />
            </div>
          </FormSection>

          {/* ----------------------------------------------
              SUBMIT
          ---------------------------------------------- */}

          <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Ready to submit?
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Send your property for review.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              The property will not become publicly visible until an
              administrator approves the listing. Photos and exact map location
              will be added in the next stage of the seller workflow.
            </p>

            <button
              type="submit"
              className="mt-7 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5"
            >
              Submit for review
            </button>
          </section>
        </form>
      </section>
    </main>
  );
}

/* ============================================================
   Components
============================================================ */

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white";

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Step {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold">{title}</h2>

        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}

function CheckboxField({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <input name={name} type="checkbox" className="h-4 w-4" />

      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}

function SuitabilityField({ name, label }: { name: string; label: string }) {
  return (
    <FormField label={label}>
      <select name={name} className={inputClass}>
        <option value="">Not specified</option>

        <option value="low">Low</option>

        <option value="moderate">Moderate</option>

        <option value="high">High</option>
      </select>
    </FormField>
  );
}
