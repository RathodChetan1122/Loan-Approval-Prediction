from pathlib import Path

import joblib
import pandas as pd

from services.suggestion_service import generate_suggestions


# ============================================================
# MODEL CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "model"
    / "loan_model.pkl"
)

MODEL_VERSION = "7-feature-gb-v2"


# ============================================================
# LOAD MODEL BUNDLE
# ============================================================

model = None
encoders = {}
FEATURES = []
model_load_error = None

try:
    model_bundle = joblib.load(MODEL_PATH)
    model = model_bundle["model"]
    encoders = model_bundle["encoders"]
    FEATURES = model_bundle["features"]
except Exception as exc:
    model_load_error = str(exc)


# ============================================================
# PREDICTION
# ============================================================

def predict_loan(application_data: dict) -> dict:
    """
    Generate a loan approval prediction using the
    validated 7-feature Gradient Boosting model.
    """

    if model is None:
        raise RuntimeError(
            "Model is not loaded"
            if model_load_error is None
            else f"Model is not loaded: {model_load_error}"
        )

    # --------------------------------------------------------
    # Create input using the exact training feature names
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [
            {
                "Dependents": application_data["dependents"],
                "Employment_Type": application_data["employment_type"],
                "Credit_Score": application_data["credit_score"],
                "Annual_Income": application_data["annual_income"],
                "Loan_Amount": application_data["loan_amount"],
                "Loan_Tenure": application_data["loan_tenure"],
                "Education": application_data["education"],
            }
        ]
    )

    # --------------------------------------------------------
    # Apply the EXACT encoders used during training
    # --------------------------------------------------------

    for column, encoder in encoders.items():
        input_data[column] = encoder.transform(
            input_data[column]
        )

    # --------------------------------------------------------
    # Maintain EXACT feature order
    # --------------------------------------------------------

    input_data = input_data[FEATURES]

    # --------------------------------------------------------
    # ML prediction
    # --------------------------------------------------------

    prediction = model.predict(input_data)[0]

    # --------------------------------------------------------
    # Prediction probabilities
    # --------------------------------------------------------

    probabilities = model.predict_proba(input_data)[0]

    rejected_probability = float(probabilities[0])
    approved_probability = float(probabilities[1])

    # --------------------------------------------------------
    # Convert prediction to readable label
    # --------------------------------------------------------

    prediction_label = (
        "Approved"
        if prediction == 1
        else "Rejected"
    )

    # --------------------------------------------------------
    # Generate applicant guidance
    # --------------------------------------------------------

    suggestions = generate_suggestions(
        application_data
    )

    return {
        "prediction": prediction_label,
        "approved_probability": round(
            approved_probability,
            4,
        ),
        "rejected_probability": round(
            rejected_probability,
            4,
        ),
        "suggestions": suggestions,
    }


# ============================================================
# MODEL STATUS
# ============================================================

def get_model_status() -> dict:
    """
    Return information about the loaded ML model.
    """

    return {
        "model_loaded": model is not None,
        "model_type": type(model).__name__,
        "model_file": MODEL_PATH.name,
        "model_version": MODEL_VERSION,
        "features": FEATURES,
        "model_load_error": model_load_error,
    }
