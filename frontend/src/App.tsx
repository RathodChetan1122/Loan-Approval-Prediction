import { useState } from "react";
import "./App.css";
import LoanForm from "./components/LoanForm";
import PredictionResult from "./components/PredictionResult";
import WelcomeDashboard from "./components/WelcomeDashboard";
import BrandLogo from "./components/BrandLogo";
import ModelPerformance from "./components/ModelPerformance";
import EmiCalculator from "./components/EmiCalculator";
import AiLoanAssistant from "./components/AiLoanAssistant";
import AiFloatingButton from "./components/AiFloatingButton";
import { predictLoan } from "./services/api";
import type { LoanApplication, PredictionResponse } from "./types/loan";

type View = "welcome" | "assessment" | "result" | "calculator" | "model-performance" | "assistant";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 19 6v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<View>("welcome");
  const [previousView, setPreviousView] = useState<View>("welcome");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAssessment = () => {
    setError(null);
    setView("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCalculator = () => {
    setError(null);
    setView("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAssistant = () => {
    setError(null);
    if (view === "assistant") {
      setView(previousView || "welcome");
    } else {
      setPreviousView(view);
      setView("assistant");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrediction = async (app: LoanApplication) => {
    try {
      setLoading(true);
      setError(null);
      setApplication(app);
      setResult(await predictLoan(app));
      setView("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("We couldn't process your application right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setApplication(null);
    setError(null);
    setView("welcome");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand brand-button"
          onClick={reset}
          aria-label="Loan Approval Prediction home"
        >
          <BrandLogo />
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button
            type="button"
            className="nav-link-btn"
            onClick={openCalculator}
          >
            EMI Calculator
          </button>
          <a href="#how-it-works" onClick={() => view !== "welcome" && reset()}>
            How it works
          </a>
          <a href="#credit-guide" onClick={() => view !== "welcome" && reset()}>
            Credit guide
          </a>
        </nav>

        <div className="header-actions">
          <span className="security-badge">
            <ShieldIcon />
            <span>Secure &amp; Private</span>
          </span>
          <button
            type="button"
            className="header-cta"
            onClick={startAssessment}
          >
            Check eligibility
          </button>
        </div>
      </header>

      <div className="main-container">
        {view === "welcome" && (
          <WelcomeDashboard
            onStart={startAssessment}
            onKnowScore={startAssessment}
            onContinueAfterCibil={startAssessment}
            onViewPerformance={() => {
              setView("model-performance");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenCalculator={openCalculator}
          />
        )}

        {view === "assistant" && (
          <AiLoanAssistant
            onBack={() => setView(previousView || "welcome")}
            applicationContext={application}
          />
        )}

        {view === "calculator" && (
          <EmiCalculator
            onBack={reset}
            onStartAssessment={startAssessment}
          />
        )}

        {view === "assessment" && (
          <>
            <section className="assessment-intro">
              <span>SMART LOAN ELIGIBILITY</span>
              <h1>Your eligibility assessment</h1>
              <p>
                Answer seven short questions. Your CIBIL score is used as one model input, not as a
                guarantee of any outcome.
              </p>
            </section>
            <section className="assessment-wrapper">
              <div className="assessment-card">
                <header className="assessment-header">
                  <div>
                    <span className="assessment-eyebrow">LOAN ASSESSMENT</span>
                    <h2>Let's understand your profile</h2>
                  </div>
                  <div className="assessment-icon" aria-hidden="true">⌁</div>
                </header>
                <LoanForm onSubmit={handlePrediction} loading={loading} />
                {loading && (
                  <div className="analysis-state" role="status">
                    <span className="analysis-spinner" />
                    <div>
                      <strong>Analyzing your information</strong>
                      <p>Preparing your model assessment. This may take a moment.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
            {error && (
              <div className="global-error" role="alert">
                <span>!</span>
                <div>
                  {error}
                  <button type="button" onClick={() => setError(null)}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {view === "result" && result && application && (
          <PredictionResult result={result} initialApplication={application} onReset={reset} />
        )}

        {view === "model-performance" && (
          <ModelPerformance onBack={reset} />
        )}
      </div>

      <footer className="app-footer">
        <ShieldIcon />
        <span>Your information is processed securely for this assessment</span>
        <span className="footer-dot">•</span>
        <span>Model-based guidance, not a lender decision</span>
      </footer>

      {/* Floating Meta AI-style Robot Logo Button at bottom-right corner */}
      <AiFloatingButton
        onClick={toggleAssistant}
        isOpen={view === "assistant"}
      />
    </main>
  );
}
