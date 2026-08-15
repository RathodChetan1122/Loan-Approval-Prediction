import { useState, useEffect } from "react";
import "./App.css";
import LoanForm from "./components/LoanForm";
import PredictionResult from "./components/PredictionResult";
import WelcomeDashboard from "./components/WelcomeDashboard";
import BrandLogo from "./components/BrandLogo";
import ModelPerformance from "./components/ModelPerformance";
import EmiCalculator from "./components/EmiCalculator";
import { predictLoan } from "./services/api";
import type { LoanApplication, PredictionResponse } from "./types/loan";

type View = "welcome" | "assessment" | "result" | "calculator" | "model-performance";

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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<View>("welcome");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

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
            className="theme-toggle nav-link-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <><MoonIcon /> Dark Mode</> : <><SunIcon /> Light Mode</>}
          </button>
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
    </main>
  );
}
