"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";


import MapShell from "@/components/map/MapShell";

import { Property } from "@/types/property";

export default function MapExplorer({
  properties,
}: {
  properties: Property[];
}) {
  const [search, setSearch] =
    useState("");

  const [location, setLocation] =
    useState("All");

  const [propertyType, setPropertyType] =
    useState("All");

  const filteredProperties =
    useMemo(() => {
      let results = [...properties];

      const query =
        search.trim().toLowerCase();

      if (query) {
        results = results.filter(
          (property) =>
            property.title
              .toLowerCase()
              .includes(query) ||
            property.location
              .toLowerCase()
              .includes(query) ||
            property.type
              .toLowerCase()
              .includes(query)
        );
      }

      if (location !== "All") {
        results = results.filter(
          (property) =>
            property.location ===
            location
        );
      }

      if (propertyType !== "All") {
        results = results.filter(
          (property) =>
            property.type ===
            propertyType
        );
      }

      return results;
    }, [
      properties,
      search,
      location,
      propertyType,
    ]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      

      {/* Heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Map Discovery
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Explore property geographically.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-500">
            Discover properties across active
            Khak-e-Wathan locations and inspect
            important property information directly
            from the map.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm lg:flex-row">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search property or location..."
            className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none"
          />

          <select
            value={location}
            onChange={(event) =>
              setLocation(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
          >
            <option value="All">
              All locations
            </option>

            <option value="Booni">
              Booni
            </option>

            <option value="Balach">
              Balach
            </option>
          </select>

          <select
            value={propertyType}
            onChange={(event) =>
              setPropertyType(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
          >
            <option value="All">
              All property types
            </option>

            <option value="Residential">
              Residential
            </option>

            <option value="Agricultural">
              Agricultural
            </option>

            <option value="Commercial">
              Commercial
            </option>
          </select>
        </div>
      </section>

      {/* Map + list */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] lg:grid-cols-[360px_1fr]">
          {/* Listing sidebar */}
          <aside className="max-h-[680px] overflow-y-auto border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Visible Properties
              </p>

              <p className="mt-1 text-xl font-bold">
                {filteredProperties.length}{" "}
                {filteredProperties.length ===
                1
                  ? "property"
                  : "properties"}
              </p>
            </div>

            {filteredProperties.length >
            0 ? (
              <div className="divide-y divide-slate-100">
                {filteredProperties.map(
                  (property) => (
                    <MapPropertyRow
                      key={property.id}
                      property={
                        property
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="font-semibold">
                  No properties found
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Try changing your map
                  filters.
                </p>
              </div>
            )}
          </aside>

          {/* Map */}
          <div className="relative h-[520px] lg:h-[680px]">
            <MapShell
              properties={
                filteredProperties
              }
            />

            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow-lg backdrop-blur">
              Demo property locations
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MapPropertyRow({
  property,
}: {
  property: Property;
}) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="block p-5 transition hover:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {property.type}
          </span>

          <h3 className="mt-3 font-bold leading-5">
            {property.title}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {property.location},
            Chitral
          </p>
        </div>

        <span className="text-slate-300">
          →
        </span>
      </div>

      <p className="mt-4 text-lg font-bold">
        {property.price}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <SmallBadge
          text={property.size}
        />

        {property.roadAccess && (
          <SmallBadge text="Road" />
        )}

        {property.waterAvailable && (
          <SmallBadge text="Water" />
        )}
      </div>
    </Link>
  );
}

function SmallBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
      {text}
    </span>
  );
}