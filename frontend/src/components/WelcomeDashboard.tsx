import OfficialCibilButton from "./OfficialCibilButton";

interface WelcomeDashboardProps {
  onStart: () => void;
  onKnowScore: () => void;
  onContinueAfterCibil: () => void;
  onViewPerformance: () => void;
  onOpenCalculator?: () => void;
  onOpenAssistant?: () => void;
}

const ModelPerformanceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="M18 9l-5 5-4-4-4 4"/>
    <circle cx="18" cy="9" r="2" fill="currentColor"/>
  </svg>
);

const CibilLogoIcon = () => (
  <svg width="64" height="24" viewBox="0 0 70 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="2" width="16" height="16" rx="2" fill="#00A6CE" />
    <text x="3" y="14" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">tu</text>
    <text x="21" y="15" fill="#005A9E" fontSize="15" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">CIBIL</text>
  </svg>
);

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/>
  </svg>
);

export default function WelcomeDashboard({
  onStart,
  onKnowScore,
  onContinueAfterCibil,
  onViewPerformance,
  onOpenCalculator,
  onOpenAssistant,
}: WelcomeDashboardProps) {
  return <>
    <section className="welcome-hero" id="home">
      <div className="welcome-copy">
        <span className="welcome-eyebrow"><i /> SMART LOAN ELIGIBILITY</span>
        <h1>Make smarter borrowing decisions.</h1>
        <p>Analyze your financial profile and understand your predicted loan eligibility before you apply.</p>
        <div className="hero-cta-group">
          <button type="button" className="hero-cta" onClick={onStart}>Check my eligibility <span>→</span></button>
          {onOpenAssistant && (
            <button type="button" className="hero-secondary-cta" onClick={onOpenAssistant} style={{ background: '#eef8f6', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              <span>✦</span> AI Loan Assistant
            </button>
          )}
          {onOpenCalculator && (
            <button type="button" className="hero-secondary-cta" onClick={onOpenCalculator}>
              <span>₹</span> Calculate EMI
            </button>
          )}
        </div>
        <p className="hero-note">No credit credentials required. Your assessment stays in this browser session.</p>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="visual-score"><span>Credit profile</span><strong>720</strong><small>Good standing</small></div>
        <div className="visual-insight"><span>✦</span><div><b>Eligibility insights</b><small>Clear next steps, not guarantees</small></div></div>
        <div className="visual-bars"><i /><i /><i /></div>
      </div>
    </section>

    <section className="cibil-decision" id="credit-guide" aria-labelledby="cibil-title">
      <div className="section-copy"><span>YOUR CREDIT PROFILE</span><h2 id="cibil-title">Let's start with your credit profile</h2><p>Your CIBIL Score can provide useful context for your eligibility estimate. Do you know your CIBIL Score?</p></div>
      <div className="cibil-options">
        <button type="button" className="cibil-choice known-score" onClick={onKnowScore}><span className="choice-symbol">✓</span><strong>Yes, I know my score</strong><p>I'll enter my CIBIL score manually in the assessment.</p><b>Continue to assessment →</b></button>
        <div className="cibil-choice check-score"><span className="choice-symbol">?</span><strong>I don't know my score</strong><p>Check it securely on the official CIBIL website, then return here when you're ready.</p><OfficialCibilButton /></div>
      </div>
      <div className="cibil-return"><span>After checking your score, return here and enter it in the assessment.</span><button type="button" onClick={onContinueAfterCibil}>I have my score — Continue →</button></div>
    </section>

    <section className="feature-section" id="how-it-works" aria-labelledby="feature-title">
      <div className="section-copy"><span>BUILT FOR CLARITY</span><h2>Everything you need before applying</h2><p>A simple, transparent experience designed to help you prepare—not to promise a lender decision.</p></div>
      <div className="feature-grid">
        {onOpenAssistant && (
          <article className="feature-card" style={{ animationDelay: `0ms`, cursor: 'pointer', border: '1px solid var(--primary)' }} onClick={onOpenAssistant}>
            <span style={{ color: 'var(--primary)' }}><SparklesIcon /></span>
            <h3>AI Loan Assistant</h3>
            <p>Ask real-time questions regarding credit score improvements, loan rejection causes, eligibility rules, and required documentation.</p>
            <span style={{display: 'inline-block', marginTop: '12px', background: 'transparent', color: 'var(--primary)', fontSize: '12px', padding: 0, fontWeight: 700}}>Chat with AI Assistant →</span>
          </article>
        )}

        <article className="feature-card" style={{ animationDelay: `60ms`, cursor: 'pointer' }} onClick={onViewPerformance}>
          <span><ModelPerformanceIcon /></span>
          <h3>Model Performance</h3>
          <p>Explore the accuracy, feature importance, and transparency insights behind the LoanWise prediction model.</p>
          <span style={{display: 'inline-block', marginTop: '12px', background: 'transparent', color: 'var(--primary)', fontSize: '12px', padding: 0, fontWeight: 700}}>View Model Performance →</span>
        </article>

        <article className="feature-card" style={{ animationDelay: `120ms`, cursor: 'pointer' }} onClick={() => window.open('https://www.cibil.com/freecibilscore', '_blank', 'noopener,noreferrer')}>
          <span style={{ padding: '0', background: 'transparent' }}><CibilLogoIcon /></span>
          <h3>CIBIL guidance</h3>
          <p>Check your score securely with the official CIBIL website when you need it.</p>
        </article>

        <article className="feature-card" style={{ animationDelay: `180ms` }}>
          <span>✦</span>
          <h3>Personalized insights</h3>
          <p>See model-based probabilities and useful next steps after your assessment.</p>
        </article>
      </div>

      {onOpenCalculator && (
        <div className="tool-banner">
          <div className="tool-banner-content">
            <span className="tool-icon" aria-hidden="true">₹</span>
            <div>
              <h3>Independent Loan EMI Calculator</h3>
              <p>Calculate your estimated monthly EMI, total interest payable, and total repayment amount with custom interest rates and flexible tenures.</p>
            </div>
          </div>
          <button type="button" className="tool-cta" onClick={onOpenCalculator}>
            Open EMI Calculator <span>→</span>
          </button>
        </div>
      )}
    </section>

    <section className="process-section" aria-labelledby="process-title">
      <div className="section-copy"><span>HOW IT WORKS</span><h2 id="process-title">A clear path to your assessment</h2></div>
      <ol className="process-list"><li><b>01</b><span>Know your CIBIL score</span></li><li><b>02</b><span>Share your financial profile</span></li><li><b>03</b><span>Receive a model prediction</span></li><li><b>04</b><span>Understand your next steps</span></li></ol>
    </section>
  </>;
}

