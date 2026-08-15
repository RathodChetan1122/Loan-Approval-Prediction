import type { PredictionResponse } from "../types/loan";

interface Props {
  result: PredictionResponse;
  onReset: () => void;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PredictionResult({ result, onReset }: Props) {
  const approved = result.approved_probability * 100;
  const rejected = result.rejected_probability * 100;
  const isApproved = result.prediction === "Approved";
  const decisionProbability = isApproved ? approved : rejected;

  const requestedAmount = result.requested_loan_amount ?? 0;
  const maxEligibleAmount = result.maximum_eligible_amount ?? 0;
  const maxEligibleProb = (result.max_eligible_approved_probability ?? 0) * 100;
  const maxLoanStatus = result.max_loan_status ?? (maxEligibleAmount > 0 ? "eligible" : "none_eligible");
  const isRequestedAboveMax = requestedAmount > maxEligibleAmount;

  return (
    <section className={`result-page ${isApproved ? "result-approved" : "result-rejected"}`}>
      <div className="decision-card">
        <div className="result-kicker">MODEL PREDICTION</div>
        <div className="decision-icon" aria-hidden="true">
          {isApproved ? "✓" : "×"}
        </div>
        <h1>Loan eligibility result</h1>
        <strong className="decision-title">
          {isApproved ? "LIKELY ELIGIBLE" : "PREDICTED NOT ELIGIBLE"}
        </strong>
        <p>
          {isApproved
            ? "Based on the information provided, the model estimates a strong likelihood of loan eligibility."
            : "Based on the information provided, the model estimates a lower likelihood of loan eligibility right now."}
        </p>
        <small>This is a model assessment, not a lender decision or guarantee of bank approval.</small>
      </div>

      <div className="probability-panel">
        <div className="probability-side approval-side">
          <span>Approval probability</span>
          <strong>{approved.toFixed(2)}%</strong>
          <div className="probability-bar">
            <i style={{ width: `${approved}%` }} />
          </div>
        </div>
        <div
          className="probability-ring"
          style={{ "--decision-progress": `${decisionProbability * 3.6}deg` } as React.CSSProperties}
        >
          <div>
            <strong>{decisionProbability.toFixed(1)}%</strong>
            <span>estimated</span>
          </div>
        </div>
        <div className="probability-side rejection-side">
          <span>Rejection probability</span>
          <strong>{rejected.toFixed(2)}%</strong>
          <div className="probability-bar">
            <i style={{ width: `${rejected}%` }} />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAXIMUM PREDICTED ELIGIBLE LOAN AMOUNT SECTION               */}
      {/* ============================================================ */}
      <section className="max-loan-panel" aria-labelledby="max-loan-title">
        <header className="max-loan-header">
          <div className="max-loan-icon" aria-hidden="true">₹</div>
          <div>
            <span className="max-loan-eyebrow">MODEL CAPACITY ESTIMATION</span>
            <h2 id="max-loan-title">Maximum Predicted Eligible Loan Amount</h2>
          </div>
        </header>

        <div className="max-loan-grid">
          <div className="max-loan-metric-card requested-metric">
            <span className="metric-label">Requested Loan Amount</span>
            <strong className="metric-value">{formatINR(requestedAmount)}</strong>
            <span className={`status-pill ${isApproved ? "pill-approved" : "pill-rejected"}`}>
              Loan Approval: {result.prediction}
            </span>
          </div>

          <div className="max-loan-metric-card eligible-metric">
            <span className="metric-label">Maximum Predicted Eligible Loan Amount</span>
            <strong className="metric-value">
              {maxLoanStatus === "none_eligible" ? "₹0" : formatINR(maxEligibleAmount)}
            </strong>
            {maxLoanStatus !== "none_eligible" && maxEligibleAmount > 0 ? (
              <span className="prob-pill">
                Approved Probability: {maxEligibleProb.toFixed(1)}%
              </span>
            ) : (
              <span className="status-pill pill-rejected">
                No Eligible Amount Found
              </span>
            )}
          </div>
        </div>

        <div
          className={`max-loan-comparison-box ${
            maxLoanStatus === "none_eligible"
              ? "comparison-none"
              : isRequestedAboveMax
              ? "comparison-above"
              : "comparison-within"
          }`}
        >
          {maxLoanStatus === "none_eligible" ? (
            <p>
              Based on your current applicant profile, the ML model does not predict loan approval within the evaluated loan range.
            </p>
          ) : isRequestedAboveMax ? (
            <>
              <p>
                Your requested amount is above the model's predicted eligible amount.
              </p>
              <p className="suggested-amount-highlight">
                Suggested Maximum Amount: <strong>{formatINR(maxEligibleAmount)}</strong>
              </p>
            </>
          ) : (
            <p>
              Based on your current applicant profile, the existing ML model predicts approval up to approximately <strong>{formatINR(maxEligibleAmount)}</strong>.
            </p>
          )}
        </div>

        <small className="max-loan-disclaimer">
          This is a model-predicted maximum eligible amount based on the provided inputs, not a guaranteed bank loan approval.
        </small>
      </section>

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
            <div
              className="suggestion-item"
              style={{ animationDelay: `${index * 90}ms` }}
              key={`${index}-${suggestion}`}
            >
              <span>✓</span>
              <p>{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

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
              <span>01</span>
              <h2>Strengthen your credit profile</h2>
              <p>
                Pay all current EMIs and credit-card bills on time, keep credit use modest, and review your credit report for any errors before a future application.
              </p>
            </article>
            <article>
              <span>02</span>
              <h2>Make the loan easier to repay</h2>
              <p>
                Consider a lower requested amount or a longer tenure only if the total cost remains comfortable. A realistic repayment plan can improve affordability.
              </p>
            </article>
            <article>
              <span>03</span>
              <h2>Build a stronger application</h2>
              <p>
                Keep income records up to date, avoid multiple loan applications in a short period, and apply once your finances better support the monthly repayment.
              </p>
            </article>
          </div>
          <p className="guide-note">
            These are general financial education tips, not a guarantee of future approval.
          </p>
        </section>
      )}

      <button type="button" className="reset-button" onClick={onReset}>
        ↻ Check another application
      </button>
    </section>
  );
}
