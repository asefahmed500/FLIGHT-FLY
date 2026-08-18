"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle2, ArrowRight, Plane } from "lucide-react"

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

  const onSubmit = async (data: NewsletterFormValues) => {
    // Show the confirmation state; a real email service is not wired up yet,
    // so no "voucher sent" claim is made beyond the demo state.
    setSubscribedEmail(data.email)
    setTimeout(() => {
      reset()
      setSubscribedEmail(null)
    }, 4500)
  }

  return (
    <section id="app-newsletter" className="py-20 bg-[#111111] text-white relative overflow-hidden">
      
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F46E5]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: App Promo */}
          <div className="lg:col-span-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/15 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-medium uppercase tracking-wider mb-4 border border-amber-400/30">
                <Plane className="w-3.5 h-3.5" /> Travel Smarter With FlightFly
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.01em] mb-3">
                Book & Manage Travel From Your Dashboard
              </h3>

              <p className="text-slate-300 text-sm font-normal leading-relaxed mb-6">
                Track reservations, download e-tickets and boarding passes, apply promo codes at checkout, and follow live deal releases — all from your FlightFly account.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-xs font-normal text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time booking status & notifications
                </div>
                <div className="flex items-center gap-2 text-xs font-normal text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant e-tickets & boarding passes
                </div>
                <div className="flex items-center gap-2 text-xs font-normal text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save favorites & redeem promo codes
                </div>
              </div>
            </div>

            </div>

          {/* Right Column: VIP Newsletter */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#4F46E5]/40 to-[#111111] p-8 sm:p-10 rounded-3xl border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium uppercase tracking-wider mb-4 border border-blue-400/30">
                <Mail className="w-3.5 h-3.5" /> VIP Travel Privilege Club
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.01em] mb-3">
                Unlock VIP Travel Privileges
              </h3>

              <p className="text-slate-300 text-sm font-normal leading-relaxed mb-6">
                Join the FlightFly Executive Digest for flash deal releases and luxury retreat invitations — plus the VIP50FLY welcome code for 50% off your first booking.
              </p>
            </div>

            {/* Form */}
            {subscribedEmail ? (
              <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <p className="text-base font-semibold text-emerald-300">✓ You&apos;re on the VIP list!</p>
                <p className="text-xs text-slate-200 font-normal">Welcome aboard — <strong className="text-white">{subscribedEmail}</strong> will receive VIP offers in-app as they drop.</p>
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
                  {isSubmitting ? "Claiming..." : "Join VIP & Get 50% Off Code"} <ArrowRight className="w-4 h-4" />
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
