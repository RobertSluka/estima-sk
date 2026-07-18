"use client"

// Monitoring — localStorage-backed saved searches and notification settings.
// Same per-browser approach as lib/saved.ts (no auth backend for these yet);
// a window event keeps mounted components in sync across toggles.

const SEARCHES_KEY = "estima-sk.savedSearches"
const SETTINGS_KEY = "estima-sk.monitoringSettings"
const EVENT = "estima-sk:monitoring-changed"

// Snapshot of the /inzeraty filter state — must stay shape-compatible with
// `initialFilters` in app/inzeraty/page.tsx.
export interface SearchFilters {
  q: string
  deal: "all" | "sale" | "rent"
  layouts: string[]
  region: string
  priceSaleMin: string
  priceSaleMax: string
  priceRentMin: string
  priceRentMax: string
  areaMin: string
  areaMax: string
  sort: string
}

export interface SavedSearch {
  id: string
  filters: SearchFilters
  createdAt: string
}

export interface MonitoringSettings {
  // Show price drops of watched listings in the Activity tab.
  priceDrops: boolean
  // New-listing alerts for saved searches — reserved, no pipeline yet.
  newListings: boolean
}

export const defaultSettings: MonitoringSettings = {
  priceDrops: true,
  newListings: false,
}

function emit() {
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(SEARCHES_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr)
      ? arr.filter((s) => s && typeof s.id === "string" && s.filters)
      : []
  } catch {
    return []
  }
}

export function saveSearch(filters: SearchFilters): SavedSearch {
  const entry: SavedSearch = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    filters,
    createdAt: new Date().toISOString(),
  }
  const next = [entry, ...getSavedSearches()]
  window.localStorage.setItem(SEARCHES_KEY, JSON.stringify(next))
  emit()
  return entry
}

export function removeSearch(id: string): void {
  const next = getSavedSearches().filter((s) => s.id !== id)
  window.localStorage.setItem(SEARCHES_KEY, JSON.stringify(next))
  emit()
}

// Two searches with identical filters are the same search — used to render
// the Save button as already-saved.
export function findSearchByFilters(filters: SearchFilters): SavedSearch | null {
  const key = JSON.stringify(filtersToQuery(filters).toString())
  return (
    getSavedSearches().find(
      (s) => JSON.stringify(filtersToQuery(s.filters).toString()) === key,
    ) ?? null
  )
}

export function getMonitoringSettings(): MonitoringSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function setMonitoringSettings(patch: Partial<MonitoringSettings>): void {
  const next = { ...getMonitoringSettings(), ...patch }
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  emit()
}

export function onMonitoringChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

// ── Filters ↔ URL query ────────────────────────────────────────────────────
// Only non-default values are serialized, so saved-search links stay short
// and an empty query means the default listing view.

export function filtersToQuery(f: SearchFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.q) p.set("q", f.q)
  if (f.deal !== "all") p.set("deal", f.deal)
  if (f.layouts.length) p.set("layouts", f.layouts.join(","))
  if (f.region !== "all") p.set("region", f.region)
  if (f.priceSaleMin) p.set("psMin", f.priceSaleMin)
  if (f.priceSaleMax) p.set("psMax", f.priceSaleMax)
  if (f.priceRentMin) p.set("prMin", f.priceRentMin)
  if (f.priceRentMax) p.set("prMax", f.priceRentMax)
  if (f.areaMin) p.set("areaMin", f.areaMin)
  if (f.areaMax) p.set("areaMax", f.areaMax)
  if (f.sort !== "newest") p.set("sort", f.sort)
  return p
}

export function queryToFilters(
  search: string,
  defaults: SearchFilters,
): SearchFilters {
  const p = new URLSearchParams(search)
  const deal = p.get("deal")
  return {
    ...defaults,
    q: p.get("q") ?? defaults.q,
    deal: deal === "sale" || deal === "rent" ? deal : defaults.deal,
    layouts: p.get("layouts")?.split(",").filter(Boolean) ?? defaults.layouts,
    region: p.get("region") ?? defaults.region,
    priceSaleMin: p.get("psMin") ?? defaults.priceSaleMin,
    priceSaleMax: p.get("psMax") ?? defaults.priceSaleMax,
    priceRentMin: p.get("prMin") ?? defaults.priceRentMin,
    priceRentMax: p.get("prMax") ?? defaults.priceRentMax,
    areaMin: p.get("areaMin") ?? defaults.areaMin,
    areaMax: p.get("areaMax") ?? defaults.areaMax,
    sort: p.get("sort") ?? defaults.sort,
  }
}
