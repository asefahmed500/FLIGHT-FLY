"use client"

import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore"
import type { DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Booking, BookingPayload, BookingStatus, Deal, DealCategory, UserRole, CatalogItem } from "@/lib/types"

function mapBooking(id: string, data: DocumentData): Booking {
  return { id, ...data } as Booking
}

function mapDeal(id: string, data: DocumentData): Deal {
  return { id, ...data } as Deal
}

function mapCatalog(id: string, data: DocumentData): CatalogItem {
  return { id, ...data } as CatalogItem
}

export interface UserDoc {
  id: string
  email?: string
  displayName?: string
  photoURL?: string
  role?: UserRole
  createdAt?: unknown
}

export interface FavoriteItem {
  id: string
  dealTitle: string
  dealPrice: string
  dealImage?: string
  dealCategory?: string
}

function newRefId(): string {
  return `FL-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function handleError(setLoading: (v: boolean) => void, err: unknown) {
  console.warn("Firestore query failed:", err)
  setLoading(false)
}

// Live query: a user's own bookings.
export function useMyBookings(uid: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      const t = setTimeout(() => setLoading(false), 0)
      return () => clearTimeout(t)
    }
    const q = query(collection(db, "bookings"), where("userId", "==", uid))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setBookings(snap.docs.map((d) => mapBooking(d.id, d.data())))
        setLoading(false)
      },
      (err) => handleError(setLoading, err)
    )
    return unsub
  }, [uid])

  return { bookings, loading }
}

// Live query: all bookings (admin).
export function useAllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "bookings"),
      (snap) => {
        setBookings(snap.docs.map((d) => mapBooking(d.id, d.data())))
        setLoading(false)
      },
      (err) => handleError(setLoading, err)
    )
    return unsub
  }, [])

  return { bookings, loading }
}

// Live query: all user profiles (admin).
export function useUsers() {
  const [users, setUsers] = useState<UserDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserDoc))
        setLoading(false)
      },
      (err) => handleError(setLoading, err)
    )
    return unsub
  }, [])

  return { users, loading }
}

// Live query: deals (public landing page + admin manager).
export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "deals"),
      (snap) => {
        setDeals(snap.docs.map((d) => mapDeal(d.id, d.data())))
        setLoading(false)
      },
      (err) => handleError(setLoading, err)
    )
    return unsub
  }, [])

  return { deals, loading }
}

// Live query: a user's saved wishlist (users/{uid}/favorites subcollection).
export function useMyFavorites(uid: string | undefined) {  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      const t = setTimeout(() => setLoading(false), 0)
      return () => clearTimeout(t)
    }
    const unsub = onSnapshot(
      collection(db, "users", uid, "favorites"),
      (snap) => {
        setFavorites(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FavoriteItem))
        setLoading(false)
      },
      (err) => handleError(setLoading, err)
    )
    return unsub
  }, [uid])

  return { favorites, loading }
}

// Live query: the catalog (visa services + tickets) used by the landing page & Content CRM.
export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "catalog"),
      (snap) => {
        setCatalog(snap.docs.map((d) => mapCatalog(d.id, d.data())))
        setLoading(false)
      },
      (err) => handleError(setLoading, err)
    )
    return unsub
  }, [])

  return { catalog, loading }
}

export async function createCatalogItem(data: Omit<CatalogItem, "id">) {
  await addDoc(collection(db, "catalog"), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateCatalogItem(id: string, patch: Partial<Omit<CatalogItem, "id">>) {
  await updateDoc(doc(db, "catalog", id), patch)
}

export async function deleteCatalogItem(id: string) {
  await deleteDoc(doc(db, "catalog", id))
}

export async function createBooking(payload: BookingPayload) {
  const refId = newRefId()
  const docRef = await addDoc(collection(db, "bookings"), {
    ...payload,
    refId,
    createdAt: serverTimestamp(),
  })
  return { id: docRef.id, refId }
}

export async function setBookingStatus(id: string, status: BookingStatus) {
  await updateDoc(doc(db, "bookings", id), { status })
}

export async function deleteBooking(id: string) {
  await deleteDoc(doc(db, "bookings", id))
}

export async function createDeal(data: {
  title: string
  subtitle: string
  category: DealCategory
  originalPrice: string
  discountPrice: string
  badge: string
  rating: number
  expires: string
  image: string
}) {
  await addDoc(collection(db, "deals"), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function deleteDeal(id: string) {
  await deleteDoc(doc(db, "deals", id))
}

// Save or remove a deal from a user's wishlist (users/{uid}/favorites/{dealId}).
export async function toggleFavorite(uid: string, deal: { id: string; title: string; price: string; category?: string; image?: string }) {
  const favRef = doc(db, "users", uid, "favorites", deal.id)
  const fav = await getDoc(favRef)
  if (fav.exists()) {
    await deleteDoc(favRef)
    return false
  }
  await setDoc(favRef, {
    dealTitle: deal.title,
    dealPrice: deal.price,
    dealImage: deal.image,
    dealCategory: deal.category,
    createdAt: serverTimestamp(),
  })
  return true
}