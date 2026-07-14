"use client"

import { useState } from "react"
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Zap,
  Lock,
  Send,
  CheckCircle2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

const PHONE_DISPLAY = "+420 727 906 474"
const PHONE_TEL = "+420727906474"
const EMAIL = "hello@estima.sk"
const OFFICE = ["Estima", "Bratislava, Slovensko"]

/* ── shared atom, matching the marketing pages' design language ───────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
      <span className="inline-block w-2 h-2 rounded-full border border-slate-300 shrink-0" />
      {children}
    </p>
  )
}

export default function ContactPage() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // No contact backend yet — confirm receipt client-side. Wire to an API
    // route or email service here when one exists.
    setSent(true)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Left: pitch + contact details ─────────────────────────────── */}
        <div>
          <SectionLabel>{t("contact.label")}</SectionLabel>

          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            {t("contact.title")}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-500">
            {t("contact.subtitle")}
          </p>

          {/* details card */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white/60 p-2">
            <a
              href={`tel:${PHONE_TEL}`}
              className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:bg-slate-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Phone className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {t("contact.phoneLabel")}
                </span>
                <span className="block text-base font-semibold text-slate-900">
                  {PHONE_DISPLAY}
                </span>
              </span>
            </a>

            <div className="mx-4 border-t border-slate-100" />

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:bg-slate-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Mail className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {t("contact.emailLabel")}
                </span>
                <span className="block text-base font-semibold text-slate-900">
                  {EMAIL}
                </span>
              </span>
            </a>

            <div className="mx-4 border-t border-slate-100" />

            <div className="flex items-start gap-4 rounded-xl px-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {t("contact.officeLabel")}
                </span>
                {OFFICE.map((line) => (
                  <span
                    key={line}
                    className="block text-base font-semibold text-slate-900"
                  >
                    {line}
                  </span>
                ))}
              </span>
            </div>
          </div>

          {/* respond-fast note */}
          <div className="mt-8 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Zap className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {t("contact.respondTitle")}
              </span>
              <span className="block text-sm text-slate-500">
                {t("contact.respondBody")}
              </span>
            </span>
          </div>
        </div>

        {/* ── Right: message card ───────────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          {/* header */}
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="h-6 w-6" />
            </span>
            <span>
              <h2 className="text-xl font-bold text-slate-900">
                {t("contact.formTitle")}
              </h2>
              <p className="text-sm text-slate-500">{t("contact.formSub")}</p>
            </span>
          </div>

          {sent ? (
            <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                {t("contact.sent")}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setForm({ name: "", email: "", company: "", message: "" })
                  setSent(false)
                }}
              >
                {t("contact.sendAnother")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.name")}</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("contact.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t("contact.emailPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">{t("contact.company")}</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder={t("contact.companyPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("contact.messagePlaceholder")}
                  className="flex w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                />
              </div>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" className="gap-2 rounded-full px-7">
                  {t("contact.send")}
                  <Send className="h-4 w-4" />
                </Button>
                <p className="flex items-start gap-2 text-xs text-slate-400 sm:max-w-[16rem]">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t("contact.secure")}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
