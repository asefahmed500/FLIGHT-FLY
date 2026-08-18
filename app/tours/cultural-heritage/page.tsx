"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Compass } from "lucide-react"

export default function CulturalHeritagePage() {
  return (
    <PageFrame>
      <DealListing
        category="tours"
        initialQuery="cultural"
        eyebrow="Cultural & Heritage"
        title="Cultural & Heritage Tours"
        description="History-rich journeys through world heritage sites with specialist local guides."
        icon={Compass}
        accent="amber"
      />
    </PageFrame>
  )
}