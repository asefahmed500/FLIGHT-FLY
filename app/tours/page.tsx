"use client"

import { PageFrame } from "@/components/page-frame"
import { CatalogListing } from "@/components/listing/catalog-listing"
import { Compass } from "lucide-react"

export default function ToursPage() {
  return (
    <PageFrame>
      <CatalogListing
        kind="tour"
        eyebrow="Expert-Led Adventures"
        title="Tours & Desert Safaris"
        description="Guided city tours, desert safaris and multi-day adventures with licensed English-speaking guides, private 4x4 transport and premium dining experiences."
        icon={Compass}
        accent="amber"
      />
    </PageFrame>
  )
}