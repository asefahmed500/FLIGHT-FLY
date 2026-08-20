"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PageFrame } from "@/components/page-frame"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ListingCard, type ListingCardData } from "@/components/listing/listing-card"
import { Reveal } from "@/components/motion/reveal"
import { useDeals } from "@/lib/firestore-data"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useToastStore } from "@/lib/stores/toast-store"
import { useAuth } from "@/lib/auth-context"
import { useMyFavorites, toggleFavorite } from "@/lib/app-data"
import { ChevronRight, Star, ShieldCheck, CalendarCheck, Clock, BadgeCheck, Check, Heart } from "lucide-react"
import type { Deal, DealCategory, BookingItemType } from "@/lib/types"

const CATEGORY_TYPE: Record<DealCategory, BookingItemType> = {
  flights: "flight",
  hotels: "hotel",
  packages: "package",
  tours: "tour",
  visa: "visa",
  tickets: "ticket",
}

const INCLUSIONS = [
  "All taxes & service fees included",
  "Dedicated 24/7 concierge line",
  "Free date changes up to 24h before",
  "Premium partner upgrades where available",
]

const CATEGORY_HIGHLIGHTS: Record<DealCategory, string[]> = {
  flights: ["Round-trip premium cabin fares", "Airport lounge access included", "Priority check-in & boarding", "Generous business baggage allowance"],
  hotels: ["5-star handpicked accommodation", "Daily breakfast for two guests", "Late checkout where available", "Resort credits on select stays"],
  packages: ["Curated multi-day itinerary", "All internal transfers included", "Handpicked hotels each night", "Guided experiences throughout"],
  tours: ["Expert local guide throughout", "All entry tickets included", "Small-group or private option", "Hotel pickup and drop-off"],
  visa: ["Document checklist & review", "Embassy appointment booking", "Application tracking to decision", "Cover letter & insurance guidance"],
  tickets: ["Guaranteed entry, skip the line", "E-ticket delivered instantly", "Premium or VIP seating options", "Free reschedule on select events"],
}

const STEPS = [
  { n: "01", t: "Reserve in 2 minutes", d: "Book now and pay by card or corporate invoice — no account needed to lock the fare." },
  { n: "02", t: "Instant confirmation", d: "Your reservation lands in your dashboard and moves from pending to approved, usually within 2 minutes." },
  { n: "03", t: "Travel with QR e-tickets", d: "Boarding passes and QR tickets are generated in your dashboard — download or scan them anytime." },
]

export default function DealDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""
  const { deals, loading } = useDeals()
  const openBooking = useBookingStore((s) => s.openBooking)
  const pushToast = useToastStore((s) => s.push)
  const router = useRouter()
  const { user } = useAuth()
  const { favorites, refresh } = useMyFavorites(user)
  const [saving, setSaving] = useState(false)

  const savedIds = new Set(favorites.map((f) => f.id))

  const handleToggleFavorite = async () => {
    const deal = deals.find((d) => d.id === id)
    if (!deal || !user || saving) return
    setSaving(true)
    try {
      const res = await toggleFavorite(user, {
        id: deal.id,
        title: deal.title,
        price: deal.discountPrice,
        category: deal.category,
        image: deal.image,
      })
      refresh()
      pushToast({
        variant: res.added ? "success" : "info",
        title: res.added ? "Saved to your wishlist" : "Removed from wishlist",
        description: res.added
          ? "Find it anytime under Saved Wishlist in your dashboard."
          : "This deal was removed from your saved list.",
      })
    } catch (err) {
      pushToast({
        variant: "error",
        title: "Could not update wishlist",
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

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

  const deal = deals.find((d) => d.id === id)
  if (!deal) {
    return (
      <PageFrame>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-5xl" aria-hidden="true">🔥</p>
          <h1 className="text-2xl font-semibold text-[#111111]">This deal has ended</h1>
          <p className="text-sm text-slate-500">It either expired or sold out. Check out this week&apos;s fresh deals instead.</p>
          <Button render={<Link href="/deals" />} className="mt-2 bg-amber-500 hover:bg-amber-600">
            View All Deals
          </Button>
        </div>
      </PageFrame>
    )
  }

  const type = CATEGORY_TYPE[deal.category] ?? "package"
  const priceNum = (p: string) => parseFloat(p.replace(/[^0-9.]/g, "")) || 0
  const savings = (() => {
    const a = priceNum(deal.originalPrice)
    const b = priceNum(deal.discountPrice)
    if (!a || !b || a <= b) return null
    return Math.round(((a - b) / a) * 100)
  })()
  const savedAmount = (() => {
    const a = priceNum(deal.originalPrice)
    const b = priceNum(deal.discountPrice)
    return a > b ? `$${Math.round(a - b)}` : null
  })()
  const highlights = CATEGORY_HIGHLIGHTS[deal.category] ?? CATEGORY_HIGHLIGHTS.packages

  const related = deals
    .filter((d) => d.id !== deal.id && d.category === deal.category)
    .slice(0, 3)
    .map((r: Deal): ListingCardData => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      price: r.discountPrice,
      originalPrice: r.originalPrice,
      deal: true,
      badge: r.badge,
      rating: r.rating,
      image: r.image,
      detailHref: `/deals/${r.id}`,
      type: CATEGORY_TYPE[r.category] ?? "package",
      meta: [{ label: "Expires", value: r.expires }],
    }))

  return (
    <PageFrame>
      <div className="flex flex-col gap-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-[#4F46E5]">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/deals" className="hover:text-[#4F46E5]">Deals</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="max-w-[40ch] truncate text-slate-900">{deal.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={deal.image} alt={deal.title} className="h-[420px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute left-6 top-6 flex gap-2">
                <Badge className="bg-white/95 font-semibold text-slate-900">{deal.badge}</Badge>
                <Badge className="bg-amber-500 font-semibold text-white"><span aria-hidden="true">🔥</span> Hot Deal</Badge>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#111111] sm:text-3xl">{deal.title}</h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">{deal.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-600">
                  <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" /> {deal.rating}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Offer ends</p>
                    <p className="text-sm font-semibold text-slate-800">{deal.expires}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <CalendarCheck className="h-4 w-4 text-[#4F46E5]" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Confirmation</p>
                    <p className="text-sm font-semibold text-slate-800">Instant, usually 2 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Status</p>
                    <p className="text-sm font-semibold text-emerald-600">Available now</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">What&apos;s included</h2>
                <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  {INCLUSIONS.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Deal highlights</h2>
                <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  {highlights.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 stroke-amber-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">How this deal works</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {STEPS.map((s) => (
                    <div key={s.n} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <span className="text-xs font-bold tracking-widest text-[#4F46E5]">{s.n}</span>
                      <p className="mt-1.5 text-sm font-semibold text-slate-800">{s.t}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-6 shadow-lg shadow-amber-900/5">
              {savings && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-500 px-3 py-2 text-white">
                  <span className="text-xs font-semibold">Weekly special</span>
                  <span className="text-sm font-bold">Save {savings}%</span>
                </div>
              )}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Deal price</p>
                  <p className="text-3xl font-semibold text-[#B45309]">{deal.discountPrice}</p>
                  <p className="text-sm font-medium text-slate-400 line-through">{deal.originalPrice}</p>
                </div>
                {savedAmount && (
                  <Badge className="bg-emerald-100 font-semibold text-emerald-700">You save {savedAmount}</Badge>
                )}
              </div>

              <div className="mt-4 space-y-2 rounded-xl bg-white/70 p-4 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Fare / stay price</span>
                  <span className="font-medium text-slate-800">{deal.discountPrice}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Taxes &amp; service fees</span>
                  <span className="font-medium text-emerald-600">Included</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>24/7 concierge support</span>
                  <span className="font-medium text-emerald-600">Included</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                  <span className="font-semibold text-slate-800">Total due today</span>
                  <span className="text-lg font-semibold text-[#B45309]">{deal.discountPrice}</span>
                </div>
              </div>

              <Button
                onClick={() =>
                  openBooking({
                    itemId: deal.id,
                    title: deal.title,
                    subtitle: deal.subtitle,
                    price: deal.discountPrice,
                    originalPrice: deal.originalPrice,
                    image: deal.image,
                    rating: deal.rating,
                    type,
                  })
                }
                className="mt-5 h-12 w-full bg-[#D97706] text-sm font-semibold hover:bg-[#B45309]"
              >
                Grab This Deal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!user) {
                    router.push("/login?tab=login")
                    return
                  }
                  handleToggleFavorite()
                }}
                disabled={saving}
                className="mt-2 h-11 w-full border-amber-300 bg-white text-sm font-medium text-[#B45309] hover:bg-amber-100"
              >
                <Heart
                  className={`mr-1.5 h-4 w-4 ${savedIds.has(deal.id) ? "fill-rose-500 text-rose-500" : ""}`}
                  aria-hidden="true"
                />
                {saving ? "Updating…" : savedIds.has(deal.id) ? "Saved — remove from wishlist" : "Save this deal"}
              </Button>

              <div className="mt-5 space-y-3 border-t border-amber-100 pt-5">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Ends {deal.expires} — no extensions
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
                  <CalendarCheck className="h-4 w-4 text-emerald-500" /> Free cancellation up to 48h
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-4">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">More hot deals</p>
                <h2 className="mt-1 text-xl font-semibold text-[#111111]">You might also love</h2>
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