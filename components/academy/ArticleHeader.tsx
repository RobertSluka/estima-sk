import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"
import { categoryTitle, ACADEMY_UPDATED, type AcademyArticle } from "@/lib/academy"

// Article masthead: breadcrumbs, category + number eyebrow, H1 title, the
// derived one-line intro, reading time and a single "last reviewed" label.
export default function ArticleHeader({ article }: { article: AcademyArticle }) {
  return (
    <header className="border-b border-slate-200 pb-6">
      {/* Breadcrumbs */}
      <nav aria-label="Omrvinky" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-400">
        <Link
          href="/academy"
          className="rounded transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
        >
          Akadémia
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/academy?category=${article.categorySlug}`}
          className="rounded transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
        >
          {categoryTitle(article.categorySlug)}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-500">{article.title}</span>
      </nav>

      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <span className="text-steel tabular-nums">
          {String(article.number).padStart(2, "0")}
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{categoryTitle(article.categorySlug)}</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {article.title}
      </h1>

      <p className="mt-3 text-base leading-relaxed text-slate-500">
        {article.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {article.readingMinutes} min čítania
        </span>
        <span>Aktualizované · {ACADEMY_UPDATED}</span>
      </div>
    </header>
  )
}
