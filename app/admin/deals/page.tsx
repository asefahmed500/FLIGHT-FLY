"use client"

import { useState } from "react"
import { useDeals, createDeal, updateDeal, deleteDeal } from "@/lib/firestore-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Tag, Pencil, X } from "lucide-react"
import type { Deal, DealCategory } from "@/lib/types"

const CATEGORIES: DealCategory[] = ["flights", "hotels", "packages", "tours", "visa", "tickets"]

const emptyForm = {
  title: "",
  subtitle: "",
  category: "flights" as DealCategory,
  originalPrice: "",
  discountPrice: "",
  badge: "",
  rating: "5.0",
  expires: "",
  image: "",
}

function toForm(deal: Deal): typeof emptyForm {
  return {
    title: deal.title ?? "",
    subtitle: deal.subtitle ?? "",
    category: deal.category ?? "flights",
    originalPrice: deal.originalPrice ?? "",
    discountPrice: deal.discountPrice ?? "",
    badge: deal.badge ?? "",
    rating: deal.rating != null ? String(deal.rating) : "5.0",
    expires: deal.expires ?? "",
    image: deal.image ?? "",
  }
}

export default function AdminDealsPage() {
  const { deals, loading } = useDeals()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const startEdit = (deal: Deal) => {
    setEditingId(deal.id)
    setError("")
    setForm(toForm(deal))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.title.trim() || !form.discountPrice.trim()) {
      setError("Title and discounted price are required.")
      return
    }
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category,
      originalPrice: form.originalPrice.trim() || form.discountPrice.trim(),
      discountPrice: form.discountPrice.trim(),
      badge: form.badge.trim() || "NEW DEAL",
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      expires: form.expires.trim() || "Limited Capacity",
      image: form.image.trim(),
    }
    setSubmitting(true)
    try {
      if (editingId) {
        await updateDeal(editingId, payload)
      } else {
        await createDeal(payload)
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save deal.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Deals Manager</h1>
        <p className="text-sm text-muted-foreground">Promotional deals are publicly readable and admin-writable.</p>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? (
              <>
                <Pencil className="size-4 text-amber-500" /> Edit Deal
              </>
            ) : (
              <>
                <Plus className="size-4 text-[#4F46E5]" /> Create New Deal
              </>
            )}
          </CardTitle>
          <CardDescription>
            {editingId
              ? "Changes publish to Firestore and appear on the landing page instantly."
              : "Published to Firestore; appears instantly on the landing page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</div>}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="deal-title">Title *</FieldLabel>
                <Input id="deal-title" value={form.title} onChange={set("title")} placeholder="Emirates Business Class to Dubai" />
              </Field>
              <Field>
                <FieldLabel htmlFor="deal-subtitle">Subtitle</FieldLabel>
                <Input id="deal-subtitle" value={form.subtitle} onChange={set("subtitle")} placeholder="Non-stop luxury flight with limousine transfer" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="deal-category">Category</FieldLabel>
                  <NativeSelect id="deal-category" value={form.category} onChange={set("category")}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="deal-original">Original Price</FieldLabel>
                  <Input id="deal-original" value={form.originalPrice} onChange={set("originalPrice")} placeholder="$2,400" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="deal-discount">Discount Price *</FieldLabel>
                  <Input id="deal-discount" value={form.discountPrice} onChange={set("discountPrice")} placeholder="$1,650" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="deal-badge">Badge</FieldLabel>
                  <Input id="deal-badge" value={form.badge} onChange={set("badge")} placeholder="SAVE $750" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="deal-rating">Rating (1–5)</FieldLabel>
                  <Input id="deal-rating" type="number" min={1} max={5} step={0.1} value={form.rating} onChange={set("rating")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="deal-expires">Expiry Label</FieldLabel>
                  <Input id="deal-expires" value={form.expires} onChange={set("expires")} placeholder="2 days left" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="deal-image">Image URL</FieldLabel>
                <Input id="deal-image" value={form.image} onChange={set("image")} placeholder="https://…" />
                <FieldDescription>Optional; leave blank to use the section default.</FieldDescription>
              </Field>
            </FieldGroup>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {editingId ? <Pencil className="size-4" data-icon="inline-start" /> : <Plus className="size-4" data-icon="inline-start" />}
                {submitting ? "Saving…" : editingId ? "Save Changes" : "Publish Deal"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  <X className="size-4" data-icon="inline-start" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Live Deals</CardTitle>
          <CardDescription>{loading ? "Syncing…" : `${deals.length} deal(s) live`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Deal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Original</TableHead>
                  <TableHead className="text-right">Deal Price</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="size-4 shrink-0 text-amber-500" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{deal.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{deal.badge}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {deal.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground line-through">{deal.originalPrice}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{deal.discountPrice}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{deal.expires}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Edit ${deal.title}`}
                          onClick={() => startEdit(deal)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Delete ${deal.title}`}
                          onClick={async () => {
                            if (!window.confirm(`Delete "${deal.title}"?`)) return
                            try {
                              await deleteDeal(deal.id)
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Failed to delete deal.")
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {deals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      No deals published yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}