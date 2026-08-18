"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useCatalog } from "@/lib/firestore-data"
import { ListingCard, type ListingCardData } from "@/components/listing/listing-card"
import { Reveal } from "@/components/motion/reveal"
import type { CatalogItem, CatalogKind, BookingItemType } from "@/lib/types"

interface CatalogListingProps {
  kind: CatalogKind
  eyebrow: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  accent?: "blue" | "amber"
  ctaLabel?: string
}

const KIND_TYPE: Record<CatalogKind, BookingItemType> = {
  visa: "visa",
  ticket: "ticket",
  tour: "tour",
  destination: "package",
  testimonial: "package",
  feature: "package",
  promo: "package",
}

function CatalogListingInner({
  kind,
  eyebrow,
  title,
  description,
  icon: Icon,
  accent = "blue",
  ctaLabel,
}: CatalogListingProps) {
  const { catalog, loading } = useCatalog()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [onlyDeals, setOnlyDeals] = useState(false)
  const [sort, setSort] = useState("popular")

  // Consume hero-search q param once on mount.
  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchParams.get("q")
      if (q) setQuery(q)
    }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = useMemo<ListingCardData[]>(() => {
    const live = catalog.filter((c) => c.kind === kind)
    const data = live.map((item: CatalogItem) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || item.description || "",
      price: item.price,
      originalPrice: item.originalPrice,
      deal: item.deal,
      badge: item.badge || "Featured",
      rating: item.rating,
      image: item.image,
      detailHref: `/catalog/${item.id}`,
      type: KIND_TYPE[kind],
      meta: [
        item.location ? { label: "Location", value: item.location } : null,
        item.country ? { label: "Country", value: item.country } : null,
        item.duration ? { label: "Duration", value: item.duration } : null,
        item.groupSize ? { label: "Group", value: item.groupSize } : null,
      ].filter(Boolean) as { label: string; value: string }[],
    }))

    let filtered = data
    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(
        (d) => d.title.toLowerCase().includes(q) || d.subtitle.toLowerCase().includes(q) || d.badge.toLowerCase().includes(q)
      )
    }
    if (onlyDeals) filtered = filtered.filter((d) => d.deal)

    const priceNum = (p: string) => parseFloat(p.replace(/[^0-9.]/g, "")) || 0
    if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating)
    if (sort === "priceLow") filtered = [...filtered].sort((a, b) => priceNum(a.price) - priceNum(b.price))
    if (sort === "priceHigh") filtered = [...filtered].sort((a, b) => priceNum(b.price) - priceNum(a.price))
    return filtered
  }, [catalog, kind, query, onlyDeals, sort])

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
          <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${accent === "amber" ? "text-amber-400" : "text-sky-300"}`}>
            {eyebrow}
          </p>
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
            placeholder="Search by name, badge or keyword…"
            className="h-11 pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setOnlyDeals((v) => !v)}
            className={`h-11 border-slate-200 text-sm font-medium transition-colors ${
              onlyDeals ? "border-amber-400 bg-amber-50 text-amber-700" : "text-slate-600"
            }`}
          >
            🔥 Deals only
          </Button>
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
          <Star className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No items match your filters.</p>
          <Button variant="outline" size="sm" onClick={() => { setQuery(""); setOnlyDeals(false); setSort("popular") }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} variant="scale" delay={(i % 3) * 80} className="h-full">
              <ListingCard data={item} accent={accent} ctaLabel={ctaLabel} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

export function CatalogListing(props: CatalogListingProps) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <CatalogListingInner {...props} />
    </Suspense>
  )
}