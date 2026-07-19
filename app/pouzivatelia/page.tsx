"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Search, Users as UsersIcon, ShieldCheck, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { useSession, isAdmin } from "@/lib/user"

interface UserRow {
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

const PAGE_SIZE = 50

// Steel toggle switch matching the monitoring settings control.
function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors shrink-0",
        checked ? "bg-slate-900" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
          checked ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  )
}

export default function UsersAdminPage() {
  const { t, lang } = useI18n()
  const session = useSession()
  const admin = isAdmin(session)

  const [rows, setRows] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [saving, setSaving] = useState<number | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(
    async (query: string, offset: number) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        })
        if (query) params.set("q", query)
        const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store" })
        if (!res.ok) {
          setError(res.status === 503 ? "not_configured" : "load_failed")
          return
        }
        const data = await res.json()
        setRows((prev) => (offset === 0 ? data.users : [...prev, ...data.users]))
        setTotal(data.total ?? 0)
      } catch {
        setError("load_failed")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Initial + debounced-search load, once we know the viewer is an admin.
  useEffect(() => {
    if (!admin) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => load(q.trim(), 0), q ? 300 : 0)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [q, admin, load])

  async function patch(id: number, access: { role?: "user" | "admin"; pro_override?: boolean }) {
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(access),
      })
      if (!res.ok) return
      const data = await res.json()
      const u = data.user
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, role: u.role, pro_override: u.pro_override, plan: u.plan }
            : r,
        ),
      )
    } finally {
      setSaving(null)
    }
  }

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "sk" ? "sk-SK" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [lang],
  )

  // ── Access states ──────────────────────────────────────────────────────────
  if (session.loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center text-sm text-slate-400">
        {t("common.loading")}
      </div>
    )
  }
  if (!admin) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">{t("users.title")}</h1>
        <Card className="mt-6 border-dashed">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ShieldCheck className="h-6 w-6 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium">{t("users.notAuthorized")}</p>
            <Link
              href="/inzeraty"
              className="mt-3 text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {t("users.backHome")}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-900">{t("users.title")}</h1>
      </div>
      <p className="text-sm text-slate-500 mt-1 mb-6">{t("users.subtitle")}</p>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("users.search")}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {error === "not_configured" ? (
        <Card>
          <CardContent className="py-14 flex flex-col items-center text-center">
            <AlertCircle className="h-6 w-6 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium">{t("users.notConfigured")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 font-semibold">{t("users.colUser")}</th>
                    <th className="px-3 py-3 font-semibold">{t("users.colPlan")}</th>
                    <th className="px-3 py-3 font-semibold text-center">{t("users.colPro")}</th>
                    <th className="px-3 py-3 font-semibold text-center">{t("users.colAdmin")}</th>
                    <th className="px-5 py-3 font-semibold text-right">{t("users.colJoined")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => {
                    const isSelf = session.user?.id === u.id
                    const busy = saving === u.id
                    return (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 overflow-hidden">
                              {u.picture_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.picture_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                (u.name ?? u.email)[0]?.toUpperCase()
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate flex items-center gap-1.5">
                                {u.name ?? u.email.split("@")[0]}
                                {isSelf && (
                                  <span className="text-[10px] font-normal text-slate-400">
                                    ({t("users.you")})
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {u.email}
                                {u.has_google && <span className="ml-1.5">· Google</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={u.plan === "pro" ? "fair" : "secondary"}>
                            {u.plan === "pro" ? t("users.planPro") : t("users.planBasic")}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-center">
                            <Toggle
                              checked={u.pro_override}
                              disabled={busy}
                              label={t("users.colPro")}
                              onChange={() => patch(u.id, { pro_override: !u.pro_override })}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-center">
                            <Toggle
                              checked={u.role === "admin"}
                              disabled={busy || isSelf}
                              label={t("users.colAdmin")}
                              onChange={() =>
                                patch(u.id, { role: u.role === "admin" ? "user" : "admin" })
                              }
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-slate-400 tabular-nums whitespace-nowrap">
                          {u.created_at ? dateFmt.format(new Date(u.created_at)) : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.loading")}
              </div>
            )}
            {!loading && rows.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">{t("users.empty")}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Count + load more */}
      {!error && rows.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {t("users.count", { shown: rows.length, total })}
          </p>
          {rows.length < total && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => load(q.trim(), rows.length)}
            >
              {t("users.loadMore")}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
