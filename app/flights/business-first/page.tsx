"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Plane } from "lucide-react"

export default function BusinessFirstPage() {
  return (
    <PageFrame>
      <DealListing
        category="flights"
        initialQuery="business"
        eyebrow="Business & First Class"
        title="Business & First Class Flights"
        description="Executive cabins with lounge access, chauffeur transfers and lie-flat seats on Emirates, Singapore Airlines and 500+ global carriers."
        icon={Plane}
        accent="blue"
      />
    </PageFrame>
  )
}