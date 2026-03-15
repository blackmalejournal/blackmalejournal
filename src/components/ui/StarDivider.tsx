interface StarDividerProps {
  className?: string;
}

export function StarDivider({ className = "" }: StarDividerProps) {
  return (
    <div
      className={`relative flex items-center py-4 ${className}`}
      role="separator"
      aria-hidden="true"
    >
      {/* Left line */}
      <div className="flex-1 border-t border-bmj-tan/40" />

      {/* Star */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-3 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M8 0L9.8 5.8H16L10.9 9.2L12.7 15L8 11.6L3.3 15L5.1 9.2L0 5.8H6.2L8 0Z"
          fill="var(--bmj-red)"
        />
      </svg>

      {/* Right line */}
      <div className="flex-1 border-t border-bmj-tan/40" />
    </div>
  );
}
