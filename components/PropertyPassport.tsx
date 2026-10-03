import {
  Property,
} from "@/types/property";


export default function PropertyPassport({
  property,
}: {
  property: Property;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Property Passport
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
            Structured property profile
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            A consistent summary of the practical details that help buyers
            compare land more clearly.
          </p>
        </div>


        <div className="self-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Passport ID
          </p>

          <p className="mt-1 max-w-[210px] truncate font-mono text-[11px] font-semibold text-slate-700">
            {property.id.toUpperCase()}
          </p>
        </div>
      </div>


      <div className="mt-8 grid gap-4 lg:grid-cols-2">

        <PassportGroup
          title="Property"
          description="Core listing information"
        >
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
            emphasis
          />
        </PassportGroup>


        <PassportGroup
          title="Access"
          description="Road and approach information"
        >
          <PassportRow
            label="Vehicle access"
            value={property.roadAccess ? "Available" : "Not available"}
            status={property.roadAccess ? "positive" : "neutral"}
          />

          <PassportRow
            label="Road type"
            value={property.roadType || "Not specified"}
          />

          <PassportRow
            label="Main road distance"
            value={
              property.distanceToMainRoadM !== null
                ? `${property.distanceToMainRoadM} m`
                : "Not specified"
            }
          />
        </PassportGroup>


        <PassportGroup
          title="Utilities"
          description="Essential services and connectivity"
        >
          <PassportRow
            label="Water"
            value={property.waterAvailable ? "Available" : "Not confirmed"}
            status={property.waterAvailable ? "positive" : "neutral"}
          />

          <PassportRow
            label="Water source"
            value={property.waterSource || "Not specified"}
          />

          <PassportRow
            label="Electricity"
            value={property.electricityAvailable ? "Available" : "Not confirmed"}
            status={property.electricityAvailable ? "positive" : "neutral"}
          />

          <PassportRow
            label="Irrigation"
            value={property.irrigationAvailable ? "Available" : "Not available"}
            status={property.irrigationAvailable ? "positive" : "neutral"}
          />

          <PassportRow
            label="Connectivity"
            value={property.internetQuality || "Not specified"}
          />
        </PassportGroup>


        <PassportGroup
          title="Land characteristics"
          description="Terrain and suitability indicators"
        >
          <PassportRow
            label="Terrain"
            value={property.terrain || "Not specified"}
          />

          <PassportRow
            label="Slope"
            value={property.slope || "Not specified"}
          />

          <PassportRow
            label="Residential suitability"
            value={property.residentialSuitability || "Not specified"}
          />

          <PassportRow
            label="Agricultural suitability"
            value={property.agriculturalSuitability || "Not specified"}
          />
        </PassportGroup>
      </div>
    </section>
  );
}


function PassportGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200">

      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>


      <div>
        {children}
      </div>
    </section>
  );
}


function PassportRow({
  label,
  value,
  emphasis = false,
  status = "default",
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  status?:
    | "default"
    | "positive"
    | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 px-4 py-3.5 last:border-b-0">

      <span className="text-sm text-slate-500">
        {label}
      </span>


      <span
        className={`text-right text-sm font-semibold ${
          emphasis
            ? "text-slate-950"
            : status === "positive"
              ? "text-emerald-700"
              : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
