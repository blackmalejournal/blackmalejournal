import Image from "next/image"
import Link from "next/link"
import { BrandMark } from "@/components/brand/BrandMark"

interface PosterBlockProps {
  title: string
  lens: "health" | "philosophy" | "politics"
  excerpt?: string
  backgroundImageUrl?: string
  linkUrl: string
}

const lensColors = {
  health: "text-bmj-amber",
  philosophy: "text-bmj-tan",
  politics: "text-bmj-red",
} as const

export default function PosterBlock({
  title,
  lens,
  excerpt,
  backgroundImageUrl,
  linkUrl,
}: PosterBlockProps) {
  return (
    <Link
      href={linkUrl}
      className="group relative block w-full overflow-hidden transition-opacity hover:opacity-90"
    >
      <div
        className={`relative flex min-h-[320px] items-end sm:min-h-[400px] ${
          backgroundImageUrl ? "bg-bmj-brown" : "paper-texture bg-bmj-brown"
        }`}
      >
        {backgroundImageUrl && (
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            className="duotone object-cover"
          />
        )}

        {/* Brand mark motif */}
        <BrandMark size={32} color="var(--bmj-red)" className="absolute right-6 top-6 z-10" />

        {/* Content overlay */}
        <div className="relative z-10 w-full p-6 sm:p-10">
          <span
            className={`font-label text-xs uppercase tracking-widest ${lensColors[lens]}`}
          >
            {lens}
          </span>
          <h2 className="mt-2 font-display text-4xl text-bmj-white sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <div className="mt-4 h-[3px] w-[60px] bg-bmj-red" />
          {excerpt && (
            <p className="mt-4 max-w-[500px] font-body text-sm leading-relaxed text-bmj-cream sm:text-base">
              {excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
