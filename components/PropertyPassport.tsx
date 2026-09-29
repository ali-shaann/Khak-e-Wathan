import { Property } from "@/types/property";

export default function PropertyPassport({
  property,
}: {
  property: Property;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Property Passport
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Structured property profile
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            A standardized summary of important property
            characteristics.
          </p>
        </div>

        <div className="self-start rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
          ID: {property.id.toUpperCase()}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <PassportGroup title="Property">
          <PassportRow
            label="Property type"
            value={property.type}
          />

          <PassportRow
            label="Land size"
            value={property.size}
          />

          <PassportRow
            label="Location"
            value={`${property.location}, Chitral`}
          />

          <PassportRow
            label="Asking price"
            value={property.price}
          />
        </PassportGroup>

        <PassportGroup title="Access">
          <PassportRow
            label="Vehicle access"
            value={
              property.roadAccess
                ? "Available"
                : "Not available"
            }
          />

          <PassportRow
            label="Road type"
            value={property.roadType}
          />

          <PassportRow
            label="Main road distance"
            value={`${property.distanceToMainRoadM} m`}
          />
        </PassportGroup>

        <PassportGroup title="Utilities">
          <PassportRow
            label="Water"
            value={
              property.waterAvailable
                ? "Available"
                : "Not confirmed"
            }
          />

          <PassportRow
            label="Water source"
            value={property.waterSource}
          />

          <PassportRow
            label="Electricity"
            value={
              property.electricityAvailable
                ? "Available"
                : "Not confirmed"
            }
          />

          <PassportRow
            label="Irrigation"
            value={
              property.irrigationAvailable
                ? "Available"
                : "Not available"
            }
          />

          <PassportRow
            label="Connectivity"
            value={property.internetQuality}
          />
        </PassportGroup>

        <PassportGroup title="Land characteristics">
          <PassportRow
            label="Terrain"
            value={property.terrain}
          />

          <PassportRow
            label="Slope"
            value={property.slope}
          />

          <PassportRow
            label="Residential suitability"
            value={property.residentialSuitability}
          />

          <PassportRow
            label="Agricultural suitability"
            value={property.agriculturalSuitability}
          />
        </PassportGroup>
      </div>
    </section>
  );
}

function PassportGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        {children}
      </div>
    </div>
  );
}

function PassportRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 px-4 py-3.5 last:border-b-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}