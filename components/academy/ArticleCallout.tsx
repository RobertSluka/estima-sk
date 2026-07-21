import {
  AlertTriangle,
  BarChart3,
  FileText,
  Lightbulb,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalloutVariant } from "@/lib/academy"

// In-article callout box. `estima` is the branded "Ako pomáha Estima" panel
// carried by the source content; the other variants (tip / example / data /
// warning) are available for future content and share the same restrained
// left-accent treatment — no gradients, one subtle tint.
const VARIANTS: Record<
  CalloutVariant,
  { icon: LucideIcon; accent: string; tint: string; iconColor: string }
> = {
  estima: { icon: Sparkles, accent: "border-l-steel", tint: "bg-steel/[0.07]", iconColor: "text-steel" },
  tip: { icon: Lightbulb, accent: "border-l-steel", tint: "bg-steel/[0.07]", iconColor: "text-steel" },
  example: { icon: FileText, accent: "border-l-slate-300", tint: "bg-slate-50", iconColor: "text-slate-400" },
  data: { icon: BarChart3, accent: "border-l-steel", tint: "bg-steel/[0.07]", iconColor: "text-steel" },
  warning: { icon: AlertTriangle, accent: "border-l-amber-500", tint: "bg-amber-500/[0.07]", iconColor: "text-amber-500" },
}

export default function ArticleCallout({
  variant,
  heading,
  id,
  children,
}: {
  variant: CalloutVariant
  heading: string
  id?: string
  children: React.ReactNode
}) {
  const v = VARIANTS[variant]
  const Icon = v.icon
  return (
    <aside
      className={cn(
        "my-7 rounded-xl border border-slate-200 border-l-4 p-5",
        v.accent,
        v.tint,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", v.iconColor)} />
        <h2
          id={id}
          className="scroll-mt-24 text-sm font-semibold text-slate-900"
        >
          {heading}
        </h2>
      </div>
      <div className="space-y-2 text-[15px] leading-relaxed text-slate-600">
        {children}
      </div>
    </aside>
  )
}
