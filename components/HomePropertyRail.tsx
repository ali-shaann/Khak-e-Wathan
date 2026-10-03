"use client";

import Link from "next/link";

import {
  useRef,
} from "react";

import PropertyCard from "@/components/PropertyCard";

import type {
  Property,
} from "@/types/property";


export default function HomePropertyRail({
  id,
  location,
  properties,
}: {
  id: string;
  location: string;
  properties: Property[];
}) {
  const railRef =
    useRef<HTMLDivElement>(
      null
    );


  if (
    properties.length ===
    0
  ) {
    return null;
  }


  function scrollByCards(
    direction:
      -1 | 1
  ) {
    railRef.current
      ?.scrollBy({
        left:
          direction *
          380,

        behavior:
          "smooth",
      });
  }


  return (
    <section
      id={
        id
      }
      className="scroll-mt-28 border-t border-slate-200/80 py-10 first:border-t-0 sm:py-12"
    >

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.19em] text-emerald-700">
            Explore {
              location
            }
          </p>


          <h3 className="mt-2 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
            Featured in {
              location
            }
          </h3>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Explore available properties in this area.
          </p>
        </div>


        <div className="flex items-center gap-2">

          <span className="mr-1 hidden text-xs text-slate-400 md:inline">
            {properties.length}{" "}
            {properties.length ===
            1
              ? "listing"
              : "listings"}
          </span>


          <button
            type="button"
            aria-label={`Scroll ${location} properties left`}
            onClick={() =>
              scrollByCards(
                -1
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950"
          >
            ←
          </button>


          <button
            type="button"
            aria-label={`Scroll ${location} properties right`}
            onClick={() =>
              scrollByCards(
                1
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950"
          >
            →
          </button>


          <Link
            href={`/properties?q=${encodeURIComponent(
              `property in ${location}`
            )}`}
            className="ml-1 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            View all
          </Link>
        </div>
      </div>


      <div className="relative mt-6">

        <div
          ref={
            railRef
          }
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 pr-6 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
        >

          {properties.map(
            (
              property
            ) => (
              <div
                key={
                  property.id
                }
                className="w-[84vw] max-w-[360px] flex-none snap-start sm:w-[350px] lg:w-[360px]"
              >
                <PropertyCard
                  property={
                    property
                  }
                />
              </div>
            )
          )}
        </div>


        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-[#f7f8fa] to-transparent sm:block" />
      </div>


      <p className="mt-1 text-[11px] text-slate-400 sm:hidden">
        Swipe to browse more {
          location
        } listings.
      </p>
    </section>
  );
}
