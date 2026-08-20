"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tag, Clock, Heart } from "lucide-react"
import { useDeals } from "@/lib/firestore-data"
import { useMyFavorites, toggleFavorite } from "@/lib/app-data"
import { useAuth } from "@/lib/auth-context"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { TiltCard } from "@/components/listing/tilt-card"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import type { BookingItemType } from "@/lib/types"

interface PopularDealsProps {
  onBookItem: (item: BookingItemInfo) => void
}

export function PopularDeals({ onBookItem }: PopularDealsProps) {
  const [filter, setFilter] = useState("all")
  const router = useRouter()
  const { deals, loading } = useDeals()
  const { user } = useAuth()
  const { favorites, refresh } = useMyFavorites(user)

  const savedIds = new Set(favorites.map((f) => f.id))
  const filteredDeals = filter === "all" ? deals : deals.filter((d) => d.category === filter)

  const handleToggleFavorite = async (deal: (typeof deals)[number]) => {
    if (!user) {
      router.push("/login?tab=login")
      return
    }
    try {
      await toggleFavorite(user, {
        id: deal.id,
        title: deal.title,
        price: deal.discountPrice,
        category: deal.category,
        image: deal.image,
      })
      refresh()
    } catch {
      // Favorite toggle failed — leave UI unchanged.
    }
  }

  return (
    <section id="popular-deals" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D97706] mb-2.5">
              <Tag className="w-3.5 h-3.5" /> Exclusive Member Offers
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
              Popular Limited-Time Deals
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 md:mt-0">
            <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full sm:w-auto min-w-0 max-w-full">
              <TabsList className="flex-nowrap overflow-x-auto bg-slate-200/70 p-1 rounded-xl whitespace-nowrap no-scrollbar w-full sm:w-auto max-w-full">
                <TabsTrigger value="all" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">All Deals</TabsTrigger>
                <TabsTrigger value="flights" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">Flights</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">Hotels</TabsTrigger>
                <TabsTrigger value="packages" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">Packages</TabsTrigger>
                <TabsTrigger value="visa" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">Visa</TabsTrigger>
                <TabsTrigger value="tickets" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">Tickets</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Reveal>

        {/* Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Tag className="size-8 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#111111]">
              {filter === "all" ? "No live deals right now" : `No ${filter} deals right now`}
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              New offers drop weekly — check back soon or browse all deals.
            </p>
            {filter !== "all" && (
              <Button variant="outline" size="sm" onClick={() => setFilter("all")} className="border-slate-200 text-xs">
                Show all deals
              </Button>
            )}
          </div>
        ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredDeals.map((deal, i) => (
            <Reveal key={deal.id} variant="scale" delay={(i % 3) * 80} className="h-full">
            <TiltCard className="h-full">
            <Card className="rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden bg-white group flex flex-col justify-between">

              
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={deal.image} 
                  alt={deal.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                <Badge className="absolute top-4 left-4 bg-[#D97706] text-white font-semibold text-xs px-3 py-1 shadow-md">
                  {deal.badge}
                </Badge>

                <div className="absolute bottom-3.5 left-4 flex items-center gap-1 text-xs text-amber-300 font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" /> {deal.expires}
                </div>

                {user && (
                  <Button
                    onClick={() => handleToggleFavorite(deal)}
                    aria-label={savedIds.has(deal.id) ? "Remove from wishlist" : "Save to wishlist"}
                    className={`absolute top-4 right-4 size-9 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all ${savedIds.has(deal.id) ? "text-rose-500" : "text-white"}`}
                  >
                    <Heart className={`w-4 h-4 ${savedIds.has(deal.id) ? "fill-rose-500" : ""}`} />
                  </Button>
                )}
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <Link href={`/deals/${deal.id}`} className="block">
                  <h3 className="text-base font-semibold text-[#111111] leading-snug group-hover:text-[#4F46E5] transition-colors tracking-[-0.01em] line-clamp-1">
                    {deal.title}
                  </h3>
                </Link>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through font-normal">{deal.originalPrice}</span>
                    <span className="text-lg font-semibold text-[#4F46E5]">{deal.discountPrice}</span>
                  </div>
                  <CardCta
                    detailsHref={`/deals/${deal.id}`}
                    actionLabel="Claim Deal"
                    onAction={() => onBookItem({
                      itemId: deal.id,
                      title: deal.title,
                      subtitle: deal.subtitle,
                      price: deal.discountPrice,
                      rating: deal.rating,
                      type: (deal.category === "flights"
                        ? "flight"
                        : deal.category === "hotels"
                          ? "hotel"
                          : deal.category === "tours"
                            ? "tour"
                            : deal.category === "visa"
                              ? "visa"
                              : deal.category === "tickets"
                                ? "ticket"
                                : "package") as BookingItemType
                    })}
                  />
                </div>
              </CardContent>

            </Card>
            </TiltCard>
            </Reveal>
          ))}
          </div>
        )}

      </div>
    </section>
  )
}
