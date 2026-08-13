from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


APPROVAL_APPLICATION = {
    "dependents": 2,
    "employment_type": "Private",
    "annual_income": 6000000,
    "credit_score": 720,
    "loan_amount": 15000000,
    "loan_tenure": 10,
    "education": "Graduate",
}


REJECTION_APPLICATION = {
    "dependents": 3,
    "employment_type": "Unemployed",
    "annual_income": 200000,
    "credit_score": 350,
    "loan_amount": 30000000,
    "loan_tenure": 5,
    "education": "High School",
}


def test_prediction_returns_valid_response():

    response = client.post(
        "/predict",
        json=APPROVAL_APPLICATION,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prediction"] in {
        "Approved",
        "Rejected",
    }

    assert 0 <= data["approved_probability"] <= 1

    assert 0 <= data["rejected_probability"] <= 1

    assert (
        round(
            data["approved_probability"]
            + data["rejected_probability"],
            4,
        )
        == 1.0
    )


def test_strong_application():

    response = client.post(
        "/predict",
        json=APPROVAL_APPLICATION,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prediction"] == "Approved"


def test_weak_application():

    response = client.post(
        "/predict",
        json=REJECTION_APPLICATION,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prediction"] == "Rejected"


def test_prediction_contains_suggestions():

    response = client.post(
        "/predict",
        json=REJECTION_APPLICATION,
    )

    assert response.status_code == 200

    data = response.json()

    assert "suggestions" in data

    assert isinstance(
        data["suggestions"],
        list,
    )


def test_invalid_prediction_input():

    application = APPROVAL_APPLICATION.copy()

    application["credit_score"] = 950

    response = client.post(
        "/predict",
        json=application,
    )

    assert response.status_code == 422