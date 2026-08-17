import { useState } from "react";
import type {
  ActionPlanItem,
  ExplanationFactor,
  LoanApplication,
  NTCApplication,
  NTCPredictionResponse,
  PredictionResponse,
} from "../types/loan";
import { generateLoanAssessmentPdf } from "../utils/pdfGenerator";

interface Props {
  result: PredictionResponse | NTCPredictionResponse;
  initialApplication?: LoanApplication | NTCApplication;
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

export default function PredictionResult({ result, initialApplication, onReset }: Props) {
  const approved = result.approved_probability * 100;
  const rejected = result.rejected_probability * 100;
  const isApproved = result.prediction === "Approved";
  const decisionProbability = isApproved ? approved : rejected;
  const isNTC = initialApplication && 'monthly_expenses' in initialApplication;
  const whatIf = result.loan_amount_analysis;

  const requestedAmount =
    initialApplication?.loan_amount ??
    whatIf?.currentAmount ??
    0;

  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;
  const explanation = result.explanation;
  const [isDownloading, setIsDownloading] = useState(false);

  const pdfApplication: LoanApplication = initialApplication
    ? "credit_score" in initialApplication
      ? (initialApplication as LoanApplication)
      : {
          ...initialApplication,
          credit_score: 650,
        }
    : {
        dependents: 0,
        employment_type: "Private",
        annual_income: 600000,
        credit_score: 750,
        loan_amount: requestedAmount || 1000000,
        loan_tenure: 5,
        education: "Graduate",
      };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      generateLoanAssessmentPdf({ application: pdfApplication, result });
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
          {isApproved ? "LIKELY ELIGIBLE" : "LIKELY NOT ELIGIBLE"}
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
      
      {/* 2.5 NTC Financial Summary */}
      {isNTC && 'monthly_income' in result && (
        <section className="ntc-financial-summary" style={{ marginTop: '24px', padding: '24px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <header style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>FINANCIAL PROFILE</span>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--navy)', marginTop: '4px' }}>Financial Summary & Assessment</h2>
          </header>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Annual Income</small>
              <strong>{formatINR(initialApplication.annual_income)}</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Monthly Income</small>
              <strong>{formatINR((result as NTCPredictionResponse).monthly_income)}</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Monthly Expenses</small>
              <strong>{formatINR(initialApplication.monthly_expenses)}</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Disposable Monthly Income</small>
              <strong style={{ color: (result as NTCPredictionResponse).disposable_income < 0 ? 'var(--danger)' : 'var(--success)' }}>
                {(result as NTCPredictionResponse).disposable_income < 0 ? '-' : ''}{formatINR(Math.abs((result as NTCPredictionResponse).disposable_income))}
              </strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Expense Ratio</small>
              <strong>{((result as NTCPredictionResponse).expense_ratio).toFixed(1)}%</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Loan Requested</small>
              <strong>{formatINR(requestedAmount)}</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Repayment Tenure</small>
              <strong>{initialApplication.loan_tenure} years</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Employment Type</small>
              <strong>{initialApplication.employment_type}</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Dependents</small>
              <strong>{initialApplication.dependents}</strong>
            </div>
            {'education' in initialApplication && (
              <div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Education</small>
                <strong>{initialApplication.education}</strong>
              </div>
            )}
          </div>
          
          <div style={{ padding: '16px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${(result as NTCPredictionResponse).disposable_income < 0 ? 'var(--danger)' : 'var(--primary)'}` }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--navy)' }}>Financial Assessment</strong>
            <p style={{ color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
              Monthly expenses represent approximately <strong>{((result as NTCPredictionResponse).expense_ratio).toFixed(1)}%</strong> of monthly income, leaving <strong>{((result as NTCPredictionResponse).disposable_income < 0 ? '-' : '') + formatINR(Math.abs((result as NTCPredictionResponse).disposable_income))}</strong> of estimated disposable income.
              {(result as NTCPredictionResponse).disposable_income < 0 && ' WARNING: Your estimated monthly expenses exceed your monthly income. This indicates severe financial stress and high repayment risk.'}
            </p>
          </div>
        </section>
      )}

      {/* 2.6 Estimated Loan Capacity / Maximum Predicted Eligible Loan Amount */}
      {(() => {
        const reqAmount =
          result.requested_loan_amount ??
          initialApplication?.loan_amount ??
          whatIf?.currentAmount ??
          0;

        const maxEligibleAmount =
          result.maximum_eligible_amount !== undefined
            ? result.maximum_eligible_amount
            : whatIf?.recommendedAmount !== undefined
            ? whatIf.recommendedAmount
            : isApproved
            ? reqAmount
            : null;

        const maxEligibleProb =
          result.max_eligible_approved_probability !== undefined && result.max_eligible_approved_probability > 0
            ? (result.max_eligible_approved_probability * 100).toFixed(1)
            : whatIf?.recommendedApprovalProbability !== undefined && whatIf.recommendedApprovalProbability > 0
            ? whatIf.recommendedApprovalProbability.toFixed(1)
            : isApproved
            ? approved.toFixed(1)
            : "0.0";

        let contextMsg = result.max_loan_message;
        if (!contextMsg) {
          if (isApproved) {
            contextMsg = `Based on your current applicant profile, the existing ML model predicts approval for your requested amount of ${formatINR(reqAmount)}.`;
          } else if (maxEligibleAmount !== null) {
            contextMsg = `Your requested amount is ${formatINR(reqAmount)}, but based on your current applicant profile, the existing ML model predicts approval up to approximately ${formatINR(maxEligibleAmount)}.`;
          } else {
            contextMsg = "Based on your current applicant profile, the existing ML model does not predict loan approval for any evaluated loan amount up to your requested amount.";
          }
        }

        return (
          <section className="max-loan-panel" aria-labelledby="capacity-title" style={{ marginTop: '24px' }}>
            <header className="max-loan-header">
              <div className="max-loan-icon" aria-hidden="true">₹</div>
              <div>
                <span className="max-loan-eyebrow">MODEL CAPACITY ESTIMATION</span>
                <h2 id="capacity-title">Estimated Loan Capacity</h2>
              </div>
            </header>

            <div className="max-loan-grid">
              <div className="max-loan-metric-card requested-metric">
                <span className="metric-label">Your Requested Amount</span>
                <strong className="metric-value">{formatINR(reqAmount)}</strong>
                <span className="prob-pill">
                  Status: {result.prediction} ({decisionProbability.toFixed(1)}%)
                </span>
              </div>

              <div className="max-loan-metric-card eligible-metric">
                <span className="metric-label">Maximum Predicted Eligible Amount</span>
                <strong
                  className="metric-value"
                  style={{ fontSize: maxEligibleAmount === null ? '1.25rem' : undefined }}
                >
                  {maxEligibleAmount !== null ? formatINR(maxEligibleAmount) : "No eligible amount found"}
                </strong>
                {maxEligibleAmount !== null && (
                  <span className="prob-pill">
                    Approval probability at this amount: {maxEligibleProb}%
                  </span>
                )}
              </div>

              {maxEligibleAmount !== null && maxEligibleAmount > reqAmount && isApproved && (
                <div
                  className="max-loan-metric-card eligible-metric"
                  style={{ backgroundColor: '#f0fdf4', borderLeftColor: '#10b981' }}
                >
                  <span className="metric-label" style={{ color: '#047857' }}>Additional Borrowing Capacity</span>
                  <strong className="metric-value" style={{ color: '#059669' }}>
                    +{formatINR(maxEligibleAmount - reqAmount)}
                  </strong>
                  <span className="prob-pill" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                    Higher Eligible Limit
                  </span>
                </div>
              )}

              {maxEligibleAmount !== null && maxEligibleAmount < reqAmount && (
                <div
                  className="max-loan-metric-card requested-metric"
                  style={{ backgroundColor: '#fff8f1', borderLeftColor: '#f59e0b' }}
                >
                  <span className="metric-label" style={{ color: '#b45309' }}>Suggested Reduction</span>
                  <strong className="metric-value" style={{ color: '#d97706' }}>
                    -{formatINR(reqAmount - maxEligibleAmount)}
                  </strong>
                  <span className="prob-pill" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                    To Reach Approval
                  </span>
                </div>
              )}
            </div>

            <div className="max-loan-comparison-box comparison-within">
              <p>{contextMsg}</p>
            </div>

            {/* Scenario Table (when scenarios available) */}
            {whatIf && whatIf.scenarios && whatIf.scenarios.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: 'var(--navy)', fontSize: '0.875rem' }}>
                  Tested Loan Amounts Analysis
                </strong>
                <div style={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ padding: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Loan Amount</th>
                        <th style={{ padding: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Model Assessment</th>
                        <th style={{ padding: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Approval Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whatIf.scenarios.map((s, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: s.loanAmount === reqAmount ? 'var(--surface)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px', fontWeight: s.loanAmount === reqAmount ? 600 : 400, color: 'var(--text-body)' }}>
                            {formatINR(s.loanAmount)} {s.loanAmount === reqAmount && "(Requested)"}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: s.status === 'ELIGIBLE' ? '#DDF4E4' : '#FDE8E4',
                                color: s.status === 'ELIGIBLE' ? '#1A6334' : '#992B2B',
                              }}
                            >
                              {s.status === 'ELIGIBLE' ? 'Favorable' : 'Not Favorable'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(s.approvalProbability, 100)}%`,
                                  height: '100%',
                                  backgroundColor: s.status === 'ELIGIBLE' ? 'var(--forest-green)' : 'var(--terracotta)',
                                }}
                              />
                            </div>
                            <span style={{ width: '40px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                              {s.approvalProbability.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <small className="max-loan-disclaimer" style={{ display: 'block', marginTop: '16px' }}>
              This is a model-predicted result based on the provided inputs, not a guaranteed bank loan approval.
            </small>
          </section>
        );
      })()}
      {/* 4. Rejection Explainability Section */}
      {!isApproved && explanation && (
        <>
          {/* SECTION 1: WHY THIS RESULT? */}
          <section className="explainability-section" aria-labelledby="why-result-heading">
            <header className="explainability-header">
              <span className="explain-icon">◔</span>
              <div>
                <span className="explain-eyebrow">ASSESSMENT CONTEXT</span>
                <h2 id="why-result-heading">Factors Considered in This Assessment</h2>
                <p>
                  The machine learning model evaluated your application and
                  identified the following primary factors that influenced this
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
                        <span className="accordion-factor-label">{factor.label}</span>
                      </div>

                      <div className="accordion-trigger-right">
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

      {/* 6. End of Flow: Download Assessment Report + Check Another Application */}
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
