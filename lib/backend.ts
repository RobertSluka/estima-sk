// Server-side client for estima-sk-backend's /internal/* account & billing
// API (src/read_api.py). Server-only: the INTERNAL_API_KEY shared secret must
// never reach the browser, so never import this from client components.
//
//   BACKEND_INTERNAL_URL  base URL the Next.js *server* uses to reach the
//                         backend (defaults to NEXT_PUBLIC_API_URL, then
//                         http://localhost:8011 — in Docker use the service
//                         name, e.g. http://read-api:8000)
//   INTERNAL_API_KEY      shared secret; accounts are disabled while unset,
//                         matching the backend's fail-closed behaviour

const KEY = () => process.env.INTERNAL_API_KEY || ""

function baseUrl(): string {
  const url =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8011"
  return url.replace(/\/$/, "")
}

/** True when multi-user accounts are available (shared secret configured). */
export function accountsConfigured(): boolean {
  return Boolean(KEY())
}

export interface BackendSubscription {
  status: string
  plan: string
  stripe_customer_id: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export interface BackendUser {
  id: number
  email: string
  name: string | null
  picture_url: string | null
  has_google: boolean
  role: "user" | "admin"
  pro_override: boolean
  plan: "basic" | "pro"
  subscription: BackendSubscription | null
}

/** A row in the admin user directory (lighter than BackendUser). */
export interface BackendUserRow {
  id: number
  email: string
  name: string | null
  picture_url: string | null
  has_google: boolean
  role: "user" | "admin"
  pro_override: boolean
  plan: "basic" | "pro"
  sub_status: string | null
  created_at: string | null
}

export interface BackendUserList {
  users: BackendUserRow[]
  total: number
  limit: number
  offset: number
}

interface InternalResult<T> {
  status: number
  data: T | null
}

async function call<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<InternalResult<T>> {
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method: init?.method ?? (init?.body !== undefined ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": KEY(),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    })
    const data = await res.json().catch(() => null)
    return { status: res.status, data: data as T | null }
  } catch {
    // Backend unreachable — callers degrade (e.g. session falls back to token claims).
    return { status: 0, data: null }
  }
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<InternalResult<{ user: BackendUser }>> {
  return call("/internal/auth/verify", { body: { email, password } })
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<InternalResult<{ user: BackendUser }>> {
  return call("/internal/auth/register", { body: { email, password, name } })
}

export async function googleSignIn(claims: {
  sub: string
  email: string
  name?: string
  picture?: string
}): Promise<InternalResult<{ user: BackendUser }>> {
  return call("/internal/auth/google", { body: claims })
}

export async function getUser(id: number): Promise<InternalResult<{ user: BackendUser }>> {
  return call(`/internal/auth/users/${id}`)
}

export async function listUsers(query: {
  limit?: number
  offset?: number
  q?: string
}): Promise<InternalResult<BackendUserList>> {
  const params = new URLSearchParams()
  if (query.limit != null) params.set("limit", String(query.limit))
  if (query.offset != null) params.set("offset", String(query.offset))
  if (query.q) params.set("q", query.q)
  const qs = params.toString()
  return call(`/internal/users${qs ? `?${qs}` : ""}`)
}

export async function setUserAccess(
  id: number,
  access: { role?: "user" | "admin"; pro_override?: boolean },
): Promise<InternalResult<{ user: BackendUser }>> {
  return call(`/internal/users/${id}`, { method: "PATCH", body: access })
}

export async function updateSubscription(update: {
  user_id?: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan?: string
  status?: string
  current_period_end?: number
  cancel_at_period_end?: boolean
}): Promise<InternalResult<{ user_id: number; plan: string }>> {
  return call("/internal/billing/subscription", { body: update })
}
