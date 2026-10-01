"use client";

import {
  useMemo,
  useState,
} from "react";

import PropertyCard from "@/components/PropertyCard";

import { Property } from "@/types/property";

export default function PropertyExplorer({
  properties,
}: {
  properties: Property[];
}) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [propertyType, setPropertyType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("Any");
  const [roadOnly, setRoadOnly] = useState(false);
  const [waterOnly, setWaterOnly] = useState(false);
  const [sort, setSort] = useState("recommended");

  const filteredProperties = useMemo(() => {
    let results = [...properties];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      results = results.filter((property) => {
        return (
          property.title.toLowerCase().includes(normalizedSearch) ||
          property.location.toLowerCase().includes(normalizedSearch) ||
          property.type.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    if (location !== "All") {
      results = results.filter(
        (property) => property.location === location
      );
    }

    if (propertyType !== "All") {
      results = results.filter(
        (property) => property.type === propertyType
      );
    }

    if (maxPrice !== "Any") {
      const numericMaxPrice = Number(maxPrice);

      results = results.filter(
        (property) => property.pricePkr <= numericMaxPrice
      );
    }

    if (roadOnly) {
      results = results.filter(
        (property) => property.roadAccess
      );
    }

    if (waterOnly) {
      results = results.filter(
        (property) => property.waterAvailable
      );
    }

    if (sort === "price-low") {
      results.sort(
        (a, b) => a.pricePkr - b.pricePkr
      );
    }

    if (sort === "price-high") {
      results.sort(
        (a, b) => b.pricePkr - a.pricePkr
      );
    }

    return results;
  }, [
    properties,
    search,
    location,
    propertyType,
    maxPrice,
    roadOnly,
    waterOnly,
    sort,
  ]);

  function clearFilters() {
    setSearch("");
    setLocation("All");
    setPropertyType("All");
    setMaxPrice("Any");
    setRoadOnly(false);
    setWaterOnly(false);
    setSort("recommended");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      

      {/* Page heading */}
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
                Browse land in Booni and Balach using structured
                information about access, utilities, location and
                estimated value.
              </p>
            </div>

            <button className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              Map view →
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Booni, Balach, residential, agricultural..."
              className="w-full rounded-2xl bg-slate-100 py-4 pl-12 pr-5 text-sm outline-none ring-0 transition focus:bg-slate-50"
            />
          </div>

          {/* Filters */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Location"
              value={location}
              onChange={setLocation}
              options={[
                { label: "All locations", value: "All" },
                { label: "Booni", value: "Booni" },
                { label: "Balach", value: "Balach" },
              ]}
            />

            <FilterSelect
              label="Property type"
              value={propertyType}
              onChange={setPropertyType}
              options={[
                { label: "All types", value: "All" },
                {
                  label: "Residential",
                  value: "Residential",
                },
                {
                  label: "Agricultural",
                  value: "Agricultural",
                },
                {
                  label: "Commercial",
                  value: "Commercial",
                },
              ]}
            />

            <FilterSelect
              label="Maximum price"
              value={maxPrice}
              onChange={setMaxPrice}
              options={[
                {
                  label: "Any price",
                  value: "Any",
                },
                {
                  label: "Up to 30 Lakh",
                  value: "3000000",
                },
                {
                  label: "Up to 40 Lakh",
                  value: "4000000",
                },
                {
                  label: "Up to 50 Lakh",
                  value: "5000000",
                },
                {
                  label: "Up to 60 Lakh",
                  value: "6000000",
                },
                {
                  label: "Up to 70 Lakh",
                  value: "7000000",
                },
              ]}
            />

            <FilterSelect
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                {
                  label: "Recommended",
                  value: "recommended",
                },
                {
                  label: "Price: low to high",
                  value: "price-low",
                },
                {
                  label: "Price: high to low",
                  value: "price-high",
                },
              ]}
            />
          </div>

          {/* Feature filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <FilterToggle
              label="Road access"
              active={roadOnly}
              onClick={() => setRoadOnly(!roadOnly)}
            />

            <FilterToggle
              label="Water available"
              active={waterOnly}
              onClick={() => setWaterOnly(!waterOnly)}
            />

            <button
              onClick={clearFilters}
              className="ml-auto text-sm font-semibold text-slate-400 transition hover:text-slate-950"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Results heading */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-400">
              PROPERTY RESULTS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1
                ? "property"
                : "properties"}
            </h2>
          </div>

          <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 sm:block">
            Booni + Balach
          </div>
        </div>

        {/* Results */}
        {filteredProperties.length > 0 ? (
          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
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
              Try changing your location, price or property-type
              filters.
            </p>

            <button
              onClick={clearFilters}
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
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
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      }
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}