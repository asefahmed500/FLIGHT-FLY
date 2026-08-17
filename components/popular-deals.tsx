"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tag, Star, Clock, ArrowRight, Heart } from "lucide-react"
import { useDeals } from "@/lib/firestore-data"
import { useMyFavorites, toggleFavorite } from "@/lib/app-data"
import { useAuth } from "@/lib/auth-context"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import type { BookingItemType } from "@/lib/types"

interface PopularDealsProps {
  onBookItem: (item: { title: string; price: string; subtitle: string; rating: number; type: BookingItemType }) => void
}

const STATIC_DEALS = [
  {
    id: "deal-1",
    category: "flights",
    title: "Emirates Business Class to Dubai",
    subtitle: "Non-stop luxury flight with limousine transfer",
    originalPrice: "$2,400",
    discountPrice: "$1,650",
    badge: "SAVE $750",
    rating: 5.0,
    expires: "2 days left",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-2",
    category: "hotels",
    title: "Overwater Villa at Anantara Maldives",
    subtitle: "Includes daily champagne breakfast & ocean spa credit",
    originalPrice: "$1,890",
    discountPrice: "$1,290",
    badge: "32% OFF",
    rating: 4.9,
    expires: "Limited Capacity",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-3",
    category: "packages",
    title: "Swiss Alps Helicopter & Chalet Escape",
    subtitle: "7-day luxury chalet stay + panoramic helicopter tour",
    originalPrice: "$3,500",
    discountPrice: "$2,650",
    badge: "EXECUTIVE DEAL",
    rating: 5.0,
    expires: "Selling Fast",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-4",
    category: "flights",
    title: "Tokyo First Class Suite with Singapore Airlines",
    subtitle: "Private cabin suite with fine dining",
    originalPrice: "$4,200",
    discountPrice: "$3,100",
    badge: "SAVE $1,100",
    rating: 4.9,
    expires: "3 days left",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-5",
    category: "hotels",
    title: "The Ritz Paris Luxury Suite Package",
    subtitle: "Includes private butler service & Michelin dining voucher",
    originalPrice: "$2,100",
    discountPrice: "$1,480",
    badge: "VIP INCLUSIVE",
    rating: 5.0,
    expires: "Exclusive Pass",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-6",
    category: "packages",
    title: "Amalfi Coast Yacht & Villa Expedition",
    subtitle: "Private skippered yacht charter + cliffside hotel",
    originalPrice: "$4,800",
    discountPrice: "$3,400",
    badge: "SAVE 28%",
    rating: 4.9,
    expires: "Summer Special",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-7",
    category: "visa",
    title: "Schengen Multi-Entry Visa Bundle",
    subtitle: "Visa processing + priority appointment + travel insurance included",
    originalPrice: "$320",
    discountPrice: "$220",
    badge: "VISA DEAL",
    rating: 4.9,
    expires: "2 weeks left",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-8",
    category: "visa",
    title: "US B1/B2 Express Visa Package",
    subtitle: "Interview coaching + priority slot booking in major cities",
    originalPrice: "$380",
    discountPrice: "$285",
    badge: "SAVE $95",
    rating: 5.0,
    expires: "Priority slots",
    image: "https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-9",
    category: "tickets",
    title: "Burj Khalifa Sky Duo Package",
    subtitle: "Two Level 148 sunset tickets with lounge refreshments",
    originalPrice: "$310",
    discountPrice: "$250",
    badge: "DUO SAVE",
    rating: 5.0,
    expires: "Selling Fast",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "deal-10",
    category: "tickets",
    title: "Cirque du Soleil Premium Duo",
    subtitle: "Reserved club section seats with backstage meet & greet",
    originalPrice: "$470",
    discountPrice: "$390",
    badge: "FRONT ROW",
    rating: 4.9,
    expires: "This season",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800&auto=format&fit=crop"
  },
]

export function PopularDeals({ onBookItem }: PopularDealsProps) {
  const [filter, setFilter] = useState("all")
  const [savingId, setSavingId] = useState<string | null>(null)
  const router = useRouter()
  const { deals } = useDeals()
  const { user } = useAuth()
  const { favorites } = useMyFavorites(user)

  const savedIds = new Set(favorites.map((f) => f.id))
  const source = deals.length > 0 ? deals : STATIC_DEALS
  const filteredDeals = filter === "all" ? source : source.filter(d => d.category === filter)

  const handleToggleFavorite = async (deal: (typeof source)[number]) => {
    if (!user) {
      router.push("/login?tab=login")
      return
    }
    setSavingId(deal.id)
    try {
      await toggleFavorite(user, {
        id: deal.id,
        title: deal.title,
        price: deal.discountPrice,
        category: deal.category,
        image: deal.image,
      })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section id="popular-deals" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D97706] mb-2.5">
              <Tag className="w-3.5 h-3.5" /> Exclusive Member Offers
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-[-0.01em]">
              Popular Limited-Time Deals
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 md:mt-0">
            <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-auto">
              <TabsList className="flex-wrap bg-slate-200/70 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">All Deals</TabsTrigger>
                <TabsTrigger value="flights" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">Flights</TabsTrigger>
                <TabsTrigger value="hotels" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">Hotels</TabsTrigger>
                <TabsTrigger value="packages" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">Packages</TabsTrigger>
                <TabsTrigger value="visa" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">Visa</TabsTrigger>
                <TabsTrigger value="tickets" className="rounded-lg text-xs font-medium px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">Tickets</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Reveal>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredDeals.map((deal, i) => (
            <Reveal key={deal.id} variant="scale" delay={(i % 3) * 80} className="h-full">
            <Card className="rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white group flex flex-col justify-between">

              
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={deal.image} 
                  alt={deal.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  <h3 className="text-base font-semibold text-[#0F172A] leading-snug group-hover:text-[#1E40AF] transition-colors tracking-[-0.01em] line-clamp-1">
                    {deal.title}
                  </h3>
                </Link>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through font-normal">{deal.originalPrice}</span>
                    <span className="text-lg font-semibold text-[#1E40AF]">{deal.discountPrice}</span>
                  </div>
                  <CardCta
                    detailsHref={`/deals/${deal.id}`}
                    actionLabel="Claim Deal"
                    onAction={() => onBookItem({
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
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
