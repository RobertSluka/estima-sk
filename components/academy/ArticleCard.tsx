"use client"

import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryTitle, type AcademyArticle } from "@/lib/academy"

// A single article card — the whole card is one link (keyboard-focusable),
// with a visible focus ring and a restrained hover lift. `featured` renders a
// larger variant used for the recommended introductory guide.
export default function ArticleCard({
  article,
  featured = false,
}: {
  article: AcademyArticle
  featured?: boolean
}) {
  return (
    <Link
      href={`/academy/${article.slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors",
        "hover:border-slate-300 hover:bg-slate-50/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page",
        featured && "sm:p-7",
      )}
    >
      {/* number · category */}
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <span className="text-steel tabular-nums">
          {String(article.number).padStart(2, "0")}
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{categoryTitle(article.categorySlug)}</span>
      </div>

      <h3
        className={cn(
          "font-semibold text-slate-900",
          featured ? "text-xl leading-snug" : "text-[15px] leading-snug",
        )}
      >
        {article.title}
      </h3>

      <p
        className={cn(
          "mt-2 flex-1 text-sm leading-relaxed text-slate-500",
          featured ? "line-clamp-4" : "line-clamp-3",
        )}
      >
        {article.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {article.readingMinutes} min čítania
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-steel" />
      </div>
    </Link>
  )
}
