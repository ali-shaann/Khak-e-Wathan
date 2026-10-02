import random
from pathlib import Path

import pandas as pd


random.seed(42)

OUTPUT_PATH = (
    Path(__file__).parent
    / "data"
    / "chitral_properties.csv"
)

LOCATION_RATES = {
    "booni": 650_000,
    "balach": 575_000,
    "chitral-city": 850_000,
    "drosh": 525_000,
    "mastuj": 450_000,
    "reshun": 475_000,
}

PROPERTY_TYPES = [
    "residential",
    "agricultural",
    "commercial",
]

INTERNET_LEVELS = [
    "poor",
    "fair",
    "good",
]

TERRAINS = [
    "flat",
    "mixed",
    "sloped",
]

SLOPES = [
    "low",
    "moderate",
    "steep",
]

SUITABILITY_LEVELS = [
    "low",
    "moderate",
    "high",
]


def calculate_demo_price(row):
    value = (
        row["area_marla"]
        * LOCATION_RATES[row["location"]]
    )

    adjustment = 0

    if row["property_type"] == "commercial":
        adjustment += 0.10

    if row["property_type"] == "agricultural":
        adjustment -= 0.06

    adjustment += (
        0.08
        if row["road_access"]
        else -0.10
    )

    distance = row["distance_to_main_road_m"]

    if distance <= 100:
        adjustment += 0.05
    elif distance <= 300:
        adjustment += 0.02
    elif distance <= 700:
        adjustment -= 0.03
    else:
        adjustment -= 0.07

    adjustment += (
        0.05
        if row["water_available"]
        else -0.05
    )

    adjustment += (
        0.04
        if row["electricity_available"]
        else -0.04
    )

    if (
        row["property_type"] == "agricultural"
        and row["irrigation_available"]
    ):
        adjustment += 0.06

    if row["internet_quality"] == "good":
        adjustment += 0.03
    elif row["internet_quality"] == "poor":
        adjustment -= 0.03

    if row["terrain"] == "flat":
        adjustment += 0.04
    elif row["terrain"] == "sloped":
        adjustment -= 0.04

    if row["slope"] == "low":
        adjustment += 0.02
    elif row["slope"] == "moderate":
        adjustment -= 0.02
    elif row["slope"] == "steep":
        adjustment -= 0.06

    if row["property_type"] in (
        "residential",
        "commercial",
    ):
        if (
            row["residential_suitability"]
            == "high"
        ):
            adjustment += 0.06

        elif (
            row["residential_suitability"]
            == "low"
        ):
            adjustment -= 0.06

    if row["property_type"] == "agricultural":
        if (
            row["agricultural_suitability"]
            == "high"
        ):
            adjustment += 0.07

        elif (
            row["agricultural_suitability"]
            == "low"
        ):
            adjustment -= 0.07

    adjustment = max(
        -0.35,
        min(0.35, adjustment),
    )

    value *= 1 + adjustment

    # Simulated market variation.
    value *= random.uniform(
        0.90,
        1.10,
    )

    return round(value)


def make_property():
    location = random.choice(
        list(LOCATION_RATES)
    )

    property_type = random.choice(
        PROPERTY_TYPES
    )

    area_marla = round(
        random.uniform(2, 40),
        2,
    )

    return {
        "location": location,

        "property_type":
            property_type,

        "area_marla":
            area_marla,

        "road_access":
            random.choice(
                [True, False]
            ),

        "distance_to_main_road_m":
            random.randint(
                20,
                1500,
            ),

        "water_available":
            random.choice(
                [True, False]
            ),

        "electricity_available":
            random.choice(
                [True, False]
            ),

        "irrigation_available":
            random.choice(
                [True, False]
            ),

        "internet_quality":
            random.choice(
                INTERNET_LEVELS
            ),

        "terrain":
            random.choice(
                TERRAINS
            ),

        "slope":
            random.choice(
                SLOPES
            ),

        "residential_suitability":
            random.choice(
                SUITABILITY_LEVELS
            ),

        "agricultural_suitability":
            random.choice(
                SUITABILITY_LEVELS
            ),
    }


rows = []

for _ in range(1500):
    property_row = make_property()

    property_row["price_pkr"] = (
        calculate_demo_price(
            property_row
        )
    )

    rows.append(
        property_row
    )


dataframe = pd.DataFrame(rows)

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

dataframe.to_csv(
    OUTPUT_PATH,
    index=False,
)

print(
    f"Created {len(dataframe)} synthetic properties."
)

print(
    f"Saved to: {OUTPUT_PATH}"
)

print()

print(
    dataframe.head()
)