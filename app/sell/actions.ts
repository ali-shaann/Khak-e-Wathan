"use server";

import {
  randomUUID,
} from "crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  CHITRAL_LIMITS,
} from "@/components/map/mapConfig";


/* ============================================================
   CREATE LISTING
============================================================ */

export type CreateListingState = {
  error: string | null;
};

export async function createListing(
  _previousState: CreateListingState,
  formData: FormData
): Promise<CreateListingState> {
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


  const values =
    readListingValues(
      formData
    );


  const validationError =
    validateListingValues(
      values
    );


  if (validationError) {
    return {
      error:
        validationError,
    };
  }


  const {
    data: location,
    error:
      locationError,
  } =
    await supabase
      .from(
        "locations"
      )
      .select("id")
      .eq(
        "id",
        values.locationId
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();


  if (
    locationError ||
    !location
  ) {
    return {
      error:
        "Please choose a valid active location.",
    };
  }


  const {
    data: profile,
  } =
    await supabase
      .from(
        "profiles"
      )
      .select(
        "full_name"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  const sellerName =
    profile?.full_name ||
    user.email?.split(
      "@"
    )[0] ||
    "Seller";


  const latitudeRaw =
    getText(
      formData,
      "latitude"
    );

  const longitudeRaw =
    getText(
      formData,
      "longitude"
    );


  const latitude =
    Number(
      latitudeRaw
    );

  const longitude =
    Number(
      longitudeRaw
    );


  if (
    !latitudeRaw ||
    !longitudeRaw ||
    !isValidLatitude(
      latitude
    ) ||
    !isValidLongitude(
      longitude
    ) ||
    !isWithinChitral(
      latitude,
      longitude
    )
  ) {
    return {
      error:
        "Please select a property location within the Chitral map area.",
    };
  }


  const propertyId =
    `listing-${randomUUID()}`;


  const {
    error:
      insertError,
  } =
    await supabase
      .from(
        "properties"
      )
      .insert({
        id:
          propertyId,

        seller_id:
          user.id,

        location_id:
          values.locationId,

        title:
          values.title,

        description:
          values.description,

        property_type:
          values.propertyType,

        listing_status:
          "draft",

        price_pkr:
          Math.round(
            values.pricePkr
          ),

        area_value:
          values.areaValue,

        area_unit:
          values.areaUnit,

        latitude,

        longitude,

        road_access:
          values.roadAccess,

        road_type:
          values.roadType,

        distance_to_main_road_m:
          values.distanceToMainRoadM,

        water_available:
          values.waterAvailable,

        water_source:
          values.waterSource,

        electricity_available:
          values.electricityAvailable,

        irrigation_available:
          values.irrigationAvailable,

        internet_quality:
          values.internetQuality,

        terrain:
          values.terrain,

        slope:
          values.slope,

        residential_suitability:
          values.residentialSuitability,

        agricultural_suitability:
          values.agriculturalSuitability,

        seller_display_name:
          sellerName,
      });


  if (
    insertError
  ) {
    console.error(
      "PROPERTY INSERT ERROR:",
      insertError
    );


    return {
      error:
        insertError.message,
    };
  }


  revalidatePath(
    "/dashboard"
  );


  redirect(
    `/sell/photos?property=${encodeURIComponent(
      propertyId
    )}`
  );
}


/* ============================================================
   UPDATE LISTING
============================================================ */

export async function updateListing(
  formData: FormData
) {
  const propertyId =
    getText(
      formData,
      "propertyId"
    );


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


  /*
    Load the property first so that:
    - ownership is checked
    - status is checked
    - existing coordinates can be kept
  */

  const {
    data:
      existingProperty,

    error:
      propertyError,
  } =
    await supabase
      .from(
        "properties"
      )
      .select(`
        id,
        seller_id,
        listing_status,
        latitude,
        longitude
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


  if (
    propertyError ||
    !existingProperty
  ) {
    redirect(
      "/dashboard?error=Property not found."
    );
  }


  if (
    ![
      "draft",
      "rejected",
    ].includes(
      existingProperty
        .listing_status
    )
  ) {
    redirect(
      "/dashboard?error=This listing can no longer be edited."
    );
  }


  const values =
    readListingValues(
      formData
    );


  const validationError =
    validateListingValues(
      values
    );


  if (
    validationError
  ) {
    redirect(
      `/sell/edit/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        validationError
      )}`
    );
  }


  const {
    data: location,
    error:
      locationError,
  } =
    await supabase
      .from(
        "locations"
      )
      .select("id")
      .eq(
        "id",
        values.locationId
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();


  if (
    locationError ||
    !location
  ) {
    redirect(
      `/sell/edit/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        "Please choose a valid active location."
      )}`
    );
  }


  /*
    LocationPickerShell currently creates new latitude
    and longitude form values when the map is used.

    If the seller doesn't touch the map while editing,
    we keep the old coordinates.
  */

  const latitudeRaw =
    getText(
      formData,
      "latitude"
    );

  const longitudeRaw =
    getText(
      formData,
      "longitude"
    );


  let latitude =
    existingProperty.latitude ===
      null
      ? null
      : Number(
          existingProperty.latitude
        );


  let longitude =
    existingProperty.longitude ===
      null
      ? null
      : Number(
          existingProperty.longitude
        );


  if (
    latitudeRaw ||
    longitudeRaw
  ) {
    const newLatitude =
      Number(
        latitudeRaw
      );

    const newLongitude =
      Number(
        longitudeRaw
      );


    if (
      !latitudeRaw ||
      !longitudeRaw ||
      !isValidLatitude(
        newLatitude
      ) ||
      !isValidLongitude(
        newLongitude
      ) ||
      !isWithinChitral(
        newLatitude,
        newLongitude
      )
    ) {
      redirect(
        `/sell/edit/${encodeURIComponent(
          propertyId
        )}?error=${encodeURIComponent(
          "Please choose a property location within the Chitral map area."
        )}`
      );
    }


    latitude =
      newLatitude;

    longitude =
      newLongitude;
  }


  if (
    latitude === null ||
    longitude === null ||
    !isValidLatitude(
      latitude
    ) ||
    !isValidLongitude(
      longitude
    ) ||
    !isWithinChitral(
      latitude,
      longitude
    )
  ) {
    redirect(
      `/sell/edit/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        "Please select a property location within the Chitral map area."
      )}`
    );
  }


  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "properties"
      )
      .update({
        location_id:
          values.locationId,

        title:
          values.title,

        description:
          values.description,

        property_type:
          values.propertyType,

        price_pkr:
          Math.round(
            values.pricePkr
          ),

        area_value:
          values.areaValue,

        area_unit:
          values.areaUnit,

        latitude,

        longitude,

        road_access:
          values.roadAccess,

        road_type:
          values.roadType,

        distance_to_main_road_m:
          values.distanceToMainRoadM,

        water_available:
          values.waterAvailable,

        water_source:
          values.waterSource,

        electricity_available:
          values.electricityAvailable,

        irrigation_available:
          values.irrigationAvailable,

        internet_quality:
          values.internetQuality,

        terrain:
          values.terrain,

        slope:
          values.slope,

        residential_suitability:
          values.residentialSuitability,

        agricultural_suitability:
          values.agriculturalSuitability,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        propertyId
      )
      .eq(
        "seller_id",
        user.id
      );


  if (
    updateError
  ) {
    console.error(
      "PROPERTY UPDATE ERROR:",
      updateError
    );


    redirect(
      `/sell/edit/${encodeURIComponent(
        propertyId
      )}?error=${encodeURIComponent(
        updateError.message
      )}`
    );
  }


  revalidatePath(
    "/dashboard"
  );


  redirect(
    `/sell/photos?property=${encodeURIComponent(
      propertyId
    )}`
  );
}


/* ============================================================
   SUBMIT FOR REVIEW
============================================================ */

export async function submitListingForReview(
  formData: FormData
) {
  const propertyId =
    getText(
      formData,
      "propertyId"
    );


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
    data,
    error,
  } =
    await supabase.rpc(
      "seller_submit_property_for_review",
      {
        p_property_id:
          propertyId,
      }
    );


  if (
    error ||
    data !== true
  ) {
    console.error(
      "SUBMIT LISTING ERROR:",
      error
    );


    redirect(
      `/sell/review?property=${encodeURIComponent(
        propertyId
      )}&error=${encodeURIComponent(
        error?.message ??
          "The property could not be submitted for review."
      )}`
    );
  }


  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/admin"
  );


  redirect(
    "/dashboard?message=Property submitted for review."
  );
}


/* ============================================================
   LISTING INPUT
============================================================ */

type ListingValues = {
  title: string;

  description: string;

  locationId: string;

  propertyType: string;

  pricePkr: number;

  areaValue: number;

  areaUnit: string;

  roadAccess: boolean;

  roadType:
    | string
    | null;

  distanceToMainRoadM:
    | number
    | null;

  waterAvailable: boolean;

  waterSource:
    | string
    | null;

  electricityAvailable:
    boolean;

  irrigationAvailable:
    boolean;

  internetQuality:
    | string
    | null;

  terrain:
    | string
    | null;

  slope:
    | string
    | null;

  residentialSuitability:
    | string
    | null;

  agriculturalSuitability:
    | string
    | null;
};


function readListingValues(
  formData: FormData
): ListingValues {
  return {
    title:
      getText(
        formData,
        "title"
      ),

    description:
      getText(
        formData,
        "description"
      ),

    locationId:
      getText(
        formData,
        "locationId"
      ),

    propertyType:
      getText(
        formData,
        "propertyType"
      ),

    pricePkr:
      Number(
        formData.get(
          "pricePkr"
        )
      ),

    areaValue:
      Number(
        formData.get(
          "areaValue"
        )
      ),

    areaUnit:
      getText(
        formData,
        "areaUnit"
      ),

    roadAccess:
      formData.get(
        "roadAccess"
      ) === "on",

    roadType:
      optionalText(
        formData,
        "roadType"
      ),

    distanceToMainRoadM:
      optionalNumber(
        formData,
        "distanceToMainRoadM"
      ),

    waterAvailable:
      formData.get(
        "waterAvailable"
      ) === "on",

    waterSource:
      optionalText(
        formData,
        "waterSource"
      ),

    electricityAvailable:
      formData.get(
        "electricityAvailable"
      ) === "on",

    irrigationAvailable:
      formData.get(
        "irrigationAvailable"
      ) === "on",

    internetQuality:
      optionalEnum(
        formData,
        "internetQuality",
        [
          "poor",
          "fair",
          "good",
        ]
      ),

    terrain:
      optionalEnum(
        formData,
        "terrain",
        [
          "flat",
          "mixed",
          "sloped",
        ]
      ),

    slope:
      optionalEnum(
        formData,
        "slope",
        [
          "low",
          "moderate",
          "steep",
        ]
      ),

    residentialSuitability:
      optionalEnum(
        formData,
        "residentialSuitability",
        [
          "low",
          "moderate",
          "high",
        ]
      ),

    agriculturalSuitability:
      optionalEnum(
        formData,
        "agriculturalSuitability",
        [
          "low",
          "moderate",
          "high",
        ]
      ),
  };
}


/* ============================================================
   VALIDATION
============================================================ */

function validateListingValues(
  values: ListingValues
): string | null {
  if (
    !values.title ||
    !values.description ||
    !values.locationId
  ) {
    return "Please complete all required property information.";
  }


  if (
    ![
      "residential",
      "agricultural",
      "commercial",
    ].includes(
      values.propertyType
    )
  ) {
    return "Invalid property type.";
  }


  if (
    ![
      "marla",
      "kanal",
      "sq_ft",
    ].includes(
      values.areaUnit
    )
  ) {
    return "Invalid land area unit.";
  }


  if (
    !Number.isFinite(
      values.pricePkr
    ) ||
    values.pricePkr <= 0
  ) {
    return "Please enter a valid asking price.";
  }


  if (
    !Number.isFinite(
      values.areaValue
    ) ||
    values.areaValue <= 0
  ) {
    return "Please enter a valid land size.";
  }


  return null;
}


/* ============================================================
   HELPERS
============================================================ */

function getText(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(
      key
    ) ??
      ""
  ).trim();
}


function optionalText(
  formData: FormData,
  key: string
) {
  const value =
    getText(
      formData,
      key
    );


  return (
    value ||
    null
  );
}


function optionalNumber(
  formData: FormData,
  key: string
) {
  const raw =
    getText(
      formData,
      key
    );


  if (!raw) {
    return null;
  }


  const value =
    Number(raw);


  if (
    !Number.isFinite(
      value
    ) ||
    value < 0
  ) {
    return null;
  }


  return value;
}


function optionalEnum(
  formData: FormData,
  key: string,
  allowedValues:
    string[]
) {
  const value =
    getText(
      formData,
      key
    );


  if (
    allowedValues.includes(
      value
    )
  ) {
    return value;
  }


  return null;
}


function isValidLatitude(
  value: number
) {
  return (
    Number.isFinite(
      value
    ) &&
    value >= -90 &&
    value <= 90
  );
}


function isValidLongitude(
  value: number
) {
  return (
    Number.isFinite(
      value
    ) &&
    value >= -180 &&
    value <= 180
  );
}


function isWithinChitral(
  latitude: number,
  longitude: number
) {
  return (
    latitude >=
      CHITRAL_LIMITS.south &&
    latitude <=
      CHITRAL_LIMITS.north &&
    longitude >=
      CHITRAL_LIMITS.west &&
    longitude <=
      CHITRAL_LIMITS.east
  );
}
