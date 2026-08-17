"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Star, ArrowRight } from "lucide-react"
import type { BookingItemType } from "@/lib/types"
import { useCatalog } from "@/lib/firestore-data"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"

interface TicketsExperiencesProps {
  onBookItem: (item: { title: string; price: string; subtitle: string; rating: number; type: BookingItemType }) => void
}

const TICKETS = [
  {
    id: "ticket-burj",
    title: "Burj Khalifa At The Top Sky",
    subtitle: "Level 148 sunset access with lounge & refreshments",
    price: "$135",
    originalPrice: "$170",
    deal: true,
    badge: "LEVEL 148",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "ticket-cirque",
    title: "Cirque du Soleil Premium Seats",
    subtitle: "Reserved club section with backstage meet & greet",
    price: "$210",
    badge: "FRONT ROW",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "ticket-opera",
    title: "Sydney Opera House Gala Night",
    subtitle: "Orchestra stalls with interval champagne service",
    price: "$180",
    badge: "VIP ORCHESTRA",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1541506491-6506b79e2c3c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "ticket-cruise",
    title: "Monaco Grand Prix Yacht Spectator",
    subtitle: "Trackside yacht viewing platform with hosted bar",
    price: "$1,450",
    badge: "YACHT PASS",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1506029642148-0c0d40b08579?q=80&w=800&auto=format&fit=crop",
  },
]

export function TicketsExperiences({ onBookItem }: TicketsExperiencesProps) {
  const { catalog } = useCatalog()
  const live = catalog.filter((item) => item.kind === "ticket")
  const tickets = live.length > 0 ? live : TICKETS

  return (
    <section id="tickets-experiences" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12">
          <div className="mb-2.5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D97706]">
            <Ticket className="h-3.5 w-3.5" /> Tickets &amp; Experiences
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[#0F172A] sm:text-4xl">
            Unforgettable Events &amp; Experiences
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-normal text-slate-500">
            Curated access to sold-out shows, sky-high viewpoints and once-in-a-lifetime experiences — reserved with your name on every ticket.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
          {tickets.map((ticket, i) => (
            <Reveal key={ticket.id} variant="scale" delay={i * 80}>
              <Card className="group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
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
                    <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-[#0F172A] transition-colors group-hover:text-[#1E40AF] line-clamp-1">
                      {ticket.title}
                    </h3>
                  </Link>

                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="mb-3">
                      <span className="text-lg font-semibold text-[#1E40AF]">
                        {ticket.price}
                        {ticket.originalPrice && (
                          <span className="ml-1.5 text-xs font-medium text-slate-400 line-through">{ticket.originalPrice}</span>
                        )}
                      </span>
                    </div>
                    <CardCta
                      detailsHref={`/catalog/${ticket.id}`}
                      actionLabel="Book Now"
                      onAction={() => onBookItem({ title: ticket.title, subtitle: ticket.subtitle, price: ticket.price, rating: ticket.rating, type: "ticket" })}
                    />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}