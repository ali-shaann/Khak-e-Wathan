"use client";

import dynamic from "next/dynamic";


const LocationPicker =
  dynamic(
    () =>
      import(
        "@/components/sell/LocationPicker"
      ),
    {
      ssr: false,

      loading: () => (
        <div className="flex h-[420px] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-100">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-emerald-100" />


            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading Chitral location picker…
            </p>
          </div>
        </div>
      ),
    }
  );


export default function LocationPickerShell() {
  return (
    <LocationPicker />
  );
}
