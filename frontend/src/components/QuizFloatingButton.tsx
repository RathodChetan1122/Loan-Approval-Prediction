interface QuizFloatingButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export default function QuizFloatingButton({
  onClick,
  isOpen = false,
}: QuizFloatingButtonProps) {
  return (
    <button
      type="button"
      className={`loan-quiz-floating-fab ${isOpen ? "is-open" : ""}`}
      onClick={onClick}
      aria-label={isOpen ? "Close Financial Challenge" : "Open Financial Knowledge Challenge"}
      title="Financial Knowledge Challenge"
    >
      {/* Floating Status Pill */}
      {!isOpen && (
        <span className="loan-quiz-pill" aria-hidden="true">
          <span className="loan-quiz-dot" />
          <span>QUIZ</span>
        </span>
      )}

      <div className="loan-quiz-fab-surface">
        {isOpen ? (
          <svg
            viewBox="0 0 24 24"
            className="loan-quiz-fab-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Sleek Financial Knowledge & Credit Emblem */
          <svg
            viewBox="0 0 24 24"
            className="loan-quiz-fab-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Shield / Target Outline */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {/* Target concentric ring */}
            <circle cx="12" cy="11" r="3.5" fill="rgba(217, 119, 87, 0.3)" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 9v4m-2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Elegant Theme Tooltip */}
      <span className="loan-quiz-fab-tooltip" aria-hidden="true">
        <span className="tooltip-primary">Loan &amp; Financial Quiz</span>
        <span className="tooltip-secondary">10 quick questions • Test your credit IQ</span>
      </span>
    </button>
  );
}
