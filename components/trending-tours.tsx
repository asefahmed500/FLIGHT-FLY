"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Compass, Search, Heart, MapPin, Clock, Users } from "lucide-react"
import { useCatalog } from "@/lib/firestore-data"
import { useAuth } from "@/lib/auth-context"
import { useMyFavorites, toggleFavorite } from "@/lib/app-data"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import type { CatalogItem } from "@/lib/types"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"
import { TiltCard } from "@/components/listing/tilt-card"

interface TrendingToursProps {
  onBookItem: (item: BookingItemInfo) => void
}

export function TrendingTours({ onBookItem }: TrendingToursProps) {
  const router = useRouter()
  const { catalog, loading } = useCatalog()
  const { user } = useAuth()
  const { favorites, refresh } = useMyFavorites(user)

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [savingId, setSavingId] = useState<string | null>(null)

  const savedIds = new Set(favorites.map((f) => f.id))

  const tours = useMemo(() => catalog.filter((item) => item.kind === "tour"), [catalog])
  const badges = useMemo(() => Array.from(new Set(tours.map((t) => t.badge).filter(Boolean))), [tours])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tours.filter((t) => {
      const matchesFilter = filter === "all" || t.badge === filter
      if (!matchesFilter) return false
      if (!q) return true
      const haystack = [t.title, t.location, t.duration, t.groupSize, t.subtitle].filter(Boolean).join(" ").toLowerCase()
      return haystack.includes(q)
    })
  }, [tours, query, filter])

  const handleToggleFavorite = async (tour: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      router.push("/login?tab=login")
      return
    }
    if (savingId) return
    setSavingId(tour.id)
    try {
      await toggleFavorite(user, {
        id: tour.id,
        title: tour.title,
        price: tour.price,
        category: "tour",
        image: tour.image,
      })
      refresh()
    } catch {
      // Favorite toggle failed — leave UI unchanged.
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section id="trending-tours" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#4F46E5] mb-2.5">
              <Compass className="w-3.5 h-3.5" /> Unforgettable Guided Adventures
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] tracking-[-0.01em]">
              Trending Tours &amp; Experiences
            </h2>
            <p className="text-slate-600 text-sm max-w-md mt-3 font-normal leading-relaxed">
              Skip-the-line passes, private helicopter excursions, and authentic cultural tours led by master local guides.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tours, cities, duration…"
                aria-label="Search tours"
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm font-normal focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
              />
            </div>
            {badges.length > 0 && (
              <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto min-w-0 max-w-full">
                <TabsList className="flex-nowrap overflow-x-auto bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto whitespace-nowrap no-scrollbar max-w-full">
                  <TabsTrigger value="all" className="rounded-lg text-xs font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">All</TabsTrigger>
                  {badges.map((b) => (
                    <TabsTrigger key={b} value={b} className="rounded-lg text-xs font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-[#111111] whitespace-nowrap">{b}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </Reveal>

        {/* Tours Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Compass className="size-8 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#111111]">
              {query || filter !== "all" ? "No tours match your search" : "No tours available right now"}
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              Try a different keyword or clear the filters to browse every tour.
            </p>
            {(query || filter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 text-xs"
                onClick={() => {
                  setQuery("")
                  setFilter("all")
                }}
              >
                Clear search & filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((tour, i) => (
              <Reveal key={tour.id} variant="scale" delay={(i % 3) * 80} className="h-full">
                <TiltCard className="h-full">
                  <Card className="group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-200">
                    <div className="relative h-48 shrink-0 overflow-hidden">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="img-zoom h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      <Badge className="absolute top-4 left-4 bg-[#111111]/80 backdrop-blur-md text-amber-300 border border-white/20 font-medium text-xs">
                        {tour.badge}
                      </Badge>
                      {tour.deal && <DealChip className="absolute right-14 top-4" />}

                      {user && (
                        <button
                          onClick={(e) => handleToggleFavorite(tour, e)}
                          disabled={savingId === tour.id}
                          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md hover:bg-white flex items-center justify-center transition-colors shadow-md"
                          aria-label={savedIds.has(tour.id) ? `Remove ${tour.title} from wishlist` : `Save ${tour.title} to wishlist`}
                        >
                          <Heart className={`w-4 h-4 ${savedIds.has(tour.id) ? "fill-rose-500 text-rose-500" : "text-slate-700"}`} aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    <CardContent className="p-5 flex flex-col justify-between gap-3 bg-white">
                      <Link href={`/catalog/${tour.id}`} className="block">
                        <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#4F46E5] transition-colors leading-snug tracking-[-0.01em] line-clamp-1">
                          {tour.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 font-normal line-clamp-1">
                        {[tour.location, tour.duration, tour.groupSize].filter(Boolean).join(" · ")}
                      </p>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="mb-3 flex items-baseline justify-between">
                          <span className="text-[10px] text-slate-400 font-medium uppercase">Per Person</span>
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
                </TiltCard>
              </Reveal>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
