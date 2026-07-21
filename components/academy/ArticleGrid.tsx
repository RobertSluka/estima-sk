"use client"

import ArticleCard from "@/components/academy/ArticleCard"
import { categoryTitle, type AcademyArticle } from "@/lib/academy"

// Articles grouped by category into responsive 3/2/1-column sections. When a
// single category is active the group heading is hidden (the filter already
// names it); across "all" categories each group carries its title + count.
export default function ArticleGrid({
  groups,
  showGroupHeadings,
}: {
  groups: { categorySlug: string; articles: AcademyArticle[] }[]
  showGroupHeadings: boolean
}) {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.categorySlug} aria-labelledby={`cat-${group.categorySlug}`}>
          {showGroupHeadings && (
            <div className="mb-4 flex items-baseline gap-3">
              <h2
                id={`cat-${group.categorySlug}`}
                className="text-sm font-semibold uppercase tracking-wider text-slate-900"
              >
                {categoryTitle(group.categorySlug)}
              </h2>
              <span className="text-xs text-slate-400 tabular-nums">
                {group.articles.length}
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
