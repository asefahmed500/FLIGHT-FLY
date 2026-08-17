"use client"

import { Navbar } from "@/components/navbar"
import { HeroSearch } from "@/components/hero-search"
import { PromoBanner } from "@/components/promo-banner"
import { InterstitialBanner } from "@/components/interstitial-banner"
import { CategoryCards } from "@/components/category-cards"
import { FeaturedDestinations } from "@/components/featured-destinations"
import { PopularDeals } from "@/components/popular-deals"
import { WhyChooseUs } from "@/components/why-choose-us"
import { TrendingTours } from "@/components/trending-tours"
import { Testimonials } from "@/components/testimonials"
import { AppNewsletter } from "@/components/app-newsletter"
import { Footer } from "@/components/footer"
import { VisaServices } from "@/components/visa-services"
import { TicketsExperiences } from "@/components/tickets-experiences"
import { ScrollytellingSection } from "@/components/scrollytelling"
import { TrustedBy } from "@/components/trusted-by"
import { useBookingStore } from "@/lib/stores/booking-store"
import type { BookingItemType } from "@/lib/types"

export default function Home() {
  const handleBookItem = (item: {
    title: string
    price: string
    subtitle?: string
    rating?: number
    type?: BookingItemType
  }) => {
    useBookingStore.getState().openBooking(item)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#1E40AF] selection:text-white">
      <Navbar />

      <HeroSearch onSearchSubmit={handleBookItem} />
      <PromoBanner />
      <CategoryCards />
      <TrustedBy />
      <InterstitialBanner variant="app" />
      <FeaturedDestinations onBookItem={handleBookItem} />
      <PopularDeals onBookItem={handleBookItem} />
      <InterstitialBanner variant="flash" />
      <VisaServices onBookItem={handleBookItem} />
      <TicketsExperiences onBookItem={handleBookItem} />
      <InterstitialBanner variant="vip" />
      <ScrollytellingSection />
      <WhyChooseUs />
      <TrendingTours onBookItem={handleBookItem} />
      <Testimonials />
      <AppNewsletter />
      <Footer />
    </main>
  )
}