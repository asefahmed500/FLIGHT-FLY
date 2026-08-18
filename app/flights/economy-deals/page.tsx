"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Plane } from "lucide-react"

export default function EconomyDealsPage() {
  return (
    <PageFrame>
      <DealListing
        category="flights"
        initialQuery="economy"
        eyebrow="Economy"
        title="Economy Flight Deals"
        description="Best-value economy fares across 500+ global carriers, with flexible dates, stopovers and family seating options."
        icon={Plane}
        accent="blue"
      />
    </PageFrame>
  )
}