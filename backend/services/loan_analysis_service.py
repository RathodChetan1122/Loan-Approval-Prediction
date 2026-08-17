from typing import Any
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_BUNDLE_PATH = BASE_DIR / "model" / "loan_model.pkl"

MODEL_ANALYSIS_THRESHOLD: float = 0.50

def evaluate_candidates(
    candidate_amounts: list[int],
    base_record: dict[str, Any],
    model: Any,
    encoders: dict[str, Any],
    features: list[str]
) -> dict[int, float]:
    """
    Evaluates a list of candidate loan amounts against the ML model.
    Returns a dictionary mapping amount -> approved_probability.
    """
    if not candidate_amounts:
        return {}
        
    df = pd.DataFrame([
        {
            **base_record,
            "Loan_Amount": amt,
        }
        for amt in candidate_amounts
    ])

    for column, encoder in encoders.items():
        if column in df.columns:
            df[column] = encoder.transform(df[column])

    df = df[features]

    classes = list(model.classes_)
    approved_index = classes.index(1) if 1 in classes else 1
    
    probs = model.predict_proba(df)
    
    results = {}
    for i, amt in enumerate(candidate_amounts):
        results[amt] = float(probs[i][approved_index])
        
    return results

def generate_loan_amount_analysis(
    application_data: dict[str, Any],
    model: Any,
    encoders: dict[str, Any] | None = None,
    features: list[str] | None = None,
    threshold: float = MODEL_ANALYSIS_THRESHOLD,
) -> dict[str, Any]:
    """
    Perform counterfactual what-if analysis by varying the loan amount
    using an adaptive Two-Phase (Coarse then Fine) Search.
    """
    requested_amount = int(application_data["loan_amount"])

    if encoders is None or features is None:
        model_bundle = joblib.load(MODEL_BUNDLE_PATH)
        if encoders is None:
            encoders = model_bundle["encoders"]
        if features is None:
            features = model_bundle["features"]

    base_record = {
         "Dependents": application_data["dependents"],
         "Employment_Type": application_data["employment_type"],
         "Credit_Score": application_data["credit_score"],
         "Annual_Income": application_data["annual_income"],
         "Loan_Tenure": application_data["loan_tenure"],
         "Education": application_data["education"],
    }
    
    # Track all evaluations
    all_evaluated = {}
    
    # 1. Baseline Evaluation
    baseline_res = evaluate_candidates([requested_amount], base_record, model, encoders, features)
    all_evaluated.update(baseline_res)
    current_approved_prob = baseline_res[requested_amount]
    is_currently_eligible = current_approved_prob >= threshold
    
    mode = "DOWNWARD_IMPROVEMENT"
    
    # Variables for output
    recommended_amount = requested_amount
    recommended_prob = current_approved_prob

    if is_currently_eligible:
        # User is already approved. The requested amount is the maximum.
        recommended_amount = requested_amount
        recommended_prob = current_approved_prob
    else:
        # SEARCH DOWNWARD
        favorable_boundary = None
        unfavorable_boundary = requested_amount
        
        # Phase 1: Coarse Search Downward
        standard_coarse_steps = [
            5000000, 3000000, 2000000, 1500000, 1000000, 750000, 
            600000, 500000, 400000, 300000, 200000, 100000, 50000, 25000, 10000
        ]
        coarse_candidates = [amt for amt in standard_coarse_steps if amt < requested_amount]
        
        # If requested_amount is very small or weird
        if not coarse_candidates:
            coarse_step = max(1000, requested_amount // 5)
            coarse_step = (coarse_step // 1000) * 1000
            coarse_candidates = []
            cand = requested_amount - coarse_step
            cand = (cand // 1000) * 1000
            while cand > 0 and len(coarse_candidates) < 6:
                coarse_candidates.append(cand)
                cand -= coarse_step
            
        coarse_res = evaluate_candidates(coarse_candidates, base_record, model, encoders, features)
        all_evaluated.update(coarse_res)
        
        for amt in coarse_candidates:
            if coarse_res[amt] >= threshold:
                favorable_boundary = amt
                break # Found a favorable amount!
            else:
                unfavorable_boundary = amt
                
        # Phase 2: Fine Search Downward (if we found a favorable one)
        if favorable_boundary and (unfavorable_boundary - favorable_boundary) > 10000:
            fine_step = (unfavorable_boundary - favorable_boundary) // 5
            fine_step = max(10000, (fine_step // 10000) * 10000)
            
            fine_candidates = []
            cand = favorable_boundary + fine_step
            while cand < unfavorable_boundary:
                fine_candidates.append(cand)
                cand += fine_step
                
            fine_res = evaluate_candidates(fine_candidates, base_record, model, encoders, features)
            all_evaluated.update(fine_res)
            
            for amt in fine_candidates:
                if fine_res[amt] >= threshold:
                    favorable_boundary = amt
                    
        if favorable_boundary is not None:
            recommended_amount = favorable_boundary
            recommended_prob = all_evaluated[recommended_amount]
        else:
            # None are favorable. Return None to indicate no eligible amount.
            recommended_amount = None
            recommended_prob = 0.0

    # ABSOLUTE VALIDATION RULE
    if recommended_amount is not None and recommended_amount > requested_amount:
        print(f"CRITICAL ERROR: recommended_amount ({recommended_amount}) > requested_amount ({requested_amount})")
        recommended_amount = requested_amount
        recommended_prob = current_approved_prob

    # --- FORMAT SCENARIOS ---
    # We may have evaluated 15+ amounts. Let's pick a clean subset of 6-10 scenarios to show.
    sorted_amts = sorted(all_evaluated.keys())
    
    # Always include the requested amount and the recommended amount
    key_amts = {requested_amount, recommended_amount}
    
    # Thin out the rest to keep the table clean
    if len(sorted_amts) > 10:
        step = len(sorted_amts) / 8
        selected_amts = key_amts.copy()
        for i in range(8):
            idx = int(i * step)
            if idx < len(sorted_amts):
                selected_amts.add(sorted_amts[idx])
        final_amts = sorted(list(selected_amts))
    else:
        final_amts = sorted_amts

    scenarios = []
    for amt in final_amts:
        prob = all_evaluated[amt]
        scenarios.append({
            "loanAmount": amt,
            "approvalProbability": round(prob * 100, 2),
            "status": "ELIGIBLE" if prob >= threshold else "NOT_ELIGIBLE"
        })

    return {
        "mode": mode,
        "currentAmount": requested_amount,
        "recommendedAmount": recommended_amount,
        "recommendedApprovalProbability": round(recommended_prob * 100, 2),
        "threshold": round(threshold * 100, 2),
        "scenarios": scenarios
    }
