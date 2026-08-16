"""
Service to determine the maximum eligible loan amount for an applicant profile
by directly evaluating the existing production ML model up to the requested loan amount.

Zero arbitrary banking formulas (no income multipliers, no DTI/FOIR heuristics)
are used. The estimation relies strictly on evaluating the fitted Scikit-Learn
pipeline across candidate loan amounts with the applicant's other profile
features fixed.
"""

from typing import Any
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_BUNDLE_PATH = BASE_DIR / "model" / "loan_model.pkl"

# ============================================================
# SEARCH BOUNDARIES & RESOLUTION CONFIGURATION
# ============================================================
MIN_SEARCH_AMOUNT: int = 10_000          # ₹10,000 minimum evaluated search boundary
COARSE_STEP: int = 50_000                 # ₹50,000 step size for full range scan
FINE_STEP: int = 5_000                    # ₹5,000 step size for local refinement
APPROVAL_PROBABILITY_THRESHOLD: float = 0.50


def find_maximum_eligible_loan(
    application_data: dict[str, Any],
    model: Any,
    encoders: dict[str, Any] | None = None,
    features: list[str] | None = None,
    min_amount: int = MIN_SEARCH_AMOUNT,
    coarse_step: int = COARSE_STEP,
    fine_step: int = FINE_STEP,
    threshold: float = APPROVAL_PROBABILITY_THRESHOLD,
    max_amount: int | None = None,
) -> dict[str, Any]:
    """
    Evaluate the existing production ML model to find the highest loan amount
    up to the applicant's requested loan amount that yields an 'Approved'
    prediction (P(Approved) >= threshold).

    The user's requested loan amount is the strict UPPER LIMIT of the search.
    The system never searches above the requested amount.

    Applicant features remain fixed:
    - Dependents
    - Employment_Type
    - Annual_Income
    - Credit_Score
    - Loan_Tenure
    - Education

    Only Loan_Amount is systematically varied up to requested_amount.
    """
    requested_amount = int(application_data["loan_amount"])
    if encoders is None or features is None:
        model_bundle = joblib.load(MODEL_BUNDLE_PATH)

    if encoders is None:
        encoders = model_bundle["encoders"]

    if features is None:
        features = model_bundle["features"]
    upper_limit = requested_amount if max_amount is None else min(requested_amount, max_amount)
    lower_limit = min(min_amount, upper_limit)

    # ------------------------------------------------------------
    # 1. Generate coarse candidate grid across [lower_limit, upper_limit]
    # ------------------------------------------------------------
    coarse_amounts = np.arange(lower_limit, upper_limit + coarse_step, coarse_step)
    coarse_amounts = coarse_amounts[coarse_amounts <= upper_limit]
    if len(coarse_amounts) == 0 or coarse_amounts[-1] != upper_limit:
        coarse_amounts = np.append(coarse_amounts, upper_limit)
    coarse_amounts = np.unique(coarse_amounts)

    # Build vectorized DataFrame for coarse candidates
    base_record = {
         "Dependents": application_data["dependents"],
         "Employment_Type": application_data["employment_type"],
         "Credit_Score": application_data["credit_score"],
         "Annual_Income": application_data["annual_income"],
         "Loan_Tenure": application_data["loan_tenure"],
         "Education": application_data["education"],
        }

    coarse_df = pd.DataFrame(
        [
            {
    "Dependents": base_record["Dependents"],
    "Employment_Type": base_record["Employment_Type"],
    "Credit_Score": base_record["Credit_Score"],
    "Annual_Income": base_record["Annual_Income"],
    "Loan_Amount": amt,
    "Loan_Tenure": base_record["Loan_Tenure"],
    "Education": base_record["Education"],
}
            for amt in coarse_amounts
        ]
    )
        # Apply the exact encoders used by the existing production model.
    # Loan_Amount and all already-numeric fields remain unchanged.
    for column, encoder in encoders.items():
        if column in coarse_df.columns:
            coarse_df[column] = encoder.transform(coarse_df[column])

    coarse_df = coarse_df[features]
    # ------------------------------------------------------------
    # 2. Vectorized batch model evaluation for coarse candidates
    # ------------------------------------------------------------
    # model.predict_proba returns array of [P(Rejected), P(Approved)]
    coarse_probs = model.predict_proba(coarse_df)[:, 1]
    approved_mask = coarse_probs >= threshold

    # Handle case where even the minimum candidate is rejected
    if not np.any(approved_mask):
        min_amount_prob = float(coarse_probs[0])
        return {
            "requested_loan_amount": requested_amount,
            "maximum_eligible_amount": 0,
            "maximum_eligible_prediction": "Rejected",
            "max_eligible_approved_probability": round(min_amount_prob, 4),
            "max_loan_status": "none_eligible",
            "max_loan_message": (
                "Based on your current applicant profile, the existing ML model "
                "does not predict loan approval for any evaluated loan amount "
                "up to your requested amount."
            ),
        }

    # Find highest approved coarse candidate (correctly handles non-monotonic regions)
    approved_indices = np.where(approved_mask)[0]
    highest_coarse_idx = approved_indices[-1]
    best_coarse_amount = int(coarse_amounts[highest_coarse_idx])
    best_coarse_prob = float(coarse_probs[highest_coarse_idx])

    # ------------------------------------------------------------
    # 3. Refine boundary around the highest approved region
    # ------------------------------------------------------------
    if best_coarse_amount >= upper_limit:
        best_amount = upper_limit
        best_prob = best_coarse_prob
    else:
        refine_start = best_coarse_amount
        refine_end = min(best_coarse_amount + coarse_step, upper_limit)

        fine_amounts = np.arange(refine_start, refine_end + fine_step, fine_step)
        fine_amounts = fine_amounts[fine_amounts <= upper_limit]
        if len(fine_amounts) == 0 or fine_amounts[-1] != refine_end:
            fine_amounts = np.append(fine_amounts, refine_end)
        fine_amounts = np.unique(fine_amounts)

        fine_df = pd.DataFrame(
            [
                {
    "Dependents": base_record["Dependents"],
    "Employment_Type": base_record["Employment_Type"],
    "Credit_Score": base_record["Credit_Score"],
    "Annual_Income": base_record["Annual_Income"],
    "Loan_Amount": amt,
    "Loan_Tenure": base_record["Loan_Tenure"],
    "Education": base_record["Education"],
}
                for amt in fine_amounts
            ]
        )
                # Apply the exact same production encoders to fine candidates.
        for column, encoder in encoders.items():
            if column in fine_df.columns:
                fine_df[column] = encoder.transform(fine_df[column])

        fine_df = fine_df[features]

        fine_probs = model.predict_proba(fine_df)[:, 1]
        fine_approved_mask = fine_probs >= threshold

        if np.any(fine_approved_mask):
            fine_approved_indices = np.where(fine_approved_mask)[0]
            highest_fine_idx = fine_approved_indices[-1]
            best_amount = int(fine_amounts[highest_fine_idx])
            best_prob = float(fine_probs[highest_fine_idx])
        else:
            best_amount = best_coarse_amount
            best_prob = best_coarse_prob

    # Guarantee that maximum_eligible_amount never exceeds requested_amount
    best_amount = min(best_amount, requested_amount)

    if best_amount == requested_amount:
        message = (
            f"Based on your current applicant profile, the existing ML model "
            f"predicts approval for your requested amount of ₹{requested_amount:,}."
        )
    else:
        message = (
            f"Your requested amount is ₹{requested_amount:,}, but based on your "
            f"current applicant profile, the existing ML model predicts approval "
            f"up to approximately ₹{best_amount:,}."
        )

    return {
        "requested_loan_amount": requested_amount,
        "maximum_eligible_amount": best_amount,
        "maximum_eligible_prediction": "Approved",
        "max_eligible_approved_probability": round(best_prob, 4),
        "max_loan_status": "eligible",
        "max_loan_message": message,
    }
