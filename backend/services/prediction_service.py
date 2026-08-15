from pathlib import Path
import sys
from typing import Any

import joblib
import numpy as np
import pandas as pd

# Compatibility shims for loading scikit-learn 1.6.1 serialized pipelines
# across varied Python/scikit-learn runtime versions without altering model artifacts.
try:
    import sklearn.compose._column_transformer
    if not hasattr(sklearn.compose._column_transformer, "_RemainderColsList"):
        class _RemainderColsList(list):
            pass
        sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList
except Exception:
    pass

try:
    import sklearn._loss
    if not hasattr(sklearn._loss, "CyHalfBinomialLoss"):
        sklearn._loss.CyHalfBinomialLoss = getattr(sklearn._loss, "HalfBinomialLoss", None)
    if "_loss" not in sys.modules:
        sys.modules["_loss"] = sklearn._loss
except Exception:
    pass

try:
    import sklearn.impute._base
    if not hasattr(sklearn.impute._base.SimpleImputer, "_fill_dtype"):
        sklearn.impute._base.SimpleImputer._fill_dtype = property(
            lambda self: getattr(self, "_fit_dtype", np.float64)
        )
except Exception:
    pass

from services.max_loan_service import find_maximum_eligible_loan
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

def predict_loan(application_data: dict[str, Any]) -> dict[str, Any]:
    """
    Generate a loan approval prediction and maximum eligible loan estimation
    using the trained 7-feature machine learning pipeline.
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

    # --------------------------------------------------------
    # Evaluate Maximum Eligible Loan Amount
    # --------------------------------------------------------

    max_loan_info = find_maximum_eligible_loan(
        application_data=application_data,
        model=model,
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
        "requested_loan_amount": max_loan_info["requested_loan_amount"],
        "maximum_eligible_amount": max_loan_info["maximum_eligible_amount"],
        "maximum_eligible_prediction": max_loan_info["maximum_eligible_prediction"],
        "max_eligible_approved_probability": max_loan_info["max_eligible_approved_probability"],
        "max_loan_status": max_loan_info["max_loan_status"],
        "max_loan_message": max_loan_info["max_loan_message"],
    }


def estimate_maximum_loan(application_data: dict[str, Any]) -> dict[str, Any]:
    """
    Dedicated calculation for maximum eligible loan amount.
    """
    return find_maximum_eligible_loan(
        application_data=application_data,
        model=model,
    )


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