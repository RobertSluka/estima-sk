"use client"

import { useEffect, useState } from "react"
import { MapPin, Home, Maximize2, ArrowUpRight, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { type Listing } from "@/lib/api"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { isSaved, toggleSaved, onSavedChange } from "@/lib/saved"
import { cn } from "@/lib/utils"

// Shared listing card for the listings grid. Links out to the source portal
// (Bazoš) until a local detail page exists.
export default function ListingCard({ listing: l }: { listing: Listing }) {
  const { t } = useI18n()
  const [saved, setSaved] = useState(false)

  // localStorage is client-only — read after mount and follow global toggles.
  useEffect(() => {
    setSaved(isSaved(l.id))
    return onSavedChange(() => setSaved(isSaved(l.id)))
  }, [l.id])
  return (
    <a
      href={l.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          {l.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={l.imageUrl}
              alt={l.name ?? "Inzerát"}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Home className="h-8 w-8 text-slate-300" />
            </div>
          )}
          {l.dealType && (
            <span className="absolute top-2 left-2 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
              {l.dealType === "sale"
                ? t("listings.dealSale")
                : t("listings.dealRent")}
            </span>
          )}
          <button
            type="button"
            aria-label={saved ? t("saved.remove") : t("saved.add")}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleSaved(l.id)
            }}
            className={cn(
              "absolute top-2 right-2 rounded-full p-1.5 transition-colors",
              saved
                ? "bg-rose-600 text-white"
                : "bg-slate-900/60 text-white hover:bg-slate-900/80",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", saved && "fill-current")} />
          </button>
          <span className="absolute bottom-2 right-2 rounded bg-slate-900/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Body */}
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {l.name ?? t("listings.untitled")}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {l.locality ?? "—"}
              {l.region ? ` · ${l.region} kraj` : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-slate-500">
            {l.layout && (
              <span className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {l.layout}
              </span>
            )}
            {l.floorArea != null && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                {formatNumber(l.floorArea)} m²
              </span>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-base font-bold text-slate-900">
              {l.price != null ? formatEUR(l.price) : t("listings.priceNa")}
              {l.price != null && l.dealType === "rent" && (
                <span className="text-xs font-normal text-slate-400">
                  {" "}
                  {t("listings.perMonth")}
                </span>
              )}
            </p>
            {l.pricePerSqm != null && (
              <p className="text-xs text-slate-400">
                {formatEUR(l.pricePerSqm)}/m²
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
