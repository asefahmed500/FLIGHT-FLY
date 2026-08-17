"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Plane } from "lucide-react"

export default function FlightsPage() {
  return (
    <PageFrame>
      <DealListing
        category="flights"
        eyebrow="Business & First Class"
        title="Luxury Flights"
        description="Exclusive corporate and first-class fares on Emirates, Singapore Airlines and 500+ global carriers — with limousine transfers and lounge access included."
        icon={Plane}
        accent="blue"
      />
    </PageFrame>
  )
}