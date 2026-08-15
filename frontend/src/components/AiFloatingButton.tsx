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
      aria-label="Open AI Assistant"
      title="Open AI Assistant"
    >
      <div className="fab-glow-ring" aria-hidden="true" />
      <div className="fab-inner-surface">
        <svg
          viewBox="0 0 100 100"
          className="fab-robot-svg"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Outer Ring Vibrant Gradient */}
            <linearGradient id="robotRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="30%" stopColor="#d946ef" />
              <stop offset="70%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Robot Head Body Gradient */}
            <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Eyes Glow Gradient */}
            <linearGradient id="robotEyesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#00d2ff" />
            </linearGradient>

            {/* Drop filter for neon effect */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#818cf8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Outer Halo Arc (matching reference image) */}
          <path
            d="M 20,68 A 38,38 0 1,1 80,68"
            fill="none"
            stroke="url(#robotRingGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Robot Head Outline */}
          <path
            d="M 33,52 C 30,52 28,49 28,45 C 28,41 30,38 33,38 C 33,26 40,18 50,18 C 60,18 67,26 67,38 C 70,38 72,41 72,45 C 72,49 70,52 67,52 C 65,58 59,62 50,62 C 41,62 35,58 33,52 Z"
            fill="#090d1f"
            stroke="url(#robotBodyGrad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Glowing Eyes */}
          <circle cx="43" cy="40" r="3.6" fill="url(#robotEyesGrad)" />
          <circle cx="57" cy="40" r="3.6" fill="url(#robotEyesGrad)" />

          {/* Shoulders / Torso Arch */}
          <path
            d="M 25,82 C 30,68 40,64 50,64 C 60,64 70,68 75,82"
            fill="none"
            stroke="url(#robotRingGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </button>
  );
}
