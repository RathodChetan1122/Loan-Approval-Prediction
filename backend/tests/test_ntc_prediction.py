from fastapi.testclient import TestClient
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app import app

client = TestClient(app)

NTC_APPROVAL_APPLICATION = {
    "dependents": 0,
    "employment_type": "Private",
    "annual_income": 1200000,
    "loan_amount": 1000000,
    "loan_tenure": 10,
    "education": "Graduate",
}

NTC_REJECTION_APPLICATION = {
    "dependents": 3,
    "employment_type": "Unemployed",
    "annual_income": 200000,
    "loan_amount": 30000000,
    "loan_tenure": 3,
    "education": "High School",
}


def test_ntc_prediction_returns_valid_response():
    response = client.post(
        "/new-predict",
        json=NTC_APPROVAL_APPLICATION,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["prediction"] in {"Approved", "Rejected"}
    assert 0 <= data["approved_probability"] <= 1
    assert 0 <= data["rejected_probability"] <= 1
    assert "negative_factors" in data
    assert "positive_factors" in data
    assert "action_plan" in data
    assert "suggestions" in data


def test_ntc_explainability_uses_only_original_features():
    response = client.post(
        "/new-predict",
        json=NTC_REJECTION_APPLICATION,
    )

    assert response.status_code == 200
    data = response.json()

    allowed_features = {
        "Education",
        "Dependents",
        "Employment_Type",
        "Annual_Income",
        "Loan_Amount",
        "Loan_Tenure",
    }

    for factor in data["negative_factors"] + data["positive_factors"]:
        assert factor["feature"] in allowed_features
        # Ensure no raw percentages or technical terms in influence label
        assert "%" not in factor["influence"]
        assert any(
            level in factor["influence"]
            for level in ["Strong", "Moderate", "Low"]
        )

    for action in data["action_plan"]:
        assert action["feature"] in allowed_features
        assert action["step"] in {"01", "02", "03", "04", "05", "06"}
        # Ensure no credit/CIBIL references in action plan
        full_text = f"{action['title']} {action['action_title']} {action['recommendation']} {' '.join(action['details'])}".lower()
        assert "cibil" not in full_text
        assert "credit score" not in full_text
        assert "credit report" not in full_text
        assert "credit card" not in full_text


def test_ntc_invalid_input():
    app_data = NTC_APPROVAL_APPLICATION.copy()
    app_data["dependents"] = 5  # invalid, max 3

    response = client.post(
        "/new-predict",
        json=app_data,
    )

    assert response.status_code == 422
