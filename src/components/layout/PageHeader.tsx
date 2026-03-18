import { StarDivider } from "@/components/ui/StarDivider";

interface PageHeaderProps {
  /** Page title — rendered as h1 */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional label above the title (e.g., section name) */
  label?: string;
  /** Optional icon rendered before the h1 */
  icon?: React.ReactNode;
  /** className for the StarDivider (default "mb-6") */
  dividerClassName?: string;
  /** className for the outer wrapper */
  className?: string;
}

export function PageHeader({
  title,
  description,
  label,
  icon,
  dividerClassName = "mb-6",
  className = "",
}: PageHeaderProps) {
  const hasLabel = Boolean(label);
  const h1Classes = `font-display text-5xl text-bmj-white${
    hasLabel ? " uppercase md:text-7xl" : ""
  }`;

  return (
    <header className={className}>
      {label && (
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          {label}
        </p>
      )}

      {icon ? (
        <div className="mb-2 flex items-center gap-3">
          {icon}
          <h1 className={h1Classes}>{title}</h1>
        </div>
      ) : (
        <h1 className={h1Classes}>{title}</h1>
      )}

      {description && (
        <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
          {description}
        </p>
      )}

      <StarDivider className={dividerClassName} />
    </header>
  );
}
