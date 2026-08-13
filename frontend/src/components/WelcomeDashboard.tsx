import OfficialCibilButton from "./OfficialCibilButton";

interface WelcomeDashboardProps {
  onStart: () => void;
  onKnowScore: () => void;
  onContinueAfterCibil: () => void;
}

const features = [
  ["⌁", "Smart eligibility prediction", "Understand your predicted eligibility from the financial information you provide."],
  ["◔", "CIBIL guidance", "Check your score securely with the official CIBIL website when you need it."],
  ["✦", "Personalized insights", "See model-based probabilities and useful next steps after your assessment."],
];

export default function WelcomeDashboard({ onStart, onKnowScore, onContinueAfterCibil }: WelcomeDashboardProps) {
  return <>
    <section className="welcome-hero" id="home">
      <div className="welcome-copy">
        <span className="welcome-eyebrow"><i /> SMART LOAN ELIGIBILITY</span>
        <h1>Make smarter borrowing decisions.</h1>
        <p>Analyze your financial profile and understand your predicted loan eligibility before you apply.</p>
        <button type="button" className="hero-cta" onClick={onStart}>Check my eligibility <span>→</span></button>
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
      <div className="feature-grid">{features.map(([icon, title, description], index) => <article className="feature-card" key={title} style={{ animationDelay: `${index * 80}ms` }}><span>{icon}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>

    <section className="process-section" aria-labelledby="process-title">
      <div className="section-copy"><span>HOW IT WORKS</span><h2 id="process-title">A clear path to your assessment</h2></div>
      <ol className="process-list"><li><b>01</b><span>Know your CIBIL score</span></li><li><b>02</b><span>Share your financial profile</span></li><li><b>03</b><span>Receive a model prediction</span></li><li><b>04</b><span>Understand your next steps</span></li></ol>
    </section>
  </>;
}
