import Link from "next/link"
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react"
import type { AcademyArticle } from "@/lib/academy"

// Previous / next article cards plus a link back to the academy index.
export default function ArticleNavigation({
  prev,
  next,
}: {
  prev: AcademyArticle | null
  next: AcademyArticle | null
}) {
  return (
    <nav aria-label="Navigácia medzi článkami" className="mt-12 border-t border-slate-200 pt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/academy/${prev.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-steel" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Predchádzajúci
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-slate-900">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/academy/${next.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60 sm:justify-end"
          >
            <span className="min-w-0 order-1 sm:order-none">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Nasledujúci
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-slate-900">
                {next.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-steel order-2 sm:order-none" />
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
        >
          <LayoutGrid className="h-4 w-4" />
          Späť na akadémiu
        </Link>
      </div>
    </nav>
  )
}
