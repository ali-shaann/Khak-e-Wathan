import OpenAI from "openai";

import {
  parseNaturalSearch,
  type NaturalSearchIntent,
} from "@/lib/naturalSearch";


/* ============================================================
   RESULT
============================================================ */

export type SearchInterpreterSource =
  | "ai"
  | "fallback";


export type SearchInterpretation = {
  intent: NaturalSearchIntent;

  source: SearchInterpreterSource;
};


/* ============================================================
   AI RESPONSE TYPE
============================================================ */

type AiSearchIntent = {
  locationSlug:
    | "booni"
    | "balach"
    | "chitral-city"
    | "drosh"
    | "mastuj"
    | "reshun"
    | null;

  propertyType:
    | "Residential"
    | "Agricultural"
    | "Commercial"
    | null;

  maxPricePkr:
    | number
    | null;

  minPricePkr:
    | number
    | null;

  roadAccess:
    | boolean
    | null;

  waterAvailable:
    | boolean
    | null;

  electricityAvailable:
    | boolean
    | null;

  irrigationAvailable:
    | boolean
    | null;

  internetQuality:
    | "Good"
    | "Fair"
    | "Poor"
    | null;
};


/* ============================================================
   JSON SCHEMA
============================================================ */

const SEARCH_SCHEMA = {
  type:
    "object",

  additionalProperties:
    false,

  properties: {
    locationSlug: {
      type: [
        "string",
        "null",
      ],

      enum: [
        "booni",
        "balach",
        "chitral-city",
        "drosh",
        "mastuj",
        "reshun",
        null,
      ],
    },


    propertyType: {
      type: [
        "string",
        "null",
      ],

      enum: [
        "Residential",
        "Agricultural",
        "Commercial",
        null,
      ],
    },


    maxPricePkr: {
      type: [
        "number",
        "null",
      ],
    },


    minPricePkr: {
      type: [
        "number",
        "null",
      ],
    },


    roadAccess: {
      type: [
        "boolean",
        "null",
      ],
    },


    waterAvailable: {
      type: [
        "boolean",
        "null",
      ],
    },


    electricityAvailable: {
      type: [
        "boolean",
        "null",
      ],
    },


    irrigationAvailable: {
      type: [
        "boolean",
        "null",
      ],
    },


    internetQuality: {
      type: [
        "string",
        "null",
      ],

      enum: [
        "Good",
        "Fair",
        "Poor",
        null,
      ],
    },
  },


  required: [
    "locationSlug",
    "propertyType",
    "maxPricePkr",
    "minPricePkr",
    "roadAccess",
    "waterAvailable",
    "electricityAvailable",
    "irrigationAvailable",
    "internetQuality",
  ],
};


/* ============================================================
   MAIN INTERPRETER
============================================================ */

export async function interpretPropertySearch(
  query: string
): Promise<SearchInterpretation> {
  const cleanQuery =
    query.trim();


  /*
    Our deterministic parser is always available.
  */

  const fallbackIntent =
    parseNaturalSearch(
      cleanQuery
    );


  if (!cleanQuery) {
    return {
      intent:
        fallbackIntent,

      source:
        "fallback",
    };
  }


  /*
    If no API key is configured, the site still works.
  */

  const apiKey =
    process.env.OPENAI_API_KEY;


  if (!apiKey) {
    console.warn(
      "OPENAI_API_KEY is missing. Using fallback search parser."
    );

    return {
      intent:
        fallbackIntent,

      source:
        "fallback",
    };
  }


  try {
    const openai =
      new OpenAI({
        apiKey,
      });


    const response =
      await openai.responses.create({
        model:
          process.env
            .OPENAI_SEARCH_MODEL ??
          "gpt-6-luna",

        /*
          Search queries do not need to become
          persistent model conversations.
        */

        store:
          false,


        instructions: `
You interpret property-search requests for a marketplace
called Khak-e-Wathan, which contains properties in Chitral.

Convert the user's request into structured search filters.

Supported locations:
- Booni -> booni
- Balach -> balach
- Chitral City / Chitral Town -> chitral-city
- Drosh -> drosh
- Mastuj -> mastuj
- Reshun -> reshun

Important rules:

1. Do not invent requirements the user did not express.

2. A general reference to "Chitral" does NOT necessarily mean
   Chitral City. If the user means the overall Chitral region,
   leave locationSlug null.

3. Understand natural property language:
   - house, home, housing plot -> Residential
   - farm, farmland, farming -> Agricultural
   - shop, business land, commercial plot -> Commercial

4. Understand Pakistani price expressions:
   - 1 lakh = PKR 100,000
   - 1 crore = PKR 10,000,000
   - 1 million = PKR 1,000,000

5. "under", "below", "up to", "budget", etc. should become
   maxPricePkr.

6. "above", "over", "at least", etc. should become
   minPricePkr.

7. Set feature booleans to true only when the user asks for
   that feature.

8. Set a feature to false only when the user explicitly asks
   for a property without that feature.

9. If the user does not mention a field, return null.

10. Do not return property listings, recommendations,
    explanations, or prose. Only interpret the search request.
        `.trim(),


        input:
          cleanQuery,


        text: {
          format: {
            type:
              "json_schema",

            name:
              "property_search_intent",

            strict:
              true,

            schema:
              SEARCH_SCHEMA,
          },
        },
      });


    const output =
      response.output_text;


    if (!output) {
      throw new Error(
        "AI returned no search intent."
      );
    }


    const parsed =
      JSON.parse(
        output
      ) as AiSearchIntent;


    const intent:
      NaturalSearchIntent = {
      originalQuery:
        cleanQuery,

      locationSlug:
        parsed.locationSlug,

      propertyType:
        parsed.propertyType,

      maxPricePkr:
        sanitizePrice(
          parsed.maxPricePkr
        ),

      minPricePkr:
        sanitizePrice(
          parsed.minPricePkr
        ),

      roadAccess:
        parsed.roadAccess,

      waterAvailable:
        parsed.waterAvailable,

      electricityAvailable:
        parsed.electricityAvailable,

      irrigationAvailable:
        parsed.irrigationAvailable,

      internetQuality:
        parsed.internetQuality,
    };


    return {
      intent,

      source:
        "ai",
    };
  } catch (error) {
    console.error(
      "AI SEARCH ERROR:",
      error
    );


    /*
      Critical design choice:

      Search continues to work even when:
      - OpenAI is offline
      - billing runs out
      - network fails
      - malformed response occurs
      - model access changes
    */

    return {
      intent:
        fallbackIntent,

      source:
        "fallback",
    };
  }
}


/* ============================================================
   VALIDATION
============================================================ */

function sanitizePrice(
  value:
    | number
    | null
): number | null {
  if (
    value === null ||
    !Number.isFinite(
      value
    ) ||
    value < 0
  ) {
    return null;
  }


  return Math.round(
    value
  );
}