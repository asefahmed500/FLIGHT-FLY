"use client"

import { Card } from "@/components/ui/card"
import { Star, Quote, ShieldCheck, Sparkles } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"
import { TiltCard } from "@/components/listing/tilt-card"

export function Testimonials() {
  const { catalog, loading } = useCatalog()

  const normalize = (item: CatalogItem) => ({
    id: item.id,
    name: item.title || item.name || "",
    role: item.role || "",
    avatar: item.image || item.avatar || "",
    rating: Math.round(Math.min(5, Math.max(1, item.rating))),
    verified: item.subtitle || item.verified || "Verified Traveler",
    text: item.text || "",
  })
  const testimonials = catalog.filter((c) => c.kind === "testimonial").map(normalize)

  if (loading || testimonials.length === 0) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#4F46E5] mb-3 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Client Reviews & Ratings
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
            Trusted by Corporate Leaders & Discerning Travelers
          </h2>
          <p className="text-slate-600 text-sm mt-3 font-normal leading-relaxed">
            Read how FlightFly delivers 5-star travel experiences for executives, families, and solo luxury explorers across the globe.
          </p>
        </Reveal>

        {/* Testimonials Grid — consistent tilt cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} variant="scale" delay={i * 80} className="h-full">
              <TiltCard className="h-full" maxTilt={5}>
                <Card className="flex h-full flex-col justify-between rounded-xl bg-[#FAFAFA] p-7 shadow-sm transition-shadow duration-200 hover:shadow-lg">

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(t.rating)].map((_, k) => (
                          <Star key={k} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-slate-300" />
                    </div>

                    <p className="text-slate-700 text-sm italic font-normal leading-relaxed line-clamp-4">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3.5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-semibold text-[#111111] truncate">{t.name}</h4>
                      <p className="text-xs text-slate-500 font-normal truncate">{t.role}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <ShieldCheck className="w-3 h-3" /> {t.verified}
                      </span>
                    </div>
                  </div>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
