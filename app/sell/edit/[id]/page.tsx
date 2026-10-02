import {
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";

import LocationPickerShell from "@/components/sell/LocationPickerShell";

import {
  updateListing,
} from "@/app/sell/actions";

import {
  createClient,
} from "@/lib/supabase/server";


export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
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
      property,

    error:
      propertyError,
  } =
    await supabase
      .from(
        "properties"
      )
      .select(`
        id,
        seller_id,
        listing_status,

        title,
        description,

        location_id,
        property_type,

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

        review_notes
      `)
      .eq(
        "id",
        id
      )
      .eq(
        "seller_id",
        user.id
      )
      .maybeSingle();


  if (
    propertyError ||
    !property
  ) {
    redirect(
      "/dashboard?error=Property not found."
    );
  }


  if (
    ![
      "draft",
      "rejected",
    ].includes(
      property.listing_status
    )
  ) {
    redirect(
      "/dashboard?error=This listing cannot currently be edited."
    );
  }


  const {
    data:
      locations,
  } =
    await supabase
      .from(
        "locations"
      )
      .select(
        "id, name"
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "display_order",
        {
          ascending: true,
        }
      );


  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Edit property
        </p>


        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          Update your listing.
        </h1>


        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
          Make the requested changes, review your photos,
          and submit the property again when it is ready.
        </p>


        {property.listing_status ===
          "rejected" &&
          property.review_notes && (
            <div className="mt-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
                Admin feedback
              </p>

              <p className="mt-2 text-sm leading-6 text-red-800">
                {
                  property.review_notes
                }
              </p>
            </div>
          )}


        {query.error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {
              query.error
            }
          </div>
        )}


        <form
          action={
            updateListing
          }
          className="mt-10 space-y-6"
        >

          <input
            type="hidden"
            name="propertyId"
            value={
              property.id
            }
          />


          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <FormSection
            eyebrow="01"
            title="Property"
            description="Update the main information buyers will see."
          >

            <FormField
              label="Listing title"
              required
            >
              <input
                required
                name="title"
                type="text"
                defaultValue={
                  property.title
                }
                className={
                  inputClass
                }
              />
            </FormField>


            <FormField
              label="Property type"
              required
            >
              <select
                required
                name="propertyType"
                defaultValue={
                  property.property_type
                }
                className={
                  inputClass
                }
              >
                <option value="residential">
                  Residential
                </option>

                <option value="agricultural">
                  Agricultural
                </option>

                <option value="commercial">
                  Commercial
                </option>
              </select>
            </FormField>


            <FormField
              label="Location"
              required
            >
              <select
                required
                name="locationId"
                defaultValue={
                  property.location_id
                }
                className={
                  inputClass
                }
              >
                {locations?.map(
                  (
                    location
                  ) => (
                    <option
                      key={
                        location.id
                      }
                      value={
                        location.id
                      }
                    >
                      {
                        location.name
                      }
                    </option>
                  )
                )}
              </select>
            </FormField>


            <div className="grid gap-5 sm:grid-cols-2">

              <FormField
                label="Land size"
                required
              >
                <input
                  required
                  min="0.01"
                  step="0.01"
                  name="areaValue"
                  type="number"
                  defaultValue={
                    Number(
                      property.area_value
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </FormField>


              <FormField
                label="Unit"
                required
              >
                <select
                  required
                  name="areaUnit"
                  defaultValue={
                    property.area_unit
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="marla">
                    Marla
                  </option>

                  <option value="kanal">
                    Kanal
                  </option>

                  <option value="sq_ft">
                    Square feet
                  </option>
                </select>
              </FormField>
            </div>


            <FormField
              label="Asking price (PKR)"
              required
            >
              <input
                required
                min="1"
                name="pricePkr"
                type="number"
                defaultValue={
                  Number(
                    property.price_pkr
                  )
                }
                className={
                  inputClass
                }
              />
            </FormField>


            <FormField
              label="Description"
              required
            >
              <textarea
                required
                name="description"
                rows={5}
                defaultValue={
                  property.description
                }
                className={
                  inputClass
                }
              />
            </FormField>
          </FormSection>


          {/* ==================================================
              LOCATION
          ================================================== */}

          <FormSection
            eyebrow="02"
            title="Property location"
            description="Keep the saved location or choose a new approximate point."
          >

            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">

              <p className="font-semibold text-slate-800">
                Current saved coordinates
              </p>

              <p className="mt-1">
                {property.latitude !==
                  null &&
                property.longitude !==
                  null
                  ? `${Number(
                      property.latitude
                    ).toFixed(
                      6
                    )}, ${Number(
                      property.longitude
                    ).toFixed(
                      6
                    )}`
                  : "No saved coordinates"}
              </p>
            </div>


            <LocationPickerShell />


            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              You do not need to select the map again unless
              you want to change the saved location.
            </div>
          </FormSection>


          {/* ==================================================
              ACCESS & UTILITIES
          ================================================== */}

          <FormSection
            eyebrow="03"
            title="Access & utilities"
            description="Update practical information about the property."
          >

            <CheckboxField
              name="roadAccess"
              label="Vehicle road access"
              defaultChecked={
                property.road_access
              }
            />


            <FormField
              label="Road type"
            >
              <input
                name="roadType"
                type="text"
                defaultValue={
                  property.road_type ??
                  ""
                }
                className={
                  inputClass
                }
              />
            </FormField>


            <FormField
              label="Distance to main road (metres)"
            >
              <input
                min="0"
                name="distanceToMainRoadM"
                type="number"
                defaultValue={
                  property.distance_to_main_road_m ??
                  ""
                }
                className={
                  inputClass
                }
              />
            </FormField>


            <CheckboxField
              name="waterAvailable"
              label="Water available"
              defaultChecked={
                property.water_available
              }
            />


            <FormField
              label="Water source"
            >
              <input
                name="waterSource"
                type="text"
                defaultValue={
                  property.water_source ??
                  ""
                }
                className={
                  inputClass
                }
              />
            </FormField>


            <CheckboxField
              name="electricityAvailable"
              label="Electricity available"
              defaultChecked={
                property.electricity_available
              }
            />


            <CheckboxField
              name="irrigationAvailable"
              label="Irrigation available"
              defaultChecked={
                property.irrigation_available
              }
            />


            <FormField
              label="Internet / mobile connectivity"
            >
              <select
                name="internetQuality"
                defaultValue={
                  property.internet_quality ??
                  ""
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Not specified
                </option>

                <option value="poor">
                  Poor
                </option>

                <option value="fair">
                  Fair
                </option>

                <option value="good">
                  Good
                </option>
              </select>
            </FormField>
          </FormSection>


          {/* ==================================================
              LAND CHARACTERISTICS
          ================================================== */}

          <FormSection
            eyebrow="04"
            title="Land characteristics"
            description="Update the structured Property Passport information."
          >

            <div className="grid gap-5 sm:grid-cols-2">

              <FormField
                label="Terrain"
              >
                <select
                  name="terrain"
                  defaultValue={
                    property.terrain ??
                    ""
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Not specified
                  </option>

                  <option value="flat">
                    Flat
                  </option>

                  <option value="mixed">
                    Mixed
                  </option>

                  <option value="sloped">
                    Sloped
                  </option>
                </select>
              </FormField>


              <FormField
                label="Slope"
              >
                <select
                  name="slope"
                  defaultValue={
                    property.slope ??
                    ""
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Not specified
                  </option>

                  <option value="low">
                    Low
                  </option>

                  <option value="moderate">
                    Moderate
                  </option>

                  <option value="steep">
                    Steep
                  </option>
                </select>
              </FormField>
            </div>


            <div className="grid gap-5 sm:grid-cols-2">

              <SuitabilityField
                name="residentialSuitability"
                label="Residential suitability"
                defaultValue={
                  property.residential_suitability ??
                  ""
                }
              />


              <SuitabilityField
                name="agriculturalSuitability"
                label="Agricultural suitability"
                defaultValue={
                  property.agricultural_suitability ??
                  ""
                }
              />
            </div>
          </FormSection>


          {/* ==================================================
              SAVE
          ================================================== */}

          <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Next step
            </p>


            <h2 className="mt-2 text-2xl font-bold">
              Save your changes.
            </h2>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              After saving, you&apos;ll review the property
              photos before reaching the final review screen.
              The listing will not be submitted to the admin
              until you confirm it there.
            </p>


            <button
              type="submit"
              className="mt-7 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5"
            >
              Save changes & continue
            </button>
          </section>
        </form>
      </section>
    </main>
  );
}


/* ============================================================
   COMPONENTS
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

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Step {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="space-y-5">
        {children}
      </div>
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

  children:
    React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}


function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;

  label: string;

  defaultChecked:
    boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">

      <input
        name={name}
        type="checkbox"
        defaultChecked={
          defaultChecked
        }
        className="h-4 w-4"
      />

      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>
    </label>
  );
}


function SuitabilityField({
  name,
  label,
  defaultValue,
}: {
  name: string;

  label: string;

  defaultValue:
    string;
}) {
  return (
    <FormField
      label={
        label
      }
    >
      <select
        name={
          name
        }
        defaultValue={
          defaultValue
        }
        className={
          inputClass
        }
      >
        <option value="">
          Not specified
        </option>

        <option value="low">
          Low
        </option>

        <option value="moderate">
          Moderate
        </option>

        <option value="high">
          High
        </option>
      </select>
    </FormField>
  );
}