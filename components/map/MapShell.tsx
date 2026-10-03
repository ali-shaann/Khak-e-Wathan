"use client";

import dynamic from "next/dynamic";

import {
  Property,
} from "@/types/property";


const PropertyMap =
  dynamic(
    () =>
      import(
        "@/components/map/PropertyMap"
      ),
    {
      ssr: false,

      loading: () => (
        <div className="flex h-full min-h-[500px] items-center justify-center bg-slate-100">

          <div className="w-full max-w-xs px-6 text-center">

            <div className="mx-auto h-11 w-11 animate-pulse rounded-2xl bg-emerald-100" />


            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading Chitral map
            </p>


            <p className="mt-1 text-xs leading-5 text-slate-400">
              Preparing property locations and map tiles…
            </p>
          </div>
        </div>
      ),
    }
  );


export default function MapShell({
  properties,
  selectedPropertyId = null,
  onSelectProperty,
  contextLabel = "Chitral",
}: {
  properties:
    Property[];

  selectedPropertyId?:
    string | null;

  onSelectProperty?:
    (
      propertyId:
        string | null
    ) => void;

  contextLabel?:
    string;
}) {
  return (
    <PropertyMap
      properties={
        properties
      }
      selectedPropertyId={
        selectedPropertyId
      }
      onSelectProperty={
        onSelectProperty
      }
      contextLabel={
        contextLabel
      }
    />
  );
}
