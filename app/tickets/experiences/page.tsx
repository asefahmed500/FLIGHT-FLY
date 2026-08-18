"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Ticket } from "lucide-react"

export default function ExperiencesPage() {
  return (
    <PageFrame>
      <DealListing
        category="tickets"
        initialQuery="experience"
        eyebrow="Experiences"
        title="Curated Experiences"
        description="Dining, cruises, hot-air balloon rides and once-in-a-lifetime adventures, arranged by our concierge."
        icon={Ticket}
        accent="blue"
      />
    </PageFrame>
  )
}