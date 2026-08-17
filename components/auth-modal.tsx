"use client"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ShieldCheck } from "lucide-react"
import { AuthForm } from "@/components/auth-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl">
        <div className="bg-[#0F172A] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#1E40AF]/40 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-medium mb-3 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" /> FlightFly Firebase VIP Pass
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-[-0.01em] text-white">
            Welcome to FlightFly
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm mt-1 font-normal">
            Access exclusive member discounts &amp; priority concierge
          </DialogDescription>
        </div>

        <div className="p-6">
          <AuthForm initialTab={initialTab} onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}