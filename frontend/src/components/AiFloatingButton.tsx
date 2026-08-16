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
      <div className="fab-inner-surface">
        <svg
          viewBox="0 0 24 24"
          className="fab-icon-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 3c4.4 0 8 3 8 6.7 0 3.7-3.6 6.7-8 6.7-.8 0-1.6-.1-2.3-.3L5 18l1.1-3.4C4.8 13.4 4 11.6 4 9.7 4 6 7.6 3 12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="9.7" r="1" fill="currentColor" />
          <circle cx="12" cy="9.7" r="1" fill="currentColor" />
          <circle cx="15" cy="9.7" r="1" fill="currentColor" />
        </svg>
      </div>
    </button>
  );
}
