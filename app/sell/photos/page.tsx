import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import PhotoUploader from "@/components/sell/PhotoUploader";
import { createClient } from "@/lib/supabase/server";

export default async function SellPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{
    property?: string;
  }>;
}) {
  const params = await searchParams;

  const propertyId =
    params.property?.trim();

  if (!propertyId) {
    redirect("/dashboard");
  }

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: property,
  } = await supabase
    .from("properties")
    .select(
      `
        id,
        title,
        listing_status
      `
    )
    .eq("id", propertyId)
    .eq("seller_id", user.id)
    .maybeSingle();

  if (!property) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link
            href="/sell"
            className="transition hover:text-slate-700"
          >
            Property
          </Link>

          <span>→</span>

          <span className="font-semibold text-slate-950">
            Photos
          </span>

          <span>→</span>

          <span>Review</span>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Step 05
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Add property photos.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-500">
            Upload clear photos that help buyers understand
            the property and its surroundings.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Property
          </p>

          <p className="mt-1 font-bold">
            {property.title}
          </p>
        </div>

        <PhotoUploader
          userId={user.id}
          propertyId={property.id}
        />
      </section>
    </main>
  );
}