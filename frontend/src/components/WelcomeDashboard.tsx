import OfficialCibilButton from "./OfficialCibilButton";

interface WelcomeDashboardProps {
  onStart: () => void;
  onKnowScore: () => void;
  onContinueAfterCibil: () => void;
  onOpenCalculator?: () => void;
}

const features = [
  [
    "⌁",
    "Smart eligibility prediction",
    "Understand your predicted eligibility from the financial information you provide.",
  ],
  [
    "◔",
    "CIBIL guidance",
    "Check your score securely with the official CIBIL website when you need it.",
  ],
  [
    "✦",
    "Personalized insights",
    "See model-based probabilities and useful next steps after your assessment.",
  ],
];

export default function WelcomeDashboard({
  onStart,
  onKnowScore,
  onContinueAfterCibil,
  onOpenCalculator,
}: WelcomeDashboardProps) {
  return (
    <>
      {/* HERO */}
      <section className="welcome-hero" id="home">
        <div className="welcome-copy">
          <span className="welcome-eyebrow">
            <i />
            SMART LOAN ELIGIBILITY
          </span>

          <h1>
            Make smarter borrowing decisions.
          </h1>

          <p>
            Analyze your financial profile and
            understand your predicted loan
            eligibility before you apply.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-cta"
              onClick={onStart}
            >
              Check my eligibility
              <span>→</span>
            </button>

            {onOpenCalculator && (
              <button
                type="button"
                className="hero-secondary-cta"
                onClick={onOpenCalculator}
              >
                <span>₹</span>
                Calculate EMI
              </button>
            )}
          </div>

          <p className="hero-note">
            No credit credentials required.
            Your assessment stays in this browser session.
          </p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-score">
            <span>Credit profile</span>
            <strong>720</strong>
            <small>Good standing</small>
          </div>

          <div className="visual-insight">
            <span>✦</span>

            <div>
              <b>Eligibility insights</b>
              <small>Clear next steps, not guarantees</small>
            </div>
          </div>

          <div className="visual-bars">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>


      {/* CREDIT PROFILE */}
      <section
        className="cibil-decision"
        id="credit-guide"
        aria-labelledby="cibil-title"
      >
        <div className="section-copy">
          <span>YOUR CREDIT PROFILE</span>

          <h2 id="cibil-title">
            Let's start with your credit profile
          </h2>

          <p>
            Your CIBIL Score can provide useful context
            for your eligibility estimate. Choose the
            option that best describes your current
            credit situation.
          </p>
        </div>


        {/* SAME TWO-CARD LAYOUT */}
        <div className="cibil-options">

          {/* LEFT CARD - EXISTING CREDIT USER */}
          <button
            type="button"
            className="cibil-choice known-score"
            onClick={onKnowScore}
          >
            <span className="choice-symbol">
              ✓
            </span>

            <strong>
              Yes, I know my score
            </strong>

            <p>
              I'll enter my CIBIL score manually
              in the assessment.
            </p>

            <b>
              Continue to assessment →
            </b>
          </button>


          {/* RIGHT CARD - NEW TO CREDIT */}
          <button
            type="button"
            className="cibil-choice known-score"
            onClick={onContinueAfterCibil}
          >
            <span className="choice-symbol">
              ✦
            </span>

            <strong>
              I'm new to credit
            </strong>

            <p>
              I don't have an established credit
              history or CIBIL score.
            </p>

            <b>
              Start NTC assessment →
            </b>
          </button>

        </div>


        {/* BOTTOM - DON'T KNOW SCORE */}
        <div className="cibil-return">

          <div>
            <strong>
              I don't know my score
            </strong>

            <span>
              Check it securely on the official
              CIBIL website, then return here when
              you're ready.
            </span>
          </div>

          <OfficialCibilButton />

        </div>

      </section>


      {/* FINANCIAL TOOLS */}
      {onOpenCalculator && (
        <section
          className="tools-section"
          id="financial-tools"
          aria-labelledby="tools-title"
        >
          <div className="section-copy">
            <span>FINANCIAL UTILITIES</span>

            <h2 id="tools-title">
              Estimate your monthly commitments
            </h2>

            <p>
              Plan your loan repayment with our
              accurate reducing-balance EMI calculator
              before submitting your application.
            </p>
          </div>

          <div className="tool-banner">

            <div className="tool-banner-content">
              <span
                className="tool-icon"
                aria-hidden="true"
              >
                ₹
              </span>

              <div>
                <h3>
                  Independent Loan EMI Calculator
                </h3>

                <p>
                  Calculate your estimated monthly EMI,
                  total interest payable, and total
                  repayment amount with custom interest
                  rates and flexible tenures.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="tool-cta"
              onClick={onOpenCalculator}
            >
              Open EMI Calculator
              <span>→</span>
            </button>

          </div>
        </section>
      )}


      {/* FEATURES */}
      <section
        className="feature-section"
        id="how-it-works"
        aria-labelledby="feature-title"
      >
        <div className="section-copy">
          <span>BUILT FOR CLARITY</span>

          <h2 id="feature-title">
            Everything you need before applying
          </h2>

          <p>
            A simple, transparent experience designed
            to help you prepare—not to promise a lender
            decision.
          </p>
        </div>

        <div className="feature-grid">
          {features.map(
            ([icon, title, description], index) => (
              <article
                className="feature-card"
                key={title}
                style={{
                  animationDelay:
                    `${index * 80}ms`,
                }}
              >
                <span>{icon}</span>

                <h3>{title}</h3>

                <p>{description}</p>
              </article>
            )
          )}
        </div>
      </section>


      {/* PROCESS */}
      <section
        className="process-section"
        aria-labelledby="process-title"
      >
        <div className="section-copy">
          <span>HOW IT WORKS</span>

          <h2 id="process-title">
            A clear path to your assessment
          </h2>
        </div>

        <ol className="process-list">

          <li>
            <b>01</b>
            <span>
              Choose your credit profile
            </span>
          </li>

          <li>
            <b>02</b>
            <span>
              Share your financial profile
            </span>
          </li>

          <li>
            <b>03</b>
            <span>
              Receive a model prediction
            </span>
          </li>

          <li>
            <b>04</b>
            <span>
              Understand your next steps
            </span>
          </li>

        </ol>
      </section>
    </>
  );
}
