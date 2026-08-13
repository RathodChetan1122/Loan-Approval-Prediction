import { useState } from "react";

interface InfoTooltipProps {
  title: string;
  description: string;
  range?: string;
}

export default function InfoTooltip({
  title,
  description,
  range,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="info-wrapper">
      <button
        type="button"
        className="info-button"
        aria-label={`More information about ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ?
      </button>

      {open && (
        <div className="info-popover">
          <div className="info-popover-header">
            <strong>{title}</strong>

            <button
              type="button"
              className="info-close"
              onClick={() => setOpen(false)}
              aria-label="Close information"
            >
              ×
            </button>
          </div>

          <p>{description}</p>

          {range && (
            <div className="info-range">
              {range}
            </div>
          )}
        </div>
      )}
    </div>
  );
}