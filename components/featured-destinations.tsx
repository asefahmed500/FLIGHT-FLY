"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Star, MapPin, ArrowRight, Heart, Sparkles } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"

interface FeaturedDestinationsProps {
  onBookItem: (item: BookingItemInfo) => void
}

interface DestinationCard {
  id: string
  name: string
  country: string
  price: string
  rating: number
  reviews: string
  tag: string
  image: string
  description: string
  deal?: boolean
  originalPrice?: string
}

const DESTINATIONS: DestinationCard[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    price: "$680",
    rating: 4.9,
    reviews: "1,240 reviews",
    tag: "Most Popular",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    description: "Flight + 4 Nights at Eiffel Luxury Hotel"
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    price: "$520",
    rating: 4.9,
    reviews: "980 reviews",
    tag: "Trending Luxury",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
    description: "Private Pool Villa + Flights Included"
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    price: "$890",
    rating: 5.0,
    reviews: "2,150 reviews",
    tag: "Executive Pick",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
    description: "5-Star Resort Stay + Desert Safari"
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    price: "$950",
    rating: 4.8,
    reviews: "1,890 reviews",
    tag: "Top Rated",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop",
    description: "First-Class Flight & Ginza Boutique Hotel"
  },
  {
    id: "newyork",
    name: "New York",
    country: "United States",
    price: "$430",
    rating: 4.7,
    reviews: "3,400 reviews",
    tag: "Flash Deal",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
    description: "Manhattan Luxury Suite + Direct Flight"
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Tropical Paradise",
    price: "$1,250",
    rating: 5.0,
    reviews: "860 reviews",
    tag: "VIP Honeymoon",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
    description: "Overwater Bungalows + Sea Plane Transfer"
  }
]

export function FeaturedDestinations({ onBookItem }: FeaturedDestinationsProps) {
  const { catalog } = useCatalog()
  const live = catalog.filter((c) => c.kind === "destination")
  const [favorites, setFavorites] = useState<string[]>([])

  const normalize = (item: CatalogItem): DestinationCard => ({
    id: item.id,
    name: item.title,
    country: item.country || "",
    price: item.price,
    rating: item.rating,
    reviews: item.reviews || "",
    tag: item.badge || "Featured",
    image: item.image,
    description: item.subtitle || item.description || "",
    deal: item.deal,
    originalPrice: item.originalPrice,
  })
  const destinations = live.length > 0 ? live.map(normalize) : DESTINATIONS

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section id="featured-destinations" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#4F46E5] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> Curated Global Escapes
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
              Featured Destinations
            </h2>
          </div>
          <p className="text-slate-600 text-sm max-w-md mt-3 md:mt-0 font-normal leading-relaxed">
            Handpicked iconic cities and secluded luxury islands with exclusive corporate rates and instant confirmation.
          </p>
        </Reveal>

        {/* Carousel Container */}
        <div className="relative px-2">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {destinations.map((dest, i) => (
                <CarouselItem key={dest.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Reveal variant="scale" delay={i * 80} className="h-full">
                    <Card className="group flex h-[380px] flex-col justify-between overflow-hidden rounded-xl shadow-sm transition-all duration-200 hover:shadow-xl">
                      {/* Destination Image & Badges */}
                      <div className="relative h-60 overflow-hidden">
                        <img 
                          src={dest.image} 
                          alt={dest.name} 
                          className="img-zoom h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <Badge className="bg-[#111111]/80 backdrop-blur-md text-amber-300 border border-white/20 font-medium text-xs">
                            {dest.tag}
                          </Badge>
                        </div>

                        {dest.deal && <DealChip className="absolute right-14 top-4" />}

                        <button
                          onClick={(e) => toggleFavorite(dest.id, e)}
                          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md hover:bg-white flex items-center justify-center transition-colors shadow-md"
                          aria-label={`Favorite ${dest.name}`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(dest.id) ? "fill-rose-500 text-rose-500" : "text-slate-700"}`} />
                        </button>

                        <div className="absolute bottom-3.5 left-4 text-white">
                          <div className="flex items-center gap-1 text-xs text-slate-200 font-normal">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" /> {dest.country}
                          </div>
                          <Link href={`/catalog/${dest.id}`}>
                            <h3 className="text-2xl font-semibold tracking-[-0.01em] text-white">{dest.name}</h3>
                          </Link>
                        </div>
                      </div>

                      {/* Card Content & Price */}
<CardContent className="p-5 flex-1 flex flex-col justify-between bg-white">
                        <div className="pt-4 mt-auto border-t border-slate-100">
                          <div className="mb-3">
                            <span className="text-[10px] text-slate-400 font-medium uppercase block">Starting Price</span>
                            <span className="text-xl font-semibold text-[#111111]">
                              {dest.price}
                              {dest.originalPrice && (
                                <span className="ml-1.5 text-xs font-medium text-slate-400 line-through">{dest.originalPrice}</span>
                              )}
                            </span>
                          </div>
                          <CardCta
                            detailsHref={`/catalog/${dest.id}`}
                            actionLabel="Book Now"
onAction={() => onBookItem({
                              itemId: dest.id,
                              title: `${dest.name}, ${dest.country}`,
                              subtitle: dest.description,
                              price: dest.price,
                              rating: dest.rating,
                              type: "package"
                            })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex items-center justify-end gap-2 mt-6">
              <CarouselPrevious className="relative inset-auto translate-y-0 h-10 w-10 border-slate-200 hover:bg-slate-100 text-slate-800" />
              <CarouselNext className="relative inset-auto translate-y-0 h-10 w-10 border-slate-200 hover:bg-slate-100 text-slate-800" />
            </div>
          </Carousel>
        </div>

      </div>
    </section>
  )
}