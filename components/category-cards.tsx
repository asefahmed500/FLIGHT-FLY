"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Plane, Building2, Compass, Package, Car, Ship, Sparkles } from "lucide-react"
import { GlareCard } from "@/components/listing/glare-card"
import { LiftGrid } from "@/components/listing/lift-grid"

const CATEGORIES = [
  {
    id: "flights",
    title: "Flights",
    price: "From $199",
    icon: Plane,
    href: "/flights",
    bgImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "hotels",
    title: "Hotels",
    price: "From $149",
    icon: Building2,
    href: "/hotels",
    bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tours",
    title: "Tours",
    price: "From $49",
    icon: Compass,
    href: "/tours",
    bgImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "packages",
    title: "Packages",
    price: "From $799",
    icon: Package,
    href: "/packages",
    bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "visa",
    title: "Visa Services",
    price: "From $120",
    icon: Ship,
    href: "/visa",
    bgImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tickets",
    title: "Tickets",
    price: "From $89",
    icon: Car,
    href: "/tickets",
    bgImage: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop"
  }
]

export function CategoryCards() {
  return (
    <section id="category-cards" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#4F46E5] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> Comprehensive Travel Categories
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
              Explore Our Premium Services
            </h2>
          </div>
        </div>

        {/* 6 Minimal Category Cards — 1:1 squares, one row, 3D lift + cursor glare */}
        <LiftGrid columns={6} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon
            return (
              <Link key={cat.id} href={cat.href} className="group block h-full">
                <GlareCard className="h-full rounded-xl">
                  <Card className="group/card relative aspect-square overflow-hidden rounded-xl bg-[#111111] p-0 text-white shadow-md transition-shadow duration-200 hover:shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-200 group-hover/card:scale-110"
                      style={{ backgroundImage: `url('${cat.bgImage}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-black/20" />

                    <CardContent className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-md backdrop-blur-md transition-colors group-hover/card:border-amber-500 group-hover/card:bg-amber-500">
                        <IconComponent className="h-5 w-5 text-amber-300 transition-colors group-hover/card:text-white" />
                      </div>
                      <h3 className="text-sm font-semibold leading-tight tracking-[-0.01em] text-white">
                        {cat.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-400">{cat.price}</p>
                    </CardContent>
                  </Card>
                </GlareCard>
              </Link>
            )
          })}
        </LiftGrid>

      </div>
    </section>
  )
}