interface GrainOverlayProps {
  opacity?: number;
  className?: string;
}

export function GrainOverlay({
  opacity = 0.04,
  className = "",
}: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] ${className}`}
      style={{
        backgroundImage: "var(--texture-url)",
        opacity,
      }}
    />
  );
}
