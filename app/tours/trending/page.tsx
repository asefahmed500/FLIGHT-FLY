"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Compass } from "lucide-react"

export default function TrendingToursPage() {
  return (
    <PageFrame>
      <DealListing
        category="tours"
        eyebrow="Trending Tours"
        title="Trending Guided Tours"
        description="Handpicked guided experiences rated by thousands of verified travellers."
        icon={Compass}
        accent="amber"
      />
    </PageFrame>
  )
}