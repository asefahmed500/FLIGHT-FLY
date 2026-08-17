"use client"

import { CheckCircle2, XCircle, Info, X } from "lucide-react"
import { useToastStore } from "@/lib/stores/toast-store"

const ICONS = {
  success: <CheckCircle2 className="size-4 text-emerald-400" />,
  error: <XCircle className="size-4 text-rose-400" />,
  info: <Info className="size-4 text-sky-400" />,
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur"
        >
          <span className="mt-0.5 shrink-0">{ICONS[toast.variant]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}