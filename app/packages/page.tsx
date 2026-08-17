"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Package } from "lucide-react"

export default function PackagesPage() {
  return (
    <PageFrame>
      <DealListing
        category="packages"
        eyebrow="All-Inclusive Journeys"
        title="Holiday & Executive Packages"
        description="Curated flight + stay bundles, helicopter excursions and yacht charters — everything arranged end-to-end by your dedicated concierge."
        icon={Package}
        accent="amber"
      />
    </PageFrame>
  )
}