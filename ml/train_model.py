from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import (
    ColumnTransformer,
)

from sklearn.ensemble import (
    RandomForestRegressor,
)

from sklearn.metrics import (
    mean_absolute_error,
    r2_score,
)

from sklearn.model_selection import (
    train_test_split,
)

from sklearn.pipeline import Pipeline

from sklearn.preprocessing import (
    OneHotEncoder,
)


BASE_DIR = Path(__file__).parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "chitral_properties.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "valuation_model.joblib"
)


data = pd.read_csv(
    DATA_PATH
)


TARGET = "price_pkr"

FEATURES = [
    "location",
    "property_type",
    "area_marla",
    "road_access",
    "distance_to_main_road_m",
    "water_available",
    "electricity_available",
    "irrigation_available",
    "internet_quality",
    "terrain",
    "slope",
    "residential_suitability",
    "agricultural_suitability",
]


X = data[FEATURES]
y = data[TARGET]


categorical_features = [
    "location",
    "property_type",
    "internet_quality",
    "terrain",
    "slope",
    "residential_suitability",
    "agricultural_suitability",
]


numeric_features = [
    "area_marla",
    "distance_to_main_road_m",
]


boolean_features = [
    "road_access",
    "water_available",
    "electricity_available",
    "irrigation_available",
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features,
        ),

        (
            "numeric",
            "passthrough",
            numeric_features,
        ),

        (
            "boolean",
            "passthrough",
            boolean_features,
        ),
    ]
)


model = RandomForestRegressor(
    n_estimators=250,
    random_state=42,
    n_jobs=-1,
)


pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor,
        ),

        (
            "model",
            model,
        ),
    ]
)


X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )
)


pipeline.fit(
    X_train,
    y_train,
)


predictions = pipeline.predict(
    X_test
)


mae = mean_absolute_error(
    y_test,
    predictions,
)

r2 = r2_score(
    y_test,
    predictions,
)


print()
print("Khak-e-Wathan ML Valuation")
print("--------------------------")

print(
    f"Training rows: {len(X_train)}"
)

print(
    f"Testing rows:  {len(X_test)}"
)

print(
    f"MAE: PKR {mae:,.0f}"
)

print(
    f"R²:  {r2:.3f}"
)


MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)


joblib.dump(
    pipeline,
    MODEL_PATH,
)


print()
print(
    f"Saved model to: {MODEL_PATH}"
)