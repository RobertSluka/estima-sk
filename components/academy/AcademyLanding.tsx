"use client"

import { useEffect, useMemo, useState } from "react"
import { Search as SearchIcon } from "lucide-react"
import AcademyHero from "@/components/academy/AcademyHero"
import AcademySearch from "@/components/academy/AcademySearch"
import CategoryFilters, { ALL_CATEGORY } from "@/components/academy/CategoryFilters"
import ContinueReadingCard from "@/components/academy/ContinueReadingCard"
import ArticleGrid from "@/components/academy/ArticleGrid"
import {
  ACADEMY_ARTICLES,
  ACADEMY_CATEGORIES,
  getArticle,
  type AcademyArticle,
} from "@/lib/academy"
import { getLastOpened, getProgress } from "@/lib/academyProgress"

// Diacritic-insensitive, case-insensitive match so "hladat" finds "hľadať".
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const RECOMMENDED = ACADEMY_ARTICLES[0] // article #1 — the intro guide

export default function AcademyLanding() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL_CATEGORY)

  // Continue-reading. Initialised deterministically to the recommended intro
  // (matches SSR); upgraded to the last-opened article after mount.
  const [resume, setResume] = useState<{
    article: AcademyArticle
    progress: number
    isRecommendedIntro: boolean
  }>({ article: RECOMMENDED, progress: 0, isRecommendedIntro: true })

  useEffect(() => {
    const last = getLastOpened()
    const article = last ? getArticle(last) : undefined
    if (article) {
      setResume({ article, progress: getProgress(article.slug), isRecommendedIntro: false })
    } else {
      setResume((r) => ({ ...r, progress: getProgress(RECOMMENDED.slug) }))
    }
  }, [])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return ACADEMY_ARTICLES.filter((a) => {
      if (category !== ALL_CATEGORY && a.categorySlug !== category) return false
      if (!q) return true
      const hay = normalize(`${a.title} ${a.description}`)
      return hay.includes(q)
    })
  }, [query, category])

  // Group filtered articles by category, in category display order.
  const groups = useMemo(() => {
    return ACADEMY_CATEGORIES.map((c) => ({
      categorySlug: c.slug,
      articles: filtered.filter((a) => a.categorySlug === c.slug),
    })).filter((g) => g.articles.length > 0)
  }, [filtered])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <AcademyHero>
        <AcademySearch value={query} onChange={setQuery} />
      </AcademyHero>

      {/* Continue reading */}
      <section aria-label="Pokračovať v čítaní" className="mt-8">
        <ContinueReadingCard
          article={resume.article}
          progress={resume.progress}
          label={resume.isRecommendedIntro ? "Odporúčaný úvod" : "Pokračovať v čítaní"}
        />
      </section>

      {/* Filters */}
      <div className="mt-10">
        <CategoryFilters active={category} onChange={setCategory} />
      </div>

      {/* Results */}
      <div className="mt-8">
        {groups.length > 0 ? (
          <ArticleGrid groups={groups} showGroupHeadings={category === ALL_CATEGORY} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <SearchIcon className="mx-auto mb-3 h-6 w-6 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              Pre „{query}“ sme nenašli žiadny článok.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory(ALL_CATEGORY)
              }}
              className="mt-3 text-xs font-medium text-steel underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
            >
              Zrušiť filtre
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
