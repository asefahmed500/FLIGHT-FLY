"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Building2 } from "lucide-react"

export default function HotelsPage() {
  return (
    <PageFrame>
      <DealListing
        category="hotels"
        eyebrow="5-Star Handpicked Stays"
        title="Luxury Hotels & Resorts"
        description="Hand-inspected 5-star suites, overwater villas and presidential rooms across 85,000 partner properties — with complimentary upgrades and daily breakfast."
        icon={Building2}
        accent="blue"
      />
    </PageFrame>
  )
}