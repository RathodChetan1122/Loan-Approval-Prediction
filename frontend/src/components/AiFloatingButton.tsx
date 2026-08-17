interface AiFloatingButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export default function AiFloatingButton({
  onClick,
  isOpen = false,
}: AiFloatingButtonProps) {
  return (
    <button
      type="button"
      className={`meta-ai-floating-fab ${isOpen ? "is-open" : ""}`}
      onClick={onClick}
      aria-label="AI Loan Support Assistant"
      title="AI Loan Support Assistant"
    >
      <div className="fab-inner-surface">
        {isOpen ? (
          <svg
            viewBox="0 0 24 24"
            className="fab-icon-svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 100 100"
            className="fab-icon-robot-svg"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer Speech Bubble Ring */}
            <path
              d="M50 8 C26.8 8 8 26.8 8 50 C8 59.8 11.4 68.8 17.1 76 L12 92 L28.4 86.8 C34.8 90.1 42.2 92 50 92 C73.2 92 92 73.2 92 50 C92 26.8 73.2 8 50 8 Z"
              fill="currentColor"
            />

            {/* Inner Circular Background */}
            <circle cx="50" cy="50" r="37" fill="#FDFCF9" />

            {/* Headset Top Band */}
            <path
              d="M26 44 C26 28 36 21 50 21 C64 21 74 28 74 44"
              fill="none"
              stroke="#2B3A2E"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Headset Cushion Detail */}
            <path
              d="M34 26 C38 23.5 44 22.5 50 22.5 C56 22.5 62 23.5 66 26"
              fill="none"
              stroke="#D97757"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Robot Shoulders / Body */}
            <path
              d="M32 75 C32 64 40 60 50 60 C60 60 68 64 68 75 Z"
              fill="#E2E8F0"
            />

            {/* Robot Head Shape */}
            <rect
              x="28"
              y="28"
              width="44"
              height="34"
              rx="17"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Dark Visor Screen */}
            <rect
              x="33"
              y="34"
              width="34"
              height="23"
              rx="11"
              fill="#181915"
            />

            {/* Smiling / Happy Eyes */}
            <path
              d="M39 45 C39 41.5 42 41.5 45 45"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M55 45 C55 41.5 58 41.5 61 45"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cute Smiling Mouth */}
            <path
              d="M47 50 Q50 53 53 50 Z"
              fill="#38BDF8"
            />

            {/* Headset Left Ear Cup */}
            <rect
              x="22"
              y="38"
              width="7"
              height="16"
              rx="3.5"
              fill="#94A3B8"
              stroke="#64748B"
              strokeWidth="1"
            />
            <rect
              x="20"
              y="41"
              width="3"
              height="10"
              rx="1.5"
              fill="#CBD5E1"
            />

            {/* Headset Right Ear Cup */}
            <rect
              x="71"
              y="38"
              width="7"
              height="16"
              rx="3.5"
              fill="#94A3B8"
              stroke="#64748B"
              strokeWidth="1"
            />
            <rect
              x="77"
              y="41"
              width="3"
              height="10"
              rx="1.5"
              fill="#CBD5E1"
            />
          </svg>
        )}
      </div>

      <div className="fab-tooltip" role="tooltip">
        <strong>Loan Support Advisor</strong>
        <span>Real-time underwriting &amp; eligibility guidance</span>
      </div>
    </button>
  );
}
