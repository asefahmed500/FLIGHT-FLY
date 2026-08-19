"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Clock, Copy, Check, Tag } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"

interface FeaturedPromo {
  code: string
  percentOff: number
  expiresAt: string | null
}

function useTimeLeft(expiresAt: string | null) {
  const [now, setNow] = useState(() => Date.now())

  const hasExpiry = !!expiresAt
  useEffect(() => {
    if (!hasExpiry) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [hasExpiry])

  return useMemo(() => {
    if (!expiresAt) return null
    const diff = new Date(expiresAt).getTime() - now
    if (diff <= 0) return null
    const totalSec = Math.floor(diff / 1000)
    return {
      hours: Math.floor(totalSec / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
    }
  }, [expiresAt, now])
}

export function PromoBanner() {
  const [promo, setPromo] = useState<FeaturedPromo | null>(null)
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    fetch("/api/promos?featured=1")
      .then((r) => r.json())
      .then((d) => {
        if (active) setPromo(d?.promo ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const timeLeft = useTimeLeft(promo?.expiresAt ?? null)

  // No active promo → no banner. Never advertise a code the checkout rejects.
  if (!ready || !promo || (promo.expiresAt && !timeLeft)) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="bg-gradient-to-r from-[#111111] via-[#4F46E5] to-[#111111] text-white py-4 px-4 sm:px-6 lg:px-8 border-y border-amber-500/30 shadow-lg relative overflow-hidden">

      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-64 h-full bg-amber-500/10 blur-xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left Side: Highlight Text */}
        <Reveal className="flex items-center gap-3 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge className="bg-amber-500 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider hover:bg-amber-400">
                Live Promo Code
              </Badge>
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Tag className="w-3 h-3" aria-hidden="true" /> Save {promo.percentOff}% on your next booking
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 mt-0.5">
              Apply code <span className="font-mono font-bold text-amber-300">{promo.code}</span> at checkout for an
              instant {promo.percentOff}% discount.
            </p>
          </div>
        </Reveal>

        {/* Right Side: Countdown (only when the promo really expires) + Copy Button */}
        <div className="flex items-center gap-4 shrink-0">

          {timeLeft && (
            <div
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10"
              aria-live="off"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Ends in:</span>
              <span className="font-mono text-amber-300 font-bold">
                {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
              </span>
            </div>
          )}

          <Button
            onClick={handleCopy}
            aria-label={`Copy promo code ${promo.code}`}
            className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" aria-hidden="true" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>COPY {promo.code}</span>
              </>
            )}
          </Button>

        </div>

      </div>
    </div>
  )
}
