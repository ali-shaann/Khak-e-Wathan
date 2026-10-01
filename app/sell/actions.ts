"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createListing(formData: FormData) {
  const supabase = await createClient();

  /* ---------------------------------------------------------
     Authentication
  --------------------------------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* ---------------------------------------------------------
     Basic values
  --------------------------------------------------------- */

  const title = getText(formData, "title");

  const description = getText(formData, "description");

  const locationId = getText(formData, "locationId");

  const propertyType = getText(formData, "propertyType");

  const areaUnit = getText(formData, "areaUnit");

  const pricePkr = Number(formData.get("pricePkr"));

  const areaValue = Number(formData.get("areaValue"));

  /* ---------------------------------------------------------
     Validation
  --------------------------------------------------------- */

  if (!title || !description || !locationId) {
    redirect("/sell?error=Please complete all required property information.");
  }

  if (!["residential", "agricultural", "commercial"].includes(propertyType)) {
    redirect("/sell?error=Invalid property type.");
  }

  if (!["marla", "kanal", "sq_ft"].includes(areaUnit)) {
    redirect("/sell?error=Invalid land area unit.");
  }

  if (!Number.isFinite(pricePkr) || pricePkr <= 0) {
    redirect("/sell?error=Please enter a valid asking price.");
  }

  if (!Number.isFinite(areaValue) || areaValue <= 0) {
    redirect("/sell?error=Please enter a valid land size.");
  }

  /* ---------------------------------------------------------
     Confirm location is an active Khak-e-Wathan location
  --------------------------------------------------------- */

  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("id")
    .eq("id", locationId)
    .eq("is_active", true)
    .maybeSingle();

  if (locationError || !location) {
    redirect("/sell?error=Please choose a valid active location.");
  }

  /* ---------------------------------------------------------
     Seller profile
  --------------------------------------------------------- */

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const sellerName =
    profile?.full_name || user.email?.split("@")[0] || "Seller";

  /* ---------------------------------------------------------
     Optional / structured property data
  --------------------------------------------------------- */

  const roadAccess = formData.get("roadAccess") === "on";

  const roadType = optionalText(formData, "roadType");

  const distanceToMainRoadM = optionalNumber(formData, "distanceToMainRoadM");

  const waterAvailable = formData.get("waterAvailable") === "on";

  const waterSource = optionalText(formData, "waterSource");

  const electricityAvailable = formData.get("electricityAvailable") === "on";

  const irrigationAvailable = formData.get("irrigationAvailable") === "on";

  const internetQuality = optionalEnum(formData, "internetQuality", [
    "poor",
    "fair",
    "good",
  ]);

  const terrain = optionalEnum(formData, "terrain", [
    "flat",
    "mixed",
    "sloped",
  ]);

  const slope = optionalEnum(formData, "slope", ["low", "moderate", "steep"]);

  const residentialSuitability = optionalEnum(
    formData,
    "residentialSuitability",
    ["low", "moderate", "high"],
  );

  const agriculturalSuitability = optionalEnum(
    formData,
    "agriculturalSuitability",
    ["low", "moderate", "high"],
  );

  /* ---------------------------------------------------------
     Create property
  --------------------------------------------------------- */

  const latitudeRaw = getText(formData, "latitude");

  const longitudeRaw = getText(formData, "longitude");

  const latitude = Number(latitudeRaw);

  const longitude = Number(longitudeRaw);

  if (
    !latitudeRaw ||
    !longitudeRaw ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    redirect("/sell?error=Please select the property location on the map.");
  }
  const propertyId = `listing-${randomUUID()}`;

  const { error: insertError } = await supabase
    .from("properties")

    .insert({
      id: propertyId,

      seller_id: user.id,

      location_id: locationId,

      title,
      description,

      property_type: propertyType,

      listing_status: "pending_review",

      price_pkr: Math.round(pricePkr),

      latitude,
      longitude,

      area_value: areaValue,

      area_unit: areaUnit,

      road_access: roadAccess,

      road_type: roadType,

      distance_to_main_road_m: distanceToMainRoadM,

      water_available: waterAvailable,

      water_source: waterSource,

      electricity_available: electricityAvailable,

      irrigation_available: irrigationAvailable,

      internet_quality: internetQuality,

      terrain,
      slope,

      residential_suitability: residentialSuitability,

      agricultural_suitability: agriculturalSuitability,

      seller_display_name: sellerName,
    });

  if (insertError) {
    console.error("PROPERTY INSERT ERROR:", insertError);

    redirect(`/sell?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath("/dashboard");

  redirect(`/sell/photos?property=${encodeURIComponent(propertyId)}`);
}

/* ============================================================
   Helpers
============================================================ */

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = getText(formData, key);

  return value || null;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = getText(formData, key);

  if (!raw) {
    return null;
  }

  const value = Number(raw);

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

function optionalEnum(
  formData: FormData,
  key: string,
  allowedValues: string[],
) {
  const value = getText(formData, key);

  if (allowedValues.includes(value)) {
    return value;
  }

  return null;
}
