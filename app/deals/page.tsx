"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Tag } from "lucide-react"

export default function DealsPage() {
  return (
    <PageFrame>
      <DealListing
        eyebrow="Limited-Time Offers"
        title="Hot Deals of the Week"
        description="Hand-picked promotions refreshed every week across flights, hotels and packages. Prices include all taxes — once they're gone, they're gone."
        icon={Tag}
        accent="amber"
      />
    </PageFrame>
  )
}