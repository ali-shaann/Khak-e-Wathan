"use client";

import dynamic from "next/dynamic";

import {
  Property,
} from "@/types/property";


const SinglePropertyMap =
  dynamic(
    () =>
      import(
        "@/components/map/SinglePropertyMap"
      ),
    {
      ssr: false,

      loading: () => (
        <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-100">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-emerald-100" />


            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading property location…
            </p>
          </div>
        </div>
      ),
    }
  );


export default function SinglePropertyMapShell({
  property,
}: {
  property:
    Property;
}) {
  return (
    <SinglePropertyMap
      property={
        property
      }
    />
  );
}
