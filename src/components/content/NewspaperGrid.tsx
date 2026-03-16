import Link from "next/link"
import Image from "next/image"
import { LensBadge } from "@/components/brand/LensBadge"

interface Article {
  slug: string
  title: string
  excerpt: string | null
  lens: "health" | "philosophy" | "politics"
  cover_image: string | null
  published_at: string | null
}

interface NewspaperGridProps {
  articles: Article[]
}

const lensBorderColors = {
  health: "border-t-bmj-amber",
  philosophy: "border-t-bmj-tan",
  politics: "border-t-bmj-red",
} as const

export default function NewspaperGrid({ articles }: NewspaperGridProps) {
  if (articles.length === 0) return null
  const [lead, ...secondary] = articles.slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr] lg:grid-rows-2">
      {/* Lead story — spans 2 rows on desktop */}
      <Link
        href={`/articles/${lead.slug}`}
        className={`group relative flex min-h-[280px] items-end overflow-hidden border-t-[3px] bg-bmj-brown ${lensBorderColors[lead.lens]} lg:row-span-2 lg:min-h-0`}
      >
        {lead.cover_image && (
          <Image
            src={lead.cover_image}
            alt=""
            fill
            className="halftone object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
        <div className="relative z-10 w-full bg-bmj-black/70 p-5">
          <LensBadge lens={lead.lens} />
          <h3 className="mt-2 font-display text-2xl text-bmj-white sm:text-3xl">
            {lead.title}
          </h3>
          {lead.excerpt && (
            <p className="mt-2 line-clamp-2 font-body text-sm text-bmj-cream/80">
              {lead.excerpt}
            </p>
          )}
        </div>
      </Link>

      {/* Secondary stories */}
      {secondary.map((article) => (
        <Link
          key={article.slug}
          href={`/articles/${article.slug}`}
          className={`group border-t-2 bg-bmj-brown p-4 transition-colors hover:bg-bmj-brown/80 ${lensBorderColors[article.lens]}`}
        >
          <LensBadge lens={article.lens} />
          <h3 className="mt-2 font-display text-lg text-bmj-white sm:text-xl">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-1 line-clamp-2 font-body text-sm text-bmj-cream/70">
              {article.excerpt}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
