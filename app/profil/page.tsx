"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useSession, updateProfile, changePassword } from "@/lib/user"

export default function ProfilePage() {
  const { t } = useI18n()
  const session = useSession()
  const user = session.user

  // Name form
  const [name, setName] = useState("")
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Password form
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  function mapErr(code: string): string {
    switch (code) {
      case "wrong_password":
        return t("profile.wrongPassword")
      case "weak_password":
        return t("profile.weakPassword")
      case "name_required":
        return t("profile.nameRequired")
      default:
        return t("profile.saveError")
    }
  }

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (nameSaving) return
    setNameSaving(true)
    setNameMsg(null)
    const err = await updateProfile(name.trim())
    setNameSaving(false)
    setNameMsg(err ? { ok: false, text: mapErr(err) } : { ok: true, text: t("profile.saved") })
  }

  async function onChangePw(e: React.FormEvent) {
    e.preventDefault()
    if (pwSaving) return
    setPwSaving(true)
    setPwMsg(null)
    const err = await changePassword(newPw, user?.has_password ? currentPw : undefined)
    setPwSaving(false)
    if (err) {
      setPwMsg({ ok: false, text: mapErr(err) })
      return
    }
    setCurrentPw("")
    setNewPw("")
    setPwMsg({ ok: true, text: t("profile.passwordSaved") })
  }

  // ── Access states ──────────────────────────────────────────────────────────
  if (session.loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-slate-400">
        {t("common.loading")}
      </div>
    )
  }
  if (!session.authenticated || !user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
        <Card className="mt-6 border-dashed">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <UserIcon className="h-6 w-6 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium">{t("profile.signInPrompt")}</p>
            <Link
              href="/prihlasenie?next=/profil"
              className="mt-3 text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {t("signin.title")}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The env-var admin account has no editable backend row.
  const editable = user.role === "user" && Boolean(user.id)
  const isPro = user.plan === "pro"

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
      </div>
      <p className="text-sm text-slate-500 mt-1 mb-6">{t("profile.subtitle")}</p>

      {/* Identity summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white select-none">
                {(user.name || user.email)[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email}
              </p>
            </div>
            <span
              className={
                "ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide " +
                (isPro
                  ? "border border-steel/35 bg-steel/10 text-steel"
                  : "border border-slate-200 bg-slate-50 text-slate-500")
              }
            >
              {isPro && <Sparkles className="h-3 w-3" />}
              {user.role === "admin"
                ? t("navbar.roleAdmin")
                : isPro
                  ? t("navbar.rolePro")
                  : t("profile.planBasic")}
            </span>
          </div>

          {/* Sign-in methods + plan action */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            {user.has_password && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                {t("profile.methodPassword")}
              </span>
            )}
            {user.has_google && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {t("profile.methodGoogle")}
              </span>
            )}
            <Link
              href="/cennik"
              className="ml-auto text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {isPro ? t("profile.manageBilling") : t("profile.upgrade")}
            </Link>
          </div>
        </CardContent>
      </Card>

      {!editable ? (
        <p className="mt-4 text-xs text-slate-400">{t("profile.adminReadOnly")}</p>
      ) : (
        <>
          {/* Display name */}
          <Card className="mt-5">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                {t("profile.nameSection")}
              </h2>
              <form onSubmit={onSaveName} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500">
                    {t("signin.name")}
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-9 text-sm"
                    placeholder="Jana Nováková"
                  />
                </div>
                <Button type="submit" disabled={nameSaving} className="sm:w-auto">
                  {nameSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("profile.saveName")
                  )}
                </Button>
              </form>
              {nameMsg && <FormMsg msg={nameMsg} />}
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="mt-5">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                {user.has_password ? t("profile.passwordSection") : t("profile.setPasswordSection")}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {user.has_password
                  ? t("profile.passwordHint")
                  : t("profile.setPasswordHint")}
              </p>
              <form onSubmit={onChangePw} className="mt-3 space-y-3">
                {user.has_password && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      {t("profile.currentPassword")}
                    </label>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    {t("profile.newPassword")}
                  </label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <Button type="submit" disabled={pwSaving}>
                  {pwSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : user.has_password ? (
                    t("profile.changePassword")
                  ) : (
                    t("profile.setPassword")
                  )}
                </Button>
              </form>
              {pwMsg && <FormMsg msg={pwMsg} />}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function FormMsg({ msg }: { msg: { ok: boolean; text: string } }) {
  return (
    <div
      className={
        "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm " +
        (msg.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-700")
      }
    >
      {msg.ok ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      {msg.text}
    </div>
  )
}
