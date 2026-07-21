"use client"

import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { categoryTitle, type AcademyArticle } from "@/lib/academy"

// Wide horizontal "continue reading" card. The page decides which article to
// show (last-opened, else the first recommended) and passes the stored
// progress; 0 % simply reads as "start reading". The whole card links to the
// article; the "Pokračovať" pill is a visual affordance within it.
export default function ContinueReadingCard({
  article,
  progress,
  label,
}: {
  article: AcademyArticle
  progress: number
  label: string
}) {
  return (
    <Link
      href={`/academy/${article.slug}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-steel">
            {label}
          </p>
          <h2 className="mt-1.5 truncate text-lg font-semibold text-slate-900">
            {article.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {article.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.readingMinutes} min čítania
            </span>
            <span>{categoryTitle(article.categorySlug)}</span>
          </div>

          {progress > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-steel"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-slate-400">{progress} %</span>
            </div>
          )}
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-slate-700 sm:self-center">
          Pokračovať
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
