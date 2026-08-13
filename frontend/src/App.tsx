import { useState } from "react";

import "./App.css";
import LoanForm from "./components/LoanForm";
import PredictionResult from "./components/PredictionResult";
import { predictLoan } from "./services/api";
import type { LoanApplication, PredictionResponse } from "./types/loan";

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function App() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = async (application: LoanApplication) => {
    try {
      setLoading(true);
      setError(null);
      const prediction = await predictLoan(application);
      setResult(prediction);
    } catch {
      setError("Unable to connect to the loan prediction service. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">L</div>
          <div className="brand-copy"><strong>LoanWise</strong><span>Loan Eligibility Check</span></div>
        </div>
        <div className="security-badge"><ShieldIcon /><span>Secure &amp; Private</span></div>
      </header>

      <div className="main-container">
        {!result && <>
          <section className="hero-section">
            <span className="hero-pill"><i /> AI-powered assessment</span>
            <h1>Check your loan eligibility</h1>
            <p>Answer a few simple questions about your financial profile. Our machine learning model will estimate your loan approval probability.</p>
          </section>
          <section className="assessment-wrapper" aria-label="Loan eligibility assessment">
            <div className="assessment-card">
              <header className="assessment-header">
                <div><span className="assessment-eyebrow">LOAN ASSESSMENT</span><h2>Let's understand your profile</h2></div>
                <div className="assessment-icon" aria-hidden="true">⌁</div>
              </header>
              <LoanForm onSubmit={handlePrediction} loading={loading} />
            </div>
          </section>
          {error && <div className="global-error" role="alert"><span>!</span>{error}</div>}
        </>}
        {result && <PredictionResult result={result} onReset={() => { setResult(null); setError(null); }} />}
      </div>

      <footer className="app-footer"><ShieldIcon /><span>Your information is processed securely for this assessment</span><span className="footer-dot">•</span><span>Powered by machine learning</span></footer>
    </main>
  );
}

export default App;
