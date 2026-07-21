import ArticleCard from "@/components/academy/ArticleCard"
import type { AcademyArticle } from "@/lib/academy"

// Related reading — same-category first, then reading-order fill (computed by
// relatedArticles in lib/academy). Hidden when there are none.
export default function RelatedArticles({ articles }: { articles: AcademyArticle[] }) {
  if (articles.length === 0) return null
  return (
    <section aria-labelledby="related-heading" className="mt-12 border-t border-slate-200 pt-8">
      <h2 id="related-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
        Súvisiace články
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  )
}
