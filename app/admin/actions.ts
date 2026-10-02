"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";


/* ============================================================
   ADMIN CHECK
============================================================ */

async function requireAdmin() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  return {
    supabase,
    user,
  };
}


/* ============================================================
   APPROVE
============================================================ */

export async function approveProperty(
  formData: FormData
) {
  const propertyId =
    String(
      formData.get("propertyId") ?? ""
    ).trim();

  const reviewNotes =
    String(
      formData.get("reviewNotes") ?? ""
    ).trim();

  if (!propertyId) {
    redirect("/admin");
  }

  const {
    supabase,
  } = await requireAdmin();

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_review_property",
    {
      p_property_id:
        propertyId,

      p_decision:
        "approve",

      p_review_notes:
        reviewNotes || null,
    }
  );

  if (
    error ||
    data !== true
  ) {
    console.error(
      "APPROVE PROPERTY ERROR:",
      {
        message:
          error?.message,
        details:
          error?.details,
        hint:
          error?.hint,
      }
    );

    redirect(
      `/admin/properties/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        error?.message ??
          "Property could not be approved."
      )}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/properties");
  revalidatePath("/map");

  revalidatePath(
    `/properties/${propertyId}`
  );

  redirect(
    "/admin?message=Property approved and published."
  );
}


/* ============================================================
   REJECT
============================================================ */

export async function rejectProperty(
  formData: FormData
) {
  const propertyId =
    String(
      formData.get("propertyId") ?? ""
    ).trim();

  const reviewNotes =
    String(
      formData.get("reviewNotes") ?? ""
    ).trim();

  if (!propertyId) {
    redirect("/admin");
  }

  if (
    reviewNotes.length < 5
  ) {
    redirect(
      `/admin/properties/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        "Please provide a short reason before rejecting the listing."
      )}`
    );
  }

  const {
    supabase,
  } = await requireAdmin();

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_review_property",
    {
      p_property_id:
        propertyId,

      p_decision:
        "reject",

      p_review_notes:
        reviewNotes,
    }
  );

  if (
    error ||
    data !== true
  ) {
    console.error(
      "REJECT PROPERTY ERROR:",
      {
        message:
          error?.message,
        details:
          error?.details,
        hint:
          error?.hint,
      }
    );

    redirect(
      `/admin/properties/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        error?.message ??
          "Property could not be rejected."
      )}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  redirect(
    "/admin?message=Property returned to the seller."
  );
}

export async function updateVerification(
  formData: FormData
) {
  const propertyId =
    String(
      formData.get("propertyId") ?? ""
    ).trim();

  if (!propertyId) {
    redirect("/admin");
  }

  const sellerIdentity =
    getVerificationStatus(
      formData,
      "sellerIdentity"
    );

  const propertyLocation =
    getVerificationStatus(
      formData,
      "propertyLocation"
    );

  const photos =
    getVerificationStatus(
      formData,
      "photos"
    );

  const ownershipEvidence =
    getVerificationStatus(
      formData,
      "ownershipEvidence"
    );

  const physicalInspection =
    getVerificationStatus(
      formData,
      "physicalInspection"
    );

  const {
    supabase,
  } = await requireAdmin();

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_update_property_verification",
    {
      p_property_id:
        propertyId,

      p_seller_identity:
        sellerIdentity,

      p_property_location:
        propertyLocation,

      p_photos:
        photos,

      p_ownership_evidence:
        ownershipEvidence,

      p_physical_inspection:
        physicalInspection,
    }
  );

  if (
    error ||
    data !== true
  ) {
    console.error(
      "VERIFICATION UPDATE ERROR:",
      {
        message:
          error?.message,

        details:
          error?.details,

        hint:
          error?.hint,
      }
    );

    redirect(
      `/admin/properties/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        error?.message ??
          "Verification could not be updated."
      )}`
    );
  }

  revalidatePath(
    `/admin/properties/${propertyId}`
  );

  revalidatePath(
    `/properties/${propertyId}`
  );

  redirect(
    `/admin/properties/${encodeURIComponent(
      propertyId
    )}?message=${encodeURIComponent(
      "Verification updated."
    )}`
  );
}


/* ============================================================
   VERIFICATION HELPER
============================================================ */

function getVerificationStatus(
  formData: FormData,
  key: string
) {
  const value =
    String(
      formData.get(key) ?? ""
    ).trim();

  if (
    value === "verified" ||
    value === "pending" ||
    value === "not_checked"
  ) {
    return value;
  }

  return "not_checked";
}