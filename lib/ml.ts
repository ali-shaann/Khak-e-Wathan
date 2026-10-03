import type {
  Property,
} from "@/types/property";


export type MlValuation = {
  predictedPricePkr: number;

  modelType: string;

  dataSource: string;

  syntheticDemo: boolean;
};


type MlApiResponse = {
  predicted_price_pkr: number;

  model_type: string;

  data_source: string;

  synthetic_demo: boolean;
};


type MlReadyProperty =
  Property & {
    distanceToMainRoadM: number;

    internetQuality:
      NonNullable<
        Property["internetQuality"]
      >;

    terrain:
      NonNullable<
        Property["terrain"]
      >;

    slope:
      NonNullable<
        Property["slope"]
      >;

    residentialSuitability:
      NonNullable<
        Property["residentialSuitability"]
      >;

    agriculturalSuitability:
      NonNullable<
        Property["agriculturalSuitability"]
      >;
  };


const ML_API_URL =
  process.env.ML_API_URL ??
  "http://127.0.0.1:8000";


const ML_REQUEST_TIMEOUT_MS =
  6_000;


/* ============================================================
   MODEL INPUT READINESS
============================================================ */

export function hasCompleteMlFeatures(
  property: Property
): property is MlReadyProperty {
  return (
    property.distanceToMainRoadM !==
      null &&
    property.internetQuality !==
      null &&
    property.terrain !==
      null &&
    property.slope !==
      null &&
    property.residentialSuitability !==
      null &&
    property.agriculturalSuitability !==
      null
  );
}


/* ============================================================
   GET ML VALUATION
============================================================ */

export async function getMlValuation(
  property: Property
): Promise<MlValuation | null> {
  /*
    The model was trained with complete structured features.
    Do not invent optimistic values for fields the seller did
    not provide.
  */
  if (
    !hasCompleteMlFeatures(
      property
    )
  ) {
    return null;
  }


  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      ML_REQUEST_TIMEOUT_MS
    );


  try {
    const response =
      await fetch(
        `${ML_API_URL}/predict`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            location:
              property.locationSlug,

            property_type:
              propertyTypeForModel(
                property.type
              ),

            area_marla:
              property.valuation
                .areaInMarla,

            road_access:
              property.roadAccess,

            distance_to_main_road_m:
              Math.max(
                0,
                property.distanceToMainRoadM
              ),

            water_available:
              property.waterAvailable,

            electricity_available:
              property.electricityAvailable,

            irrigation_available:
              property.irrigationAvailable,

            internet_quality:
              internetForModel(
                property.internetQuality
              ),

            terrain:
              terrainForModel(
                property.terrain
              ),

            slope:
              slopeForModel(
                property.slope
              ),

            residential_suitability:
              suitabilityForModel(
                property
                  .residentialSuitability
              ),

            agricultural_suitability:
              suitabilityForModel(
                property
                  .agriculturalSuitability
              ),
          }),

          cache: "no-store",

          signal:
            controller.signal,
        }
      );


    if (!response.ok) {
      console.error(
        "ML API ERROR:",
        response.status,
        await response.text()
      );

      return null;
    }


    const data =
      (
        await response.json()
      ) as MlApiResponse;


    if (
      !Number.isFinite(
        data.predicted_price_pkr
      )
    ) {
      console.error(
        "ML API ERROR: invalid prediction response"
      );

      return null;
    }


    return {
      predictedPricePkr:
        data.predicted_price_pkr,

      modelType:
        data.model_type,

      dataSource:
        data.data_source,

      syntheticDemo:
        data.synthetic_demo,
    };
  } catch (error) {
    /*
      The marketplace should continue working even if
      the separate Python service is temporarily offline
      or slow.
    */

    console.error(
      "ML VALUATION FETCH ERROR:",
      error
    );

    return null;
  } finally {
    clearTimeout(
      timeout
    );
  }
}


/* ============================================================
   FRONTEND DISPLAY VALUES -> MODEL VALUES
============================================================ */

function propertyTypeForModel(
  value: Property["type"]
):
  | "residential"
  | "agricultural"
  | "commercial" {
  switch (value) {
    case "Agricultural":
      return "agricultural";

    case "Commercial":
      return "commercial";

    default:
      return "residential";
  }
}


function internetForModel(
  value:
    NonNullable<
      Property["internetQuality"]
    >
):
  | "poor"
  | "fair"
  | "good" {
  switch (value) {
    case "Poor":
      return "poor";

    case "Fair":
      return "fair";

    case "Good":
      return "good";
  }
}


function terrainForModel(
  value:
    NonNullable<
      Property["terrain"]
    >
):
  | "flat"
  | "mixed"
  | "sloped" {
  switch (value) {
    case "Mixed":
      return "mixed";

    case "Sloped":
      return "sloped";

    case "Flat":
      return "flat";
  }
}


function slopeForModel(
  value:
    NonNullable<
      Property["slope"]
    >
):
  | "low"
  | "moderate"
  | "steep" {
  switch (value) {
    case "Moderate":
      return "moderate";

    case "Steep":
      return "steep";

    case "Low":
      return "low";
  }
}


function suitabilityForModel(
  value:
    NonNullable<
      Property[
        | "residentialSuitability"
        | "agriculturalSuitability"
      ]
    >
):
  | "low"
  | "moderate"
  | "high" {
  switch (value) {
    case "Low":
      return "low";

    case "Moderate":
      return "moderate";

    case "High":
      return "high";
  }
}
