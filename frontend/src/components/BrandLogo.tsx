export default function BrandLogo() {
  return (
    <span className="project-brand" aria-hidden="true">
      <span className="project-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 3 L35.3 20 L20 37 L4.7 20 Z" fill="var(--primary)" />
          <path d="M20 13 L27.2 20 L20 27 L12.8 20 Z" fill="var(--accent)" />
        </svg>
      </span>
      <span className="project-brand-copy">
        <strong>LoanWise</strong>
        <span>Eligibility, plainly explained</span>
      </span>
    </span>
  );
}
