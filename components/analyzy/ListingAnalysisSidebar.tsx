"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import type { Listing } from "@/lib/api"
import type { ReportStatus } from "@/lib/analyza"
import { useI18n } from "@/lib/i18n"
import AnalysisListingCard from "./AnalysisListingCard"

type Tab = "all" | "ready" | "drafts" | "generated"

const TABS: Tab[] = ["all", "ready", "drafts", "generated"]
const STATUS_OPTIONS: ReportStatus[] = [
  "ready",
  "pdf_generated",
  "outdated_price",
  "missing_data",
  "not_analysed",
]

// Which statuses each tab collects.
function inTab(tab: Tab, status: ReportStatus): boolean {
  if (tab === "all") return true
  if (tab === "ready") return status === "ready"
  if (tab === "generated") return status === "pdf_generated"
  // drafts = everything still in progress
  return status === "not_analysed" || status === "missing_data" || status === "outdated_price"
}

interface Props {
  listings: Listing[]
  statuses: Record<string, ReportStatus>
  selectedId: string | null
  onSelect: (l: Listing) => void
  comparableIds: Set<string>
  onToggleComparable: (l: Listing) => void
  loading: boolean
  failed: boolean
}

const selectClass =
  "min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"

export default function ListingAnalysisSidebar({
  listings,
  statuses,
  selectedId,
  onSelect,
  comparableIds,
  onToggleComparable,
  loading,
  failed,
}: Props) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("all")
  const [dealType, setDealType] = useState<"all" | "sale" | "rent">("all")
  const [district, setDistrict] = useState("all")
  const [layout, setLayout] = useState("all")
  const [status, setStatus] = useState<ReportStatus | "all">("all")

  const districts = useMemo(
    () => Array.from(new Set(listings.map((l) => l.district).filter(Boolean))).sort() as string[],
    [listings],
  )
  const layouts = useMemo(
    () => Array.from(new Set(listings.map((l) => l.layout).filter(Boolean))).sort() as string[],
    [listings],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings.filter((l) => {
      const st = statuses[l.id] ?? "not_analysed"
      if (!inTab(tab, st)) return false
      if (dealType !== "all" && l.dealType !== dealType) return false
      if (district !== "all" && l.district !== district) return false
      if (layout !== "all" && l.layout !== layout) return false
      if (status !== "all" && st !== status) return false
      if (q) {
        const hay = [l.name, l.locality, l.district].filter(Boolean).join(" ").toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [listings, statuses, query, tab, dealType, district, layout, status])

  const tabCount = (tb: Tab) =>
    listings.filter((l) => inTab(tb, statuses[l.id] ?? "not_analysed")).length

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("analyses.searchPlaceholder")}
          className="w-full text-xs border border-slate-200 rounded-md py-2 pl-9 pr-8 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-md px-1 py-1 text-[11px] font-medium leading-tight transition-colors ${
              tab === tb ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="w-full truncate text-center">{t(`analyses.tab.${tb}`)}</span>
            <span className="text-[10px] font-normal text-slate-400 tabular-nums">
              {tabCount(tb)}
            </span>
          </button>
        ))}
      </div>

      {/* Compact filters */}
      <div className="grid grid-cols-2 gap-1.5">
        <select
          className={selectClass}
          value={dealType}
          onChange={(e) => setDealType(e.target.value as typeof dealType)}
        >
          <option value="all">{t("analyses.filter.dealAll")}</option>
          <option value="sale">{t("analyses.filter.sale")}</option>
          <option value="rent">{t("analyses.filter.rent")}</option>
        </select>
        <select
          className={selectClass}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="all">{t("analyses.filter.districtAll")}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select className={selectClass} value={layout} onChange={(e) => setLayout(e.target.value)}>
          <option value="all">{t("analyses.filter.layoutAll")}</option>
          {layouts.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">{t("analyses.filter.statusAll")}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(`analyses.status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : failed ? (
        <p className="text-xs text-rose-600 py-4 text-center">{t("analyses.listError")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">{t("analyses.noResults")}</p>
      ) : (
        <>
          <p className="text-[11px] text-slate-400 px-0.5">
            {t("analyses.listCount", { n: filtered.length })}
          </p>
          <div className="max-h-[calc(100vh-360px)] lg:max-h-[calc(100vh-300px)] overflow-y-auto space-y-1.5 -mx-1 px-1">
            {filtered.map((l) => (
              <AnalysisListingCard
                key={l.id}
                listing={l}
                status={statuses[l.id] ?? "not_analysed"}
                selected={selectedId === l.id}
                onSelect={() => onSelect(l)}
                isComparable={comparableIds.has(l.id)}
                canAddComparable={selectedId != null && selectedId !== l.id}
                onToggleComparable={() => onToggleComparable(l)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
