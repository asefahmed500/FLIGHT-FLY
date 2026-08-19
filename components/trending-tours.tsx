"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Compass } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"

interface TrendingToursProps {
  onBookItem: (item: BookingItemInfo) => void
}

interface TourCard {
  id: string
  title: string
  location: string
  duration: string
  groupSize: string
  rating: number
  reviews: string
  price: string
  originalPrice?: string
  deal?: boolean
  tag: string
  subtitle: string
  image: string
}

export function TrendingTours({ onBookItem }: TrendingToursProps) {
  const { catalog, loading } = useCatalog()
  const normalize = (item: CatalogItem): TourCard => ({
    id: item.id,
    title: item.title,
    location: item.location || "",
    duration: item.duration || "",
    groupSize: item.groupSize || "",
    rating: item.rating,
    reviews: item.reviews || "",
    price: item.price,
    originalPrice: item.originalPrice,
    deal: item.deal,
    tag: item.badge || "Featured",
    subtitle: item.subtitle || "",
    image: item.image,
  })
  const tours = catalog.filter((item) => item.kind === "tour").map(normalize)

  if (loading || tours.length === 0) return null

  return (
    <section id="trending-tours" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#4F46E5] mb-2.5">
              <Compass className="w-3.5 h-3.5" /> Unforgettable Guided Adventures
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
              Trending Tours & Experiences
            </h2>
          </div>
          <p className="text-slate-600 text-sm max-w-md mt-3 md:mt-0 font-normal leading-relaxed">
            Skip-the-line passes, private helicopter excursions, and authentic cultural tours led by master local guides.
          </p>
        </Reveal>

        {/* Carousel */}
        <div className="relative px-2">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {tours.map((tour, i) => (
                <CarouselItem key={tour.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Reveal variant="scale" delay={i * 80} className="h-full">
<Card className="group flex h-[380px] flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-xl">
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="img-zoom h-full w-full object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-[#111111] text-amber-300 font-medium text-xs">
                          {tour.tag}
                        </Badge>
                        {tour.deal && <DealChip className="absolute right-4 top-4" />}
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <Link href={`/catalog/${tour.id}`}>
                          <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#4F46E5] transition-colors leading-snug tracking-[-0.01em] line-clamp-1">
                            {tour.title}
                          </h3>
                        </Link>

                        <div className="pt-3 mt-3 border-t border-slate-100">
                          <div className="mb-3">
                            <span className="text-[10px] text-slate-400 font-medium uppercase block">Per Person</span>
                            <span className="text-lg font-semibold text-[#111111]">
                              {tour.price}
                              {tour.originalPrice && (
                                <span className="ml-1.5 text-xs font-medium text-slate-400 line-through">{tour.originalPrice}</span>
                              )}
                            </span>
                          </div>
                          <CardCta
                            detailsHref={`/catalog/${tour.id}`}
                            actionLabel="Book Now"
                            onAction={() => onBookItem({
                              itemId: tour.id,
                              title: tour.title,
                              subtitle: `${tour.location || ""} ${tour.duration || ""}`.trim() || tour.subtitle,
                              price: tour.price,
                              rating: tour.rating,
                              type: "tour"
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
              <CarouselPrevious className="relative inset-auto translate-y-0 h-10 w-10 border-slate-200 hover:bg-slate-100" />
              <CarouselNext className="relative inset-auto translate-y-0 h-10 w-10 border-slate-200 hover:bg-slate-100" />
            </div>
          </Carousel>
        </div>

      </div>
    </section>
  )
}