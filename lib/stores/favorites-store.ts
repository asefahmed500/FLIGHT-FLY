"use client"

import { create } from "zustand"
import type { User } from "firebase/auth"
import { toggleFavorite as apiToggleFavorite } from "@/lib/app-data"
import type { FavoriteDeal, FavoriteItem } from "@/lib/app-data"

interface FavoritesState {
  items: FavoriteItem[]
  setItems: (items: FavoriteItem[]) => void
  isSaved: (id: string) => boolean
  toggle: (user: User, deal: FavoriteDeal) => Promise<{ added: boolean }>
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  isSaved: (id) => get().items.some((f) => f.id === id),
  toggle: async (user, deal) => {
    const { items } = get()
    const exists = items.some((f) => f.id === deal.id)
    // Optimistic update; revert on failure.
    set({
      items: exists
        ? items.filter((f) => f.id !== deal.id)
        : [
            ...items,
            {
              id: deal.id,
              dealTitle: deal.title,
              dealPrice: deal.price,
              dealImage: deal.image,
              dealCategory: deal.category,
            },
          ],
    })
    try {
      return await apiToggleFavorite(user, deal)
    } catch (err) {
      set({ items })
      throw err
    }
  },
}))