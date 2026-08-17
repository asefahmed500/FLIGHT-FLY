"use client"

import { PageFrame } from "@/components/page-frame"
import { CatalogListing } from "@/components/listing/catalog-listing"
import { Ticket } from "lucide-react"

export default function TicketsPage() {
  return (
    <PageFrame>
      <CatalogListing
        kind="ticket"
        eyebrow="Skip-the-Line Entry"
        title="Tickets & Experiences"
        description="Guaranteed-entry tickets to Burj Khalifa, theme parks, shows and dining experiences — book now, use whenever your plans take shape."
        icon={Ticket}
        accent="blue"
      />
    </PageFrame>
  )
}