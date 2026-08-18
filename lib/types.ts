export type UserRole = "customer" | "admin"

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled"

export type BookingItemType = "flight" | "hotel" | "tour" | "package" | "visa" | "ticket"

export type PaymentType = "card" | "invoice"

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface Booking {
  id: string
  refId: string
  userId: string
  userEmail: string
  passengerName: string
  email: string
  phone?: string | null
  itemTitle: string
  itemType: BookingItemType
  price: string
  promoCode?: string | null
  discount?: string | null
  finalPrice: string
  cabinClass: string
  paymentType: PaymentType
  travelDate?: string | null
  guests?: number | null
  nationality?: string | null
  passportNumber?: string | null
  specialRequests?: string | null
  status: BookingStatus
  createdAt?: { seconds: number; nanoseconds: number }
}

export interface PromoCodeInfo {
  id: string
  code: string
  percentOff: number
  active: boolean
  description: string | null
  usageCount: number
  expiresAt: string | null
  createdAt: string
}

export type DealCategory = "flights" | "hotels" | "packages" | "tours" | "visa" | "tickets"

export interface Deal {
  id: string
  title: string
  subtitle: string
  category: DealCategory
  originalPrice: string
  discountPrice: string
  badge: string
  rating: number
  expires: string
  image: string
  createdAt?: { seconds: number; nanoseconds: number }
}

export interface BookingPayload {
  userId: string
  userEmail: string
  passengerName: string
  email: string
  phone?: string
  itemTitle: string
  itemType: BookingItemType
  price: string
  cabinClass: string
  paymentType: PaymentType
  travelDate?: string
  guests?: number
  nationality?: string
  passportNumber?: string
  specialRequests?: string
  status: "pending"
}

export type CatalogKind =
  | "visa"
  | "ticket"
  | "destination"
  | "tour"
  | "testimonial"
  | "feature"
  | "promo"

export interface CatalogItem {
  id: string
  kind: CatalogKind
  title: string
  subtitle: string
  price: string
  badge: string
  rating: number
  image: string
  deal?: boolean
  originalPrice?: string
  // destination
  location?: string
  country?: string
  description?: string
  reviews?: string
  // tour
  duration?: string
  groupSize?: string
  // testimonial
  name?: string
  role?: string
  verified?: string
  avatar?: string
  text?: string
  // feature (why-choose-us icon)
  icon?: string
  // promo banner
  code?: string
  headline?: string
  cta?: string
  // ordering / visibility
  sortOrder?: number
  published?: boolean
}