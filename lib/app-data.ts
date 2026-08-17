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

  useEffect(() => {
    if (!path) {
      const t = setTimeout(() => {
        setData(null)
        setLoading(false)
      }, 0)
      return () => clearTimeout(t)
    }
    let active = true
    const t = setTimeout(() => setLoading(true), 0)
    api<T>(path, user)
      .then((d) => {
        if (active) setData(d)
      })
      .catch(() => {
        if (active) setData(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [path, refreshKey, user, user?.uid])

  return { data, loading }
}

export function useMyBookings(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading } = useAppFetch<Booking[]>(
    user,
    user ? `/api/bookings?userId=${user.uid}` : null,
    refreshKey
  )
  return { bookings: data ?? [], loading, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useAllBookings(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading } = useAppFetch<Booking[]>(user, user ? "/api/bookings" : null, refreshKey)
  return { bookings: data ?? [], loading, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useUsers(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading } = useAppFetch<AppUser[]>(user, user ? "/api/users" : null, refreshKey)
  return { users: data ?? [], loading, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useMyFavorites(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading } = useAppFetch<FavoriteItem[]>(user, user ? "/api/favorites" : null, refreshKey)
  return { favorites: data ?? [], loading, refresh: () => setRefreshKey((k) => k + 1) }
}

export function useNotifications(user: User | null | undefined) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading } = useAppFetch<AppNotification[]>(user, user ? "/api/notifications" : null, refreshKey)
  const notifications = data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length
  return {
    notifications,
    unreadCount,
    loading,
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
    itemTitle: string
    itemType: string
    price: string
    cabinClass: string
    paymentType: "card" | "invoice"
    travelDate: string
    guests: number
    nationality: string
    passportNumber?: string
    specialRequests?: string
  }
) {
  return api<{ id: string; refId: string }>("/api/bookings", user, {
    method: "POST",
    body: JSON.stringify(payload),
  })
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

export async function syncUserProfile(user: User) {
  return api<{ user: AppUser }>("/api/users/sync", user, {
    method: "POST",
    body: JSON.stringify({ idToken: await user.getIdToken() }),
  })
}