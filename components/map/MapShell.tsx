"use client";

import dynamic from "next/dynamic";

import { Property } from "@/types/property";

const PropertyMap = dynamic(
  () => import("@/components/map/PropertyMap"),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-emerald-200" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading map...
          </p>
        </div>
      </div>
    ),
  }
);

export default function MapShell({
  properties,
}: {
  properties: Property[];
}) {
  return (
    <PropertyMap
      properties={properties}
    />
  );
}