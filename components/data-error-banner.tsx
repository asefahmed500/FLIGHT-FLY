"use client"

import { AlertTriangle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataErrorBannerProps {
  error?: string | null
  onRetry: () => void
  context?: string
}

export function DataErrorBanner({ error, onRetry, context = "data" }: DataErrorBannerProps) {
  if (!error) return null
  return (
    <div
      role="alert"
      className="flex flex-col items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-rose-700">Couldn&apos;t load {context}</p>
          <p className="text-xs font-medium text-rose-500">{error}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="shrink-0 border-rose-200 bg-white text-rose-600 hover:bg-rose-100 hover:text-rose-700"
      >
        <RotateCw className="size-3.5" data-icon="inline-start" /> Retry
      </Button>
    </div>
  )
}
