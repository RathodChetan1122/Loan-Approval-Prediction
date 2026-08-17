import OfficialCibilButton from "./OfficialCibilButton";

interface WelcomeDashboardProps {
  onStart: () => void;
  onKnowScore: () => void;
  onContinueAfterCibil: () => void;
  onViewPerformance: () => void;
  onOpenCalculator?: () => void;
  onOpenAssistant?: () => void;
  onOpenQuiz?: () => void;
}

export default function WelcomeDashboard({
  onStart,
  onKnowScore,
  onContinueAfterCibil,
  onViewPerformance,
  onOpenCalculator,
  onOpenAssistant,
  onOpenQuiz,
}: WelcomeDashboardProps) {
  return (
    <div className="welcome-dashboard-root">
      {/* =========================================================================
          1. HERO SECTION WITH INTERACTIVE LIVE UNDERWRITING PREVIEW
      ========================================================================== */}
      <section className="welcome-hero-v2" id="home">
        <div className="welcome-hero-content">
          <h1 className="hero-main-title">
            Know Your Loan Approval Odds <span className="title-highlight">Before You Apply.</span>
          </h1>

          <p className="hero-main-description">
            Evaluate your debt-to-income, creditworthiness, and eligibility through
            bank-grade Machine Learning models. Get instant approval probability, max eligible loan limits, and personalized recommendations with zero impact on your credit score.
          </p>

          {/* Primary Action Buttons */}
          <div className="hero-action-row">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={onStart}
            >
              <span>Instant Eligibility Check</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {onOpenCalculator && (
              <button
                type="button"
                className="hero-secondary-btn"
                onClick={onOpenCalculator}
              >
                <span>Calculate Monthly EMI</span>
                <span className="btn-icon-sub">₹</span>
              </button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span>No Hard Credit Pull</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span>60-Second Instant Result</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-icon">📊</span>
              <span>SHAP Factor Insights</span>
            </div>
          </div>
        </div>

        {/* Right Hero Visual: Circular Credit Profile Ring, Floating Insight & Visual Bars */}
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-score">
            <span>Credit profile</span>
            <strong>720</strong>
            <small>Good standing</small>
          </div>

          <div className="visual-insight">
            <span className="insight-sparkle">✦</span>
            <div>
              <b>Eligibility insights</b>
              <small>Clear next steps, not guarantees</small>
            </div>
          </div>

          <div className="visual-bars">
            <i className="bar-1" />
            <i className="bar-2" />
            <i className="bar-3" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CHOOSE YOUR ASSESSMENT PATHWAY
      ========================================================================== */}
      <section className="pathways-section" id="credit-guide">
        <div className="section-header-centered">
          <span className="section-tag">TAILORED ONBOARDING</span>
          <h2 className="section-title">Select Your Credit Profile Pathway</h2>
          <p className="section-sub">
            Whether you have a seasoned credit history or are applying for your very first loan,
            our predictive engines provide accurate, customized guidance.
          </p>
        </div>

        <div className="pathway-cards-grid">
          {/* Card 1: Known CIBIL Score */}
          <div
            className="pathway-card pathway-primary"
            onClick={onKnowScore}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onKnowScore()}
          >
            <div className="pathway-icon-wrapper prime-bg">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="pathway-badge">Standard Model (7-Feature)</div>
            <h3 className="pathway-title">I Know My Credit Score</h3>
            <p className="pathway-desc">
              Enter your CIBIL score, annual income, loan amount, and existing obligations.
              Our production ML pipeline calculates probability and SHAP explainability.
            </p>
            <span className="pathway-cta-link">
              Start Full Assessment <span>→</span>
            </span>
          </div>

          {/* Card 2: New-to-Credit (NTC) */}
          <div
            className="pathway-card pathway-accent"
            onClick={onContinueAfterCibil}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onContinueAfterCibil()}
          >
            <div className="pathway-icon-wrapper ntc-bg">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="pathway-badge ntc-badge-style">Alternative Scoring</div>
            <h3 className="pathway-title">I'm New to Credit (NTC)</h3>
            <p className="pathway-desc">
              No credit history or zero CIBIL rating? Our dedicated NTC ML pipeline evaluates
              your repayment capacity using alternate income, stability, and obligation ratios.
            </p>
            <span className="pathway-cta-link">
              Start NTC Assessment <span>→</span>
            </span>
          </div>

          {/* Card 3: Free Official Bureau Check */}
          <div className="pathway-card pathway-bureau">
            <div className="pathway-icon-wrapper bureau-bg">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="pathway-badge bureau-badge-style">Official Bureau</div>
            <h3 className="pathway-title">Check Official CIBIL</h3>
            <p className="pathway-desc">
              Don't know your exact credit score? Fetch your official free credit report
              from TransUnion CIBIL, then return here to run your eligibility prediction.
            </p>
            <div className="bureau-btn-holder">
              <OfficialCibilButton />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FINANCIAL UTILITIES (EMI & FINANCIAL CHALLENGE)
      ========================================================================== */}
      <section className="utilities-section" id="financial-tools">
        <div className="utilities-grid">
          {/* EMI Utility Card */}
          {onOpenCalculator && (
            <div className="utility-card utility-emi" onClick={onOpenCalculator} role="button" tabIndex={0}>
              <div className="utility-top">
                <span className="utility-icon">₹</span>
                <span className="utility-tag">Interactive Tool</span>
              </div>
              <h3 className="utility-title">Smart Loan EMI Calculator</h3>
              <p className="utility-desc">
                Simulate monthly installment commitments, interest vs. principal amortization,
                and custom repayment tenures before finalizing your loan request.
              </p>
              <button type="button" className="utility-btn" onClick={onOpenCalculator}>
                Launch Calculator →
              </button>
            </div>
          )}

          {/* Financial Challenge Card */}
          {onOpenQuiz && (
            <div className="utility-card utility-quiz" onClick={onOpenQuiz} role="button" tabIndex={0}>
              <div className="utility-top">
                <span className="utility-icon">🎯</span>
                <span className="utility-tag quiz-tag-style">Knowledge Challenge</span>
              </div>
              <h3 className="utility-title">Financial &amp; Loan IQ Arena</h3>
              <p className="utility-desc">
                Test your mastery on CIBIL scoring rules, interest calculation nuances, DTI limits,
                and borrowing guidelines across 5 core categories with 10 questions.
              </p>
              <button type="button" className="utility-btn" onClick={onOpenQuiz}>
                Start Challenge →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. CORE PLATFORM TRANSPARENCY & FEATURES
      ========================================================================== */}
      <section className="features-platform-section" id="how-it-works">
        <div className="section-header-centered">
          <span className="section-tag">INTELLIGENT ARCHITECTURE</span>
          <h2 className="section-title">Engineered for Underwriting Transparency</h2>
          <p className="section-sub">
            We provide deep explainability on every decision so you understand exactly what lenders look for.
          </p>
        </div>

        <div className="platform-features-grid">
          {/* Feature 1 */}
          <div className="platform-feature-card" onClick={onViewPerformance} role="button" tabIndex={0}>
            <div className="feat-header">
              <span className="feat-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-4-4-4 4" />
                  <circle cx="18" cy="9" r="2" fill="currentColor" />
                </svg>
              </span>
              <span className="feat-link-arrow">↗</span>
            </div>
            <h4>Model Performance &amp; Metrics</h4>
            <p>
              Inspect our production model accuracy, confusion matrix, precision-recall curve,
              and ROC-AUC benchmarking metrics.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="platform-feature-card"
            onClick={onOpenAssistant}
            role="button"
            tabIndex={0}
          >
            <div className="feat-header">
              <span className="feat-icon-badge ai-sparkle">✦</span>
              <span className="feat-link-arrow">↗</span>
            </div>
            <h4>Real-Time AI Loan Advisor</h4>
            <p>
              Chat with our dedicated AI assistant to clarify approval factors, analyze risk factors,
              and discover ways to boost your credit terms.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="platform-feature-card">
            <div className="feat-header">
              <span className="feat-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="feat-link-arrow">✓</span>
            </div>
            <h4>SHAP Explainability Insights</h4>
            <p>
              Every decision comes with transparent feature contributions, highlighting the exact
              positive and negative factors impacting your application.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. 4-STEP ASSESSMENT PATHWAY
      ========================================================================== */}
      <section className="workflow-steps-section">
        <div className="section-header-centered">
          <span className="section-tag">CLEAR PROCESS</span>
          <h2 className="section-title">How Your Assessment Works</h2>
        </div>

        <div className="workflow-steps-row">
          <div className="workflow-step-box">
            <span className="step-number">01</span>
            <h5>Select Track</h5>
            <p>Choose between established credit profile or new-to-credit assessment.</p>
          </div>

          <div className="workflow-step-box">
            <span className="step-number">02</span>
            <h5>Enter Metrics</h5>
            <p>Input income, requested loan, tenure, and monthly liabilities securely.</p>
          </div>

          <div className="workflow-step-box">
            <span className="step-number">03</span>
            <h5>ML Inference</h5>
            <p>Production algorithms evaluate risk probability and max loan boundaries.</p>
          </div>

          <div className="workflow-step-box">
            <span className="step-number">04</span>
            <h5>Take Action</h5>
            <p>Receive clear next steps, tailored loan advice, and PDF export reports.</p>
          </div>
        </div>
      </section>
    </div>
  );
}