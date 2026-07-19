"use client"

// Client-side session state (see lib/auth.ts for the server core).
// `useSession()` reflects the httpOnly session cookie via /api/auth/me; a
// window event keeps every mounted component in sync after login/logout.
// Never hardcode an identity here — signed-out UI until the cookie says
// otherwise.

import { useEffect, useState } from "react"

export interface SessionSubscription {
  status: string
  plan: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export interface SessionUser {
  id?: number
  email: string
  name: string
  role: "admin" | "user"
  picture?: string | null
  plan?: "basic" | "pro"
  subscription?: SessionSubscription | null
}

export interface Session {
  loading: boolean
  authenticated: boolean
  user: SessionUser | null
}

const EVENT = "estima-sk:session-changed"

let cached: Omit<Session, "loading"> | null = null

async function fetchSession(): Promise<Omit<Session, "loading">> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" })
    const data = await res.json()
    return { authenticated: Boolean(data.authenticated), user: data.user ?? null }
  } catch {
    return { authenticated: false, user: null }
  }
}

function notify() {
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function useSession(): Session {
  const [state, setState] = useState<Session>(
    cached ? { loading: false, ...cached } : { loading: true, authenticated: false, user: null },
  )

  useEffect(() => {
    let mounted = true
    const refresh = () =>
      fetchSession().then((s) => {
        cached = s
        if (mounted) setState({ loading: false, ...s })
      })
    refresh()
    window.addEventListener(EVENT, refresh)
    return () => {
      mounted = false
      window.removeEventListener(EVENT, refresh)
    }
  }, [])

  return state
}

/** True when the session has paid (or admin-granted) access to Pro features. */
export function isPro(session: Session): boolean {
  return session.authenticated && session.user?.plan === "pro"
}

/** True when the signed-in user is an administrator. */
export function isAdmin(session: Session): boolean {
  return session.authenticated && session.user?.role === "admin"
}

/** Sign in; resolves to null on success or an error code on failure. */
export async function login(email: string, password: string): Promise<string | null> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (res.ok) {
    cached = null
    notify()
    return null
  }
  const data = await res.json().catch(() => ({}))
  return data.error ?? "login_failed"
}

/** Create an account (auto signs in); null on success or an error code. */
export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<string | null> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  })
  if (res.ok) {
    cached = null
    notify()
    return null
  }
  const data = await res.json().catch(() => ({}))
  return data.error ?? "registration_failed"
}

export interface AuthProviders {
  password: boolean
  registration: boolean
  google: boolean
  billing: boolean
}

/** Which sign-in methods this deployment supports (drives the sign-in page UI). */
export async function fetchAuthProviders(): Promise<AuthProviders> {
  try {
    const res = await fetch("/api/auth/config", { cache: "no-store" })
    return await res.json()
  } catch {
    return { password: true, registration: false, google: false, billing: false }
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" })
  cached = null
  notify()
}
