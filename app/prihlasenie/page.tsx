"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { login } from "@/lib/user"

export default function SignInPage() {
  const { t, lang, setLang } = useI18n()
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const err = await login(email, password)
    setSubmitting(false)
    if (err) {
      setError(err === "auth_not_configured" ? t("signin.notConfigured") : t("signin.error"))
      return
    }
    router.replace("/inzeraty")
  }

  return (
    // Full-screen overlay so the app chrome (sidebar/navbar) is hidden on this page.
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#f7f7f8]">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            Estima<span className="text-emerald-600">.sk</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "sk" ? "en" : "sk")}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            {lang.toUpperCase()}
          </button>
          <span className="text-sm font-medium text-slate-900">{t("signin.title")}</span>
        </div>
      </header>

      {/* Centered card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Estima<span className="text-emerald-600">.sk</span>
            </span>
          </div>

          {/* No-auth-yet notice */}
          <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3 text-sm text-slate-600">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              {t("signin.byInvitationPre")}{" "}
              <a
                href="mailto:hello@estima.sk"
                className="font-semibold text-slate-900 hover:underline"
              >
                {t("signin.requestAccess")}
              </a>
            </p>
          </div>

          <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
            {t("signin.title")}
          </h1>

          {/* Providers */}
          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <GoogleIcon />
              {t("signin.continueGoogle")}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">{t("signin.orEmail")}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Email form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">
                {t("signin.email")}
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vy@priklad.sk"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  {t("signin.password")}
                </label>
                <a href="#" className="text-xs text-slate-500 hover:text-slate-900">
                  {t("signin.forgotPassword")}
                </a>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? t("signin.submitting") : t("signin.submit")}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {t("signin.noAccount")}{" "}
            <a href="#" className="font-semibold text-slate-900 hover:underline">
              {t("signin.createAccount")}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
