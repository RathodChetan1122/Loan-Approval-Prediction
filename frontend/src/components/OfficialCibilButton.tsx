interface OfficialCibilButtonProps {
  className?: string;
}

export default function OfficialCibilButton({ className = "" }: OfficialCibilButtonProps) {
  return (
    <a
      className={`official-cibil-button ${className}`}
      href="https://www.cibil.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden="true">↗</span>
      Check Official CIBIL Score
    </a>
  );
}
