"use client"

import { useMemo, useState } from "react"
import { Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
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
}

const CATEGORY_TYPE: Record<DealCategory, BookingItemType> = {
  flights: "flight",
  hotels: "hotel",
  packages: "package",
  tours: "tour",
  visa: "visa",
  tickets: "ticket",
}

export function DealListing({ category, eyebrow, title, description, icon: Icon, accent = "blue" }: DealListingProps) {
  const { deals, loading } = useDeals()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("popular")

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
      data = data.filter(
        (d) => d.title.toLowerCase().includes(q) || d.subtitle.toLowerCase().includes(q) || d.badge.toLowerCase().includes(q)
      )
    }
    const priceNum = (p: string) => parseFloat(p.replace(/[^0-9.]/g, "")) || 0
    if (sort === "rating") data = [...data].sort((a, b) => b.rating - a.rating)
    if (sort === "priceLow") data = [...data].sort((a, b) => priceNum(a.price) - priceNum(b.price))
    if (sort === "priceHigh") data = [...data].sort((a, b) => priceNum(b.price) - priceNum(a.price))
    return data
  }, [deals, category, query, sort])

  const accentIcon = accent === "amber" ? "bg-[#D97706]/10" : "bg-[#1E40AF]/10"

  return (
    <div className="flex flex-col gap-10">
      {/* Page hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0F172A] px-6 py-16 text-white sm:px-12 sm:py-20">
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

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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