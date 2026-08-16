import { useEffect, useState } from "react";
import "./App.css";

import AiFloatingButton from "./components/AiFloatingButton";
import AiLoanAssistant from "./components/AiLoanAssistant";
import BrandLogo from "./components/BrandLogo";
import EmiCalculator from "./components/EmiCalculator";
import LoanForm from "./components/LoanForm";
import ModelPerformance from "./components/ModelPerformance";
import NTCForm from "./components/NTCForm";
import PredictionResult from "./components/PredictionResult";
import WelcomeDashboard from "./components/WelcomeDashboard";

import {
  predictLoan,
  predictNTC,
} from "./services/api";

import type {
  LoanApplication,
  NTCApplication,
  NTCPredictionResponse,
  PredictionResponse,
} from "./types/loan";

type View =
  | "welcome"
  | "assessment"
  | "ntc-assessment"
  | "result"
  | "ntc-result"
  | "calculator"
  | "model-performance"
  | "assistant";

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
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
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<View>("welcome");

  const [previousView, setPreviousView] =
    useState<View>("welcome");

  const [result, setResult] =
    useState<PredictionResponse | null>(null);

  const [application, setApplication] =
    useState<LoanApplication | null>(null);

  const [ntcResult, setNtcResult] =
    useState<NTCPredictionResponse | null>(null);

  const [ntcApplication, setNtcApplication] =
    useState<NTCApplication | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [theme, setTheme] =
    useState<"light" | "dark">("light");

  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      theme
    );
  }, [theme]);

  const startAssessment = () => {
    setError(null);
    setView("assessment");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrediction = async (
    loanApplication: LoanApplication
  ) => {
    try {
      setLoading(true);
      setError(null);
      setApplication(loanApplication);

      const response =
        await predictLoan(loanApplication);

      setResult(response);
      setView("result");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setError(
        "We couldn't process your application right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const startNTCAssessment = () => {
    setError(null);
    setNtcResult(null);
    setView("ntc-assessment");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNTCPrediction = async (
    ntcApplication: NTCApplication
  ) => {
    try {
      setLoading(true);
      setError(null);
      setNtcApplication(ntcApplication);

      const response =
        await predictNTC(ntcApplication);

      setNtcResult(response);
      setView("ntc-result");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setError(
        "We couldn't process your NTC application right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAssistant = () => {
    setError(null);

    if (view === "assistant") {
      setView(previousView || "welcome");
    } else {
      setPreviousView(view);
      setView("assistant");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openCalculator = () => {
    setError(null);
    setView("calculator");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const reset = () => {
    setResult(null);
    setApplication(null);
    setNtcResult(null);
    setNtcApplication(null);
    setError(null);
    setView("welcome");
    setPreviousView("welcome");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >

          <button
            type="button"
            className="theme-toggle nav-link-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "light"
                  ? "dark"
                  : "light"
              )
            }
            aria-label={`Switch to ${theme === "light"
              ? "dark"
              : "light"
              } theme`}
          >
            {theme === "light" ? (
              <>
                <MoonIcon />
                Dark Mode
              </>
            ) : (
              <>
                <SunIcon />
                Light Mode
              </>
            )}
          </button>

          <button
            type="button"
            className="nav-link-btn"
            onClick={openCalculator}
          >
            EMI Calculator
          </button>

          <a
            href="#how-it-works"
            onClick={() => {
              if (view !== "welcome") {
                reset();
              }
            }}
          >
            How it works
          </a>

          <a
            href="#credit-guide"
            onClick={() => {
              if (view !== "welcome") {
                reset();
              }
            }}
          >
            Credit guide
          </a>

        </nav>

        <div className="header-actions">

          <span className="security-badge">
            <ShieldIcon />
            <span>
              Secure &amp; Private
            </span>
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
            onContinueAfterCibil={
              startNTCAssessment
            }
            onViewPerformance={() => {
              setView("model-performance");

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            onOpenCalculator={openCalculator}
            onOpenAssistant={toggleAssistant}
          />
        )}

        {view === "assessment" && (
          <LoanForm
            onSubmit={handlePrediction}
            loading={loading}
          />
        )}

        {view === "ntc-assessment" && (
          <NTCForm
            onSubmit={handleNTCPrediction}
            loading={loading}
          />
        )}

        {view === "result" &&
          result &&
          application && (
            <PredictionResult
              result={result}
              initialApplication={application}
              onReset={reset}
            />
          )}

        {view === "ntc-result" &&
          ntcResult && (
            <PredictionResult
              result={ntcResult}
              initialApplication={ntcApplication ?? undefined}
              onReset={reset}
            />
          )}

        {view === "assistant" && (
          <AiLoanAssistant
            onBack={() =>
              setView(
                previousView || "welcome"
              )
            }
            applicationContext={application}
          />
        )}

        {view === "calculator" && (
          <EmiCalculator
            onBack={reset}
            onStartAssessment={
              startAssessment
            }
          />
        )}

        {view === "model-performance" && (
          <ModelPerformance
            onBack={reset}
          />
        )}

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

      </div>

      <footer className="app-footer">
        <ShieldIcon />

        <span>
          Your information is processed securely for this assessment
        </span>

        <span className="footer-dot">
          •
        </span>

        <span>
          Model-based guidance, not a lender decision
        </span>
      </footer>

      <AiFloatingButton
        onClick={toggleAssistant}
        isOpen={view === "assistant"}
      />

    </main>
  );
}
