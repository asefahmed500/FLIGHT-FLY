"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CardCtaProps {
  detailsHref: string
  actionLabel?: string
  onAction?: () => void
}

export function CardCta({ detailsHref, actionLabel = "Book Now", onAction }: CardCtaProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        render={<Link href={detailsHref} />}
        variant="outline"
        size="sm"
        className="h-9 flex-1 border-slate-200 bg-white text-xs font-medium text-[#0F172A] hover:bg-slate-50 hover:text-[#1E40AF]"
      >
        View Details
      </Button>
      <Button
        size="sm"
        onClick={onAction}
        className="h-9 flex-1 bg-[#D97706] text-xs font-semibold text-white shadow-md transition-all hover:bg-[#B45309]"
      >
        {actionLabel} <ArrowRight className="h-3.5 w-3.5" data-icon="inline-end" />
      </Button>
    </div>
  )
}