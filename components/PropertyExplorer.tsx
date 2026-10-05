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
  rankPropertiesByIntent,
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
  ] =
    useTransition();


  const [
    searchDraft,
    setSearchDraft,
  ] =
    useState(
      initialQuery
    );


  const [
    aiIntentEnabled,
    setAiIntentEnabled,
  ] =
    useState(
      Boolean(
        initialQuery &&
        initialIntent
      )
    );


  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(
      true
    );


  const [
    location,
    setLocation,
  ] =
    useState(
      "All"
    );


  const [
    propertyType,
    setPropertyType,
  ] =
    useState(
      "All"
    );


  const [
    maxPrice,
    setMaxPrice,
  ] =
    useState(
      "Any"
    );


  const [
    roadOnly,
    setRoadOnly,
  ] =
    useState(
      false
    );


  const [
    waterOnly,
    setWaterOnly,
  ] =
    useState(
      false
    );


  const [
    electricityOnly,
    setElectricityOnly,
  ] =
    useState(
      false
    );


  const [
    irrigationOnly,
    setIrrigationOnly,
  ] =
    useState(
      false
    );


  const [
    internetQuality,
    setInternetQuality,
  ] =
    useState(
      "Any"
    );


  const [
    sort,
    setSort,
  ] =
    useState(
      "newest"
    );


  const locationOptions =
    useMemo(
      () => {
        const unique =
          Array.from(
            new Set(
              properties
                .map(
                  (
                    property
                  ) =>
                    property.location
                )
                .filter(
                  Boolean
                )
            )
          ).sort(
            (
              a,
              b
            ) =>
              a.localeCompare(
                b
              )
          );


        return [
          {
            label:
              "All locations",
            value:
              "All",
          },
          ...unique.map(
            (
              value
            ) => ({
              label:
                value,
              value,
            })
          ),
        ];
      },
      [
        properties,
      ]
    );


  const propertyTypeOptions =
    useMemo(
      () => {
        const unique =
          Array.from(
            new Set(
              properties
                .map(
                  (
                    property
                  ) =>
                    property.type
                )
                .filter(
                  Boolean
                )
            )
          ).sort(
            (
              a,
              b
            ) =>
              a.localeCompare(
                b
              )
          );


        return [
          {
            label:
              "All types",
            value:
              "All",
          },
          ...unique.map(
            (
              value
            ) => ({
              label:
                value,
              value,
            })
          ),
        ];
      },
      [
        properties,
      ]
    );


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


  const filteredProperties =
    useMemo(
      () => {
        let results =
          [
            ...properties,
          ];


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
          electricityOnly
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.electricityAvailable
            );
        }


        if (
          irrigationOnly
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.irrigationAvailable
            );
        }


        if (
          internetQuality !==
          "Any"
        ) {
          results =
            results.filter(
              (
                property
              ) =>
                property.internetQuality ===
                internetQuality
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
        electricityOnly,
        irrigationOnly,
        internetQuality,
        sort,
      ]
    );


  const manualFilterChips =
    [
      location !==
      "All"
        ? {
            key:
              "location",
            label:
              location,
            clear:
              () =>
                setLocation(
                  "All"
                ),
          }
        : null,

      propertyType !==
      "All"
        ? {
            key:
              "type",
            label:
              propertyType,
            clear:
              () =>
                setPropertyType(
                  "All"
                ),
          }
        : null,

      maxPrice !==
      "Any"
        ? {
            key:
              "price",
            label:
              `Up to ${formatPkr(
                Number(
                  maxPrice
                )
              )}`,
            clear:
              () =>
                setMaxPrice(
                  "Any"
                ),
          }
        : null,

      roadOnly
        ? {
            key:
              "road",
            label:
              "Road access",
            clear:
              () =>
                setRoadOnly(
                  false
                ),
          }
        : null,

      waterOnly
        ? {
            key:
              "water",
            label:
              "Water",
            clear:
              () =>
                setWaterOnly(
                  false
                ),
          }
        : null,

      electricityOnly
        ? {
            key:
              "power",
            label:
              "Electricity",
            clear:
              () =>
                setElectricityOnly(
                  false
                ),
          }
        : null,

      irrigationOnly
        ? {
            key:
              "irrigation",
            label:
              "Irrigation",
            clear:
              () =>
                setIrrigationOnly(
                  false
                ),
          }
        : null,

      internetQuality !==
      "Any"
        ? {
            key:
              "internet",
            label:
              `${internetQuality} internet`,
            clear:
              () =>
                setInternetQuality(
                  "Any"
                ),
          }
        : null,
    ].filter(
      Boolean
    ) as {
      key: string;
      label: string;
      clear: () => void;
    }[];


  const hasAnyFilters =
    aiIntentEnabled ||
    manualFilterChips.length >
      0;

  const nearMatches =
    useMemo(
      () => {
        if (
          filteredProperties.length >
            0 ||
          !aiIntentEnabled ||
          !initialIntent ||
          manualFilterChips.length >
            0
        ) {
          return [];
        }


        return rankPropertiesByIntent(
          properties,
          initialIntent,
          3
        );
      },
      [
        filteredProperties.length,
        aiIntentEnabled,
        initialIntent,
        manualFilterChips.length,
        properties,
      ]
    );


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

    setElectricityOnly(
      false
    );

    setIrrigationOnly(
      false
    );

    setInternetQuality(
      "Any"
    );

    setSort(
      "newest"
    );
  }


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

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Explore Chitral
          </p>


          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <h1 className="text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Find your next property.
              </h1>


              <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                Search in your own words, then narrow the results with simple filters.
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


      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">

          <div className="p-4 sm:p-6">

            <form
              onSubmit={
                submitSearch
              }
            >

              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Describe what you need
              </label>


              <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                <div className="relative min-w-0 flex-1">

                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    ⌕
                  </span>


                  <input
                    type="search"
                    value={
                      searchDraft
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchDraft(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Residential land in Booni under 50 lakh with road access..."
                    className="w-full rounded-2xl border border-transparent bg-slate-100 py-4 pl-12 pr-5 text-sm outline-none transition focus:border-emerald-200 focus:bg-white"
                  />
                </div>


                <button
                  type="submit"
                  disabled={
                    isPending
                  }
                  className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {isPending && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"
                    />
                  )}

                  {
                    isPending
                      ? "Searching…"
                      : "Search"
                  }
                </button>
              </div>
            </form>


            {isPending && (
              <div
                aria-live="polite"
                className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs font-medium text-sky-700"
              >
                Finding matching properties…
              </div>
            )}


            {aiIntentEnabled &&
              initialIntent && (
              <div className="mt-4 border-t border-slate-100 pt-4">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-[11px] font-semibold text-slate-500">
                        Search understood
                      </p>


                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                          searchSource ===
                          "ai"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {searchSource ===
                        "ai"
                          ? "AI-assisted"
                          : "Smart search"}
                      </span>
                    </div>


                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      We picked out the important details from your search. You can adjust them below.
                    </p>
                  </div>


                  <button
                    type="button"
                    onClick={
                      clearAiSearch
                    }
                    className="self-start text-xs font-semibold text-slate-400 transition hover:text-slate-950"
                  >
                    Clear search
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
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
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
                    Try adding a place, property type, budget or feature to narrow the results.
                  </p>
                )}
              </div>
            )}
          </div>


          <div className="border-t border-slate-100 bg-slate-50/55 p-4 sm:p-6">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Refine results
                </p>


                <p className="mt-1 text-xs text-slate-400">
                  Optional manual filters
                </p>
              </div>


              <div className="flex items-center gap-2">

                {manualFilterChips.length >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      clearManualFilters
                    }
                    className="hidden text-xs font-semibold text-slate-400 transition hover:text-slate-950 sm:block"
                  >
                    Reset
                  </button>
                )}


                <button
                  type="button"
                  aria-expanded={
                    filtersOpen
                  }
                  onClick={() =>
                    setFiltersOpen(
                      !filtersOpen
                    )
                  }
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-slate-950"
                >
                  {filtersOpen
                    ? "Hide filters"
                    : "Show filters"}
                </button>
              </div>
            </div>


            {filtersOpen && (
              <div className="mt-5">

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                  <FilterSelect
                    label="Location"
                    value={
                      location
                    }
                    onChange={
                      setLocation
                    }
                    options={
                      locationOptions
                    }
                  />


                  <FilterSelect
                    label="Property type"
                    value={
                      propertyType
                    }
                    onChange={
                      setPropertyType
                    }
                    options={
                      propertyTypeOptions
                    }
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
                      {
                        label:
                          "Up to 1 Crore",
                        value:
                          "10000000",
                      },
                    ]}
                  />


                  <FilterSelect
                    label="Internet"
                    value={
                      internetQuality
                    }
                    onChange={
                      setInternetQuality
                    }
                    options={[
                      {
                        label:
                          "Any quality",
                        value:
                          "Any",
                      },
                      {
                        label:
                          "Good",
                        value:
                          "Good",
                      },
                      {
                        label:
                          "Fair",
                        value:
                          "Fair",
                      },
                      {
                        label:
                          "Poor",
                        value:
                          "Poor",
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
                          "Newest",
                        value:
                          "newest",
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


                <div className="mt-4 flex flex-wrap items-center gap-2">

                  <FilterToggle
                    label="Road access"
                    active={
                      roadOnly
                    }
                    onClick={() =>
                      setRoadOnly(
                        !roadOnly
                      )
                    }
                  />


                  <FilterToggle
                    label="Water"
                    active={
                      waterOnly
                    }
                    onClick={() =>
                      setWaterOnly(
                        !waterOnly
                      )
                    }
                  />


                  <FilterToggle
                    label="Electricity"
                    active={
                      electricityOnly
                    }
                    onClick={() =>
                      setElectricityOnly(
                        !electricityOnly
                      )
                    }
                  />


                  <FilterToggle
                    label="Irrigation"
                    active={
                      irrigationOnly
                    }
                    onClick={() =>
                      setIrrigationOnly(
                        !irrigationOnly
                      )
                    }
                  />
                </div>
              </div>
            )}


            {manualFilterChips.length >
              0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-4">

                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Active
                </span>


                {manualFilterChips.map(
                  (
                    filter
                  ) => (
                    <button
                      key={
                        filter.key
                      }
                      type="button"
                      onClick={
                        filter.clear
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                    >
                      {
                        filter.label
                      }

                      <span
                        aria-hidden="true"
                        className="text-slate-400"
                      >
                        ×
                      </span>
                    </button>
                  )
                )}


                <button
                  type="button"
                  onClick={
                    clearManualFilters
                  }
                  className="text-xs font-semibold text-slate-400 transition hover:text-slate-950 sm:hidden"
                >
                  Clear manual
                </button>
              </div>
            )}
          </div>
        </section>


        <div
          aria-live="polite"
          className="mt-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
              Property results
            </p>


            <h2 className="mt-1 text-2xl font-bold">
              {filteredProperties.length}{" "}
              {filteredProperties.length ===
              1
                ? "property"
                : "properties"}
            </h2>


            <p className="mt-1 text-xs text-slate-400">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
          </div>


          {hasAnyFilters ? (
            <button
              type="button"
              onClick={
                clearEverything
              }
              className="self-start rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
            >
              Clear all filters
            </button>
          ) : (
            <span className="self-start rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              All active areas
            </span>
          )}
        </div>


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
          <div className={`mt-7 rounded-[2rem] border px-6 py-14 text-center shadow-sm ${
            nearMatches.length >
            0
              ? "border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white"
              : "border-dashed border-slate-300 bg-white"
          }`}>

            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl ${
              nearMatches.length >
              0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}>
              {nearMatches.length >
              0
                ? "≈"
                : "⌕"}
            </div>


            <h3 className="mt-5 text-xl font-bold">
              {nearMatches.length >
              0
                ? "No exact match — here are the closest options"
                : "No properties match these filters"}
            </h3>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {nearMatches.length >
              0
                ? "No exact result is available, but these properties satisfy most of the request."
                : "Try removing a filter, raising the budget, or starting with a broader search."}
            </p>


            {nearMatches.length ===
            0 && (
              <button
                type="button"
                onClick={
                  clearEverything
                }
                className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Show all properties
              </button>
            )}


            {nearMatches.length >
              0 && (
              <div className="mt-8 border-t border-emerald-100 pt-8 text-left">

                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Closest available matches
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Each card explains which requested details differ.
                  </p>
                </div>


                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {nearMatches.map(
                    (
                      match
                    ) => (
                      <div
                        key={
                          match.property.id
                        }
                        className="flex flex-col gap-3"
                      >
                        <PropertyCard
                          property={
                            match.property
                          }
                        />


                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                            {Math.round(
                              match.score *
                                100
                            )}% of requested details matched
                          </p>


                          <div className="mt-2 flex flex-wrap gap-2">
                            {match.differences.map(
                              (
                                difference
                              ) => (
                                <span
                                  key={
                                    difference
                                  }
                                  className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-amber-800"
                                >
                                  {
                                    difference
                                  }
                                </span>
                              )
                            )}
                          </div>


                          <div className="mt-8 text-center">
                            <button
                              type="button"
                              onClick={
                                clearEverything
                              }
                              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                            >
                              Clear search and show all properties
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}


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

      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {
          label
        }
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
      aria-pressed={
        active
      }
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          : "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      }
    >
      {active
        ? "✓ "
        : ""}

      {
        label
      }
    </button>
  );
}


function formatPkr(
  value:
    number
) {
  if (
    value >=
    10_000_000
  ) {
    return `PKR ${(
      value /
      10_000_000
    ).toLocaleString(
      "en-US",
      {
        maximumFractionDigits:
          2,
      }
    )} Crore`;
  }


  return `PKR ${(
    value /
    100_000
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits:
        0,
    }
  )} Lakh`;
}
