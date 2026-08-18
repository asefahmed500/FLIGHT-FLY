"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Hotel } from "lucide-react"

export default function LuxuryResortsPage() {
  return (
    <PageFrame>
      <DealListing
        category="hotels"
        initialQuery="resort"
        eyebrow="Luxury Resorts"
        title="Luxury Resorts & Villas"
        description="Five-star beachfront resorts and private villas with butler service across the Maldives, Bali, Dubai and beyond."
        icon={Hotel}
        accent="amber"
      />
    </PageFrame>
  )
}