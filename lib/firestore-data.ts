"use client"

// Firestore live content: the `deals` + `catalog` collections.
// All transactional data (bookings/users/favorites/notifications) lives in
// PostgreSQL via lib/app-data.ts — do NOT add it back here.

import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  doc,
} from "firebase/firestore"
import type { DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Deal, DealCategory, CatalogItem } from "@/lib/types"

function mapDeal(id: string, data: DocumentData): Deal {
  return { id, ...data } as Deal
}

function mapCatalog(id: string, data: DocumentData): CatalogItem {
  return { id, ...data } as CatalogItem
}

function handleError(setLoading: (v: boolean) => void, err: unknown) {
  console.warn("Firestore query failed:", err)
  setLoading(false)
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

// Live query: the catalog (visa, tickets, tours, destinations, promo…) used by
// the landing page + Content CRM.
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

export async function updateDeal(id: string, patch: Partial<{
  title: string
  subtitle: string
  category: DealCategory
  originalPrice: string
  discountPrice: string
  badge: string
  rating: number
  expires: string
  image: string
}>) {
  await updateDoc(doc(db, "deals", id), patch)
}

export async function deleteDeal(id: string) {
  await deleteDoc(doc(db, "deals", id))
}