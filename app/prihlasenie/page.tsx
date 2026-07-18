"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { fetchAuthProviders, login, register, type AuthProviders } from "@/lib/user"

// Small inline Google "G" so no external assets are needed.
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76z"
      />
    </svg>
  )
}

function SignInForm() {
  const { t, lang, setLang } = useI18n()
  const router = useRouter()
  const params = useSearchParams()

  const [providers, setProviders] = useState<AuthProviders | null>(null)
  const [mode, setMode] = useState<"signin" | "register">(
    params.get("mode") === "register" ? "register" : "signin",
  )
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const nextUrl = params.get("next") || "/inzeraty"

  useEffect(() => {
    fetchAuthProviders().then(setProviders)
    // The Google callback bounces back here with ?error=google on failure.
    if (params.get("error") === "google") setError(t("signin.googleError"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function mapError(code: string): string {
    switch (code) {
      case "email_taken":
        return t("signin.emailTaken")
      case "weak_password":
        return t("signin.weakPassword")
      case "auth_not_configured":
      case "registration_not_configured":
        return t("signin.notConfigured")
      default:
        return t("signin.error")
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const err =
      mode === "register"
        ? await register(email, password, name || undefined)
        : await login(email, password)
    setSubmitting(false)
    if (err) {
      setError(mapError(err))
      return
    }
    router.replace(nextUrl)
  }

  const registering = mode === "register"
  const canRegister = providers?.registration ?? false
  const showGoogle = providers?.google ?? false

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

          {/* Invitation notice only while open registration isn't available. */}
          {providers && !canRegister && (
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
          )}

          <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
            {registering ? t("signin.createAccount") : t("signin.title")}
          </h1>

          {/* Google */}
          {showGoogle && (
            <>
              <a
                href={`/api/auth/google?next=${encodeURIComponent(nextUrl)}`}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <GoogleIcon />
                {t("signin.continueGoogle")}
              </a>
              <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                {t("signin.orEmail")}
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}

          {/* E-mail + password */}
          <form onSubmit={onSubmit} className={showGoogle ? "mt-5 space-y-4" : "mt-6 space-y-4"}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {registering && (
              <div>
                <label className="text-sm font-medium text-slate-700">{t("signin.name")}</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
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
                {!registering && (
                  <a
                    href="mailto:hello@estima.sk"
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    {t("signin.forgotPassword")}
                  </a>
                )}
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={registering ? 8 : undefined}
                  autoComplete={registering ? "new-password" : "current-password"}
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
              {submitting
                ? registering
                  ? t("signin.registerSubmitting")
                  : t("signin.submitting")
                : registering
                  ? t("signin.createAccount")
                  : t("signin.submit")}
            </Button>
          </form>

          {/* Mode toggle */}
          {canRegister && (
            <p className="mt-5 text-center text-sm text-slate-500">
              {registering ? t("signin.haveAccount") : t("signin.noAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(registering ? "signin" : "register")
                  setError(null)
                }}
                className="font-semibold text-slate-900 hover:underline"
              >
                {registering ? t("signin.submit") : t("signin.createAccount")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  // useSearchParams requires a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}
