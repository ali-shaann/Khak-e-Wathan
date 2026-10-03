import {
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import SellerFlowSteps from "@/components/sell/SellerFlowSteps";
import PhotoUploader from "@/components/sell/PhotoUploader";

import {
  createClient,
} from "@/lib/supabase/server";


export default async function SellPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{
    property?: string;
    error?: string;
  }>;
}) {
  const params =
    await searchParams;


  const propertyId =
    params.property?.trim();


  if (!propertyId) {
    redirect(
      "/dashboard"
    );
  }


  const supabase =
    await createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    redirect(
      "/login"
    );
  }


  const {
    data:
      property,
  } =
    await supabase
      .from(
        "properties"
      )
      .select(`
        id,
        title,
        listing_status
      `)
      .eq(
        "id",
        propertyId
      )
      .eq(
        "seller_id",
        user.id
      )
      .maybeSingle();


  if (!property) {
    redirect(
      "/dashboard?error=Property not found."
    );
  }


  if (
    ![
      "draft",
      "rejected",
    ].includes(
      property.listing_status
    )
  ) {
    redirect(
      "/dashboard?error=This listing can no longer be edited."
    );
  }


  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

        <SellerFlowSteps
          current={2}
          propertyId={
            property.id
          }
        />


        <div className="mt-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Step 2 of 3 · Photos
          </p>


          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Show buyers the property.
          </h1>


          <p className="mt-4 max-w-2xl leading-7 text-slate-500">
            Add up to five clear photos of the land, access, surroundings, or
            useful features. At least one photo is required before final review.
          </p>
        </div>


        {params.error && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">

            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>


            <span>
              {
                params.error
              }
            </span>
          </div>
        )}


        <div className="mt-8 flex flex-col justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Draft property
            </p>


            <p className="mt-1 font-bold">
              {
                property.title
              }
            </p>
          </div>


          <span className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Private draft
          </span>
        </div>


        <PhotoUploader
          userId={
            user.id
          }
          propertyId={
            property.id
          }
        />
      </section>
    </main>
  );
}
