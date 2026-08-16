from fastapi.testclient import TestClient

from app import app
from services.max_loan_service import (
    find_maximum_eligible_loan,
    MIN_SEARCH_AMOUNT,
)
from services.prediction_service import model


client = TestClient(app)


STRONG_APPLICATION = {
    "dependents": 2,
    "employment_type": "Private",
    "annual_income": 6000000,
    "credit_score": 720,
    "loan_amount": 15000000,
    "loan_tenure": 10,
    "education": "Graduate",
}

WEAK_APPLICATION = {
    "dependents": 3,
    "employment_type": "Unemployed",
    "annual_income": 200000,
    "credit_score": 350,
    "loan_amount": 30000000,
    "loan_tenure": 5,
    "education": "High School",
}

MARGINAL_APPLICATION = {
    "dependents": 1,
    "employment_type": "Private",
    "annual_income": 800000,
    "credit_score": 600,
    "loan_amount": 15000000,
    "loan_tenure": 10,
    "education": "Graduate",
}


def test_max_loan_strong_profile():
    result = find_maximum_eligible_loan(STRONG_APPLICATION, model)

    assert result["maximum_eligible_prediction"] == "Approved"
    assert result["maximum_eligible_amount"] >= 5000000
    assert result["max_eligible_approved_probability"] >= 0.50
    assert result["max_loan_status"] in {"eligible", "max_limit_reached"}
    assert "ML model predicts" in result["max_loan_message"]


def test_max_loan_weak_profile():
    result = find_maximum_eligible_loan(WEAK_APPLICATION, model)

    assert result["maximum_eligible_prediction"] == "Rejected"
    assert result["maximum_eligible_amount"] == 0
    assert result["max_loan_status"] == "none_eligible"
    assert "does not predict loan approval" in result["max_loan_message"]


def test_max_loan_marginal_profile_finds_lower_threshold():
    # A marginal profile that gets rejected at 1.5 Cr but approved at lower amounts (e.g. 50k - 50 Lakhs)
    result = find_maximum_eligible_loan(MARGINAL_APPLICATION, model)

    assert result["maximum_eligible_prediction"] == "Approved"
    assert result["maximum_eligible_amount"] > 0
    assert result["maximum_eligible_amount"] < MARGINAL_APPLICATION["loan_amount"]
    assert result["max_eligible_approved_probability"] >= 0.50


def test_predict_endpoint_includes_max_loan_fields():
    response = client.post(
        "/predict",
        json=STRONG_APPLICATION,
    )

    assert response.status_code == 200
    data = response.json()

    # Original fields preserved
    assert data["prediction"] == "Approved"
    assert "approved_probability" in data
    assert "rejected_probability" in data
    assert "suggestions" in data

    # New maximum loan fields
    assert data["requested_loan_amount"] == STRONG_APPLICATION["loan_amount"]
    assert "maximum_eligible_amount" in data
    assert data["maximum_eligible_prediction"] == "Approved"
    assert "max_eligible_approved_probability" in data
    assert data["max_loan_status"] in {"eligible", "max_limit_reached"}
    assert "max_loan_message" in data


def test_dedicated_max_eligible_loan_endpoint():
    response = client.post(
        "/max-eligible-loan",
        json=MARGINAL_APPLICATION,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["requested_loan_amount"] == MARGINAL_APPLICATION["loan_amount"]
    assert data["maximum_eligible_amount"] > 0
    assert data["maximum_eligible_prediction"] == "Approved"
    assert data["max_eligible_approved_probability"] >= 0.50
    assert data["max_loan_status"] == "eligible"


def test_custom_boundary_limits():
    """The explicit max_amount ceiling must never be exceeded."""
    tight_max = 500000

    result = find_maximum_eligible_loan(
        STRONG_APPLICATION,
        model,
        max_amount=tight_max,
        coarse_step=50000,
        fine_step=5000,
    )

    assert result["maximum_eligible_amount"] <= tight_max
    assert result["requested_loan_amount"] == STRONG_APPLICATION["loan_amount"]
    assert result["maximum_eligible_prediction"] in {"Approved", "Rejected"}


def test_non_monotonic_search_selects_true_highest_approved():
    """
    Explicit test verifying that if a tree model produces a non-monotonic step pattern
    (e.g., approved at ₹100k, rejected at ₹200k, and approved at ₹400k),
    the search does NOT stop prematurely at ₹200k and correctly returns the true highest approved amount.
    """
    class MockNonMonotonicModel:
        def predict_proba(self, df):
            # Non-monotonic: approved (<150k), rejected (150k-350k), approved (350k-500k), rejected (>500k)
            amounts = df["Loan_Amount"].to_numpy()
            probs = []
            for amt in amounts:
                if amt <= 150_000:
                    probs.append([0.1, 0.9])   # Approved
                elif 150_000 < amt <= 350_000:
                    probs.append([0.9, 0.1])   # Rejected dip
                elif 350_000 < amt <= 500_000:
                    probs.append([0.2, 0.8])   # Approved island
                else:
                    probs.append([0.95, 0.05]) # Rejected above 500k
            return np.array(probs)

    import numpy as np
    mock_model = MockNonMonotonicModel()
    result = find_maximum_eligible_loan(
        STRONG_APPLICATION,
        mock_model,
        min_amount=50_000,
        max_amount=1_000_000,
        coarse_step=50_000,
        fine_step=5_000,
    )

    assert result["maximum_eligible_prediction"] == "Approved"
    # Must find ₹500,000 (highest approved island), not ₹150,000
    assert result["maximum_eligible_amount"] == 500_000
    assert result["max_eligible_approved_probability"] == 0.80
    assert result["max_loan_status"] == "eligible"
