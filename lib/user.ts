"use client"

// Client-side session state for the single admin account (see lib/auth.ts).
// `useSession()` reflects the httpOnly session cookie via /api/auth/me; a
// window event keeps every mounted component in sync after login/logout.
// Never hardcode an identity here — signed-out UI until the cookie says
// otherwise.

import { useEffect, useState } from "react"

export interface SessionUser {
  email: string
  name: string
  role: "admin"
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

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" })
  cached = null
  notify()
}
