import { bands, getCreditBand } from "../utils/creditScore";

const MIN_SCORE = 300;
const MAX_SCORE = 900;

export default function CreditScoreGauge({ score }: { score: number }) {
  const currentBand = getCreditBand(score);
  const clamped = Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
  const markerPercent = ((clamped - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100;

  return (
    <div className="credit-gauge" role="img" aria-label={`Credit score ${score}, ${currentBand.label}`}>
      <span className="gauge-title-svg">Your credit score</span>

      <div className="gauge-score">
        <strong>{score}</strong>
        <small>out of 900</small>
      </div>
      <div className="gauge-status" style={{ color: currentBand.color }}>
        <b>{currentBand.label}</b>
      </div>

      <div className="gauge-strip-wrap">
        <div className="gauge-strip">
          {bands.map((band) => (
            <span
              key={band.label}
              className="gauge-strip-segment"
              style={{
                background: band.color,
                flexGrow: band.maximum - band.minimum,
              }}
            />
          ))}
          <span
            className="gauge-strip-marker"
            style={{ left: `${markerPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="gauge-strip-labels">
          {bands.map((band) => (
            <span key={band.label} className={band === currentBand ? "active" : ""}>
              {band.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
