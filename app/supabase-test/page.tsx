import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const {
    data: properties,
    error,
  } = await supabase
    .from("properties")
    .select(
      `
        id,
        title,
        price_pkr,
        property_type,
        listing_status
      `
    )
    .order("price_pkr", {
      ascending: true,
    });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <h1 className="text-3xl font-bold">
          Supabase connection failed
        </h1>

        <pre className="mt-6 whitespace-pre-wrap rounded-2xl bg-red-950 p-5 text-sm text-red-200">
          {error.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Khak-e-Wathan
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Supabase is connected.
        </h1>

        <p className="mt-3 text-slate-400">
          These records are coming from PostgreSQL,
          not from data/properties.ts.
        </p>

        <div className="mt-8 space-y-3">
          {properties?.map((property) => (
            <div
              key={property.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <p className="font-bold">
                    {property.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {property.id}
                  </p>
                </div>

                <p className="font-semibold text-emerald-400">
                  PKR{" "}
                  {property.price_pkr.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-emerald-950/50 p-5 text-sm text-emerald-200">
          Loaded {properties?.length ?? 0} active
          properties from Supabase.
        </div>
      </div>
    </main>
  );
}