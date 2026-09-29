import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/types/property";

export default function LocationSection({
  eyebrow,
  title,
  description,
  properties,
}: {
  eyebrow: string;
  title: string;
  description: string;
  properties: Property[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>

          <p className="mt-3 max-w-xl text-slate-500">
            {description}
          </p>
        </div>

        <button className="self-start rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>
    </section>
  );
}