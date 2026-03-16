import Image from "next/image"

interface MagazineCoverHeroProps {
  title: string
  date: string
  issueNumber: number
  coverImageUrl: string
}

export default function MagazineCoverHero({
  title,
  date,
  issueNumber,
  coverImageUrl,
}: MagazineCoverHeroProps) {
  const formattedIssue = String(issueNumber).padStart(3, "0")

  return (
    <div className="mx-auto max-w-content bg-bmj-cream">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 pt-6">
        <svg
          className="h-7 w-7 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="var(--bmj-red)"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        <h1 className="font-display text-3xl text-bmj-black sm:text-4xl md:text-5xl">
          Weekend Briefing
        </h1>
      </div>

      {/* Red rule */}
      <div className="mx-6 mt-2 h-[3px] bg-bmj-red" />

      {/* Date + issue */}
      <div className="px-6 py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-bmj-brown">
          {date} &middot; Issue No. {formattedIssue}
        </span>
      </div>

      {/* Cover image */}
      <div className="paper-texture relative mx-6 mb-6 aspect-[16/10] overflow-hidden">
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          className="halftone object-cover"
        />
      </div>
    </div>
  )
}
