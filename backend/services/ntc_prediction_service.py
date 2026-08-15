from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import shap

from services.ntc_suggestion_service import (
    generate_ntc_suggestions,
    get_feature_action_guidance,
)


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model" / "ntc_pipeline.pkl"
MAPPING_PATH = BASE_DIR / "model" / "target_mapping.pkl"


pipeline = joblib.load(MODEL_PATH)
target_mapping = joblib.load(MAPPING_PATH)

reverse_mapping = {
    value: key
    for key, value in target_mapping.items()
}

FEATURE_DISPLAY_NAMES = {
    "Loan_Amount": "Requested Loan Amount",
    "Loan_Tenure": "Loan Tenure",
    "Annual_Income": "Annual Income",
    "Dependents": "Household Dependents",
    "Employment_Type": "Employment Profile",
    "Education": "Education",
}


def _map_to_original_feature(transformed_name: str) -> str:
    """
    Map a transformed one-hot or scaled feature name back to
    one of the 6 original applicant feature keys.
    """
    cleaned = transformed_name
    for prefix in ["categorical__", "remainder__", "num__", "cat__", "onehot__", "scaler__"]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]

    cleaned_lower = cleaned.lower()
    if "education" in cleaned_lower:
        return "Education"
    if "employment" in cleaned_lower:
        return "Employment_Type"
    if "dependents" in cleaned_lower:
        return "Dependents"
    if "annual_income" in cleaned_lower or "income" in cleaned_lower:
        return "Annual_Income"
    if "loan_amount" in cleaned_lower:
        return "Loan_Amount"
    if "loan_tenure" in cleaned_lower or "tenure" in cleaned_lower:
        return "Loan_Tenure"

    return cleaned


def _format_applicant_value(feature: str, data: dict[str, Any]) -> str:
    """Format applicant value into clean human-readable text."""
    if feature == "Annual_Income":
        val = data.get("annual_income", 0)
        return f"₹{val:,.0f}"
    if feature == "Loan_Amount":
        val = data.get("loan_amount", 0)
        return f"₹{val:,.0f}"
    if feature == "Loan_Tenure":
        val = data.get("loan_tenure", 0)
        return f"{val} years"
    if feature == "Dependents":
        val = data.get("dependents", 0)
        return str(val)
    if feature == "Employment_Type":
        return str(data.get("employment_type", "Private"))
    if feature == "Education":
        return str(data.get("education", "Graduate"))
    return str(data.get(feature, ""))


def _get_influence_label(impact: float, max_abs_impact: float) -> tuple[str, str, str]:
    """
    Returns (influence_label, direction, strength)
    e.g. ("Strong negative influence", "negative", "Strong")
    """
    direction = "positive" if impact >= 0 else "negative"
    ratio = abs(impact) / max_abs_impact if max_abs_impact > 0 else 0.0

    if ratio >= 0.60:
        strength = "Strong"
    elif ratio >= 0.25:
        strength = "Moderate"
    else:
        strength = "Low"

    label = f"{strength} {direction} influence"
    return label, direction, strength


def _generate_humanized_explanation(
    feature: str,
    direction: str,
    strength: str,
) -> str:
    """
    Generate natural, applicant-friendly explanation strings
    avoiding repetitive robotic phrasing.
    """
    if direction == "negative":
        if feature == "Loan_Amount":
            if strength == "Strong":
                return "The amount you requested was one of the primary factors working against this assessment."
            elif strength == "Moderate":
                return "The amount you requested was one of the factors working against this assessment."
            else:
                return "The requested loan amount had a minor negative influence on this assessment."

        if feature == "Loan_Tenure":
            if strength == "Strong":
                return "The selected repayment period had a strong influence on the assessment outcome."
            elif strength == "Moderate":
                return "The selected repayment period had a noticeable influence on this assessment."
            else:
                return "The selected repayment period had a slight restraining effect on this assessment."

        if feature == "Annual_Income":
            if strength == "Strong":
                return "Your reported annual income was significantly less supportive for the requested borrowing level."
            elif strength == "Moderate":
                return "Your reported income was less supportive of eligibility in this particular assessment."
            else:
                return "Your reported income had a modest negative influence on this assessment."

        if feature == "Dependents":
            if strength == "Strong":
                return "The number of household dependents had a substantial influence on estimated living commitments."
            elif strength == "Moderate":
                return "The number of household dependents had a noticeable influence on the assessment."
            else:
                return "The number of household dependents had a slight negative influence on the assessment."

        if feature == "Employment_Type":
            if strength == "Strong":
                return "Your current employment status was a primary factor affecting predicted repayment stability."
            elif strength == "Moderate":
                return "Your current employment profile was less supportive for this assessment."
            else:
                return "Your employment profile had a minor negative influence on this assessment."

        if feature == "Education":
            if strength == "Strong":
                return "Your education qualification level had a noticeable negative weighting in this model evaluation."
            elif strength == "Moderate":
                return "Your educational qualification provided lower relative support in this assessment."
            else:
                return "Your education profile had a minor negative influence on this assessment."

    else:
        # Positive direction
        if feature == "Employment_Type":
            if strength == "Strong":
                return "Your employment profile provided strong support and stability for this assessment."
            elif strength == "Moderate":
                return "Your employment profile provided good support for this assessment."
            else:
                return "Your employment profile provided some support for this assessment."

        if feature == "Annual_Income":
            if strength == "Strong":
                return "Your reported income was a major positive driver for borrowing affordability."
            elif strength == "Moderate":
                return "Your annual income provided solid support for this assessment."
            else:
                return "Your annual income provided some positive support for this assessment."

        if feature == "Loan_Amount":
            if strength == "Strong":
                return "Your requested loan amount is modest and strongly supported affordability."
            elif strength == "Moderate":
                return "The requested loan amount was well-balanced and supported this assessment."
            else:
                return "The requested loan amount was supportive of this assessment."

        if feature == "Loan_Tenure":
            if strength == "Strong":
                return "Your repayment tenure provided strong support for manageable monthly commitments."
            elif strength == "Moderate":
                return "The repayment tenure chosen supported this assessment."
            else:
                return "The repayment tenure provided some support for this assessment."

        if feature == "Dependents":
            if strength == "Strong":
                return "Your household dependent profile strongly supported disposable income calculations."
            elif strength == "Moderate":
                return "Your number of dependents helped support household affordability."
            else:
                return "Your household dependent profile provided slight support for this assessment."

        if feature == "Education":
            if strength == "Strong":
                return "Your completed educational qualification provided strong positive support."
            elif strength == "Moderate":
                return "Your education level provided good positive support for this assessment."
            else:
                return "Your education level provided some support for this assessment."

    return f"This factor had a {strength.lower()} {direction} influence on the assessment."


def _get_shap_factors_and_action_plan(
    input_data: pd.DataFrame,
    data: dict[str, Any],
) -> tuple[list[dict], list[dict], list[dict]]:
    """
    Generate aggregated local SHAP contributions and dynamic personalized
    action plan items mapped strictly to the 6 original applicant features.
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]

    transformed_data = preprocessor.transform(input_data)
    feature_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(transformed_data)

    if isinstance(shap_values, list):
        values = shap_values[1]
    else:
        values = shap_values

    values = values[0]

    # Aggregate local SHAP contributions back to the 6 original features
    feature_impacts: dict[str, float] = {
        "Loan_Amount": 0.0,
        "Loan_Tenure": 0.0,
        "Annual_Income": 0.0,
        "Dependents": 0.0,
        "Employment_Type": 0.0,
        "Education": 0.0,
    }

    for feature_name, value in zip(feature_names, values):
        orig_key = _map_to_original_feature(feature_name)
        if orig_key in feature_impacts:
            feature_impacts[orig_key] += float(value)
        else:
            feature_impacts[orig_key] = feature_impacts.get(orig_key, 0.0) + float(value)

    max_abs_impact = max(abs(val) for val in feature_impacts.values()) if feature_impacts else 1.0
    if max_abs_impact == 0:
        max_abs_impact = 1.0

    negative_factors = []
    positive_factors = []

    # Sort all features by absolute impact descending
    sorted_features = sorted(
        feature_impacts.keys(),
        key=lambda k: abs(feature_impacts[k]),
        reverse=True,
    )

    for feat in sorted_features:
        impact = feature_impacts[feat]
        # Ignore negligible noise (threshold < 0.0001)
        if abs(impact) < 0.0001:
            continue

        label, direction, strength = _get_influence_label(impact, max_abs_impact)
        applicant_val = _format_applicant_value(feat, data)
        explanation_text = _generate_humanized_explanation(feat, direction, strength)

        factor_obj = {
            "feature": feat,
            "feature_name": FEATURE_DISPLAY_NAMES.get(feat, feat.replace("_", " ")),
            "influence": label,
            "applicant_value": applicant_val,
            "explanation": explanation_text,
        }

        if direction == "negative":
            negative_factors.append((factor_obj, abs(impact), feat))
        else:
            positive_factors.append((factor_obj, abs(impact), feat))

    # Top meaningful negative contributors (sorted by negative magnitude)
    final_negative = [item[0] for item in negative_factors]
    # Meaningful positive contributors (only actual positive local contributors)
    final_positive = [item[0] for item in positive_factors]

    # Generate Personalized Action Plan dynamically based on actual negative contributors
    action_plan = []
    for idx, (_, _, feat) in enumerate(negative_factors):
        step_num = f"{idx + 1:02d}"
        guidance = get_feature_action_guidance(feat, data)

        action_plan.append({
            "step": step_num,
            "feature": feat,
            "title": guidance["title"],
            "action_title": guidance["action_title"],
            "recommendation": guidance["recommendation"],
            "details": guidance["details"],
        })

    return final_negative, final_positive, action_plan


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

    negative_factors, positive_factors, action_plan = _get_shap_factors_and_action_plan(
        input_data,
        data,
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
        "negative_factors": negative_factors,
        "positive_factors": positive_factors,
        "action_plan": action_plan,
        "suggestions": suggestions,
    }