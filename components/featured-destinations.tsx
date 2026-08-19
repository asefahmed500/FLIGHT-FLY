"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Heart, Sparkles } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import { useAuth } from "@/lib/auth-context"
import { useMyFavorites, toggleFavorite } from "@/lib/app-data"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"
import { CoverflowCarousel } from "@/components/listing/coverflow"

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

export function FeaturedDestinations({ onBookItem }: FeaturedDestinationsProps) {
  const { catalog, loading } = useCatalog()
  const live = catalog.filter((c) => c.kind === "destination")
  const { user } = useAuth()
  const { favorites, refresh } = useMyFavorites(user)
  const [savingId, setSavingId] = useState<string | null>(null)

  const savedIds = new Set(favorites.map((f) => f.id))

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
  const destinations = live.map(normalize)

  const handleToggleFavorite = async (dest: DestinationCard, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || savingId) return
    setSavingId(dest.id)
    try {
      await toggleFavorite(user, {
        id: dest.id,
        title: `${dest.name}, ${dest.country}`,
        price: dest.price,
        category: "destination",
        image: dest.image,
      })
      refresh()
    } catch {
      // Favorite toggle failed — leave UI unchanged.
    } finally {
      setSavingId(null)
    }
  }

  if (loading || destinations.length === 0) return null

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

        {/* 3D Coverflow — active card in the spotlight, peers tilted back */}
        <Reveal variant="scale">
          <CoverflowCarousel
            autoplay
            cardWidth={380}
            cardHeight={400}
            slides={destinations.map((dest) => ({
              key: dest.id,
              content: (
                <Card className="group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm">
                  {/* Destination Image & Badges */}
                  <div className="relative h-56 shrink-0 overflow-hidden">
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

                    {user && (
                      <button
                        onClick={(e) => handleToggleFavorite(dest, e)}
                        disabled={savingId === dest.id}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md hover:bg-white flex items-center justify-center transition-colors shadow-md"
                        aria-label={savedIds.has(dest.id) ? `Remove ${dest.name} from wishlist` : `Save ${dest.name} to wishlist`}
                      >
                        <Heart className={`w-4 h-4 ${savedIds.has(dest.id) ? "fill-rose-500 text-rose-500" : "text-slate-700"}`} aria-hidden="true" />
                      </button>
                    )}

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
                  <CardContent className="p-5 flex flex-col justify-between gap-3 bg-white">
                    <div>
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
                  </CardContent>
                </Card>
              ),
            }))}
          />
        </Reveal>

      </div>
    </section>
  )
}
