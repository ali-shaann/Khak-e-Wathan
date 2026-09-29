import { Property } from "@/types/property";
import Link from "next/link";

export default function PropertyCard({
  property,
}: {
  property: Property;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)]">
      <div
        className={`relative h-56 bg-gradient-to-br ${property.gradient}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.75),transparent_25%)]" />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-900/5 [clip-path:polygon(0_75%,18%_32%,32%_55%,48%_12%,64%_55%,79%_28%,100%_70%,100%_100%,0_100%)]" />

        <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
          {property.type}
        </div>

        <button className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/85 text-sm shadow-sm backdrop-blur transition hover:scale-105">
          ♡
        </button>

        <div className="absolute bottom-4 left-4 rounded-xl bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
          {property.location}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-bold tracking-tight">
              {property.price}
            </p>

            <h3 className="mt-1 text-base font-semibold text-slate-800">
              {property.title}
            </h3>
          </div>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            Verified
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          {property.location}, Chitral
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Amenity text={property.size} />

          {property.roadAccess && (
            <Amenity text="Road" />
          )}

          {property.waterAvailable && (
            <Amenity text="Water" />
          )}

          {property.electricityAvailable && (
            <Amenity text="Power" />
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Estimated value
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            PKR {property.estimate}
          </p>
        </div>

        <Link
         href={`/properties/${property.id}`}
         className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold"
        >
         View property

            <span className="transition duration-300 group-hover:translate-x-1">
             →
            </span>
        </Link>
      </div>
    </article>
  );
}

function Amenity({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
      {text}
    </span>
  );
}