"use client"

import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import type { AppNotification, Booking, BookingStatus, UserRole } from "@/lib/types"

export interface AppUser {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: UserRole
  createdAt?: string
}

export interface FavoriteItem {
  id: string
  dealTitle: string
  dealPrice: string
  dealImage?: string
  dealCategory?: string
}

export interface FavoriteDeal {
  id: string
  title: string
  price: string
  category?: string
  image?: string
}

async function api<T>(path: string, user: User | null | undefined, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`
  const res = await fetch(path, { ...init, headers, cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`)
  }
  return data as T
}

function useAppFetch<T>(user: User | null | undefined, path: string | null, refreshKey: number) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      const t = setTimeout(() => {
        setData(null)
        setLoading(false)
        setError(null)
      }, 0)
      return () => clearTimeout(t)
    }
    let active = true
    const t = setTimeout(() => setLoading(true), 0)
    api<T>(path, user)
      .then((d) => {
        if (active) {
          setData(d)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setData(null)
          setError(err instanceof Error ? err.message : "Something went wrong.")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [path, refreshKey, user, user?.uid])

  return { data, loading, error }
}

export function useMyBookings(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading, error } = useAppFetch<Booking[]>(
    user,
    user ? `/api/bookings?userId=${user.uid}` : null,
    refreshKey
  )
  return { bookings: data ?? [], loading, error, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useAllBookings(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(1)
  const { data, loading, error } = useAppFetch<{ items: Booking[]; total: number }>(
    user,
    user ? `/api/bookings?page=${page}&take=25` : null,
    refreshKey
  )
  return {
    bookings: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    setPage,
    loading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  }
}

export function useUsers(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading, error } = useAppFetch<AppUser[]>(user, user ? "/api/users" : null, refreshKey)
  return { users: data ?? [], loading, error, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useMyFavorites(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading, error } = useAppFetch<FavoriteItem[]>(user, user ? "/api/favorites" : null, refreshKey)
  return { favorites: data ?? [], loading, error, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useNotifications(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading, error } = useAppFetch<{ items: AppNotification[]; unreadCount: number }>(
    user,
    user ? "/api/notifications" : null,
    refreshKey
  )
  return {
    notifications: data?.items ?? [],
    unreadCount: data?.unreadCount ?? 0,
    loading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  }
}

export async function markNotificationsRead(user: User, all = true, id?: string) {
  return api<{ ok: true }>("/api/notifications", user, {
    method: "PATCH",
    body: JSON.stringify(all ? { all: true } : { id }),
  })
}

// ---- Mutations ----

export async function createBooking(
  user: User,
  payload: {
    passengerName: string
    email: string
    phone: string
    itemId?: string
    itemTitle: string
    itemType: string
    cabinClass: string
    paymentType: "card" | "invoice"
    travelDate: string
    guests: number
    nationality: string
    passportNumber?: string
    specialRequests?: string
    promoCode?: string
  }
) {
  return api<{ id: string; refId: string; finalPrice: string }>("/api/bookings", user, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function validatePromoCode(user: User, code: string) {
  return api<{ valid: boolean; code?: string; percentOff?: number; error?: string }>(
    "/api/promos",
    user,
    { method: "POST", body: JSON.stringify({ validate: code }) }
  )
}

export async function setBookingStatus(user: User, id: string, status: BookingStatus) {
  return api<{ id: string; status: BookingStatus }>(`/api/bookings/${id}`, user, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export async function deleteBooking(user: User, id: string) {
  return api<{ ok: true }>(`/api/bookings/${id}`, user, { method: "DELETE" })
}

export async function toggleFavorite(user: User, deal: FavoriteDeal) {
  return api<{ added: boolean }>("/api/favorites", user, {
    method: "POST",
    body: JSON.stringify({ deal }),
  })
}

export async function updateUserRole(user: User, uid: string, role: UserRole) {
  return api<{ user: AppUser }>(`/api/users/${uid}`, user, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  })
}

export async function updateMyProfile(user: User, displayName: string) {
  return api<{ user: AppUser }>("/api/users/me", user, {
    method: "PATCH",
    body: JSON.stringify({ displayName }),
  })
}

export async function removeFavorite(user: User, dealId: string) {
  return api<{ ok: true }>(`/api/favorites?dealId=${encodeURIComponent(dealId)}`, user, {
    method: "DELETE",
  })
}

export async function syncUserProfile(user: User) {
  return api<{ user: AppUser }>("/api/users/sync", user, {
    method: "POST",
    body: JSON.stringify({ idToken: await user.getIdToken() }),
  })
}