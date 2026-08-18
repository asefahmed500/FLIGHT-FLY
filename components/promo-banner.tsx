"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Clock, Copy, Check, Tag, ArrowRight } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import { Reveal } from "@/components/motion/reveal"

const DEFAULT_PROMO = {
  code: "FLYGOLD45",
  headline: "Flash Sale",
  subtitle: "Save Up to 45% Off First & Business Class",
  cta: "Use code FLYGOLD45 at checkout for instant executive discounts.",
}

export function PromoBanner() {
  const { catalog } = useCatalog()
  const promo = catalog.find((c) => c.kind === "promo")
  const copy = promo ? { code: promo.code || "FLYGOLD45", headline: promo.title || "Flash Sale", subtitle: promo.subtitle || "Save Up to 45% Off", cta: promo.text || promo.cta || "" } : DEFAULT_PROMO

  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 42, seconds: 18 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(copy.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-r from-[#111111] via-[#4F46E5] to-[#111111] text-white py-4 px-4 sm:px-6 lg:px-8 border-y border-amber-500/30 shadow-lg relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-64 h-full bg-amber-500/10 blur-xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Highlight Text */}
        <Reveal className="flex items-center gap-3 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge className="bg-amber-500 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider hover:bg-amber-400">
                {copy.headline}
              </Badge>
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {copy.subtitle}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 mt-0.5">
              {copy.cta} <span className="font-mono font-bold text-amber-300">{copy.code}</span>
            </p>
          </div>
        </Reveal>

        {/* Right Side: Countdown + Copy Promo Button */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Live Countdown Timer */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Ends in:</span>
            <span className="font-mono text-amber-300 font-bold">
              {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>

          {/* Copy Coupon Code Button */}
          <Button
            onClick={handleCopy}
            className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>CLAIM {copy.code}</span>
              </>
            )}
          </Button>

        </div>

      </div>
    </div>
  )
}