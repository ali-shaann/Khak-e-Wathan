"use client";

import Link from "next/link";

import {
  FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import PropertyCard from "@/components/PropertyCard";

import {
  describeIntent,
  filterPropertiesByIntent,
  type NaturalSearchIntent,
} from "@/lib/naturalSearch";

import type {
  Property,
} from "@/types/property";


type SearchSource =
  | "ai"
  | "fallback"
  | null;


export default function PropertyExplorer({
  properties,
  initialQuery,
  initialIntent,
  searchSource,
}: {
  properties: Property[];

  initialQuery: string;

  initialIntent:
    | NaturalSearchIntent
    | null;

  searchSource:
    SearchSource;
}) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();


  /* ============================================================
     AI SEARCH
  ============================================================ */

  const [
    searchDraft,
    setSearchDraft,
  ] = useState(
    initialQuery
  );

  const [
    aiIntentEnabled,
    setAiIntentEnabled,
  ] = useState(
    Boolean(
      initialQuery &&
      initialIntent
    )
  );


  /* ============================================================
     MANUAL FILTERS
  ============================================================ */

  const [
    location,
    setLocation,
  ] = useState(
    "All"
  );

  const [
    propertyType,
    setPropertyType,
  ] = useState(
    "All"
  );

  const [
    maxPrice,
    setMaxPrice,
  ] = useState(
    "Any"
  );

  const [
    roadOnly,
    setRoadOnly,
  ] = useState(
    false
  );

  const [
    waterOnly,
    setWaterOnly,
  ] = useState(
    false
  );

  const [
    sort,
    setSort,
  ] = useState(
    "recommended"
  );


  /* ============================================================
     INTERPRETED AI FILTER LABELS
  ============================================================ */

  const interpretedFilters =
    useMemo(
      () => {
        if (
          !initialIntent
        ) {
          return [];
        }

        return describeIntent(
          initialIntent
        );
      },
      [
        initialIntent,
      ]
    );


  /* ============================================================
     FILTER PROPERTIES
  ============================================================ */

  const filteredProperties =
    useMemo(
      () => {
        let results =
          [
            ...properties,
          ];


        /*
          First apply AI-generated filters.

          The LLM does NOT choose or generate listings.
          It only gives us structured filters.

          The real property objects still come from our
          database.
        */

        if (
          aiIntentEnabled &&
          initialIntent
        ) {
          results =
            filterPropertiesByIntent(
              results,
              initialIntent
            );
        }


        /*
          Then apply manual filters.

          This means a buyer can search naturally and then
          refine the result manually.
        */

        if (
          location !==
          "All"
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.location ===
                location
            );
        }


        if (
          propertyType !==
          "All"
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.type ===
                propertyType
            );
        }


        if (
          maxPrice !==
          "Any"
        ) {
          const numericMaxPrice =
            Number(
              maxPrice
            );

          results =
            results.filter(
              (
                property
              ) =>
                property.pricePkr <=
                numericMaxPrice
            );
        }


        if (
          roadOnly
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.roadAccess
            );
        }


        if (
          waterOnly
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.waterAvailable
            );
        }


        if (
          sort ===
          "price-low"
        ) {
          results.sort(
            (
              a,
              b
            ) =>
              a.pricePkr -
              b.pricePkr
          );
        }


        if (
          sort ===
          "price-high"
        ) {
          results.sort(
            (
              a,
              b
            ) =>
              b.pricePkr -
              a.pricePkr
          );
        }


        return results;
      },
      [
        properties,

        aiIntentEnabled,
        initialIntent,

        location,
        propertyType,
        maxPrice,
        roadOnly,
        waterOnly,
        sort,
      ]
    );


  /* ============================================================
     SUBMIT NATURAL-LANGUAGE SEARCH
  ============================================================ */

  function submitSearch(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanQuery =
      searchDraft.trim();


    startTransition(
      () => {
        if (
          !cleanQuery
        ) {
          router.push(
            "/properties"
          );

          return;
        }


        router.push(
          `/properties?q=${encodeURIComponent(
            cleanQuery
          )}`
        );
      }
    );
  }


  /* ============================================================
     CLEAR MANUAL FILTERS
  ============================================================ */

  function clearManualFilters() {
    setLocation(
      "All"
    );

    setPropertyType(
      "All"
    );

    setMaxPrice(
      "Any"
    );

    setRoadOnly(
      false
    );

    setWaterOnly(
      false
    );

    setSort(
      "recommended"
    );
  }


  /* ============================================================
     CLEAR AI SEARCH
  ============================================================ */

  function clearAiSearch() {
    setAiIntentEnabled(
      false
    );

    setSearchDraft(
      ""
    );


    startTransition(
      () => {
        router.push(
          "/properties"
        );
      }
    );
  }


  /* ============================================================
     CLEAR EVERYTHING
  ============================================================ */

  function clearEverything() {
    clearManualFilters();

    setAiIntentEnabled(
      false
    );

    setSearchDraft(
      ""
    );


    startTransition(
      () => {
        router.push(
          "/properties"
        );
      }
    );
  }


  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      {/* ========================================================
          PAGE HEADING
      ======================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Explore Chitral
          </p>


          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>
              <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
                Find your next property.
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                Search naturally or browse using structured
                information about access, utilities,
                location and estimated value.
              </p>
            </div>


            <Link
              href="/map"
              className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Map view →
            </Link>
          </div>
        </div>
      </section>


      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ======================================================
            NATURAL LANGUAGE SEARCH
        ====================================================== */}

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <form
            onSubmit={
              submitSearch
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative min-w-0 flex-1">

                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>


                <input
                  type="text"
                  value={
                    searchDraft
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchDraft(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. Residential land in Booni under 50 lakh with road access..."
                  className="w-full rounded-2xl bg-slate-100 py-4 pl-12 pr-5 text-sm outline-none ring-0 transition focus:bg-slate-50"
                />
              </div>


              <button
                type="submit"
                disabled={
                  isPending
                }
                className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
              >
                {isPending
                  ? "Searching..."
                  : "Search with AI"}
              </button>
            </div>
          </form>


          {/* ==================================================
              AI INTERPRETATION
          ================================================== */}

          {aiIntentEnabled &&
            initialIntent && (
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 sm:p-5">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                  <div>
                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                        Search understood as
                      </p>


                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          searchSource ===
                          "ai"
                            ? "bg-violet-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {searchSource ===
                        "ai"
                          ? "AI interpreted"
                          : "Fallback parser"}
                      </span>
                    </div>


                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      Khak-e-Wathan converted your request into
                      structured property filters. You can
                      refine the results further below.
                    </p>
                  </div>


                  <button
                    type="button"
                    onClick={
                      clearAiSearch
                    }
                    className="self-start text-xs font-semibold text-slate-400 transition hover:text-slate-900"
                  >
                    Clear AI search
                  </button>
                </div>


                {interpretedFilters.length >
                0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {interpretedFilters.map(
                      (
                        filter
                      ) => (
                        <span
                          key={
                            filter
                          }
                          className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm"
                        >
                          {
                            filter
                          }
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    No specific structured requirements were
                    detected. Try mentioning a location,
                    property type, budget or feature.
                  </p>
                )}
              </div>
            )}


          {/* ==================================================
              MANUAL FILTERS
          ================================================== */}

          <div className="mt-5 border-t border-slate-100 pt-5">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Refine results
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Optional manual filters
                </p>
              </div>


              <button
                type="button"
                onClick={
                  clearManualFilters
                }
                className="text-xs font-semibold text-slate-400 transition hover:text-slate-950"
              >
                Reset manual filters
              </button>
            </div>


            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <FilterSelect
                label="Location"
                value={
                  location
                }
                onChange={
                  setLocation
                }
                options={[
                  {
                    label:
                      "All locations",
                    value:
                      "All",
                  },
                  {
                    label:
                      "Booni",
                    value:
                      "Booni",
                  },
                  {
                    label:
                      "Balach",
                    value:
                      "Balach",
                  },
                ]}
              />


              <FilterSelect
                label="Property type"
                value={
                  propertyType
                }
                onChange={
                  setPropertyType
                }
                options={[
                  {
                    label:
                      "All types",
                    value:
                      "All",
                  },
                  {
                    label:
                      "Residential",
                    value:
                      "Residential",
                  },
                  {
                    label:
                      "Agricultural",
                    value:
                      "Agricultural",
                  },
                  {
                    label:
                      "Commercial",
                    value:
                      "Commercial",
                  },
                ]}
              />


              <FilterSelect
                label="Maximum price"
                value={
                  maxPrice
                }
                onChange={
                  setMaxPrice
                }
                options={[
                  {
                    label:
                      "Any price",
                    value:
                      "Any",
                  },
                  {
                    label:
                      "Up to 30 Lakh",
                    value:
                      "3000000",
                  },
                  {
                    label:
                      "Up to 40 Lakh",
                    value:
                      "4000000",
                  },
                  {
                    label:
                      "Up to 50 Lakh",
                    value:
                      "5000000",
                  },
                  {
                    label:
                      "Up to 60 Lakh",
                    value:
                      "6000000",
                  },
                  {
                    label:
                      "Up to 70 Lakh",
                    value:
                      "7000000",
                  },
                ]}
              />


              <FilterSelect
                label="Sort by"
                value={
                  sort
                }
                onChange={
                  setSort
                }
                options={[
                  {
                    label:
                      "Recommended",
                    value:
                      "recommended",
                  },
                  {
                    label:
                      "Price: low to high",
                    value:
                      "price-low",
                  },
                  {
                    label:
                      "Price: high to low",
                    value:
                      "price-high",
                  },
                ]}
              />
            </div>


            {/* FEATURE FILTERS */}

            <div className="mt-4 flex flex-wrap items-center gap-3">

              <FilterToggle
                label="Road access"
                active={
                  roadOnly
                }
                onClick={
                  () =>
                    setRoadOnly(
                      !roadOnly
                    )
                }
              />


              <FilterToggle
                label="Water available"
                active={
                  waterOnly
                }
                onClick={
                  () =>
                    setWaterOnly(
                      !waterOnly
                    )
                }
              />
            </div>
          </div>
        </div>


        {/* ======================================================
            RESULTS HEADING
        ====================================================== */}

        <div className="mt-10 flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold text-slate-400">
              PROPERTY RESULTS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {
                filteredProperties.length
              }{" "}
              {filteredProperties.length ===
              1
                ? "property"
                : "properties"}
            </h2>
          </div>


          <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 sm:block">
            Booni + Balach
          </div>
        </div>


        {/* ======================================================
            RESULTS
        ====================================================== */}

        {filteredProperties.length >
        0 ? (
          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredProperties.map(
              (
                property
              ) => (
                <PropertyCard
                  key={
                    property.id
                  }
                  property={
                    property
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-7 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              ⌕
            </div>


            <h3 className="mt-5 text-xl font-bold">
              No properties found
            </h3>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try relaxing your AI request or changing the
              manual filters.
            </p>


            <button
              type="button"
              onClick={
                clearEverything
              }
              className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}


/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;

  value: string;

  onChange:
    (
      value: string
    ) => void;

  options: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>


      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-slate-400"
      >
        {options.map(
          (
            option
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </label>
  );
}


/* ============================================================
   FILTER TOGGLE
============================================================ */

function FilterToggle({
  label,
  active,
  onClick,
}: {
  label: string;

  active: boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      }
    >
      {active
        ? "✓ "
        : ""}

      {label}
    </button>
  );
}