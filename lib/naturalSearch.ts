import type {
  Property,
} from "@/types/property";


/* ============================================================
   SEARCH INTENT
============================================================ */

export type NaturalSearchIntent = {
  originalQuery: string;

  locationSlug: string | null;

  propertyType:
    | "Residential"
    | "Agricultural"
    | "Commercial"
    | null;

irrigationAvailable:
  boolean | null;

  maxPricePkr: number | null;

  minPricePkr: number | null;

  roadAccess: boolean | null;

  waterAvailable: boolean | null;

  electricityAvailable: boolean | null;

  internetQuality:
    | "Good"
    | "Fair"
    | "Poor"
    | null;
};

export type PropertyIntentMatch = {
  property: Property;
  score: number;
  differences: string[];
};


/* ============================================================
   LOCATION ALIASES
============================================================ */

const LOCATION_ALIASES: Record<
  string,
  string[]
> = {
  booni: [
    "booni",
    "boni",
  ],

  balach: [
    "balach",
  ],

  "chitral-city": [
    "chitral city",
    "chitral town",
  ],

  drosh: [
    "drosh",
  ],

  mastuj: [
    "mastuj",
  ],

  reshun: [
    "reshun",
    "reshoon",
  ],
};


/* ============================================================
   PARSE QUERY
============================================================ */

export function parseNaturalSearch(
  query: string
): NaturalSearchIntent {
  const normalized =
    normalizeQuery(
      query
    );

  return {
    originalQuery:
      query,

    locationSlug:
      detectLocation(
        normalized
      ),

    irrigationAvailable:
      detectRequirement(
        normalized,
        [
          "with irrigation",
          "irrigation available",
          "irrigated",
        ],
        [
          "without irrigation",
          "no irrigation",
          "irrigation not available",
        ]
      ),

    propertyType:
      detectPropertyType(
        normalized
      ),

    maxPricePkr:
      detectMaximumPrice(
        normalized
      ),

    minPricePkr:
      detectMinimumPrice(
        normalized
      ),

    roadAccess:
      detectRequirement(
        normalized,
        [
          "road access",
          "road accessible",
          "with road",
          "road available",
          "vehicle access",
          "car access",
        ],
        [
          "without road access",
          "no road access",
          "without road",
          "road not available",
          "no vehicle access",
          "no car access",
        ]
      ),

    waterAvailable:
      detectRequirement(
        normalized,
        [
          "with water",
          "water available",
          "water access",
          "water supply",
        ],
        [
          "without water",
          "no water",
          "water not available",
          "no water supply",
        ]
      ),

    electricityAvailable:
      detectRequirement(
        normalized,
        [
          "with electricity",
          "electricity available",
          "electricity connection",
          "power available",
        ],
        [
          "without electricity",
          "no electricity",
          "electricity not available",
          "without power",
          "no power",
        ]
      ),

    internetQuality:
      detectInternet(
        normalized
      ),
  };
}


/* ============================================================
   APPLY SEARCH
============================================================ */

export function filterPropertiesByIntent(
  properties: Property[],
  intent: NaturalSearchIntent
): Property[] {
  return properties.filter(
    (property) => {
      if (
        intent.locationSlug &&
        property.locationSlug !==
          intent.locationSlug
      ) {
        return false;
      }

      if (
        intent.propertyType &&
        property.type !==
          intent.propertyType
      ) {
        return false;
      }


      if (
        intent.maxPricePkr !==
          null &&
        property.pricePkr >
          intent.maxPricePkr
      ) {
        return false;
      }


      if (
        intent.minPricePkr !==
          null &&
        property.pricePkr <
          intent.minPricePkr
      ) {
        return false;
      }


      if (
  intent.roadAccess !==
    null &&
  property.roadAccess !==
    intent.roadAccess
) {
  return false;
}


if (
  intent.waterAvailable !==
    null &&
  property.waterAvailable !==
    intent.waterAvailable
) {
  return false;
}


if (
  intent.electricityAvailable !==
    null &&
  property.electricityAvailable !==
    intent.electricityAvailable
) {
  return false;
}


if (
  intent.irrigationAvailable !==
    null &&
  property.irrigationAvailable !==
    intent.irrigationAvailable
) {
  return false;
}


if (
  intent.internetQuality !==
    null &&
  property.internetQuality !==
    intent.internetQuality
) {
  return false;
}


      return true;
    }
  );
}


export function rankPropertiesByIntent(
  properties: Property[],
  intent: NaturalSearchIntent,
  limit = 3
): PropertyIntentMatch[] {
  const ranked =
    properties.map(
      (
        property
      ) =>
        scorePropertyForIntent(
          property,
          intent
        )
    );


  return ranked
    .filter(
      (
        result
      ) =>
        result.score >
        0
    )
    .sort(
      (
        first,
        second
      ) =>
        second.score -
          first.score ||
        first.differences.length -
          second.differences.length ||
        first.property.pricePkr -
          second.property.pricePkr
    )
    .slice(
      0,
      limit
    );
}


function scorePropertyForIntent(
  property: Property,
  intent: NaturalSearchIntent
): PropertyIntentMatch {
  let matched =
    0;

  let total =
    0;

  const differences:
    string[] = [];


  function compare(
    applies: boolean,
    matches: boolean,
    difference: string
  ) {
    if (!applies) {
      return;
    }

    total++;

    if (matches) {
      matched++;
    } else {
      differences.push(
        difference
      );
    }
  }


  compare(
    intent.locationSlug !==
      null,
    property.locationSlug ===
      intent.locationSlug,
    `Located in ${property.location}`
  );

  compare(
    intent.propertyType !==
      null,
    property.type ===
      intent.propertyType,
    `${property.type} instead of ${intent.propertyType}`
  );

  compare(
    intent.maxPricePkr !==
      null,
    intent.maxPricePkr !==
      null &&
      property.pricePkr <=
        intent.maxPricePkr,
    intent.maxPricePkr !==
      null
      ? `${formatPkr(
          Math.max(
            0,
            property.pricePkr -
              intent.maxPricePkr
          )
        )} above budget`
      : ""
  );

  compare(
    intent.minPricePkr !==
      null,
    intent.minPricePkr !==
      null &&
      property.pricePkr >=
        intent.minPricePkr,
    "Below the requested minimum price"
  );

  compareBoolean(
    intent.roadAccess,
    property.roadAccess,
    "road access",
    compare
  );

  compareBoolean(
    intent.waterAvailable,
    property.waterAvailable,
    "water",
    compare
  );

  compareBoolean(
    intent.electricityAvailable,
    property.electricityAvailable,
    "electricity",
    compare
  );

  compareBoolean(
    intent.irrigationAvailable,
    property.irrigationAvailable,
    "irrigation",
    compare
  );

  compare(
    intent.internetQuality !==
      null,
    property.internetQuality ===
      intent.internetQuality,
    property.internetQuality
      ? `${property.internetQuality} connectivity instead of ${intent.internetQuality}`
      : "Connectivity is not specified"
  );


  return {
    property,

    score:
      total >
      0
        ? matched /
          total
        : 0,

    differences,
  };
}


function compareBoolean(
  expected:
    | boolean
    | null,
  actual: boolean,
  label: string,
  compare: (
    applies: boolean,
    matches: boolean,
    difference: string
  ) => void
) {
  compare(
    expected !==
      null,
    expected ===
      actual,
    expected
      ? `No ${label}`
      : `Includes ${label}`
  );
}


/* ============================================================
   HUMAN-READABLE FILTERS
============================================================ */

export function describeIntent(
  intent: NaturalSearchIntent
): string[] {
  const labels:
    string[] = [];
  if (
    intent.irrigationAvailable !==
    null
  ) {
    labels.push(
      intent.irrigationAvailable
        ? "Irrigation"
        : "No irrigation"
    );
  }

  if (
    intent.locationSlug
  ) {
    labels.push(
      displayLocation(
        intent.locationSlug
      )
    );
  }


  if (
    intent.propertyType
  ) {
    labels.push(
      intent.propertyType
    );
  }


  if (
    intent.maxPricePkr !==
    null
  ) {
    labels.push(
      `Up to ${formatPkr(
        intent.maxPricePkr
      )}`
    );
  }


  if (
    intent.minPricePkr !==
    null
  ) {
    labels.push(
      `Above ${formatPkr(
        intent.minPricePkr
      )}`
    );
  }


  if (
    intent.roadAccess !==
    null
  ) {
    labels.push(
      intent.roadAccess
        ? "Road access"
        : "No road access"
    );
  }


  if (
    intent.waterAvailable !==
    null
  ) {
    labels.push(
      intent.waterAvailable
        ? "Water"
        : "No water"
    );
  }


  if (
    intent.electricityAvailable !==
    null
  ) {
    labels.push(
      intent.electricityAvailable
        ? "Electricity"
        : "No electricity"
    );
  }


  if (
    intent.internetQuality
  ) {
    labels.push(
      `${intent.internetQuality} internet`
    );
  }


  return labels;
}


/* ============================================================
   PROPERTY TYPE
============================================================ */

function detectPropertyType(
  query: string
):
  | "Residential"
  | "Agricultural"
  | "Commercial"
  | null {
  if (
    containsAny(
      query,
      [
        "agricultural",
        "agriculture",
        "farm",
        "farming",
        "farmland",
      ]
    )
  ) {
    return "Agricultural";
  }


  if (
    containsAny(
      query,
      [
        "commercial",
        "shop",
        "business property",
        "business land",
      ]
    )
  ) {
    return "Commercial";
  }


  if (
    containsAny(
      query,
      [
        "residential",
        "house plot",
        "home plot",
        "housing",
      ]
    )
  ) {
    return "Residential";
  }


  return null;
}


/* ============================================================
   LOCATION
============================================================ */

function detectLocation(
  query: string
): string | null {
  for (
    const [
      slug,
      aliases,
    ] of Object.entries(
      LOCATION_ALIASES
    )
  ) {
    if (
      containsAny(
        query,
        aliases
      )
    ) {
      return slug;
    }
  }

  return null;
}


/* ============================================================
   PRICE
============================================================ */

function detectMaximumPrice(
  query: string
): number | null {
  const patterns = [
    /(?:under|below|less than|max|maximum|up to|within)\s+(?:pkr\s*)?([\d.]+)\s*(crore|cr|lakh|lac|million|m)?/i,

    /(?:budget of|budget)\s+(?:pkr\s*)?([\d.]+)\s*(crore|cr|lakh|lac|million|m)?/i,
  ];


  for (
    const pattern of patterns
  ) {
    const match =
      query.match(
        pattern
      );

    if (match) {
      return moneyToPkr(
        match[1],
        match[2]
      );
    }
  }


  return null;
}


function detectMinimumPrice(
  query: string
): number | null {
  const patterns = [
    /(?:above|over|more than|at least|min|minimum)\s+(?:pkr\s*)?([\d.]+)\s*(crore|cr|lakh|lac|million|m)?/i,
  ];


  for (
    const pattern of patterns
  ) {
    const match =
      query.match(
        pattern
      );

    if (match) {
      return moneyToPkr(
        match[1],
        match[2]
      );
    }
  }


  return null;
}


function moneyToPkr(
  rawValue: string,
  unit:
    | string
    | undefined
): number {
  const value =
    Number(rawValue);

  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }


  switch (
    unit?.toLowerCase()
  ) {
    case "crore":
    case "cr":
      return (
        value *
        10_000_000
      );

    case "lakh":
    case "lac":
      return (
        value *
        100_000
      );

    case "million":
    case "m":
      return (
        value *
        1_000_000
      );

    default:
      return value;
  }
}


/* ============================================================
   BOOLEAN REQUIREMENTS
============================================================ */

function detectRequirement(
  query: string,
  positivePhrases: string[],
  negativePhrases:
    string[] = []
): boolean | null {
  if (
    containsAny(
      query,
      negativePhrases
    )
  ) {
    return false;
  }


  if (
    containsAny(
      query,
      positivePhrases
    )
  ) {
    return true;
  }


  return null;
}


/* ============================================================
   INTERNET
============================================================ */

function detectInternet(
  query: string
):
  | "Good"
  | "Fair"
  | "Poor"
  | null {
  if (
    containsAny(
      query,
      [
        "good internet",
        "good connectivity",
        "strong internet",
        "strong connectivity",
      ]
    )
  ) {
    return "Good";
  }


  if (
    containsAny(
      query,
      [
        "fair internet",
        "average internet",
        "moderate internet",
      ]
    )
  ) {
    return "Fair";
  }


  if (
    containsAny(
      query,
      [
        "poor internet",
        "weak internet",
      ]
    )
  ) {
    return "Poor";
  }


  return null;
}


/* ============================================================
   HELPERS
============================================================ */

function normalizeQuery(
  query: string
): string {
  return query
    .toLowerCase()
    .replace(
      /,/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function containsAny(
  query: string,
  phrases: string[]
): boolean {
  return phrases.some(
    (phrase) =>
      query.includes(
        phrase
      )
  );
}


function displayLocation(
  slug: string
): string {
  switch (slug) {
    case "booni":
      return "Booni";

    case "balach":
      return "Balach";

    case "chitral-city":
      return "Chitral City";

    case "drosh":
      return "Drosh";

    case "mastuj":
      return "Mastuj";

    case "reshun":
      return "Reshun";

    default:
      return slug;
  }
}


function formatPkr(
  value: number
): string {
  if (
    value >=
    10_000_000
  ) {
    return `PKR ${(
      value /
      10_000_000
    ).toLocaleString(
      "en-US",
      {
        maximumFractionDigits:
          2,
      }
    )} Crore`;
  }


  if (
    value >=
    100_000
  ) {
    return `PKR ${(
      value /
      100_000
    ).toLocaleString(
      "en-US",
      {
        maximumFractionDigits:
          2,
      }
    )} Lakh`;
  }


  return `PKR ${value.toLocaleString()}`;
}