from fastapi.testclient import TestClient
from app import app

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

def test_predict_endpoint_includes_max_loan_fields():
    response = client.post("/predict", json=STRONG_APPLICATION)
    assert response.status_code == 200
    data = response.json()
    
    assert "loan_amount_analysis" in data
    analysis = data["loan_amount_analysis"]
    assert "recommendedAmount" in analysis
    assert "recommendedApprovalProbability" in analysis
    assert "scenarios" in analysis

def test_predict_weak_application_no_eligible_amount():
    response = client.post("/predict", json=WEAK_APPLICATION)
    assert response.status_code == 200
    data = response.json()
    
    assert "loan_amount_analysis" in data
    analysis = data["loan_amount_analysis"]
    # Since weak application should not get any eligible amount
    assert analysis["recommendedAmount"] is None

def test_predict_ntc_endpoint_includes_max_loan_fields():
    response = client.post("/new-predict", json={
        "dependents": 2,
        "employment_type": "Private",
        "annual_income": 6000000,
        "loan_amount": 15000000,
        "loan_tenure": 10,
        "education": "Graduate",
        "monthly_expenses": 300000
    })
    assert response.status_code == 200
    data = response.json()
    
    assert "maximum_eligible_amount" in data
    assert "max_eligible_approved_probability" in data
    assert "max_loan_message" in data
