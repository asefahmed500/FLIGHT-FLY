"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Plane } from "lucide-react"

export default function PrivateCharterPage() {
  return (
    <PageFrame>
      <DealListing
        category="flights"
        initialQuery="charter"
        eyebrow="Private Charter"
        title="Private Jet Charter"
        description="By-the-hour private jet hire with bespoke itineraries, in-flight catering and ground transfers arranged end-to-end."
        icon={Plane}
        accent="amber"
      />
    </PageFrame>
  )
}