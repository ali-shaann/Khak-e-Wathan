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


const ML_API_URL =
  process.env.ML_API_URL ??
  "http://127.0.0.1:8000";


/* ============================================================
   GET ML VALUATION
============================================================ */

export async function getMlValuation(
  property: Property
): Promise<MlValuation | null> {
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
      the separate Python service is temporarily offline.
    */

    console.error(
      "ML VALUATION FETCH ERROR:",
      error
    );

    return null;
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
  value: Property["internetQuality"]
):
  | "poor"
  | "fair"
  | "good" {
  switch (value) {
    case "Poor":
      return "poor";

    case "Fair":
      return "fair";

    default:
      return "good";
  }
}


function terrainForModel(
  value: Property["terrain"]
):
  | "flat"
  | "mixed"
  | "sloped" {
  switch (value) {
    case "Mixed":
      return "mixed";

    case "Sloped":
      return "sloped";

    default:
      return "flat";
  }
}


function slopeForModel(
  value: Property["slope"]
):
  | "low"
  | "moderate"
  | "steep" {
  switch (value) {
    case "Moderate":
      return "moderate";

    case "Steep":
      return "steep";

    default:
      return "low";
  }
}


function suitabilityForModel(
  value:
    Property[
      | "residentialSuitability"
      | "agriculturalSuitability"
    ]
):
  | "low"
  | "moderate"
  | "high" {
  switch (value) {
    case "Low":
      return "low";

    case "Moderate":
      return "moderate";

    default:
      return "high";
  }
}