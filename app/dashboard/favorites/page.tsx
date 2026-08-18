"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useMyFavorites, removeFavorite } from "@/lib/app-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Trash2, ArrowRight } from "lucide-react"

export default function DashboardFavoritesPage() {
  const { user } = useAuth()
  const { favorites, loading, refresh } = useMyFavorites(user)
  const [busyId, setBusyId] = useState<string | null>(null)

  const remove = async (dealId: string) => {
    if (!user || busyId) return
    setBusyId(dealId)
    try {
      await removeFavorite(user, dealId)
      refresh()
    } catch {
      // leave the list unchanged on failure
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Saved Wishlist Destinations</h1>
        <p className="text-sm text-muted-foreground">Deals you saved with the heart icon, synced from PostgreSQL.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : favorites.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Heart className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No saved destinations yet. Tap the heart on any deal to save it here.</p>
            <Button render={<Link href="/#popular-deals" />} size="sm">Browse deals</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {favorites.map((fav) => (
            <Card key={fav.id} className="rounded-xl">
              <CardContent className="flex items-center gap-4 p-5">
                {fav.dealImage ? (
                  <img
                    src={fav.dealImage}
                    alt={fav.dealTitle}
                    className="size-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Heart className="size-6 text-rose-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{fav.dealTitle}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fav.dealCategory ? `${fav.dealCategory} • ` : ""}From {fav.dealPrice}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button render={<Link href={`/deals/${fav.id}`} />} size="sm" className="h-8 text-xs bg-[#4F46E5]">
                      View Deal <ArrowRight data-icon="inline-end" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Remove ${fav.dealTitle} from wishlist`}
                      disabled={busyId === fav.id}
                      onClick={() => remove(fav.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 /> Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Heart className="size-4 text-rose-500" /> Favorites sync automatically from your account.
      </div>
    </div>
  )
}