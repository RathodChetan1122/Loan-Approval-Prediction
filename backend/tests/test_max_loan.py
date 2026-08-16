from fastapi.testclient import TestClient

from app import app
from services.max_loan_service import find_maximum_eligible_loan
from services.prediction_service import model


client = TestClient(app)


# ============================================================
# TEST PROFILES
# ============================================================

# Strong profile: High income, excellent credit score, modest requested loan
STRONG_FULLY_ELIGIBLE = {
    "dependents": 1,
    "employment_type": "Government",
    "annual_income": 2400000,  # ₹24 Lakhs (₹2L/month)
    "credit_score": 780,
    "loan_amount": 1000000,   # ₹10 Lakhs requested
    "loan_tenure": 10,
    "education": "Post Graduate",
}

# Moderate profile: Moderate income, good credit score, high requested loan
MODERATE_PARTIALLY_ELIGIBLE = {
    "dependents": 2,
    "employment_type": "Private",
    "annual_income": 600000,   # ₹6 Lakhs (₹50k/month)
    "credit_score": 720,
    "loan_amount": 3000000,   # ₹30 Lakhs requested
    "loan_tenure": 10,
    "education": "Graduate",
}

# Weak profile: Very low income, poor credit score
WEAK_REJECTED_PROFILE = {
    "dependents": 3,
    "employment_type": "Unemployed",
    "annual_income": 120000,   # ₹1.2 Lakhs
    "credit_score": 420,
    "loan_amount": 1000000,
    "loan_tenure": 5,
    "education": "High School",
}

# Low credit score (<500)
POOR_CREDIT_PROFILE = {
    "dependents": 0,
    "employment_type": "Private",
    "annual_income": 1200000,
    "credit_score": 450,
    "loan_amount": 500000,
    "loan_tenure": 5,
    "education": "Graduate",
}


# ============================================================
# UNIT TESTS: find_maximum_eligible_loan
# ============================================================

def test_max_loan_fully_eligible():
    """
    Applicant with high income and prime credit requesting modest loan
    should be classified as 'fully_eligible' for the full requested amount.
    """
    result = find_maximum_eligible_loan(STRONG_FULLY_ELIGIBLE, model)

    assert result["eligibility_tier"] == "fully_eligible"
    assert result["maximum_eligible_prediction"] == "Approved"
    assert result["maximum_eligible_amount"] == STRONG_FULLY_ELIGIBLE["loan_amount"]
    assert result["eligibility_ratio"] == 100.0
    assert result["total_borrowing_capacity"] >= STRONG_FULLY_ELIGIBLE["loan_amount"]
    assert result["estimated_max_emi"] > 0
    assert result["foir_percentage"] > 0
    assert result["max_loan_status"] == "eligible"


def test_max_loan_partially_eligible():
    """
    Applicant with moderate income requesting an excessive loan amount
    should be classified as 'partially_eligible' with an amount lower than requested.
    """
    result = find_maximum_eligible_loan(MODERATE_PARTIALLY_ELIGIBLE, model)

    assert result["eligibility_tier"] == "partially_eligible"
    assert result["maximum_eligible_prediction"] == "Approved"
    assert 0 < result["maximum_eligible_amount"] < MODERATE_PARTIALLY_ELIGIBLE["loan_amount"]
    assert 0 < result["eligibility_ratio"] < 100.0
    assert result["maximum_eligible_amount"] == result["total_borrowing_capacity"]
    assert result["max_loan_status"] == "eligible"


def test_max_loan_rejected_weak_profile():
    """
    Unemployed applicant with poor credit score should be 'not_eligible' with ₹0.
    """
    result = find_maximum_eligible_loan(WEAK_REJECTED_PROFILE, model)

    assert result["eligibility_tier"] == "not_eligible"
    assert result["maximum_eligible_prediction"] == "Rejected"
    assert result["maximum_eligible_amount"] == 0
    assert result["eligibility_ratio"] == 0.0
    assert result["max_loan_status"] == "none_eligible"


def test_max_loan_rejected_poor_credit():
    """
    Applicant with credit score < 500 should be 'not_eligible' with ₹0.
    """
    result = find_maximum_eligible_loan(POOR_CREDIT_PROFILE, model)

    assert result["eligibility_tier"] == "not_eligible"
    assert result["maximum_eligible_prediction"] == "Rejected"
    assert result["maximum_eligible_amount"] == 0
    assert result["eligibility_ratio"] == 0.0


def test_maximum_eligible_never_exceeds_requested_amount():
    """
    Even if an applicant has massive borrowing capacity (e.g. ₹50L),
    if they only request ₹5L, maximum_eligible_amount must never exceed ₹5L.
    """
    app = STRONG_FULLY_ELIGIBLE.copy()
    app["loan_amount"] = 300000  # Request only ₹3 Lakhs

    result = find_maximum_eligible_loan(app, model)

    assert result["maximum_eligible_amount"] <= app["loan_amount"]
    assert result["maximum_eligible_amount"] == 300000
    assert result["total_borrowing_capacity"] > app["loan_amount"]


def test_monotonicity_with_income():
    """
    Higher annual income (with all other parameters identical) must yield
    greater or equal borrowing capacity.
    """
    app_low = MODERATE_PARTIALLY_ELIGIBLE.copy()
    app_high = MODERATE_PARTIALLY_ELIGIBLE.copy()

    app_low["annual_income"] = 500000
    app_high["annual_income"] = 1000000

    res_low = find_maximum_eligible_loan(app_low, model)
    res_high = find_maximum_eligible_loan(app_high, model)

    assert res_high["total_borrowing_capacity"] > res_low["total_borrowing_capacity"]
    assert res_high["estimated_max_emi"] > res_low["estimated_max_emi"]


def test_monotonicity_with_tenure():
    """
    Longer tenure (e.g. 15 yrs vs 5 yrs) must yield greater borrowing capacity
    for the same monthly EMI limit.
    """
    app_short = MODERATE_PARTIALLY_ELIGIBLE.copy()
    app_long = MODERATE_PARTIALLY_ELIGIBLE.copy()

    app_short["loan_tenure"] = 5
    app_long["loan_tenure"] = 15

    res_short = find_maximum_eligible_loan(app_short, model)
    res_long = find_maximum_eligible_loan(app_long, model)

    assert res_long["total_borrowing_capacity"] > res_short["total_borrowing_capacity"]


def test_dependents_impact():
    """
    More dependents reduces disposable FOIR cushion and slightly reduces max borrowing capacity.
    """
    app_no_dep = MODERATE_PARTIALLY_ELIGIBLE.copy()
    app_many_dep = MODERATE_PARTIALLY_ELIGIBLE.copy()

    app_no_dep["dependents"] = 0
    app_many_dep["dependents"] = 3

    res_no_dep = find_maximum_eligible_loan(app_no_dep, model)
    res_many_dep = find_maximum_eligible_loan(app_many_dep, model)

    assert res_no_dep["total_borrowing_capacity"] > res_many_dep["total_borrowing_capacity"]
    assert res_no_dep["foir_percentage"] > res_many_dep["foir_percentage"]


# ============================================================
# API INTEGRATION TESTS
# ============================================================

def test_predict_endpoint_returns_rich_explainability_fields():
    response = client.post(
        "/predict",
        json=MODERATE_PARTIALLY_ELIGIBLE,
    )

    assert response.status_code == 200
    data = response.json()

    # Core prediction fields
    assert data["prediction"] in {"Approved", "Rejected"}
    assert "approved_probability" in data
    assert "rejected_probability" in data
    assert "suggestions" in data

    # Maximum eligible loan fields
    assert data["requested_loan_amount"] == MODERATE_PARTIALLY_ELIGIBLE["loan_amount"]
    assert "maximum_eligible_amount" in data
    assert "maximum_eligible_prediction" in data
    assert "eligibility_tier" in data
    assert data["eligibility_tier"] == "partially_eligible"
    assert "eligibility_ratio" in data
    assert "total_borrowing_capacity" in data
    assert "estimated_max_emi" in data
    assert "foir_percentage" in data
    assert "risk_factor_percentage" in data
    assert "benchmark_apr" in data
    assert "max_loan_message" in data


def test_dedicated_max_eligible_loan_endpoint():
    response = client.post(
        "/max-eligible-loan",
        json=STRONG_FULLY_ELIGIBLE,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["requested_loan_amount"] == STRONG_FULLY_ELIGIBLE["loan_amount"]
    assert data["maximum_eligible_amount"] == STRONG_FULLY_ELIGIBLE["loan_amount"]
    assert data["eligibility_tier"] == "fully_eligible"
    assert data["eligibility_ratio"] == 100.0
