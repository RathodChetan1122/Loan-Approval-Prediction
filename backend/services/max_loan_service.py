"""
Service to determine the Maximum Eligible Loan Amount for an applicant profile.

Methodology: Hybrid Financial Affordability (FOIR & Present Value Annuity)
combined with Machine Learning Credit Risk Assessment.

This engine computes:
1. Net Monthly Disposable Income.
2. Effective Fixed Obligation to Income Ratio (FOIR) adjusted for income tier,
   dependents, and employment stability.
3. Maximum Affordable Monthly EMI.
4. Theoretical Maximum Borrowing Capacity via Present Value Annuity formula
   at benchmark retail lending interest rates over the requested tenure.
5. ML Credit Risk Multiplier calibrated from the production model's approval
   probability and credit score tier.
6. Proportional Eligibility relative to requested amount (Fully Eligible,
   Partially Eligible, or Not Eligible) with transparent financial metrics.
"""

from typing import Any
import pandas as pd


# Benchmark retail lending interest rate (10.5% p.a.)
BENCHMARK_ANNUAL_INTEREST_RATE: float = 0.105


def find_maximum_eligible_loan(
    application_data: dict[str, Any],
    model: Any,
    benchmark_rate: float = BENCHMARK_ANNUAL_INTEREST_RATE,
) -> dict[str, Any]:
    """
    Compute data-driven Maximum Eligible Loan Amount and comprehensive
    affordability metrics using financial repayment physics calibrated
    with the production ML credit risk classifier.
    """
    requested_amount = int(application_data["loan_amount"])
    annual_income = float(application_data["annual_income"])
    monthly_income = annual_income / 12.0
    tenure_years = int(application_data["loan_tenure"])
    tenure_months = tenure_years * 12
    credit_score = float(application_data["credit_score"])
    employment_type = str(application_data["employment_type"])
    dependents = int(application_data["dependents"])
    education = str(application_data.get("education", "Graduate"))

    # ------------------------------------------------------------
    # 1. Base FOIR by Monthly Income Bracket
    # ------------------------------------------------------------
    if monthly_income < 30_000:
        base_foir = 0.40
    elif monthly_income < 75_000:
        base_foir = 0.50
    elif monthly_income < 150_000:
        base_foir = 0.55
    else:
        base_foir = 0.60

    # ------------------------------------------------------------
    # 2. Household & Employment Stability Adjustments
    # ------------------------------------------------------------
    # Dependent allowance: 3% reduction per dependent to protect household living cushion
    dependent_discount = 0.03 * dependents
    effective_foir = max(0.20, base_foir - dependent_discount)

    # Employment stability factor
    emp_multipliers = {
        "Government": 1.05,
        "Private": 1.00,
        "Self-Employed": 0.90,
        "Skilled Labor": 0.85,
        "Unemployed": 0.00,
    }
    emp_factor = emp_multipliers.get(employment_type, 1.0)
    effective_foir = effective_foir * emp_factor

    # ------------------------------------------------------------
    # 3. Maximum Affordable Monthly EMI
    # ------------------------------------------------------------
    max_affordable_emi = monthly_income * effective_foir

    # ------------------------------------------------------------
    # 4. Theoretical Max Capacity via Present Value Annuity
    # ------------------------------------------------------------
    monthly_rate = benchmark_rate / 12.0
    if effective_foir <= 0 or max_affordable_emi <= 0 or tenure_months <= 0:
        theoretical_capacity = 0.0
    else:
        # PV = EMI * [((1 + r)^n - 1) / (r * (1 + r)^n)]
        compound = (1.0 + monthly_rate) ** tenure_months
        discount_factor = (compound - 1.0) / (monthly_rate * compound)
        theoretical_capacity = max_affordable_emi * discount_factor

    # ------------------------------------------------------------
    # 5. ML Credit Risk Evaluation
    # ------------------------------------------------------------
    input_df = pd.DataFrame(
        [
            {
                "Dependents": dependents,
                "Employment_Type": employment_type,
                "Annual_Income": annual_income,
                "Credit_Score": credit_score,
                "Loan_Amount": requested_amount,
                "Loan_Tenure": tenure_years,
                "Education": education,
            }
        ]
    )

    try:
        prob_approved = float(model.predict_proba(input_df)[0][1])
    except Exception:
        prob_approved = 0.50

    # ------------------------------------------------------------
    # 6. Risk Multiplier Calibration
    # ------------------------------------------------------------
    if credit_score < 500 or employment_type == "Unemployed":
        risk_multiplier = 0.0
    elif credit_score < 600:
        # High risk tier (500-599): 30% to 60% leverage
        score_ratio = (credit_score - 500.0) / 100.0
        risk_multiplier = 0.30 + (0.35 * score_ratio * max(prob_approved, 0.10))
    elif credit_score < 750:
        # Standard tier (600-749): 65% to 90% leverage
        score_ratio = (credit_score - 600.0) / 150.0
        risk_multiplier = 0.65 + (0.25 * score_ratio * max(prob_approved, 0.50))
    else:
        # Prime tier (750-900): 90% to 100% leverage
        score_ratio = (credit_score - 750.0) / 150.0
        risk_multiplier = 0.90 + (0.10 * min(1.0, prob_approved))

    risk_multiplier = max(0.0, min(1.0, risk_multiplier))

    # ------------------------------------------------------------
    # 7. Final Risk-Adjusted Borrowing Capacity
    # ------------------------------------------------------------
    risk_adjusted_capacity = theoretical_capacity * risk_multiplier

    # Round to nearest ₹5,000 increment for clean currency presentation
    if risk_adjusted_capacity > 0:
        total_borrowing_capacity = int(round(risk_adjusted_capacity / 5000.0) * 5000)
    else:
        total_borrowing_capacity = 0

    # ------------------------------------------------------------
    # 8. Eligibility Tier & Amount relative to Requested Amount
    # ------------------------------------------------------------
    if total_borrowing_capacity <= 0 or risk_multiplier <= 0:
        eligible_amount = 0
        eligibility_tier = "not_eligible"
        max_loan_status = "none_eligible"
        prediction_label = "Rejected"
    else:
        prediction_label = "Approved"
        if total_borrowing_capacity >= requested_amount:
            eligible_amount = requested_amount
            eligibility_tier = "fully_eligible"
            max_loan_status = "eligible"
        elif total_borrowing_capacity >= int(0.95 * requested_amount):
            eligible_amount = requested_amount
            eligibility_tier = "fully_eligible"
            max_loan_status = "eligible"
        else:
            eligible_amount = total_borrowing_capacity
            eligibility_tier = "partially_eligible"
            max_loan_status = "eligible"

    # Eligibility ratio percentage
    if requested_amount > 0:
        eligibility_ratio = round((eligible_amount / requested_amount) * 100.0, 1)
    else:
        eligibility_ratio = 0.0

    # ------------------------------------------------------------
    # 9. Contextual Explainability Message & Guidance
    # ------------------------------------------------------------
    if eligibility_tier == "fully_eligible":
        message = (
            f"Based on your income, repayment capacity, and credit score, you are fully eligible "
            f"for your requested amount of ₹{requested_amount:,}."
        )
    elif eligibility_tier == "partially_eligible":
        reduction = requested_amount - eligible_amount
        message = (
            f"Your requested amount is ₹{requested_amount:,}. Based on your monthly disposable income "
            f"and debt-service capacity, your estimated eligible amount is ₹{eligible_amount:,} "
            f"(₹{reduction:,} lower than requested)."
        )
    else:
        message = (
            "Based on your current applicant profile and credit score, the model estimates that "
            "the requested borrowing capacity cannot be safely approved at this time."
        )

    return {
        "requested_loan_amount": requested_amount,
        "maximum_eligible_amount": eligible_amount,
        "maximum_eligible_prediction": prediction_label,
        "max_eligible_approved_probability": round(prob_approved, 4),
        "max_loan_status": max_loan_status,
        "max_loan_message": message,
        "eligibility_tier": eligibility_tier,
        "eligibility_ratio": eligibility_ratio,
        "total_borrowing_capacity": total_borrowing_capacity,
        "estimated_max_emi": int(round(max_affordable_emi)),
        "foir_percentage": round(effective_foir * 100.0, 1),
        "risk_factor_percentage": round(risk_multiplier * 100.0, 1),
        "benchmark_apr": round(benchmark_rate * 100.0, 2),
    }
