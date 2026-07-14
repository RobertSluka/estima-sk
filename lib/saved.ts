"use client"

// Saved listings — localStorage-backed id set. No auth backend yet, so saves
// are per-browser (same approach as the CZ app). A window event keeps every
// mounted component in sync when a heart is toggled anywhere.

const STORAGE_KEY = "estima-sk.saved"
const EVENT = "estima-sk:saved-changed"

export function getSavedIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id)
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds()
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVENT))
  return next.includes(id)
}

export function onSavedChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(EVENT, cb)
  // also react to changes from other tabs
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}
