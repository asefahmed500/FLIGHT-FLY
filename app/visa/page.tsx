"use client"

import { PageFrame } from "@/components/page-frame"
import { CatalogListing } from "@/components/listing/catalog-listing"
import { Sticker } from "lucide-react"

export default function VisaPage() {
  return (
    <PageFrame>
      <CatalogListing
        kind="visa"
        eyebrow="Fast-Track Processing"
        title="Visa Services"
        description="Business, tourist and resident visas for 190+ destinations with express processing, biometrics appointment handling and document verification."
        icon={Sticker}
        accent="blue"
      />
    </PageFrame>
  )
}