import { useState } from "react";
import "./App.css";

import LoanForm from "./components/LoanForm";
import NTCForm from "./components/NTCForm";
import PredictionResult from "./components/PredictionResult";
import WelcomeDashboard from "./components/WelcomeDashboard";
import EmiCalculator from "./components/EmiCalculator";
import BrandLogo from "./components/BrandLogo";

import {
  predictLoan,
  predictNTC,
} from "./services/api";

import type {
  LoanApplication,
  NTCApplication,
  PredictionResponse,
  NTCPredictionResponse,
} from "./types/loan";


type View =
  | "welcome"
  | "assessment"
  | "ntc-assessment"
  | "result"
  | "ntc-result"
  | "calculator";


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
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function App() {

  const [view, setView] =
    useState<View>("welcome");

  const [result, setResult] =
    useState<PredictionResponse | null>(null);

  const [ntcResult, setNtcResult] =
    useState<NTCPredictionResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // ============================================================
  // EXISTING LOAN ASSESSMENT
  // ============================================================

  const startAssessment = () => {
    setError(null);
    setView("assessment");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const handlePrediction = async (
    application: LoanApplication
  ) => {

    try {
      setLoading(true);
      setError(null);

      const response =
        await predictLoan(application);

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


  // ============================================================
  // NEW-TO-CREDIT ASSESSMENT
  // ============================================================

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
    application: NTCApplication
  ) => {

    try {
      setLoading(true);
      setError(null);

      const response =
        await predictNTC(application);

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


  // ============================================================
  // EMI CALCULATOR
  // ============================================================

  const openCalculator = () => {
    setError(null);
    setView("calculator");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ============================================================
  // RESET
  // ============================================================

  const reset = () => {

    setResult(null);
    setNtcResult(null);
    setError(null);

    setView("welcome");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="app-shell">

      {/* ======================================================
          HEADER
      ====================================================== */}

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


      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="main-container">

        {/* ====================================================
            WELCOME
        ==================================================== */}

        {view === "welcome" && (
          <WelcomeDashboard
            onStart={startAssessment}

            /*
             * Existing "I know my score" flow.
             * KEEPING THIS AS THE ORIGINAL LOAN FLOW.
             */
            onKnowScore={
              startAssessment
            }

            /*
             * NTC flow.
             */
            onContinueAfterCibil={
              startNTCAssessment
            }

            onOpenCalculator={
              openCalculator
            }
          />
        )}


        {/* ====================================================
            EXISTING LOAN ASSESSMENT
        ==================================================== */}

        {view === "assessment" && (
          <LoanForm
            onSubmit={handlePrediction}
            loading={loading}
          />
        )}


        {/* ====================================================
            NTC ASSESSMENT
        ==================================================== */}

        {view === "ntc-assessment" && (
          <NTCForm
            onSubmit={
              handleNTCPrediction
            }
            loading={loading}
          />
        )}


        {/* ====================================================
            EXISTING LOAN RESULT
        ==================================================== */}

        {view === "result" &&
          result && (
            <PredictionResult
              result={result}
              onReset={reset}
            />
          )}


        {/* ====================================================
            NTC RESULT
        ==================================================== */}

        {view === "ntc-result" &&
          ntcResult && (
            <PredictionResult
              result={ntcResult}
              onReset={reset}
            />
          )}


        {/* ====================================================
            EMI CALCULATOR
        ==================================================== */}

        {view === "calculator" && (
          <EmiCalculator
            onBack={reset}
            onStartAssessment={
              startAssessment
            }
          />
        )}


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

      </div>

    </main>
  );
}
