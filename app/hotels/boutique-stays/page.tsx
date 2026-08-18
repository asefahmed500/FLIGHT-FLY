"use client"

import { PageFrame } from "@/components/page-frame"
import { DealListing } from "@/components/listing/deal-listing"
import { Hotel } from "lucide-react"

export default function BoutiqueStaysPage() {
  return (
    <PageFrame>
      <DealListing
        category="hotels"
        initialQuery="boutique"
        eyebrow="Boutique Stays"
        title="Boutique Hotels"
        description="Design-forward hideaways and intimate city hotels for travellers who prefer character over chains."
        icon={Hotel}
        accent="blue"
      />
    </PageFrame>
  )
}