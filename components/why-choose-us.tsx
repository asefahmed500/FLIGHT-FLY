"use client"

import { Sparkles } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import { resolveFeatureIcon } from "@/lib/feature-icons"
import { Reveal } from "@/components/motion/reveal"

const FEATURES = [
  { id: "feat-1", icon: "shield", title: "Best Price Guarantee", description: "We match any lower published rate online or refund 100% of the price difference instantly." },
  { id: "feat-2", icon: "headset", title: "24/7 Dedicated Support", description: "Personal corporate travel concierge ready to assist you via call, email, or WhatsApp anywhere globally." },
  { id: "feat-3", icon: "refresh", title: "Flexible Free Cancellation", description: "Cancel flights, hotels, and tours up to 24 hours prior to departure with zero penalty fees." },
  { id: "feat-4", icon: "card", title: "Bank-Grade Secure Payment", description: "Protected by 256-bit SSL encryption, supporting corporate invoicing, Credit Card, and Apple Pay." },
  { id: "feat-5", icon: "award", title: "Curated Luxury Standards", description: "Every hotel, airline suite, and tour guide is hand-inspected to meet executive 5-star standards." },
  { id: "feat-6", icon: "building", title: "Verified Global Partners", description: "Direct partnerships with over 500 airlines and 85,000 luxury resorts worldwide." }
]

export function WhyChooseUs() {
  const { catalog } = useCatalog()
  const live = catalog.filter((c) => c.kind === "feature").map((f) => ({
    id: f.id,
    icon: f.icon || "shield",
    title: f.title,
    description: f.subtitle || "",
  }))
  const features = live.length > 0 ? live : FEATURES

  return (
    <section id="why-choose-us" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#1E40AF] mb-3 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Corporate Excellence & Security
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-[-0.01em]">
            Why World Travelers Trust FlightFly
          </h2>
          <p className="text-slate-600 text-sm mt-3 font-normal leading-relaxed">
            Designed for discerning corporate executives and luxury travelers seeking seamless booking, transparent pricing, and unmatched peace of mind.
          </p>
        </Reveal>

        {/* 6 Feature Cards — one row, compact, uniform padding */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {features.map((feat, idx) => {
            const IconComponent = resolveFeatureIcon(feat.icon)
            return (
              <Reveal key={feat.id} variant="scale" delay={(idx % 6) * 60}>
                <div className="flex h-full flex-col rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl group p-5">
                  <div className="w-10 h-10 rounded-lg bg-[#0F172A] text-amber-400 flex items-center justify-center mb-4 group-hover:bg-[#1E40AF] group-hover:text-white transition-colors shadow-md">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-1.5 group-hover:text-[#1E40AF] transition-colors tracking-[-0.01em] leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-3">
                    {feat.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>

      </div>
    </section>
  )
}