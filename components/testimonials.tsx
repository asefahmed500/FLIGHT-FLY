"use client"

import { Card } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Star, Quote, ShieldCheck, Sparkles } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"

const TESTIMONIALS = [
  {
    id: "test-1",
    name: "Sarah Jenkins",
    role: "VP of Global Marketing, TechScale",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    verified: "Verified Corporate Account",
    text: "FlightFly simplified our quarterly corporate retreat for 45 executives. The concierge team secured First-Class flight upgrades and managed all ground transfers effortlessly."
  },
  {
    id: "test-2",
    name: "Dr. Alexander Wright",
    role: "Chief Surgeon & Luxury Traveler",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    verified: "VIP Platinum Traveler",
    text: "Our Maldives honeymoon booked through FlightFly was pure magic. Overwater bungalow with private sea plane transfer and 24/7 dedicated support. Unmatched luxury!"
  },
  {
    id: "test-3",
    name: "Elena Rostova",
    role: "Managing Director, Rostova Capital",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    verified: "Verified Business Traveler",
    text: "I travel over 100,000 miles a year for international negotiations. FlightFly’s best-price guarantee and instant 24/7 concierge response make them my exclusive travel partner."
  }
]

export function Testimonials() {
  const { catalog } = useCatalog()

  const normalize = (item: CatalogItem) => ({
    id: item.id,
    name: item.title || item.name || "",
    role: item.role || "",
    avatar: item.image || item.avatar || "",
    rating: Math.round(Math.min(5, Math.max(1, item.rating))),
    verified: item.subtitle || item.verified || "Verified Traveler",
    text: item.text || "",
  })
  const live = catalog.filter((c) => c.kind === "testimonial").map(normalize)
  const testimonials = live.length > 0 ? live : TESTIMONIALS

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#1E40AF] mb-3 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Client Reviews & Ratings
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-[-0.01em]">
            Trusted by Corporate Leaders & Discerning Travelers
          </h2>
          <p className="text-slate-600 text-sm mt-3 font-normal leading-relaxed">
            Read how FlightFly delivers 5-star travel experiences for executives, families, and solo luxury explorers across the globe.
          </p>
        </Reveal>

        {/* Testimonials Carousel */}
        <div className="relative px-2">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {testimonials.map((t, i) => (
                <CarouselItem key={t.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Reveal variant="scale" delay={i * 80} className="h-full">
                    <Card className="flex h-[340px] flex-col justify-between rounded-xl bg-[#F8FAFC] p-7 shadow-sm transition-all duration-300 hover:shadow-lg">

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
                          <h4 className="text-sm font-semibold text-[#0F172A] truncate">{t.name}</h4>
                          <p className="text-xs text-slate-500 font-normal truncate">{t.role}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                            <ShieldCheck className="w-3 h-3" /> {t.verified}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Reveal>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex items-center justify-end gap-2 mt-6">
              <CarouselPrevious className="relative inset-auto translate-y-0 h-10 w-10 border-slate-200 hover:bg-slate-100" />
              <CarouselNext className="relative inset-auto translate-y-0 h-10 w-10 border-slate-200 hover:bg-slate-100" />
            </div>
          </Carousel>
        </div>

      </div>
    </section>
  )
}