"use client";

import dynamic from "next/dynamic";

import { Property } from "@/types/property";

const SinglePropertyMap = dynamic(
  () =>
    import(
      "@/components/map/SinglePropertyMap"
    ),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-100">
        <p className="text-sm font-medium text-slate-500">
          Loading property location...
        </p>
      </div>
    ),
  }
);

export default function SinglePropertyMapShell({
  property,
}: {
  property: Property;
}) {
  return (
    <SinglePropertyMap
      property={property}
    />
  );
}