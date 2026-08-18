"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Ticket } from "lucide-react"

export default function ConcertsEventsPage() {
  return (
    <PageFrame>
      <DealListing
        category="tickets"
        initialQuery="concert"
        eyebrow="Concerts & Events"
        title="Concerts & Live Events"
        description="Front-row and VIP seats for concerts, festivals and sporting events worldwide."
        icon={Ticket}
        accent="blue"
      />
    </PageFrame>
  )
}