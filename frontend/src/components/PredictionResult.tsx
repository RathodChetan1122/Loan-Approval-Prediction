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
  const eligibilityTier = result.eligibility_tier ?? (
    maxEligibleAmount >= requestedAmount
      ? "fully_eligible"
      : maxEligibleAmount > 0
      ? "partially_eligible"
      : "not_eligible"
  );
  const eligibilityRatio = result.eligibility_ratio ?? (
    requestedAmount > 0 ? Math.round((maxEligibleAmount / requestedAmount) * 100) : 0
  );

  const totalCapacity = result.total_borrowing_capacity ?? maxEligibleAmount;
  const maxEmi = result.estimated_max_emi ?? 0;
  const foir = result.foir_percentage ?? 50.0;
  const benchmarkApr = result.benchmark_apr ?? 10.5;

  return (
    <section className={`result-page ${isApproved ? "result-approved" : "result-rejected"}`}>
      <div className="decision-card">
        <div className="result-kicker">MODEL ASSESSMENT</div>
        <div className="decision-icon" aria-hidden="true">
          {isApproved ? "✓" : "×"}
        </div>
        <h1>Loan Eligibility Assessment</h1>
        <strong className="decision-title">
          {isApproved ? "LIKELY ELIGIBLE" : "PREDICTED NOT ELIGIBLE"}
        </strong>
        <p>
          {isApproved
            ? "Based on your credit profile and demonstrated income, the ML model estimates a strong likelihood of approval."
            : "Based on the information provided, the model estimates a lower likelihood of approval for this loan structure."}
        </p>
        <small>This is a model assessment based on application data, not an official lender decision or credit guarantee.</small>
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
      {/* MAXIMUM ELIGIBLE LOAN AMOUNT SECTION                         */}
      {/* ============================================================ */}
      <section className="max-loan-panel" aria-labelledby="max-loan-title">
        <header className="max-loan-header">
          <div className="max-loan-icon" aria-hidden="true">₹</div>
          <div>
            <span className="max-loan-eyebrow">DATA-DRIVEN CAPACITY ANALYSIS</span>
            <h2 id="max-loan-title">Maximum Estimated Eligible Loan Amount</h2>
          </div>
        </header>

        {/* Tier status indicator pill */}
        <div className="tier-indicator-wrapper">
          <span className={`tier-badge tier-${eligibilityTier}`}>
            {eligibilityTier === "fully_eligible" && "✓ Fully Eligible for Requested Loan"}
            {eligibilityTier === "partially_eligible" && "⚡ Partially Eligible (Recommended Adjustment)"}
            {eligibilityTier === "not_eligible" && "✕ Not Eligible at Current Capacity"}
          </span>
        </div>

        <div className="max-loan-grid">
          <div className="max-loan-metric-card requested-metric">
            <span className="metric-label">Requested Loan Amount</span>
            <strong className="metric-value">{formatINR(requestedAmount)}</strong>
            <span className={`status-pill ${isApproved ? "pill-approved" : "pill-rejected"}`}>
              Approval: {result.prediction}
            </span>
          </div>

          <div className="max-loan-metric-card eligible-metric">
            <span className="metric-label">Estimated Eligible Amount</span>
            <strong className="metric-value">
              {eligibilityTier === "not_eligible" ? "₹0" : formatINR(maxEligibleAmount)}
            </strong>
            {eligibilityTier !== "not_eligible" && (
              <span className="prob-pill">
                Credit Score Confidence: {maxEligibleProb.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Proportional Eligibility Meter */}
        <div className="eligibility-meter-card">
          <div className="meter-header">
            <span>Eligibility Proportion</span>
            <strong>{eligibilityRatio.toFixed(1)}% of requested</strong>
          </div>
          <div className="meter-track">
            <div
              className={`meter-bar meter-bar-${eligibilityTier}`}
              style={{ width: `${Math.min(100, Math.max(0, eligibilityRatio))}%` }}
            />
          </div>
        </div>

        {/* Affordability Breakdown Subgrid */}
        <div className="affordability-breakdown">
          <h3>Affordability &amp; Repayment Capacity Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span>Max Monthly EMI Capacity</span>
              <strong>{maxEmi > 0 ? formatINR(maxEmi) : "—"}</strong>
              <small>Disposable repayment limit</small>
            </div>
            <div className="breakdown-item">
              <span>Allowable Debt Ratio (FOIR)</span>
              <strong>{foir.toFixed(0)}%</strong>
              <small>Adjusted for household size</small>
            </div>
            <div className="breakdown-item">
              <span>Total Borrowing Ceiling</span>
              <strong>{totalCapacity > 0 ? formatINR(totalCapacity) : "₹0"}</strong>
              <small>Across entire tenure</small>
            </div>
            <div className="breakdown-item">
              <span>Benchmark Rate</span>
              <strong>{benchmarkApr.toFixed(1)}% p.a.</strong>
              <small>Standard retail APR</small>
            </div>
          </div>
        </div>

        {/* Contextual Guidance Message */}
        <div className={`max-loan-comparison-box comparison-${eligibilityTier}`}>
          <p>{result.max_loan_message}</p>
        </div>

        <small className="max-loan-disclaimer">
          This estimate uses banking-standard Debt-to-Income / FOIR affordability calculations combined with the ML credit score risk assessment. It is for informational planning and does not constitute a legal loan sanction.
        </small>
      </section>

      {/* Insights & Recommendations */}
      <div className="insights-panel">
        <header>
          <span>✦</span>
          <div>
            <p>{isApproved ? "Application insights" : "How you can improve"}</p>
            <small>Tailored guidance based on your financial assessment</small>
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
              <small>General steps to help strengthen your borrowing profile</small>
            </div>
          </header>
          <div className="guide-grid">
            <article>
              <span>01</span>
              <h2>Strengthen your credit profile</h2>
              <p>
                Pay all current EMIs and credit cards promptly, keep credit utilization below 30%, and check your CIBIL report for discrepancies.
              </p>
            </article>
            <article>
              <span>02</span>
              <h2>Adjust loan tenure or principal</h2>
              <p>
                Opting for a longer tenure reduces monthly EMI pressure, directly increasing your maximum eligible loan amount.
              </p>
            </article>
            <article>
              <span>03</span>
              <h2>Consider a co-applicant</h2>
              <p>
                Adding an earning family member as a co-applicant combines household income, significantly expanding borrowing capacity.
              </p>
            </article>
          </div>
          <p className="guide-note">
            These are financial education tips, not a guarantee of future approval.
          </p>
        </section>
      )}

      <button type="button" className="reset-button" onClick={onReset}>
        ↻ Check another application
      </button>
    </section>
  );
}
