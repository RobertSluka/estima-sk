// ─── Academy reading progress (client-only) ──────────────────────────────────
// Tracks the last-opened article and a per-article scroll progress in
// localStorage so the landing page can offer a "Pokračovať" (continue-reading)
// card. All reads are SSR-safe (guard `window`) and tolerant of malformed
// storage — a broken value just resets to empty.

const KEY = "estima.academy.v1"

interface AcademyState {
  lastSlug: string | null
  progress: Record<string, number> // slug → 0..100 (max reached)
}

const EMPTY: AcademyState = { lastSlug: null, progress: {} }

function read(): AcademyState {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<AcademyState>
    return {
      lastSlug: typeof parsed.lastSlug === "string" ? parsed.lastSlug : null,
      progress:
        parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
    }
  } catch {
    return EMPTY
  }
}

function write(state: AcademyState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / disabled — progress is best-effort */
  }
}

/** Slug of the most recently opened article, or null if none yet. */
export function getLastOpened(): string | null {
  return read().lastSlug
}

/** Max scroll progress reached for an article, 0..100. */
export function getProgress(slug: string): number {
  return Math.round(read().progress[slug] ?? 0)
}

/** Mark an article as the most recently opened one. */
export function recordOpen(slug: string): void {
  const state = read()
  write({ ...state, lastSlug: slug })
}

/** Record scroll progress (kept monotonic — only increases). */
export function recordProgress(slug: string, pct: number): void {
  const state = read()
  const clamped = Math.max(0, Math.min(100, Math.round(pct)))
  if (clamped <= (state.progress[slug] ?? 0)) return
  write({ ...state, progress: { ...state.progress, [slug]: clamped } })
}
