import { useState } from "react";

import "./App.css";

import LoanForm from "./components/LoanForm";
import PredictionResult from "./components/PredictionResult";

import { predictLoan } from "./services/api";

import type {
  LoanApplication,
  PredictionResponse,
} from "./types/loan";


function App() {
  const [result, setResult] =
    useState<PredictionResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const handlePrediction = async (
    application: LoanApplication
  ) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const prediction =
        await predictLoan(application);

      setResult(prediction);
    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );

      setError(
        "Unable to connect to the loan prediction service. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };


  const startAgain = () => {
    setResult(null);
    setError(null);
  };


  return (
    <main className="app-shell">

      <header className="app-header">
        <div className="brand-mark">
          LP
        </div>

        <div>
          <span className="brand-name">
            LoanPredict
          </span>

          <span className="brand-caption">
            Smart loan assessment
          </span>
        </div>
      </header>


      {!result ? (
        <section className="application-flow">

          <div className="intro-section">
            <span className="eyebrow">
              Loan eligibility
            </span>

            <h1>
              Let's understand
              <br />
              your financial profile.
            </h1>

            <p>
              Answer seven simple questions.
              It only takes a minute.
            </p>
          </div>


          <LoanForm
            onSubmit={handlePrediction}
            loading={loading}
          />


          {error && (
            <div
              className="error-message"
              role="alert"
            >
              {error}
            </div>
          )}

        </section>
      ) : (
        <PredictionResult
          result={result}
          onReset={startAgain}
        />
      )}


      <footer className="app-footer">
        <span>
          Your information is used only for
          this prediction.
        </span>

        <span>
          Powered by machine learning
        </span>
      </footer>

    </main>
  );
}


export default App;