from pathlib import Path
from typing import Literal

import joblib
import pandas as pd

from fastapi import FastAPI
from pydantic import BaseModel, Field


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "valuation_model.joblib"
)


# ============================================================
# LOAD MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise RuntimeError(
        f"ML model not found at {MODEL_PATH}. "
        "Run python ml/train_model.py first."
    )

model = joblib.load(
    MODEL_PATH
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Khak-e-Wathan Valuation API",
    description=(
        "Synthetic demonstration ML valuation service "
        "for the Khak-e-Wathan hackathon project."
    ),
    version="1.0.0",
)


# ============================================================
# REQUEST MODEL
# ============================================================

class PropertyFeatures(BaseModel):
    location: str

    property_type: Literal[
        "residential",
        "agricultural",
        "commercial",
    ]

    area_marla: float = Field(
        gt=0
    )

    road_access: bool

    distance_to_main_road_m: int = Field(
        ge=0
    )

    water_available: bool

    electricity_available: bool

    irrigation_available: bool

    internet_quality: Literal[
        "poor",
        "fair",
        "good",
    ]

    terrain: Literal[
        "flat",
        "mixed",
        "sloped",
    ]

    slope: Literal[
        "low",
        "moderate",
        "steep",
    ]

    residential_suitability: Literal[
        "low",
        "moderate",
        "high",
    ]

    agricultural_suitability: Literal[
        "low",
        "moderate",
        "high",
    ]


# ============================================================
# RESPONSE MODEL
# ============================================================

class PredictionResponse(BaseModel):
    predicted_price_pkr: int

    model_type: str

    data_source: str

    synthetic_demo: bool


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "model_path": str(
            MODEL_PATH.name
        ),
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post(
    "/predict",
    response_model=PredictionResponse,
)
def predict(
    property_data: PropertyFeatures
):
    row = property_data.model_dump()

    dataframe = pd.DataFrame(
        [row]
    )

    prediction = model.predict(
        dataframe
    )[0]

    predicted_price = int(
        round(
            float(prediction)
        )
    )

    return PredictionResponse(
        predicted_price_pkr=
            predicted_price,

        model_type=
            "RandomForestRegressor",

        data_source=
            "Synthetic Chitral demo dataset",

        synthetic_demo=True,
    )