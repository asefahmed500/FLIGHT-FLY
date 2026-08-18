"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { PageFrame } from "@/components/page-frame"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ListingCard, type ListingCardData } from "@/components/listing/listing-card"
import { Reveal } from "@/components/motion/reveal"
import { useCatalog } from "@/lib/firestore-data"
import { useBookingStore } from "@/lib/stores/booking-store"
import { ChevronRight, Star, ShieldCheck, CalendarCheck, Clock, Users, MapPin, BadgeCheck } from "lucide-react"
import type { CatalogItem, CatalogKind, BookingItemType } from "@/lib/types"

const KIND_TYPE: Record<CatalogKind, BookingItemType> = {
  visa: "visa",
  ticket: "ticket",
  tour: "tour",
  destination: "package",
  testimonial: "package",
  feature: "package",
  promo: "package",
}

const BREADCRUMB: Partial<Record<CatalogKind, { href: string; label: string }>> = {
  visa: { href: "/visa", label: "Visa" },
  ticket: { href: "/tickets", label: "Tickets" },
  tour: { href: "/tours", label: "Tours" },
  destination: { href: "/", label: "Destinations" },
}

const TRUST = [
  { icon: ShieldCheck, label: "Verified & licensed operator" },
  { icon: BadgeCheck, label: "Free cancellation up to 48h" },
  { icon: CalendarCheck, label: "Instant confirmation" },
]

export default function CatalogDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""
  const { catalog, loading } = useCatalog()
  const openBooking = useBookingStore((s) => s.openBooking)

  if (loading) {
    return (
      <PageFrame>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-6 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-3xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        </div>
      </PageFrame>
    )
  }

  const item = catalog.find((c) => c.id === id)
  if (!item) {
    return (
      <PageFrame>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-5xl">🧭</p>
          <h1 className="text-2xl font-semibold text-[#111111]">This item is no longer available</h1>
          <p className="text-sm text-slate-500">It may have sold out or been removed from our catalog.</p>
          <Button render={<Link href="/" />} className="mt-2 bg-[#111111] hover:bg-[#4F46E5]">
            Back to Home
          </Button>
        </div>
      </PageFrame>
    )
  }

  const type = KIND_TYPE[item.kind]
  const meta: { icon: typeof MapPin; label: string; value: string }[] = []
  if (item.location) meta.push({ icon: MapPin, label: "Location", value: item.location })
  if (item.country) meta.push({ icon: MapPin, label: "Country", value: item.country })
  if (item.duration) meta.push({ icon: Clock, label: "Duration", value: item.duration })
  if (item.groupSize) meta.push({ icon: Users, label: "Group Size", value: item.groupSize })

  const related = catalog
    .filter((c) => c.id !== item.id && c.kind === item.kind)
    .slice(0, 3)
    .map((r: CatalogItem): ListingCardData => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle || r.description || "",
      price: r.price,
      originalPrice: r.originalPrice,
      deal: r.deal,
      badge: r.badge || "Featured",
      rating: r.rating,
      image: r.image,
      detailHref: `/catalog/${r.id}`,
      type: KIND_TYPE[r.kind],
    }))

  return (
    <PageFrame>
      <div className="flex flex-col gap-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-[#4F46E5]">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href={BREADCRUMB[item.kind]?.href ?? "/deals"} className="hover:text-[#4F46E5]">
            {BREADCRUMB[item.kind]?.label ?? "Deals"}
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="max-w-[40ch] truncate text-slate-900">{item.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={item.image} alt={item.title} className="h-[420px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute left-6 top-6 flex gap-2">
                <Badge className="bg-white/95 font-semibold text-slate-900">{item.badge}</Badge>
                {item.deal && <Badge className="bg-amber-500 font-semibold text-white">Limited Deal</Badge>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#111111] sm:text-3xl">{item.title}</h1>
                  {item.subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{item.subtitle}</p>}
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-600">
                  <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" /> {item.rating}
                </div>
              </div>

              {meta.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {meta.map((m) => (
                    <div key={m.label} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <m.icon className="h-4 w-4 text-[#4F46E5]" />
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{m.label}</p>
                        <p className="text-sm font-semibold text-slate-800">{m.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">About this {item.kind}</h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
                <ul className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  {[
                    item.duration ? `Includes ${item.duration}` : null,
                    item.groupSize ? `Group size: ${item.groupSize}` : null,
                    item.location ? `Located in ${item.location}` : null,
                    item.reviews ? `Rated ${item.rating} · ${item.reviews}` : null,
                    "Verified licensed operator with 24/7 support",
                    "Instant confirmation & flexible cancellation",
                  ]
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Starting from</p>
                  <p className="text-3xl font-semibold text-[#4F46E5]">{item.price}</p>
                  {item.originalPrice && (
                    <p className="text-sm font-medium text-slate-400 line-through">{item.originalPrice}</p>
                  )}
                </div>
                {item.deal && (
                  <Badge className="bg-amber-500 font-semibold text-white">Save up to 25%</Badge>
                )}
              </div>

              <Button
                onClick={() =>
                  openBooking({
                    itemId: item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    image: item.image,
                    rating: item.rating,
                    type,
                  })
                }
                className="mt-5 h-12 w-full bg-[#111111] text-sm font-semibold hover:bg-[#4F46E5]"
              >
                Book Now — Instant Confirmation
              </Button>
              <p className="mt-3 text-center text-[11px] text-slate-400">Free cancellation up to 48 hours before</p>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                {TRUST.map((t) => (
                  <div key={t.label} className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
                    <t.icon className="h-4 w-4 text-emerald-500" /> {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-4">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#4F46E5]">Keep exploring</p>
                <h2 className="mt-1 text-xl font-semibold text-[#111111]">Similar {item.kind === "ticket" ? "tickets" : item.kind === "tour" ? "tours" : "services"}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r.id} variant="scale" delay={i * 80} className="h-full">
                  <ListingCard data={r} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageFrame>
  )
}