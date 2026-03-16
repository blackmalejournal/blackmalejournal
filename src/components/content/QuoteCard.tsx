import Image from "next/image"

interface QuoteCardProps {
  quote: string
  attribution: string
  portraitUrl?: string
  lens?: "health" | "philosophy" | "politics"
}

const lensColors = {
  health: "bg-bmj-amber",
  philosophy: "bg-bmj-tan",
  politics: "bg-bmj-brown",
} as const

const lensTextColors = {
  health: "text-bmj-brown",
  philosophy: "text-bmj-brown",
  politics: "text-bmj-cream",
} as const

export default function QuoteCard({
  quote,
  attribution,
  portraitUrl,
  lens = "health",
}: QuoteCardProps) {
  const bg = lensColors[lens]
  const textColor = lensTextColors[lens]

  return (
    <div className={`${bg} p-6 sm:p-8`}>
      <div
        className={`flex flex-col ${portraitUrl ? "sm:flex-row sm:items-center sm:gap-6" : ""}`}
      >
        {portraitUrl && (
          <div className="halftone-dots relative mb-4 h-24 w-24 flex-shrink-0 overflow-hidden sm:mb-0 sm:h-28 sm:w-28">
            <Image
              src={portraitUrl}
              alt={attribution}
              fill
              className="halftone-heavy object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <span className="font-display text-6xl leading-none text-bmj-red">
            &ldquo;
          </span>
          <blockquote
            className={`-mt-8 font-body text-base font-bold uppercase leading-snug sm:text-lg ${textColor}`}
          >
            {quote}
          </blockquote>
          <div className="mt-4 h-0.5 w-10 bg-bmj-red" />
          <p
            className={`mt-2 font-label text-xs uppercase tracking-widest ${textColor} opacity-70`}
          >
            {attribution}
          </p>
        </div>
      </div>
    </div>
  )
}
