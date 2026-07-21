import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ArticleReader from "@/components/academy/ArticleReader"
import {
  ACADEMY_ARTICLES,
  getArticle,
  articleNeighbours,
  relatedArticles,
} from "@/lib/academy"

// Pre-render every article at build time.
export function generateStaticParams() {
  return ACADEMY_ARTICLES.map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticle(params.slug)
  if (!article) return { title: "Článok — Estima Akadémia" }
  return {
    title: `${article.title} — Estima Akadémia`,
    description: article.description,
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)
  if (!article) notFound()

  const { prev, next } = articleNeighbours(article.slug)
  const related = relatedArticles(article.slug, 3)

  return <ArticleReader article={article} prev={prev} next={next} related={related} />
}
