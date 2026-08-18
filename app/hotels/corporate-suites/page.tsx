"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Hotel } from "lucide-react"

export default function CorporateSuitesPage() {
  return (
    <PageFrame>
      <DealListing
        category="hotels"
        initialQuery="suite"
        eyebrow="Corporate Suites"
        title="Executive Corporate Suites"
        description="City-center business suites with meeting rooms, high-speed connectivity and seamless airport transfers."
        icon={Hotel}
        accent="blue"
      />
    </PageFrame>
  )
}