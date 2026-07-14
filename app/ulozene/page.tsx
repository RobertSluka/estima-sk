"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ListingCard from "@/components/ListingCard"
import { fetchAllListings, type Listing } from "@/lib/api"
import { getSavedIds, onSavedChange } from "@/lib/saved"
import { useI18n } from "@/lib/i18n"

export default function SavedPage() {
  const { t } = useI18n()
  const [all, setAll] = useState<Listing[]>([])
  const [ids, setIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIds(getSavedIds())
    const off = onSavedChange(() => setIds(getSavedIds()))
    fetchAllListings()
      .then((d) => setAll(d.items))
      .catch(() => setAll([]))
      .finally(() => setLoading(false))
    return off
  }, [])

  const saved = all.filter((l) => ids.includes(l.id))

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("saved.title")}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        {loading ? t("common.loading") : t("saved.count", { n: saved.length })}
      </p>

      {!loading && saved.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Heart className="h-6 w-6 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t("saved.empty")}</p>
            <Link
              href="/inzeraty"
              className="mt-3 inline-block text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {t("saved.browse")}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  )
}
