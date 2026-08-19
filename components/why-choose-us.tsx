"use client"

import { Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCatalog } from "@/lib/firestore-data"
import { resolveFeatureIcon } from "@/lib/feature-icons"
import { Reveal } from "@/components/motion/reveal"
import { GlareCard } from "@/components/listing/glare-card"
import { LiftGrid } from "@/components/listing/lift-grid"

export function WhyChooseUs() {
  const { catalog, loading } = useCatalog()
  const features = catalog.filter((c) => c.kind === "feature").map((f) => ({
    id: f.id,
    icon: f.icon || "shield",
    title: f.title,
    description: f.subtitle || "",
  }))

  return (
    <section id="why-choose-us" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#4F46E5] mb-3 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Corporate Excellence & Security
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
            Why World Travelers Trust FlightFly
          </h2>
          <p className="text-slate-600 text-sm mt-3 font-normal leading-relaxed">
            Designed for discerning corporate executives and luxury travelers seeking seamless booking, transparent pricing, and unmatched peace of mind.
          </p>
        </Reveal>

        {/* 6 Feature Cards — one row, compact, uniform padding */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : features.length === 0 ? null : (
          <LiftGrid columns={6} glowColor="rgba(217, 119, 6, 0.35)" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {features.map((feat, idx) => {
            const IconComponent = resolveFeatureIcon(feat.icon)
            return (
              <Reveal key={feat.id} variant="scale" delay={(idx % 6) * 60} className="h-full">
                <GlareCard className="h-full rounded-xl">
                <div className="flex h-full flex-col rounded-xl bg-white shadow-sm transition-shadow duration-200 hover:shadow-xl group p-5">
                  <div className="w-10 h-10 rounded-lg bg-[#111111] text-amber-400 flex items-center justify-center mb-4 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors shadow-md">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#111111] mb-1.5 group-hover:text-[#4F46E5] transition-colors tracking-[-0.01em] leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-3">
                    {feat.description}
                  </p>
                </div>
                </GlareCard>
              </Reveal>
            )
          })}
          </LiftGrid>
        )}

      </div>
    </section>
  )
}