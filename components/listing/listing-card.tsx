"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DealChip } from "@/components/deal-chip"
import { CardCta } from "@/components/listing/card-cta"
import { useBookingStore } from "@/lib/stores/booking-store"
import type { BookingItemType } from "@/lib/types"

export interface ListingCardData {
  id: string
  title: string
  subtitle: string
  price: string
  originalPrice?: string
  deal?: boolean
  badge: string
  rating: number
  image: string
  detailHref: string
  type: BookingItemType
  meta?: { label: string; value: string }[]
}

interface ListingCardProps {
  data: ListingCardData
  accent?: "blue" | "amber"
  ctaLabel?: string
}

export function ListingCard({ data, ctaLabel = "Book Now" }: ListingCardProps) {
  const openBooking = useBookingStore((s) => s.openBooking)

  return (
    <Card className="group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden">
        <img
          src={data.image}
          alt={data.title}
          className="img-zoom h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <Badge className="absolute left-4 top-4 bg-[#111111] font-semibold text-xs text-white shadow-md">
          {data.badge}
        </Badge>
        {data.deal && <DealChip className="absolute right-4 top-4" />}
      </div>

      <CardContent className="flex flex-1 flex-col justify-between p-5">
        <Link href={data.detailHref} className="block">
          <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-[#111111] transition-colors group-hover:text-[#4F46E5] line-clamp-1">
            {data.title}
          </h3>
        </Link>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-[#4F46E5]">
              {data.price}
            </span>
            {data.originalPrice && (
              <span className="text-xs font-medium text-slate-400 line-through">{data.originalPrice}</span>
            )}
          </div>
          <CardCta
            detailsHref={data.detailHref}
            actionLabel={ctaLabel}
            onAction={() =>
              openBooking({
                itemId: data.id,
                title: data.title,
                subtitle: data.subtitle,
                price: data.price,
                originalPrice: data.originalPrice,
                image: data.image,
                rating: data.rating,
                type: data.type,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}