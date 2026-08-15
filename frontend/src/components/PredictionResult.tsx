import { useState, useEffect, useMemo } from "react";
import type {
  PredictionResponse,
  NTCPredictionResponse,
  LoanApplication,
  ExplanationFactor,
  ActionPlanItem,
} from "../types/loan";
import { predictLoan } from "../services/api";
import { generateLoanAssessmentPdf } from "../utils/pdfGenerator";

interface Props {
  result: PredictionResponse | NTCPredictionResponse;
  initialApplication?: LoanApplication;
  onReset: () => void;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`accordion-chevron ${expanded ? "expanded" : ""}`}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
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
  const explanation = result.explanation;

  const [isDownloading, setIsDownloading] = useState(false);

  const ntcFactors = isNTCResult(result)
    ? [...result.shap_explanation]
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
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

  const isInitial =
    !!initialApplication &&
    simulatedAmount === initialApplication.loan_amount &&
    simulatedTenure === initialApplication.loan_tenure;

  const simulatedResult = useMemo(() => {
    if (
      simulationResponse?.amount === simulatedAmount &&
      simulationResponse?.tenure === simulatedTenure
    ) {
      return simulationResponse.result;
    }
    return null;
  }, [simulationResponse, simulatedAmount, simulatedTenure]);

  const activeSimulatedResult = simulatedResult || (isInitial ? result : null);
  const simApproved = activeSimulatedResult
    ? activeSimulatedResult.approved_probability * 100
    : approved;
  const diff = simApproved - approved;

  useEffect(() => {
    if (!initialApplication || isInitial) return;

    const timer = setTimeout(async () => {
      setSimulating(true);
      try {
        const res = await predictLoan({
          ...initialApplication,
          loan_amount: simulatedAmount,
          loan_tenure: simulatedTenure,
        });
        setSimulationResponse({
          result: res,
          amount: simulatedAmount,
          tenure: simulatedTenure,
        });
      } catch (e) {
        console.error("Simulation failed", e);
      } finally {
        setSimulating(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [simulatedAmount, simulatedTenure, initialApplication, isInitial]);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      generateLoanAssessmentPdf({ application: initialApplication, result });
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Single-open accordion state for each section
  const [expandedNegativeIndex, setExpandedNegativeIndex] = useState<number | null>(null);
  const [expandedPositiveIndex, setExpandedPositiveIndex] = useState<number | null>(null);
  const [expandedActionIndex, setExpandedActionIndex] = useState<number | null>(null);
  const [expandedApprovedPositiveIndex, setExpandedApprovedPositiveIndex] = useState<number | null>(null);

  const toggleNegative = (index: number) => {
    setExpandedNegativeIndex((prev) => (prev === index ? null : index));
  };

  const togglePositive = (index: number) => {
    setExpandedPositiveIndex((prev) => (prev === index ? null : index));
  };

  const toggleAction = (index: number) => {
    setExpandedActionIndex((prev) => (prev === index ? null : index));
  };

  const toggleApprovedPositive = (index: number) => {
    setExpandedApprovedPositiveIndex((prev) => (prev === index ? null : index));
  };

  const getImpactBadgeClass = (level: string, direction: string) => {
    if (direction === "positive") return "impact-badge-positive";
    if (level.includes("Strong")) return "impact-badge-negative-strong";
    if (level.includes("Moderate")) return "impact-badge-negative-mod";
    return "impact-badge-negative-low";
  };

  const getImpactDot = (direction: string, level: string) => {
    if (direction === "positive") return "🟢";
    if (level.includes("Strong")) return "🔴";
    if (level.includes("Moderate")) return "🟠";
    return "🟡";
  };

  return (
    <section className={`result-page ${isApproved ? "result-approved" : "result-rejected"}`}>
      {/* 1. Main Decision Card */}
      <div className="decision-card">
        <div className="result-kicker">MODEL PREDICTION</div>
        <div className="decision-icon" aria-hidden="true">
          {isApproved ? "✓" : "✕"}
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
        <small>
          This is a model assessment, not a lender decision or guarantee of bank approval.
        </small>
      </div>

      {/* 2. Probability Panel */}
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

      {/* 3. Rejection Explainability Section */}
      {!isApproved && explanation && (
        <>
          {/* SECTION 1: WHY THIS RESULT? */}
          <section className="explainability-section" aria-labelledby="why-result-heading">
            <header className="explainability-header">
              <span className="explain-icon">◔</span>
              <div>
                <span className="explain-eyebrow">MODEL EXPLAINABILITY</span>
                <h2 id="why-result-heading">Why this result?</h2>
                <p>
                  The model identified a few factors that had the strongest influence on this
                  assessment.
                </p>
              </div>
            </header>

            {/* Top Negative Contributing Factors — Collapsible Accordion */}
            <div
              className="accordion-group"
              role="region"
              aria-label="Negative contributing factors"
            >
              {explanation.top_negative_factors.map((factor: ExplanationFactor, index: number) => {
                const isOpen = expandedNegativeIndex === index;
                const accordionId = `negative-factor-${index}`;
                const panelId = `negative-panel-${index}`;

                return (
                  <article
                    className={`accordion-card negative-accordion ${isOpen ? "is-open" : ""}`}
                    key={`${index}-${factor.feature}`}
                  >
                    <button
                      type="button"
                      className="accordion-trigger"
                      onClick={() => toggleNegative(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      id={accordionId}
                    >
                      <div className="accordion-trigger-left">
                        <span className="impact-dot" aria-hidden="true">
                          {getImpactDot(factor.impact_direction, factor.impact_level)}
                        </span>
                        <span className="accordion-factor-label">{factor.label}</span>
                      </div>

                      <div className="accordion-trigger-right">
                        <span
                          className={`impact-badge ${getImpactBadgeClass(
                            factor.impact_level,
                            factor.impact_direction
                          )}`}
                        >
                          {factor.impact_level}
                        </span>
                        <span className="accordion-user-pill">
                          <span className="pill-muted">Your value:</span> {factor.user_value}
                        </span>
                        <ChevronIcon expanded={isOpen} />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        className="accordion-body"
                        id={panelId}
                        role="region"
                        aria-labelledby={accordionId}
                      >
                        <div className="accordion-content-inner">
                          <div className="expanded-value-box">
                            <span className="val-label">Your value</span>
                            <strong className="val-number">{factor.user_value}</strong>
                          </div>

                          <div className="expanded-explanation-box">
                            <span className="exp-label">WHY THIS MATTERS</span>
                            <p className="exp-text">{factor.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* SECTION 2: WHAT WORKED IN YOUR FAVOR */}
            {explanation.positive_factors.length > 0 && (
              <div className="positive-factors-wrapper">
                <header className="positive-factors-header">
                  <span className="positive-icon">✓</span>
                  <div>
                    <h3>What worked in your favor</h3>
                    <small>Some parts of your application supported the assessment.</small>
                  </div>
                </header>

                <div className="accordion-group" role="region" aria-label="Positive factors">
                  {explanation.positive_factors.map((factor: ExplanationFactor, index: number) => {
                    const isOpen = expandedPositiveIndex === index;
                    const accordionId = `pos-factor-${index}`;
                    const panelId = `pos-panel-${index}`;

                    return (
                      <article
                        className={`accordion-card positive-accordion ${isOpen ? "is-open" : ""}`}
                        key={`pos-${index}-${factor.feature}`}
                      >
                        <button
                          type="button"
                          className="accordion-trigger"
                          onClick={() => togglePositive(index)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          id={accordionId}
                        >
                          <div className="accordion-trigger-left">
                            <span className="impact-dot" aria-hidden="true">
                              🟢
                            </span>
                            <span className="accordion-factor-label">{factor.label}</span>
                          </div>

                          <div className="accordion-trigger-right">
                            <span
                              className={`impact-badge ${getImpactBadgeClass(
                                factor.impact_level,
                                factor.impact_direction
                              )}`}
                            >
                              {factor.impact_level}
                            </span>
                            <span className="accordion-user-pill">
                              <span className="pill-muted">Your value:</span> {factor.user_value}
                            </span>
                            <ChevronIcon expanded={isOpen} />
                          </div>
                        </button>

                        {isOpen && (
                          <div
                            className="accordion-body"
                            id={panelId}
                            role="region"
                            aria-labelledby={accordionId}
                          >
                            <div className="accordion-content-inner">
                              <div className="expanded-value-box">
                                <span className="val-label">Your value</span>
                                <strong className="val-number">{factor.user_value}</strong>
                              </div>

                              <div className="expanded-explanation-box">
                                <span className="exp-label">WHY THIS MATTERS</span>
                                <p className="exp-text">{factor.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3: PERSONALIZED ACTION PLAN */}
          {explanation.action_plan.length > 0 && (
            <section className="action-plan-section" aria-labelledby="action-plan-heading">
              <header className="action-plan-header">
                <span className="plan-icon">↗</span>
                <div>
                  <span className="explain-eyebrow">PERSONALIZED ACTION PLAN</span>
                  <h2 id="action-plan-heading">How can I improve my eligibility?</h2>
                  <p>
                    Here are the areas that may be worth working on based on the factors that
                    influenced this assessment.
                  </p>
                </div>
              </header>

              <div
                className="accordion-group action-accordion-group"
                role="region"
                aria-label="Personalized action plan items"
              >
                {explanation.action_plan.map((item: ActionPlanItem, index: number) => {
                  const isOpen = expandedActionIndex === index;
                  const accordionId = `action-item-${item.priority}`;
                  const panelId = `action-panel-${item.priority}`;

                  return (
                    <article
                      className={`accordion-card action-accordion ${isOpen ? "is-open" : ""}`}
                      key={`action-${item.priority}`}
                    >
                      <button
                        type="button"
                        className="accordion-trigger action-trigger"
                        onClick={() => toggleAction(index)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        id={accordionId}
                      >
                        <div className="action-trigger-left">
                          <span className="priority-badge">0{item.priority}</span>
                          <div className="action-trigger-text">
                            <strong className="action-factor-title">{item.factor_label}</strong>
                            <span className="action-factor-subtitle">
                              {item.subtitle || item.title}
                            </span>
                          </div>
                        </div>

                        <div className="accordion-trigger-right">
                          <ChevronIcon expanded={isOpen} />
                        </div>
                      </button>

                      {isOpen && (
                        <div
                          className="accordion-body"
                          id={panelId}
                          role="region"
                          aria-labelledby={accordionId}
                        >
                          <div className="action-details-content">
                            <h3 className="action-detail-title">{item.title}</h3>

                            <div className="action-reason-box">
                              <span className="box-kicker">WHY THIS MATTERS</span>
                              <p>{item.reason}</p>
                            </div>

                            <div className="action-recommendation-box">
                              <span className="box-kicker">RECOMMENDED ACTION</span>
                              <p>{item.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Educational Disclaimer */}
          <aside className="model-disclaimer-box" aria-label="Model Guidance Disclaimer">
            <div className="disclaimer-header">
              <span className="disclaimer-icon">ℹ</span>
              <strong>IMPORTANT NOTICE</strong>
            </div>
            <p>{explanation.disclaimer}</p>
          </aside>
        </>
      )}

      {/* Fallback Rejection Guide (if no detailed explanation object) */}
      {!isApproved && !explanation && (
        <>
          <div className="insights-panel">
            <header>
              <span>✦</span>
              <div>
                <p>How you can improve</p>
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
                  Pay all current EMIs and credit-card bills on time, keep credit use modest, and
                  review your credit report for any errors before a future application.
                </p>
              </article>
              <article>
                <span>02</span>
                <h2>Make the loan easier to repay</h2>
                <p>
                  Consider a lower requested amount or a longer tenure only if the total cost
                  remains comfortable. A realistic repayment plan can improve affordability.
                </p>
              </article>
              <article>
                <span>03</span>
                <h2>Build a stronger application</h2>
                <p>
                  Keep income records up to date, avoid multiple loan applications in a short period,
                  and apply once your finances better support the monthly repayment.
                </p>
              </article>
            </div>
            <p className="guide-note">
              These are general financial education tips, not a guarantee of future approval.
            </p>
          </section>
        </>
      )}

      {/* 4. Approved View Insights */}
      {isApproved && (
        <div className="insights-panel">
          <header>
            <span>✦</span>
            <div>
              <p>Application insights</p>
              <small>Key strengths supporting your model assessment</small>
            </div>
          </header>

          {explanation && explanation.positive_factors.length > 0 && (
            <div className="accordion-group" style={{ marginBottom: "18px" }}>
              {explanation.positive_factors.map((factor: ExplanationFactor, index: number) => {
                const isOpen = expandedApprovedPositiveIndex === index;
                const accordionId = `app-pos-${index}`;
                const panelId = `app-pos-panel-${index}`;

                return (
                  <article
                    className={`accordion-card positive-accordion ${isOpen ? "is-open" : ""}`}
                    key={`app-pos-${index}-${factor.feature}`}
                  >
                    <button
                      type="button"
                      className="accordion-trigger"
                      onClick={() => toggleApprovedPositive(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      id={accordionId}
                    >
                      <div className="accordion-trigger-left">
                        <span className="impact-dot" aria-hidden="true">
                          🟢
                        </span>
                        <span className="accordion-factor-label">{factor.label}</span>
                      </div>

                      <div className="accordion-trigger-right">
                        <span className="impact-badge impact-badge-positive">
                          {factor.impact_level}
                        </span>
                        <span className="accordion-user-pill">
                          <span className="pill-muted">Your value:</span> {factor.user_value}
                        </span>
                        <ChevronIcon expanded={isOpen} />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        className="accordion-body"
                        id={panelId}
                        role="region"
                        aria-labelledby={accordionId}
                      >
                        <div className="accordion-content-inner">
                          <div className="expanded-value-box">
                            <span className="val-label">Your value</span>
                            <strong className="val-number">{factor.user_value}</strong>
                          </div>

                          <div className="expanded-explanation-box">
                            <span className="exp-label">WHY THIS MATTERS</span>
                            <p className="exp-text">{factor.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

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

          {explanation && (
            <aside className="model-disclaimer-box" style={{ marginTop: "18px" }}>
              <div className="disclaimer-header">
                <span className="disclaimer-icon">ℹ</span>
                <strong>IMPORTANT NOTICE</strong>
              </div>
              <p>{explanation.disclaimer}</p>
            </aside>
          )}
        </div>
      )}

      {/* 5. NTC Insights Section (for New-To-Credit applicants) */}
      {isNTCResult(result) && (
        <section className="insights-panel" aria-labelledby="ntc-insights-title">
          <header>
            <span className="guide-icon">✦</span>
            <div>
              <p id="ntc-insights-title">Why the model made this prediction</p>
              <small>These are the strongest factors that influenced this NTC assessment.</small>
            </div>
          </header>

          <div className="insights-grid">
            {ntcFactors.map((factor) => (
              <article key={factor.feature} className="insight-card">
                <span>{factor.impact >= 0 ? "↑" : "↓"}</span>
                <div>
                  <strong>
                    {factor.feature.replace("remainder__", "").replaceAll("_", " ")}
                  </strong>
                  <small>
                    {factor.impact >= 0 ? "Positive influence" : "Negative influence"}
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
            SHAP values explain the direction and relative strength of each feature's contribution.
            They are model explanations, not guarantees of approval or rejection.
          </p>
        </section>
      )}

      {/* 6. Interactive What-If Simulator */}
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
                  <strong>₹{simulatedAmount.toLocaleString("en-IN")}</strong>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={simulatedAmount}
                  onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                  className="custom-range simulator-range"
                  style={
                    {
                      "--range-progress": `${
                        ((simulatedAmount - 10000) / (1000000 - 10000)) * 100
                      }%`,
                    } as React.CSSProperties
                  }
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
                  onChange={(e) => setSimulatedTenure(Number(e.target.value))}
                  className="custom-range simulator-range"
                  style={
                    {
                      "--range-progress": `${((simulatedTenure - 6) / (60 - 6)) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            <div className={`simulator-impact ${simulating ? "simulating" : ""}`}>
              <span>Simulated Approval</span>
              <strong className={simApproved > 50 ? "impact-good" : "impact-bad"}>
                {simApproved.toFixed(1)}%
              </strong>
              {diff !== 0 && (
                <div className={`impact-diff ${diff > 0 ? "diff-up" : "diff-down"}`}>
                  {diff > 0 ? "↗" : "↘"} {Math.abs(diff).toFixed(1)}%{" "}
                  {diff > 0 ? "improved" : "decreased"}
                </div>
              )}
              {simulating && <small className="sim-loading">Calculating...</small>}
            </div>
          </div>
        </section>
      )}

      {/* 7. End of Flow: Download Assessment Report + Check Another Application */}
      <div className="result-actions-bar">
        <button
          type="button"
          className="download-report-button"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{isDownloading ? "Preparing Report..." : "Download Assessment Report"}</span>
        </button>

        <button type="button" className="reset-button" onClick={onReset}>
          ↻ Check another application
        </button>
      </div>
    </section>
  );
}
