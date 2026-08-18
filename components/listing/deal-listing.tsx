"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Clock, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeals } from "@/lib/firestore-data"
import { ListingCard, type ListingCardData } from "@/components/listing/listing-card"
import { Reveal } from "@/components/motion/reveal"
import type { DealCategory, Deal, BookingItemType } from "@/lib/types"

interface DealListingProps {
  category?: DealCategory
  eyebrow: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  accent?: "blue" | "amber"
  initialQuery?: string
}

const CATEGORY_TYPE: Record<DealCategory, BookingItemType> = {
  flights: "flight",
  hotels: "hotel",
  packages: "package",
  tours: "tour",
  visa: "visa",
  tickets: "ticket",
}

function DealListingInner({ category, eyebrow, title, description, icon: Icon, accent = "blue", initialQuery }: DealListingProps) {
  const { deals, loading } = useDeals()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery ?? "")
  const [sort, setSort] = useState("popular")
  const [searchMeta, setSearchMeta] = useState<{ from?: string; to?: string; q?: string; checkin?: string; checkout?: string } | null>(null)

  // Consume hero-search params (q/from/to/checkin/checkout) once on mount.
  // A `q` param from the URL wins over the page's initialQuery.
  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchParams.get("q") ?? ""
      const from = searchParams.get("from") ?? undefined
      const to = searchParams.get("to") ?? undefined
      const checkin = searchParams.get("checkin") ?? undefined
      const checkout = searchParams.get("checkout") ?? undefined
      if (q) setQuery(q)
      if (from || to || q || checkin) setSearchMeta({ from, to, q: q || undefined, checkin, checkout })
    }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = useMemo<ListingCardData[]>(() => {
    let live: Deal[] = deals
    if (category) live = live.filter((d) => d.category === category)
    let data: ListingCardData[] = live.map((deal) => ({
      id: deal.id,
      title: deal.title,
      subtitle: deal.subtitle,
      price: deal.discountPrice,
      originalPrice: deal.originalPrice,
      deal: true,
      badge: deal.badge,
      rating: deal.rating,
      image: deal.image,
      detailHref: `/deals/${deal.id}`,
      type: CATEGORY_TYPE[deal.category] ?? "package",
      meta: [{ label: "Expires", value: deal.expires }],
    }))

    if (query.trim()) {
      const q = query.toLowerCase()
      const tokens = q.split(/[\s,→/-]+/).filter((t) => t.length > 2)
      data = data.filter((d) => {
        const hay = `${d.title} ${d.subtitle} ${d.badge}`.toLowerCase()
        return hay.includes(q) || tokens.some((t) => hay.includes(t))
      })
      // Graceful handoff: if the searched route/destination (or the page's
      // initialQuery) has no exact deals, show everything rather than an empty wall.
      if (data.length === 0 && (searchMeta || initialQuery)) {
        data = live.map((deal) => ({
          id: deal.id,
          title: deal.title,
          subtitle: deal.subtitle,
          price: deal.discountPrice,
          originalPrice: deal.originalPrice,
          deal: true,
          badge: deal.badge,
          rating: deal.rating,
          image: deal.image,
          detailHref: `/deals/${deal.id}`,
          type: CATEGORY_TYPE[deal.category] ?? "package",
          meta: [{ label: "Expires", value: deal.expires }],
        }))
      }
    }
    const priceNum = (p: string) => parseFloat(p.replace(/[^0-9.]/g, "")) || 0
    if (sort === "rating") data = [...data].sort((a, b) => b.rating - a.rating)
    if (sort === "priceLow") data = [...data].sort((a, b) => priceNum(a.price) - priceNum(b.price))
    if (sort === "priceHigh") data = [...data].sort((a, b) => priceNum(b.price) - priceNum(a.price))
    return data
  }, [deals, category, query, sort, searchMeta])

  const accentIcon = accent === "amber" ? "bg-[#D97706]/10" : "bg-[#4F46E5]/10"

  return (
    <div className="flex flex-col gap-10">
      {/* Page hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#111111] px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${accentIcon}`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-[-0.01em] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-slate-300">{description}</p>
        </div>
      </section>

      {/* Search context chip (from hero search) */}
      {searchMeta && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Searched:</span>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            {[searchMeta.from, searchMeta.to || searchMeta.q].filter(Boolean).join(" → ") || searchMeta.q}
            {searchMeta.checkin ? ` · ${searchMeta.checkin}` : ""}
            <button
              aria-label="Clear search context"
              onClick={() => {
                setSearchMeta(null)
                setQuery("")
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (searchMeta) setSearchMeta(null)
            }}
            placeholder="Search deals…"
            className="h-11 pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => v && setSort(v)}>
          <SelectTrigger className="h-11 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="priceLow">Price: Low to High</SelectItem>
            <SelectItem value="priceHigh">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Clock className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No deals here yet — check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} variant="scale" delay={(i % 3) * 80} className="h-full">
              <ListingCard data={item} accent={accent} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

export function DealListing(props: DealListingProps) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <DealListingInner {...props} />
    </Suspense>
  )
}