import type { Metadata } from "next"
import AcademyLanding from "@/components/academy/AcademyLanding"

export const metadata: Metadata = {
  title: "Estima Akadémia — príručky pre realitných maklérov",
  description:
    "Praktické príručky o oceňovaní nehnuteľností podloženom dátami, čítaní signálov trhu a komunikácii s klientom.",
}

export default function AcademyPage() {
  return <AcademyLanding />
}
