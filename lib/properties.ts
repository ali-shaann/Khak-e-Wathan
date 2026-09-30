import { createClient } from "@/lib/supabase/server";

import {
  InternetQuality,
  Property,
  PropertyType,
  PropertyVerification,
  Slope,
  Suitability,
  Terrain,
  VerificationStatus,
} from "@/types/property";

type LocationRelation = {
  name: string;
  slug: string;
};

type VerificationRelation = {
  seller_identity: string;
  property_location: string;
  photos: string;
  ownership_evidence: string;
  physical_inspection: string;
};

type PropertyRow = {
  id: string;

  title: string;
  description: string;

  property_type: string;

  price_pkr: number;

  estimated_min_pkr: number | null;
  estimated_max_pkr: number | null;

  area_value: number;
  area_unit: string;

  latitude: number | null;
  longitude: number | null;

  road_access: boolean;
  road_type: string | null;
  distance_to_main_road_m: number | null;

  water_available: boolean;
  water_source: string | null;

  electricity_available: boolean;
  irrigation_available: boolean;

  internet_quality: string | null;

  terrain: string | null;
  slope: string | null;

  residential_suitability: string | null;
  agricultural_suitability: string | null;

  seller_display_name: string | null;

  locations:
    | LocationRelation
    | LocationRelation[]
    | null;

  property_verifications:
    | VerificationRelation
    | VerificationRelation[]
    | null;
};

const propertySelect = `
  latitude,
  longitude,
  id,
  title,
  description,
  property_type,
  price_pkr,
  estimated_min_pkr,
  estimated_max_pkr,
  area_value,
  area_unit,
  road_access,
  road_type,
  distance_to_main_road_m,
  water_available,
  water_source,
  electricity_available,
  irrigation_available,
  internet_quality,
  terrain,
  slope,
  residential_suitability,
  agricultural_suitability,
  seller_display_name,
  locations (
    name,
    slug
  ),
  property_verifications (
    seller_identity,
    property_location,
    photos,
    ownership_evidence,
    physical_inspection
  )
`;

export async function getAllProperties(): Promise<Property[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("listing_status", "active")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load properties: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProperty(row as unknown as PropertyRow)
  );
}

export async function getPropertyById(
  id: string
): Promise<Property | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("id", id)
    .eq("listing_status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load property: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapProperty(
    data as unknown as PropertyRow
  );
}

function mapProperty(
  row: PropertyRow
): Property {
  const location = firstRelation(
    row.locations
  );

  const verification = firstRelation(
    row.property_verifications
  );

  const pricePkr = Number(row.price_pkr);

  const estimatedMin =
    row.estimated_min_pkr === null
      ? null
      : Number(row.estimated_min_pkr);

  const estimatedMax =
    row.estimated_max_pkr === null
      ? null
      : Number(row.estimated_max_pkr);

  return {
    id: row.id,

    price: formatPrice(pricePkr),
    pricePkr,

    estimate: formatEstimate(
      estimatedMin,
      estimatedMax
    ),

    title: row.title,

    location:
      location?.name ?? "Chitral",

    locationSlug:
      location?.slug ?? "chitral",

    latitude:
    row.latitude === null
    ? null
    : Number(row.latitude),

    longitude:
    row.longitude === null
    ? null
    : Number(row.longitude),

    size: formatArea(
      Number(row.area_value),
      row.area_unit
    ),

    type: mapPropertyType(
      row.property_type
    ),

    gradient: getPropertyGradient(
      row.id
    ),

    description: row.description,

    roadAccess: row.road_access,

    roadType:
      row.road_type ??
      "Not specified",

    distanceToMainRoadM:
      row.distance_to_main_road_m ?? 0,

    waterAvailable:
      row.water_available,

    waterSource:
      row.water_source ??
      "Not specified",

    electricityAvailable:
      row.electricity_available,

    irrigationAvailable:
      row.irrigation_available,

    internetQuality:
      mapInternetQuality(
        row.internet_quality
      ),

    terrain:
      mapTerrain(row.terrain),

    slope:
      mapSlope(row.slope),

    residentialSuitability:
      mapSuitability(
        row.residential_suitability
      ),

    agriculturalSuitability:
      mapSuitability(
        row.agricultural_suitability
      ),

    sellerName:
      row.seller_display_name ??
      "Property seller",

    verification:
      mapVerification(verification),
  };
}

function firstRelation<T>(
  value: T | T[] | null
): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function formatPrice(
  pricePkr: number
): string {
  if (pricePkr >= 10_000_000) {
    return `PKR ${formatNumber(
      pricePkr / 10_000_000
    )} Crore`;
  }

  if (pricePkr >= 100_000) {
    return `PKR ${formatNumber(
      pricePkr / 100_000
    )} Lakh`;
  }

  return `PKR ${pricePkr.toLocaleString()}`;
}

function formatEstimate(
  min: number | null,
  max: number | null
): string {
  if (min === null || max === null) {
    return "Not available";
  }

  if (
    min >= 10_000_000 &&
    max >= 10_000_000
  ) {
    return `${formatNumber(
      min / 10_000_000
    )}–${formatNumber(
      max / 10_000_000
    )} Crore`;
  }

  return `${formatNumber(
    min / 100_000
  )}–${formatNumber(
    max / 100_000
  )} Lakh`;
}

function formatArea(
  value: number,
  unit: string
): string {
  const displayValue =
    formatNumber(value);

  if (unit === "marla") {
    return `${displayValue} Marla`;
  }

  if (unit === "kanal") {
    return `${displayValue} Kanal`;
  }

  if (unit === "sq_ft") {
    return `${displayValue} sq ft`;
  }

  return `${displayValue} ${unit}`;
}

function formatNumber(
  value: number
): string {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}

function mapPropertyType(
  value: string
): PropertyType {
  if (value === "agricultural") {
    return "Agricultural";
  }

  if (value === "commercial") {
    return "Commercial";
  }

  return "Residential";
}

function mapInternetQuality(
  value: string | null
): InternetQuality {
  if (value === "poor") {
    return "Poor";
  }

  if (value === "fair") {
    return "Fair";
  }

  return "Good";
}

function mapTerrain(
  value: string | null
): Terrain {
  if (value === "mixed") {
    return "Mixed";
  }

  if (value === "sloped") {
    return "Sloped";
  }

  return "Flat";
}

function mapSlope(
  value: string | null
): Slope {
  if (value === "moderate") {
    return "Moderate";
  }

  if (value === "steep") {
    return "Steep";
  }

  return "Low";
}

function mapSuitability(
  value: string | null
): Suitability {
  if (value === "low") {
    return "Low";
  }

  if (value === "moderate") {
    return "Moderate";
  }

  return "High";
}

function mapVerificationStatus(
  value: string | undefined
): VerificationStatus {
  if (value === "verified") {
    return "verified";
  }

  if (value === "pending") {
    return "pending";
  }

  return "not-checked";
}

function mapVerification(
  verification:
    | VerificationRelation
    | null
): PropertyVerification {
  return {
    sellerIdentity:
      mapVerificationStatus(
        verification?.seller_identity
      ),

    location:
      mapVerificationStatus(
        verification?.property_location
      ),

    photos:
      mapVerificationStatus(
        verification?.photos
      ),

    ownershipEvidence:
      mapVerificationStatus(
        verification?.ownership_evidence
      ),

    physicalInspection:
      mapVerificationStatus(
        verification?.physical_inspection
      ),
  };
}

function getPropertyGradient(
  id: string
): string {
  const gradients = [
    "from-emerald-100 via-teal-100 to-slate-200",
    "from-sky-100 via-slate-100 to-indigo-100",
    "from-lime-100 via-emerald-100 to-slate-100",
    "from-orange-100 via-amber-50 to-slate-200",
    "from-cyan-100 via-sky-100 to-slate-200",
    "from-violet-100 via-slate-100 to-pink-100",
  ];

  let hash = 0;

  for (let index = 0; index < id.length; index++) {
    hash += id.charCodeAt(index);
  }

  return gradients[
    hash % gradients.length
  ];
}