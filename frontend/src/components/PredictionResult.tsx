import { useState } from "react";
import type { CSSProperties } from "react";

import type {
  PredictionResponse,
  NTCPredictionResponse,
  NTCFactorItem,
  NTCActionItem,
} from "../types/loan";

interface Props {
  result: PredictionResponse | NTCPredictionResponse;
  onReset: () => void;
}

function isNTCResult(
  result: PredictionResponse | NTCPredictionResponse
): result is NTCPredictionResponse {
  return "negative_factors" in result || "action_plan" in result || "confidence" in result;
}

export default function PredictionResult({
  result,
  onReset,
}: Props) {
  const approved = result.approved_probability * 100;
  const rejected = result.rejected_probability * 100;
  const isApproved = result.prediction === "Approved";
  const decisionProbability = isApproved ? approved : rejected;

  // Track expanded state for accordions (all collapsed by default)
  const [expandedNegative, setExpandedNegative] = useState<Record<number, boolean>>({});
  const [expandedPositive, setExpandedPositive] = useState<Record<number, boolean>>({});
  const [expandedAction, setExpandedAction] = useState<Record<number, boolean>>({});

  const toggleNegative = (index: number) => {
    setExpandedNegative((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const togglePositive = (index: number) => {
    setExpandedPositive((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAction = (index: number) => {
    setExpandedAction((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isNTC = isNTCResult(result);
  const ntcData = isNTC ? (result as NTCPredictionResponse) : null;
  const negativeFactors: NTCFactorItem[] = ntcData?.negative_factors || [];
  const positiveFactors: NTCFactorItem[] = ntcData?.positive_factors || [];
  const actionPlan: NTCActionItem[] = ntcData?.action_plan || [];

  return (
    <section
      className={`result-page ${
        isApproved ? "result-approved" : "result-rejected"
      }`}
    >
      {/* =====================================================
          MODEL PREDICTION
      ===================================================== */}
      <div className="decision-card">
        <div className="result-kicker">MODEL PREDICTION</div>

        <div className="decision-icon" aria-hidden="true">
          {isApproved ? "✓" : "×"}
        </div>

        <h1>Loan eligibility result</h1>

        {isNTC && (
          <div
            style={{
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "#7b8794",
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            *Approximate assessment
          </div>
        )}

        <strong className="decision-title">
          {isApproved ? "LIKELY ELIGIBLE" : "PREDICTED NOT ELIGIBLE"}
        </strong>

        <p>
          {isApproved
            ? "Based on the information provided, the model estimates a strong likelihood of loan eligibility."
            : "Based on the information provided, the model estimates a lower likelihood of loan eligibility right now."}
        </p>

        <small>
          This is a model assessment, not a lender decision or guarantee of bank approval.
        </small>
      </div>

      {/* =====================================================
          PROBABILITIES
      ===================================================== */}
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
          style={
            {
              "--decision-progress": `${decisionProbability * 3.6}deg`,
            } as CSSProperties
          }
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

      {/* =====================================================
          NTC SPECIFIC SECTIONS
      ===================================================== */}
      {isNTC ? (
        <>
          {/* -------------------------------------------------
              1. MODEL EXPLAINABILITY
          ------------------------------------------------- */}
          {negativeFactors.length > 0 && (
            <section className="ntc-section-card" aria-labelledby="explainability-title">
              <header className="ntc-section-header">
                <div className="ntc-header-left">
                  <span className="ntc-section-kicker">MODEL EXPLAINABILITY</span>
                  <h2 id="explainability-title" className="ntc-section-title">
                    Why this result?
                  </h2>
                  <p className="ntc-section-subtitle">
                    The model identified a few factors that had the strongest influence on this assessment.
                  </p>
                </div>
              </header>

              <div className="ntc-accordion-list">
                {negativeFactors.map((factor, idx) => {
                  const isExpanded = !!expandedNegative[idx];
                  return (
                    <div
                      key={`neg-${factor.feature}-${idx}`}
                      className={`ntc-accordion-item ${isExpanded ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="ntc-accordion-trigger"
                        onClick={() => toggleNegative(idx)}
                        aria-expanded={isExpanded}
                      >
                        <div className="ntc-trigger-main">
                          <div className="ntc-feature-name">{factor.feature_name}</div>
                          <div className="ntc-influence-tag negative">
                            {factor.influence}
                          </div>
                          <div className="ntc-applicant-val">
                            Your value: <strong>{factor.applicant_value}</strong>
                          </div>
                        </div>
                        <span className={`ntc-chevron ${isExpanded ? "rotated" : ""}`} aria-hidden="true">
                          ›
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ntc-accordion-body">
                          <div className="ntc-matters-kicker">WHY THIS MATTERS</div>
                          <p>{factor.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* -------------------------------------------------
              2. WHAT WORKED IN YOUR FAVOR
          ------------------------------------------------- */}
          {positiveFactors.length > 0 && (
            <section className="ntc-section-card" aria-labelledby="positive-factors-title">
              <header className="ntc-section-header">
                <div className="ntc-header-left">
                  <span className="ntc-section-kicker positive-kicker">
                    WHAT WORKED IN YOUR FAVOR
                  </span>
                  <p id="positive-factors-title" className="ntc-section-subtitle positive-subtitle">
                    Some parts of your application supported the assessment.
                  </p>
                </div>
              </header>

              <div className="ntc-accordion-list">
                {positiveFactors.map((factor, idx) => {
                  const isExpanded = !!expandedPositive[idx];
                  return (
                    <div
                      key={`pos-${factor.feature}-${idx}`}
                      className={`ntc-accordion-item ${isExpanded ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="ntc-accordion-trigger"
                        onClick={() => togglePositive(idx)}
                        aria-expanded={isExpanded}
                      >
                        <div className="ntc-trigger-main">
                          <div className="ntc-feature-name">{factor.feature_name}</div>
                          <div className="ntc-influence-tag positive">
                            {factor.influence}
                          </div>
                          <div className="ntc-applicant-val">
                            Your value: <strong>{factor.applicant_value}</strong>
                          </div>
                        </div>
                        <span className={`ntc-chevron ${isExpanded ? "rotated" : ""}`} aria-hidden="true">
                          ›
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ntc-accordion-body">
                          <div className="ntc-matters-kicker">WHY THIS MATTERS</div>
                          <p>{factor.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* -------------------------------------------------
              3. PERSONALIZED ACTION PLAN
          ------------------------------------------------- */}
          {actionPlan.length > 0 && (
            <section className="ntc-section-card action-plan-card" aria-labelledby="action-plan-title">
              <header className="ntc-section-header">
                <div className="ntc-header-left">
                  <span className="ntc-section-kicker action-kicker">
                    PERSONALIZED ACTION PLAN
                  </span>
                  <h2 id="action-plan-title" className="ntc-section-title">
                    How can I improve my eligibility?
                  </h2>
                  <p className="ntc-section-subtitle">
                    Here are the areas that may be worth working on based on the factors that influenced this assessment.
                  </p>
                </div>
              </header>

              <div className="ntc-action-list">
                {actionPlan.map((item, idx) => {
                  const isExpanded = !!expandedAction[idx];
                  return (
                    <div
                      key={`action-${item.feature}-${idx}`}
                      className={`ntc-action-item ${isExpanded ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="ntc-action-trigger"
                        onClick={() => toggleAction(idx)}
                        aria-expanded={isExpanded}
                      >
                        <div className="ntc-action-badge">{item.step}</div>
                        <div className="ntc-action-headings">
                          <div className="ntc-action-topic">{item.title}</div>
                          <div className="ntc-action-summary">{item.action_title}</div>
                        </div>
                        <span className={`ntc-chevron ${isExpanded ? "rotated" : ""}`} aria-hidden="true">
                          ›
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ntc-action-body">
                          <p className="ntc-rec-text">{item.recommendation}</p>
                          {item.details && item.details.length > 0 && (
                            <ul className="ntc-details-list">
                              {item.details.map((detail, dIdx) => (
                                <li key={dIdx}>{detail}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* -------------------------------------------------
              4. IMPORTANT NOTICE
          ------------------------------------------------- */}
          <section className="ntc-notice-box" aria-label="Important Notice">
            <div className="ntc-notice-header">
              <span className="ntc-notice-icon">i</span>
              <strong>IMPORTANT NOTICE</strong>
            </div>
            <p>
              This assessment is an informational tool based on statistical modeling and your provided inputs. It does not constitute a formal loan offer, credit commitment, or guarantee of approval by any financial institution.
            </p>
          </section>
        </>
      ) : (
        /* =====================================================
            STANDARD LOAN ASSESSMENT (EXISTING FLOW UNCHANGED)
        ===================================================== */
        <>
          <div className="insights-panel">
            <header>
              <span>✦</span>
              <div>
                <p>
                  {isApproved ? "Application insights" : "How you can improve"}
                </p>
                <small>
                  Personalized recommendations from your model assessment
                </small>
              </div>
            </header>

            <div className="suggestions-list">
              {result.suggestions.map((suggestion: string, index: number) => (
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
                  <p id="next-steps-title">
                    A practical plan for your next application
                  </p>
                  <small>
                    General guidance to help you prepare before you apply again
                  </small>
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
        </>
      )}

      {/* =====================================================
          RESET
      ===================================================== */}
      <button
        type="button"
        className="reset-button"
        onClick={onReset}
      >
        ↻ Check another application
      </button>
    </section>
  );
}