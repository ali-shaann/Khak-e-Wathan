import type {
  PropertyValuation,
  ValuationFactor,
} from "@/types/valuation";


/* ============================================================
   INPUT
============================================================ */

export type ValuationInput = {
  locationSlug: string;

  propertyType:
    | "residential"
    | "agricultural"
    | "commercial";

  areaValue: number;

  areaUnit:
    | "marla"
    | "kanal"
    | "sq_ft";

  roadAccess: boolean;

  distanceToMainRoadM:
    | number
    | null;

  waterAvailable: boolean;

  electricityAvailable: boolean;

  irrigationAvailable: boolean;

  internetQuality:
    | "poor"
    | "fair"
    | "good"
    | null;

  terrain:
    | "flat"
    | "mixed"
    | "sloped"
    | null;

  slope:
    | "low"
    | "moderate"
    | "steep"
    | null;

  residentialSuitability:
    | "low"
    | "moderate"
    | "high"
    | null;

  agriculturalSuitability:
    | "low"
    | "moderate"
    | "high"
    | null;

  verification?: {
    sellerIdentity?: string | null;
    propertyLocation?: string | null;
    photos?: string | null;
    ownershipEvidence?: string | null;
    physicalInspection?: string | null;
  };
};


/* ============================================================
   DEMO LOCATION BASELINES

   IMPORTANT:
   These are synthetic hackathon demonstration values.
   They are NOT verified market rates.
============================================================ */

const DEMO_RATE_PER_MARLA: Record<
  string,
  number
> = {
  booni: 650_000,
  balach: 575_000,

  "chitral-city": 850_000,

  drosh: 525_000,

  mastuj: 450_000,

  reshun: 475_000,
};

const DEFAULT_RATE_PER_MARLA =
  550_000;


/*
  Demo conversion.

  Land-unit definitions can vary by context,
  so this should eventually become configurable.
*/
const SQ_FT_PER_MARLA =
  272.25;


/* ============================================================
   MAIN ENGINE
============================================================ */

export function calculateValuation(
  input: ValuationInput
): PropertyValuation {
  const factors:
    ValuationFactor[] = [];

  const areaInMarla =
    convertToMarla(
      input.areaValue,
      input.areaUnit
    );

  const baselineRatePerMarla =
    DEMO_RATE_PER_MARLA[
      input.locationSlug
    ] ??
    DEFAULT_RATE_PER_MARLA;

  const baseValue =
    areaInMarla *
    baselineRatePerMarla;


  /* --------------------------------------------------------
     PROPERTY TYPE
  -------------------------------------------------------- */

  if (
    input.propertyType ===
    "commercial"
  ) {
    addFactor(
      factors,
      "Commercial potential",
      "Commercial land receives a higher demo baseline adjustment.",
      10
    );
  }

  if (
    input.propertyType ===
    "agricultural"
  ) {
    addFactor(
      factors,
      "Agricultural property",
      "Agricultural land uses a slightly lower demo baseline than residential land.",
      -6
    );
  }


  /* --------------------------------------------------------
     ROAD ACCESS
  -------------------------------------------------------- */

  if (
    input.roadAccess
  ) {
    addFactor(
      factors,
      "Road access",
      "Vehicle road access generally improves usability and accessibility.",
      8
    );
  } else {
    addFactor(
      factors,
      "No vehicle road access",
      "Limited road access can reduce convenience and development potential.",
      -10
    );
  }


  /* --------------------------------------------------------
     DISTANCE TO MAIN ROAD
  -------------------------------------------------------- */

  if (
    input.distanceToMainRoadM !==
    null
  ) {
    const distance =
      input.distanceToMainRoadM;

    if (
      distance <= 100
    ) {
      addFactor(
        factors,
        "Very close to main road",
        "The property is within approximately 100 metres of a main road.",
        5
      );
    } else if (
      distance <= 300
    ) {
      addFactor(
        factors,
        "Good main-road proximity",
        "The property is reasonably close to a main road.",
        2
      );
    } else if (
      distance <= 700
    ) {
      addFactor(
        factors,
        "Moderate road distance",
        "The property is several hundred metres from a main road.",
        -3
      );
    } else {
      addFactor(
        factors,
        "Far from main road",
        "Greater distance from a main road can reduce accessibility.",
        -7
      );
    }
  }


  /* --------------------------------------------------------
     UTILITIES
  -------------------------------------------------------- */

  if (
    input.waterAvailable
  ) {
    addFactor(
      factors,
      "Water available",
      "Existing water availability improves practical usability.",
      5
    );
  } else {
    addFactor(
      factors,
      "Water not confirmed",
      "No available water source is currently recorded.",
      -5
    );
  }


  if (
    input.electricityAvailable
  ) {
    addFactor(
      factors,
      "Electricity available",
      "Existing electricity access supports residential and commercial use.",
      4
    );
  } else {
    addFactor(
      factors,
      "Electricity not confirmed",
      "No electricity connection is currently recorded.",
      -4
    );
  }


  if (
    input.propertyType ===
      "agricultural" &&
    input.irrigationAvailable
  ) {
    addFactor(
      factors,
      "Irrigation available",
      "Irrigation access increases the usefulness of agricultural land.",
      6
    );
  }


  /* --------------------------------------------------------
     CONNECTIVITY
  -------------------------------------------------------- */

  if (
    input.internetQuality ===
    "good"
  ) {
    addFactor(
      factors,
      "Good connectivity",
      "Good mobile or internet connectivity adds convenience.",
      3
    );
  }

  if (
    input.internetQuality ===
    "poor"
  ) {
    addFactor(
      factors,
      "Limited connectivity",
      "Poor connectivity may reduce convenience for some buyers.",
      -3
    );
  }


  /* --------------------------------------------------------
     TERRAIN
  -------------------------------------------------------- */

  if (
    input.terrain === "flat"
  ) {
    addFactor(
      factors,
      "Flat terrain",
      "Flat terrain can make construction and access easier.",
      4
    );
  }

  if (
    input.terrain ===
    "sloped"
  ) {
    addFactor(
      factors,
      "Sloped terrain",
      "Sloped terrain may increase construction or access complexity.",
      -4
    );
  }


  /* --------------------------------------------------------
     SLOPE
  -------------------------------------------------------- */

  if (
    input.slope === "low"
  ) {
    addFactor(
      factors,
      "Low slope",
      "A low slope is generally easier to develop.",
      2
    );
  }

  if (
    input.slope ===
    "moderate"
  ) {
    addFactor(
      factors,
      "Moderate slope",
      "Moderate slope may add some development complexity.",
      -2
    );
  }

  if (
    input.slope ===
    "steep"
  ) {
    addFactor(
      factors,
      "Steep slope",
      "Steep terrain may substantially increase development complexity.",
      -6
    );
  }


  /* --------------------------------------------------------
     SUITABILITY
  -------------------------------------------------------- */

  if (
    input.propertyType ===
      "residential" ||
    input.propertyType ===
      "commercial"
  ) {
    if (
      input.residentialSuitability ===
      "high"
    ) {
      addFactor(
        factors,
        "High residential suitability",
        "The recorded characteristics indicate strong residential suitability.",
        6
      );
    }

    if (
      input.residentialSuitability ===
      "low"
    ) {
      addFactor(
        factors,
        "Low residential suitability",
        "The property is recorded as having limited residential suitability.",
        -6
      );
    }
  }


  if (
    input.propertyType ===
    "agricultural"
  ) {
    if (
      input.agriculturalSuitability ===
      "high"
    ) {
      addFactor(
        factors,
        "High agricultural suitability",
        "The recorded land characteristics support agricultural use.",
        7
      );
    }

    if (
      input.agriculturalSuitability ===
      "low"
    ) {
      addFactor(
        factors,
        "Low agricultural suitability",
        "The recorded land characteristics indicate weaker agricultural suitability.",
        -7
      );
    }
  }


  /* --------------------------------------------------------
     TOTAL ADJUSTMENT

     Cap the rule system so lots of small factors cannot
     create an absurd estimate.
  -------------------------------------------------------- */

  const rawAdjustment =
    factors.reduce(
      (
        total,
        factor
      ) =>
        total +
        factor.impactPercent,
      0
    );

  const totalAdjustmentPercent =
    clamp(
      rawAdjustment,
      -35,
      35
    );

  const adjustedValue =
    baseValue *
    (
      1 +
      totalAdjustmentPercent /
        100
    );


  /* --------------------------------------------------------
     CONFIDENCE
  -------------------------------------------------------- */

  const dataCompleteness =
    calculateDataCompleteness(
      input
    );

  /*
    Wider estimate ranges when less structured information
    is available. This is not statistical model confidence.
  */
  const rangePercent =
    dataCompleteness ===
    "high"
      ? 0.07
      : dataCompleteness ===
          "medium"
        ? 0.1
        : 0.14;

  const estimatedMinPkr =
    roundToNearest(
      adjustedValue *
        (1 - rangePercent),
      10_000
    );

  const estimatedMaxPkr =
    roundToNearest(
      adjustedValue *
        (1 + rangePercent),
      10_000
    );

  const estimatedValuePkr =
    roundToNearest(
      adjustedValue,
      10_000
    );

  return {
    estimatedValuePkr,

    estimatedMinPkr,

    estimatedMaxPkr,

    baselineRatePerMarla,

    areaInMarla,

    totalAdjustmentPercent,

    dataCompleteness,

    factors,
  };
}


/* ============================================================
   CONFIDENCE
============================================================ */

function calculateDataCompleteness(
  input: ValuationInput
):
  | "low"
  | "medium"
  | "high" {
  let informationScore =
    0;

  if (
    input.distanceToMainRoadM !==
    null
  ) {
    informationScore++;
  }

  if (
    input.internetQuality !==
    null
  ) {
    informationScore++;
  }

  if (
    input.terrain !== null
  ) {
    informationScore++;
  }

  if (
    input.slope !== null
  ) {
    informationScore++;
  }

  if (
    input.residentialSuitability !==
    null
  ) {
    informationScore++;
  }

  if (
    input.agriculturalSuitability !==
    null
  ) {
    informationScore++;
  }

  const verification =
    input.verification;

  const verifiedChecks =
    verification
      ? [
          verification.sellerIdentity,
          verification.propertyLocation,
          verification.photos,
          verification.ownershipEvidence,
          verification.physicalInspection,
        ].filter(
          (status) =>
            status ===
            "verified"
        ).length
      : 0;

  if (
    informationScore >= 5 &&
    verifiedChecks >= 3
  ) {
    return "high";
  }

  if (
    informationScore >= 3 ||
    verifiedChecks >= 2
  ) {
    return "medium";
  }

  return "low";
}


/* ============================================================
   HELPERS
============================================================ */

function addFactor(
  factors: ValuationFactor[],
  label: string,
  explanation: string,
  impactPercent: number
) {
  factors.push({
    label,
    explanation,

    impactPercent,

    direction:
      impactPercent > 0
        ? "positive"
        : impactPercent < 0
          ? "negative"
          : "neutral",
  });
}


function convertToMarla(
  value: number,
  unit:
    | "marla"
    | "kanal"
    | "sq_ft"
) {
  switch (unit) {
    case "kanal":
      return value * 20;

    case "sq_ft":
      return (
        value /
        SQ_FT_PER_MARLA
      );

    default:
      return value;
  }
}


function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}


function roundToNearest(
  value: number,
  nearest: number
) {
  return (
    Math.round(
      value /
        nearest
    ) *
    nearest
  );
}