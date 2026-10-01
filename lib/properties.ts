import { createClient } from "@/lib/supabase/server";

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

  estimated_min_pkr:
    | number
    | string
    | null;

  estimated_max_pkr:
    | number
    | string
    | null;

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
   SUPABASE SELECT
============================================================ */

const propertySelect = `
  id,
  title,
  description,
  property_type,
  price_pkr,
  estimated_min_pkr,
  estimated_max_pkr,
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
    physical_inspection
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
   PUBLIC DATABASE FUNCTIONS
============================================================ */

export async function getAllProperties(): Promise<Property[]> {
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
   PROPERTY MAPPER
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

  const verification =
    firstRelation(
      row.property_verifications
    );

  const pricePkr =
    toNumber(
      row.price_pkr
    );

  const estimatedMin =
    toNullableNumber(
      row.estimated_min_pkr
    );

  const estimatedMax =
    toNullableNumber(
      row.estimated_max_pkr
    );

  /*
    Sort photos by display_order before
    turning them into frontend images.
  */
  const databaseImages =
    [...(
      row.property_images ??
      []
    )].sort(
      (a, b) =>
        a.display_order -
        b.display_order
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

  return {
    id:
      row.id,

    price:
      formatPrice(
        pricePkr
      ),

    pricePkr,

    estimate:
      formatEstimate(
        estimatedMin,
        estimatedMax
      ),

    title:
      row.title,

    location:
      location?.name ??
      "Chitral",

    locationSlug:
      location?.slug ??
      "",

    latitude:
      toNullableNumber(
        row.latitude
      ),

    longitude:
      toNullableNumber(
        row.longitude
      ),

    size:
      formatArea(
        row.area_value,
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

    description:
      row.description,

    roadAccess:
      row.road_access,

    roadType:
      row.road_type ??
      "Not specified",

    distanceToMainRoadM:
      row.distance_to_main_road_m ??
      0,

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

    verification:
      mapVerification(
        verification
      ),

    images,
  };
}


/* ============================================================
   RELATION HELPERS
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
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }

  return number;
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

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  return number;
}


/* ============================================================
   PRICE FORMATTING
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
  minimum:
    | number
    | null,
  maximum:
    | number
    | null
): string {
  if (
    minimum === null ||
    maximum === null
  ) {
    return "Not available";
  }

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
   AREA FORMATTING
============================================================ */

function formatArea(
  value:
    | number
    | string,
  unit: string
): string {
  const numericValue =
    toNumber(value);

  const formatted =
    numericValue.toLocaleString(
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
   PROPERTY ENUM MAPPERS
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
): InternetQuality {
  switch (value) {
    case "poor":
      return "Poor";

    case "fair":
      return "Fair";

    default:
      return "Good";
  }
}


function mapTerrain(
  value:
    | string
    | null
): Terrain {
  switch (value) {
    case "mixed":
      return "Mixed";

    case "sloped":
      return "Sloped";

    default:
      return "Flat";
  }
}


function mapSlope(
  value:
    | string
    | null
): Slope {
  switch (value) {
    case "moderate":
      return "Moderate";

    case "steep":
      return "Steep";

    default:
      return "Low";
  }
}


function mapSuitability(
  value:
    | string
    | null
): Suitability {
  switch (value) {
    case "low":
      return "Low";

    case "moderate":
      return "Moderate";

    default:
      return "High";
  }
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


function mapVerificationStatus(
  value:
    | string
    | null
    | undefined
): VerificationStatus {
  if (
    value ===
    "verified"
  ) {
    return "verified";
  }

  if (
    value ===
    "pending"
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