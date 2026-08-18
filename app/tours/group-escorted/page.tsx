"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Compass } from "lucide-react"

export default function GroupEscortedPage() {
  return (
    <PageFrame>
      <DealListing
        category="tours"
        initialQuery="group"
        eyebrow="Group & Escorted"
        title="Group & Escorted Tours"
        description="Shared and private group trips with expert local guides and door-to-door logistics."
        icon={Compass}
        accent="blue"
      />
    </PageFrame>
  )
}