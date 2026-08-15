export default function BrandLogo() {
  return (
    <span className="project-brand" aria-hidden="true" style={{ gap: '12px' }}>
      <svg className="project-brand-mark" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '54px', height: '54px' }}>
        <defs>
          <linearGradient id="logo-circle-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B5C97" />
            <stop offset="100%" stopColor="#001B36" />
          </linearGradient>
          <linearGradient id="logo-bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C73B4" />
            <stop offset="100%" stopColor="#0A4B82" />
          </linearGradient>
          <marker id="arrow-head" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="#001F3E" />
          </marker>
        </defs>
        
        {/* Bars */}
        <rect x="30" y="44" width="10" height="36" rx="1.5" fill="url(#logo-bar-grad)" />
        <rect x="45" y="30" width="10" height="50" rx="1.5" fill="url(#logo-bar-grad)" />
        <rect x="60" y="16" width="10" height="64" rx="1.5" fill="url(#logo-bar-grad)" />
        
        {/* Circle with gap at bottom-left */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logo-circle-grad)" strokeWidth="6" strokeDasharray="216 50" transform="rotate(160 50 50)" strokeLinecap="round" />
        
        {/* Arrow overlapping the bars */}
        <path d="M 16 84 L 35 48 L 50 64 L 75 32" stroke="#001F3E" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" markerEnd="url(#arrow-head)" />
      </svg>
      <span className="project-brand-copy">
        <strong style={{ color: '#001A38', fontSize: '18px', letterSpacing: '-0.2px' }}>Loan Approval</strong>
        <span style={{ color: '#1B6DA8', marginTop: '3px', fontSize: '10.5px', letterSpacing: '3.4px' }}>PREDICTION</span>
      </span>
    </span>
  );
}
