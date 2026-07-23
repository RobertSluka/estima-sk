import type { Metadata } from "next"
import LegalDoc from "@/components/LegalDoc"

export const metadata: Metadata = {
  title: "Ochrana osobných údajov — Estima",
  description:
    "Aké osobné údaje služba Estima spracúva, na aký účel, ako dlho ich uchováva a aké práva máte podľa GDPR.",
}

export default function PrivacyPage() {
  return <LegalDoc doc="privacy" />
}
