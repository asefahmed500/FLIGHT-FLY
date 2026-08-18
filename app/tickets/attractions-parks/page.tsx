"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Ticket } from "lucide-react"

export default function AttractionsParksPage() {
  return (
    <PageFrame>
      <DealListing
        category="tickets"
        initialQuery="attraction"
        eyebrow="Attractions & Parks"
        title="Attractions & Theme Parks"
        description="Skip-the-line entry passes for the world's top museums, parks and landmarks."
        icon={Ticket}
        accent="amber"
      />
    </PageFrame>
  )
}