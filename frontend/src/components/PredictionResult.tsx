import type { CSSProperties } from "react";

import type {
  PredictionResponse,
  NTCPredictionResponse,
} from "../types/loan";

interface Props {
  result: PredictionResponse | NTCPredictionResponse;
  onReset: () => void;
}

function isNTCResult(
  result: PredictionResponse | NTCPredictionResponse
): result is NTCPredictionResponse {
  return "shap_explanation" in result;
}

function formatFeatureName(feature: string): string {
  return feature
    .replace("remainder__", "")
    .replace("categorical__", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PredictionResult({
  result,
  onReset,
}: Props) {
  const approved =
    result.approved_probability * 100;

  const rejected =
    result.rejected_probability * 100;

  const isApproved =
    result.prediction === "Approved";

  const decisionProbability =
    isApproved ? approved : rejected;

  return (
    <section
      className={`result-page ${
        isApproved
          ? "result-approved"
          : "result-rejected"
      }`}
    >

      {/* =====================================================
          MODEL PREDICTION
      ===================================================== */}

      <div className="decision-card">

        <div className="result-kicker">
          MODEL PREDICTION
        </div>

        <div
          className="decision-icon"
          aria-hidden="true"
        >
          {isApproved ? "✓" : "×"}
        </div>

        <h1>
          Loan eligibility result
        </h1>

        <strong className="decision-title">
          {isApproved
            ? "LIKELY ELIGIBLE"
            : "PREDICTED NOT ELIGIBLE"}
        </strong>

        <p>
          {isApproved
            ? "Based on the information provided, the model estimates a strong likelihood of loan eligibility."
            : "Based on the information provided, the model estimates a lower likelihood of loan eligibility right now."}
        </p>

        <small>
          This is a model assessment, not a lender
          decision or guarantee of bank approval.
        </small>

      </div>


      {/* =====================================================
          PROBABILITIES
      ===================================================== */}

      <div className="probability-panel">

        <div className="probability-side approval-side">

          <span>
            Approval probability
          </span>

          <strong>
            {approved.toFixed(2)}%
          </strong>

          <div className="probability-bar">
            <i
              style={{
                width: `${approved}%`,
              }}
            />
          </div>

        </div>


        <div
          className="probability-ring"
          style={
            {
              "--decision-progress":
                `${decisionProbability * 3.6}deg`,
            } as CSSProperties
          }
        >
          <div>

            <strong>
              {decisionProbability.toFixed(1)}%
            </strong>

            <span>
              estimated
            </span>

          </div>
        </div>


        <div className="probability-side rejection-side">

          <span>
            Rejection probability
          </span>

          <strong>
            {rejected.toFixed(2)}%
          </strong>

          <div className="probability-bar">
            <i
              style={{
                width: `${rejected}%`,
              }}
            />
          </div>

        </div>

      </div>


      {/* =====================================================
          SHAP EXPLANATION
          ONLY FOR NTC
      ===================================================== */}

      {isNTCResult(result) &&
        result.shap_explanation.length > 0 && (

          <section
            className="insights-panel"
            aria-labelledby="shap-title"
          >

            <header>

              <span>
                ✦
              </span>

              <div>

                <p id="shap-title">
                  Why the model made this prediction
                </p>

                <small>
                  Feature-level explanation of the
                  New-To-Credit model prediction
                </small>

              </div>

            </header>


            <div className="suggestions-list">

              {result.shap_explanation
                .slice(0, 10)
                .map(
                  (
                    item: {
                      feature: string;
                      impact: number;
                    },
                    index: number
                  ) => {

                    const positive =
                      item.impact >= 0;

                    return (
                      <div
                        className="suggestion-item"
                        style={{
                          animationDelay:
                            `${index * 70}ms`,
                        }}
                        key={`${item.feature}-${index}`}
                      >

                        <span>
                          {positive
                            ? "↑"
                            : "↓"}
                        </span>

                        <p>

                          <strong>
                            {formatFeatureName(
                              item.feature
                            )}
                          </strong>

                          {" — "}

                          {positive
                            ? "supports the prediction"
                            : "works against the prediction"}

                          {" ("}

                          {positive
                            ? "+"
                            : ""}

                          {item.impact.toFixed(3)}

                          {")"}

                        </p>

                      </div>
                    );
                  }
                )}

            </div>

          </section>

        )}


      {/* =====================================================
          SUGGESTIONS
      ===================================================== */}

      <div className="insights-panel">

        <header>

          <span>
            ✦
          </span>

          <div>

            <p>
              {isApproved
                ? "Application insights"
                : "How you can improve"}
            </p>

            <small>
              Personalized recommendations from
              your model assessment
            </small>

          </div>

        </header>


        <div className="suggestions-list">

          {result.suggestions.map(
            (
              suggestion: string,
              index: number
            ) => (

              <div
                className="suggestion-item"
                style={{
                  animationDelay:
                    `${index * 90}ms`,
                }}
                key={`${index}-${suggestion}`}
              >

                <span>
                  ✓
                </span>

                <p>
                  {suggestion}
                </p>

              </div>

            )
          )}

        </div>

      </div>


      {/* =====================================================
          REJECTION GUIDE
      ===================================================== */}

      {!isApproved && (

        <section
          className="rejection-guide"
          aria-labelledby="next-steps-title"
        >

          <header>

            <span className="guide-icon">
              ↗
            </span>

            <div>

              <p id="next-steps-title">
                A practical plan for your next application
              </p>

              <small>
                General guidance to help you prepare
                before you apply again
              </small>

            </div>

          </header>


          <div className="guide-grid">

            <article>

              <span>
                01
              </span>

              <h2>
                Strengthen your credit profile
              </h2>

              <p>
                Pay all current EMIs and
                credit-card bills on time,
                keep credit use modest,
                and review your credit report
                for any errors before a future
                application.
              </p>

            </article>


            <article>

              <span>
                02
              </span>

              <h2>
                Make the loan easier to repay
              </h2>

              <p>
                Consider a lower requested
                amount or a longer tenure only
                if the total cost remains
                comfortable. A realistic
                repayment plan can improve
                affordability.
              </p>

            </article>


            <article>

              <span>
                03
              </span>

              <h2>
                Build a stronger application
              </h2>

              <p>
                Keep income records up to date,
                avoid multiple loan applications
                in a short period, and apply once
                your finances better support the
                monthly repayment.
              </p>

            </article>

          </div>


          <p className="guide-note">
            These are general financial education
            tips, not a guarantee of future approval.
          </p>

        </section>

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
