"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ReadingProgress from "@/components/academy/ReadingProgress"
import ArticleHeader from "@/components/academy/ArticleHeader"
import ArticleTableOfContents from "@/components/academy/ArticleTableOfContents"
import ArticleBody from "@/components/academy/ArticleBody"
import ArticleNavigation from "@/components/academy/ArticleNavigation"
import RelatedArticles from "@/components/academy/RelatedArticles"
import { recordOpen } from "@/lib/academyProgress"
import { articleToc, type AcademyArticle } from "@/lib/academy"

// Client coordinator for the reading experience: records the article as
// last-opened (for the landing's continue-reading card) and lays out the
// sticky TOC, progress bar and content. Its children are server-friendly.
export default function ArticleReader({
  article,
  prev,
  next,
  related,
}: {
  article: AcademyArticle
  prev: AcademyArticle | null
  next: AcademyArticle | null
  related: AcademyArticle[]
}) {
  useEffect(() => {
    recordOpen(article.slug)
  }, [article.slug])

  const toc = articleToc(article)
  const headingIds = toc.slice(1).map((t) => t.id) // ids for h3 + callouts, in order

  return (
    <div>
      <ReadingProgress slug={article.slug} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <ArticleHeader article={article} />

        <div className="mt-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <div className="mb-6 lg:mb-0">
            <ArticleTableOfContents items={toc} />
          </div>

          <article className="w-full max-w-[720px]">
            <ArticleBody article={article} headingIds={headingIds} />

            {article.cta && (
              <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-900">{article.cta.label}</p>
                <Link
                  href={article.cta.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                >
                  Vyskúšať Estimu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <ArticleNavigation prev={prev} next={next} />
            <RelatedArticles articles={related} />
          </article>
        </div>
      </div>
    </div>
  )
}
