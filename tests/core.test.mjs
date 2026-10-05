import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";

import ts from "typescript";


const require =
  createRequire(
    import.meta.url
  );


function loadTypeScriptModule(
  relativePath
) {
  const absolutePath =
    path.resolve(
      relativePath
    );

  const source =
    fs.readFileSync(
      absolutePath,
      "utf8"
    );

  const output =
    ts.transpileModule(
      source,
      {
        fileName:
          absolutePath,

        compilerOptions: {
          target:
            ts.ScriptTarget
              .ES2022,

          module:
            ts.ModuleKind
              .CommonJS,

          esModuleInterop:
            true,
        },
      }
    ).outputText;

  const module = {
    exports: {},
  };

  const execute =
    new Function(
      "exports",
      "module",
      "require",
      "__filename",
      "__dirname",
      output
    );

  execute(
    module.exports,
    module,
    require,
    absolutePath,
    path.dirname(
      absolutePath
    )
  );

  return module.exports;
}


const search =
  loadTypeScriptModule(
    "lib/naturalSearch.ts"
  );

const valuation =
  loadTypeScriptModule(
    "lib/valuation.ts"
  );

const publicLocation =
  loadTypeScriptModule(
    "lib/publicLocation.ts"
  );


test(
  "fallback search understands local property language",
  () => {
    const intent =
      search.parseNaturalSearch(
        "residential land in Booni under 50 lakh with electricity and road access"
      );

    assert.equal(
      intent.locationSlug,
      "booni"
    );

    assert.equal(
      intent.propertyType,
      "Residential"
    );

    assert.equal(
      intent.maxPricePkr,
      5_000_000
    );

    assert.equal(
      intent.electricityAvailable,
      true
    );

    assert.equal(
      intent.roadAccess,
      true
    );
  }
);


test(
  "fallback search handles explicit negative requirements",
  () => {
    const intent =
      search.parseNaturalSearch(
        "agricultural land in Balach without water and no electricity"
      );

    assert.equal(
      intent.locationSlug,
      "balach"
    );

    assert.equal(
      intent.propertyType,
      "Agricultural"
    );

    assert.equal(
      intent.waterAvailable,
      false
    );

    assert.equal(
      intent.electricityAvailable,
      false
    );
  }
);


test(
  "near-match ranking explains unmet requirements",
  () => {
    const intent =
      search.parseNaturalSearch(
        "residential land in Booni under 50 lakh with electricity"
      );

    const ranked =
      search.rankPropertiesByIntent(
        [
          {
            id:
              "close",
            location:
              "Booni",
            locationSlug:
              "booni",
            type:
              "Residential",
            pricePkr:
              5_300_000,
            roadAccess:
              true,
            waterAvailable:
              true,
            electricityAvailable:
              true,
            irrigationAvailable:
              false,
            internetQuality:
              "Good",
          },
          {
            id:
              "far",
            location:
              "Balach",
            locationSlug:
              "balach",
            type:
              "Agricultural",
            pricePkr:
              12_000_000,
            roadAccess:
              false,
            waterAvailable:
              false,
            electricityAvailable:
              false,
            irrigationAvailable:
              true,
            internetQuality:
              "Poor",
          },
        ],
        intent
      );

    assert.equal(
      ranked[0].property.id,
      "close"
    );

    assert.ok(
      ranked[0].differences.some(
        (
          difference
        ) =>
          difference.includes(
            "above budget"
          )
      )
    );
  }
);


test(
  "valuation reports data completeness rather than confidence",
  () => {
    const result =
      valuation.calculateValuation({
        locationSlug:
          "booni",
        propertyType:
          "residential",
        areaValue:
          5,
        areaUnit:
          "marla",
        roadAccess:
          true,
        distanceToMainRoadM:
          90,
        waterAvailable:
          true,
        electricityAvailable:
          true,
        irrigationAvailable:
          false,
        internetQuality:
          "good",
        terrain:
          "flat",
        slope:
          "low",
        residentialSuitability:
          "high",
        agriculturalSuitability:
          "low",
        verification: {
          sellerIdentity:
            "verified",
          propertyLocation:
            "verified",
          photos:
            "verified",
          ownershipEvidence:
            "pending",
          physicalInspection:
            "pending",
        },
      });

    assert.equal(
      result.dataCompleteness,
      "high"
    );

    assert.equal(
      Object.hasOwn(
        result,
        "confidence"
      ),
      false
    );
  }
);


test(
  "public coordinates are stable and do not expose the stored point",
  () => {
    const first =
      publicLocation
        .approximatePublicCoordinates(
          "listing-123",
          36.2744,
          72.2578
        );

    const second =
      publicLocation
        .approximatePublicCoordinates(
          "listing-123",
          36.2744,
          72.2578
        );

    assert.deepEqual(
      first,
      second
    );

    assert.notEqual(
      first.latitude,
      36.2744
    );

    assert.notEqual(
      first.longitude,
      72.2578
    );

    assert.equal(
      String(
        first.latitude
      ).split(
        "."
      )[1].length <=
        3,
      true
    );
  }
);
