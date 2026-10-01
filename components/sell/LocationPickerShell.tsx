"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import(
    "@/components/sell/LocationPicker"
  ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-100 text-sm text-slate-500">
        Loading property map...
      </div>
    ),
  }
);

export default function LocationPickerShell() {
  return <LocationPicker />;
}