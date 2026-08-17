"use client"

import { create } from "zustand"
import type { BookingItemType } from "@/lib/types"

export interface BookingItemInfo {
  title: string
  subtitle?: string
  price: string
  originalPrice?: string
  image?: string
  rating?: number
  type?: BookingItemType
  href?: string
}

interface BookingState {
  isOpen: boolean
  item: BookingItemInfo | null
  openBooking: (item: BookingItemInfo) => void
  closeBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  isOpen: false,
  item: null,
  openBooking: (item) => set({ isOpen: true, item }),
  closeBooking: () => set({ isOpen: false }),
}))