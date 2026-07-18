"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Heart,
  Bell,
  Home,
  Trash2,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/ListingCard"
import {
  fetchAllListings,
  fetchPriceDrops,
  type Listing,
  type PriceDrop,
} from "@/lib/api"
import { getSavedIds, onSavedChange } from "@/lib/saved"
import {
  getSavedSearches,
  removeSearch,
  filtersToQuery,
  getMonitoringSettings,
  setMonitoringSettings,
  onMonitoringChange,
  type SavedSearch,
  type SearchFilters,
  type MonitoringSettings,
} from "@/lib/monitoring"
import { formatEUR, formatNumber, cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

type TabId = "searches" | "watched" | "activity" | "settings"

const tabs: { id: TabId; key: string }[] = [
  { id: "searches", key: "monitor.tabSearches" },
  { id: "watched", key: "monitor.tabWatched" },
  { id: "activity", key: "monitor.tabActivity" },
  { id: "settings", key: "monitor.tabSettings" },
]

// Human-readable one-liner for a saved filter set, e.g.
// "Predaj · 2+kk, 3+kk · Bratislavský kraj · do 250 000 €".
function summarize(f: SearchFilters, t: (k: string, v?: any) => string): string {
  const parts: string[] = []
  if (f.deal !== "all")
    parts.push(t(f.deal === "sale" ? "listings.dealSale" : "listings.dealRent"))
  if (f.q) parts.push(`„${f.q}“`)
  if (f.layouts.length) parts.push(f.layouts.join(", "))
  if (f.region !== "all") parts.push(f.region)
  const pMin = f.deal === "sale" ? f.priceSaleMin : f.deal === "rent" ? f.priceRentMin : ""
  const pMax = f.deal === "sale" ? f.priceSaleMax : f.deal === "rent" ? f.priceRentMax : ""
  if (pMin && pMax)
    parts.push(`${formatNumber(Number(pMin))}–${formatNumber(Number(pMax))} €`)
  else if (pMin) parts.push(`${t("monitor.from")} ${formatNumber(Number(pMin))} €`)
  else if (pMax) parts.push(`${t("monitor.upTo")} ${formatNumber(Number(pMax))} €`)
  if (f.areaMin && f.areaMax) parts.push(`${f.areaMin}–${f.areaMax} m²`)
  else if (f.areaMin) parts.push(`${t("monitor.from")} ${f.areaMin} m²`)
  else if (f.areaMax) parts.push(`${t("monitor.upTo")} ${f.areaMax} m²`)
  return parts.length ? parts.join(" · ") : t("monitor.allListings")
}

function EmptyState({
  icon: Icon,
  title,
  hint,
  cta,
  href,
}: {
  icon: typeof Search
  title: string
  hint: React.ReactNode
  cta?: string
  href?: string
}) {
  return (
    <div className="py-20 flex flex-col items-center text-center">
      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">{hint}</p>
      {cta && href && (
        <Button asChild>
          <Link href={href}>{cta}</Link>
        </Button>
      )}
    </div>
  )
}

export default function MonitoringPage() {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState<TabId>("searches")

  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [settings, setSettings] = useState<MonitoringSettings>({
    priceDrops: true,
    newListings: false,
  })
  const [watchedIds, setWatchedIds] = useState<string[]>([])
  const [all, setAll] = useState<Listing[]>([])
  const [drops, setDrops] = useState<PriceDrop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearches(getSavedSearches())
    setSettings(getMonitoringSettings())
    setWatchedIds(getSavedIds())
    const offMon = onMonitoringChange(() => {
      setSearches(getSavedSearches())
      setSettings(getMonitoringSettings())
    })
    const offSaved = onSavedChange(() => setWatchedIds(getSavedIds()))
    Promise.all([
      fetchAllListings().then((d) => setAll(d.items)),
      fetchPriceDrops({ limit: 200 }).then((d) => setDrops(d.items)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => {
      offMon()
      offSaved()
    }
  }, [])

  const watched = useMemo(
    () => all.filter((l) => watchedIds.includes(l.id)),
    [all, watchedIds],
  )

  // Activity = price cuts on listings the user watches (opt-out in Settings).
  const watchedDrops = useMemo(
    () =>
      settings.priceDrops
        ? drops.filter((d) => watchedIds.includes(d.propertyId))
        : [],
    [drops, watchedIds, settings.priceDrops],
  )

  const dateFmt = new Intl.DateTimeFormat(lang === "sk" ? "sk-SK" : "en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("monitor.title")}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">{t("monitor.subtitle")}</p>

      {/* Tab bar — active tab carries a dark underline, like the header tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-8">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "-mb-px pb-3 text-sm border-b-2 transition-colors",
              tab === tb.id
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {t(tb.key)}
            {tb.id === "searches" && searches.length > 0 && (
              <span className="ml-1.5 text-xs text-slate-400 tabular-nums">
                {searches.length}
              </span>
            )}
            {tb.id === "watched" && watchedIds.length > 0 && (
              <span className="ml-1.5 text-xs text-slate-400 tabular-nums">
                {watchedIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Searches ─────────────────────────────────────────────────────── */}
      {tab === "searches" &&
        (searches.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t("monitor.searchesEmpty")}
            hint={
              <>
                {t("monitor.searchesEmptyHint1")}{" "}
                <strong className="text-slate-700">
                  {t("monitor.searchesEmptyCta")}
                </strong>
                . {t("monitor.searchesEmptyHint2")}
              </>
            }
            cta={t("monitor.goToSearch")}
            href="/inzeraty"
          />
        ) : (
          <div className="space-y-3">
            {searches.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {summarize(s.filters, t)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("monitor.savedOn", {
                        date: dateFmt.format(new Date(s.createdAt)),
                      })}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
                    <Link href={`/inzeraty?${filtersToQuery(s.filters).toString()}`}>
                      {t("monitor.openSearch")}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <button
                    aria-label={t("monitor.deleteSearch")}
                    onClick={() => removeSearch(s.id)}
                    className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

      {/* ── Watched ──────────────────────────────────────────────────────── */}
      {tab === "watched" &&
        (loading ? (
          <p className="text-sm text-slate-400 py-12 text-center">
            {t("common.loading")}
          </p>
        ) : watched.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t("monitor.watchedEmpty")}
            hint={t("monitor.watchedEmptyHint")}
            cta={t("monitor.goToListings")}
            href="/inzeraty"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watched.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ))}

      {/* ── Activity ─────────────────────────────────────────────────────── */}
      {tab === "activity" &&
        (loading ? (
          <p className="text-sm text-slate-400 py-12 text-center">
            {t("common.loading")}
          </p>
        ) : watchedDrops.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t("monitor.activityEmpty")}
            hint={
              settings.priceDrops
                ? t("monitor.activityEmptyHint")
                : t("monitor.activityDisabledHint")
            }
          />
        ) : (
          <div className="space-y-3">
            {watchedDrops.map((d) => (
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
                      <p className="text-xs font-medium text-emerald-700 mb-0.5">
                        {t("monitor.eventPriceDrop")}
                        {d.changedAt
                          ? ` · ${dateFmt.format(new Date(d.changedAt))}`
                          : ""}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {d.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {[d.locality, d.layout].filter(Boolean).join(" · ")}
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
                      {d.percentChange != null
                        ? `${d.percentChange.toFixed(1)} %`
                        : "—"}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="max-w-2xl space-y-3">
          {(
            [
              {
                id: "priceDrops" as const,
                title: t("monitor.setPriceDrops"),
                hint: t("monitor.setPriceDropsHint"),
                disabled: false,
              },
              {
                id: "newListings" as const,
                title: t("monitor.setNewListings"),
                hint: t("monitor.setNewListingsHint"),
                disabled: true,
              },
            ]
          ).map((row) => (
            <Card key={row.id} className={cn(row.disabled && "opacity-60")}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{row.hint}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings[row.id]}
                  disabled={row.disabled}
                  onClick={() =>
                    setMonitoringSettings({ [row.id]: !settings[row.id] })
                  }
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors shrink-0",
                    settings[row.id] ? "bg-slate-900" : "bg-slate-200",
                    row.disabled && "cursor-not-allowed",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      settings[row.id] ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-slate-400 pt-2">{t("monitor.emailNote")}</p>
        </div>
      )}
    </div>
  )
}
