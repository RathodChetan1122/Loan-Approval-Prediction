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
    / "7_feature_loan_approval_model.pkl"
)

MODEL_VERSION = "7-feature-gb-v1"


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load(MODEL_PATH)


# ============================================================
# PREDICTION
# ============================================================

def predict_loan(application_data: dict) -> dict:
    """
    Generate a loan approval prediction using the
    trained 7-feature machine learning pipeline.
    """

    input_data = pd.DataFrame(
        [
            {
                "Dependents": application_data["dependents"],
                "Employment_Type": application_data["employment_type"],
                "Annual_Income": application_data["annual_income"],
                "Credit_Score": application_data["credit_score"],
                "Loan_Amount": application_data["loan_amount"],
                "Loan_Tenure": application_data["loan_tenure"],
                "Education": application_data["education"],
            }
        ]
    )

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
        "pipeline_steps": list(
            model.named_steps.keys()
        ),
        "model_file": MODEL_PATH.name,
        "model_version": MODEL_VERSION,
    }