import type { Metadata } from "next"
import LegalDoc from "@/components/LegalDoc"

export const metadata: Metadata = {
  title: "Obchodné podmienky — Estima",
  description:
    "Obchodné podmienky používania služby Estima, prevádzkovanej spoločnosťou Gemini Technology s. r. o.",
}

export default function TermsPage() {
  return <LegalDoc doc="terms" />
}
