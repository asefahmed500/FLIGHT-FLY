"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smartphone, Mail, QrCode, CheckCircle2, ArrowRight } from "lucide-react"

// Zod Newsletter Schema
const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address for your $50 voucher"),
})

type NewsletterFormValues = z.infer<typeof newsletterSchema>

export function AppNewsletter() {
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (data: NewsletterFormValues) => {
    setSubscribedEmail(data.email)
    setTimeout(() => {
      reset()
      setSubscribedEmail(null)
    }, 4500)
  }

  return (
    <section className="py-20 bg-[#0F172A] text-white relative overflow-hidden">
      
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E40AF]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: App Promo */}
          <div className="lg:col-span-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/15 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-medium uppercase tracking-wider mb-4 border border-amber-400/30">
                <Smartphone className="w-3.5 h-3.5" /> FlightFly Executive Mobile App
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.01em] mb-3">
                Book & Manage Travel On The Go
              </h3>

              <p className="text-slate-300 text-sm font-normal leading-relaxed mb-6">
                Get real-time flight tracking, instant mobile boarding passes, priority concierge chat, and app-exclusive 15% discount codes.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-xs font-normal text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time flight gate updates & baggage alerts
                </div>
                <div className="flex items-center gap-2 text-xs font-normal text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Tap concierge call & emergency rebooking
                </div>
                <div className="flex items-center gap-2 text-xs font-normal text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Offline digital passport & travel itinerary store
                </div>
              </div>
            </div>

            {/* App Store Buttons & QR */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <a href="#" className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
                  <span className="text-xl"></span>
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-slate-300 font-medium block">Download on</span>
                    <span className="text-xs font-semibold text-white">App Store</span>
                  </div>
                </a>

                <a href="#" className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
                  <span className="text-lg">▶</span>
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-slate-300 font-medium block">GET IT ON</span>
                    <span className="text-xs font-semibold text-white">Google Play</span>
                  </div>
                </a>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/10">
                <QrCode className="w-8 h-8 text-amber-400" />
                <div className="leading-tight">
                  <span className="font-semibold text-white block">Scan to Install</span>
                  <span className="text-[10px] text-slate-400">iOS & Android</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: VIP Newsletter */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#1E40AF]/40 to-[#0F172A] p-8 sm:p-10 rounded-3xl border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium uppercase tracking-wider mb-4 border border-blue-400/30">
                <Mail className="w-3.5 h-3.5" /> VIP Travel Privilege Club
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.01em] mb-3">
                Unlock Instant $50 Travel Voucher
              </h3>

              <p className="text-slate-300 text-sm font-normal leading-relaxed mb-6">
                Subscribe to FlightFly Executive Digest for confidential error fare alerts, flash deal releases, and luxury retreat invitations.
              </p>
            </div>

            {/* Form */}
            {subscribedEmail ? (
              <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <p className="text-base font-semibold text-emerald-300">✓ Welcome to FlightFly VIP!</p>
                <p className="text-xs text-slate-200 font-normal">Voucher sent to <strong className="text-white">{subscribedEmail}</strong>. Code: <strong>VIP50FLY</strong>.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="Enter your corporate or personal email" 
                    {...register("email")}
                    className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 rounded-xl font-normal" 
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-amber-300 font-medium">{errors.email.message}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Claiming..." : "Claim My $50 Voucher Now"} <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-4 font-normal">
              We respect your privacy. Unsubscribe anytime with 1 click. Zero spam policy.
            </p>

          </div>

        </div>

      </div>
    </section>
  )
}
