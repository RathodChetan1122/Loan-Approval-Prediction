import type {
  PredictionResponse,
} from "../types/loan";

interface PredictionResultProps {
  result: PredictionResponse | null;

  onReset: () => void;
}

export default function PredictionResult({
  result,
  onReset,
}: PredictionResultProps) {
  if (!result) {
    return null;
  }

  const approvedPercentage =
    result.approved_probability *
    100;

  const rejectedPercentage =
    result.rejected_probability *
    100;

  const isApproved =
    result.prediction ===
    "Approved";

  const percentage =
    isApproved
      ? approvedPercentage
      : rejectedPercentage;

  return (
    <section
      className={`result-page ${
        isApproved
          ? "result-approved"
          : "result-rejected"
      }`}
    >
      {/* =====================================================
          DECISION HERO
      ====================================================== */}

      <div className="decision-card">
        <div className="decorative-orb orb-one" />
        <div className="decorative-orb orb-two" />

        {isApproved && (
          <div className="confetti">
            <span>◆</span>
            <span>◆</span>
            <span>•</span>
            <span>◆</span>
            <span>•</span>
            <span>◆</span>
            <span>◆</span>
            <span>•</span>
          </div>
        )}

        <div className="profile-badge">
          <span className="profile-badge-icon">
            {isApproved
              ? "♛"
              : "!"}
          </span>

          <span>
            {isApproved
              ? "Strong Profile"
              : "Needs Attention"}
          </span>
        </div>

        <div className="decision-icon">
          {isApproved ? (
            <svg
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="32"
                fill="white"
              />

              <path
                d="M20 32L28 40L45 22"
                stroke="#20B87A"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="32"
                fill="white"
              />

              <path
                d="M22 22L42 42M42 22L22 42"
                stroke="#F05263"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <div className="decision-label">
          <span className="decision-line" />

          <span>
            Loan Decision
          </span>

          <span className="decision-line" />
        </div>

        <h1 className="decision-title">
          {isApproved
            ? "Approved!"
            : "Not Approved"}
        </h1>

        <p className="decision-subtitle">
          {isApproved
            ? "Great news! Your profile looks strong for the loan."
            : "Here are some ways you can strengthen your loan profile."}
        </p>
      </div>


      {/* =====================================================
          PROBABILITY CARD
      ====================================================== */}

      <div className="probability-panel">
        <div className="probability-side approval-side">
          <div className="probability-icon approval-icon">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 24L13 17L18 21L27 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M21 9H27V15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="probability-copy">
            <span>
              Approval Probability
            </span>

            <strong>
              {approvedPercentage.toFixed(
                2
              )}
              %
            </strong>
          </div>

          <div className="probability-bar">
            <span
              style={{
                width: `${approvedPercentage}%`,
              }}
            />
          </div>
        </div>


        {/* ===================================================
            RING
        ==================================================== */}

        <div className="probability-ring-wrapper">
          <div
            className="probability-ring"
            style={{
              background: `conic-gradient(
                #20b87a 0deg,
                #20b87a ${
                  percentage * 3.6
                }deg,
                #e8eef6 ${
                  percentage * 3.6
                }deg,
                #e8eef6 360deg
              )`,
            }}
          >
            <div className="probability-ring-inner">
              <strong>
                {percentage.toFixed(
                  2
                )}
                %
              </strong>
            </div>
          </div>
        </div>


        <div className="probability-side rejection-side">
          <div className="probability-icon rejection-icon">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9L14 16L19 11L27 23"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M22 23H27V18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="probability-copy">
            <span>
              Rejection Probability
            </span>

            <strong>
              {rejectedPercentage.toFixed(
                2
              )}
              %
            </strong>
          </div>

          <div className="probability-bar rejection-bar">
            <span
              style={{
                width: `${rejectedPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>


      {/* =====================================================
          INSIGHTS
      ====================================================== */}

      <div className="insights-panel">
        <div className="insights-header">
          <div className="insights-title-icon">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 5C11.6 5 8 8.5 8 12.8C8 15.6 9.4 17.4 11 19.1C12.2 20.4 13 21.4 13 24H19C19 21.4 19.8 20.4 21 19.1C22.6 17.4 24 15.6 24 12.8C24 8.5 20.4 5 16 5Z"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M13 27H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2>
            {isApproved
              ? "Application Insights"
              : "How You Can Improve"}
          </h2>
        </div>

        <div className="insights-content">
          <div className="suggestions-list">
            {result.suggestions.map(
              (
                suggestion,
                index
              ) => (
                <div
                  className="suggestion-item"
                  key={`${suggestion}-${index}`}
                >
                  <div className="suggestion-check">
                    ✓
                  </div>

                  <p>
                    {suggestion}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="insights-illustration">
            <div className="gauge">
              <div className="gauge-arc" />

              <div className="gauge-needle">
                <span />
              </div>
            </div>

            <div className="coin coin-one" />
            <div className="coin coin-two" />
            <div className="coin coin-three" />
          </div>
        </div>
      </div>


      {/* =====================================================
          ACTION
      ====================================================== */}

      <button
        type="button"
        className="reset-button"
        onClick={onReset}
      >
        <span>←</span>

        Check another application
      </button>
    </section>
  );
}