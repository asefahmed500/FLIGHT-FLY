"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Ticket } from "lucide-react"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import { useCatalog } from "@/lib/firestore-data"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"
import { GlareCard } from "@/components/listing/glare-card"

interface TicketsExperiencesProps {
  onBookItem: (item: BookingItemInfo) => void
}

export function TicketsExperiences({ onBookItem }: TicketsExperiencesProps) {
  const { catalog, loading } = useCatalog()
  const tickets = catalog.filter((item) => item.kind === "ticket")

  return (
    <section id="tickets-experiences" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12">
          <div className="mb-2.5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D97706]">
            <Ticket className="h-3.5 w-3.5" /> Tickets &amp; Experiences
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[#111111] sm:text-4xl">
            Unforgettable Events &amp; Experiences
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-normal text-slate-500">
            Curated access to sold-out shows, sky-high viewpoints and once-in-a-lifetime experiences — reserved with your name on every ticket.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : tickets.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {tickets.map((ticket, i) => (
            <Reveal key={ticket.id} variant="scale" delay={i * 80} className="h-full">
              <GlareCard className="h-full rounded-xl" glareColor="rgba(217, 119, 6, 0.22)">
              <Card className="edge-glow group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="relative h-44 overflow-hidden">
                  <img src={ticket.image} alt={ticket.title} className="img-zoom h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <Badge className="absolute left-4 top-4 bg-amber-500 text-slate-950 font-semibold text-xs px-3 py-1 shadow-md">
                    {ticket.badge}
                  </Badge>
                  {ticket.deal && <DealChip className="absolute right-4 top-4" />}
                </div>

<CardContent className="flex flex-1 flex-col justify-between p-5">
                  <Link href={`/catalog/${ticket.id}`}>
                    <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-[#111111] transition-colors group-hover:text-[#4F46E5] line-clamp-1">
                      {ticket.title}
                    </h3>
                  </Link>

                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="mb-3">
                      <span className="text-lg font-semibold text-[#4F46E5]">
                        {ticket.price}
                        {ticket.originalPrice && (
                          <span className="ml-1.5 text-xs font-medium text-slate-400 line-through">{ticket.originalPrice}</span>
                        )}
                      </span>
                    </div>
                    <CardCta
                      detailsHref={`/catalog/${ticket.id}`}
                      actionLabel="Book Now"
                      onAction={() => onBookItem({ itemId: ticket.id, title: ticket.title, subtitle: ticket.subtitle, price: ticket.price, rating: ticket.rating, type: "ticket" })}
                    />
                  </div>
                </CardContent>
              </Card>
              </GlareCard>
            </Reveal>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}