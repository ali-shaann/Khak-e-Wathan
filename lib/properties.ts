import { createClient } from "@/lib/supabase/server";
import { calculateValuation } from "@/lib/valuation";
import {
  approximatePublicCoordinates,
} from "@/lib/publicLocation";

import type {
  InternetQuality,
  Property,
  PropertyType,
  PropertyVerification,
  Slope,
  Suitability,
  Terrain,
  VerificationStatus,
} from "@/types/property";


/* ============================================================
   DATABASE TYPES
============================================================ */

type DatabaseLocation = {
  name: string;
  slug: string;
};


type DatabaseVerification = {
  seller_identity: string | null;
  property_location: string | null;
  photos: string | null;
  ownership_evidence: string | null;
  physical_inspection: string | null;
  seller_identity_note: string | null;
  property_location_note: string | null;
  photos_note: string | null;
  ownership_evidence_note: string | null;
  physical_inspection_note: string | null;
  reviewer_display_name: string | null;
  reviewed_at: string | null;
};


type DatabasePropertyImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
};


type DatabasePropertyRow = {
  id: string;

  title: string;
  description: string;

  property_type: string;

  price_pkr:
    | number
    | string;

  area_value:
    | number
    | string;

  area_unit: string;

  latitude:
    | number
    | string
    | null;

  longitude:
    | number
    | string
    | null;

  road_access: boolean;

  road_type:
    | string
    | null;

  distance_to_main_road_m:
    | number
    | null;

  water_available: boolean;

  water_source:
    | string
    | null;

  electricity_available: boolean;

  irrigation_available: boolean;

  internet_quality:
    | string
    | null;

  terrain:
    | string
    | null;

  slope:
    | string
    | null;

  residential_suitability:
    | string
    | null;

  agricultural_suitability:
    | string
    | null;

  seller_display_name:
    | string
    | null;

  locations:
    | DatabaseLocation
    | DatabaseLocation[]
    | null;

  property_verifications:
    | DatabaseVerification
    | DatabaseVerification[]
    | null;

  property_images:
    | DatabasePropertyImage[]
    | null;
};


/* ============================================================
   SHARED SELECT
============================================================ */

const propertySelect = `
  id,
  title,
  description,
  property_type,
  price_pkr,
  area_value,
  area_unit,

  latitude,
  longitude,

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
    physical_inspection,
    seller_identity_note,
    property_location_note,
    photos_note,
    ownership_evidence_note,
    physical_inspection_note,
    reviewer_display_name,
    reviewed_at
  ),

  property_images (
    id,
    storage_path,
    alt_text,
    display_order,
    is_primary
  )
`;


/* ============================================================
   GET ALL PUBLIC PROPERTIES
============================================================ */

export async function getAllProperties(): Promise<
  Property[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq(
      "listing_status",
      "active"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "GET ALL PROPERTIES ERROR:",
      error
    );

    throw new Error(
      `Failed to load properties: ${error.message}`
    );
  }

  return (data ?? []).map(
    (row) =>
      mapProperty(
        row as unknown as DatabasePropertyRow,
        supabase
      )
  );
}


/* ============================================================
   GET ONE PUBLIC PROPERTY
============================================================ */

export async function getPropertyById(
  id: string
): Promise<Property | null> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq(
      "id",
      id
    )
    .eq(
      "listing_status",
      "active"
    )
    .maybeSingle();

  if (error) {
    console.error(
      "GET PROPERTY ERROR:",
      error
    );

    throw new Error(
      `Failed to load property: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapProperty(
    data as unknown as DatabasePropertyRow,
    supabase
  );
}


/* ============================================================
   DATABASE -> FRONTEND PROPERTY
============================================================ */

function mapProperty(
  row: DatabasePropertyRow,
  supabase: Awaited<
    ReturnType<typeof createClient>
  >
): Property {
  const location =
    firstRelation(
      row.locations
    );

  const verificationRow =
    firstRelation(
      row.property_verifications
    );

  const verification =
    mapVerification(
      verificationRow
    );

  const verificationDetails =
    mapVerificationDetails(
      verificationRow
    );

  const pricePkr =
    toNumber(
      row.price_pkr
    );

  const areaValue =
    toNumber(
      row.area_value
    );

  const rawLatitude =
    toNullableNumber(
      row.latitude
    );

  const rawLongitude =
    toNullableNumber(
      row.longitude
    );

  const {
    latitude,
    longitude,
  } =
    approximatePublicCoordinates(
      row.id,
      rawLatitude,
      rawLongitude
    );


  /* ========================================================
     EXPLAINABLE VALUATION
  ======================================================== */

  const valuation =
    calculateValuation({
      locationSlug:
        location?.slug ??
        "",

      propertyType:
        normalizePropertyType(
          row.property_type
        ),

      areaValue,

      areaUnit:
        normalizeAreaUnit(
          row.area_unit
        ),

      roadAccess:
        row.road_access,

      distanceToMainRoadM:
        row.distance_to_main_road_m,

      waterAvailable:
        row.water_available,

      electricityAvailable:
        row.electricity_available,

      irrigationAvailable:
        row.irrigation_available,

      internetQuality:
        normalizeInternetQuality(
          row.internet_quality
        ),

      terrain:
        normalizeTerrain(
          row.terrain
        ),

      slope:
        normalizeSlope(
          row.slope
        ),

      residentialSuitability:
        normalizeSuitability(
          row.residential_suitability
        ),

      agriculturalSuitability:
        normalizeSuitability(
          row.agricultural_suitability
        ),

      verification: {
        sellerIdentity:
          verificationRow
            ?.seller_identity,

        propertyLocation:
          verificationRow
            ?.property_location,

        photos:
          verificationRow
            ?.photos,

        ownershipEvidence:
          verificationRow
            ?.ownership_evidence,

        physicalInspection:
          verificationRow
            ?.physical_inspection,
      },
    });


  /* ========================================================
     PROPERTY IMAGES
  ======================================================== */

  const databaseImages =
    [
      ...(
        row.property_images ??
        []
      ),
    ].sort(
      (
        first,
        second
      ) =>
        first.display_order -
        second.display_order
    );

  const images =
    databaseImages.map(
      (image) => {
        const {
          data: publicData,
        } = supabase.storage
          .from(
            "property-images"
          )
          .getPublicUrl(
            image.storage_path
          );

        return {
          id:
            image.id,

          storagePath:
            image.storage_path,

          altText:
            image.alt_text,

          displayOrder:
            image.display_order,

          isPrimary:
            image.is_primary,

          url:
            publicData.publicUrl,
        };
      }
    );


  /* ========================================================
     FINAL FRONTEND OBJECT
  ======================================================== */

  return {
    id:
      row.id,

    title:
      row.title,

    description:
      row.description,

    price:
      formatPrice(
        pricePkr
      ),

    pricePkr,

    estimate:
      formatEstimate(
        valuation.estimatedMinPkr,
        valuation.estimatedMaxPkr
      ),

    valuation,

    location:
      location?.name ??
      "Chitral",

    locationSlug:
      location?.slug ??
      "",

    latitude,

    longitude,

    size:
      formatArea(
        areaValue,
        row.area_unit
      ),

    type:
      mapPropertyType(
        row.property_type
      ),

    gradient:
      getPropertyGradient(
        row.id
      ),

    roadAccess:
      row.road_access,

    roadType:
      row.road_type ??
      "Not specified",

    distanceToMainRoadM:
      row.distance_to_main_road_m,

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
      mapTerrain(
        row.terrain
      ),

    slope:
      mapSlope(
        row.slope
      ),

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
      "Seller",

    verification,
    verificationDetails,
    images,
  };
}


/* ============================================================
   RELATION HELPER
============================================================ */

function firstRelation<T>(
  relation:
    | T
    | T[]
    | null
    | undefined
): T | null {
  if (!relation) {
    return null;
  }

  if (
    Array.isArray(
      relation
    )
  ) {
    return (
      relation[0] ??
      null
    );
  }

  return relation;
}


/* ============================================================
   NUMBER HELPERS
============================================================ */

function toNumber(
  value:
    | number
    | string
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return 0;
  }

  return parsed;
}


function toNullableNumber(
  value:
    | number
    | string
    | null
    | undefined
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return null;
  }

  return parsed;
}


/* ============================================================
   DISPLAY PRICE
============================================================ */

function formatPrice(
  value: number
): string {
  if (
    value >=
    10_000_000
  ) {
    return `PKR ${formatDecimal(
      value /
        10_000_000
    )} Crore`;
  }

  if (
    value >=
    100_000
  ) {
    return `PKR ${formatDecimal(
      value /
        100_000
    )} Lakh`;
  }

  return `PKR ${value.toLocaleString()}`;
}


function formatEstimate(
  minimum: number,
  maximum: number
): string {
  if (
    minimum >=
      10_000_000 &&
    maximum >=
      10_000_000
  ) {
    return `PKR ${formatDecimal(
      minimum /
        10_000_000
    )}–${formatDecimal(
      maximum /
        10_000_000
    )} Crore`;
  }

  if (
    minimum >=
      100_000 &&
    maximum >=
      100_000
  ) {
    return `PKR ${formatDecimal(
      minimum /
        100_000
    )}–${formatDecimal(
      maximum /
        100_000
    )} Lakh`;
  }

  return `PKR ${minimum.toLocaleString()}–${maximum.toLocaleString()}`;
}


function formatDecimal(
  value: number
): string {
  return value.toLocaleString(
    "en-US",
    {
      maximumFractionDigits:
        2,
    }
  );
}


/* ============================================================
   AREA DISPLAY
============================================================ */

function formatArea(
  value: number,
  unit: string
): string {
  const formatted =
    value.toLocaleString(
      "en-US",
      {
        maximumFractionDigits:
          2,
      }
    );

  switch (unit) {
    case "kanal":
      return `${formatted} Kanal`;

    case "sq_ft":
      return `${formatted} sq ft`;

    default:
      return `${formatted} Marla`;
  }
}


/* ============================================================
   FRONTEND ENUM MAPPERS
============================================================ */

function mapPropertyType(
  value: string
): PropertyType {
  switch (value) {
    case "agricultural":
      return "Agricultural";

    case "commercial":
      return "Commercial";

    default:
      return "Residential";
  }
}


function mapInternetQuality(
  value:
    | string
    | null
): InternetQuality | null {
  switch (value) {
    case "poor":
      return "Poor";

    case "fair":
      return "Fair";

    case "good":
      return "Good";

    default:
      return null;
  }
}


function mapTerrain(
  value:
    | string
    | null
): Terrain | null {
  switch (value) {
    case "flat":
      return "Flat";

    case "mixed":
      return "Mixed";

    case "sloped":
      return "Sloped";

    default:
      return null;
  }
}


function mapSlope(
  value:
    | string
    | null
): Slope | null {
  switch (value) {
    case "low":
      return "Low";

    case "moderate":
      return "Moderate";

    case "steep":
      return "Steep";

    default:
      return null;
  }
}


function mapSuitability(
  value:
    | string
    | null
): Suitability | null {
  switch (value) {
    case "low":
      return "Low";

    case "moderate":
      return "Moderate";

    case "high":
      return "High";

    default:
      return null;
  }
}


/* ============================================================
   VALUATION NORMALIZERS
============================================================ */

function normalizePropertyType(
  value: string
):
  | "residential"
  | "agricultural"
  | "commercial" {
  if (
    value ===
      "agricultural" ||
    value ===
      "commercial"
  ) {
    return value;
  }

  return "residential";
}


function normalizeAreaUnit(
  value: string
):
  | "marla"
  | "kanal"
  | "sq_ft" {
  if (
    value ===
      "kanal" ||
    value ===
      "sq_ft"
  ) {
    return value;
  }

  return "marla";
}


function normalizeInternetQuality(
  value:
    | string
    | null
):
  | "poor"
  | "fair"
  | "good"
  | null {
  if (
    value === "poor" ||
    value === "fair" ||
    value === "good"
  ) {
    return value;
  }

  return null;
}


function normalizeTerrain(
  value:
    | string
    | null
):
  | "flat"
  | "mixed"
  | "sloped"
  | null {
  if (
    value === "flat" ||
    value === "mixed" ||
    value === "sloped"
  ) {
    return value;
  }

  return null;
}


function normalizeSlope(
  value:
    | string
    | null
):
  | "low"
  | "moderate"
  | "steep"
  | null {
  if (
    value === "low" ||
    value === "moderate" ||
    value === "steep"
  ) {
    return value;
  }

  return null;
}


function normalizeSuitability(
  value:
    | string
    | null
):
  | "low"
  | "moderate"
  | "high"
  | null {
  if (
    value === "low" ||
    value ===
      "moderate" ||
    value === "high"
  ) {
    return value;
  }

  return null;
}


/* ============================================================
   VERIFICATION
============================================================ */

function mapVerification(
  verification:
    | DatabaseVerification
    | null
): PropertyVerification {
  return {
    sellerIdentity:
      mapVerificationStatus(
        verification
          ?.seller_identity
      ),

    location:
      mapVerificationStatus(
        verification
          ?.property_location
      ),

    photos:
      mapVerificationStatus(
        verification?.photos
      ),

    ownershipEvidence:
      mapVerificationStatus(
        verification
          ?.ownership_evidence
      ),

    physicalInspection:
      mapVerificationStatus(
        verification
          ?.physical_inspection
      ),
  };
}


function mapVerificationDetails(
  verification:
    | DatabaseVerification
    | null
) {
  return {
    reviewerName:
      verification
        ?.reviewer_display_name ??
      null,

    reviewedAt:
      verification
        ?.reviewed_at ??
      null,

    notes: {
      sellerIdentity:
        verification
          ?.seller_identity_note ??
        null,

      location:
        verification
          ?.property_location_note ??
        null,

      photos:
        verification
          ?.photos_note ??
        null,

      ownershipEvidence:
        verification
          ?.ownership_evidence_note ??
        null,

      physicalInspection:
        verification
          ?.physical_inspection_note ??
        null,
    },
  };
}


function mapVerificationStatus(
  value:
    | string
    | null
    | undefined
): VerificationStatus {
  if (
    value === "verified"
  ) {
    return "verified";
  }

  if (
    value === "pending"
  ) {
    return "pending";
  }

  return "not-checked";
}


/* ============================================================
   FALLBACK CARD GRADIENT
============================================================ */

const propertyGradients = [
  "from-emerald-100 via-teal-100 to-slate-200",

  "from-sky-100 via-slate-100 to-indigo-100",

  "from-lime-100 via-emerald-100 to-slate-100",

  "from-orange-100 via-amber-50 to-slate-200",

  "from-cyan-100 via-sky-100 to-slate-200",

  "from-violet-100 via-slate-100 to-pink-100",
];


function getPropertyGradient(
  id: string
): string {
  const hash =
    [...id].reduce(
      (
        total,
        character
      ) =>
        total +
        character.charCodeAt(
          0
        ),
      0
    );

  return propertyGradients[
    hash %
      propertyGradients.length
  ];
}