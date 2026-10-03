"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import MapShell from "@/components/map/MapShell";

import {
  Property,
} from "@/types/property";


type MobileView =
  | "list"
  | "map";


export default function MapExplorer({
  properties,
}: {
  properties: Property[];
}) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("All");

  const [
    propertyType,
    setPropertyType,
  ] =
    useState("All");

  const [
    mobileView,
    setMobileView,
  ] =
    useState<MobileView>(
      "list"
    );

  const [
    selectedPropertyId,
    setSelectedPropertyId,
  ] =
    useState<
      string | null
    >(null);


  const locationOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            properties.map(
              (
                property
              ) =>
                property.location
            )
          )
        ).sort(),
      [
        properties,
      ]
    );


  const propertyTypeOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            properties.map(
              (
                property
              ) =>
                property.type
            )
          )
        ).sort(),
      [
        properties,
      ]
    );


  const filteredProperties =
    useMemo(
      () => {
        let results =
          [
            ...properties,
          ];


        const query =
          search
            .trim()
            .toLowerCase();


        if (query) {
          results =
            results.filter(
              (
                property
              ) =>
                property.title
                  .toLowerCase()
                  .includes(
                    query
                  ) ||
                property.location
                  .toLowerCase()
                  .includes(
                    query
                  ) ||
                property.type
                  .toLowerCase()
                  .includes(
                    query
                  )
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


        return results;
      },
      [
        properties,
        search,
        location,
        propertyType,
      ]
    );


  const selectedProperty =
    useMemo(
      () =>
        filteredProperties.find(
          (
            property
          ) =>
            property.id ===
            selectedPropertyId
        ) ??
        null,
      [
        filteredProperties,
        selectedPropertyId,
      ]
    );


  useEffect(
    () => {
      if (
        selectedPropertyId &&
        !filteredProperties.some(
          (
            property
          ) =>
            property.id ===
            selectedPropertyId
        )
      ) {
        setSelectedPropertyId(
          null
        );
      }
    },
    [
      filteredProperties,
      selectedPropertyId,
    ]
  );


  const hasFilters =
    Boolean(
      search.trim()
    ) ||
    location !==
      "All" ||
    propertyType !==
      "All";


  function clearFilters() {
    setSearch(
      ""
    );

    setLocation(
      "All"
    );

    setPropertyType(
      "All"
    );

    setSelectedPropertyId(
      null
    );
  }


  function selectProperty(
    propertyId:
      string | null
  ) {
    setSelectedPropertyId(
      propertyId
    );
  }


  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      {/* ========================================================
          HEADING
      ======================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Map discovery
              </p>


              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Explore Chitral without losing your place.
              </h1>


              <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                Browse active property locations, narrow the map to
                Booni, Balach or another available area, and inspect
                useful property details without leaving the map.
              </p>
            </div>


            <div className="flex self-start items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Chitral-region map
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================
          FILTERS
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end">

            <label className="block">

              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Search map
              </span>


              <div className="group flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm">

                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="mr-3 h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-emerald-600"
                >
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="4.75"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <path
                    d="m12.2 12.2 4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>


                <input
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search property, area or type..."
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </label>


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
                ...locationOptions.map(
                  (
                    item
                  ) => ({
                    label:
                      item,
                    value:
                      item,
                  })
                ),
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
                    "All property types",
                  value:
                    "All",
                },
                ...propertyTypeOptions.map(
                  (
                    item
                  ) => ({
                    label:
                      item,
                    value:
                      item,
                  })
                ),
              ]}
            />


            <button
              type="button"
              onClick={
                clearFilters
              }
              disabled={
                !hasFilters
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-default disabled:opacity-40"
            >
              Clear
            </button>
          </div>


          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">

              <span className="font-semibold text-slate-700">
                {
                  filteredProperties.length
                }{" "}
                {filteredProperties.length ===
                1
                  ? "property"
                  : "properties"}
              </span>


              <span className="text-slate-300">
                •
              </span>


              <span>
                {location ===
                "All"
                  ? "Across current Chitral listings"
                  : `Viewing ${location}`}
              </span>
            </div>


            <p className="text-[11px] text-slate-400">
              Property locations are approximate demo points.
            </p>
          </div>
        </div>
      </section>


      {/* ========================================================
          MOBILE LIST / MAP SWITCH
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:hidden">

        <div className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">

          <MobileViewButton
            active={
              mobileView ===
              "list"
            }
            onClick={() =>
              setMobileView(
                "list"
              )
            }
          >
            List · {
              filteredProperties.length
            }
          </MobileViewButton>


          <MobileViewButton
            active={
              mobileView ===
              "map"
            }
            onClick={() =>
              setMobileView(
                "map"
              )
            }
          >
            Map
          </MobileViewButton>
        </div>
      </section>


      {/* ========================================================
          MAP + RESULTS
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">

          {/* ====================================================
              RESULT LIST
          ==================================================== */}

          <aside
            className={
              mobileView ===
              "map"
                ? "hidden lg:block"
                : "block"
            }
          >

            <div className="mb-3 flex items-end justify-between gap-4 px-1">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Visible properties
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-[-0.02em]">
                  {
                    filteredProperties.length
                  }{" "}
                  {filteredProperties.length ===
                  1
                    ? "result"
                    : "results"}
                </h2>
              </div>


              {selectedProperty && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPropertyId(
                      null
                    )
                  }
                  className="text-xs font-semibold text-slate-400 transition hover:text-slate-950"
                >
                  Clear selection
                </button>
              )}
            </div>


            {filteredProperties.length >
            0 ? (
              <div className="space-y-3">

                {filteredProperties.map(
                  (
                    property
                  ) => (
                    <MapPropertyRow
                      key={
                        property.id
                      }
                      property={
                        property
                      }
                      selected={
                        property.id ===
                        selectedPropertyId
                      }
                      onSelect={() =>
                        setSelectedPropertyId(
                          property.id
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  ⌕
                </div>


                <p className="mt-4 font-semibold">
                  No properties found
                </p>


                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-400">
                  Try changing the location, property type or search text.
                </p>


                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              </div>
            )}
          </aside>


          {/* ====================================================
              MAP
          ==================================================== */}

          <div
            className={`${
              mobileView ===
              "list"
                ? "hidden lg:block"
                : "block"
            } lg:sticky lg:top-[92px]`}
          >

            <div className="relative h-[62vh] min-h-[480px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.32)] sm:h-[68vh] lg:h-[calc(100vh-120px)] lg:min-h-[620px] lg:max-h-[760px]">

              <MapShell
                properties={
                  filteredProperties
                }
                selectedPropertyId={
                  selectedPropertyId
                }
                onSelectProperty={
                  selectProperty
                }
                contextLabel={
                  location ===
                  "All"
                    ? "Chitral"
                    : location
                }
              />


              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500]">

                {selectedProperty ? (
                  <div className="pointer-events-auto flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                          {
                            selectedProperty.type
                          }
                        </span>


                        <span className="text-xs text-slate-400">
                          {
                            selectedProperty.location
                          }, Chitral
                        </span>
                      </div>


                      <p className="mt-2 truncate font-bold text-slate-950">
                        {
                          selectedProperty.title
                        }
                      </p>


                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {
                          selectedProperty.price
                        }
                      </p>
                    </div>


                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPropertyId(
                            null
                          )
                        }
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Deselect
                      </button>


                      <Link
                        href={`/properties/${selectedProperty.id}`}
                        className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        View property
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="pointer-events-auto inline-flex rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-medium text-slate-500 shadow-lg backdrop-blur">
                    Demo property locations • approximate
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


/* ============================================================
   MAP PROPERTY ROW
============================================================ */

function MapPropertyRow({
  property,
  selected,
  onSelect,
}: {
  property: Property;

  selected: boolean;

  onSelect:
    () => void;
}) {
  const coverImage =
    property.images.find(
      (
        image
      ) =>
        image.isPrimary
    ) ??
    property.images[0];


  return (
    <article
      className={`overflow-hidden rounded-[1.5rem] border bg-white transition duration-200 ${
        selected
          ? "border-emerald-300 shadow-[0_16px_40px_-26px_rgba(5,150,105,0.75)] ring-2 ring-emerald-100"
          : "border-slate-200 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >

      <button
        type="button"
        onClick={
          onSelect
        }
        className="block w-full p-4 text-left"
      >

        <div className="flex gap-3">

          <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">

            {coverImage ? (
              <img
                src={
                  coverImage.url
                }
                alt={
                  coverImage.altText ??
                  property.title
                }
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${property.gradient}`}
              />
            )}
          </div>


          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-2">

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                {
                  property.type
                }
              </span>


              {selected && (
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                  Selected
                </span>
              )}
            </div>


            <h3 className="mt-2 line-clamp-2 font-bold leading-5 text-slate-950">
              {
                property.title
              }
            </h3>


            <p className="mt-1 text-xs text-slate-400">
              {
                property.location
              }, Chitral
            </p>
          </div>
        </div>


        <div className="mt-4 flex items-end justify-between gap-4">

          <div>

            <p className="text-lg font-bold tracking-[-0.02em] text-slate-950">
              {
                property.price
              }
            </p>


            <div className="mt-2 flex flex-wrap gap-1.5">

              <SmallBadge
                text={
                  property.size
                }
              />

              {property.roadAccess && (
                <SmallBadge
                  text="Road"
                />
              )}

              {property.waterAvailable && (
                <SmallBadge
                  text="Water"
                />
              )}
            </div>
          </div>


          <span className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
            selected
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-400"
          }`}>
            ↗
          </span>
        </div>
      </button>


      <div className="border-t border-slate-100 px-4 py-3">

        <Link
          href={`/properties/${property.id}`}
          className="flex items-center justify-between text-xs font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          View full Property Passport

          <span>
            →
          </span>
        </Link>
      </div>
    </article>
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

      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
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
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-200"
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
   MOBILE VIEW BUTTON
============================================================ */

function MobileViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm"
          : "rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
      }
    >
      {
        children
      }
    </button>
  );
}


/* ============================================================
   SMALL BADGE
============================================================ */

function SmallBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
      {
        text
      }
    </span>
  );
}
