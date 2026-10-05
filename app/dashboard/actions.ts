"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


export async function updateInquiryStatus(
  formData: FormData
) {
  const inquiryId =
    String(
      formData.get(
        "inquiryId"
      ) ??
        ""
    ).trim();

  const status =
    String(
      formData.get(
        "status"
      ) ??
        ""
    ).trim();


  if (
    !inquiryId ||
    ![
      "contacted",
      "closed",
    ].includes(
      status
    )
  ) {
    redirect(
      "/dashboard?error=Invalid inquiry update."
    );
  }


  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser();


  if (!user) {
    redirect(
      "/login"
    );
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "property_inquiries"
      )
      .update({
        status,
      })
      .eq(
        "id",
        inquiryId
      )
      .select(
        "id"
      )
      .maybeSingle();


  if (
    error ||
    !data
  ) {
    console.error(
      "INQUIRY STATUS ERROR:",
      error
    );


    redirect(
      "/dashboard?error=The inquiry could not be updated."
    );
  }


  revalidatePath(
    "/dashboard"
  );


  redirect(
    "/dashboard?message=Inquiry updated."
  );
}


export async function updateListingStatus(
  formData: FormData
) {
  const propertyId =
    String(
      formData.get(
        "propertyId"
      ) ??
        ""
    ).trim();

  const status =
    String(
      formData.get(
        "status"
      ) ??
        ""
    ).trim();


  if (
    !propertyId ||
    ![
      "active",
      "sold",
      "archived",
    ].includes(
      status
    )
  ) {
    redirect(
      "/dashboard?error=Invalid listing update."
    );
  }


  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser();


  if (!user) {
    redirect(
      "/login"
    );
  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "seller_update_property_status",
      {
        p_property_id:
          propertyId,

        p_status:
          status,
      }
    );


  if (
    error ||
    data !==
      true
  ) {
    console.error(
      "LISTING STATUS ERROR:",
      error
    );


    redirect(
      "/dashboard?error=The listing status could not be updated."
    );
  }


  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/"
  );

  revalidatePath(
    "/properties"
  );

  revalidatePath(
    "/map"
  );

  revalidatePath(
    `/properties/${propertyId}`
  );


  redirect(
    "/dashboard?message=Listing status updated."
  );
}
