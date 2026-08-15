import { bands, getCreditBand } from "../utils/creditScore";

const polarPoint = (radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return { x: 200 + radius * Math.cos(radians), y: 260 + radius * Math.sin(radians) };
};

const segmentPath = (startAngle: number, endAngle: number) => {
  const outerStart = polarPoint(190, startAngle);
  const outerEnd = polarPoint(190, endAngle);
  const innerEnd = polarPoint(140, endAngle);
  const innerStart = polarPoint(140, startAngle);
  return `M ${outerStart.x} ${outerStart.y} A 190 190 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 140 140 0 0 0 ${innerStart.x} ${innerStart.y} Z`;
};



export default function CreditScoreGauge({ score }: { score: number }) {
  const currentBand = getCreditBand(score);
  const bandIndex = bands.indexOf(currentBand);
  const scoreInBand = (score - currentBand.minimum) / (currentBand.maximum - currentBand.minimum || 1);
  const needleAngle = -180 + bandIndex * 36 + Math.min(1, Math.max(0, scoreInBand)) * 36;

  return <div className="credit-gauge" role="img" aria-label={`Credit score ${score}, ${currentBand.label}`}>
    <svg viewBox="0 0 400 320" aria-hidden="true" className="credit-gauge-svg">
      {/* Title above the gauge */}
      <text x="200" y="30" textAnchor="middle" className="gauge-title-svg">YOUR CREDIT SCORE</text>
      
      {bands.map((band, index) => {
        const start = -180 + index * 36 + 1.5;
        const end = -180 + (index + 1) * 36 - 1.5;
        
        // Ranges perfectly centered inside the thick segments
        const rangePoint = polarPoint(165, -180 + index * 36 + 18);
        
        // Category labels neatly tucked inside the inner area (whitespace)
        const labelPoint = polarPoint(125, -180 + index * 36 + 18);
        
        const textRotation = index === 2 ? 0 : -180 + index * 36 + 108;
        
        return <g key={band.label} className={band === currentBand ? "gauge-segment active" : "gauge-segment"}>
          <path d={segmentPath(start, end)} fill={band.color} />
          
          {/* Label inside the whitespace below the segment */}
          <text className="gauge-band-label" x={labelPoint.x} y={labelPoint.y} textAnchor="middle" transform={`rotate(${textRotation} ${labelPoint.x} ${labelPoint.y})`}>{band.label}</text>
          
          {/* Range inside the colored segment */}
          <text className="gauge-band-range" x={rangePoint.x} y={rangePoint.y} textAnchor="middle" transform={`rotate(${textRotation} ${rangePoint.x} ${rangePoint.y})`}>{band.range}</text>
        </g>;
      })}
      
      {/* Needle - shortened to radius 105 so it never overlaps the category labels at radius 125 */}
      <g className="gauge-needle" transform={`rotate(${needleAngle + 90} 200 260)`}>
        <path d="M195 260 L200 155 L205 260 Z" fill="#1e293b" />
        <circle cx="200" cy="260" r="14" fill="#fff" stroke="#1e293b" strokeWidth="6" />
      </g>
    </svg>
    
    <div className="gauge-score">
      <strong>{score}</strong>
      <small>out of 900</small>
    </div>
    <div className="gauge-status">
      <b>{currentBand.label}</b>
    </div>
  </div>;
}
