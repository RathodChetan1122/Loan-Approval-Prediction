import { useId } from "react";
import { getCreditBand } from "../utils/creditScore";

const MIN_SCORE = 300;
const MAX_SCORE = 900;

interface SegmentDef {
  label: string;
  range: string;
  color: string;
  startDeg: number; // in standard math angle where 180 is left, 0 is right
  endDeg: number;
}

const SEGMENTS: SegmentDef[] = [
  { label: "POOR", range: "300–579", color: "#22C55E", startDeg: 180, endDeg: 144 },
  { label: "FAIR", range: "580–669", color: "#84CC16", startDeg: 144, endDeg: 108 },
  { label: "GOOD", range: "670–739", color: "#FBBF24", startDeg: 108, endDeg: 72 },
  { label: "VERY GOOD", range: "740–799", color: "#FB923C", startDeg: 72, endDeg: 36 },
  { label: "EXCELLENT", range: "800–850", color: "#EF4444", startDeg: 36, endDeg: 0 },
];

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function makeArcSectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number,
  gapDeg = 1.6
) {
  const adjustedStart = startDeg - gapDeg;
  const adjustedEnd = endDeg + gapDeg;

  const p1 = polarToCartesian(cx, cy, rOuter, adjustedStart);
  const p2 = polarToCartesian(cx, cy, rOuter, adjustedEnd);
  const p3 = polarToCartesian(cx, cy, rInner, adjustedEnd);
  const p4 = polarToCartesian(cx, cy, rInner, adjustedStart);

  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y} Z`;
}

export default function CreditScoreGauge({ score }: { score: number }) {
  const currentBand = getCreditBand(score);
  const clamped = Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
  const needleDeg = -90 + ((clamped - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 180;

  const cx = 200;
  const cy = 200;
  const rOuter = 155;
  const rInner = 95;

  const uniqueId = useId();

  return (
    <div
      className="credit-gauge-container"
      role="img"
      aria-label={`CIBIL Credit score ${score} out of 900, ${currentBand.label}`}
    >
      <div className="gauge-title-badge">YOUR CREDIT SCORE</div>

      <div className="cibil-meter-wrapper">
        <svg
          viewBox="0 0 400 260"
          className="cibil-meter-svg"
          aria-hidden="true"
        >
          <defs>
            <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
            </filter>
            <filter id={`needle-shadow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Gauge Segments */}
          <g className="gauge-segments" filter={`url(#shadow-${uniqueId})`}>
            {SEGMENTS.map((seg) => {
              const pathD = makeArcSectorPath(cx, cy, rOuter, rInner, seg.startDeg, seg.endDeg);
              const midDeg = (seg.startDeg + seg.endDeg) / 2;
              
              // Points for text labels
              const outerTextPos = polarToCartesian(cx, cy, (rOuter + rInner) / 2 + 13, midDeg);
              const innerTextPos = polarToCartesian(cx, cy, (rOuter + rInner) / 2 - 12, midDeg);

              // Calculate tangent rotation angle for labels
              const textRotation = -(midDeg - 90);

              return (
                <g key={seg.label} className="gauge-segment-group">
                  <path
                    d={pathD}
                    fill={seg.color}
                    className="gauge-arc-path"
                  />
                  {/* Range Text (Top of arc) */}
                  <text
                    x={outerTextPos.x}
                    y={outerTextPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="0.3px"
                    transform={`rotate(${textRotation}, ${outerTextPos.x}, ${outerTextPos.y})`}
                    style={{ userSelect: "none" }}
                  >
                    {seg.range}
                  </text>
                  {/* Category Text (Bottom of arc) */}
                  <text
                    x={innerTextPos.x}
                    y={innerTextPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="800"
                    letterSpacing="0.4px"
                    transform={`rotate(${textRotation}, ${innerTextPos.x}, ${innerTextPos.y})`}
                    style={{ userSelect: "none", opacity: 0.95 }}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Center Score & Out of 900 Text */}
          <g className="gauge-center-display">
            <text
              x={cx}
              y={cy - 46}
              textAnchor="middle"
              className="gauge-score-number"
              fill="#0F172A"
              fontSize="48"
              fontWeight="900"
              letterSpacing="-1px"
            >
              {score}
            </text>
            <text
              x={cx}
              y={cy - 24}
              textAnchor="middle"
              className="gauge-score-subtext"
              fill="#64748B"
              fontSize="14"
              fontWeight="600"
            >
              out of 900
            </text>
          </g>

          {/* Animated Gauge Needle */}
          <g
            className="gauge-needle-assembly"
            transform={`rotate(${needleDeg}, ${cx}, ${cy})`}
            filter={`url(#needle-shadow-${uniqueId})`}
            style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)" }}
          >
            {/* Tapered Needle */}
            <polygon
              points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx + 0.8},${cy - 128} ${cx - 0.8},${cy - 128}`}
              fill="#1E293B"
            />
          </g>

          {/* Needle Center Pivot */}
          <g className="gauge-pivot">
            <circle
              cx={cx}
              cy={cy}
              r="17"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="4.5"
              filter={`url(#needle-shadow-${uniqueId})`}
            />
            <circle cx={cx} cy={cy} r="6" fill="#1E293B" />
          </g>
        </svg>

        {/* Current Band Badge below meter pivot */}
        <div className="gauge-badge-pill">
          <span className="badge-text" style={{ color: "#1D4ED8" }}>
            {currentBand.label}
          </span>
        </div>
      </div>
    </div>
  );
}
