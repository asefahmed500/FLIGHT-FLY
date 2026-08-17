"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plane, Building2, Compass, Package, Car, Ship, Sparkles } from "lucide-react"

const CATEGORIES = [
  {
    id: "flights",
    title: "Flights",
    price: "From $199",
    icon: Plane,
    bgImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "hotels",
    title: "Hotels",
    price: "From $149",
    icon: Building2,
    bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tours",
    title: "Tours",
    price: "From $49",
    icon: Compass,
    bgImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "packages",
    title: "Packages",
    price: "From $799",
    icon: Package,
    bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "cars",
    title: "Car Rentals",
    price: "From $39",
    icon: Car,
    bgImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "cruises",
    title: "Cruises",
    price: "From $899",
    icon: Ship,
    bgImage: "https://images.unsplash.com/photo-1548574505-5e2386903d8f?q=80&w=800&auto=format&fit=crop"
  }
]

export function CategoryCards() {
  return (
    <section id="category-cards" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#1E40AF] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> Comprehensive Travel Categories
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-[-0.01em]">
              Explore Our Premium Services
            </h2>
          </div>
        </div>

        {/* 6 Minimal Category Cards — 1:1 squares, one row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon
            return (
              <Card
                key={cat.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-[#0F172A] p-0 text-white hover:shadow-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${cat.bgImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-black/20" />

                <CardContent className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-md shadow-md transition-colors group-hover:border-amber-500 group-hover:bg-amber-500">
                    <IconComponent className="h-5 w-5 text-amber-300 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="text-sm font-semibold leading-tight tracking-[-0.01em] text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-400">{cat.price}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>
    </section>
  )
}