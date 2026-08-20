"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sticker, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { BookingItemInfo } from "@/lib/stores/booking-store"
import { useCatalog } from "@/lib/firestore-data"
import { Reveal } from "@/components/motion/reveal"
import { CardCta } from "@/components/listing/card-cta"
import { DealChip } from "@/components/deal-chip"
import { GlareCard } from "@/components/listing/glare-card"

interface VisaServicesProps {
  onBookItem: (item: BookingItemInfo) => void
}

export function VisaServices({ onBookItem }: VisaServicesProps) {
  const { catalog, loading } = useCatalog()
  const services = catalog.filter((item) => item.kind === "visa")

  return (
    <section id="visa-services" className="bg-[#FAFAFA] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12">
          <div className="mb-2.5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D97706]">
            <Sticker className="h-3.5 w-3.5" /> Visa &amp; Entry Services
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.01em] text-[#111111] sm:text-4xl">
            Global Visas, Handled End-to-End
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-normal text-slate-500">
            Our in-house immigration concierge prepares every document, books appointments and tracks your application until it lands.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : services.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {services.map((visa, i) => (
            <Reveal key={visa.id} variant="scale" delay={i * 80} className="h-full">
              <GlareCard className="h-full rounded-xl" glareColor="rgba(79, 70, 229, 0.2)">
              <Card className="shine-sweep group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-200 hover:shadow-xl">
                <div className="relative h-44 overflow-hidden">
                  <img src={visa.image} alt={visa.title} className="img-zoom h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <Badge className="absolute left-4 top-4 bg-[#111111] text-white font-semibold text-xs px-3 py-1 shadow-md">
                    <Clock className="mr-1 h-3 w-3 text-amber-400" /> {visa.badge}
                  </Badge>
                  {visa.deal && <DealChip className="absolute right-4 top-4" />}
                  <span className="visa-stamp absolute bottom-3 right-3 rounded-full border-2 border-amber-400/70 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-300 backdrop-blur-sm">
                    Approved
                  </span>
                </div>

<CardContent className="flex flex-1 flex-col justify-between p-5">
                  <Link href={`/catalog/${visa.id}`}>
                    <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-[#111111] transition-colors group-hover:text-[#4F46E5] line-clamp-1">
                      {visa.title}
                    </h3>
                  </Link>

                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="mb-3">
                      <span className="text-lg font-semibold text-[#4F46E5]">
                        {visa.price} <span className="text-xs font-normal text-slate-400">/ applicant</span>
                        {visa.originalPrice && (
                          <span className="ml-1.5 text-xs font-medium text-slate-400 line-through">{visa.originalPrice}</span>
                        )}
                      </span>
                    </div>
                    <CardCta
                      detailsHref={`/catalog/${visa.id}`}
                      actionLabel="Apply Now"
                      onAction={() => onBookItem({ itemId: visa.id, title: visa.title, subtitle: visa.subtitle, price: visa.price, rating: visa.rating, type: "visa" })}
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