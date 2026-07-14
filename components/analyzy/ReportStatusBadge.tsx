"use client"

import { Badge, type BadgeProps } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import type { ReportStatus } from "@/lib/analyza"

// Maps each report status onto an existing Badge variant + i18n label so the
// left cards and the report header stay visually consistent.
const STATUS_VARIANT: Record<ReportStatus, BadgeProps["variant"]> = {
  ready: "fair",
  pdf_generated: "underpriced",
  outdated_price: "overpriced",
  missing_data: "secondary",
  not_analysed: "outline",
}

export default function ReportStatusBadge({
  status,
  className,
}: {
  status: ReportStatus
  className?: string
}) {
  const { t } = useI18n()
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      {t(`analyses.status.${status}`)}
    </Badge>
  )
}
