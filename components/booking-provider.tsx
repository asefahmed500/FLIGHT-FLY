"use client"

import { useBookingStore } from "@/lib/stores/booking-store"
import { BookingModal } from "@/components/booking-modal"
import { Toaster } from "@/components/toaster"

export function BookingProvider() {
  const isOpen = useBookingStore((s) => s.isOpen)
  const item = useBookingStore((s) => s.item)
  const closeBooking = useBookingStore((s) => s.closeBooking)

  return (
    <>
      <BookingModal isOpen={isOpen} onClose={closeBooking} item={item} />
      <Toaster />
    </>
  )
}