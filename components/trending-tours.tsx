"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Star, Clock, Users, ArrowRight, Compass } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"

interface TrendingToursProps {
  onBookItem: (item: { title: string; price: string; subtitle: string; rating: number; type: "flight" | "hotel" | "tour" | "package" | "visa" | "ticket" }) => void
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

const TOURS: TourCard[] = [
  {
    id: "tour-1",
    title: "Dubai Desert Safari & VIP BBQ Dinner",
    location: "Dubai, UAE",
    duration: "6 Hours",
    groupSize: "Max 8 People",
    rating: 4.9,
    reviews: "1,420",
    price: "$120",
    originalPrice: "$150",
    deal: true,
    tag: "Best Seller",
    subtitle: "Dune bashing, camel rides and a private VIP BBQ dinner under the stars.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tour-2",
    title: "Eiffel Tower VIP Sunset Champagne Tour",
    location: "Paris, France",
    duration: "3 Hours",
    groupSize: "Small Group",
    rating: 4.8,
    reviews: "980",
    price: "$210",
    tag: "Top Rated",
    subtitle: "Skip-the-line summit access with a glass of champagne at sunset.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tour-3",
    title: "Kyoto Heritage Temples & Tea Ceremony",
    location: "Kyoto, Japan",
    duration: "Full Day",
    groupSize: "Private Tour",
    rating: 5.0,
    reviews: "750",
    price: "$165",
    tag: "Cultural Classic",
    subtitle: "Ancient temples, zen gardens and a private tea ceremony with a master.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tour-4",
    title: "Grand Canyon VIP Helicopter & Landing",
    location: "Nevada, USA",
    duration: "4.5 Hours",
    groupSize: "Max 6 Passengers",
    rating: 5.0,
    reviews: "2,100",
    price: "$450",
    tag: "VIP Helicopter",
    subtitle: "Helicopter flight with a champagne picnic landing on the canyon floor.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"
  }
]

export function TrendingTours({ onBookItem }: TrendingToursProps) {
  const { catalog } = useCatalog()
  const live = catalog.filter((item) => item.kind === "tour")
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
  const tours = live.length > 0 ? live.map(normalize) : TOURS

  return (
    <section id="trending-tours" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#1E40AF] mb-2.5">
              <Compass className="w-3.5 h-3.5" /> Unforgettable Guided Adventures
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-[-0.01em]">
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
<Card className="group flex h-[380px] flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="img-zoom h-full w-full object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-[#0F172A] text-amber-300 font-medium text-xs">
                          {tour.tag}
                        </Badge>
                        {tour.deal && <DealChip className="absolute right-4 top-4" />}
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <Link href={`/catalog/${tour.id}`}>
                          <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#1E40AF] transition-colors leading-snug tracking-[-0.01em] line-clamp-1">
                            {tour.title}
                          </h3>
                        </Link>

                        <div className="pt-3 mt-3 border-t border-slate-100">
                          <div className="mb-3">
                            <span className="text-[10px] text-slate-400 font-medium uppercase block">Per Person</span>
                            <span className="text-lg font-semibold text-[#0F172A]">
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