import Link from "next/link";

import {
  Property,
} from "@/types/property";


export default function PropertyCard({
  property,
}: {
  property: Property;
}) {
  const coverImage =
    property.images.find(
      (
        image
      ) =>
        image.isPrimary
    ) ??
    property.images[0];


  const verificationValues =
    Object.values(
      property.verification
    );

  const verifiedCount =
    verificationValues.filter(
      (
        status
      ) =>
        status ===
        "verified"
    ).length;

  const verificationLabel =
    verifiedCount ===
    verificationValues.length
      ? "Fully verified"
      : `${verifiedCount}/${verificationValues.length} verified`;

  const verificationClassName =
    verifiedCount ===
    verificationValues.length
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : verifiedCount >=
          3
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-500";


  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_-22px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_24px_55px_-24px_rgba(15,23,42,0.32)]">

      <Link
        href={`/properties/${property.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
        aria-label={`View ${property.title}`}
      >
        {coverImage ? (
          <img
            src={
              coverImage.url
            }
            alt={
              coverImage.altText ??
              property.title
            }
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center bg-gradient-to-br ${property.gradient}`}
          >
            <span className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur">
              Property photo coming soon
            </span>
          </div>
        )}


        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/25 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />


        <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
          {
            property.type
          }
        </span>


        {property.images.length >
          0 && (
          <span className="absolute right-4 top-4 rounded-full border border-white/70 bg-slate-950/75 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
            {property.images.length}{" "}
            {property.images.length ===
            1
              ? "photo"
              : "photos"}
          </span>
        )}
      </Link>


      <div className="flex flex-1 flex-col p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="text-xl font-bold tracking-[-0.025em] text-slate-950">
              {
                property.price
              }
            </p>


            <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-800">
              {
                property.title
              }
            </h3>
          </div>


          <span className={`max-w-[128px] shrink-0 rounded-full border px-2.5 py-1 text-center text-[9px] font-bold uppercase tracking-[0.08em] ${verificationClassName}`}>
            {
              verificationLabel
            }
          </span>
        </div>


        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">

          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4 text-slate-400"
          >
            <path
              d="M10 17s5-4.54 5-9a5 5 0 1 0-10 0c0 4.46 5 9 5 9Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            <circle
              cx="10"
              cy="8"
              r="1.8"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>

          <span>
            {property.location}, Chitral
          </span>
        </div>


        <div className="mt-5 flex flex-wrap gap-2">

          <Amenity
            text={
              property.size
            }
          />

          {property.roadAccess && (
            <Amenity
              text="Road"
            />
          )}

          {property.waterAvailable && (
            <Amenity
              text="Water"
            />
          )}

          {property.electricityAvailable && (
            <Amenity
              text="Power"
            />
          )}
        </div>


        <div className="mt-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-3.5">

          <div className="flex items-center justify-between gap-3">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Value guidance
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                 {
                  property.estimate
                }
              </p>
            </div>


            <div className="text-right">
              <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700 shadow-sm">
                {property.valuation.dataCompleteness} data
              </span>
            </div>
          </div>
        </div>


        <Link
          href={`/properties/${property.id}`}
          className="mt-auto flex w-full items-center justify-between border-t border-slate-100 pt-5 text-sm font-semibold text-slate-800 transition group-hover:text-emerald-700"
        >
          View Property Passport

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
    <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
      {
        text
      }
    </span>
  );
}
