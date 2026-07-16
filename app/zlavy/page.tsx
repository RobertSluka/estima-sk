"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingDown, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchPriceDrops, type PriceDrop } from "@/lib/api"
import { formatEUR } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

export default function PriceDropsPage() {
  const { t } = useI18n()
  const [drops, setDrops] = useState<PriceDrop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPriceDrops({ limit: 100 })
      .then((d) => setDrops(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("drops.title")}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">{t("drops.subtitle")}</p>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {!error && !loading && drops.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <TrendingDown className="h-6 w-6 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t("drops.empty")}</p>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              {t("drops.emptyHint")}
            </p>
          </CardContent>
        </Card>
      )}

      {!error && drops.length > 0 && (
        <div className="space-y-3">
          {drops.map((d) => (
            <Link
              key={d.id}
              href={`/inzeraty/${encodeURIComponent(d.propertyId)}`}
              className="block"
            >
              <Card className="hover:border-slate-300 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {d.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.imageUrl}
                      alt=""
                      className="h-16 w-20 rounded-lg object-cover shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-16 w-20 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Home className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {d.name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {[d.locality, d.region ? `${d.region} kraj` : null, d.layout]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 line-through">
                      {formatEUR(d.oldPrice)}
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatEUR(d.newPrice)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 tabular-nums">
                    {d.percentChange != null ? `${d.percentChange.toFixed(1)} %` : "—"}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
