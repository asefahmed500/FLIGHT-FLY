"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { useCatalog } from "@/lib/firestore-data"
import { Smartphone, Crown, Sparkles, ArrowRight, Copy, Check } from "lucide-react"
import { useState } from "react"

type BannerVariant = "app" | "vip" | "flash"

interface InterstitialBannerProps {
  variant: BannerVariant
}

const DEFAULT_CONTENT: Record<BannerVariant, { label: string; headline: string; sub: string }> = {
  app: {
    label: "FlightFly Mobile App",
    headline: "Travel in your pocket — iOS & Android",
    sub: "Real-time gate alerts, offline itineraries and app-exclusive fares.",
  },
  vip: {
    label: "Executive Membership",
    headline: "Join the VIP Privilege Club",
    sub: "Priority check-in, lounge access and dedicated concierge on every trip.",
  },
  flash: {
    label: "Flash Sale",
    headline: "Save up to 45% on premium cabins",
    sub: "Limited-time executive fares on selected routes. Code applied at checkout.",
  },
}

export function InterstitialBanner({ variant }: InterstitialBannerProps) {
  const { catalog } = useCatalog()
  const promo = catalog.find((c) => c.kind === "promo")
  const copy = DEFAULT_CONTENT[variant]
  const [copied, setCopied] = useState(false)

  const accent: Record<BannerVariant, string> = {
    app: "from-[#1E40AF]/30 to-transparent",
    vip: "from-amber-500/20 to-transparent",
    flash: "from-rose-500/20 to-transparent",
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(promo?.code || "FLYGOLD45")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`relative overflow-hidden border-y border-slate-200 bg-gradient-to-r from-white to-slate-50 ${accent[variant]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <Reveal className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1E40AF] shadow-sm">
              {variant === "app" ? <Smartphone className="h-4 w-4" /> : variant === "vip" ? <Crown className="h-4 w-4 text-amber-500" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div>
              <Badge variant="outline" className="mb-0.5 border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {copy.label}
              </Badge>
              <p className="text-sm font-semibold text-[#0F172A]">{copy.headline}</p>
              <p className="text-xs text-slate-500">{copy.sub}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {variant === "flash" && (
              <Button
                onClick={handleCopy}
                variant="outline"
                className="h-9 border-slate-200 bg-white px-3 text-xs text-[#1E40AF]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" data-icon="inline-start" /> COPIED
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" data-icon="inline-start" /> {promo?.code || "FLYGOLD45"}
                  </>
                )}
              </Button>
            )}
            <Button className="h-9 bg-[#1E40AF] px-4 text-xs hover:bg-[#0F172A]">
              {variant === "app" ? "Get the app" : variant === "vip" ? "Join VIP" : "Shop deals"} <ArrowRight className="h-3.5 w-3.5" data-icon="inline-end" />
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  )
}