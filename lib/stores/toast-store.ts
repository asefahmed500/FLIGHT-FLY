"use client"

import { create } from "zustand"

export interface Toast {
  id: number
  title: string
  description?: string
  variant: "success" | "error" | "info"
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, "id">) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...toast, id }] }))
    setTimeout(() => get().dismiss(id), 4200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))