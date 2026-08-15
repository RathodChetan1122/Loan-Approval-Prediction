import { useState, useEffect, useMemo } from "react";
import type {
  PredictionResponse,
  NTCPredictionResponse,
  LoanApplication,
} from "../types/loan";
import { predictLoan } from "../services/api";

interface Props { 
  result: PredictionResponse | NTCPredictionResponse; 
  initialApplication?: LoanApplication;
  onReset: () => void;
}

function isNTCResult(
  result: PredictionResponse | NTCPredictionResponse
): result is NTCPredictionResponse {
  return (
    "shap_explanation" in result &&
    Array.isArray(result.shap_explanation)
  );
}

export default function PredictionResult({ result, initialApplication, onReset }: Props) {
  const approved = result.approved_probability * 100;
  const rejected = result.rejected_probability * 100;
  const isApproved = result.prediction === "Approved";
  const decisionProbability = isApproved ? approved : rejected;
  
  const ntcFactors = isNTCResult(result)
  ? [...result.shap_explanation]
      .sort(
        (a, b) =>
          Math.abs(b.impact) -
          Math.abs(a.impact)
      )
      .slice(0, 3)
  : [];
  const [simulatedAmount, setSimulatedAmount] = useState(initialApplication?.loan_amount || 50000);
  const [simulatedTenure, setSimulatedTenure] = useState(initialApplication?.loan_tenure || 12);
  const [simulationResponse, setSimulationResponse] = useState<{
    result: PredictionResponse | NTCPredictionResponse;
    amount: number;
    tenure: number;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);

  const isInitial = initialApplication && simulatedAmount === initialApplication.loan_amount && simulatedTenure === initialApplication.loan_tenure;

  const simulatedResult = useMemo(() => {
    if (simulationResponse?.amount === simulatedAmount && simulationResponse?.tenure === simulatedTenure) {
      return simulationResponse.result;
    }
    return null;
  }, [simulationResponse, simulatedAmount, simulatedTenure]);

  useEffect(() => {
    if (!initialApplication || isInitial) return;

    const timer = setTimeout(async () => {
      setSimulating(true);
      try {
        const res = await predictLoan({
          ...initialApplication,
          loan_amount: simulatedAmount,
          loan_tenure: simulatedTenure
        });
        setSimulationResponse({
          result: res,
          amount: simulatedAmount,
          tenure: simulatedTenure
        });
      } catch (e) {
        console.error("Simulation failed", e);
      } finally {
        setSimulating(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [simulatedAmount, simulatedTenure, initialApplication, isInitial]);

  const activeSimulatedResult = isInitial ? null : simulatedResult;
  const simApproved = activeSimulatedResult ? activeSimulatedResult.approved_probability * 100 : approved;
  const diff = simApproved - approved;

  return (
    <section className={`result-page ${isApproved ? "result-approved" : "result-rejected"}`}>
      <div className="decision-card">
        <div className="result-kicker">MODEL PREDICTION</div>
        <div className="decision-icon" aria-hidden="true">{isApproved ? "✓" : "✕"}</div>
        <h1>Loan eligibility result</h1>
        <strong className="decision-title">{isApproved ? "LIKELY ELIGIBLE" : "PREDICTED NOT ELIGIBLE"}</strong>
        <p>{isApproved ? "Based on the information provided, the model estimates a strong likelihood of loan eligibility." : "Based on the information provided, the model estimates a lower likelihood of loan eligibility right now."}</p>
        <small>This is a model assessment, not a lender decision or guarantee of bank approval.</small>
      </div>

      <div className="probability-panel">
        <div className="probability-side approval-side">
          <span>Approval probability</span>
          <strong>{approved.toFixed(2)}%</strong>
          <div className="probability-bar"><i style={{ width: `${approved}%` }} /></div>
        </div>
        <div className="probability-ring" style={{ "--decision-progress": `${decisionProbability * 3.6}deg` } as React.CSSProperties}>
          <div><strong>{decisionProbability.toFixed(1)}%</strong><span>estimated</span></div>
        </div>
        <div className="probability-side rejection-side">
          <span>Rejection probability</span>
          <strong>{rejected.toFixed(2)}%</strong>
          <div className="probability-bar"><i style={{ width: `${rejected}%` }} /></div>
        </div>
      </div>

      <div className="insights-panel">
        <header>
          <span>✦</span>
          <div>
            <p>{isApproved ? "Application insights" : "How you can improve"}</p>
            <small>Personalized recommendations from your model assessment</small>
          </div>
        </header>
        <div className="suggestions-list">
          {result.suggestions.map((suggestion, index) => (
            <div className="suggestion-item" style={{ animationDelay: `${index * 90}ms` }} key={`${index}-${suggestion}`}>
              <span>✓</span><p>{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
{isNTCResult(result) && (
  <section
    className="insights-panel"
    aria-labelledby="ntc-insights-title"
  >
    <header>
      <span className="guide-icon">✦</span>

      <div>
        <p id="ntc-insights-title">
          Why the model made this prediction
        </p>

        <small>
          These are the strongest factors that
          influenced this NTC assessment.
        </small>
      </div>
    </header>

    <div className="insights-grid">
      {ntcFactors.map((factor) => (
        <article
          key={factor.feature}
          className="insight-card"
        >
          <span>
            {factor.impact >= 0 ? "↑" : "↓"}
          </span>

          <div>
            <strong>
              {factor.feature
                .replace(
                  "remainder__",
                  ""
                )
                .replaceAll("_", " ")}
            </strong>

            <small>
              {factor.impact >= 0
                ? "Positive influence"
                : "Negative influence"}
            </small>
          </div>

          <b>
            {factor.impact >= 0 ? "+" : ""}
            {factor.impact.toFixed(3)}
          </b>
        </article>
      ))}
    </div>

    <p className="guide-note">
      SHAP values explain the direction and relative
      strength of each feature's contribution. They
      are model explanations, not guarantees of
      approval or rejection.
    </p>
  </section>
)}
      {initialApplication && (
        <section className="simulator-panel" aria-labelledby="simulator-title">
          <header>
            <span className="guide-icon simulator-icon">🎛️</span>
            <div>
              <p id="simulator-title">Interactive What-If Simulator</p>
              <small>Adjust loan terms to see how your approval odds change in real-time.</small>
            </div>
          </header>
          
          <div className="simulator-content">
            <div className="simulator-controls">
              <div className="slider-group">
                <div className="slider-header">
                  <label>Loan Amount</label>
                  <strong>₹{simulatedAmount.toLocaleString('en-IN')}</strong>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="1000000" 
                  step="5000"
                  value={simulatedAmount} 
                  onChange={e => setSimulatedAmount(Number(e.target.value))} 
                  className="custom-range simulator-range"
                  style={{ "--range-progress": `${((simulatedAmount - 10000) / (1000000 - 10000)) * 100}%` } as React.CSSProperties}
                />
              </div>
              
              <div className="slider-group">
                <div className="slider-header">
                  <label>Loan Tenure</label>
                  <strong>{simulatedTenure} Months</strong>
                </div>
                <input 
                  type="range" 
                  min="6" 
                  max="60" 
                  step="6"
                  value={simulatedTenure} 
                  onChange={e => setSimulatedTenure(Number(e.target.value))} 
                  className="custom-range simulator-range"
                  style={{ "--range-progress": `${((simulatedTenure - 6) / (60 - 6)) * 100}%` } as React.CSSProperties}
                />
              </div>
            </div>

            <div className={`simulator-impact ${simulating ? 'simulating' : ''}`}>
              <span>Simulated Approval</span>
              <strong className={simApproved > 50 ? 'impact-good' : 'impact-bad'}>{simApproved.toFixed(1)}%</strong>
              {diff !== 0 && (
                <div className={`impact-diff ${diff > 0 ? 'diff-up' : 'diff-down'}`}>
                  {diff > 0 ? '↗' : '↘'} {Math.abs(diff).toFixed(1)}% {diff > 0 ? 'improved' : 'decreased'}
                </div>
              )}
              {simulating && <small className="sim-loading">Calculating...</small>}
            </div>
          </div>
        </section>
      )}

      {!isApproved && (
        <section className="rejection-guide" aria-labelledby="next-steps-title">
          <header>
            <span className="guide-icon">↗</span>
            <div>
              <p id="next-steps-title">A practical plan for your next application</p>
              <small>General guidance to help you prepare before you apply again</small>
            </div>
          </header>
          <div className="guide-grid">
            <article>
              <span>01</span><h2>Strengthen your credit profile</h2>
              <p>Pay all current EMIs and credit-card bills on time, keep credit use modest, and review your credit report for any errors before a future application.</p>
            </article>
            <article>
              <span>02</span><h2>Make the loan easier to repay</h2>
              <p>Consider a lower requested amount or a longer tenure only if the total cost remains comfortable. A realistic repayment plan can improve affordability.</p>
            </article>
            <article>
              <span>03</span><h2>Build a stronger application</h2>
              <p>Keep income records up to date, avoid multiple loan applications in a short period, and apply once your finances better support the monthly repayment.</p>
            </article>
          </div>
          <p className="guide-note">These are general financial education tips, not a guarantee of future approval.</p>
        </section>
      )}

      <button type="button" className="reset-button" onClick={onReset}>↻ Check another application</button>
    </section>
  );
}



