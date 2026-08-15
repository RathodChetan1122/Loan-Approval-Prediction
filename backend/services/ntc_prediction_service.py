from pathlib import Path

import joblib
import pandas as pd
import shap

from services.ntc_suggestion_service import generate_ntc_suggestions


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model" / "ntc_pipeline.pkl"
MAPPING_PATH = BASE_DIR / "model" / "target_mapping.pkl"


pipeline = joblib.load(MODEL_PATH)
target_mapping = joblib.load(MAPPING_PATH)

reverse_mapping = {
    value: key
    for key, value in target_mapping.items()
}


def _get_shap_explanation(input_data: pd.DataFrame) -> list[dict]:
    """
    Generate SHAP feature contributions for the NTC prediction.

    The input is transformed using the exact preprocessor
    stored inside ntc_pipeline.pkl.
    """

    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]

    transformed_data = preprocessor.transform(input_data)

    feature_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(model)

    shap_values = explainer.shap_values(transformed_data)

    # GradientBoostingClassifier binary classification
    # returns one SHAP value per transformed feature.
    if isinstance(shap_values, list):
        values = shap_values[1]
    else:
        values = shap_values

    values = values[0]

    explanation = []

    for feature_name, value in zip(feature_names, values):
        explanation.append(
            {
                "feature": feature_name,
                "impact": round(float(value), 6),
            }
        )

    explanation.sort(
        key=lambda item: abs(item["impact"]),
        reverse=True,
    )

    return explanation[:10]


def predict_ntc(data: dict):
    input_data = pd.DataFrame([{
        "Education": data["education"],
        "Dependents": data["dependents"],
        "Employment_Type": data["employment_type"],
        "Annual_Income": data["annual_income"],
        "Loan_Amount": data["loan_amount"],
        "Loan_Tenure": data["loan_tenure"],
    }])

    prediction = int(
        pipeline.predict(input_data)[0]
    )

    probabilities = pipeline.predict_proba(
        input_data
    )[0]

    approved_index = target_mapping["Approved"]
    rejected_index = target_mapping["Rejected"]

    approved_probability = float(
        probabilities[approved_index]
    )

    rejected_probability = float(
        probabilities[rejected_index]
    )

    confidence = max(
        approved_probability,
        rejected_probability,
    )

    loan_status = reverse_mapping[prediction]

    shap_explanation = _get_shap_explanation(
        input_data
    )

    suggestions = generate_ntc_suggestions(
        data
    )

    return {
        "prediction": loan_status,
        "confidence": round(confidence, 4),
        "approved_probability": round(
            approved_probability,
            4,
        ),
        "rejected_probability": round(
            rejected_probability,
            4,
        ),
        "shap_explanation": shap_explanation,
        "suggestions": suggestions,
    }
